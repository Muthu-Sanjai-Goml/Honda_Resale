import { createFileRoute, Link } from "@tanstack/react-router";
import { Bookmark } from "lucide-react";
import { useSubmissions } from "@/lib/submissions";

export const Route = createFileRoute("/dealer/saved")({
  component: SavedPage,
});

function SavedPage() {
  const { submissions, toggleSaved } = useSubmissions();
  const saved = submissions.filter((s) => s.saved);

  return (
    <div className="space-y-4">
      <div>
        <div className="section-label">Shortlist</div>
        <h1 className="mt-1 font-display text-[22px] font-semibold leading-tight text-[color:var(--slate-ink)]">
          Saved Vehicles
        </h1>
        <p className="mt-1 text-[14px] text-[color:var(--neutral-muted)]">
          Passports you've flagged for follow-up.
        </p>
      </div>

      {saved.length === 0 ? (
        <div className="hvp-card flex flex-col items-center justify-center gap-3 py-16 text-center">
          <Bookmark size={28} className="text-[color:var(--neutral-faint)]" />
          <div className="font-display text-[20px] font-semibold text-[color:var(--slate-ink)]">
            No shortlisted passports yet
          </div>
          <p className="max-w-[360px] text-[13px] text-[color:var(--neutral-muted)]">
            Tap the bookmark icon on any inbox row or detail page to keep it
            here for quick access.
          </p>
          <Link
            to="/dealer"
            className="mt-2 inline-flex h-9 items-center rounded-[8px] bg-[color:var(--honda-accent)] px-4 text-[13px] font-medium text-white"
          >
            Browse Inbox
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {saved.map((s) => {
            const v = s.report.vehicle;
            return (
              <div key={s.id} className="hvp-card flex flex-col gap-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="section-label">{s.id}</div>
                    <div className="mt-1 font-display text-[20px] font-semibold leading-tight text-[color:var(--slate-ink)]">
                      {v.model} {v.variant}
                    </div>
                    <div className="text-[12px] text-[color:var(--neutral-muted)]">
                      {v.year} · {v.fuel} · {v.odometer.toLocaleString("en-IN")} km · {v.city}
                    </div>
                  </div>
                  <button
                    onClick={() => toggleSaved(s.id)}
                    className="text-[color:var(--honda-accent)]"
                    aria-label="Remove from shortlist"
                  >
                    <Bookmark size={16} fill="currentColor" />
                  </button>
                </div>
                <div className="flex items-center justify-between rounded-[8px] bg-[color:var(--surface)] px-3 py-2 text-[12px]">
                  <span className="text-[color:var(--neutral-muted)]">Score</span>
                  <span className="font-semibold text-[color:var(--slate-ink)]">
                    {Math.round(s.report.scores.total)}/100
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-[8px] bg-[color:var(--surface)] px-3 py-2 text-[12px]">
                  <span className="text-[color:var(--neutral-muted)]">Est. Value</span>
                  <span className="font-semibold text-[color:var(--slate-ink)]">
                    ₹{s.report.value.low}L–{s.report.value.high}L
                  </span>
                </div>
                <Link
                  to="/dealer/vehicle/$id"
                  params={{ id: s.id }}
                  className="mt-auto inline-flex h-9 items-center justify-center rounded-[8px] border border-[color:var(--honda-accent)] text-[13px] font-medium text-[color:var(--honda-accent)] transition hover:bg-[color:var(--honda-accent)]/5"
                >
                  Open Report
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
