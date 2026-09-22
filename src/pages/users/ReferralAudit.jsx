import { useEffect, useState } from "react";
import { Shield, Users, Search, AlertTriangle, Snowflake, Sun, History, ArrowRightLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { apiClient } from "../../stores/authStores";

const ReferralAudit = () => {
  const [activeTab, setActiveTab] = useState("customers"); // customers | logs
  const [customers, setCustomers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [freezeReason, setFreezeReason] = useState("");
  const [submittingFreeze, setSubmittingFreeze] = useState(false);

  // Fetch functions
  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/admin/customers");
      if (res.data?.success) {
        setCustomers(res.data.customers);
      } else {
        toast.error("Failed to load customer list");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error retrieving customers");
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/admin/referral-audit-logs");
      if (res.data?.success) {
        setLogs(res.data.logs);
      } else {
        toast.error("Failed to load audit logs");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error retrieving audit logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "customers") {
      fetchCustomers();
    } else {
      fetchLogs();
    }
  }, [activeTab]);

  const handleActionClick = (user) => {
    setSelectedUser(user);
    setFreezeReason(user.wallet_frozen_reason || "");
    setIsModalOpen(true);
  };

  const handleToggleFreeze = async () => {
    if (!selectedUser) return;
    setSubmittingFreeze(true);
    const newStatus = !selectedUser.is_wallet_frozen;
    try {
      const res = await apiClient.post(`/admin/customers/${selectedUser._id}/freeze`, {
        freeze: newStatus,
        reason: freezeReason.trim()
      });
      if (res.data?.success) {
        toast.success(`User wallet successfully ${newStatus ? "frozen" : "unfrozen"}`);
        setIsModalOpen(false);
        fetchCustomers();
      } else {
        toast.error("Failed to update wallet state");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error updating wallet freeze state");
    } finally {
      setSubmittingFreeze(false);
    }
  };

  // Filtered customer listing
  const filteredCustomers = customers.filter((user) => {
    const fullName = `${user.firstName || ""} ${user.lastName || ""}`.toLowerCase();
    const email = (user.email || "").toLowerCase();
    const refCode = (user.referral_code || "").toLowerCase();
    const search = searchTerm.toLowerCase();
    return fullName.includes(search) || email.includes(search) || refCode.includes(search);
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8 pb-20 font-sans min-h-screen text-slate-900 dark:text-slate-100 text-left"
    >
      {/* ── HEADER HUB ── */}
      <div className="bg-white dark:bg-[#091126] rounded-3xl py-4 sm:py-5 px-6 sm:px-8 border border-slate-200 dark:border-slate-800 shadow-md relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="relative z-10 flex items-center gap-3.5">
          <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0">
            <Shield size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full">
                SECURITY CONTROL
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2 flex-wrap">
              Referral & <span className="text-blue-500">Wallet Audit</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-semibold mt-0.5 text-xs sm:text-sm max-w-xl">
              Monitor registration velocities, trace promotional reward allocations, audit automated logs, and manage manual lock states.
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 dark:bg-[#050A17] p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 self-start lg:self-center relative z-10">
          <button
            onClick={() => setActiveTab("customers")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === "customers"
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Users size={14} />
            Customers Overview
          </button>
          <button
            onClick={() => setActiveTab("logs")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === "logs"
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <History size={14} />
            Velocity Logs
          </button>
        </div>
      </div>

      {/* ── SEARCH AND FILTERS ── */}
      {activeTab === "customers" && (
        <div className="flex items-center justify-between gap-4 bg-white dark:bg-[#091126] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={16} />
            <input
              type="text"
              placeholder="Search by name, email, or referral code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800/90 bg-slate-50 dark:bg-[#050A17] text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all shadow-inner"
            />
          </div>
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest hidden md:block">
            Found {filteredCustomers.length} Records
          </div>
        </div>
      )}

      {/* ── CONTENT TABLES ── */}
      <div className="bg-white dark:bg-[#091126] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden min-h-[400px] relative">
        {loading ? (
          <div className="absolute inset-0 bg-white/80 dark:bg-[#091126]/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3 z-20">
            <div className="w-9 h-9 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Syncing Secure Directory...</p>
          </div>
        ) : null}

        {activeTab === "customers" ? (
          filteredCustomers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50/80 dark:bg-[#080f1b]/80 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-6 py-4 font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px]">Customer</th>
                    <th className="px-6 py-4 font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px]">Referral Code</th>
                    <th className="px-6 py-4 font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px]">Wallet Balance</th>
                    <th className="px-6 py-4 text-center font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px]">Referrals Made</th>
                    <th className="px-6 py-4 text-center font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px]">Wallet State</th>
                    <th className="px-6 py-4 text-right font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px]">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredCustomers.map((user) => (
                    <tr key={user._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3.5">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-black shadow-md ${
                            user.is_wallet_frozen 
                              ? "bg-gradient-to-tr from-sky-500 to-indigo-600 shadow-sky-500/20" 
                              : "bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-blue-500/20"
                          }`}>
                            {(user.firstName || "U").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-extrabold text-slate-900 dark:text-white text-sm leading-none mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {user.firstName} {user.lastName || ""}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-800 dark:text-slate-200 font-mono text-xs font-bold border border-slate-200 dark:border-slate-700/60">
                          {user.referral_code || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                          ₹{(user.wallet_balance || 0).toLocaleString("en-IN")}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="px-3 py-1 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 rounded-full text-xs font-extrabold border border-blue-200 dark:border-blue-900/30">
                          {user.referralCount} referrals
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {user.is_wallet_frozen ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 text-xs font-extrabold border border-sky-200 dark:border-sky-900/30">
                            <Snowflake size={12} className="animate-pulse" />
                            Frozen
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-extrabold border border-emerald-200 dark:border-emerald-900/30">
                            <Sun size={12} />
                            Active
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleActionClick(user)}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-all shadow-xs border cursor-pointer ${
                            user.is_wallet_frozen
                              ? "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500 shadow-emerald-500/20"
                              : "bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/30 hover:bg-rose-600 hover:text-white"
                          }`}
                        >
                          {user.is_wallet_frozen ? "Unfreeze" : "Freeze"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-28 text-center">
              <Users className="size-14 text-slate-300 dark:text-slate-600 mb-4" />
              <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-xs">No records matching query</p>
            </div>
          )
        ) : (
          logs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50/80 dark:bg-[#080f1b]/80 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-6 py-4 font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px]">Referrer Account</th>
                    <th className="px-6 py-4 font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px]">Security Event</th>
                    <th className="px-6 py-4 font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px]">Violation Details</th>
                    <th className="px-6 py-4 text-center font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px]">Referrals (24h)</th>
                    <th className="px-6 py-4 text-right font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px]">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {logs.map((log) => (
                    <tr key={log._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-6 py-4">
                        {log.referrerId ? (
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white text-sm">
                              {log.referrerId.firstName} {log.referrerId.lastName || ""}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{log.referrerId.email}</p>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-xs">Unknown Referrer</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${
                          log.action === "AUTO_FREEZE"
                            ? "bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/30"
                            : log.action === "MANUAL_FREEZE"
                            ? "bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/30"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700/40"
                        }`}>
                          <AlertTriangle size={12} />
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 max-w-xs truncate">
                        <span className="text-slate-700 dark:text-slate-300 font-semibold text-xs">
                          {log.details}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center font-black text-slate-900 dark:text-white">
                        {log.referralCountIn24h || "—"}
                      </td>
                      <td className="px-6 py-4 text-right text-xs font-bold text-slate-500 dark:text-slate-400">
                        {new Date(log.createdAt).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-28 text-center">
              <History className="size-14 text-slate-300 dark:text-slate-600 mb-4" />
              <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-xs">No velocity logs recorded yet</p>
            </div>
          )
        )}
      </div>

      {/* ── CONFIRMATION / PARAMETERS CONFIGURATION MODAL ── */}
      <AnimatePresence>
        {isModalOpen && selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-[#091126] rounded-3xl border border-slate-200 dark:border-indigo-500/25 max-w-lg w-full overflow-hidden shadow-2xl relative z-10 p-6 sm:p-8 ring-1 ring-slate-900/5 dark:ring-white/5"
            >
              <div className="flex items-center gap-3.5 mb-6">
                <div className={`p-2.5 rounded-xl ${
                  selectedUser.is_wallet_frozen
                    ? "bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                    : "bg-red-50 dark:bg-red-500/15 text-red-600 dark:text-red-400"
                }`}>
                  {selectedUser.is_wallet_frozen ? <Sun size={22} /> : <Snowflake size={22} />}
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white">
                    {selectedUser.is_wallet_frozen ? "Unfreeze Wallet" : "Freeze Wallet"}
                  </h2>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                    Modifying state for {selectedUser.firstName} {selectedUser.lastName || ""}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-slate-600 dark:text-slate-400 font-medium text-xs leading-relaxed">
                  {selectedUser.is_wallet_frozen
                    ? "Are you sure you want to unfreeze this customer's wallet? This will re-enable travel credits stacking and use on honeymoon packages."
                    : "Freezing the wallet restricts the user from receiving new referral bonuses and utilizing their current wallet credits at checkout."}
                </p>

                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">
                    Action Reason
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Provide detailed logs explaining this security override action..."
                    value={freezeReason}
                    onChange={(e) => setFreezeReason(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#050A17] border border-slate-200 dark:border-slate-800/90 focus:border-blue-500 rounded-xl p-3 text-xs font-bold text-slate-900 dark:text-white focus:ring-1 focus:ring-blue-500/30 transition-all outline-none resize-none shadow-inner"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-6">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleToggleFreeze}
                  disabled={submittingFreeze}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white shadow-md transition-all flex items-center gap-2 cursor-pointer ${
                    selectedUser.is_wallet_frozen
                      ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20"
                      : "bg-red-600 hover:bg-red-700 shadow-red-500/20"
                  }`}
                >
                  {submittingFreeze && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  Confirm Override
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ReferralAudit;
