import React, { useState } from "react";
import NavItem from "./NavItem";

// ── Iconos SVG inline (sin dependencias externas) ──
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
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      width="14"
      height="14"
    >
      <path d="M2 4h12M2 8h8M2 12h10" />
    </svg>
  ),
  Backlog: (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      width="14"
      height="14"
    >
      <path d="M2 14V6l6-4 6 4v8" />
      <rect x="5" y="9" width="3" height="5" rx="0.5" />
      <rect x="9" y="7" width="3" height="7" rx="0.5" />
    </svg>
  ),
  Analytics: (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      width="14"
      height="14"
    >
      <polyline points="1,11 5,6 9,8 15,3" />
    </svg>
  ),
  Team: (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      width="14"
      height="14"
    >
      <circle cx="8" cy="6" r="3" />
      <path d="M2 14c0-3 2.7-5 6-5s6 2 6 5" />
    </svg>
  ),
  Settings: (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      width="14"
      height="14"
    >
      <circle cx="8" cy="8" r="2.5" />
      <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.2 3.2l1.4 1.4M11.4 11.4l1.4 1.4M3.2 12.8l1.4-1.4M11.4 4.6l1.4-1.4" />
    </svg>
  ),
};

const NAV_ITEMS = [
  { label: "Dashboard", route: "/" },
  { label: "Projects", route: "/projects" },
  { label: "Backlog", route: "/backlog" },
  { label: "Analytics", route: "/analytics" },
  { label: "Team", route: "/team" },
  { label: "Settings", route: "/settings" },
];

const Sidebar: React.FC = () => {
  // Estado local: ruta activa. Migrar a React Router
  // (useLocation) cuando se integre enrutamiento real.
  const [activeRoute, setActiveRoute] = useState("/");

  return (
    <aside
      style={{
        width: 168,
        background: "#dce8ea",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        height: "100%",
      }}
    >
      {/* ── Branding ── */}
      <div
        style={{
          padding: "16px 14px 12px",
          borderBottom: "0.5px solid rgba(0,0,0,0.1)",
        }}
      >
        <div
          style={{
            color: "#C74634",
            fontWeight: 700,
            fontSize: 13,
            letterSpacing: "0.5px",
          }}
        >
          ORACLE
        </div>
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "#1a3a4a",
            marginTop: 1,
          }}
        >
          Atherion Systems
        </div>
        <div
          style={{
            fontSize: 9,
            color: "#5a7a8a",
            letterSpacing: "0.8px",
            textTransform: "uppercase",
          }}
        >
          Enterprise Platform
        </div>
      </div>

      {/* ── Lista de navegación ── */}
      <nav style={{ flex: 1, paddingTop: 8 }}>
        {NAV_ITEMS.map((item) => (
          <NavItem
            key={item.route}
            label={item.label}
            route={item.route}
            icon={Icons[item.label]}
            isActive={activeRoute === item.route}
            onClick={setActiveRoute}
          />
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
