import React, { useState } from "react";
import { AlertCircle, Plus, Trash2 } from "lucide-react";

export const ActivityGuidelinesSection = ({
  formData,
  handleInputChange,
  styles,
}) => {
  const { cardStyle, labelStyle, inputStyle } = styles;
  const [newGuideline, setNewGuideline] = useState("");

  const guidelines = formData.know_before_you_go || [];

  const handleAddGuideline = (e) => {
    e?.preventDefault();
    if (!newGuideline.trim()) return;
    const updated = [...guidelines, newGuideline.trim()];
    handleInputChange({ target: { name: "know_before_you_go", value: updated } });
    setNewGuideline("");
  };

  const handleRemoveGuideline = (index) => {
    const updated = guidelines.filter((_, idx) => idx !== index);
    handleInputChange({ target: { name: "know_before_you_go", value: updated } });
  };

  const handleUpdateGuideline = (index, value) => {
    const updated = [...guidelines];
    updated[index] = value;
    handleInputChange({ target: { name: "know_before_you_go", value: updated } });
  };

  return (
    <div className={cardStyle}>
      <div className="flex items-center justify-between pb-5 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-3.5">
          <div className="size-11 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/25 shrink-0">
            <AlertCircle size={20} />
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Know Before You Go (Guidelines)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
              Rules, safety advice, dress code, and mandatory entry requirements
            </p>
          </div>
        </div>
        <span className="px-3.5 py-1.5 bg-purple-500/10 border border-purple-500/30 text-purple-400 rounded-xl text-[10px] font-black uppercase tracking-wider">
          {guidelines.length} Rules Added
        </span>
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400">
        Important guidelines displayed under the "Must Know" tab to ensure a seamless traveler experience.
      </p>

      {/* Input to add guideline */}
      <div className="flex gap-3">
        <input
          type="text"
          value={newGuideline}
          onChange={(e) => setNewGuideline(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAddGuideline();
            }
          }}
          placeholder="e.g. Please carry a valid physical government-issued ID with you"
          className={`${inputStyle} flex-1`}
        />
        <button
          type="button"
          onClick={handleAddGuideline}
          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 hover:opacity-95 text-white rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-purple-500/25 cursor-pointer transition-all active:scale-95 shrink-0"
        >
          <Plus size={16} /> Add Rule
        </button>
      </div>

      {/* Guidelines List */}
      {guidelines.length > 0 ? (
        <div className="space-y-3">
          {guidelines.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-[#050A17] border border-slate-200 dark:border-slate-800/90 group hover:border-purple-500/40 transition-colors shadow-inner"
            >
              <span className="w-6 h-6 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-black flex items-center justify-center shrink-0">
                {index + 1}
              </span>
              <input
                type="text"
                value={item}
                onChange={(e) => handleUpdateGuideline(index, e.target.value)}
                className="flex-1 bg-transparent text-sm text-slate-900 dark:text-white font-medium focus:outline-none"
              />
              <button
                type="button"
                onClick={() => handleRemoveGuideline(index)}
                className="text-slate-500 hover:text-red-400 transition-colors p-1.5 cursor-pointer"
                title="Remove guideline"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-6 text-center text-xs font-semibold text-slate-500 italic bg-slate-50 dark:bg-[#050A17] rounded-2xl border border-dashed border-slate-200 dark:border-slate-800/90">
          No guidelines added yet. Add ID, age, or dress requirements to guide travelers!
        </div>
      )}
    </div>
  );
};
export default ActivityGuidelinesSection;

