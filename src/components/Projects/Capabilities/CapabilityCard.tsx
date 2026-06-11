import { useState } from "react";
import { useTheme } from "../../../contexts/useTheme";
import { deleteCapability } from "../../../api/capabilities";
import type { Capability, Feature, Story } from "./types";
import { Chevron } from "./shared";
import FeatureCard from "./FeatureCard";
import EditCapabilityModal from "./EditCapabilityModal";
import ConfirmDeleteDialog from "./ConfirmDeleteDialog";

interface Props {
  capability: Capability;
  defaultOpen?: boolean;
  projectId: number;
  onAddFeature?: (capabilityId: string) => void;
  onAddStory?: (capabilityId: string, featureId: string) => void;
  onExpandFeature?: (capabilityId: string, featureId: string) => void;
  loadingStoryIds?: Set<string>;
  onEdited?: (updated: Capability) => void;
  onDeleted?: (capabilityId: string) => void;
  onFeatureEdited?: (capabilityId: string, feature: Feature) => void;
  onFeatureDeleted?: (capabilityId: string, featureId: string) => void;
  onStoryEdited?: (capabilityId: string, featureId: string, story: Story) => void;
  onStoryDeleted?: (capabilityId: string, featureId: string, storyId: string) => void;
}

function CapabilityCard({
  capability,
  defaultOpen,
  projectId,
  onAddFeature,
  onAddStory,
  onExpandFeature,
  loadingStoryIds,
  onEdited,
  onDeleted,
  onFeatureEdited,
  onFeatureDeleted,
  onStoryEdited,
  onStoryDeleted,
}: Props) {
  const { darkMode } = useTheme();
  const [open, setOpen] = useState(Boolean(defaultOpen));
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const featureCount = capability.features.length;
  const storyCount = capability.features.reduce((n, f) => n + f.stories.length, 0);

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteCapability(projectId, capability.id);
      onDeleted?.(capability.id);
    } catch (err) {
      console.error("Failed to delete capability:", err);
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
    }
  }

  const iconBtn = `flex h-7 w-7 items-center justify-center rounded transition-colors ${
    darkMode
      ? "text-slate-500 hover:text-slate-300 hover:bg-slate-700"
      : "text-slate-400 hover:text-slate-700 hover:bg-white/60"
  }`;

  return (
    <>
      <div
        className={`overflow-hidden rounded-lg border-l-4 border border-l-[#1a3a4a] ${
          darkMode ? "bg-slate-800/40 border-slate-700" : "bg-[#bcd9eb] border-[#9cc6df]"
        }`}
      >
        <div className="flex w-full items-center gap-3 px-4 py-3.5">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            className="min-w-0 flex-1 text-left"
          >
            <p className={`text-[10px] font-semibold uppercase tracking-[1.2px] ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
              Capability
            </p>
            <p className={`truncate text-[14px] font-semibold ${darkMode ? "text-slate-100" : "text-slate-800"}`}>
              {capability.name}
            </p>
            <p className={`mt-1 text-[11px] ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
              {featureCount} Features · {storyCount} Stories
            </p>
          </button>

          <div className="flex shrink-0 items-center gap-0.5">
            <button type="button" onClick={() => setEditOpen(true)} aria-label="Edit capability" className={iconBtn}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
            <button type="button" onClick={() => setDeleteOpen(true)} aria-label="Delete capability" className={iconBtn}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
              </svg>
            </button>
            <span className={`ml-1 ${darkMode ? "text-slate-400" : "text-slate-400"}`}>
              <Chevron open={open} />
            </span>
          </div>
        </div>

        {open && (
          <div className="space-y-3 px-4 pb-4 pl-10">
            {capability.features.map((feature) => (
              <FeatureCard
                key={feature.id}
                feature={feature}
                projectId={projectId}
                capabilityId={capability.id}
                onAddStory={
                  onAddStory
                    ? (featureId) => onAddStory(capability.id, featureId)
                    : undefined
                }
                onExpand={
                  onExpandFeature
                    ? () => onExpandFeature(capability.id, feature.id)
                    : undefined
                }
                loadingStories={loadingStoryIds?.has(feature.id)}
                onEdited={(updated) => onFeatureEdited?.(capability.id, updated)}
                onDeleted={(featId) => onFeatureDeleted?.(capability.id, featId)}
                onStoryEdited={(story) => onStoryEdited?.(capability.id, feature.id, story)}
                onStoryDeleted={(storyId) => onStoryDeleted?.(capability.id, feature.id, storyId)}
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

      {editOpen && (
        <EditCapabilityModal
          projectId={projectId}
          capability={capability}
          onClose={() => setEditOpen(false)}
          onSaved={(updated) => {
            onEdited?.(updated);
            setEditOpen(false);
          }}
        />
      )}

      {deleteOpen && (
        <ConfirmDeleteDialog
          label="this capability"
          onConfirm={handleDelete}
          onCancel={() => setDeleteOpen(false)}
          busy={deleting}
        />
      )}
    </>
  );
}

export default CapabilityCard;
