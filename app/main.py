"""
FastAPI application entry point.

Registers routers, CORS middleware, and request logging middleware.
"""

import logging
import time
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routes import health, valuation

# ──────────────────────────────────────────────
# Logging
# ──────────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s │ %(levelname)-7s │ %(name)s │ %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("honda_valuation")


# ──────────────────────────────────────────────
# Lifespan (startup / shutdown)
# ──────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler for startup/shutdown events."""
    logger.info("═" * 50)
    logger.info(f"  {settings.APP_NAME} v{settings.APP_VERSION}")
    logger.info(f"  Environment : {settings.ENVIRONMENT}")
    logger.info(f"  AWS Region  : {settings.AWS_REGION}")
    logger.info(f"  Bedrock Model: {settings.BEDROCK_MODEL_ID}")
    logger.info(f"  Storage     : {settings.BASE_STORAGE_DIR}")

    aws_key_set = bool(settings.AWS_ACCESS_KEY_ID and settings.AWS_ACCESS_KEY_ID != "your_aws_access_key_here")
    logger.info(f"  AWS Creds   : {'✓ configured' if aws_key_set else '⚠ using default credential chain'}")
    logger.info("═" * 50)

    yield

    logger.info("Shutting down Honda Valuation API.")


# ──────────────────────────────────────────────
# App Instance
# ──────────────────────────────────────────────

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=(
        "AI-powered resale valuation system for Honda vehicles in the Indian market. "
        "Submit vehicle details and photos to receive a structured valuation with "
        "confidence scoring, depreciation analysis, and condition assessment."
    ),
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)


# ──────────────────────────────────────────────
# Middleware
# ──────────────────────────────────────────────

# CORS — allow all origins for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log method, path, status code, and response time for every request."""
    start = time.perf_counter()
    response = await call_next(request)
    elapsed_ms = (time.perf_counter() - start) * 1000.0

    logger.info(
        f"{request.method} {request.url.path} → {response.status_code} ({elapsed_ms:.1f} ms)"
    )
    return response


# ──────────────────────────────────────────────
# Routers
# ──────────────────────────────────────────────

app.include_router(health.router)
app.include_router(valuation.router)
