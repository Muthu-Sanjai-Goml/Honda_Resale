import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { useSession } from "@/lib/session";
import { useSubmissions, vehicleKey } from "@/lib/submissions";

export const Route = createFileRoute("/owner/history")({
  component: HistoryPage,
});

function scoreColor(s: number) {
  if (s >= 85) return "var(--score-green)";
  if (s >= 70) return "var(--score-amber)";
  if (s >= 55) return "var(--score-orange)";
  return "var(--score-red)";
}

function HistoryPage() {
  const { session } = useSession();
  const { submissions } = useSubmissions();

  const mine = useMemo(
    () =>
      submissions
        .filter((s) => s.ownerName === session?.name)
        .sort((a, b) => +new Date(b.submittedAt) - +new Date(a.submittedAt)),
    [submissions, session?.name],
  );

  return (
    <div className="space-y-4">
      <div>
        <div className="section-label">Activity</div>
        <h1 className="mt-1 font-display text-[22px] font-semibold leading-tight text-[color:var(--slate-ink)]">
          Passport History
        </h1>
        <p className="mt-1 text-[14px] text-[color:var(--neutral-muted)]">
          Every Value Passport you've ever generated, across all your vehicles.
        </p>
      </div>

      <div className="hvp-card !p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-[13px]">
            <thead className="bg-[color:var(--surface)] text-[11px] tracking-[0.06em] text-[color:var(--neutral-muted)] uppercase">
              <tr>
                <th className="px-4 py-3 font-medium">Passport</th>
                <th className="px-4 py-3 font-medium">Vehicle</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Odometer</th>
                <th className="px-4 py-3 font-medium">Score</th>
                <th className="px-4 py-3 font-medium">Value</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {mine.map((s) => {
                const score = Math.round(s.report.scores.total);
                return (
                  <tr key={s.id} className="border-t border-[color:var(--neutral-line)] hover:bg-[color:var(--surface)]">
                    <td className="px-4 py-3 font-medium text-[color:var(--slate-ink)]">{s.id}</td>
                    <td className="px-4 py-3">
                      {s.report.vehicle.model}
                      <div className="text-[11px] text-[color:var(--neutral-muted)]">
                        {s.report.vehicle.variant} · {s.report.vehicle.year}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[color:var(--neutral-muted)]">
                      {new Date(s.submittedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3">{s.report.vehicle.odometer.toLocaleString("en-IN")} km</td>
                    <td className="px-4 py-3">
                      <span className="font-medium" style={{ color: scoreColor(score) }}>{score}</span>
                    </td>
                    <td className="px-4 py-3 font-medium text-[color:var(--slate-ink)]">₹{s.report.value.point}L</td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to="/owner/vehicle/$key"
                        params={{ key: vehicleKey(s.report.vehicle) }}
                        className="text-[12px] font-medium text-[color:var(--honda-red)] hover:underline"
                      >
                        View timeline
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {mine.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-[color:var(--neutral-muted)]">No passports yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
