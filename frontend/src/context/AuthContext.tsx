import { useCallback, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { AuthContext } from "@/context/auth-context";
import type { AuthContextValue } from "@/context/auth-context";
import { verifyCredentials, toAuthUser } from "@/data/demoAccounts";
import type { AuthSession, AuthUser } from "@/types/auth";

const STORAGE_KEY = "terrava-auth-session";
const LOGIN_DELAY_MS = 900;

function readSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY) ?? window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthSession;
    return parsed?.user?.email ? parsed : null;
  } catch {
    return null;
  }
}

function writeSession(session: AuthSession | null) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    window.sessionStorage.removeItem(STORAGE_KEY);
    if (!session) return;
    const storage = session.rememberMe ? window.localStorage : window.sessionStorage;
    storage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    // Storage can be unavailable (private mode); the in-memory session still works.
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(() => readSession());

  const loginAs = useCallback<AuthContextValue["loginAs"]>((user, rememberMe = true) => {
    const next: AuthSession = { user, loggedInAt: new Date().toISOString(), rememberMe };
    writeSession(next);
    setSession(next);
  }, []);

  const login = useCallback<AuthContextValue["login"]>(
    async (email, password, rememberMe = false) => {
      await new Promise((resolve) => setTimeout(resolve, LOGIN_DELAY_MS));
      const account = await verifyCredentials(email, password);
      if (!account) {
        // A dictionary key; the login page renders it through `t()`.
        return { ok: false, message: "auth.error.invalidCredentials" };
      }
      const user = toAuthUser(account);
      loginAs(user, rememberMe);
      return { ok: true, user };
    },
    [loginAs]
  );

  const logout = useCallback(() => {
    writeSession(null);
    setSession(null);
  }, []);

  const updateUser = useCallback((patch: Partial<AuthUser>) => {
    setSession((current) => {
      if (!current) return current;
      const next = { ...current, user: { ...current.user, ...patch } };
      writeSession(next);
      return next;
    });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      isAuthenticated: Boolean(session),
      login,
      loginAs,
      logout,
      updateUser,
    }),
    [session, login, loginAs, logout, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
