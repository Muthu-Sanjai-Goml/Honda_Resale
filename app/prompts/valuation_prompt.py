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

    # Pretty-print the vehicle model name and determine vehicle type
    if vehicle_model == "honda_city":
        model_display = "Honda City"
        vehicle_type = "sedan (four-wheeler car)"
    else:
        model_display = "Honda Activa"
        vehicle_type = "scooter (two-wheeler)"

    # Pricing guidance — strict benchmarks for accurate valuation
    if vehicle_model == "honda_city":
        pricing_guidance = ""
    else:
        # Honda Activa — strict Indian resale market benchmarks
        pricing_guidance = f"""
═══════════════════════════════════════════
STRICT PRICING BENCHMARKS (HONDA ACTIVA)
═══════════════════════════════════════════
The Honda Activa is a MASS-MARKET SCOOTER (two-wheeler). It is a commodity
vehicle with HIGH SUPPLY in the used market. Do NOT overvalue it.

Ex-showroom prices when new (approximate):
• Activa STD       : ₹70,000 – ₹75,000
• Activa DLX       : ₹75,000 – ₹82,000
• Activa 6G        : ₹72,000 – ₹80,000
• Activa 125 (STD) : ₹80,000 – ₹88,000
• Activa 125 (DLX) : ₹85,000 – ₹95,000

AGGRESSIVE DEPRECIATION CURVE for scooters in India:
• Year 1  : 25–30% depreciation (resale ≈ ₹50,000 – ₹65,000)
• Year 2  : 35–40% depreciation (resale ≈ ₹42,000 – ₹55,000)
• Year 3  : 45–50% depreciation (resale ≈ ₹35,000 – ₹45,000)
• Year 4  : 55–60% depreciation (resale ≈ ₹28,000 – ₹38,000)
• Year 5  : 60–65% depreciation (resale ≈ ₹22,000 – ₹30,000)
• Year 6  : 65–72% depreciation (resale ≈ ₹18,000 – ₹25,000)
• Year 7+ : 72–80% depreciation (resale ≈ ₹12,000 – ₹20,000)
• Year 10+: 80–90% depreciation (resale ≈ ₹5,000 – ₹12,000)

CRITICAL RULES:
- The resale value of an Activa should NEVER exceed ₹65,000 unless it is
  less than 1 year old with negligible kilometres.
- A 3-year-old Activa in "good" condition typically sells for ₹30,000–₹40,000.
- Multiple owners, high km, or missing service history must FURTHER reduce the price.
- Keep the low-to-high range TIGHT (within ₹5,000–₹8,000 spread).
- Be realistic: check OLX, CarDekho, BikeWale-style Indian marketplace pricing.
- Do NOT inflate the value. Err on the LOWER side if uncertain.
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
- Whether serviced at authorised Honda dealer vs. third-party
- don't be  very strict with the valuation, have a lenient approach and have around 10-15k buffer in the max estimate.
"""
    else:
        service_section = """
SERVICE HISTORY: Not provided.
Base your service assessment solely on the vehicle's age and odometer reading.
Flag "no_service_history" in fallback_flags.
"""

    # Image section — different assessment criteria for car vs scooter
    if image_count > 0:
        if vehicle_model == "honda_city":
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
            # Honda Activa — scooter-specific assessment
            image_section = f"""
IMAGES: {image_count} photo(s) attached above.
This is a **scooter** (two-wheeler). Carefully examine each photo and assess:
- **Body panels**: scratches, cracks, dents, paint fade, panel alignment
- **Seat condition**: tears, sagging, re-upholstered, fading
- **Handlebar & mirrors**: damage, wobble, aftermarket grips
- **Tyres**: tread depth, sidewall cracks, uneven wear, age
- **Engine & exhaust**: visible oil leaks, rust on silencer, kick-start lever condition
- **Storage compartment (under-seat)**: latch condition, visible damage
- **Signs of accident/fall damage**: scrape marks on side panels, bent footrest, cracked indicators
- **Modifications**: aftermarket exhaust, crash guards, LED lights, etc.

If images are blurry, dark, or low quality, flag "low_quality_images".
"""
    else:
        image_section = """
IMAGES: No photos provided.
Mark exterior_condition and interior_condition as "unable to assess".
Flag "no_images" in fallback_flags.
"""

    prompt = f"""You are an expert automotive appraiser specialising in the Indian used-vehicle market.
You are evaluating a **{model_display} {variant}** ({vehicle_type}) for resale valuation.

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

{pricing_guidance}
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
