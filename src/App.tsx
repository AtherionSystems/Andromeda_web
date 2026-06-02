import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/themeContext";
import { useAuth } from "./contexts/auth";
import LoginPage from "./pages/Login/LoginPage";
import LoggedOut from "./pages/Login/LoggedOut";
import POPage from "./pages/PO/POPage";
import DeveloperPage from "./pages/Developer/DeveloperPage";
import type { ReactNode } from "react";

/** Shown briefly while bootstrap() exchanges the OCI auth code for tokens. */
function OAuthCallbackPage() {
  return (
    <div className="flex items-center justify-center h-screen bg-[#f0f4f5]">
      <p className="text-sm text-[#5a7a8a] animate-pulse">Authenticating…</p>
    </div>
  );
}

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRole: "po" | "developer";
}

function roleDashboard(userType: string | undefined): string {
  return userType?.toLowerCase() === "developer" ? "/developer" : "/po";
}

function ProtectedRoute({ children, allowedRole }: ProtectedRouteProps) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  const role = user.userType?.toLowerCase();
  if (allowedRole === "developer" && role !== "developer")
    return <Navigate to="/po" replace />;
  if (allowedRole === "po" && role === "developer")
    return <Navigate to="/developer" replace />;

  return <>{children}</>;
}

function AppRoutes() {
  const { user } = useAuth();
  const defaultDash = user ? roleDashboard(user.userType) : "/login";

  return (
    <Routes>
      <Route path="/" element={<Navigate to={defaultDash} replace />} />
      <Route
        path="/login"
        element={user ? <Navigate to={defaultDash} replace /> : <LoginPage />}
      />
      <Route
        path="/po"
        element={
          <ProtectedRoute allowedRole="po">
            <POPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/developer"
        element={
          <ProtectedRoute allowedRole="developer">
            <DeveloperPage />
          </ProtectedRoute>
        }
      />
      <Route path="/logged-out" element={<LoggedOut />} />
      {/* OCI IAM OAuth2 redirect target — handled by bootstrap() in main.tsx */}
      <Route path="/callback" element={<OAuthCallbackPage />} />
      <Route path="*" element={<Navigate to={defaultDash} replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;