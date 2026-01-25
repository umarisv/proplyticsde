"""Broker website scraper using Playwright."""

import asyncio
from datetime import datetime
from typing import Optional
from urllib.parse import urljoin, urlparse

from bs4 import BeautifulSoup
from playwright.async_api import async_playwright, Page, Browser

from app.core.config import get_settings
from app.core.logging import get_logger
from app.models.snapshots import ScrapedListing
from app.utils.rate_limit import get_rate_limiter
from app.utils.validators import (
    is_valid_url,
    is_same_domain,
    is_listing_url,
    is_excluded_url,
)
from app.utils.text_extract import (
    extract_price,
    extract_living_area,
    extract_rooms,
    extract_year_built,
    extract_address,
    extract_balcony,
    extract_terrace,
    extract_garden,
    extract_elevator,
    extract_parking,
    extract_property_type,
    clean_text,
)

logger = get_logger(__name__)


class BrokerScraper:
    """Scraper for broker websites using Playwright."""
    
    def __init__(self):
        self.settings = get_settings()
        self.rate_limiter = get_rate_limiter()
        self.browser: Optional[Browser] = None
        self.visited_urls: set[str] = set()
        self.found_listings: list[ScrapedListing] = set()
        
        # Statistics
        self.stats = {
            "pages_visited": 0,
            "listings_found": 0,
            "errors": 0,
            "skipped": 0,
        }
    
    async def start(self):
        """Start the browser."""
        playwright = await async_playwright().start()
        self.browser = await playwright.chromium.launch(
            headless=self.settings.scraper_headless
        )
        logger.info("Browser started", headless=self.settings.scraper_headless)
    
    async def stop(self):
        """Stop the browser."""
        if self.browser:
            await self.browser.close()
            logger.info("Browser stopped")
    
    async def scrape_broker_site(
        self, 
        seed_url: str,
        max_pages: int = 50
    ) -> list[ScrapedListing]:
        """
        Scrape a broker website starting from seed URL.
        
        Only crawls within the same domain.
        """
        if not is_valid_url(seed_url):
            logger.error("Invalid seed URL", url=seed_url)
            return []
        
        domain = urlparse(seed_url).netloc
        logger.info("Starting broker scrape", domain=domain, seed_url=seed_url)
        
        # Reset state
        self.visited_urls = set()
        self.found_listings = []
        self.stats = {"pages_visited": 0, "listings_found": 0, "errors": 0, "skipped": 0}
        
        # Check robots.txt
        robots_info = await self.rate_limiter.check_robots_txt(seed_url)
        if robots_info.get("crawl_delay"):
            self.rate_limiter.set_domain_delay(domain, robots_info["crawl_delay"])
        
        # URLs to visit
        urls_to_visit = [seed_url]
        
        # Create browser context
        context = await self.browser.new_context(
            user_agent=self.settings.scraper_user_agent,
            locale="de-DE",
        )
        page = await context.new_page()
        
        try:
            while urls_to_visit and self.stats["pages_visited"] < max_pages:
                url = urls_to_visit.pop(0)
                
                if url in self.visited_urls:
                    continue
                
                if not is_same_domain(url, seed_url):
                    continue
                
                if is_excluded_url(url):
                    self.stats["skipped"] += 1
                    continue
                
                if not self.rate_limiter.is_path_allowed(url, robots_info):
                    logger.debug("URL disallowed by robots.txt", url=url)
                    self.stats["skipped"] += 1
                    continue
                
                # Rate limiting
                await self.rate_limiter.wait_for_domain(url)
                
                try:
                    # Visit page
                    self.visited_urls.add(url)
                    self.stats["pages_visited"] += 1
                    
                    await page.goto(
                        url,
                        timeout=self.settings.scraper_timeout_seconds * 1000,
                        wait_until="domcontentloaded"
                    )
                    
                    # Wait for dynamic content
                    await page.wait_for_timeout(1000)
                    
                    # Get page content
                    html = await page.content()
                    
                    # Check if this is a listing page
                    if is_listing_url(url):
                        listing = await self._parse_listing_page(url, html, domain)
                        if listing:
                            self.found_listings.append(listing)
                            self.stats["listings_found"] += 1
                            logger.debug(
                                "Found listing",
                                url=url,
                                price=listing.asking_price_eur,
                                area=listing.living_area_m2
                            )
                    
                    # Find more URLs to visit
                    new_urls = self._extract_links(url, html, seed_url)
                    for new_url in new_urls:
                        if new_url not in self.visited_urls and new_url not in urls_to_visit:
                            urls_to_visit.append(new_url)
                    
                except Exception as e:
                    logger.error("Error visiting page", url=url, error=str(e))
                    self.stats["errors"] += 1
        
        finally:
            await context.close()
        
        logger.info(
            "Broker scrape completed",
            domain=domain,
            pages_visited=self.stats["pages_visited"],
            listings_found=self.stats["listings_found"],
            errors=self.stats["errors"],
            skipped=self.stats["skipped"]
        )
        
        return self.found_listings
    
    async def _parse_listing_page(
        self, 
        url: str, 
        html: str,
        domain: str
    ) -> Optional[ScrapedListing]:
        """Parse a listing page and extract property data."""
        try:
            soup = BeautifulSoup(html, "lxml")
            
            # Remove script and style tags
            for tag in soup(["script", "style", "nav", "header", "footer"]):
                tag.decompose()
            
            # Get full text content
            full_text = soup.get_text(separator=" ", strip=True)
            full_text = clean_text(full_text)
            
            # Extract structured data if available (JSON-LD, microdata)
            structured_data = self._extract_structured_data(soup)
            
            # Extract from text
            price = structured_data.get("price") or extract_price(full_text)
            area = structured_data.get("area") or extract_living_area(full_text)
            rooms = structured_data.get("rooms") or extract_rooms(full_text)
            year_built = structured_data.get("year_built") or extract_year_built(full_text)
            address = structured_data.get("address") or extract_address(full_text)
            
            # Extract features
            has_balcony = extract_balcony(full_text)
            has_terrace = extract_terrace(full_text)
            has_garden = extract_garden(full_text)
            has_elevator = extract_elevator(full_text)
            has_parking = extract_parking(full_text)
            property_type = extract_property_type(full_text)
            
            # Get title and description
            title = soup.find("h1")
            title_text = title.get_text(strip=True) if title else None
            
            # Find main content area for description
            description = self._extract_description(soup)
            
            # Create listing
            listing = ScrapedListing(
                url=url,
                domain=domain,
                address_raw=address,
                title=title_text,
                description=description,
                asking_price_eur=price,
                living_area_m2=area,
                rooms=rooms,
                year_built=year_built,
                property_type=property_type,
                has_balcony=has_balcony,
                has_terrace=has_terrace,
                has_garden=has_garden,
                has_elevator=has_elevator,
                has_parking=has_parking,
                raw_html=html[:50000],  # Limit stored HTML
                scraped_at=datetime.utcnow(),
                is_complete=bool(address and price),
            )
            
            return listing
            
        except Exception as e:
            logger.error("Error parsing listing", url=url, error=str(e))
            return None
    
    def _extract_structured_data(self, soup: BeautifulSoup) -> dict:
        """Extract structured data from JSON-LD or microdata."""
        import json
        
        result = {}
        
        # Try JSON-LD
        for script in soup.find_all("script", type="application/ld+json"):
            try:
                data = json.loads(script.string)
                if isinstance(data, dict):
                    if data.get("@type") in ["Product", "RealEstateListing", "Apartment", "House"]:
                        result["price"] = data.get("offers", {}).get("price")
                        result["address"] = data.get("address", {}).get("streetAddress")
                        if "floorSize" in data:
                            result["area"] = data["floorSize"].get("value")
            except (json.JSONDecodeError, AttributeError):
                continue
        
        return result
    
    def _extract_description(self, soup: BeautifulSoup) -> Optional[str]:
        """Extract main description text."""
        # Common description containers
        description_selectors = [
            "div.description",
            "div.expose-description",
            "div.object-description",
            "article",
            "main",
        ]
        
        for selector in description_selectors:
            element = soup.select_one(selector)
            if element:
                text = element.get_text(separator=" ", strip=True)
                if len(text) > 100:  # Minimum meaningful description
                    return clean_text(text)[:5000]
        
        return None
    
    def _extract_links(self, current_url: str, html: str, seed_url: str) -> list[str]:
        """Extract valid links from page."""
        soup = BeautifulSoup(html, "lxml")
        links = []
        
        for a in soup.find_all("a", href=True):
            href = a["href"]
            
            # Make absolute URL
            full_url = urljoin(current_url, href)
            
            # Clean URL (remove fragments)
            parsed = urlparse(full_url)
            clean_url = f"{parsed.scheme}://{parsed.netloc}{parsed.path}"
            if parsed.query:
                clean_url += f"?{parsed.query}"
            
            # Validate
            if is_valid_url(clean_url) and is_same_domain(clean_url, seed_url):
                links.append(clean_url)
        
        return links
    
    def get_stats(self) -> dict:
        """Get scraping statistics."""
        return self.stats.copy()


async def scrape_brokers_from_file(
    seed_file: str,
    max_pages_per_site: int = 50
) -> list[ScrapedListing]:
    """
    Scrape multiple broker sites from a seed file.
    
    Each line in the file should be a URL.
    """
    all_listings = []
    
    try:
        with open(seed_file, "r") as f:
            urls = [line.strip() for line in f if line.strip() and not line.startswith("#")]
    except FileNotFoundError:
        logger.error("Seed file not found", path=seed_file)
        return []
    
    if not urls:
        logger.warning("No URLs found in seed file", path=seed_file)
        return []
    
    logger.info("Starting broker scrape job", num_urls=len(urls))
    
    scraper = BrokerScraper()
    await scraper.start()
    
    try:
        for url in urls:
            try:
                listings = await scraper.scrape_broker_site(
                    url, 
                    max_pages=max_pages_per_site
                )
                all_listings.extend(listings)
            except Exception as e:
                logger.error("Failed to scrape broker", url=url, error=str(e))
    
    finally:
        await scraper.stop()
    
    logger.info(
        "Broker scrape job completed",
        total_listings=len(all_listings),
        complete_listings=sum(1 for l in all_listings if l.is_complete)
    )
    
    return all_listings
