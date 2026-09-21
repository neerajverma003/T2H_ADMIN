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
      <div className="flex items-center justify-between pb-5 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-3.5">
          <div className="size-11 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/25 shrink-0">
            <Sparkles size={20} />
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Key Highlights & Features
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
              Bullet points showcasing thrilling adventures, unique perks, and inclusions
            </p>
          </div>
        </div>
        <span className="px-3.5 py-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-xl text-[10px] font-black uppercase tracking-wider">
          {highlights.length} Highlights Added
        </span>
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400">
        Highlight the most thrilling and romantic aspects of this experience (bullet points).
      </p>

      {/* Input to add highlight */}
      <div className="flex gap-3">
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
          className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:opacity-95 text-white rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-amber-500/25 cursor-pointer transition-all active:scale-95 shrink-0"
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
              className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-[#050A17] border border-slate-200 dark:border-slate-800/90 group hover:border-amber-500/40 transition-colors shadow-inner"
            >
              <span className="w-6 h-6 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black flex items-center justify-center shrink-0">
                {index + 1}
              </span>
              <input
                type="text"
                value={item}
                onChange={(e) => handleUpdateHighlight(index, e.target.value)}
                className="flex-1 bg-transparent text-sm text-slate-900 dark:text-white font-medium focus:outline-none"
              />
              <button
                type="button"
                onClick={() => handleRemoveHighlight(index)}
                className="text-slate-500 hover:text-red-400 transition-colors p-1.5 cursor-pointer"
                title="Remove highlight"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-6 text-center text-xs font-semibold text-slate-500 italic bg-slate-50 dark:bg-[#050A17] rounded-2xl border border-dashed border-slate-200 dark:border-slate-800/90">
          No highlights added yet. Add a few to showcase this activity!
        </div>
      )}
    </div>
  );
};
export default ActivityHighlightsSection;
