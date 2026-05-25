import { useState, type ReactNode } from "react";
import type { ApiUser } from "../types/api";
import { AuthContext } from "./auth.ts";

const STORAGE_KEY = "andromeda_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ApiUser | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? (JSON.parse(stored) as ApiUser) : null;
    } catch {
      return null;
    }
  });

  function login(u: ApiUser) {
    setUser(u);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
  }

  function logout() {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  return (

    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
