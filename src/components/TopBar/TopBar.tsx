import { AvatarMenu } from "./AvatarMenu";
import { ROLE_LABEL } from "../../lib/user";
import { useTheme } from "../../contexts/useTheme";
import type { ApiUser } from "../../types/api";

interface TopbarProps {
  user: ApiUser;
  role: "po" | "developer";
  onViewProfile: () => void;
  onLogout: () => void;
}

function Topbar({ user, role, onViewProfile, onLogout }: TopbarProps) {
  const { darkMode } = useTheme();

  return (
    <header
      className="flex items-center px-7 h-14 gap-5 shrink-0 border-b transition-colors duration-200"
      style={{
        backgroundColor: darkMode ? "#0f172a" : "#ffffff",
        borderColor: darkMode ? "#1e293b" : "rgba(0,0,0,0.1)",
      }}
    >
      <span className="italic font-semibold text-[16px]" style={{ color: darkMode ? "#f28b7a" : "#C74634" }}>
        {ROLE_LABEL[role] ?? role}
      </span>
      <div className="flex-1" />
      <div className="flex items-center gap-3">
        {/*<HelpButton />*/}
        {/* <NotificationsButton />*/}
        <AvatarMenu user={user} role={role} onViewProfile={onViewProfile} onLogout={onLogout} />
      </div>
    </header>
  );
}

export default Topbar;