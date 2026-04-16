import { useState, type ReactNode } from "react";
import Sidebar from "../Sidebar/Sidebar";
import Topbar from "../TopBar/TopBar";
import Footer from "./Footer";
import { useWindowSize } from "../../hooks/useWindowSize";
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

  return (
    <div
      className={`flex w-full h-screen bg-[#f0f4f5] font-sans text-[13px]
      ${breakpoint === "mobile" ? "flex-col" : "flex-row"}`}
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
