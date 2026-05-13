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
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-full mx-auto space-y-10 pb-20 px-6">
      {/* HEADER HUB */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden text-left">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none text-indigo-600"><Video size={160} /></div>
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
                <h1 className="text-3xl font-black text-slate-950 dark:text-white tracking-tight flex items-center gap-4">
                    <Sparkles className="text-indigo-600" size={32} /> VIDEO STORYBOARD
                </h1>
                <p className="text-slate-500 dark:text-slate-400 font-bold mt-1 text-sm italic text-left">Full archive of video testimonials and cinematic honeymoon stories</p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative group w-full sm:w-80">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                    <input 
                        type="text" 
                        placeholder="Filter memories..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-14 pr-6 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 focus:ring-2 focus:ring-indigo-500/20 rounded-2xl text-base font-medium w-full outline-none transition-all placeholder:text-slate-500"
                    />
                </div>
                <div className="flex items-center gap-3 px-6 py-3.5 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20">
                    <Video size={16} /> {testimonials.length} ASSETS
                </div>
            </div>
        </div>
      </div>

      {/* REGISTRY GRID */}
      {isFetching ? (
        <div className="flex flex-col items-center justify-center py-48 gap-8">
            <Loader2 className="animate-spin text-indigo-700" size={64} strokeWidth={1.5} />
            <p className="text-xs font-black uppercase tracking-[0.4em] text-slate-400">Fetching Global Storyboard...</p>
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
                        className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-lg transition-all hover:shadow-xl hover:shadow-indigo-500/10 overflow-hidden"
                    >
                        <div className="relative aspect-video overflow-hidden bg-slate-950">
                            <video src={t.video_url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" muted />
                            <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-sm">
                                <div className="size-20 bg-white rounded-full flex items-center justify-center text-indigo-700 shadow-2xl scale-75 group-hover:scale-100 transition-transform duration-500">
                                    <Play fill="currentColor" size={32} className="ml-1" />
                                </div>
                            </div>
                            <div className="absolute top-6 left-6">
                                <div className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] backdrop-blur-md shadow-2xl ${t.visibility === 'public' ? 'bg-emerald-600 text-white' : 'bg-slate-950 text-slate-300'}`}>
                                    {t.visibility} Portal
                                </div>
                            </div>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                            <div>
                                <h3 className="text-lg font-black text-slate-950 dark:text-white tracking-tight truncate group-hover:text-indigo-600 transition-colors">{t.title}</h3>
                                <div className="flex items-center gap-2 mt-2 text-slate-500">
                                    <MapPin size={14} className="text-indigo-600" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">{t.location}</span>
                                </div>
                            </div>
                            </div>

                            <div className="pt-6 border-t-2 border-slate-50 dark:border-slate-800 flex items-center justify-between">
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    LOGGED: {new Date(t.createdAt).toLocaleDateString()}
                                </div>
                                <button 
                                    onClick={() => handleDeleteTestimonial(t._id)}
                                    disabled={deletingId === t._id}
                                    className="p-3.5 bg-white text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-lg border border-slate-100 group/btn"
                                >
                                    {deletingId === t._id ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} className="group-hover/btn:scale-110 transition-transform" />}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
      ) : (
        <div className="py-48 text-center bg-white dark:bg-slate-900 rounded-[3.5rem] border-4 border-dashed border-slate-100 dark:border-slate-800">
            <Heart className="mx-auto mb-6 text-slate-100 dark:text-slate-800" size={100} strokeWidth={1} />
            <h3 className="text-3xl font-black text-slate-950 dark:text-white uppercase tracking-tight mb-4">No Stories Found</h3>
            <p className="text-slate-600 dark:text-slate-400 font-bold uppercase tracking-widest text-sm italic">The story registry is currently vacant</p>
        </div>
      )}
    </motion.div>
  );
};

export default TestimonialListPage;
