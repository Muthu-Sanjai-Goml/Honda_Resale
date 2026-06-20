import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useSubmissions } from "@/lib/submissions";

export const Route = createFileRoute("/dealer/analytics")({
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const { submissions } = useSubmissions();

  const byModel = useMemo(() => {
    const m: Record<string, { count: number; value: number }> = {};
    for (const s of submissions) {
      const k = s.report.vehicle.model;
      m[k] = m[k] || { count: 0, value: 0 };
      m[k].count += 1;
      m[k].value += s.report.value.point;
    }
    return Object.entries(m)
      .map(([model, v]) => ({ model, count: v.count, avgValue: +(v.value / v.count).toFixed(1) }))
      .sort((a, b) => b.count - a.count);
  }, [submissions]);

  const byCity = useMemo(() => {
    const m: Record<string, number> = {};
    for (const s of submissions) {
      const k = s.report.vehicle.city;
      m[k] = (m[k] || 0) + 1;
    }
    return Object.entries(m)
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count);
  }, [submissions]);

  const scoreBuckets = useMemo(() => {
    const buckets = [
      { range: "<60", min: 0, max: 59, count: 0 },
      { range: "60–69", min: 60, max: 69, count: 0 },
      { range: "70–79", min: 70, max: 79, count: 0 },
      { range: "80–89", min: 80, max: 89, count: 0 },
      { range: "90+", min: 90, max: 100, count: 0 },
    ];
    for (const s of submissions) {
      const t = s.report.scores.total;
      const b = buckets.find((b) => t >= b.min && t <= b.max);
      if (b) b.count += 1;
    }
    return buckets;
  }, [submissions]);

  const avgScore = Math.round(
    submissions.reduce((a, s) => a + s.report.scores.total, 0) /
      Math.max(submissions.length, 1),
  );
  const avgValue = (
    submissions.reduce((a, s) => a + s.report.value.point, 0) /
    Math.max(submissions.length, 1)
  ).toFixed(2);

  const KPIS = [
    { label: "Submissions", value: submissions.length },
    { label: "Avg Health Score", value: `${avgScore}/100` },
    { label: "Avg Estimated Value", value: `₹${avgValue}L` },
    { label: "Unique Models", value: byModel.length },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="page-title">Market Snapshot</h1>
        <p className="mt-0.5 text-[12px] text-[color:var(--neutral-muted)]">
          Aggregated insights across all incoming Honda Value Passports.
        </p>
      </div>

      <div className="kpi-strip">
        {KPIS.map((k) => (
          <div key={k.label} className="kpi-cell">
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-value">{k.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="hvp-card">
          <div className="font-display text-[18px] font-semibold text-[color:var(--slate-ink)]">
            Top Models
          </div>
          <div className="text-[12px] text-[color:var(--neutral-muted)]">
            Submission volume by Honda model
          </div>
          <div className="mt-4 h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byModel} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
                <CartesianGrid vertical={false} stroke="#F3F4F6" />
                <XAxis
                  dataKey="model"
                  tick={{ fill: "#6B7280", fontSize: 11 }}
                  axisLine={{ stroke: "#E5E7EB" }}
                  tickLine={false}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                  height={50}
                />
                <YAxis
                  tick={{ fill: "#9CA3AF", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip cursor={{ fill: "#f7f6f3" }} />
                <Bar dataKey="count" fill="#e60121" radius={[6, 6, 0, 0]} barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="hvp-card">
          <div className="font-display text-[18px] font-semibold text-[color:var(--slate-ink)]">
            Health Score Distribution
          </div>
          <div className="text-[12px] text-[color:var(--neutral-muted)]">
            How submitted vehicles score overall
          </div>
          <div className="mt-4 h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scoreBuckets} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
                <CartesianGrid vertical={false} stroke="#F3F4F6" />
                <XAxis
                  dataKey="range"
                  tick={{ fill: "#6B7280", fontSize: 11 }}
                  axisLine={{ stroke: "#E5E7EB" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#9CA3AF", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip cursor={{ fill: "#f7f6f3" }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={36}>
                  {scoreBuckets.map((b, i) => {
                    const colors = ["#DC2626", "#EA580C", "#D97706", "#84CC16", "#16A34A"];
                    return <Cell key={i} fill={colors[i]} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="hvp-card lg:col-span-2">
          <div className="font-display text-[18px] font-semibold text-[color:var(--slate-ink)]">
            City Activity
          </div>
          <div className="text-[12px] text-[color:var(--neutral-muted)]">
            Where Passport submissions are coming from
          </div>
          <div className="mt-4 space-y-2">
            {byCity.map((c) => {
              const pct = (c.count / submissions.length) * 100;
              return (
                <div key={c.city} className="flex items-center gap-3">
                  <div className="w-[110px] text-[13px] text-[color:var(--slate-ink)]">
                    {c.city}
                  </div>
                  <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-[color:var(--surface)]">
                    <div
                      className="absolute inset-y-0 left-0 rounded-full bg-[color:var(--honda-accent)]"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="w-[40px] text-right text-[12px] font-medium text-[color:var(--neutral-muted)]">
                    {c.count}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
