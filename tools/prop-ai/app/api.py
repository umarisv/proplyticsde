"""
FastAPI application for PropAI.

Provides REST endpoints for querying properties and snapshots.
"""

from datetime import date
from typing import Optional

from fastapi import Body, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.core.config import get_settings
from app.core.db import execute_query, table
from app.core.logging import get_logger
from app.pipelines.broker_scraper import BrokerScraper
from app.pipelines.snapshot_builder import build_snapshots_from_listings

logger = get_logger(__name__)
settings = get_settings()

app = FastAPI(
    title="PropAI API",
    description="Property analysis API",
    version="0.1.0",
)

cors_origins = [
    origin.strip()
    for origin in (settings.cors_origins or "").split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Response models
class PropertyResponse(BaseModel):
    property_id: int
    address_raw: str
    address_normalized: Optional[str]
    street: Optional[str]
    house_number: Optional[str]
    postal_code: Optional[str]
    city: Optional[str]
    lat: Optional[float]
    lon: Optional[float]


class SnapshotResponse(BaseModel):
    snapshot_id: int
    property_id: Optional[int]
    snapshot_date: date
    property_type: Optional[str]
    living_area_m2: Optional[float]
    rooms: Optional[float]
    year_built: Optional[int]
    asking_price_eur: Optional[float]
    price_per_sqm: Optional[float]
    confidence_score: int
    data_quality: str


class FeatureResponse(BaseModel):
    snapshot_id: int
    distance_to_center_km: Optional[float]
    transit_score: Optional[int]
    noise_proxy_score: Optional[int]
    poi_counts: Optional[dict]


class HealthResponse(BaseModel):
    status: str
    database: bool


class ScrapeRequest(BaseModel):
    seed_urls: list[str]
    max_pages: int = 50
    source_name: Optional[str] = None


# Endpoints
@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Check API and database health."""
    db_ok = False
    try:
        execute_query("SELECT 1")
        db_ok = True
    except Exception:
        pass
    
    return HealthResponse(
        status="ok" if db_ok else "degraded",
        database=db_ok,
    )


@app.get("/properties", response_model=list[PropertyResponse])
async def list_properties(
    city: Optional[str] = Query(None, description="Filter by city"),
    postal_code: Optional[str] = Query(None, description="Filter by postal code"),
    limit: int = Query(50, ge=1, le=500),
    offset: int = Query(0, ge=0),
):
    """List properties with optional filters."""
    conditions = []
    params = []
    
    if city:
        conditions.append("LOWER(city) = LOWER(%s)")
        params.append(city)
    
    if postal_code:
        conditions.append("postal_code = %s")
        params.append(postal_code)
    
    where_clause = "WHERE " + " AND ".join(conditions) if conditions else ""
    
    query = f"""
        SELECT property_id, address_raw, address_normalized, 
               street, house_number, postal_code, city, lat, lon
        FROM {table('property')}
        {where_clause}
        ORDER BY created_at DESC
        LIMIT %s OFFSET %s
    """
    
    params.extend([limit, offset])
    
    results = execute_query(query, tuple(params))
    return [PropertyResponse(**row) for row in results]


@app.get("/properties/{property_id}", response_model=PropertyResponse)
async def get_property(property_id: int):
    """Get a single property by ID."""
    results = execute_query(
        f"""
        SELECT property_id, address_raw, address_normalized,
               street, house_number, postal_code, city, lat, lon
        FROM {table('property')}
        WHERE property_id = %s
        """,
        (property_id,)
    )
    
    if not results:
        raise HTTPException(status_code=404, detail="Property not found")
    
    return PropertyResponse(**results[0])


@app.get("/properties/{property_id}/snapshots", response_model=list[SnapshotResponse])
async def get_property_snapshots(
    property_id: int,
    limit: int = Query(50, ge=1, le=500),
):
    """Get snapshots for a property."""
    results = execute_query(
        f"""
        SELECT snapshot_id, property_id, snapshot_date, property_type,
               living_area_m2, rooms, year_built, asking_price_eur,
               price_per_sqm, confidence_score, data_quality
        FROM {table('property_snapshot')}
        WHERE property_id = %s
        ORDER BY snapshot_date DESC
        LIMIT %s
        """,
        (property_id, limit)
    )
    
    return [SnapshotResponse(**row) for row in results]


@app.get("/snapshots/{snapshot_id}", response_model=SnapshotResponse)
async def get_snapshot(snapshot_id: int):
    """Get a single snapshot by ID."""
    results = execute_query(
        f"""
        SELECT snapshot_id, property_id, snapshot_date, property_type,
               living_area_m2, rooms, year_built, asking_price_eur,
               price_per_sqm, confidence_score, data_quality
        FROM {table('property_snapshot')}
        WHERE snapshot_id = %s
        """,
        (snapshot_id,)
    )
    
    if not results:
        raise HTTPException(status_code=404, detail="Snapshot not found")
    
    return SnapshotResponse(**results[0])


@app.get("/snapshots/{snapshot_id}/features", response_model=FeatureResponse)
async def get_snapshot_features(snapshot_id: int):
    """Get features for a snapshot."""
    results = execute_query(
        f"""
        SELECT snapshot_id, distance_to_center_km, transit_score,
               noise_proxy_score, poi_counts_json as poi_counts
        FROM {table('snapshot_features')}
        WHERE snapshot_id = %s
        """,
        (snapshot_id,)
    )
    
    if not results:
        raise HTTPException(status_code=404, detail="Features not found")
    
    return FeatureResponse(**results[0])


@app.get("/stats")
async def get_stats():
    """Get overall statistics."""
    property_count = execute_query(
        f"SELECT COUNT(*) as count FROM {table('property')}"
    )[0]["count"]
    snapshot_count = execute_query(
        f"SELECT COUNT(*) as count FROM {table('property_snapshot')}"
    )[0]["count"]
    feature_count = execute_query(
        f"SELECT COUNT(*) as count FROM {table('snapshot_features')}"
    )[0]["count"]
    
    avg_price = execute_query(
        f"""
        SELECT AVG(asking_price_eur) as avg_price
        FROM {table('property_snapshot')}
        WHERE asking_price_eur IS NOT NULL
        """
    )[0]["avg_price"]
    
    return {
        "total_properties": property_count,
        "total_snapshots": snapshot_count,
        "snapshots_with_features": feature_count,
        "average_price_eur": round(avg_price, 2) if avg_price else None,
    }


@app.get("/snapshots", response_model=list[SnapshotResponse])
async def list_snapshots(
    property_id: Optional[int] = Query(None, description="Filter by property_id"),
    limit: int = Query(50, ge=1, le=500),
    offset: int = Query(0, ge=0),
):
    """List snapshots with optional property filter."""
    conditions = []
    params = []

    if property_id:
        conditions.append("property_id = %s")
        params.append(property_id)

    where_clause = "WHERE " + " AND ".join(conditions) if conditions else ""
    query = f"""
        SELECT snapshot_id, property_id, snapshot_date, property_type,
               living_area_m2, rooms, year_built, asking_price_eur,
               price_per_sqm, confidence_score, data_quality
        FROM {table('property_snapshot')}
        {where_clause}
        ORDER BY snapshot_date DESC
        LIMIT %s OFFSET %s
    """

    params.extend([limit, offset])
    results = execute_query(query, tuple(params))
    return [SnapshotResponse(**row) for row in results]


@app.get("/features", response_model=FeatureResponse)
async def get_features(snapshot_id: int = Query(..., description="Snapshot ID")):
    """Get features for a snapshot via query parameter."""
    return await get_snapshot_features(snapshot_id)


@app.post("/scrape")
async def scrape_brokers(payload: ScrapeRequest = Body(...)):
    """Trigger a broker scrape job and persist snapshots."""
    if not payload.seed_urls:
        raise HTTPException(status_code=400, detail="seed_urls is required")

    scraper = BrokerScraper()
    await scraper.start()
    all_listings = []

    try:
        for url in payload.seed_urls:
            listings = await scraper.scrape_broker_site(
                url,
                max_pages=payload.max_pages,
            )
            all_listings.extend(listings)
    finally:
        await scraper.stop()

    stats = build_snapshots_from_listings(
        all_listings,
        source_type="broker",
        source_name=payload.source_name or "api",
    )

    return {
        "scraped_listings": len(all_listings),
        **stats,
    }
