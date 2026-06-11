import { jwtDecode } from 'jwt-decode';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface OciTokenSet {
  access_token: string;
  id_token?: string;
  refresh_token?: string;
  expires_at: number; // Unix timestamp (ms)
  token_type: string;
}

interface OciIdTokenClaims {
  sub: string;
  email?: string;
  name?: string;
  preferred_username?: string;
  exp: number;
  iat: number;
  iss: string;
}

// ─── Config (from Vite env) ───────────────────────────────────────────────────

const AUTH_URL     = import.meta.env.VITE_OCI_AUTH_URL     as string;
const TOKEN_URL    = import.meta.env.VITE_OCI_TOKEN_URL    as string;
const LOGOUT_URL   = import.meta.env.VITE_OCI_LOGOUT_URL   as string;
const CLIENT_ID    = import.meta.env.VITE_OCI_CLIENT_ID    as string;
const CLIENT_SECRET = import.meta.env.VITE_OCI_CLIENT_SECRET as string | undefined;
const REDIRECT_URI = import.meta.env.VITE_OCI_REDIRECT_URI as string;
const SCOPE        = import.meta.env.VITE_OCI_SCOPE        as string;

// OCI IAM applications created as "Confidential" require the client_secret in
// every token request even when PKCE is used. Set VITE_OCI_CLIENT_SECRET in
// .env to enable this. PKCE still runs in parallel for added security.

// ─── Storage Keys ─────────────────────────────────────────────────────────────

const STORAGE_KEY_TOKENS     = 'oci_tokens';
const STORAGE_KEY_CODE_VERIF = 'oci_pkce_verifier';
const STORAGE_KEY_STATE      = 'oci_oauth_state';

// ─── PKCE Helpers ─────────────────────────────────────────────────────────────

function base64UrlEncode(buffer: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

async function generateCodeVerifier(): Promise<string> {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64UrlEncode(array.buffer);
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return base64UrlEncode(digest);
}

function generateState(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return base64UrlEncode(array.buffer);
}

// ─── Token Storage ────────────────────────────────────────────────────────────

export function saveTokens(tokens: OciTokenSet): void {
  sessionStorage.setItem(STORAGE_KEY_TOKENS, JSON.stringify(tokens));
}

export function loadTokens(): OciTokenSet | null {
  const raw = sessionStorage.getItem(STORAGE_KEY_TOKENS);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as OciTokenSet;
  } catch {
    return null;
  }
}

export function clearTokens(): void {
  sessionStorage.removeItem(STORAGE_KEY_TOKENS);
  localStorage.removeItem(STORAGE_KEY_CODE_VERIF);
  localStorage.removeItem(STORAGE_KEY_STATE);
}

export function isTokenExpired(tokens: OciTokenSet): boolean {
  // 60-second buffer to prevent edge-case expiry during a request
  return Date.now() > tokens.expires_at - 60_000;
}

// ─── Login (Redirect to OCI IAM) ─────────────────────────────────────────────

export async function login(): Promise<void> {
  const verifier  = await generateCodeVerifier();
  const challenge = await generateCodeChallenge(verifier);
  const state     = generateState();

  localStorage.setItem(STORAGE_KEY_CODE_VERIF, verifier);
  localStorage.setItem(STORAGE_KEY_STATE, state);

  const params = new URLSearchParams({
    response_type:         'code',
    client_id:             CLIENT_ID,
    redirect_uri:          REDIRECT_URI,
    scope:                 SCOPE,
    state,
    code_challenge:        challenge,
    code_challenge_method: 'S256',
  });

  window.location.href = `${AUTH_URL}?${params.toString()}`;
}

// ─── Callback (Exchange Code for Tokens) ─────────────────────────────────────
// Call this when the browser lands on /callback with ?code=...&state=...

