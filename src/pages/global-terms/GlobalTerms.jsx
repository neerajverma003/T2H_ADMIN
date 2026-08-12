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
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-full mx-auto space-y-8 pb-20 px-4 sm:px-6 text-left"
    >
      {/* ── HEADER HUB (Admire Holidays Style) ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            Global <span className="text-blue-600 dark:text-blue-500">Terms</span>
          </h1>
          <p className="text-xs sm:text-sm font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">
            MANAGE THE UNIVERSAL TERMS AND CONDITIONS DISPLAYED ON THE MAIN FRONTEND FOOTER.
          </p>
        </div>
      </div>

      {/* ── MAIN CARD: UNIVERSAL TERMS ── */}
      <div className="bg-slate-900 dark:bg-slate-900 text-white rounded-3xl p-6 lg:p-8 border border-slate-800 shadow-2xl space-y-6">
        
        {/* Card Header & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Globe size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Universal Terms
              </h2>
              <div className="flex items-center gap-3 mt-1 text-[11px] font-extrabold tracking-wider text-slate-400 uppercase">
                <span>{rules.length} {rules.length === 1 ? "CLAUSE" : "CLAUSES"} ACTIVE</span>
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
                className="flex items-center gap-3 p-4 bg-slate-950/60 border border-slate-800/80 rounded-2xl group hover:border-slate-700 transition-all shadow-inner"
              >
                <ChevronRight className="text-slate-500 shrink-0" size={18} />
                <textarea
                  rows={2}
                  value={rule}
                  onChange={(e) => handleRuleChange(idx, e.target.value)}
                  placeholder="Enter universal terms and conditions clause..."
                  className="flex-1 bg-transparent text-slate-100 font-semibold text-sm outline-none placeholder:text-slate-600 resize-y leading-relaxed"
                />
                <button
                  type="button"
                  onClick={() => handleDeleteRule(idx)}
                  className="p-2 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer shrink-0"
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
              className="w-full py-4 border-2 border-dashed border-slate-800 hover:border-blue-500/60 rounded-2xl text-slate-400 hover:text-blue-400 font-extrabold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-300 bg-slate-950/30 hover:bg-slate-950/70 cursor-pointer"
            >
              <Plus size={16} /> ADD NEW TERM
            </button>
          </div>
        )}
      </div>

      {/* ── FOOTER TERMS INTEGRATION CALLOUT BANNER (Admire Holidays Style) ── */}
      <div className="p-6 bg-slate-900/60 border border-slate-800/80 rounded-2xl flex items-start gap-4 text-left">
        <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
          <Info size={20} />
        </div>
        <div>
          <h3 className="text-xs font-black uppercase tracking-wider text-blue-400">
            FOOTER TERMS INTEGRATION
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed font-medium mt-1">
            These terms are fetched and displayed in the main website's footer "Terms & Conditions" page, independently of specific destinations.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default GlobalTerms;
