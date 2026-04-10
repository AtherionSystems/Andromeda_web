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
}) => {
  return (
    <button
      onClick={() => onClick(route)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "9px",
        width: "100%",
        padding: "8px 14px",
        border: "none",
        borderLeft: isActive
          ? "2.5px solid #C74634"
          : "2.5px solid transparent",
        background: isActive ? "rgba(0,0,0,0.08)" : "transparent",
        color: isActive ? "#1a3a4a" : "#3a5a6a",
        fontWeight: isActive ? 500 : 400,
        fontSize: "13px",
        cursor: "pointer",
        textAlign: "left",
        transition: "all 0.15s ease",
      }}
      // Accesibilidad: indica al lector de pantalla qué página está activa
      aria-current={isActive ? "page" : undefined}
    >
      <span style={{ width: 14, height: 14, opacity: 0.7, flexShrink: 0 }}>
        {icon}
      </span>
      {label}
    </button>
  );
};

export default NavItem;
