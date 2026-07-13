import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { SegmentedToggle } from "./ui/SegmentedToggle";
import { PillSelect } from "./ui/PillSelect";
import { Field, inputClass } from "./ui/Field";

export type VehicleDetails = {
  vehicleType: "Two-Wheeler" | "Four-Wheeler" | "";
  model: string;
  variant: string;
  year: string;
  fuel: "Petrol" | "Diesel" | "CNG" | "Electric" | "";
  transmission: "Manual" | "Automatic" | "";
  odometer: string;
  owners: "1st Owner" | "2nd Owner" | "3rd+ Owner" | "";
  service: "All Honda ASC" | "Mixed" | "Local Only" | "No Records" | "";
  lastService: string;
  repairsDesc: string;
  city: string;
};

const MODELS_BY_TYPE = {
  "Two-Wheeler": ["Honda Activa"],
  "Four-Wheeler": ["Honda City"],
} as const;
const CITIES = [
  "Mumbai",
  "Delhi",
  "Bengaluru",
  "Chennai",
  "Hyderabad",
  "Pune",
  "Ahmedabad",
  "Kolkata",
  "Other",
];
const YEARS = Array.from({ length: 11 }, (_, i) => String(2025 - i));

type Props = {
  initial: VehicleDetails;
  onSubmit: (d: VehicleDetails) => void;
};

export function Step1Details({ initial, onSubmit }: Props) {
  const [d, setD] = useState<VehicleDetails>(initial);
  const [showErrors, setShowErrors] = useState(false);

  const set = <K extends keyof VehicleDetails>(k: K, v: VehicleDetails[K]) =>
    setD((prev) => ({ ...prev, [k]: v }));

  const isTwoWheeler = d.vehicleType === "Two-Wheeler";
  const availableModels = d.vehicleType ? MODELS_BY_TYPE[d.vehicleType] : [];

  const required: (keyof VehicleDetails)[] = [
    "vehicleType",
    "model",
    "variant",
    "year",
    "odometer",
    "owners",
    "service",
    "lastService",
    "city",
  ];
  // Two-wheelers skip fuel & transmission — sent as Petrol / Automatic by default
  if (!isTwoWheeler) required.push("fuel", "transmission");

  const missing = required.filter((k) => !d[k]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (missing.length > 0) {
      setShowErrors(true);
      return;
    }
    onSubmit(d);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-10">


      {/* Vehicle Information */}
      <section className="space-y-6">
        <div className="section-label">Vehicle Information</div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Field label="Vehicle Type" required>
            <SegmentedToggle
              options={["Two-Wheeler", "Four-Wheeler"] as const}
              value={d.vehicleType}
              onChange={(v) =>
                setD((prev) => ({
                  ...prev,
                  vehicleType: v,
                  // Only one model per type — preselect it
                  model: MODELS_BY_TYPE[v][0],
                  // Two-wheelers are sent as Petrol / Automatic
                  ...(v === "Two-Wheeler"
                    ? { fuel: "Petrol", transmission: "Automatic" }
                    : {}),
                }))
              }
            />
          </Field>
          <Field label="Brand" required>
            <div className="flex h-11 items-center rounded-[8px] border border-[color:var(--neutral-line)] bg-[color:var(--surface)] px-3 text-[14px] font-medium text-[color:var(--slate-ink)]">
              Honda
            </div>
          </Field>
          <Field label="Model" required>
            <select
              className={inputClass}
              value={d.model}
              onChange={(e) => set("model", e.target.value)}
              disabled={!d.vehicleType}
            >
              <option value="">
                {d.vehicleType ? "Select model" : "Select vehicle type first"}
              </option>
              {availableModels.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Variant" required>
            <input
              className={inputClass}
              placeholder='e.g. "ZX CVT", "VX", "Standard"'
              value={d.variant}
              onChange={(e) => set("variant", e.target.value)}
            />
          </Field>
          <Field label="Registration Year" required>
            <select
              className={inputClass}
              value={d.year}
              onChange={(e) => set("year", e.target.value)}
            >
              <option value="">Select year</option>
              {YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </Field>
          {!isTwoWheeler && (
            <Field label="Fuel Type" required>
              <SegmentedToggle
                options={["Petrol", "Diesel", "CNG", "Electric"] as const}
                value={d.fuel}
                onChange={(v) => set("fuel", v)}
              />
            </Field>
          )}
          {!isTwoWheeler && (
            <Field label="Transmission" required className="md:col-span-2">
              <SegmentedToggle
                options={["Manual", "Automatic"] as const}
                value={d.transmission}
                onChange={(v) => set("transmission", v)}
              />
            </Field>
          )}
        </div>
      </section>

      {/* Usage & History */}
      <section className="space-y-6">
        <div className="section-label">Usage &amp; History</div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Field label="Current Odometer Reading" required>
            <div className="relative">
              <input
                type="number"
                inputMode="numeric"
                className={inputClass + " pr-12"}
                placeholder="e.g. 35,000"
                value={d.odometer}
                onChange={(e) => set("odometer", e.target.value)}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[13px] text-[color:var(--neutral-faint)]">
                km
              </span>
            </div>
          </Field>
          <Field label="Number of Owners" required>
            <PillSelect
              options={["1st Owner", "2nd Owner", "3rd+ Owner"] as const}
              value={d.owners}
              onChange={(v) => set("owners", v)}
            />
          </Field>
          <Field label="Service History" required className="md:col-span-2">
            <PillSelect
              options={["All Honda ASC", "Mixed", "Local Only", "No Records"] as const}
              value={d.service}
              onChange={(v) => set("service", v)}
            />
          </Field>
          <Field label="Last Service Date" required>
            <input
              type="month"
              className={inputClass}
              value={d.lastService}
              onChange={(e) => set("lastService", e.target.value)}
            />
          </Field>
          <Field
            label="Service & Repair Notes"
            className="md:col-span-2"
          >
            <textarea
              className={inputClass + " h-28 resize-none py-3"}
              placeholder="Describe the service history, and any accident repairs or major work done — what was done and when. Leave blank if none."
              value={d.repairsDesc}
              onChange={(e) => set("repairsDesc", e.target.value)}
            />
          </Field>
        </div>
      </section>

      {/* Location */}
      <section className="space-y-6">
        <div className="section-label">Location</div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Field label="City" required>
            <select
              className={inputClass}
              value={d.city}
              onChange={(e) => set("city", e.target.value)}
            >
              <option value="">Select city</option>
              {CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </section>

      {showErrors && missing.length > 0 && (
        <div className="rounded-[8px] border border-[color:var(--score-red)]/30 bg-[color:var(--score-red)]/5 px-4 py-3 text-[13px] text-[color:var(--score-red)]">
          Please fill {missing.length} required field{missing.length === 1 ? "" : "s"} to continue.
        </div>
      )}

      <button
        type="submit"
        className="flex h-[52px] w-full items-center justify-center gap-2 rounded-[8px] bg-[color:var(--honda-red)] text-[16px] font-medium text-white transition hover:bg-[color:var(--honda-red-hover)]"
      >
        Continue to Photo Upload <ArrowRight size={18} />
      </button>
    </form>
  );
}
