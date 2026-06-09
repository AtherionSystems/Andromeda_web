import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useClickOutside } from "../../hooks/useClickOutside";
import { useTheme } from "../../contexts/useTheme";
import { getInitials, ROLE_LABEL } from "../../lib/user";
import type { ApiUser } from "../../types/api";

interface AvatarMenuProps {
  user: ApiUser;
  role: "po" | "developer";
  onLogout: () => void;
}

const itemClass = (darkMode: boolean) =>
  `w-full flex items-center gap-2.5 px-4 py-2 text-[13px] transition-colors text-left border-none bg-transparent cursor-pointer ${
    darkMode ? "text-slate-200 hover:bg-slate-700" : "text-gray-700 hover:bg-gray-50"
  }`;

function Avatar({ name, darkMode }: { name: string; darkMode: boolean }) {
  return (
    <div
      className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-[12px] font-semibold shrink-0 ${
        darkMode ? "bg-slate-700" : "bg-[#4a3f7a]"
      }`}
    >
      {getInitials(name)}
    </div>
  );
}

export function AvatarMenu({ user, role, onLogout }: AvatarMenuProps) {
  const [open, setOpen] = useState(false);
  const { darkMode, toggleDarkMode } = useTheme();
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useClickOutside(ref, open, () => setOpen(false));

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((p) => !p)}
        title={user.name}
        aria-haspopup="menu"
        aria-expanded={open}
        className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-[12px] font-semibold cursor-pointer border-none transition-colors ${
          darkMode ? "bg-slate-700 hover:bg-slate-600" : "bg-[#4a3f7a] hover:bg-[#3a2f6a]"
        }`}
      >
        {getInitials(user.name)}
      </button>

      {open && (
        <div
          role="menu"
          className={`absolute right-0 mt-2 w-[220px] rounded-xl border shadow-md z-50 overflow-hidden ${
            darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-black/10"
          }`}
        >
          {/* User header */}
          <div className={`flex items-center gap-2.5 px-4 py-3 border-b ${darkMode ? "border-slate-700" : "border-black/8"}`}>
            <Avatar name={user.name} darkMode={darkMode} />
            <div className="overflow-hidden">
              <p className={`text-[13px] font-medium truncate ${darkMode ? "text-slate-100" : "text-gray-900"}`}>{user.name}</p>
              <p className={`text-[11px] ${darkMode ? "text-slate-400" : "text-gray-400"}`}>{ROLE_LABEL[role]}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="py-1.5">
            <button
              role="menuitem"
              onClick={toggleDarkMode}
              aria-pressed={darkMode}
              title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              className={itemClass(darkMode)}
            >
              <img
                src={darkMode ? "/Andromeda_web/Media/Icons/visibilityWhite.svg" : "/Andromeda_web/Media/Icons/visibility.svg"}
                alt=""
                aria-hidden="true"
                className={`h-4 w-4 shrink-0 object-contain ${darkMode ? "opacity-100" : "opacity-70"}`}
              />
              {darkMode ? "Light mode" : "Dark mode"}
              {/* Toggle pill */}
              <span className="ml-auto" aria-hidden="true">
                <span className={`inline-flex w-8 h-[18px] rounded-full border items-center px-0.5 transition-colors ${darkMode ? "bg-[#4a3f7a] border-slate-600" : "bg-gray-200 border-black/10"}`}>
                  <span className={`w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-transform ${darkMode ? "translate-x-3.5" : "translate-x-0"}`} />
                </span>
              </span>
            </button>
          </div>

          {/* Role switch */}
          {role === "po" && (
            <div className={`border-t py-1.5 ${darkMode ? "border-slate-700" : "border-black/8"}`}>
              <button
                role="menuitem"
                onClick={() => { setOpen(false); navigate("/developer"); }}
                className={itemClass(darkMode)}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="shrink-0" aria-hidden="true">
                  <path d="M4 6l-3 2 3 2M12 6l3 2-3 2M9 4l-2 8" />
                </svg>
                Developer's View
              </button>
            </div>
          )}
          {role === "developer" && (
            <div className={`border-t py-1.5 ${darkMode ? "border-slate-700" : "border-black/8"}`}>
              <button
                role="menuitem"
                onClick={() => { setOpen(false); navigate("/po"); }}
                className={itemClass(darkMode)}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="shrink-0" aria-hidden="true">
                  <path d="M2 4h12M2 8h8M2 12h5M13 9v5M10.5 11.5l2.5 2.5 2.5-2.5" />
                </svg>
                PO's View
              </button>
            </div>
          )}

          {/* Sign out */}
          <div className={`border-t py-1.5 ${darkMode ? "border-slate-700" : "border-black/8"}`}>
            <button
              role="menuitem"
              onClick={() => { setOpen(false); onLogout(); }}
              className={`w-full flex items-center gap-2.5 px-4 py-2 text-[13px] transition-colors text-left border-none bg-transparent cursor-pointer ${
                darkMode ? "text-red-300 hover:bg-slate-700" : "text-red-500 hover:bg-red-50"
              }`}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="shrink-0" aria-hidden="true">
                <path d="M6 3H3a1 1 0 00-1 1v8a1 1 0 001 1h3M10 11l3-3-3-3M13 8H6" />
              </svg>
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
