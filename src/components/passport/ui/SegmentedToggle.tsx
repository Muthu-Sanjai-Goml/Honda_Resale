type Props<T extends string> = {
  options: readonly T[];
  value: T | "";
  onChange: (v: T) => void;
};

export function SegmentedToggle<T extends string>({
  options,
  value,
  onChange,
}: Props<T>) {
  return (
    <div className="inline-flex w-full rounded-[8px] border border-[color:var(--neutral-line)] bg-white p-1">
      {options.map((opt) => {
        const active = value === opt;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`flex-1 rounded-[6px] px-3 py-2 text-[13px] font-medium transition ${
              active
                ? "bg-[color:var(--honda-red)] text-white"
                : "text-[color:var(--neutral-muted)] hover:text-[color:var(--slate-ink)]"
            }`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}
