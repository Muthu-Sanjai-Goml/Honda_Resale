import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
// removed unused LogOut import
import { Header } from "./Header";
import { StepIndicator } from "./StepIndicator";
import { Step1Details, type VehicleDetails } from "./Step1Details";
import { Step2Photos, type Photos } from "./Step2Photos";
import { Step3Analysis } from "./Step3Analysis";
import { Step4Report } from "./Step4Report";
import { useSubmissions } from "@/lib/submissions";
import { useSession } from "@/lib/session";
import { mockReport } from "@/lib/passport-mock";

const INITIAL_DETAILS: VehicleDetails = {
  vehicleType: "Four-Wheeler",
  model: "Honda City",
  variant: "ZX CVT",
  year: "2022",
  fuel: "Petrol",
  transmission: "Automatic",
  odometer: "35000",
  owners: "1st Owner",
  service: "All Honda ASC",
  lastService: "2026-03",
  majorRepairs: "No",
  repairsDesc: "",
  city: "Bengaluru",
};

type Props = { onSignOut?: () => void; onDone?: () => void };

export function ValuePassportApp({ onSignOut, onDone }: Props) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [details, setDetails] = useState<VehicleDetails>(INITIAL_DETAILS);
  const [photos, setPhotos] = useState<Photos>({});
  const { add } = useSubmissions();
  const { session } = useSession();

  const handleAnalysisDone = () => {
    if (session?.role === "owner") {
      const uploaded = Object.entries(photos).map(([k, v]) => ({
        label: k.charAt(0).toUpperCase() + k.slice(1),
        url: v!.url,
      }));
      add({
        ownerName: session.name,
        phone: "+91 98xxxx0000",
        photos: uploaded.length ? uploaded : undefined,
        report: {
          ...mockReport,
          vehicle: {
            ...mockReport.vehicle,
            model: details.model || mockReport.vehicle.model,
            variant: details.variant || mockReport.vehicle.variant,
            year: parseInt(details.year) || mockReport.vehicle.year,
            fuel: details.fuel || mockReport.vehicle.fuel,
            transmission: details.transmission || mockReport.vehicle.transmission,
            odometer: parseInt(details.odometer) || mockReport.vehicle.odometer,
            owner: details.owners || mockReport.vehicle.owner,
            city: details.city || mockReport.vehicle.city,
            service: details.service || mockReport.vehicle.service,
          },
        },
      });
    }
    setStep(4);
  };

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
                onNext={() => setStep(3)}
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
              <Step3Analysis onDone={handleAnalysisDone} />
            </motion.div>
          )}
          {step === 4 && (
            <motion.div
              key="s4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Step4Report />
              {onDone && (
                <div className="mt-8 flex justify-center">
                  <button
                    onClick={onDone}
                    className="rounded-[8px] bg-[color:var(--honda-red)] px-5 py-2.5 text-[13px] font-medium text-white hover:opacity-90"
                  >
                    Back to my dashboard
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

