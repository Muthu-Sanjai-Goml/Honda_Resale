"""
Application configuration loaded from environment variables.
Uses pydantic-settings for validation and .env file support.
"""

import os
import tempfile
from pathlib import Path
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Load .env file from the project root
load_dotenv(dotenv_path=Path(__file__).resolve().parent.parent / ".env")


class Settings(BaseSettings):
    """Application settings with sensible defaults for local development."""

    # --- API Keys ---
    ANTHROPIC_API_KEY: str = ""

    # --- LLM Config ---
    LLM_MODEL: str = "claude-sonnet-4-6"
    LLM_MAX_TOKENS: int = 2000

    # --- Storage Paths (cross-platform) ---
    BASE_STORAGE_DIR: str = os.path.join(tempfile.gettempdir(), "honda-valuation")
    IMAGES_DIR: str = os.path.join(tempfile.gettempdir(), "honda-valuation", "images")
    RESULTS_FILE: str = os.path.join(
        tempfile.gettempdir(), "honda-valuation", "results.json"
    )

    # --- Image Validation ---
    MAX_IMAGE_SIZE_BYTES: int = 5 * 1024 * 1024  # 5 MB
    MAX_IMAGE_COUNT: int = 10
    ALLOWED_IMAGE_TYPES: set = {"image/jpeg", "image/png", "image/webp"}
    ALLOWED_EXTENSIONS: set = {".jpg", ".jpeg", ".png", ".webp"}

    # --- App Metadata ---
    APP_NAME: str = "Honda Resale Valuation API"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()

# Ensure storage directories exist on import
Path(settings.BASE_STORAGE_DIR).mkdir(parents=True, exist_ok=True)
Path(settings.IMAGES_DIR).mkdir(parents=True, exist_ok=True)

# Initialise results.json if it doesn't exist
results_path = Path(settings.RESULTS_FILE)
if not results_path.exists():
    results_path.write_text("{}", encoding="utf-8")
