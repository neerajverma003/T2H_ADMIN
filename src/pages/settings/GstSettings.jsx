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
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-6 md:p-10 max-w-5xl mx-auto space-y-8"
    >
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 p-8 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden text-white">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-black uppercase tracking-wider mb-3">
              <Sparkles size={14} /> System Configuration
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <Percent className="text-amber-400" size={30} /> GST & Business Settings
            </h1>
            <p className="text-slate-300 text-xs md:text-sm font-medium mt-2 max-w-2xl leading-relaxed">
              Configure the dynamic B2B GST tax credit percentage calculated at itinerary checkout, along with system-wide contact info for customer invoices.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchGlobalSettingsData}
            disabled={loading}
            className="self-start md:self-center flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl text-xs font-black transition-all cursor-pointer backdrop-blur-sm shrink-0"
          >
            <RefreshCcw size={15} className={loading ? "animate-spin" : ""} /> Refresh Data
          </button>
        </div>
      </div>

      {/* FORM CARD */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-10 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none space-y-8">
        <div className="flex items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <ShieldCheck size={22} className="text-amber-500" /> Dynamic Tax & Contact Parameters
            </h2>
            <p className="text-xs font-medium text-slate-400 mt-1">
              Changes updated here take effect immediately across customer booking checkouts & generated PDF invoices.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-400 font-bold flex items-center justify-center gap-3">
            <RefreshCcw className="animate-spin text-amber-500" size={24} /> Loading GST settings...
          </div>
        ) : (
          <form onSubmit={handleSaveGlobalSettings} className="space-y-6">
            {/* GST Percentage */}
            <div className="bg-amber-500/5 dark:bg-amber-500/10 p-6 rounded-2xl border border-amber-500/20 space-y-3">
              <label className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-widest flex items-center gap-2">
                <Percent size={16} className="text-amber-500" /> Dynamic GST Rate (%)
              </label>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
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
                  className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-base font-black outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  placeholder="e.g. 10"
                  required
                />
                <span className="absolute right-4 top-1/2 translate-y-0.5 text-amber-500 font-black text-base"></span>
              </div>
            </div>

            {/* Support Email */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest flex items-center gap-2">
                <Mail size={16} className="text-amber-500" /> Official Support Email Address
              </label>
              <input
                type="email"
                value={globalSettings.supportEmail}
                onChange={(e) => setGlobalSettings({ ...globalSettings, supportEmail: e.target.value })}
                className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm font-semibold focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition"
                placeholder="e.g. support@trip2honeymoon.com"
              />
            </div>

            {/* Support Phone */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest flex items-center gap-2">
                <Phone size={16} className="text-amber-500" /> Support Helpline Number
              </label>
              <input
                type="text"
                value={globalSettings.supportPhone}
                onChange={(e) => setGlobalSettings({ ...globalSettings, supportPhone: e.target.value })}
                className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm font-semibold focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition"
                placeholder="e.g. +91 11 4061 2834"
              />
            </div>

            {/* Office Address */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest flex items-center gap-2">
                <Building size={16} className="text-amber-500" /> Registered Business & Office Address
              </label>
              <input
                type="text"
                value={globalSettings.officeAddress}
                onChange={(e) => setGlobalSettings({ ...globalSettings, officeAddress: e.target.value })}
                className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm font-semibold focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition"
                placeholder="e.g. Plot No.34, First Floor, Sewak Park, Dwarka Mor, Delhi 110059"
              />
            </div>

            {/* Company GSTIN Number */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest flex items-center gap-2">
                <FileText size={16} className="text-amber-500" /> Company GSTIN Identification Number
              </label>
              <input
                type="text"
                value={globalSettings.gstin}
                onChange={(e) => setGlobalSettings({ ...globalSettings, gstin: e.target.value.toUpperCase() })}
                className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm font-bold tracking-wider uppercase font-mono focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition"
                placeholder="e.g. 07AAXCA9254E1Z7"
                maxLength={15}
              />
              <p className="text-[11px] text-slate-400 font-medium">This GSTIN will be printed on customer booking receipts and downloadable PDF tax invoices.</p>
            </div>

            {/* SAVE BUTTON */}
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2.5 px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <RefreshCcw className="animate-spin" size={16} /> SAVING GST SETTINGS...
                  </>
                ) : (
                  <>
                    <Save size={16} /> SAVE SETTINGS
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </motion.div>
  );
};

export default GstSettings;
