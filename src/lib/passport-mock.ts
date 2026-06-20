export const mockReport = {
  vehicle: {
    brand: "Honda",
    model: "Honda City",
    variant: "ZX CVT",
    year: 2022,
    fuel: "Petrol",
    transmission: "Automatic",
    odometer: 35000,
    owner: "1st Owner",
    city: "Bengaluru",
    service: "All Honda ASC",
  },
  value: {
    low: 8.6,
    high: 9.4,
    point: 9.1,
    confidence: 91,
    comparables: 14,
    asOf: "June 2026",
  },
  scores: {
    exterior: 78,
    interior: 66,
    service: 92,
    mileage: 88,
    total: 79.3,
  },
  breakdown: [
    { factor: "Exterior Condition", score: 78, weight: 40, contribution: 31.2 },
    { factor: "Interior Condition", score: 66, weight: 25, contribution: 16.5 },
    { factor: "Service History", score: 92, weight: 20, contribution: 18.4 },
    { factor: "Mileage Score", score: 88, weight: 15, contribution: 13.2 },
  ],
  market: [
    { km: 0, value: 12.4 },
    { km: 10000, value: 11.5 },
    { km: 20000, value: 10.6 },
    { km: 30000, value: 9.6 },
    { km: 35000, value: 9.1 },
    { km: 40000, value: 8.7 },
    { km: 50000, value: 8.0 },
    { km: 60000, value: 7.3 },
    { km: 70000, value: 6.6 },
    { km: 80000, value: 6.0 },
  ].map((p) => ({ ...p, low: +(p.value * 0.9).toFixed(2), high: +(p.value * 1.1).toFixed(2) })),
  exteriorFindings: [
    { label: "Scratches", score: 7 },
    { label: "Dents", score: 8 },
    { label: "Paint Damage", score: 9 },
    { label: "Rust", score: 9 },
    { label: "Panel Alignment", score: 8 },
  ],
  interiorFindings: [
    { label: "Seat Wear", score: 6 },
    { label: "Dashboard", score: 7 },
    { label: "Steering Wear", score: 7 },
    { label: "Cleanliness", score: 8 },
  ],
  aiSummaryExterior:
    "Good overall exterior. Minor swirl marks on the bonnet and a small scratch on the rear bumper.",
  aiSummaryInterior:
    "Moderate seat fabric wear detected — typical for 3-year daily usage. Cabin clean and odor-free.",
};

export type MockReport = typeof mockReport;
