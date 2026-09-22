import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  Trash2,
  Eye,
  EyeOff,
  MapPin,
  Star,
  Calendar,
  Quote,
  Loader2,
  Search,
  Filter,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  LayoutGrid,
  List,
  X,
} from "lucide-react";
import { apiClient } from "../../stores/authStores";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { getCdnUrl } from "../../utils/media";

const WrittenTestimonialList = () => {
  const navigate = useNavigate();
  const [testimonials, setTestimonials] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "list"
  const [statusFilter, setStatusFilter] = useState("all"); // "all" | "verified" | "unverified"
  const [selectedTestimonial, setSelectedTestimonial] = useState(null); // for view details modal

  const fetchTestimonials = async () => {
    try {
      setIsFetching(true);
      const res = await apiClient.get("/admin/text-testimonial");
      if (res.data.success) {
        setTestimonials(res.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching testimonials:", error);
      toast.error("Failed to load testimonials archive");
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this story forever?")) return;
    try {
      const res = await apiClient.delete(`/admin/text-testimonial/${id}`);
      if (res.data.success) {
        toast.success("Story removed from registry");
        setTestimonials(prev => prev.filter(t => t._id !== id));
        if (selectedTestimonial?._id === id) {
          setSelectedTestimonial(null);
        }
      }
    } catch (error) {
      toast.error("Deletion failed");
    }
  };

  const toggleVisibility = async (id, currentStatus) => {
    try {
      const res = await apiClient.patch(`/admin/text-testimonial/toggle-verify/${id}`, {
        toShow: !currentStatus
      });
      if (res.data.success) {
        const nextStatus = !currentStatus;
        setTestimonials(prev => prev.map(t =>
          t._id === id ? { ...t, toShow: nextStatus } : t
        ));
        setSelectedTestimonial(prev => prev && prev._id === id ? { ...prev, toShow: nextStatus } : prev);
        toast.success(`Story is now ${nextStatus ? 'Verified (Public)' : 'Unverified (Private)'}`);
      }
    } catch (error) {
      toast.error("Update failed");
    }
  };

  const filteredTestimonials = testimonials.filter(t => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      (t.name || "").toLowerCase().includes(query) ||
      (t.destination || "").toLowerCase().includes(query) ||
      (t.location || "").toLowerCase().includes(query) ||
      (t.message || "").toLowerCase().includes(query);

    if (!matchesSearch) return false;

    if (statusFilter === "verified") return t.toShow === true;
    if (statusFilter === "unverified") return t.toShow === false;
    return true;
  });

  const totalReviews = testimonials.length;
  const publicReviews = testimonials.filter(t => t.toShow).length;
  const privateReviews = totalReviews - publicReviews;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8 pb-20 font-sans min-h-screen text-slate-900 dark:text-slate-100 text-left">
      {/* Header Section */}
      <div className="bg-white dark:bg-[#091126]/95 rounded-3xl py-4 sm:py-5 px-6 sm:px-8 border border-slate-200/90 dark:border-indigo-500/25 shadow-xl dark:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.7),0_0_30px_2px_rgba(99,102,241,0.18)] ring-1 ring-slate-900/5 dark:ring-white/5 backdrop-blur-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-500/30 shrink-0">
            <Sparkles size={22} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2 flex-wrap">
              General <span className="text-blue-500">Reviews</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-semibold mt-0.5 text-xs sm:text-sm">
              Manage and curate couple stories for the website
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <div className="relative group w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
            <input
              type="text"
              placeholder="Search stories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-slate-50 dark:bg-[#050A17] border border-slate-200 dark:border-slate-800/90 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 rounded-xl text-xs font-semibold w-full outline-none transition-all placeholder:text-slate-400 dark:placeholder-slate-500 text-slate-900 dark:text-white shadow-inner"
            />
          </div>

          <button
            onClick={() => navigate("/testimonials/written")}
            className="px-5 py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-lg shadow-blue-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer shrink-0"
          >
            + Compose Review
          </button>
        </div>
      </div>

      {/* Metrics Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-[#091126]/95 p-6 rounded-3xl border border-slate-200/90 dark:border-indigo-500/25 shadow-xl ring-1 ring-slate-900/5 dark:ring-white/5 backdrop-blur-xl flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Total Reviews</p>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1">{totalReviews}</h3>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-950/40 text-blue-500 rounded-2xl border border-blue-200 dark:border-blue-800/60 shadow-sm">
            <Quote size={20} />
          </div>
        </div>

        <div className="bg-white dark:bg-[#091126]/95 p-6 rounded-3xl border border-slate-200/90 dark:border-indigo-500/25 shadow-xl ring-1 ring-slate-900/5 dark:ring-white/5 backdrop-blur-xl flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Verified / Live</p>
            <h3 className="text-3xl font-black text-emerald-500 mt-1">{publicReviews}</h3>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 shadow-sm">
            <CheckCircle2 size={20} />
          </div>
        </div>

        <div className="bg-white dark:bg-[#091126]/95 p-6 rounded-3xl border border-slate-200/90 dark:border-indigo-500/25 shadow-xl ring-1 ring-slate-900/5 dark:ring-white/5 backdrop-blur-xl flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Unverified / Hidden</p>
            <h3 className="text-3xl font-black text-amber-500 mt-1">{privateReviews}</h3>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 text-amber-500 rounded-2xl border border-amber-200 dark:border-amber-800/60 shadow-sm">
            <XCircle size={20} />
          </div>
        </div>
      </div>

      {/* Filter & View Mode Switcher Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-[#091126]/95 p-3 sm:px-5 rounded-2xl border border-slate-200/90 dark:border-indigo-500/25 shadow-md">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1.5 flex items-center gap-1">
            <Filter size={12} /> Filter:
          </span>
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              statusFilter === "all"
                ? "bg-blue-600 text-white shadow-sm shadow-blue-600/30"
                : "bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-[#050A17] dark:hover:bg-[#15233e] dark:text-slate-300"
            }`}
          >
            All ({totalReviews})
          </button>
          <button
            onClick={() => setStatusFilter("verified")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              statusFilter === "verified"
                ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/30"
                : "bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-[#050A17] dark:hover:bg-[#15233e] dark:text-slate-300"
            }`}
          >
            <CheckCircle2 size={12} />
            Verified ({publicReviews})
          </button>
          <button
            onClick={() => setStatusFilter("unverified")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              statusFilter === "unverified"
                ? "bg-amber-600 text-white shadow-sm shadow-amber-600/30"
                : "bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-[#050A17] dark:hover:bg-[#15233e] dark:text-slate-300"
            }`}
          >
            <XCircle size={12} />
            Unverified ({privateReviews})
          </button>
        </div>

        {/* Grid vs List View Mode Switcher */}
        <div className="flex items-center bg-slate-100 dark:bg-[#050A17] p-1 rounded-xl border border-slate-200 dark:border-slate-800 self-end sm:self-auto">
          <button
            onClick={() => setViewMode("grid")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === "grid"
                ? "bg-white dark:bg-blue-600 text-blue-600 dark:text-white shadow-sm"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
            title="Grid View"
          >
            <LayoutGrid size={14} />
            <span>Grid</span>
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === "list"
                ? "bg-white dark:bg-blue-600 text-blue-600 dark:text-white shadow-sm"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
            title="List View"
          >
            <List size={14} />
            <span>List</span>
          </button>
        </div>
      </div>

      {isFetching ? (
        <div className="flex flex-col items-center justify-center py-32 gap-6">
          <Loader2 className="animate-spin text-blue-500" size={56} strokeWidth={1.5} />
          <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Opening Archive...</p>
        </div>
      ) : filteredTestimonials.length === 0 ? (
        <div className="bg-white dark:bg-[#091126]/95 rounded-3xl p-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 shadow-xl">
          <div className="size-16 bg-slate-100 dark:bg-[#050A17] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-200 dark:border-slate-800">
            <Quote size={28} className="text-slate-400" />
          </div>
          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white uppercase tracking-tight mb-1">No Stories Found</h3>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-xs max-w-sm mx-auto">
            {searchQuery || statusFilter !== "all"
              ? "No reviews match your current filters. Try resetting the search or filter."
              : "Your review archive is empty. Start by composing a new couple story."}
          </p>
        </div>
      ) : viewMode === "grid" ? (
        /* ── GRID VIEW ── */
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <AnimatePresence>
            {filteredTestimonials.map((item) => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                key={item._id}
                className="group relative bg-white dark:bg-[#091126]/95 rounded-3xl p-6 md:p-8 border border-slate-200/90 dark:border-indigo-500/25 shadow-xl ring-1 ring-slate-900/5 dark:ring-white/5 backdrop-blur-xl hover:border-blue-500/50 hover:shadow-blue-500/10 transition-all duration-300"
              >
                {/* Top Status Pill */}
                <div className="absolute top-6 right-6">
                  <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-md backdrop-blur-md border border-white/10 ${
                    item.toShow
                      ? "bg-emerald-600/90 text-white"
                      : "bg-slate-800/90 text-slate-300"
                  }`}>
                    {item.toShow ? "Public" : "Private"}
                  </span>
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                  {/* Avatar Section */}
                  <div className="shrink-0 flex items-start">
                    <div className="size-20 rounded-2xl overflow-hidden shadow-lg border-2 border-slate-200 dark:border-slate-800/80 bg-slate-100 dark:bg-[#050A17]">
                      <img
                        src={getCdnUrl(item.profileImage) || "https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&w=200&q=80"}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&w=200&q=80";
                        }}
                      />
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap mb-1.5">
                      <h3 className="text-base font-black text-slate-900 dark:text-white truncate">{item.name}</h3>
                      {item.isVerifiedUser && (
                        <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 text-[9px] font-black px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800/60 uppercase tracking-wider">
                          <ShieldCheck size={11} className="shrink-0" />
                          Verified Couple
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-4">
                      <span className="flex items-center gap-1.5">
                        <MapPin size={13} className="text-blue-500" />
                        {item.destination}
                      </span>
                      {item.travelDate && (
                        <span className="flex items-center gap-1.5">
                          <Calendar size={13} className="text-slate-400" />
                          {new Date(item.travelDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </span>
                      )}
                      <div className="flex items-center gap-0.5 text-amber-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} size={12} fill={i < item.rating ? "currentColor" : "none"} />
                        ))}
                      </div>
                    </div>

                    <div className="relative bg-slate-50 dark:bg-[#050A17] p-4 rounded-2xl border border-slate-200 dark:border-slate-800/90 shadow-inner">
                      <Quote className="absolute -left-1 -top-2 text-blue-500/10 dark:text-blue-400/10" size={32} />
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic line-clamp-4 pl-3 font-medium">
                        "{item.message}"
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3 flex-wrap">
                  <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    LOGGED STORY
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Verified / Unverified Toggle Button */}
                    <button
                      onClick={() => toggleVisibility(item._id, item.toShow)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95 ${
                        item.toShow
                          ? "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                          : "bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                      }`}
                      title={item.toShow ? "Status: Verified (Click to unverify)" : "Status: Unverified (Click to verify)"}
                    >
                      {item.toShow ? (
                        <>
                          <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                          <span>Verified</span>
                        </>
                      ) : (
                        <>
                          <XCircle size={13} className="text-amber-500 shrink-0" />
                          <span>Unverified</span>
                        </>
                      )}
                    </button>

                    {/* View Details Button */}
                    <button
                      onClick={() => setSelectedTestimonial(item)}
                      className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 dark:hover:bg-blue-900/40 rounded-xl transition-all border border-blue-200 dark:border-blue-800/60 cursor-pointer shadow-sm hover:scale-105 active:scale-95"
                      title="View Story Details"
                    >
                      <Eye size={15} />
                    </button>

                    {/* Delete Story Button */}
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="p-2 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white dark:bg-red-950/40 dark:text-red-400 dark:hover:bg-red-600 dark:hover:text-white rounded-xl transition-all border border-red-200 dark:border-red-800/60 cursor-pointer shadow-sm hover:scale-105 active:scale-95"
                      title="Delete Story"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        /* ── LIST / TABLE VIEW ── */
        <div className="bg-white dark:bg-[#091126]/95 rounded-3xl border border-slate-200/90 dark:border-indigo-500/25 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-[#050A17]/80 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-4 px-5">Traveler / Couple</th>
                  <th className="py-4 px-5">Destination</th>
                  <th className="py-4 px-4">Rating</th>
                  <th className="py-4 px-5">Review Excerpt</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70 text-xs">
                {filteredTestimonials.map((item) => (
                  <tr
                    key={item._id}
                    className="hover:bg-blue-50/40 dark:hover:bg-blue-950/20 transition-colors group"
                  >
                    {/* Traveler Info */}
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className="size-11 rounded-xl overflow-hidden shrink-0 border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-[#050A17]">
                          <img
                            src={getCdnUrl(item.profileImage) || "https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&w=200&q=80"}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = "https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&w=200&q=80";
                            }}
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 dark:text-white truncate flex items-center gap-1.5">
                            {item.name}
                            {item.isVerifiedUser && (
                              <ShieldCheck size={12} className="text-blue-500 shrink-0" title="Verified Couple" />
                            )}
                          </p>
                          {item.location && (
                            <p className="text-[10.5px] text-slate-400 font-medium truncate">{item.location}</p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Destination & Date */}
                    <td className="py-3.5 px-5">
                      <p className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                        <MapPin size={12} className="text-blue-500 shrink-0" />
                        {item.destination}
                      </p>
                      {item.travelDate && (
                        <p className="text-[10.5px] text-slate-400 font-medium">
                          {new Date(item.travelDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </p>
                      )}
                    </td>

                    {/* Rating */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-0.5 text-amber-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} size={11} fill={i < item.rating ? "currentColor" : "none"} />
                        ))}
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold">{item.rating || 5}/5</span>
                    </td>

                    {/* Message Excerpt */}
                    <td className="py-3.5 px-5 max-w-xs">
                      <p className="text-slate-600 dark:text-slate-300 italic truncate font-medium">
                        "{item.message}"
                      </p>
                    </td>

                    {/* Verified Status Button */}
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => toggleVisibility(item._id, item.toShow)}
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1 transition-all shadow-xs cursor-pointer active:scale-95 ${
                          item.toShow
                            ? "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                            : "bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                        }`}
                        title={item.toShow ? "Verified (Click to unverify)" : "Unverified (Click to verify)"}
                      >
                        {item.toShow ? (
                          <>
                            <CheckCircle2 size={12} className="text-emerald-500" />
                            <span>Verified</span>
                          </>
                        ) : (
                          <>
                            <XCircle size={12} className="text-amber-500" />
                            <span>Unverified</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedTestimonial(item)}
                          className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 dark:hover:bg-blue-900/40 rounded-xl transition-all border border-blue-200 dark:border-blue-800/60 cursor-pointer shadow-sm hover:scale-105 active:scale-95"
                          title="View Full Story"
                        >
                          <Eye size={14} />
                        </button>

                        <button
                          onClick={() => handleDelete(item._id)}
                          className="p-2 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white dark:bg-red-950/40 dark:text-red-400 dark:hover:bg-red-600 dark:hover:text-white rounded-xl transition-all border border-red-200 dark:border-red-800/60 cursor-pointer shadow-sm hover:scale-105 active:scale-95"
                          title="Delete Story"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── MODAL: VIEW STORY DETAILS ── */}
      <AnimatePresence>
        {selectedTestimonial && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTestimonial(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Dialog Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white dark:bg-[#091126] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-[#050A17]/60">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white leading-tight">
                      Story Details
                    </h3>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      Couple Testimonial Inspector
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Status Badge */}
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      selectedTestimonial.toShow
                        ? "bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400"
                        : "bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400"
                    }`}
                  >
                    {selectedTestimonial.toShow ? "Live on Website" : "Hidden / Private"}
                  </span>

                  {/* Close button */}
                  <button
                    onClick={() => setSelectedTestimonial(null)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-6">
                {/* Profile & Destination Card */}
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-[#050A17] border border-slate-200 dark:border-slate-800">
                  <div className="size-16 rounded-2xl overflow-hidden shrink-0 border-2 border-slate-200 dark:border-slate-700 shadow-md bg-white">
                    <img
                      src={getCdnUrl(selectedTestimonial.profileImage) || "https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&w=200&q=80"}
                      alt={selectedTestimonial.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&w=200&q=80";
                      }}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-lg font-black text-slate-900 dark:text-white">
                        {selectedTestimonial.name}
                      </h4>
                      {selectedTestimonial.isVerifiedUser && (
                        <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 text-[9.5px] font-black px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800/60 uppercase">
                          <ShieldCheck size={11} />
                          Verified Couple
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400 mt-2">
                      <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
                        <MapPin size={13} className="text-blue-500" />
                        {selectedTestimonial.destination}
                        {selectedTestimonial.location && ` (${selectedTestimonial.location})`}
                      </span>

                      {selectedTestimonial.travelDate && (
                        <span className="flex items-center gap-1">
                          <Calendar size={13} className="text-slate-400" />
                          {new Date(selectedTestimonial.travelDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </span>
                      )}

                      <div className="flex items-center gap-1 text-amber-400">
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} size={12} fill={i < selectedTestimonial.rating ? "currentColor" : "none"} />
                          ))}
                        </div>
                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">({selectedTestimonial.rating || 5}/5)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Review Message (Full text without truncation) */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                    Review Content
                  </label>
                  <div className="relative p-5 rounded-2xl bg-slate-50 dark:bg-[#050A17] border border-slate-200 dark:border-slate-800">
                    <Quote className="absolute -left-1 -top-2 text-blue-500/10 dark:text-blue-400/10" size={36} />
                    <p className="text-slate-700 dark:text-slate-200 text-sm leading-relaxed italic pl-3 font-medium whitespace-pre-wrap">
                      "{selectedTestimonial.message}"
                    </p>
                  </div>
                </div>

                {/* Trip Image if present */}
                {selectedTestimonial.trip_image && (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                      Trip Photo
                    </label>
                    <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md max-h-64 bg-black">
                      <img
                        src={getCdnUrl(selectedTestimonial.trip_image)}
                        alt="Trip Memory"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-[#050A17]/60">
                <button
                  onClick={() => handleDelete(selectedTestimonial._id)}
                  className="px-4 py-2 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white rounded-xl text-xs font-bold transition-all border border-red-200 dark:border-red-800/60 flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 size={14} />
                  <span>Delete Story</span>
                </button>

                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => toggleVisibility(selectedTestimonial._id, selectedTestimonial.toShow)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      selectedTestimonial.toShow
                        ? "bg-amber-500 text-white hover:bg-amber-600 shadow-sm shadow-amber-500/30"
                        : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm shadow-emerald-600/30"
                    }`}
                  >
                    {selectedTestimonial.toShow ? (
                      <>
                        <XCircle size={14} />
                        <span>Unverify / Hide Story</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={14} />
                        <span>Verify & Publish Story</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setSelectedTestimonial(null)}
                    className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WrittenTestimonialList;
