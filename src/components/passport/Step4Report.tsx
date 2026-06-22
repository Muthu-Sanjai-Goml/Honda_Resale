import { motion } from "framer-motion";
import type { ValuationReport } from "@/lib/types";
import { HondaLogo } from "./HondaLogo";
import { 
  AlertCircle, Calendar, Car, ShieldAlert, Award, FileText, 
  CheckCircle2, Compass, ShieldCheck, ArrowDownRight, Info
} from "lucide-react";
import { RadialBar, RadialBarChart, PolarAngleAxis, ResponsiveContainer } from "recharts";

export function Step4Report({ report }: { report: ValuationReport }) {
  const isRaw = !!report.raw;
  const raw = report.raw || {};
  
  // Clean model name parsing (e.g. "honda_city" -> "Honda City")
  const modelName = isRaw 
    ? raw.vehicle_model.split("_").map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
    : report.vehicle.model;

  const variant = isRaw ? raw.variant : report.vehicle.variant;
  const year = isRaw ? raw.manufacture_year : report.vehicle.year;
  const odoVal = isRaw ? raw.odometer_km : report.vehicle.odometer;
  const ownersVal = isRaw ? raw.number_of_owners : report.vehicle.owner;
  
  const currency = isRaw ? raw.estimated_resale_value?.currency || "INR" : "INR";
  const lowPrice = isRaw ? raw.estimated_resale_value?.low : (report.value.low * 100000);
  const highPrice = isRaw ? raw.estimated_resale_value?.high : (report.value.high * 100000);
  const pointPrice = isRaw ? raw.estimated_resale_value?.point_estimate : (report.value.point * 100000);
  const confidence = isRaw ? raw.confidence_score : report.value.confidence;
  const reasoning = isRaw ? raw.confidence_reasoning : "";

  // Depreciation fields
  const baseValueNew = isRaw ? raw.depreciation_analysis?.base_value_new : null;
  const ageYears = isRaw ? raw.depreciation_analysis?.age_years : null;
  const odoAssessment = isRaw ? raw.depreciation_analysis?.odometer_assessment : null;
  const appliedDepr = isRaw ? raw.depreciation_analysis?.applied_depreciation_percent : null;

  // Condition fields
  const extCond = isRaw ? raw.condition_assessment?.exterior_condition : null;
  const intCond = isRaw ? raw.condition_assessment?.interior_condition : null;
  const notableIssues = isRaw ? raw.condition_assessment?.notable_issues || [] : [];
  const serviceSummary = isRaw ? raw.condition_assessment?.service_history_summary : null;

  const formatCurrency = (val: number | null | undefined) => {
    if (val === null || val === undefined) return "N/A";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency,
      maximumFractionDigits: 0
    }).format(val);
  };

  const formatCurrencyLakhs = (val: number | null | undefined) => {
    if (val === null || val === undefined) return "N/A";
    const lakhs = val / 100000;
    return `₹ ${lakhs.toFixed(2)} Lakhs`;
  };

  // Calculate position percentage for visual slider (point vs range)
  const rangePercent = highPrice > lowPrice 
    ? Math.min(100, Math.max(0, ((pointPrice - lowPrice) / (highPrice - lowPrice)) * 100))
    : 50;

  // Color mapper for condition strings
  const getConditionColorClasses = (cond: string | null) => {
    if (!cond) return "bg-gray-50 border-gray-200 text-gray-700";
    const c = cond.toLowerCase();
    if (c.includes("excel")) return "bg-emerald-50 border-emerald-200 text-emerald-700";
    if (c.includes("good")) return "bg-blue-50 border-blue-200 text-blue-700";
    if (c.includes("average") || c.includes("fair")) return "bg-amber-50 border-amber-200 text-amber-700";
    return "bg-rose-50 border-rose-200 text-rose-700";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="space-y-6 max-w-[960px] mx-auto pb-16 px-1"
    >
      {/* Premium Header */}
      <div className="flex items-center justify-between border-b border-[color:var(--neutral-line)] pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--honda-red)]/10 px-3 py-1 text-[10px] font-semibold tracking-wider text-[color:var(--honda-red)] uppercase mb-2">
            <Compass size={11} className="animate-spin-slow" /> Official Value Passport
          </div>
          <h1 className="font-display text-[32px] sm:text-[40px] font-extrabold leading-none text-[color:var(--slate-ink)] tracking-tight">
            {modelName}
          </h1>
          <p className="mt-2 text-[13px] font-medium text-[color:var(--neutral-muted)] flex flex-wrap gap-2 items-center">
            <span className="font-semibold text-[color:var(--slate-ink)] bg-[color:var(--surface)] px-2 py-0.5 rounded-[4px]">{variant}</span>
            <span>•</span>
            <span>{year} Model</span>
            <span>•</span>
            <span>{odoVal?.toLocaleString("en-IN")} km</span>
            <span>•</span>
            <span>{typeof ownersVal === "number" ? `${ownersVal} Owner${ownersVal > 1 ? "s" : ""}` : ownersVal}</span>
          </p>
        </div>
        <div className="shrink-0 flex flex-col items-end gap-1">
          <HondaLogo size={42} />
          <span className="text-[9px] font-semibold tracking-widest text-[color:var(--neutral-faint)] uppercase">Honda Resale</span>
        </div>
      </div>

      {/* Visual Price Estimator Segment */}
      <div className="hvp-card p-6 border border-[color:var(--neutral-line)] bg-gradient-to-br from-white to-[color:var(--surface)] shadow-md space-y-8">
        <div>
          <span className="section-label">AI Valuation Range</span>
          <h2 className="mt-1 font-display text-[26px] font-bold text-[color:var(--slate-ink)]">
            Estimated Resale Snapshot
          </h2>
        </div>

        {/* Big Range Values */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-baseline">
          <div className="md:col-span-2">
            <div className="text-[11px] text-[color:var(--neutral-muted)] uppercase tracking-wider font-semibold">Valuation Range</div>
            <div className="font-display text-[36px] sm:text-[44px] font-black leading-none text-[color:var(--slate-ink)] mt-1.5">
              {formatCurrency(lowPrice)} <span className="text-[color:var(--neutral-faint)] font-light text-[28px] mx-1">–</span> {formatCurrency(highPrice)}
            </div>
          </div>
          <div className="border-t md:border-t-0 md:border-l border-[color:var(--neutral-line)] pt-4 md:pt-0 md:pl-6">
            <div className="text-[11px] text-[color:var(--neutral-muted)] uppercase tracking-wider font-semibold">Point Estimate</div>
            <div className="font-display text-[26px] font-extrabold text-[color:var(--honda-red)] mt-1">
              {formatCurrency(pointPrice)}
            </div>
          </div>
        </div>

        {/* Range Slider Visualizer */}
        <div className="relative pt-6 pb-6 px-1">
          <div className="h-2 w-full rounded-full bg-gray-200/80 relative">
            {/* Range filling strip */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-red-100 via-[color:var(--honda-red)] to-red-100 opacity-80" />
            
            {/* Point estimate pin */}
            <div 
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center"
              style={{ left: `${rangePercent}%` }}
            >
              <div className="h-5 w-5 rounded-full border-4 border-white bg-[color:var(--honda-red)] shadow-lg animate-pulse" />
              <div className="absolute top-6 flex flex-col items-center">
                <span className="font-display text-[13px] font-bold text-[color:var(--slate-ink)] bg-white border border-gray-200 px-2 py-0.5 rounded-[5px] shadow-sm whitespace-nowrap">
                  {formatCurrencyLakhs(pointPrice)} (Estimate)
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between text-[11px] font-medium text-[color:var(--neutral-muted)] mt-3">
            <span>Low: {formatCurrency(lowPrice)}</span>
            <span>High: {formatCurrency(highPrice)}</span>
          </div>
        </div>
      </div>

      {/* Two Column Grid: AI Confidence & Depreciation */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left Column: AI Confidence */}
        <div className="md:col-span-5 hvp-card p-6 border border-[color:var(--neutral-line)] bg-white flex flex-col justify-between gap-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <span className="section-label">Confidence Analysis</span>
              <h3 className="font-display text-[18px] font-bold text-[color:var(--slate-ink)] mt-0.5">Reliability Score</h3>
            </div>
            <ShieldCheck size={18} className="text-[color:var(--honda-red)]" />
          </div>

          <div className="flex flex-col items-center justify-center py-2">
            <div className="relative h-[130px] w-[130px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  cx="50%"
                  cy="50%"
                  innerRadius="78%"
                  outerRadius="100%"
                  barSize={10}
                  data={[{ name: "Confidence", value: confidence, fill: "#CC0000" }]}
                  startAngle={90}
                  endAngle={-270}
                >
                  <PolarAngleAxis
                    type="number"
                    domain={[0, 100]}
                    tick={false}
                    axisLine={false}
                  />
                  <RadialBar
                    background={{ fill: "#F3F4F6" }}
                    dataKey="value"
                    cornerRadius={6}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-display text-[32px] font-black leading-none text-[color:var(--slate-ink)]">
                  {Math.round(confidence)}%
                </span>
                <span className="text-[9px] font-semibold text-[color:var(--neutral-faint)] uppercase tracking-wider mt-0.5">
                  Rating
                </span>
              </div>
            </div>
          </div>

          {reasoning && (
            <div className="bg-[color:var(--surface)]/60 rounded-[8px] p-3 border border-gray-100 text-[12px] text-[color:var(--slate-ink)] leading-relaxed italic">
              <span className="font-bold text-[10px] uppercase text-[color:var(--neutral-muted)] block mb-1 not-italic">AI Rationale</span>
              &ldquo;{reasoning}&rdquo;
            </div>
          )}
        </div>

        {/* Right Column: Depreciation Visualizer */}
        <div className="md:col-span-7 hvp-card p-6 border border-[color:var(--neutral-line)] bg-white flex flex-col justify-between gap-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <span className="section-label">Asset Depreciation</span>
              <h3 className="font-display text-[18px] font-bold text-[color:var(--slate-ink)] mt-0.5">Value Retention</h3>
            </div>
            <ArrowDownRight size={18} className="text-gray-400" />
          </div>

          <div className="space-y-4 my-auto">
            {baseValueNew ? (
              <>
                {/* Horizontal Retention Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-medium">
                    <span className="text-[color:var(--neutral-muted)]">Value Retained: {100 - (appliedDepr || 0)}%</span>
                    <span className="text-[color:var(--honda-red)] font-semibold">Depreciated: {appliedDepr}%</span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-gray-100 overflow-hidden flex">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500" 
                      style={{ width: `${100 - (appliedDepr || 0)}%` }} 
                    />
                    <div 
                      className="h-full bg-rose-100 border-l border-white" 
                      style={{ width: `${appliedDepr}%` }} 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="rounded-[6px] border border-gray-100 p-2.5 bg-gray-50/50">
                    <span className="text-[9px] uppercase tracking-wider text-[color:var(--neutral-muted)] font-semibold block">Base Value New</span>
                    <span className="font-display text-[16px] font-bold text-[color:var(--slate-ink)] mt-0.5 block">{formatCurrency(baseValueNew)}</span>
                  </div>
                  <div className="rounded-[6px] border border-gray-100 p-2.5 bg-gray-50/50">
                    <span className="text-[9px] uppercase tracking-wider text-[color:var(--neutral-muted)] font-semibold block">Total Depreciation</span>
                    <span className="font-display text-[16px] font-bold text-rose-600 mt-0.5 block">
                      -{formatCurrency(baseValueNew - pointPrice)} ({appliedDepr}%)
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-6 text-[12px] text-[color:var(--neutral-muted)]">
                Depreciation details unavailable.
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 border-t border-gray-100 pt-3">
            <div className="flex flex-col">
              <span className="text-[10px] text-[color:var(--neutral-muted)] uppercase tracking-wider">Vehicle Age</span>
              <span className="text-[13px] font-semibold text-[color:var(--slate-ink)] mt-0.5">
                {ageYears !== null ? `${ageYears} Year${ageYears > 1 ? "s" : ""}` : "N/A"}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-[color:var(--neutral-muted)] uppercase tracking-wider">Odometer Assessment</span>
              <span className="text-[13px] font-semibold capitalize text-[color:var(--slate-ink)] mt-0.5">
                {odoAssessment || "N/A"}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Condition Details Card */}
      {(extCond || intCond || serviceSummary) && (
        <div className="hvp-card p-6 border border-[color:var(--neutral-line)] bg-white shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <span className="section-label">AI Condition Scorecard</span>
              <h3 className="font-display text-[18px] font-bold text-[color:var(--slate-ink)] mt-0.5">Physical Assessment</h3>
            </div>
            <CheckCircle2 size={18} className="text-emerald-500" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {extCond && (
              <div className={`rounded-[8px] border p-3.5 flex flex-col justify-between gap-1 ${getConditionColorClasses(extCond)}`}>
                <span className="text-[9px] uppercase tracking-widest font-bold opacity-85">Exterior Condition</span>
                <span className="text-[15px] font-bold capitalize mt-1 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-current" />
                  {extCond}
                </span>
              </div>
            )}
            {intCond && (
              <div className={`rounded-[8px] border p-3.5 flex flex-col justify-between gap-1 ${getConditionColorClasses(intCond)}`}>
                <span className="text-[9px] uppercase tracking-widest font-bold opacity-85">Interior Condition</span>
                <span className="text-[15px] font-bold capitalize mt-1 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-current" />
                  {intCond}
                </span>
              </div>
            )}
          </div>

          {serviceSummary && (
            <div className="rounded-[8px] bg-[color:var(--surface)]/50 p-4 border border-[color:var(--neutral-line)] text-[12.5px] leading-relaxed text-[color:var(--slate-ink)]">
              <span className="font-bold text-[10px] uppercase text-[color:var(--neutral-muted)] tracking-wider block mb-1.5">Service History Analysis</span>
              <p className="font-normal">{serviceSummary}</p>
            </div>
          )}
        </div>
      )}

      {/* Notable Observations Section */}
      {notableIssues && notableIssues.length > 0 && (
        <div className="hvp-card p-6 border border-rose-100 bg-rose-50/20 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-rose-100 pb-3">
            <ShieldAlert size={18} className="text-[color:var(--honda-red)]" />
            <div>
              <span className="text-[10px] uppercase tracking-wider text-[color:var(--honda-red)] font-semibold">Important Notes</span>
              <h3 className="font-display text-[18px] font-bold text-[color:var(--slate-ink)] mt-0.5">AI Detected Observations</h3>
            </div>
          </div>
          
          <ul className="divide-y divide-rose-100/60 text-[13px] text-[color:var(--slate-ink)]">
            {notableIssues.map((issue: string, index: number) => (
              <li key={index} className="py-3 first:pt-0 last:pb-0 flex items-start gap-3">
                <Info size={14} className="text-[color:var(--honda-red)] shrink-0 mt-0.5" />
                <span className="leading-relaxed font-normal">{issue}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Footer Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-[10.5px] text-[color:var(--neutral-faint)] border-t border-[color:var(--neutral-line)] pt-5">
        {isRaw && raw.valuation_id && (
          <div className="font-mono bg-[color:var(--surface)] px-2.5 py-1 rounded-[4px] max-w-full truncate border border-gray-100">
            PASSPORT ID: {raw.valuation_id}
          </div>
        )}
        <div className="flex items-center gap-1.5 font-medium">
          <span>Processed at: {isRaw && raw.created_at ? new Date(raw.created_at).toLocaleString("en-IN", { hour12: true }) : new Date().toLocaleString("en-IN")}</span>
        </div>
      </div>
    </motion.div>
  );
}
