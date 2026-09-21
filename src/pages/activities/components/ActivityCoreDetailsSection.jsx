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
      <div className="flex items-center justify-between pb-5 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-3.5">
          <div className="size-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 shrink-0">
            <Compass size={20} />
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Core Activity Details
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
              Primary title, romantic overview, destination target, and display settings
            </p>
          </div>
        </div>
        <div className="px-3.5 py-1.5 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-xl text-[10px] font-black uppercase tracking-wider">
          Destination & Type
        </div>
      </div>

      <div className="space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className={labelStyle}>
            Activity Title <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="e.g. Sentosa Fun Discovery Pass, Scuba Diving in Havelock"
            className={`${inputStyle} ${errors.title ? "ring-1 ring-red-500 border-red-500/50" : ""}`}
          />
          {errors.title && (
            <p className="mt-1.5 text-xs font-bold text-red-400 uppercase tracking-wider">
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
            rows={3}
            value={formData.short_description || ""}
            onChange={handleInputChange}
            placeholder="Brief overview shown on cards and search results (e.g. Guided glacier hike across magnificent ice pinnacles...)"
            className={`${inputStyle} resize-y min-h-[95px] leading-relaxed`}
          />
          <p className="mt-1.5 text-[11px] text-slate-500 font-medium">
            This overview is displayed on activity listing cards and details page.
          </p>
        </div>

        {/* Destination Filter: Domestic vs International (Like Itinerary) */}
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#050A17] border border-slate-200 dark:border-slate-800/90 shadow-inner">
          <label className={labelStyle}>
            Destination Territory <span className="text-red-400">*</span>
          </label>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 font-medium">
            Choose whether this activity is located in a Domestic or International destination:
          </p>

          <div className="grid grid-cols-2 gap-4 max-w-md">
            <button
              type="button"
              onClick={() => handleDestinationTypeChange("domestic")}
              className={`flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer border ${
                formData.destination_type === "domestic"
                  ? "bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-600/30 ring-1 ring-blue-400/50"
                  : "bg-white dark:bg-[#091126] text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700"
              }`}
            >
              <CheckCircle2
                size={15}
                className={formData.destination_type === "domestic" ? "opacity-100 text-white" : "opacity-0"}
              />
              <span>Domestic (India)</span>
            </button>

            <button
              type="button"
              onClick={() => handleDestinationTypeChange("international")}
              className={`flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer border ${
                formData.destination_type === "international"
                  ? "bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-600/30 ring-1 ring-blue-400/50"
                  : "bg-white dark:bg-[#091126] text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700"
              }`}
            >
              <CheckCircle2
                size={15}
                className={formData.destination_type === "international" ? "opacity-100 text-white" : "opacity-0"}
              />
              <span>International</span>
            </button>
          </div>
        </div>

        {/* Dynamic Destination Dropdown - Strictly opens in Bottom */}
        <div className="relative">
          <label htmlFor="selected_destination_btn" className={labelStyle}>
            <MapPin size={15} className="text-blue-400" /> Target Destination <span className="text-red-400">*</span>
          </label>

          <div ref={destDropdownRef} className="relative w-full">
            {/* Trigger Button */}
            <button
              type="button"
              id="selected_destination_btn"
              disabled={isListLoading}
              onClick={() => setIsDestOpen((prev) => !prev)}
              className={`${inputStyle} flex items-center justify-between cursor-pointer select-none text-left transition-all ${
                errors.selected_destination ? "ring-1 ring-red-500 border-red-500/50" : ""
              } ${
                isDestOpen ? "border-indigo-500 ring-1 ring-indigo-500/30 bg-slate-50 dark:bg-[#070D1F]" : ""
              } ${isListLoading ? "opacity-60 cursor-not-allowed" : ""}`}
              aria-haspopup="listbox"
              aria-expanded={isDestOpen}
            >
              <div className="flex items-center gap-2.5 truncate">
                <MapPin
                  size={16}
                  className={`shrink-0 ${
                    formData.selected_destination
                      ? "text-blue-400"
                      : "text-slate-500"
                  }`}
                />
                <span
                  className={`truncate ${
                    formData.selected_destination
                      ? "font-bold text-slate-900 dark:text-white"
                      : "text-slate-500 font-normal"
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
                      isDestOpen ? "rotate-180 text-blue-400" : ""
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
                  className="absolute left-0 top-full mt-2 w-full z-50 bg-white dark:bg-[#091126] border border-slate-200 dark:border-indigo-500/30 ring-1 ring-slate-900/5 dark:ring-white/10 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl"
                  role="listbox"
                >
                  {/* Search filter within dropdown */}
                  <div className="p-3 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/80 dark:bg-[#050A17]/80">
                    <div className="relative">
                      <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        ref={searchInputRef}
                        type="text"
                        value={destSearch}
                        onChange={(e) => setDestSearch(e.target.value)}
                        placeholder={`Search ${
                          formData.destination_type === "international" ? "international" : "domestic"
                        } destination...`}
                        className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-white dark:bg-[#050A17] border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30"
                      />
                      {destSearch && (
                        <button
                          type="button"
                          onClick={() => setDestSearch("")}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Options List */}
                  <div className="max-h-64 overflow-y-auto p-2 space-y-1">
                    {/* Placeholder / Deselect Option */}
                    <button
                      type="button"
                      onClick={() => {
                        handleInputChange({ target: { name: "selected_destination", value: "" } });
                        setIsDestOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors text-left cursor-pointer ${
                        !formData.selected_destination
                          ? "bg-indigo-600 text-white font-bold"
                          : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#050A17] hover:text-slate-900 dark:hover:text-white"
                      }`}
                      role="option"
                      aria-selected={!formData.selected_destination}
                    >
                      <span>-- Select Destination --</span>
                      {!formData.selected_destination && (
                        <Check size={14} className="text-white" />
                      )}
                    </button>

                    {filteredDestinations.length === 0 ? (
                      <div className="py-6 px-4 text-center text-xs text-slate-500 font-medium">
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
                                ? "bg-indigo-600 text-white font-bold"
                                : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#050A17] hover:text-slate-900 dark:hover:text-white"
                            }`}
                            role="option"
                            aria-selected={isSelected}
                          >
                            <div className="flex items-center gap-2.5 truncate">
                              <MapPin
                                size={14}
                                className={
                                  isSelected
                                    ? "text-white"
                                    : "text-indigo-400"
                                }
                              />
                              <span className="truncate">{dest.destination_name}</span>
                            </div>
                            {isSelected && (
                              <Check size={14} className="text-white shrink-0" />
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
            <p className="mt-1.5 text-xs font-bold text-red-400 uppercase tracking-wider">
              {errors.selected_destination}
            </p>
          )}
        </div>

        {/* Visibility (Public vs Private - Itinerary Style) */}
        <div className="max-w-md">
          <label className={labelStyle}>
            <Eye size={15} className="text-blue-400" /> Visibility
          </label>
          <div className="grid grid-cols-2 gap-3 mt-1.5">
            <button
              type="button"
              onClick={() =>
                handleInputChange({ target: { name: "activity_type", value: "public" } })
              }
              className={`py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer border flex items-center justify-center gap-2 ${
                formData.activity_type === "public"
                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/30"
                  : "bg-white dark:bg-[#050A17] text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700"
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
                  ? "bg-slate-800 text-white border-slate-700 shadow-md ring-1 ring-white/10"
                  : "bg-white dark:bg-[#050A17] text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700"
              }`}
            >
              <EyeOff size={15} />
              <span>Private (Hidden)</span>
            </button>
          </div>
          <p className="mt-1.5 text-[11px] text-slate-500 font-medium">
            {formData.activity_type === "public"
              ? "✓ Visible to public customers on the website"
              : "🔒 Hidden / Draft — will not appear on the website until set to Public"}
          </p>
        </div>

        {/* Rating, Review Count, Featured toggle */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          <div>
            <label htmlFor="rating" className={labelStyle}>
              <Star size={14} className="text-amber-400 fill-amber-400" /> Display Rating
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
              <Users size={14} className="text-blue-400" /> Review Count
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
            <label className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-[#050A17] border border-slate-200 dark:border-slate-800/90 hover:border-indigo-500/40 transition-colors shadow-inner cursor-pointer">
              <input
                type="checkbox"
                name="is_featured"
                checked={formData.is_featured}
                onChange={(e) =>
                  handleInputChange({
                    target: { name: "is_featured", value: e.target.checked },
                  })
                }
                className="w-5 h-5 rounded-md accent-amber-500 cursor-pointer"
              />
              <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={14} className="text-amber-400" /> Feature on Highlights
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ActivityCoreDetailsSection;
