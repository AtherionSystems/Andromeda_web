import { useEffect } from "react";
import { useTheme } from "../../../contexts/useTheme";

interface Props {
  label: string;
  onConfirm: () => void;
  onCancel: () => void;
  busy?: boolean;
}

function ConfirmDeleteDialog({ label, onConfirm, onCancel, busy }: Props) {
  const { darkMode } = useTheme();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-[1px] p-4"
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-[360px] rounded-lg p-6 text-center shadow-2xl ${
          darkMode ? "bg-slate-900 text-slate-100" : "bg-white text-slate-800"
        }`}
      >
        <div
          className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full ${
            darkMode ? "bg-red-500/15" : "bg-red-50"
          }`}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#c74634"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
          </svg>
        </div>
        <h3 className="mb-1 text-base font-semibold">Delete {label}?</h3>
        <p className={`mb-5 text-sm ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
          This action cannot be undone.
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className={`flex-1 rounded py-2 text-[12px] font-semibold uppercase tracking-wide transition-colors ${
              darkMode
                ? "bg-slate-700 text-slate-200 hover:bg-slate-600"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            style={{ background: "#c74634" }}
            className="flex-1 rounded py-2 text-[12px] font-semibold uppercase tracking-wide text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {busy ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDeleteDialog;
