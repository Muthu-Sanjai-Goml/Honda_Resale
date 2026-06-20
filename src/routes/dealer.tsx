import { createFileRoute, Outlet, Link, useRouterState, useNavigate, Navigate } from "@tanstack/react-router";
import { Bookmark, ChartLine, Inbox, LogOut, Menu, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useSession } from "@/lib/session";
import { HondaLogo } from "@/components/passport/HondaLogo";

export const Route = createFileRoute("/dealer")({
  component: DealerLayout,
});

const NAV: { to: string; label: string; icon: typeof Inbox; exact?: boolean }[] = [
  { to: "/dealer", label: "Inbox", icon: Inbox, exact: true },
  { to: "/dealer/saved", label: "Shortlisted", icon: Bookmark },
  { to: "/dealer/analytics", label: "Analytics", icon: ChartLine },
];

function DealerLayout() {
  const { session, signOut } = useSession();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [openMobile, setOpenMobile] = useState(false);

  useEffect(() => {
    setOpenMobile(false);
  }, [pathname]);

  if (!session) return <Navigate to="/login" />;
  if (session.role !== "dealer") return <Navigate to="/" />;

  const isActive = (to: string, exact?: boolean) =>
    exact ? pathname === to : pathname === to || pathname.startsWith(`${to}/`);

  const activeNav = NAV.find((n) => isActive(n.to, n.exact));

  return (
    <div className="flex min-h-screen bg-[color:var(--surface)]">
      {/* Sidebar - desktop only */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 hidden h-screen w-[220px] flex-col border-r border-[color:var(--neutral-line)] bg-white transition-transform md:sticky md:top-0 md:flex md:translate-x-0 ${
          openMobile ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-2.5 border-b border-[color:var(--neutral-line)] px-4 py-3">
          <HondaLogo size={26} />
          <div className="min-w-0">
            <div className="font-display text-[13px] font-semibold leading-none text-[color:var(--slate-ink)] truncate">
              Dealer Console
            </div>
            <div className="mt-1 text-[9px] tracking-[0.18em] text-[color:var(--neutral-muted)] uppercase">
              Value Passport
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-0.5 px-2 py-3">
          <div className="px-2 pb-1.5 text-[9px] tracking-[0.14em] text-[color:var(--neutral-faint)] uppercase">
            Workspace
          </div>
          {NAV.map((n) => {
            const active = isActive(n.to, n.exact);
            const Icon = n.icon;
            return (
              <Link
                key={n.to}
                to={n.to as "/dealer"}
                className={`flex items-center gap-2.5 rounded-[7px] px-2.5 py-1.5 text-[13px] font-medium transition ${
                  active
                    ? "bg-[color:var(--honda-accent)]/10 text-[color:var(--honda-accent)]"
                    : "text-[color:var(--slate-ink)] hover:bg-[color:var(--surface)]"
                }`}
              >
                <Icon size={14} strokeWidth={active ? 2.5 : 2} />
                {n.label}
                {active && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[color:var(--honda-accent)]" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-[color:var(--neutral-line)] p-2.5">
          <div className="rounded-[7px] bg-[color:var(--surface)] p-2.5">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[color:var(--honda-accent)] text-[11px] font-semibold text-white">
                {session.name.split(" ").map((p) => p[0]).join("").slice(0, 2)}
              </div>
              <div className="min-w-0">
                <div className="text-[12px] font-medium leading-tight text-[color:var(--slate-ink)] truncate">
                  {session.name}
                </div>
                <div className="text-[10px] text-[color:var(--neutral-muted)] truncate">
                  {session.org}
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                signOut();
                navigate({ to: "/login" });
              }}
              className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-medium text-[color:var(--honda-red)] hover:text-[color:var(--honda-red-hover)]"
            >
              <LogOut size={12} /> Sign out
            </button>
          </div>
        </div>
      </aside>

      {openMobile && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setOpenMobile(false)}
        />
      )}

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-12 items-center gap-2 border-b border-[color:var(--neutral-line)] bg-white/95 px-3 backdrop-blur sm:px-5">
          <div className="flex items-center gap-2 md:hidden">
            <HondaLogo size={22} />
            <span className="text-[13px] font-semibold text-[color:var(--slate-ink)]">
              {activeNav?.label ?? "Dealer"}
            </span>
          </div>
          <span className="text-[12px] text-[color:var(--neutral-muted)] hidden sm:inline">
            Dealer
          </span>
          <span className="text-[color:var(--neutral-faint)] hidden sm:inline">/</span>
          <span className="text-[13px] font-medium text-[color:var(--slate-ink)] hidden sm:inline">
            {activeNav?.label ?? ""}
          </span>
          <div className="relative ml-3 hidden flex-1 max-w-[360px] sm:block">
            <Search
              size={14}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[color:var(--neutral-faint)]"
            />
            <input
              placeholder="Search passport, model or owner…"
              className="h-8 w-full rounded-[7px] border border-[color:var(--neutral-line)] bg-[color:var(--surface)] pl-8 pr-3 text-[12px] text-[color:var(--slate-ink)] placeholder:text-[color:var(--neutral-faint)] focus:border-[color:var(--honda-accent)] focus:outline-none"
            />
          </div>
          <div className="ml-auto flex items-center gap-2.5">
            <span className="hidden text-[11px] text-[color:var(--neutral-muted)] lg:inline truncate max-w-[220px]">
              {session.org}
            </span>
            <button
              onClick={() => { signOut(); navigate({ to: "/login" }); }}
              className="md:hidden inline-flex h-8 w-8 items-center justify-center rounded-[7px] border border-[color:var(--neutral-line)] text-[color:var(--honda-red)]"
              aria-label="Sign out"
            >
              <LogOut size={14} />
            </button>
          </div>
        </header>

        <main className="flex-1 px-3 py-4 pb-20 sm:px-5 sm:py-5 md:pb-5">
          <Outlet />
        </main>

        {/* Bottom tab bar - mobile only */}
        <nav className="fixed inset-x-0 bottom-0 z-30 flex h-16 items-stretch border-t border-[color:var(--neutral-line)] bg-white/95 backdrop-blur md:hidden pb-[env(safe-area-inset-bottom)]">
          {NAV.map((n) => {
            const active = isActive(n.to, n.exact);
            const Icon = n.icon;
            return (
              <Link
                key={n.to}
                to={n.to as "/dealer"}
                className={`flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition ${
                  active
                    ? "text-[color:var(--honda-accent)]"
                    : "text-[color:var(--neutral-muted)]"
                }`}
              >
                <Icon size={20} strokeWidth={active ? 2.5 : 2} />
                {n.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
