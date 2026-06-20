import { AlertTriangle, ArrowRight, Check } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Insight = {
  Icon: LucideIcon;
  tone: "good" | "warn" | "info";
  title: string;
  body: string;
};

const INSIGHTS: Insight[] = [
  {
    Icon: Check,
    tone: "good",
    title: "Well Maintained",
    body: "Regular Honda authorised service centre visits on record.",
  },
  {
    Icon: Check,
    tone: "good",
    title: "Low Mileage for Age",
    body: "35,000 km over 3 years is below segment average.",
  },
  {
    Icon: AlertTriangle,
    tone: "warn",
    title: "Interior Wear",
    body: "Seat fabric shows visible use. Professional detailing could recover ₹15,000–25,000 in perceived value.",
  },
  {
    Icon: ArrowRight,
    tone: "info",
    title: "Next Step",
    body: "Your ownership profile makes this a strong trade-in candidate for a new Honda. Speak to a dealer to explore an upgrade offer.",
  },
];

const TONE = {
  good: { bg: "#16A34A1a", fg: "#16A34A" },
  warn: { bg: "#D977061a", fg: "#D97706" },
  info: { bg: "#1A2B4A1a", fg: "#1A2B4A" },
} as const;

export function InsightCards() {
  return (
    <div className="hvp-card">
      <div className="font-display text-[20px] font-semibold text-[color:var(--slate-ink)]">
        Summary &amp; Suggestions
      </div>
      <div className="mt-1 text-[13px] text-[color:var(--neutral-muted)]">
        Actionable insights from your assessment
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
        {INSIGHTS.map((i) => {
          const c = TONE[i.tone];
          return (
            <div
              key={i.title}
              className="flex gap-3 rounded-[8px] border border-[color:var(--neutral-line)] bg-[color:var(--surface)] p-4"
            >
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                style={{ background: c.bg, color: c.fg }}
              >
                <i.Icon size={16} strokeWidth={2.5} />
              </span>
              <div>
                <div className="text-[14px] font-medium text-[color:var(--slate-ink)]">
                  {i.title}
                </div>
                <div className="mt-0.5 text-[13px] text-[color:var(--neutral-muted)]">
                  {i.body}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
