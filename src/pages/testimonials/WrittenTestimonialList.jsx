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
  ShieldCheck
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
        setTestimonials(prev => prev.map(t =>
          t._id === id ? { ...t, toShow: !currentStatus } : t
        ));
        toast.success(`Story is now ${!currentStatus ? 'Public' : 'Private'}`);
      }
    } catch (error) {
      toast.error("Update failed");
    }
  };

  const filteredTestimonials = testimonials.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.destination.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Public / Live</p>
            <h3 className="text-3xl font-black text-emerald-500 mt-1">{publicReviews}</h3>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 shadow-sm">
            <Eye size={20} />
          </div>
        </div>

        <div className="bg-white dark:bg-[#091126]/95 p-6 rounded-3xl border border-slate-200/90 dark:border-indigo-500/25 shadow-xl ring-1 ring-slate-900/5 dark:ring-white/5 backdrop-blur-xl flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Private / Hidden</p>
            <h3 className="text-3xl font-black text-amber-500 mt-1">{privateReviews}</h3>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 text-amber-500 rounded-2xl border border-amber-200 dark:border-amber-800/60 shadow-sm">
            <EyeOff size={20} />
          </div>
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
          <p className="text-slate-500 dark:text-slate-400 font-medium text-xs max-w-sm mx-auto">Your review archive is empty. Start by composing a new couple story.</p>
        </div>
      ) : (
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
                {/* Status Badge */}
                <div className="absolute top-6 right-6">
                  <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-md backdrop-blur-md border border-white/10 ${
                    item.toShow
                      ? "bg-emerald-600/90 text-white"
                      : "bg-slate-900/90 text-white"
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
                          Verified
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-4">
                      <span className="flex items-center gap-1.5">
                        <MapPin size={13} className="text-blue-500" />
                        {item.destination}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar size={13} className="text-slate-400" />
                        {new Date(item.travelDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </span>
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
                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                  <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    LOGGED STORY
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleVisibility(item._id, item.toShow)}
                      className="p-2 bg-slate-50 hover:bg-slate-100 dark:bg-[#050A17] dark:hover:bg-[#15233e] text-slate-500 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 transition-all rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer shadow-sm"
                      title={item.toShow ? "Make Private" : "Make Public"}
                    >
                      {item.toShow ? <Eye size={15} /> : <EyeOff size={15} />}
                    </button>

                    <button
                      onClick={() => handleDelete(item._id)}
                      className="p-2 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white dark:bg-red-950/40 dark:text-red-400 dark:hover:bg-red-600 dark:hover:text-white rounded-xl transition-all border border-red-200 dark:border-red-800/60 cursor-pointer shadow-sm"
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
      )}
    </div>
  );
};

export default WrittenTestimonialList;
