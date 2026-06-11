import { useTheme } from "../../../contexts/useTheme";
import type { Story } from "./types";
import { Avatar, DragHandle } from "./shared";

function StoryRow({ story }: { story: Story }) {
  const { darkMode } = useTheme();
  const meta = [story.status, story.priority].filter(Boolean).join(" · ");

  return (
    <div
      className={`flex items-start gap-3 rounded-md border-l-4 border border-l-[#9cc4dc] px-3 py-2.5 ${
        darkMode ? "bg-slate-800/60 border-slate-700" : "bg-[#f6fafd] border-[#e6f0f7]"
      }`}
    >
      <div className="min-w-0 flex-1">
        <p className={`text-[10px] font-semibold uppercase tracking-[1.2px] ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
          User Story
        </p>
        <p className={`text-[13px] leading-snug ${darkMode ? "text-slate-200" : "text-slate-700"}`}>
          {story.title}
        </p>
        {meta && (
          <p
            className={`mt-1 text-[10px] font-semibold tracking-[1px] capitalize ${
              darkMode ? "text-slate-500" : "text-slate-400"
            }`}
          >
            {meta.replace(/_/g, " ")}
          </p>
        )}
      </div>

      {typeof story.storyPoints === "number" && (
        <span
          className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold ${
            darkMode ? "bg-slate-700 text-slate-300" : "bg-slate-100 text-slate-500"
          }`}
        >
          {story.storyPoints} pts
        </span>
      )}

      {story.assignee && (
        <Avatar initials={story.assignee.initials} color={story.assignee.color} />
      )}
      <span className={darkMode ? "text-slate-600" : "text-slate-300"}>
        <DragHandle />
      </span>
    </div>
  );
}

export default StoryRow;
