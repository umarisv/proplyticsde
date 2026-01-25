"""
FastAPI wrapper for CyberScraper 2077
Provides a REST API to scrape comparable listings from ImmoScout and similar sites.
"""

import os
import json
import asyncio
import logging
from typing import Optional
from datetime import datetime

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from src.web_extractor import WebExtractor
from src.scrapers.playwright_scraper import ScraperConfig

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="CyberScraper API",
    description="API for scraping comparable property listings",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global extractor instance (reused for efficiency)
_extractor: Optional[WebExtractor] = None


def get_extractor() -> WebExtractor:
    """Get or create the WebExtractor instance."""
    global _extractor
    if _extractor is None:
        model_name = os.getenv("SCRAPER_MODEL", "gemini-2.0-flash")
        config = ScraperConfig(
            headless=True,
            timeout=45000,
            delay_after_load=5,  # Wait 5s after page load for dynamic content
            use_stealth=True,
            simulate_human=True,  # Simulate human behavior
            bypass_cloudflare=True,
            use_persistent_context=True,  # Use persistent browser context
            locale="de-DE",
            timezone_id="Europe/Berlin",
        )
        _extractor = WebExtractor(model_name=model_name, scraper_config=config)
    return _extractor


class Comparable(BaseModel):
    id: str
    address: str
    price: float
    size: float
    rooms: float
    distance: float
    listingDate: str
    url: Optional[str] = None


class CompsRequest(BaseModel):
    address: str
    city: Optional[str] = None
    zip: Optional[str] = None
    rooms: Optional[int] = None
    size: Optional[int] = None
    radius: Optional[int] = 5


class CompsResponse(BaseModel):
    success: bool
    comps: list[Comparable]
    error: Optional[str] = None
    source_url: Optional[str] = None


def build_immoscout_url(req: CompsRequest) -> str:
    """Build ImmoScout24 search URL from request parameters."""
    base = "https://www.immobilienscout24.de/Suche/de"
    
    # Build location part
    location = req.zip or req.city or req.address.split(",")[0].strip()
    
    # Build search path
    path_parts = [base]
    
    # Add location (simplified - real implementation would geocode)
    path_parts.append(f"/{location.replace(' ', '-').lower()}")
    
    # Property type (default: Wohnung)
    path_parts.append("/wohnung-kaufen")
    
    # Build query params
    params = []
    if req.rooms:
        params.append(f"zimmeranzahlmin={req.rooms - 1}")
        params.append(f"zimmeranzahlmax={req.rooms + 1}")
    if req.size:
        params.append(f"wohnflaechemin={max(10, req.size - 20)}")
        params.append(f"wohnflaechemax={req.size + 20}")
    if req.radius:
        params.append(f"umkreis={req.radius}")
    
    url = "".join(path_parts)
    if params:
        url += "?" + "&".join(params)
    
    return url


EXTRACTION_PROMPT = """Extract all property listings from this page as JSON array.
For each listing, extract:
- id: unique identifier or listing number
- address: full address or location description
- price: purchase price as number (no currency symbols)
- size: living area in sqm as number
- rooms: number of rooms as number
- listingDate: when the listing was posted (format: YYYY-MM-DD, use today if not found)
- url: link to the listing detail page (full URL)

Return ONLY a valid JSON array, no other text. Example:
[{"id": "123", "address": "Musterstr. 1, 40239 Düsseldorf", "price": 250000, "size": 75, "rooms": 3, "listingDate": "2026-01-20", "url": "https://..."}]
"""


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "ok", "model": os.getenv("SCRAPER_MODEL", "gemini-2.0-flash")}


@app.get("/comps", response_model=CompsResponse)
async def get_comps(
    address: str = Query(..., description="Target address or PLZ"),
    city: Optional[str] = Query(None),
    zip: Optional[str] = Query(None),
    rooms: Optional[int] = Query(None, ge=1, le=20),
    size: Optional[int] = Query(None, ge=10, le=1000),
    radius: Optional[int] = Query(5, ge=1, le=50)
):
    """
    Fetch comparable property listings for a given address.
    
    Scrapes ImmoScout24 and extracts structured listing data.
    """
    try:
        req = CompsRequest(
            address=address,
            city=city,
            zip=zip,
            rooms=rooms,
            size=size,
            radius=radius
        )
        
        # Build search URL
        search_url = build_immoscout_url(req)
        logger.info(f"Scraping URL: {search_url}")
        
        extractor = get_extractor()
        
        # Fetch the page
        fetch_result = await extractor.process_query(search_url)
        logger.info(f"Fetch result: {fetch_result[:200]}...")
        
        if "Error" in fetch_result or not extractor.preprocessed_content:
            return CompsResponse(
                success=False,
                comps=[],
                error=f"Failed to fetch page: {fetch_result[:200]}",
                source_url=search_url
            )
        
        # Extract listings
        extraction_result = await extractor.process_query(EXTRACTION_PROMPT)
        logger.info(f"Extraction result: {extraction_result[:500]}...")
        
        # Parse the JSON response
        try:
            # Try to extract JSON from the response
            json_str = extraction_result
            if "```json" in json_str:
                json_str = json_str.split("```json")[1].split("```")[0]
            elif "```" in json_str:
                json_str = json_str.split("```")[1].split("```")[0]
            
            raw_comps = json.loads(json_str.strip())
            
            if not isinstance(raw_comps, list):
                raw_comps = [raw_comps]
            
            # Convert to Comparable objects with distance calculation (placeholder)
            comps = []
            for i, item in enumerate(raw_comps[:20]):  # Limit to 20 results
                try:
                    comp = Comparable(
                        id=str(item.get("id", f"comp-{i}")),
                        address=str(item.get("address", "Unknown")),
                        price=float(str(item.get("price", 0)).replace(",", "").replace("€", "").strip() or 0),
                        size=float(str(item.get("size", 0)).replace(",", ".").replace("m²", "").strip() or 0),
                        rooms=float(str(item.get("rooms", 0)).replace(",", ".").strip() or 0),
                        distance=round(0.5 + (i * 0.3), 1),  # Placeholder distance
                        listingDate=item.get("listingDate", datetime.now().strftime("%Y-%m-%d")),
                        url=item.get("url")
                    )
                    if comp.price > 0:  # Only include valid listings
                        comps.append(comp)
                except Exception as e:
                    logger.warning(f"Failed to parse listing {i}: {e}")
                    continue
            
            return CompsResponse(
                success=True,
                comps=comps,
                source_url=search_url
            )
            
        except json.JSONDecodeError as e:
            logger.error(f"JSON parse error: {e}")
            return CompsResponse(
                success=False,
                comps=[],
                error=f"Failed to parse listings: {str(e)}",
                source_url=search_url
            )
            
    except Exception as e:
        logger.error(f"Scraper error: {e}", exc_info=True)
        return CompsResponse(
            success=False,
            comps=[],
            error=str(e)
        )


@app.post("/comps", response_model=CompsResponse)
async def post_comps(req: CompsRequest):
    """POST endpoint for fetching comps (same as GET but with body)."""
    return await get_comps(
        address=req.address,
        city=req.city,
        zip=req.zip,
        rooms=req.rooms,
        size=req.size,
        radius=req.radius
    )


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8502"))
    uvicorn.run(app, host="0.0.0.0", port=port)
