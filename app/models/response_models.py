"""
Pydantic models for API responses.
Covers the full valuation result, error responses, and health check.
"""

from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


# ──────────────────────────────────────────────
# Valuation response sub-models
# ──────────────────────────────────────────────

class EstimatedResaleValue(BaseModel):
    """Price range estimate in Indian Rupees."""
    currency: str = Field(
        default="INR",
        description="Currency code",
        json_schema_extra={"example": "INR"},
    )
    low: float = Field(
        ...,
        description="Lower bound of estimated resale value",
        json_schema_extra={"example": 650000.0},
    )
    high: float = Field(
        ...,
        description="Upper bound of estimated resale value",
        json_schema_extra={"example": 820000.0},
    )
    point_estimate: float = Field(
        ...,
        description="Best single-point estimate of resale value",
        json_schema_extra={"example": 735000.0},
    )


class DepreciationAnalysis(BaseModel):
    """Breakdown of the depreciation logic applied."""
    base_value_new: Optional[float] = Field(
        default=None,
        description="Ex-showroom price when new (INR)",
        json_schema_extra={"example": 1200000.0},
    )
    age_years: int = Field(
        ...,
        description="Vehicle age in years",
        json_schema_extra={"example": 4},
    )
    odometer_assessment: str = Field(
        ...,
        description="Odometer usage category: below average / average / above average",
        json_schema_extra={"example": "average"},
    )
    applied_depreciation_percent: float = Field(
        ...,
        description="Total depreciation percentage applied",
        json_schema_extra={"example": 42.5},
    )


class ConditionAssessment(BaseModel):
    """Visual and maintenance condition of the vehicle."""
    exterior_condition: str = Field(
        ...,
        description="Exterior condition rating: excellent / good / fair / poor / unable to assess",
        json_schema_extra={"example": "good"},
    )
    interior_condition: str = Field(
        ...,
        description="Interior condition rating: excellent / good / fair / poor / unable to assess",
        json_schema_extra={"example": "good"},
    )
    notable_issues: List[str] = Field(
        default_factory=list,
        description="List of notable issues found",
        json_schema_extra={"example": ["Minor scratch on rear bumper", "Slight tyre wear"]},
    )
    service_history_summary: str = Field(
        ...,
        description="Summary assessment of the service history",
        json_schema_extra={"example": "Well-maintained with regular servicing at authorized center."},
    )


# ──────────────────────────────────────────────
# Top-level valuation response
# ──────────────────────────────────────────────

class ValuationResponse(BaseModel):
    """Complete valuation result returned by the API."""
    valuation_id: str = Field(
        ...,
        description="Unique identifier for this valuation",
        json_schema_extra={"example": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"},
    )
    vehicle_model: str = Field(
        ...,
        description="Vehicle model evaluated",
        json_schema_extra={"example": "honda_city"},
    )
    variant: str = Field(
        ...,
        description="Vehicle variant/trim",
        json_schema_extra={"example": "VX"},
    )
    manufacture_year: int = Field(
        ...,
        description="Year of manufacture",
        json_schema_extra={"example": 2021},
    )
    odometer_km: int = Field(
        ...,
        description="Odometer reading in km",
        json_schema_extra={"example": 35000},
    )
    estimated_resale_value: EstimatedResaleValue
    confidence_score: float = Field(
        ...,
        ge=0,
        le=100,
        description="Confidence score (0-100)",
        json_schema_extra={"example": 78.5},
    )
    confidence_reasoning: str = Field(
        ...,
        description="Explanation of the confidence score",
        json_schema_extra={
            "example": "Good data coverage with photos and service history. Minor gap in variant pricing data."
        },
    )
    depreciation_analysis: DepreciationAnalysis
    condition_assessment: ConditionAssessment
    fallback_flags: List[str] = Field(
        default_factory=list,
        description="Flags indicating data gaps or quality issues",
        json_schema_extra={"example": ["no_service_history"]},
    )
    images_saved: List[str] = Field(
        default_factory=list,
        description="List of saved image filenames",
        json_schema_extra={"example": ["front.jpg", "rear.jpg"]},
    )
    created_at: datetime = Field(
        ...,
        description="Timestamp when the valuation was created",
        json_schema_extra={"example": "2026-06-17T12:00:00"},
    )


# ──────────────────────────────────────────────
# Error & Health responses
# ──────────────────────────────────────────────

class ErrorResponse(BaseModel):
    """Structured error response."""
    error_code: str = Field(
        ...,
        description="Machine-readable error code",
        json_schema_extra={"example": "VALUATION_NOT_FOUND"},
    )
    message: str = Field(
        ...,
        description="Human-readable error message",
        json_schema_extra={"example": "No valuation found with the given ID."},
    )


class HealthResponse(BaseModel):
    """Health-check response."""
    status: str = Field(
        ...,
        description="Service status",
        json_schema_extra={"example": "healthy"},
    )
    version: str = Field(
        ...,
        description="API version",
        json_schema_extra={"example": "1.0.0"},
    )
    environment: str = Field(
        ...,
        description="Running environment",
        json_schema_extra={"example": "development"},
    )
    timestamp: datetime = Field(
        ...,
        description="Current server timestamp",
        json_schema_extra={"example": "2026-06-17T12:00:00"},
    )
