import { motion } from "framer-motion";
import { mockReport } from "@/lib/passport-mock";
import { VehicleIdentityBar } from "./report/VehicleIdentityBar";
import { ValueHero } from "./report/ValueHero";
import { ConditionCards } from "./report/ConditionCards";
import { ScoreBreakdownChart } from "./report/ScoreBreakdownChart";
import { MarketComparisonChart } from "./report/MarketComparisonChart";
import { PhotoFindings } from "./report/PhotoFindings";
import { PriceAdjustmentRuler } from "./report/PriceAdjustmentRuler";
import { InsightCards } from "./report/InsightCards";
import { ReportFooter } from "./report/ReportFooter";

export function Step4Report() {
  const r = mockReport;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="space-y-6"
    >
      <div>
        <div className="section-label">Valuation Report</div>
        <h1 className="mt-2 font-display text-[32px] sm:text-[34px] font-semibold leading-[1.1] text-[color:var(--slate-ink)]">
          Your Honda&apos;s Resale Snapshot
        </h1>
      </div>

      <VehicleIdentityBar r={r} />
      <ValueHero r={r} />
      <ConditionCards r={r} />
      <ScoreBreakdownChart r={r} />
      <MarketComparisonChart r={r} />
      <PhotoFindings r={r} />
      <PriceAdjustmentRuler r={r} />
      <InsightCards />
      <ReportFooter />
    </motion.div>
  );
}
