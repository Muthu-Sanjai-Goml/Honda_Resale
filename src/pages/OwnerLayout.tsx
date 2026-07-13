import { Link, Outlet, useLocation } from "react-router-dom";
import { PlusCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { HondaLogo } from "@/components/passport/HondaLogo";

const NAV = [{ to: "/owner", label: "New Passport", icon: PlusCircle }] as const;
const OWNER_NAME = "Owner";

export function OwnerLayout() {
  const { pathname } = useLocation();
  const [openMobile, setOpenMobile] = useState(false);

  useEffect(() => {
    setOpenMobile(false);
  }, [pathname]);

  const isActive = (to: string) => pathname === to || pathname.startsWith(`${to}/`);
  const activeNav = NAV.find((n) => isActive(n.to));

  return (
    <div className="flex min-h-screen bg-[color:var(--surface)]">
      <aside
        className={`fixed inset-y-0 left-0 z-40 hidden h-screen w-[220px] flex-col border-r border-[color:var(--neutral-line)] bg-white transition-transform md:sticky md:top-0 md:flex md:translate-x-0 ${
          openMobile ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-2.5 border-b border-[color:var(--neutral-line)] px-4 py-3">
          <HondaLogo size={26} />
          <div className="min-w-0">
            <div className="font-display text-[13px] font-semibold leading-none text-[color:var(--slate-ink)] truncate">
              Owner Console
            </div>
            <div className="mt-1 text-[9px] tracking-[0.18em] text-[color:var(--neutral-muted)] uppercase">
              Value Passport
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-0.5 px-2 py-3">
          <div className="px-2 pb-1.5 text-[9px] tracking-[0.14em] text-[color:var(--neutral-faint)] uppercase">
            Garage
          </div>
          {NAV.map((n) => {
            const active = isActive(n.to);
            const Icon = n.icon;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`flex items-center gap-2.5 rounded-[7px] px-2.5 py-1.5 text-[13px] font-medium transition ${
                  active
                    ? "bg-[color:var(--honda-red)]/10 text-[color:var(--honda-red)]"
                    : "text-[color:var(--slate-ink)] hover:bg-[color:var(--surface)]"
                }`}
              >
                <Icon size={14} strokeWidth={active ? 2.5 : 2} />
                {n.label}
                {active && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[color:var(--honda-red)]" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-[color:var(--neutral-line)] p-2.5">
          <div className="rounded-[7px] bg-[color:var(--surface)] p-2.5">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[color:var(--honda-red)] text-[11px] font-semibold text-white">
                {OWNER_NAME.charAt(0)}
              </div>
              <div className="min-w-0">
                <div className="text-[12px] font-medium leading-tight text-[color:var(--slate-ink)] truncate">
                  {OWNER_NAME}
                </div>
                <div className="text-[10px] text-[color:var(--neutral-muted)]">Honda Owner</div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {openMobile && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setOpenMobile(false)}
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-12 items-center gap-2 border-b border-[color:var(--neutral-line)] bg-white/95 px-3 backdrop-blur sm:px-5">
          <div className="flex items-center gap-2 md:hidden">
            <HondaLogo size={22} />
            <span className="text-[13px] font-semibold text-[color:var(--slate-ink)]">
              {activeNav?.label ?? "Owner"}
            </span>
          </div>
          <span className="text-[12px] text-[color:var(--neutral-muted)] hidden sm:inline">
            Owner
          </span>
          <span className="text-[color:var(--neutral-faint)] hidden sm:inline">/</span>
          <span className="text-[13px] font-medium text-[color:var(--slate-ink)] hidden sm:inline">
            {activeNav?.label ?? ""}
          </span>
          <div className="ml-auto flex items-center gap-2.5">
            <span className="text-[11px] text-[color:var(--neutral-muted)] hidden sm:inline">
              {OWNER_NAME}
            </span>
          </div>
        </header>

        <main className="flex-1 px-3 py-4 pb-4 sm:px-5 sm:py-5 md:pb-5">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
