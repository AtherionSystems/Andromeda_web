import { useRef, useState, useCallback, useEffect, useMemo } from "react";
import { useTheme } from "../../contexts/useTheme";
import { useClickOutside } from "../../hooks/useClickOutside";
import { createProject } from "../../api/projects";
import { addMember } from "../../api/members";
import { getUsers } from "../../api/auth";
import type { ApiUser } from "../../types/api";
import { Calendar } from "@/components/ui/calendar";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}


//fecha local a UTC sin cambiar el dÃ­a, para evitar que cambie al convertir a otras zonas horarias.
function toDeliveryDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}T00:00:00Z`;
}

function NewProjectModal({ isOpen, onClose, onCreated }: Props) {
  const { darkMode } = useTheme();
  const modalRef = useRef<HTMLDivElement>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [allUsers, setAllUsers] = useState<ApiUser[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<ApiUser[]>([]);
  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const closeDropdown = useCallback(() => setShowDropdown(false), []);
  useClickOutside(modalRef, isOpen, onClose);
  useClickOutside(dropdownRef, showDropdown, closeDropdown);

  const nameInputRef = useRef<HTMLInputElement>(null);

  // Keep a stable reference to the latest onClose for the Escape handler,
  // so the modal effect can depend only on `isOpen`.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // Computed per render so the calendar's min day is always current (cheap,
  // and the modal only renders while open).
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Modal behavior: Escape to close, body scroll-lock, and focus management
  // (move focus into the dialog on open, restore it to the opener on close).
  useEffect(() => {
    if (!isOpen) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseRef.current();
    };
    document.addEventListener("keydown", onKey);
    const raf = requestAnimationFrame(() => nameInputRef.current?.focus());

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      cancelAnimationFrame(raf);
      previouslyFocused?.focus?.();
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    getUsers().then(setAllUsers).catch((err) => console.error("Failed to load users:", err));
  }, [isOpen]);

  const filteredUsers = useMemo(() => {
    const selectedIds = new Set(selectedUsers.map((u) => u.id));
    const q = search.toLowerCase();
    return allUsers.filter(
      (u) =>
        !selectedIds.has(u.id) &&
        (u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.username.toLowerCase().includes(q)),
    );
  }, [allUsers, selectedUsers, search]);

  function selectUser(user: ApiUser) {
    setSelectedUsers((prev) => [...prev, user]);
    setSearch("");
    setShowDropdown(false);
  }

  function removeUser(id: number) {
    setSelectedUsers((prev) => prev.filter((u) => u.id !== id));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Project name is required.");
      return;
    }
    if (!description.trim()) {
      setError("Project description is required.");
      return;
    }
    if (selectedUsers.length === 0) {
      setError("Add at least one team member.");
      return;
    }
    if (!endDate) {
      setError("Delivery date is required.");
      return;
    }

    const endDateStr = toDeliveryDateString(endDate);

    setSubmitting(true);
    setError(null);
    try {
      const project = await createProject({
        name: name.trim(),
        description: description.trim() || null,
        status: "active",
        startDate: new Date().toISOString().split(".")[0] + "Z",
        endDate: endDateStr,
      });

      await Promise.allSettled(
        selectedUsers.map((u) =>
          addMember({ projectId: project.id, userId: u.id, role: "member" }),
        ),
      );

      onCreated();
      onClose();
      setName("");
      setDescription("");
      setEndDate(undefined);
      setSelectedUsers([]);
      setSearch("");
    } catch {
      setError("Failed to create project. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!isOpen) return null;

  const labelClass = `text-[10px] tracking-[1.2px] uppercase font-semibold mb-1.5 block ${
    darkMode ? "text-slate-400" : "text-slate-500"
  }`;

  const inputClass = `w-full rounded border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C74634]/30 focus:border-[#C74634] transition-colors ${
    darkMode
      ? "bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500"
      : "bg-[#f5f5f5] border-transparent text-slate-700 placeholder:text-slate-400"
  }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[1px] px-4">
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-project-title"
        className={`relative w-full max-w-[820px] rounded-lg shadow-2xl transition-colors ${
          darkMode ? "bg-slate-900 text-slate-100" : "bg-white text-slate-800"
        }`}
      >
        {/* cerrar */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className={`absolute top-4 right-5 text-xl leading-none transition-colors z-10 ${
            darkMode
              ? "text-slate-500 hover:text-slate-200"
              : "text-slate-400 hover:text-slate-700"
          }`}
        >
          âœ•
        </button>

        <div className="flex">
          {/* columna izq del form â”€â”€ */}
          <div className="flex-1 p-8 min-w-0">
            <h2
              id="new-project-title"
              className={`text-2xl italic font-light mb-7 ${
                darkMode ? "text-slate-100" : "text-slate-800"
              }`}
            >
              Add New Project
            </h2>

            <form onSubmit={handleSubmit}>
              {/*nombre del proyecto */}
              <div className="mb-4">
                <label className={labelClass}>Project Name</label>
                <input
                  ref={nameInputRef}
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter the project name"
                  className={inputClass}
                />
              </div>

              {/* desc del proyecto*/}
              <div className="mb-4">
                <label className={labelClass}>Project Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the project goals and scope."
                  rows={3}
                  className={`${inputClass} resize-none`}
                />
              </div>

              {/* Team Members */}
              <div className="mb-6">
                <label className={labelClass}>Add Team Members</label>
                <div className="relative" ref={dropdownRef}>
                  <div
                    className={`w-full min-h-[52px] rounded border px-3 py-2 flex flex-wrap gap-1.5 items-center focus-within:ring-2 focus-within:ring-[#C74634]/30 focus-within:border-[#C74634] transition-colors ${
                      darkMode
                        ? "bg-slate-800 border-slate-700"
                        : "bg-[#f5f5f5] border-transparent"
                    }`}
                  >
                    {selectedUsers.map((user) => (
                      <span
                        key={user.id}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] tracking-wide uppercase ${
                          darkMode
                            ? "bg-slate-700 text-slate-300"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {user.email}
                        <button
                          type="button"
                          onClick={() => removeUser(user.id)}
                          className="ml-0.5 opacity-60 hover:opacity-100 text-sm leading-none"
                        >
                          Ã—
                        </button>
                      </span>
                    ))}
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setShowDropdown(true);
                      }}
                      onFocus={() => setShowDropdown(true)}
                      placeholder={
                        selectedUsers.length === 0
                          ? "Search by name or email"
                          : ""
                      }
                      className={`flex-1 min-w-[140px] bg-transparent border-none outline-none text-sm ${
                        darkMode
                          ? "text-slate-100 placeholder:text-slate-500"
                          : "text-slate-700 placeholder:text-slate-400"
                      }`}
                    />
                  </div>

                  {showDropdown && filteredUsers.length > 0 && (
                    <ul
                      className={`absolute z-10 mt-1 w-full rounded border shadow-lg max-h-40 overflow-y-auto ${
                        darkMode
                          ? "bg-slate-800 border-slate-700"
                          : "bg-white border-slate-200"
                      }`}
                    >
                      {filteredUsers.map((user) => (
                        <li key={user.id}>
                          <button
                            type="button"
                            onClick={() => selectUser(user)}
                            className={`w-full text-left px-3 py-2 text-sm flex flex-col transition-colors ${
                              darkMode
                                ? "hover:bg-slate-700 text-slate-100"
                                : "hover:bg-slate-50 text-slate-700"
                            }`}
                          >
                            <span className="font-medium">{user.name}</span>
                            <span className="text-[11px] text-slate-400">
                              {user.email}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {error && <p className="mb-4 text-xs text-red-500">{error}</p>}

              <button
                type="submit"
                disabled={submitting}
                style={{ background: "#C74634" }}
                className="w-full py-3.5 text-white text-[12px] font-semibold tracking-[1.5px] uppercase rounded hover:opacity-90 transition-opacity disabled:opacity-60 cursor-pointer"
              >
                {submitting ? "Creating..." : "Create New Project"}
              </button>
            </form>
          </div>

          {/*divider*/}
          <div
            className={`w-px self-stretch ${
              darkMode ? "bg-slate-700" : "bg-slate-100"
            }`}
          />

          {/* columna de calendario*/}
          <div className="flex flex-col p-6 justify-start">
            <p className={`text-[10px] tracking-[1.2px] uppercase font-semibold mb-3 ${
              darkMode ? "text-slate-400" : "text-slate-500"
            }`}>
              Delivery Date
            </p>

            {endDate && (
              <p className="text-[11px] mb-2 font-medium" style={{ color: "#C74634" }}>
                {endDate.toLocaleDateString("en-GB", {
                  weekday: "short",
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            )}

            <Calendar
              mode="single"
              selected={endDate}
              onSelect={setEndDate}
              disabled={{ before: today }}
              captionLayout="label"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default NewProjectModal;
