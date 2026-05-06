import { useEffect, useState, useMemo } from "react";
import { apiClient } from "../../../stores/authStores";
import { 
    Trash2, 
    Mail, 
    Calendar, 
    MessageSquare, 
    Heart, 
    Lightbulb, 
    AlertCircle, 
    MapPin,
    ChevronLeft,
    ChevronRight,
    Inbox,
    TrendingUp,
    Star,
    Sparkles,
    CheckCircle2,
    Search,
    ArrowUpRight,
    Zap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";

const ITEMS_PER_PAGE = 6;

const Suggestions = () => {
  const [allSuggestions, setAllSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const loadSuggestions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get("/admin/get-suggestions");
      setAllSuggestions(response?.data?.Data || []);
    } catch (err) {
      setError("Failed to synchronize feedback vault.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSuggestions();
  }, []);

  const handleDelete = async (suggestionId) => {
    if (!window.confirm("Permanently archive this feedback entry?")) return;
    try {
      await apiClient.delete(`/admin/get-suggestions/${suggestionId}`);
      toast.success("Feedback archived");
      loadSuggestions();
    } catch (err) {
      toast.error("Archive failed");
    }
  };

  const parseFeedback = (message) => {
    const categoryMatch = message.match(/\[Category: (.*?)\]/);
    const ratingMatch = message.match(/\[Rating: (.*?)\/5\]/);
    let category = categoryMatch ? categoryMatch[1].toLowerCase() : "general";
    let rating = ratingMatch ? parseInt(ratingMatch[1]) : 0;
    let cleanMessage = message.replace(/\[Category: .*?\]/, "").replace(/\[Rating: .*?\]/, "").trim();
    return { category, rating, cleanMessage };
  };

  const getCategoryDetails = (category) => {
    switch (category) {
      case "suggestion": return { label: "Idea", icon: Lightbulb, color: "text-amber-700 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400 border-amber-100" };
      case "complaint": return { label: "Gripe", icon: AlertCircle, color: "text-rose-700 bg-rose-50 dark:bg-rose-900/20 dark:text-rose-400 border-rose-100" };
      case "praise": return { label: "Love", icon: Heart, color: "text-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-100" };
      case "destination": return { label: "Target", icon: MapPin, color: "text-indigo-700 bg-indigo-50 dark:bg-indigo-900/20 dark:text-indigo-400 border-indigo-100" };
      default: return { label: "General", icon: MessageSquare, color: "text-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-slate-400 border-slate-100" };
    }
  };

  const stats = useMemo(() => {
    const counts = { total: allSuggestions.length, suggestion: 0, complaint: 0, praise: 0, destination: 0, avgRating: 0 };
    let totalRating = 0, ratingCount = 0;
    allSuggestions.forEach(s => {
      const { category, rating } = parseFeedback(s.message);
      if (counts[category] !== undefined) counts[category]++;
      if (rating > 0) { totalRating += rating; ratingCount++; }
    });
    counts.avgRating = ratingCount > 0 ? (totalRating / ratingCount).toFixed(1) : "0";
    return counts;
  }, [allSuggestions]);

  const filteredSuggestions = useMemo(() => {
    let result = allSuggestions;
    if (activeFilter !== "all") result = result.filter(s => parseFeedback(s.message).category === activeFilter);
    if (searchTerm) result = result.filter(s => s.name?.toLowerCase().includes(searchTerm.toLowerCase()) || s.message?.toLowerCase().includes(searchTerm.toLowerCase()));
    return result;
  }, [allSuggestions, activeFilter, searchTerm]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredSuggestions.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredSuggestions, currentPage]);

  const totalPages = Math.ceil(filteredSuggestions.length / ITEMS_PER_PAGE);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-full mx-auto space-y-10 pb-20 px-6 text-left">
      {/* HEADER HUB */}
      <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-12 border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none text-indigo-700"><Zap size={240} /></div>
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-10">
            <div>
                <h1 className="text-4xl font-black text-slate-950 dark:text-white tracking-tight flex items-center gap-5">
                    <TrendingUp className="text-indigo-700" size={44} /> FEEDBACK VAULT
                </h1>
                <p className="text-slate-600 dark:text-slate-400 font-bold mt-2 text-xl italic text-left">Strategic insights and sentiment analysis from couples</p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative group w-full sm:w-80">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-700 transition-colors" size={24} />
                    <input 
                        type="text" 
                        placeholder="Filter sentiment..." 
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        className="pl-16 pr-8 py-5 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-indigo-600/20 focus:ring-4 focus:ring-indigo-500/10 rounded-[1.5rem] text-lg font-black w-full outline-none transition-all placeholder:text-slate-400 shadow-sm"
                    />
                </div>
                <div className="px-8 py-5 bg-indigo-700 text-white rounded-[1.5rem] text-sm font-black uppercase tracking-[0.2em] flex items-center gap-3 shadow-2xl shadow-indigo-500/40">
                    <Star size={20} fill="currentColor" /> {stats.avgRating} AVG SATISFACTION
                </div>
            </div>
        </div>
      </div>

      {/* STATS STRIP */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {[
            { id: "suggestion", label: "Strategic Ideas", icon: Lightbulb, color: "text-amber-700", bg: "bg-amber-50" },
            { id: "complaint", label: "Service Gaps", icon: AlertCircle, color: "text-rose-700", bg: "bg-rose-50" },
            { id: "praise", label: "Brand Love", icon: Heart, color: "text-emerald-700", bg: "bg-emerald-50" },
            { id: "destination", label: "Regional Target", icon: MapPin, color: "text-indigo-700", bg: "bg-indigo-50" },
        ].map((stat) => (
            <motion.button
                key={stat.id}
                whileHover={{ y: -8 }}
                onClick={() => { setActiveFilter(stat.id); setCurrentPage(1); }}
                className={`flex flex-col p-10 rounded-[3rem] border-2 transition-all text-left group ${
                    activeFilter === stat.id 
                    ? "bg-white dark:bg-slate-900 border-indigo-700 shadow-2xl shadow-indigo-500/20" 
                    : "bg-white/60 dark:bg-slate-900/60 border-slate-100 dark:border-slate-800 hover:border-indigo-700/20"
                }`}
            >
                <div className={`size-16 rounded-[1.25rem] ${stat.bg} dark:bg-slate-800 flex items-center justify-center mb-8 ${stat.color} group-hover:scale-110 transition-transform shadow-sm`}>
                    <stat.icon size={32} strokeWidth={2.5} />
                </div>
                <span className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">{stat.label}</span>
                <span className="text-4xl font-black text-slate-950 dark:text-white tracking-tighter mt-2">{stats[stat.id]}</span>
            </motion.button>
        ))}
      </div>

      {/* FILTER TABS */}
      <div className="flex items-center gap-4 overflow-x-auto pb-6 no-scrollbar border-b-2 border-slate-100 dark:border-slate-800">
        {["all", "suggestion", "complaint", "praise", "destination"].map((f) => (
            <button
                key={f}
                onClick={() => { setActiveFilter(f); setCurrentPage(1); }}
                className={`px-8 py-3 rounded-full text-xs font-black uppercase tracking-[0.25em] transition-all whitespace-nowrap ${
                    activeFilter === f ? "bg-indigo-700 text-white shadow-2xl shadow-indigo-500/40" : "text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
            >
                {f}
            </button>
        ))}
      </div>

      {/* FEEDBACK LIST */}
      <AnimatePresence mode="wait">
        {isLoading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-48 gap-8">
                <Loader2 className="animate-spin text-indigo-700" size={64} strokeWidth={1.5} />
                <p className="text-xs font-black uppercase tracking-[0.4em] text-slate-400">Processing Sentiment Engine...</p>
            </motion.div>
        ) : paginatedData.length > 0 ? (
            <div className="grid gap-10">
                {paginatedData.map((item) => {
                    const { category, rating, cleanMessage } = parseFeedback(item.message);
                    const cat = getCategoryDetails(category);
                    return (
                        <motion.div key={item._id} layout initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="group relative bg-white dark:bg-slate-900 p-12 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none hover:shadow-2xl hover:shadow-indigo-500/15 transition-all duration-500">
                            <div className="flex flex-col lg:flex-row gap-12 text-left">
                                <div className="flex flex-col items-center gap-6 shrink-0">
                                    <div className="size-24 rounded-[2rem] bg-indigo-700 flex items-center justify-center text-4xl font-black text-white shadow-2xl shadow-indigo-500/30">
                                        {item.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex gap-1.5">
                                        {[1, 2, 3, 4, 5].map((s) => <Star key={s} size={18} className={s <= rating ? "fill-amber-400 text-amber-400" : "text-slate-100 dark:text-slate-800"} />)}
                                    </div>
                                </div>
                                <div className="flex-1 space-y-8 text-left">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                                        <div className="text-left">
                                            <div className="flex items-center gap-5 mb-2">
                                                <h2 className="text-3xl font-black text-slate-950 dark:text-white tracking-tight">{item.name}</h2>
                                                <div className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] border-2 ${cat.color} shadow-sm`}>
                                                    {cat.label}
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap gap-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em] text-left">
                                                <a href={`mailto:${item.email}`} className="flex items-center gap-3 hover:text-indigo-700 transition-colors"><Mail size={16} /> {item.email}</a>
                                                <span className="flex items-center gap-3"><Calendar size={16} /> {new Date(item.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-10 bg-slate-50 dark:bg-slate-800/50 rounded-[3rem] border-2 border-slate-100 dark:border-slate-800 relative group/msg shadow-inner">
                                        <MessageSquare className="absolute top-10 right-10 text-slate-200 dark:text-slate-700/30" size={80} />
                                        <p className="text-xl font-bold text-slate-950 dark:text-slate-200 leading-relaxed italic relative z-10 whitespace-pre-wrap">
                                            "{cleanMessage}"
                                        </p>
                                    </div>
                                </div>
                                <div className="flex lg:flex-col justify-center gap-4 shrink-0">
                                    <button onClick={() => handleDelete(item._id)} className="size-16 flex items-center justify-center bg-white text-red-600 rounded-2xl hover:bg-red-600 hover:text-white transition-all shadow-xl border border-slate-100 group/btn">
                                        <Trash2 size={28} />
                                    </button>
                                    <button className="size-16 flex items-center justify-center bg-white text-indigo-700 rounded-2xl hover:bg-indigo-700 hover:text-white transition-all shadow-xl border border-slate-100">
                                        <CheckCircle2 size={28} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        ) : (
            <div className="py-48 text-center bg-white dark:bg-slate-900 rounded-[3.5rem] border-4 border-dashed border-slate-100 dark:border-slate-800">
                <Sparkles className="mx-auto mb-6 text-slate-100 dark:text-slate-800" size={100} strokeWidth={1} />
                <h3 className="text-3xl font-black text-slate-950 dark:text-white uppercase tracking-tight mb-4">Sentiment Zero</h3>
                <p className="text-slate-600 dark:text-slate-400 font-bold uppercase tracking-widest text-sm italic">The feedback vault is perfectly clear</p>
            </div>
        )}
      </AnimatePresence>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-10 py-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none">
            <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">
                Vault Frame: <span className="text-slate-950 dark:text-white">{currentPage}</span> <span className="mx-2 text-slate-200">/</span> {totalPages}
            </p>
            <div className="flex gap-4">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-950 dark:text-white border-2 border-transparent hover:border-indigo-700/20 disabled:opacity-30 transition-all">
                    <ChevronLeft size={24} strokeWidth={3} />
                </button>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-950 dark:text-white border-2 border-transparent hover:border-indigo-700/20 disabled:opacity-30 transition-all">
                    <ChevronRight size={24} strokeWidth={3} />
                </button>
            </div>
        </div>
      )}
    </motion.div>
  );
};

export default Suggestions;
