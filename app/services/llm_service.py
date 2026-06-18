"""
LLM service — handles AWS Bedrock API calls with multimodal support.

Uses boto3 to invoke the Bedrock Runtime (Anthropic Claude on Bedrock).
Reads images from disk, encodes to base64, builds the message payload,
and parses the JSON response with a single retry on parse failure.
"""

import base64
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


def _build_converse_content(prompt: str, image_paths: list[str] | None = None) -> list[dict]:
    """
    Build content blocks for the Bedrock Converse API.

    Parameters
    ----------
    prompt : str
        The text prompt.
    image_paths : list[str] | None
        Optional list of absolute paths to images.

    Returns
    -------
    list[dict]
        Content blocks in Bedrock Converse format.
    """
    content_blocks: list[dict] = []

    if image_paths:
        for img_path in image_paths:
            try:
                b64_data, media_type = _read_image_as_base64(img_path)

                # Map MIME type to Bedrock format string
                format_map = {
                    "image/jpeg": "jpeg",
                    "image/png": "png",
                    "image/webp": "webp",
                    "image/gif": "gif",
                }
                img_format = format_map.get(media_type, "jpeg")

                content_blocks.append(
                    {
                        "image": {
                            "format": img_format,
                            "source": {
                                "bytes": base64.standard_b64decode(b64_data),
                            },
                        },
                    }
                )
            except Exception as e:
                logger.warning(f"Failed to read image {img_path}: {e}")
                continue

    content_blocks.append({"text": prompt})
    return content_blocks


async def call_llm(prompt: str, image_paths: list[str] | None = None) -> dict:
    """
    Call the AWS Bedrock Converse API with a text prompt and optional images.

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

    # Build content blocks: images first, then text
    content_blocks = _build_converse_content(prompt, image_paths)
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
