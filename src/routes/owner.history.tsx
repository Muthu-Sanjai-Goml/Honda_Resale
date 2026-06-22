import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/owner/history")({
  component: HistoryPage,
});

function HistoryPage() {
  return <Navigate to="/owner/new" replace />;
}
