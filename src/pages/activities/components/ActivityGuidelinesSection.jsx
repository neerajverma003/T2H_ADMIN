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
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
        <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <AlertCircle className="text-indigo-600 dark:text-indigo-400" size={22} />
          Know Before You Go (Guidelines)
        </h2>
        <span className="text-xs font-bold text-slate-400">
          {guidelines.length} Instructions
        </span>
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
        Rules, safety advice, dress code, and mandatory ID requirements for travelers (displayed in "Must Know" tab).
      </p>

      {/* Input to add guideline */}
      <div className="flex gap-3 mb-6">
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
          placeholder="e.g. Please carry valid government ID with you at all times"
          className={`${inputStyle} flex-1`}
        />
        <button
          type="button"
          onClick={handleAddGuideline}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md shadow-indigo-500/20 cursor-pointer transition-all"
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
              className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 group hover:border-slate-300 transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 shrink-0 ml-1" />
              <input
                type="text"
                value={item}
                onChange={(e) => handleUpdateGuideline(index, e.target.value)}
                className="flex-1 bg-transparent text-sm text-slate-800 dark:text-slate-100 font-medium focus:outline-none"
              />
              <button
                type="button"
                onClick={() => handleRemoveGuideline(index)}
                className="text-slate-400 hover:text-red-500 transition-colors p-1.5 cursor-pointer"
                title="Remove guideline"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-6 text-center text-xs font-semibold text-slate-400 italic bg-slate-50 dark:bg-slate-800/20 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
          No guidelines added yet. Add ID or health guidelines to ensure a smooth guest experience!
        </div>
      )}
    </div>
  );
};
export default ActivityGuidelinesSection;
