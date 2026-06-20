import type { MockReport } from "@/lib/passport-mock";
import { HondaLogo } from "../HondaLogo";

type Props = { r: MockReport };

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[color:var(--neutral-line)] bg-white px-3 py-1 text-[12px] font-medium text-[color:var(--slate-ink)]">
      {children}
    </span>
  );
}

export function VehicleIdentityBar({ r }: Props) {
  const v = r.vehicle;
  return (
    <div className="hvp-card flex flex-wrap items-center gap-x-5 gap-y-3">
      <HondaLogo size={32} />
      <div className="font-display text-[20px] font-semibold leading-none text-[color:var(--slate-ink)]">
        {v.model} {v.variant} {v.year}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Pill>{v.fuel}</Pill>
        <Pill>{v.odometer.toLocaleString("en-IN")} km</Pill>
        <Pill>{v.owner}</Pill>
        <Pill>{v.city}</Pill>
      </div>
    </div>
  );
}