export async function handleCallback(): Promise<OciTokenSet> {
  const params     = new URLSearchParams(window.location.search);
  const code       = params.get('code');
  const state      = params.get('state');
  const errorParam = params.get('error');

  if (errorParam) {
    throw new Error(`OCI IAM error: ${errorParam} — ${params.get('error_description') ?? ''}`);
  }

  if (!code) throw new Error('No authorization code in callback URL');

  const savedState   = localStorage.getItem(STORAGE_KEY_STATE);
  const codeVerifier = localStorage.getItem(STORAGE_KEY_CODE_VERIF);

  if (!savedState || state !== savedState) {
    throw new Error('OAuth2 state mismatch — possible CSRF attack');
  }
  if (!codeVerifier) {
    throw new Error('PKCE code verifier missing from session storage');
  }

  const body = new URLSearchParams({
    grant_type:    'authorization_code',
    client_id:     CLIENT_ID,
    redirect_uri:  REDIRECT_URI,
    code,
    code_verifier: codeVerifier,
    ...(CLIENT_SECRET ? { client_secret: CLIENT_SECRET } : {}),
  });

  const response = await fetch(TOKEN_URL, {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    body.toString(),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Token exchange failed (${response.status}): ${errText}`);
  }

  const json = await response.json();
  const expiresIn: number = json.expires_in ?? 3600;

  const tokenSet: OciTokenSet = {
    access_token:  json.access_token,
    id_token:      json.id_token,
    refresh_token: json.refresh_token,
    expires_at:    Date.now() + expiresIn * 1000,
    token_type:    json.token_type ?? 'Bearer',
  };

  saveTokens(tokenSet);

  // Clean up PKCE state from session
  sessionStorage.removeItem(STORAGE_KEY_CODE_VERIF);
  sessionStorage.removeItem(STORAGE_KEY_STATE);

  return tokenSet;
}

// ─── Refresh Token ────────────────────────────────────────────────────────────

export async function refreshAccessToken(tokens: OciTokenSet): Promise<OciTokenSet> {
  if (!tokens.refresh_token) {
    throw new Error('No refresh_token available — user must log in again');
  }

  const body = new URLSearchParams({
    grant_type:    'refresh_token',
    client_id:     CLIENT_ID,
    refresh_token: tokens.refresh_token,
    ...(CLIENT_SECRET ? { client_secret: CLIENT_SECRET } : {}),
  });

  const response = await fetch(TOKEN_URL, {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    body.toString(),
  });

  if (!response.ok) {
    clearTokens();
    throw new Error(`Token refresh failed (${response.status}) — redirecting to login`);
  }

  const json = await response.json();
  const expiresIn: number = json.expires_in ?? 3600;

  const newTokenSet: OciTokenSet = {
    access_token:  json.access_token,
    id_token:      json.id_token ?? tokens.id_token,
    refresh_token: json.refresh_token ?? tokens.refresh_token,
    expires_at:    Date.now() + expiresIn * 1000,
    token_type:    json.token_type ?? 'Bearer',
  };

  saveTokens(newTokenSet);
  return newTokenSet;
}

// ─── Get Valid Access Token (auto-refresh) ────────────────────────────────────
// Use this before every API call.

export async function getValidAccessToken(): Promise<string> {
  let tokens = loadTokens();
  if (!tokens) {
    await login(); // Redirects — execution stops here
    throw new Error('Redirecting to login');
  }
  if (isTokenExpired(tokens)) {
    tokens = await refreshAccessToken(tokens);
  }
  return tokens.access_token;
}

// ─── Logout ───────────────────────────────────────────────────────────────────

export function logout(): void {
  const tokens = loadTokens();
  clearTokens();

  const params = new URLSearchParams({
    post_logout_redirect_uri: 'https://atherionsystems.github.io/Andromeda_web/logged-out',
  });

  if (tokens?.id_token) {
    params.set('id_token_hint', tokens.id_token);
  }

  window.location.href = `${LOGOUT_URL}?${params.toString()}`;
}

// ─── Read Claims from id_token ────────────────────────────────────────────────

export function getUserInfo(): OciIdTokenClaims | null {
  const tokens = loadTokens();
  if (!tokens?.id_token) return null;
  try {
    return jwtDecode<OciIdTokenClaims>(tokens.id_token);
  } catch {
    return null;
  }
}

// ─── isAuthenticated ──────────────────────────────────────────────────────────

export function isAuthenticated(): boolean {
  const tokens = loadTokens();
  return tokens !== null && !isTokenExpired(tokens);
}
