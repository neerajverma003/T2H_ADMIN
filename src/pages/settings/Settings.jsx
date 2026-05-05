import { useState, useEffect } from "react";
import { 
    FiSettings, 
    FiSave, 
    FiMail, 
    FiPhone, 
    FiMapPin, 
    FiFacebook, 
    FiInstagram, 
    FiTwitter, 
    FiLoader,
    FiCheckCircle,
    FiGlobe,
    FiShield,
    FiLink
} from "react-icons/fi";
import { apiClient } from "../../stores/authStores";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    supportEmail: "",
    supportPhone: "",
    officeAddress: "",
    facebookUrl: "",
    instagramUrl: "",
    twitterUrl: "",
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await apiClient.get("/admin/global-settings");
        if (res.data.success && res.data.data) {
          setFormData(res.data.data);
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
        toast.error("Failed to load settings");
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiClient.put("/admin/global-settings", formData);
      toast.success("Registry synchronized successfully! ✨");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to update registry");
    } finally {
      setSaving(false);
    }
  };

  const styleProps = {
    inputStyle: "w-full rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-4 pl-12 text-slate-900 dark:text-slate-100 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all placeholder:text-slate-400",
    labelStyle: "flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2",
    cardStyle: "bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none",
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-4">
        <FiLoader className="h-10 w-10 animate-spin text-indigo-600" />
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Loading Portal Configuration</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto space-y-10 pb-20 px-4">
      {/* HEADER */}
      <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-12 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none text-indigo-600"><FiSettings size={200} /></div>
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div>
                <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-4">
                    <FiShield className="text-indigo-600" /> PORTAL REGISTRY
                </h1>
                <p className="text-slate-500 font-medium mt-2 text-lg italic">Global configuration and brand connectivity</p>
            </div>
            <div className="px-6 py-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-sm">
                <FiCheckCircle size={16} /> Verified Store
            </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-10">
        {/* CONTACT HUB */}
        <div className={styleProps.cardStyle}>
          <div className="flex items-center gap-3 mb-10">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl text-indigo-600 dark:text-indigo-400"><FiGlobe size={24} /></div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider">Contact Synchronization</h2>
          </div>
          
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div>
              <label className={styleProps.labelStyle}>Support Email Address</label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  name="supportEmail"
                  value={formData.supportEmail}
                  onChange={handleChange}
                  placeholder="info@trip2honeymoon.com"
                  className={styleProps.inputStyle}
                  required
                />
              </div>
            </div>
            <div>
              <label className={styleProps.labelStyle}>Official Support Line</label>
              <div className="relative">
                <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  name="supportPhone"
                  value={formData.supportPhone}
                  onChange={handleChange}
                  placeholder="+91 0000 000 000"
                  className={styleProps.inputStyle}
                  required
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className={styleProps.labelStyle}>Corporate Headquarters</label>
              <div className="relative">
                <FiMapPin className="absolute left-4 top-5 text-slate-400" />
                <textarea
                  name="officeAddress"
                  value={formData.officeAddress}
                  onChange={handleChange}
                  placeholder="Enter full physical address..."
                  rows="3"
                  className={`${styleProps.inputStyle} h-32 pt-4 resize-none`}
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* SOCIAL CONNECTIVITY */}
        <div className={styleProps.cardStyle}>
          <div className="flex items-center gap-3 mb-10">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl text-indigo-600 dark:text-indigo-400"><FiLink size={24} /></div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider">Social Graph</h2>
          </div>
          
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div>
              <label className={styleProps.labelStyle}>Facebook Profile</label>
              <div className="relative">
                <FiFacebook className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="url"
                  name="facebookUrl"
                  value={formData.facebookUrl}
                  onChange={handleChange}
                  placeholder="https://facebook.com/trip2honeymoon"
                  className={styleProps.inputStyle}
                />
              </div>
            </div>
            <div>
              <label className={styleProps.labelStyle}>Instagram Profile</label>
              <div className="relative">
                <FiInstagram className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="url"
                  name="instagramUrl"
                  value={formData.instagramUrl}
                  onChange={handleChange}
                  placeholder="https://instagram.com/trip2honeymoon"
                  className={styleProps.inputStyle}
                />
              </div>
            </div>
            <div>
              <label className={styleProps.labelStyle}>Twitter Profile</label>
              <div className="relative">
                <FiTwitter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="url"
                  name="twitterUrl"
                  value={formData.twitterUrl}
                  onChange={handleChange}
                  placeholder="https://twitter.com/trip2honeymoon"
                  className={styleProps.inputStyle}
                />
              </div>
            </div>
          </div>
        </div>

        {/* SUBMIT */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-3 rounded-[2rem] bg-indigo-600 px-12 py-5 text-lg font-black text-white shadow-2xl shadow-indigo-500/40 hover:bg-indigo-700 hover:shadow-indigo-500/60 transition-all active:scale-95 disabled:opacity-50"
          >
            {saving ? (
              <>
                <FiLoader className="animate-spin" /> SYNCING...
              </>
            ) : (
              <>
                <FiSave /> PUSH GLOBAL UPDATES
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default Settings;
