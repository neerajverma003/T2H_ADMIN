import { useEffect, useState, useMemo } from "react";
import { apiClient } from "../../../stores/authStores";
import {
  Mail,
  Phone,
  Trash2,
  User,
  Loader2,
  Sparkles,
  Search,
  ChevronLeft,
  ChevronRight,
  BellRing,
  Inbox,
  Heart,
  CheckCircle2,
  Calendar
} from "lucide-react";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

const STATUS_STYLES = {
  subscribed: 'bg-emerald-500 text-white border-transparent hover:bg-emerald-600 shadow-lg shadow-emerald-500/30',
  unsubscribed: 'bg-slate-600 text-white border-transparent hover:bg-slate-700 shadow-lg shadow-slate-500/30'
};

const ITEMS_PER_PAGE = 12;

const Subscribe = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalSubscribers, setTotalSubscribers] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [openDropdownId, setOpenDropdownId] = useState(null);

  const totalPages = useMemo(() => Math.ceil(totalSubscribers / ITEMS_PER_PAGE), [totalSubscribers]);

  const fetchSubscribers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get("/admin/get-subscribe");
      const data = response.data.Data || [];
      setTotalSubscribers(data.length);
      const start = (currentPage - 1) * ITEMS_PER_PAGE;
      setSubscribers(data.slice(start, start + ITEMS_PER_PAGE));
    } catch (err) {
      setError("Failed to synchronize subscriber vault.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, [currentPage]);

  const handleDelete = async (subscriberId) => {
    if (!window.confirm("Permanently remove this subscriber from the newsletter?")) return;
    try {
      const response = await apiClient.delete(`/admin/get-subscribe/${subscriberId}`);
      if (response.data.success) {
        toast.success("Subscriber removed");
        fetchSubscribers();
      }
    } catch (err) {
      toast.error("Removal failed.");
    }
  };

  const handleStatusChange = async (leadId, newStatus) => {
    const previousSubscribers = [...subscribers];
    setSubscribers(subscribers.map(s =>
      s._id === leadId ? { ...s, status: newStatus } : s
    ));

    try {
      const response = await apiClient.put(`/admin/get-subscribe/${leadId}/status`, { status: newStatus });
      if (response.data.success) {
        toast.success(`Status updated to ${newStatus.replace('_', ' ').toUpperCase()}`);
      } else {
        throw new Error("Update failed");
      }
    } catch (err) {
      setSubscribers(previousSubscribers);
      toast.error(err.response?.data?.message || "Failed to update status");
    }
  };

  const filtered = subscribers.filter(s =>
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8 pb-20 font-sans min-h-screen text-slate-900 dark:text-slate-100 text-left">
      {/* HEADER HUB */}
      <div className="bg-white dark:bg-[#091126]/95 rounded-3xl py-4 sm:py-5 px-6 sm:px-8 border border-slate-200/90 dark:border-indigo-500/25 shadow-xl dark:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.7),0_0_30px_2px_rgba(99,102,241,0.18)] ring-1 ring-slate-900/5 dark:ring-white/5 backdrop-blur-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Glow Effects */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-blue-500/10 dark:bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-indigo-500/10 dark:bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-500/30 shrink-0">
            <Inbox size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-500 dark:text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full">
                AUDIENCE NETWORK
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2 flex-wrap">
              Blog Newsletter <span className="text-blue-500">Audience</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-semibold mt-0.5 text-xs sm:text-sm">
              Audience subscribed through the Travel Journal & Editorial newsletter forms.
            </p>
          </div>
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative group w-full sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
            <input
              type="text"
              placeholder="Filter audience..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-slate-50 dark:bg-[#050A17] border border-slate-200 dark:border-slate-800/90 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 rounded-xl text-xs font-semibold w-full outline-none transition-all placeholder:text-slate-400 dark:placeholder-slate-500 text-slate-900 dark:text-white shadow-inner"
            />
          </div>
          <div className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 text-blue-500 dark:text-blue-400 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shrink-0">
            <Sparkles size={15} /> {totalSubscribers} ACTIVE AUDIENCE
          </div>
        </div>
      </div>

      {/* SUBSCRIBER GRID */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <Loader2 className="animate-spin text-blue-500" size={48} strokeWidth={1.5} />
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Synchronizing Audience Vault...</p>
        </div>
      ) : error ? (
        <div className="py-16 text-center bg-rose-50 dark:bg-rose-500/10 rounded-2xl border border-rose-200 dark:border-rose-500/30">
          <p className="text-rose-600 dark:text-rose-400 font-bold uppercase tracking-wide text-xs">{error}</p>
        </div>
      ) : filtered.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-4">
            <AnimatePresence mode='popLayout'>
              {filtered.map((sub) => (
                <motion.div
                  layout
                  key={sub._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`bg-white dark:bg-[#091126]/95 border border-slate-200/90 dark:border-indigo-500/25 shadow-xl ring-1 ring-slate-900/5 dark:ring-white/5 backdrop-blur-xl rounded-3xl p-5 sm:p-6 transition-all duration-300 hover:scale-[1.003] ${openDropdownId === sub._id ? 'z-50' : 'z-10'}`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    {/* IDENTITY SECTION */}
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-md shadow-blue-500/30">
                        {sub.email?.charAt(0).toUpperCase()}
                      </div>
                      <div className="text-left">
                        <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight truncate max-w-xs">
                          {sub.name || sub.email}
                        </h2>
                        {sub.name && (
                          <p className="text-xs font-mono text-slate-500 dark:text-slate-400 truncate max-w-xs">{sub.email}</p>
                        )}
                        <div className="flex items-center gap-1.5 mt-1 px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded-md text-[9px] font-bold uppercase tracking-wider border border-blue-500/20 w-fit">
                          <CheckCircle2 size={10} /> Elite Member
                        </div>
                      </div>
                    </div>

                    {/* DATA STRIP */}
                    <div className="flex-1 flex flex-wrap items-center gap-6 py-3 md:py-0 border-y md:border-y-0 md:border-x border-slate-200 dark:border-slate-800/80 md:px-6">
                      {sub.phone && (
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase tracking-wide">
                            <Phone size={11} className="text-blue-500" /> PHONE
                          </div>
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                            {sub.phone}
                          </p>
                        </div>
                      )}

                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase tracking-wide">
                          <Mail size={11} className="text-blue-500" /> STATUS
                        </div>
                        <p className={`text-[10px] font-bold uppercase tracking-wider ${(sub.status || 'subscribed') === 'subscribed' ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {(sub.status || 'subscribed') === 'subscribed' ? 'Active Connection' : 'Unsubscribed'}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase tracking-wide">
                          <Calendar size={11} className="text-blue-500" /> JOINED
                        </div>
                        <p className="text-xs font-mono text-slate-700 dark:text-slate-300">
                          {sub.createdAt ? new Date(sub.createdAt).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    </div>

                    {/* ACTION HUB */}
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="relative">
                        <button
                          onClick={() => setOpenDropdownId(openDropdownId === sub._id ? null : sub._id)}
                          className={`flex items-center justify-between font-bold text-[11px] uppercase tracking-wider px-3.5 py-2 rounded-xl border transition-all cursor-pointer shadow-sm ${STATUS_STYLES[sub.status || 'subscribed']}`}
                        >
                          <span className="flex items-center gap-1.5">
                            {(sub.status === 'subscribed' || !sub.status) && "✨ SUBSCRIBED"}
                            {sub.status === 'unsubscribed' && "🚫 UNSUBSCRIBED"}
                          </span>
                        </button>

                        <AnimatePresence>
                          {openDropdownId === sub._id && (
                            <>
                              <div
                                className="fixed inset-0 z-40"
                                onClick={() => setOpenDropdownId(null)}
                              />
                              <motion.div
                                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                transition={{ duration: 0.15 }}
                                className="absolute top-full right-0 mt-2 w-[180px] bg-white dark:bg-[#091126] rounded-2xl shadow-xl border border-slate-200 dark:border-indigo-500/30 z-50 overflow-hidden py-1.5"
                              >
                                {['subscribed', 'unsubscribed'].map((status) => (
                                  <button
                                    key={status}
                                    onClick={() => {
                                      handleStatusChange(sub._id, status);
                                      setOpenDropdownId(null);
                                    }}
                                    className={`w-full text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 ${(sub.status || 'subscribed') === status ? 'bg-blue-50 dark:bg-blue-600/15 text-blue-500' : 'text-slate-700 dark:text-slate-300'}`}
                                  >
                                    {status === 'subscribed' && "✨ SUBSCRIBED"}
                                    {status === 'unsubscribed' && "🚫 UNSUBSCRIBED"}
                                  </button>
                                ))}
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>
                      </div>

                      <button onClick={() => handleDelete(sub._id)} className="p-2.5 bg-slate-100 dark:bg-slate-800 text-rose-500 rounded-xl hover:bg-rose-600 hover:text-white transition-all border border-slate-200 dark:border-slate-700/60 cursor-pointer">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* PAGINATION */}
          <div className="flex items-center justify-between px-6 py-4 bg-white dark:bg-[#091126]/95 rounded-3xl border border-slate-200/90 dark:border-indigo-500/25 shadow-xl">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Audience Frame: <span className="text-slate-900 dark:text-white">{currentPage}</span> <span className="mx-2 text-slate-300 dark:text-slate-600">/</span> {totalPages}
            </p>
            <div className="flex gap-2">
              <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700/60 hover:border-blue-500 disabled:opacity-30 transition-all cursor-pointer">
                <ChevronLeft size={16} />
              </button>
              <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700/60 hover:border-blue-500 disabled:opacity-30 transition-all cursor-pointer">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="py-28 text-center bg-white dark:bg-[#091126]/95 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 shadow-xl">
          <Heart className="mx-auto mb-4 text-slate-300 dark:text-slate-700" size={56} strokeWidth={1} />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight mb-1">No Active Subscribers</h3>
          <p className="text-slate-500 dark:text-slate-400 text-xs">The subscriber vault is currently clear</p>
        </div>
      )}
    </div>
  );
};

export default Subscribe;
