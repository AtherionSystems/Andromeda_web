import { useRef, useState } from "react";
import { useClickOutside } from "../../hooks/useClickOutside";
import { useTheme } from "../../contexts/themeContext";
import { getInitials, ROLE_LABEL } from "../../lib/user";
import type { ApiUser } from "../../types/api";

interface AvatarMenuProps {
  user: ApiUser;
  role: "po" | "developer";
  onViewProfile: () => void;  // required, not optional
  onLogout: () => void;
}

export function AvatarMenu({ user, role, onViewProfile, onLogout }: AvatarMenuProps) {
  const [open, setOpen] = useState(false);
  const { darkMode, toggleDarkMode } = useTheme();
  const ref = useRef<HTMLDivElement>(null);

  useClickOutside(ref, open, () => setOpen(false));

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(p => !p)}
        title={user.name}
        className="w-8 h-8 rounded-full bg-[#4a3f7a] flex items-center justify-center text-white text-[11px] font-semibold cursor-pointer border-none hover:bg-[#3a2f6a] transition-colors"
      >
        {getInitials(user.name)}
      </button>

     {open && (
            <div className="absolute right-0 mt-2 w-[220px] bg-white border border-black/10 rounded-xl shadow-md z-50 overflow-hidden">

                {/* User header */}
                <div className="flex items-center gap-2.5 px-4 py-3 border-b border-black/8">
                <div className="w-9 h-9 rounded-full bg-[#4a3f7a] flex items-center justify-center text-white text-[12px] font-semibold shrink-0">
                    {getInitials(user.name)}
                </div>
                <div className="overflow-hidden">
                    <p className="text-[13px] font-medium text-gray-900 truncate">{user.name}</p>
                    <p className="text-[11px] text-gray-400">{ROLE_LABEL[role] ?? role}</p>
                </div>
                </div>

                {/* Actions */}
                <div className="py-1.5">
                <button
                    onClick={() => { setOpen(false); onViewProfile(); }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-50 transition-colors text-left border-none bg-transparent cursor-pointer"
                >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-400 shrink-0">
                    <circle cx="8" cy="5" r="3" />
                    <path d="M2 14c0-3 2.7-5 6-5s6 2 6 5" />
                    </svg>
                    View profile
                </button>

                <button
                    onClick={toggleDarkMode}
                    aria-pressed={darkMode}
                    title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-50 transition-colors text-left border-none bg-transparent cursor-pointer"
                >
                    <img
                      src="/Media/Icons/visibility.png"
                      alt="Visibility icon"
                      className="h-4 w-4 shrink-0 object-contain opacity-70"
                    />
                    {darkMode ? "Light mode" : "Dark mode"}
                    {/* Toggle pill */}
                    <span className="ml-auto">
                    <span className={`inline-flex w-8 h-[18px] rounded-full border border-black/10 items-center px-0.5 transition-colors ${darkMode ? "bg-[#4a3f7a]" : "bg-gray-200"}`}>
                        <span className={`w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-transform ${darkMode ? "translate-x-3.5" : "translate-x-0"}`} />
                    </span>
                    </span>
                </button>
                </div>

                {/* Sign out */}
                <div className="border-t border-black/8 py-1.5">
                <button
                    onClick={() => { setOpen(false); onLogout(); }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] text-red-500 hover:bg-red-50 transition-colors text-left border-none bg-transparent cursor-pointer"
                >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="shrink-0">
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