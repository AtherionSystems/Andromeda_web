import React, { useState } from "react";
import Sidebar from "../Sidebar/Sidebar";
import Topbar from "../TopBar/TopBar";
import Footer from "./Footer";

interface AppLayoutProps {
  // Slot de contenido — acepta cualquier página
  children: (searchQuery: string) => React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  // Estado de búsqueda compartido entre Topbar y la página activa
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        background: "#f0f4f5",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        fontSize: 13,
        overflow: "hidden",
      }}
    >
      {/* ── Sidebar fijo ── */}
      <Sidebar />

      {/* ── Área derecha ── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Topbar recibe y actualiza el valor de búsqueda */}
        <Topbar searchValue={searchQuery} onSearchChange={setSearchQuery} />

        {/* Contenido de la página actual.
            Se usa render prop para pasar searchQuery sin prop drilling complejo. */}
        <div
          style={{
            flex: 1,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {children(searchQuery)}
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default AppLayout;
