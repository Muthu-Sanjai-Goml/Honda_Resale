import type { ValuationBackendResponse } from "@/service/valuation";

// Normalized shape consumed by the report UI. The full backend payload is
// kept on `raw` — that's what Step4Report renders from.
export interface ValuationReport {
  vehicle: {
    model: string;
    variant: string;
    year: number;
    odometer: number;
    owner: string;
  };
  value: {
    low: number; // lakhs
    high: number; // lakhs
    point: number; // lakhs
    confidence: number;
  };
  raw: ValuationBackendResponse;
}
