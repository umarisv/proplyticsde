"""Database connection and session management."""

from contextlib import contextmanager
from typing import Generator, Optional

import psycopg2
from psycopg2.extras import RealDictCursor
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker, declarative_base

from .config import get_settings
from .logging import get_logger

logger = get_logger(__name__)

# SQLAlchemy setup
Base = declarative_base()

_engine = None
_SessionLocal = None


def table(name: str) -> str:
    """Return prefixed table name for PropAI tables."""
    settings = get_settings()
    prefix = settings.table_prefix or ""
    return f"{prefix}{name}"


def get_engine():
    """Get or create SQLAlchemy engine."""
    global _engine
    if _engine is None:
        settings = get_settings()
        _engine = create_engine(
            settings.database_url,
            pool_pre_ping=True,
            pool_size=5,
            max_overflow=10,
        )
    return _engine


def get_session_factory():
    """Get or create session factory."""
    global _SessionLocal
    if _SessionLocal is None:
        _SessionLocal = sessionmaker(
            autocommit=False,
            autoflush=False,
            bind=get_engine(),
        )
    return _SessionLocal


@contextmanager
def get_session() -> Generator[Session, None, None]:
    """Get a database session with automatic cleanup."""
    SessionLocal = get_session_factory()
    session = SessionLocal()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


@contextmanager
def get_raw_connection():
    """Get a raw psycopg2 connection for bulk operations."""
    settings = get_settings()
    conn = psycopg2.connect(settings.database_url)
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def execute_query(query: str, params: tuple = None) -> list[dict]:
    """Execute a query and return results as list of dicts."""
    settings = get_settings()
    with psycopg2.connect(settings.database_url, cursor_factory=RealDictCursor) as conn:
        with conn.cursor() as cur:
            cur.execute(query, params)
            if cur.description:
                return [dict(row) for row in cur.fetchall()]
            return []


def execute_insert(query: str, params: tuple = None) -> int:
    """Execute an insert and return the inserted ID."""
    return execute_insert_with_returning(query, params=params)


def execute_insert_with_returning(
    query: str,
    params: tuple = None,
    returning: str = "id",
) -> Optional[int]:
    """Execute an insert and return the specified column."""
    settings = get_settings()
    with psycopg2.connect(settings.database_url) as conn:
        with conn.cursor() as cur:
            if "RETURNING" not in query.upper():
                query = f"{query} RETURNING {returning}"
            cur.execute(query, params)
            result = cur.fetchone()
            conn.commit()
            return result[0] if result else None


def init_db():
    """Initialize database tables."""
    logger.info("Initializing database tables")

    prefix = get_settings().table_prefix or ""
    prefix_slug = prefix.rstrip("_")
    tbl_property = table("property")
    tbl_source_event = table("source_event")
    tbl_property_snapshot = table("property_snapshot")
    tbl_snapshot_features = table("snapshot_features")
    tbl_model_output = table("model_output")

    ddl = f"""
    -- Properties table
    CREATE TABLE IF NOT EXISTS {tbl_property} (
        property_id SERIAL PRIMARY KEY,
        address_raw TEXT NOT NULL,
        address_normalized TEXT,
        street TEXT,
        house_number TEXT,
        postal_code TEXT,
        city TEXT,
        lat DOUBLE PRECISION,
        lon DOUBLE PRECISION,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(address_normalized)
    );
    
    CREATE INDEX IF NOT EXISTS idx_{prefix_slug}_property_address_normalized 
        ON {tbl_property}(address_normalized);
    CREATE INDEX IF NOT EXISTS idx_{prefix_slug}_property_postal_code 
        ON {tbl_property}(postal_code);
    
    -- Source events table
    CREATE TABLE IF NOT EXISTS {tbl_source_event} (
        source_event_id SERIAL PRIMARY KEY,
        source_type TEXT NOT NULL,
        source_name TEXT NOT NULL,
        source_url TEXT,
        occurred_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        meta JSONB DEFAULT '{{}}'::jsonb
    );
    
    CREATE INDEX IF NOT EXISTS idx_{prefix_slug}_source_event_type 
        ON {tbl_source_event}(source_type);
    CREATE INDEX IF NOT EXISTS idx_{prefix_slug}_source_event_occurred 
        ON {tbl_source_event}(occurred_at);
    
    -- Property snapshots table
    CREATE TABLE IF NOT EXISTS {tbl_property_snapshot} (
        snapshot_id SERIAL PRIMARY KEY,
        property_id INTEGER REFERENCES {tbl_property}(property_id),
        source_event_id INTEGER REFERENCES {tbl_source_event}(source_event_id),
        snapshot_date DATE NOT NULL,
        property_type TEXT,
        living_area_m2 DOUBLE PRECISION,
        living_area_range TEXT,
        rooms DOUBLE PRECISION,
        year_built INTEGER,
        year_built_range TEXT,
        condition_score INTEGER,
        modernization_range TEXT,
        has_balcony BOOLEAN,
        has_terrace BOOLEAN,
        has_garden BOOLEAN,
        has_elevator BOOLEAN,
        has_parking BOOLEAN,
        marketing_status TEXT,
        asking_price_eur DOUBLE PRECISION,
        price_per_sqm DOUBLE PRECISION,
        confidence_score INTEGER DEFAULT 0,
        data_quality TEXT DEFAULT 'unknown',
        raw_text TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    CREATE INDEX IF NOT EXISTS idx_{prefix_slug}_snapshot_property 
        ON {tbl_property_snapshot}(property_id);
    CREATE INDEX IF NOT EXISTS idx_{prefix_slug}_snapshot_date 
        ON {tbl_property_snapshot}(snapshot_date);
    CREATE INDEX IF NOT EXISTS idx_{prefix_slug}_snapshot_source 
        ON {tbl_property_snapshot}(source_event_id);
    
    -- Snapshot features table (enriched data)
    CREATE TABLE IF NOT EXISTS {tbl_snapshot_features} (
        feature_id SERIAL PRIMARY KEY,
        snapshot_id INTEGER REFERENCES {tbl_property_snapshot}(snapshot_id),
        microzone_id TEXT,
        distance_to_center_km DOUBLE PRECISION,
        transit_score INTEGER,
        poi_counts_json JSONB DEFAULT '{{}}'::jsonb,
        noise_proxy_score INTEGER,
        flood_risk_flag BOOLEAN,
        green_space_score INTEGER,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(snapshot_id)
    );
    
    CREATE INDEX IF NOT EXISTS idx_{prefix_slug}_features_snapshot 
        ON {tbl_snapshot_features}(snapshot_id);
    
    -- Model outputs table
    CREATE TABLE IF NOT EXISTS {tbl_model_output} (
        model_output_id SERIAL PRIMARY KEY,
        snapshot_id INTEGER REFERENCES {tbl_property_snapshot}(snapshot_id),
        model_version TEXT NOT NULL,
        predicted_market_value_eur DOUBLE PRECISION,
        predicted_rent_eur_m2 DOUBLE PRECISION,
        deal_score INTEGER,
        risk_score INTEGER,
        explanation_json JSONB DEFAULT '{{}}'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    CREATE INDEX IF NOT EXISTS idx_{prefix_slug}_output_snapshot 
        ON {tbl_model_output}(snapshot_id);
    CREATE INDEX IF NOT EXISTS idx_{prefix_slug}_output_model_version 
        ON {tbl_model_output}(model_version);
    """
    
    with get_raw_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(ddl)
        conn.commit()
    
    logger.info("Database tables initialized successfully")
