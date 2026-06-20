import { Check } from "lucide-react";

type Props = { current: 1 | 2 | 3 | 4 };

const steps = [
  { n: 1, label: "Details" },
  { n: 2, label: "Photos" },
  { n: 3, label: "Report" },
] as const;

export function StepIndicator({ current }: Props) {
  // Treat step 3 (analysis) and 4 (report) as final stage
  const stage = current >= 3 ? 3 : current;
  return (
    <div className="flex items-center gap-3">
      {steps.map((s, i) => {
        const done = stage > s.n;
        const active = stage === s.n;
        return (
          <div key={s.n} className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full border text-[12px] font-medium ${
                  done
                    ? "border-[color:var(--honda-red)] bg-[color:var(--honda-red)] text-white"
                    : active
                      ? "border-[color:var(--honda-red)] bg-white text-[color:var(--honda-red)]"
                      : "border-[color:var(--neutral-line)] bg-white text-[color:var(--neutral-faint)]"
                }`}
              >
                {done ? <Check size={14} strokeWidth={2.5} /> : s.n}
              </div>
              <span
                className={`text-[13px] tracking-[0.04em] ${
                  active || done
                    ? "text-[color:var(--slate-ink)]"
                    : "text-[color:var(--neutral-faint)]"
                }`}
              >
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className="h-px w-8 bg-[color:var(--neutral-line)] sm:w-12" />
            )}
          </div>
        );
      })}
    </div>
  );
}
