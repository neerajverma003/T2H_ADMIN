import { useEffect, useState } from "react";
import { Pencil, Trash2, Plus, Mail, Phone, MapPin, Sparkles, Loader2, Building } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../../stores/authStores";
import { ENV } from "../../constants/api";
import { motion, AnimatePresence } from "framer-motion";

const HoneymoonResortList = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchResorts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiClient.get("/admin/resort/all");
      setData(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.msg || err.message || "Something went wrong");
      if (err.response?.status === 401) {
        navigate("/login");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Permanently delete this resort from the registry?")) return;
    try {
      await apiClient.delete(`/admin/resort/delete/${id}`);
      fetchResorts();
    } catch {
      alert("Failed to delete resort");
    }
  };

  useEffect(() => {
    fetchResorts();
  }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pb-20">
      {/* HEADER SECTION */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none text-indigo-600"><Building size={200} /></div>
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-4">
              <Building className="text-indigo-600" size={36} /> RESORT REGISTRY
            </h1>
            <p className="text-slate-500 font-medium mt-2 text-lg italic">Curating luxury honeymoon stays</p>
          </div>
          <button
            onClick={() => navigate("/resorts/create")}
            className="flex items-center gap-3 bg-indigo-600 text-white px-8 py-5 rounded-[2rem] font-black shadow-2xl shadow-indigo-500/40 hover:bg-indigo-700 transition-all transform hover:scale-105 active:scale-95"
          >
            <Plus size={20} /> ONBOARD NEW RESORT
          </button>
        </div>
      </div>

      {/* ERROR / LOADING */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-40 gap-4">
          <Loader2 className="animate-spin text-indigo-600" size={48} strokeWidth={1} />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Synchronizing Resorts</p>
        </div>
      ) : error ? (
        <div className="py-20 text-center bg-red-50 dark:bg-red-950/20 rounded-[3rem] border border-red-100 dark:border-red-900/30">
          <p className="text-red-500 font-bold uppercase tracking-widest text-xs">{error}</p>
        </div>
      ) : data.length === 0 ? (
        <div className="py-40 text-center bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 border-dashed">
          <Sparkles className="mx-auto mb-4 text-slate-200" size={64} strokeWidth={1} />
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No resorts found in the registry</p>
        </div>
      ) : (
        <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6">
          <AnimatePresence mode='popLayout'>
            {data.map((resort) => {
              const { _id, title, contact_email, contact_phone, images } = resort;
              const imageUrl = images?.[0] || "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?q=80&w=800&auto=format&fit=crop";

              return (
                <motion.div
                  key={_id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="group bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden transition-all hover:shadow-2xl hover:shadow-indigo-500/10"
                >
                  <div className="relative aspect-video overflow-hidden">
                    <img src={imageUrl} alt={title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute top-6 right-6 flex gap-2 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      <button
                        onClick={() => navigate(`/resorts/edit/${_id}`)}
                        className="p-3 bg-white/20 backdrop-blur-md text-white rounded-2xl hover:bg-white hover:text-indigo-600 transition-all border border-white/10 shadow-xl"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(_id)}
                        className="p-3 bg-white/20 backdrop-blur-md text-white rounded-2xl hover:bg-red-500 transition-all border border-white/10 shadow-xl"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    <div className="absolute bottom-6 left-6 right-6">
                      <h2 className="text-white text-xl font-black leading-tight tracking-tight truncate">{title}</h2>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full border border-white/10">
                          <p className="text-white text-[9px] font-black uppercase tracking-[0.1em]">Luxury Resort</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-8 space-y-4">
                    <div className="flex flex-col gap-3">
                      {contact_email && (
                        <div className="flex items-center gap-3 group/item">
                          <div className="size-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover/item:bg-indigo-600 group-hover/item:text-white transition-all">
                            <Mail size={14} />
                          </div>
                          <span className="text-xs font-bold text-slate-500 truncate">{contact_email}</span>
                        </div>
                      )}
                      {contact_phone && (
                        <div className="flex items-center gap-3 group/item">
                          <div className="size-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover/item:bg-emerald-600 group-hover/item:text-white transition-all">
                            <Phone size={14} />
                          </div>
                          <span className="text-xs font-bold text-slate-500">{contact_phone}</span>
                        </div>
                      )}
                    </div>
                    <div className="pt-6 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-slate-300">
                        <MapPin size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Global Locations</span>
                      </div>
                      <button
                        onClick={() => navigate(`/resorts/edit/${_id}`)}
                        className="text-xs font-black text-indigo-600 uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all"
                      >
                        Inspect <Sparkles size={12} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
};

export default HoneymoonResortList;
