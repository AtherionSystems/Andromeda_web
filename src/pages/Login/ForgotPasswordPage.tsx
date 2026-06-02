import { useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "../../layouts/AuthLayout";
import BrandPanel from "./BrandPanel";
import { useTheme } from "../../contexts/useTheme";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const { darkMode } = useTheme();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
  };

  return (
    <AuthLayout>
      <BrandPanel />
      <div className={`flex flex-1 flex-col justify-center px-8 py-10 md:px-12 md:py-12 lg:p-[60px] ${darkMode ? "bg-slate-900" : "bg-white"}`}>
        <h2 className={`mb-3 text-3xl font-semibold ${darkMode ? "text-slate-100" : "text-slate-900"}`}>Recover Access</h2>
        <p className={`mb-6 text-sm ${darkMode ? "text-slate-300" : "text-slate-600"}`}>
          Enter your account email and we will send password reset instructions.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className={`text-sm font-medium ${darkMode ? "text-slate-200" : "text-slate-700"}`}>
              Account email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className={`mt-1.5 w-full rounded-md border px-3 py-2.5 text-sm placeholder:text-slate-400 focus:border-[#C74634] focus:outline-none focus:ring-2 focus:ring-[#C74634]/20 ${darkMode ? "border-slate-700 bg-slate-800 text-slate-100" : "border-slate-300 text-slate-800"}`}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-md bg-[#C74634] px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Send reset link
          </button>
        </form>

        {submitted ? (
          <p className={`mt-4 text-sm ${darkMode ? "text-emerald-300" : "text-emerald-700"}`}>
            If that email exists, reset instructions were sent.
          </p>
        ) : null}

        <Link to="/login" className="mt-6 inline-block text-xs font-medium text-[#C74634] hover:opacity-80">
          Back to login
        </Link>
      </div>
    </AuthLayout>
  );
}

export default ForgotPasswordPage;
