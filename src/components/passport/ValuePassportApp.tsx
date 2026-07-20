import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Header } from "./Header";
import { StepIndicator } from "./StepIndicator";
import { Step1Details, type VehicleDetails } from "./Step1Details";
import { Step2Photos, type Photos } from "./Step2Photos";
import { Step3Analysis } from "./Step3Analysis";
import { Step4Report } from "./Step4Report";
import type { ValuationReport } from "@/lib/types";
import { submitVehicleValuation } from "@/service/valuation";
import { toast } from "sonner";

const INITIAL_DETAILS: VehicleDetails = {
  vehicleType: "Four-Wheeler",
  model: "Honda City",
  variant: "",
  year: "2022",
  fuel: "Petrol",
  transmission: "Automatic",
  odometer: "",
  owners: "1st Owner",
  service: "All Honda ASC",
  lastService: "",
  repairsDesc: "",
  city: "Bengaluru",
};

type Props = { onDone?: () => void };

export function ValuePassportApp({ onDone }: Props) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [details, setDetails] = useState<VehicleDetails>(INITIAL_DETAILS);
  const [photos, setPhotos] = useState<Photos>({});
  const [generatedReport, setGeneratedReport] = useState<ValuationReport | null>(null);
  const [activeReport, setActiveReport] = useState<ValuationReport | null>(null);
  const [valuationError, setValuationError] = useState<string | null>(null);
  const [analysisAnimDone, setAnalysisAnimDone] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

  const startValuation = async () => {
    setValuationError(null);
    setGeneratedReport(null);
    setAnalysisAnimDone(false);
    
    try {
      const report = await submitVehicleValuation(details, photos);
      setGeneratedReport(report);
    } catch (err: unknown) {
      // Keep the technical detail in the console for debugging; show the user a friendly message.
      console.error("Valuation failed:", err);
      const msg = "We couldn't generate your valuation. Please check your connection and try again.";
      setValuationError(msg);
      toast.error(msg);
    }
  };

  const handleAnalysisDone = (reportToSave: ValuationReport) => {
    setActiveReport(reportToSave);
    setStep(4);
  };

  useEffect(() => {
    if (analysisAnimDone) {
      if (generatedReport) {
        handleAnalysisDone(generatedReport);
      }
    }
  }, [analysisAnimDone, generatedReport]);

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-[1200px] px-5 py-6 sm:px-6 sm:py-8">
        {step < 4 && (
          <div className="mb-6 flex justify-center sm:justify-start">
            <StepIndicator current={step} />
          </div>
        )}

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="s1"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="mx-auto max-w-[860px]"
            >
              <Step1Details
                initial={details}
                onSubmit={(d) => {
                  setDetails(d);
                  setStep(2);
                }}
              />
            </motion.div>
          )}
          {step === 2 && (
            <motion.div
              key="s2"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="mx-auto max-w-[860px]"
            >
              <Step2Photos
                photos={photos}
                onChange={setPhotos}
                onBack={() => setStep(1)}
                onNext={() => {
                  startValuation();
                  setStep(3);
                }}
              />
            </motion.div>
          )}
          {step === 3 && (
            <motion.div
              key="s3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              {valuationError ? (
                <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 py-16 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[color:var(--score-red)]/10 text-[color:var(--score-red)]">
                    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  
                  <h2 className="font-display text-[26px] font-semibold text-[color:var(--slate-ink)]">
                    Valuation Failed
                  </h2>
                  
                  <div className="w-full max-w-[460px] rounded-[8px] border border-[color:var(--score-red)]/20 bg-[color:var(--score-red)]/5 p-4 text-[14px] text-[color:var(--score-red)]">
                    <p className="text-center">{valuationError}</p>
                  </div>
                  
                  <div className="flex gap-4 mt-2">
                    <button
                      onClick={() => {
                        setStep(2);
                        setValuationError(null);
                      }}
                      className="flex h-[44px] items-center justify-center rounded-[8px] border border-[color:var(--neutral-line)] bg-white px-5 text-[14px] font-medium text-[color:var(--slate-ink)] hover:bg-[color:var(--surface)] transition"
                    >
                      Back to Photos
                    </button>
                    
                    <button
                      onClick={() => {
                        startValuation();
                      }}
                      className="flex h-[44px] items-center justify-center rounded-[8px] bg-[color:var(--honda-red)] px-5 text-[14px] font-medium text-white hover:bg-[color:var(--honda-red-hover)] transition"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              ) : (
                <Step3Analysis isDone={!!generatedReport} onDone={() => setAnalysisAnimDone(true)} />
              )}
            </motion.div>
          )}
          {step === 4 && activeReport && (
            <motion.div
              key="s4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Step4Report report={activeReport} />
              {onDone && (
                <div className="mt-8 flex justify-center">
                  <button
                    onClick={onDone}
                    className="rounded-[8px] bg-[color:var(--honda-red)] px-5 py-2.5 text-[13px] font-medium text-white hover:opacity-90"
                  >
                    Create Another Passport
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

