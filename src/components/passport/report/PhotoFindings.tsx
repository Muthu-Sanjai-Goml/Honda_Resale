import type { MockReport } from "@/lib/passport-mock";

type Props = { r: MockReport };

function badgeColor(score: number) {
  if (score >= 8) return { bg: "#16A34A1a", fg: "#16A34A" };
  if (score >= 6) return { bg: "#D977061a", fg: "#D97706" };
  return { bg: "#DC26261a", fg: "#DC2626" };
}

function Item({ label, score }: { label: string; score: number }) {
  const c = badgeColor(score);
  return (
    <li className="flex items-center justify-between border-b border-[color:var(--neutral-line)] py-2.5 last:border-b-0">
      <span className="text-[14px] text-[color:var(--slate-ink)]">{label}</span>
      <span
        className="rounded-full px-2.5 py-0.5 text-[12px] font-medium"
        style={{ background: c.bg, color: c.fg }}
      >
        {score}/10
      </span>
    </li>
  );
}

export function PhotoFindings({ r }: Props) {
  return (
    <div className="hvp-card">
      <div className="font-display text-[20px] font-semibold text-[color:var(--slate-ink)]">
        What the AI Saw in Your Photos
      </div>
      <div className="mt-1 text-[13px] text-[color:var(--neutral-muted)]">
        Computer-vision findings from your uploaded images
      </div>

      <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-2">
        <div>
          <div className="section-label mb-3">Exterior Assessment</div>
          <ul>
            {r.exteriorFindings.map((f) => (
              <Item key={f.label} {...f} />
            ))}
          </ul>
          <p className="mt-3 text-[13px] italic text-[color:var(--neutral-muted)]">
            {r.aiSummaryExterior}
          </p>
        </div>
        <div>
          <div className="section-label mb-3">Interior Assessment</div>
          <ul>
            {r.interiorFindings.map((f) => (
              <Item key={f.label} {...f} />
            ))}
          </ul>
          <p className="mt-3 text-[13px] italic text-[color:var(--neutral-muted)]">
            {r.aiSummaryInterior}
          </p>
        </div>
      </div>
    </div>
  );
}
