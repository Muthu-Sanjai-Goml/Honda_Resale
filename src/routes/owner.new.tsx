import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ValuePassportApp } from "@/components/passport/ValuePassportApp";
import { useSession } from "@/lib/session";

export const Route = createFileRoute("/owner/new")({
  component: NewPassport,
});

function NewPassport() {
  const { signOut } = useSession();
  const navigate = useNavigate();
  return (
    <div className="-mx-4 -my-6 sm:-mx-6 sm:-my-8">
      <ValuePassportApp
        onSignOut={() => {
          signOut();
          navigate({ to: "/login" });
        }}
        onDone={() => navigate({ to: "/owner" })}
      />
    </div>
  );
}
