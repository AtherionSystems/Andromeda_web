import { useTheme } from "../contexts/useTheme";

function AuthLayout({ children }: { children: React.ReactNode }) {
  const { darkMode } = useTheme();

  return (
    <div className={`flex min-h-screen ${darkMode ? "bg-slate-950" : "bg-white"}`}>
      {children}
    </div>
  );
}

export default AuthLayout;