// src/components/Projects/NewSprintModal.tsx
import { useEffect, useRef, useState } from "react";
import { useTheme } from "../../../contexts/useTheme";
import { useClickOutside } from "../../../hooks/useClickOutside";
import { createSprint } from "../../../api/projects";
import type { ApiProject, ApiSprint } from "../../../types/api";
import { Calendar } from "@/components/ui/calendar";

interface Props {
  isOpen: boolean;
  project: ApiProject;
  onClose: () => void;
  onCreated: (sprint: ApiSprint) => void;
}

// LocalDateTime string without timezone — backend expects "2026-06-09T10:00:00"
function toLocalDateTime(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

type ActiveCalendar = "start" | "end" | null;

function NewSprintModal({ isOpen, project, onClose, onCreated }: Props) {
  const { darkMode } = useTheme();
  const modalRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [activeCalendar, setActiveCalendar] = useState<ActiveCalendar>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Escape + scroll-lock + focus
  useEffect(() => {
    if (!isOpen) return;
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
    };
  }, [isOpen]);

  // Reset on close
  useEffect(() => {
    if (isOpen) return;
    setName("");
    setGoal("");
    setStartDate(undefined);
    setEndDate(undefined);
    setActiveCalendar(null);
    setError(null);
    setSubmitting(false);
  }, [isOpen]);

  useClickOutside(modalRef, isOpen, onClose);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Sprint name is required.");
      return;
    }
    if (startDate && endDate && endDate < startDate) {
      setError("End date must be after start date.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const sprint = await createSprint(project.id, {
        name: name.trim(),
        goal: goal.trim() || null,
        status: "planned",
        startDate: startDate ? toLocalDateTime(startDate) : null,
        dueDate: endDate ? toLocalDateTime(endDate) : null,
      });
      onCreated(sprint);
      onClose();
    } catch {
      setError(
        "Failed to create sprint. Please check the fields and try again.",
      );
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

  const dateButtonClass = (active: boolean) =>
    `w-full rounded border px-3 py-2.5 text-sm text-left transition-colors focus:outline-none focus:ring-2 focus:ring-[#C74634]/30 focus:border-[#C74634] ${
      active
        ? "border-[#C74634] ring-2 ring-[#C74634]/30"
        : darkMode
          ? "bg-slate-800 border-slate-700 text-slate-100"
          : "bg-[#f5f5f5] border-transparent text-slate-700"
    } ${darkMode ? "bg-slate-800 text-slate-100" : "bg-[#f5f5f5] text-slate-700"}`;

  const fmtDate = (d: Date | undefined) =>
    d
      ? d.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "Select date";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[1px] px-4">
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-sprint-title"
        className={`relative w-full max-w-[820px] rounded-lg shadow-2xl transition-colors ${
          darkMode ? "bg-slate-900 text-slate-100" : "bg-white text-slate-800"
        }`}
      >
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className={`absolute top-4 right-5 leading-none transition-colors z-10 ${
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

        <div className="flex">
          {/* ── Form column ── */}
          <div className="flex-1 p-8 min-w-0">
            <h2
              id="new-sprint-title"
              className={`text-2xl font-semibold mb-1 ${darkMode ? "text-slate-100" : "text-slate-800"}`}
            >
              New Sprint
            </h2>
            <p
              className={`text-[10px] tracking-[1.2px] uppercase font-semibold mb-5 ${darkMode ? "text-slate-500" : "text-slate-400"}`}
            >
              {project.name}
            </p>

            <form onSubmit={handleSubmit}>
              {/* Name */}
              <div className="mb-4">
                <label className={labelClass}>Sprint Name</label>
                <input
                  ref={nameInputRef}
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sprint 8 — Auth Module"
                  maxLength={255}
                  className={inputClass}
                />
              </div>

              {/* Goal */}
              <div className="mb-4">
                <label className={labelClass}>Sprint Goal</label>
                <textarea
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="What should this sprint achieve?"
                  rows={3}
                  className={`${inputClass} resize-none`}
                />
              </div>

              {/* Date pickers — toggle calendar panel on the right */}
              <div className="mb-6 grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Start Date</label>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveCalendar((p) => (p === "start" ? null : "start"))
                    }
                    className={dateButtonClass(activeCalendar === "start")}
                  >
                    <span
                      className={
                        startDate
                          ? darkMode
                            ? "text-slate-100"
                            : "text-slate-800"
                          : darkMode
                            ? "text-slate-500"
                            : "text-slate-400"
                      }
                    >
                      {fmtDate(startDate)}
                    </span>
                  </button>
                </div>
                <div>
                  <label className={labelClass}>End Date</label>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveCalendar((p) => (p === "end" ? null : "end"))
                    }
                    className={dateButtonClass(activeCalendar === "end")}
                  >
                    <span
                      className={
                        endDate
                          ? darkMode
                            ? "text-slate-100"
                            : "text-slate-800"
                          : darkMode
                            ? "text-slate-500"
                            : "text-slate-400"
                      }
                    >
                      {fmtDate(endDate)}
                    </span>
                  </button>
                </div>
              </div>

              {error && <p className="mb-4 text-xs text-red-500">{error}</p>}

              <button
                type="submit"
                disabled={submitting}
                style={{ background: "#C74634" }}
                className="w-full py-3.5 text-white text-[12px] font-semibold tracking-[1.5px] uppercase rounded hover:opacity-90 transition-opacity disabled:opacity-60 cursor-pointer"
              >
                {submitting ? "Creating..." : "Create Sprint"}
              </button>
            </form>
          </div>

          {/* ── Divider ── */}
          <div
            className={`w-px self-stretch ${darkMode ? "bg-slate-700" : "bg-slate-100"}`}
          />

          {/* ── Calendar column ── */}
          <div className="flex flex-col p-6 justify-start min-w-[260px]">
            {activeCalendar === null ? (
              <div className="flex flex-col items-center justify-center h-full gap-3">
                <svg
                  width="36"
                  height="36"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  className={darkMode ? "text-slate-700" : "text-slate-300"}
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <p
                  className={`text-[11px] text-center ${darkMode ? "text-slate-600" : "text-slate-400"}`}
                >
                  Click a date field
                  <br />
                  to open the calendar
                </p>
              </div>
            ) : (
              <>
                <p
                  className={`text-[10px] tracking-[1.2px] uppercase font-semibold mb-3 ${darkMode ? "text-slate-400" : "text-slate-500"}`}
                >
                  {activeCalendar === "start" ? "Start Date" : "End Date"}
                </p>

                {/* Selected date label */}
                {(activeCalendar === "start" ? startDate : endDate) && (
                  <p
                    className="text-[11px] mb-2 font-medium"
                    style={{ color: "#C74634" }}
                  >
                    {fmtDate(activeCalendar === "start" ? startDate : endDate)}
                  </p>
                )}

                <Calendar
                  mode="single"
                  selected={activeCalendar === "start" ? startDate : endDate}
                  onSelect={(d) => {
                    if (activeCalendar === "start") {
                      setStartDate(d);
                      // Auto-advance to end date after selecting start
                      setActiveCalendar("end");
                    } else {
                      setEndDate(d);
                      setActiveCalendar(null);
                    }
                  }}
                  disabled={
                    activeCalendar === "end" && startDate
                      ? { before: startDate }
                      : { before: today }
                  }
                  captionLayout="label"
                />

                {/* Clear button */}
                <button
                  type="button"
                  onClick={() => {
                    if (activeCalendar === "start") setStartDate(undefined);
                    else setEndDate(undefined);
                  }}
                  className={`mt-2 text-[11px] underline transition-colors ${darkMode ? "text-slate-500 hover:text-slate-300" : "text-slate-400 hover:text-slate-600"}`}
                >
                  Clear date
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default NewSprintModal;
