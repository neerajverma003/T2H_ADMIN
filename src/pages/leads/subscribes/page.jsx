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
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-[1400px] mx-auto space-y-10 pb-20 px-6">
      {/* HEADER HUB */}
      <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-12 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none text-indigo-600"><BellRing size={200} /></div>
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div>
                <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-4">
                    <Inbox className="text-indigo-600" size={36} /> SUBSCRIBER REGISTRY
                </h1>
                <p className="text-slate-500 font-medium mt-2 text-lg italic">Newsletter audience and potential honeymoon seekers</p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                    <input 
                        type="text" 
                        placeholder="Filter subscribers..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-transparent focus:border-indigo-100 dark:focus:border-indigo-900/30 rounded-2xl text-sm font-bold w-full sm:w-64 outline-none transition-all shadow-sm"
                    />
                </div>
                <div className="px-6 py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-2xl shadow-indigo-500/30">
                    <Sparkles size={16} /> {totalSubscribers} AUDIENCE
                </div>
            </div>
        </div>
      </div>

      {/* SUBSCRIBER GRID */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-40 gap-4">
            <Loader2 className="animate-spin text-indigo-600" size={48} strokeWidth={1} />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Synchronizing Audience Vault</p>
        </div>
      ) : error ? (
        <div className="py-20 text-center bg-red-50 dark:bg-red-950/20 rounded-[3rem] border border-red-100 dark:border-red-900/30 text-red-500 font-bold uppercase tracking-widest text-xs">
            {error}
        </div>
      ) : filtered.length > 0 ? (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <AnimatePresence mode='popLayout'>
                    {filtered.map((sub) => (
                        <motion.div 
                            layout key={sub._id} 
                            initial={{ opacity: 0, scale: 0.95 }} 
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="group bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden transition-all hover:shadow-2xl"
                        >
                            <div className="p-6 flex flex-col h-full justify-between">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="size-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-lg">
                                            {sub.name?.charAt(0).toUpperCase() || 'U'}
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight leading-tight truncate w-32 md:w-40">{sub.name || 'Anonymous'}</h2>
                                            <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Subscriber</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <a href={`mailto:${sub.email}`} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors group/link overflow-hidden">
                                            <Mail size={12} className="shrink-0" />
                                            <span className="text-[10px] font-bold truncate">{sub.email}</span>
                                        </a>
                                        {sub.phone && (
                                            <div className="flex items-center gap-2 text-slate-500">
                                                <Phone size={12} className="shrink-0" />
                                                <span className="text-[10px] font-bold">{sub.phone}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="pt-6 mt-6 border-t border-slate-50 dark:border-slate-800">
                                    <button onClick={() => handleDelete(sub._id)} className="w-full p-3 bg-red-50 dark:bg-red-950/20 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm text-[10px] font-black uppercase tracking-widest">
                                        Remove Entry
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* PAGINATION */}
            <div className="flex items-center justify-between px-8 py-6 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Audience Page {currentPage} <span className="mx-2 text-slate-200">/</span> {totalPages}
                </p>
                <div className="flex gap-3">
                    <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 disabled:opacity-30 hover:bg-slate-50 transition-all text-slate-600">
                        <ChevronLeft size={20} />
                    </button>
                    <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 disabled:opacity-30 hover:bg-slate-50 transition-all text-slate-600">
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>
        </div>
      ) : (
        <div className="py-40 text-center bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 border-dashed">
            <Heart className="mx-auto mb-4 text-slate-100" size={80} strokeWidth={1} />
            <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-xs">The subscriber vault is currently clear</p>
        </div>
      )}
    </motion.div>
  );
};

export default Subscribe;
