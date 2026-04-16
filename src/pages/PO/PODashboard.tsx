import { useEffect, useState } from "react";
import type { ApiUser, ApiTask, MemberRole } from "../../types/api";
import { getProjects } from "../../api/projects";
import { getProjectTasks } from "../../api/tasks";
import { getProjectMembers } from "../../api/members";

// ── Types ───────────────────────────────────────────────────────────────────

interface EnrichedTask extends ApiTask {
  projectId: number;
  projectName: string;
}

interface MemberEntry {
  userId: number;
  username: string;
  role: MemberRole;
  status: "on_track" | "meeting" | "blocked";
  initials: string;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

const PRIORITY_ORDER: Record<string, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

/** Deterministic status derived from member role (no presence API available). */
function memberStatus(role: MemberRole, idx: number): "on_track" | "meeting" | "blocked" {
  if (role === "owner")   return "on_track";
  if (role === "manager") return "meeting";
  return idx % 2 === 0 ? "on_track" : "blocked";
}

function initials(username: string): string {
  const parts = username.trim().split(/[\s._-]+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return username.slice(0, 2).toUpperCase();
}

function taskCode(task: EnrichedTask): string {
  const abbr = task.projectName
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 4);
  return `${abbr}-${String(task.id).padStart(3, "0")}`;
}

// ── Sprint Velocity chart (illustrative — no sprints endpoint yet) ───────────

const SPRINT_BARS = [
  { day: "WE", pts: 10 },
  { day: "TU", pts: 15 },
  { day: "WE", pts: 7  },
  { day: "TH", pts: 24, active: true },
  { day: "FR", pts: 18 },
  { day: "SA", pts: 12 },
  { day: "SU", pts: 8  },
];

const BAR_MAX  = 28;
const CHART_H  = 80;

function SprintVelocityChart() {
  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: CHART_H + 44 }}>
        {SPRINT_BARS.map((b, i) => {
          const barH   = Math.round((b.pts / BAR_MAX) * CHART_H);
          const active = !!b.active;
          return (
            <div
              key={i}
              style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}
            >
              {active ? (
                <div style={{
                  background: "#fef2f2", border: "1px solid #fecaca",
                  borderRadius: 4, padding: "2px 5px",
                  fontSize: 9, color: "#c74634", fontWeight: 700,
                  whiteSpace: "nowrap", textAlign: "center", marginBottom: 2,
                }}>
                  Active<br />
                  <span style={{ fontSize: 10 }}>{b.pts} pts</span>
                </div>
              ) : (
                <div style={{ flex: 1 }} />
              )}
              <div style={{
                width: "100%", height: barH,
                background: active ? "#c74634" : "#dce8ea",
                borderRadius: "3px 3px 0 0",
              }} />
              <span style={{ fontSize: 9, color: "#6a8a9a", marginTop: 4 }}>{b.day}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Status badge map ─────────────────────────────────────────────────────────

const STATUS_BADGE: Record<string, { bg: string; text: string; label: string }> = {
  on_track: { bg: "#f0fdf4", text: "#16a34a", label: "ON TRACK" },
  meeting:  { bg: "#eff6ff", text: "#2563eb", label: "MEETING"  },
  blocked:  { bg: "#fef2f2", text: "#c74634", label: "BLOCKED"  },
};

const AVATAR_COLORS = ["#4a3f7a", "#2a6a5a", "#c74634", "#d97706", "#2a4a7a", "#6a2a4a"];

// ── Sub-components ───────────────────────────────────────────────────────────

function MemberRow({ member, idx }: { member: MemberEntry; idx: number }) {
  const badge = STATUS_BADGE[member.status];
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "9px 0",
      borderBottom: "1px solid #f0f4f5",
    }}>
      <div style={{
        width: 30, height: 30, borderRadius: "50%",
        background: AVATAR_COLORS[idx % AVATAR_COLORS.length],
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: "#fff" }}>{member.initials}</span>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: "#1a3a4a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {member.username}
        </p>
        <p style={{ margin: "1px 0 0", fontSize: 10, color: "#6a8a9a", textTransform: "capitalize" }}>
          {member.role}
        </p>
      </div>
      <span style={{
        fontSize: 9, fontWeight: 700, flexShrink: 0,
        padding: "3px 7px", borderRadius: 4,
        background: badge.bg, color: badge.text, letterSpacing: 0.3,
      }}>
        {badge.label}
      </span>
    </div>
  );
}

