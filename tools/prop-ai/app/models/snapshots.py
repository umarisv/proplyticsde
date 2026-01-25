"""Snapshot data models."""

from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, Field


class SourceEventCreate(BaseModel):
    """Schema for creating a source event."""
    source_type: str = Field(..., description="Type: broker, api, opendata")
    source_name: str = Field(..., description="Name of the source")
    source_url: Optional[str] = None
    meta: dict = Field(default_factory=dict)


class SourceEvent(SourceEventCreate):
    """Source event with database ID."""
    source_event_id: int
    occurred_at: datetime


class PropertySnapshotCreate(BaseModel):
    """Schema for creating a property snapshot."""
    property_id: Optional[int] = None
    source_event_id: int
    snapshot_date: date
    property_type: Optional[str] = None
    living_area_m2: Optional[float] = None
    living_area_range: Optional[str] = None
    rooms: Optional[float] = None
    year_built: Optional[int] = None
    year_built_range: Optional[str] = None
    condition_score: Optional[int] = Field(None, ge=1, le=5)
    modernization_range: Optional[str] = None
    has_balcony: Optional[bool] = None
    has_terrace: Optional[bool] = None
    has_garden: Optional[bool] = None
    has_elevator: Optional[bool] = None
    has_parking: Optional[bool] = None
    marketing_status: Optional[str] = None
    asking_price_eur: Optional[float] = None
    price_per_sqm: Optional[float] = None
    confidence_score: int = Field(default=0, ge=0, le=100)
    data_quality: str = Field(default="unknown")
    raw_text: Optional[str] = None


class PropertySnapshot(PropertySnapshotCreate):
    """Property snapshot with database ID."""
    snapshot_id: int
    created_at: datetime


class ScrapedListing(BaseModel):
    """Raw scraped listing data before normalization."""
    url: str
    domain: str
    address_raw: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    asking_price_eur: Optional[float] = None
    living_area_m2: Optional[float] = None
    rooms: Optional[float] = None
    year_built: Optional[int] = None
    property_type: Optional[str] = None
    has_balcony: Optional[bool] = None
    has_terrace: Optional[bool] = None
    has_garden: Optional[bool] = None
    has_elevator: Optional[bool] = None
    has_parking: Optional[bool] = None
    raw_html: Optional[str] = None
    scraped_at: datetime = Field(default_factory=datetime.utcnow)
    is_complete: bool = False
    
    def calculate_confidence(self) -> int:
        """Calculate confidence score based on available fields."""
        score = 0
        weights = {
            "address_raw": 20,
            "asking_price_eur": 25,
            "living_area_m2": 20,
            "rooms": 10,
            "year_built": 10,
            "property_type": 10,
            "has_balcony": 2,
            "has_elevator": 3,
        }
        
        for field, weight in weights.items():
            if getattr(self, field, None) is not None:
                score += weight
        
        return min(100, score)
    
    def determine_data_quality(self) -> str:
        """Determine data quality based on source."""
        has_structured = bool(
            self.asking_price_eur and 
            self.living_area_m2 and 
            self.rooms
        )
        has_text = bool(self.description)
        
        if has_structured and not has_text:
            return "confirmed"
        elif has_structured and has_text:
            return "mixed"
        elif has_text:
            return "estimated"
        return "unknown"
