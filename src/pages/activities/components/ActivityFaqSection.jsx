import React, { useState } from "react";
import { HelpCircle, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";

export const ActivityFaqSection = ({
  formData,
  handleInputChange,
  styles,
}) => {
  const { cardStyle, labelStyle, inputStyle } = styles;
  const faqs = formData.faqs || [];

  const handleAddFaq = () => {
    const newFaq = {
      question: "",
      answer: "",
    };
    const updated = [...faqs, newFaq];
    handleInputChange({ target: { name: "faqs", value: updated } });
  };

  const handleRemoveFaq = (index) => {
    const updated = faqs.filter((_, idx) => idx !== index);
    handleInputChange({ target: { name: "faqs", value: updated } });
  };

  const handleFaqChange = (index, field, value) => {
    const updated = [...faqs];
    updated[index] = { ...updated[index], [field]: value };
    handleInputChange({ target: { name: "faqs", value: updated } });
  };

  return (
    <div className={cardStyle}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-3.5">
          <div className="size-11 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/25 shrink-0">
            <HelpCircle size={20} />
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Frequently Asked Questions (FAQs)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
              Clear common doubts about age limits, clothing, bookings, and timings
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded-xl text-[10px] font-black uppercase tracking-wider">
            {faqs.length} FAQs
          </span>
          <button
            type="button"
            onClick={handleAddFaq}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-md shadow-cyan-600/30 cursor-pointer active:scale-95"
          >
            <Plus size={15} />
            <span>Add FAQ</span>
          </button>
        </div>
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400">
        FAQs help visitors make confident booking decisions. These will render in a collapsible accordion on the activity details page.
      </p>

      {/* FAQ items */}
      <div className="space-y-4 pt-2">
        {faqs.map((faq, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-slate-50 dark:bg-[#050A17] border border-slate-200 dark:border-slate-800/80 space-y-3.5 relative"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-500 uppercase tracking-wider">
                Question #{idx + 1}
              </span>
              <button
                type="button"
                onClick={() => handleRemoveFaq(idx)}
                className="text-xs text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1 transition-colors"
              >
                <Trash2 size={13} />
                <span>Remove</span>
              </button>
            </div>

            <div>
              <label className={labelStyle}>
                <span>Question *</span>
              </label>
              <input
                type="text"
                value={faq.question}
                onChange={(e) => handleFaqChange(idx, "question", e.target.value)}
                placeholder="e.g. Is swimming required for this scuba diving activity?"
                className={`${inputStyle} mt-1`}
              />
            </div>

            <div>
              <label className={labelStyle}>
                <span>Answer *</span>
              </label>
              <textarea
                rows={2}
                value={faq.answer}
                onChange={(e) => handleFaqChange(idx, "answer", e.target.value)}
                placeholder="e.g. No, swimming is not required! A certified instructor guides you throughout the dive."
                className={`${inputStyle} resize-none mt-1 leading-relaxed`}
              />
            </div>
          </div>
        ))}

        {faqs.length === 0 && (
          <div className="p-8 text-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20">
            <HelpCircle size={32} className="mx-auto text-slate-400 mb-2" />
            <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
              No FAQs added yet.
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Click &quot;Add FAQ&quot; above to answer common traveler queries.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