const PRIORITY_BADGE: Record<string, { bg: string; color: string }> = {
  critical: { bg: "#fef2f2", color: "#c74634" },
  high:     { bg: "#fff7ed", color: "#d97706" },
  medium:   { bg: "#eff6ff", color: "#2563eb" },
  low:      { bg: "#f1f5f9", color: "#64748b" },
};

function ObjectiveItem({ task }: { task: EnrichedTask }) {
  const pb = PRIORITY_BADGE[task.priority] ?? PRIORITY_BADGE.medium;
  return (
    <div style={{ padding: "11px 0", borderBottom: "1px solid #f0f4f5" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: "0 0 2px", fontSize: 9, letterSpacing: 0.8, color: "#6a8a9a", textTransform: "uppercase" }}>
            {taskCode(task)}
          </p>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: "#1a3a4a", lineHeight: 1.4 }}>
            {task.title}
          </p>
          {task.description && (
            <p style={{
              margin: "3px 0 0", fontSize: 10, color: "#6a8a9a", lineHeight: 1.4,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {task.description}
            </p>
          )}
        </div>
        <span style={{
          fontSize: 9, fontWeight: 700, flexShrink: 0,
          padding: "2px 7px", borderRadius: 4,
          background: pb.bg, color: pb.color, letterSpacing: 0.3,
        }}>
          {task.priority.toUpperCase()}
        </span>
      </div>
    </div>
  );
}

// ── Upcoming events (illustrative — no calendar endpoint yet) ────────────────

const MOCK_EVENTS = [
  { day: "14", month: "Oct", title: "Stakeholder Review", tag: "Full", tagColor: "#c74634", sub: null },
  { day: "13", month: "Oct", title: "Sprint Retrospective", tag: null, tagColor: null, sub: "10:00 · 1 Atherion Link" },
];

function EventItem({ ev }: { ev: typeof MOCK_EVENTS[0] }) {
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "8px 0", borderBottom: "1px solid #f0f4f5" }}>
      <div style={{
        flexShrink: 0, textAlign: "center",
        background: "#f0f4f5", borderRadius: 6,
        padding: "4px 8px", minWidth: 32,
      }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#1a3a4a", lineHeight: 1 }}>{ev.day}</p>
        <p style={{ margin: "1px 0 0", fontSize: 8, color: "#6a8a9a", textTransform: "uppercase", letterSpacing: 0.5 }}>{ev.month}</p>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: "#1a3a4a" }}>{ev.title}</p>
          {ev.tag && (
            <span style={{
              fontSize: 9, fontWeight: 700,
              padding: "2px 6px", borderRadius: 3,
              background: "#fef2f2", color: ev.tagColor ?? "#c74634", letterSpacing: 0.3,
            }}>
              {ev.tag}
            </span>
          )}
        </div>
        {ev.sub && <p style={{ margin: "2px 0 0", fontSize: 10, color: "#6a8a9a" }}>{ev.sub}</p>}
      </div>
    </div>
  );
}

// ── System Config (static — no config endpoint) ───────────────────────────────

function SystemConfigCard() {
  return (
    <div style={{ background: "#1a3a4a", borderRadius: 8, padding: "14px 16px", marginTop: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 6,
          background: "rgba(255,255,255,0.1)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg viewBox="0 0 16 16" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.4" width="13" height="13">
            <circle cx="8" cy="8" r="2.5" />
            <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.2 3.2l1.4 1.4M11.4 11.4l1.4 1.4M3.2 12.8l1.4-1.4M11.4 4.6l1.4-1.4" />
          </svg>
        </div>
        <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.9)" }}>System Config</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {[
          { label: "Environment",     value: "Production-Alpha" },
          { label: "Version Control", value: "CDL49   10.4"     },
        ].map((row) => (
          <div key={row.label} style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.45)" }}>{row.label}</span>
            <span style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.8)" }}>{row.value}</span>
          </div>
        ))}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.45)" }}>Lattice Status</span>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", display: "inline-block" }} />
            <span style={{ fontSize: 10, fontWeight: 600, color: "#4ade80" }}>Operational</span>
          </div>
        </div>
      </div>
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", marginTop: 12, paddingTop: 10 }}>
        <p style={{ margin: "0 0 3px", fontSize: 8, letterSpacing: 1, textTransform: "uppercase", color: "rgba(255,255,255,0.35)" }}>
          Last Deploy
        </p>
        <p style={{ margin: 0, fontSize: 10, color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>
          Dec 9, 19:04:13 OFT
        </p>
      </div>
    </div>
  );
}

