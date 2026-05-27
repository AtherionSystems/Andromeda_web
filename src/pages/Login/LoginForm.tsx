import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import InputField from "../../components/InputField";
import Button from "../../components/Button";
import { useAuth } from "../../contexts/AuthContext";
import { login as ociLogin } from "../../ociAuth";
import type { ApiUser } from "../../types/api";

/**
 * True only when VITE_OCI_CLIENT_ID is set to a real value (not the placeholder).
 * This prevents the OCI login button from appearing before the Client ID is filled in.
 */
const _ociClientId = import.meta.env.VITE_OCI_CLIENT_ID as string | undefined;
const OCI_ENABLED =
  Boolean(_ociClientId) &&
  _ociClientId !== 'your_client_id_here';

function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // OAuth2 callback error surfaced by bootstrap() in main.tsx
  const ociError = searchParams.get("auth_error") === "1"
    ? (searchParams.get("desc") ?? "OAuth2 login failed.")
    : null;

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [ociLoading, setOciLoading] = useState(false);
  const [errors, setErrors] = useState({
    username: "",
    password: "",
    code: "",
  });

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

  // ── Dev-profile login (POST /api/auth/login) ────────────────────────────────
  const validate = () => {
    const newErrors = { username: "", password: "", code: "" };
    let isValid = true;

    if (!username) {
      newErrors.username = "Username is required";
      isValid = false;
    }

    if (!password) {
      newErrors.password = "Security key is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (event?: React.FormEvent<HTMLFormElement>) => {
    event?.preventDefault();

    if (!validate()) return;

    setLoading(true);
    try {
      const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Login failed:", data);
        setErrors((prev) => ({
          ...prev,
          username: data.message || "Invalid credentials",
        }));
        return;
      }

      // Backend may return { token, user: {...} } or flat { id, token, ... }.
      // Either way the token must end up inside the stored user object so
      // apiFetch can read it from andromeda_user.
      const rawUser = (data as { user?: ApiUser }).user ?? (data as ApiUser);
      const topToken = (data as { token?: string }).token;
      const loggedUser: ApiUser =
        topToken && !rawUser.token ? { ...rawUser, token: topToken } : rawUser;

      if (import.meta.env.DEV) {
        console.log("[auth] storing user:", loggedUser);
        console.log("[auth] token present:", Boolean(loggedUser.token));
      }

      login(loggedUser);

      const role = loggedUser.userType?.toLowerCase();
      if (role === "developer") {
        navigate("/developer", { replace: true });
      } else {
        navigate("/po", { replace: true });
      }
    } catch (error) {
      console.error("Network error:", error);
      setErrors((prev) => ({
        ...prev,
        username: "Could not connect to server",
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col justify-center bg-white px-8 py-10 md:px-12 md:py-12 lg:p-[60px]">
      <h2 className="mb-6 text-3xl font-semibold text-slate-900">
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

      {/* ── OCI IAM login button (shown when configured for prod) ──────────── */}
      {OCI_ENABLED && (
        <div className="mb-6">
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

          <div className="flex items-center gap-3 my-5">
            <span className="flex-1 h-px bg-slate-200" />
            <span className="text-[11px] text-slate-400">or use dev credentials</span>
            <span className="flex-1 h-px bg-slate-200" />
          </div>
        </div>
      )}

      {/* ── Dev-profile credential form ─────────────────────────────────────── */}
      <form onSubmit={handleSubmit}>
        <InputField
          label="Username"
          value={username}
          onChange={(val) => {
            setUsername(val);
            if (errors.username) setErrors((prev) => ({ ...prev, username: "" }));
          }}
          placeholder="Enter your username"
          error={errors.username}
        />

        <InputField
          label="Security Key"
          type="password"
          value={password}
          onChange={(val) => {
            setPassword(val);
            if (errors.password) setErrors((prev) => ({ ...prev, password: "" }));
          }}
          placeholder="Enter your password"
          error={errors.password}
        />

        <div className="mt-2">
          <Button
            text={loading ? "Authorizing..." : "Authorize Session"}
            onClick={() => handleSubmit()}
            type="submit"
          />
        </div>
      </form>

      <div className="mt-8 text-xs text-slate-600">
        <span>© 2026 Atherion Systems. All rights reserved.</span> |{" "}
        <span>Privacy</span> | <span>Compliance</span>
      </div>
    </div>
  );
}

export default LoginForm;
