"""Rate limiting utilities for web scraping."""

import asyncio
import time
from collections import defaultdict
from typing import Optional
from urllib.parse import urlparse
import httpx

from app.core.config import get_settings
from app.core.logging import get_logger

logger = get_logger(__name__)


class RateLimiter:
    """Per-domain rate limiter with robots.txt support."""
    
    def __init__(self):
        self.settings = get_settings()
        self._last_request: dict[str, float] = defaultdict(float)
        self._request_counts: dict[str, list[float]] = defaultdict(list)
        self._domain_delays: dict[str, float] = {}
        self._robots_cache: dict[str, dict] = {}
    
    def get_domain(self, url: str) -> str:
        """Extract domain from URL."""
        parsed = urlparse(url)
        return parsed.netloc.lower()
    
    def get_delay(self, domain: str) -> float:
        """Get delay for a domain (from robots.txt or default)."""
        if domain in self._domain_delays:
            return self._domain_delays[domain]
        return self.settings.scraper_default_delay_seconds
    
    def set_domain_delay(self, domain: str, delay: float):
        """Set custom delay for a domain."""
        self._domain_delays[domain] = delay
        logger.debug("Set delay for domain", domain=domain, delay=delay)
    
    async def check_robots_txt(self, url: str) -> dict:
        """Fetch and parse robots.txt for a domain."""
        domain = self.get_domain(url)
        
        if domain in self._robots_cache:
            return self._robots_cache[domain]
        
        parsed = urlparse(url)
        robots_url = f"{parsed.scheme}://{parsed.netloc}/robots.txt"
        
        result = {
            "allowed": True,
            "crawl_delay": None,
            "disallow": [],
        }
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    robots_url,
                    timeout=10,
                    follow_redirects=True,
                    headers={"User-Agent": self.settings.scraper_user_agent}
                )
                
                if response.status_code == 200:
                    result = self._parse_robots(response.text)
                    
        except Exception as e:
            logger.debug("Failed to fetch robots.txt", domain=domain, error=str(e))
        
        self._robots_cache[domain] = result
        return result
    
    def _parse_robots(self, content: str) -> dict:
        """Parse robots.txt content."""
        result = {
            "allowed": True,
            "crawl_delay": None,
            "disallow": [],
        }
        
        current_agent = None
        lines = content.split("\n")
        
        for line in lines:
            line = line.strip().lower()
            
            if line.startswith("user-agent:"):
                agent = line.split(":", 1)[1].strip()
                if agent == "*" or "propai" in agent:
                    current_agent = agent
            
            elif current_agent and line.startswith("disallow:"):
                path = line.split(":", 1)[1].strip()
                if path:
                    result["disallow"].append(path)
            
            elif current_agent and line.startswith("crawl-delay:"):
                try:
                    delay = float(line.split(":", 1)[1].strip())
                    result["crawl_delay"] = delay
                except ValueError:
                    pass
        
        return result
    
    def is_path_allowed(self, url: str, robots_info: dict) -> bool:
        """Check if a path is allowed based on robots.txt."""
        parsed = urlparse(url)
        path = parsed.path.lower()
        
        for disallowed in robots_info.get("disallow", []):
            if path.startswith(disallowed):
                return False
        
        return True
    
    async def wait_for_domain(self, url: str):
        """Wait for rate limit before making a request to domain."""
        domain = self.get_domain(url)
        delay = self.get_delay(domain)
        
        # Check per-minute limit
        now = time.time()
        minute_ago = now - 60
        
        # Clean old requests
        self._request_counts[domain] = [
            t for t in self._request_counts[domain] if t > minute_ago
        ]
        
        # Check if we're at the limit
        if len(self._request_counts[domain]) >= self.settings.scraper_max_requests_per_minute:
            wait_time = self._request_counts[domain][0] + 60 - now
            if wait_time > 0:
                logger.debug(
                    "Rate limit reached, waiting",
                    domain=domain,
                    wait_seconds=wait_time
                )
                await asyncio.sleep(wait_time)
        
        # Check time since last request
        time_since_last = now - self._last_request[domain]
        if time_since_last < delay:
            wait_time = delay - time_since_last
            await asyncio.sleep(wait_time)
        
        # Record this request
        self._last_request[domain] = time.time()
        self._request_counts[domain].append(time.time())
    
    def record_request(self, url: str):
        """Record a request (for sync usage)."""
        domain = self.get_domain(url)
        now = time.time()
        self._last_request[domain] = now
        self._request_counts[domain].append(now)


# Global rate limiter instance
_rate_limiter: Optional[RateLimiter] = None


def get_rate_limiter() -> RateLimiter:
    """Get or create the global rate limiter."""
    global _rate_limiter
    if _rate_limiter is None:
        _rate_limiter = RateLimiter()
    return _rate_limiter
