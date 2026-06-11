import { useEffect, useState } from "react";
import { useTheme } from "../../contexts/useTheme";
import type {
  ApiTask,
  TaskStatus,
  TaskPriority,
  ApiProjectMember,
} from "../../types/api";
import type { Member } from "../../types/project";
import { updateTask, assignTask, unassignTask, getTaskAssignments } from "../../api/tasks";
import { getProjectMembers } from "../../api/members";
import MemberAvatars from "../Projects/MemberAvatars";

const STATUS_META: Record<
  string,
  { label: string; subtitle: string; color: string; icon: string }
> = {
  todo: { label: "TO DO", subtitle: "Not Started", color: "#94a3b8", icon: "○" },
  in_progress: {
    label: "IN PROGRESS",
    subtitle: "Active Development",
    color: "#f97316",
    icon: "↻",
  },
  review: {
    label: "IN REVIEW",
    subtitle: "Under Review",
    color: "#3b82f6",
    icon: "◎",
  },
  done: { label: "DONE", subtitle: "Completed", color: "#22c55e", icon: "✓" },
};

const PRIORITY_META: Record<
  string,
  { label: string; subtitle: string; color: string }
> = {
  critical: { label: "CRITICAL", subtitle: "High Urgency", color: "#C74634" },
  high: { label: "HIGH", subtitle: "High Priority", color: "#FFB13F" },
  medium: { label: "MEDIUM", subtitle: "Moderate", color: "#00688C" },
  low: { label: "LOW", subtitle: "Low Priority", color: "#8FBFD0" },
};

const STATUS_OPTIONS: TaskStatus[] = ["todo", "in_progress", "review", "done"];
const PRIORITY_OPTIONS: TaskPriority[] = ["low", "medium", "high", "critical"];

interface BacklogDetailsProps {
  task: ApiTask;
  members: Member[];
  onClose: () => void;
  // Show the edit controls (e.g. for the PO).
  canEdit?: boolean;
  // Called after a successful save so the board can refresh.
  onSaved?: (task: ApiTask) => void;
  // Called after assignees change so the board can refresh.
  onAssigneesChanged?: () => void;
}

