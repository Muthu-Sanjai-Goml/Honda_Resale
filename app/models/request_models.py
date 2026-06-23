"""
Pydantic models for request validation.
Vehicle model and fuel/transmission enums for the Indian market scope.
"""

from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field


class VehicleModel(str, Enum):
    """Supported Honda vehicle models in the Indian market."""
    HONDA_CITY = "honda_city"
    HONDA_ACTIVA = "honda_activa"


class FuelType(str, Enum):
    """Fuel types available in the Indian market."""
    PETROL = "petrol"
    DIESEL = "diesel"
    ELECTRIC = "electric"
    CNG = "cng"


class Transmission(str, Enum):
    """Transmission types."""
    MANUAL = "manual"
    AUTOMATIC = "automatic"


class ValuationRequest(BaseModel):
    """
    Schema for the vehicle valuation request body.
    
    Note: In practice, fields are received as multipart/form-data
    and validated manually in the route handler. This model serves
    as documentation and for downstream validation.
    """
    vehicle_model: VehicleModel = Field(
        ...,
        description="Honda vehicle model (honda_city or honda_activa)",
        json_schema_extra={"example": "honda_city"},
    )
    variant: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="Vehicle variant/trim level (e.g., V, VX, ZX, SV, DLX)",
        json_schema_extra={"example": "VX"},
    )
    manufacture_year: int = Field(
        ...,
        ge=2000,
        le=2026,
        description="Year of manufacture",
        json_schema_extra={"example": 2021},
    )
    registration_year: int = Field(
        ...,
        ge=2000,
        le=2026,
        description="Year of first registration",
        json_schema_extra={"example": 2021},
    )
    odometer_km: int = Field(
        ...,
        ge=0,
        le=500000,
        description="Current odometer reading in kilometres",
        json_schema_extra={"example": 35000},
    )
    location: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="City or region of the vehicle (e.g., Mumbai, Delhi, Chennai)",
        json_schema_extra={"example": "Mumbai"},
    )
    fuel_type: FuelType = Field(
        ...,
        description="Fuel type (petrol, diesel, electric, cng)",
        json_schema_extra={"example": "petrol"},
    )
    transmission: Transmission = Field(
        ...,
        description="Transmission type (manual or automatic)",
        json_schema_extra={"example": "manual"},
    )
    number_of_owners: int = Field(
        ...,
        ge=1,
        le=10,
        description="Number of previous owners",
        json_schema_extra={"example": 1},
    )
    service_history: Optional[str] = Field(
        default=None,
        max_length=2000,
        description="Free-text description of the vehicle's service history",
        json_schema_extra={
            "example": "Regular servicing at authorized Honda dealer every 10,000 km. "
                       "Last service at 32,000 km. No major repairs."
        },
    )
