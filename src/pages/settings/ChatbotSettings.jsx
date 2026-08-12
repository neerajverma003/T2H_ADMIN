import React, { useState, useEffect } from "react";
import { apiClient } from "../../stores/authStores";
import {
  MessageSquare,
  Sparkles,
  Save,
  Loader2,
  RefreshCw,
  Plus,
  Trash2,
  HelpCircle,
  CheckCircle2,
  Layers,
  MapPin,
  DollarSign,
  Calendar,
  Send,
} from "lucide-react";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

const DEFAULT_SETTINGS = {
  step1: {
    botMessage: "Hi! 👋 I'm your travel assistant. I'm here to help you plan your perfect trip! What type of travel are you interested in?",
    options: ["Vacation/Holiday", "Business Travel", "Adventure Travel", "Family Trip", "Honeymoon"],
  },
  step2: {
    botMessage: "Would you like to travel domestically or internationally?",
    options: ["Domestic", "International"],
  },
  step3: {
    botMessageDomestic: "Great! Where would you like to travel in India?",
    botMessageInternational: "Great! Where would you like to travel internationally?",
  },
  step4: {
    botMessage: "Excellent! What's your approximate budget range? 💰",
    options: ["Under ₹10,000", "₹10,000 - ₹30,000", "₹30,000 - ₹50,000", "₹50,000 - ₹1,00,000", "Above ₹1,00,000"],
  },
  step5: {
    botMessage: "Perfect! When are you planning to travel? 🗓️",
    options: ["Within 1 month", "1-3 months", "3-6 months", "6-12 months", "Just exploring"],
    leadFormPromptMessage: "Wonderful! I have some great options for you. To send you personalized recommendations, could you please share your contact details? 📧",
  },
};

