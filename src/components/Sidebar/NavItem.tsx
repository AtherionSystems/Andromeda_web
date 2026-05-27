import React from "react";
import { useTheme } from "../../contexts/useTheme";

interface NavItemProps {
  label: string;
  route: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: (route: string) => void;
}

function NavItem({ label, icon, route, isActive, onClick }: NavItemProps) {
  const { darkMode } = useTheme();

  return (
    <button
      onClick={() => onClick(route)}
      aria-current={isActive ? "page" : undefined}
      className="flex items-center gap-2.5 w-full px-4 py-2 text-[13px] text-left border-l-[2.5px] transition-all duration-150 bg-transparent border-t-0 border-r-0 border-b-0 cursor-pointer"
      style={{
        borderLeftColor: isActive ? "#C74634" : "transparent",
        backgroundColor: isActive ? (darkMode ? "#1e293b" : "#f0f4f5") : "transparent",
        color: isActive ? (darkMode ? "#e2e8f0" : "#1a3a4a") : darkMode ? "#94a3b8" : "#3a5a6a",
        fontWeight: isActive ? 500 : 400,
      }}
      onMouseEnter={(event) => {
        if (!isActive) {
          event.currentTarget.style.backgroundColor = darkMode ? "rgba(30,41,59,0.8)" : "#f5f5f5";
        }
      }}
      onMouseLeave={(event) => {
        if (!isActive) {
          event.currentTarget.style.backgroundColor = "transparent";
        }
      }}
    >
      <span className="w-3.5 h-3.5 opacity-60 shrink-0">{icon}</span>
      {label}
    </button>
  );
}

export default NavItem;
