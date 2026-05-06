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
    Heart
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ITEMS_PER_PAGE = 12;

const Subscribe = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalSubscribers, setTotalSubscribers] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

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
      await apiClient.delete(`/admin/get-subscribe/${subscriberId}`);
      fetchSubscribers();
    } catch (err) {
      alert("Removal failed.");
    }
  };

  const filtered = subscribers.filter(s => 
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-full mx-auto space-y-10 pb-20 px-6 text-left">
      {/* HEADER HUB */}
      <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-12 border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none text-indigo-700"><BellRing size={240} /></div>
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-10">
            <div>
                <h1 className="text-4xl font-black text-slate-950 dark:text-white tracking-tight flex items-center gap-5">
                    <Inbox className="text-indigo-700" size={44} /> SUBSCRIBER REGISTRY
                </h1>
                <p className="text-slate-600 dark:text-slate-400 font-bold mt-2 text-xl italic text-left">Newsletter audience and potential honeymoon seekers</p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative group w-full sm:w-80">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-700 transition-colors" size={24} />
                    <input 
                        type="text" 
                        placeholder="Filter audience..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-16 pr-8 py-5 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-indigo-600/20 focus:ring-4 focus:ring-indigo-500/10 rounded-[1.5rem] text-lg font-black w-full outline-none transition-all placeholder:text-slate-400 shadow-sm"
                    />
                </div>
                <div className="px-8 py-5 bg-indigo-700 text-white rounded-[1.5rem] text-sm font-black uppercase tracking-[0.2em] flex items-center gap-3 shadow-2xl shadow-indigo-500/40">
                    <Sparkles size={20} /> {totalSubscribers} ACTIVE AUDIENCE
                </div>
            </div>
        </div>
      </div>

      {/* SUBSCRIBER GRID */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-48 gap-8">
            <Loader2 className="animate-spin text-indigo-700" size={64} strokeWidth={1.5} />
            <p className="text-xs font-black uppercase tracking-[0.4em] text-slate-400">Synchronizing Audience Vault...</p>
        </div>
      ) : error ? (
        <div className="py-24 text-center bg-red-50 dark:bg-red-950/20 rounded-[3rem] border-2 border-red-100 dark:border-red-900/30">
            <p className="text-red-700 font-black uppercase tracking-[0.3em] text-sm">{error}</p>
        </div>
      ) : filtered.length > 0 ? (
        <div className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                <AnimatePresence mode='popLayout'>
                    {filtered.map((sub) => (
                        <motion.div 
                            layout key={sub._id} 
                            initial={{ opacity: 0, scale: 0.95 }} 
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="group bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden transition-all hover:shadow-2xl hover:shadow-indigo-500/15"
                        >
                            <div className="p-8 flex flex-col h-full justify-between">
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="size-16 bg-indigo-700 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-indigo-500/30">
                                            {sub.name?.charAt(0).toUpperCase() || 'U'}
                                        </div>
                                        <div className="text-left">
                                            <h2 className="text-xl font-black text-slate-950 dark:text-white tracking-tight leading-tight truncate w-32 md:w-40">{sub.name || 'Anonymous'}</h2>
                                            <p className="text-[10px] font-black text-indigo-700 uppercase tracking-[0.3em] mt-1">Verified Member</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <a href={`mailto:${sub.email}`} className="flex items-center gap-4 text-slate-500 hover:text-indigo-700 transition-colors group/link overflow-hidden">
                                            <div className="size-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-100 group-hover/link:bg-indigo-700 group-hover/link:text-white transition-all shadow-sm"><Mail size={16} /></div>
                                            <span className="text-sm font-black text-slate-950 dark:text-slate-300 truncate">{sub.email}</span>
                                        </a>
                                        {sub.phone && (
                                            <div className="flex items-center gap-4 text-slate-500">
                                                <div className="size-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-100"><Phone size={16} /></div>
                                                <span className="text-sm font-black text-slate-950 dark:text-slate-300">{sub.phone}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="pt-8 mt-8 border-t-2 border-slate-50 dark:border-slate-800">
                                    <button onClick={() => handleDelete(sub._id)} className="w-full py-4 bg-white text-red-600 rounded-[1.5rem] hover:bg-red-600 hover:text-white transition-all shadow-xl border border-slate-100 text-xs font-black uppercase tracking-[0.2em]">
                                        Remove From Registry
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* PAGINATION */}
            <div className="flex items-center justify-between px-10 py-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none">
                <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">
                    Audience Frame: <span className="text-slate-950 dark:text-white">{currentPage}</span> <span className="mx-2 text-slate-200">/</span> {totalPages}
                </p>
                <div className="flex gap-4">
                    <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-950 dark:text-white border-2 border-transparent hover:border-indigo-700/20 disabled:opacity-30 transition-all">
                        <ChevronLeft size={24} strokeWidth={3} />
                    </button>
                    <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-950 dark:text-white border-2 border-transparent hover:border-indigo-700/20 disabled:opacity-30 transition-all">
                        <ChevronRight size={24} strokeWidth={3} />
                    </button>
                </div>
            </div>
        </div>
      ) : (
        <div className="py-48 text-center bg-white dark:bg-slate-900 rounded-[3.5rem] border-4 border-dashed border-slate-100 dark:border-slate-800">
            <Heart className="mx-auto mb-6 text-slate-100 dark:text-slate-800" size={100} strokeWidth={1} />
            <h3 className="text-3xl font-black text-slate-950 dark:text-white uppercase tracking-tight mb-4">No Active Subscribers</h3>
            <p className="text-slate-600 dark:text-slate-400 font-bold uppercase tracking-widest text-sm italic">The subscriber vault is currently clear</p>
        </div>
      )}
    </motion.div>
  );
};

export default Subscribe;
