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
      <div className="flex items-center justify-between pb-5 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-3.5">
          <div className="size-11 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white shadow-lg shadow-teal-500/25 shrink-0">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Cancellation Policy & Trust Badges
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
              Customer assurance terms, verified badges, and flexible cancellation rules
            </p>
          </div>
        </div>
        <div className="px-3.5 py-1.5 bg-teal-500/10 border border-teal-500/30 text-teal-400 rounded-xl text-[10px] font-black uppercase tracking-wider">
          Customer Assurance
        </div>
      </div>

      <div className="space-y-6 pt-2">
        {/* Trust Badges */}
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#050A17] border border-slate-200 dark:border-slate-800/90 shadow-inner">
          <label className={labelStyle}>
            <Tag size={14} className="text-teal-400" />
            <span>Trust & Feature Badges</span>
          </label>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3.5">
            Displayed below the title banner (e.g. Mobile Tickets, Instant Confirmation, Best Price Guaranteed).
          </p>

          <div className="flex gap-2.5 mb-3.5">
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
              className="px-5 py-3 bg-gradient-to-r from-teal-500 to-emerald-600 hover:opacity-95 text-white rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-teal-500/25 cursor-pointer transition-all active:scale-95 shrink-0"
            >
              <Plus size={15} /> Add Badge
            </button>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {badges.map((b, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-bold hover:border-teal-500/60 transition-colors shadow-sm"
              >
                <span>{b}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveBadge(idx)}
                  className="text-teal-400 hover:text-red-400 transition-colors cursor-pointer"
                  title="Remove badge"
                >
                  <X size={13} />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Cancellation Policy Terms (Line-wise Box Format) */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center justify-between mb-1.5">
            <label className={labelStyle}>
              <FileText size={14} className="text-teal-400" />
              <span>Cancellation Policy Terms</span>
            </label>
            <span className="px-3 py-1 bg-teal-500/10 border border-teal-500/30 text-teal-400 rounded-lg text-[10px] font-black uppercase tracking-wider">
              {policies.length} Terms Added
            </span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Specify refund timelines and cancellation conditions line-by-line (e.g. 100% refund before 24h).
          </p>

          {/* Input to add policy term */}
          <div className="flex gap-3 mb-5">
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
              className="px-6 py-3 bg-gradient-to-r from-teal-500 to-emerald-600 hover:opacity-95 text-white rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-teal-500/25 cursor-pointer transition-all active:scale-95 shrink-0"
            >
              <Plus size={16} /> Add Term
            </button>
          </div>

          {/* List of Policies */}
          {policies.length > 0 ? (
            <div className="space-y-3">
              {policies.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-[#050A17] border border-slate-200 dark:border-slate-800/90 group hover:border-teal-500/40 transition-colors shadow-inner"
                >
                  <span className="w-6 h-6 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-black flex items-center justify-center shrink-0">
                    {index + 1}
                  </span>
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => handleUpdatePolicy(index, e.target.value)}
                    className="flex-1 bg-transparent text-sm text-slate-900 dark:text-white font-medium focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemovePolicy(index)}
                    className="text-slate-500 hover:text-red-400 transition-colors p-1.5 cursor-pointer"
                    title="Remove policy term"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center text-xs font-semibold text-slate-500 italic bg-slate-50 dark:bg-[#050A17] rounded-2xl border border-dashed border-slate-200 dark:border-slate-800/90">
              No cancellation policy terms added yet. Add a few rules to inform travelers about refund conditions!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default ActivityPolicySection;

