import { useState } from "react";
import type { ApiProject } from "../../types/api";
import type { Member } from "../../types/project";
import MemberAvatars from "./MemberAvatars";

const COVER_PALETTES = [
  { bg: "#1d4a5a", layers: ["#2d6a7a", "#c8a882", "#8a4a3a"] },
  { bg: "#c8a060", layers: ["#9a4a6a", "#7a3a5a", "#4a3a2a"] },
  { bg: "#2a4a3a", layers: ["#3a6a5a", "#d4b870", "#8a6a40"] },
  { bg: "#3a2a4a", layers: ["#5a4a7a", "#c87060", "#4a3060"] },
];

function CoverPlaceholder({ index }: { index: number }) {
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
}

interface ProjectCardProps {
  project: ApiProject;
  members: Member[];
  index: number;
  onClick?: (project: ApiProject) => void;
}

function ProjectCard({ project, members, index, onClick }: ProjectCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <article
      onClick={() => onClick?.(project)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      role="button"
      tabIndex={0}
      aria-label={`Open project: ${project.name}`}
      onKeyDown={(e) => e.key === "Enter" && onClick?.(project)}
      className={`bg-white rounded-lg overflow-hidden cursor-pointer
        transition-shadow duration-150 border border-black/[0.08]
        ${
          hovered
            ? "shadow-[0_4px_16px_rgba(0,0,0,0.12)]"
            : "shadow-[0_1px_4px_rgba(0,0,0,0.06)]"
        }`}
    >
      {/* Cover */}
      <div className="h-[140px] overflow-hidden">
        <CoverPlaceholder index={index} />
      </div>

      {/* Content */}
      <div className="p-3.5 pt-3">
        <div className="flex justify-between items-start">
          <div className="flex-1 pr-2">
            <h3 className="text-[14px] font-medium text-[#1a3a4a] mb-1">
              {project.name}
            </h3>
            <p className="text-[11px] text-[#6a8a9a] leading-snug">
              {project.description ?? "No description provided."}
            </p>
          </div>
          <span className="text-[18px] font-light text-[#9abacc] shrink-0">
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>
        <MemberAvatars members={members} />
      </div>
    </article>
  );
}

export default ProjectCard;
