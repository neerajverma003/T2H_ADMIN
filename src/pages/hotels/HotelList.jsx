import { useEffect, useState, useMemo } from "react";
import {
  Building2, MapPin, Star, Plus, Pencil, Trash2,
  Loader2, Sparkles, CheckCircle, XCircle, IndianRupee,
  Globe, Phone, Mail, Clock, Search, ChevronLeft, ChevronRight,
  ChevronsLeft, ChevronsRight, SlidersHorizontal, Filter
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../../stores/authStores";
import { getCdnUrl } from "../../utils/media";
import { motion, AnimatePresence } from "framer-motion";
import useAuthStore from "../../stores/authStores";

const TIER_COLORS = {
  Standard: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300",
  Deluxe: "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300",
  "Super Deluxe": "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300",
  Luxury: "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300",
};

const HotelList = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Search, Filter & Pagination States
  const [searchQuery, setSearchQuery] = useState("");
  const [tierFilter, setTierFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  const navigate = useNavigate();
  const role = useAuthStore((s) => s.role);

  const fetchHotels = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiClient.get("/admin/hotel/all");
      setData(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
      if (err.response?.status === 401) navigate("/login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await apiClient.delete(`/admin/hotel/${id}`);
      setDeleteConfirmId(null);
      fetchHotels();
    } catch {
      alert("Failed to delete hotel");
    }
  };

  const handleToggleActive = async (hotel) => {
    try {
      await apiClient.patch(`/admin/hotel/${hotel._id}`, { is_active: !hotel.is_active });
      fetchHotels();
    } catch {
      alert("Failed to update status");
    }
  };

  useEffect(() => { fetchHotels(); }, []);

  // Filtered & Paginated calculation
  const filteredHotels = useMemo(() => {
    return data.filter((hotel) => {
      // Search query filter (name, city, country, category)
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch = !q ||
        (hotel.name && hotel.name.toLowerCase().includes(q)) ||
        (hotel.city_name && hotel.city_name.toLowerCase().includes(q)) ||
        (hotel.country_name && hotel.country_name.toLowerCase().includes(q)) ||
        (hotel.category && hotel.category.toLowerCase().includes(q));

      // Tier filter
      const matchesTier = tierFilter === "All" || hotel.hotel_tier === tierFilter;

      // Status filter
      const matchesStatus = statusFilter === "All" ||
        (statusFilter === "Live" && hotel.is_active) ||
        (statusFilter === "Offline" && !hotel.is_active);

      return matchesSearch && matchesTier && matchesStatus;
    });
  }, [data, searchQuery, tierFilter, statusFilter]);

  // Reset to page 1 when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, tierFilter, statusFilter, itemsPerPage]);

  const totalPages = Math.ceil(filteredHotels.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedHotels = filteredHotels.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      setTimeout(() => {
        const headerEl = document.getElementById("hotel-list-header");
        if (headerEl) {
          headerEl.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
          const mainEl = document.querySelector('main');
          if (mainEl) {
            mainEl.scrollTo({ top: 0, behavior: "smooth" });
          } else {
            window.scrollTo({ top: 0, behavior: "smooth" });
          }
        }
      }, 50);
    }
  };

  const renderStars = (rating) =>
    Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`text-sm ${i < rating ? "text-amber-400" : "text-slate-300 dark:text-slate-700"}`}>★</span>
    ));

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pb-20">

      {/* HEADER */}
      <div id="hotel-list-header" className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none text-indigo-600">
          <Building2 size={180} />
        </div>
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-4">
              <Building2 className="text-indigo-600" size={36} /> Hotel Registry
            </h1>
            <p className="text-slate-500 font-medium mt-2 text-base">
              {data.length} hotel{data.length !== 1 ? "s" : ""} registered on the portal
            </p>
          </div>
          <button
            onClick={() => navigate("/hotels/create")}
            className="flex items-center gap-3 bg-indigo-600 text-white px-8 py-5 rounded-[2rem] font-black shadow-2xl shadow-indigo-500/40 hover:bg-indigo-700 transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Plus size={20} /> Add New Hotel
          </button>
        </div>
      </div>

      {/* SEARCH & FILTERS BAR */}
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800 shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search hotel name, city, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 transition-all"
          />
        </div>

        {/* Filters & Page Size */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Tier Filter */}
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-black uppercase text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-600 transition-all"
          >
            <option value="All">All Tiers</option>
            <option value="Standard">Standard</option>
            <option value="Deluxe">Deluxe</option>
            <option value="Super Deluxe">Super Deluxe</option>
            <option value="Luxury">Luxury</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-black uppercase text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-600 transition-all"
          >
            <option value="All">All Status</option>
            <option value="Live">Live</option>
            <option value="Offline">Offline</option>
          </select>

          {/* Items Per Page Select */}
          <select
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
            className="px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-black uppercase text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-600 transition-all"
          >
            <option value={4}>4 per page</option>
            <option value={8}>8 per page</option>
            <option value={12}>12 per page</option>
            <option value={16}>16 per page</option>
            <option value={24}>24 per page</option>
          </select>
        </div>
      </div>

      {/* DELETE CONFIRM MODAL */}
      <AnimatePresence>
        {deleteConfirmId && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setDeleteConfirmId(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-900 rounded-[2rem] p-10 shadow-2xl max-w-sm w-full mx-4 text-center border border-slate-100 dark:border-slate-800"
            >
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Trash2 className="text-red-500" size={28} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Delete Hotel?</h3>
              <p className="text-slate-500 mb-8 text-sm">This action cannot be undone. The hotel will be permanently removed.</p>
              <div className="flex gap-4">
                <button onClick={() => setDeleteConfirmId(null)} className="flex-1 py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black hover:bg-slate-200 transition-all">Cancel</button>
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
          <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Loading Hotels...</p>
        </div>
      ) : error ? (
        <div className="py-20 text-center bg-red-50 dark:bg-red-900/10 rounded-[3rem] border border-red-100">
          <p className="text-red-500 font-bold text-sm">{error}</p>
        </div>
      ) : filteredHotels.length === 0 ? (
        <div className="py-30 text-center bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 border-dashed">
          <Building2 className="mx-auto mb-4 text-slate-300 dark:text-slate-700" size={64} strokeWidth={1} />
          <p className="text-slate-500 dark:text-slate-400 font-bold text-base">No hotels found matching your search.</p>
          <button
            onClick={() => { setSearchQuery(""); setTierFilter("All"); setStatusFilter("All"); }}
            className="mt-4 inline-flex items-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-6 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider hover:bg-slate-200 transition-all"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <>
          {/* HOTEL CARDS GRID */}
          <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 min-h-[500px] align-start">
            <AnimatePresence mode="popLayout">
              {paginatedHotels.map((hotel) => {
                const { _id, name, city_name, country_name, images, star_rating, price_per_night,
                  is_active, is_featured, hotel_tier, category, email, contact_number } = hotel;
                const rawImg = images?.[0];
                const imageUrl = getCdnUrl(rawImg) || "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?q=80&w=800&auto=format&fit=crop";

                return (
                  <motion.div
                    key={_id} layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="group bg-white dark:bg-slate-900 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 transition-all flex flex-col overflow-hidden"
                  >
                    {/* IMAGE */}
                    <div className="relative aspect-[4/3] w-full overflow-hidden shrink-0">
                      <img
                        src={imageUrl}
                        alt={name}
                        onError={(e) => {
                          e.target.src = "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?q=80&w=800&auto=format&fit=crop";
                        }}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                        {is_featured && (
                          <div className="flex items-center gap-1 bg-amber-500 text-white px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest shadow-md">
                            <Sparkles size={10} /> Featured
                          </div>
                        )}
                        <div className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest shadow-md ${is_active ? "bg-emerald-600 text-white" : "bg-slate-600 text-white"}`}>
                          {is_active ? "Live" : "Offline"}
                        </div>
                        <div className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest shadow-md ${TIER_COLORS[hotel_tier] || "bg-slate-100 text-slate-600"}`}>
                          {hotel_tier}
                        </div>
                      </div>
                      <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-lg">
                        <span className="text-[9px] font-black text-white uppercase tracking-widest capitalize">{category}</span>
                      </div>
                    </div>

                    {/* BODY */}
                    <div className="p-5 flex-1 flex flex-col">
                      <h2 className="text-base font-black text-slate-900 dark:text-white leading-tight truncate mb-1" title={name}>{name}</h2>

                      {/* Stars */}
                      <div className="flex mb-2">{renderStars(star_rating)}</div>

                      {(city_name || country_name) && (
                        <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-semibold truncate mb-3">
                          <MapPin size={11} className="text-slate-400" />
                          {[city_name, country_name].filter(Boolean).join(", ")}
                        </div>
                      )}

                      <div className="flex items-center justify-between mb-3 mt-auto">
                        {price_per_night > 0 ? (
                          <div className="flex items-center gap-0.5 text-slate-900 dark:text-white font-black text-sm">
                            <IndianRupee size={12} className="text-slate-400" />
                            {price_per_night.toLocaleString("en-IN")}
                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider ml-1">/ night</span>
                          </div>
                        ) : (
                          <div className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Price on Request</div>
                        )}
                      </div>

                      <div className="space-y-1 border-t border-slate-100 dark:border-slate-800 pt-3">
                        {email && (
                          <div className="flex items-center gap-2 text-slate-500 text-[10px] font-medium truncate">
                            <Mail size={11} className="text-slate-400 shrink-0" />
                            <span className="truncate">{email}</span>
                          </div>
                        )}
                        {contact_number && (
                          <div className="flex items-center gap-2 text-slate-500 text-[10px] font-medium">
                            <Phone size={11} className="text-slate-400 shrink-0" />
                            <span>{contact_number}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* ACTIONS */}
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1">
                      <button
                        onClick={() => handleToggleActive(hotel)}
                        className={`flex-1 flex items-center justify-center p-2 rounded-xl transition-all shadow-sm border text-xs font-bold gap-1 cursor-pointer
                          ${is_active
                            ? "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200"
                            : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 hover:bg-slate-100"}`}
                        title={is_active ? "Deactivate" : "Activate"}
                      >
                        {is_active ? <CheckCircle size={14} /> : <XCircle size={14} />}
                      </button>
                      <button
                        onClick={() => navigate(`/hotels/edit/${_id}`)}
                        className="flex-1 flex items-center justify-center p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 rounded-xl transition-all shadow-sm cursor-pointer"
                        title="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                      {role === "superadmin" && (
                        <button
                          onClick={() => setDeleteConfirmId(_id)}
                          className="flex-1 flex items-center justify-center p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500 rounded-xl transition-all shadow-sm cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* PAGINATION CONTROLS BAR */}
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
            <div className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Showing <span className="text-slate-900 dark:text-white font-bold">{startIndex + 1}</span> to{" "}
              <span className="text-slate-900 dark:text-white font-bold">{Math.min(startIndex + itemsPerPage, filteredHotels.length)}</span> of{" "}
              <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">{filteredHotels.length}</span> hotels
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center gap-1.5">
              {/* First Page */}
              <button
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-600 disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-slate-600 transition-all cursor-pointer"
                title="First Page"
              >
                <ChevronsLeft size={16} />
              </button>

              {/* Prev Page */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-600 disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-slate-600 transition-all cursor-pointer"
                title="Previous Page"
              >
                <ChevronLeft size={16} />
              </button>

              {/* Page Number Buttons */}
              <div className="flex items-center gap-1.5 px-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                  .map((p, idx, arr) => {
                    const prevP = arr[idx - 1];
                    const showEllipsis = prevP && p - prevP > 1;

                    return (
                      <div key={p} className="flex items-center gap-1.5">
                        {showEllipsis && (
                          <span className="text-slate-400 font-bold px-1 text-xs">...</span>
                        )}
                        <button
                          onClick={() => handlePageChange(p)}
                          className={`w-9 h-9 rounded-xl font-black text-xs transition-all cursor-pointer ${currentPage === p
                              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 scale-105"
                              : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                            }`}
                        >
                          {p}
                        </button>
                      </div>
                    );
                  })}
              </div>

              {/* Next Page */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-600 disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-slate-600 transition-all cursor-pointer"
                title="Next Page"
              >
                <ChevronRight size={16} />
              </button>

              {/* Last Page */}
              <button
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-600 disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-slate-600 transition-all cursor-pointer"
                title="Last Page"
              >
                <ChevronsRight size={16} />
              </button>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default HotelList;
