import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useTheme } from "../../contexts/useTheme";
import type { ApiProject } from "../../types/api";
import type { Member } from "../../types/project";
import MemberAvatars from "./MemberAvatars";
import { useClickOutside } from "../../hooks/useClickOutside";

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
  onDelete?: (project: ApiProject) => void;
}

function ProjectCard({ project, members, index, onClick, onDelete }: ProjectCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 });
  const { darkMode } = useTheme();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside either the trigger or the portaled dropdown.
  useClickOutside([buttonRef, dropdownRef], menuOpen, () => setMenuOpen(false));

  // Keep the portaled dropdown aligned with the trigger while scrolling.
  useEffect(() => {
    if (!menuOpen) return;
    function handleScroll() {
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setDropdownPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
      }
    }
    window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, [menuOpen]);

  function handleMenuToggle(e: React.MouseEvent) {
    e.stopPropagation();
    if (!menuOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
    }
    setMenuOpen((o) => !o);
  }

  return (
    <article
      onClick={() => onClick?.(project)}
      role="button"
      tabIndex={0}
      aria-label={`Open project: ${project.name}`}
      onKeyDown={(e) => e.key === "Enter" && onClick?.(project)}
      className={`card-entrance rounded-lg overflow-hidden cursor-pointer transition-shadow duration-150 border
        shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)]
        ${darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-black/[0.08]"}`}
      style={{ animationDelay: `${index * 70}ms` }}
    >
      {/* portada */}
      <div className="relative h-[140px]">
        <div className="absolute inset-0 overflow-hidden">
          <CoverPlaceholder index={index} />
        </div>

        {/* botón para eliminar */}
        <div className="absolute top-2 right-2 z-10">
          <button
            ref={buttonRef}
            onClick={handleMenuToggle}
            aria-label="Project options"
            className="w-7 h-7 flex items-center justify-center rounded-full bg-black/25 hover:bg-black/45 text-white transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
              <circle cx="6" cy="1.5" r="1.2" />
              <circle cx="6" cy="6"   r="1.2" />
              <circle cx="6" cy="10.5" r="1.2" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-3.5 pt-3">
        <div className="flex justify-between items-start">
          <div className="flex-1 pr-2">
            <h3 className={`text-[14px] font-medium mb-1 ${darkMode ? "text-slate-100" : "text-[#1a3a4a]"}`}>
              {project.name}
            </h3>
            <p className={`text-[11px] leading-snug ${darkMode ? "text-slate-300" : "text-[#6a8a9a]"}`}>
              {project.description ?? "No description provided."}
            </p>
          </div>
          <span className={`text-[18px] font-light shrink-0 ${darkMode ? "text-slate-400" : "text-[#9abacc]"}`}>
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>
        <MemberAvatars members={members} />
      </div>

      {/* portal dropdown*/}
      {menuOpen &&
        createPortal(
          <div
            ref={dropdownRef}
            style={{ position: "fixed", top: dropdownPos.top, right: dropdownPos.right, zIndex: 9999 }}
            className={`w-44 rounded-md shadow-lg border py-1
              ${darkMode ? "bg-slate-800 border-slate-600" : "bg-white border-black/10"}`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => { setMenuOpen(false); onDelete?.(project); }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-[13px] text-red-500 transition-colors
                ${darkMode ? "hover:bg-red-500/10" : "hover:bg-red-50"}`}
            >
              <img src="/Media/Icons/deleteIcon.svg" alt="" className="w-4 h-4 shrink-0" />
              Delete project
            </button>
          </div>,
          document.body
        )}
    </article>
  );
}

export default ProjectCard;
