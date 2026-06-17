"""
LLM service — handles Anthropic API calls with multimodal support.

Reads images from disk, encodes to base64, builds the message payload,
and parses the JSON response with a single retry on parse failure.
"""

import base64
import json
import logging
import mimetypes
import re
from pathlib import Path

import anthropic

from app.config import settings

logger = logging.getLogger(__name__)


class LLMServiceError(Exception):
    """Base exception for LLM service errors."""

    def __init__(self, error_code: str, message: str):
        self.error_code = error_code
        self.message = message
        super().__init__(message)


def _read_image_as_base64(image_path: str) -> tuple[str, str]:
    """
    Read an image file from disk and return (base64_data, media_type).

    Parameters
    ----------
    image_path : str
        Absolute path to the image file.

    Returns
    -------
    tuple[str, str]
        Base64-encoded data and its MIME type.
    """
    path = Path(image_path)
    mime_type, _ = mimetypes.guess_type(str(path))

    # Fallback mapping for common extensions
    if mime_type is None:
        ext_map = {
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".png": "image/png",
            ".webp": "image/webp",
        }
        mime_type = ext_map.get(path.suffix.lower(), "image/jpeg")

    data = path.read_bytes()
    b64 = base64.standard_b64encode(data).decode("utf-8")
    return b64, mime_type


def _strip_markdown_fences(text: str) -> str:
    """Remove markdown code fences (```json ... ```) if present."""
    text = text.strip()
    # Remove ```json or ``` at the start and ``` at the end
    text = re.sub(r"^```(?:json)?\s*\n?", "", text)
    text = re.sub(r"\n?```\s*$", "", text)
    return text.strip()


async def call_llm(prompt: str, image_paths: list[str] | None = None) -> dict:
    """
    Call the Anthropic API with a text prompt and optional images.

    Parameters
    ----------
    prompt : str
        The text prompt to send.
    image_paths : list[str] | None
        Optional list of absolute paths to images on disk.

    Returns
    -------
    dict
        Parsed JSON response from the LLM.

    Raises
    ------
    LLMServiceError
        On API call failure or JSON parse failure after retry.
    """

    client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)

    # Build content blocks: images first, then text
    content_blocks: list[dict] = []

    if image_paths:
        for img_path in image_paths:
            try:
                b64_data, media_type = _read_image_as_base64(img_path)
                content_blocks.append(
                    {
                        "type": "image",
                        "source": {
                            "type": "base64",
                            "media_type": media_type,
                            "data": b64_data,
                        },
                    }
                )
            except Exception as e:
                logger.warning(f"Failed to read image {img_path}: {e}")
                continue

    content_blocks.append({"type": "text", "text": prompt})

    messages = [{"role": "user", "content": content_blocks}]

    # --- First attempt ---
    try:
        response = client.messages.create(
            model=settings.LLM_MODEL,
            max_tokens=settings.LLM_MAX_TOKENS,
            messages=messages,
        )
    except anthropic.APIError as e:
        logger.error(f"Anthropic API error: {e}")
        raise LLMServiceError(
            error_code="LLM_API_ERROR",
            message=f"Anthropic API call failed: {str(e)}",
        )

    raw_text = response.content[0].text
    cleaned = _strip_markdown_fences(raw_text)

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        logger.warning("First LLM response was not valid JSON. Retrying...")

    # --- Retry: ask for JSON only ---
    retry_messages = messages + [
        {"role": "assistant", "content": raw_text},
        {
            "role": "user",
            "content": (
                "Your previous response was not valid JSON. "
                "Please respond with ONLY the JSON object — no markdown fences, "
                "no commentary, no explanations. Just the raw JSON."
            ),
        },
    ]

    try:
        retry_response = client.messages.create(
            model=settings.LLM_MODEL,
            max_tokens=settings.LLM_MAX_TOKENS,
            messages=retry_messages,
        )
    except anthropic.APIError as e:
        logger.error(f"Anthropic API retry error: {e}")
        raise LLMServiceError(
            error_code="LLM_API_ERROR",
            message=f"Anthropic API retry call failed: {str(e)}",
        )

    retry_text = retry_response.content[0].text
    retry_cleaned = _strip_markdown_fences(retry_text)

    try:
        return json.loads(retry_cleaned)
    except json.JSONDecodeError as e:
        logger.error(f"LLM JSON parse failed after retry: {e}")
        raise LLMServiceError(
            error_code="LLM_PARSE_ERROR",
            message="Failed to parse LLM response as valid JSON after retry.",
        )
