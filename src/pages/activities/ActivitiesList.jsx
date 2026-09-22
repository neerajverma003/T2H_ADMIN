import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Compass,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  MapPin,
  Loader2,
  Sparkles,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  RotateCcw,
  ArrowUpDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useActivityStore } from "../../stores/useActivityStore";
import { usePlaceStore } from "../../stores/usePlaceStore";

const ActivitiesList = () => {
  const navigate = useNavigate();
  const {
    activities,
    isLoading,
    pagination,
    filters,
    setFilters,
    resetFilters,
    fetchActivities,
    deleteActivity,
    toggleStatus,
  } = useActivityStore();

  const { fetchDestinationList } = usePlaceStore();
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [sortOrder, setSortOrder] = useState("newest");
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const cdnBase = import.meta.env.VITE_CDN_URL?.trim() || "https://media.trip2honeymoon.com";
  const getImagePreviewUrl = (imgKey) => {
    if (!imgKey) return "";
    if (imgKey.startsWith("http://") || imgKey.startsWith("https://")) return imgKey;
    return `${cdnBase}/${imgKey}`;
  };

  // Initial Load
  useEffect(() => {
    fetchActivities(1, itemsPerPage, sortOrder);
    fetchDestinationList("domestic");
    fetchDestinationList("international");
  }, []);

  // Handle Search & Filters
  const handleSearchChange = (e) => {
    setFilters({ search: e.target.value });
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ [name]: value });
  };

  const handleSortChange = (newSort) => {
    setSortOrder(newSort);
    fetchActivities(1, itemsPerPage, newSort);
  };

  const handleItemsPerPageChange = (newLimit) => {
    const limitNum = Number(newLimit);
    setItemsPerPage(limitNum);
    fetchActivities(1, limitNum, sortOrder);
  };

  const handleApplyFilters = (e) => {
    e?.preventDefault();
    fetchActivities(1, itemsPerPage, sortOrder);
  };

  const handleReset = () => {
    resetFilters();
    setSortOrder("newest");
    setItemsPerPage(10);
    fetchActivities(1, 10, "newest");
  };

  const handleDelete = async (id) => {
    const res = await deleteActivity(id);
    if (res?.success) {
      setDeleteConfirmId(null);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= (pagination?.totalPages || 1)) {
      fetchActivities(newPage, itemsPerPage, sortOrder);
      const mainEl = document.querySelector("main");
      if (mainEl) {
        mainEl.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  const selectStyle =
    "w-full appearance-none bg-slate-50 dark:bg-[#050A17] hover:bg-white dark:hover:bg-[#080E21] border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 dark:hover:border-indigo-500/50 text-slate-900 dark:text-white text-xs md:text-sm font-bold py-3 pl-4 pr-10 rounded-2xl outline-none focus:ring-1 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all cursor-pointer shadow-inner min-w-0";

  const inputStyle =
    "w-full bg-slate-50 dark:bg-[#050A17] hover:bg-white dark:hover:bg-[#080E21] border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 dark:hover:border-indigo-500/50 text-slate-900 dark:text-white text-xs md:text-sm font-bold py-3 pr-4 rounded-2xl outline-none focus:ring-1 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all shadow-inner placeholder:text-slate-400 placeholder:font-normal";

  const totalCount = pagination?.total ?? activities.length;
  const currentPage = pagination?.page ?? 1;
  const totalPages = Math.max(1, pagination?.totalPages ?? 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto space-y-8 pb-20 font-sans"
    >
      {/* 1. TOP HEADER HUB */}
      <div className="bg-white dark:bg-[#091126] rounded-3xl py-4 sm:py-5 px-6 sm:px-8 border border-slate-200 dark:border-slate-800 shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0">
              <Compass size={22} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2 flex-wrap">
                Destination <span className="text-blue-500">Activities</span>
              </h1>
              <p className="text-slate-500 dark:text-slate-400 font-semibold mt-0.5 text-xs sm:text-sm">
                Create, manage and publish things to do and experiences across domestic & international destinations.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-white dark:bg-[#091126] border border-slate-200 dark:border-slate-800 rounded-2xl px-6 py-2.5 flex flex-col items-center justify-center min-w-[125px] shadow-sm">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Found</span>
              <span className="text-2xl font-black text-slate-900 dark:text-white leading-tight mt-0.5">{totalCount}</span>
            </div>
            <button
              type="button"
              onClick={() => navigate("/activities/create")}
              className="flex items-center gap-2.5 px-7 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-xs shadow-sm uppercase tracking-wider transition-all cursor-pointer active:scale-[0.98] shrink-0"
            >
              <Plus size={16} strokeWidth={2.5} /> Add Activity
            </button>
          </div>
        </div>
      </div>

      {/* 2. FILTERS & SEARCH TOOLBAR CARD */}
      <div className="bg-white dark:bg-[#091126] rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 relative z-20">
        <form onSubmit={handleApplyFilters} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search Input */}
            <div className="relative sm:col-span-2 lg:col-span-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
              <input
                type="text"
                placeholder="Search by activity title or starting spot..."
                value={filters.search}
                onChange={handleSearchChange}
                className={`${inputStyle} pl-11`}
              />
            </div>

            {/* Destination Type / Territory Filter */}
            <div className="relative">
              <select
                name="destination_type"
                value={filters.destination_type}
                onChange={handleFilterChange}
                className={selectStyle}
              >
                <option value="" className="bg-white dark:bg-[#050A17] text-slate-900 dark:text-white">-- All Territories --</option>
                <option value="domestic" className="bg-white dark:bg-[#050A17] text-slate-900 dark:text-white">Domestic</option>
                <option value="international" className="bg-white dark:bg-[#050A17] text-slate-900 dark:text-white">International</option>
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            </div>

            {/* Visibility Filter (Public / Private) */}
            <div className="relative">
              <select
                name="activity_type"
                value={filters.activity_type}
                onChange={handleFilterChange}
                className={selectStyle}
              >
                <option value="" className="bg-white dark:bg-[#050A17] text-slate-900 dark:text-white">-- All Visibility --</option>
                <option value="public" className="bg-white dark:bg-[#050A17] text-slate-900 dark:text-white">Public (Live)</option>
                <option value="private" className="bg-white dark:bg-[#050A17] text-slate-900 dark:text-white">Private (Hidden)</option>
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className={selectStyle}
              >
                <option value="" className="bg-white dark:bg-[#050A17] text-slate-900 dark:text-white">-- All Status --</option>
                <option value="active" className="bg-white dark:bg-[#050A17] text-slate-900 dark:text-white">Active</option>
                <option value="inactive" className="bg-white dark:bg-[#050A17] text-slate-900 dark:text-white">Inactive</option>
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800/80">
            {/* Left: Filter Buttons */}
            <div className="flex items-center gap-2.5">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-blue-600/25 hover:shadow-blue-600/35 transition-all cursor-pointer active:scale-[0.98]"
              >
                <Filter size={14} /> Filter
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all cursor-pointer"
              >
                <RotateCcw size={14} /> Reset Filters
              </button>
            </div>

            {/* Right: Sort & Per-Page Controls */}
            <div className="flex flex-wrap items-center gap-4 shrink-0">
              {/* Sort Dropdown (New / Old) */}
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-xs flex items-center gap-1.5 shrink-0">
                  <ArrowUpDown size={14} className="text-indigo-400" /> Sort:
                </span>
                <div className="relative">
                  <select
                    value={sortOrder}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="appearance-none bg-slate-50 dark:bg-[#050A17] hover:bg-white dark:hover:bg-[#080E21] border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 dark:hover:border-indigo-500/50 text-slate-900 dark:text-white text-xs md:text-sm font-bold py-2.5 pl-3.5 pr-9 rounded-2xl outline-none focus:ring-1 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all cursor-pointer shadow-inner min-w-[150px]"
                  >
                    <option value="newest" className="bg-white dark:bg-[#050A17] text-slate-900 dark:text-white">New Activity</option>
                    <option value="oldest" className="bg-white dark:bg-[#050A17] text-slate-900 dark:text-white">Old Activity</option>
                  </select>
                  <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Per-Page Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-xs shrink-0">
                  Per Page:
                </span>
                <div className="relative">
                  <select
                    value={itemsPerPage}
                    onChange={(e) => handleItemsPerPageChange(e.target.value)}
                    className="appearance-none bg-slate-50 dark:bg-[#050A17] hover:bg-white dark:hover:bg-[#080E21] border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 dark:hover:border-indigo-500/50 text-slate-900 dark:text-white text-xs md:text-sm font-bold py-2.5 pl-3.5 pr-9 rounded-2xl outline-none focus:ring-1 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all cursor-pointer shadow-inner min-w-[130px]"
                  >
                    <option value={10} className="bg-white dark:bg-[#050A17] text-slate-900 dark:text-white">10 / page</option>
                    <option value={20} className="bg-white dark:bg-[#050A17] text-slate-900 dark:text-white">20 / page</option>
                    <option value={50} className="bg-white dark:bg-[#050A17] text-slate-900 dark:text-white">50 / page</option>
                    <option value={1000} className="bg-white dark:bg-[#050A17] text-slate-900 dark:text-white">All Activities</option>
                  </select>
                  <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* 3. ACTIVITIES TABLE CONTAINER */}
      <div className="bg-white dark:bg-[#091126]/95 rounded-3xl border border-slate-200/90 dark:border-indigo-500/25 shadow-xl dark:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.7),0_0_30px_2px_rgba(99,102,241,0.18)] ring-1 ring-slate-900/5 dark:ring-white/5 backdrop-blur-xl overflow-hidden">
        {isLoading ? (
          <div className="py-32 flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-blue-500" size={44} strokeWidth={2} />
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Loading activities...</p>
          </div>
        ) : activities.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/90 dark:border-slate-800/90 bg-slate-50/80 dark:bg-[#050A17]/80 text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
                  <th className="py-4 px-6">Activity</th>
                  <th className="py-4 px-4">Destination</th>
                  <th className="py-4 px-4">Visibility</th>
                  <th className="py-4 px-4">Price</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs font-medium">
                {activities.map((item) => {
                  const destName =
                    item.selected_destination?.destination_name || "Unknown Destination";
                  const isDom = item.destination_type === "domestic";
                  const coverUrl = getImagePreviewUrl(item.cover_image);

                  return (
                    <tr
                      key={item._id}
                      className="hover:bg-slate-50/60 dark:hover:bg-indigo-950/20 transition-all group"
                    >
                      {/* Activity & Thumbnail */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 dark:bg-[#050A17] shrink-0 border border-slate-200/90 dark:border-indigo-500/20 shadow-inner relative flex items-center justify-center">
                            {coverUrl ? (
                              <img
                                src={coverUrl}
                                alt={item.title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                onError={(e) => {
                                  e.target.style.display = "none";
                                  const fallback = e.target.nextElementSibling;
                                  if (fallback) fallback.style.display = "flex";
                                }}
                              />
                            ) : null}
                            <div
                              style={{ display: coverUrl ? "none" : "flex" }}
                              className="w-full h-full items-center justify-center text-indigo-400/50"
                            >
                              <Compass size={22} />
                            </div>
                          </div>
                          <div>
                            <span className="font-extrabold text-slate-900 dark:text-white text-sm line-clamp-1 group-hover:text-blue-500 transition-colors">
                              {item.title}
                            </span>
                            <div className="flex items-center gap-2 mt-1">
                              {item.is_featured && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25 text-[10px] font-black uppercase">
                                  <Sparkles size={10} /> Featured
                                </span>
                              )}
                              <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                                ★ {item.rating || 4.9} ({item.review_count || 120})
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Destination */}
                      <td className="py-4 px-4">
                        <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 text-sm">
                          <MapPin size={14} className="text-blue-500 shrink-0" />
                          {destName}
                        </span>
                        <span
                          className={`inline-block mt-1 px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider border ${
                            isDom
                              ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/25"
                              : "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/25"
                          }`}
                        >
                          {item.destination_type}
                        </span>
                      </td>

                      {/* Visibility (Public / Private) */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-extrabold tracking-wider border ${
                            item.activity_type === "private"
                              ? "bg-slate-500/10 text-slate-600 dark:text-slate-300 border-slate-500/25"
                              : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              item.activity_type === "private"
                                ? "bg-slate-400"
                                : "bg-emerald-500 shadow-xs shadow-emerald-500"
                            }`}
                          />
                          <span>{item.activity_type === "private" ? "PRIVATE (DRAFT)" : "PUBLIC (LIVE)"}</span>
                        </span>
                      </td>

                      {/* Pricing */}
                      <td className="py-4 px-4">
                        <div className="flex items-baseline gap-1.5 font-extrabold text-slate-900 dark:text-white text-sm">
                          <span>₹{item.pricing?.selling_price?.toLocaleString() || 0}</span>
                          {item.pricing?.original_price > item.pricing?.selling_price && (
                            <span className="text-[11px] line-through text-slate-400 font-normal">
                              ₹{item.pricing.original_price.toLocaleString()}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {item.pricing?.price_unit || "per person"}
                        </span>
                      </td>

                      {/* Status Toggle */}
                      <td className="py-4 px-4">
                        <button
                          type="button"
                          onClick={() => toggleStatus(item._id)}
                          className={`px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 border transition-all cursor-pointer ${
                            item.status === "active"
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                              : "bg-slate-500/10 text-slate-500 dark:text-slate-400 border-slate-500/25 hover:bg-slate-500/20"
                          }`}
                        >
                          {item.status === "active" ? (
                            <>
                              <CheckCircle2 size={12} className="text-emerald-500" /> Active
                            </>
                          ) : (
                            <>
                              <XCircle size={12} className="text-slate-400" /> Inactive
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => navigate(`/activities/edit/${item._id}`)}
                            className="size-9 rounded-xl bg-blue-500/10 hover:bg-blue-600 text-blue-600 dark:text-blue-400 hover:text-white border border-blue-500/20 flex items-center justify-center transition-all cursor-pointer shadow-xs"
                            title="Edit Activity"
                          >
                            <Edit2 size={15} />
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(item._id)}
                            className="size-9 rounded-xl bg-red-500/10 hover:bg-red-600 text-red-600 dark:text-red-400 hover:text-white border border-red-500/20 flex items-center justify-center transition-all cursor-pointer shadow-xs"
                            title="Delete Activity"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-32 text-center space-y-4 px-6">
            <div className="w-16 h-16 rounded-3xl bg-blue-500/10 border border-blue-500/20 text-blue-500 mx-auto flex items-center justify-center shadow-lg shadow-blue-500/10">
              <Compass size={32} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                No Activities Found
              </h3>
              <p className="text-xs text-slate-400 font-medium mt-1 max-w-sm mx-auto">
                No destination activities match the current filters. Try resetting filters or adding a new activity.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate("/activities/create")}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-600/25 cursor-pointer transition-all active:scale-[0.98]"
            >
              <Plus size={16} strokeWidth={2.5} /> Add New Activity
            </button>
          </div>
        )}

        {/* 4. PAGINATION BAR */}
        {!isLoading && totalCount > 0 && (
          <div className="p-6 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50 dark:bg-[#050A17]/50">
            <div className="text-xs font-bold text-slate-400">
              Showing page <span className="text-slate-900 dark:text-white font-extrabold">{currentPage}</span> of{" "}
              <span className="text-slate-900 dark:text-white font-extrabold">{totalPages}</span> ({totalCount} total activities)
            </div>

            {totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#050A17] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-blue-500/50 dark:hover:border-indigo-500/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer shadow-inner"
                  title="First Page"
                >
                  <ChevronsLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#050A17] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-blue-500/50 dark:hover:border-indigo-500/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer shadow-inner"
                  title="Previous Page"
                >
                  <ChevronLeft size={16} />
                </button>

                <div className="flex items-center gap-1 px-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                    .map((p, idx, arr) => (
                      <React.Fragment key={p}>
                        {idx > 0 && p - arr[idx - 1] > 1 && (
                          <span className="px-1 text-slate-500 text-xs">...</span>
                        )}
                        <button
                          type="button"
                          onClick={() => handlePageChange(p)}
                          className={`size-9 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center ${
                            currentPage === p
                              ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 ring-2 ring-blue-500/40"
                              : "border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#050A17] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-blue-500/40"
                          }`}
                        >
                          {p}
                        </button>
                      </React.Fragment>
                    ))}
                </div>

                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#050A17] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-blue-500/50 dark:hover:border-indigo-500/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer shadow-inner"
                  title="Next Page"
                >
                  <ChevronRight size={16} />
                </button>
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
        )}
      </div>

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
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">Delete Activity?</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed mb-6">
                This action cannot be undone. The activity will be permanently removed from all listings.
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

export default ActivitiesList;
