import { useEffect, useState } from "react";
import { Pencil, Trash2, Plus, Mail, Phone, MapPin, Sparkles, Loader2, Building, Eye, IndianRupee, CheckCircle, XCircle, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../../stores/authStores";
import { motion, AnimatePresence } from "framer-motion";
import useAuthStore from "../../stores/authStores";

const HoneymoonResortList = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const navigate = useNavigate();
  const role = useAuthStore((s) => s.role);

  const fetchResorts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiClient.get("/admin/resort/all");
      setData(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.msg || err.message || "Something went wrong");
      if (err.response?.status === 401) navigate("/login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await apiClient.delete(`/admin/resort/delete/${id}`);
      setDeleteConfirmId(null);
      fetchResorts();
    } catch {
      alert("Failed to delete resort");
    }
  };

  const handleToggleActive = async (resort) => {
    try {
      await apiClient.patch(`/admin/resort/update/${resort._id}`, { is_active: !resort.is_active });
      fetchResorts();
    } catch {
      alert("Failed to update status");
    }
  };

  useEffect(() => { fetchResorts(); }, []);

  const availabilityColor = (status) => {
    if (status === "Available") return "bg-emerald-100 text-emerald-700";
    return "bg-red-100 text-red-600";
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pb-20">
      {/* HEADER */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none text-indigo-600"><Building size={200} /></div>
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-4">
              <Building className="text-indigo-600" size={36} /> Resort Registry
            </h1>
            <p className="text-slate-500 font-medium mt-2 text-base">
              {data.length} resort{data.length !== 1 ? "s" : ""} in the registry
            </p>
          </div>
          <button
            onClick={() => navigate("/resorts/create")}
            className="flex items-center gap-3 bg-indigo-600 text-white px-8 py-5 rounded-[2rem] font-black shadow-2xl shadow-indigo-500/40 hover:bg-indigo-700 transition-all transform hover:scale-105 active:scale-95"
          >
            <Plus size={20} /> Add New Resort
          </button>
        </div>
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {deleteConfirmId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setDeleteConfirmId(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-[2rem] p-10 shadow-2xl max-w-sm w-full mx-4 text-center"
            >
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Trash2 className="text-red-500" size={28} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">Delete Resort?</h3>
              <p className="text-slate-500 mb-8">This action cannot be undone. The resort will be permanently removed.</p>
              <div className="flex gap-4">
                <button onClick={() => setDeleteConfirmId(null)} className="flex-1 py-4 rounded-2xl bg-slate-100 text-slate-700 font-black hover:bg-slate-200 transition-all">Cancel</button>
                <button onClick={() => handleDelete(deleteConfirmId)} className="flex-1 py-4 rounded-2xl bg-red-500 text-white font-black hover:bg-red-600 transition-all">Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* STATES */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-40 gap-4">
          <Loader2 className="animate-spin text-indigo-600" size={48} strokeWidth={1} />
          <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Loading Resorts...</p>
        </div>
      ) : error ? (
        <div className="py-20 text-center bg-red-50 rounded-[3rem] border border-red-100">
          <p className="text-red-500 font-bold text-sm">{error}</p>
        </div>
      ) : data.length === 0 ? (
        <div className="py-40 text-center bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 border-dashed">
          <Sparkles className="mx-auto mb-4 text-slate-200" size={64} strokeWidth={1} />
          <p className="text-slate-400 font-bold text-sm">No resorts found. Add your first one!</p>
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          <AnimatePresence mode="popLayout">
            {data.map((resort) => {
              const { _id, title, contact_email, contact_phone, images, price_per_night, is_active, is_featured, availability_status, city, country } = resort;
              const imageUrl = images?.[0] || "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?q=80&w=800&auto=format&fit=crop";

              return (
                <motion.div
                  key={_id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="group bg-white dark:bg-slate-900 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 transition-all flex flex-col overflow-hidden"
                >
                  {/* IMAGE */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden shrink-0">
                    <img src={imageUrl} alt={title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    
                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                      {is_featured && (
                        <div className="flex items-center gap-1 bg-amber-500 text-white px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest shadow-md">
                          <Sparkles size={10} /> Featured
                        </div>
                      )}
                      <div className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest shadow-md ${is_active ? 'bg-emerald-600 text-white' : 'bg-slate-600 text-white'}`}>
                        {is_active ? "Live" : "Offline"}
                      </div>
                    </div>
                  </div>

                  {/* BODY */}
                  <div className="p-5 flex-1 flex flex-col">
                    <h2 className="text-base font-black text-slate-900 dark:text-white leading-tight truncate mb-1" title={title}>{title}</h2>
                    {(city || country) && (
                      <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-semibold truncate mb-4">
                        <MapPin size={10} className="text-slate-400" /> {[city, country].filter(Boolean).join(", ")}
                      </div>
                    )}

                    <div className="flex items-center justify-between mb-4 mt-auto">
                      {price_per_night > 0 ? (
                        <div className="flex items-center gap-0.5 text-slate-900 dark:text-white font-black text-sm">
                          <IndianRupee size={12} className="text-slate-400" /> {price_per_night.toLocaleString("en-IN")} <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">/ night</span>
                        </div>
                      ) : (
                        <div className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Price on Request</div>
                      )}
                      <span className={`px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest ${availabilityColor(availability_status)}`}>
                        {availability_status === "Available" ? "Available" : "Sold Out"}
                      </span>
                    </div>

                    <div className="space-y-1.5 border-t border-slate-100 dark:border-slate-800 pt-4">
                      {contact_email && (
                        <div className="flex items-center gap-2 text-slate-500 text-[10px] font-medium truncate">
                          <Mail size={12} className="text-slate-400 shrink-0" /> <span className="truncate">{contact_email}</span>
                        </div>
                      )}
                      {contact_phone && (
                        <div className="flex items-center gap-2 text-slate-500 text-[10px] font-medium truncate">
                          <Phone size={12} className="text-slate-400 shrink-0" /> <span>{contact_phone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* FOOTER ACTIONS */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1">

                    <button onClick={() => navigate(`/resorts/view/${_id}`)} className="flex-1 flex items-center justify-center p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 rounded-xl transition-all shadow-sm" title="View">
                      <Eye size={14} />
                    </button>
                    <button onClick={() => navigate(`/resorts/edit/${_id}`)} className="flex-1 flex items-center justify-center p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 rounded-xl transition-all shadow-sm" title="Edit">
                      <Pencil size={14} />
                    </button>
                    {role === "superadmin" && (
                      <button onClick={() => setDeleteConfirmId(_id)} className="flex-1 flex items-center justify-center p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500 rounded-xl transition-all shadow-sm" title="Delete">
                        <Trash2 size={14} />
                      </button>
                    )}
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
