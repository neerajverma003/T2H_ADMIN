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
import { ShieldCheck, Zap, Sparkles, RefreshCcw, Save, Globe, Mail, Phone, MapPin, Facebook, Instagram, Twitter, ExternalLink } from "lucide-react";
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
    inputStyle: "w-full rounded-[1.5rem] border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-6 pl-16 text-slate-950 dark:text-slate-100 text-lg font-black focus:border-indigo-700/20 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:text-slate-400 shadow-inner",
    labelStyle: "flex items-center gap-3 text-xs font-black text-slate-950 dark:text-slate-400 uppercase tracking-[0.3em] mb-4",
    cardStyle: "bg-white dark:bg-slate-900 rounded-[3.5rem] p-12 border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none",
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-48 gap-8">
        <RefreshCcw className="size-16 animate-spin text-indigo-700" strokeWidth={1} />
        <p className="text-xs font-black uppercase tracking-[0.4em] text-slate-400">Syncing Intelligence Core...</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-full mx-auto space-y-12 pb-24 px-6 text-left">
      {/* HEADER */}
      <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] p-12 border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none text-indigo-700"><FiSettings size={240} /></div>
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-10">
            <div>
                <h1 className="text-4xl font-black text-slate-950 dark:text-white tracking-tight flex items-center gap-5">
                    <ShieldCheck className="text-indigo-700" size={44} /> PORTAL REGISTRY
                </h1>
                <p className="text-slate-600 dark:text-slate-400 font-bold mt-2 text-xl italic text-left">Global configuration and brand connectivity protocols</p>
            </div>
            <div className="px-8 py-5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-[1.5rem] text-sm font-black uppercase tracking-[0.2em] flex items-center gap-3 shadow-sm border border-emerald-100">
                <FiCheckCircle size={20} /> VERIFIED IDENTITY
            </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-12">
        {/* CONTACT HUB */}
        <div className={styleProps.cardStyle}>
          <div className="flex items-center gap-5 mb-12">
            <div className="size-16 bg-indigo-700 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-500/30">
                <Globe size={32} />
            </div>
            <div className="text-left">
                <h2 className="text-2xl font-black text-slate-950 dark:text-white uppercase tracking-tight">Global Connectivity</h2>
                <p className="text-xs font-black text-indigo-700 uppercase tracking-widest mt-1 italic">Contact synchronization matrix</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
            <div>
              <label className={styleProps.labelStyle}>Authorized Email Registry</label>
              <div className="relative group">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-700 transition-colors" size={24} />
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
              <label className={styleProps.labelStyle}>Emergency Support Line</label>
              <div className="relative group">
                <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-700 transition-colors" size={24} />
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
              <label className={styleProps.labelStyle}>Corporate Headquarters Blueprint</label>
              <div className="relative group">
                <MapPin className="absolute left-6 top-8 text-slate-400 group-focus-within:text-indigo-700 transition-colors" size={24} />
                <textarea
                  name="officeAddress"
                  value={formData.officeAddress}
                  onChange={handleChange}
                  placeholder="Enter full physical address registry..."
                  rows="4"
                  className={`${styleProps.inputStyle} h-40 pt-6 resize-none`}
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* SOCIAL CONNECTIVITY */}
        <div className={styleProps.cardStyle}>
          <div className="flex items-center gap-5 mb-12">
            <div className="size-16 bg-indigo-700 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-500/30">
                <ExternalLink size={32} />
            </div>
            <div className="text-left">
                <h2 className="text-2xl font-black text-slate-950 dark:text-white uppercase tracking-tight">Social Graph</h2>
                <p className="text-xs font-black text-indigo-700 uppercase tracking-widest mt-1 italic">Authorized brand links</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
            <div>
              <label className={styleProps.labelStyle}>Facebook Profile</label>
              <div className="relative group">
                <Facebook className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-700 transition-colors" size={24} />
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
              <div className="relative group">
                <Instagram className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-700 transition-colors" size={24} />
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
              <div className="relative group">
                <Twitter className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-700 transition-colors" size={24} />
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
        <div className="flex justify-end pt-8">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-5 rounded-[2.5rem] bg-indigo-700 px-16 py-7 text-xl font-black text-white shadow-2xl shadow-indigo-500/40 hover:bg-indigo-800 hover:shadow-indigo-500/60 transition-all active:scale-95 disabled:opacity-50"
          >
            {saving ? (
              <>
                <RefreshCcw className="animate-spin" size={24} /> SYNCING CORE...
              </>
            ) : (
              <>
                <Save size={24} /> PUSH GLOBAL UPDATES
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default Settings;
