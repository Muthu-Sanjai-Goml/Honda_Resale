import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

export type Role = "owner" | "dealer";
export type Session = { role: Role; name: string; org?: string } | null;

const KEY = "hvp.session";

const SessionCtx = createContext<{
  session: Session;
  signIn: (s: NonNullable<Session>) => void;
  signOut: () => void;
}>({ session: null, signIn: () => {}, signOut: () => {} });

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session>({ role: "owner", name: "Arjun Mehta" });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        setSession(JSON.parse(raw));
      } else {
        localStorage.setItem(KEY, JSON.stringify({ role: "owner", name: "Arjun Mehta" }));
      }
    } catch {}
  }, []);

  const signIn = useCallback((s: NonNullable<Session>) => {
    localStorage.setItem(KEY, JSON.stringify(s));
    setSession(s);
  }, []);
  const signOut = useCallback(() => {
    const defaultSession = { role: "owner" as Role, name: "Arjun Mehta" };
    localStorage.setItem(KEY, JSON.stringify(defaultSession));
    setSession(defaultSession);
  }, []);

  return (
    <SessionCtx.Provider value={{ session, signIn, signOut }}>{children}</SessionCtx.Provider>
  );
}

export function useSession() {
  return useContext(SessionCtx);
}
