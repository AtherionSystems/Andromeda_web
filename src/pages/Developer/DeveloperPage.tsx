import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/auth";
import AppLayout from "../../components/Layout/AppLayout";
import ProjectsPage from "../../components/Projects/ProjectsPage";
import BacklogPage from "../../components/Backlog/BacklogPage";
import DeveloperDashboard from "./DeveloperDashboard";
import { DeveloperAnalyticsPage } from "@/components/Analytics-KPI/DeveloperAnalyticsPage";
import Configuration from "../Configuration";

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
      {() => {
        if (activeRoute === "/") {
          return <DeveloperDashboard />;
        }
        if (activeRoute === "/projects") {
          return (
            <ProjectsPage
              readOnly
              scope="me"
              description="Your active projects — only initiatives where you are a member. Drill in to track your tasks and personal velocity."
            />
          );
        }
        if (activeRoute === "/backlog") {
          return <BacklogPage canUpdateStatus scope="me" />;
        }

        if (activeRoute === "/analytics") {
            return <DeveloperAnalyticsPage />;
        }

        if (activeRoute === "/settings") {
          return <Configuration />;
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
