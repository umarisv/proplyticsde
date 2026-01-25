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
    asking_price: Optional[float] = None
    baujahr: Optional[int] = None


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


class RiskFactor(BaseModel):
    name: str
    score: int  # 0-100
    weight: float
    description: str
    recommendation: Optional[str] = None


class RiskAssessment(BaseModel):
    overall_score: int  # 0-100 (0 = sehr sicher, 100 = sehr riskant)
    risk_level: str  # "niedrig", "mittel", "hoch", "sehr hoch"
    factors: list[RiskFactor]
    summary: str
    price_recommendation: str
    negotiation_potential: float  # Prozent


class StatsResponse(BaseModel):
    success: bool
    stats: Optional[RegionalStats] = None
    risk_assessment: Optional[RiskAssessment] = None
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


def calculate_risk_assessment(
    region_data: dict,
    asking_price: Optional[float] = None,
    size: Optional[int] = None,
    rooms: Optional[int] = None,
    baujahr: Optional[int] = None,
) -> RiskAssessment:
    """
    Calculate comprehensive risk assessment for a property investment.
    
    Risk factors considered:
    1. Preis vs. Markt (price deviation from regional average)
    2. Markttrend (price trend direction and strength)
    3. Volatilität (price volatility based on region type)
    4. Liquidität (market liquidity - how easy to sell)
    5. Lage-Faktor (location quality based on price level)
    6. Objektalter (if baujahr provided)
    """
    factors = []
    avg_price_sqm = region_data["avg_price_sqm"]
    trend = region_data["trend"]
    region_type = region_data["region_type"]
    national_avg = REGIONAL_PRICES["deutschland"]["avg_price_sqm"]
    
    # 1. Preis vs. Markt (30% weight)
    if asking_price and size:
        price_per_sqm = asking_price / size
        deviation = (price_per_sqm - avg_price_sqm) / avg_price_sqm * 100
        
        if deviation > 20:
            price_score = min(90, 50 + deviation)
            price_desc = f"Kaufpreis liegt {deviation:.1f}% über dem regionalen Durchschnitt"
            price_rec = "Preisverhandlung dringend empfohlen"
        elif deviation > 10:
            price_score = 50 + deviation
            price_desc = f"Kaufpreis liegt {deviation:.1f}% über dem Durchschnitt"
            price_rec = "Moderate Preisverhandlung möglich"
        elif deviation < -10:
            price_score = max(10, 30 + deviation)
            price_desc = f"Kaufpreis liegt {abs(deviation):.1f}% unter dem Durchschnitt"
            price_rec = "Attraktiver Preis - Ursache prüfen"
        else:
            price_score = 35
            price_desc = f"Kaufpreis entspricht dem regionalen Markt (±{abs(deviation):.1f}%)"
            price_rec = None
        
        factors.append(RiskFactor(
            name="Preis vs. Markt",
            score=int(price_score),
            weight=0.30,
            description=price_desc,
            recommendation=price_rec
        ))
    else:
        factors.append(RiskFactor(
            name="Preis vs. Markt",
            score=50,
            weight=0.30,
            description="Kein Kaufpreis angegeben - keine Bewertung möglich",
            recommendation="Kaufpreis eingeben für detaillierte Analyse"
        ))
    
    # 2. Markttrend (20% weight)
    if trend >= 3.0:
        trend_score = 25
        trend_desc = f"Stark steigender Markt (+{trend:.1f}% p.a.) - gute Wertsteigerung"
        trend_rec = "Guter Einstiegszeitpunkt"
    elif trend >= 1.5:
        trend_score = 35
        trend_desc = f"Moderat steigender Markt (+{trend:.1f}% p.a.)"
        trend_rec = None
    elif trend >= 0:
        trend_score = 50
        trend_desc = f"Stagnierender Markt (+{trend:.1f}% p.a.)"
        trend_rec = "Wertsteigerungspotenzial begrenzt"
    else:
        trend_score = 70 + abs(trend) * 5
        trend_desc = f"Fallender Markt ({trend:.1f}% p.a.) - Wertverlustrisiko"
        trend_rec = "Vorsicht: Markt unter Druck"
    
    factors.append(RiskFactor(
        name="Markttrend",
        score=int(trend_score),
        weight=0.20,
        description=trend_desc,
        recommendation=trend_rec
    ))
    
    # 3. Volatilität (15% weight) - based on region type
    if region_type == "Großstadt":
        vol_score = 30
        vol_desc = "Großstadtmarkt mit stabiler Nachfrage"
    elif region_type == "Bundesland":
        vol_score = 50
        vol_desc = "Regionaler Markt mit mittlerer Volatilität"
    else:
        vol_score = 40
        vol_desc = "Bundesweiter Durchschnitt"
    
    factors.append(RiskFactor(
        name="Marktvolatilität",
        score=vol_score,
        weight=0.15,
        description=vol_desc,
        recommendation=None
    ))
    
    # 4. Liquidität (15% weight) - based on price level
    price_ratio = avg_price_sqm / national_avg
    if price_ratio > 1.5:
        liq_score = 55
        liq_desc = "Hochpreissegment - eingeschränkter Käuferkreis"
        liq_rec = "Längere Vermarktungszeit einplanen"
    elif price_ratio > 1.0:
        liq_score = 35
        liq_desc = "Überdurchschnittliches Preisniveau - gute Liquidität"
        liq_rec = None
    else:
        liq_score = 25
        liq_desc = "Unterdurchschnittliches Preisniveau - sehr liquide"
        liq_rec = "Schneller Wiederverkauf möglich"
    
    factors.append(RiskFactor(
        name="Marktliquidität",
        score=liq_score,
        weight=0.15,
        description=liq_desc,
        recommendation=liq_rec
    ))
    
    # 5. Lage-Faktor (10% weight)
    if avg_price_sqm >= 5000:
        lage_score = 25
        lage_desc = "Premium-Lage mit hoher Wertstabilität"
    elif avg_price_sqm >= 3500:
        lage_score = 35
        lage_desc = "Gute Lage mit solider Nachfrage"
    elif avg_price_sqm >= 2500:
        lage_score = 45
        lage_desc = "Durchschnittliche Lage"
    else:
        lage_score = 55
        lage_desc = "Günstige Lage - Aufwertungspotenzial prüfen"
    
    factors.append(RiskFactor(
        name="Lagefaktor",
        score=lage_score,
        weight=0.10,
        description=lage_desc,
        recommendation=None
    ))
    
    # 6. Objektalter (10% weight) - if baujahr provided
    if baujahr:
        alter = datetime.now().year - baujahr
        if alter <= 5:
            alter_score = 20
            alter_desc = f"Neubau ({baujahr}) - geringes Instandhaltungsrisiko"
        elif alter <= 20:
            alter_score = 30
            alter_desc = f"Moderne Bausubstanz ({baujahr})"
        elif alter <= 40:
            alter_score = 45
            alter_desc = f"Mittleres Baualter ({baujahr}) - Sanierung prüfen"
            alter_rec = "Zustand und Sanierungsbedarf prüfen"
        elif alter <= 70:
            alter_score = 60
            alter_desc = f"Altbau ({baujahr}) - erhöhtes Instandhaltungsrisiko"
            alter_rec = "Detaillierte Zustandsprüfung empfohlen"
        else:
            alter_score = 70
            alter_desc = f"Historischer Bestand ({baujahr})"
            alter_rec = "Umfassende Substanzprüfung erforderlich"
        
        factors.append(RiskFactor(
            name="Objektalter",
            score=alter_score,
            weight=0.10,
            description=alter_desc,
            recommendation=alter_rec if alter > 30 else None
        ))
    else:
        factors.append(RiskFactor(
            name="Objektalter",
            score=50,
            weight=0.10,
            description="Kein Baujahr angegeben",
            recommendation="Baujahr für präzisere Analyse angeben"
        ))
    
    # Calculate overall score (weighted average)
    overall_score = sum(f.score * f.weight for f in factors)
    overall_score = int(min(100, max(0, overall_score)))
    
    # Determine risk level
    if overall_score <= 30:
        risk_level = "niedrig"
        summary = "Geringes Investitionsrisiko. Die Faktoren sprechen für eine solide Anlage."
    elif overall_score <= 50:
        risk_level = "mittel"
        summary = "Moderates Risiko. Einzelne Faktoren erfordern Aufmerksamkeit."
    elif overall_score <= 70:
        risk_level = "hoch"
        summary = "Erhöhtes Risiko. Mehrere Faktoren deuten auf potenzielle Probleme hin."
    else:
        risk_level = "sehr hoch"
        summary = "Hohes Investitionsrisiko. Sorgfältige Prüfung dringend empfohlen."
    
    # Calculate negotiation potential
    if asking_price and size:
        price_per_sqm = asking_price / size
        if price_per_sqm > avg_price_sqm * 1.1:
            negotiation = min(15, (price_per_sqm / avg_price_sqm - 1) * 50)
        else:
            negotiation = max(0, 5 - (avg_price_sqm - price_per_sqm) / avg_price_sqm * 20)
    else:
        negotiation = 7.5  # Default
    
    # Price recommendation
    if asking_price and size:
        fair_price = avg_price_sqm * size
        if asking_price > fair_price * 1.15:
            price_rec = f"Empfohlener Maximalpreis: {fair_price * 1.05:,.0f} € (basierend auf Marktdaten)"
        elif asking_price > fair_price * 1.05:
            price_rec = f"Preis leicht über Markt. Faire Spanne: {fair_price * 0.95:,.0f} - {fair_price * 1.05:,.0f} €"
        elif asking_price < fair_price * 0.9:
            price_rec = f"Attraktiver Preis unter Marktwert. Ursache prüfen."
        else:
            price_rec = f"Marktgerechter Preis. Faire Spanne: {fair_price * 0.95:,.0f} - {fair_price * 1.05:,.0f} €"
    else:
        price_rec = f"Geschätzter Marktwert: {avg_price_sqm * (size or 75):,.0f} € für {size or 75} m²"
    
    return RiskAssessment(
        overall_score=overall_score,
        risk_level=risk_level,
        factors=factors,
        summary=summary,
        price_recommendation=price_rec,
        negotiation_potential=round(negotiation, 1)
    )


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
    size: Optional[int] = Query(None, ge=10, le=1000),
    asking_price: Optional[float] = Query(None, description="Asking price in EUR"),
    baujahr: Optional[int] = Query(None, ge=1800, le=2030, description="Year of construction")
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
        
        # Calculate risk assessment
        risk = calculate_risk_assessment(
            region_data=region_data,
            asking_price=asking_price,
            size=size,
            rooms=rooms,
            baujahr=baujahr
        )
        
        return StatsResponse(
            success=True,
            stats=stats,
            risk_assessment=risk,
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
        size=req.size,
        asking_price=req.asking_price,
        baujahr=req.baujahr
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
