"""Property data models using Pydantic."""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class PropertyCreate(BaseModel):
    """Schema for creating a new property."""
    address_raw: str = Field(..., min_length=5)
    address_normalized: Optional[str] = None
    street: Optional[str] = None
    house_number: Optional[str] = None
    postal_code: Optional[str] = None
    city: Optional[str] = None
    lat: Optional[float] = None
    lon: Optional[float] = None


class Property(PropertyCreate):
    """Property with database ID."""
    property_id: int
    created_at: datetime


class PropertyLookup(BaseModel):
    """Schema for property lookup result."""
    property_id: int
    address_normalized: str
    is_new: bool = False
