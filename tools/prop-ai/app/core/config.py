"""Configuration management using pydantic-settings."""

import os
from functools import lru_cache
from typing import Optional

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )
    
    # Database - Supabase PostgreSQL
    database_url: str = Field(
        default="postgresql://postgres:postgres@localhost:5432/postgres",
        description="Supabase PostgreSQL connection string"
    )
    
    # Supabase API (optional - for direct API access)
    supabase_url: Optional[str] = Field(
        default=None,
        description="Supabase project URL"
    )
    supabase_key: Optional[str] = Field(
        default=None,
        description="Supabase service role key"
    )
    
    # Table prefix to avoid conflicts with existing tables
    table_prefix: str = Field(
        default="propai_",
        description="Prefix for all PropAI tables in Supabase"
    )
    
    # Scraping
    scraper_user_agent: str = Field(
        default="PropAI-Bot/1.0 (Research; +https://proplytics.de/bot)",
        description="User agent for web requests"
    )
    scraper_default_delay_seconds: float = Field(
        default=1.0,
        description="Default delay between requests per domain"
    )
    scraper_max_requests_per_minute: int = Field(
        default=30,
        description="Maximum requests per minute per domain"
    )
    scraper_timeout_seconds: int = Field(
        default=30,
        description="Request timeout in seconds"
    )
    scraper_headless: bool = Field(
        default=True,
        description="Run browser in headless mode"
    )
    
    # Overpass API
    overpass_api_url: str = Field(
        default="https://overpass-api.de/api/interpreter",
        description="Overpass API endpoint"
    )
    overpass_timeout_seconds: int = Field(
        default=60,
        description="Overpass API timeout"
    )
    
    # Default center for distance calculations (Koelner Dom)
    default_center_lat: float = Field(default=50.9413)
    default_center_lon: float = Field(default=6.9583)
    
    # Logging
    log_level: str = Field(default="INFO")
    log_format: str = Field(default="json")  # "json" or "text"
    
    # API Server
    api_host: str = Field(default="0.0.0.0")
    api_port: int = Field(default=8503)
    
    # CORS
    cors_origins: str = Field(
        default="http://localhost:3000,https://dashboard.proplytics.de",
        description="Comma-separated list of allowed CORS origins"
    )


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
