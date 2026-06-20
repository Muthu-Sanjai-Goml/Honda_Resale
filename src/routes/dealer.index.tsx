import { createFileRoute, Link } from "@tanstack/react-router";
import { Bookmark, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { useSubmissions, type Submission } from "@/lib/submissions";

export const Route = createFileRoute("/dealer/")({
  component: InboxPage,
});

function scoreColor(s: number) {
  if (s >= 85) return "var(--score-green)";
  if (s >= 70) return "var(--score-amber)";
  if (s >= 55) return "var(--score-orange)";
  return "var(--score-red)";
}

function timeAgo(iso: string) {
  const ms = Date.now() - new Date(iso).getTime();
  const h = Math.floor(ms / 36e5);
  if (h < 1) return "just now";
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const STATUS_STYLES: Record<Submission["status"], { bg: string; fg: string }> = {
  New: { bg: "#e601211a", fg: "#e60121" },
  Reviewed: { bg: "#1A2B4A1a", fg: "#1A2B4A" },
  Quoted: { bg: "#16A34A1a", fg: "#16A34A" },
  Closed: { bg: "#9CA3AF26", fg: "#6B7280" },
};

function InboxPage() {
  const { submissions, toggleSaved } = useSubmissions();
  const [filter, setFilter] = useState<"All" | Submission["status"]>("All");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return submissions.filter((s) => {
      if (filter !== "All" && s.status !== filter) return false;
      if (!q) return true;
      return (
        s.id.toLowerCase().includes(q) ||
        s.ownerName.toLowerCase().includes(q) ||
        s.report.vehicle.model.toLowerCase().includes(q) ||
        s.report.vehicle.city.toLowerCase().includes(q)
      );
    });
  }, [submissions, filter, query]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { All: submissions.length };
    for (const s of submissions) c[s.status] = (c[s.status] || 0) + 1;
    return c;
  }, [submissions]);

  const STATS = [
    { label: "Total Passports", value: submissions.length },
    { label: "New This Week", value: counts["New"] || 0 },
    {
      label: "Avg Health Score",
      value:
        Math.round(
          submissions.reduce((acc, s) => acc + s.report.scores.total, 0) /
            Math.max(submissions.length, 1),
        ) + "/100",
    },
    {
      label: "Avg Value",
      value:
        "₹" +
        (
          submissions.reduce((acc, s) => acc + s.report.value.point, 0) /
          Math.max(submissions.length, 1)
        ).toFixed(1) +
        "L",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="page-title">Passport Inbox</h1>
          <p className="mt-0.5 text-[12px] text-[color:var(--neutral-muted)]">
            Live submissions from Honda owners in your region.
          </p>
        </div>
      </div>

      <div className="kpi-strip">
        {STATS.map((s) => (
          <div key={s.label} className="kpi-cell">
            <div className="kpi-label">{s.label}</div>
            <div className="kpi-value">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="hvp-card !p-0 overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-[color:var(--neutral-line)] p-4 sm:p-5">
          <div className="flex flex-wrap gap-1.5">
            {(["All", "New", "Reviewed", "Quoted", "Closed"] as const).map((t) => {
              const active = filter === t;
              return (
                <button
                  key={t}
                  onClick={() => setFilter(t)}
                  className={`rounded-full px-3 py-1.5 text-[12px] font-medium transition ${
                    active
                      ? "bg-[color:var(--honda-accent)] text-white"
                      : "bg-[color:var(--surface)] text-[color:var(--slate-ink)] hover:bg-[color:var(--neutral-soft)]"
                  }`}
                >
                  {t}{" "}
                  <span
                    className={
                      active ? "opacity-80" : "text-[color:var(--neutral-faint)]"
                    }
                  >
                    {counts[t] ?? 0}
                  </span>
                </button>
              );
            })}
          </div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter…"
            className="ml-auto h-9 w-full sm:w-[220px] rounded-[8px] border border-[color:var(--neutral-line)] bg-white px-3 text-[13px] focus:border-[color:var(--honda-accent)] focus:outline-none"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-[13px]">
            <thead className="bg-[color:var(--surface)] text-[11px] tracking-[0.06em] text-[color:var(--neutral-muted)] uppercase">
              <tr>
                <th className="px-3 py-2.5 font-medium">Passport ID</th>
                <th className="px-3 py-2.5 font-medium">Vehicle</th>
                <th className="px-3 py-2.5 font-medium">Owner</th>
                <th className="px-3 py-2.5 font-medium">City</th>
                <th className="px-3 py-2.5 font-medium">Score</th>
                <th className="px-3 py-2.5 font-medium">Est. Value</th>
                <th className="px-3 py-2.5 font-medium">Status</th>
                <th className="px-3 py-2.5 font-medium">Received</th>
                <th className="px-3 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => {
                const v = s.report.vehicle;
                const score = Math.round(s.report.scores.total);
                const st = STATUS_STYLES[s.status];
                return (
                  <tr
                    key={s.id}
                    className="group border-t border-[color:var(--neutral-line)] transition hover:bg-[color:var(--surface)]"
                  >
                    <td className="px-3 py-2.5 font-medium text-[color:var(--slate-ink)] whitespace-nowrap">
                      {s.id}
                    </td>
                    <td className="px-3 py-2.5 text-[color:var(--slate-ink)] whitespace-nowrap">
                      {v.model} {v.variant}
                      <div className="text-[11px] text-[color:var(--neutral-muted)]">
                        {v.year} · {v.fuel} · {v.odometer.toLocaleString("en-IN")} km
                      </div>
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap">{s.ownerName}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap">{v.city}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <span
                        className="inline-flex items-center gap-2 font-medium"
                        style={{ color: scoreColor(score) }}
                      >
                        <span
                          className="inline-block h-1.5 w-1.5 rounded-full"
                          style={{ background: scoreColor(score) }}
                        />
                        {score}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap font-medium text-[color:var(--slate-ink)]">
                      ₹{s.report.value.low}L–{s.report.value.high}L
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <span
                        className="rounded-full px-2 py-0.5 text-[11px] font-medium"
                        style={{ background: st.bg, color: st.fg }}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-[color:var(--neutral-muted)]">
                      {timeAgo(s.submittedAt)}
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-right">
                      <button
                        onClick={() => toggleSaved(s.id)}
                        className={`mr-2 inline-flex h-7 w-7 items-center justify-center rounded-full transition ${
                          s.saved
                            ? "bg-[color:var(--honda-accent)]/10 text-[color:var(--honda-accent)]"
                            : "text-[color:var(--neutral-faint)] hover:bg-[color:var(--surface)]"
                        }`}
                        aria-label="Save"
                      >
                        <Bookmark
                          size={14}
                          fill={s.saved ? "currentColor" : "none"}
                        />
                      </button>
                      <Link
                        to="/dealer/vehicle/$id"
                        params={{ id: s.id }}
                        className="inline-flex items-center gap-1 text-[12px] font-medium text-[color:var(--honda-accent)] hover:underline"
                      >
                        View <ChevronRight size={14} />
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-10 text-center text-[13px] text-[color:var(--neutral-muted)]"
                  >
                    No submissions match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
