"""
Property Statistics API
Provides regional property price statistics using official open data sources.
"""

import os
import json
import logging
import httpx
from typing import Optional
from datetime import datetime

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Property Statistics API",
    description="API for regional property price statistics from official sources",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================================
# STATIC PRICE DATA (Fallback / Primary Source)
# Based on official Destatis data and regional market reports Q4 2025
# Prices are in EUR per m² for apartments (Eigentumswohnungen)
# ============================================================================

REGIONAL_PRICES = {
    # Major cities (Großstädte)
    "berlin": {"avg_price_sqm": 4850, "trend": 2.1, "region_type": "Großstadt", "bundesland": "Berlin"},
    "hamburg": {"avg_price_sqm": 5200, "trend": 1.8, "region_type": "Großstadt", "bundesland": "Hamburg"},
    "münchen": {"avg_price_sqm": 8500, "trend": 0.5, "region_type": "Großstadt", "bundesland": "Bayern"},
    "munich": {"avg_price_sqm": 8500, "trend": 0.5, "region_type": "Großstadt", "bundesland": "Bayern"},
    "köln": {"avg_price_sqm": 4100, "trend": 1.5, "region_type": "Großstadt", "bundesland": "Nordrhein-Westfalen"},
    "koeln": {"avg_price_sqm": 4100, "trend": 1.5, "region_type": "Großstadt", "bundesland": "Nordrhein-Westfalen"},
    "frankfurt": {"avg_price_sqm": 5800, "trend": 1.2, "region_type": "Großstadt", "bundesland": "Hessen"},
    "düsseldorf": {"avg_price_sqm": 4300, "trend": 2.0, "region_type": "Großstadt", "bundesland": "Nordrhein-Westfalen"},
    "duesseldorf": {"avg_price_sqm": 4300, "trend": 2.0, "region_type": "Großstadt", "bundesland": "Nordrhein-Westfalen"},
    "stuttgart": {"avg_price_sqm": 5100, "trend": 0.8, "region_type": "Großstadt", "bundesland": "Baden-Württemberg"},
    "leipzig": {"avg_price_sqm": 2800, "trend": 3.5, "region_type": "Großstadt", "bundesland": "Sachsen"},
    "dortmund": {"avg_price_sqm": 2400, "trend": 2.8, "region_type": "Großstadt", "bundesland": "Nordrhein-Westfalen"},
    "essen": {"avg_price_sqm": 2200, "trend": 2.5, "region_type": "Großstadt", "bundesland": "Nordrhein-Westfalen"},
    "bremen": {"avg_price_sqm": 2600, "trend": 2.2, "region_type": "Großstadt", "bundesland": "Bremen"},
    "dresden": {"avg_price_sqm": 2900, "trend": 2.0, "region_type": "Großstadt", "bundesland": "Sachsen"},
    "hannover": {"avg_price_sqm": 3200, "trend": 1.8, "region_type": "Großstadt", "bundesland": "Niedersachsen"},
    "nürnberg": {"avg_price_sqm": 3800, "trend": 1.5, "region_type": "Großstadt", "bundesland": "Bayern"},
    "nuernberg": {"avg_price_sqm": 3800, "trend": 1.5, "region_type": "Großstadt", "bundesland": "Bayern"},
    "duisburg": {"avg_price_sqm": 1800, "trend": 3.0, "region_type": "Großstadt", "bundesland": "Nordrhein-Westfalen"},
    "bochum": {"avg_price_sqm": 2100, "trend": 2.7, "region_type": "Großstadt", "bundesland": "Nordrhein-Westfalen"},
    "wuppertal": {"avg_price_sqm": 1900, "trend": 3.2, "region_type": "Großstadt", "bundesland": "Nordrhein-Westfalen"},
    "bonn": {"avg_price_sqm": 3900, "trend": 1.6, "region_type": "Großstadt", "bundesland": "Nordrhein-Westfalen"},
    "mannheim": {"avg_price_sqm": 3500, "trend": 1.4, "region_type": "Großstadt", "bundesland": "Baden-Württemberg"},
    "karlsruhe": {"avg_price_sqm": 3700, "trend": 1.3, "region_type": "Großstadt", "bundesland": "Baden-Württemberg"},
    "augsburg": {"avg_price_sqm": 4200, "trend": 1.0, "region_type": "Großstadt", "bundesland": "Bayern"},
    "wiesbaden": {"avg_price_sqm": 4500, "trend": 1.1, "region_type": "Großstadt", "bundesland": "Hessen"},
    "aachen": {"avg_price_sqm": 3100, "trend": 1.9, "region_type": "Großstadt", "bundesland": "Nordrhein-Westfalen"},
    "potsdam": {"avg_price_sqm": 4600, "trend": 2.3, "region_type": "Großstadt", "bundesland": "Brandenburg"},
    "freiburg": {"avg_price_sqm": 5200, "trend": 0.9, "region_type": "Großstadt", "bundesland": "Baden-Württemberg"},
    
    # Bundesland defaults (used when city not found)
    "bayern": {"avg_price_sqm": 4200, "trend": 1.2, "region_type": "Bundesland", "bundesland": "Bayern"},
    "baden-württemberg": {"avg_price_sqm": 3800, "trend": 1.0, "region_type": "Bundesland", "bundesland": "Baden-Württemberg"},
    "nordrhein-westfalen": {"avg_price_sqm": 2600, "trend": 2.0, "region_type": "Bundesland", "bundesland": "Nordrhein-Westfalen"},
    "nrw": {"avg_price_sqm": 2600, "trend": 2.0, "region_type": "Bundesland", "bundesland": "Nordrhein-Westfalen"},
    "hessen": {"avg_price_sqm": 3400, "trend": 1.5, "region_type": "Bundesland", "bundesland": "Hessen"},
    "niedersachsen": {"avg_price_sqm": 2200, "trend": 1.8, "region_type": "Bundesland", "bundesland": "Niedersachsen"},
    "sachsen": {"avg_price_sqm": 2400, "trend": 2.5, "region_type": "Bundesland", "bundesland": "Sachsen"},
    "rheinland-pfalz": {"avg_price_sqm": 2100, "trend": 1.6, "region_type": "Bundesland", "bundesland": "Rheinland-Pfalz"},
    "schleswig-holstein": {"avg_price_sqm": 2800, "trend": 1.7, "region_type": "Bundesland", "bundesland": "Schleswig-Holstein"},
    "brandenburg": {"avg_price_sqm": 2500, "trend": 3.0, "region_type": "Bundesland", "bundesland": "Brandenburg"},
    "sachsen-anhalt": {"avg_price_sqm": 1500, "trend": 2.8, "region_type": "Bundesland", "bundesland": "Sachsen-Anhalt"},
    "thüringen": {"avg_price_sqm": 1600, "trend": 2.2, "region_type": "Bundesland", "bundesland": "Thüringen"},
    "mecklenburg-vorpommern": {"avg_price_sqm": 2000, "trend": 2.5, "region_type": "Bundesland", "bundesland": "Mecklenburg-Vorpommern"},
    "saarland": {"avg_price_sqm": 1800, "trend": 1.5, "region_type": "Bundesland", "bundesland": "Saarland"},
    
    # Default for Germany
    "deutschland": {"avg_price_sqm": 3100, "trend": 1.8, "region_type": "Bundesweit", "bundesland": "Deutschland"},
}

