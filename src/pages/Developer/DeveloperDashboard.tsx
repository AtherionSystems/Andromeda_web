import { useEffect, useState } from "react";
import type { ApiUser, ApiTask } from "../../types/api";
import { getProjectMembers } from "../../api/members";
import { getProjectTasks } from "../../api/tasks";

// ── Helpers ────────────────────────────────────────────────────────────────

function greet(name: string): string {
  const h = new Date().getHours();
  const time = h < 12 ? "Good Morning" : h < 18 ? "Good Afternoon" : "Good Evening";
  return `${time}, ${name.split(" ")[0]}.`;
}

function fmtDue(iso: string | null): string {
  if (!iso) return "No due date";
  const diff = Math.round((new Date(iso).getTime() - Date.now()) / 86_400_000);
  if (diff < 0) return "Overdue";
  if (diff === 0) return "Due today";
  if (diff === 1) return "Due tomorrow";
  return `Due in ${diff} days`;
}

const PRIORITY_ORDER: Record<string, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

const BADGE: Record<string, { bg: string; text: string; border: string; label: string }> = {
  critical: { bg: "#fef2f2", text: "#c74634", border: "#fecaca", label: "CRITICAL" },
  high:     { bg: "#fff7ed", text: "#d97706", border: "#fed7aa", label: "HIGH PRIORITY" },
  medium:   { bg: "#eff6ff", text: "#2563eb", border: "#bfdbfe", label: "MEDIUM" },
  low:      { bg: "#f1f5f9", text: "#64748b", border: "#e2e8f0", label: "BACKLOG" },
};

const ICON_COLORS = ["#d97706", "#0891b2", "#7c3aed", "#c74634", "#16a34a"];
const BAR_COLORS  = ["#c74634", "#d97706", "#6a8a9a", "#7c3aed", "#16a34a"];

// ── Mini calendar ──────────────────────────────────────────────────────────

function MiniCalendar() {
  const today = new Date();
  const y = today.getFullYear();
  const m = today.getMonth();
  let startDow = new Date(y, m, 1).getDay();
  startDow = startDow === 0 ? 6 : startDow - 1;
  const daysInMonth = new Date(y, m + 1, 0).getDate();

  const cells: { n: number; cur: boolean }[] = [];
  for (let i = 0; i < startDow; i++)
    cells.push({ n: new Date(y, m, 1 - startDow + i).getDate(), cur: false });
  for (let i = 1; i <= daysInMonth; i++)
    cells.push({ n: i, cur: true });
  while (cells.length % 7 !== 0)
    cells.push({ n: cells.length - daysInMonth - startDow + 1, cur: false });

  const monthLabel = today.toLocaleString("en-US", { month: "long" });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: "#1a3a4a" }}>Schedule</span>
        <span style={{ fontSize: 10, color: "#6a8a9a" }}>{monthLabel} {y}</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", textAlign: "center" }}>
        {["M","T","W","T","F","S","S"].map((d, i) => (
          <span key={i} style={{ fontSize: 9, color: "#6a8a9a", paddingBottom: 4 }}>{d}</span>
        ))}
        {cells.map((c, i) => {
          const isToday = c.cur && c.n === today.getDate();
          return (
            <span key={i} style={{
              fontSize: 10,
              width: 20, height: 20,
              borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "1px auto",
              background: isToday ? "#c74634" : "transparent",
              color: isToday ? "#fff" : c.cur ? "#1a3a4a" : "#cdd8db",
              fontWeight: isToday ? 700 : 400,
            }}>
              {c.n}
            </span>
          );
        })}
      </div>
    </div>
  );
}

// ── Progress bar ───────────────────────────────────────────────────────────

function Bar({ pct, color }: { pct: number; color: string }) {
  return (
    <div style={{ height: 4, background: "#f0f4f5", borderRadius: 2, overflow: "hidden" }}>
      <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 2 }} />
    </div>
  );
}

// ── Quote card ─────────────────────────────────────────────────────────────

