import { useState } from "react";
import SearchInput from "./SearchInput";
import type { ApiUser } from "../../types/api";

const TABS: Record<string, { label: string; value: string }[]> = {
  po: [
    { label: "Overview", value: "overview" },
    { label: "System Status", value: "system-status" },
  ],
  developer: [
    { label: "Docs", value: "docs" },
    { label: "System Status", value: "system-status" },
  ],
};

const ROLE_LABEL: Record<string, string> = {
  po: "Product Owner",
  developer: "Software Engineer",
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

interface TopbarProps {
  user: ApiUser;
  role: "po" | "developer";
  searchValue: string;
  onSearchChange: (v: string) => void;
  onLogout: () => void;
}

function Topbar({ user, role, searchValue, onSearchChange, onLogout }: TopbarProps) {
  const tabs = TABS[role];
  const [activeTab, setActiveTab] = useState(tabs[0].value);

  return (
    <header className="flex items-center px-5 h-11 bg-white border-b border-black/10 gap-5 shrink-0">
      <span className="text-[#C74634] italic font-semibold text-[14px]">
        {ROLE_LABEL[role] ?? role}
      </span>

      <nav className="flex">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-3.5 h-11 border-none bg-transparent text-[12px] cursor-pointer
              border-b-2 transition-colors
              ${activeTab === tab.value
                ? "text-[#C74634] border-b-[#C74634] font-medium"
                : "text-[#5a7a8a] border-b-transparent font-normal hover:text-[#1a3a4a]"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="flex-1" />

      <div className="flex items-center gap-3">
        <SearchInput value={searchValue} onChange={onSearchChange} />

        {/* Help */}
        <button className="w-7 h-7 flex items-center justify-center rounded-full bg-transparent border-none cursor-pointer text-[#5a7a8a] hover:bg-[#f0f4f5]">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="8" cy="8" r="6" />
            <path d="M6 6a2 2 0 114 0c0 1.5-2 2-2 3" />
            <circle cx="8" cy="12" r="0.5" fill="currentColor" />
          </svg>
        </button>

        {/* Notifications */}
        <button className="w-7 h-7 flex items-center justify-center rounded-full bg-transparent border-none cursor-pointer text-[#5a7a8a] hover:bg-[#f0f4f5]">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M8 2a5 5 0 015 5c0 2 .6 3 1 4H2c.4-1 1-2 1-4a5 5 0 015-5z" />
            <path d="M6 13a2 2 0 004 0" />
          </svg>
        </button>

        {/* Avatar — click to log out */}
        <button
          onClick={onLogout}
          title={`${user.name} — click to sign out`}
          className="w-8 h-8 rounded-full bg-[#4a3f7a] flex items-center justify-center text-white text-[11px] font-semibold cursor-pointer border-none hover:bg-[#3a2f6a] transition-colors"
        >
          {getInitials(user.name)}
        </button>
      </div>
    </header>
  );
}

export default Topbar;
