import { useEffect, useState } from "react";
import { useTheme } from "../../../contexts/useTheme";
import { deleteFeature } from "../../../api/capabilities";
import type { Feature, Story } from "./types";
import { Chevron } from "./shared";
import { FEAT_STATUS_STYLES, PRIORITY_COLOR } from "./styles";
import StoryRow from "./StoryRow";
import EditFeatureModal from "./EditFeatureModal";
import ConfirmDeleteDialog from "./ConfirmDeleteDialog";

interface Props {
  feature: Feature;
  projectId: number;
  capabilityId: string;
  onAddStory?: (featureId: string) => void;
  onExpand?: () => void;
  loadingStories?: boolean;
  onEdited?: (updated: Feature) => void;
  onDeleted?: (featureId: string) => void;
  onStoryEdited?: (story: Story) => void;
  onStoryDeleted?: (storyId: string) => void;
}

function FeatureCard({
  feature,
  projectId,
  capabilityId,
  onAddStory,
  onExpand,
  loadingStories,
  onEdited,
  onDeleted,
  onStoryEdited,
  onStoryDeleted,
}: Props) {
  const { darkMode } = useTheme();
  const [open, setOpen] = useState(feature.status === "active");
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (open) onExpand?.();
  }, [open, onExpand]);

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteFeature(projectId, capabilityId, feature.id);
      onDeleted?.(feature.id);
    } catch (err) {
      console.error("Failed to delete feature:", err);
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
    }
  }

  const iconBtn = `flex h-6 w-6 items-center justify-center rounded transition-colors ${
    darkMode
      ? "text-slate-500 hover:text-slate-300 hover:bg-slate-700"
      : "text-slate-300 hover:text-slate-600 hover:bg-slate-100"
  }`;

  return (
    <>
      <div
        className={`rounded-lg border-l-4 border border-l-[#3a7fa0] ${
          darkMode ? "bg-slate-800 border-slate-700" : "bg-[#dceaf4] border-[#bcd6e8]"
        }`}
      >
        <div className="flex w-full items-center gap-2 px-3 py-3">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            className="flex min-w-0 flex-1 items-center gap-2 text-left"
          >
            <span className={darkMode ? "text-slate-400" : "text-slate-400"}>
              <Chevron open={open} />
            </span>
            <div className="min-w-0 flex-1">
              <p className={`text-[10px] font-semibold uppercase tracking-[1.2px] ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                Feature
              </p>
              <p className={`truncate text-[13px] font-semibold ${darkMode ? "text-slate-100" : "text-slate-800"}`}>
                {feature.name}
              </p>
              {feature.priority && (
                <p className={`text-[11px] ${darkMode ? "text-slate-400" : "text-slate-400"}`}>
                  Prio:{" "}
                  <span style={{ color: PRIORITY_COLOR[feature.priority] }} className="font-semibold">
                    {feature.priority}
                  </span>
                </p>
              )}
            </div>
          </button>

          <div className="flex shrink-0 items-center gap-0.5">
            <button type="button" onClick={() => setEditOpen(true)} aria-label="Edit feature" className={iconBtn}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
            <button type="button" onClick={() => setDeleteOpen(true)} aria-label="Delete feature" className={iconBtn}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
              </svg>
            </button>
            <span
              className={`ml-1 shrink-0 rounded-full px-2.5 py-0.5 text-[9px] font-semibold tracking-wide capitalize ${FEAT_STATUS_STYLES[feature.status]}`}
            >
              {feature.status}
            </span>
          </div>
        </div>

        {open && (
          <div className="space-y-2 px-3 pb-3 pl-9">
            {loadingStories && feature.stories.length === 0 ? (
              <p className={`text-[11px] ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
                Loading stories…
              </p>
            ) : (
              <>
                <p className={`text-[10px] font-semibold uppercase tracking-[1.2px] ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
                  User Stories
                </p>
                {feature.stories.map((story) => (
                  <StoryRow
                    key={story.id}
                    story={story}
                    projectId={projectId}
                    capabilityId={capabilityId}
                    featureId={feature.id}
                    onEdited={onStoryEdited}
                    onDeleted={onStoryDeleted}
                  />
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
              </>
            )}
          </div>
        )}
      </div>

      {editOpen && (
        <EditFeatureModal
          projectId={projectId}
          capabilityId={capabilityId}
          feature={feature}
          onClose={() => setEditOpen(false)}
          onSaved={(updated) => {
            onEdited?.(updated);
            setEditOpen(false);
          }}
        />
      )}

      {deleteOpen && (
        <ConfirmDeleteDialog
          label="this feature"
          onConfirm={handleDelete}
          onCancel={() => setDeleteOpen(false)}
          busy={deleting}
        />
      )}
    </>
  );
}

export default FeatureCard;
