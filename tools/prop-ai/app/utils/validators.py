"""Validation utilities."""

import re
from typing import Optional
from urllib.parse import urlparse


def is_valid_url(url: str) -> bool:
    """Check if URL is valid and uses http/https."""
    try:
        parsed = urlparse(url)
        return parsed.scheme in ("http", "https") and bool(parsed.netloc)
    except Exception:
        return False


def is_same_domain(url1: str, url2: str) -> bool:
    """Check if two URLs are from the same domain."""
    try:
        domain1 = urlparse(url1).netloc.lower()
        domain2 = urlparse(url2).netloc.lower()
        return domain1 == domain2
    except Exception:
        return False


def is_listing_url(url: str) -> bool:
    """
    Heuristic check if URL is likely a property listing page.
    Looks for common patterns in broker websites.
    """
    url_lower = url.lower()
    
    listing_patterns = [
        "/immobilie/",
        "/immobilien/",
        "/angebot/",
        "/angebote/",
        "/expose/",
        "/exposee/",
        "/objekt/",
        "/objekte/",
        "/kaufen/",
        "/mieten/",
        "/wohnung/",
        "/haus/",
        "/property/",
        "/listing/",
        "/detail/",
        "/view/",
        "expose_id=",
        "objekt_id=",
        "id=",
    ]
    
    return any(pattern in url_lower for pattern in listing_patterns)


def is_excluded_url(url: str) -> bool:
    """Check if URL should be excluded from scraping."""
    url_lower = url.lower()
    
    excluded_patterns = [
        "/impressum",
        "/datenschutz",
        "/privacy",
        "/agb",
        "/kontakt",
        "/contact",
        "/login",
        "/register",
        "/bewerbung",
        "/karriere",
        "/jobs",
        ".pdf",
        ".jpg",
        ".png",
        ".gif",
        "mailto:",
        "tel:",
        "javascript:",
        "#",
    ]
    
    return any(pattern in url_lower for pattern in excluded_patterns)


def is_valid_postal_code(code: str) -> bool:
    """Validate German postal code (5 digits)."""
    if not code:
        return False
    return bool(re.match(r"^\d{5}$", code.strip()))


def is_valid_price(price: float) -> bool:
    """Validate price is in reasonable range for German real estate."""
    return 10000 <= price <= 100000000


def is_valid_area(area: float) -> bool:
    """Validate living area is in reasonable range."""
    return 10 <= area <= 10000


def is_valid_year(year: int) -> bool:
    """Validate year built is in reasonable range."""
    return 1800 <= year <= 2030


def sanitize_string(text: str, max_length: int = 1000) -> str:
    """Sanitize and truncate string for database storage."""
    if not text:
        return ""
    
    # Remove null bytes
    text = text.replace("\x00", "")
    
    # Normalize whitespace
    text = re.sub(r"\s+", " ", text)
    
    # Truncate
    if len(text) > max_length:
        text = text[:max_length - 3] + "..."
    
    return text.strip()
