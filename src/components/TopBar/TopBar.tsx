import React, { useState } from "react";
import SearchInput from "./SearchInput";

const TABS = [
  { label: "Overview", value: "overview" },
  { label: "System Status", value: "system-status" },
];

// ── Botón de ícono reutilizable ──────────────
interface IconBtnProps {
  children: React.ReactNode;
  title?: string;
  onClick?: () => void;
}
const IconBtn: React.FC<IconBtnProps> = ({ children, title, onClick }) => (
  <button
    title={title}
    onClick={onClick}
    style={{
      width: 28,
      height: 28,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "transparent",
      border: "none",
      borderRadius: 4,
      cursor: "pointer",
      color: "#5a7a8a",
    }}
  >
    {children}
  </button>
);

// ── Topbar principal ─────────────────────────
interface TopbarProps {
  searchValue: string;
  onSearchChange: (v: string) => void;
}

const Topbar: React.FC<TopbarProps> = ({ searchValue, onSearchChange }) => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        padding: "0 20px",
        height: 44,
        background: "#fff",
        borderBottom: "0.5px solid rgba(0,0,0,0.1)",
        gap: 20,
        flexShrink: 0,
      }}
    >
      {/* Título de la vista */}
      <span
        style={{
          color: "#C74634",
          fontStyle: "italic",
          fontWeight: 600,
          fontSize: 14,
        }}
      >
        Product Owner
      </span>

      {/* Tabs de sección */}
      <nav style={{ display: "flex" }}>
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            style={{
              padding: "0 14px",
              height: 44,
              border: "none",
              borderBottom:
                activeTab === tab.value
                  ? "2px solid #C74634"
                  : "2px solid transparent",
              background: "transparent",
              color: activeTab === tab.value ? "#C74634" : "#5a7a8a",
              fontWeight: activeTab === tab.value ? 500 : 400,
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Espaciador — empuja los controles a la derecha */}
      <div style={{ flex: 1 }} />

      {/* Controles derechos */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {/* Búsqueda controlada: el valor sube al padre (ProjectsPage) */}
        <SearchInput value={searchValue} onChange={onSearchChange} />

        {/* Ícono: ayuda / docs */}
        <IconBtn title="Help">
          <svg
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <circle cx="8" cy="8" r="6" />
            <path d="M6 6a2 2 0 114 0c0 1.5-2 2-2 3" />
            <circle cx="8" cy="12" r="0.5" fill="currentColor" />
          </svg>
        </IconBtn>

        {/* Ícono: notificaciones */}
        <IconBtn title="Notifications">
          <svg
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M8 2a5 5 0 015 5c0 2 .6 3 1 4H2c.4-1 1-2 1-4a5 5 0 015-5z" />
            <path d="M6 13a2 2 0 004 0" />
          </svg>
        </IconBtn>

        {/* Avatar del usuario — iniciales hardcodeadas;
            reemplazar por datos del contexto de autenticación */}
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: "#4a8fa3",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontSize: 11,
            fontWeight: 600,
            cursor: "pointer",
          }}
          title="Mi perfil"
        >
          PO
        </div>
      </div>
    </header>
  );
};

export default Topbar;
