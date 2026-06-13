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
      className="space-y-8 p-1"
    >
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-gradient-to-r from-slate-900 to-indigo-950 p-8 rounded-[2rem] border border-indigo-900/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-indigo-500/20 text-indigo-400 rounded-xl">
              <Shield size={24} />
            </span>
            <span className="text-xs font-extrabold uppercase tracking-[0.2em] text-indigo-400">Security Control</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight mt-3">
            Referral & Wallet Audit
          </h1>
          <p className="text-slate-400 font-medium mt-2 text-sm max-w-xl">
            Monitor registration velocities, trace promotional reward allocations, audit automated logs, and manage manual lock states.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700/50 self-start lg:self-center relative z-10">
          <button
            onClick={() => setActiveTab("customers")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              activeTab === "customers"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Users size={16} />
            Customers Overview
          </button>
          <button
            onClick={() => setActiveTab("logs")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              activeTab === "logs"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <History size={16} />
            Velocity Logs
          </button>
        </div>
      </div>

      {/* SEARCH AND FILTERS */}
      {activeTab === "customers" && (
        <div className="flex items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/60 shadow-md">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by name, email, or referral code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 pr-6 py-3 bg-slate-50 dark:bg-slate-800/50 border border-transparent focus:border-indigo-500 rounded-xl text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/10 w-full transition-all"
            />
          </div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest hidden md:block">
            Found {filteredCustomers.length} Records
          </div>
        </div>
      )}

      {/* CONTENT TABLES */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800/50 shadow-xl overflow-hidden min-h-[400px] relative">
        {loading ? (
          <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3 z-20">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Syncing Secure Directory...</p>
          </div>
        ) : null}

        {activeTab === "customers" ? (
          filteredCustomers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="px-8 py-5 text-left font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider text-xs">Customer</th>
                    <th className="px-6 py-5 text-left font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider text-xs">Referral Code</th>
                    <th className="px-6 py-5 text-left font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider text-xs">Wallet Balance</th>
                    <th className="px-6 py-5 text-center font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider text-xs">Referrals Made</th>
                    <th className="px-6 py-5 text-center font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider text-xs">Wallet State</th>
                    <th className="px-8 py-5 text-right font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider text-xs">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredCustomers.map((user) => (
                    <tr key={user._id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4.5">
                          <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white text-base font-black shadow-md ${
                            user.is_wallet_frozen 
                              ? "bg-gradient-to-tr from-sky-500 to-indigo-600 shadow-sky-500/20" 
                              : "bg-gradient-to-tr from-indigo-600 to-indigo-800 shadow-indigo-600/20"
                          }`}>
                            {(user.firstName || "U").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white text-base leading-none mb-1">
                              {user.firstName} {user.lastName || ""}
                            </p>
                            <p className="text-xs text-slate-400 font-semibold">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800/80 rounded-lg text-slate-700 dark:text-slate-300 font-mono text-xs font-bold border border-slate-200/40">
                          {user.referral_code || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-base font-black text-emerald-600 dark:text-emerald-500">
                          ₹{(user.wallet_balance || 0).toLocaleString("en-IN")}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 rounded-full text-xs font-extrabold border border-indigo-100 dark:border-indigo-900/30">
                          {user.referralCount} referrals
                        </span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        {user.is_wallet_frozen ? (
                          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 text-xs font-extrabold border border-sky-100 dark:border-sky-900/30">
                            <Snowflake size={12} className="animate-pulse" />
                            Frozen
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-extrabold border border-emerald-100 dark:border-emerald-900/30">
                            <Sun size={12} />
                            Active
                          </span>
                        )}
                      </td>
                      <td className="px-8 py-5 text-right">
                        <button
                          onClick={() => handleActionClick(user)}
                          className={`px-4 py-2 rounded-xl text-xs font-extrabold tracking-wider uppercase transition-all shadow-sm border ${
                            user.is_wallet_frozen
                              ? "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500 shadow-emerald-500/10"
                              : "bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border-red-200/50 hover:bg-red-600 hover:text-white"
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
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <Users className="size-14 text-slate-300 dark:text-slate-700 mb-4" />
              <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No records matching query</p>
            </div>
          )
        ) : (
          logs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="px-8 py-5 text-left font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider text-xs">Referrer Account</th>
                    <th className="px-6 py-5 text-left font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider text-xs">Security Event</th>
                    <th className="px-6 py-5 text-left font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider text-xs">Violation Details</th>
                    <th className="px-6 py-5 text-center font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider text-xs">Referrals (24h)</th>
                    <th className="px-8 py-5 text-right font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider text-xs">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {logs.map((log) => (
                    <tr key={log._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="px-8 py-5">
                        {log.referrerId ? (
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">
                              {log.referrerId.firstName} {log.referrerId.lastName || ""}
                            </p>
                            <p className="text-xs text-slate-400 font-semibold">{log.referrerId.email}</p>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Unknown Referrer</span>
                        )}
                      </td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-extrabold border ${
                          log.action === "AUTO_FREEZE"
                            ? "bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border-red-100 dark:border-red-900/30"
                            : log.action === "MANUAL_FREEZE"
                            ? "bg-orange-50 dark:bg-orange-950/20 text-orange-700 dark:text-orange-400 border-orange-100 dark:border-orange-900/30"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200/40"
                        }`}>
                          <AlertTriangle size={12} />
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-5 max-w-xs truncate">
                        <span className="text-slate-600 dark:text-slate-300 font-semibold text-xs">
                          {log.details}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-center font-black text-slate-900 dark:text-white">
                        {log.referralCountIn24h || "—"}
                      </td>
                      <td className="px-8 py-5 text-right text-xs font-bold text-slate-400">
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
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <History className="size-14 text-slate-300 dark:text-slate-700 mb-4" />
              <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No velocity logs recorded yet</p>
            </div>
          )
        )}
      </div>

      {/* CONFIRMATION / PARAMETERS CONFIGURATION MODAL */}
      <AnimatePresence>
        {isModalOpen && selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800/80 max-w-lg w-full overflow-hidden shadow-2xl relative z-10 p-8"
            >
              <div className="flex items-center gap-3.5 mb-6">
                <div className={`p-2.5 rounded-xl ${
                  selectedUser.is_wallet_frozen
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                    : "bg-red-500/15 text-red-600 dark:text-red-400"
                }`}>
                  {selectedUser.is_wallet_frozen ? <Sun size={22} /> : <Snowflake size={22} />}
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-950 dark:text-white">
                    {selectedUser.is_wallet_frozen ? "Unfreeze Wallet" : "Freeze Wallet"}
                  </h2>
                  <p className="text-xs font-semibold text-slate-400 mt-0.5">
                    Modifying state for {selectedUser.firstName} {selectedUser.lastName || ""}
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                <p className="text-slate-600 dark:text-slate-300 font-medium text-sm leading-relaxed">
                  {selectedUser.is_wallet_frozen
                    ? "Are you sure you want to unfreeze this customer's wallet? This will re-enable travel credits stacking and use on honeymoon packages."
                    : "Freezing the wallet restricts the user from receiving new referral bonuses and utilizing their current wallet credits at checkout."}
                </p>

                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
                    Action Reason
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Provide detailed logs explaining this security override action..."
                    value={freezeReason}
                    onChange={(e) => setFreezeReason(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 focus:border-indigo-500 rounded-xl p-4 text-sm font-semibold text-slate-900 dark:text-white focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none resize-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-8">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-3 rounded-xl text-xs font-extrabold uppercase tracking-wider text-slate-500 hover:text-slate-800 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleToggleFreeze}
                  disabled={submittingFreeze}
                  className={`px-6 py-3 rounded-xl text-xs font-extrabold uppercase tracking-wider text-white shadow-lg transition-all flex items-center gap-2 ${
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
