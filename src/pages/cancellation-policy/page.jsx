import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Loader2, FileText, Edit, Save, ShieldCheck, AlertCircle, Info, Sparkles, Zap, ShieldX } from "lucide-react";
import { apiClient } from "../../stores/authStores";
import { motion, AnimatePresence } from "framer-motion";

const HoneymoonCancellationPolicy = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [textContent, setTextContent] = useState("");

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setIsLoading(true);
        const res = await apiClient.get(`/admin/honeymoon-cancellation-policy`);
        setTextContent(res?.data?.data?.honeymoon_cancellation_policy || "");
      } catch (error) {
        toast.error("Failed to load honeymoon cancellation policy.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchContent();
  }, []);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await apiClient.put(`/admin/honeymoon-cancellation-policy`, {
        honeymoon_cancellation_policy: textContent,
      });
      toast.success("Policy synchronized successfully 💕");
      setIsEditing(false);
    } catch (error) {
      toast.error("Synchronization failure");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-[1400px] mx-auto space-y-10 pb-20 px-6">
      {/* HEADER HUB */}
      <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-12 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none text-indigo-600"><ShieldX size={200} /></div>
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div>
                <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-4">
                    <ShieldCheck className="text-indigo-600" size={36} /> CANCELLATION VAULT
                </h1>
                <p className="text-slate-500 font-medium mt-2 text-lg italic">Strategic revocation terms and risk mitigation protocols</p>
            </div>
            <div className="flex items-center gap-3">
                <div className="px-6 py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-2xl shadow-indigo-500/30">
                    <Sparkles size={16} /> COMPLIANCE READY
                </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* INFO PANEL */}
        <div className="lg:col-span-4 space-y-6">
            <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden group">
                <Zap className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform" size={120} />
                <h3 className="text-xl font-black uppercase tracking-wider mb-4">Risk Protocol</h3>
                <p className="text-indigo-100 font-medium leading-relaxed">
                    Clear cancellation terms protect both the brand and the couple. Ensure all non-refundable deposits are explicitly stated.
                </p>
                <div className="mt-8 flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] bg-white/10 w-fit px-4 py-2 rounded-full backdrop-blur-md">
                    <AlertCircle size={14} /> Strict Compliance
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Last Synchronized</h4>
                <div className="flex items-center gap-4">
                    <div className="size-12 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-indigo-600">
                        <Info size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">Active Version</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">v2.4.0 • Live</p>
                    </div>
                </div>
            </div>
        </div>

        {/* EDITOR PANEL */}
        <div className="lg:col-span-8">
            <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none min-h-[600px] flex flex-col">
                <div className="flex items-center justify-between mb-8 pb-8 border-b border-slate-50 dark:border-slate-800">
                    <div className="flex items-center gap-4">
                        <div className="size-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center text-indigo-600">
                            <FileText size={24} />
                        </div>
                        <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Honeymoon Policy Context</h2>
                    </div>

                    {!isEditing ? (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-black/10"
                        >
                            <Edit className="inline mr-2" size={14} /> Edit Registry
                        </button>
                    ) : (
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2"
                        >
                            {isSaving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                            {isSaving ? "Syncing..." : "Commit Changes"}
                        </button>
                    )}
                </div>

                <div className="flex-1">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-40 gap-4">
                            <Loader2 className="animate-spin text-indigo-600" size={48} strokeWidth={1} />
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Loading Registry</p>
                        </div>
                    ) : isEditing ? (
                        <textarea
                            value={textContent}
                            onChange={(e) => setTextContent(e.target.value)}
                            className="w-full min-h-[450px] bg-slate-50 dark:bg-slate-800/50 border-none rounded-[2rem] p-8 text-sm font-bold text-slate-700 dark:text-slate-200 leading-relaxed placeholder:text-slate-300 focus:ring-2 focus:ring-indigo-500/10 transition-all no-scrollbar"
                            placeholder="Drafting honeymoon revocation terms..."
                        />
                    ) : (
                        <div className="p-8 text-slate-600 dark:text-slate-300 text-sm font-bold leading-relaxed whitespace-pre-line bg-slate-50 dark:bg-slate-800/20 rounded-[2rem] border border-slate-50 dark:border-slate-800/40">
                            {textContent || "Registry is currently empty."}
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>
    </motion.div>
  );
};

export default HoneymoonCancellationPolicy;
