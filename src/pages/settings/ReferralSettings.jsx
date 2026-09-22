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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="relative">
          <div className="w-14 h-14 rounded-2xl border-4 border-blue-500/20 border-t-blue-500 animate-spin" />
          <Gift className="absolute inset-0 m-auto text-blue-500/60" size={20} />
        </div>
        <p className="mt-4 text-xs font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 animate-pulse">
          Loading Referral Configuration...
        </p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.25 }}
      className="max-w-7xl mx-auto space-y-8 pb-24 px-4 sm:px-6 text-left text-slate-900 dark:text-white font-sans"
    >
      {/* ── HEADER HUB ── */}
      <div className="bg-white dark:bg-[#091126] rounded-3xl py-4 sm:py-5 px-6 sm:px-8 border border-slate-200 dark:border-slate-800 shadow-md relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative z-10 flex items-center gap-3.5">
          <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-sm shrink-0">
            <Gift size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-500 dark:text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full">
                SYSTEM CONFIGURATION
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              Referral & <span className="text-blue-500">Reward Engine</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-semibold mt-0.5 text-xs sm:text-sm">
              Configure dynamic referral cashbacks, signup incentives, and tour booking rewards.
            </p>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <button
            type="button"
            onClick={fetchSettings}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer active:scale-95"
          >
            <RefreshCw size={14} /> Refresh Rules
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: EDITABLE FORM CONTROLS */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-[#091126] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            
            {/* SYSTEM STATUS TOGGLE */}
            <div className="flex items-center justify-between p-5 bg-slate-50 dark:bg-[#050A17] border border-slate-200 dark:border-slate-800/90 rounded-2xl">
              <div className="flex items-center gap-3.5">
                <div className={`size-11 rounded-xl flex items-center justify-center font-bold ${formData.is_referral_active ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'}`}>
                  <Power size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">Program Status</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
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
                <div className="w-12 h-6 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>

            {/* MILESTONE 1: SIGNUP REWARDS */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2.5 border-b border-slate-200 dark:border-slate-800/80 pb-3">
                <UserCheck size={18} className="text-blue-500" />
                <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">Milestone 1: Friend Registration</h3>
              </div>

              {/* REFERRER SIGNUP BONUS */}
              <div className="space-y-2">
                <label className="text-[11px] font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-wider block">
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
                    className="w-full pl-9 pr-4 py-3 bg-slate-50 dark:bg-[#050A17] border border-slate-200 dark:border-slate-800/90 rounded-xl text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-all shadow-inner"
                  />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  Amount credited to the referrer's Referral Wallet when their friend registers.
                </p>
              </div>

              {/* REFEREE SIGNUP BONUS */}
              <div className="space-y-2">
                <label className="text-[11px] font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-wider block">
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
                    className="w-full pl-9 pr-4 py-3 bg-slate-50 dark:bg-[#050A17] border border-slate-200 dark:border-slate-800/90 rounded-xl text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-all shadow-inner"
                  />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  Welcome bonus credited to the new user's Referral Wallet upon signing up via invite.
                </p>
              </div>
            </div>

            {/* MILESTONE 2: BOOKING REWARD */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2.5 border-b border-slate-200 dark:border-slate-800/80 pb-3">
                <ShoppingBag size={18} className="text-indigo-500" />
                <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">Milestone 2: First Tour Booking</h3>
              </div>

              {/* REFERRER BOOKING BONUS */}
              <div className="space-y-2">
                <label className="text-[11px] font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-wider block">
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
                    className="w-full pl-9 pr-4 py-3 bg-slate-50 dark:bg-[#050A17] border border-slate-200 dark:border-slate-800/90 rounded-xl text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-all shadow-inner"
                  />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  Bonus credited to the referrer when their referred friend completes their first tour booking.
                </p>
              </div>
            </div>

            {/* SAVE ACTION */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800/80 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="px-7 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2.5 transition-all shadow-sm hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 cursor-pointer"
              >
                {isSaving ? <Loader2 className="animate-spin" size={15} /> : <Save size={15} />}
                {isSaving ? "Saving Configuration..." : "Save Referral Engine Rules"}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: LIVE END-USER DASHBOARD PREVIEW */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-[#091126] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-4">
              <div className="flex items-center gap-2.5">
                <Gift size={20} className="text-blue-500" />
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">Live User Dashboard Preview</h3>
              </div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                Real-Time Preview
              </span>
            </div>

            {/* PREVIEW CARDS (MATCHING USER DASHBOARD REWARD CARDS) */}
            <div className="space-y-4">
              {/* MILESTONE 1 PREVIEW CARD */}
              <div className="bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 space-y-2 relative overflow-hidden">
                <span className="text-[9px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 px-2.5 py-0.5 rounded border border-emerald-500/30 inline-block">
                  MILESTONE 1
                </span>
                <h4 className="text-base font-extrabold text-slate-900 dark:text-white">Friend Registers</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  You get <strong className="text-emerald-600 dark:text-emerald-400">₹{(Number(formData.referrer_signup_bonus) || 0).toLocaleString('en-IN')}</strong> credited to your Referral Wallet instantly, and your friend gets <strong className="text-emerald-600 dark:text-emerald-400">₹{(Number(formData.referee_signup_bonus) || 0).toLocaleString('en-IN')}</strong> in their Referral Wallet!
                </p>
                <div className="pt-2 text-xl font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                  ₹{(Number(formData.referrer_signup_bonus) || 0).toLocaleString('en-IN')} <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Credited</span>
                </div>
              </div>

              {/* MILESTONE 2 PREVIEW CARD */}
              <div className="bg-indigo-500/5 dark:bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-5 space-y-2 relative overflow-hidden">
                <span className="text-[9px] font-extrabold uppercase tracking-wider bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 px-2.5 py-0.5 rounded border border-indigo-500/30 inline-block">
                  MILESTONE 2
                </span>
                <h4 className="text-base font-extrabold text-slate-900 dark:text-white">Friend Books a Tour</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  You get credited <strong className="text-indigo-600 dark:text-indigo-400">₹{(Number(formData.referrer_booking_bonus) || 0).toLocaleString('en-IN')}</strong> bonus in your Referral Wallet once your friend completes payment for any tour package.
                </p>
                <div className="pt-2 text-xl font-black text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                  ₹{(Number(formData.referrer_booking_bonus) || 0).toLocaleString('en-IN')} <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Credited</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-[#050A17] border border-slate-200 dark:border-slate-800/90 rounded-2xl flex items-start gap-3">
              <CheckCircle2 size={18} className="text-blue-500 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
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
