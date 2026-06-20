import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { mockReport, type MockReport } from "./passport-mock";

export type VehiclePhoto = { label: string; url: string };

export type Submission = {
  id: string;
  ownerName: string;
  phone: string;
  submittedAt: string; // ISO
  status: "New" | "Reviewed" | "Quoted" | "Closed";
  saved: boolean;
  report: MockReport;
  photos?: VehiclePhoto[];

};

const CAR_PHOTOS: VehiclePhoto[] = [
  { label: "Front View", url: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=900&q=70" },
  { label: "Rear View", url: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=900&q=70" },
  { label: "Left Side", url: "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=900&q=70" },
  { label: "Right Side", url: "https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=900&q=70" },
  { label: "Dashboard", url: "https://images.unsplash.com/photo-1542228262-3d663b306a53?auto=format&fit=crop&w=900&q=70" },
  { label: "Odometer", url: "https://images.unsplash.com/photo-1583836631365-9046aff7bf8c?auto=format&fit=crop&w=900&q=70" },
  { label: "Driver Seat", url: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=70" },
  { label: "Rear Seats", url: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=900&q=70" },
  { label: "Engine Bay", url: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=900&q=70" },
  { label: "Tyre — Front Left", url: "https://images.unsplash.com/photo-1604147495798-57beb5d6af73?auto=format&fit=crop&w=900&q=70" },
  { label: "Tyre — Rear Right", url: "https://images.unsplash.com/photo-1600706432502-77a0e2e32771?auto=format&fit=crop&w=900&q=70" },
  { label: "Boot / Trunk", url: "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=900&q=70" },
];

const TWO_WHEELER_PHOTOS: VehiclePhoto[] = [
  { label: "Front View", url: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=900&q=70" },
  { label: "Rear View", url: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=900&q=70" },
  { label: "Left Side", url: "https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?auto=format&fit=crop&w=900&q=70" },
  { label: "Right Side", url: "https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?auto=format&fit=crop&w=900&q=70" },
  { label: "Console / Meter", url: "https://images.unsplash.com/photo-1611288875785-f23a6efe1a51?auto=format&fit=crop&w=900&q=70" },
  { label: "Seat", url: "https://images.unsplash.com/photo-1591637333472-fdde4c9c9c4e?auto=format&fit=crop&w=900&q=70" },
  { label: "Engine", url: "https://images.unsplash.com/photo-1558981852-426c6c22a060?auto=format&fit=crop&w=900&q=70" },
  { label: "Front Tyre", url: "https://images.unsplash.com/photo-1571068316344-75bc76f77890?auto=format&fit=crop&w=900&q=70" },
  { label: "Rear Tyre", url: "https://images.unsplash.com/photo-1568708943089-cebcfd1da43f?auto=format&fit=crop&w=900&q=70" },
];

export function defaultPhotos(model: string): VehiclePhoto[] {
  const m = model.toLowerCase();
  if (m.includes("activa") || m.includes("hornet") || m.includes("dio") || m.includes("shine") || m.includes("unicorn")) {
    return TWO_WHEELER_PHOTOS;
  }
  return CAR_PHOTOS;
}

const KEY = "hvp.submissions.v2";

export function vehicleKey(v: MockReport["vehicle"]) {
  return `${v.model}|${v.variant}|${v.year}`.toLowerCase().replace(/\s+/g, "-");
}

function makeReport(overrides: Partial<MockReport["vehicle"]> & {
  scores?: Partial<MockReport["scores"]>;
  value?: Partial<MockReport["value"]>;
}): MockReport {
  const scores = { ...mockReport.scores, ...(overrides.scores || {}) };
  const value = { ...mockReport.value, ...(overrides.value || {}) };
  return {
    ...mockReport,
    vehicle: { ...mockReport.vehicle, ...overrides },
    scores,
    value,
  };
}

const SEED: Submission[] = [
  // Arjun Mehta — Honda City (3-passport history showing decline)
  {
    id: "VP-2024-0042",
    ownerName: "Arjun Mehta",
    phone: "+91 98xxxx1141",
    submittedAt: "2024-11-12T10:30:00Z",
    status: "Closed",
    saved: false,
    report: makeReport({
      model: "Honda City", variant: "ZX CVT", year: 2022, odometer: 18200, city: "Bengaluru",
      scores: { exterior: 92, interior: 90, service: 96, mileage: 95, total: 92.6 },
      value: { low: 10.4, high: 11.2, point: 10.8, confidence: 94, comparables: 18, asOf: "Nov 2024" },
    }),
  },
  {
    id: "VP-2025-0238",
    ownerName: "Arjun Mehta",
    phone: "+91 98xxxx1141",
    submittedAt: "2025-08-04T09:15:00Z",
    status: "Closed",
    saved: false,
    report: makeReport({
      model: "Honda City", variant: "ZX CVT", year: 2022, odometer: 26400, city: "Bengaluru",
      scores: { exterior: 86, interior: 80, service: 94, mileage: 92, total: 86.4 },
      value: { low: 9.4, high: 10.2, point: 9.8, confidence: 93, comparables: 16, asOf: "Aug 2025" },
    }),
  },
  {
    id: "VP-2026-0114",
    ownerName: "Arjun Mehta",
    phone: "+91 98xxxx1141",
    submittedAt: "2026-06-09T09:12:00Z",
    status: "New",
    saved: false,
    report: makeReport({
      model: "Honda City", variant: "ZX CVT", year: 2022, odometer: 35000, city: "Bengaluru",
      scores: { exterior: 78, interior: 66, service: 92, mileage: 88, total: 79.3 },
      value: { low: 8.6, high: 9.4, point: 9.1, confidence: 91, comparables: 14, asOf: "June 2026" },
    }),
  },
  // Arjun Mehta — second vehicle (Activa) single passport
  {
    id: "VP-2026-0090",
    ownerName: "Arjun Mehta",
    phone: "+91 98xxxx1141",
    submittedAt: "2026-04-21T11:00:00Z",
    status: "Reviewed",
    saved: false,
    report: makeReport({
      model: "Honda Activa", variant: "6G Std", year: 2021, fuel: "Petrol",
      transmission: "Automatic", odometer: 19800, city: "Bengaluru",
      scores: { exterior: 74, interior: 70, service: 82, mileage: 86, total: 76.4 },
      value: { low: 0.62, high: 0.74, point: 0.68, confidence: 86, comparables: 21, asOf: "Apr 2026" },
    }),
  },
  // Other owners (dealer inbox population)
  {
    id: "VP-2026-0113", ownerName: "Priya Iyer", phone: "+91 98xxxx7702",
    submittedAt: "2026-06-09T07:42:00Z", status: "New", saved: true,
    report: makeReport({
      model: "Honda Amaze", variant: "VX MT", year: 2021, fuel: "Petrol",
      transmission: "Manual", odometer: 48200, city: "Chennai", owner: "1st Owner",
      scores: { exterior: 84, interior: 79, service: 88, mileage: 72, total: 81.2 },
      value: { low: 6.4, high: 7.1, point: 6.8, confidence: 88, comparables: 11, asOf: "June 2026" },
    }),
  },
  {
    id: "VP-2026-0112", ownerName: "Rahul Khanna", phone: "+91 98xxxx5530",
    submittedAt: "2026-06-08T18:21:00Z", status: "Reviewed", saved: false,
    report: makeReport({
      model: "Honda WR-V", variant: "VX Diesel", year: 2019, fuel: "Diesel",
      transmission: "Manual", odometer: 72500, city: "Mumbai", owner: "2nd Owner",
      scores: { exterior: 62, interior: 58, service: 70, mileage: 55, total: 61.4 },
      value: { low: 5.2, high: 5.9, point: 5.6, confidence: 82, comparables: 9, asOf: "June 2026" },
    }),
  },
  {
    id: "VP-2026-0111", ownerName: "Sneha Reddy", phone: "+91 98xxxx2210",
    submittedAt: "2026-06-08T11:05:00Z", status: "Quoted", saved: true,
    report: makeReport({
      model: "Honda Jazz", variant: "VX CVT", year: 2020, odometer: 41000, city: "Hyderabad",
      scores: { exterior: 90, interior: 86, service: 95, mileage: 80, total: 88.6 },
      value: { low: 7.2, high: 7.9, point: 7.6, confidence: 93, comparables: 12, asOf: "June 2026" },
    }),
  },
  {
    id: "VP-2026-0110", ownerName: "Vikram Joshi", phone: "+91 98xxxx9981",
    submittedAt: "2026-06-07T16:48:00Z", status: "New", saved: false,
    report: makeReport({
      model: "Honda Activa", variant: "6G Std", year: 2023, fuel: "Petrol",
      transmission: "Automatic", odometer: 12400, city: "Pune",
      scores: { exterior: 86, interior: 80, service: 90, mileage: 92, total: 86.8 },
      value: { low: 0.78, high: 0.92, point: 0.85, confidence: 89, comparables: 22, asOf: "June 2026" },
    }),
  },
  {
    id: "VP-2026-0109", ownerName: "Aditi Sharma", phone: "+91 98xxxx4477",
    submittedAt: "2026-06-07T10:14:00Z", status: "Reviewed", saved: false,
    report: makeReport({
      model: "Honda City", variant: "V MT", year: 2018, odometer: 96500, city: "Delhi", owner: "3rd+ Owner",
      scores: { exterior: 54, interior: 49, service: 60, mileage: 42, total: 51.6 },
      value: { low: 4.1, high: 4.7, point: 4.4, confidence: 78, comparables: 8, asOf: "June 2026" },
    }),
  },
  {
    id: "VP-2026-0108", ownerName: "Karthik Nair", phone: "+91 98xxxx8826",
    submittedAt: "2026-06-06T13:33:00Z", status: "Closed", saved: false,
    report: makeReport({
      model: "Honda Hornet 2.0", variant: "Std", year: 2022, fuel: "Petrol",
      transmission: "Manual", odometer: 22400, city: "Bengaluru",
      scores: { exterior: 82, interior: 78, service: 86, mileage: 84, total: 82.3 },
      value: { low: 1.05, high: 1.18, point: 1.12, confidence: 87, comparables: 16, asOf: "June 2026" },
    }),
  },
  {
    id: "VP-2026-0107", ownerName: "Megha Pillai", phone: "+91 98xxxx3349",
    submittedAt: "2026-06-06T09:01:00Z", status: "New", saved: true,
    report: makeReport({
      model: "Honda Amaze", variant: "VX CVT", year: 2023, odometer: 18800, city: "Kolkata",
      scores: { exterior: 92, interior: 88, service: 94, mileage: 91, total: 91.4 },
      value: { low: 7.8, high: 8.5, point: 8.2, confidence: 94, comparables: 13, asOf: "June 2026" },
    }),
  },
];

type Ctx = {
  submissions: Submission[];
  add: (s: Omit<Submission, "id" | "submittedAt" | "status" | "saved">) => Submission;
  toggleSaved: (id: string) => void;
  setStatus: (id: string, status: Submission["status"]) => void;
};

const SubsCtx = createContext<Ctx>({
  submissions: [],
  add: () => SEED[0],
  toggleSaved: () => {},
  setStatus: () => {},
});

export function SubmissionsProvider({ children }: { children: ReactNode }) {
  const [submissions, setSubmissions] = useState<Submission[]>(SEED);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setSubmissions(JSON.parse(raw));
    } catch {}
  }, []);

  const persist = useCallback((next: Submission[]) => {
    setSubmissions(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {}
  }, []);

  const add: Ctx["add"] = (s) => {
    const id = `VP-2026-${String(200 + submissions.length).padStart(4, "0")}`;
    const sub: Submission = {
      ...s,
      id,
      submittedAt: new Date().toISOString(),
      status: "New",
      saved: false,
    };
    persist([sub, ...submissions]);
    return sub;
  };
  const toggleSaved = (id: string) =>
    persist(submissions.map((x) => (x.id === id ? { ...x, saved: !x.saved } : x)));
  const setStatus = (id: string, status: Submission["status"]) =>
    persist(submissions.map((x) => (x.id === id ? { ...x, status } : x)));

  return (
    <SubsCtx.Provider value={{ submissions, add, toggleSaved, setStatus }}>
      {children}
    </SubsCtx.Provider>
  );
}

export function useSubmissions() {
  return useContext(SubsCtx);
}
