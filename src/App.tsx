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

function ProtectedRoute({ children, allowedRole }: ProtectedRouteProps) {
  const { user } = useAuth();
  const isDeveloper = user?.userType?.toLowerCase() === "developer";

  if (!user) return <Navigate to="/login" replace />;
  if (allowedRole === "developer" && !isDeveloper)
    return <Navigate to="/po" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { user } = useAuth();
  const defaultDash = "/po";
  const guestDash = "/login";

  return (
    <Routes>
      <Route path="/" element={<Navigate to={user ? defaultDash : guestDash} replace />} />
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
      <Route path="*" element={<Navigate to={user ? defaultDash : guestDash} replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
