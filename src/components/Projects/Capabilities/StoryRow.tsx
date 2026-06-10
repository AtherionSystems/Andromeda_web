import { useTheme } from "../../../contexts/useTheme";
import type { Story } from "./types";
import { Avatar, DragHandle } from "./shared";

function StoryRow({ story }: { story: Story }) {
  const { darkMode } = useTheme();

  return (
    <div
      className={`flex items-start gap-3 rounded-md border-l-4 border border-l-[#9cc4dc] px-3 py-2.5 ${
        darkMode ? "bg-slate-800/60 border-slate-700" : "bg-[#f6fafd] border-[#e6f0f7]"
      }`}
    >
      <div className="min-w-0 flex-1">
        <p
          className={`text-[10px] font-semibold tracking-[1px] ${
            darkMode ? "text-slate-400" : "text-slate-400"
          }`}
        >
          {story.id}
        </p>
        <p className={`mt-1 text-[13px] leading-snug ${darkMode ? "text-slate-200" : "text-slate-700"}`}>
          {story.text}
        </p>
      </div>
      <Avatar initials={story.assignee.initials} color={story.assignee.color} />
      <span className={darkMode ? "text-slate-600" : "text-slate-300"}>
        <DragHandle />
      </span>
    </div>
  );
}

export default StoryRow;
