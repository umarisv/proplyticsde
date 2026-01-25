"""Model output data models."""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class ModelOutputCreate(BaseModel):
    """Schema for creating a model output."""
    snapshot_id: int
    model_version: str
    predicted_market_value_eur: Optional[float] = None
    predicted_rent_eur_m2: Optional[float] = None
    deal_score: Optional[int] = Field(None, ge=0, le=100)
    risk_score: Optional[int] = Field(None, ge=0, le=100)
    explanation_json: dict = Field(default_factory=dict)


class ModelOutput(ModelOutputCreate):
    """Model output with database ID."""
    model_output_id: int
    created_at: datetime


class PricePrediction(BaseModel):
    """Price prediction result."""
    market_value_eur: float
    rent_per_sqm_eur: float
    confidence: float = Field(ge=0, le=1)
    factors: dict = Field(default_factory=dict)


class RiskAssessment(BaseModel):
    """Risk assessment result."""
    overall_score: int = Field(ge=0, le=100)
    risk_level: str  # "low", "medium", "high", "very_high"
    factors: list[dict] = Field(default_factory=list)
    recommendations: list[str] = Field(default_factory=list)
