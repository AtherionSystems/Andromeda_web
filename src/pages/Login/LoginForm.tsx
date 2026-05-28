import { useState } from "react";
import { useNavigate } from "react-router-dom";
import InputField from "../../components/InputField";
import Button from "../../components/Button";
import { useAuth } from "../../contexts/auth";
import { useTheme } from "../../contexts/useTheme";
import type { ApiUser } from "../../types/api";

function LoginForm() {
  const { login } = useAuth();
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Added a 'root' error for server/auth failures
  const [errors, setErrors] = useState({
    username: "",
    password: "",
    root: "", 
  });

  const validate = () => {
    const newErrors = { username: "", password: "", root: "" };
    let isValid = true;

    if (!username.trim()) {
      newErrors.username = "Username is required";
      isValid = false;
    }

    if (!password) {
      newErrors.password = "Password is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Handled entirely by the form now

    if (!validate()) return;

    setLoading(true);
    setErrors((prev) => ({ ...prev, root: "" })); // Clear previous root errors

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Set generic errors to the root, not the username
        setErrors((prev) => ({
          ...prev,
          root: data.message || "Invalid credentials. Please try again.",
        }));
        return;
      }

      // Safely parsing the user (assuming API might return { user: {...} } OR {...})
      const loggedUser: ApiUser = data.user ? data.user : data;

      const role = loggedUser.userType?.toLowerCase();
      const redirectPath = role === "developer" ? "/developer" : "/po";
      setIsTransitioning(true);

      window.setTimeout(() => {
        login(loggedUser);
        navigate(redirectPath, { replace: true });
      }, 2500);
      return;
      
    } catch (error) {
      console.error("Network error:", error);
      setErrors((prev) => ({
        ...prev,
        root: "Could not connect to server. Please check your connection.",
      }));
    } finally {
      setLoading(false);
    }
  };

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

      <form onSubmit={handleSubmit}>
        {/* Render root errors at the top of the form */}
        {errors.root && (
          <div className={`mb-4 rounded p-3 text-sm ${darkMode ? "bg-red-900/30 text-red-200" : "bg-red-50 text-red-600"}`}>
            {errors.root}
          </div>
        )}

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
          label="Password"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(val) => {
            setPassword(val);
            if (errors.password) setErrors((prev) => ({ ...prev, password: "" }));
          }}
          placeholder="Enter your password"
          error={errors.password}
          rightIconSrc={showPassword ? "/Media/Icons/visibilityOffred.svg" : "/Media/Icons/visibilityRed.svg"}
          rightIconAlt={showPassword ? "Hide password" : "Show password"}
          rightIconAriaLabel={showPassword ? "Hide password" : "Show password"}
          onRightIconClick={() => setShowPassword((prev) => !prev)}
        />

        <div className="-mt-2 mb-4 text-right">
          <button
            type="button"
            onClick={() => navigate("/forgot-password")}
            className={`text-xs font-medium transition-opacity hover:opacity-80 ${darkMode ? "text-red-300" : "text-[#C74634]"}`}
          >
            Forgot password?
          </button>
        </div>

        <div className="mt-2">
          {/* Removed onClick. The form onSubmit handles it because type="submit" */}
          <Button
            text={loading ? "Authorizing..." : "Authorize Session"}
            type="submit" 
            disabled={loading || isTransitioning} 
          />
        </div>
      </form>

      <div className={`mt-8 text-xs ${darkMode ? "text-slate-200" : "text-slate-600"}`}>
        <span>© 2026 Atherion Systems. All rights reserved.</span> |{" "}
        <span>Privacy</span> | <span>Compliance</span>
      </div>

      {isTransitioning ? (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center andromeda-login-transition ${
            darkMode ? "andromeda-login-transition-dark" : "andromeda-login-transition-light"
          }`}
          aria-live="polite"
        >
          <div
            className={`andromeda-login-sweep ${
              darkMode ? "andromeda-login-sweep-dark" : "andromeda-login-sweep-light"
            }`}
            aria-hidden="true"
          />
          <img
            src="/Media/Images/Andromeda_Transparent.png"
            alt="Andromeda"
            className="relative z-10 w-[280px] max-w-[78vw] andromeda-login-logo"
          />
        </div>
      ) : null}
    </div>
  );
}

export default LoginForm;