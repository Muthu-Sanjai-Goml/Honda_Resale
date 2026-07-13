import { api } from "./api";
import type { VehicleDetails } from "@/components/passport/Step1Details";
import type { Photos } from "@/components/passport/Step2Photos";
import type { ValuationReport } from "@/lib/types";

// Helper function to normalize and convert any image format to standard JPEG base64 string
export function normalizeImageToJpegBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      // Clean up the object URL to prevent memory leaks
      URL.revokeObjectURL(objectUrl);

      const canvas = document.createElement("canvas");
      let width = img.width;
      let height = img.height;

      // Auto-downscale if image exceeds standard high-res boundaries to stay under 5MB base64 size limit
      const MAX_WIDTH = 1600;
      const MAX_HEIGHT = 1200;
      if (width > MAX_WIDTH || height > MAX_HEIGHT) {
        if (width / height > MAX_WIDTH / MAX_HEIGHT) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        } else {
          width = Math.round((width * MAX_HEIGHT) / height);
          height = MAX_HEIGHT;
        }
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Could not create 2D canvas context"));
        return;
      }

      // Paint background white (handles transparent PNG/WebP gracefully)
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, width, height);

      // Draw image onto canvas
      ctx.drawImage(img, 0, 0, width, height);

      // Export as a JPEG data URL at 85% compression quality
      const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
      const base64 = dataUrl.split(",")[1] || dataUrl;
      resolve(base64);
    };

    img.onerror = (error) => {
      URL.revokeObjectURL(objectUrl);
      reject(error);
    };

    img.src = objectUrl;
  });
}

export interface ValuationBackendResponse {
  valuation_id: string;
  vehicle_model: string;
  variant: string;
  manufacture_year: number;
  odometer_km: number;
  number_of_owners: number;
  estimated_resale_value: {
    currency: string;
    low: number;
    high: number;
    point_estimate: number;
  };
  confidence_score: number;
  confidence_reasoning: string;
  depreciation_analysis: {
    base_value_new: number;
    age_years: number;
    odometer_assessment: string;
    applied_depreciation_percent: number;
  };
  condition_assessment: {
    exterior_condition: string;
    interior_condition: string;
    notable_issues: string[];
    service_history_summary: string;
  };
  fallback_flags: string[];
  images_saved: string[];
  created_at: string;
}

// Convert Backend condition fields to Numerical Scores (1-100) for charts
function conditionToScore(cond?: string): number {
  if (!cond) return 75;
  const c = cond.toLowerCase();
  if (c.includes("excel") || c === "excellent") return 95;
  if (c.includes("good")) return 80;
  if (c.includes("average") || c.includes("fair")) return 65;
  if (c.includes("poor") || c.includes("bad")) return 45;
  return 75;
}

function serviceToScore(service?: string): number {
  if (!service) return 75;
  const s = service.toLowerCase();
  if (s.includes("all") || s.includes("asc") || s.includes("authorized")) return 95;
  if (s.includes("mixed") || s.includes("regular")) return 75;
  if (s.includes("local")) return 55;
  if (s.includes("no") || s.includes("none")) return 35;
  return 75;
}

function odometerAssessmentToScore(assess?: string): number {
  if (!assess) return 75;
  const a = assess.toLowerCase();
  if (a.includes("excel") || a === "low") return 95;
  if (a.includes("good") || a === "average") return 80;
  if (a.includes("fair")) return 65;
  if (a.includes("poor") || a === "high") return 45;
  return 75;
}

