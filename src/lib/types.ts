export interface ValuationReport {
  vehicle: {
    brand: string;
    model: string;
    variant: string;
    year: number;
    fuel: string;
    transmission: string;
    odometer: number;
    owner: string;
    city: string;
    service: string;
  };
  value: {
    low: number;
    high: number;
    point: number;
    confidence: number;
    comparables: number;
    asOf: string;
  };
  scores: {
    exterior: number;
    interior: number;
    service: number;
    mileage: number;
    total: number;
  };
  breakdown: {
    factor: string;
    score: number;
    weight: number;
    contribution: number;
  }[];
  market: {
    km: number;
    value: number;
    low: number;
    high: number;
  }[];
  exteriorFindings: {
    label: string;
    score: number;
  }[];
  interiorFindings: {
    label: string;
    score: number;
  }[];
  aiSummaryExterior: string;
  aiSummaryInterior: string;
  raw?: any;
}
