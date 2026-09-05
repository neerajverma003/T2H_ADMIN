import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Compass,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  IndianRupee,
  MapPin,
  Loader2,
  Sparkles,
  ExternalLink,
} from "lucide-react";
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

  const { destinationList, fetchDestinationList } = usePlaceStore();

  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const cdnBase = import.meta.env.VITE_CDN_URL?.trim() || "https://media.trip2honeymoon.com";
  const getImagePreviewUrl = (imgKey) => {
    if (!imgKey) return "";
    if (imgKey.startsWith("http://") || imgKey.startsWith("https://")) return imgKey;
    return `${cdnBase}/${imgKey}`;
  };

  // Initial Load
  useEffect(() => {
    fetchActivities(1);
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

  const handleApplyFilters = (e) => {
    e?.preventDefault();
    fetchActivities(1);
  };

  const handleReset = () => {
    resetFilters();
    fetchActivities(1);
  };

  const handleDelete = async (id) => {
    const res = await deleteActivity(id);
    if (res?.success) {
      setDeleteConfirmId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2.5">
            <Compass className="text-blue-600" size={26} />
            Destination Activities Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
            Create, manage and publish things to do and experiences across domestic & international destinations.
          </p>
        </div>

        <button
          onClick={() => navigate("/activities/create")}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg shadow-blue-600/25 transition-all cursor-pointer shrink-0"
        >
          <Plus size={18} />
          <span>Add Activity</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <form onSubmit={handleApplyFilters} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search Input */}
          <div className="relative md:col-span-2">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search by activity title or starting spot..."
              value={filters.search}
              onChange={handleSearchChange}
              className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Destination Type Filter */}
          <div>
            <select
              name="destination_type"
              value={filters.destination_type}
              onChange={handleFilterChange}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- All Territories --</option>
              <option value="domestic">Domestic</option>
              <option value="international">International</option>
            </select>
          </div>

          {/* Visibility Filter (Public / Private) */}
          <div>
            <select
              name="activity_type"
              value={filters.activity_type}
              onChange={handleFilterChange}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- All Visibility --</option>
              <option value="public">Public (Live)</option>
              <option value="private">Private (Hidden)</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- All Status --</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 md:col-span-5 justify-end pt-2">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm hover:opacity-90 transition-all cursor-pointer"
            >
              <Filter size={14} /> Filter
            </button>
          </div>
        </form>
      </div>

      {/* Activities Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3">
            <Loader2 className="animate-spin text-blue-600" size={36} />
            <p className="text-xs font-bold text-slate-400">Loading activities...</p>
          </div>
        ) : activities.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <th className="p-4 pl-6">Activity</th>
                  <th className="p-4">Destination</th>
                  <th className="p-4">Visibility</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs font-medium">
                {activities.map((item) => {
                  const destName =
                    item.selected_destination?.destination_name || "Unknown Destination";
                  const isDom = item.destination_type === "domestic";

                  return (
                    <tr
                      key={item._id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      {/* Image & Title */}
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3.5">
                          <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700">
                            <img
                              src={getImagePreviewUrl(item.cover_image)}
                              alt={item.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = "none";
                              }}
                            />
                          </div>
                          <div>
                            <span className="font-extrabold text-slate-900 dark:text-white line-clamp-1">
                              {item.title}
                            </span>
                            <div className="flex items-center gap-2 mt-1">
                              {item.is_featured && (
                                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase">
                                  <Sparkles size={10} /> Featured
                                </span>
                              )}
                              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                                ★ {item.rating || 4.9} ({item.review_count || 120})
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Destination */}
                      <td className="p-4">
                        <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                          <MapPin size={13} className="text-blue-600" />
                          {destName}
                        </span>
                        <span
                          className={`inline-block mt-0.5 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${isDom
                              ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600"
                              : "bg-purple-50 dark:bg-purple-900/20 text-purple-600"
                            }`}
                        >
                          {item.destination_type}
                        </span>
                      </td>

                      {/* Visibility (Public / Private) */}
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${item.activity_type === "private"
                              ? "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                              : "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 border border-emerald-200/60"
                            }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${item.activity_type === "private" ? "bg-slate-400" : "bg-emerald-500"
                              }`}
                          />
                          <span>{item.activity_type === "private" ? "PRIVATE (DRAFT)" : "PUBLIC (LIVE)"}</span>
                        </span>
                      </td>

                      {/* Pricing */}
                      <td className="p-4">
                        <div className="flex items-baseline gap-1 font-extrabold text-slate-900 dark:text-white">
                          <span>₹{item.pricing?.selling_price?.toLocaleString()}</span>
                          {item.pricing?.original_price > item.pricing?.selling_price && (
                            <span className="text-[10px] line-through text-slate-400 font-normal">
                              ₹{item.pricing.original_price.toLocaleString()}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {item.pricing?.price_unit || "per person"}
                        </span>
                      </td>

                      {/* Status Toggle */}
                      <td className="p-4">
                        <button
                          onClick={() => toggleStatus(item._id)}
                          className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer ${item.status === "active"
                              ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 hover:bg-emerald-100"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-slate-200"
                            }`}
                        >
                          {item.status === "active" ? (
                            <>
                              <CheckCircle2 size={12} /> Active
                            </>
                          ) : (
                            <>
                              <XCircle size={12} /> Inactive
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="p-4 pr-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => navigate(`/activities/edit/${item._id}`)}
                            className="p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors cursor-pointer"
                            title="Edit Activity"
                          >
                            <Edit2 size={15} />
                          </button>

                          {deleteConfirmId === item._id ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleDelete(item._id)}
                                className="px-2.5 py-1 bg-red-600 text-white text-[10px] font-black rounded-lg hover:bg-red-700 cursor-pointer"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="px-2 py-1 text-slate-400 hover:text-slate-600 text-[10px] cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirmId(item._id)}
                              className="p-2 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
                              title="Delete Activity"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-24 text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 mx-auto flex items-center justify-center">
              <Compass size={32} />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-800 dark:text-white uppercase tracking-wider">
                No Activities Found
              </h3>
              <p className="text-xs text-slate-400 font-medium mt-1">
                Start by adding your first destination activity.
              </p>
            </div>
            <button
              onClick={() => navigate("/activities/create")}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md cursor-pointer transition-all"
            >
              Add New Activity
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivitiesList;