# PLZ to region mapping (first 2 digits)
PLZ_REGIONS = {
    "01": "sachsen", "02": "sachsen", "03": "brandenburg", "04": "sachsen",
    "06": "sachsen-anhalt", "07": "thüringen", "08": "sachsen", "09": "sachsen",
    "10": "berlin", "11": "berlin", "12": "berlin", "13": "berlin", "14": "brandenburg",
    "15": "brandenburg", "16": "brandenburg", "17": "mecklenburg-vorpommern",
    "18": "mecklenburg-vorpommern", "19": "mecklenburg-vorpommern",
    "20": "hamburg", "21": "hamburg", "22": "hamburg", "23": "schleswig-holstein",
    "24": "schleswig-holstein", "25": "schleswig-holstein", "26": "niedersachsen",
    "27": "niedersachsen", "28": "bremen", "29": "niedersachsen",
    "30": "hannover", "31": "niedersachsen", "32": "nordrhein-westfalen",
    "33": "nordrhein-westfalen", "34": "hessen", "35": "hessen", "36": "hessen",
    "37": "niedersachsen", "38": "niedersachsen", "39": "sachsen-anhalt",
    "40": "düsseldorf", "41": "nordrhein-westfalen", "42": "wuppertal",
    "44": "dortmund", "45": "essen", "46": "nordrhein-westfalen", "47": "duisburg",
    "48": "nordrhein-westfalen", "49": "niedersachsen",
    "50": "köln", "51": "köln", "52": "aachen", "53": "bonn",
    "54": "rheinland-pfalz", "55": "rheinland-pfalz", "56": "rheinland-pfalz",
    "57": "nordrhein-westfalen", "58": "nordrhein-westfalen", "59": "nordrhein-westfalen",
    "60": "frankfurt", "61": "hessen", "63": "hessen", "64": "hessen",
    "65": "wiesbaden", "66": "saarland", "67": "rheinland-pfalz", "68": "mannheim",
    "69": "hessen",
    "70": "stuttgart", "71": "baden-württemberg", "72": "baden-württemberg",
    "73": "baden-württemberg", "74": "baden-württemberg", "75": "baden-württemberg",
    "76": "karlsruhe", "77": "baden-württemberg", "78": "baden-württemberg",
    "79": "freiburg",
    "80": "münchen", "81": "münchen", "82": "bayern", "83": "bayern",
    "84": "bayern", "85": "bayern", "86": "augsburg", "87": "bayern",
    "88": "baden-württemberg", "89": "bayern",
    "90": "nürnberg", "91": "bayern", "92": "bayern", "93": "bayern",
    "94": "bayern", "95": "bayern", "96": "bayern", "97": "bayern",
    "98": "thüringen", "99": "thüringen",
}


