import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useSession } from "@/lib/session";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { session } = useSession();
  if (!session) return <Navigate to="/login" />;
  if (session.role === "dealer") return <Navigate to="/dealer" />;
  return <Navigate to="/owner" />;
}
