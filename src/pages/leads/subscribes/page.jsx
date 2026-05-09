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
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 lg:p-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none text-indigo-700"><BellRing size={120} /></div>
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
                <h1 className="text-2xl font-black text-slate-950 dark:text-white tracking-tight flex items-center gap-4">
                    <Inbox className="text-indigo-700" size={32} /> SUBSCRIBER REGISTRY
                </h1>
                <p className="text-slate-600 dark:text-slate-400 font-bold mt-1 text-xs italic text-left">Newsletter audience and potential honeymoon seekers</p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative group w-full sm:w-64">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-700 transition-colors" size={18} />
                    <input 
                        type="text" 
                        placeholder="Filter audience..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-12 pr-6 py-3 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-indigo-600/20 focus:ring-4 focus:ring-indigo-500/10 rounded-xl text-sm font-black w-full outline-none transition-all placeholder:text-slate-400 shadow-sm"
                    />
                </div>
                <div className="px-5 py-2.5 bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-indigo-500/40">
                    <Sparkles size={16} /> {totalSubscribers} ACTIVE AUDIENCE
                </div>
            </div>
        </div>
      </div>

      {/* SUBSCRIBER GRID */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-6">
            <Loader2 className="animate-spin text-indigo-700" size={48} strokeWidth={1.5} />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Synchronizing Audience Vault...</p>
        </div>
      ) : error ? (
        <div className="py-16 text-center bg-red-50 dark:bg-red-950/20 rounded-2xl border-2 border-red-100 dark:border-red-900/30">
            <p className="text-red-700 font-black uppercase tracking-wide text-xs">{error}</p>
        </div>
      ) : filtered.length > 0 ? (
        <>
        <div className="grid grid-cols-1 gap-6">
          <AnimatePresence mode='popLayout'>
            {filtered.map((sub) => (
              <motion.div 
                layout 
                key={sub._id} 
                initial={{ opacity: 0, x: -20 }} 
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-lg shadow-slate-200/50 dark:shadow-none overflow-hidden transition-all hover:shadow-xl hover:shadow-indigo-500/10"
              >
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center gap-8">
                     {/* IDENTITY SECTION */}
                     <div className="flex items-center gap-4 shrink-0">
                        <div className="size-12 bg-indigo-700 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-500/30">
                          {sub.email?.charAt(0).toUpperCase()}
                        </div>
                        <div className="text-left">
                          <h2 className="text-lg font-black text-slate-950 dark:text-white tracking-tight truncate max-w-xs">{sub.email}</h2>
                          <div className="flex items-center gap-2 mt-0.5 px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-md text-[8px] font-black uppercase tracking-wide border border-emerald-100 w-fit">
                             <CheckCircle2 size={10} /> Elite Member
                          </div>
                        </div>
                     </div>

                     {/* DATA STRIP */}
                     <div className="flex-1 flex flex-wrap items-center gap-8 py-4 md:py-0 border-y md:border-y-0 md:border-x border-slate-100 dark:border-slate-800 md:px-8">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-400 text-xs font-black uppercase tracking-wide">
                             <Mail size={12} className="text-indigo-600" /> STATUS
                          </div>
                          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Active Connection</p>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-400 text-xs font-black uppercase tracking-wide">
                             <Calendar size={12} className="text-indigo-600" /> JOINED
                          </div>
                          <p className="text-xs font-black text-slate-950 dark:text-slate-300">
                             {sub.createdAt ? new Date(sub.createdAt).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                     </div>

                     {/* ACTION HUB */}
                     <div className="flex items-center gap-3 shrink-0">
                        <button onClick={() => handleDelete(sub._id)} className="size-10 flex items-center justify-center bg-white dark:bg-slate-800 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-md border border-slate-100 dark:border-slate-700">
                           <Trash2 size={18} />
                        </button>
                        <button className="size-10 flex items-center justify-center bg-white dark:bg-slate-800 text-indigo-700 rounded-xl hover:bg-indigo-700 hover:text-white transition-all shadow-md border border-slate-100 dark:border-slate-700">
                           <CheckCircle2 size={18} />
                        </button>
                     </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

            {/* PAGINATION */}
            <div className="flex items-center justify-between px-6 py-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-lg shadow-slate-200/50 dark:shadow-none">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wide">
                    Audience Frame: <span className="text-slate-950 dark:text-white">{currentPage}</span> <span className="mx-2 text-slate-200">/</span> {totalPages}
                </p>
                <div className="flex gap-3">
                    <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-950 dark:text-white border border-transparent hover:border-indigo-700/20 disabled:opacity-30 transition-all">
                        <ChevronLeft size={18} strokeWidth={3} />
                    </button>
                    <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-950 dark:text-white border border-transparent hover:border-indigo-700/20 disabled:opacity-30 transition-all">
                        <ChevronRight size={18} strokeWidth={3} />
                    </button>
                </div>
            </div>
        </>
      ) : (
        <div className="py-32 text-center bg-white dark:bg-slate-900 rounded-3xl border-2 border-dashed border-slate-100 dark:border-slate-800">
            <Heart className="mx-auto mb-4 text-slate-100 dark:text-slate-800" size={64} strokeWidth={1} />
            <h3 className="text-2xl font-black text-slate-950 dark:text-white uppercase tracking-tight mb-2">No Active Subscribers</h3>
            <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide text-[10px] italic">The subscriber vault is currently clear</p>
        </div>
      )}
    </motion.div>
  );
};

export default Subscribe;
