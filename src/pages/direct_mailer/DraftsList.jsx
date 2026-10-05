import React from 'react';
import { Bookmark, Clock, Trash2, Edit3, Mail } from 'lucide-react';
import { toast } from 'react-toastify';
import { apiClient } from '../../stores/authStores';

export default function DraftsList({ drafts, onResumeDraft, onRefreshDrafts }) {
  const handleDeleteDraft = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this draft?')) return;
    try {
      const res = await apiClient.delete(`/admin/direct-mail/drafts/${id}`);
      if (res.data.success) {
        toast.success('Draft removed');
        onRefreshDrafts();
      }
    } catch (err) {
      toast.error('Failed to delete draft');
    }
  };

  if (!drafts || drafts.length === 0) {
    return (
      <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-3">
          <Bookmark size={24} />
        </div>
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
          No Saved Drafts
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
          When composing a message, click "Save Draft" to keep your work and resume anytime.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {drafts.map((draft) => {
        const totalRecips = (draft.to?.length || 0) + (draft.bcc?.length || 0);
        return (
          <div
            key={draft._id}
            onClick={() => onResumeDraft(draft)}
            className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 transition-all cursor-pointer shadow-sm group"
          >
            <div className="min-w-0 pr-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                  {draft.subject || '(Untitled Draft)'}
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                  DRAFT
                </span>
                <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                  {draft.emailStyle === 'template' ? 'Template' : 'Normal'}
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1 font-mono">
                  <Mail size={13} /> {totalRecips} recipient(s)
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock size={13} /> Saved {new Date(draft.updatedAt).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => onResumeDraft(draft)}
                className="px-3.5 py-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/50 flex items-center gap-1.5 transition"
              >
                <Edit3 size={13} /> Resume
              </button>
              <button
                type="button"
                onClick={(e) => handleDeleteDraft(draft._id, e)}
                className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition"
                title="Delete Draft"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
