import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/owner/")({
  component: OwnerDashboard,
});

function OwnerDashboard() {
  return <Navigate to="/owner/new" />;;
}
