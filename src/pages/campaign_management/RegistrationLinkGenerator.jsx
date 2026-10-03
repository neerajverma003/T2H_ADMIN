import { useState, useEffect } from "react";
import { 
  Link2, Gift, Sparkles, User, Copy, Check, Trash2, 
  Share2, Edit3, Mail, RefreshCw, AlertCircle, CheckCircle2,
  ExternalLink, ArrowUpRight, ShieldCheck, Power
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useRegistrationLinkStore } from "../../stores/registrationLinkStore";
import ConfirmationModal from "../../newComponents/ConfirmationModel";

const RegistrationLinkGenerator = () => {
  const navigate = useNavigate();
  const {
    links,
    bonusRules,
    isLoading,
    isGenerating,
    isUpdatingRules,
    fetchBonusRules,
    updateBonusRules,
    fetchLinks,
    generateUserLink,
    toggleLinkStatus,
    deleteLink,
  } = useRegistrationLinkStore();

  const [copiedId, setCopiedId] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [isEditRulesOpen, setIsEditRulesOpen] = useState(false);
  const [rulesFormData, setRulesFormData] = useState({
    welcomeBonus: 500,
    isReferralActive: true,
  });

  useEffect(() => {
    fetchBonusRules();
    fetchLinks();
  }, [fetchBonusRules, fetchLinks]);

  // Keep rules form state in sync with store
  useEffect(() => {
    if (bonusRules) {
      setRulesFormData({
        welcomeBonus: bonusRules.welcomeBonus ?? 500,
        isReferralActive: bonusRules.isReferralActive ?? true,
      });
    }
  }, [bonusRules]);

  // Copy helper
  const handleCopy = async (text, id = 'general') => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopiedId(id);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopiedId(null), 2500);
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  // Share helper
  const handleShare = async (link) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join Trip2Honeymoon - Welcome Bonus",
          text: `Sign up now and receive ₹${link.bonus_amount || bonusRules.welcomeBonus} in your wallet!`,
          url: link.full_url,
        });
      } catch (err) {
        if (err.name !== "AbortError") {
          handleCopy(link.full_url, link._id);
        }
      }
    } else {
      handleCopy(link.full_url, link._id);
    }
  };

  // Handle saving bonus rules
  const handleSaveBonusRules = async (e) => {
    e.preventDefault();
    const success = await updateBonusRules({
      welcomeBonus: Number(rulesFormData.welcomeBonus),
      isReferralActive: rulesFormData.isReferralActive,
    });
    if (success) {
      setIsEditRulesOpen(false);
    }
  };

  // Toggle program status directly from header
  const handleToggleProgramStatus = async () => {
    await updateBonusRules({
      welcomeBonus: bonusRules.welcomeBonus,
      isReferralActive: !bonusRules.isReferralActive,
    });
  };

  const activeBonus = bonusRules.welcomeBonus ?? 500;
  const isProgramActive = bonusRules.isReferralActive ?? true;

  return (
    <div className="min-h-screen bg-[#070B14] text-slate-100 p-4 sm:p-6 lg:p-8 space-y-8">
      {/* ─── Top Header ─────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-lg shadow-blue-600/10">
            <Link2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              Registration Link <span className="text-blue-500">Generator</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Generate shareable invitation links with custom welcome bonus and dispatch via Email Campaigns.
            </p>
          </div>
        </div>

        {/* Program Status Badge */}
        <div className="flex items-center gap-3 self-start md:self-auto bg-[#0E1526] border border-slate-800 px-4 py-2 rounded-xl">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Program Status:
          </span>
          <button
            onClick={handleToggleProgramStatus}
            disabled={isUpdatingRules}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
              isProgramActive
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25"
                : "bg-rose-500/15 text-rose-400 border border-rose-500/30 hover:bg-rose-500/25"
            }`}
            title="Click to toggle program status"
          >
            <span className={`w-2 h-2 rounded-full ${isProgramActive ? "bg-emerald-400 animate-pulse" : "bg-rose-400"}`} />
            {isProgramActive ? "ACTIVE" : "INACTIVE"}
          </button>
        </div>
      </div>

      {/* ─── Section 1: Bonus Reward Rules Configuration ───────── */}
      <div className="bg-[#0B101D] border border-slate-800/90 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800/60">
          <div>
            <div className="flex items-center gap-2 text-white font-bold text-base sm:text-lg">
              <Gift className="w-5 h-5 text-blue-400" />
              <span>Bonus Reward Rules Configuration</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Set exact cashback amounts credited to link owners (Referrer) and new users (Referee).
            </p>
          </div>

          <button
            onClick={() => setIsEditRulesOpen(true)}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold px-4 py-2 rounded-xl text-xs sm:text-sm transition-all shadow-md shadow-blue-600/25 w-fit"
          >
            <Edit3 className="w-4 h-4" />
            Edit Bonus Rules
          </button>
        </div>

        {/* Bonus Display Card */}
        <div className="pt-6">
          <div className="bg-[#0F172A]/90 border border-indigo-500/20 rounded-xl p-5 max-w-sm relative group hover:border-indigo-500/40 transition-all shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider uppercase text-indigo-300">
                Welcome Bonus (New User Sign-up Cash)
              </span>
              <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
            </div>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Exact cash amount automatically credited to the wallet of new users joining via generated invitation links.
            </p>
            <div className="text-3xl sm:text-4xl font-extrabold text-white mt-4 tracking-tight flex items-baseline gap-1">
              ₹{activeBonus}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Section 2: Admin Registration Link Generator ──────── */}
      <div className="bg-[#0B101D] border border-slate-800/90 rounded-2xl p-5 sm:p-6 shadow-xl space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-800/60">
          <div>
            <div className="flex items-center gap-1.5 text-blue-400 text-xs font-extrabold tracking-widest uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              Admin Registration Link Generator
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white mt-1">
              Generate & Dispatch ₹{activeBonus} Welcome Bonus Link
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Instantly create a shareable registration link with ₹{activeBonus} pre-credited bonus, or send it directly to custom email recipients via Email Campaign.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            {/* Generate User Link */}
            <button
              onClick={() => generateUserLink()}
              disabled={isGenerating || !isProgramActive}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm transition-all shadow-md shadow-blue-600/25"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <User className="w-4 h-4" />
                  Generate User Link
                </>
              )}
            </button>

            {/* Copy Latest Link */}
            <button
              onClick={() => {
                if (links.length > 0) {
                  handleCopy(links[0].full_url, links[0]._id);
                } else {
                  toast.info("Generate a link first to copy!");
                }
              }}
              disabled={links.length === 0}
              className="flex items-center gap-2 bg-[#121A2E] hover:bg-[#18233C] text-slate-300 border border-slate-700/80 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Copy className="w-4 h-4" />
              Copy Link
            </button>

            {/* Refer Templates */}
            <button
              onClick={() => navigate('/refer-templates')}
              className="flex items-center gap-2 bg-[#121A2E] hover:bg-[#18233C] text-slate-300 border border-slate-700/80 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all"
            >
              <Mail className="w-4 h-4" />
              Refer Templates
            </button>
          </div>
        </div>

        {/* ─── Links List ────────────────────────────────────────── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider">
              Generated Links ({links.length})
            </span>
            <button
              onClick={() => fetchLinks()}
              disabled={isLoading}
              className="flex items-center gap-1 hover:text-white transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>

          {isLoading && links.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-slate-500">
              <RefreshCw className="w-7 h-7 animate-spin mb-3 text-blue-500" />
              <p className="text-sm">Loading invitation links...</p>
            </div>
          ) : links.length === 0 ? (
            <div className="border border-dashed border-slate-800 rounded-xl py-12 px-4 text-center">
              <Link2 className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <h3 className="text-white font-medium text-sm">No registration links generated yet</h3>
              <p className="text-slate-400 text-xs mt-1 max-w-sm mx-auto">
                Click &ldquo;Generate User Link&rdquo; above to create your first shareable invitation link with ₹{activeBonus} pre-credited welcome cash.
              </p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {links.map((item) => {
                const isCopied = copiedId === item._id;
                const isActive = item.status === 'active';

                return (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="bg-[#090E1A] border border-slate-800 hover:border-slate-700/80 rounded-xl p-4 sm:p-5 transition-all shadow-sm space-y-3"
                  >
                    {/* URL Highlight Box */}
                    <div className="bg-[#09152B]/80 border border-blue-600/30 rounded-lg p-3 text-xs sm:text-[13px] font-mono text-blue-300 break-all select-all flex items-center justify-between gap-3">
                      <span>{item.full_url}</span>
                    </div>

                    {/* Badges & Actions Footer */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                      {/* Left: Badges */}
                      <div className="flex flex-wrap items-center gap-2">
                        {/* User Link Badge */}
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wider uppercase bg-blue-600/15 text-blue-400 border border-blue-500/30">
                          <User className="w-3 h-3" />
                          USER LINK
                        </span>

                        {/* Welcome Bonus Badge */}
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wider uppercase bg-purple-500/10 text-purple-400 border border-purple-500/30">
                          <Gift className="w-3 h-3" />
                          ₹{item.bonus_amount || activeBonus} WELCOME BONUS
                        </span>

                        {/* Status Toggle Badge */}
                        <button
                          onClick={() => toggleLinkStatus(item._id)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wider uppercase transition-all ${
                            isActive
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20"
                              : "bg-slate-700/30 text-slate-400 border border-slate-700/50 hover:bg-slate-700/50"
                          }`}
                          title="Click to toggle status"
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-emerald-400" : "bg-slate-400"}`} />
                          {isActive ? "ACTIVE" : "INACTIVE"}
                        </button>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-1.5 ml-auto">
                        {/* Copy Button */}
                        <button
                          onClick={() => handleCopy(item.full_url, item._id)}
                          className="w-8 h-8 rounded-lg bg-[#121A2E] hover:bg-[#1C2742] text-slate-300 hover:text-white border border-slate-700/70 flex items-center justify-center transition-all"
                          title="Copy link"
                        >
                          {isCopied ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => setDeleteTargetId(item._id)}
                          className="w-8 h-8 rounded-lg bg-[#121A2E] hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-700/70 hover:border-rose-800/60 flex items-center justify-center transition-all"
                          title="Delete link"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Share Button */}
                        <button
                          onClick={() => handleShare(item)}
                          className="w-8 h-8 rounded-lg bg-[#121A2E] hover:bg-blue-950/40 text-slate-400 hover:text-blue-400 border border-slate-700/70 hover:border-blue-800/60 flex items-center justify-center transition-all"
                          title="Share link"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ─── Modal: Edit Bonus Rules ───────────────────────────── */}
      <AnimatePresence>
        {isEditRulesOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0B101D] border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl relative"
            >
              <div className="flex items-center gap-2.5 pb-4 border-b border-slate-800">
                <Gift className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold text-white">Edit Bonus Rules</h3>
              </div>

              <form onSubmit={handleSaveBonusRules} className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Welcome Bonus Amount (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={rulesFormData.welcomeBonus}
                    onChange={(e) =>
                      setRulesFormData((prev) => ({ ...prev, welcomeBonus: e.target.value }))
                    }
                    className="w-full bg-[#070B14] border border-slate-700/90 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
                    placeholder="e.g. 500"
                    required
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    This amount is credited as signup cash to new users joining via generated links.
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div>
                    <span className="text-xs font-semibold text-slate-300 block">
                      Program Active
                    </span>
                    <span className="text-[11px] text-slate-400 block">
                      Allow generated links to be valid for registration.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={rulesFormData.isReferralActive}
                    onChange={(e) =>
                      setRulesFormData((prev) => ({
                        ...prev,
                        isReferralActive: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsEditRulesOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdatingRules}
                    className="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white transition-colors flex items-center gap-1.5 shadow-md shadow-blue-600/25 disabled:opacity-50"
                  >
                    {isUpdatingRules ? "Saving..." : "Save Rules"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── Delete Confirmation Modal ─────────────────────────── */}
      <ConfirmationModal
        isOpen={Boolean(deleteTargetId)}
        title="Delete Registration Link"
        message="Are you sure you want to delete this registration link? Any users trying to sign up with this link will no longer receive the campaign bonus."
        onConfirm={async () => {
          if (deleteTargetId) {
            await deleteLink(deleteTargetId);
            setDeleteTargetId(null);
          }
        }}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
};

export default RegistrationLinkGenerator;
