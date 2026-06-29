import { createFileRoute, Outlet, Navigate } from "@tanstack/react-router";
import { useSession } from "@/lib/session";
import { HondaLogo } from "@/components/passport/HondaLogo";

export const Route = createFileRoute("/owner")({
  component: OwnerLayout,
});

function OwnerLayout() {
  const { session } = useSession();

  if (!session) return <Navigate to="/login" />;
  if (session.role !== "owner") return <Navigate to="/dealer" />;

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-[color:var(--neutral-line)] bg-white/95 px-5 backdrop-blur">
        <HondaLogo size={26} />
        <span className="font-display text-[16px] font-semibold text-[color:var(--slate-ink)] tracking-wider">
          HONDA VALUE PASSPORT
        </span>
      </header>

      <main className="flex-1 px-4 py-5 sm:px-6 sm:py-6 max-w-[900px] mx-auto w-full">
        <Outlet />
      </main>
    </div>
  );
}
