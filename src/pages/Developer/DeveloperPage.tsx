import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import AppLayout from "../../components/Layout/AppLayout";
import ProjectsPage from "../../components/Projects/ProjectsPage";
import DeveloperDashboard from "./DeveloperDashboard";

function DeveloperPage() {
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
      role="developer"
      onLogout={handleLogout}
      onNavigate={setActiveRoute}
      activeRoute={activeRoute}
    >
      {(searchQuery) => {
        if (activeRoute === "/") {
          return <DeveloperDashboard user={user} />;
        }
        if (activeRoute === "/projects") {
          return (
            <ProjectsPage
              searchQuery={searchQuery}
              description="Review your current project portfolio, teams and key performance indicators for all active initiatives in your department. Provide deep visibility into technical tasks to optimize software delivery cycles and team velocity."
            />
          );
        }
        // Placeholder for other sections not yet implemented
        return (
          <div style={{ padding: "40px 0", textAlign: "center", color: "#6a8a9a" }}>
            <p style={{ fontSize: 13 }}>This section is coming soon.</p>
          </div>
        );
      }}
    </AppLayout>
  );
}

export default DeveloperPage;
