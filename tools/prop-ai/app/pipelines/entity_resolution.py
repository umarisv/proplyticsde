"""Entity resolution for properties."""

from typing import Optional

from app.core.db import (
    execute_query,
    execute_insert_with_returning,
    get_raw_connection,
    table,
)
from app.core.logging import get_logger
from app.models.property import PropertyCreate, PropertyLookup
from app.pipelines.normalize_address import (
    normalize_address,
    parse_address_components,
)

logger = get_logger(__name__)


def find_or_create_property(address_raw: str) -> Optional[PropertyLookup]:
    """
    Find existing property by address or create a new one.
    
    Returns PropertyLookup with property_id and is_new flag.
    """
    if not address_raw or len(address_raw) < 5:
        logger.warning("Invalid address provided", address_raw=address_raw)
        return None
    
    # Normalize address
    address_normalized = normalize_address(address_raw)
    
    if not address_normalized:
        logger.warning("Address normalization failed", address_raw=address_raw)
        return None
    
    # Try to find existing property
    existing = execute_query(
        f"""
        SELECT property_id, address_normalized
        FROM {table('property')}
        WHERE address_normalized = %s
        LIMIT 1
        """,
        (address_normalized,),
    )
    
    if existing:
        logger.debug(
            "Found existing property",
            property_id=existing[0]["property_id"],
            address=address_normalized
        )
        return PropertyLookup(
            property_id=existing[0]["property_id"],
            address_normalized=existing[0]["address_normalized"],
            is_new=False
        )
    
    # Parse address components
    components = parse_address_components(address_normalized)
    
    # Create new property
    property_id = execute_insert_with_returning(
        f"""
        INSERT INTO {table('property')} (
            address_raw, address_normalized,
            street, house_number, postal_code, city
        ) VALUES (%s, %s, %s, %s, %s, %s)
        """,
        (
            address_raw,
            address_normalized,
            components.get("street"),
            components.get("house_number"),
            components.get("postal_code"),
            components.get("city"),
        ),
        returning="property_id",
    )
    
    if property_id:
        logger.info(
            "Created new property",
            property_id=property_id,
            address=address_normalized
        )
        return PropertyLookup(
            property_id=property_id,
            address_normalized=address_normalized,
            is_new=True
        )
    
    logger.error("Failed to create property", address=address_normalized)
    return None


def update_property_coordinates(
    property_id: int, 
    lat: float, 
    lon: float
) -> bool:
    """Update property with geocoded coordinates."""
    try:
        with get_raw_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    f"""
                    UPDATE {table('property')}
                    SET lat = %s, lon = %s
                    WHERE property_id = %s
                    """,
                    (lat, lon, property_id),
                )
            conn.commit()
        
        logger.debug(
            "Updated property coordinates",
            property_id=property_id,
            lat=lat,
            lon=lon
        )
        return True
        
    except Exception as e:
        logger.error(
            "Failed to update property coordinates",
            property_id=property_id,
            error=str(e)
        )
        return False


def get_property_by_id(property_id: int) -> Optional[dict]:
    """Get property by ID."""
    result = execute_query(
        f"""
        SELECT * FROM {table('property')} WHERE property_id = %s
        """,
        (property_id,),
    )
    return result[0] if result else None


def find_properties_without_coordinates(limit: int = 100) -> list[dict]:
    """Find properties that need geocoding."""
    return execute_query(
        f"""
        SELECT property_id, address_raw, address_normalized, postal_code, city
        FROM {table('property')}
        WHERE lat IS NULL OR lon IS NULL
        LIMIT %s
        """,
        (limit,),
    )


def merge_duplicate_properties(keep_id: int, remove_id: int) -> bool:
    """
    Merge duplicate property records.
    
    Moves all snapshots from remove_id to keep_id and deletes remove_id.
    """
    try:
        with get_raw_connection() as conn:
            with conn.cursor() as cur:
                # Update snapshots to point to keep_id
                cur.execute(
                    f"""
                    UPDATE {table('property_snapshot')}
                    SET property_id = %s
                    WHERE property_id = %s
                    """,
                    (keep_id, remove_id),
                )
                
                # Delete the duplicate property
                cur.execute(
                    f"DELETE FROM {table('property')} WHERE property_id = %s",
                    (remove_id,),
                )
            
            conn.commit()
        
        logger.info(
            "Merged duplicate properties",
            keep_id=keep_id,
            remove_id=remove_id
        )
        return True
        
    except Exception as e:
        logger.error(
            "Failed to merge properties",
            keep_id=keep_id,
            remove_id=remove_id,
            error=str(e)
        )
        return False
