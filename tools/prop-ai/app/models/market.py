"""Market and feature data models."""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class SnapshotFeaturesCreate(BaseModel):
    """Schema for creating snapshot features."""
    snapshot_id: int
    microzone_id: Optional[str] = None
    distance_to_center_km: Optional[float] = None
    transit_score: Optional[int] = Field(None, ge=0, le=100)
    poi_counts_json: dict = Field(default_factory=dict)
    noise_proxy_score: Optional[int] = Field(None, ge=0, le=100)
    flood_risk_flag: Optional[bool] = None
    green_space_score: Optional[int] = Field(None, ge=0, le=100)


class SnapshotFeatures(SnapshotFeaturesCreate):
    """Snapshot features with database ID."""
    feature_id: int
    created_at: datetime


class POICounts(BaseModel):
    """Point of Interest counts."""
    public_transport: int = 0
    schools: int = 0
    kindergartens: int = 0
    supermarkets: int = 0
    restaurants: int = 0
    parks: int = 0
    doctors: int = 0
    pharmacies: int = 0
    banks: int = 0
    
    def to_dict(self) -> dict:
        return self.model_dump()


class OverpassResult(BaseModel):
    """Result from Overpass API query."""
    lat: float
    lon: float
    poi_counts: POICounts
    transit_score: int
    noise_proxy_score: int
    distance_to_center_km: float
    nearby_highways: list[str] = Field(default_factory=list)
