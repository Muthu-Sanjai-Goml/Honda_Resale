import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { HondaLogo } from "./HondaLogo";

const STEPS = [
  "Reading vehicle specifications",
  "Scanning uploaded photos for condition signals",
  "Pulling live market comparables",
  "Calculating your Health Score & Value Range",
];

type Props = { isDone: boolean; onDone: () => void };

export function Step3Analysis({ isDone, onDone }: Props) {
  const [progress, setProgress] = useState(0);
  const currentProgressRef = useRef(0);
  const isDoneRef = useRef(isDone);
  const doneTimeRef = useRef<number | null>(null);
  const doneProgressRef = useRef<number>(0);

  // Keep refs in sync
  useEffect(() => {
    isDoneRef.current = isDone;
  }, [isDone]);

  useEffect(() => {
    const start = performance.now();
    const EXPECTED_DURATION = 14300; // 14.3 seconds API timing
    const FILL_DURATION = 600; // time to fill to 100% once API is done
    let raf = 0;

    const tick = (now: number) => {
      if (!isDoneRef.current) {
        const elapsed = now - start;
        const p = Math.min(95, (elapsed / EXPECTED_DURATION) * 95);
        currentProgressRef.current = p;
        setProgress(p);
        raf = requestAnimationFrame(tick);
      } else {
        // API has completed
        if (doneTimeRef.current === null) {
          doneTimeRef.current = now;
          doneProgressRef.current = currentProgressRef.current;
        }
        const elapsedSinceDone = now - doneTimeRef.current;
        const progressLeft = 100 - doneProgressRef.current;
        const p = Math.min(100, doneProgressRef.current + (elapsedSinceDone / FILL_DURATION) * progressLeft);
        currentProgressRef.current = p;
        setProgress(p);
        
        if (p < 100) {
          raf = requestAnimationFrame(tick);
        } else {
          setTimeout(onDone, 350);
        }
      }
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
    };
  }, [onDone]);

  const stepIdx = progress >= 100 ? 4 : Math.floor(progress / 25);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-10 py-16 text-center">
      <motion.div
        animate={{ scale: [1, 1.08, 1], opacity: [0.85, 1, 0.85] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
      >
        <HondaLogo size={64} />
      </motion.div>

      <h2 className="font-display text-[28px] font-semibold text-[color:var(--slate-ink)]">
        Analysing your Honda…
      </h2>

      <ul className="flex w-full max-w-[460px] flex-col gap-3 text-left">
        {STEPS.map((s, i) => {
          const done = stepIdx > i;
          const active = stepIdx === i;
          return (
            <motion.li
              key={s}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: done || active ? 1 : 0.35, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-3 text-[14px]"
            >
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                  done
                    ? "border-[color:var(--score-green)] bg-[color:var(--score-green)] text-white"
                    : active
                      ? "border-[color:var(--honda-red)] bg-white"
                      : "border-[color:var(--neutral-line)] bg-white"
                }`}
              >
                {done ? (
                  <Check size={12} strokeWidth={3} />
                ) : active ? (
                  <motion.span
                    animate={{ scale: [0.4, 1, 0.4] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="h-2 w-2 rounded-full bg-[color:var(--honda-red)]"
                  />
                ) : null}
              </span>
              <span
                className={
                  done || active
                    ? "text-[color:var(--slate-ink)]"
                    : "text-[color:var(--neutral-faint)]"
                }
              >
                {s}
              </span>
            </motion.li>
          );
        })}
      </ul>

      <div className="h-1 w-full max-w-[460px] overflow-hidden rounded-full bg-[color:var(--neutral-soft)]">
        <div
          className="h-full rounded-full bg-[color:var(--honda-red)] transition-[width] duration-100 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
