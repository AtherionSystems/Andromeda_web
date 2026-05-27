import { loadTokens, getValidAccessToken, clearTokens, login as ociLogin } from '../ociAuth';

// In dev, Vite proxies /api → http://localhost:8080, so BASE_URL must be empty.
// In prod, set VITE_API_BASE_URL to the full backend origin (must start with http).
// If the value is set but doesn't look like an absolute URL, ignore it so the
// Vite proxy keeps working correctly in dev.
const _rawBase = import.meta.env.VITE_API_BASE_URL as string | undefined;
const BASE_URL = _rawBase?.startsWith('http') ? _rawBase.replace(/\/$/, '') : '';

const STORAGE_KEY = 'andromeda_user';

/** Read the HMAC token stored by the dev-profile login (/api/auth/login). */
function getDevToken(): string | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const token = (JSON.parse(raw) as { token?: string }).token ?? null;
    if (import.meta.env.DEV && !token) {
      console.warn(
        'apiFetch: user object found in storage but token field is missing — requests will go unauthenticated',
      );
    }
    return token;
  } catch {
    return null;
  }
}

/**
 * Resolves the best available Bearer token:
 *   1. OCI IAM access token  (prod profile — sessionStorage, auto-refreshed)
 *   2. Dev-profile HMAC token (dev profile  — localStorage)
 */
async function resolveToken(): Promise<string | null> {
  // OCI tokens take priority when the PKCE flow has been started
  if (loadTokens() !== null) {
    try {
      return await getValidAccessToken(); // auto-refreshes if expired
    } catch {
      // refresh failed — fall through to dev token (or return null)
      return null;
    }
  }
  // Fall back to the dev-profile token
  return getDevToken();
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = await resolveToken();

  if (import.meta.env.DEV) {
    console.log(
      `[apiFetch] ${options.method ?? 'GET'} ${path} — auth: ${
        token ? 'Bearer ' + token.slice(0, 10) + '…' : 'none'
      }`,
    );
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  // Token rejected — clear everything and redirect to login
  if (res.status === 401) {
    clearTokens();
    localStorage.removeItem(STORAGE_KEY);

    // Only trigger OCI redirect if the PKCE flow is configured
    if (import.meta.env.VITE_OCI_CLIENT_ID) {
      await ociLogin();
    }
    throw new Error('Unauthorized — redirecting to login');
  }

  if (res.status === 204) return undefined as T;

  const contentType = res.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    // Response is not JSON (e.g. Vite SPA fallback returning index.html, or a
    // proxy error page). Throw so callers don't receive null silently.
    throw new Error(
      `API error ${res.status}: expected JSON but got "${contentType}" — check VITE_API_BASE_URL`,
    );
  }

  const data = await res.json().catch(() => {
    throw new Error(`API error ${res.status}: response body is not valid JSON`);
  });

  if (!res.ok) {
    throw new Error(
      (data as { error?: string })?.error ?? `HTTP ${res.status}`,
    );
  }

  return data as T;
}
