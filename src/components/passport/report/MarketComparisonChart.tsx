import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import type { MockReport } from "@/lib/passport-mock";

type Props = { r: MockReport };

export function MarketComparisonChart({ r }: Props) {
  return (
    <div className="hvp-card">
      <div className="font-display text-[20px] font-semibold text-[color:var(--slate-ink)]">
        How this {r.vehicle.model} {r.vehicle.year} holds value over kilometres
      </div>
      <div className="text-[13px] text-[color:var(--neutral-muted)]">
        Depreciation curve with ±10% confidence band
      </div>
      <div className="mt-5 h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={r.market}
            margin={{ top: 10, right: 24, bottom: 10, left: 0 }}
          >
            <defs>
              <linearGradient id="band" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1A2B4A" stopOpacity={0.12} />
                <stop offset="100%" stopColor="#1A2B4A" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#F3F4F6" vertical={false} />
            <XAxis
              dataKey="km"
              tick={{ fill: "#9CA3AF", fontSize: 11 }}
              axisLine={{ stroke: "#E5E7EB" }}
              tickLine={false}
              tickFormatter={(v) => `${v / 1000}k`}
              label={{
                value: "Odometer (km)",
                position: "insideBottom",
                offset: -2,
                fill: "#6B7280",
                fontSize: 11,
              }}
            />
            <YAxis
              tick={{ fill: "#9CA3AF", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `₹${v}L`}
            />
            <Area
              type="monotone"
              dataKey="high"
              stroke="transparent"
              fill="url(#band)"
            />
            <Area
              type="monotone"
              dataKey="low"
              stroke="transparent"
              fill="#ffffff"
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#1A2B4A"
              strokeWidth={2}
              fill="transparent"
            />
            <ReferenceLine
              x={r.vehicle.odometer}
              stroke="#CC0000"
              strokeDasharray="4 4"
              label={{
                value: `Your vehicle — ₹${r.value.point}L`,
                position: "top",
                fill: "#CC0000",
                fontSize: 12,
                fontWeight: 500,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