function QuoteCard() {
  return (
    <div style={{
      borderRadius: 8, overflow: "hidden",
      background: "#111827",
      padding: "18px 16px",
      position: "relative",
    }}>
      <svg
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.18 }}
        viewBox="0 0 200 90" preserveAspectRatio="xMidYMid slice"
      >
        <line x1="0"   y1="15" x2="55"  y2="15" stroke="#c74634" strokeWidth="1"/>
        <line x1="55"  y1="15" x2="55"  y2="35" stroke="#c74634" strokeWidth="1"/>
        <circle cx="55" cy="15" r="2" fill="#c74634"/>
        <line x1="55"  y1="35" x2="110" y2="35" stroke="#4a8a9a" strokeWidth="1"/>
        <circle cx="110" cy="35" r="2" fill="#4a8a9a"/>
        <line x1="110" y1="35" x2="110" y2="8"  stroke="#4a8a9a" strokeWidth="1"/>
        <line x1="110" y1="8"  x2="200" y2="8"  stroke="#4a8a9a" strokeWidth="1"/>
        <line x1="0"   y1="65" x2="40"  y2="65" stroke="#7a4a9a" strokeWidth="1"/>
        <circle cx="40" cy="65" r="2" fill="#7a4a9a"/>
        <line x1="40"  y1="65" x2="40"  y2="82" stroke="#7a4a9a" strokeWidth="1"/>
        <line x1="40"  y1="82" x2="200" y2="82" stroke="#7a4a9a" strokeWidth="1"/>
        <rect x="78"  y="50" width="12" height="8" fill="none" stroke="#c74634" strokeWidth="0.8"/>
        <rect x="138" y="22" width="16" height="10" fill="none" stroke="#4a8a9a" strokeWidth="0.8"/>
        <circle cx="155" cy="60" r="5" fill="none" stroke="#7a4a9a" strokeWidth="0.8"/>
      </svg>
      <p style={{
        position: "relative",
        margin: 0, fontSize: 11, fontStyle: "italic",
        color: "rgba(255,255,255,0.82)",
        lineHeight: 1.6, textAlign: "center",
      }}>
        "The code is the canvas and the logic is the brush."
      </p>
    </div>
  );
}

// ── Task icon ──────────────────────────────────────────────────────────────

function TaskIcon({ color }: { color: string }) {
  return (
    <div style={{
      width: 34, height: 34, borderRadius: 8,
      background: color,
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0,
    }}>
      <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="white" strokeWidth="1.5">
        <rect x="1" y="1" width="6" height="6" rx="1"/>
        <path d="M9 4h6M9 8h4M9 12h6M1 10l2 2 3-3"/>
      </svg>
    </div>
  );
}

// ── Main dashboard ─────────────────────────────────────────────────────────

