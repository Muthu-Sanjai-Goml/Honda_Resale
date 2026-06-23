"""
Valuation endpoints — POST /valuation and GET /valuation/{valuation_id}.

The POST handler manually extracts images from the raw multipart form
to work around Swagger UI sending empty strings for optional file fields
(which would cause 422 errors with FastAPI's native UploadFile typing).
"""

import json
import logging
import os
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, Form
from fastapi.responses import JSONResponse

from app.config import settings
from app.models.request_models import FuelType, Transmission, VehicleModel
from app.models.response_models import ErrorResponse, ValuationResponse
from app.prompts.valuation_prompt import build_valuation_prompt
from app.services.llm_service import LLMServiceError, call_llm, validate_b64_image_data

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Valuation"])


# ──────────────────────────────────────────────
# Helpers
# ──────────────────────────────────────────────

def _load_results() -> dict:
    """Load the results JSON file."""
    results_path = Path(settings.RESULTS_FILE)
    if not results_path.exists():
        return {}
    return json.loads(results_path.read_text(encoding="utf-8"))


def _save_results(data: dict) -> None:
    """Save the results JSON file."""
    results_path = Path(settings.RESULTS_FILE)
    results_path.write_text(json.dumps(data, indent=2, default=str), encoding="utf-8")


# ──────────────────────────────────────────────
# POST /valuation
# ──────────────────────────────────────────────

