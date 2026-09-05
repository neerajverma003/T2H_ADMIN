import React, { useEffect, useState, useRef, useMemo } from "react";
import {
  Compass,
  MapPin,
  Star,
  Users,
  Sparkles,
  CheckCircle2,
  Eye,
  EyeOff,
  ChevronDown,
  Check,
  Search,
  Loader2,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePlaceStore } from "../../../stores/usePlaceStore";

export const ActivityCoreDetailsSection = ({
  formData,
  handleInputChange,
  styles,
  errors = {},
}) => {
  const { cardStyle, labelStyle, inputStyle } = styles;
  const { destinationList, fetchDestinationList, isListLoading } = usePlaceStore();

  const [isDestOpen, setIsDestOpen] = useState(false);
  const [destSearch, setDestSearch] = useState("");
  const destDropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Fetch destinations whenever destination_type changes
  useEffect(() => {
    if (formData.destination_type) {
      fetchDestinationList(formData.destination_type);
    }
  }, [formData.destination_type, fetchDestinationList]);

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (destDropdownRef.current && !destDropdownRef.current.contains(e.target)) {
        setIsDestOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsDestOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // When territory changes (domestic <-> international), reset search & close dropdown
  useEffect(() => {
    setDestSearch("");
    setIsDestOpen(false);
  }, [formData.destination_type]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isDestOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isDestOpen]);

  // Selected destination object
  const selectedDestObj = useMemo(() => {
    if (!formData.selected_destination) return null;
    return destinationList.find((d) => d._id === formData.selected_destination) || null;
  }, [destinationList, formData.selected_destination]);

  // Filtered destination list based on search
  const filteredDestinations = useMemo(() => {
    if (!destSearch.trim()) return destinationList;
    const term = destSearch.toLowerCase().trim();
    return destinationList.filter((d) =>
      (d.destination_name || "").toLowerCase().includes(term)
    );
  }, [destinationList, destSearch]);

  const handleDestinationTypeChange = (type) => {
    handleInputChange({ target: { name: "destination_type", value: type } });
    handleInputChange({ target: { name: "selected_destination", value: "" } });
  };

  return (
    <div className={cardStyle}>
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100 dark:border-slate-800">
        <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <Compass className="text-blue-600 dark:text-blue-400" size={22} />
          Core Activity Details
        </h2>
        <div className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-[11px] font-black uppercase tracking-widest">
          Destination & Type
        </div>
      </div>

      <div className="space-y-8">
        {/* Title */}
        <div>
          <label htmlFor="title" className={labelStyle}>
            Activity Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="e.g. Sentosa Fun Discovery Pass, Scuba Diving in Havelock"
            className={`${inputStyle} ${errors.title ? "ring-2 ring-red-500" : ""}`}
          />
          {errors.title && (
            <p className="mt-1.5 text-xs font-bold text-red-500 uppercase tracking-wider">
              {errors.title}
            </p>
          )}
        </div>

        {/* Short Description */}
        <div>
          <label htmlFor="short_description" className={labelStyle}>
            Short Description / Overview
          </label>
          <textarea
            id="short_description"
            name="short_description"
            rows={2}
            value={formData.short_description || ""}
            onChange={handleInputChange}
            placeholder="Brief overview shown on cards and search results (e.g. Guided glacier hike across magnificent ice pinnacles...)"
            className={inputStyle}
          />
          <p className="mt-1 text-[11px] text-slate-400 font-medium">
            This overview is displayed on activity listing cards and details page.
          </p>
        </div>

        {/* Destination Filter: Domestic vs International (Like Itinerary) */}
        <div className="p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60">
          <label className={labelStyle}>
            Destination Territory <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 font-medium">
            Choose whether this activity is located in a Domestic or International destination:
          </p>

          <div className="grid grid-cols-2 gap-4 max-w-md">
            <button
              type="button"
              onClick={() => handleDestinationTypeChange("domestic")}
              className={`flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl font-bold text-sm transition-all cursor-pointer border ${
                formData.destination_type === "domestic"
                  ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20"
                  : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400"
              }`}
            >
              <CheckCircle2
                size={16}
                className={formData.destination_type === "domestic" ? "opacity-100" : "opacity-0"}
              />
              <span>Domestic (India)</span>
            </button>

            <button
              type="button"
              onClick={() => handleDestinationTypeChange("international")}
              className={`flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl font-bold text-sm transition-all cursor-pointer border ${
                formData.destination_type === "international"
                  ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20"
                  : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400"
              }`}
            >
              <CheckCircle2
                size={16}
                className={formData.destination_type === "international" ? "opacity-100" : "opacity-0"}
              />
              <span>International</span>
            </button>
          </div>
        </div>

        {/* Dynamic Destination Dropdown - Strictly opens in Bottom */}
        <div className="relative">
          <label htmlFor="selected_destination_btn" className={labelStyle}>
            <span className="flex items-center gap-1.5">
              <MapPin size={16} className="text-blue-600 dark:text-blue-400" /> Target Destination <span className="text-red-500">*</span>
            </span>
          </label>

          <div ref={destDropdownRef} className="relative w-full">
            {/* Trigger Button */}
            <button
              type="button"
              id="selected_destination_btn"
              disabled={isListLoading}
              onClick={() => setIsDestOpen((prev) => !prev)}
              className={`${inputStyle} flex items-center justify-between cursor-pointer select-none text-left transition-all ${
                errors.selected_destination ? "ring-2 ring-red-500" : ""
              } ${
                isDestOpen ? "ring-2 ring-blue-500 border-blue-500 bg-white dark:bg-slate-800" : ""
              } ${isListLoading ? "opacity-60 cursor-not-allowed" : ""}`}
              aria-haspopup="listbox"
              aria-expanded={isDestOpen}
            >
              <div className="flex items-center gap-2.5 truncate">
                <MapPin
                  size={16}
                  className={`shrink-0 ${
                    formData.selected_destination
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-slate-400"
                  }`}
                />
                <span
                  className={`truncate ${
                    formData.selected_destination
                      ? "font-semibold text-slate-900 dark:text-white"
                      : "text-slate-400 dark:text-slate-500"
                  }`}
                >
                  {isListLoading
                    ? "Loading destinations..."
                    : selectedDestObj
                    ? selectedDestObj.destination_name
                    : `-- Select ${
                        formData.destination_type === "international" ? "International" : "Domestic"
                      } Destination --`}
                </span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 ml-2">
                {isListLoading ? (
                  <Loader2 size={16} className="text-slate-400 animate-spin" />
                ) : (
                  <ChevronDown
                    size={16}
                    className={`text-slate-400 transition-transform duration-200 ${
                      isDestOpen ? "rotate-180 text-blue-600 dark:text-blue-400" : ""
                    }`}
                  />
                )}
              </div>
            </button>

            {/* Hidden input to maintain native form validation / accessibility */}
            <input
              type="hidden"
              name="selected_destination"
              value={formData.selected_destination || ""}
            />

            {/* Dropdown Menu - Strictly opens in the BOTTOM */}
            <AnimatePresence>
              {isDestOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.98 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute left-0 top-full mt-2 w-full z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden"
                  role="listbox"
                >
                  {/* Search filter within dropdown */}
                  <div className="p-2.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50">
                    <div className="relative">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        ref={searchInputRef}
                        type="text"
                        value={destSearch}
                        onChange={(e) => setDestSearch(e.target.value)}
                        placeholder={`Search ${
                          formData.destination_type === "international" ? "international" : "domestic"
                        } destination...`}
                        className="w-full pl-8 pr-7 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      {destSearch && (
                        <button
                          type="button"
                          onClick={() => setDestSearch("")}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Options List */}
                  <div className="max-h-64 overflow-y-auto p-1.5 divide-y divide-slate-50 dark:divide-slate-800/40">
                    {/* Placeholder / Deselect Option */}
                    <button
                      type="button"
                      onClick={() => {
                        handleInputChange({ target: { name: "selected_destination", value: "" } });
                        setIsDestOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors text-left cursor-pointer ${
                        !formData.selected_destination
                          ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold"
                          : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                      }`}
                      role="option"
                      aria-selected={!formData.selected_destination}
                    >
                      <span>-- Select Destination --</span>
                      {!formData.selected_destination && (
                        <Check size={14} className="text-blue-600 dark:text-blue-400" />
                      )}
                    </button>

                    {filteredDestinations.length === 0 ? (
                      <div className="py-6 px-4 text-center text-xs text-slate-400 dark:text-slate-500 font-medium">
                        No destinations found matching "{destSearch}"
                      </div>
                    ) : (
                      filteredDestinations.map((dest) => {
                        const isSelected = formData.selected_destination === dest._id;
                        return (
                          <button
                            key={dest._id}
                            type="button"
                            onClick={() => {
                              handleInputChange({
                                target: { name: "selected_destination", value: dest._id },
                              });
                              setIsDestOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors text-left cursor-pointer ${
                              isSelected
                                ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold"
                                : "text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                            }`}
                            role="option"
                            aria-selected={isSelected}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <MapPin
                                size={14}
                                className={
                                  isSelected
                                    ? "text-blue-600 dark:text-blue-400"
                                    : "text-slate-400"
                                }
                              />
                              <span className="truncate">{dest.destination_name}</span>
                            </div>
                            {isSelected && (
                              <Check size={14} className="text-blue-600 dark:text-blue-400 shrink-0" />
                            )}
                          </button>
                        );
                      })
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {errors.selected_destination && (
            <p className="mt-1.5 text-xs font-bold text-red-500 uppercase tracking-wider">
              {errors.selected_destination}
            </p>
          )}
        </div>

        {/* Visibility (Public vs Private - Itinerary Style) */}
        <div className="max-w-md">
          <label className={labelStyle}>
            <span className="flex items-center gap-1.5">
              <Eye size={16} className="text-blue-600" /> Visibility
            </span>
          </label>
          <div className="grid grid-cols-2 gap-3 mt-1">
            <button
              type="button"
              onClick={() =>
                handleInputChange({ target: { name: "activity_type", value: "public" } })
              }
              className={`py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer border flex items-center justify-center gap-2 ${
                formData.activity_type === "public"
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-500/20"
                  : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300"
              }`}
            >
              <Eye size={15} />
              <span>Public (Live)</span>
            </button>

            <button
              type="button"
              onClick={() =>
                handleInputChange({ target: { name: "activity_type", value: "private" } })
              }
              className={`py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer border flex items-center justify-center gap-2 ${
                formData.activity_type === "private"
                  ? "bg-slate-900 dark:bg-slate-700 text-white border-slate-900 dark:border-slate-700 shadow-md"
                  : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300"
              }`}
            >
              <EyeOff size={15} />
              <span>Private (Hidden)</span>
            </button>
          </div>
          <p className="mt-1.5 text-[11px] text-slate-400 font-medium">
            {formData.activity_type === "public"
              ? "✓ Visible to public customers on the website"
              : "🔒 Hidden / Draft — will not appear on the website until set to Public"}
          </p>
        </div>

        {/* Rating, Review Count, Featured toggle */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          <div>
            <label htmlFor="rating" className={labelStyle}>
              <span className="flex items-center gap-1.5">
                <Star size={16} className="text-amber-500 fill-amber-500" /> Display Rating
              </span>
            </label>
            <input
              type="number"
              id="rating"
              name="rating"
              min="1"
              max="5"
              step="0.1"
              value={formData.rating}
              onChange={handleInputChange}
              className={inputStyle}
            />
          </div>

          <div>
            <label htmlFor="review_count" className={labelStyle}>
              <span className="flex items-center gap-1.5">
                <Users size={16} className="text-blue-600" /> Review Count
              </span>
            </label>
            <input
              type="number"
              id="review_count"
              name="review_count"
              min="0"
              value={formData.review_count}
              onChange={handleInputChange}
              className={inputStyle}
            />
          </div>

          <div className="flex flex-col justify-end">
            <label className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 cursor-pointer">
              <input
                type="checkbox"
                name="is_featured"
                checked={formData.is_featured}
                onChange={(e) =>
                  handleInputChange({
                    target: { name: "is_featured", value: e.target.checked },
                  })
                }
                className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={14} className="text-amber-500" /> Feature on Highlights
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ActivityCoreDetailsSection;
