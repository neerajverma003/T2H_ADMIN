import React, { useState, useEffect } from "react";
import { apiClient } from "../../stores/authStores";
import { toast } from "react-toastify";
import { 
    CreditCard, 
    Save, 
    Edit, 
    Loader2, 
    Globe, 
    MapPin, 
    Sparkles, 
    Plus,
    Trash2
} from "lucide-react";
import { motion } from "framer-motion";

const HoneymoonPaymentMode = () => {
  const [category, setCategory] = useState("domestic");
  const [rules, setRules] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchPaymentMode = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get(`/admin/honeymoon/payment-mode/${category}`);
        if (res.data?.success) {
          const rawText = res.data.destinationPaymentModeData?.honeymoon_payment_mode || "";
          const parsedRules = rawText.split('\n').map(r => r.trim()).filter(Boolean);
          setRules(parsedRules);
        }
      } catch (error) {
        toast.error("Failed to load payment mode terms.");
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentMode();
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
      await apiClient.post("/admin/honeymoon/payment-mode", {
        type: category,
        honeymoon_payment_mode: combinedText,
      });
      toast.success(`${category.toUpperCase()} payment terms updated! ✨`);
      setIsEditing(false);
    } catch (error) {
      toast.error("Failed to save payment terms.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-full mx-auto space-y-8 pb-20 px-6 text-left">
      {/* HEADER HUB */}
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 lg:p-8 border border-slate-100 dark:border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none text-indigo-700"><CreditCard size={160} /></div>
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600 dark:text-indigo-400 mb-1">
                    Governance & Risk
                </p>
                <h1 className="text-2xl font-black text-slate-950 dark:text-white tracking-tight flex items-center gap-3">
                    Payment Mode <span className="text-indigo-600">Terms & Policy</span>
                </h1>
                <p className="text-slate-600 dark:text-slate-400 font-bold mt-1 text-xs italic text-left">
                    Defining transactional payment schedules and deposit guidelines for all packages.
                </p>
            </div>
            <div className="flex items-center gap-4">
                <div className="px-5 py-2.5 bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2 shadow-lg shadow-indigo-500/40">
                    <Sparkles size={16} /> TRANSACTION READY
                </div>
            </div>
        </div>
      </div>

      {/* REGIONAL CATEGORY SELECTOR (MATCHING ADMIRE HOLIDAYS) */}
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 lg:p-8 border border-slate-100 dark:border-slate-800 shadow-xl space-y-4">
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">
              REGIONAL CATEGORY
          </label>
          <div className="flex gap-4 max-w-md">
              {[
                  { id: "domestic", label: "DOMESTIC", icon: MapPin },
                  { id: "international", label: "INTERNATIONAL", icon: Globe }
              ].map((tab) => (
                  <button
                      key={tab.id}
                      type="button"
                      onClick={() => setCategory(tab.id)}
                      className={`flex-1 py-3 px-6 rounded-xl border-2 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                          category === tab.id 
                          ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/30" 
                          : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-indigo-500/40"
                      }`}
                  >
                      <tab.icon size={16} />
                      {tab.label}
                  </button>
              ))}
          </div>
      </div>

      {/* TRANSACTION INSTRUCTIONS BOX-WISE VIEW (ADMIRE HOLIDAYS STYLE) */}
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 lg:p-8 border border-slate-100 dark:border-slate-800 shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
              <div className="flex items-center gap-4">
                  <div className="size-12 bg-indigo-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-indigo-600">
                      <CreditCard size={24} />
                  </div>
                  <div>
                      <h2 className="text-xl font-black text-slate-950 dark:text-white tracking-tight capitalize">
                          Transaction Instructions — {category}
                      </h2>
                      <p className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mt-0.5">
                          {rules.length} GATEWAYS CONFIGURED
                      </p>
                  </div>
              </div>

              {!isEditing ? (
                  <button
                      onClick={() => setIsEditing(true)}
                      disabled={loading}
                      className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-[0.2em] hover:bg-indigo-700 transition-all shadow-md flex items-center gap-2"
                  >
                      <Edit size={14} /> MODIFY CONFIG
                  </button>
              ) : (
                  <div className="flex items-center gap-3">
                      <button
                          onClick={() => setIsEditing(false)}
                          className="px-4 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-slate-300 transition-all"
                      >
                          CANCEL
                      </button>
                      <button
                          onClick={handleSave}
                          disabled={isSaving}
                          className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-[0.2em] hover:bg-indigo-700 transition-all shadow-md flex items-center gap-2"
                      >
                          {isSaving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                          {isSaving ? "SAVING..." : "SAVE CHANGES"}
                      </button>
                  </div>
              )}
          </div>

          {loading ? (
              <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-indigo-600" size={36} /></div>
          ) : isEditing ? (
              <div className="space-y-4">
                  {rules.map((rule, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-sm group">
                          <span className="text-slate-400 font-black px-2 text-sm">&gt;</span>
                          <input
                              type="text"
                              value={rule}
                              onChange={(e) => handleRuleChange(idx, e.target.value)}
                              className="flex-1 bg-transparent text-slate-900 dark:text-white font-semibold text-sm outline-none placeholder:text-slate-400"
                              placeholder="Enter payment instruction rule..."
                          />
                          <button
                              type="button"
                              onClick={() => handleDeleteRule(idx)}
                              className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                          >
                              <Trash2 size={16} />
                          </button>
                      </div>
                  ))}

                  <button
                      type="button"
                      onClick={handleAddRule}
                      className="w-full py-4 border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-indigo-600/50 rounded-2xl text-slate-500 dark:text-slate-400 hover:text-indigo-600 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all mt-4"
                  >
                      <Plus size={16} /> APPEND PAYMENT INSTRUCTION
                  </button>
              </div>
          ) : (
              <div className="space-y-3">
                  {rules.length > 0 ? (
                      rules.map((rule, idx) => (
                          <div key={idx} className="p-4.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-3 shadow-xs hover:border-indigo-500/30 transition-all">
                              <div className="flex items-start gap-3">
                                  <span className="text-slate-400 font-black text-sm shrink-0 mt-0.5">&gt;</span>
                                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-relaxed text-left">
                                      {rule}
                                  </p>
                              </div>
                          </div>
                      ))
                  ) : (
                      <div className="p-8 text-center text-slate-400 italic bg-slate-50 dark:bg-slate-800/30 rounded-2xl">
                          No payment mode terms defined for {category} packages yet. Click MODIFY CONFIG to add instructions.
                      </div>
                  )}
              </div>
          )}
      </div>
    </motion.div>
  );
};

export default HoneymoonPaymentMode;
