import React, { useState } from "react";
import Sidebar from "../Sidebar/Sidebar";
import Topbar from "../TopBar/TopBar";
import Footer from "./Footer";
import { useWindowSize } from "../../hooks/useWindowSize";

interface AppLayoutProps {
  children: (searchQuery: string) => React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const { breakpoint } = useWindowSize();

  return (
    <div
      className={`flex w-full h-screen bg-[#f5f5f5] font-sans text-[13px]
      ${breakpoint === "mobile" ? "flex-col" : "flex-row"}`}
    >
      {/* Sidebar — ancho fijo en tablet/desktop, barra superior en mobile */}
      <div
        className={`shrink-0 overflow-hidden
        ${breakpoint === "mobile" ? "w-full h-auto" : "w-[168px] h-full"}`}
      >
        <Sidebar />
      </div>

      {/* Área derecha — ocupa el espacio restante */}
      <div className="flex flex-col flex-1 min-w-0 min-h-0">
        <Topbar searchValue={searchQuery} onSearchChange={setSearchQuery} />

        {/* Zona de contenido — scrollable */}
        <div className="flex flex-col flex-1 overflow-y-auto">
          {children(searchQuery)}
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default AppLayout;
