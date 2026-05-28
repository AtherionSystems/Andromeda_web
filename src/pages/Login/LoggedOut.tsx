import { useNavigate } from "react-router-dom";
import AuthLayout from "../../layouts/AuthLayout";
import BrandPanel from "./BrandPanel";

function LoggedOut() {
  const navigate = useNavigate();

  return (
    <AuthLayout>
      <BrandPanel />

      <div className="flex flex-1 flex-col justify-center bg-white px-8 py-10 md:px-12 md:py-12 lg:p-[60px]">
        {/* Icon */}
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-[#fef2f2]">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#c74634"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </div>

        {/* Heading */}
        <p
          className="mb-1 text-[10px] font-semibold uppercase tracking-[1.2px]"
          style={{ color: "#c74634" }}
        >
          Session Terminated
        </p>
        <h2 className="mb-3 text-3xl font-semibold text-slate-900">
          You've been signed out
        </h2>
        <p className="mb-8 max-w-sm text-[13px] leading-relaxed text-[#516162]">
          Your session has ended and all credentials have been cleared. Return
          to the login page to authenticate a new session.
        </p>

        {/* Return button */}
        <button
          type="button"
          onClick={() => navigate("/login", { replace: true })}
          className="w-full rounded bg-[#c74634] py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-[#a83828] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Return to Login
        </button>

        {/* Divider */}
        <div className="my-6 flex items-center gap-3">
          <span className="h-px flex-1 bg-slate-100" />
          <span className="text-[11px] text-slate-400">secure terminal</span>
          <span className="h-px flex-1 bg-slate-100" />
        </div>

        {/* Info row */}
        <div className="rounded border border-slate-100 bg-[#f0f4f5] px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#5a7a8a]">
            Why was I signed out?
          </p>
          <p className="mt-1 text-[11px] leading-relaxed text-[#6a8a9a]">
            You may have signed out manually, your session token expired, or an
            administrator revoked access. Contact your system administrator if
            this was unexpected.
          </p>
        </div>

        <div className="mt-8 text-xs text-slate-400">
          <span>© 2026 Atherion Systems. All rights reserved.</span> |{" "}
          <span>Privacy</span> | <span>Compliance</span>
        </div>
      </div>
    </AuthLayout>
  );
}

export default LoggedOut;
