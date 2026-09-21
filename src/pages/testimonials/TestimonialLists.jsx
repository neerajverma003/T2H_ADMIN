import { useState, useEffect } from "react";
import { Loader2, Play, Trash2, MapPin, Eye, Sparkles, Filter, Video, Search, ChevronRight, Heart } from "lucide-react";
import { toast } from "react-toastify";
import { apiClient } from "../../stores/authStores";
import { motion, AnimatePresence } from "framer-motion";

const TestimonialListPage = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      setIsFetching(true);
      const res = await apiClient.get("/admin/testimonial-video");
      if (res.data.success) setTestimonials(res.data.data || []);
    } catch {
      toast.error("Failed to load registry");
    } finally {
      setIsFetching(false);
    }
  };

  const handleDeleteTestimonial = async (id) => {
    if (!window.confirm("Permanently remove this story from the registry?")) return;
    try {
      setDeletingId(id);
      const res = await apiClient.delete(`/admin/testimonial-video/${id}`);
      if (res.data.success) {
        toast.success("Memory removed");
        fetchTestimonials();
      }
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = testimonials.filter(t => 
    t.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8 pb-20 font-sans min-h-screen text-slate-900 dark:text-slate-100 text-left"
    >
      {/* HEADER HUB */}
      <div className="bg-white dark:bg-[#091126]/95 rounded-3xl py-4 sm:py-5 px-6 sm:px-8 border border-slate-200/90 dark:border-indigo-500/25 shadow-xl dark:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.7),0_0_30px_2px_rgba(99,102,241,0.18)] ring-1 ring-slate-900/5 dark:ring-white/5 backdrop-blur-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-500/30 shrink-0">
            <Sparkles size={22} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2 flex-wrap">
              Video <span className="text-blue-500">Storyboard</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-semibold mt-0.5 text-xs sm:text-sm">
              Full archive of video testimonials and cinematic honeymoon stories
            </p>
          </div>
        </div>
        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative group w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Filter memories..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-slate-50 dark:bg-[#050A17] border border-slate-200 dark:border-slate-800/90 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 rounded-xl text-xs font-semibold w-full outline-none transition-all placeholder:text-slate-400 dark:placeholder-slate-500 text-slate-900 dark:text-white shadow-inner"
            />
          </div>
          <div className="px-4 py-2 bg-slate-50 dark:bg-[#050A17] text-slate-700 dark:text-slate-300 rounded-2xl text-xs font-extrabold uppercase tracking-wider border border-slate-200 dark:border-slate-800/90 shadow-sm flex items-center gap-2 shrink-0">
            <Video size={14} className="text-blue-500" />
            <span>{testimonials.length} Assets</span>
          </div>
        </div>
      </div>

      {/* REGISTRY GRID */}
      {isFetching ? (
        <div className="flex flex-col items-center justify-center py-48 gap-6">
          <Loader2 className="animate-spin text-blue-500" size={56} strokeWidth={1.5} />
          <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Fetching Global Storyboard...</p>
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence mode='popLayout'>
            {filtered.map((t) => (
              <motion.div 
                layout key={t._id} 
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="group bg-white dark:bg-[#091126]/95 rounded-3xl border border-slate-200/90 dark:border-indigo-500/25 shadow-xl ring-1 ring-slate-900/5 dark:ring-white/5 backdrop-blur-xl transition-all hover:border-blue-500/50 hover:shadow-blue-500/10 overflow-hidden flex flex-col justify-between"
              >
                <div className="relative aspect-video overflow-hidden bg-slate-950">
                  <video src={t.video_url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" muted />
                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-[2px]">
                    <div className="size-14 bg-white/95 rounded-full flex items-center justify-center text-blue-600 shadow-2xl scale-75 group-hover:scale-100 transition-transform duration-300">
                      <Play fill="currentColor" size={24} className="ml-1" />
                    </div>
                  </div>
                  <div className="absolute top-3 left-3">
                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-xl backdrop-blur-md border border-white/10 ${t.visibility === 'public' ? 'bg-emerald-600/90 text-white' : 'bg-slate-900/90 text-white'}`}>
                      {t.visibility} Portal
                    </span>
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight truncate group-hover:text-blue-500 transition-colors">{t.title}</h3>
                    <div className="flex items-center gap-1.5 mt-1.5 text-slate-500 dark:text-slate-400">
                      <MapPin size={13} className="text-blue-500 shrink-0" />
                      <span className="text-[10px] font-bold uppercase tracking-wider truncate">{t.location}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                    <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                      LOGGED: {new Date(t.createdAt).toLocaleDateString()}
                    </div>
                    <button 
                      onClick={() => handleDeleteTestimonial(t._id)}
                      disabled={deletingId === t._id}
                      className="p-2 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white dark:bg-red-950/40 dark:text-red-400 dark:hover:bg-red-600 dark:hover:text-white rounded-xl transition-all border border-red-200 dark:border-red-800/60 cursor-pointer shadow-sm disabled:opacity-50"
                      title="Delete Story"
                    >
                      {deletingId === t._id ? <Loader2 className="animate-spin" size={14} /> : <Trash2 size={14} />}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="py-32 text-center bg-white dark:bg-[#091126]/95 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 shadow-xl">
          <Heart className="mx-auto mb-4 text-slate-300 dark:text-slate-700" size={64} strokeWidth={1} />
          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white uppercase tracking-tight mb-1">No Stories Found</h3>
          <p className="text-slate-500 dark:text-slate-400 font-semibold text-xs">The story registry is currently vacant</p>
        </div>
      )}
    </motion.div>
  );
};

export default TestimonialListPage;
