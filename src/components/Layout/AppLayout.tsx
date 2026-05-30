import { useState, type ReactNode } from "react";
import Sidebar from "../Sidebar/Sidebar";
import Topbar from "../TopBar/TopBar";
import Footer from "./Footer";
import { useWindowSize } from "../../hooks/useWindowSize";
import { useTheme } from "../../contexts/useTheme";
import type { ApiUser } from "../../types/api";

interface AppLayoutProps {
  user: ApiUser;
  role: "po" | "developer";
  onLogout: () => void;
  onNavigate?: (route: string) => void;
  activeRoute?: string;
  children: (searchQuery: string) => ReactNode;
}

function AppLayout({ user, role, onLogout, onNavigate, activeRoute, children }: AppLayoutProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { breakpoint } = useWindowSize();
  const { darkMode } = useTheme();
  function handleViewProfile() {
    if (onNavigate) onNavigate("/profile");
  }

  return (
    <div
      className={`flex w-full h-screen font-sans text-[13px] transition-colors duration-200
      ${breakpoint === "mobile" ? "flex-col" : "flex-row"}`}
      style={{
        backgroundColor: darkMode ? "#020617" : "#f0f4f5",
        color: darkMode ? "#e2e8f0" : "#334155",
      }}
    >
      <div
        className={`shrink-0 overflow-hidden
        ${breakpoint === "mobile" ? "w-full h-auto" : "w-[168px] h-full"}`}
      >
        <Sidebar role={role} onLogout={onLogout} onNavigate={onNavigate} activeRoute={activeRoute} />
      </div>

      <div className="flex flex-col flex-1 min-w-0 min-h-0">
        <Topbar
          user={user}
          role={role}
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          onViewProfile={handleViewProfile}
          onLogout={onLogout}
        />

        <div className="flex flex-col flex-1 overflow-y-auto">
          <main className="flex-1 px-6 py-5">{children(searchQuery)}</main>
          <div className="mt-auto">
            <Footer />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AppLayout;
