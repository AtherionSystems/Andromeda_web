// ─────────────────────────────────────────────
// App.tsx — Punto de entrada de la aplicación
//
// Aquí se decide qué "página" renderizar.
// Con React Router, este archivo montaría las rutas
// y cada <Route> renderizaría su página dentro de AppLayout.
//
// Por ahora: una sola vista (ProjectsPage) sin router.
// ─────────────────────────────────────────────

import React from "react";
import AppLayout from "./components/Layout/AppLayout";
import ProjectsPage from "./components/Projects/ProjectsPage";
import { MOCK_PROJECTS } from "./data/mockData";
import type { Project } from "./types/project";

const App: React.FC = () => {
  // Handler: navegar al detalle del proyecto
  // Con React Router: navigate(`/projects/${project.id}`)
  const handleProjectClick = (project: Project) => {
    console.log("Abrir proyecto:", project.title);
    // TODO: implementar navegación o modal de detalle
  };

  // Handler: abrir modal/formulario de nuevo proyecto
  const handleNewProject = () => {
    console.log("Nuevo proyecto");
    // TODO: abrir modal o navegar a /projects/new
  };

  return (
    // AppLayout usa render prop para pasar searchQuery
    // hacia abajo sin prop drilling extra
    <AppLayout>
      {(searchQuery) => (
        <ProjectsPage
          projects={MOCK_PROJECTS}
          searchQuery={searchQuery}
          onProjectClick={handleProjectClick}
          onNewProject={handleNewProject}
        />
      )}
    </AppLayout>
  );
};

export default App;
