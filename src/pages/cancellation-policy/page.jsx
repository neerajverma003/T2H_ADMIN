import React, { useState, useEffect } from "react";
import { apiClient } from "../../stores/authStores";
import { toast } from "react-toastify";
import { 
    ShieldAlert, 
    Save, 
    Edit, 
    Loader2, 
    Globe, 
    MapPin, 
    Sparkles, 
    Plus,
    Trash2,
    AlertOctagon
} from "lucide-react";
import { motion } from "framer-motion";

const HoneymoonCancellationPolicy = () => {
  const [category, setCategory] = useState("domestic");
  const [rules, setRules] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchCancellationPolicy = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get(`/admin/honeymoon-cancellation-policy?type=${category}`);
        if (res.data?.success) {
          const rawText = res.data.data?.honeymoon_cancellation_policy || "";
          const parsedRules = rawText.split('\n').map(r => r.trim()).filter(Boolean);
          setRules(parsedRules);
        }
      } catch (error) {
        toast.error("Failed to load cancellation policy.");
      } finally {
        setLoading(false);
      }
    };

    fetchCancellationPolicy();
    setIsEditing(false);
  }, [category]);

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

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const combinedText = rules.map(r => r.trim()).filter(Boolean).join('\n');
      await apiClient.put("/admin/honeymoon-cancellation-policy", {
        type: category,
        honeymoon_cancellation_policy: combinedText,
      });
      toast.success(`${category.toUpperCase()} cancellation policy updated! ✨`);
      setIsEditing(false);
    } catch (error) {
      toast.error("Failed to save cancellation policy.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8 pb-20 font-sans min-h-screen text-slate-900 dark:text-slate-100 text-left">
      {/* HEADER HUB */}
      <div className="bg-white dark:bg-[#091126]/95 rounded-3xl py-4 sm:py-5 px-6 sm:px-8 border border-slate-200/90 dark:border-indigo-500/25 shadow-xl dark:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.7),0_0_30px_2px_rgba(99,102,241,0.18)] ring-1 ring-slate-900/5 dark:ring-white/5 backdrop-blur-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Glow Effects */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-rose-500/10 dark:bg-rose-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-red-500/10 dark:bg-red-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-rose-500 to-red-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-rose-500/30 shrink-0">
            <ShieldAlert size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-500 dark:text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded-full">
                GOVERNANCE & RISK
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2 flex-wrap">
              Cancellation <span className="text-rose-500">Framework</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-semibold mt-0.5 text-xs sm:text-sm">
              Defining regulatory refund protocols and administrative withdrawal guidelines for all packages.
            </p>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="px-4 py-2 bg-rose-500/10 border border-rose-500/20 text-rose-500 dark:text-rose-400 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm">
            <Sparkles size={15} /> GOVERNANCE SECURED
          </div>
        </div>
      </div>

      {/* REGIONAL CATEGORY SELECTOR */}
      <div className="bg-white dark:bg-[#091126]/95 rounded-3xl p-6 lg:p-8 border border-slate-200/90 dark:border-indigo-500/25 shadow-xl ring-1 ring-slate-900/5 dark:ring-white/5 backdrop-blur-xl space-y-3">
        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
          REGIONAL CATEGORY
        </label>
        <div className="flex gap-3 max-w-md">
          {[
            { id: "domestic", label: "DOMESTIC", icon: MapPin },
            { id: "international", label: "INTERNATIONAL", icon: Globe }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setCategory(tab.id)}
              className={`flex-1 py-2.5 px-5 rounded-xl border text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                category === tab.id
                  ? "bg-gradient-to-r from-rose-600 to-red-600 border-transparent text-white shadow-md shadow-rose-500/30"
                  : "bg-slate-50 dark:bg-[#050A17] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"
              }`}
            >
              <tab.icon size={15} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* POLICY MANIFEST BOX-WISE LIST VIEW */}
      <div className="bg-white dark:bg-[#091126]/95 rounded-3xl p-6 lg:p-8 border border-slate-200/90 dark:border-indigo-500/25 shadow-xl ring-1 ring-slate-900/5 dark:ring-white/5 backdrop-blur-xl space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800/80 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500">
              <AlertOctagon size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight capitalize">
                Policy Manifest — {category}
              </h2>
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-0.5">
                {rules.length} RULES ACTIVE
              </p>
            </div>
          </div>

          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              disabled={loading}
              className="px-5 py-2.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-rose-500/30 flex items-center gap-2 cursor-pointer"
            >
              <Edit size={14} /> EDIT FRAMEWORK
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
              >
                CANCEL
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-5 py-2.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-rose-500/30 flex items-center gap-2 cursor-pointer"
              >
                {isSaving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                {isSaving ? "SAVING..." : "SAVE CHANGES"}
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-rose-500" size={36} /></div>
        ) : isEditing ? (
          <div className="space-y-4">
            {rules.map((rule, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3.5 bg-slate-50 dark:bg-[#050A17] border border-slate-200 dark:border-slate-800/90 rounded-2xl shadow-inner group hover:border-rose-500/40 transition-all">
                <span className="text-slate-400 font-bold px-2 text-sm">&gt;</span>
                <input
                  type="text"
                  value={rule}
                  onChange={(e) => handleRuleChange(idx, e.target.value)}
                  className="flex-1 bg-transparent text-slate-900 dark:text-white font-medium text-sm outline-none placeholder:text-slate-400"
                  placeholder="Enter cancellation rule point..."
                />
                <button
                  type="button"
                  onClick={() => handleDeleteRule(idx)}
                  className="p-2 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={handleAddRule}
              className="w-full py-3.5 border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-rose-500/60 rounded-2xl text-slate-500 dark:text-slate-400 hover:text-rose-500 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-300 bg-slate-50/50 dark:bg-[#050A17]/40 hover:bg-rose-500/5 cursor-pointer mt-4"
            >
              <Plus size={16} /> APPEND CANCELLATION RULE
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {rules.length > 0 ? (
              rules.map((rule, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-[#050A17] border border-slate-200 dark:border-slate-800/90 flex items-center justify-between gap-3 shadow-inner hover:border-rose-500/30 transition-all">
                  <div className="flex items-start gap-3">
                    <span className="text-rose-500 font-bold text-sm shrink-0 mt-0.5">&gt;</span>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed text-left">
                      {rule}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-400 italic bg-slate-50 dark:bg-[#050A17] rounded-2xl border border-slate-200 dark:border-slate-800/80">
                No cancellation rules defined for {category} packages yet. Click EDIT FRAMEWORK to add rules.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HoneymoonCancellationPolicy;
