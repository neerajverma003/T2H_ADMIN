import React, { useState, useEffect } from "react";
import { apiClient } from "../../stores/authStores";
import { toast } from "react-toastify";
import { 
  Globe, 
  Save, 
  Plus, 
  Trash2, 
  Loader2, 
  Copy, 
  Check, 
  Info, 
  ChevronRight, 
  X
} from "lucide-react";
import { motion } from "framer-motion";

const GlobalTerms = () => {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  // Fetch Universal Global Terms on Mount
  const fetchGlobalTerms = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/admin/global-tnc?type=universal");
      if (res.data?.success && res.data?.data?.terms_And_condition) {
        const rawText = res.data.data.terms_And_condition;
        const parsedRules = rawText.split("\n").map((r) => r.trim()).filter(Boolean);
        setRules(parsedRules);
      } else {
        setRules([]);
      }
    } catch (error) {
      console.error("Error fetching global terms:", error);
      toast.error("Failed to load global terms & conditions.");
      setRules([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGlobalTerms();
  }, []);

  const handleRuleChange = (index, value) => {
    const updated = [...rules];
    updated[index] = value;
    setRules(updated);
  };

  const handleAddRule = () => {
    setRules([...rules, ""]);
  };

  const handleDeleteRule = (index) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  const handleCopyAll = () => {
    if (rules.length === 0) return;
    const allText = rules.join("\n");
    navigator.clipboard.writeText(allText);
    setCopied(true);
    toast.info("All terms copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCancel = () => {
    fetchGlobalTerms();
    toast.info("Changes reset.");
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const combinedText = rules.map((r) => r.trim()).filter(Boolean).join("\n");
      await apiClient.put("/admin/global-tnc", {
        type: "universal",
        terms_And_condition: combinedText,
      });
      toast.success("Universal Global Terms saved successfully! ✨");
      fetchGlobalTerms();
    } catch (error) {
      console.error("Save Global Terms Error:", error);
      toast.error("Failed to save global terms & conditions.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8 pb-20 font-sans min-h-screen text-slate-900 dark:text-slate-100 text-left">
      {/* ── HEADER HUB ── */}
      <div className="bg-white dark:bg-[#091126]/95 rounded-3xl py-4 sm:py-5 px-6 sm:px-8 border border-slate-200/90 dark:border-indigo-500/25 shadow-xl dark:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.7),0_0_30px_2px_rgba(99,102,241,0.18)] ring-1 ring-slate-900/5 dark:ring-white/5 backdrop-blur-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Glow Effects */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-blue-500/10 dark:bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-indigo-500/10 dark:bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-500/30 shrink-0">
            <Globe size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-500 dark:text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full">
                LEGAL COMPLIANCE
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2 flex-wrap">
              Global <span className="text-blue-500">Terms</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-semibold mt-0.5 text-xs sm:text-sm">
              Manage the universal terms and conditions displayed on the main frontend footer.
            </p>
          </div>
        </div>
      </div>

      {/* ── MAIN CARD: UNIVERSAL TERMS ── */}
      <div className="bg-white dark:bg-[#091126]/95 text-slate-900 dark:text-white rounded-3xl p-6 lg:p-8 border border-slate-200/90 dark:border-indigo-500/25 shadow-xl ring-1 ring-slate-900/5 dark:ring-white/5 backdrop-blur-xl space-y-6">
        {/* Card Header & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800/80 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
              <Globe size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                Universal Terms
              </h2>
              <div className="flex items-center gap-3 mt-1 text-[11px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
                <span>{rules.length} {rules.length === 1 ? "CLAUSE" : "CLAUSES"} ACTIVE</span>
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
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-blue-500/30 transition-all duration-300 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="animate-spin" size={15} /> : <Save size={15} />}
              <span>{isSaving ? "SAVING..." : "SAVE TERMS"}</span>
            </button>
          </div>
        </div>

        {/* Card Body: Clauses Editor */}
        {loading ? (
          <div className="py-16 text-center">
            <Loader2 className="animate-spin mx-auto text-blue-500" size={36} />
            <p className="text-slate-400 text-xs font-semibold mt-3">Loading universal global terms...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {rules.map((rule, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-[#050A17] border border-slate-200 dark:border-slate-800/90 rounded-2xl group hover:border-blue-500/40 transition-all shadow-inner"
              >
                <ChevronRight className="text-slate-400 dark:text-slate-600 shrink-0" size={18} />
                <textarea
                  rows={2}
                  value={rule}
                  onChange={(e) => handleRuleChange(idx, e.target.value)}
                  placeholder="Enter universal terms and conditions clause..."
                  className="flex-1 bg-transparent text-slate-900 dark:text-slate-100 font-medium text-sm outline-none placeholder:text-slate-400 dark:placeholder:text-slate-600 resize-y leading-relaxed"
                />
                <button
                  type="button"
                  onClick={() => handleDeleteRule(idx)}
                  className="p-2 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer shrink-0"
                  title="Delete clause"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}

            {/* Dashed Add New Term Card Button */}
            <button
              type="button"
              onClick={handleAddRule}
              className="w-full py-3.5 border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-blue-500/60 rounded-2xl text-slate-500 dark:text-slate-400 hover:text-blue-500 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-300 bg-slate-50/50 dark:bg-[#050A17]/40 hover:bg-blue-500/5 cursor-pointer"
            >
              <Plus size={16} /> ADD NEW TERM
            </button>
          </div>
        )}
      </div>

      {/* ── FOOTER TERMS INTEGRATION CALLOUT BANNER ── */}
      <div className="p-5 bg-white dark:bg-[#091126]/95 border border-slate-200/90 dark:border-indigo-500/25 rounded-3xl shadow-xl ring-1 ring-slate-900/5 dark:ring-white/5 backdrop-blur-xl flex items-start gap-4 text-left">
        <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shrink-0">
          <Info size={20} />
        </div>
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-blue-500">
            FOOTER TERMS INTEGRATION
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium mt-1">
            These terms are fetched and displayed in the main website's footer "Terms & Conditions" page, independently of specific destinations.
          </p>
        </div>
      </div>
    </div>
  );
};

export default GlobalTerms;
