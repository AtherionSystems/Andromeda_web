import React from "react";
import type { ApiTask } from "../../types/api";

interface ModalProps {
  task: ApiTask | null;
  onClose: () => void;
}

const TaskDetailModal: React.FC<ModalProps> = ({ task, onClose }) => {
  if (!task) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/50">
          <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
            Task Details — ATH-{task.id.toString().padStart(3, '0')}
          </span>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-8">
          <div className="flex items-center gap-3 mb-4">
            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${task.priority === 'high' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}>
              {task.priority} Priority
            </span>
            <span className="px-2 py-1 rounded bg-blue-100 text-blue-700 text-[10px] font-bold uppercase">
              {task.status.replace('_', ' ')}
            </span>
          </div>

          <h2 className="text-2xl font-semibold text-slate-900 mb-4">{task.title}</h2>
          
          <div className="space-y-6">
            <div>
              <h5 className="text-[11px] font-bold text-slate-400 uppercase mb-2">Description</h5>
              <p className="text-slate-600 leading-relaxed">
                {task.description || "No description provided for this task."}
              </p>
            </div>

            {task.acceptanceCriteria && (
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                <h5 className="text-[11px] font-bold text-slate-400 uppercase mb-2">Acceptance Criteria</h5>
                <p className="text-sm text-slate-700 whitespace-pre-line">{task.acceptanceCriteria}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-8 border-t border-slate-100 pt-6">
              <div>
                <h5 className="text-[11px] font-bold text-slate-400 uppercase mb-1">Story Points</h5>
                <p className="text-lg font-semibold text-slate-900">{task.storyPoints || 0} pts</p>
              </div>
              <div>
                <h5 className="text-[11px] font-bold text-slate-400 uppercase mb-1">Due Date</h5>
                <p className="text-sm font-medium text-slate-900">
                  {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No date set"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;