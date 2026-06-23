"""
Prompt builder for the Honda resale valuation system.

Constructs a detailed prompt that instructs the LLM to assess
vehicle condition, apply Indian-market depreciation logic, and
return a strictly valid JSON response.
"""


def build_valuation_prompt(
    vehicle_model: str,
    variant: str,
    manufacture_year: int,
    registration_year: int,
    odometer_km: int,
    location: str,
    fuel_type: str,
    transmission: str,
    number_of_owners: int,
    service_history: str | None,
    image_count: int,
) -> str:
    """
    Build the full valuation prompt string.

    Parameters
    ----------
    vehicle_model : str
        One of 'honda_city' or 'honda_activa'.
    variant : str
        Trim level (e.g., VX, ZX, DLX).
    manufacture_year : int
        Year the vehicle was manufactured.
    registration_year : int
        Year the vehicle was first registered.
    odometer_km : int
        Current odometer reading in kilometres.
    location : str
        City/region in India.
    fuel_type : str
        Fuel type (petrol, diesel, electric, cng).
    transmission : str
        Transmission type (manual, automatic).
    number_of_owners : int
        Number of previous owners.
    service_history : str | None
        Free-text service history or None.
    image_count : int
        Number of images attached to the request.

    Returns
    -------
    str
        The formatted prompt string.
    """

    # Pretty-print the vehicle model name
    model_display = "Honda City" if vehicle_model == "honda_city" else "Honda Activa"

    # Reference pricing by model
    # if vehicle_model == "honda_city":
    #     price_ref = "INR 10,00,000 – 17,00,000 (ex-showroom, 2019–2023 models)"
    # else:
    #     price_ref = "INR 65,000 – 90,000 (ex-showroom, 2019–2023 models)"

    # Service history section
    if service_history:
        service_section = f"""
SERVICE HISTORY PROVIDED:
\"\"\"{service_history}\"\"\"

Evaluate the service history for:
- Regularity of maintenance intervals
- Any major repairs or component replacements
- Missed service intervals
- Whether serviced at authorised Honda dealer vs. third-party
- don't be  very strict with the valuation, have a lenient approach and have around 10-15k buffer in the max estimate.
"""
    else:
        service_section = """
SERVICE HISTORY: Not provided.
Base your service assessment solely on the vehicle's age and odometer reading.
Flag "no_service_history" in fallback_flags.
"""

    # Image section
    if image_count > 0:
        image_section = f"""
IMAGES: {image_count} photo(s) attached above.
Carefully examine each photo and assess:
- **Exterior**: body damage, paint condition, rust, dents, scratches, panel gaps
- **Interior**: seat wear, dashboard condition, upholstery, cleanliness
- **Tyres**: tread depth, uneven wear, age
- **Signs of accident repair**: mismatched paint, filler, uneven panels
- **Modifications**: aftermarket parts, altered exhaust, etc.

If images are blurry, dark, or low quality, flag "low_quality_images".
"""
    else:
        image_section = """
IMAGES: No photos provided.
Mark exterior_condition and interior_condition as "unable to assess".
Flag "no_images" in fallback_flags.
"""

    prompt = f"""You are an expert automotive appraiser specialising in the Indian used-vehicle market.
You are evaluating a **{model_display} {variant}** for resale valuation.

═══════════════════════════════════════════
VEHICLE DETAILS
═══════════════════════════════════════════
• Model          : {model_display}
• Variant        : {variant}
• Manufacture Yr : {manufacture_year}
• Registration Yr: {registration_year}
• Odometer       : {odometer_km:,} km
• Location       : {location}
• Fuel Type      : {fuel_type}
• Transmission   : {transmission}
• Number of Owners: {number_of_owners}
• Number of Owners: {number_of_owners}



═══════════════════════════════════════════
PHOTO ASSESSMENT
═══════════════════════════════════════════
{image_section}

═══════════════════════════════════════════
SERVICE HISTORY ASSESSMENT
═══════════════════════════════════════════
{service_section}


═══════════════════════════════════════════
CONFIDENCE SCORING
═══════════════════════════════════════════
Assign a confidence score from 0 to 100: based on how confident you are about the estimated price based on the informations provided. 
if there are any data unavailable or is of low quality or if the service history sounds very uncertain.
dont be very sensitive about the confidence score, just give your best estimate based on the information provided.
═══════════════════════════════════════════
FALLBACK FLAGS
═══════════════════════════════════════════
Include any applicable flags:
- "no_service_history"  — if service history was not provided
- "no_images"           — if no photos were attached
- "low_quality_images"  — if photos are blurry, dark, or uninformative
- "odometer_mismatch"   — if odometer reading seems inconsistent with age
- "unknown_variant"     — if the variant is unrecognised or pricing data unavailable

═══════════════════════════════════════════
REQUIRED OUTPUT FORMAT
═══════════════════════════════════════════
Return STRICTLY VALID JSON only. No markdown code fences, no commentary,
no explanations outside the JSON. The JSON must conform to this exact schema:

{{
  "estimated_resale_value": {{
    "currency": "INR",
    "low": <float>,
    "high": <float>,
    "point_estimate": <float>
  }},
  "confidence_score": <float 0-100>,
  "confidence_reasoning": "<string>",
  "depreciation_analysis": {{
    "base_value_new": <float or null>,
    "age_years": <int>,
    "odometer_assessment": "<below average | average | above average>",
    "applied_depreciation_percent": <float>
  }},
  "condition_assessment": {{
    "exterior_condition": "<excellent | good | fair | poor | unable to assess>",
    "interior_condition": "<excellent | good | fair | poor | unable to assess>",
    "notable_issues": ["<issue1>", "<issue2>"],
    "service_history_summary": "<string>"
  }},
  "fallback_flags": ["<flag1>", "<flag2>"]
}}

Remember: output ONLY the JSON object. Nothing else.
"""
    return prompt
