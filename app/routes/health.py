"""
Health check endpoint.
Returns service status, version, environment, and timestamp.
"""

from datetime import datetime, timezone

from fastapi import APIRouter

from app.config import settings
from app.models.response_models import HealthResponse

router = APIRouter(tags=["Health"])


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Health Check",
    description="Returns the current service status, API version, environment, and server timestamp.",
)
async def health_check() -> HealthResponse:
    """Service health probe."""
    return HealthResponse(
        status="healthy",
        version=settings.APP_VERSION,
        environment=settings.ENVIRONMENT,
        timestamp=datetime.now(timezone.utc),
    )
