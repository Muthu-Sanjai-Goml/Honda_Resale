type Props<T extends string> = {
  options: readonly T[];
  value: T | "";
  onChange: (v: T) => void;
};

export function PillSelect<T extends string>({
  options,
  value,
  onChange,
}: Props<T>) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = value === opt;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`rounded-full border px-4 py-2 text-[13px] font-medium transition ${
              active
                ? "border-[color:var(--honda-red)] bg-[color:var(--honda-red)]/5 text-[color:var(--honda-red)]"
                : "border-[color:var(--neutral-line)] bg-white text-[color:var(--neutral-muted)] hover:border-[color:var(--neutral-muted)] hover:text-[color:var(--slate-ink)]"
            }`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}
