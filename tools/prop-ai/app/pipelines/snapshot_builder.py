"""Snapshot builder pipeline - creates property snapshots from scraped data."""

from datetime import date
from typing import Optional

from app.core.db import (
    execute_insert_with_returning,
    execute_query,
    get_raw_connection,
    table,
)
from app.core.logging import get_logger
from app.models.snapshots import ScrapedListing, PropertySnapshotCreate, SourceEventCreate
from app.pipelines.entity_resolution import find_or_create_property

logger = get_logger(__name__)


def create_source_event(
    source_type: str,
    source_name: str,
    source_url: Optional[str] = None,
    meta: dict = None
) -> int:
    """Create a new source event and return its ID."""
    return execute_insert_with_returning(
        f"""
        INSERT INTO {table('source_event')} (source_type, source_name, source_url, meta)
        VALUES (%s, %s, %s, %s::jsonb)
        """,
        (
            source_type,
            source_name,
            source_url,
            str(meta or {}).replace("'", '"'),
        ),
        returning="source_event_id",
    )


def create_snapshot_from_listing(
    listing: ScrapedListing,
    source_event_id: int
) -> Optional[int]:
    """
    Create a property snapshot from a scraped listing.
    
    Returns the snapshot_id or None if failed.
    
    Note: This NEVER updates existing snapshots - each scrape creates
    a new snapshot for historical tracking.
    """
    # Try to resolve property
    property_lookup = None
    if listing.address_raw:
        property_lookup = find_or_create_property(listing.address_raw)
    
    property_id = property_lookup.property_id if property_lookup else None
    
    # Calculate confidence and data quality
    confidence = listing.calculate_confidence()
    data_quality = listing.determine_data_quality()
    
    # Calculate price per sqm if both values available
    price_per_sqm = None
    if listing.asking_price_eur and listing.living_area_m2:
        price_per_sqm = listing.asking_price_eur / listing.living_area_m2
    
    try:
        snapshot_id = execute_insert_with_returning(
            f"""
            INSERT INTO {table('property_snapshot')} (
                property_id, source_event_id, snapshot_date,
                property_type, living_area_m2, rooms,
                year_built, has_balcony, has_terrace, has_garden,
                has_elevator, has_parking, marketing_status,
                asking_price_eur, price_per_sqm,
                confidence_score, data_quality, raw_text
            ) VALUES (
                %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
            )
            """,
            (
                property_id,
                source_event_id,
                date.today(),
                listing.property_type,
                listing.living_area_m2,
                listing.rooms,
                listing.year_built,
                listing.has_balcony,
                listing.has_terrace,
                listing.has_garden,
                listing.has_elevator,
                listing.has_parking,
                "active",  # Default marketing status
                listing.asking_price_eur,
                price_per_sqm,
                confidence,
                data_quality,
                (listing.description or listing.title or "")[:5000],
            ),
            returning="snapshot_id",
        )
        
        logger.debug(
            "Created snapshot",
            snapshot_id=snapshot_id,
            property_id=property_id,
            confidence=confidence,
            data_quality=data_quality
        )
        
        return snapshot_id
        
    except Exception as e:
        logger.error(
            "Failed to create snapshot",
            url=listing.url,
            error=str(e)
        )
        return None


def build_snapshots_from_listings(
    listings: list[ScrapedListing],
    source_type: str = "broker",
    source_name: str = "unknown"
) -> dict:
    """
    Build snapshots from a list of scraped listings.
    
    Returns statistics dict with counts.
    """
    stats = {
        "total": len(listings),
        "created": 0,
        "failed": 0,
        "incomplete": 0,
    }
    
    if not listings:
        return stats
    
    # Create source event for this batch
    source_event_id = create_source_event(
        source_type=source_type,
        source_name=source_name,
        meta={
            "listing_count": len(listings),
            "date": str(date.today()),
        }
    )
    
    logger.info(
        "Building snapshots from listings",
        source_event_id=source_event_id,
        listing_count=len(listings)
    )
    
    for listing in listings:
        if not listing.is_complete:
            stats["incomplete"] += 1
            # Still create snapshot for incomplete listings
        
        snapshot_id = create_snapshot_from_listing(listing, source_event_id)
        
        if snapshot_id:
            stats["created"] += 1
        else:
            stats["failed"] += 1
    
    logger.info(
        "Snapshot building completed",
        source_event_id=source_event_id,
        **stats
    )
    
    return stats


def get_latest_snapshot_for_property(property_id: int) -> Optional[dict]:
    """Get the most recent snapshot for a property."""
    result = execute_query(
        f"""
        SELECT * FROM {table('property_snapshot')}
        WHERE property_id = %s
        ORDER BY snapshot_date DESC, created_at DESC
        LIMIT 1
        """,
        (property_id,),
    )
    return result[0] if result else None


def get_snapshots_needing_features(limit: int = 100) -> list[dict]:
    """Get snapshots that don't have features yet."""
    return execute_query(
        f"""
        SELECT ps.*, p.lat, p.lon, p.postal_code, p.city
        FROM {table('property_snapshot')} ps
        JOIN {table('property')} p ON ps.property_id = p.property_id
        LEFT JOIN {table('snapshot_features')} sf ON ps.snapshot_id = sf.snapshot_id
        WHERE sf.feature_id IS NULL
          AND p.lat IS NOT NULL
          AND p.lon IS NOT NULL
        LIMIT %s
        """,
        (limit,),
    )


def get_price_history(property_id: int, limit: int = 50) -> list[dict]:
    """Get price history for a property."""
    return execute_query(
        f"""
        SELECT snapshot_date, asking_price_eur, price_per_sqm,
               confidence_score, data_quality
        FROM {table('property_snapshot')}
        WHERE property_id = %s
          AND asking_price_eur IS NOT NULL
        ORDER BY snapshot_date DESC
        LIMIT %s
        """,
        (property_id, limit),
    )
