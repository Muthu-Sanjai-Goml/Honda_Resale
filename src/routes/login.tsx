import { createFileRoute, useNavigate, Navigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Car, LayoutDashboard, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";
import { useSession, type Role } from "@/lib/session";
import { HondaLogo } from "@/components/passport/HondaLogo";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const { session, signIn } = useSession();
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>("owner");

  if (session?.role === "owner") return <Navigate to="/owner" />;
  if (session?.role === "dealer") return <Navigate to="/dealer" />;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (role === "owner") {
      signIn({ role: "owner", name: "Arjun Mehta" });
      navigate({ to: "/owner" });
    } else {
      signIn({
        role: "dealer",
        name: "Neeraj Pillai",
        org: "Honda Cars Bengaluru — Indiranagar",
      });
      navigate({ to: "/dealer" });
    }
  };

  const isOwner = role === "owner";

  return (
    <div className="min-h-screen bg-[color:var(--surface)] lg:grid lg:grid-cols-[1.05fr_1fr]">
      {/* Left – brand panel */}
      <aside className="relative hidden overflow-hidden bg-[color:var(--slate-ink)] text-white lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 -top-32 h-[480px] w-[480px] rounded-full"
          style={{
            background:
              "radial-gradient(closest-side, rgba(230,1,33,0.55), rgba(204,0,0,0.0) 70%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-40 -left-24 h-[420px] w-[420px] rounded-full"
          style={{
            background:
              "radial-gradient(closest-side, rgba(204,0,0,0.4), rgba(0,0,0,0) 70%)",
          }}
        />

        <div className="relative flex items-center gap-3">
          <HondaLogo size={40} />
          <div>
            <div className="font-display text-[20px] font-semibold leading-none">Honda</div>
            <div className="mt-1 text-[12px] uppercase tracking-[0.18em] text-white/60">
              Value Passport
            </div>
          </div>
        </div>

        <div className="relative max-w-[440px]">
          <div className="section-label !text-white/60">A smarter resale journey</div>
          <h1 className="mt-3 font-display text-[44px] font-semibold leading-[1.05]">
            Know what your Honda is truly worth.
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-white/70">
            Owners get an AI-powered Value Passport in minutes. Dealers get verified,
            inspection-ready stock — all in one console.
          </p>

          <ul className="mt-8 space-y-3 text-[14px] text-white/80">
            <Bullet icon={<Sparkles size={16} />}>AI condition scoring from photos</Bullet>
            <Bullet icon={<TrendingUp size={16} />}>Live market price benchmarks</Bullet>
            <Bullet icon={<ShieldCheck size={16} />}>Verified history, shared instantly</Bullet>
          </ul>
        </div>

        <div className="relative text-[12px] text-white/40">
          © Honda Value Passport · Demo experience
        </div>
      </aside>

      {/* Right – sign in panel */}
      <main className="flex min-h-screen flex-col">
        <header className="flex items-center justify-between px-5 py-4 sm:px-8 lg:hidden">
          <div className="flex items-center gap-3">
            <HondaLogo size={32} />
            <div className="font-display text-[18px] font-semibold text-[color:var(--slate-ink)]">
              Honda
            </div>
          </div>
          <div className="text-[13px] font-medium text-[color:var(--neutral-muted)]">
            Value Passport
          </div>
        </header>

        <div className="flex flex-1 items-center justify-center px-5 py-10 sm:px-8">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-[440px]"
          >
            <div className="section-label">Sign in</div>
            <h2 className="mt-2 font-display text-[32px] font-semibold leading-tight text-[color:var(--slate-ink)]">
              Welcome back
            </h2>
            <p className="mt-2 text-[14px] text-[color:var(--neutral-muted)]">
              Choose how you'd like to continue today.
            </p>

            {/* Role toggle */}
            <div
              role="tablist"
              aria-label="Select role"
              className="relative mt-7 grid grid-cols-2 rounded-[12px] border border-[color:var(--neutral-line)] bg-white p-1"
            >
              <span
                aria-hidden
                className="absolute inset-y-1 w-[calc(50%-4px)] rounded-[9px] bg-[color:var(--honda-red)] shadow-[0_2px_8px_rgba(204,0,0,0.25)] transition-transform duration-300 ease-out"
                style={{ transform: isOwner ? "translateX(4px)" : "translateX(calc(100% + 4px))" }}
              />
              <RoleTab
                active={isOwner}
                onClick={() => setRole("owner")}
                icon={<Car size={16} />}
                label="Owner"
              />
              <RoleTab
                active={!isOwner}
                onClick={() => setRole("dealer")}
                icon={<LayoutDashboard size={16} />}
                label="Dealer"
              />
            </div>

            <p className="mt-3 text-[13px] text-[color:var(--neutral-muted)]">
              {isOwner
                ? "Generate a Value Passport for your Honda and track its resale score over time."
                : "Review incoming submissions, inspect vehicles, and shortlist promising stock."}
            </p>

            {/* Fields */}
            <div className="mt-7 space-y-4">
              <FormField label="Email">
                <input
                  type="email"
                  defaultValue={isOwner ? "arjun.mehta@example.com" : "neeraj.p@hondadealer.com"}
                  key={role}
                  className="h-11 w-full rounded-[10px] border border-[color:var(--neutral-line)] bg-white px-3.5 text-[14px] text-[color:var(--slate-ink)] outline-none transition focus:border-[color:var(--slate-ink)] focus:ring-2 focus:ring-[color:var(--honda-red)]/15"
                />
              </FormField>
              <FormField
                label="Password"
                trailing={
                  <button
                    type="button"
                    className="text-[12px] font-medium text-[color:var(--honda-accent)] hover:underline"
                  >
                    Forgot?
                  </button>
                }
              >
                <input
                  type="password"
                  defaultValue="demo-password"
                  className="h-11 w-full rounded-[10px] border border-[color:var(--neutral-line)] bg-white px-3.5 text-[14px] text-[color:var(--slate-ink)] outline-none transition focus:border-[color:var(--slate-ink)] focus:ring-2 focus:ring-[color:var(--honda-red)]/15"
                />
              </FormField>
            </div>

            <button
              type="submit"
              className="group mt-7 inline-flex h-12 w-full items-center justify-center gap-2 rounded-[10px] bg-[color:var(--honda-red)] text-[15px] font-medium text-white shadow-[0_4px_14px_rgba(204,0,0,0.25)] transition hover:bg-[color:var(--honda-red-hover)]"
            >
              Continue as {isOwner ? "Owner" : "Dealer"}
              <ArrowRight
                size={16}
                className="transition group-hover:translate-x-0.5"
              />
            </button>

            <div className="mt-5 flex items-center gap-3 text-[12px] text-[color:var(--neutral-faint)]">
              <span className="h-px flex-1 bg-[color:var(--neutral-line)]" />
              Demo · stored locally
              <span className="h-px flex-1 bg-[color:var(--neutral-line)]" />
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

function Bullet({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-3">
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white">
        {icon}
      </span>
      {children}
    </li>
  );
}

function RoleTab({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`relative z-10 flex h-10 items-center justify-center gap-2 rounded-[9px] text-[13px] font-medium transition-colors ${
        active ? "text-white" : "text-[color:var(--neutral-muted)] hover:text-[color:var(--slate-ink)]"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function FormField({
  label,
  trailing,
  children,
}: {
  label: string;
  trailing?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-[12px] font-medium uppercase tracking-[0.08em] text-[color:var(--neutral-muted)]">
          {label}
        </span>
        {trailing}
      </div>
      {children}
    </label>
  );
}
