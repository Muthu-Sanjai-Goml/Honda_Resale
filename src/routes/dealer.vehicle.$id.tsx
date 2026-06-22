import { createFileRoute, Link } from "@tanstack/react-router";
import { Bookmark, ChevronLeft, Phone } from "lucide-react";
import { useSubmissions, type Submission } from "@/lib/submissions";
import { Step4Report } from "@/components/passport/Step4Report";
import { VehiclePhotoGallery } from "@/components/passport/report/VehiclePhotoGallery";
import { defaultPhotos } from "@/lib/submissions";

export const Route = createFileRoute("/dealer/vehicle/$id")({
  component: VehicleDetail,
});

const STATUSES: Submission["status"][] = ["New", "Reviewed", "Quoted", "Closed"];

function VehicleDetail() {
  const { id } = Route.useParams();
  const { submissions, toggleSaved, setStatus } = useSubmissions();
  const s = submissions.find((x) => x.id === id);

  if (!s) {
    return (
      <div className="hvp-card">
        <div className="font-display text-[22px] font-semibold text-[color:var(--slate-ink)]">
          Passport not found
        </div>
        <p className="mt-2 text-[14px] text-[color:var(--neutral-muted)]">
          The passport ID {id} doesn't exist or has been removed.
        </p>
        <Link
          to="/dealer"
          className="mt-4 inline-flex items-center gap-1 text-[13px] font-medium text-[color:var(--honda-accent)]"
        >
          <ChevronLeft size={14} /> Back to inbox
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/dealer"
          className="inline-flex items-center gap-1 text-[13px] font-medium text-[color:var(--neutral-muted)] hover:text-[color:var(--slate-ink)]"
        >
          <ChevronLeft size={14} /> Back to inbox
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleSaved(s.id)}
            className={`inline-flex items-center gap-1.5 rounded-[8px] border px-3 h-9 text-[13px] font-medium transition ${
              s.saved
                ? "border-[color:var(--honda-accent)] bg-[color:var(--honda-accent)]/5 text-[color:var(--honda-accent)]"
                : "border-[color:var(--neutral-line)] bg-white text-[color:var(--slate-ink)] hover:bg-[color:var(--surface)]"
            }`}
          >
            <Bookmark size={14} fill={s.saved ? "currentColor" : "none"} />
            {s.saved ? "Saved" : "Shortlist"}
          </button>
          <a
            href={`tel:${s.phone.replace(/\s|x/g, "")}`}
            className="inline-flex h-9 items-center gap-1.5 rounded-[8px] bg-[color:var(--honda-red)] px-3 text-[13px] font-medium text-white transition hover:bg-[color:var(--honda-red-hover)]"
          >
            <Phone size={14} /> Contact Owner
          </a>
        </div>
      </div>

      <div className="hvp-card flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="section-label">{s.id}</div>
          <div className="mt-1 font-display text-[24px] font-semibold leading-tight text-[color:var(--slate-ink)] truncate">
            {s.ownerName}
          </div>
          <div className="text-[12px] text-[color:var(--neutral-muted)]">
            {s.phone} · Submitted{" "}
            {new Date(s.submittedAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="section-label">Status</span>
          <select
            value={s.status}
            onChange={(e) => setStatus(s.id, e.target.value as Submission["status"])}
            className="h-9 rounded-[8px] border border-[color:var(--neutral-line)] bg-white px-3 text-[13px] font-medium text-[color:var(--slate-ink)] focus:border-[color:var(--honda-accent)] focus:outline-none"
          >
            {STATUSES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Step4Report report={s.report} />
      <VehiclePhotoGallery photos={s.photos ?? defaultPhotos(s.report.vehicle.model)} />
    </div>
  );
}
