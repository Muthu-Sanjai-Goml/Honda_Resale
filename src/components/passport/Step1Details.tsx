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
  fuel: "Petrol" | "Diesel" | "Hybrid" | "";
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
const CURRENT_YEAR = new Date().getFullYear();
const EARLIEST_YEAR = 2015;
const YEARS = Array.from({ length: CURRENT_YEAR - EARLIEST_YEAR + 1 }, (_, i) =>
  String(CURRENT_YEAR - i),
);
const CURRENT_MONTH = (() => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
})();

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
    "city",
  ];
  // Two-wheelers skip fuel & transmission — sent as Petrol / Automatic by default
  if (!isTwoWheeler) required.push("fuel", "transmission");

  const missing = required.filter((k) => !String(d[k]).trim());
  const lastServiceInFuture = !!d.lastService && d.lastService > CURRENT_MONTH;
  const lastServiceBeforeRegistration =
    !!d.lastService && !!d.year && d.lastService.slice(0, 4) < d.year;
  const odometerInvalid =
    !!d.odometer && (!Number.isFinite(Number(d.odometer)) || Number(d.odometer) <= 0);

  // Per-field error state for highlighting the specific field(s) at fault
  const fieldError = (k: keyof VehicleDetails) =>
    showErrors && missing.includes(k);
  const odometerError = showErrors && (missing.includes("odometer") || odometerInvalid);
  const lastServiceError =
    showErrors &&
    (missing.includes("lastService") ||
      lastServiceInFuture ||
      lastServiceBeforeRegistration);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      missing.length > 0 ||
      lastServiceInFuture ||
      lastServiceBeforeRegistration ||
      odometerInvalid
    ) {
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
          <Field label="Vehicle Type" required error={fieldError("vehicleType")}>
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
          <Field label="Model" required error={fieldError("model")}>
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
          <Field label="Variant" required error={fieldError("variant")}>
            <input
              className={inputClass}
              placeholder={
                isTwoWheeler
                  ? 'e.g. "6G", "5G", "4G", "Standard"'
                  : 'e.g. "ZX", "V", "VX"'
              }
              value={d.variant}
              onChange={(e) => set("variant", e.target.value)}
            />
          </Field>
          <Field label="Registration Year" required error={fieldError("year")}>
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
            <Field label="Fuel Type" required error={fieldError("fuel")}>
              <SegmentedToggle
                options={["Petrol", "Diesel", "Hybrid"] as const}
                value={d.fuel}
                onChange={(v) => set("fuel", v)}
              />
            </Field>
          )}
          {!isTwoWheeler && (
            <Field
              label="Transmission"
              required
              error={fieldError("transmission")}
              className="md:col-span-2"
            >
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
          <Field label="Current Odometer Reading" required error={odometerError}>
            <div className="relative">
              <input
                type="number"
                inputMode="numeric"
                min="1"
                step="1"
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
          <Field label="Number of Owners" required error={fieldError("owners")}>
            <PillSelect
              options={["1st Owner", "2nd Owner", "3rd+ Owner"] as const}
              value={d.owners}
              onChange={(v) => set("owners", v)}
            />
          </Field>
          <Field
            label="Service History"
            required
            error={fieldError("service")}
            className="md:col-span-2"
          >
            <PillSelect
              options={["All Honda ASC", "Mixed", "Local Only", "No Records"] as const}
              value={d.service}
              onChange={(v) => set("service", v)}
            />
          </Field>
          <Field label="Last Service Date" error={lastServiceError}>
            <input
              type="month"
              className={inputClass}
              value={d.lastService}
              min={d.year ? `${d.year}-01` : undefined}
              max={CURRENT_MONTH}
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
          <Field label="City" required error={fieldError("city")}>
            <input
              className={inputClass}
              placeholder="e.g. Bengaluru"
              value={d.city}
              onChange={(e) => set("city", e.target.value)}
            />
          </Field>
        </div>
      </section>

      {showErrors && missing.length > 0 && (
        <div className="rounded-[8px] border border-[color:var(--score-red)]/30 bg-[color:var(--score-red)]/5 px-4 py-3 text-[13px] text-[color:var(--score-red)]">
          Please fill {missing.length} required field{missing.length === 1 ? "" : "s"} to continue.
        </div>
      )}

      {showErrors && lastServiceInFuture && (
        <div className="rounded-[8px] border border-[color:var(--score-red)]/30 bg-[color:var(--score-red)]/5 px-4 py-3 text-[13px] text-[color:var(--score-red)]">
          Last Service Date cannot be in the future.
        </div>
      )}

      {showErrors && lastServiceBeforeRegistration && (
        <div className="rounded-[8px] border border-[color:var(--score-red)]/30 bg-[color:var(--score-red)]/5 px-4 py-3 text-[13px] text-[color:var(--score-red)]">
          Last Service Date cannot be before the registration year.
        </div>
      )}

      {showErrors && odometerInvalid && (
        <div className="rounded-[8px] border border-[color:var(--score-red)]/30 bg-[color:var(--score-red)]/5 px-4 py-3 text-[13px] text-[color:var(--score-red)]">
          Please enter a valid odometer reading.
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
