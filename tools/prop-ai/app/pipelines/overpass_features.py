"""Overpass API integration for fetching POI and geographic features."""

import asyncio
from math import radians, sin, cos, sqrt, atan2
from typing import Optional

import httpx

from app.core.config import get_settings
from app.core.db import execute_insert_with_returning, table
from app.core.logging import get_logger
from app.models.market import POICounts, OverpassResult, SnapshotFeaturesCreate

logger = get_logger(__name__)


def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate distance between two points in kilometers."""
    R = 6371  # Earth's radius in km
    
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * atan2(sqrt(a), sqrt(1-a))
    
    return R * c


async def query_overpass(query: str) -> Optional[dict]:
    """Execute an Overpass API query."""
    settings = get_settings()
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                settings.overpass_api_url,
                data={"data": query},
                timeout=settings.overpass_timeout_seconds,
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error("Overpass query failed", error=str(e))
            return None


async def fetch_pois_around(
    lat: float, 
    lon: float, 
    radius_m: int = 500
) -> POICounts:
    """
    Fetch POI counts around a location using Overpass API.
    
    Categories:
    - public_transport: bus stops, tram stops, subway stations
    - schools: schools
    - kindergartens: kindergartens
    - supermarkets: supermarkets
    - restaurants: restaurants, cafes
    - parks: parks
    - doctors: doctors, clinics
    - pharmacies: pharmacies
    - banks: banks, ATMs
    """
    query = f"""
    [out:json][timeout:30];
    (
      // Public transport
      node["highway"="bus_stop"](around:{radius_m},{lat},{lon});
      node["railway"="tram_stop"](around:{radius_m},{lat},{lon});
      node["railway"="station"](around:{radius_m},{lat},{lon});
      node["railway"="subway_entrance"](around:{radius_m},{lat},{lon});
      
      // Education
      way["amenity"="school"](around:{radius_m},{lat},{lon});
      node["amenity"="school"](around:{radius_m},{lat},{lon});
      way["amenity"="kindergarten"](around:{radius_m},{lat},{lon});
      node["amenity"="kindergarten"](around:{radius_m},{lat},{lon});
      
      // Shopping
      node["shop"="supermarket"](around:{radius_m},{lat},{lon});
      way["shop"="supermarket"](around:{radius_m},{lat},{lon});
      
      // Food
      node["amenity"="restaurant"](around:{radius_m},{lat},{lon});
      node["amenity"="cafe"](around:{radius_m},{lat},{lon});
      
      // Green spaces
      way["leisure"="park"](around:{radius_m},{lat},{lon});
      
      // Health
      node["amenity"="doctors"](around:{radius_m},{lat},{lon});
      node["amenity"="clinic"](around:{radius_m},{lat},{lon});
      node["amenity"="pharmacy"](around:{radius_m},{lat},{lon});
      
      // Financial
      node["amenity"="bank"](around:{radius_m},{lat},{lon});
      node["amenity"="atm"](around:{radius_m},{lat},{lon});
    );
    out count;
    """
    
    result = await query_overpass(query)
    
    counts = POICounts()
    
    if result and "elements" in result:
        elements = result["elements"]
        
        for elem in elements:
            tags = elem.get("tags", {})
            
            # Categorize by tags
            if tags.get("highway") == "bus_stop" or tags.get("railway") in ["tram_stop", "station", "subway_entrance"]:
                counts.public_transport += 1
            elif tags.get("amenity") == "school":
                counts.schools += 1
            elif tags.get("amenity") == "kindergarten":
                counts.kindergartens += 1
            elif tags.get("shop") == "supermarket":
                counts.supermarkets += 1
            elif tags.get("amenity") in ["restaurant", "cafe"]:
                counts.restaurants += 1
            elif tags.get("leisure") == "park":
                counts.parks += 1
            elif tags.get("amenity") in ["doctors", "clinic"]:
                counts.doctors += 1
            elif tags.get("amenity") == "pharmacy":
                counts.pharmacies += 1
            elif tags.get("amenity") in ["bank", "atm"]:
                counts.banks += 1
    
    return counts


async def fetch_nearby_highways(
    lat: float, 
    lon: float, 
    radius_m: int = 200
) -> list[str]:
    """
    Fetch highway types near a location for noise estimation.
    
    Returns list of highway types: primary, secondary, trunk, motorway, etc.
    """
    query = f"""
    [out:json][timeout:15];
    way["highway"~"^(motorway|trunk|primary|secondary|tertiary)$"](around:{radius_m},{lat},{lon});
    out tags;
    """
    
    result = await query_overpass(query)
    highways = []
    
    if result and "elements" in result:
        for elem in result["elements"]:
            highway_type = elem.get("tags", {}).get("highway")
            if highway_type:
                highways.append(highway_type)
    
    return highways


def calculate_transit_score(poi_counts: POICounts) -> int:
    """
    Calculate transit score (0-100) based on public transport access.
    
    Scoring:
    - 0-2 stops: 20
    - 3-5 stops: 40
    - 6-10 stops: 60
    - 11-20 stops: 80
    - 20+ stops: 100
    """
    stops = poi_counts.public_transport
    
    if stops >= 20:
        return 100
    elif stops >= 11:
        return 80
    elif stops >= 6:
        return 60
    elif stops >= 3:
        return 40
    else:
        return 20


def calculate_noise_score(highways: list[str]) -> int:
    """
    Calculate noise proxy score (0-100) based on nearby highways.
    
    Higher score = more noise
    """
    noise_weights = {
        "motorway": 40,
        "trunk": 30,
        "primary": 20,
        "secondary": 10,
        "tertiary": 5,
    }
    
    total_noise = sum(noise_weights.get(hw, 0) for hw in highways)
    return min(100, total_noise)


async def fetch_features_for_location(
    lat: float,
    lon: float,
    center_lat: Optional[float] = None,
    center_lon: Optional[float] = None,
) -> OverpassResult:
    """
    Fetch all features for a location.
    
    Returns OverpassResult with all calculated features.
    """
    settings = get_settings()
    
    # Use default center if not provided
    if center_lat is None:
        center_lat = settings.default_center_lat
    if center_lon is None:
        center_lon = settings.default_center_lon
    
    # Fetch POIs (500m radius)
    poi_counts = await fetch_pois_around(lat, lon, radius_m=500)
    
    # Fetch nearby highways (200m radius)
    highways = await fetch_nearby_highways(lat, lon, radius_m=200)
    
    # Calculate scores
    transit_score = calculate_transit_score(poi_counts)
    noise_score = calculate_noise_score(highways)
    distance_to_center = haversine_distance(lat, lon, center_lat, center_lon)
    
    return OverpassResult(
        lat=lat,
        lon=lon,
        poi_counts=poi_counts,
        transit_score=transit_score,
        noise_proxy_score=noise_score,
        distance_to_center_km=round(distance_to_center, 2),
        nearby_highways=highways,
    )


def save_snapshot_features(
    snapshot_id: int,
    features: OverpassResult
) -> Optional[int]:
    """Save features to database."""
    import json
    
    try:
        feature_id = execute_insert_with_returning(
            f"""
            INSERT INTO {table('snapshot_features')} (
                snapshot_id, distance_to_center_km, transit_score,
                poi_counts_json, noise_proxy_score
            ) VALUES (%s, %s, %s, %s::jsonb, %s)
            ON CONFLICT (snapshot_id) DO UPDATE SET
                distance_to_center_km = EXCLUDED.distance_to_center_km,
                transit_score = EXCLUDED.transit_score,
                poi_counts_json = EXCLUDED.poi_counts_json,
                noise_proxy_score = EXCLUDED.noise_proxy_score
            """,
            (
                snapshot_id,
                features.distance_to_center_km,
                features.transit_score,
                json.dumps(features.poi_counts.to_dict()),
                features.noise_proxy_score,
            ),
            returning="feature_id",
        )
        
        logger.debug("Saved snapshot features", snapshot_id=snapshot_id, feature_id=feature_id)
        return feature_id
        
    except Exception as e:
        logger.error("Failed to save features", snapshot_id=snapshot_id, error=str(e))
        return None


async def enrich_snapshots_with_features(limit: int = 50):
    """
    Enrich snapshots that don't have features yet.
    
    Fetches location data from Overpass API.
    """
    from app.pipelines.snapshot_builder import get_snapshots_needing_features
    
    snapshots = get_snapshots_needing_features(limit=limit)
    
    if not snapshots:
        logger.info("No snapshots need feature enrichment")
        return
    
    logger.info("Enriching snapshots with features", count=len(snapshots))
    
    enriched = 0
    failed = 0
    
    for snapshot in snapshots:
        lat = snapshot.get("lat")
        lon = snapshot.get("lon")
        
        if not lat or not lon:
            logger.warning(
                "Snapshot missing coordinates",
                snapshot_id=snapshot["snapshot_id"]
            )
            failed += 1
            continue
        
        try:
            features = await fetch_features_for_location(lat, lon)
            save_snapshot_features(snapshot["snapshot_id"], features)
            enriched += 1
            
            # Rate limit Overpass API
            await asyncio.sleep(1)
            
        except Exception as e:
            logger.error(
                "Failed to enrich snapshot",
                snapshot_id=snapshot["snapshot_id"],
                error=str(e)
            )
            failed += 1
    
    logger.info(
        "Feature enrichment completed",
        enriched=enriched,
        failed=failed
    )
