import { useState, useEffect } from "react";
import { 
  Sparkles, 
  Trash2, 
  Check, 
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

const ItineraryReviewApprovals = () => {
  const [reviews, setReviews] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // "all", "pending", "approved"

  const fetchReviews = async () => {
    try {
      setIsFetching(true);
      const res = await apiClient.get("/admin/itinerary-reviews/pending");
      if (res.data.success) {
        setReviews(res.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast.error("Failed to load reviews");
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleApprove = async (itineraryId, reviewId) => {
    try {
      const res = await apiClient.patch(`/admin/itinerary/${itineraryId}/review/${reviewId}/approve`);
      if (res.data.success) {
        toast.success("Review approved successfully! It is now live.");
        setReviews(prev => prev.map(r => r.reviewId === reviewId ? { ...r, isApproved: true } : r));
      }
    } catch (error) {
      toast.error("Approve failed");
    }
  };

  const handleReject = async (itineraryId, reviewId) => {
    if (!window.confirm("Are you sure you want to remove this review?")) return;
    try {
      const res = await apiClient.delete(`/admin/itinerary/${itineraryId}/review/${reviewId}`);
      if (res.data.success) {
        toast.success("Review removed successfully.");
        setReviews(prev => prev.filter(r => r.reviewId !== reviewId));
      }
    } catch (error) {
      toast.error("Removal failed");
    }
  };

  const filteredReviews = reviews.filter(r => {
    // Status filter
    if (statusFilter === "pending" && r.isApproved) return false;
    if (statusFilter === "approved" && !r.isApproved) return false;

    // Search query filter
    return (
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.itineraryTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.message.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-lg text-white">
              <Sparkles size={24} />
            </div>
            Itinerary Review Management
          </h1>
          <p className="text-slate-500 mt-1">Manage, approve, or reject couple reviews across itineraries</p>
        </div>

        <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm w-full md:w-80">
          <Search className="text-slate-400 ml-2" size={18} />
          <input
            type="text"
            placeholder="Search reviews..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-sm w-full py-1"
          />
          <div className="bg-slate-100 dark:bg-slate-800 p-1.5 rounded-lg text-slate-400 cursor-pointer">
            <Filter size={16} />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 border-b border-slate-100 dark:border-slate-800 pb-4">
        {["all", "pending", "approved"].map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold capitalize transition-all duration-300 ${
              statusFilter === tab
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800"
            }`}
          >
            {tab} Reviews ({
              tab === "all" ? reviews.length :
              tab === "pending" ? reviews.filter(r => !r.isApproved).length :
              reviews.filter(r => r.isApproved).length
            })
          </button>
        ))}
      </div>

      {isFetching ? (
        <div className="flex flex-col items-center justify-center py-32">
          <Loader2 className="animate-spin text-indigo-600 mb-4" size={48} />
          <p className="text-slate-500 font-medium">Loading Reviews...</p>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-16 text-center border-2 border-dashed border-slate-100 dark:border-slate-800">
          <div className="size-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <Quote size={32} className="text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Reviews Found</h3>
          <p className="text-slate-500 max-w-sm mx-auto">There are no reviews matching the "{statusFilter}" status.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <AnimatePresence>
            {filteredReviews.map((item) => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={item.reviewId}
                className="group relative bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-500"
              >
                {/* Status Badge */}
                <div className={`absolute top-6 right-6 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  item.isApproved
                    ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20"
                    : "bg-amber-50 text-amber-600 dark:bg-amber-900/20"
                }`}>
                  {item.isApproved ? "Approved" : "Pending Approval"}
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                  {/* Avatar Section */}
                  <div className="shrink-0">
                    <div className="size-24 rounded-2xl overflow-hidden shadow-lg border-2 border-white dark:border-slate-800 flex items-center justify-center bg-indigo-50 font-bold text-indigo-600 text-3xl">
                      {item.profileImage ? (
                        <img 
                          src={getCdnUrl(item.profileImage)} 
                          alt={item.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        item.name?.[0]?.toUpperCase()
                      )}
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
                      <span className="flex items-center gap-1.5 font-semibold text-indigo-600 dark:text-indigo-400">
                        <MapPin size={14} />
                        Itinerary: {item.itineraryTitle}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar size={14} className="text-slate-400" />
                        {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
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
                     <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Moderation</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {!item.isApproved ? (
                      <button
                        onClick={() => handleApprove(item.itineraryId, item.reviewId)}
                        className="flex items-center gap-1.5 px-4 py-2 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-all font-semibold text-sm"
                        title="Approve Review"
                      >
                        <Check size={16} /> Approve
                      </button>
                    ) : (
                      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold text-sm bg-emerald-50 dark:bg-emerald-900/10 px-3 py-1.5 rounded-xl border border-emerald-100 dark:border-emerald-800/50">
                        <Check size={16} /> Approved
                      </span>
                    )}
                    
                    <button
                      onClick={() => handleReject(item.itineraryId, item.reviewId)}
                      className="flex items-center gap-1.5 px-4 py-2 text-red-500 bg-red-50 hover:bg-red-100 rounded-xl transition-all font-semibold text-sm"
                      title={item.isApproved ? "Delete Review" : "Reject Review"}
                    >
                      <Trash2 size={16} /> {item.isApproved ? "Delete" : "Reject"}
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

export default ItineraryReviewApprovals;