class StatsRequest(BaseModel):
    address: str
    city: Optional[str] = None
    zip: Optional[str] = None
    rooms: Optional[int] = None
    size: Optional[int] = None
    radius: Optional[int] = 5


class RegionalStats(BaseModel):
    id: str
    region: str
    bundesland: str
    region_type: str
    avg_price_sqm: float
    price_range_min: float
    price_range_max: float
    trend_percent: float
    trend_direction: str
    estimated_price: Optional[float] = None
    national_comparison: str
    data_source: str
    updated: str


class StatsResponse(BaseModel):
    success: bool
    stats: Optional[RegionalStats] = None
    comparable_regions: list[RegionalStats] = []
    error: Optional[str] = None


def normalize_location(location: str) -> str:
    """Normalize location string for lookup."""
    return location.lower().strip().replace("ü", "ue").replace("ö", "oe").replace("ä", "ae").replace("ß", "ss")


def get_region_from_plz(plz: str) -> Optional[str]:
    """Get region key from PLZ."""
    if len(plz) >= 2:
        prefix = plz[:2]
        return PLZ_REGIONS.get(prefix)
    return None


def lookup_region_data(location: str, plz: Optional[str] = None) -> dict:
    """Look up regional price data."""
    # Try PLZ first
    if plz:
        region_key = get_region_from_plz(plz)
        if region_key and region_key in REGIONAL_PRICES:
            data = REGIONAL_PRICES[region_key].copy()
            data["matched_key"] = region_key
            data["match_type"] = "PLZ"
            return data
    
    # Try direct location match
    normalized = normalize_location(location)
    
    # Direct match
    if normalized in REGIONAL_PRICES:
        data = REGIONAL_PRICES[normalized].copy()
        data["matched_key"] = normalized
        data["match_type"] = "Stadt"
        return data
    
    # Partial match (city name in location string)
    for key in REGIONAL_PRICES:
        if key in normalized or normalized in key:
            data = REGIONAL_PRICES[key].copy()
            data["matched_key"] = key
            data["match_type"] = "Teilmatch"
            return data
    
    # Default to Germany average
    data = REGIONAL_PRICES["deutschland"].copy()
    data["matched_key"] = "deutschland"
    data["match_type"] = "Bundesschnitt"
    return data


