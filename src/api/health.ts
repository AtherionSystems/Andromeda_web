import { BASE_URL } from "./client";

interface HealthResponse {
  status?: string;
}

/**
 * Liveness probe against `GET /health`.
 *
 * Semantics are intentionally "liveness", not "readiness": any HTTP response
 * (even 403/5xx) means the backend process answered, so it is considered UP.
 * Only a network-level failure (fetch throws) counts as DOWN.
 *
 * This goes through a plain `fetch` rather than `apiFetch` on purpose, so a
 * 401 on a protected probe does NOT clear the session / trigger a login
 * redirect — a health check must never log the user out.
 */
export async function getHealth(signal?: AbortSignal): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/health`, { signal });
    if (!res.ok) return true; // reachable but gated/erroring → process is alive
    const data = (await res.json().catch(() => null)) as HealthResponse | null;
    if (typeof data?.status !== "string") return true;
    return data.status.toUpperCase() === "UP";
  } catch {
    return false; // network failure (or aborted) → treat as down
  }
}
