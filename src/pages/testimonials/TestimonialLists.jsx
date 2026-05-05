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
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-[1400px] mx-auto space-y-8 pb-20 px-6">
      {/* HEADER HUB */}
      <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div>
                <div className="flex items-center gap-3 mb-2">
                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em]">Social Proof</span>
                    <div className="h-[1px] w-12 bg-indigo-100 dark:bg-indigo-900/40" />
                </div>
                <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                    STORY REGISTRY
                </h1>
                <p className="text-slate-500 font-medium mt-1">Full archive of honeymoon testimonials and video assets</p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                    <input 
                        type="text" 
                        placeholder="Filter stories..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-transparent focus:border-indigo-100 dark:focus:border-indigo-900/30 rounded-2xl text-sm font-bold w-full sm:w-64 outline-none transition-all"
                    />
                </div>
                <div className="flex items-center gap-2 px-6 py-4 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm">
                    <Video size={16} /> {testimonials.length} ASSETS
                </div>
            </div>
        </div>
      </div>

      {/* REGISTRY GRID */}
      {isFetching ? (
        <div className="flex flex-col items-center justify-center py-40 gap-4">
            <Loader2 className="animate-spin text-indigo-600" size={48} strokeWidth={1} />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Fetching Video Assets</p>
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            <AnimatePresence mode='popLayout'>
                {filtered.map((t) => (
                    <motion.div 
                        layout key={t._id} 
                        initial={{ opacity: 0, scale: 0.9 }} 
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="group bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden transition-all hover:shadow-2xl hover:shadow-indigo-500/10"
                    >
                        <div className="relative aspect-video overflow-hidden bg-slate-900">
                            <video src={t.video_url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" muted />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
                                <div className="size-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20 scale-75 group-hover:scale-100 transition-transform duration-500">
                                    <Play fill="currentColor" size={24} />
                                </div>
                            </div>
                            <div className="absolute top-6 left-6">
                                <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest backdrop-blur-md ${t.visibility === 'Public' ? 'bg-emerald-500/80 text-white' : 'bg-black/50 text-slate-300'}`}>
                                    {t.visibility}
                                </div>
                            </div>
                        </div>

                        <div className="p-8 space-y-6">
                            <div>
                                <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight truncate group-hover:text-indigo-600 transition-colors">{t.title}</h3>
                                <div className="flex items-center gap-2 mt-2 text-slate-400">
                                    <MapPin size={12} />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">{t.location}</span>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                                <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                                    Captured: {new Date(t.createdAt).toLocaleDateString()}
                                </div>
                                <button 
                                    onClick={() => handleDeleteTestimonial(t._id)}
                                    disabled={deletingId === t._id}
                                    className="p-3 bg-red-50 dark:bg-red-950/20 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm group/btn"
                                >
                                    {deletingId === t._id ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} className="group-hover/btn:scale-110 transition-transform" />}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
      ) : (
        <div className="py-40 text-center bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 border-dashed">
            <Heart className="mx-auto mb-4 text-slate-100" size={80} strokeWidth={1} />
            <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-xs">The story registry is empty</p>
        </div>
      )}
    </motion.div>
  );
};

export default TestimonialListPage;
