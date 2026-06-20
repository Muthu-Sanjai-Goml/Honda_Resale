import type { ReactNode } from "react";

type Props = {
  label: string;
  required?: boolean;
  children: ReactNode;
  hint?: string;
  className?: string;
};

export function Field({ label, required, children, hint, className = "" }: Props) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label className="section-label">
        {label}
        {required && <span className="ml-1 text-[color:var(--honda-red)]">*</span>}
      </label>
      {children}
      {hint && (
        <span className="text-[12px] text-[color:var(--neutral-faint)]">
          {hint}
        </span>
      )}
    </div>
  );
}

export const inputClass =
  "h-11 w-full rounded-[8px] border border-[color:var(--neutral-line)] bg-white px-3 text-[14px] text-[color:var(--slate-ink)] placeholder:text-[color:var(--neutral-faint)] outline-none transition focus:border-[color:var(--slate-ink)]";
