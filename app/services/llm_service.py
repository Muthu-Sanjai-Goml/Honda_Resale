"""
LLM service — handles AWS Bedrock API calls with multimodal support.

Uses boto3 to invoke the Bedrock Runtime (Anthropic Claude on Bedrock).
Reads images from disk, encodes to base64, builds the message payload,
and parses the JSON response with a single retry on parse failure.
"""

import base64
import binascii
import json
import logging
import mimetypes
import re
from pathlib import Path

import boto3
from botocore.exceptions import ClientError, BotoCoreError

from app.config import settings

logger = logging.getLogger(__name__)


class LLMServiceError(Exception):
    """Base exception for LLM service errors."""

    def __init__(self, error_code: str, message: str):
        self.error_code = error_code
        self.message = message
        super().__init__(message)


def _get_bedrock_client():
    """
    Create and return a Bedrock Runtime client.

    Uses explicit credentials if provided in settings (AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY), otherwise falls back to the default boto3
    credential chain (env vars, ~/.aws/credentials, IAM role, etc.).
    """
    kwargs = {"region_name": settings.AWS_REGION}

    if settings.AWS_ACCESS_KEY_ID and settings.AWS_SECRET_ACCESS_KEY:
        kwargs["aws_access_key_id"] = settings.AWS_ACCESS_KEY_ID
        kwargs["aws_secret_access_key"] = settings.AWS_SECRET_ACCESS_KEY

    return boto3.client("bedrock-runtime", **kwargs)


def _detect_image_mime_type(image_bytes: bytes) -> str | None:
    """
    Detect the MIME type of an image from its binary header bytes.

    Supports JPEG, PNG, WEBP, and AVIF detection.
    """
    if image_bytes.startswith(b"\xff\xd8\xff"):
        return "image/jpeg"
    if image_bytes.startswith(b"\x89PNG\r\n\x1a\n"):
        return "image/png"
    if image_bytes[0:4] == b"RIFF" and image_bytes[8:12] == b"WEBP":
        return "image/webp"
    if len(image_bytes) >= 12 and image_bytes[4:8] == b"ftyp" and image_bytes[8:12] in {b"avif", b"av01", b"avis"}:
        return "image/avif"
    return None


def validate_b64_image_data(image_b64: str) -> tuple[bytes, str]:
    """
    Validate a base64 image payload and return decoded bytes plus MIME type.

    Parameters
    ----------
    image_b64 : str
        Image data in the form 'data:image/png;base64,...' or plain base64.

    Returns
    -------
    tuple[bytes, str]
        Decoded image bytes and MIME type.

    Raises
    ------
    ValueError
        If the payload is invalid or the MIME type is unsupported.
    """
    if not image_b64:
        raise ValueError("Image payload is empty.")

    header = None
    data = image_b64
    if image_b64.startswith("data:"):
        try:
            header, data = image_b64.split(",", 1)
        except ValueError:
            raise ValueError("Malformed data URI.")

    # Normalize: strip whitespace/newlines, support URL-safe base64, and pad
    data = data.strip()
    # remove any whitespace characters (newlines, spaces) that may appear
    data = re.sub(r"\s+", "", data)
    # convert URL-safe base64 to standard base64
    data = data.replace("-", "+").replace("_", "/")
    # pad with '=' to multiple of 4
    padding = (-len(data)) % 4
    if padding:
        data = data + ("=" * padding)

    try:
        decoded = base64.b64decode(data, validate=True)
    except (ValueError, binascii.Error):
        # final attempt: try a permissive decode to give a clearer error
        try:
            decoded = base64.b64decode(data, validate=False)
        except Exception:
            raise ValueError("Base64 data is invalid.")

    # Inspect decoded bytes for real MIME type (more reliable than header)
    actual_mime = _detect_image_mime_type(decoded)
    if actual_mime:
        mime_type = actual_mime
    elif header:
        if ";base64" not in header:
            raise ValueError("Data URI is not base64-encoded.")
        mime_type = header.split(";", 1)[0].replace("data:", "")
    else:
        # fallback to guess (rare)
        mime_type = mimetypes.guess_type("data.jpg")[0] or "image/jpeg"

    if mime_type not in settings.ALLOWED_IMAGE_TYPES:
        raise ValueError(f"Unsupported image MIME type '{mime_type}'.")

    return decoded, mime_type


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


