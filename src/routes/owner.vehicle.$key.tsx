import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/owner/vehicle/$key")({
  component: VehicleHistory,
});

function VehicleHistory() {
  return <Navigate to="/owner/new" replace />;
}
