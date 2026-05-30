import { createContext, useContext } from "react";
import type { ApiUser } from "../types/api";

export interface AuthContextType {
  user: ApiUser | null;
  login: (user: ApiUser) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}