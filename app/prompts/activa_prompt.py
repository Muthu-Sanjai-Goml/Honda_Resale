"""
Prompt builder for Honda Activa (two-wheeler scooter) valuation.

Mirrors the structure of the Honda City prompt but with scooter-specific
context for the Indian used two-wheeler market.
"""


def build_activa_prompt(
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
    Build the full valuation prompt for a Honda Activa scooter.

    Parameters
    ----------
    variant : str
        Trim level (e.g., STD, DLX, 6G, 125).
    manufacture_year : int
        Year the scooter was manufactured.
    registration_year : int
        Year the scooter was first registered.
    odometer_km : int
        Current odometer reading in kilometres.
    location : str
        City/region in India.
    fuel_type : str
        Fuel type (almost always petrol for Activa).
    transmission : str
        Transmission type (automatic/CVT for Activa).
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

    # Service history section
    if service_history:
        service_section = f"""
SERVICE HISTORY PROVIDED:
\"\"\"{service_history}\"\"\"

Evaluate the service history for:
- Regularity of maintenance intervals
- Any major repairs or component replacements
- Missed service intervals
- Whether serviced at authorised Honda dealer vs. local mechanic
- don't be very strict with the valuation, have a lenient approach and have around 3-5k buffer in the max estimate.
"""
    else:
        service_section = """
SERVICE HISTORY: Not provided.
Base your service assessment solely on the scooter's age and odometer reading.
Flag "no_service_history" in fallback_flags.
"""

    # Image section — scooter-specific assessment
    if image_count > 0:
        image_section = f"""
IMAGES: {image_count} photo(s) attached above.
This is a scooter (two-wheeler). Carefully examine each photo and assess:
- **Body panels**: scratches, cracks, dents, paint fade, panel alignment
- **Seat condition**: tears, sagging, fading
- **Tyres**: tread depth, sidewall cracks, uneven wear
- **Engine & exhaust**: visible oil leaks, rust on silencer
- **Signs of accident/fall**: scrape marks on side panels, bent footrest, cracked indicators
- **Modifications**: aftermarket exhaust, crash guards, LED lights, etc.

If images are blurry, dark, or low quality, flag "low_quality_images".
"""
    else:
        image_section = """
IMAGES: No photos provided.
Mark exterior_condition and interior_condition as "unable to assess".
Flag "no_images" in fallback_flags.
"""

    prompt = f"""You are an expert two-wheeler appraiser specialising in the Indian used-scooter market.
You are evaluating a **Honda Activa {variant}** (scooter / two-wheeler) for resale valuation.

IMPORTANT CONTEXT: The Honda Activa is a mass-market scooter (two-wheeler), NOT a car.
It has a much lower price point and depreciates faster than four-wheelers. The ex-showroom
price of a new Activa ranges from ₹72,000 to ₹95,000 depending on the variant. Use
Indian two-wheeler marketplace prices (OLX, BikeWale, OrangeBookValue) as your reference.

═══════════════════════════════════════════
VEHICLE DETAILS
═══════════════════════════════════════════
• Model          : Honda Activa
• Variant        : {variant}
• Vehicle Type   : Scooter (two-wheeler)
• Manufacture Yr : {manufacture_year}
• Registration Yr: {registration_year}
• Odometer       : {odometer_km:,} km
• Location       : {location}
• Fuel Type      : {fuel_type}
• Transmission   : {transmission}
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
