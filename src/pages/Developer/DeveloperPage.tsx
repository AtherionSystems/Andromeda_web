import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/auth";
import AppLayout from "../../components/Layout/AppLayout";
import ProjectsPage from "../../components/Projects/ProjectsPage";
import BacklogPage from "../../components/Backlog/BacklogPage";
import DeveloperDashboard from "./DeveloperDashboard";
import { AnalyticsPage} from "@/components/Analytics-KPI/AnalyticsPage";
import Configuration from "../Configuration";

function DeveloperPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeRoute, setActiveRoute] = useState("/");
  const [backlogProjectId, setBacklogProjectId] = useState<number | undefined>(undefined);

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  if (!user) return null;

  function handleNavigate(route: string) {
    if (route !== "/backlog") setBacklogProjectId(undefined);
    setActiveRoute(route);
  }

  return (
    <AppLayout
      user={user}
      role="developer"
      onLogout={handleLogout}
      onNavigate={handleNavigate}
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
              description="Review your current project portfolio, teams and key performance indicators for all active initiatives in your department. Provide deep visibility into technical tasks to optimize software delivery cycles and team velocity."
              onViewTasks={(projectId) => {
                setBacklogProjectId(projectId);
                setActiveRoute("/backlog");
              }}
            />
          );
        }
        if (activeRoute === "/backlog") {
          return <BacklogPage canUpdateStatus initialProjectId={backlogProjectId} />;
        }

        if (activeRoute === "/analytics") {
            return <AnalyticsPage />;
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
