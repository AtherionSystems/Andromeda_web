import { useState } from "react";
import NavItem from "./NavItem";

const Icons: Record<string, React.ReactNode> = {
  Dashboard: (
    <svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14">
      <rect x="1" y="1" width="6" height="6" rx="1" />
      <rect x="9" y="1" width="6" height="6" rx="1" />
      <rect x="1" y="9" width="6" height="6" rx="1" />
      <rect x="9" y="9" width="6" height="6" rx="1" />
    </svg>
  ),
  Projects: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="14" height="14">
      <path d="M2 4h12M2 8h8M2 12h10" />
    </svg>
  ),
  "My Tasks": (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="14" height="14">
      <rect x="2" y="2" width="12" height="12" rx="1.5" />
      <path d="M5 8l2 2 4-4" />
    </svg>
  ),
  Backlog: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="14" height="14">
      <path d="M2 14V6l6-4 6 4v8" />
      <rect x="5" y="9" width="3" height="5" rx="0.5" />
      <rect x="9" y="7" width="3" height="7" rx="0.5" />
    </svg>
  ),
  Analytics: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="14" height="14">
      <polyline points="1,11 5,6 9,8 15,3" />
    </svg>
  ),
  Team: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="14" height="14">
      <circle cx="8" cy="6" r="3" />
      <path d="M2 14c0-3 2.7-5 6-5s6 2 6 5" />
    </svg>
  ),
  Settings: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="14" height="14">
      <circle cx="8" cy="8" r="2.5" />
      <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.2 3.2l1.4 1.4M11.4 11.4l1.4 1.4M3.2 12.8l1.4-1.4M11.4 4.6l1.4-1.4" />
    </svg>
  ),
};

const PO_NAV = [
  { label: "Dashboard", route: "/" },
  { label: "Projects", route: "/projects" },
  { label: "Backlog", route: "/backlog" },
  { label: "Analytics", route: "/analytics" },
  { label: "Team", route: "/team" },
  { label: "Settings", route: "/settings" },
];

const DEV_NAV = [
  { label: "Dashboard", route: "/" },
  { label: "Projects", route: "/projects" },
  { label: "Backlog", route: "/backlog" },
  { label: "Analytics", route: "/analytics" },
  { label: "Team", route: "/team" },
  { label: "Settings", route: "/settings" },
];

interface SidebarProps {
  role: "po" | "developer";
  onLogout: () => void;
  onNavigate?: (route: string) => void;
  activeRoute?: string;
}

function Sidebar({ role, onLogout, onNavigate, activeRoute: externalRoute }: SidebarProps) {
  const navItems = role === "developer" ? DEV_NAV : PO_NAV;
  const defaultRoute = role === "developer" ? "/" : "/projects";
  const [internalRoute, setInternalRoute] = useState(defaultRoute);
  const activeRoute = externalRoute ?? internalRoute;

  return (
    <aside className="w-full h-full bg-white flex flex-col border-r border-black/10 overflow-hidden">
      {/* Branding */}
      <div className="px-4 pt-4 pb-3 border-b border-black/10">
        <img
          src="/Media/Images/OracleColour_Transparent.png"
          alt="Oracle Logo"
          style={{ maxWidth: "120px" }}
          className="w-full h-auto object-contain mb-2"
        />
        <div className="text-[11px] font-semibold text-[#1a3a4a] leading-tight">
          Atherion Systems
        </div>
        <div className="text-[9px] text-[#5a7a8a] tracking-widest uppercase mt-0.5">
          Enterprise Platform
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 pt-2 overflow-y-auto">
        {navItems.map((item) => (
          <NavItem
            key={item.route}
            label={item.label}
            route={item.route}
            icon={Icons[item.label]}
            isActive={activeRoute === item.route}
            onClick={(route) => {
              setInternalRoute(route);
              onNavigate?.(route);
            }}
          />
        ))}
      </nav>

      {/* Sign out */}
      <div className="border-t border-black/10 px-3 py-3">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded text-[11px] text-[#6a8a9a] hover:bg-[#f0f4f5] hover:text-[#c74634] transition-colors cursor-pointer border-none bg-transparent text-left"
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="13" height="13">
            <path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3M11 11l3-3-3-3M14 8H6" />
          </svg>
          Sign out
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
