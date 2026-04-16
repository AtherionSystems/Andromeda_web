import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import AppLayout from "../../components/Layout/AppLayout";
import ProjectsPage from "../../components/Projects/ProjectsPage";
import PODashboard from "./PODashboard";

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
        if (activeRoute === "/") {
          return <PODashboard user={user} />;
        }
        if (activeRoute === "/projects") {
          return <ProjectsPage searchQuery={searchQuery} />;
        }
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
