import React, { useState } from "react";
import { ShieldCheck, Plus, X, Tag, Trash2, FileText } from "lucide-react";

export const ActivityPolicySection = ({
  formData,
  handleInputChange,
  styles,
}) => {
  const { cardStyle, labelStyle, inputStyle } = styles;
  const [newBadge, setNewBadge] = useState("");
  const [newPolicy, setNewPolicy] = useState("");

  const badges = formData.badges || [];
  const policies = Array.isArray(formData.cancellation_policy)
    ? formData.cancellation_policy
    : (typeof formData.cancellation_policy === "string" && formData.cancellation_policy.trim()
        ? formData.cancellation_policy.split("\n").map((s) => s.trim()).filter(Boolean)
        : []);

  const handleAddBadge = (e) => {
    e?.preventDefault();
    if (!newBadge.trim()) return;
    const updated = [...badges, newBadge.trim()];
    handleInputChange({ target: { name: "badges", value: updated } });
    setNewBadge("");
  };

  const handleRemoveBadge = (index) => {
    const updated = badges.filter((_, idx) => idx !== index);
    handleInputChange({ target: { name: "badges", value: updated } });
  };

  const handleAddPolicy = (e) => {
    e?.preventDefault();
    if (!newPolicy.trim()) return;
    const updated = [...policies, newPolicy.trim()];
    handleInputChange({ target: { name: "cancellation_policy", value: updated } });
    setNewPolicy("");
  };

  const handleRemovePolicy = (index) => {
    const updated = policies.filter((_, idx) => idx !== index);
    handleInputChange({ target: { name: "cancellation_policy", value: updated } });
  };

  const handleUpdatePolicy = (index, value) => {
    const updated = [...policies];
    updated[index] = value;
    handleInputChange({ target: { name: "cancellation_policy", value: updated } });
  };

  return (
    <div className={cardStyle}>
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
        <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <ShieldCheck className="text-teal-600 dark:text-teal-400" size={22} />
          Cancellation Policy & Trust Badges
        </h2>
        <div className="px-3 py-1 bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 rounded-full text-[11px] font-black uppercase tracking-widest">
          Customer Assurance
        </div>
      </div>

      <div className="space-y-6">
        {/* Trust Badges */}
        <div>
          <label className={labelStyle}>
            <span className="flex items-center gap-1.5">
              <Tag size={15} className="text-teal-600" /> Trust & Feature Badges
            </span>
          </label>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
            Displayed below the title (e.g. Mobile Tickets, Instant Confirmation, Best Price Guaranteed).
          </p>

          <div className="flex gap-2.5 mb-3">
            <input
              type="text"
              value={newBadge}
              onChange={(e) => setNewBadge(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddBadge();
                }
              }}
              placeholder="e.g. Instant Confirmation"
              className={`${inputStyle} flex-1`}
            />
            <button
              type="button"
              onClick={handleAddBadge}
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-sm cursor-pointer transition-all"
            >
              <Plus size={14} /> Add Badge
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {badges.map((b, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 text-xs font-bold border border-teal-200/60 dark:border-teal-800"
              >
                <span>{b}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveBadge(idx)}
                  className="hover:text-red-500 transition-colors cursor-pointer"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Cancellation Policy Terms (Line-wise Box Format) */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <label className={labelStyle}>
              <span className="flex items-center gap-1.5">
                <FileText size={15} className="text-teal-600 dark:text-teal-400" />
                Cancellation Policy Terms
              </span>
            </label>
            <span className="text-xs font-bold text-slate-400">
              {policies.length} Terms Added
            </span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Specify refund timelines and cancellation conditions line-by-line (e.g. 100% refund before 24h).
          </p>

          {/* Input to add policy term */}
          <div className="flex gap-3 mb-6">
            <input
              type="text"
              value={newPolicy}
              onChange={(e) => setNewPolicy(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddPolicy();
                }
              }}
              placeholder="e.g. Full 100% refund if cancelled at least 24 hours before experience start time."
              className={`${inputStyle} flex-1`}
            />
            <button
              type="button"
              onClick={handleAddPolicy}
              className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md shadow-teal-500/20 cursor-pointer transition-all"
            >
              <Plus size={16} /> Add
            </button>
          </div>

          {/* List of Policies */}
          {policies.length > 0 ? (
            <div className="space-y-3">
              {policies.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 group hover:border-slate-300 transition-colors"
                >
                  <span className="w-6 h-6 rounded-full bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400 text-xs font-black flex items-center justify-center shrink-0">
                    {index + 1}
                  </span>
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => handleUpdatePolicy(index, e.target.value)}
                    className="flex-1 bg-transparent text-sm text-slate-800 dark:text-slate-100 font-medium focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemovePolicy(index)}
                    className="text-slate-400 hover:text-red-500 transition-colors p-1.5 cursor-pointer"
                    title="Remove policy term"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center text-xs font-semibold text-slate-400 italic bg-slate-50 dark:bg-slate-800/20 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
              No cancellation policy terms added yet. Add a few rules to inform travelers about refund conditions!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default ActivityPolicySection;
