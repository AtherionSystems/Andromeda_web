import { useState } from "react";
import { useTheme } from "../../../contexts/useTheme";
import type { Capability } from "./types";
import { Chevron } from "./shared";
import FeatureCard from "./FeatureCard";

interface Props {
  capability: Capability;
  defaultOpen?: boolean;
  // Wire these to your insert flows.
  onAddFeature?: (capabilityId: string) => void;
  onAddStory?: (capabilityId: string, featureId: string) => void;
  // Called the first time a feature is expanded, to lazy-load its stories.
  onExpandFeature?: (capabilityId: string, featureId: string) => void;
  // Feature ids whose stories are currently loading.
  loadingStoryIds?: Set<string>;
}

function CapabilityCard({
  capability,
  defaultOpen,
  onAddFeature,
  onAddStory,
  onExpandFeature,
  loadingStoryIds,
}: Props) {
  const { darkMode } = useTheme();
  const [open, setOpen] = useState(Boolean(defaultOpen));
  const featureCount = capability.features.length;
  const storyCount = capability.features.reduce((n, f) => n + f.stories.length, 0);

  return (
    <div
      className={`overflow-hidden rounded-lg border-l-4 border border-l-[#1a3a4a] ${
        darkMode ? "bg-slate-800/40 border-slate-700" : "bg-[#bcd9eb] border-[#9cc6df]"
      }`}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
      >
        <div className="min-w-0 flex-1">
          <p className={`text-[10px] font-semibold uppercase tracking-[1.2px] ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
            Capability
          </p>
          <p className={`truncate text-[14px] font-semibold ${darkMode ? "text-slate-100" : "text-slate-800"}`}>
            {capability.name}
          </p>
          <p className={`mt-1 text-[11px] ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
            {featureCount} Features · {storyCount} Stories
          </p>
        </div>
        <span className={darkMode ? "text-slate-400" : "text-slate-400"}>
          <Chevron open={open} />
        </span>
      </button>

      {open && (
        <div className="space-y-3 px-4 pb-4 pl-10">
          {capability.features.map((feature) => (
            <FeatureCard
              key={feature.id}
              feature={feature}
              onAddStory={onAddStory ? (featureId) => onAddStory(capability.id, featureId) : undefined}
              onExpand={onExpandFeature ? () => onExpandFeature(capability.id, feature.id) : undefined}
              loadingStories={loadingStoryIds?.has(feature.id)}
            />
          ))}
          <button
            type="button"
            onClick={() => onAddFeature?.(capability.id)}
            className={`flex items-center gap-1 text-[11px] font-semibold tracking-wide ${
              darkMode ? "text-slate-400 hover:text-slate-200" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            + ADD FEATURE
          </button>
        </div>
      )}
    </div>
  );
}

export default CapabilityCard;
