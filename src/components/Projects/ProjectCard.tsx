import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useTheme } from "../../contexts/useTheme";
import type { ApiProject } from "../../types/api";
import type { Member } from "../../types/project";
import MemberAvatars from "./MemberAvatars";
import ConfirmDeleteModal from "./EntryPointProjects/ConfirmDeleteModal";
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
  onEdit?: (project: ApiProject) => void;
  onViewTasks?: (project: ApiProject) => void;
}

function ProjectCard({ project, members, index, onClick, onDelete, onEdit, onViewTasks }: ProjectCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
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
      onClick={() => { onViewTasks?.(project); onClick?.(project); }}
      role="button"
      tabIndex={0}
      aria-label={`Open project: ${project.name}`}
      onKeyDown={(e) => e.key === "Enter" && (onViewTasks?.(project) ?? onClick?.(project))}
      className={`card-entrance rounded-lg overflow-hidden cursor-pointer border
        transition-all duration-200 ease-out
        shadow-[0_1px_4px_rgba(0,0,0,0.06)]
        hover:shadow-[0_6px_20px_rgba(0,0,0,0.13)] hover:scale-[1.018]
        active:scale-[0.99] active:shadow-[0_1px_4px_rgba(0,0,0,0.06)]
        ${darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-black/[0.08]"}`}
      style={{ animationDelay: `${index * 70}ms` }}
    >
      {/* portada */}
      <div className="relative h-[140px]">
        <div className="absolute inset-0 overflow-hidden">
          <CoverPlaceholder index={index} />
        </div>

        {/* botón para eliminar — solo visible si hay permisos */}
        {onDelete && (
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
        )}
      </div>

      {/* Content */}
      <div className="p-3.5 pt-3">
        <div className="flex justify-between items-start gap-2">
          <div className="min-w-0 flex-1">
            <h3 className={`text-[14px] font-medium mb-1 line-clamp-2 leading-snug ${darkMode ? "text-slate-100" : "text-[#1a3a4a]"}`}>
              {project.name}
            </h3>
            <p className={`text-[11px] leading-snug line-clamp-2 ${darkMode ? "text-slate-300" : "text-[#6a8a9a]"}`}>
              {project.description ?? "No description provided."}
            </p>
          </div>
          <span className={`text-[18px] font-light shrink-0 leading-none mt-0.5 ${darkMode ? "text-slate-400" : "text-[#9abacc]"}`}>
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
              onClick={() => { setMenuOpen(false); onEdit?.(project); }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-[13px] transition-colors
                ${darkMode ? "text-slate-200 hover:bg-slate-700" : "text-slate-700 hover:bg-slate-50"}`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
              </svg>
              Edit project
            </button>
            <button
              onClick={() => { setMenuOpen(false); setConfirmOpen(true); }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-[13px] text-red-500 transition-colors
                ${darkMode ? "hover:bg-red-500/10" : "hover:bg-red-50"}`}
            >
              <img src="/Andromeda_web/Media/Icons/deleteIcon.svg" alt="" className="w-4 h-4 shrink-0" />
              Delete project
            </button>
          </div>,
          document.body
        )}

      {/* confirmación de borrado */}
      {confirmOpen && (
        <ConfirmDeleteModal
          projectName={project.name}
          onConfirm={() => { setConfirmOpen(false); onDelete?.(project); }}
          onCancel={() => setConfirmOpen(false)}
        />
      )}
    </article>
  );
}

export default ProjectCard;
