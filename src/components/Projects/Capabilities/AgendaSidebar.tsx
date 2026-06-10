import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useTheme } from "../../../contexts/useTheme";
import { getProjectSprints } from "../../../api/projects";
import { addMember, getProjectMembers, removeMember } from "../../../api/members";
import { getUsers } from "../../../api/auth";
import type { ApiSprint } from "../../../types/api";
import type { ApiProjectMember, ApiUser } from "../../../types/api";
import CalendarWidget from "./CalendarWidget";

function SectionLabel({
  children,
  darkMode,
}: {
  children: string;
  darkMode: boolean;
}) {
  return (
    <p
      className={`mb-3 text-[10px] font-semibold uppercase tracking-[1.2px] ${
        darkMode ? "text-slate-500" : "text-slate-400"
      }`}
    >
      {children}
    </p>
  );
}

function UpcomingItem({
  time,
  meridiem,
  title,
  subtitle,
  highlight,
  darkMode,
}: {
  time: string;
  meridiem: string;
  title: string;
  subtitle: string;
  highlight?: boolean;
  darkMode: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 ${
        highlight
          ? darkMode
            ? "bg-[#3a2420] border-[#5a352e]"
            : "bg-[#fdf0ed] border-[#f3d8d1]"
          : darkMode
            ? "bg-slate-800 border-slate-700"
            : "bg-white border-slate-200"
      }`}
    >
      <div
        className={`flex h-10 w-12 shrink-0 flex-col items-center justify-center rounded ${
          highlight
            ? "bg-[#c74634] text-white"
            : darkMode
              ? "bg-slate-700 text-slate-300"
              : "bg-slate-100 text-slate-500"
        }`}
      >
        <span className="text-[8px] font-semibold leading-none">
          {meridiem}
        </span>
        <span className="text-[12px] font-bold leading-tight">{time}</span>
      </div>
      <div className="min-w-0">
        <p
          className={`truncate text-[12px] font-semibold ${
            darkMode ? "text-slate-100" : "text-slate-800"
          }`}
        >
          {title}
        </p>
        <p
          className={`truncate text-[11px] ${
            darkMode ? "text-slate-400" : "text-slate-500"
          }`}
        >
          {subtitle}
        </p>
      </div>
    </div>
  );
}

/** Converts an ISO date string → { time: "10:00", meridiem: "AM" } */
function formatTime(iso: string | null): { time: string; meridiem: string } {
  if (!iso) return { time: "--:--", meridiem: "—" };
  const d = new Date(iso);
  const h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, "0");
  const meridiem = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return { time: `${hour}:${m}`, meridiem };
}

/** Subtitle label for a sprint */
function sprintSubtitle(sprint: ApiSprint): string {
  if (sprint.status === "active") return "Active sprint";
  if (sprint.dueDate) {
    const due = new Date(sprint.dueDate);
    return `Due ${due.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;
  }
  return "Planned";
}

interface AgendaSidebarProps {
  projectId: number;
  // When false, hides the "Coming up" sprints widget (e.g. on the Sprints page
  // where the full sprint list is already the main content).
  showUpcoming?: boolean;
}

const MEMBER_COLORS = ["#4a3f7a", "#c74634", "#2a6a5a", "#7a4a2a", "#2a4a7a", "#6a2a4a"];

function memberToChip(member: ApiProjectMember) {
  const parts = member.username.split(/[_.\-\s]+/);
  const initials =
    parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : member.username.slice(0, 2).toUpperCase();

  let hash = 0;
  for (const c of member.username) hash = (hash * 31 + c.charCodeAt(0)) | 0;
  const color = MEMBER_COLORS[Math.abs(hash) % MEMBER_COLORS.length];

  return { initials, color };
}

function ConfirmRemoveMemberModal({
  memberName,
  onConfirm,
  onCancel,
}: {
  memberName: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const { darkMode } = useTheme();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-[1px] p-4"
      onClick={(e) => {
        e.stopPropagation();
        onCancel();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-[380px] rounded-lg p-6 text-center shadow-2xl ${
          darkMode ? "bg-slate-900 text-slate-100" : "bg-white text-slate-800"
        }`}
      >
        <button
          type="button"
          onClick={onCancel}
          aria-label="Cancel"
          className={`absolute top-3 right-3 transition-colors ${
            darkMode
              ? "text-slate-500 hover:text-slate-200"
              : "text-slate-400 hover:text-slate-700"
          }`}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <line x1="6" y1="6" x2="18" y2="18" />
            <line x1="18" y1="6" x2="6" y2="18" />
          </svg>
        </button>

        <div
          className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full ${
            darkMode ? "bg-red-500/15" : "bg-red-100"
          }`}
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#c74634"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>

        <h3 className="mb-1 text-lg font-semibold">Remove member?</h3>
        <p className={`mb-6 text-sm ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
          "{memberName}" will be removed from this project.
        </p>

        <button
          type="button"
          onClick={onConfirm}
          style={{ background: "#c74634" }}
          className="w-full rounded py-2.5 text-[13px] font-semibold uppercase tracking-wide text-white transition-opacity hover:opacity-90"
        >
          Remove
        </button>
      </div>
    </div>,
    document.body,
  );
}

function AgendaSidebar({ projectId, showUpcoming = true }: AgendaSidebarProps) {
  const { darkMode } = useTheme();
  const [sprints, setSprints] = useState<ApiSprint[]>([]);
  const [members, setMembers] = useState<ApiProjectMember[]>([]);
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [adding, setAdding] = useState(false);
  const [memberError, setMemberError] = useState<string | null>(null);
  const [memberMenuOpen, setMemberMenuOpen] = useState(false);
  const [memberMenuPos, setMemberMenuPos] = useState({ top: 0, right: 0 });
  const [activeMember, setActiveMember] = useState<ApiProjectMember | null>(null);
  const [removeConfirmOpen, setRemoveConfirmOpen] = useState(false);
  const [removingMember, setRemovingMember] = useState(false);
  const [removeError, setRemoveError] = useState<string | null>(null);

  const availableUsers = useMemo(
    () => users.filter((user) => !members.some((member) => member.userId === user.id)),
    [users, members],
  );

  useEffect(() => {
    getProjectSprints(projectId)
      .then((all) =>
        setSprints(
          all
            .filter((s) => s.status === "active" || s.status === "planned")
            .sort((a, b) => {
              // active first, then by startDate
              if (a.status === "active" && b.status !== "active") return -1;
              if (b.status === "active" && a.status !== "active") return 1;
              return (a.startDate ?? "").localeCompare(b.startDate ?? "");
            })
            .slice(0, 4), // show at most 4 upcoming sprints
        ),
      )
      .catch(console.error);
  }, [projectId]);

  useEffect(() => {
    let active = true;

    Promise.all([getProjectMembers({ projectId }), getUsers()])
      .then(([projectMembers, allUsers]) => {
        if (!active) return;
        setMembers(projectMembers);
        setUsers(allUsers);
      })
      .catch(console.error);

    return () => {
      active = false;
    };
  }, [projectId]);

  async function handleAddMember(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedUserId) return;

    setAdding(true);
    setMemberError(null);
    try {
      const userId = Number(selectedUserId);
      const created = await addMember({ projectId, userId, role: "member" });
      setMembers((prev) => [...prev, created]);
      setSelectedUserId("");
    } catch {
      setMemberError("Could not add this member. Please try again.");
    } finally {
      setAdding(false);
    }
  }

  function openMemberMenu(member: ApiProjectMember, rect: DOMRect) {
    setActiveMember(member);
    setMemberMenuPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
    setMemberMenuOpen(true);
  }

  async function handleRemoveMember() {
    if (!activeMember) return;

    setRemovingMember(true);
    setRemoveError(null);
    try {
      await removeMember(activeMember.id);
      setMembers((prev) => prev.filter((member) => member.id !== activeMember.id));
      setRemoveConfirmOpen(false);
      setMemberMenuOpen(false);
      setActiveMember(null);
    } catch {
      setRemoveError("Could not remove this member. Please try again.");
    } finally {
      setRemovingMember(false);
    }
  }

  return (
    <aside className="w-full shrink-0 space-y-8 lg:w-[300px]">
      <CalendarWidget />

      <div>
        <SectionLabel darkMode={darkMode}>Project Members</SectionLabel>

        <div className={`space-y-3 rounded-lg border p-3 ${darkMode ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-white"}`}>
          <div className="space-y-2">
            {members.length === 0 ? (
              <p className={`text-[12px] ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
                No members added yet.
              </p>
            ) : (
              members.map((member) => {
                const chip = memberToChip(member);
                return (
                  <div key={member.id} className="flex items-center gap-3 rounded-md px-2 py-2">
                    <div
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white"
                      style={{ background: chip.color }}
                    >
                      {chip.initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`truncate text-[12px] font-semibold ${darkMode ? "text-slate-100" : "text-slate-800"}`}>
                        {member.username}
                      </p>
                      <p className={`truncate text-[10px] capitalize ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                        {member.role}
                      </p>
                    </div>
                    <button
                      type="button"
                      aria-label={`Member options for ${member.username}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        openMemberMenu(member, e.currentTarget.getBoundingClientRect());
                      }}
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors ${
                        darkMode
                          ? "text-slate-500 hover:bg-slate-700 hover:text-slate-200"
                          : "text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                      }`}
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <circle cx="12" cy="5" r="1.8" />
                        <circle cx="12" cy="12" r="1.8" />
                        <circle cx="12" cy="19" r="1.8" />
                      </svg>
                    </button>
                  </div>
                );
              })
            )}
          </div>

          <form onSubmit={handleAddMember} className="space-y-2 border-t pt-3" >
            <label className={`block text-[10px] font-semibold uppercase tracking-[1.2px] ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
              Add member
            </label>
            <div className="flex gap-2">
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className={`min-w-0 flex-1 rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C74634]/30 focus:border-[#C74634] ${
                  darkMode
                    ? "bg-slate-900 border-slate-700 text-slate-100"
                    : "bg-[#f5f5f5] border-transparent text-slate-700"
                }`}
              >
                <option value="">Select user</option>
                {availableUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.username})
                  </option>
                ))}
              </select>
              <button
                type="submit"
                disabled={adding || !selectedUserId || availableUsers.length === 0}
                className="rounded bg-[#c74634] px-3 py-2 text-[11px] font-semibold uppercase tracking-[1.2px] text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Add
              </button>
            </div>
            {memberError && <p className="text-[11px] text-red-500">{memberError}</p>}
            {availableUsers.length === 0 && (
              <p className={`text-[11px] ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
                No more users available to add.
              </p>
            )}
          </form>
        </div>
      </div>

      {memberMenuOpen && activeMember &&
        createPortal(
          <div
            className="fixed inset-0 z-[9998]"
            onClick={() => setMemberMenuOpen(false)}
          >
            <div
              style={{ position: "fixed", top: memberMenuPos.top, right: memberMenuPos.right, zIndex: 9999 }}
              className={`w-44 rounded-md shadow-lg border py-1 ${
                darkMode ? "bg-slate-800 border-slate-600" : "bg-white border-black/10"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => {
                  setMemberMenuOpen(false);
                  setRemoveConfirmOpen(true);
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-[13px] text-red-500 transition-colors ${
                  darkMode ? "hover:bg-red-500/10" : "hover:bg-red-50"
                }`}
              >
                <img src="/Andromeda_web/Media/Icons/deleteIcon.svg" alt="" className="w-4 h-4 shrink-0" />
                Remove member
              </button>
            </div>
          </div>,
          document.body,
        )}

      {removeConfirmOpen && activeMember && (
        <ConfirmRemoveMemberModal
          memberName={activeMember.username}
          onConfirm={handleRemoveMember}
          onCancel={() => {
            setRemoveConfirmOpen(false);
            setRemoveError(null);
          }}
        />
      )}

      {removeError && (
        <div className={`rounded-lg border px-3 py-2 text-[12px] ${darkMode ? "border-red-500/20 bg-red-500/10 text-red-300" : "border-red-200 bg-red-50 text-red-600"}`}>
          {removeError}
        </div>
      )}

      {showUpcoming && (
      <div>
        <SectionLabel darkMode={darkMode}>Coming up</SectionLabel>
        <div className="space-y-2">
          {sprints.length === 0 ? (
            <p
              className={`text-[12px] ${
                darkMode ? "text-slate-500" : "text-slate-400"
              }`}
            >
              No upcoming sprints.
            </p>
          ) : (
            sprints.map((sprint, i) => {
              const { time, meridiem } = formatTime(
                sprint.dueDate ?? sprint.startDate,
              );
              return (
                <UpcomingItem
                  key={sprint.id}
                  meridiem={meridiem}
                  time={time}
                  title={sprint.name}
                  subtitle={sprintSubtitle(sprint)}
                  highlight={sprint.status === "active" || i === 0}
                  darkMode={darkMode}
                />
              );
            })
          )}
        </div>
      </div>
      )}
    </aside>
  );
}

export default AgendaSidebar;
