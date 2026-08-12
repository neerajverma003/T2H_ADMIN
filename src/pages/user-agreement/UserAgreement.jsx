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
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-full mx-auto space-y-8 pb-20 px-4 sm:px-6 text-left"
    >
      {/* ── HEADER HUB (Admire Holidays Style) ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            User <span className="text-blue-600 dark:text-blue-500">Agreement</span>
          </h1>
          <p className="text-xs sm:text-sm font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">
            Manage legal user standards and website terms of service for all travelers.
          </p>
        </div>
      </div>

      {/* ── MAIN CARD: USER AGREEMENT ── */}
      <div className="bg-slate-900 dark:bg-slate-900 text-white rounded-3xl p-6 lg:p-8 border border-slate-800 shadow-2xl space-y-6">
        
        {/* Card Header & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <FileText size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                User Agreement
              </h2>
              <div className="flex items-center gap-3 mt-1 text-[11px] font-extrabold tracking-wider text-slate-400 uppercase">
                <span>{clauses.length} {clauses.length === 1 ? "CLAUSE" : "CLAUSES"} ACTIVE</span>
                <span>•</span>
                <button
                  type="button"
                  onClick={handleCopyAll}
                  className="hover:text-blue-400 transition-colors flex items-center gap-1 cursor-pointer"
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
              className="px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white hover:bg-slate-800 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <X size={14} /> CANCEL
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-blue-600/40 hover:shadow-blue-500/60 transition-all duration-300 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
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
                className="bg-slate-950/70 border border-slate-800/90 rounded-2xl p-5 space-y-4 shadow-inner group hover:border-slate-700 transition-all text-left"
              >
                {/* Title Input */}
                <div className="flex items-center justify-between gap-4">
                  <input
                    type="text"
                    value={clause.title}
                    onChange={(e) => handleTitleChange(idx, e.target.value)}
                    placeholder="Section Title (e.g., Acceptance of Terms)"
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 font-bold text-base outline-none focus:border-blue-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteClause(idx)}
                    className="flex items-center gap-1 text-slate-400 hover:text-rose-400 text-xs font-bold uppercase tracking-wider px-3 py-2 rounded-lg hover:bg-slate-900 transition-all cursor-pointer shrink-0"
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
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-slate-200 font-medium text-sm outline-none focus:border-blue-500 transition-colors leading-relaxed resize-y"
                />
              </div>
            ))}

            {/* Dashed Add New Clause Card Button */}
            <button
              type="button"
              onClick={handleAddClause}
              className="w-full py-4 border-2 border-dashed border-slate-800 hover:border-blue-500/60 rounded-2xl text-slate-400 hover:text-blue-400 font-extrabold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-300 bg-slate-950/30 hover:bg-slate-950/70 cursor-pointer"
            >
              <Plus size={16} /> ADD NEW CLAUSE
            </button>
          </div>
        )}
      </div>

      {/* ── FOOTER INTEGRATION BANNER ── */}
      <div className="p-6 bg-slate-900/60 border border-slate-800/80 rounded-2xl flex items-start gap-4 text-left">
        <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
          <Info size={20} />
        </div>
        <div>
          <h3 className="text-xs font-black uppercase tracking-wider text-blue-400">
            FOOTER USER AGREEMENT INTEGRATION
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed font-medium mt-1">
            These terms are fetched and displayed on the main website's footer "User Agreement" page.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default UserAgreement;
