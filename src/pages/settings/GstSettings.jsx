import { useState, useEffect } from "react";
import { apiClient } from "../../stores/authStores";
import { 
  Percent, 
  Mail, 
  Phone, 
  Building, 
  Save, 
  RefreshCcw, 
  ShieldCheck, 
  Sparkles,
  CheckCircle,
  FileText
} from "lucide-react";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

const GstSettings = () => {
  const [globalSettings, setGlobalSettings] = useState({
    gstPercentage: 5,
    gstin: "07AAXCA9254E1Z7",
    supportEmail: "",
    supportPhone: "",
    officeAddress: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchGlobalSettingsData = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/admin/global-settings");
      if (res.data.success && res.data.data) {
        setGlobalSettings({
          gstPercentage: res.data.data.gstPercentage !== undefined ? Number(res.data.data.gstPercentage) : 5,
          gstin: res.data.data.gstin || "07AAXCA9254E1Z7",
          supportEmail: res.data.data.supportEmail || "",
          supportPhone: res.data.data.supportPhone || "",
          officeAddress: res.data.data.officeAddress || "",
        });
      }
    } catch (err) {
      console.error("fetchGlobalSettings error:", err);
      toast.error("Failed to load GST & Business Settings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGlobalSettingsData();
  }, []);

  const handleSaveGlobalSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await apiClient.put("/admin/global-settings", globalSettings);
      if (res.data.success) {
        toast.success("GST & Business Settings saved successfully! ✨");
      }
    } catch (err) {
      toast.error(err.response?.data?.msg || "Failed to update GST & Business settings.");
    } finally {
      setSaving(false);
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
          <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-500/30 shrink-0">
            <Percent size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-500 dark:text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 rounded-full">
                SYSTEM CONFIGURATION
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2 flex-wrap">
              GST & <span className="text-blue-500">Business Settings</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-semibold mt-0.5 text-xs sm:text-sm">
              Configure dynamic B2B GST tax credit percentage and company invoice details.
            </p>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <button
            type="button"
            onClick={fetchGlobalSettingsData}
            disabled={loading}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
          >
            <RefreshCcw size={14} className={loading ? "animate-spin text-blue-500" : ""} /> Refresh Data
          </button>
        </div>
      </div>

      {/* ── FORM CARD ── */}
      <div className="bg-white dark:bg-[#091126]/95 rounded-3xl p-6 lg:p-8 border border-slate-200/90 dark:border-indigo-500/25 shadow-xl ring-1 ring-slate-900/5 dark:ring-white/5 backdrop-blur-xl space-y-6">
        <div className="flex items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800/80">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                Dynamic Tax & Contact Parameters
              </h2>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                Changes updated here take effect immediately across customer booking checkouts & generated PDF invoices.
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-400 font-bold flex items-center justify-center gap-3">
            <RefreshCcw className="animate-spin text-blue-500" size={20} /> Loading GST settings...
          </div>
        ) : (
          <form onSubmit={handleSaveGlobalSettings} className="space-y-6">
            {/* GST Percentage */}
            <div className="bg-blue-500/5 dark:bg-blue-500/10 p-6 rounded-2xl border border-blue-500/20 space-y-3">
              <label className="text-xs font-extrabold text-slate-700 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Percent size={15} className="text-blue-500" /> Dynamic GST Rate (%)
              </label>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                This percentage is added to the total trip amount when a customer checks "I have a GST Number (Claim B2B Invoice)" on the checkout page.
              </p>
              <div className="relative max-w-xs pt-1">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={globalSettings.gstPercentage === "" ? "" : Number(globalSettings.gstPercentage)}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "") {
                      setGlobalSettings({ ...globalSettings, gstPercentage: "" });
                    } else {
                      const num = parseFloat(val);
                      setGlobalSettings({
                        ...globalSettings,
                        gstPercentage: isNaN(num) ? "" : Math.min(100, Math.max(0, num))
                      });
                    }
                  }}
                  className="w-full px-4 py-3 bg-white dark:bg-[#050A17] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-base font-extrabold outline-none focus:border-blue-500 transition-all shadow-inner [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  placeholder="e.g. 10"
                  required
                />
              </div>
            </div>

            {/* Support Email */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Mail size={15} className="text-blue-500" /> Official Support Email Address
              </label>
              <input
                type="email"
                value={globalSettings.supportEmail}
                onChange={(e) => setGlobalSettings({ ...globalSettings, supportEmail: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-[#050A17] border border-slate-200 dark:border-slate-800/90 rounded-xl text-slate-900 dark:text-white text-xs font-semibold focus:border-blue-500 outline-none transition shadow-inner"
                placeholder="e.g. support@trip2honeymoon.com"
              />
            </div>

            {/* Support Phone */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Phone size={15} className="text-blue-500" /> Support Helpline Number
              </label>
              <input
                type="text"
                value={globalSettings.supportPhone}
                onChange={(e) => setGlobalSettings({ ...globalSettings, supportPhone: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-[#050A17] border border-slate-200 dark:border-slate-800/90 rounded-xl text-slate-900 dark:text-white text-xs font-semibold focus:border-blue-500 outline-none transition shadow-inner"
                placeholder="e.g. +91 11 4061 2834"
              />
            </div>

            {/* Office Address */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Building size={15} className="text-blue-500" /> Registered Business & Office Address
              </label>
              <input
                type="text"
                value={globalSettings.officeAddress}
                onChange={(e) => setGlobalSettings({ ...globalSettings, officeAddress: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-[#050A17] border border-slate-200 dark:border-slate-800/90 rounded-xl text-slate-900 dark:text-white text-xs font-semibold focus:border-blue-500 outline-none transition shadow-inner"
                placeholder="e.g. Plot No.34, First Floor, Sewak Park, Dwarka Mor, Delhi 110059"
              />
            </div>

            {/* Company GSTIN Number */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <FileText size={15} className="text-blue-500" /> Company GSTIN Identification Number
              </label>
              <input
                type="text"
                value={globalSettings.gstin}
                onChange={(e) => setGlobalSettings({ ...globalSettings, gstin: e.target.value.toUpperCase() })}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-[#050A17] border border-slate-200 dark:border-slate-800/90 rounded-xl text-slate-900 dark:text-white text-xs font-bold tracking-wider uppercase font-mono focus:border-blue-500 outline-none transition shadow-inner"
                placeholder="e.g. 07AAXCA9254E1Z7"
                maxLength={15}
              />
              <p className="text-[11px] text-slate-400 font-medium">This GSTIN will be printed on customer booking receipts and downloadable PDF tax invoices.</p>
            </div>

            {/* SAVE BUTTON */}
            <div className="pt-6 border-t border-slate-200 dark:border-slate-800/80 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-md shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <RefreshCcw className="animate-spin" size={15} /> SAVING SETTINGS...
                  </>
                ) : (
                  <>
                    <Save size={15} /> SAVE SETTINGS
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default GstSettings;
