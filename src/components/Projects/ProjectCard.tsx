import React, { useState } from "react";
import type { Project } from "../../types/project";
import MemberAvatars from "./MemberAvatars";

// Paletas de colores para los placeholders SVG.
// Si el proyecto tiene coverImage, se usa <img>.
const COVER_PALETTES = [
  { bg: "#1d4a5a", layers: ["#2d6a7a", "#c8a882", "#8a4a3a"] },
  { bg: "#c8a060", layers: ["#9a4a6a", "#7a3a5a", "#4a3a2a"] },
  { bg: "#2a4a3a", layers: ["#3a6a5a", "#d4b870", "#8a6a40"] },
  { bg: "#3a2a4a", layers: ["#5a4a7a", "#c87060", "#4a3060"] },
];

// SVG generativo usado como portada cuando no hay imagen real
const CoverPlaceholder: React.FC<{ index: number }> = ({ index }) => {
  const p = COVER_PALETTES[index % COVER_PALETTES.length];
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 320 120"
      preserveAspectRatio="xMidYMid slice"
    >
      <rect width="320" height="120" fill={p.bg} />
      <polygon
        points="0,120 80,60 160,80 240,40 320,70 320,120"
        fill={p.layers[0]}
        opacity="0.8"
      />
      <polygon
        points="0,120 60,85 140,95 220,65 320,85 320,120"
        fill={p.layers[1]}
        opacity="0.9"
      />
      <polygon
        points="0,120 0,95 70,90 160,110 250,90 320,95 320,120"
        fill={p.layers[2]}
      />
    </svg>
  );
};

interface ProjectCardProps {
  project: Project;
  index: number;
  onClick?: (project: Project) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  index,
  onClick,
}) => {
  // Hover state para el efecto de sombra
  const [hovered, setHovered] = useState(false);

  return (
    <article
      onClick={() => onClick?.(project)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#fff",
        borderRadius: 8,
        border: "0.5px solid rgba(0,0,0,0.1)",
        overflow: "hidden",
        cursor: "pointer",
        boxShadow: hovered ? "0 2px 12px rgba(0,0,0,0.1)" : "none",
        transition: "box-shadow 0.15s ease",
      }}
      // Accesibilidad: rol de botón para lectores de pantalla
      role="button"
      aria-label={`Abrir proyecto: ${project.title}`}
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick?.(project)}
    >
      {/* ── Card Header ── */}
      <div style={{ padding: "14px 14px 10px" }}>
        {/* Fila: título + número de orden */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div style={{ flex: 1, paddingRight: 8 }}>
            <h3
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: "#1a3a4a",
                marginBottom: 3,
              }}
            >
              {project.title}
            </h3>
            <p style={{ fontSize: 11, color: "#6a8a9a", lineHeight: 1.4 }}>
              {project.description}
            </p>
          </div>
          {/* Número en gris tenue — solo decorativo */}
          <span
            style={{
              fontSize: 18,
              fontWeight: 300,
              color: "#9abacc",
              flexShrink: 0,
            }}
          >
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>

        {/* Avatares del equipo */}
        <MemberAvatars members={project.members} />
      </div>

      {/* ── Imagen de portada ── */}
      <div style={{ height: 120, overflow: "hidden" }}>
        {project.coverImage ? (
          <img
            src={project.coverImage}
            alt={`Portada de ${project.title}`}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <CoverPlaceholder index={index} />
        )}
      </div>
    </article>
  );
};

export default ProjectCard;
