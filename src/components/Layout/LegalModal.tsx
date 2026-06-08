import { useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useTheme } from "../../contexts/useTheme";
import { useClickOutside } from "../../hooks/useClickOutside";

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Markdown source to render inside the scrollable body. */
  content: string;
}

function LegalModal({ isOpen, onClose, content }: LegalModalProps) {
  const { darkMode } = useTheme();
  const modalRef = useRef<HTMLDivElement>(null);

  useClickOutside(modalRef, isOpen, onClose);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] px-4">
      {/* Fixed card — only the inner body scrolls */}
      <div
        ref={modalRef}
        className={`relative flex w-full max-w-[760px] max-h-[85vh] flex-col rounded-lg shadow-2xl transition-colors ${
          darkMode ? "bg-slate-900 text-slate-100" : "bg-white text-slate-800"
        }`}
      >
        {/* Close */}
        <button
          onClick={onClose}
          aria-label="Close"
          className={`absolute top-4 right-5 z-10 text-xl leading-none transition-colors ${
            darkMode
              ? "text-slate-500 hover:text-slate-200"
              : "text-slate-400 hover:text-slate-700"
          }`}
        >
          ✕
        </button>

        {/* Scrollable body */}
        <div className="overflow-y-auto px-8 py-7">
          <article
            className={`legal-prose ${darkMode ? "legal-prose-dark" : ""}`}
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
          </article>
        </div>
      </div>
    </div>
  );
}

export default LegalModal;
