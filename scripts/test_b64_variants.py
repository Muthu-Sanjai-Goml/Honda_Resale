import sys
from pathlib import Path

# Ensure project root is on sys.path so `app` package can be imported
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from app.services.llm_service import validate_b64_image_data

# Small 1x1 PNG image base64 (standard)
png_b64 = (
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII="
)
# URL-safe variant (replace +/ with -_)
png_b64_urlsafe = png_b64.replace('+', '-').replace('/', '_')
# Missing padding variant (remove trailing =)
png_b64_no_pad = png_b64.rstrip('=')
# With whitespace/newlines
png_b64_ws = "\n".join([png_b64[i:i+20] for i in range(0, len(png_b64), 20)])

variants = [
    ("standard", png_b64),
    ("urlsafe", png_b64_urlsafe),
    ("no_padding", png_b64_no_pad),
    ("with_whitespace", png_b64_ws),
]

for name, data in variants:
    try:
        decoded, mime = validate_b64_image_data(data)
        print(f"{name}: OK, detected mime={mime}, bytes={len(decoded)}")
    except Exception as e:
        print(f"{name}: ERROR -> {e}")
