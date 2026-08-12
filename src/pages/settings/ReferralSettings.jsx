import { useState, useEffect } from "react";
import { apiClient } from "../../stores/authStores";
import { 
  Gift, 
  Sparkles, 
  Save, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  UserCheck, 
  ShoppingBag, 
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  Power
} from "lucide-react";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

const ReferralSettings = () => {
  const [formData, setFormData] = useState({
    referrer_signup_bonus: 1000,
    referee_signup_bonus: 500,
    referrer_booking_bonus: 500,
    is_referral_active: true,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get("/admin/referral-settings");
      if (res.data?.success && res.data?.data) {
        setFormData({
          referrer_signup_bonus: res.data.data.referrer_signup_bonus ?? 1000,
          referee_signup_bonus: res.data.data.referee_signup_bonus ?? 500,
          referrer_booking_bonus: res.data.data.referrer_booking_bonus ?? 500,
          is_referral_active: res.data.data.is_referral_active ?? true,
        });
      }
    } catch (err) {
      toast.error(err.response?.data?.msg || "Failed to load referral settings.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        referrer_signup_bonus: Number(formData.referrer_signup_bonus) || 0,
        referee_signup_bonus: Number(formData.referee_signup_bonus) || 0,
        referrer_booking_bonus: Number(formData.referrer_booking_bonus) || 0,
        is_referral_active: formData.is_referral_active,
      };

      const res = await apiClient.put("/admin/referral-settings", payload);
      if (res.data?.success) {
        toast.success("Referral reward configuration saved successfully!");
      } else {
        throw new Error(res.data?.msg || "Save failed");
      }
    } catch (err) {
      toast.error(err.response?.data?.msg || err.message || "Failed to update referral settings.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4 text-slate-900 dark:text-white">
        <Loader2 className="animate-spin text-blue-500" size={48} strokeWidth={2} />
        <p className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
          Loading Referral Configuration...
        </p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="space-y-8 pb-16 text-slate-900 dark:text-white font-sans"
    >
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="text-blue-600 dark:text-blue-400 font-bold tracking-widest text-[11px] uppercase flex items-center gap-1.5 mb-1">
            <Sparkles size={14} className="text-blue-600 dark:text-blue-400 animate-pulse" /> SYSTEM CONFIGURATION
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Referral & <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 dark:from-blue-400 dark:via-indigo-400 dark:to-sky-400 bg-clip-text text-transparent">Reward Engine</span>
          </h1>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Configure dynamic referral cashbacks, signup incentives, and tour booking rewards.
          </p>
        </div>

        <button
          onClick={fetchSettings}
          className="px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-2xl text-xs font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-2 transition-all cursor-pointer shadow-sm"
        >
          <RefreshCw size={14} /> Refresh Rules
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: EDITABLE FORM CONTROLS */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-xl space-y-6">
            
            {/* SYSTEM STATUS TOGGLE */}
            <div className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className={`size-11 rounded-2xl flex items-center justify-center font-bold ${formData.is_referral_active ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30'}`}>
                  <Power size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">Program Status</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {formData.is_referral_active ? 'Referral engine is ACTIVE and distributing rewards.' : 'Referral engine is PAUSED.'}
                  </p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="is_referral_active"
                  checked={formData.is_referral_active}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-12 h-6 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            {/* MILESTONE 1: SIGNUP REWARDS */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                <UserCheck size={18} className="text-blue-600 dark:text-blue-400" />
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">Milestone 1: Friend Registration</h3>
              </div>

              {/* REFERRER SIGNUP BONUS */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wide block">
                  Referrer Reward (Inviter Gets)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                  <input
                    type="number"
                    name="referrer_signup_bonus"
                    min="0"
                    value={formData.referrer_signup_bonus}
                    onChange={handleChange}
                    onFocus={(e) => e.target.select()}
                    className="w-full pl-9 pr-4 py-3 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-xs"
                  />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  Amount credited to the referrer's Referral Wallet when their friend registers.
                </p>
              </div>

              {/* REFEREE SIGNUP BONUS */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wide block">
                  Referee Welcome Bonus (New User Gets)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                  <input
                    type="number"
                    name="referee_signup_bonus"
                    min="0"
                    value={formData.referee_signup_bonus}
                    onChange={handleChange}
                    onFocus={(e) => e.target.select()}
                    className="w-full pl-9 pr-4 py-3 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-xs"
                  />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  Welcome bonus credited to the new user's Referral Wallet upon signing up via invite.
                </p>
              </div>
            </div>

            {/* MILESTONE 2: BOOKING REWARD */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                <ShoppingBag size={18} className="text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">Milestone 2: First Tour Booking</h3>
              </div>

              {/* REFERRER BOOKING BONUS */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wide block">
                  Referrer Booking Bonus (Inviter Gets on Friend's 1st Tour)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                  <input
                    type="number"
                    name="referrer_booking_bonus"
                    min="0"
                    value={formData.referrer_booking_bonus}
                    onChange={handleChange}
                    onFocus={(e) => e.target.select()}
                    className="w-full pl-9 pr-4 py-3 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-xs"
                  />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  Bonus credited to the referrer when their referred friend completes their first tour booking.
                </p>
              </div>
            </div>

            {/* SAVE ACTION */}
            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl text-xs font-extrabold uppercase tracking-wider flex items-center gap-2.5 transition-all shadow-lg shadow-blue-600/30 disabled:opacity-50 cursor-pointer"
              >
                {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                {isSaving ? "Saving Configuration..." : "Save Referral Engine Rules"}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: LIVE END-USER DASHBOARD PREVIEW */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <Gift size={20} className="text-blue-600 dark:text-blue-400" />
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">Live User Dashboard Preview</h3>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 px-2.5 py-1 rounded-full">
                Real-Time Preview
              </span>
            </div>

            {/* PREVIEW CARDS (MATCHING USER DASHBOARD REWARD CARDS) */}
            <div className="space-y-4">
              {/* MILESTONE 1 PREVIEW CARD */}
              <div className="bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/30 rounded-2xl p-5 space-y-2 relative overflow-hidden shadow-xs">
                <span className="text-[9px] font-black uppercase tracking-widest bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 px-2.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-500/30">
                  MILESTONE 1
                </span>
                <h4 className="text-base font-extrabold text-slate-900 dark:text-white">Friend Registers</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  You get <strong className="text-emerald-600 dark:text-emerald-400">₹{(Number(formData.referrer_signup_bonus) || 0).toLocaleString('en-IN')}</strong> credited to your Referral Wallet instantly, and your friend gets <strong className="text-emerald-600 dark:text-emerald-400">₹{(Number(formData.referee_signup_bonus) || 0).toLocaleString('en-IN')}</strong> in their Referral Wallet!
                </p>
                <div className="pt-2 text-xl font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                  ₹{(Number(formData.referrer_signup_bonus) || 0).toLocaleString('en-IN')} <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Credited</span>
                </div>
              </div>

              {/* MILESTONE 2 PREVIEW CARD */}
              <div className="bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-500/30 rounded-2xl p-5 space-y-2 relative overflow-hidden shadow-xs">
                <span className="text-[9px] font-black uppercase tracking-widest bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 px-2.5 py-0.5 rounded border border-indigo-200 dark:border-indigo-500/30">
                  MILESTONE 2
                </span>
                <h4 className="text-base font-extrabold text-slate-900 dark:text-white">Friend Books a Tour</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  You get credited <strong className="text-indigo-600 dark:text-indigo-400">₹{(Number(formData.referrer_booking_bonus) || 0).toLocaleString('en-IN')}</strong> bonus in your Referral Wallet once your friend completes payment for any tour package.
                </p>
                <div className="pt-2 text-xl font-black text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                  ₹{(Number(formData.referrer_booking_bonus) || 0).toLocaleString('en-IN')} <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Credited</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-start gap-3">
              <CheckCircle2 size={18} className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Saving these settings updates the numbers displayed across all customer Referral pages and automatically adjusts backend credit algorithms.
              </p>
            </div>
          </div>
        </div>
      </form>
    </motion.div>
  );
};

export default ReferralSettings;
