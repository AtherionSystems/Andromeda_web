import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import AppLayout from "../../components/Layout/AppLayout";
import ProjectsPage from "../../components/Projects/ProjectsPage";
import PODashboard from "./PODashboard";
import BacklogPage from "../../components/Backlog/BacklogPage"; // 1. Importamos la nueva página

function POPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeRoute, setActiveRoute] = useState("/");

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  if (!user) return null;

  return (
    <AppLayout
      user={user}
      role="po"
      onLogout={handleLogout}
      onNavigate={setActiveRoute}
      activeRoute={activeRoute}
    >
      {(searchQuery) => {
        // 2. Lógica de enrutamiento interno basada en activeRoute
        if (activeRoute === "/") {
          return <PODashboard user={user} />;
        }
        
        if (activeRoute === "/projects") {
          return <ProjectsPage searchQuery={searchQuery} />;
        }

        // 3. Renderizado del Backlog cuando la ruta coincida
        if (activeRoute === "/backlog") {
          return <BacklogPage />;
        }

        // Estado por defecto para rutas que aún no tienen componente
        return (
          <div style={{ padding: "40px 0", textAlign: "center", color: "#6a8a9a" }}>
            <p style={{ fontSize: 13 }}>This section is coming soon.</p>
          </div>
        );
      }}
    </AppLayout>
  );
}

export default POPage;