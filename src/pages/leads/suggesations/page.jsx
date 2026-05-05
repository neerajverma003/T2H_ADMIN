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
      case "suggestion": return { label: "Idea", icon: Lightbulb, color: "text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400 border-amber-100 dark:border-amber-900/40" };
      case "complaint": return { label: "Complaint", icon: AlertCircle, color: "text-rose-600 bg-rose-50 dark:bg-rose-900/20 dark:text-rose-400 border-rose-100 dark:border-rose-900/40" };
      case "praise": return { label: "Praise", icon: Heart, color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/40" };
      case "destination": return { label: "Target", icon: MapPin, color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/40" };
      default: return { label: "General", icon: MessageSquare, color: "text-slate-600 bg-slate-50 dark:bg-slate-800 dark:text-slate-400 border-slate-100 dark:border-slate-800" };
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
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-[1400px] mx-auto space-y-10 pb-20 px-6">
      {/* HEADER HUB */}
      <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-12 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none text-indigo-600"><Zap size={200} /></div>
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div>
                <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-4">
                    <TrendingUp className="text-indigo-600" size={36} /> FEEDBACK VAULT
                </h1>
                <p className="text-slate-500 font-medium mt-2 text-lg italic">Strategic insights and sentiment analysis from couples</p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                    <input 
                        type="text" 
                        placeholder="Filter sentiment..." 
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        className="pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-transparent focus:border-indigo-100 dark:focus:border-indigo-900/30 rounded-2xl text-sm font-bold w-full sm:w-64 outline-none transition-all shadow-sm"
                    />
                </div>
                <div className="px-6 py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-2xl shadow-indigo-500/30">
                    <Star size={16} fill="currentColor" /> {stats.avgRating} AVG RATING
                </div>
            </div>
        </div>
      </div>

      {/* STATS STRIP */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
            { id: "suggestion", label: "Strategic Ideas", icon: Lightbulb, color: "text-amber-600", bg: "bg-amber-50" },
            { id: "complaint", label: "Service Gaps", icon: AlertCircle, color: "text-rose-600", bg: "bg-rose-50" },
            { id: "praise", label: "Brand Praises", icon: Heart, color: "text-emerald-600", bg: "bg-emerald-50" },
            { id: "destination", label: "Destinations", icon: MapPin, color: "text-indigo-600", bg: "bg-indigo-50" },
        ].map((stat) => (
            <motion.button
                key={stat.id}
                whileHover={{ y: -4 }}
                onClick={() => { setActiveFilter(stat.id); setCurrentPage(1); }}
                className={`flex flex-col p-8 rounded-[2.5rem] border transition-all text-left group ${
                    activeFilter === stat.id 
                    ? "bg-white dark:bg-slate-900 border-indigo-600 shadow-2xl shadow-indigo-500/10" 
                    : "bg-white/60 dark:bg-slate-900/60 border-slate-100 dark:border-slate-800 hover:border-indigo-200"
                }`}
            >
                <div className={`size-14 rounded-2xl ${stat.bg} dark:bg-slate-800 flex items-center justify-center mb-6 ${stat.color} group-hover:scale-110 transition-transform`}>
                    <stat.icon size={24} />
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</span>
                <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter mt-1">{stats[stat.id]}</span>
            </motion.button>
        ))}
      </div>

      {/* FILTER TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar border-b border-slate-100 dark:border-slate-800">
        {["all", "suggestion", "complaint", "praise", "destination"].map((f) => (
            <button
                key={f}
                onClick={() => { setActiveFilter(f); setCurrentPage(1); }}
                className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap ${
                    activeFilter === f ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
            >
                {f}
            </button>
        ))}
      </div>

      {/* FEEDBACK LIST */}
      <AnimatePresence mode="wait">
        {isLoading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-40 gap-4">
                <Loader2 className="animate-spin text-indigo-600" size={48} strokeWidth={1} />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Processing Sentiment Engine</p>
            </motion.div>
        ) : paginatedData.length > 0 ? (
            <div className="grid gap-8">
                {paginatedData.map((item) => {
                    const { category, rating, cleanMessage } = parseFeedback(item.message);
                    const cat = getCategoryDetails(category);
                    return (
                        <motion.div key={item._id} layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="group relative bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none hover:shadow-2xl transition-all duration-500">
                            <div className="flex flex-col lg:flex-row gap-10">
                                <div className="flex flex-col items-center gap-4 shrink-0">
                                    <div className="size-20 rounded-[2rem] bg-indigo-600 flex items-center justify-center text-3xl font-black text-white shadow-lg shadow-indigo-500/20">
                                        {item.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map((s) => <Star key={s} size={14} className={s <= rating ? "fill-amber-400 text-amber-400" : "text-slate-100 dark:text-slate-800"} />)}
                                    </div>
                                </div>
                                <div className="flex-1 space-y-6">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{item.name}</h2>
                                                <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${cat.color}`}>
                                                    {cat.label}
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                                                <a href={`mailto:${item.email}`} className="flex items-center gap-2 hover:text-indigo-600 transition-colors"><Mail size={14} /> {item.email}</a>
                                                <span className="flex items-center gap-2"><Calendar size={14} /> {new Date(item.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-8 bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 relative group/msg">
                                        <MessageSquare className="absolute top-8 right-8 text-slate-100 dark:text-slate-700/30" size={60} />
                                        <p className="text-lg font-bold text-slate-700 dark:text-slate-300 leading-relaxed italic relative z-10 whitespace-pre-wrap">
                                            "{cleanMessage}"
                                        </p>
                                    </div>
                                </div>
                                <div className="flex lg:flex-col justify-center gap-3 shrink-0">
                                    <button onClick={() => handleDelete(item._id)} className="size-14 flex items-center justify-center bg-rose-50 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all shadow-sm">
                                        <Trash2 size={24} />
                                    </button>
                                    <button className="size-14 flex items-center justify-center bg-indigo-50 text-indigo-600 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                                        <CheckCircle2 size={24} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        ) : (
            <div className="py-40 text-center bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 border-dashed">
                <Sparkles className="mx-auto mb-4 text-slate-100" size={80} strokeWidth={1} />
                <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-xs">The feedback vault is perfectly clear</p>
            </div>
        )}
      </AnimatePresence>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-8 py-6 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Vault Page {currentPage} <span className="mx-2 text-slate-200">/</span> {totalPages}
            </p>
            <div className="flex gap-3">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 disabled:opacity-30 hover:bg-slate-50 transition-all text-slate-600">
                    <ChevronLeft size={20} />
                </button>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 disabled:opacity-30 hover:bg-slate-50 transition-all text-slate-600">
                    <ChevronRight size={20} />
                </button>
            </div>
        </div>
      )}
    </motion.div>
  );
};

export default Suggestions;
