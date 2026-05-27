import { createContext, useContext, useState, type ReactNode } from 'react';
import type { ApiUser } from '../types/api';
import {
  isAuthenticated as isOciAuthenticated,
  getUserInfo,
  logout as ociLogout,
  clearTokens as clearOciTokens,
  loadTokens,
} from '../ociAuth';

const STORAGE_KEY = 'andromeda_user';

interface AuthContextType {
  user: ApiUser | null;
  login: (user: ApiUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

/**
 * Builds a minimal ApiUser from OCI id_token claims.
 *
 * NOTE: OCI IAM access tokens do not carry `userType` / `userId` (prod only).
 * We default to 'po'. For role-based routing, add a GET /api/users/me call
 * after authentication to enrich this object with the real userType.
 */
function buildUserFromOci(): ApiUser | null {
  const claims = getUserInfo();
  if (!claims) return null;
  return {
    id: 0,
    name: claims.name ?? claims.preferred_username ?? claims.sub ?? 'User',
    username: claims.preferred_username ?? claims.sub ?? '',
    email: claims.email ?? '',
    phone: null,
    userTypeId: 0,
    userType: 'po', // default — enriched by backend profile fetch when available
    createdAt: new Date(claims.iat * 1000).toISOString(),
    token: '', // OCI tokens are managed by ociAuth.tsx, not stored here
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ApiUser | null>(() => {
    // 1. Dev-profile: try localStorage (set by POST /api/auth/login)
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored) as ApiUser;
    } catch { /* ignore */ }

    // 2. Prod-profile: try OCI tokens from sessionStorage
    if (isOciAuthenticated()) {
      return buildUserFromOci();
    }

    return null;
  });

  /** Dev-profile login: stores the full ApiUser (including HMAC token) in localStorage. */
  function login(u: ApiUser) {
    setUser(u);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
  }

  /**
   * Logout for both profiles.
   * - OCI (prod): clears sessionStorage tokens + redirects to OCI logout endpoint.
   * - Dev:        clears localStorage; the calling component navigates to /login.
   */
  function logout() {
    const hadOciTokens = loadTokens() !== null;
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);

    if (hadOciTokens) {
      ociLogout(); // internally calls clearTokens() + sets window.location.href
    } else {
      clearOciTokens(); // safety cleanup
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
