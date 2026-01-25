"""Text extraction utilities for parsing property listings."""

import re
from typing import Optional, Tuple
from decimal import Decimal

from app.core.logging import get_logger

logger = get_logger(__name__)


def extract_price(text: str) -> Optional[float]:
    """
    Extract price in EUR from text.
    Handles formats: 1.234.567 €, 1,234,567 EUR, 1234567€
    """
    if not text:
        return None
    
    # Normalize text
    text = text.replace("\xa0", " ").replace(" ", "")
    
    # Pattern for German number format: 1.234.567,00 € or 1.234.567 €
    patterns = [
        # German format with decimals: 1.234.567,00 €
        r'(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)\s*(?:€|EUR|Euro)',
        # German format without decimals: 1.234.567 €
        r'(\d{1,3}(?:\.\d{3})*)\s*(?:€|EUR|Euro)',
        # Plain number with € symbol
        r'(\d+)\s*(?:€|EUR|Euro)',
        # Kaufpreis: 123.456 € pattern
        r'(?:Kaufpreis|Preis|Verkaufspreis)[:\s]*(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)\s*(?:€|EUR)?',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            price_str = match.group(1)
            # Convert German format to float
            price_str = price_str.replace(".", "").replace(",", ".")
            try:
                price = float(price_str)
                # Sanity check: prices should be > 10,000 and < 100,000,000
                if 10000 <= price <= 100000000:
                    return price
            except ValueError:
                continue
    
    return None


def extract_living_area(text: str) -> Optional[float]:
    """
    Extract living area in m² from text.
    Handles formats: 80 m², 80m², 80 qm, ca. 80 m²
    """
    if not text:
        return None
    
    patterns = [
        # Standard: 80,5 m² or 80.5 m²
        r'(?:Wohnfläche|Wohnfl\.|Wfl\.?|Fläche|ca\.?)?\s*(\d+[,.]?\d*)\s*(?:m²|m2|qm)',
        # With tilde: ~80 m²
        r'[~≈]\s*(\d+[,.]?\d*)\s*(?:m²|m2|qm)',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            area_str = match.group(1).replace(",", ".")
            try:
                area = float(area_str)
                # Sanity check: area should be > 10 and < 10,000
                if 10 <= area <= 10000:
                    return area
            except ValueError:
                continue
    
    return None


def extract_rooms(text: str) -> Optional[float]:
    """
    Extract number of rooms from text.
    Handles formats: 3 Zimmer, 3,5 Zi., 3-Zimmer-Wohnung
    """
    if not text:
        return None
    
    patterns = [
        # 3,5 Zimmer or 3.5 Zimmer
        r'(\d+[,.]?\d*)\s*(?:Zimmer|Zi\.?|Räume|Rm\.?)',
        # 3-Zimmer-Wohnung
        r'(\d+[,.]?\d*)\s*-?\s*Zimmer',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            rooms_str = match.group(1).replace(",", ".")
            try:
                rooms = float(rooms_str)
                # Sanity check: rooms should be >= 1 and <= 20
                if 1 <= rooms <= 20:
                    return rooms
            except ValueError:
                continue
    
    return None


def extract_year_built(text: str) -> Optional[int]:
    """
    Extract year built from text.
    Handles formats: Baujahr 1985, Bj. 1985, erbaut 1985
    """
    if not text:
        return None
    
    patterns = [
        r'(?:Baujahr|Bj\.?|erbaut|Fertigstellung)[:\s]*(\d{4})',
        r'(?:aus|von|im Jahr)[:\s]*(\d{4})',
        # Standalone year in reasonable range
        r'\b(19[0-9]{2}|20[0-2][0-9])\b',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            try:
                year = int(match.group(1))
                # Sanity check: year should be between 1800 and 2030
                if 1800 <= year <= 2030:
                    return year
            except ValueError:
                continue
    
    return None


def extract_address(text: str) -> Optional[str]:
    """
    Extract address from text.
    Returns raw address string for further normalization.
    """
    if not text:
        return None
    
    # German address patterns
    patterns = [
        # Street + number + PLZ + City
        r'([A-Za-zäöüßÄÖÜ\-\. ]+(?:straße|str\.|weg|platz|allee|ring|gasse|damm|ufer)\s*\d+[a-z]?\s*,?\s*\d{5}\s+[A-Za-zäöüßÄÖÜ\-\. ]+)',
        # PLZ + City
        r'(\d{5}\s+[A-Za-zäöüßÄÖÜ\-\. ]+)',
        # Street + number
        r'([A-Za-zäöüßÄÖÜ\-\. ]+(?:straße|str\.|weg|platz|allee|ring|gasse|damm|ufer)\s*\d+[a-z]?)',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            address = match.group(1).strip()
            # Clean up
            address = re.sub(r'\s+', ' ', address)
            if len(address) >= 10:  # Minimum reasonable address length
                return address
    
    return None


def extract_postal_code(text: str) -> Optional[str]:
    """Extract 5-digit German postal code."""
    if not text:
        return None
    
    match = re.search(r'\b(\d{5})\b', text)
    if match:
        return match.group(1)
    return None


def has_feature(text: str, keywords: list[str]) -> bool:
    """Check if text contains any of the keywords (case-insensitive)."""
    if not text:
        return False
    
    text_lower = text.lower()
    return any(keyword.lower() in text_lower for keyword in keywords)


def extract_balcony(text: str) -> Optional[bool]:
    """Check if listing has a balcony."""
    positive = ["balkon", "loggia", "sonnenterrasse"]
    negative = ["kein balkon", "ohne balkon"]
    
    if has_feature(text, negative):
        return False
    if has_feature(text, positive):
        return True
    return None


def extract_terrace(text: str) -> Optional[bool]:
    """Check if listing has a terrace."""
    positive = ["terrasse", "dachterrasse"]
    negative = ["keine terrasse", "ohne terrasse"]
    
    if has_feature(text, negative):
        return False
    if has_feature(text, positive):
        return True
    return None


def extract_garden(text: str) -> Optional[bool]:
    """Check if listing has a garden."""
    positive = ["garten", "gartenanteil", "gartennutzung"]
    negative = ["kein garten", "ohne garten"]
    
    if has_feature(text, negative):
        return False
    if has_feature(text, positive):
        return True
    return None


def extract_elevator(text: str) -> Optional[bool]:
    """Check if building has an elevator."""
    positive = ["aufzug", "fahrstuhl", "lift", "personenaufzug"]
    negative = ["kein aufzug", "ohne aufzug", "kein fahrstuhl"]
    
    if has_feature(text, negative):
        return False
    if has_feature(text, positive):
        return True
    return None


def extract_parking(text: str) -> Optional[bool]:
    """Check if listing has parking."""
    positive = [
        "stellplatz", "garage", "tiefgarage", "parkplatz", 
        "carport", "duplex-parker", "außenstellplatz"
    ]
    negative = ["kein stellplatz", "ohne stellplatz", "keine garage"]
    
    if has_feature(text, negative):
        return False
    if has_feature(text, positive):
        return True
    return None


def extract_property_type(text: str) -> Optional[str]:
    """Extract property type from text."""
    if not text:
        return None
    
    text_lower = text.lower()
    
    type_mappings = {
        "eigentumswohnung": ["eigentumswohnung", "etw", "wohnung zum kauf"],
        "einfamilienhaus": ["einfamilienhaus", "efh", "haus zum kauf"],
        "doppelhaushälfte": ["doppelhaushälfte", "dhh", "doppelhaus"],
        "reihenhaus": ["reihenhaus", "rhh", "reihenendhaus", "reihenmittelhaus"],
        "mehrfamilienhaus": ["mehrfamilienhaus", "mfh", "renditeobjekt", "zinshaus"],
        "penthouse": ["penthouse", "dachgeschosswohnung", "dg-wohnung"],
        "maisonette": ["maisonette", "maisonettewohnung"],
        "grundstück": ["grundstück", "baugrundstück", "bauplatz"],
    }
    
    for prop_type, keywords in type_mappings.items():
        if any(kw in text_lower for kw in keywords):
            return prop_type
    
    return None


def clean_text(text: str) -> str:
    """Clean and normalize text for storage."""
    if not text:
        return ""
    
    # Remove excessive whitespace
    text = re.sub(r'\s+', ' ', text)
    # Remove HTML entities
    text = text.replace("&nbsp;", " ")
    text = text.replace("&amp;", "&")
    text = text.replace("&lt;", "<")
    text = text.replace("&gt;", ">")
    # Strip
    return text.strip()
