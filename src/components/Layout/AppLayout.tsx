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

function TelegramIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L8.32 14.617l-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.828.942z" />
    </svg>
  );
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
  const { sendMessage } = useAndromedaBot();
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
        buttonIcon={<TelegramIcon />}
        buttonLabel="Chat with Andromeda AI"
        botName="Andromeda AI"
        botSubtitle="Natural language · Project assistant"
        telegramUsername={import.meta.env.VITE_TELEGRAM_BOT_USERNAME ?? ""}
        onSendMessage={sendMessage}
      />
    </div>
  );
}

export default AppLayout;
