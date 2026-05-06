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
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-full mx-auto space-y-10 pb-20 px-6 text-left">
      {/* HEADER HUB */}
      <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-12 border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none text-indigo-700"><ShieldX size={240} /></div>
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-10">
            <div>
                <h1 className="text-4xl font-black text-slate-950 dark:text-white tracking-tight flex items-center gap-5">
                    <ShieldCheck className="text-indigo-700" size={44} /> CANCELLATION VAULT
                </h1>
                <p className="text-slate-600 dark:text-slate-400 font-bold mt-2 text-xl italic text-left">Strategic revocation terms and risk mitigation protocols</p>
            </div>
            <div className="flex items-center gap-5">
                <div className="px-8 py-5 bg-indigo-700 text-white rounded-[1.5rem] text-sm font-black uppercase tracking-[0.2em] flex items-center gap-3 shadow-2xl shadow-indigo-500/40">
                    <Sparkles size={20} /> COMPLIANCE READY
                </div>
            </div>
        </div>
      </div>

      <div className="space-y-12">
        {/* INFO PANEL */}
        <div className="bg-indigo-700 rounded-[3rem] p-12 text-white shadow-2xl shadow-indigo-500/40 relative overflow-hidden group">
            <Zap className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform" size={200} />
            <h3 className="text-3xl font-black uppercase tracking-wider mb-8 flex items-center gap-4">
                <AlertCircle size={32} /> Operational Risk Protocol
            </h3>
            <p className="text-indigo-100 text-2xl font-black leading-relaxed italic max-w-4xl">
                "Precision in cancellation governance mitigates transactional friction and secures brand integrity. Ensure every fiscal penalty is explicitly documented."
            </p>
            <div className="mt-12 flex items-center justify-between">
                <div className="flex items-center gap-5 text-sm font-black uppercase tracking-[0.3em] bg-white/10 w-fit px-8 py-4 rounded-2xl backdrop-blur-md border border-white/20">
                    <ShieldCheck size={20} /> Strict Compliance Framework
                </div>
                <div className="flex items-center gap-6">
                    <div className="size-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md shadow-xl border border-white/10">
                        <Info size={32} />
                    </div>
                    <div className="text-left">
                        <p className="text-lg font-black text-white uppercase tracking-tight">Active Engine</p>
                        <p className="text-[10px] font-black text-indigo-200 uppercase tracking-[0.4em] mt-1">v2.4.0 • STABLE</p>
                    </div>
                </div>
            </div>
        </div>

        {/* EDITOR PANEL */}
        <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] p-12 border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none min-h-[700px] flex flex-col">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-12 pb-12 border-b-4 border-slate-50 dark:border-slate-800">
                <div className="flex items-center gap-6">
                    <div className="size-20 bg-indigo-700 rounded-[1.5rem] flex items-center justify-center text-white shadow-2xl shadow-indigo-500/30">
                        <FileText size={40} />
                    </div>
                    <div className="text-left">
                       <h2 className="text-3xl font-black text-slate-950 dark:text-white tracking-tight uppercase">Revocation Policy</h2>
                       <p className="text-xs font-black text-indigo-700 uppercase tracking-widest mt-2">Authorized Governance Registry Engine</p>
                    </div>
                </div>

                <div className="flex items-center gap-5 w-full md:w-auto">
                    {!isEditing ? (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="w-full md:w-auto px-12 py-6 bg-slate-950 text-white rounded-[1.5rem] text-sm font-black uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-2xl shadow-black/20 flex items-center justify-center gap-4"
                        >
                            <Edit size={22} /> Edit Revocation Framework
                        </button>
                    ) : (
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="w-full md:w-auto px-12 py-6 bg-indigo-700 text-white rounded-[1.5rem] text-sm font-black uppercase tracking-[0.2em] hover:bg-indigo-800 transition-all shadow-2xl shadow-indigo-500/40 flex items-center justify-center gap-4"
                        >
                            {isSaving ? <Loader2 className="animate-spin" size={22} /> : <Save size={22} />}
                            {isSaving ? "Syncing Logic..." : "Commit Protocol"}
                        </button>
                    )}
                </div>
            </div>

            <div className="flex-1 flex flex-col">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-48 gap-8">
                        <Loader2 className="animate-spin text-indigo-700" size={64} strokeWidth={1.5} />
                        <p className="text-xs font-black uppercase tracking-[0.4em] text-slate-400">Loading Revocation Assets...</p>
                    </div>
                ) : isEditing ? (
                    <textarea
                        value={textContent}
                        onChange={(e) => setTextContent(e.target.value)}
                        className="flex-1 w-full bg-slate-50 dark:bg-slate-800/50 border-4 border-transparent focus:border-indigo-700/10 rounded-[3rem] p-12 text-2xl font-black text-slate-950 dark:text-slate-200 leading-relaxed placeholder:text-slate-300 outline-none transition-all no-scrollbar shadow-inner min-h-[500px]"
                        placeholder="Drafting honeymoon revocation terms..."
                    />
                ) : (
                    <div className="flex-1 p-12 text-slate-950 dark:text-slate-300 text-2xl font-black leading-relaxed whitespace-pre-line bg-slate-50 dark:bg-slate-800/30 rounded-[3rem] border-4 border-slate-100 dark:border-slate-800/50 shadow-inner text-left italic min-h-[500px]">
                        {textContent || "Revocation terms are currently undefined in the registry."}
                    </div>
                )}
            </div>
        </div>
      </div>
    </motion.div>
  );
};

export default HoneymoonCancellationPolicy;
