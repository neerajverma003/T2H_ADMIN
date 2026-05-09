import React, { useState, useEffect } from "react";
import { apiClient } from "../../stores/authStores";
import { toast } from "react-toastify";
import { 
    FileText, 
    Save, 
    Edit, 
    Loader2, 
    Globe, 
    MapPin, 
    ShieldCheck, 
    Zap, 
    Sparkles, 
    Info, 
    AlertCircle,
    CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const HoneymoonTermsAndCondition = () => {
  const [activeTab, setActiveTab] = useState("domestic");
  const [textContent, setTextContent] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchTerms = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get(`/admin/global-tnc?type=${activeTab}`);
        setTextContent(res.data?.data?.terms_And_condition || "");
      } catch (error) {
        toast.error(`Failed to synchronize ${activeTab} registry.`);
      } finally {
        setLoading(false);
      }
    };
    fetchTerms();
    setIsEditing(false);
  }, [activeTab]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await apiClient.put("/admin/global-tnc", {
        type: activeTab,
        terms_And_condition: textContent,
      });
      toast.success(`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} registry updated! ✨`);
      setIsEditing(false);
    } catch (error) {
      toast.error("Synchronization failure");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-full mx-auto space-y-10 pb-20 px-6 text-left">
      {/* HEADER HUB */}
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 lg:p-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none text-indigo-700"><FileText size={160} /></div>
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 className="text-2xl font-black text-slate-950 dark:text-white tracking-tight flex items-center gap-3">
                    <ShieldCheck className="text-indigo-700" size={28} /> COMPLIANCE REGISTRY
                </h1>
                <p className="text-slate-600 dark:text-slate-400 font-bold mt-1 text-xs italic text-left">Global terms & conditions for destination engagement</p>
            </div>
            <div className="flex items-center gap-4">
                <div className="px-5 py-2.5 bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2 shadow-lg shadow-indigo-500/40">
                    <Sparkles size={16} /> GOVERNANCE SECURED
                </div>
            </div>
        </div>
      </div>

      <div className="space-y-12">
        {/* SELECTION PANEL */}
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 lg:p-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
            <div className="flex flex-col md:flex-row items-center gap-6">
                {[
                    { id: "domestic", label: "Domestic Registry", icon: MapPin },
                    { id: "international", label: "Global Registry", icon: Globe }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 flex items-center justify-between p-5 rounded-2xl border-4 transition-all group ${
                            activeTab === tab.id 
                            ? "bg-indigo-700 border-indigo-700 text-white shadow-xl shadow-indigo-500/40" 
                            : "bg-slate-50 dark:bg-slate-800 border-transparent text-slate-500 hover:border-indigo-700/20"
                        }`}
                    >
                        <div className="flex items-center gap-4">
                            <div className={`size-12 rounded-xl flex items-center justify-center transition-all shadow-md ${
                                activeTab === tab.id ? "bg-white/20" : "bg-white dark:bg-slate-900 text-indigo-700"
                            }`}>
                                <tab.icon size={24} strokeWidth={2.5} />
                            </div>
                            <span className="text-sm md:text-base font-black uppercase tracking-[0.15em]">{tab.label}</span>
                        </div>
                        <Zap size={20} className={activeTab === tab.id ? "opacity-100 animate-pulse" : "opacity-0 group-hover:opacity-100 transition-opacity"} />
                    </button>
                ))}
            </div>
            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-4 p-5 rounded-2xl bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/20">
                    <CheckCircle2 size={24} className="text-indigo-700 shrink-0" />
                    <p className="text-xs font-black text-indigo-800 dark:text-indigo-400 uppercase tracking-widest leading-relaxed">
                        Governance framework synchronized across all public touchpoints for the selected region.
                    </p>
                </div>
            </div>
        </div>

        {/* EDITOR PANEL */}
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 lg:p-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none flex flex-col">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8 pb-6 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-700 rounded-lg flex items-center justify-center text-white shadow-md">
                        <FileText size={20} />
                    </div>
                    <div className="text-left">
                       <h2 className="text-xl font-black text-slate-950 dark:text-white tracking-tight uppercase">{activeTab} Framework</h2>
                       <p className="text-[10px] font-black text-indigo-700 uppercase tracking-widest mt-0.5">Authorized Compliance Context Engine</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                    {!isEditing ? (
                        <button
                            onClick={() => setIsEditing(true)}
                            disabled={loading}
                            className="w-full md:w-auto px-6 py-3 bg-slate-950 text-white rounded-xl text-xs font-black uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-lg shadow-black/20 disabled:opacity-30 flex items-center justify-center gap-3"
                        >
                            <Edit size={16} /> Edit Compliance Registry
                        </button>
                    ) : (
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="w-full md:w-auto px-6 py-3 bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-[0.2em] hover:bg-indigo-800 transition-all shadow-lg shadow-indigo-500/40 flex items-center justify-center gap-3"
                        >
                            {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                            {isSaving ? "Syncing Logic..." : "Commit Framework"}
                        </button>
                    )}
                </div>
            </div>

            <div className="flex-1 flex flex-col">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-6">
                        <Loader2 className="animate-spin text-indigo-700" size={48} strokeWidth={1.5} />
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Loading Registry Assets...</p>
                    </div>
                ) : isEditing ? (
                    <textarea
                        value={textContent}
                        onChange={(e) => setTextContent(e.target.value)}
                        className="flex-1 w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-indigo-700/30 rounded-2xl p-6 lg:p-8 text-base font-medium text-slate-950 dark:text-slate-200 leading-relaxed placeholder:text-slate-400 outline-none transition-all no-scrollbar shadow-inner min-h-[400px]"
                        placeholder={`Drafting global ${activeTab} terms and conditions...`}
                    />
                ) : (
                    <div className="flex-1 p-6 lg:p-8 text-slate-800 dark:text-slate-300 text-base font-medium leading-relaxed whitespace-pre-line bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800/50 shadow-inner text-left min-h-[400px]">
                        {textContent || <span className="italic text-slate-400">Compliance registry is currently empty and pending documentation.</span>}
                    </div>
                )}
            </div>
        </div>
      </div>
    </motion.div>
  );
};

export default HoneymoonTermsAndCondition;
