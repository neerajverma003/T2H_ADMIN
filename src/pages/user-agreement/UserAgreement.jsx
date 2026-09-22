import React, { useState, useEffect } from "react";
import { apiClient } from "../../stores/authStores";
import { toast } from "react-toastify";
import { 
  FileText, 
  Save, 
  Plus, 
  Trash2, 
  Loader2, 
  Copy, 
  Check, 
  Info, 
  X,
  ShieldCheck
} from "lucide-react";
import { motion } from "framer-motion";

const UserAgreement = () => {
  const [clauses, setClauses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  // Fetch User Agreement Clauses on Mount
  const fetchUserAgreement = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/admin/user-agreement");
      if (res.data?.success && res.data?.data?.clauses) {
        setClauses(res.data.data.clauses);
      } else {
        setClauses([]);
      }
    } catch (error) {
      console.error("Error fetching user agreement:", error);
      toast.error("Failed to load user agreement.");
      setClauses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserAgreement();
  }, []);

  const handleTitleChange = (index, value) => {
    const updated = [...clauses];
    updated[index].title = value;
    setClauses(updated);
  };

  const handleContentChange = (index, value) => {
    const updated = [...clauses];
    updated[index].content = value;
    setClauses(updated);
  };

  const handleAddClause = () => {
    setClauses([
      ...clauses,
      { title: "New Section Title", content: "" }
    ]);
  };

  const handleDeleteClause = (index) => {
    setClauses(clauses.filter((_, i) => i !== index));
  };

  const handleCopyAll = () => {
    if (clauses.length === 0) return;
    const allText = clauses.map(c => `${c.title}\n${c.content}`).join("\n\n");
    navigator.clipboard.writeText(allText);
    setCopied(true);
    toast.info("User agreement copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCancel = () => {
    fetchUserAgreement();
    toast.info("Changes reset.");
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const validClauses = clauses.filter(c => c.title.trim() && c.content.trim());
      await apiClient.put("/admin/user-agreement", {
        clauses: validClauses
      });
      toast.success("User Agreement saved successfully! ✨");
      fetchUserAgreement();
    } catch (error) {
      console.error("Save User Agreement Error:", error);
      toast.error("Failed to save user agreement.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8 pb-20 font-sans min-h-screen text-slate-900 dark:text-slate-100 text-left">
      {/* ── HEADER HUB ── */}
      <div className="bg-white dark:bg-[#091126] rounded-3xl py-4 sm:py-5 px-6 sm:px-8 border border-slate-200 dark:border-slate-800 shadow-md relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0">
            <FileText size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-500 dark:text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full">
                LEGAL COMPLIANCE
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2 flex-wrap">
              User <span className="text-blue-500">Agreement</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-semibold mt-0.5 text-xs sm:text-sm">
              Manage legal user standards and website terms of service for all travelers.
            </p>
          </div>
        </div>
      </div>

      {/* ── MAIN CARD: USER AGREEMENT ── */}
      <div className="bg-white dark:bg-[#091126] text-slate-900 dark:text-white rounded-3xl p-6 lg:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        {/* Card Header & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800/80 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
              <FileText size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                User Agreement
              </h2>
              <div className="flex items-center gap-3 mt-1 text-[11px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
                <span>{clauses.length} {clauses.length === 1 ? "CLAUSE" : "CLAUSES"} ACTIVE</span>
                <span>•</span>
                <button
                  type="button"
                  onClick={handleCopyAll}
                  className="hover:text-blue-500 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  <span>{copied ? "COPIED" : "COPY ALL"}</span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <X size={14} /> CANCEL
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all duration-300 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="animate-spin" size={15} /> : <Save size={15} />}
              <span>{isSaving ? "SAVING..." : "SAVE AGREEMENT"}</span>
            </button>
          </div>
        </div>

        {/* Card Body: Clauses Editor */}
        {loading ? (
          <div className="py-16 text-center">
            <Loader2 className="animate-spin mx-auto text-blue-500" size={36} />
            <p className="text-slate-400 text-xs font-semibold mt-3">Loading user agreement...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {clauses.map((clause, idx) => (
              <div
                key={idx}
                className="bg-slate-50 dark:bg-[#050A17] border border-slate-200 dark:border-slate-800/90 rounded-2xl p-5 space-y-4 shadow-inner group hover:border-blue-500/40 transition-all text-left"
              >
                {/* Title Input */}
                <div className="flex items-center justify-between gap-4">
                  <input
                    type="text"
                    value={clause.title}
                    onChange={(e) => handleTitleChange(idx, e.target.value)}
                    placeholder="Section Title (e.g., Acceptance of Terms)"
                    className="flex-1 bg-white dark:bg-[#091126] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-slate-100 font-bold text-sm outline-none focus:border-blue-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteClause(idx)}
                    className="flex items-center gap-1.5 text-slate-400 hover:text-rose-500 text-xs font-bold uppercase tracking-wider px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer shrink-0"
                  >
                    <Trash2 size={14} />
                    <span>Remove</span>
                  </button>
                </div>

                {/* Content Textarea */}
                <textarea
                  rows={4}
                  value={clause.content}
                  onChange={(e) => handleContentChange(idx, e.target.value)}
                  placeholder="Enter clause content or terms of service paragraph..."
                  className="w-full bg-white dark:bg-[#091126] border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-slate-800 dark:text-slate-200 font-medium text-sm outline-none focus:border-blue-500 transition-colors leading-relaxed resize-y"
                />
              </div>
            ))}

            {/* Dashed Add New Clause Card Button */}
            <button
              type="button"
              onClick={handleAddClause}
              className="w-full py-3.5 border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-blue-500/60 rounded-2xl text-slate-500 dark:text-slate-400 hover:text-blue-500 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-300 bg-slate-50/50 dark:bg-[#050A17]/40 hover:bg-blue-500/5 cursor-pointer"
            >
              <Plus size={16} /> ADD NEW CLAUSE
            </button>
          </div>
        )}
      </div>

      {/* ── FOOTER INTEGRATION BANNER ── */}
      <div className="p-5 bg-white dark:bg-[#091126] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm flex items-start gap-4 text-left">
        <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shrink-0">
          <Info size={20} />
        </div>
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-blue-500">
            FOOTER USER AGREEMENT INTEGRATION
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium mt-1">
            These terms are fetched and displayed on the main website's footer "User Agreement" page.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserAgreement;