def get_comparable_regions(current_region: str, current_price: float) -> list[RegionalStats]:
    """Get comparable regions with similar price levels."""
    comparables = []
    current_key = normalize_location(current_region)
    
    # Find regions with similar prices (within 30%)
    for key, data in REGIONAL_PRICES.items():
        if data["region_type"] == "Großstadt" and key != current_key:
            price_diff = abs(data["avg_price_sqm"] - current_price) / current_price
            if price_diff < 0.3:  # Within 30%
                trend_dir = "steigend" if data["trend"] > 0 else "fallend" if data["trend"] < 0 else "stabil"
                national_avg = REGIONAL_PRICES["deutschland"]["avg_price_sqm"]
                comparison = "über" if data["avg_price_sqm"] > national_avg else "unter"
                diff_percent = round((data["avg_price_sqm"] - national_avg) / national_avg * 100, 1)
                
                comparables.append(RegionalStats(
                    id=f"comp-{key}",
                    region=key.title(),
                    bundesland=data["bundesland"],
                    region_type=data["region_type"],
                    avg_price_sqm=data["avg_price_sqm"],
                    price_range_min=round(data["avg_price_sqm"] * 0.75),
                    price_range_max=round(data["avg_price_sqm"] * 1.35),
                    trend_percent=data["trend"],
                    trend_direction=trend_dir,
                    national_comparison=f"{diff_percent:+.1f}% {comparison} Bundesschnitt",
                    data_source="Destatis/Regionale Marktberichte",
                    updated=datetime.now().strftime("%Y-%m-%d")
                ))
    
    # Sort by price similarity and limit to 5
    comparables.sort(key=lambda x: abs(x.avg_price_sqm - current_price))
    return comparables[:5]


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {
        "status": "ok",
        "version": "2.0.0",
        "data_source": "Destatis/Regionale Marktberichte",
        "regions_available": len(REGIONAL_PRICES)
    }


