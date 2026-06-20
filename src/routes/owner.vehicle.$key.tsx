import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { ChevronLeft, ChevronRight, Minus, TrendingDown, TrendingUp } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceDot,
} from "recharts";
import { useSession } from "@/lib/session";
import { useSubmissions, vehicleKey } from "@/lib/submissions";

export const Route = createFileRoute("/owner/vehicle/$key")({
  component: VehicleHistory,
});

function fmtDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
function shortDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
}
function scoreColor(s: number) {
  if (s >= 85) return "var(--score-green)";
  if (s >= 70) return "var(--score-amber)";
  if (s >= 55) return "var(--score-orange)";
  return "var(--score-red)";
}

function VehicleHistory() {
  const { key } = Route.useParams();
  const { session } = useSession();
  const { submissions } = useSubmissions();

  const passports = useMemo(
    () =>
      submissions
        .filter((s) => s.ownerName === session?.name && vehicleKey(s.report.vehicle) === key)
        .sort((a, b) => +new Date(a.submittedAt) - +new Date(b.submittedAt)),
    [submissions, session?.name, key],
  );

  if (passports.length === 0) {
    return (
      <div className="hvp-card">
        <div className="font-display text-[22px] font-semibold text-[color:var(--slate-ink)]">
          Vehicle not found
        </div>
        <Link
          to="/owner"
          className="mt-3 inline-flex items-center gap-1 text-[13px] font-medium text-[color:var(--honda-red)]"
        >
          <ChevronLeft size={14} /> Back to dashboard
        </Link>
      </div>
    );
  }

  const v = passports[0].report.vehicle;
  const latest = passports.at(-1)!;
  const first = passports[0];

  const chartData = passports.map((p) => ({
    date: shortDate(p.submittedAt),
    fullDate: fmtDate(p.submittedAt),
    score: +p.report.scores.total.toFixed(1),
    value: p.report.value.point,
    odometer: p.report.vehicle.odometer,
    id: p.id,
  }));

  const scoreDelta = latest.report.scores.total - first.report.scores.total;
  const valueDelta = latest.report.value.point - first.report.value.point;

  const factors: { key: keyof typeof latest.report.scores; label: string }[] = [
    { key: "exterior", label: "Exterior" },
    { key: "interior", label: "Interior" },
    { key: "service", label: "Service" },
    { key: "mileage", label: "Mileage" },
  ];

  return (
    <div className="space-y-4">
      <Link
        to="/owner"
        className="inline-flex items-center gap-1 text-[12px] font-medium text-[color:var(--neutral-muted)] hover:text-[color:var(--slate-ink)]"
      >
        <ChevronLeft size={14} /> All vehicles
      </Link>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="section-label">Vehicle History</div>
          <h1 className="mt-1 font-display text-[22px] font-semibold leading-tight text-[color:var(--slate-ink)]">
            {v.model}
          </h1>
          <p className="mt-1 text-[13px] text-[color:var(--neutral-muted)]">
            {v.variant} · {v.year} · {v.fuel} · {v.transmission} · {v.city}
          </p>
        </div>
        <Link
          to="/owner/new"
          className="inline-flex items-center gap-2 rounded-[8px] bg-[color:var(--honda-red)] px-4 py-2.5 text-[13px] font-medium text-white shadow-sm hover:opacity-90"
        >
          Refresh Passport
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Current Score" value={`${Math.round(latest.report.scores.total)}/100`}
          delta={scoreDelta} />
        <Stat label="Est. Value" value={`₹${latest.report.value.point}L`} delta={valueDelta}
          deltaSuffix="L" />
        <Stat label="Passports" value={String(passports.length)} />
        <Stat label="Latest Odometer" value={`${latest.report.vehicle.odometer.toLocaleString("en-IN")} km`} />
      </div>

      <div className="hvp-card">
        <div className="flex items-center justify-between">
          <div>
            <div className="section-label">Score Trend</div>
            <div className="mt-1 font-display text-[18px] font-semibold text-[color:var(--slate-ink)]">
              Resale score over time
            </div>
          </div>
        </div>
        <div className="mt-4 h-[260px] w-full">
          <ResponsiveContainer>
            <LineChart data={chartData} margin={{ top: 10, right: 20, bottom: 0, left: -10 }}>
              <CartesianGrid stroke="var(--neutral-line)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--neutral-muted)" }}
                axisLine={false} tickLine={false} />
              <YAxis domain={[40, 100]} tick={{ fontSize: 11, fill: "var(--neutral-muted)" }}
                axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: "white",
                  border: "1px solid var(--neutral-line)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(val: number) => [`${val}/100`, "Score"]}
                labelFormatter={(_, p) => (p?.[0]?.payload?.fullDate as string) ?? ""}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="var(--honda-red)"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "var(--honda-red)", strokeWidth: 0 }}
                activeDot={{ r: 6 }}
              />
              <ReferenceDot
                x={chartData.at(-1)!.date}
                y={chartData.at(-1)!.score}
                r={6}
                fill="var(--honda-accent)"
                stroke="white"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="hvp-card !p-0 overflow-hidden">
        <div className="border-b border-[color:var(--neutral-line)] p-5">
          <div className="section-label">Passport Timeline</div>
          <div className="mt-1 font-display text-[18px] font-semibold text-[color:var(--slate-ink)]">
            Each assessment, oldest first
          </div>
        </div>
        <div className="divide-y divide-[color:var(--neutral-line)]">
          {passports.map((p, i) => {
            const prev = i > 0 ? passports[i - 1] : null;
            const score = Math.round(p.report.scores.total);
            const d = prev ? p.report.scores.total - prev.report.scores.total : 0;
            return (
              <div key={p.id} className="flex flex-wrap items-center gap-4 p-5 hover:bg-[color:var(--surface)]">
                <div className="flex h-10 w-10 items-center justify-center rounded-full font-display text-[13px] font-semibold text-white"
                  style={{ background: scoreColor(score) }}>
                  {score}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="font-medium text-[14px] text-[color:var(--slate-ink)]">{p.id}</div>
                    {i === passports.length - 1 && (
                      <span className="rounded-full bg-[color:var(--honda-accent)]/10 px-2 py-0.5 text-[10px] font-medium text-[color:var(--honda-accent)]">
                        Latest
                      </span>
                    )}
                  </div>
                  <div className="text-[12px] text-[color:var(--neutral-muted)]">
                    {fmtDate(p.submittedAt)} · {p.report.vehicle.odometer.toLocaleString("en-IN")} km · ₹{p.report.value.point}L
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <DeltaPill delta={d} suffix="" first={!prev} />
                  <div className="hidden text-right sm:block">
                    {factors.map((f) => (
                      <span key={f.key} className="ml-3 text-[11px] text-[color:var(--neutral-muted)]">
                        {f.label}:{" "}
                        <span className="font-medium text-[color:var(--slate-ink)]">
                          {p.report.scores[f.key]}
                        </span>
                      </span>
                    ))}
                  </div>
                  <ChevronRight size={14} className="text-[color:var(--neutral-faint)]" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, delta, deltaSuffix = "" }:
  { label: string; value: string; delta?: number; deltaSuffix?: string }) {
  return (
    <div className="hvp-card">
      <div className="section-label">{label}</div>
      <div className="mt-2 font-display text-[24px] font-semibold text-[color:var(--slate-ink)]">
        {value}
      </div>
      {typeof delta === "number" && (
        <div
          className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium"
          style={{ color: delta === 0 ? "var(--neutral-muted)" : delta > 0 ? "var(--score-green)" : "var(--score-red)" }}
        >
          {delta === 0 ? <Minus size={11} /> : delta > 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
          {delta > 0 ? "+" : ""}{delta.toFixed(1)}{deltaSuffix} since first
        </div>
      )}
    </div>
  );
}

function DeltaPill({ delta, suffix, first }: { delta: number; suffix: string; first?: boolean }) {
  if (first) {
    return (
      <span className="rounded-full bg-[color:var(--surface)] px-2 py-0.5 text-[11px] font-medium text-[color:var(--neutral-muted)]">
        Baseline
      </span>
    );
  }
  const color = delta === 0 ? "var(--neutral-muted)" : delta > 0 ? "var(--score-green)" : "var(--score-red)";
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium"
      style={{ background: `color-mix(in oklab, ${color} 12%, transparent)`, color }}
    >
      {delta === 0 ? <Minus size={11} /> : delta > 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
      {delta > 0 ? "+" : ""}{delta.toFixed(1)}{suffix}
    </span>
  );
}
