import { LogOut } from "lucide-react";
import { HondaLogo } from "./HondaLogo";

type Props = { onSignOut?: () => void };

export function Header({ onSignOut }: Props) {
  return (
    <header className="border-b border-[color:var(--neutral-line)] bg-white">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between px-5 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <HondaLogo size={36} />
          <div className="hidden sm:block">
            <div className="font-display text-[18px] font-semibold leading-none text-[color:var(--slate-ink)]">
              Honda
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-[15px] sm:text-[18px] font-medium text-[color:var(--slate-ink)]">
            Value Passport
          </div>
          {onSignOut && (
            <button
              onClick={onSignOut}
              className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[color:var(--neutral-muted)] hover:text-[color:var(--honda-red)]"
              aria-label="Sign out"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
