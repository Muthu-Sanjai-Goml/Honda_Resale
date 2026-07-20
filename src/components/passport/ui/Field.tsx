import type { ReactNode } from "react";

type Props = {
  label: string;
  required?: boolean;
  children: ReactNode;
  hint?: string;
  error?: boolean;
  className?: string;
};

export function Field({
  label,
  required,
  children,
  hint,
  error,
  className = "",
}: Props) {
  const errorFieldClass = error
    ? " [&_input]:border-[color:var(--score-red)] [&_select]:border-[color:var(--score-red)] [&_textarea]:border-[color:var(--score-red)]"
    : "";
  return (
    <div className={`flex flex-col gap-2 ${className}${errorFieldClass}`}>
      <label className="section-label">
        <span className={error ? "text-[color:var(--score-red)]" : ""}>
          {label}
        </span>
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
