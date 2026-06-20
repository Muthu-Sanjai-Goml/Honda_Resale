import { Camera, Armchair, Wrench, Gauge } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { MockReport } from "@/lib/passport-mock";

type Props = { r: MockReport };

function scoreColor(score: number) {
  if (score >= 90) return "var(--score-green)";
  if (score >= 75) return "var(--score-amber)";
  if (score >= 60) return "var(--score-orange)";
  return "var(--score-red)";
}

function Card({
  title,
  score,
  source,
  Icon,
}: {
  title: string;
  score: number;
  source: string;
  Icon: LucideIcon;
}) {
  const color = scoreColor(score);
  return (
    <div className="hvp-card flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <span className="section-label">{title}</span>
        <Icon
          size={18}
          className="text-[color:var(--neutral-faint)]"
          strokeWidth={1.75}
        />
      </div>
      <div
        className="font-display text-[32px] font-semibold leading-none"
        style={{ color }}
      >
        {score}
        <span className="ml-1 text-[14px] font-medium text-[color:var(--neutral-faint)]">
          /100
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[color:var(--neutral-soft)]">
        <div
          className="h-full rounded-full"
          style={{ width: `${score}%`, background: color }}
        />
      </div>
      <div className="text-[12px] text-[color:var(--neutral-muted)]">
        {source}
      </div>
    </div>
  );
}

export function ConditionCards({ r }: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card title="Exterior Condition" score={r.scores.exterior} source="AI photo analysis" Icon={Camera} />
      <Card title="Interior Condition" score={r.scores.interior} source="AI photo analysis" Icon={Armchair} />
      <Card title="Service History" score={r.scores.service} source="Honda service records" Icon={Wrench} />
      <Card title="Mileage Score" score={r.scores.mileage} source="Age vs. expected km" Icon={Gauge} />
    </div>
  );
}