const ChatbotSettings = () => {
  const [formData, setFormData] = useState(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // New option temporary inputs for each step
  const [newOptionStep1, setNewOptionStep1] = useState("");
  const [newOptionStep2, setNewOptionStep2] = useState("");
  const [newOptionStep4, setNewOptionStep4] = useState("");
  const [newOptionStep5, setNewOptionStep5] = useState("");

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get("/admin/chatbot-settings");
      if (res.data?.success && res.data?.data) {
        const d = res.data.data;
        setFormData({
          step1: {
            botMessage: d.step1?.botMessage || DEFAULT_SETTINGS.step1.botMessage,
            options: Array.isArray(d.step1?.options) && d.step1.options.length > 0 ? d.step1.options : DEFAULT_SETTINGS.step1.options,
          },
          step2: {
            botMessage: d.step2?.botMessage || DEFAULT_SETTINGS.step2.botMessage,
            options: Array.isArray(d.step2?.options) && d.step2.options.length > 0 ? d.step2.options : DEFAULT_SETTINGS.step2.options,
          },
          step3: {
            botMessageDomestic: d.step3?.botMessageDomestic || DEFAULT_SETTINGS.step3.botMessageDomestic,
            botMessageInternational: d.step3?.botMessageInternational || DEFAULT_SETTINGS.step3.botMessageInternational,
          },
          step4: {
            botMessage: d.step4?.botMessage || DEFAULT_SETTINGS.step4.botMessage,
            options: Array.isArray(d.step4?.options) && d.step4.options.length > 0 ? d.step4.options : DEFAULT_SETTINGS.step4.options,
          },
          step5: {
            botMessage: d.step5?.botMessage || DEFAULT_SETTINGS.step5.botMessage,
            options: Array.isArray(d.step5?.options) && d.step5.options.length > 0 ? d.step5.options : DEFAULT_SETTINGS.step5.options,
            leadFormPromptMessage: d.step5?.leadFormPromptMessage || DEFAULT_SETTINGS.step5.leadFormPromptMessage,
          },
        });
      }
    } catch (err) {
      toast.error(err.response?.data?.msg || "Failed to load chatbot settings.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Helper functions to handle option additions
  const handleAddOption = (stepKey, value, setInputState) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    setFormData((prev) => ({
      ...prev,
      [stepKey]: {
        ...prev[stepKey],
        options: [...prev[stepKey].options, trimmed],
      },
    }));
    setInputState("");
  };

  const handleRemoveOption = (stepKey, index) => {
    setFormData((prev) => ({
      ...prev,
      [stepKey]: {
        ...prev[stepKey],
        options: prev[stepKey].options.filter((_, i) => i !== index),
      },
    }));
  };

  const handleOptionChange = (stepKey, index, newValue) => {
    setFormData((prev) => {
      const updatedOpts = [...prev[stepKey].options];
      updatedOpts[index] = newValue;
      return {
        ...prev,
        [stepKey]: {
          ...prev[stepKey],
          options: updatedOpts,
        },
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await apiClient.put("/admin/chatbot-settings", formData);
      if (res.data?.success) {
        toast.success("Travel Assistant configuration saved successfully! ✨");
      } else {
        throw new Error(res.data?.msg || "Save failed");
      }
    } catch (err) {
      toast.error(err.response?.data?.msg || err.message || "Failed to update chatbot settings.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4 text-slate-900 dark:text-white">
        <Loader2 className="animate-spin text-purple-600 dark:text-purple-400" size={48} strokeWidth={2} />
        <p className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
          Loading Travel Assistant Settings...
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-16 text-slate-900 dark:text-white font-sans max-w-6xl mx-auto"
    >
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div>
          <span className="text-purple-600 dark:text-purple-400 font-bold tracking-widest text-[11px] uppercase flex items-center gap-1.5 mb-1">
            <Sparkles size={14} className="text-purple-600 dark:text-purple-400 animate-pulse" /> CHATBOT MANAGER
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Travel Assistant <span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 dark:from-purple-400 dark:via-indigo-400 dark:to-blue-400 bg-clip-text text-transparent">Dynamic Controls</span>
          </h1>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Customize all bot prompts, messages, and selectable option pills for every step of the 5-step trip planning assistant.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchSettings}
            className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-2xl text-xs font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-2 transition-all cursor-pointer shadow-xs"
          >
            <RefreshCw size={15} /> Reload
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSaving}
            className="px-6 py-2.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-2xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer shadow-md disabled:opacity-50"
          >
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Save All Changes
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* STEP 1 CARD */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="w-9 h-9 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-black text-sm">
              1
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Step 1: Welcome & Travel Types</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Configure the opening greeting message and initial trip type pills.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Bot Question Prompt Message
              </label>
              <textarea
                rows={2}
                value={formData.step1.botMessage}
                onChange={(e) =>
                  setFormData({ ...formData, step1: { ...formData.step1, botMessage: e.target.value } })
                }
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Selectable Travel Type Options
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.step1.options.map((opt, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1.5 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 px-3 py-1.5 rounded-xl text-xs font-bold text-purple-700 dark:text-purple-300"
                  >
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => handleOptionChange("step1", idx, e.target.value)}
                      className="bg-transparent border-none outline-none text-xs font-bold text-purple-700 dark:text-purple-300 w-auto min-w-[80px]"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveOption("step1", idx)}
                      className="text-purple-400 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 max-w-md">
                <input
                  type="text"
                  placeholder="Add new travel type option..."
                  value={newOptionStep1}
                  onChange={(e) => setNewOptionStep1(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddOption("step1", newOptionStep1, setNewOptionStep1);
                    }
                  }}
                  className="flex-1 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleAddOption("step1", newOptionStep1, setNewOptionStep1)}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl flex items-center gap-1 transition-all"
                >
                  <Plus size={14} /> Add
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* STEP 2 CARD */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="w-9 h-9 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black text-sm">
              2
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Step 2: Region / Destination Type</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Configure prompt message and region options (e.g. Domestic, International).</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Bot Question Prompt Message
              </label>
              <textarea
                rows={2}
                value={formData.step2.botMessage}
                onChange={(e) =>
                  setFormData({ ...formData, step2: { ...formData.step2, botMessage: e.target.value } })
                }
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Region / Destination Type Options
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.step2.options.map((opt, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 px-3 py-1.5 rounded-xl text-xs font-bold text-blue-700 dark:text-blue-300"
                  >
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => handleOptionChange("step2", idx, e.target.value)}
                      className="bg-transparent border-none outline-none text-xs font-bold text-blue-700 dark:text-blue-300 w-auto min-w-[80px]"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveOption("step2", idx)}
                      className="text-blue-400 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 max-w-md">
                <input
                  type="text"
                  placeholder="Add new region option..."
                  value={newOptionStep2}
                  onChange={(e) => setNewOptionStep2(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddOption("step2", newOptionStep2, setNewOptionStep2);
                    }
                  }}
                  className="flex-1 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleAddOption("step2", newOptionStep2, setNewOptionStep2)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1 transition-all"
                >
                  <Plus size={14} /> Add
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* STEP 3 CARD */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="w-9 h-9 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black text-sm">
              3
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Step 3: Destination Prompts</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Configure bot question prompts for domestic and international trips.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Domestic Trips Bot Question Prompt
              </label>
              <textarea
                rows={2}
                value={formData.step3.botMessageDomestic}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    step3: { ...formData.step3, botMessageDomestic: e.target.value },
                  })
                }
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                International Trips Bot Question Prompt
              </label>
              <textarea
                rows={2}
                value={formData.step3.botMessageInternational}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    step3: { ...formData.step3, botMessageInternational: e.target.value },
                  })
                }
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 p-4 rounded-2xl flex items-start gap-3">
              <CheckCircle2 className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" size={18} />
              <p className="text-xs text-emerald-800 dark:text-emerald-300 font-medium leading-relaxed">
                <strong>Dynamic Database Destinations:</strong> Destination pills in Step 3 automatically load directly from your Destination Database based on type (Domestic vs International).
              </p>
            </div>
          </div>
        </div>

        {/* STEP 4 CARD */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="w-9 h-9 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black text-sm">
              4
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Step 4: Budget Range Selection</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Configure prompt message and selectable budget range pills.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Bot Question Prompt Message
              </label>
              <textarea
                rows={2}
                value={formData.step4.botMessage}
                onChange={(e) =>
                  setFormData({ ...formData, step4: { ...formData.step4, botMessage: e.target.value } })
                }
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Selectable Budget Options
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.step4.options.map((opt, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 px-3 py-1.5 rounded-xl text-xs font-bold text-amber-700 dark:text-amber-300"
                  >
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => handleOptionChange("step4", idx, e.target.value)}
                      className="bg-transparent border-none outline-none text-xs font-bold text-amber-700 dark:text-amber-300 w-auto min-w-[90px]"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveOption("step4", idx)}
                      className="text-amber-400 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 max-w-md">
                <input
                  type="text"
                  placeholder="Add budget option (e.g. ₹20,000 - ₹40,000)..."
                  value={newOptionStep4}
                  onChange={(e) => setNewOptionStep4(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddOption("step4", newOptionStep4, setNewOptionStep4);
                    }
                  }}
                  className="flex-1 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleAddOption("step4", newOptionStep4, setNewOptionStep4)}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl flex items-center gap-1 transition-all"
                >
                  <Plus size={14} /> Add
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* STEP 5 CARD */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="w-9 h-9 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center font-black text-sm">
              5
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Step 5: Timeframe & Lead Form</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Configure trip timeframe options and the final contact details form prompt message.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Bot Timeframe Question Prompt Message
              </label>
              <textarea
                rows={2}
                value={formData.step5.botMessage}
                onChange={(e) =>
                  setFormData({ ...formData, step5: { ...formData.step5, botMessage: e.target.value } })
                }
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Selectable Timeframe Options
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.step5.options.map((opt, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-700 dark:text-rose-300"
                  >
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => handleOptionChange("step5", idx, e.target.value)}
                      className="bg-transparent border-none outline-none text-xs font-bold text-rose-700 dark:text-rose-300 w-auto min-w-[90px]"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveOption("step5", idx)}
                      className="text-rose-400 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 max-w-md">
                <input
                  type="text"
                  placeholder="Add timeframe option (e.g. Next 2 weeks)..."
                  value={newOptionStep5}
                  onChange={(e) => setNewOptionStep5(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddOption("step5", newOptionStep5, setNewOptionStep5);
                    }
                  }}
                  className="flex-1 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleAddOption("step5", newOptionStep5, setNewOptionStep5)}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl flex items-center gap-1 transition-all"
                >
                  <Plus size={14} /> Add
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Lead Form Introduction Prompt Message
              </label>
              <textarea
                rows={2}
                value={formData.step5.leadFormPromptMessage}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    step5: { ...formData.step5, leadFormPromptMessage: e.target.value },
                  })
                }
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* BOTTOM SAVE BAR */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isSaving}
            className="px-8 py-3.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-2xl text-xs font-extrabold flex items-center gap-2.5 transition-all cursor-pointer shadow-lg disabled:opacity-50"
          >
            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            Save Travel Assistant Settings
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default ChatbotSettings;
