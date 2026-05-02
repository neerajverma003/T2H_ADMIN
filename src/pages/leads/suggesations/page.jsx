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
  Filter,
  Inbox,
  TrendingUp,
  Smile,
  Frown,
  Star
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

  useEffect(() => {
    loadSuggestions();
  }, []);

  const loadSuggestions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get("/admin/get-suggestions");
      setAllSuggestions(response?.data?.Data || []);
    } catch (err) {
      setError("Failed to load honeymoon suggestions. Please refresh the page.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (suggestionId) => {
    if (window.confirm("Are you sure you want to delete this feedback?")) {
      try {
        await apiClient.delete(`/admin/get-suggestions/${suggestionId}`);
        toast.success("Feedback removed successfully");
        loadSuggestions();
      } catch (err) {
        toast.error("Failed to delete. Please try again.");
      }
    }
  };

  // Logic to parse the modern feedback message format
  const parseFeedback = (message) => {
    const categoryMatch = message.match(/\[Category: (.*?)\]/);
    const ratingMatch = message.match(/\[Rating: (.*?)\/5\]/);
    
    let category = categoryMatch ? categoryMatch[1].toLowerCase() : "general";
    let rating = ratingMatch ? parseInt(ratingMatch[1]) : 0;
    
    let cleanMessage = message
      .replace(/\[Category: .*?\]/, "")
      .replace(/\[Rating: .*?\]/, "")
      .trim();

    return { category, rating, cleanMessage };
  };

  const getCategoryDetails = (category) => {
    switch (category) {
      case "suggestion":
        return { label: "Idea", icon: Lightbulb, color: "text-amber-600 bg-amber-50 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400" };
      case "complaint":
        return { label: "Complaint", icon: AlertCircle, color: "text-red-600 bg-red-50 border-red-100 dark:bg-red-900/20 dark:text-red-400" };
      case "praise":
        return { label: "Praise", icon: Heart, color: "text-pink-600 bg-pink-50 border-pink-100 dark:bg-pink-900/20 dark:text-pink-400" };
      case "destination":
        return { label: "Destination", icon: MapPin, color: "text-indigo-600 bg-indigo-50 border-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400" };
      default:
        return { label: "General", icon: MessageSquare, color: "text-slate-600 bg-slate-50 border-slate-100 dark:bg-slate-800 dark:text-slate-400" };
    }
  };

  // Calculated Stats
  const stats = useMemo(() => {
    const counts = { total: allSuggestions.length, suggestion: 0, complaint: 0, praise: 0, destination: 0, avgRating: 0 };
    let totalRating = 0;
    let ratingCount = 0;

    allSuggestions.forEach(s => {
      const { category, rating } = parseFeedback(s.message);
      if (counts[category] !== undefined) counts[category]++;
      if (rating > 0) {
        totalRating += rating;
        ratingCount++;
      }
    });

    counts.avgRating = ratingCount > 0 ? (totalRating / ratingCount).toFixed(1) : "0";
    return counts;
  }, [allSuggestions]);

  // Filtering Logic
  const filteredSuggestions = useMemo(() => {
    if (activeFilter === "all") return allSuggestions;
    return allSuggestions.filter(s => {
      const { category } = parseFeedback(s.message);
      return category === activeFilter;
    });
  }, [allSuggestions, activeFilter]);

  // Pagination
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredSuggestions.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredSuggestions, currentPage]);

  const totalPages = Math.ceil(filteredSuggestions.length / ITEMS_PER_PAGE);

  return (
    <div className="flex flex-col gap-y-10 p-6 md:p-10 max-w-7xl mx-auto min-h-screen">
      
      {/* Header with Stats Section */}
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-4xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight flex items-center gap-4">
              Feedback Hub <span className="text-3xl">🎯</span>
            </h1>
            <p className="mt-2 text-slate-500 dark:text-slate-400 font-medium">
              Real-time insights from your honeymoon couples.
            </p>
          </motion.div>
          
          <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-2 px-4 py-2 border-r border-slate-100 dark:border-slate-800">
              <TrendingUp size={18} className="text-green-500" />
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-slate-400">Avg Rating</span>
                <span className="text-lg font-black text-slate-900 dark:text-slate-100">{stats.avgRating}/5</span>
              </div>
            </div>
            <div className="px-4 py-2">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-slate-400">Total Inbox</span>
                <span className="text-lg font-black text-blue-600">{stats.total}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { id: "suggestion", label: "Ideas", icon: Lightbulb, color: "text-amber-600", bg: "bg-amber-50" },
            { id: "complaint", label: "Complaints", icon: AlertCircle, color: "text-red-600", bg: "bg-red-50" },
            { id: "praise", label: "Praises", icon: Heart, color: "text-pink-600", bg: "bg-pink-50" },
            { id: "destination", label: "Locations", icon: MapPin, color: "text-indigo-600", bg: "bg-indigo-50" },
          ].map((stat) => (
            <motion.button
              key={stat.id}
              whileHover={{ y: -4 }}
              onClick={() => { setActiveFilter(stat.id); setCurrentPage(1); }}
              className={`flex flex-col p-5 rounded-[24px] border-2 transition-all text-left ${
                activeFilter === stat.id 
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/10 shadow-lg" 
                  : "border-transparent bg-white dark:bg-slate-900 shadow-sm hover:border-slate-200"
              }`}
            >
              <div className={`w-10 h-10 rounded-xl ${stat.bg} dark:bg-slate-800 flex items-center justify-center mb-4 ${stat.color}`}>
                <stat.icon size={20} />
              </div>
              <span className="text-sm font-bold text-slate-500 dark:text-slate-400">{stat.label}</span>
              <span className="text-2xl font-black text-slate-900 dark:text-slate-50">{stats[stat.id]}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 w-full md:w-auto no-scrollbar">
          <Filter size={16} className="text-slate-400 mr-2 shrink-0" />
          {["all", "suggestion", "complaint", "praise", "destination"].map((f) => (
            <button
              key={f}
              onClick={() => { setActiveFilter(f); setCurrentPage(1); }}
              className={`px-5 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap uppercase tracking-wider ${
                activeFilter === f
                  ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                  : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div 
            key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-32"
          >
            <div className="h-14 w-14 animate-spin rounded-full border-[6px] border-blue-600 border-t-transparent mb-6"></div>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Syncing feedback vault...</p>
          </motion.div>
        ) : filteredSuggestions.length > 0 ? (
          <motion.div 
            key="content" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="grid gap-8"
          >
            {paginatedData.map((item) => {
              const { category, rating, cleanMessage } = parseFeedback(item.message);
              const cat = getCategoryDetails(category);
              
              return (
                <motion.div
                  key={item._id}
                  layout
                  className="group relative flex flex-col md:flex-row gap-8 bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 overflow-hidden"
                >
                  {/* Category Accent */}
                  <div className={`absolute left-0 top-0 h-full w-2 ${cat.color.split(' ')[1]}`}></div>

                  {/* Left Column: Avatar/Rating */}
                  <div className="flex flex-col items-center gap-4 shrink-0">
                    <div className="w-20 h-20 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-3xl font-black text-slate-400">
                      {item.name.charAt(0)}
                    </div>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          size={14} 
                          className={star <= rating ? "fill-pink-500 text-pink-500" : "text-slate-200 dark:text-slate-700"} 
                        />
                      ))}
                    </div>
                  </div>

                  {/* Center Column: Message */}
                  <div className="flex-1 min-w-0 space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-2xl font-extrabold text-slate-900 dark:text-slate-50">{item.name}</h3>
                          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border ${cat.color}`}>
                            <cat.icon size={12} /> {cat.label}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm font-medium text-slate-400">
                          <a href={`mailto:${item.email}`} className="flex items-center gap-2 hover:text-blue-600 transition">
                            <Mail size={14} /> {item.email}
                          </a>
                          <span className="flex items-center gap-2">
                            <Calendar size={14} /> {new Date(item.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="relative">
                      <MessageSquare className="absolute -left-10 top-0 text-slate-50 dark:text-slate-800 opacity-50" size={60} />
                      <p className="relative text-lg text-slate-700 dark:text-slate-300 leading-relaxed font-medium whitespace-pre-wrap">
                        {cleanMessage || "No message content provided."}
                      </p>
                    </div>
                  </div>

                  {/* Right Column: Actions */}
                  <div className="flex flex-row md:flex-col gap-4 shrink-0 md:justify-center border-t md:border-t-0 md:border-l border-slate-50 dark:border-slate-800 pt-6 md:pt-0 md:pl-8">
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="flex-1 md:flex-none p-4 rounded-2xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all duration-300 group"
                    >
                      <Trash2 size={20} className="mx-auto" />
                    </button>
                    <a
                      href={`mailto:${item.email}?subject=Thank you for your feedback!`}
                      className="flex-1 md:flex-none p-4 rounded-2xl bg-blue-600 text-white hover:bg-slate-900 transition-all duration-300 shadow-xl shadow-blue-200 dark:shadow-none"
                    >
                      <Mail size={20} className="mx-auto" />
                    </a>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div 
            key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-32 bg-white dark:bg-slate-900 rounded-[48px] border-4 border-dashed border-slate-50 dark:border-slate-800"
          >
            <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-8">
              <Inbox size={48} className="text-slate-200" />
            </div>
            <h3 className="text-3xl font-black text-slate-900 dark:text-slate-100">Inbox is empty</h3>
            <p className="mt-2 text-slate-400 font-bold max-w-sm text-center px-6">
              Looks like you've handled everything! New suggestions will appear here as soon as they arrive.
            </p>
            <button 
              onClick={() => setActiveFilter("all")}
              className="mt-8 px-8 py-3 bg-slate-900 text-white rounded-full font-bold hover:scale-105 transition active:scale-95"
            >
              Back to all feedback
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Advanced Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-t border-slate-100 dark:border-slate-800 pt-10">
          <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">
            Showing <span className="text-slate-900 dark:text-slate-100">{paginatedData.length}</span> of {filteredSuggestions.length} items
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-12 h-12 flex items-center justify-center rounded-2xl border-2 border-slate-100 dark:border-slate-800 hover:bg-slate-900 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-inherit transition-all"
            >
              <ChevronLeft size={20} />
            </button>
            
            <div className="flex items-center gap-2">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-12 h-12 rounded-2xl font-black transition-all ${
                    currentPage === i + 1 
                      ? "bg-blue-600 text-white shadow-xl shadow-blue-200" 
                      : "bg-white dark:bg-slate-900 text-slate-400 hover:bg-slate-100"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="w-12 h-12 flex items-center justify-center rounded-2xl border-2 border-slate-100 dark:border-slate-800 hover:bg-slate-900 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-inherit transition-all"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Suggestions;
