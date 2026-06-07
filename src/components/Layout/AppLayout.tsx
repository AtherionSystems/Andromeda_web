// src/components/Layout/AppLayout.tsx

import { type ReactNode } from "react";
import Sidebar from "../Sidebar/Sidebar";
import Topbar from "../TopBar/TopBar";
import Footer from "./Footer";
import { useWindowSize } from "../../hooks/useWindowSize";
import { useTheme } from "../../contexts/useTheme";
import type { ApiUser } from "../../types/api";
import TelegramBotWidget from "../TelegramBot";
import { useAndromedaBot } from "../../hooks/useAndromedaBot";

interface AppLayoutProps {
  user: ApiUser;
  role: "po" | "developer";
  onLogout: () => void;
  onNavigate?: (route: string) => void;
  activeRoute?: string;
  children: () => ReactNode;
}

function AppLayout({
  user,
  role,
  onLogout,
  onNavigate,
  activeRoute,
  children,
}: AppLayoutProps) {
  const { breakpoint } = useWindowSize();
  const { darkMode } = useTheme();

  // ── /api/chat — JWT extraído automáticamente por el backend ──────────────
  const { sendMessage, agentStatus } = useAndromedaBot();

  function handleViewProfile() {
    if (onNavigate) onNavigate("/profile");
  }

  const statusSubtitle =
    agentStatus === "checking"
      ? "Conectando con el agente…"
      : agentStatus === "offline"
        ? "⚠ Agente no disponible"
        : agentStatus === "disabled"
          ? "IA desactivada — solo comandos"
          : "Lenguaje natural · Asistente de proyectos";

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
        <Sidebar
          role={role}
          onLogout={onLogout}
          onNavigate={onNavigate}
          activeRoute={activeRoute}
        />
      </div>

      <div className="flex flex-col flex-1 min-w-0 min-h-0">
        <Topbar
          user={user}
          role={role}
          onViewProfile={handleViewProfile}
          onLogout={onLogout}
        />

        <div className="flex flex-col flex-1 overflow-y-auto">
          <main className="flex-1 px-6 py-5">{children()}</main>
          <div className="mt-auto">
            <Footer />
          </div>
        </div>
      </div>

      <TelegramBotWidget
        buttonLabel="Chat con Andromeda AI"
        botName="Andromeda AI"
        botSubtitle={statusSubtitle}
        telegramUsername={import.meta.env.VITE_TELEGRAM_BOT_USERNAME ?? ""}
        onSendMessage={sendMessage}
      />
    </div>
  );
}

export default AppLayout;
