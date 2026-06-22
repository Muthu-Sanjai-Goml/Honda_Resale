import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { ValuationReport } from "./types";

export type VehiclePhoto = { label: string; url: string };

export type Submission = {
  id: string;
  ownerName: string;
  phone: string;
  submittedAt: string; // ISO
  status: "New" | "Reviewed" | "Quoted" | "Closed";
  saved: boolean;
  report: ValuationReport;
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

export function vehicleKey(v: ValuationReport["vehicle"]) {
  return `${v.model}|${v.variant}|${v.year}`.toLowerCase().replace(/\s+/g, "-");
}

const SEED: Submission[] = [];

type Ctx = {
  submissions: Submission[];
  add: (s: Omit<Submission, "id" | "submittedAt" | "status" | "saved">) => Submission;
  toggleSaved: (id: string) => void;
  setStatus: (id: string, status: Submission["status"]) => void;
};

const SubsCtx = createContext<Ctx>({
  submissions: [],
  add: () => ({} as Submission),
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
