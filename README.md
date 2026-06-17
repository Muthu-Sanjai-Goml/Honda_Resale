# Honda Resale Valuation API

AI-powered resale valuation system for Honda vehicles (City & Activa) in the Indian market.  
Submit vehicle details and optional photos to receive a structured valuation with confidence scoring, depreciation analysis, and condition assessment.

## Tech Stack

| Layer         | Technology                  |
|---------------|-----------------------------|
| Framework     | FastAPI + Uvicorn           |
| LLM           | Anthropic Claude claude-sonnet-4-6 |
| Validation    | Pydantic v2                 |
| Config        | python-dotenv               |
| Storage       | Local filesystem + JSON     |

## Quick Start

### 1. Install dependencies

```bash
pip install -r requirements.txt
```

### 2. Configure environment

```bash
cp .env.example .env
```

Open `.env` and add your Anthropic API key:

```
ANTHROPIC_API_KEY=sk-ant-...
```

### 3. Run the server

```bash
uvicorn app.main:app --reload
```

### 4. Open Swagger UI

Navigate to **[http://localhost:8000/docs](http://localhost:8000/docs)** to explore and test all endpoints interactively.

## API Endpoints

| Method | Path                        | Description                        |
|--------|-----------------------------|------------------------------------|
| GET    | `/health`                   | Service health check               |
| POST   | `/valuation`                | Submit vehicle for AI valuation    |
| GET    | `/valuation/{valuation_id}` | Retrieve a stored valuation result |

### POST /valuation

Accepts `multipart/form-data` with the following fields:

| Field              | Type           | Required | Description                                |
|--------------------|----------------|----------|--------------------------------------------|
| `vehicle_model`    | enum           | ✓        | `honda_city` or `honda_activa`             |
| `variant`          | string         | ✓        | Trim level (e.g., VX, ZX, DLX)            |
| `manufacture_year` | int            | ✓        | Year of manufacture (2000–2026)            |
| `registration_year`| int            | ✓        | Year of first registration                 |
| `odometer_km`      | int            | ✓        | Odometer reading in km                     |
| `location`         | string         | ✓        | City/region in India                       |
| `fuel_type`        | enum           | ✓        | `petrol`, `diesel`, `electric`, `cng`      |
| `transmission`     | enum           | ✓        | `manual` or `automatic`                    |
| `service_history`  | string         | ✗        | Free-text service history                  |
| `images`           | file(s)        | ✗        | Up to 10 images (jpg/png/webp, max 5 MB)  |

### Response Schema

The valuation response includes:

- **estimated_resale_value** — low, high, and point estimate in INR
- **confidence_score** — 0–100 based on data completeness
- **depreciation_analysis** — age, odometer assessment, depreciation %
- **condition_assessment** — exterior/interior rating, notable issues
- **fallback_flags** — data quality warnings

## Error Codes

| Code                 | HTTP | Description                         |
|----------------------|------|-------------------------------------|
| `INVALID_FILE_TYPE`  | 400  | Unsupported image format            |
| `FILE_TOO_LARGE`     | 400  | Image exceeds 5 MB                  |
| `TOO_MANY_IMAGES`    | 400  | More than 10 images submitted       |
| `LLM_PARSE_ERROR`    | 500  | Invalid JSON from LLM after retry   |
| `LLM_API_ERROR`      | 500  | Anthropic API call failure          |
| `VALUATION_NOT_FOUND`| 404  | Valuation ID not in storage         |

## Project Structure

```
honda-valuation-backend/
├── app/
│   ├── main.py                  # FastAPI app, middleware, routers
│   ├── config.py                # Settings from .env
│   ├── routes/
│   │   ├── valuation.py         # POST & GET valuation endpoints
│   │   └── health.py            # Health check endpoint
│   ├── services/
│   │   └── llm_service.py       # Anthropic API client
│   ├── models/
│   │   ├── request_models.py    # Input validation schemas
│   │   └── response_models.py   # Output schemas
│   └── prompts/
│       └── valuation_prompt.py  # LLM prompt builder
├── .env.example
├── requirements.txt
└── README.md
```

## Storage

- **Images**: `<temp>/honda-valuation/images/{valuation_id}/`
- **Results**: `<temp>/honda-valuation/results.json`

On Windows, `<temp>` is typically `C:\Users\<you>\AppData\Local\Temp`.  
On Linux/Mac, it's `/tmp`.