@router.post(
    "/valuation",
    response_model=ValuationResponse,
    responses={
        400: {"model": ErrorResponse, "description": "Validation error"},
        500: {"model": ErrorResponse, "description": "LLM or server error"},
    },
    summary="Submit Vehicle for Valuation",
    description=(
        "Submit vehicle details and optional base64-encoded photos to receive an "
        "AI-powered resale valuation. Images must be passed as base64 strings from "
        "the frontend, not as raw file uploads."
    ),
    openapi_extra={
        "requestBody": {
            "content": {
                "multipart/form-data": {
                    "schema": {
                        "type": "object",
                        "properties": {
                            "vehicle_model": {"type": "string", "example": "honda_city"},
                            "variant": {"type": "string", "example": "V"},
                            "manufacture_year": {"type": "integer", "example": 2022},
                            "registration_year": {"type": "integer", "example": 2022},
                            "odometer_km": {"type": "integer", "example": 55000},
                            "location": {"type": "string", "example": "Coimbatore"},
                            "fuel_type": {"type": "string", "example": "petrol"},
                            "transmission": {"type": "string", "example": "manual"},
                            "number_of_owners": {"type": "integer", "example": 1},
                            "service_history": {"type": "string", "example": "The service history is clean and regularly serviced."},
                            "images": {
                                "type": "array",
                                "items": {"type": "string"},
                                "example": [
                                    "data:image/jpeg;base64,/9j/4AAQSkZJRgABA..."
                                ]
                            }
                        }
                    },
                    "example": {
                        "vehicle_model": "honda_city",
                        "variant": "V",
                        "manufacture_year": 2022,
                        "registration_year": 2022,
                        "odometer_km": 55000,
                        "location": "Coimbatore",
                        "fuel_type": "petrol",
                        "transmission": "manual",
                        "number_of_owners": 1,
                        "service_history": "The service history is clean and regularly serviced.",
                        "images": [
                            "data:image/jpeg;base64,/9j/4AAQSkZJRgABA..."
                        ]
                    }
                }
            }
        }
    },
)
async def create_valuation(
    vehicle_model: VehicleModel = Form(
        ...,
        description="Honda vehicle model",
        json_schema_extra={"example": "honda_city"},
    ),
    variant: str = Form(
        ...,
        description="Vehicle variant/trim (e.g., VX, ZX, DLX)",
        json_schema_extra={"example": "VX"},
    ),
    manufacture_year: int = Form(
        ...,
        description="Year of manufacture (2000-2026)",
        json_schema_extra={"example": 2021},
    ),
    registration_year: int = Form(
        ...,
        description="Year of first registration (2000-2026)",
        json_schema_extra={"example": 2021},
    ),
    odometer_km: int = Form(
        ...,
        description="Current odometer reading in km",
        json_schema_extra={"example": 35000},
    ),
    location: str = Form(
        ...,
        description="City/region (e.g., Mumbai, Delhi)",
        json_schema_extra={"example": "Mumbai"},
    ),
    fuel_type: FuelType = Form(
        ...,
        description="Fuel type",
        json_schema_extra={"example": "petrol"},
    ),
    transmission: Transmission = Form(
        ...,
        description="Transmission type",
        json_schema_extra={"example": "manual"},
    ),
    number_of_owners: int = Form(
        ..., 
        ge=1,
        le=10,
        description="Number of previous owners",
        json_schema_extra={"example": 1},
    ),
    service_history: Optional[str] = Form(
        default=None,
        description="Free-text service history (optional)",
        json_schema_extra={
            "example": "Regular service at Honda dealer every 10,000 km."
        },
    ),
    images: Optional[list[str]] = Form(
        default=None,
        description="Base64-encoded vehicle photos from frontend (optional, max 10, max 5 MB each)",
        json_schema_extra={
            "example": [
                "data:image/jpeg;base64,/9j/4AAQSkZJRgABA..."
            ]
        },
    ),
):
    """
    End-to-end valuation flow:
    1. Validate inputs
    2. Validate & save images
    3. Build prompt
    4. Call AWS Bedrock LLM
    5. Parse & persist result
    """

    # ── Validate encoded images from the frontend ──
    image_strings: list[str] = [img.strip() for img in images if img and img.strip()] if images else []

    if len(image_strings) > settings.MAX_IMAGE_COUNT:
        return JSONResponse(
            status_code=400,
            content=ErrorResponse(
                error_code="TOO_MANY_IMAGES",
                message=f"Maximum {settings.MAX_IMAGE_COUNT} images allowed, got {len(image_strings)}.",
            ).model_dump(),
        )

    for index, image_b64 in enumerate(image_strings, start=1):
        try:
            decoded_bytes, image_format = validate_b64_image_data(image_b64)
        except ValueError as e:
            return JSONResponse(
                status_code=400,
                content=ErrorResponse(
                    error_code="INVALID_IMAGE_DATA",
                    message=f"Image #{index} is invalid: {str(e)}",
                ).model_dump(),
            )

        if len(decoded_bytes) > settings.MAX_IMAGE_SIZE_BYTES:
            return JSONResponse(
                status_code=400,
                content=ErrorResponse(
                    error_code="FILE_TOO_LARGE",
                    message=(
                        f"Image #{index} is {len(decoded_bytes) / 1024 / 1024:.1f} MB. "
                        f"Maximum allowed is {settings.MAX_IMAGE_SIZE_BYTES / 1024 / 1024:.0f} MB."
                    ),
                ).model_dump(),
            )

    valuation_id = str(uuid.uuid4())
    saved_image_names: list[str] = [f"image_{i+1}.jpg" for i in range(len(image_strings))]

    # ── Build prompt ──
    prompt = build_valuation_prompt(
        vehicle_model=vehicle_model.value,
        variant=variant,
        manufacture_year=manufacture_year,
        registration_year=registration_year,
        odometer_km=odometer_km,
        location=location,
        fuel_type=fuel_type,
        transmission=transmission,
        number_of_owners=number_of_owners,
        service_history=service_history,
        image_count=len(image_strings),
    )

    # ── Call LLM ──
    try:
        llm_result = await call_llm(prompt=prompt, image_b64_list=image_strings or None)
    except LLMServiceError as e:
        return JSONResponse(
            status_code=500,
            content=ErrorResponse(
                error_code=e.error_code,
                message=e.message,
            ).model_dump(),
        )

    # ── Build response ──
    now = datetime.now(timezone.utc)

    try:
        response = ValuationResponse(
            valuation_id=valuation_id,
            vehicle_model=vehicle_model.value,
            variant=variant,
            manufacture_year=manufacture_year,
            odometer_km=odometer_km,
            number_of_owners=number_of_owners,
            estimated_resale_value=llm_result.get("estimated_resale_value", {}),
            confidence_score=llm_result.get("confidence_score", 0),
            confidence_reasoning=llm_result.get("confidence_reasoning", ""),
            depreciation_analysis=llm_result.get("depreciation_analysis", {}),
            condition_assessment=llm_result.get("condition_assessment", {}),
            fallback_flags=llm_result.get("fallback_flags", []),
            images_saved=saved_image_names,
            created_at=now,
        )
    except Exception as e:
        logger.error(f"Failed to build ValuationResponse from LLM output: {e}")
        return JSONResponse(
            status_code=500,
            content=ErrorResponse(
                error_code="LLM_PARSE_ERROR",
                message=f"LLM returned valid JSON but it did not match the expected schema: {str(e)}",
            ).model_dump(),
        )

    # ── Persist result ──
    results = _load_results()
    results[valuation_id] = response.model_dump(mode="json")
    _save_results(results)

    logger.info(f"Valuation {valuation_id} completed successfully.")
    return response


# ──────────────────────────────────────────────
# GET /valuation/{valuation_id}
# ──────────────────────────────────────────────

@router.get(
    "/valuation/{valuation_id}",
    response_model=ValuationResponse,
    responses={
        404: {"model": ErrorResponse, "description": "Valuation not found"},
    },
    summary="Retrieve a Stored Valuation",
    description="Look up a previously computed valuation by its unique ID.",
)
async def get_valuation(valuation_id: str):
    """Retrieve a stored valuation result by ID."""
    results = _load_results()

    if valuation_id not in results:
        return JSONResponse(
            status_code=404,
            content=ErrorResponse(
                error_code="VALUATION_NOT_FOUND",
                message=f"No valuation found with ID '{valuation_id}'.",
            ).model_dump(),
        )

    return results[valuation_id]
