import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import type { MockReport } from "@/lib/passport-mock";

type Props = { r: MockReport };

function color(score: number) {
  if (score >= 90) return "#16A34A";
  if (score >= 75) return "#D97706";
  if (score >= 60) return "#EA580C";
  return "#DC2626";
}

export function ScoreBreakdownChart({ r }: Props) {
  const data = r.breakdown.map((b) => ({
    factor: b.factor.replace(" Condition", ""),
    score: b.score,
    max: 100,
  }));

  return (
    <div className="hvp-card">
      <div className="mb-1 flex items-center justify-between">
        <div className="font-display text-[20px] font-semibold text-[color:var(--slate-ink)]">
          How Your Score Was Calculated
        </div>
      </div>
      <div className="text-[13px] text-[color:var(--neutral-muted)]">
        Weighted health score breakdown
      </div>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[1.3fr_1fr]">
        <div className="h-[240px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={data}
              margin={{ top: 4, right: 16, bottom: 4, left: 16 }}
              barCategoryGap={12}
            >
              <CartesianGrid horizontal={false} stroke="#F3F4F6" />
              <XAxis
                type="number"
                domain={[0, 100]}
                tick={{ fill: "#9CA3AF", fontSize: 11 }}
                axisLine={{ stroke: "#E5E7EB" }}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="factor"
                tick={{ fill: "#1A2B4A", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                width={90}
              />
              <Bar dataKey="max" fill="#F3F4F6" radius={[4, 4, 4, 4]} barSize={14} />
              <Bar dataKey="score" radius={[4, 4, 4, 4]} barSize={14}>
                {data.map((d, i) => (
                  <Cell key={i} fill={color(d.score)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="overflow-x-auto rounded-[8px] border border-[color:var(--neutral-line)]">
          <table className="w-full min-w-[360px] text-left text-[13px]">
            <thead className="bg-[color:var(--surface)] text-[11px] tracking-[0.06em] text-[color:var(--neutral-muted)] uppercase">
              <tr>
                <th className="px-3 py-2 font-medium">Factor</th>
                <th className="px-3 py-2 font-medium">Score</th>
                <th className="px-3 py-2 font-medium">Weight</th>
                <th className="px-3 py-2 font-medium">Contrib.</th>
              </tr>
            </thead>
            <tbody>
              {r.breakdown.map((b) => (
                <tr key={b.factor} className="border-t border-[color:var(--neutral-line)]">
                  <td className="px-3 py-2 text-[color:var(--slate-ink)] whitespace-nowrap">{b.factor}</td>
                  <td className="px-3 py-2">{b.score}</td>
                  <td className="px-3 py-2">{b.weight}%</td>
                  <td className="px-3 py-2">{b.contribution.toFixed(1)}</td>
                </tr>
              ))}
              <tr className="border-t border-[color:var(--neutral-line)] bg-[color:var(--surface)] font-medium text-[color:var(--slate-ink)]">
                <td className="px-3 py-2">Total</td>
                <td className="px-3 py-2"></td>
                <td className="px-3 py-2">100%</td>
                <td className="px-3 py-2">{r.scores.total.toFixed(1)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
