import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { ArrowUpRight, Car, PlusCircle, TrendingDown, TrendingUp } from "lucide-react";
import { useSession } from "@/lib/session";
import { useSubmissions, vehicleKey, type Submission } from "@/lib/submissions";

export const Route = createFileRoute("/owner/")({
  component: OwnerDashboard,
});

type Group = {
  key: string;
  model: string;
  variant: string;
  year: number;
  city: string;
  passports: Submission[]; // sorted oldest -> newest
};

function groupByVehicle(subs: Submission[]): Group[] {
  const map = new Map<string, Group>();
  for (const s of subs) {
    const k = vehicleKey(s.report.vehicle);
    const v = s.report.vehicle;
    if (!map.has(k)) {
      map.set(k, { key: k, model: v.model, variant: v.variant, year: v.year, city: v.city, passports: [] });
    }
    map.get(k)!.passports.push(s);
  }
  for (const g of map.values()) {
    g.passports.sort((a, b) => +new Date(a.submittedAt) - +new Date(b.submittedAt));
  }
  return Array.from(map.values()).sort(
    (a, b) =>
      +new Date(b.passports.at(-1)!.submittedAt) -
      +new Date(a.passports.at(-1)!.submittedAt),
  );
}

function scoreColor(s: number) {
  if (s >= 85) return "var(--score-green)";
  if (s >= 70) return "var(--score-amber)";
  if (s >= 55) return "var(--score-orange)";
  return "var(--score-red)";
}

function OwnerDashboard() {
  const { session } = useSession();
  const { submissions } = useSubmissions();

  const mine = useMemo(
    () => submissions.filter((s) => s.ownerName === session?.name),
    [submissions, session?.name],
  );
  const groups = useMemo(() => groupByVehicle(mine), [mine]);

  const totalPassports = mine.length;
  const latestScore =
    mine.length > 0
      ? Math.round(
          [...mine].sort((a, b) => +new Date(b.submittedAt) - +new Date(a.submittedAt))[0].report
            .scores.total,
        )
      : 0;
  const totalValue = mine.reduce(
    (acc, s) => acc + s.report.value.point,
    0,
  );

  const STATS = [
    { label: "Vehicles", value: groups.length },
    { label: "Passports created", value: totalPassports },
    { label: "Latest score", value: latestScore ? `${latestScore}/100` : "—" },
    { label: "Combined value", value: `₹${totalValue.toFixed(1)}L` },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="page-title">Welcome back, {session?.name.split(" ")[0]}</h1>
          <p className="mt-0.5 text-[12px] text-[color:var(--neutral-muted)]">
            Track every Value Passport you've created and how scores evolve over time.
          </p>
        </div>
        <Link
          to="/owner/new"
          className="inline-flex items-center gap-1.5 rounded-[7px] bg-[color:var(--honda-red)] px-3 py-2 text-[12px] font-medium text-white shadow-sm hover:opacity-90"
        >
          <PlusCircle size={14} /> New Passport
        </Link>
      </div>

      <div className="kpi-strip">
        {STATS.map((s) => (
          <div key={s.label} className="kpi-cell">
            <div className="kpi-label">{s.label}</div>
            <div className="kpi-value">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-[18px] font-semibold text-[color:var(--slate-ink)]">
            Your Vehicles
          </h2>
          <span className="text-[12px] text-[color:var(--neutral-muted)]">
            {groups.length} {groups.length === 1 ? "vehicle" : "vehicles"}
          </span>
        </div>

        {groups.length === 0 && (
          <div className="hvp-card text-center">
            <Car size={28} className="mx-auto text-[color:var(--neutral-faint)]" />
            <div className="mt-3 font-display text-[18px] font-semibold text-[color:var(--slate-ink)]">
              No passports yet
            </div>
            <p className="mt-1 text-[13px] text-[color:var(--neutral-muted)]">
              Create your first Value Passport to start tracking your Honda's resale score.
            </p>
            <Link
              to="/owner/new"
              className="mt-4 inline-flex items-center gap-2 rounded-[8px] bg-[color:var(--honda-red)] px-4 py-2 text-[13px] font-medium text-white"
            >
              <PlusCircle size={14} /> Create Passport
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {groups.map((g) => {
            const latest = g.passports.at(-1)!;
            const first = g.passports[0];
            const latestScore = Math.round(latest.report.scores.total);
            const delta = latest.report.scores.total - first.report.scores.total;
            const trend = delta >= 0 ? "up" : "down";
            return (
              <Link
                key={g.key}
                to="/owner/vehicle/$key"
                params={{ key: g.key }}
                className="hvp-card group flex flex-col gap-4 transition hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-display text-[20px] font-semibold leading-tight text-[color:var(--slate-ink)]">
                      {g.model}
                    </div>
                    <div className="text-[12px] text-[color:var(--neutral-muted)]">
                      {g.variant} · {g.year} · {g.city}
                    </div>
                  </div>
                  <ArrowUpRight
                    size={18}
                    className="text-[color:var(--neutral-faint)] transition group-hover:text-[color:var(--honda-red)]"
                  />
                </div>

                <div className="flex items-end justify-between">
                  <div>
                    <div className="section-label">Current Score</div>
                    <div
                      className="mt-1 font-display text-[34px] font-semibold leading-none"
                      style={{ color: scoreColor(latestScore) }}
                    >
                      {latestScore}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="section-label">Est. Value</div>
                    <div className="mt-1 font-display text-[20px] font-semibold text-[color:var(--slate-ink)]">
                      ₹{latest.report.value.point}L
                    </div>
                  </div>
                </div>

                <Sparkline passports={g.passports} />

                <div className="flex items-center justify-between border-t border-[color:var(--neutral-line)] pt-3 text-[12px]">
                  <span className="text-[color:var(--neutral-muted)]">
                    {g.passports.length} {g.passports.length === 1 ? "passport" : "passports"}
                  </span>
                  <span
                    className="inline-flex items-center gap-1 font-medium"
                    style={{
                      color: trend === "up" ? "var(--score-green)" : "var(--score-red)",
                    }}
                  >
                    {trend === "up" ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                    {delta >= 0 ? "+" : ""}
                    {delta.toFixed(1)} since first
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Sparkline({ passports }: { passports: Submission[] }) {
  if (passports.length < 2) {
    return (
      <div className="rounded-[6px] bg-[color:var(--surface)] px-3 py-2 text-[11px] text-[color:var(--neutral-muted)]">
        Create another passport to see your score trend.
      </div>
    );
  }
  const w = 280, h = 48, pad = 4;
  const ys = passports.map((p) => p.report.scores.total);
  const min = Math.min(...ys) - 4;
  const max = Math.max(...ys) + 4;
  const range = Math.max(max - min, 1);
  const pts = passports.map((p, i) => {
    const x = pad + (i / (passports.length - 1)) * (w - pad * 2);
    const y = h - pad - ((p.report.scores.total - min) / range) * (h - pad * 2);
    return `${x},${y}`;
  });
  const lineColor = "var(--honda-red)";
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-12 w-full">
      <polyline
        fill="none"
        stroke={lineColor}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        points={pts.join(" ")}
      />
      {pts.map((pt, i) => {
        const [x, y] = pt.split(",");
        return <circle key={i} cx={x} cy={y} r={2.5} fill={lineColor} />;
      })}
    </svg>
  );
}