// Map the Backend API Response format to the Frontend MockReport schema
export function mapBackendResponseToReport(
  res: ValuationBackendResponse,
  details: VehicleDetails,
): ValuationReport {
  const lowLakhs = Math.round((res.estimated_resale_value.low / 100000) * 100) / 100;
  const highLakhs = Math.round((res.estimated_resale_value.high / 100000) * 100) / 100;
  const pointLakhs = Math.round((res.estimated_resale_value.point_estimate / 100000) * 100) / 100;

  const exteriorScore = conditionToScore(res.condition_assessment?.exterior_condition);
  const interiorScore = conditionToScore(res.condition_assessment?.interior_condition);
  const serviceScore = serviceToScore(details.service);
  const mileageScore = odometerAssessmentToScore(res.depreciation_analysis?.odometer_assessment);

  // Calculate weighted total score
  const totalScore =
    Math.round(
      (exteriorScore * 0.4 + interiorScore * 0.25 + serviceScore * 0.2 + mileageScore * 0.15) * 10,
    ) / 10;

  // Generate a realistic depreciation chart data points (km vs lakhs)
  const currentOdo = res.odometer_km || 35000;
  const baseNewLakhs =
    (res.depreciation_analysis?.base_value_new || res.estimated_resale_value.point_estimate * 1.6) /
    100000;
  const market = [0, 10000, 20000, 30000, 40000, 50000, 60000, 70000, 80000].map((km) => {
    let val = baseNewLakhs - (baseNewLakhs - pointLakhs) * (km / Math.max(1, currentOdo));
    if (val < baseNewLakhs * 0.25) val = baseNewLakhs * 0.25; // limit floor
    val = Math.round(val * 100) / 100;
    return {
      km,
      value: val,
      low: Math.round(val * 0.9 * 100) / 100,
      high: Math.round(val * 1.1 * 100) / 100,
    };
  });

  const extScoreOutOfTen = Math.min(10, Math.max(1, Math.round(exteriorScore / 10)));
  const intScoreOutOfTen = Math.min(10, Math.max(1, Math.round(interiorScore / 10)));

  return {
    vehicle: {
      brand: "Honda",
      model: details.model || res.vehicle_model,
      variant: details.variant || res.variant,
      year: res.manufacture_year || parseInt(details.year),
      fuel: details.fuel || "Petrol",
      transmission: details.transmission || "Automatic",
      odometer: res.odometer_km || parseInt(details.odometer),
      owner: details.owners || "1st Owner",
      city: details.city || "Bengaluru",
      service: details.service || "All Honda ASC",
    },
    value: {
      low: lowLakhs,
      high: highLakhs,
      point: pointLakhs,
      confidence: Math.round(res.confidence_score),
      comparables: 12 + Math.floor(Math.random() * 8), // Dynamic mock count for display
      asOf: new Date(res.created_at).toLocaleString("default", { month: "short", year: "numeric" }),
    },
    scores: {
      exterior: exteriorScore,
      interior: interiorScore,
      service: serviceScore,
      mileage: mileageScore,
      total: totalScore,
    },
    breakdown: [
      {
        factor: "Exterior Condition",
        score: exteriorScore,
        weight: 40,
        contribution: Math.round(exteriorScore * 0.4 * 10) / 10,
      },
      {
        factor: "Interior Condition",
        score: interiorScore,
        weight: 25,
        contribution: Math.round(interiorScore * 0.25 * 10) / 10,
      },
      {
        factor: "Service History",
        score: serviceScore,
        weight: 20,
        contribution: Math.round(serviceScore * 0.2 * 10) / 10,
      },
      {
        factor: "Mileage Score",
        score: mileageScore,
        weight: 15,
        contribution: Math.round(mileageScore * 0.15 * 10) / 10,
      },
    ],
    market,
    exteriorFindings: [
      { label: "Scratches & Swirls", score: extScoreOutOfTen },
      { label: "Dents & Scuffs", score: Math.max(1, extScoreOutOfTen - 1) },
      { label: "Paint Condition", score: extScoreOutOfTen },
      { label: "Corrosion / Rust", score: Math.min(10, extScoreOutOfTen + 1) },
      { label: "Panel Fitment", score: extScoreOutOfTen },
    ],
    interiorFindings: [
      { label: "Seat Fabric Wear", score: intScoreOutOfTen },
      { label: "Dashboard Controls", score: Math.min(10, intScoreOutOfTen + 1) },
      { label: "Steering Wheel Grip", score: intScoreOutOfTen },
      { label: "Cabin Odor & Cleanliness", score: Math.min(10, intScoreOutOfTen + 2) },
    ],
    aiSummaryExterior: res.condition_assessment?.exterior_condition
      ? `Exterior evaluated as ${res.condition_assessment.exterior_condition}. ${
          res.condition_assessment.notable_issues?.length
            ? "Issues found: " + res.condition_assessment.notable_issues.join(", ")
            : "No major damage or paint deterioration detected."
        }`
      : "Excellent exterior appearance.",
    aiSummaryInterior: res.condition_assessment?.interior_condition
      ? `Interior cabin in ${res.condition_assessment.interior_condition} condition. ${
          res.condition_assessment.service_history_summary || ""
        }`
      : "Cabin feels premium and clean.",
    raw: res,
  };
}

export async function submitVehicleValuation(
  details: VehicleDetails,
  photos: Photos,
): Promise<ValuationReport> {
  // Convert and normalize any selected photos into JPEG base64 strings
  const imageBase64Promises = Object.values(photos)
    .filter((photo) => photo?.file)
    .map((photo) => normalizeImageToJpegBase64(photo!.file!));

  const images = await Promise.all(imageBase64Promises);

  // Map "1st Owner", "2nd Owner", "3rd+ Owner" to numerical values (1, 2, 3)
  let numberOfOwners = 1;
  if (details.owners === "2nd Owner") numberOfOwners = 2;
  else if (details.owners === "3rd+ Owner") numberOfOwners = 3;

  // Format parameters to match backend exact expectations (lowercase snake_case)
  let modelVal = details.model.toLowerCase().replace(/\s+/g, "_");
  if (modelVal !== "honda_city" && modelVal !== "honda_activa") {
    modelVal = details.vehicleType === "Two-Wheeler" ? "honda_activa" : "honda_city";
  }

  const fuelVal = (details.fuel || "Petrol").toLowerCase();

  // Two-wheelers might not have transmission in form, default to manual/automatic based on vehicle type
  let transVal = (
    details.transmission || (details.vehicleType === "Two-Wheeler" ? "Automatic" : "Manual")
  ).toLowerCase();
  if (transVal !== "manual" && transVal !== "automatic") {
    transVal = "automatic";
  }

  // Prepare parameters for x-www-form-urlencoded
  const payload = new URLSearchParams();
  payload.append("vehicle_model", modelVal);
  payload.append("variant", details.variant);
  payload.append("manufacture_year", details.year);
  payload.append("registration_year", details.year);
  payload.append("odometer_km", details.odometer);
  payload.append("location", details.city);
  payload.append("fuel_type", fuelVal);
  payload.append("transmission", transVal);
  payload.append("number_of_owners", String(numberOfOwners));

  // Combine the service-history category with the free-text service & repair notes
  const serviceHistoryParts: string[] = [];
  if (details.service) {
    serviceHistoryParts.push(details.service);
  }
  if (details.repairsDesc && details.repairsDesc.trim()) {
    serviceHistoryParts.push(details.repairsDesc.trim());
  }
  if (serviceHistoryParts.length > 0) {
    payload.append("service_history", serviceHistoryParts.join(" — "));
  }

  // fastapi/x-www-form-urlencoded array handling (repeating parameters)
  if (images && images.length > 0) {
    images.forEach((img) => {
      payload.append("images", img);
    });
  }

  // Make the post request
  const response = await api.post<ValuationBackendResponse>("/valuation", payload);

  // Map backend response format to the frontend schema
  return mapBackendResponseToReport(response.data, details);
}
