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

from fastapi import APIRouter, File, Form, Request, UploadFile
from fastapi.responses import JSONResponse

from app.config import settings
from app.models.request_models import FuelType, Transmission, VehicleModel
from app.models.response_models import ErrorResponse, ValuationResponse
from app.prompts.valuation_prompt import build_valuation_prompt
from app.services.llm_service import LLMServiceError, call_llm

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
        "Submit vehicle details and optional photos to receive an AI-powered "
        "resale valuation. Images are validated for type (jpg/png/webp) and "
        "size (max 5 MB each, max 10 images)."
    ),
)
async def create_valuation(
    request: Request,
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
    service_history: Optional[str] = Form(
        default=None,
        description="Free-text service history (optional)",
        json_schema_extra={
            "example": "Regular service at Honda dealer every 10,000 km."
        },
    ),
    images: Optional[list[UploadFile]] = File(
        default=None,
        description="Vehicle photos (optional, max 10, jpg/png/webp, max 5 MB each)",
    ),
):
    """
    End-to-end valuation flow:
    1. Validate inputs
    2. Validate & save images
    3. Build prompt
    4. Call Anthropic LLM
    5. Parse & persist result
    """

    # ── Manually extract real image files from the multipart form ──
    # Swagger UI sends empty-string parts for optional file fields,
    # so we read from the raw request to filter out empties.
    form = await request.form()
    image_files: list[UploadFile] = []
    for key in form:
        if key == "images":
            value = form.getlist(key)
            for item in value:
                if isinstance(item, UploadFile) and item.filename:
                    image_files.append(item)

    # ── Validate image count ──
    if len(image_files) > settings.MAX_IMAGE_COUNT:
        return JSONResponse(
            status_code=400,
            content=ErrorResponse(
                error_code="TOO_MANY_IMAGES",
                message=f"Maximum {settings.MAX_IMAGE_COUNT} images allowed, got {len(image_files)}.",
            ).model_dump(),
        )

    # ── Validate each image (type + size) ──
    for img in image_files:
        # Check content type
        ext = Path(img.filename).suffix.lower() if img.filename else ""
        if ext not in settings.ALLOWED_EXTENSIONS:
            return JSONResponse(
                status_code=400,
                content=ErrorResponse(
                    error_code="INVALID_FILE_TYPE",
                    message=(
                        f"Unsupported image format '{ext}' for file '{img.filename}'. "
                        f"Allowed: {', '.join(settings.ALLOWED_EXTENSIONS)}"
                    ),
                ).model_dump(),
            )

        # Check size (read content to verify)
        contents = await img.read()
        if len(contents) > settings.MAX_IMAGE_SIZE_BYTES:
            return JSONResponse(
                status_code=400,
                content=ErrorResponse(
                    error_code="FILE_TOO_LARGE",
                    message=(
                        f"Image '{img.filename}' is {len(contents) / 1024 / 1024:.1f} MB. "
                        f"Maximum allowed is {settings.MAX_IMAGE_SIZE_BYTES / 1024 / 1024:.0f} MB."
                    ),
                ).model_dump(),
            )
        # Reset seek position for later reads
        await img.seek(0)

    # ── Generate valuation ID and save images to disk ──
    valuation_id = str(uuid.uuid4())
    image_dir = Path(settings.IMAGES_DIR) / valuation_id
    image_dir.mkdir(parents=True, exist_ok=True)

    saved_image_paths: list[str] = []
    saved_image_names: list[str] = []

    for img in image_files:
        safe_name = img.filename.replace(" ", "_") if img.filename else f"image_{uuid.uuid4().hex[:8]}.jpg"
        dest = image_dir / safe_name
        content = await img.read()
        dest.write_bytes(content)
        saved_image_paths.append(str(dest))
        saved_image_names.append(safe_name)
        logger.info(f"Saved image: {dest} ({len(content)} bytes)")

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
        service_history=service_history,
        image_count=len(image_files),
    )

    # ── Call LLM ──
    try:
        llm_result = await call_llm(prompt=prompt, image_paths=saved_image_paths or None)
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
