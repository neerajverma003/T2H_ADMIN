import { useState, useEffect } from "react";
import { 
  Gift, Link2, Users, Wallet, ShieldCheck, Share2, Search, 
  Plus, RefreshCw, CheckCircle2, Clock, Copy, ExternalLink, 
  User, Mail, Phone, ChevronDown, Check, X, Sparkles,
  AlertCircle, ArrowUpRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useSignupBonusStore } from "../../stores/signupBonusStore";

const SignupBonus = () => {
  const navigate = useNavigate();
  const {
    stats,
    ledger,
    total,
    isLoadingStats,
    isLoadingLedger,
    isSubmittingUser,
    isTogglingProgram,
    searchQuery,
    statusFilter,
    setSearchQuery,
    setStatusFilter,
    fetchStats,
    fetchLedger,
    toggleProgramStatus,
    manualAddUser,
  } = useSignupBonusStore();

  const [copiedToken, setCopiedToken] = useState(null);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [userFormData, setUserFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobile_number: "",
    user_type: "user",
    bonusAmount: 500,
  });

  useEffect(() => {
    fetchStats();
    fetchLedger();
  }, [fetchStats, fetchLedger]);

  // Keep default bonus in sync with rules
  useEffect(() => {
    if (stats.welcomeBonus) {
      setUserFormData((prev) => ({
        ...prev,
        bonusAmount: stats.welcomeBonus,
      }));
    }
  }, [stats.welcomeBonus]);

  // Copy helper
  const handleCopy = async (text, id) => {
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
      setCopiedToken(id);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopiedToken(null), 2500);
    } catch (err) {
      toast.error("Failed to copy");
    }
  };

  // Submit manual user
  const handleAddUserSubmit = async (e) => {
    e.preventDefault();
    if (!userFormData.firstName.trim() || !userFormData.email.trim()) {
      toast.error("Please enter first name and a valid email.");
      return;
    }

    const success = await manualAddUser({
      ...userFormData,
      user_type: "user",
    });

    if (success) {
      setIsAddUserModalOpen(false);
      setUserFormData({
        firstName: "",
        lastName: "",
        email: "",
        mobile_number: "",
        user_type: "user",
        bonusAmount: stats.welcomeBonus || 500,
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#070B14] text-slate-100 p-4 sm:p-6 lg:p-8 space-y-8">
      {/* ─── Top Header ─────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-lg shadow-blue-600/10">
            <Gift className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              Sign-up Bonus & Referral <span className="text-blue-500">Program</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Manage user registration cash rewards, shareable link bonuses, and referral wallet rules.
            </p>
          </div>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-3 self-start md:self-auto">
          {/* Refresh Button */}
          <button
            onClick={() => {
              fetchStats();
              fetchLedger();
            }}
            disabled={isLoadingStats || isLoadingLedger}
            className="w-10 h-10 rounded-xl bg-[#0E1526] hover:bg-[#162038] border border-slate-800 flex items-center justify-center text-slate-300 hover:text-white transition-all shadow-sm"
            title="Refresh Ledger"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingStats || isLoadingLedger ? "animate-spin text-blue-400" : ""}`} />
          </button>

          {/* Program Status Badge Toggle */}
          <div className="flex items-center gap-2.5 bg-[#0E1526] border border-slate-800 px-3.5 py-1.5 rounded-xl">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              PROGRAM STATUS:
            </span>
            <button
              onClick={toggleProgramStatus}
              disabled={isTogglingProgram}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                stats.isProgramActive
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25"
                  : "bg-rose-500/15 text-rose-400 border border-rose-500/30 hover:bg-rose-500/25"
              }`}
              title="Click to toggle program status"
            >
              <span className={`w-2 h-2 rounded-full ${stats.isProgramActive ? "bg-emerald-400 animate-pulse" : "bg-rose-400"}`} />
              {stats.isProgramActive ? "ACTIVE" : "INACTIVE"}
            </button>
          </div>
        </div>
      </div>

      {/* ─── 4 Summary Metric Cards ────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Links Shared */}
        <div className="bg-[#0B101D] border border-slate-800/90 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-slate-700/80 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider uppercase text-slate-400">
              TOTAL LINKS SHARED
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-center text-purple-400">
              <Share2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white mt-3 tracking-tight">
            {stats.totalLinksShared ?? 0}
          </div>
          <div className="flex items-center gap-1.5 mt-2.5 text-xs font-semibold text-emerald-400">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+{stats.monthlyGrowthPercentage || 18.4}% this month</span>
          </div>
        </div>

        {/* Card 2: Successful Referrals */}
        <div className="bg-[#0B101D] border border-slate-800/90 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-slate-700/80 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider uppercase text-slate-400">
              SUCCESSFUL REFERRALS
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-600/15 border border-blue-500/25 flex items-center justify-center text-blue-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white mt-3 tracking-tight">
            {stats.successfulReferrals ?? 0}
          </div>
          <div className="flex items-center gap-1.5 mt-2.5 text-xs font-semibold text-blue-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Live from MongoDB</span>
          </div>
        </div>

        {/* Card 3: Distributed Cash Bonus */}
        <div className="bg-[#0B101D] border border-slate-800/90 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-slate-700/80 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider uppercase text-slate-400">
              DISTRIBUTED CASH BONUS
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white mt-3 tracking-tight">
            ₹{(stats.distributedCashBonus ?? 0).toLocaleString("en-IN")}
          </div>
          <div className="flex items-center gap-1.5 mt-2.5 text-xs font-semibold text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Direct wallet cash</span>
          </div>
        </div>

        {/* Card 4: Active Reward Users */}
        <div className="bg-[#0B101D] border border-slate-800/90 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-slate-700/80 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider uppercase text-slate-400">
              ACTIVE REWARD USERS
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-blue-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white mt-3 tracking-tight">
            {stats.activeRewardUsers ?? 0}
          </div>
          <div className="flex items-center gap-1.5 mt-2.5 text-xs font-semibold text-blue-400">
            <Clock className="w-3.5 h-3.5" />
            <span>Wallet balance active</span>
          </div>
        </div>
      </div>

      {/* ─── Registration Link Welcome Bonus Sign-up Ledger ──────── */}
      <div className="bg-[#0B101D] border border-slate-800/90 rounded-2xl p-5 sm:p-6 shadow-xl space-y-6">
        {/* Ledger Header & Search/Filter Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-800/60">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mt-0.5">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                Registration Link Welcome Bonus Sign-up Ledger
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Live audit records from MongoDB of users registered via invitation links.
              </p>
            </div>
          </div>

          {/* Search & Status Filters */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative min-w-[240px] sm:w-64">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") fetchLedger();
                }}
                placeholder="Search user, link..."
                className="w-full bg-[#070B14] border border-slate-800 rounded-xl pl-9 pr-3.5 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/70 transition-colors"
              />
            </div>

            {/* Status Dropdown */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none bg-[#070B14] border border-slate-800 text-xs sm:text-sm text-slate-300 font-semibold rounded-xl px-4 py-2 pr-8 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* ─── Table Section Header: Title & + Add User Button ──── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-300">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                User Registration Link Sign-ups
              </h3>
              <p className="text-[11px] font-bold uppercase tracking-wider text-blue-400 mt-0.5">
                {total} JOINED USERS
              </p>
            </div>
          </div>

          {/* + Add User Button */}
          <button
            onClick={() => setIsAddUserModalOpen(true)}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-xl text-xs sm:text-sm transition-all shadow-md shadow-blue-600/25 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add User</span>
          </button>
        </div>

        {/* ─── Table / Ledger Records ────────────────────────────── */}
        <div className="overflow-x-auto rounded-xl border border-slate-800/80">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#090E1A] border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">JOINED USER (REGISTRATION LINK)</th>
                <th className="py-3 px-4">WELCOME BONUS</th>
                <th className="py-3 px-4">STATUS</th>
                <th className="py-3 px-4">DATE</th>
                <th className="py-3 px-4">TIMING</th>
                <th className="py-3 px-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs sm:text-sm">
              {isLoadingLedger ? (
                <tr>
                  <td colSpan={6} className="py-14 text-center text-slate-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
                    <p className="text-xs">Loading registration bonus ledger...</p>
                  </td>
                </tr>
              ) : ledger.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-14 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-600">
                      <Gift className="w-6 h-6" />
                    </div>
                    <p className="text-white font-semibold text-sm">
                      No user sign-ups found
                    </p>
                    <p className="text-slate-400 text-xs mt-1 max-w-sm mx-auto">
                      Users who sign up via invitation links sent in emails or campaigns will appear here automatically with their welcome bonus records.
                    </p>
                    <div className="mt-4 flex items-center justify-center gap-3">
                      <button
                        onClick={() => navigate("/registration-links")}
                        className="text-xs font-bold text-blue-400 hover:text-blue-300 underline"
                      >
                        Generate Registration Link →
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                ledger.map((item) => {
                  const isCopied = copiedToken === item._id;
                  return (
                    <tr
                      key={item._id}
                      className="hover:bg-[#0E1528]/60 transition-colors group"
                    >
                      {/* Joined User Details */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {/* Avatar Circle */}
                          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600/20 to-indigo-600/20 border border-slate-700 flex items-center justify-center text-blue-400 font-bold text-xs uppercase flex-shrink-0">
                            {item.firstName ? item.firstName.charAt(0) : "U"}
                          </div>

                          <div className="space-y-0.5">
                            <div className="font-bold text-white group-hover:text-blue-400 transition-colors flex items-center gap-2">
                              <span>{item.fullName}</span>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3 text-slate-500" />
                                {item.email}
                              </span>
                              {item.mobile_number && item.mobile_number !== "N/A" && (
                                <span className="flex items-center gap-1 text-slate-500">
                                  • <Phone className="w-3 h-3 text-slate-500" />
                                  {item.mobile_number}
                                </span>
                              )}
                            </div>

                            {/* Registration Link / Token Pill */}
                            {item.registrationLink && (
                              <div className="flex items-center gap-1.5 pt-0.5">
                                <span className="inline-flex items-center gap-1 text-[11px] font-mono text-indigo-300 bg-indigo-950/40 border border-indigo-500/20 px-2 py-0.5 rounded">
                                  <Link2 className="w-3 h-3 text-indigo-400" />
                                  token: {item.registrationLink.token?.slice(0, 10)}...
                                </span>
                                <button
                                  onClick={() => handleCopy(item.registrationLink.full_url, item._id)}
                                  className="text-slate-400 hover:text-white p-0.5"
                                  title="Copy registration link used"
                                >
                                  {isCopied ? (
                                    <Check className="w-3 h-3 text-emerald-400" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Welcome Bonus */}
                      <td className="py-3.5 px-4 font-bold text-white">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          <Wallet className="w-3.5 h-3.5" />
                          ₹{(item.welcomeBonus || 500).toLocaleString("en-IN")}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          {item.status || "Completed"}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-xs font-medium text-slate-300">
                        {item.date}
                      </td>

                      {/* Timing */}
                      <td className="py-3.5 px-4 text-xs font-mono text-slate-400">
                        {item.time}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => navigate(`/customers/${item._id}`)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-300 hover:text-blue-400 bg-[#121A2E] hover:bg-[#1A2642] border border-slate-700/80 px-2.5 py-1.5 rounded-lg transition-all"
                          title="View customer profile"
                        >
                          <span>Profile</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Modal: Add User Manually (+ Add User) ─────────────── */}
      <AnimatePresence>
        {isAddUserModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0B101D] border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl relative"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-600/15 border border-blue-500/25 flex items-center justify-center text-blue-400">
                    <User className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-white">
                    Add User & Credit Welcome Bonus
                  </h3>
                </div>
                <button
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddUserSubmit} className="mt-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={userFormData.firstName}
                      onChange={(e) =>
                        setUserFormData((prev) => ({ ...prev, firstName: e.target.value }))
                      }
                      className="w-full bg-[#070B14] border border-slate-700 rounded-xl px-3 py-2 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500"
                      placeholder="e.g. Rahul"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={userFormData.lastName}
                      onChange={(e) =>
                        setUserFormData((prev) => ({ ...prev, lastName: e.target.value }))
                      }
                      className="w-full bg-[#070B14] border border-slate-700 rounded-xl px-3 py-2 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500"
                      placeholder="e.g. Sharma"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={userFormData.email}
                    onChange={(e) =>
                      setUserFormData((prev) => ({ ...prev, email: e.target.value }))
                    }
                    className="w-full bg-[#070B14] border border-slate-700 rounded-xl px-3 py-2 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500"
                    placeholder="user@example.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    value={userFormData.mobile_number}
                    onChange={(e) =>
                      setUserFormData((prev) => ({ ...prev, mobile_number: e.target.value }))
                    }
                    className="w-full bg-[#070B14] border border-slate-700 rounded-xl px-3 py-2 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500"
                    placeholder="e.g. +91 9876543210"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Welcome Bonus Amount (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={userFormData.bonusAmount}
                    onChange={(e) =>
                      setUserFormData((prev) => ({ ...prev, bonusAmount: e.target.value }))
                    }
                    className="w-full bg-[#070B14] border border-slate-700 rounded-xl px-3 py-2 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500"
                    placeholder="500"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    This cash bonus will be instantly credited to the user&apos;s referral wallet.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsAddUserModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingUser}
                    className="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white transition-colors flex items-center gap-1.5 shadow-md shadow-blue-600/25 disabled:opacity-50"
                  >
                    {isSubmittingUser ? "Adding..." : "Credit & Save User"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SignupBonus;
