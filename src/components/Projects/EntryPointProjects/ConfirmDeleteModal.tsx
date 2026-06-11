import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useTheme } from "../../../contexts/useTheme";

interface ConfirmDeleteModalProps {
  projectName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

// Small confirmation popup shown before deleting a project.
function ConfirmDeleteModal({ projectName, onConfirm, onCancel }: ConfirmDeleteModalProps) {
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
        {/* Cancel — top-right */}
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

        {/* Warning sign */}
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

        <h3 className="mb-1 text-lg font-semibold">Delete project?</h3>
        <p className={`mb-6 text-sm ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
          "{projectName}" will be permanently deleted. This action cannot be undone.
        </p>

        <button
          type="button"
          onClick={onConfirm}
          style={{ background: "#c74634" }}
          className="w-full rounded py-2.5 text-[13px] font-semibold uppercase tracking-wide text-white transition-opacity hover:opacity-90"
        >
          Delete
        </button>
      </div>
    </div>,
    document.body,
  );
}

export default ConfirmDeleteModal;
