import React from "react";

interface NavItemProps {
  label: string;
  route: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: (route: string) => void;
}

const NavItem: React.FC<NavItemProps> = ({
  label,
  icon,
  route,
  isActive,
  onClick,
}) => (
  <button
    onClick={() => onClick(route)}
    aria-current={isActive ? "page" : undefined}
    className={`flex items-center gap-2.5 w-full px-4 py-2 text-[13px] text-left
      border-l-[2.5px] transition-all duration-150 bg-transparent border-t-0
      border-r-0 border-b-0 cursor-pointer
      ${
        isActive
          ? "border-l-[#C74634] bg-[#f0f4f5] text-[#1a3a4a] font-medium"
          : "border-l-transparent text-[#3a5a6a] font-normal hover:bg-[#f5f5f5]"
      }`}
  >
    <span className="w-3.5 h-3.5 opacity-60 shrink-0">{icon}</span>
    {label}
  </button>
);

export default NavItem;
