import { useState } from "react";
import { useTheme } from "../../../contexts/useTheme";
import { deleteStory } from "../../../api/capabilities";
import type { Story } from "./types";
import { Avatar } from "./shared";
import EditStoryModal from "./EditStoryModal";
import ConfirmDeleteDialog from "./ConfirmDeleteDialog";

interface Props {
  story: Story;
  projectId: number;
  capabilityId: string;
  featureId: string;
  onEdited?: (updated: Story) => void;
  onDeleted?: (storyId: string) => void;
}

function StoryRow({ story, projectId, capabilityId, featureId, onEdited, onDeleted }: Props) {
  const { darkMode } = useTheme();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const meta = [story.status, story.priority].filter(Boolean).join(" · ");

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteStory(projectId, capabilityId, featureId, story.id);
      onDeleted?.(story.id);
    } catch (err) {
      console.error("Failed to delete story:", err);
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

        <div className="flex shrink-0 items-center gap-0.5">
          <button type="button" onClick={() => setEditOpen(true)} aria-label="Edit story" className={iconBtn}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          <button type="button" onClick={() => setDeleteOpen(true)} aria-label="Delete story" className={iconBtn}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
          </button>
        </div>
      </div>

      {editOpen && (
        <EditStoryModal
          projectId={projectId}
          capabilityId={capabilityId}
          featureId={featureId}
          story={story}
          onClose={() => setEditOpen(false)}
          onSaved={(updated) => {
            onEdited?.(updated);
            setEditOpen(false);
          }}
        />
      )}

      {deleteOpen && (
        <ConfirmDeleteDialog
          label="this user story"
          onConfirm={handleDelete}
          onCancel={() => setDeleteOpen(false)}
          busy={deleting}
        />
      )}
    </>
  );
}

export default StoryRow;
