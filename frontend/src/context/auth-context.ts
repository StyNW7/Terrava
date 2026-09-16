import { createContext } from "react";
import type { AuthUser } from "@/types/auth";

export interface LoginResult {
  ok: boolean;
  message?: string;
  user?: AuthUser;
}

export interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  /** Validate credentials against the demo accounts and start a session. */
  login: (email: string, password: string, rememberMe?: boolean) => Promise<LoginResult>;
  /** Start a session directly for a known user (demo quick-login, register flow). */
  loginAs: (user: AuthUser, rememberMe?: boolean) => void;
  logout: () => void;
  updateUser: (patch: Partial<AuthUser>) => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
