import React, { useState } from "react";
import { Sparkles, Plus, Trash2, GripVertical } from "lucide-react";

export const ActivityHighlightsSection = ({
  formData,
  handleInputChange,
  styles,
}) => {
  const { cardStyle, labelStyle, inputStyle } = styles;
  const [newHighlight, setNewHighlight] = useState("");

  const highlights = formData.highlights || [];

  const handleAddHighlight = (e) => {
    e?.preventDefault();
    if (!newHighlight.trim()) return;
    const updated = [...highlights, newHighlight.trim()];
    handleInputChange({ target: { name: "highlights", value: updated } });
    setNewHighlight("");
  };

  const handleRemoveHighlight = (index) => {
    const updated = highlights.filter((_, idx) => idx !== index);
    handleInputChange({ target: { name: "highlights", value: updated } });
  };

  const handleUpdateHighlight = (index, value) => {
    const updated = [...highlights];
    updated[index] = value;
    handleInputChange({ target: { name: "highlights", value: updated } });
  };

  return (
    <div className={cardStyle}>
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
        <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="text-amber-500" size={22} />
          Key Highlights & Features
        </h2>
        <span className="text-xs font-bold text-slate-400">
          {highlights.length} Highlights Added
        </span>
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
        Highlight the most thrilling and romantic aspects of this experience (bullet points).
      </p>

      {/* Input to add highlight */}
      <div className="flex gap-3 mb-6">
        <input
          type="text"
          value={newHighlight}
          onChange={(e) => setNewHighlight(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAddHighlight();
            }
          }}
          placeholder="e.g. Visit Sentosa 4D Adventureland with full day priority pass"
          className={`${inputStyle} flex-1`}
        />
        <button
          type="button"
          onClick={handleAddHighlight}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md shadow-blue-500/20 cursor-pointer transition-all"
        >
          <Plus size={16} /> Add
        </button>
      </div>

      {/* List of Highlights */}
      {highlights.length > 0 ? (
        <div className="space-y-3">
          {highlights.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 group hover:border-slate-300 transition-colors"
            >
              <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-xs font-black flex items-center justify-center shrink-0">
                {index + 1}
              </span>
              <input
                type="text"
                value={item}
                onChange={(e) => handleUpdateHighlight(index, e.target.value)}
                className="flex-1 bg-transparent text-sm text-slate-800 dark:text-slate-100 font-medium focus:outline-none"
              />
              <button
                type="button"
                onClick={() => handleRemoveHighlight(index)}
                className="text-slate-400 hover:text-red-500 transition-colors p-1.5 cursor-pointer"
                title="Remove highlight"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-6 text-center text-xs font-semibold text-slate-400 italic bg-slate-50 dark:bg-slate-800/20 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
          No highlights added yet. Add a few to showcase this activity!
        </div>
      )}
    </div>
  );
};
export default ActivityHighlightsSection;
