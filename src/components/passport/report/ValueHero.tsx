import { ArrowRight } from "lucide-react";
import {
  RadialBar,
  RadialBarChart,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";
import type { MockReport } from "@/lib/passport-mock";

type Props = { r: MockReport };

const SEGMENT_COLORS = ["#16A34A", "#D97706", "#1A2B4A", "#CC0000"];

export function ValueHero({ r }: Props) {
  const ringData = [{ name: "Health", value: r.scores.total, fill: "#CC0000" }];

  const legend = [
    { label: "Exterior", color: SEGMENT_COLORS[0], v: r.scores.exterior },
    { label: "Interior", color: SEGMENT_COLORS[1], v: r.scores.interior },
    { label: "Service", color: SEGMENT_COLORS[2], v: r.scores.service },
    { label: "Mileage", color: SEGMENT_COLORS[3], v: r.scores.mileage },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
      <div className="hvp-card flex flex-col gap-5">
        <div className="section-label">Estimated Resale Value</div>
        <div className="font-display text-[34px] sm:text-[44px] lg:text-[52px] font-semibold leading-[1.05] text-[color:var(--slate-ink)] break-words">
          ₹ {r.value.low}L – {r.value.high}L
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-[13px] text-[color:var(--neutral-muted)]">
            Estimated resale range · {r.value.asOf}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--score-green)]/10 px-2.5 py-1 text-[12px] font-medium text-[color:var(--score-green)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--score-green)]" />
            High Confidence · {r.value.confidence}%
          </span>
        </div>
        <p className="text-[14px] text-[color:var(--neutral-muted)]">
          Based on {r.value.comparables} comparable {r.vehicle.model} listings in{" "}
          {r.vehicle.city} this month.
        </p>
        <button className="mt-auto inline-flex h-11 w-fit items-center gap-2 rounded-[8px] bg-[color:var(--honda-red)] px-5 text-[14px] font-medium text-white transition hover:bg-[color:var(--honda-red-hover)]">
          Get Dealer Quotes <ArrowRight size={16} />
        </button>
      </div>

      <div className="hvp-card flex flex-col items-center justify-center gap-3">
        <div className="relative h-[180px] w-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              cx="50%"
              cy="50%"
              innerRadius="78%"
              outerRadius="100%"
              barSize={14}
              data={ringData}
              startAngle={90}
              endAngle={-270}
            >
              <PolarAngleAxis
                type="number"
                domain={[0, 100]}
                tick={false}
                axisLine={false}
              />
              <RadialBar
                background={{ fill: "#F3F4F6" }}
                dataKey="value"
                cornerRadius={8}
              />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="font-display text-[44px] font-semibold leading-none text-[color:var(--slate-ink)]">
              {Math.round(r.scores.total)}
            </div>
            <div className="text-[13px] text-[color:var(--neutral-muted)]">
              / 100
            </div>
          </div>
        </div>
        <div className="text-[13px] font-medium tracking-[0.04em] text-[color:var(--slate-ink)] uppercase">
          Vehicle Health Score
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5">
          {legend.map((l) => (
            <span
              key={l.label}
              className="inline-flex items-center gap-1.5 text-[11px] text-[color:var(--neutral-muted)]"
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: l.color }}
              />
              {l.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
