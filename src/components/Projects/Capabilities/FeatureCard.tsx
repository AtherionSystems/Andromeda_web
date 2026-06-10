import { useState } from "react";
import { useTheme } from "../../../contexts/useTheme";
import type { Feature } from "./types";
import { Chevron } from "./shared";
import { FEAT_STATUS_STYLES, PRIORITY_COLOR } from "./styles";
import StoryRow from "./StoryRow";

interface Props {
  feature: Feature;
  // Called when the user clicks "+ ADD STORY" — wire to your insert flow.
  onAddStory?: (featureId: string) => void;
}

function FeatureCard({ feature, onAddStory }: Props) {
  const { darkMode } = useTheme();
  const [open, setOpen] = useState(feature.status === "IN PROGRESS");

  return (
    <div
      className={`rounded-lg border-l-4 border border-l-[#3a7fa0] ${
        darkMode ? "bg-slate-800 border-slate-700" : "bg-[#dceaf4] border-[#bcd6e8]"
      }`}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 px-3 py-3 text-left"
      >
        <span className={darkMode ? "text-slate-400" : "text-slate-400"}>
          <Chevron open={open} />
        </span>
        <div className="min-w-0 flex-1">
          <p className={`truncate text-[13px] font-semibold ${darkMode ? "text-slate-100" : "text-slate-800"}`}>
            {feature.name}
          </p>
          <p className={`text-[11px] ${darkMode ? "text-slate-400" : "text-slate-400"}`}>
            Prio:{" "}
            <span style={{ color: PRIORITY_COLOR[feature.priority] }} className="font-semibold">
              {feature.priority}
            </span>
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-0.5 text-[9px] font-semibold tracking-wide ${FEAT_STATUS_STYLES[feature.status]}`}
        >
          {feature.status}
        </span>
      </button>

      {open && (
        <div className="space-y-2 px-3 pb-3 pl-9">
          {feature.stories.map((story) => (
            <StoryRow key={story.id} story={story} />
          ))}
          <button
            type="button"
            onClick={() => onAddStory?.(feature.id)}
            className={`flex items-center gap-1 text-[11px] font-semibold tracking-wide ${
              darkMode ? "text-slate-400 hover:text-slate-200" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            + ADD STORY
          </button>
        </div>
      )}
    </div>
  );
}

export default FeatureCard;