export default function DeveloperDashboard({ user }: { user: ApiUser }) {
  const [tasks, setTasks]     = useState<ApiTask[]>([]);
  const [projects, setProjects] = useState<{ name: string; pct: number; color: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const memberships = await getProjectMembers({ userId: user.id });

        const taskArrays = await Promise.all(
          memberships.map(async (m) => {
            const t = await getProjectTasks(m.projectId);
            return t.map((task) => ({ ...task, projectName: m.projectName }));
          })
        );

        const sorted = taskArrays
          .flat()
          .sort((a, b) => (PRIORITY_ORDER[a.priority] ?? 4) - (PRIORITY_ORDER[b.priority] ?? 4));

        setTasks(sorted);

        setProjects(
          memberships.map((m, i) => {
            const projectTasks = taskArrays[i];
            const total = projectTasks.length;
            const done  = projectTasks.filter((t) => t.status === "done").length;
            return {
              name:  m.projectName,
              pct:   total > 0 ? Math.round((done / total) * 100) : 0,
              color: BAR_COLORS[i % BAR_COLORS.length],
            };
          })
        );
      } catch {
        // silently fail — static mock still renders
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user.id]);

  const criticalCount = tasks.filter(
    (t) => t.priority === "critical" || t.priority === "high"
  ).length;
  const topTasks = tasks.slice(0, 3);

  return (
    <div style={{ paddingBottom: 24 }}>
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <p style={{ margin: "0 0 4px", fontSize: 10, letterSpacing: 1.2, textTransform: "uppercase", color: "#6a8a9a", fontWeight: 600 }}>
            Developer Control Center
          </p>
          <h1 style={{ margin: "0 0 6px", fontSize: 30, fontStyle: "italic", fontWeight: 700, color: "#111827", letterSpacing: -0.5 }}>
            {greet(user.name)}
          </h1>
          <p style={{ margin: 0, fontSize: 12, color: "#6a8a9a", maxWidth: 380 }}>
            Your systems are currently operational.{" "}
            {criticalCount > 0
              ? `You have ${criticalCount} critical task${criticalCount !== 1 ? "s" : ""} assigned for this sprint.`
              : "All tasks are currently on track."}
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: 24, textAlign: "center", flexShrink: 0 }}>
          <div>
            <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#1a3a4a" }}>24m</p>
            <p style={{ margin: "2px 0 0", fontSize: 9, letterSpacing: 0.8, textTransform: "uppercase", color: "#6a8a9a" }}>
              Uptime Latency
            </p>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#1a3a4a" }}>99.9%</p>
            <p style={{ margin: "2px 0 0", fontSize: 9, letterSpacing: 0.8, textTransform: "uppercase", color: "#6a8a9a" }}>
              Uptime Inc
            </p>
          </div>
        </div>
      </div>

      {/* ── Two-column layout ───────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 260px", gap: 16, alignItems: "start" }}>

        {/* LEFT — Assigned Tasks */}
        <div style={{ background: "#fff", border: "1px solid #cdd8db", borderRadius: 10, padding: "16px 18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#1a3a4a" }}>Assigned Tasks</span>
            <button style={{ fontSize: 11, color: "#c74634", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>
              View All
            </button>
          </div>

          {loading && (
            <p style={{ fontSize: 12, color: "#6a8a9a" }}>Loading tasks…</p>
          )}

          {!loading && topTasks.length === 0 && (
            <p style={{ fontSize: 12, color: "#6a8a9a", textAlign: "center", padding: "20px 0" }}>
              No tasks assigned yet.
            </p>
          )}

          {topTasks.map((task, i) => {
            const badge = BADGE[task.priority] ?? BADGE.medium;
            return (
              <div key={task.id} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "11px 0",
                borderBottom: i < topTasks.length - 1 ? "1px solid #f0f4f5" : "none",
              }}>
                <TaskIcon color={ICON_COLORS[i % ICON_COLORS.length]} />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: "#1a3a4a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {task.title}
                  </p>
                  <p style={{ margin: "2px 0 0", fontSize: 10, color: "#6a8a9a" }}>
                    {task.projectName ?? "Unknown"} • {fmtDue(task.dueDate)}
                  </p>
                </div>

                <span style={{
                  fontSize: 9, fontWeight: 700, whiteSpace: "nowrap", flexShrink: 0,
                  padding: "3px 8px", borderRadius: 4,
                  background: badge.bg, color: badge.text, border: `1px solid ${badge.border}`,
                  letterSpacing: 0.3,
                }}>
                  {badge.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* RIGHT — Schedule + Projects + Quote */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

          {/* Schedule */}
          <div style={{ background: "#fff", border: "1px solid #cdd8db", borderRadius: 10, padding: "14px 16px" }}>
            <MiniCalendar />
            <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ padding: "6px 10px", background: "#f0fdf4", borderRadius: 6, borderLeft: "3px solid #16a34a" }}>
                <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: "#1a3a4a" }}>Sprint Planning</p>
                <p style={{ margin: "1px 0 0", fontSize: 10, color: "#6a8a9a" }}>10:00 AM – 11:30 AM</p>
              </div>
              <div style={{ padding: "6px 10px", background: "#fef2f2", borderRadius: 6, borderLeft: "3px solid #c74634" }}>
                <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: "#1a3a4a" }}>Code Review: #PR-204</p>
                <p style={{ margin: "1px 0 0", fontSize: 10, color: "#6a8a9a" }}>02:00 PM – 03:00 PM</p>
              </div>
            </div>
          </div>

          {/* Active Projects */}
          {projects.length > 0 && (
            <div style={{ background: "#fff", border: "1px solid #cdd8db", borderRadius: 10, padding: "14px 16px" }}>
              <p style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 700, color: "#1a3a4a" }}>Active Projects</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {projects.slice(0, 3).map((p) => (
                  <div key={p.name}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 11, color: "#1a3a4a", fontWeight: 500 }}>{p.name}</span>
                      <span style={{ fontSize: 11, color: "#6a8a9a" }}>{p.pct}%</span>
                    </div>
                    <Bar pct={p.pct} color={p.color} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quote */}
          <QuoteCard />
        </div>
      </div>
    </div>
  );
}
