import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import LoginPage from "./pages/Login/LoginPage";
import POPage from "./pages/PO/POPage";
import DeveloperPage from "./pages/Developer/DeveloperPage";
import type { ReactNode } from "react";

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
      <Route path="*" element={<Navigate to={defaultDash} replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;