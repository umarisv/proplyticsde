"""Address normalization pipeline."""

import re
from typing import Optional, Tuple

from app.core.logging import get_logger

logger = get_logger(__name__)


# Street abbreviation mappings
STREET_ABBREVIATIONS = {
    "str.": "straße",
    "str ": "straße ",
    "strasse": "straße",
    "pl.": "platz",
    "al.": "allee",
}

# City name normalizations
CITY_NORMALIZATIONS = {
    "koeln": "köln",
    "muenchen": "münchen",
    "nuernberg": "nürnberg",
    "duesseldorf": "düsseldorf",
    "frankfurt am main": "frankfurt",
    "frankfurt a.m.": "frankfurt",
    "frankfurt/main": "frankfurt",
}


def normalize_address(address_raw: str) -> str:
    """
    Normalize a raw address string for consistent matching.
    
    Steps:
    1. Lowercase
    2. Trim whitespace
    3. Unify street abbreviations
    4. Normalize city names
    5. Remove special characters
    """
    if not address_raw:
        return ""
    
    # Lowercase and trim
    address = address_raw.lower().strip()
    
    # Remove excessive whitespace
    address = re.sub(r'\s+', ' ', address)
    
    # Unify street abbreviations
    for abbrev, full in STREET_ABBREVIATIONS.items():
        address = address.replace(abbrev, full)
    
    # Normalize city names
    for old, new in CITY_NORMALIZATIONS.items():
        address = address.replace(old, new)
    
    # Remove common noise words
    address = re.sub(r'\b(deutschland|germany|de)\b', '', address)
    
    # Remove trailing commas and dots
    address = re.sub(r'[,\.]+$', '', address)
    
    # Final cleanup
    address = re.sub(r'\s+', ' ', address).strip()
    
    return address


def parse_address_components(address_normalized: str) -> dict:
    """
    Parse normalized address into components.
    
    Returns dict with:
    - street: Street name
    - house_number: House number (including letter suffixes)
    - postal_code: 5-digit postal code
    - city: City name
    """
    result = {
        "street": None,
        "house_number": None,
        "postal_code": None,
        "city": None,
    }
    
    if not address_normalized:
        return result
    
    # Extract postal code (5 digits)
    plz_match = re.search(r'\b(\d{5})\b', address_normalized)
    if plz_match:
        result["postal_code"] = plz_match.group(1)
    
    # Extract street and house number
    # Pattern: Street name + number (with optional letter)
    street_pattern = r'([a-zäöüß\-\. ]+(?:straße|weg|platz|allee|ring|gasse|damm|ufer|chaussee))\s*(\d+[a-z]?)?'
    street_match = re.search(street_pattern, address_normalized, re.IGNORECASE)
    
    if street_match:
        result["street"] = street_match.group(1).strip()
        if street_match.group(2):
            result["house_number"] = street_match.group(2)
    
    # Extract city (text after postal code, or last part if no PLZ)
    if result["postal_code"]:
        # City is typically after PLZ
        city_pattern = r'\d{5}\s+([a-zäöüß\-\. ]+)'
        city_match = re.search(city_pattern, address_normalized, re.IGNORECASE)
        if city_match:
            city = city_match.group(1).strip()
            # Remove common suffixes
            city = re.sub(r'\s*(stadtteil|ortsteil|bezirk|ot).*$', '', city)
            result["city"] = city
    
    return result


def create_address_key(street: str, house_number: str, postal_code: str) -> Optional[str]:
    """
    Create a unique key for address matching.
    
    Returns: "postal_code:street:house_number" or None if not enough data
    """
    if not street or not postal_code:
        return None
    
    # Normalize components
    street_clean = re.sub(r'[^a-zäöüß]', '', street.lower())
    house_clean = (house_number or "").lower()
    
    return f"{postal_code}:{street_clean}:{house_clean}"


def addresses_match(addr1: str, addr2: str, threshold: float = 0.8) -> bool:
    """
    Check if two normalized addresses match.
    
    Uses simple token overlap for fuzzy matching.
    """
    if not addr1 or not addr2:
        return False
    
    # Exact match
    if addr1 == addr2:
        return True
    
    # Token-based matching
    tokens1 = set(addr1.split())
    tokens2 = set(addr2.split())
    
    if not tokens1 or not tokens2:
        return False
    
    # Calculate Jaccard similarity
    intersection = len(tokens1 & tokens2)
    union = len(tokens1 | tokens2)
    
    similarity = intersection / union if union > 0 else 0
    
    return similarity >= threshold


def extract_city_from_postal_code(postal_code: str) -> Optional[str]:
    """
    Get city name from postal code using a basic mapping.
    
    Note: This is a simplified mapping. In production, use a proper
    PLZ database or geocoding service.
    """
    # First 2 digits give rough region
    if not postal_code or len(postal_code) < 2:
        return None
    
    prefix = postal_code[:2]
    
    # Major city mappings (simplified)
    PLZ_CITY_MAP = {
        "10": "berlin", "11": "berlin", "12": "berlin", "13": "berlin",
        "20": "hamburg", "21": "hamburg", "22": "hamburg",
        "30": "hannover",
        "40": "düsseldorf",
        "44": "dortmund",
        "45": "essen",
        "50": "köln", "51": "köln",
        "53": "bonn",
        "60": "frankfurt",
        "70": "stuttgart",
        "80": "münchen", "81": "münchen",
        "90": "nürnberg",
    }
    
    return PLZ_CITY_MAP.get(prefix)