function BacklogDetails({
  task,
  members,
  onClose,
  canEdit = false,
  onSaved,
  onAssigneesChanged,
}: BacklogDetailsProps) {
  const { darkMode } = useTheme();

  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [priority, setPriority] = useState<TaskPriority>(task.priority);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Assignee editing (project members can be assigned to the task).
  const [projectMembers, setProjectMembers] = useState<ApiProjectMember[]>([]);
  const [showAssignPicker, setShowAssignPicker] = useState(false);
  const [assignBusy, setAssignBusy] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);

  // Reset the form when switching to a different task.
  useEffect(() => {
    setEditing(false);
    setTitle(task.title);
    setDescription(task.description ?? "");
    setStatus(task.status);
    setPriority(task.priority);
    setError(null);
    setShowAssignPicker(false);
    setAssignError(null);
  }, [task.id, task.title, task.description, task.status, task.priority]);

  // Load the project's members — only they can be assigned to the task.
  useEffect(() => {
    if (!canEdit || task.projectId == null) return;
    getProjectMembers({ projectId: task.projectId })
      .then(setProjectMembers)
      .catch(() => setProjectMembers([]));
  }, [canEdit, task.projectId, task.id]);

  // Whether the given user is currently assigned to the task (fresh read).
  async function assignmentExists(userId: number): Promise<boolean> {
    if (task.projectId == null) return false;
    try {
      const fresh = await getTaskAssignments(task.projectId, task.id);
      return fresh.some((a) => a.userId === userId);
    } catch {
      return false;
    }
  }

  async function handleAssign(userId: number) {
    if (task.projectId == null) return;
    setAssignBusy(true);
    setAssignError(null);
    try {
      await assignTask(task.projectId, task.id, userId);
      setShowAssignPicker(false);
      onAssigneesChanged?.();
    } catch (err) {
      // The backend can 500 on the response while still saving — only surface
      // the error if the assignment really didn't persist.
      if (await assignmentExists(userId)) {
        setShowAssignPicker(false);
        onAssigneesChanged?.();
      } else {
        console.error("Failed to assign user:", err);
        setAssignError(
          err instanceof Error ? err.message : "Could not assign this user.",
        );
      }
    } finally {
      setAssignBusy(false);
    }
  }

  async function handleUnassign(member: Member) {
    const pm = projectMembers.find((p) => p.username === member.name);
    if (pm == null || task.projectId == null) {
      setAssignError("Could not resolve this user to unassign.");
      return;
    }
    setAssignBusy(true);
    setAssignError(null);
    try {
      await unassignTask(task.projectId, task.id, pm.userId);
      onAssigneesChanged?.();
    } catch (err) {
      // Same resilience: if it actually got removed, treat as success.
      if (!(await assignmentExists(pm.userId))) {
        onAssigneesChanged?.();
      } else {
        console.error("Failed to unassign user:", err);
        setAssignError(
          err instanceof Error ? err.message : "Could not remove this user.",
        );
      }
    } finally {
      setAssignBusy(false);
    }
  }

  function startEdit() {
    setTitle(task.title);
    setDescription(task.description ?? "");
    setStatus(task.status);
    setPriority(task.priority);
    setError(null);
    setEditing(true);
  }

  function cancelEdit() {
    setEditing(false);
    setError(null);
  }

  async function handleSave() {
    if (task.projectId == null) {
      setError("This task has no project, so it can't be edited.");
      return;
    }
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      // Send "" (not null) so an emptied description actually clears — the
      // backend ignores null fields and keeps their current value.
      const updated = await updateTask(task.projectId, task.id, {
        title: title.trim(),
        description: description.trim(),
        status,
        priority,
      });
      // Preserve client-side enrichment that the API response omits.
      onSaved?.({
        ...task,
        ...updated,
        projectId: task.projectId,
        projectName: task.projectName,
      });
      setEditing(false);
    } catch (err) {
      console.error("Failed to update task:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Could not save changes. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  const statusMeta = STATUS_META[task.status] ?? STATUS_META.todo;
  const priorityMeta = PRIORITY_META[task.priority] ?? {
    label: task.priority.toUpperCase(),
    subtitle: "",
    color: "#94a3b8",
  };

  // Project members not yet assigned to this task — the "+ Add" options.
  const assignedNames = new Set(members.map((m) => m.name));
  const availableMembers = projectMembers.filter(
    (pm) => !assignedNames.has(pm.username),
  );

  const fieldClass = `w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c74634]/30 focus:border-[#c74634] transition-colors ${darkMode ? "bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500" : "bg-white border-slate-300 text-slate-800 placeholder:text-slate-400"}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[1px] p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className={`relative w-full max-w-[920px] min-h-[400px] rounded-lg shadow-2xl flex ${darkMode ? "bg-slate-900 text-slate-100" : "bg-white text-slate-800"}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top-right actions */}
        <div className="absolute top-4 right-5 z-10 flex items-center gap-3">
          {canEdit && !editing && (
            <button
              onClick={startEdit}
              aria-label="Edit task"
              className={`transition-colors ${darkMode ? "text-slate-500 hover:text-slate-200" : "text-slate-400 hover:text-slate-700"}`}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
              </svg>
            </button>
          )}
          <button
            onClick={onClose}
            aria-label="Close"
            className={`text-2xl leading-none transition-colors ${darkMode ? "text-slate-500 hover:text-slate-200" : "text-slate-400 hover:text-slate-700"}`}
          >
            ✕
          </button>
        </div>

        {/* Left column */}
        <div className="flex-1 p-8 min-w-0">
          {editing ? (
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
              className={`${fieldClass} mb-1 pr-8 text-lg font-medium`}
            />
          ) : (
            <h2
              className={`text-2xl bold mb-1 pr-16 ${darkMode ? "text-slate-100" : "text-slate-800"}`}
            >
              {task.title}
            </h2>
          )}
          <p
            className={`text-[10px] tracking-[1.2px] uppercase font-semibold mb-6 ${darkMode ? "text-slate-500" : "text-slate-400"}`}
          >
            {task.projectName || `Project #${task.projectId ?? "N/A"}`}
          </p>

          <p
            className={`text-[10px] tracking-[1.2px] uppercase font-semibold mb-1.5 ${darkMode ? "text-slate-400" : "text-slate-500"}`}
          >
            Task Description
          </p>
          {editing ? (
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the task."
              rows={8}
              className={`${fieldClass} resize-none min-h-[160px]`}
            />
          ) : (
            <div
              className={`rounded border px-3 py-2.5 text-sm min-h-[160px] ${darkMode ? "bg-slate-800 border-slate-700 text-slate-300" : "bg-[#f5f5f5] border-transparent text-slate-600"}`}
            >
              {task.description || (
                <span className={darkMode ? "text-slate-500" : "text-slate-400"}>
                  No description available.
                </span>
              )}
            </div>
          )}

          <p
            className={`text-[10px] tracking-[1.2px] uppercase font-semibold mt-5 mb-1.5 ${darkMode ? "text-slate-400" : "text-slate-500"}`}
          >
            Assignees
          </p>
          {editing ? (
            <div>
              <div className="flex flex-wrap items-center gap-2">
                {members.map((m) => (
                  <span
                    key={m.name}
                    className={`inline-flex items-center gap-1.5 rounded-full py-0.5 pl-0.5 pr-2 ${darkMode ? "bg-slate-800" : "bg-slate-100"}`}
                  >
                    <span
                      className="flex h-5 w-5 items-center justify-center rounded-full text-[8px] font-semibold text-white"
                      style={{ backgroundColor: m.color }}
                    >
                      {m.initials}
                    </span>
                    <span className={`text-[11px] ${darkMode ? "text-slate-200" : "text-slate-600"}`}>
                      {m.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleUnassign(m)}
                      disabled={assignBusy}
                      aria-label={`Remove ${m.name}`}
                      className="ml-0.5 text-sm leading-none opacity-60 transition-opacity hover:opacity-100 disabled:opacity-30"
                    >
                      ×
                    </button>
                  </span>
                ))}
                {members.length === 0 && (
                  <span className={`text-xs ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
                    No assignees
                  </span>
                )}
              </div>

              <div className="relative mt-3">
                  <button
                    type="button"
                    onClick={() => setShowAssignPicker((o) => !o)}
                    disabled={assignBusy || availableMembers.length === 0}
                    style={{ background: "#c74634" }}
                    className="inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-[13px] font-semibold text-white shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M19 8v6M22 11h-6" />
                    </svg>
                    Add assignee
                  </button>
                  {showAssignPicker && availableMembers.length > 0 && (
                    <ul
                      className={`absolute z-10 mt-1 max-h-40 w-52 overflow-y-auto rounded-md border shadow-lg ${darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}
                    >
                      {availableMembers.map((pm) => (
                        <li key={pm.userId}>
                          <button
                            type="button"
                            onClick={() => handleAssign(pm.userId)}
                            disabled={assignBusy}
                            className={`w-full px-3 py-2 text-left text-[12px] transition-colors ${darkMode ? "text-slate-200 hover:bg-slate-700" : "text-slate-700 hover:bg-slate-50"}`}
                          >
                            {pm.username}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              {assignError && <p className="mt-2 text-xs text-red-500">{assignError}</p>}
            </div>
          ) : members.length === 0 ? (
            <p className={`text-xs ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
              No assignees
            </p>
          ) : (
            <MemberAvatars members={members} max={members.length} />
          )}

          {editing && (
            <div className="mt-6">
              {error && <p className="mb-2 text-xs text-red-500">{error}</p>}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  style={{ background: "#c74634" }}
                  className="rounded px-4 py-2 text-[13px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save changes"}
                </button>
                <button
                  onClick={cancelEdit}
                  disabled={saving}
                  className={`rounded px-4 py-2 text-[13px] font-medium transition-colors disabled:opacity-60 ${darkMode ? "text-slate-300 hover:bg-slate-800" : "text-slate-600 hover:bg-slate-100"}`}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div
          className={`w-px self-stretch ${darkMode ? "bg-slate-700" : "bg-slate-100"}`}
        />

        {/* Right column — edit mode: status & priority selects */}
        {editing && (
          <div className="flex flex-col gap-4 p-6 justify-center min-w-[220px]">
            <div>
              <label
                className={`mb-1.5 block text-[9px] font-bold tracking-[1.4px] uppercase ${darkMode ? "text-slate-400" : "text-slate-500"}`}
              >
                Current Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className={fieldClass}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_META[s].label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                className={`mb-1.5 block text-[9px] font-bold tracking-[1.4px] uppercase ${darkMode ? "text-slate-400" : "text-slate-500"}`}
              >
                Priority Level
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className={fieldClass}
              >
                {PRIORITY_OPTIONS.map((p) => (
                  <option key={p} value={p}>
                    {PRIORITY_META[p].label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Right column — read mode: status & priority cards */}
        {!editing && (
          <div className="flex flex-col gap-3 p-6 justify-center min-w-[200px]">
            {/* Status card */}
            <div
              className={`flex items-center gap-4 rounded-lg p-4 ${darkMode ? "bg-slate-800" : "bg-slate-50"}`}
            >
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xl text-white"
                style={{ backgroundColor: statusMeta.color }}
              >
                {statusMeta.icon}
              </div>
              <div>
                <p
                  className={`text-[9px] font-bold tracking-[1.4px] uppercase mb-0.5 ${darkMode ? "text-slate-400" : "text-slate-400"}`}
                >
                  Current Status
                </p>
                <p
                  className="text-sm font-bold tracking-wide"
                  style={{ color: statusMeta.color }}
                >
                  {statusMeta.label}
                </p>
                <p
                  className={`text-[10px] mt-0.5 ${darkMode ? "text-slate-400" : "text-slate-400"}`}
                >
                  {statusMeta.subtitle}
                </p>
              </div>
            </div>

            {/* Priority card */}
            <div
              className={`flex items-center gap-4 rounded-lg p-4 ${darkMode ? "bg-slate-800" : "bg-slate-50"}`}
            >
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xl font-bold text-white"
                style={{ backgroundColor: priorityMeta.color }}
              >
                !
              </div>
              <div>
                <p
                  className={`text-[9px] font-bold tracking-[1.4px] uppercase mb-0.5 ${darkMode ? "text-slate-400" : "text-slate-400"}`}
                >
                  Priority Level
                </p>
                <p
                  className="text-sm font-bold tracking-wide"
                  style={{ color: priorityMeta.color }}
                >
                  {priorityMeta.label}
                </p>
                <p
                  className={`text-[10px] mt-0.5 ${darkMode ? "text-slate-400" : "text-slate-400"}`}
                >
                  {priorityMeta.subtitle}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default BacklogDetails;
