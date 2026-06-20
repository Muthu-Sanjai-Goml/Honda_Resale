import type { MockReport } from "@/lib/passport-mock";

type Props = { r: MockReport };

const BANDS = [
  { range: "< 60", label: "-10%", min: 0, max: 59 },
  { range: "60–69", label: "-5%", min: 60, max: 69 },
  { range: "70–79", label: "0%", min: 70, max: 79 },
  { range: "80–89", label: "+2%", min: 80, max: 89 },
  { range: "90–100", label: "+5%", min: 90, max: 100 },
];

export function PriceAdjustmentRuler({ r }: Props) {
  const score = r.scores.total;
  const activeIdx = BANDS.findIndex((b) => score >= b.min && score <= b.max);

  return (
    <div className="hvp-card">
      <div className="font-display text-[20px] font-semibold text-[color:var(--slate-ink)]">
        Price Adjustment Logic
      </div>
      <div className="mt-1 text-[13px] text-[color:var(--neutral-muted)]">
        Score-to-price band the market applies
      </div>

      <div className="mt-6 grid grid-cols-5 gap-1">
        {BANDS.map((b, i) => {
          const active = i === activeIdx;
          return (
            <div
              key={b.range}
              className={`relative flex flex-col items-center gap-1 border-t-2 py-3 ${
                active
                  ? "border-[color:var(--honda-red)]"
                  : "border-[color:var(--neutral-line)]"
              }`}
            >
              {active && (
                <span className="absolute -top-1.5 h-3 w-3 rounded-full bg-[color:var(--honda-red)]" />
              )}
              <span
                className={`text-[10px] sm:text-[12px] tracking-[0.04em] uppercase text-center ${
                  active ? "text-[color:var(--honda-red)]" : "text-[color:var(--neutral-muted)]"
                }`}
              >
                {b.range}
              </span>
              <span
                className={`font-display text-[15px] sm:text-[20px] font-semibold ${
                  active ? "text-[color:var(--slate-ink)]" : "text-[color:var(--neutral-faint)]"
                }`}
              >
                {b.label}
              </span>
            </div>
          );
        })}
      </div>

      <p className="mt-5 text-[14px] text-[color:var(--slate-ink)]">
        This vehicle scored <span className="font-medium">{Math.round(score)}/100</span> →{" "}
        <span className="font-medium">No price adjustment</span>. Base market value of ₹
        {r.value.point}L confirmed.
      </p>
    </div>
  );
}