// ── Skeleton loader ──────────────────────────────────────────────────────────

function Skeleton({ w = "100%", h = 14, radius = 4 }: { w?: string | number; h?: number; radius?: number }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: radius,
      background: "linear-gradient(90deg, #f0f4f5 25%, #e4ecee 50%, #f0f4f5 75%)",
      backgroundSize: "200% 100%",
      animation: "shimmer 1.4s infinite",
    }} />
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export default function PODashboard({ user: _user }: { user: ApiUser }) {
  const [loading, setLoading]           = useState(true);
  const [projectName, setProjectName]   = useState("Projects Overview");
  const [completionPct, setCompletionPct] = useState(0);
  const [activeBlocks, setActiveBlocks] = useState(0);
  const [objectives, setObjectives]     = useState<EnrichedTask[]>([]);
  const [members, setMembers]           = useState<MemberEntry[]>([]);
  const [totalMembers, setTotalMembers] = useState(0);

  useEffect(() => {
    async function load() {
      try {
        const [projects, allMembers] = await Promise.all([
          getProjects(),
          getProjectMembers(),
        ]);

        // Use first active project name as the page title
        const activeProject = projects.find((p) => p.status === "active") ?? projects[0];
        if (activeProject) setProjectName(activeProject.name);

        // Load tasks for all projects in parallel
        const taskArrays = await Promise.all(
          projects.map(async (p) => {
            const tasks = await getProjectTasks(p.id);
            return tasks.map<EnrichedTask>((t) => ({
              ...t,
              projectId:   p.id,
              projectName: p.name,
            }));
          })
        );
        const allTasks = taskArrays.flat();

        // Completion rate
        const total = allTasks.length;
        const done  = allTasks.filter((t) => t.status === "done").length;
        setCompletionPct(total > 0 ? Math.round((done / total) * 100) : 0);

        // Active blocks: critical tasks not yet done
        const blocks = allTasks.filter(
          (t) => t.priority === "critical" && t.status !== "done"
        );
        setActiveBlocks(blocks.length);

        // Top 3 objectives: non-done, sorted by priority
        const openTasks = allTasks
          .filter((t) => t.status !== "done")
          .sort((a, b) => (PRIORITY_ORDER[a.priority] ?? 4) - (PRIORITY_ORDER[b.priority] ?? 4));
        setObjectives(openTasks.slice(0, 3));

        // Unique members (by userId), max shown = 3
        const seen = new Set<number>();
        const unique: MemberEntry[] = [];
        allMembers.forEach((m, i) => {
          if (!seen.has(m.userId)) {
            seen.add(m.userId);
            unique.push({
              userId:   m.userId,
              username: m.username,
              role:     m.role,
              status:   memberStatus(m.role, i),
              initials: initials(m.username),
            });
          }
        });
        setTotalMembers(unique.length);
        setMembers(unique.slice(0, 3));
      } catch (err) {
        console.error("PODashboard load error:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div style={{ paddingBottom: 24 }}>
      {/* ── Page title ─────────────────────────────────────────────── */}
      <h1 style={{
        margin: "0 0 20px",
        fontSize: 24, fontWeight: 700, fontStyle: "italic",
        color: "#111827", letterSpacing: -0.5,
      }}>
        {loading ? <Skeleton w={320} h={28} /> : projectName}
      </h1>

      {/* ── Top row ────────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 220px", gap: 14, marginBottom: 14 }}>

        {/* Sprint Velocity (illustrative) */}
        <div style={{ background: "#fff", border: "1px solid #cdd8db", borderRadius: 10, padding: "16px 18px" }}>
          <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 700, color: "#1a3a4a" }}>
            Sprint Velocity
          </p>
          <p style={{ margin: 0, fontSize: 9, letterSpacing: 1.2, textTransform: "uppercase", color: "#6a8a9a" }}>
            Q4 Release Cycle &bull; Atherion X Engine
          </p>
          <SprintVelocityChart />
        </div>

        {/* KPI stack */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

          {/* Completion Rate */}
          <div style={{ background: "#c74634", borderRadius: 10, padding: "16px 16px", flex: 1 }}>
            <p style={{ margin: "0 0 4px", fontSize: 9, letterSpacing: 1.1, textTransform: "uppercase", color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>
              Completion Rate
            </p>
            {loading ? (
              <Skeleton w={90} h={36} />
            ) : (
              <p style={{ margin: "0 0 6px", fontSize: 32, fontWeight: 800, color: "#fff", lineHeight: 1, letterSpacing: -1 }}>
                {completionPct}%
              </p>
            )}
            <p style={{ margin: 0, fontSize: 10, color: "rgba(255,255,255,0.75)", lineHeight: 1.5 }}>
              Task completion across all active projects.
            </p>
          </div>

          {/* Active Blocks */}
          <div style={{ background: "#2a4a5a", borderRadius: 10, padding: "14px 16px" }}>
            <p style={{ margin: "0 0 4px", fontSize: 9, letterSpacing: 1.1, textTransform: "uppercase", color: "rgba(255,255,255,0.55)", fontWeight: 600 }}>
              Active Blocks
            </p>
            {loading ? (
              <Skeleton w={50} h={30} />
            ) : (
              <p style={{ margin: "0 0 4px", fontSize: 28, fontWeight: 800, color: "#fff", lineHeight: 1, letterSpacing: -1 }}>
                {String(activeBlocks).padStart(2, "0")}
              </p>
            )}
            <p style={{ margin: 0, fontSize: 10, color: "rgba(255,255,255,0.6)", lineHeight: 1.5 }}>
              Critical tasks pending across all projects.
            </p>
          </div>
        </div>
      </div>

      {/* ── Bottom row ─────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>

        {/* Team Distribution */}
        <div style={{ background: "#fff", border: "1px solid #cdd8db", borderRadius: 10, padding: "14px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#1a3a4a" }}>Team Distribution</span>
            <svg viewBox="0 0 16 16" fill="none" stroke="#6a8a9a" strokeWidth="1.4" width="14" height="14">
              <circle cx="6" cy="6" r="3" />
              <path d="M1 13c0-2.5 2-4 5-4s5 1.5 5 4M11 5c1.5 0 3 1 3 3" />
            </svg>
          </div>

          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 8 }}>
              {[0, 1, 2].map((i) => <Skeleton key={i} h={36} />)}
            </div>
          ) : members.length === 0 ? (
            <p style={{ fontSize: 12, color: "#6a8a9a", textAlign: "center", padding: "16px 0" }}>No members found.</p>
          ) : (
            <>
              {members.map((m, i) => <MemberRow key={m.userId} member={m} idx={i} />)}
              {totalMembers > 3 && (
                <button style={{
                  marginTop: 12, width: "100%", fontSize: 10,
                  color: "#c74634", background: "none", border: "none",
                  cursor: "pointer", fontWeight: 700, letterSpacing: 0.5,
                  textTransform: "uppercase", textAlign: "center", padding: 0,
                }}>
                  View All Members ({totalMembers})
                </button>
              )}
            </>
          )}
        </div>

        {/* Current Objectives */}
        <div style={{ background: "#fff", border: "1px solid #cdd8db", borderRadius: 10, padding: "14px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#1a3a4a" }}>Current Objectives</span>
            <span style={{
              fontSize: 9, fontWeight: 700,
              padding: "3px 8px", borderRadius: 4,
              background: "#eff6ff", color: "#2563eb", letterSpacing: 0.4,
            }}>
              OPEN
            </span>
          </div>

          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 8 }}>
              {[0, 1, 2].map((i) => <Skeleton key={i} h={48} />)}
            </div>
          ) : objectives.length === 0 ? (
            <p style={{ fontSize: 12, color: "#6a8a9a", textAlign: "center", padding: "16px 0" }}>
              All tasks are completed.
            </p>
          ) : (
            objectives.map((t) => <ObjectiveItem key={t.id} task={t} />)
          )}
        </div>

        {/* Upcoming + System Config */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ background: "#fff", border: "1px solid #cdd8db", borderRadius: 10, padding: "14px 16px" }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#1a3a4a" }}>Upcoming</span>
            <div style={{ marginTop: 4 }}>
              {MOCK_EVENTS.map((ev) => <EventItem key={ev.title} ev={ev} />)}
            </div>
          </div>
          <SystemConfigCard />
        </div>
      </div>
    </div>
  );
}
