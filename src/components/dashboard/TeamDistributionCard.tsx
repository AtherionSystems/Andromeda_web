import { useState } from "react";
import type { ProjectGroup } from "./types";
import { AVATAR_COLORS } from "./types";
import Skeleton from "./Skeleton";

const PROJECT_AVATAR_BG = [
  "#1a3a4a", "#c74634", "#2a4a5a", "#4a3f7a",
  "#2a6a5a", "#d97706", "#6a2a4a", "#2a4a7a",
];

const PAGE_SIZE = 4;

function projectInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8"
      width="13" height="13"
      style={{ transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
    >
      <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowButton({ onClick, disabled, dir }: { onClick: () => void; disabled: boolean; dir: "left" | "right" }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center w-[22px] h-[22px] rounded border border-[#dce8ea] shrink-0
        ${disabled ? "bg-transparent text-[#c0cdd0] cursor-default" : "bg-[#f0f4f5] text-[#1a3a4a] cursor-pointer"}`}
    >
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" width="10" height="10">
        {dir === "left"
          ? <path d="M10 4L6 8l4 4" strokeLinecap="round" strokeLinejoin="round" />
          : <path d="M6 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />}
      </svg>
    </button>
  );
}

function ProjectRow({ group, idx, darkMode }: { group: ProjectGroup; idx: number; darkMode: boolean }) {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(0);

  const avatarBg   = PROJECT_AVATAR_BG[idx % PROJECT_AVATAR_BG.length];
  const totalPages = Math.ceil(group.members.length / PAGE_SIZE);
  const visible    = group.members.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  return (
    <div
      className={`rounded-lg mb-1.5 overflow-hidden ${darkMode ? "bg-slate-800" : "bg-[#f7fbfc]"}`}
      style={{
        boxShadow: darkMode
          ? "0 1px 4px rgba(0,0,0,0.4)"
          : "0 1px 4px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)",
      }}
    >
      {/* Header button */}
      <button
        onClick={() => { setOpen((p) => !p); setPage(0); }}
        className="w-full flex items-center gap-2.5 px-3 py-3.5 border-0 bg-transparent cursor-pointer text-left"
      >
        <div
          className="w-[42px] h-[42px] rounded-[9px] shrink-0 flex items-center justify-center"
          style={{ background: avatarBg }}
        >
          <span className="text-[13px] font-extrabold text-white tracking-[0.5px]">
            {projectInitials(group.project.name)}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <p className={`m-0 text-sm font-bold truncate ${darkMode ? "text-slate-200" : "text-[#1a3a4a]"}`}>
            {group.project.name}
          </p>
          <p className={`mt-0.5 text-[13px] capitalize ${darkMode ? "text-slate-500" : "text-[#6a8a9a]"}`}>
            {group.members.length} Member{group.members.length !== 1 ? "s" : ""} &bull; {group.project.status}
          </p>
        </div>

        <span className={`shrink-0 mr-1 ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
          <ChevronIcon open={open} />
        </span>
      </button>

      {/* Expanded member list */}
      {open && group.members.length > 0 && (
        <div
          className={`pt-2 pb-2 rounded-b-[6px] ${darkMode ? "bg-white/[0.04]" : "bg-[#f0f4f5]"}`}
          style={{ boxShadow: "inset 0 4px 6px -2px rgba(0,0,0,0.08)" }}
        >
          {visible.map((m, i) => (
            <div key={m.userId} className="flex items-center gap-2.5 py-[7px] pr-2.5 pl-14">
              <div
                className="w-[38px] h-[38px] rounded-full shrink-0 flex items-center justify-center"
                style={{ background: AVATAR_COLORS[(page * PAGE_SIZE + i) % AVATAR_COLORS.length] }}
              >
                <span className="text-[13px] font-bold text-white">{m.initials}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className={`m-0 text-[14px] font-semibold truncate ${darkMode ? "text-slate-100" : "text-[#1a3a4a]"}`}>
                  {m.username}
                </p>
                <p className={`m-0 text-[11px] uppercase tracking-[0.6px] ${darkMode ? "text-slate-400" : "text-slate-400"}`}>
                  {m.role}
                </p>
              </div>
            </div>
          ))}

          {totalPages > 1 && (
            <div className="flex items-center justify-end gap-1.5 pr-2.5 pt-1.5">
              <span className={`text-[12px] font-semibold ${darkMode ? "text-white" : "text-[#1a3a4a]"}`}>
                {page + 1} / {totalPages}
              </span>
              <ArrowButton dir="left"  onClick={() => setPage((p) => p - 1)} disabled={page === 0} />
              <ArrowButton dir="right" onClick={() => setPage((p) => p + 1)} disabled={page === totalPages - 1} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface TeamDistributionCardProps {
  loading: boolean;
  darkMode: boolean;
  projectGroups: ProjectGroup[];
}

const PREVIEW_COUNT = 3;

export default function TeamDistributionCard({ loading, darkMode, projectGroups }: TeamDistributionCardProps) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? projectGroups : projectGroups.slice(0, PREVIEW_COUNT);

  return (
    <div className={`rounded-[10px] p-[14px_16px] min-w-0 border ${darkMode ? "bg-[#0f172a] border-[#1e293b]" : "bg-white border-[#cdd8db]"}`}>
      <div className="flex justify-between items-center mb-1">
        <span className={`text-[16px] font-bold ${darkMode ? "text-slate-200" : "text-[#1a3a4a]"}`}>
          Team Distribution
        </span>
        <img
          src="/Andromeda_web/Media/Icons/groupIcon.svg"
          alt="group"
          width={22}
          height={22}
          className={darkMode ? "opacity-60" : "opacity-75"}
        />
      </div>

      {loading ? (
        <div className="flex flex-col gap-3 mt-2">
          {[0, 1, 2].map((i) => <Skeleton key={i} h={44} darkMode={darkMode} />)}
        </div>
      ) : projectGroups.length === 0 ? (
        <p className={`text-xs text-center py-4 ${darkMode ? "text-slate-400" : "text-[#6a8a9a]"}`}>
          No projects found.
        </p>
      ) : (
        <>
          {visible.map((g, i) => (
            <ProjectRow key={g.project.id} group={g} idx={i} darkMode={darkMode} />
          ))}
          {projectGroups.length > PREVIEW_COUNT && (
            <button
              onClick={() => setShowAll((p) => !p)}
              className="mt-3 text-[10px] font-bold text-[#c74634] bg-transparent border-0 cursor-pointer tracking-[0.5px] uppercase p-0"
            >
              {showAll ? "Show Less" : `View All Teams (${String(projectGroups.length).padStart(2, "0")})`}
            </button>
          )}
        </>
      )}
    </div>
  );
}
