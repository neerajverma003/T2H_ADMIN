import { useEffect, useState, useMemo } from "react";
import {
  Building2,
  MapPin,
  Star,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Sparkles,
  CheckCircle2,
  XCircle,
  IndianRupee,
  Phone,
  Mail,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Filter,
  ChevronDown,
  AlertCircle,
  ExternalLink,
  ArrowUpDown
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../../stores/authStores";
import { getCdnUrl } from "../../utils/media";
import { motion, AnimatePresence } from "framer-motion";
import useAuthStore from "../../stores/authStores";

const TIER_BADGES = {
  Standard: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30",
  Deluxe: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30",
  "Super Deluxe": "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30",
  Luxury: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
};

const FALLBACK_HOTEL_IMAGES = [
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1561501900-3701fa6a0864?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?q=80&w=800&auto=format&fit=crop"
];

const HotelList = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Search, Filter & Pagination States
  const [searchQuery, setSearchQuery] = useState("");
  const [tierFilter, setTierFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [sortOrder, setSortOrder] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(9);

  const navigate = useNavigate();
  const role = useAuthStore((s) => s.role);

  const fetchHotels = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiClient.get("/admin/hotel/all");
      setData(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.msg || "Something went wrong");
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

  useEffect(() => {
    fetchHotels();
  }, []);

  // Filtered & Sorted calculation
  const filteredHotels = useMemo(() => {
    return data
      .filter((hotel) => {
        const q = searchQuery.trim().toLowerCase();
        const destName = hotel.destination?.destination_name || "";
        const matchesSearch =
          !q ||
          (hotel.name && hotel.name.toLowerCase().includes(q)) ||
          (hotel.city_name && hotel.city_name.toLowerCase().includes(q)) ||
          (destName && destName.toLowerCase().includes(q)) ||
          (hotel.country_name && hotel.country_name.toLowerCase().includes(q)) ||
          (hotel.category && hotel.category.toLowerCase().includes(q));

        const matchesTier = tierFilter === "All" || hotel.hotel_tier === tierFilter;
        const matchesCategory = categoryFilter === "All" || hotel.category === categoryFilter;

        const matchesStatus =
          statusFilter === "All" ||
          (statusFilter === "Live" && hotel.is_active) ||
          (statusFilter === "Offline" && !hotel.is_active);

        return matchesSearch && matchesTier && matchesCategory && matchesStatus;
      })
      .sort((a, b) => {
        if (sortOrder === "oldest") return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      });
  }, [data, searchQuery, tierFilter, categoryFilter, statusFilter, sortOrder]);

  // Reset to page 1 when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, tierFilter, categoryFilter, statusFilter, sortOrder, itemsPerPage]);

  const effectiveItemsPerPage =
    itemsPerPage >= filteredHotels.length && filteredHotels.length > 0 && itemsPerPage > 27
      ? filteredHotels.length
      : itemsPerPage;

  const totalPages = Math.max(1, Math.ceil(filteredHotels.length / effectiveItemsPerPage));
  const startIndex = (currentPage - 1) * effectiveItemsPerPage;
  const paginatedHotels = filteredHotels.slice(startIndex, startIndex + effectiveItemsPerPage);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const renderStars = (rating) => (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={12}
          className={`${
            i < (rating || 3)
              ? "text-amber-400 fill-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.5)]"
              : "text-slate-300 dark:text-slate-700"
          }`}
        />
      ))}
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8 pb-20 font-sans"
    >
      {/* 1. TOP HEADER HUB */}
      <div className="bg-white dark:bg-[#091126]/95 rounded-3xl py-4 sm:py-5 px-6 sm:px-8 border border-slate-200/90 dark:border-indigo-500/25 shadow-xl dark:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.7),0_0_30px_2px_rgba(99,102,241,0.18)] ring-1 ring-slate-900/5 dark:ring-white/5 backdrop-blur-xl relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-blue-500/10 dark:bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-indigo-500/10 dark:bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-500/30 shrink-0">
              <Building2 size={22} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2 flex-wrap">
                Hotel <span className="text-blue-500">Registry</span>
              </h1>
              <p className="text-slate-500 dark:text-slate-400 font-semibold mt-0.5 text-xs sm:text-sm">
                Browse, filter, and manage luxury hotel properties and partner accommodation tiers.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Total Found Metric */}
            <div className="bg-white dark:bg-[#091126]/95 border border-slate-200 dark:border-slate-800/90 rounded-2xl px-6 py-2.5 flex flex-col items-center justify-center min-w-[125px] shadow-inner ring-1 ring-slate-900/5 dark:ring-white/5">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Hotels</span>
              <span className="text-2xl font-black text-slate-900 dark:text-white leading-tight mt-0.5">{filteredHotels.length}</span>
            </div>

            {/* Add New Hotel Button */}
            <button
              type="button"
              onClick={() => navigate("/hotels/create")}
              className="flex items-center gap-2.5 px-7 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-xs shadow-xl shadow-blue-600/30 uppercase tracking-wider transition-all cursor-pointer active:scale-[0.98]"
            >
              <Plus size={16} strokeWidth={2.5} /> Add New Hotel
            </button>
          </div>
        </div>
      </div>

      {/* 2. SEARCH & FILTERS TOOLBAR CARD */}
      <div className="bg-white dark:bg-[#091126]/95 rounded-3xl p-5 md:p-6 border border-slate-200/90 dark:border-indigo-500/25 shadow-xl dark:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.7),0_0_30px_2px_rgba(99,102,241,0.18)] ring-1 ring-slate-900/5 dark:ring-white/5 backdrop-blur-xl space-y-4 relative z-30">
        {/* ROW 1: Spacious Search Input & Sort Order */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search hotel by name, destination, city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 dark:border-slate-800/90 bg-slate-50 dark:bg-[#050A17] pl-11 pr-4 py-3.5 text-sm font-semibold text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 placeholder:font-normal shadow-inner"
            />
          </div>

          {/* Sort Order on Row 1 for quick access */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-slate-400 font-bold uppercase tracking-wider text-xs flex items-center gap-1.5 shrink-0">
              <ArrowUpDown size={14} className="text-indigo-400" /> Sort:
            </span>
            <div className="relative">
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="appearance-none bg-slate-50 dark:bg-[#050A17] hover:bg-white dark:hover:bg-[#080E21] border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 dark:hover:border-indigo-500/50 text-slate-900 dark:text-white text-xs font-bold py-3 pl-4 pr-9 rounded-2xl outline-none focus:ring-1 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all cursor-pointer shadow-inner min-w-[135px]"
              >
                <option value="newest" className="bg-white dark:bg-[#050A17] text-slate-900 dark:text-white">Newest First</option>
                <option value="oldest" className="bg-white dark:bg-[#050A17] text-slate-900 dark:text-white">Oldest First</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* ROW 2: Filters Below (Tier, Scope, Status, Per Page, and Reset) */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex flex-wrap items-center gap-3">
            {/* Tier Filter */}
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-xs flex items-center gap-1.5 shrink-0">
                <Sparkles size={14} className="text-indigo-400" /> Tier:
              </span>
              <div className="relative">
                <select
                  value={tierFilter}
                  onChange={(e) => setTierFilter(e.target.value)}
                  className="appearance-none bg-slate-50 dark:bg-[#050A17] hover:bg-white dark:hover:bg-[#080E21] border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 dark:hover:border-indigo-500/50 text-slate-900 dark:text-white text-xs font-bold py-2.5 pl-4 pr-9 rounded-2xl outline-none focus:ring-1 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all cursor-pointer shadow-inner min-w-[130px]"
                >
                  <option value="All" className="bg-white dark:bg-[#050A17] text-slate-900 dark:text-white">All Tiers</option>
                  <option value="Standard" className="bg-white dark:bg-[#050A17] text-slate-900 dark:text-white">Standard</option>
                  <option value="Deluxe" className="bg-white dark:bg-[#050A17] text-slate-900 dark:text-white">Deluxe</option>
                  <option value="Super Deluxe" className="bg-white dark:bg-[#050A17] text-slate-900 dark:text-white">Super Deluxe</option>
                  <option value="Luxury" className="bg-white dark:bg-[#050A17] text-slate-900 dark:text-white">Luxury</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Scope Filter */}
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-xs flex items-center gap-1.5 shrink-0">
                <Filter size={14} className="text-indigo-400" /> Scope:
              </span>
              <div className="relative">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="appearance-none bg-slate-50 dark:bg-[#050A17] hover:bg-white dark:hover:bg-[#080E21] border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 dark:hover:border-indigo-500/50 text-slate-900 dark:text-white text-xs font-bold py-2.5 pl-4 pr-9 rounded-2xl outline-none focus:ring-1 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all cursor-pointer shadow-inner min-w-[130px]"
                >
                  <option value="All" className="bg-white dark:bg-[#050A17] text-slate-900 dark:text-white">All Scopes</option>
                  <option value="domestic" className="bg-white dark:bg-[#050A17] text-slate-900 dark:text-white">Domestic</option>
                  <option value="international" className="bg-white dark:bg-[#050A17] text-slate-900 dark:text-white">International</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-xs shrink-0">
                Status:
              </span>
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none bg-slate-50 dark:bg-[#050A17] hover:bg-white dark:hover:bg-[#080E21] border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 dark:hover:border-indigo-500/50 text-slate-900 dark:text-white text-xs font-bold py-2.5 pl-4 pr-9 rounded-2xl outline-none focus:ring-1 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all cursor-pointer shadow-inner min-w-[125px]"
                >
                  <option value="All" className="bg-white dark:bg-[#050A17] text-slate-900 dark:text-white">All Status</option>
                  <option value="Live" className="bg-white dark:bg-[#050A17] text-slate-900 dark:text-white">Live</option>
                  <option value="Offline" className="bg-white dark:bg-[#050A17] text-slate-900 dark:text-white">Offline</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Per Page Filter */}
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-xs shrink-0">
                Per Page:
              </span>
              <div className="relative">
                <select
                  value={itemsPerPage >= filteredHotels.length && filteredHotels.length > 0 && itemsPerPage > 27 ? "all" : itemsPerPage}
                  onChange={(e) => {
                    if (e.target.value === "all") {
                      setItemsPerPage(filteredHotels.length > 0 ? filteredHotels.length : 1000);
                    } else {
                      setItemsPerPage(Number(e.target.value));
                    }
                  }}
                  className="appearance-none bg-slate-50 dark:bg-[#050A17] hover:bg-white dark:hover:bg-[#080E21] border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 dark:hover:border-indigo-500/50 text-slate-900 dark:text-white text-xs font-bold py-2.5 pl-4 pr-9 rounded-2xl outline-none focus:ring-1 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all cursor-pointer shadow-inner min-w-[115px]"
                >
                  <option value={6} className="bg-white dark:bg-[#050A17] text-slate-900 dark:text-white">6 / page</option>
                  <option value={9} className="bg-white dark:bg-[#050A17] text-slate-900 dark:text-white">9 / page</option>
                  <option value={12} className="bg-white dark:bg-[#050A17] text-slate-900 dark:text-white">12 / page</option>
                  <option value={18} className="bg-white dark:bg-[#050A17] text-slate-900 dark:text-white">18 / page</option>
                  <option value={27} className="bg-white dark:bg-[#050A17] text-slate-900 dark:text-white">27 / page</option>
                  <option value="all" className="bg-white dark:bg-[#050A17] text-slate-900 dark:text-white">All Hotels</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Clear Filters Button (when active) */}
            {(searchQuery || tierFilter !== "All" || categoryFilter !== "All" || statusFilter !== "All") && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setTierFilter("All");
                  setCategoryFilter("All");
                  setStatusFilter("All");
                }}
                className="text-xs font-bold text-slate-500 hover:text-rose-500 dark:text-slate-400 dark:hover:text-rose-400 uppercase tracking-wider transition-colors px-2 py-1 cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. HOTELS CONTENT GRID (3 Columns for spacious luxury layout) */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-40 gap-6">
          <div className="size-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shadow-lg shadow-blue-500/10">
            <Loader2 className="animate-spin text-blue-500" size={36} strokeWidth={2} />
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400">Loading Hotels...</p>
        </div>
      ) : error ? (
        <div className="bg-white dark:bg-[#091126]/95 rounded-3xl p-12 text-center border border-red-500/30 ring-1 ring-red-500/10 shadow-2xl">
          <AlertCircle className="mx-auto mb-3 text-red-500 dark:text-red-400" size={44} />
          <p className="text-red-500 dark:text-red-400 font-bold text-sm">{error}</p>
        </div>
      ) : filteredHotels.length === 0 ? (
        <div className="bg-white dark:bg-[#091126]/95 rounded-3xl p-16 text-center border border-slate-200/90 dark:border-slate-800/90 shadow-2xl space-y-4">
          <Sparkles className="mx-auto text-slate-400 dark:text-slate-600" size={54} strokeWidth={1.5} />
          <p className="text-slate-800 dark:text-slate-300 font-bold text-base">No matching hotels found</p>
          <p className="text-slate-500 dark:text-slate-400 text-xs max-w-sm mx-auto">
            Try adjusting your search query or filter tags to discover listed hotel assets.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setTierFilter("All");
              setCategoryFilter("All");
              setStatusFilter("All");
            }}
            className="mt-2 inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#050A17] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold text-xs uppercase tracking-wider hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all cursor-pointer shadow-sm"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <>
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {paginatedHotels.map((hotel, idx) => {
                const {
                  _id,
                  name,
                  city_name,
                  country_name,
                  images,
                  thumbnail,
                  star_rating,
                  price_per_night,
                  is_active,
                  is_featured,
                  hotel_tier,
                  category,
                  email,
                  contact_number,
                  hotel_website_link,
                  destination
                } = hotel;

                const rawImg = thumbnail || images?.[0];
                const fallbackImg = FALLBACK_HOTEL_IMAGES[idx % FALLBACK_HOTEL_IMAGES.length];
                const imageUrl = (rawImg ? getCdnUrl(rawImg) : null) || fallbackImg;

                const destName = destination?.destination_name || "";
                const locationText = [city_name, destName, country_name].filter(Boolean).join(", ");

                return (
                  <motion.div
                    key={_id}
                    layout
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.92 }}
                    className="group bg-white dark:bg-[#091126]/95 rounded-3xl border border-slate-200/90 dark:border-slate-800/90 hover:border-blue-500/50 dark:hover:border-indigo-500/50 shadow-xl dark:shadow-black/40 hover:shadow-2xl transition-all duration-300 flex flex-col overflow-hidden ring-1 ring-slate-900/5 dark:ring-white/5"
                  >
                    {/* HERO IMAGE */}
                    <div
                      onClick={() => navigate(`/hotels/edit/${_id}`)}
                      className="relative aspect-[16/11] w-full overflow-hidden shrink-0 bg-slate-100 dark:bg-[#050A17] border-b border-slate-200 dark:border-slate-800/90 cursor-pointer"
                    >
                      <img
                        src={imageUrl}
                        alt={name}
                        onError={(e) => {
                          e.target.src = fallbackImg;
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/25 pointer-events-none" />

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {/* Live / Offline Status */}
                          <span
                            className={`px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider border backdrop-blur-md flex items-center gap-1.5 shadow ${
                              is_active
                                ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400"
                                : "bg-slate-900/80 border-slate-700/60 text-slate-300"
                            }`}
                          >
                            <span
                              className={`size-1.5 rounded-full ${
                                is_active ? "bg-emerald-400 animate-pulse" : "bg-slate-400"
                              }`}
                            />
                            {is_active ? "Live" : "Offline"}
                          </span>

                          {/* Featured Badge */}
                          {is_featured && (
                            <span className="flex items-center gap-1 bg-amber-500/20 border border-amber-500/30 text-amber-400 px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider backdrop-blur-md shadow">
                              <Sparkles size={10} /> Featured
                            </span>
                          )}
                        </div>

                        {/* Scope (Domestic/International) */}
                        <span className="px-2.5 py-1 rounded-xl text-[10px] font-extrabold uppercase tracking-wider bg-black/60 border border-white/10 text-white backdrop-blur-md shadow capitalize">
                          {category || "domestic"}
                        </span>
                      </div>
                    </div>

                    {/* BODY INFO */}
                    <div className="p-5 flex-1 flex flex-col space-y-3.5">
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          {/* Hotel Tier Pill */}
                          <span
                            className={`px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider border ${
                              TIER_BADGES[hotel_tier] ||
                              "bg-slate-500/10 text-slate-500 border-slate-500/20"
                            }`}
                          >
                            {hotel_tier || "Standard"}
                          </span>

                          {/* Star Rating */}
                          {renderStars(star_rating)}
                        </div>

                        <h2
                          onClick={() => navigate(`/hotels/edit/${_id}`)}
                          className="text-sm font-extrabold text-slate-900 dark:text-white leading-snug truncate group-hover:text-blue-600 dark:group-hover:text-indigo-400 transition-colors cursor-pointer"
                          title={name}
                        >
                          {name}
                        </h2>

                        {locationText && (
                          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs font-medium truncate mt-1 capitalize">
                            <MapPin size={12} className="text-blue-500 shrink-0" />
                            <span className="truncate">{locationText}</span>
                          </div>
                        )}
                      </div>

                      {/* Pricing & Website */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
                        <div>
                          {price_per_night > 0 ? (
                            <div className="flex items-center text-slate-900 dark:text-white font-extrabold text-sm">
                              <span className="text-blue-600 dark:text-indigo-400 mr-0.5">₹</span>
                              {Number(price_per_night).toLocaleString("en-IN")}
                              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider ml-1">
                                / night
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                              Partner Rate
                            </span>
                          )}
                        </div>

                        {hotel_website_link && (
                          <a
                            href={
                              hotel_website_link.startsWith("http")
                                ? hotel_website_link
                                : `https://${hotel_website_link}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-bold text-blue-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                            title="Visit website"
                          >
                            Website <ExternalLink size={11} />
                          </a>
                        )}
                      </div>

                      {/* Contact metadata if available */}
                      {(email || contact_number) && (
                        <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                          {email && (
                            <div className="flex items-center gap-1.5 truncate">
                              <Mail size={12} className="text-slate-400 shrink-0" />
                              <span className="truncate">{email}</span>
                            </div>
                          )}
                          {contact_number && (
                            <div className="flex items-center gap-1.5 truncate">
                              <Phone size={12} className="text-slate-400 shrink-0" />
                              <span className="truncate">{contact_number}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* FOOTER ACTIONS */}
                    <div className="p-3 bg-slate-50/80 dark:bg-[#050A17] border-t border-slate-100 dark:border-slate-800/90 flex items-center justify-between gap-2">
                      {/* Edit Button */}
                      <button
                        type="button"
                        onClick={() => navigate(`/hotels/edit/${_id}`)}
                        className="flex-1 flex items-center justify-center py-2 px-3 bg-white dark:bg-[#080E21] hover:bg-indigo-50 dark:hover:bg-indigo-600/20 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/40 rounded-xl text-xs font-bold transition-all shadow-inner cursor-pointer"
                        title="Edit Hotel"
                      >
                        <Pencil size={14} />
                      </button>

                      {/* Toggle Active Status */}
                      <button
                        type="button"
                        onClick={() => handleToggleActive(hotel)}
                        className={`flex-1 flex items-center justify-center py-2 px-3 rounded-xl text-xs font-bold transition-all shadow-inner cursor-pointer border ${
                          is_active
                            ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30 hover:bg-emerald-100 dark:hover:bg-emerald-950/60"
                            : "bg-slate-100 dark:bg-[#080E21] text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-800/40"
                        }`}
                        title={is_active ? "Mark as Offline" : "Publish to Live"}
                      >
                        <CheckCircle2 size={14} />
                      </button>

                      {/* Delete Button (superadmin) */}
                      {role === "superadmin" && (
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(_id)}
                          className="flex-1 flex items-center justify-center py-2 px-3 bg-white dark:bg-[#080E21] hover:bg-rose-50 dark:hover:bg-rose-600/20 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-200 dark:border-slate-800 hover:border-rose-500/40 rounded-xl text-xs font-bold transition-all shadow-inner cursor-pointer"
                          title="Delete Hotel"
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

          {/* 4. PAGINATION CONTROLS BAR */}
          <div className="bg-white dark:bg-[#091126]/95 rounded-3xl p-5 md:p-6 border border-slate-200/90 dark:border-indigo-500/25 shadow-xl dark:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.7),0_0_30px_2px_rgba(99,102,241,0.18)] ring-1 ring-slate-900/5 dark:ring-white/5 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Showing <span className="text-slate-900 dark:text-white font-extrabold">{startIndex + 1}</span> to{" "}
              <span className="text-slate-900 dark:text-white font-extrabold">
                {Math.min(startIndex + effectiveItemsPerPage, filteredHotels.length)}
              </span>{" "}
              of <span className="text-blue-500 font-extrabold">{filteredHotels.length}</span> hotels
            </div>

            {totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                {/* First Page */}
                <button
                  type="button"
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#050A17] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-blue-500/50 dark:hover:border-indigo-500/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer shadow-inner"
                  title="First Page"
                >
                  <ChevronsLeft size={16} />
                </button>

                {/* Prev Page */}
                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#050A17] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-blue-500/50 dark:hover:border-indigo-500/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer shadow-inner"
                  title="Previous Page"
                >
                  <ChevronLeft size={16} />
                </button>

                {/* Page Number Buttons */}
                <div className="flex items-center gap-1.5 px-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                    .map((p, idx, arr) => {
                      const prevP = arr[idx - 1];
                      const showEllipsis = prevP && p - prevP > 1;

                      return (
                        <div key={p} className="flex items-center gap-1.5">
                          {showEllipsis && (
                            <span className="text-slate-400 dark:text-slate-500 font-bold px-1 text-xs">...</span>
                          )}
                          <button
                            type="button"
                            onClick={() => handlePageChange(p)}
                            className={`w-9 h-9 rounded-xl font-black text-xs transition-all cursor-pointer ${
                              currentPage === p
                                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 scale-105"
                                : "bg-white dark:bg-[#050A17] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-blue-500/40"
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
                  type="button"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#050A17] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-blue-500/50 dark:hover:border-indigo-500/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer shadow-inner"
                  title="Next Page"
                >
                  <ChevronRight size={16} />
                </button>

                {/* Last Page */}
                <button
                  type="button"
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#050A17] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-blue-500/50 dark:hover:border-indigo-500/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer shadow-inner"
                  title="Last Page"
                >
                  <ChevronsRight size={16} />
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* 5. DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {deleteConfirmId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
            onClick={() => setDeleteConfirmId(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-[#091126] border border-red-500/30 rounded-3xl p-8 shadow-2xl max-w-sm w-full text-center ring-1 ring-slate-900/10 dark:ring-white/10"
            >
              <div className="size-14 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-red-500/10">
                <Trash2 className="text-red-500 dark:text-red-400" size={26} />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">Delete Hotel?</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed mb-6">
                This action cannot be undone. The hotel property will be permanently removed from the registry.
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-[#050A17] border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(deleteConfirmId)}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:opacity-95 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-red-600/30 cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default HotelList;
