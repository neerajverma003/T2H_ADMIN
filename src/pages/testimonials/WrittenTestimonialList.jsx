import { useState, useEffect } from "react";
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
  Filter
} from "lucide-react";
import { apiClient } from "../../stores/authStores";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { getCdnUrl } from "../../utils/media";

const WrittenTestimonialList = () => {
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

  return (
    <div className="pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-lg text-white">
              <Sparkles size={24} />
            </div>
            Written Review Archive
          </h1>
          <p className="text-slate-500 mt-1">Manage and curate couple stories for the website</p>
        </div>

        <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm w-full md:w-80">
          <Search className="text-slate-400 ml-2" size={18} />
          <input
            type="text"
            placeholder="Search stories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-sm w-full py-1"
          />
          <div className="bg-slate-100 dark:bg-slate-800 p-1.5 rounded-lg text-slate-400 cursor-pointer">
            <Filter size={16} />
          </div>
        </div>
      </div>

      {isFetching ? (
        <div className="flex flex-col items-center justify-center py-32">
          <Loader2 className="animate-spin text-indigo-600 mb-4" size={48} />
          <p className="text-slate-500 font-medium">Opening Archive...</p>
        </div>
      ) : filteredTestimonials.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-16 text-center border-2 border-dashed border-slate-100 dark:border-slate-800">
          <div className="size-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <Quote size={32} className="text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Stories Found</h3>
          <p className="text-slate-500 max-w-sm mx-auto">Your review archive is empty. Start by adding a new couple story.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <AnimatePresence>
            {filteredTestimonials.map((item) => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={item._id}
                className="group relative bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-500"
              >
                {/* Status Badge */}
                <div className={`absolute top-6 right-6 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  item.toShow 
                    ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20" 
                    : "bg-slate-100 text-slate-400 dark:bg-slate-800"
                }`}>
                  {item.toShow ? "Public" : "Private"}
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                  {/* Avatar Section */}
                  <div className="shrink-0">
                    <div className="size-24 rounded-2xl overflow-hidden shadow-lg border-2 border-white dark:border-slate-800">
                      <img 
                        src={getCdnUrl(item.profileImage) || "https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&w=200&q=80"} 
                        alt={item.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate">{item.name}</h3>
                      <div className="flex items-center gap-0.5 text-amber-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} size={12} fill={i < item.rating ? "currentColor" : "none"} />
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 text-xs font-medium text-slate-400 mb-4">
                      <span className="flex items-center gap-1.5">
                        <MapPin size={14} className="text-indigo-500" />
                        {item.destination}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar size={14} className="text-slate-400" />
                        {new Date(item.travelDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </span>
                    </div>

                    <div className="relative">
                      <Quote className="absolute -left-2 -top-2 text-indigo-500/10" size={32} />
                      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed italic line-clamp-3 pl-4">
                        {item.message}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="mt-6 pt-6 border-t border-slate-50 dark:border-slate-800/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                     <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Controls</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleVisibility(item._id, item.toShow)}
                      className={`p-2 rounded-xl transition-all ${
                        item.toShow 
                          ? "text-indigo-600 bg-indigo-50 hover:bg-indigo-100" 
                          : "text-slate-400 bg-slate-50 hover:bg-slate-100"
                      }`}
                      title={item.toShow ? "Make Private" : "Make Public"}
                    >
                      {item.toShow ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                    
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="p-2 text-red-500 bg-red-50 hover:bg-red-100 rounded-xl transition-all"
                      title="Delete Story"
                    >
                      <Trash2 size={18} />
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
