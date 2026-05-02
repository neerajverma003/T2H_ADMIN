import React, { useState, useEffect } from "react";
import { FiFileText, FiSave, FiEdit, FiLoader, FiGlobe, FiMapPin } from "react-icons/fi";
import { apiClient } from "../../stores/authStores";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

const HoneymoonTermsAndCondition = () => {
  const [activeTab, setActiveTab] = useState("domestic"); // 'domestic' or 'international'
  const [textContent, setTextContent] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch global honeymoon terms based on active tab
  useEffect(() => {
    const fetchTerms = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get(`/admin/global-tnc?type=${activeTab}`);
        setTextContent(res.data?.data?.terms_And_condition || "");
      } catch (error) {
        console.error("Fetch Global TNC error:", error);
        toast.error(`Failed to load ${activeTab} terms.`);
      } finally {
        setLoading(false);
      }
    };
    fetchTerms();
    setIsEditing(false); // Reset editing state on tab change
  }, [activeTab]);

  // Save terms for the specific category
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await apiClient.put("/admin/global-tnc", {
        type: activeTab,
        terms_And_condition: textContent,
      });
      toast.success(`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} terms saved successfully! ✨`);
      setIsEditing(false);
    } catch (error) {
      console.error("Update Global TNC error:", error);
      toast.error("Something went wrong while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-y-8 p-4 md:p-8 max-w-5xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 flex items-center gap-3">
            Honeymoon Terms Management <span className="text-pink-500">❤️</span>
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Manage global terms & conditions separately for Domestic and International honeymoon trips.
          </p>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab("domestic")}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            activeTab === "domestic"
              ? "bg-white text-blue-600 shadow-sm dark:bg-slate-700 dark:text-blue-400"
              : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          <FiMapPin /> Domestic Terms
        </button>
        <button
          onClick={() => setActiveTab("international")}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            activeTab === "international"
              ? "bg-white text-blue-600 shadow-sm dark:bg-slate-700 dark:text-blue-400"
              : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          <FiGlobe /> International Terms
        </button>
      </div>

      {/* Editor Section */}
      <motion.div 
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden"
      >
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${activeTab === 'domestic' ? 'bg-green-50 dark:bg-green-900/30' : 'bg-purple-50 dark:bg-purple-900/30'}`}>
              <FiFileText className={activeTab === 'domestic' ? 'text-green-600' : 'text-purple-600'} size={20} />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50">
              {activeTab === 'domestic' ? 'Domestic' : 'International'} Booking Terms
            </h2>
          </div>
          {!isEditing && !loading && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition"
            >
              <FiEdit /> Edit Content
            </button>
          )}
        </div>

        <div className="p-6 min-h-[400px] flex flex-col">
          {loading ? (
            <div className="flex flex-1 items-center justify-center py-20">
              <FiLoader className="h-10 w-10 animate-spin text-blue-600" />
            </div>
          ) : isEditing ? (
            <div className="space-y-6 flex-1 flex flex-col">
              <textarea
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                className="w-full flex-1 min-h-[400px] rounded-xl border border-slate-200 bg-slate-50 p-6 text-sm leading-relaxed
                focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none
                dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                placeholder={`Write your global ${activeTab} honeymoon terms and conditions here...`}
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-2.5 rounded-lg border border-slate-200 text-sm font-medium 
                  text-slate-700 hover:bg-slate-50 transition dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-8 py-2.5 rounded-lg bg-blue-600 text-white 
                  text-sm font-semibold shadow-lg hover:bg-blue-700 active:scale-95 disabled:opacity-50 transition"
                >
                  {isSaving ? <FiLoader className="animate-spin" /> : <FiSave />}
                  Save {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Terms
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-8 flex-1">
              {textContent ? (
                <div className="prose prose-slate max-w-none dark:prose-invert">
                  <p className="whitespace-pre-wrap text-slate-700 dark:text-slate-300 leading-relaxed">
                    {textContent}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-20 text-slate-400">
                  <FiFileText size={48} className="mb-4 opacity-20" />
                  <p>No terms defined for {activeTab}. Click edit to get started.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* Helpful Info */}
      <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-4 border border-blue-100 dark:border-blue-800 flex gap-3">
        <div className="text-blue-600 mt-0.5">ℹ️</div>
        <p className="text-sm text-blue-700 dark:text-blue-300">
          The <strong>{activeTab}</strong> terms will be shown when users select the "{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}" tab on the website's Terms & Conditions page.
        </p>
      </div>
    </div>
  );
};

export default HoneymoonTermsAndCondition;
