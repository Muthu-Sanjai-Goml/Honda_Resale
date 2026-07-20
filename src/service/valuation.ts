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

// Map the backend API response into the normalized shape the report UI reads.
export function mapBackendResponseToReport(
  res: ValuationBackendResponse,
  details: VehicleDetails,
): ValuationReport {
  const toLakhs = (v: number) => Math.round((v / 100000) * 100) / 100;

  return {
    vehicle: {
      model: details.model || res.vehicle_model,
      variant: details.variant || res.variant,
      year: res.manufacture_year || parseInt(details.year),
      odometer: res.odometer_km || parseInt(details.odometer),
      owner: details.owners || "1st Owner",
    },
    value: {
      low: toLakhs(res.estimated_resale_value.low),
      high: toLakhs(res.estimated_resale_value.high),
      point: toLakhs(res.estimated_resale_value.point_estimate),
      confidence: Math.round(res.confidence_score),
    },
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

  // Combine the service-history category with the last service date and the
  // free-text service & repair notes
  const serviceHistoryParts: string[] = [];
  if (details.service) {
    serviceHistoryParts.push(details.service);
  }
  if (details.lastService) {
    serviceHistoryParts.push(`Last serviced: ${details.lastService}`);
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
