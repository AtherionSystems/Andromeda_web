const BASE_URL = "";
const STORAGE_KEY = "andromeda_user";

function getStoredToken(): string | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const token = (JSON.parse(raw) as { token?: string }).token ?? null;
    if (import.meta.env.DEV && !token) {
      console.warn("apiFetch: user object found in storage but token field is missing — requests will go unauthenticated");
    }
    return token;
  } catch {
    return null;
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getStoredToken();
  if (import.meta.env.DEV) {
    console.log(`[apiFetch] ${options.method ?? "GET"} ${path} — auth: ${token ? "Bearer " + token.slice(0, 10) + "…" : "none"}`);
  }
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (res.status === 204) return undefined as T;

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(
      (data as { error?: string })?.error ?? `HTTP ${res.status}`
    );
  }

  return data as T;
}
