import React from "react";
import type { Project } from "../../types/project";
import ProjectCard from "./ProjectCard";

interface ProjectsPageProps {
  projects: Project[];
  searchQuery: string;
  onNewProject?: () => void;
  onProjectClick?: (project: Project) => void;
}

const ProjectsPage: React.FC<ProjectsPageProps> = ({
  projects,
  searchQuery,
  onNewProject,
  onProjectClick,
}) => {
  // Filtrado case-insensitive por título o descripción
  const filtered = projects.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
    );
  });

  return (
    <main
      style={{
        flex: 1,
        padding: "20px 24px",
        overflowY: "auto",
      }}
    >
      {/* ── Encabezado de sección ── */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <div>
          {/* Etiqueta superior en mayúsculas */}
          <p
            style={{
              fontSize: 10,
              letterSpacing: "1.2px",
              textTransform: "uppercase",
              color: "#6a8a9a",
              marginBottom: 4,
            }}
          >
            Current Active Projects
          </p>
          <h1 style={{ fontSize: 22, fontWeight: 400, color: "#1a3a4a" }}>
            My Projects
          </h1>
          <p
            style={{
              fontSize: 12,
              color: "#6a8a9a",
              marginTop: 4,
              maxWidth: 420,
              lineHeight: 1.5,
            }}
          >
            Review and manage your current project portfolio, teams and key
            performance indicators for all active initiatives assigned to your
            department.
          </p>
        </div>

        {/* ── Botones de acción ── */}
        <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
          {/* Editar — acción secundaria */}
          <button
            title="Editar vista"
            style={{
              width: 32,
              height: 32,
              border: "none",
              borderRadius: 4,
              background: "#C74634",
              color: "#fff",
              cursor: "pointer",
              fontSize: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ✎
          </button>

          {/* Nuevo proyecto — acción primaria */}
          <button
            onClick={onNewProject}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "0 14px",
              height: 32,
              background: "#C74634",
              color: "#fff",
              border: "none",
              borderRadius: 4,
              fontSize: 12,
              fontWeight: 500,
              cursor: "pointer",
              letterSpacing: "0.3px",
            }}
          >
            + NEW PROJECT
          </button>
        </div>
      </div>

      {/* ── Grilla de proyectos ── */}
      {filtered.length > 0 ? (
        <div
          style={{
            display: "grid",
            // 2 columnas de igual ancho; en pantallas angostas colapsa a 1
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 16,
          }}
        >
          {filtered.map((project, i) => (
            <ProjectCard
              key={project.id}
              project={project}
              index={i}
              onClick={onProjectClick}
            />
          ))}
        </div>
      ) : (
        // Estado vacío tras búsqueda sin resultados
        <div
          style={{ textAlign: "center", padding: "60px 0", color: "#8aaabb" }}
        >
          <p style={{ fontSize: 14 }}>
            No se encontraron proyectos para "{searchQuery}"
          </p>
        </div>
      )}
    </main>
  );
};

export default ProjectsPage;