def _invoke_bedrock(messages: list[dict]) -> str:
    """
    Invoke the Bedrock Converse API and return the raw text response.

    Parameters
    ----------
    messages : list[dict]
        Messages in the Bedrock Converse API format.

    Returns
    -------
    str
        The raw text content from the model response.

    Raises
    ------
    LLMServiceError
        On API call failure.
    """
    client = _get_bedrock_client()

    try:
        response = client.converse(
            modelId=settings.BEDROCK_MODEL_ID,
            messages=messages,
            inferenceConfig={
                "maxTokens": settings.LLM_MAX_TOKENS,
            },
        )
    except (ClientError, BotoCoreError) as e:
        logger.error(f"Bedrock API error: {e}")
        raise LLMServiceError(
            error_code="LLM_API_ERROR",
            message=f"AWS Bedrock API call failed: {str(e)}",
        )

    # Extract text from Converse response
    output = response.get("output", {})
    message = output.get("message", {})
    content_blocks = message.get("content", [])

    for block in content_blocks:
        if "text" in block:
            return block["text"]

    raise LLMServiceError(
        error_code="LLM_EMPTY_RESPONSE",
        message="Bedrock returned a response with no text content.",
    )


def _build_converse_content(prompt: str, image_b64_list: list[str] | None = None) -> list[dict]:
    """
    Build content blocks for the Bedrock Converse API.

    Parameters
    ----------
    prompt : str
        The text prompt.
    image_b64_list : list[str] | None
        Optional list of base64-encoded image payloads.

    Returns
    -------
    list[dict]
        Content blocks in Bedrock Converse format.
    """
    content_blocks: list[dict] = []

    if image_b64_list:
        for image_b64 in image_b64_list:
            try:
                decoded, mime_type = validate_b64_image_data(image_b64)
                format_map = {
                    "image/jpeg": "jpeg",
                    "image/png": "png",
                    "image/webp": "webp",
                }
                img_format = format_map.get(mime_type, "jpeg")
                content_blocks.append(
                    {
                        "image": {
                            "format": img_format,
                            "source": {"bytes": decoded},
                        }
                    }
                )
            except Exception as e:
                logger.warning(f"Failed to decode image for Bedrock: {e}")
                continue

    content_blocks.append({"text": prompt})
    return content_blocks


async def call_llm(prompt: str, image_b64_list: list[str] | None = None) -> dict:
    """
    Call the AWS Bedrock Converse API with a text prompt and optional images.

    Parameters
    ----------
    prompt : str
        The text prompt to send.
    image_b64_list : list[str] | None
        Optional list of base64-encoded image payloads.

    Returns
    -------
    dict
        Parsed JSON response from the LLM.

    Raises
    ------
    LLMServiceError
        On API call failure or JSON parse failure after retry.
    """

    # Build content blocks: images first, then text
    content_blocks = _build_converse_content(prompt, image_b64_list)
    messages = [{"role": "user", "content": content_blocks}]

    # --- First attempt ---
    raw_text = _invoke_bedrock(messages)
    cleaned = _strip_markdown_fences(raw_text)

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        logger.warning("First LLM response was not valid JSON. Retrying...")

    # --- Retry: ask for JSON only ---
    retry_messages = messages + [
        {"role": "assistant", "content": [{"text": raw_text}]},
        {
            "role": "user",
            "content": [
                {
                    "text": (
                        "Your previous response was not valid JSON. "
                        "Please respond with ONLY the JSON object — no markdown fences, "
                        "no commentary, no explanations. Just the raw JSON."
                    ),
                }
            ],
        },
    ]

    retry_text = _invoke_bedrock(retry_messages)
    retry_cleaned = _strip_markdown_fences(retry_text)

    try:
        return json.loads(retry_cleaned)
    except json.JSONDecodeError as e:
        logger.error(f"LLM JSON parse failed after retry: {e}")
        raise LLMServiceError(
            error_code="LLM_PARSE_ERROR",
            message="Failed to parse LLM response as valid JSON after retry.",
        )
