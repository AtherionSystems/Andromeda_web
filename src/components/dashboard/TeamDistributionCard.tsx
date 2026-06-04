import { useState } from "react";
import type { ProjectGroup } from "./types";
import { AVATAR_COLORS } from "./types";
import Skeleton from "./Skeleton";

const PROJECT_AVATAR_BG = [
  "#1a3a4a", "#c74634", "#2a4a5a", "#4a3f7a",
  "#2a6a5a", "#d97706", "#6a2a4a", "#2a4a7a",
];

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

function ProjectRow({ group, idx, darkMode }: { group: ProjectGroup; idx: number; darkMode: boolean }) {
  const [open, setOpen] = useState(false);
  const avatarBg = PROJECT_AVATAR_BG[idx % PROJECT_AVATAR_BG.length];

  return (
    <div style={{ borderBottom: `1px solid ${darkMode ? "#1e293b" : "#f0f4f5"}` }}>
      <button
        onClick={() => setOpen((p) => !p)}
        style={{
          width: "100%", display: "flex", alignItems: "center", gap: 10,
          padding: "11px 0", background: "none", border: "none", cursor: "pointer",
          textAlign: "left",
        }}
      >
        <div style={{
          width: 36, height: 36, borderRadius: 8,
          background: avatarBg, flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: "#fff", letterSpacing: 0.5 }}>
            {projectInitials(group.project.name)}
          </span>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            margin: 0, fontSize: 12, fontWeight: 700,
            color: darkMode ? "#e2e8f0" : "#1a3a4a",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {group.project.name}
          </p>
          <p style={{ margin: "1px 0 0", fontSize: 10, color: darkMode ? "#64748b" : "#6a8a9a", textTransform: "capitalize" }}>
            {group.members.length} Member{group.members.length !== 1 ? "s" : ""} &bull; {group.project.status}
          </p>
        </div>

        <span style={{ color: darkMode ? "#64748b" : "#94a3b8", flexShrink: 0 }}>
          <ChevronIcon open={open} />
        </span>
      </button>

      {open && group.members.length > 0 && (
        <div style={{ paddingBottom: 8 }}>
          {group.members.map((m, i) => (
            <div
              key={m.userId}
              style={{ display: "flex", alignItems: "center", gap: 9, padding: "6px 0 6px 46px" }}
            >
              <div style={{
                width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
                background: AVATAR_COLORS[i % AVATAR_COLORS.length],
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <span style={{ fontSize: 9, fontWeight: 700, color: "#fff" }}>{m.initials}</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  margin: 0, fontSize: 11, fontWeight: 600,
                  color: darkMode ? "#cbd5e1" : "#1a3a4a",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  {m.username}
                </p>
                <p style={{
                  margin: 0, fontSize: 9, letterSpacing: 0.6,
                  textTransform: "uppercase", color: darkMode ? "#475569" : "#94a3b8",
                }}>
                  {m.role}
                </p>
              </div>
            </div>
          ))}
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
    <div style={{
      background: darkMode ? "#0f172a" : "#fff",
      border: `1px solid ${darkMode ? "#1e293b" : "#cdd8db"}`,
      borderRadius: 10, padding: "14px 16px", minWidth: 0,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: darkMode ? "#e2e8f0" : "#1a3a4a" }}>
          Team Distribution
        </span>
        <svg viewBox="0 0 16 16" fill="none" stroke={darkMode ? "#94a3b8" : "#6a8a9a"} strokeWidth="1.4" width="14" height="14">
          <circle cx="6" cy="6" r="3" />
          <path d="M1 13c0-2.5 2-4 5-4s5 1.5 5 4M11 5c1.5 0 3 1 3 3" />
        </svg>
      </div>

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 8 }}>
          {[0, 1, 2].map((i) => <Skeleton key={i} h={44} darkMode={darkMode} />)}
        </div>
      ) : projectGroups.length === 0 ? (
        <p style={{ fontSize: 12, color: darkMode ? "#94a3b8" : "#6a8a9a", textAlign: "center", padding: "16px 0" }}>
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
              style={{
                marginTop: 12, fontSize: 10, fontWeight: 700,
                color: "#c74634", background: "none", border: "none",
                cursor: "pointer", letterSpacing: 0.5, textTransform: "uppercase", padding: 0,
              }}
            >
              {showAll
                ? "Show Less"
                : `View All Teams (${String(projectGroups.length).padStart(2, "0")})`}
            </button>
          )}
        </>
      )}
    </div>
  );
}
