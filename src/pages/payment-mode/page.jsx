import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Loader2, FileText, Edit, Save, CreditCard, Sparkles, Zap, ShieldCheck, Globe, MapPin, Info } from "lucide-react";
import { apiClient } from "../../stores/authStores";
import { motion, AnimatePresence } from "framer-motion";

const HoneymoonPaymentMode = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [travelType, setTravelType] = useState("domestic");
  const [textContent, setTextContent] = useState("");

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setIsLoading(true);
        const res = await apiClient.get(`/admin/honeymoon/payment-mode/${travelType}`);
        const content = res?.data?.destinationPaymentModeData?.honeymoon_payment_mode || "";
        setTextContent(content);
      } catch (error) {
        toast.error("Failed to load honeymoon payment mode.");
      } finally {
        setIsLoading(false);
      }
    };
    if (travelType) fetchContent();
  }, [travelType]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await apiClient.post(`/admin/honeymoon/payment-mode`, {
        type: travelType,
        honeymoon_payment_mode: textContent,
      });
      toast.success("Payment protocols synchronized 💕");
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
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none text-indigo-600"><CreditCard size={200} /></div>
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div>
                <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-4">
                    <ShieldCheck className="text-indigo-600" size={36} /> PAYMENT ARCHIVE
                </h1>
                <p className="text-slate-500 font-medium mt-2 text-lg italic">Strategic financial protocols and transactional guidelines</p>
            </div>
            <div className="flex items-center gap-3">
                <div className="px-6 py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-2xl shadow-indigo-500/30">
                    <Sparkles size={16} /> TRANSACTION READY
                </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* SELECTION PANEL */}
        <div className="lg:col-span-4 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none space-y-8">
                <div>
                    <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Regional Focus</label>
                    <div className="space-y-3">
                        {["domestic", "international"].map((type) => (
                            <button
                                key={type}
                                onClick={() => { setTravelType(type); setIsEditing(false); }}
                                className={`w-full flex items-center justify-between p-5 rounded-2xl border transition-all group ${
                                    travelType === type 
                                    ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/20" 
                                    : "bg-slate-50 dark:bg-slate-800 border-transparent text-slate-400 hover:border-indigo-100"
                                }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`size-10 rounded-xl flex items-center justify-center transition-all ${
                                        travelType === type ? "bg-white/20" : "bg-white dark:bg-slate-900 text-indigo-600"
                                    }`}>
                                        {type === 'domestic' ? <MapPin size={20} /> : <Globe size={20} />}
                                    </div>
                                    <span className="text-sm font-black uppercase tracking-widest capitalize">{type}</span>
                                </div>
                                <Zap size={14} className={travelType === type ? "opacity-100" : "opacity-0 group-hover:opacity-100 transition-opacity"} />
                            </button>
                        ))}
                    </div>
                </div>

                <div className="pt-8 border-t border-slate-50 dark:border-slate-800">
                    <div className="flex items-start gap-4 p-6 rounded-3xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20">
                        <Info size={20} className="text-amber-600 shrink-0" />
                        <p className="text-[10px] font-bold text-amber-700 dark:text-amber-500 uppercase tracking-widest leading-relaxed">
                            Payment modes vary based on regional regulations and currency compliance.
                        </p>
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
                        <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Payment Protocol Context</h2>
                    </div>

                    {!isEditing ? (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-black/10"
                        >
                            <Edit className="inline mr-2" size={14} /> Edit Protocol
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
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Loading Protocol Registry</p>
                        </div>
                    ) : isEditing ? (
                        <textarea
                            value={textContent}
                            onChange={(e) => setTextContent(e.target.value)}
                            className="w-full min-h-[450px] bg-slate-50 dark:bg-slate-800/50 border-none rounded-[2rem] p-8 text-sm font-bold text-slate-700 dark:text-slate-200 leading-relaxed placeholder:text-slate-300 focus:ring-2 focus:ring-indigo-500/10 transition-all no-scrollbar"
                            placeholder={`Drafting transactional protocols for ${travelType} journeys...`}
                        />
                    ) : (
                        <div className="p-8 text-slate-600 dark:text-slate-300 text-sm font-bold leading-relaxed whitespace-pre-line bg-slate-50 dark:bg-slate-800/20 rounded-[2rem] border border-slate-50 dark:border-slate-800/40">
                            {textContent || `No payment mode defined for ${travelType} trips.`}
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>
    </motion.div>
  );
};

export default HoneymoonPaymentMode;
