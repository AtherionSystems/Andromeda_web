import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTheme } from "../../contexts/useTheme";
import { login as ociLogin } from "../../ociAuth";

function LoginForm() {
  const { darkMode } = useTheme();
  const [searchParams] = useSearchParams();

  // OAuth2 callback error surfaced by bootstrap() in main.tsx
  const ociError = searchParams.get("auth_error") === "1"
    ? (searchParams.get("desc") ?? "OAuth2 login failed.")
    : null;

  const [ociLoading, setOciLoading] = useState(false);

  // ── OCI IAM login (prod) ────────────────────────────────────────────────────
  async function handleOciLogin() {
    setOciLoading(true);
    try {
      await ociLogin(); // redirects to OCI — execution stops here
    } catch (err) {
      console.error("OCI login error:", err);
      setOciLoading(false);
    }
  }

  return (
    <div
      className={`flex flex-1 flex-col justify-center px-8 py-10 md:px-12 md:py-12 lg:p-[60px] ${
        darkMode ? "bg-slate-900" : "bg-white"
      }`}
    >
      <h2
        className={`mb-6 text-3xl font-semibold ${
          darkMode ? "text-slate-100" : "text-slate-900"
        }`}
      >
        Identify Credentials
      </h2>

      {/* ── OAuth2 callback error banner ────────────────────────────────────── */}
      {ociError && (
        <div className="mb-5 rounded-md border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-[11px] font-semibold text-red-700 uppercase tracking-wide mb-1">
            Login failed
          </p>
          <p className="text-[12px] text-red-600 break-words">{ociError}</p>
          <p className="text-[11px] text-red-400 mt-1">
            Check the browser console for the full error trace.
          </p>
        </div>
      )}

      {/* ── OCI IAM login button ────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={handleOciLogin}
        disabled={ociLoading}
        className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded border border-[#c74634] bg-white text-[#c74634] text-[13px] font-medium hover:bg-[#c74634] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {/* Oracle / OCI icon */}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
        </svg>
        {ociLoading ? "Redirecting to OCI IAM…" : "Login with OCI IAM"}
      </button>

      <div className={`mt-8 text-xs ${darkMode ? "text-slate-200" : "text-slate-600"}`}>
        <span>© 2026 Atherion Systems. All rights reserved.</span> |{" "}
        <span>Privacy</span> | <span>Compliance</span>
      </div>
    </div>
  );
}

export default LoginForm;
