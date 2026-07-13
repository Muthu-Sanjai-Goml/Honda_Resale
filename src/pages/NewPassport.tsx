import { useState } from "react";
import { ValuePassportApp } from "@/components/passport/ValuePassportApp";

export function NewPassport() {
  // Bumping the key remounts the flow, resetting it for a fresh passport.
  const [instance, setInstance] = useState(0);
  return (
    <div className="-mx-4 -my-6 sm:-mx-6 sm:-my-8">
      <ValuePassportApp key={instance} onDone={() => setInstance((n) => n + 1)} />
    </div>
  );
}