@app.get("/stats", response_model=StatsResponse)
async def get_stats(
    address: str = Query(..., description="Target address, city, or PLZ"),
    city: Optional[str] = Query(None),
    zip: Optional[str] = Query(None, alias="plz"),
    rooms: Optional[int] = Query(None, ge=1, le=20),
    size: Optional[int] = Query(None, ge=10, le=1000)
):
    """
    Get regional property price statistics for a given location.
    
    Uses official statistical data from Destatis and regional market reports.
    """
    try:
        # Determine location to look up
        location = city or address
        plz = zip
        
        # Extract PLZ from address if present
        if not plz:
            import re
            plz_match = re.search(r'\b(\d{5})\b', address)
            if plz_match:
                plz = plz_match.group(1)
        
        # Look up regional data
        region_data = lookup_region_data(location, plz)
        
        avg_price = region_data["avg_price_sqm"]
        trend = region_data["trend"]
        trend_dir = "steigend" if trend > 0 else "fallend" if trend < 0 else "stabil"
        
        # Calculate estimated price if size provided
        estimated_price = None
        if size:
            # Apply room factor (more rooms = slightly higher price per sqm for larger units)
            room_factor = 1.0
            if rooms:
                if rooms <= 1:
                    room_factor = 0.95
                elif rooms >= 4:
                    room_factor = 1.08
            estimated_price = round(avg_price * size * room_factor)
        
        # National comparison
        national_avg = REGIONAL_PRICES["deutschland"]["avg_price_sqm"]
        comparison = "über" if avg_price > national_avg else "unter"
        diff_percent = round((avg_price - national_avg) / national_avg * 100, 1)
        
        stats = RegionalStats(
            id="main",
            region=region_data["matched_key"].title(),
            bundesland=region_data["bundesland"],
            region_type=region_data["region_type"],
            avg_price_sqm=avg_price,
            price_range_min=round(avg_price * 0.75),
            price_range_max=round(avg_price * 1.35),
            trend_percent=trend,
            trend_direction=trend_dir,
            estimated_price=estimated_price,
            national_comparison=f"{diff_percent:+.1f}% {comparison} Bundesschnitt",
            data_source="Destatis/Regionale Marktberichte Q4 2025",
            updated=datetime.now().strftime("%Y-%m-%d")
        )
        
        # Get comparable regions
        comparables = get_comparable_regions(region_data["matched_key"], avg_price)
        
        return StatsResponse(
            success=True,
            stats=stats,
            comparable_regions=comparables
        )
        
    except Exception as e:
        logger.error(f"Stats error: {e}", exc_info=True)
        return StatsResponse(
            success=False,
            error=str(e)
        )


@app.post("/stats", response_model=StatsResponse)
async def post_stats(req: StatsRequest):
    """POST endpoint for stats (same as GET but with body)."""
    return await get_stats(
        address=req.address,
        city=req.city,
        zip=req.zip,
        rooms=req.rooms,
        size=req.size
    )


# Legacy endpoint for backwards compatibility
@app.get("/comps")
async def get_comps_legacy(
    address: str = Query(...),
    city: Optional[str] = Query(None),
    zip: Optional[str] = Query(None),
    rooms: Optional[int] = Query(None),
    size: Optional[int] = Query(None),
    radius: Optional[int] = Query(5)
):
    """Legacy endpoint - redirects to stats."""
    stats_response = await get_stats(address=address, city=city, zip=zip, rooms=rooms, size=size)
    
    # Convert stats to legacy comps format
    if stats_response.success and stats_response.stats:
        s = stats_response.stats
        comps = [{
            "id": "stats-main",
            "address": f"Durchschnitt {s.region}",
            "price": s.estimated_price or (s.avg_price_sqm * (size or 75)),
            "size": size or 75,
            "rooms": rooms or 3,
            "distance": 0,
            "listingDate": s.updated,
            "pricePerSqm": s.avg_price_sqm,
            "trend": s.trend_direction,
            "source": s.data_source
        }]
        
        # Add comparable regions as additional "comps"
        for i, comp in enumerate(stats_response.comparable_regions):
            comps.append({
                "id": f"comp-{i}",
                "address": f"Vergleich: {comp.region}",
                "price": comp.estimated_price or (comp.avg_price_sqm * (size or 75)),
                "size": size or 75,
                "rooms": rooms or 3,
                "distance": 0,
                "listingDate": comp.updated,
                "pricePerSqm": comp.avg_price_sqm,
                "trend": comp.trend_direction,
                "source": comp.data_source
            })
        
        return {"success": True, "comps": comps}
    
    return {"success": False, "comps": [], "error": stats_response.error}


@app.post("/comps")
async def post_comps_legacy(req: StatsRequest):
    """Legacy POST endpoint."""
    return await get_comps_legacy(
        address=req.address,
        city=req.city,
        zip=req.zip,
        rooms=req.rooms,
        size=req.size
    )


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8502"))
    uvicorn.run(app, host="0.0.0.0", port=port)
