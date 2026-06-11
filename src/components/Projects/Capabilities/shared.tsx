// Small presentational helpers shared across the capability hierarchy.

export function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`transition-transform duration-200 ${open ? "rotate-90" : ""}`}
    >
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

export function DragHandle() {
  return (
    <svg width="12" height="16" viewBox="0 0 12 16" fill="currentColor" aria-hidden="true">
      {[3, 8, 13].map((cy) =>
        [3, 9].map((cx) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="1.2" />),
      )}
    </svg>
  );
}

export function Avatar({ initials, color }: { initials: string; color: string }) {
  return (
    <span
      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[9px] font-semibold text-white"
      style={{ backgroundColor: color }}
    >
      {initials}
    </span>
  );
}
