import React, { useState } from "react";
import {
  Layers,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  Clock,
  IndianRupee,
  ShieldAlert,
  X,
  Sparkles,
  Image as ImageIcon,
  UploadCloud,
  Check,
  Loader2,
  FileText,
  Tag,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { uploadFileToS3 } from "../../../utils/s3Uploader";
import { toast } from "react-toastify";

const SUGGESTED_INCLUSIONS = [
  "Hotel Pickup & Drop",
  "Professional Tour Guide",
  "Entry Ticket & Admission Pass",
  "Buffet Lunch / Refreshments",
  "Safety Equipment & Life Jacket",
  "HD Photos & Video Footage",
  "Bottled Mineral Water",
  "All Taxes & Service Charges",
];

const SUGGESTED_EXCLUSIONS = [
  "Hotel Pickup & Drop",
  "Airfare / Flight Tickets",
  "Personal Expenses & Souvenirs",
  "Tips & Gratuities",
  "Alcoholic Beverages",
  "Travel & Medical Insurance",
  "Extra Water Sports & Activities",
  "Anything Not Mentioned In Inclusions",
];

const PackageFeatureTagInput = ({
  type = "inclusion",
  title,
  items = [],
  onAdd,
  onRemove,
  onClear,
  placeholder,
  suggestions = [],
}) => {
  const [inputValue, setInputValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const isInclusion = type === "inclusion";

  const handleAdd = () => {
    if (!inputValue.trim()) return;
    onAdd(inputValue);
    setInputValue("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    } else if (e.key === ",") {
      e.preventDefault();
      handleAdd();
    }
  };

  const handlePaste = (e) => {
    const pastedText = e.clipboardData?.getData("text");
    if (pastedText && (pastedText.includes(",") || pastedText.includes("\n"))) {
      e.preventDefault();
      onAdd(pastedText);
      setInputValue("");
    }
  };

  const safeItems = Array.isArray(items) ? items : [];

  const availableSuggestions = suggestions.filter(
    (s) => !safeItems.some((i) => i.toLowerCase() === s.toLowerCase())
  );

  return (
    <div
      className={`rounded-2xl p-4 sm:p-5 border transition-all duration-200 ${
        isInclusion
          ? "bg-slate-50/70 dark:bg-[#070e20]/80 border-slate-200/90 dark:border-slate-800/90 hover:border-emerald-500/30 dark:hover:border-emerald-500/30"
          : "bg-slate-50/70 dark:bg-[#070e20]/80 border-slate-200/90 dark:border-slate-800/90 hover:border-rose-500/30 dark:hover:border-rose-500/30"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div
            className={`size-7 rounded-xl flex items-center justify-center shrink-0 border ${
              isInclusion
                ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400 shadow-xs shadow-emerald-500/10"
                : "bg-rose-500/10 border-rose-500/25 text-rose-400 shadow-xs shadow-rose-500/10"
            }`}
          >
            {isInclusion ? <CheckCircle2 size={15} /> : <XCircle size={15} />}
          </div>
          <div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              {title}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {safeItems.length > 0 && (
            <button
              type="button"
              onClick={onClear}
              className="text-[10px] text-slate-400 hover:text-rose-400 font-bold uppercase tracking-wider transition-colors px-2 py-0.5 rounded-md hover:bg-rose-500/10 cursor-pointer"
              title="Clear all"
            >
              Clear All
            </button>
          )}
          <span
            className={`px-2.5 py-0.5 rounded-full border text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 ${
              isInclusion
                ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400"
                : "bg-rose-500/10 border-rose-500/25 text-rose-400"
            }`}
          >
            <span
              className={`size-1.5 rounded-full ${
                isInclusion ? "bg-emerald-400" : "bg-rose-400"
              } animate-pulse`}
            />
            {safeItems.length} {isInclusion ? "Included" : "Excluded"}
          </span>
        </div>
      </div>

      {/* Modern Unified Input Box */}
      <div
        className={`relative flex items-center rounded-xl border transition-all duration-200 shadow-inner ${
          isFocused
            ? isInclusion
              ? "bg-white dark:bg-[#040816] border-emerald-500 ring-2 ring-emerald-500/20"
              : "bg-white dark:bg-[#040816] border-rose-500 ring-2 ring-rose-500/20"
            : "bg-white/80 dark:bg-[#040816]/90 border-slate-200 dark:border-slate-800/90 hover:border-slate-300 dark:hover:border-slate-700"
        }`}
      >
        <div
          className={`pl-3.5 pr-2 pointer-events-none transition-colors ${
            isFocused
              ? isInclusion
                ? "text-emerald-400"
                : "text-rose-400"
              : "text-slate-400"
          }`}
        >
          <Plus size={16} />
        </div>

        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="w-full py-2.5 pr-24 text-xs sm:text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 bg-transparent focus:outline-none"
        />

        <div className="absolute right-2 flex items-center gap-1.5">
          {inputValue.trim() && (
            <button
              type="button"
              onClick={() => setInputValue("")}
              className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
              title="Clear text"
            >
              <X size={14} />
            </button>
          )}

          <button
            type="button"
            onClick={handleAdd}
            disabled={!inputValue.trim()}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
              inputValue.trim()
                ? isInclusion
                  ? "bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white shadow-md shadow-emerald-500/25 active:scale-95"
                  : "bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white shadow-md shadow-rose-500/25 active:scale-95"
                : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-70"
            }`}
          >
            <span>Add</span>
            <span className="hidden sm:inline-flex items-center text-[9px] font-bold px-1 py-0.5 rounded bg-black/20 dark:bg-black/30">
              ↵
            </span>
          </button>
        </div>
      </div>

      {/* Quick Suggestions Chips */}
      {availableSuggestions.length > 0 && (
        <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1 mr-0.5">
            <Sparkles size={11} className={isInclusion ? "text-emerald-400" : "text-rose-400"} />
            Suggestions:
          </span>
          {availableSuggestions.slice(0, 5).map((suggestion, sIdx) => (
            <button
              key={sIdx}
              type="button"
              onClick={() => onAdd(suggestion)}
              className={`px-2 py-0.5 rounded-lg text-[11px] font-medium border transition-all cursor-pointer active:scale-95 flex items-center gap-1 ${
                isInclusion
                  ? "bg-emerald-500/5 hover:bg-emerald-500/15 border-emerald-500/15 hover:border-emerald-500/30 text-slate-600 dark:text-slate-300 hover:text-emerald-500 dark:hover:text-emerald-300"
                  : "bg-rose-500/5 hover:bg-rose-500/15 border-rose-500/15 hover:border-rose-500/30 text-slate-600 dark:text-slate-300 hover:text-rose-500 dark:hover:text-rose-300"
              }`}
              title={`Click to add: ${suggestion}`}
            >
              <Plus size={10} className="opacity-70" />
              <span>{suggestion}</span>
            </button>
          ))}
        </div>
      )}

      {/* Badges / Chips List */}
      <div className="mt-3.5">
        {safeItems.length === 0 ? (
          <div className="py-2.5 px-3.5 rounded-xl border border-dashed border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/20 text-center">
            <p className="text-[11px] text-slate-400 font-medium">
              {isInclusion
                ? "No inclusions added yet. Type above and press Enter, or click a suggestion."
                : "No exclusions added yet. Add anything not covered (e.g. transfers, personal expenses)."}
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            <AnimatePresence>
              {safeItems.map((item, itemIdx) => (
                <motion.div
                  key={`${item}-${itemIdx}`}
                  initial={{ opacity: 0, scale: 0.85, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.85, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className={`group inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-xl text-xs font-semibold border transition-all shadow-xs ${
                    isInclusion
                      ? "bg-emerald-500/10 dark:bg-emerald-500/[0.08] text-emerald-800 dark:text-emerald-200 border-emerald-500/25 hover:border-emerald-500/40"
                      : "bg-rose-500/10 dark:bg-rose-500/[0.08] text-rose-800 dark:text-rose-200 border-rose-500/25 hover:border-rose-500/40"
                  }`}
                >
                  {isInclusion ? (
                    <CheckCircle2 size={13} className="text-emerald-500 dark:text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle size={13} className="text-rose-500 dark:text-rose-400 shrink-0" />
                  )}
                  <span className="leading-tight select-text">{item}</span>
                  <button
                    type="button"
                    onClick={() => onRemove(itemIdx)}
                    className="size-5 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-rose-500 dark:hover:bg-rose-500 transition-all cursor-pointer ml-0.5 shrink-0"
                    title={`Remove "${item}"`}
                  >
                    <X size={12} strokeWidth={2.5} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export const ActivityPackageOptionsSection = ({
  formData,
  handleInputChange,
  styles,
  errors = {},
}) => {
  const { cardStyle, labelStyle, inputStyle } = styles;
  const packageOptions = Array.isArray(formData.package_options)
    ? formData.package_options
    : [];

  const [expandedIndex, setExpandedIndex] = useState(0);
  const [uploadingImageIndex, setUploadingImageIndex] = useState(null);
  const [previewUrls, setPreviewUrls] = useState({});

  const lowestPriceIndex = packageOptions.reduce((minIdx, pkg, idx, arr) => {
    const cur = Number(pkg.selling_price);
    const min = Number(arr[minIdx]?.selling_price);
    if (!isNaN(cur) && cur > 0) {
      if (isNaN(min) || min <= 0 || cur < min) {
        return idx;
      }
    }
    return minIdx;
  }, 0);

  const defaultPkgIndex = packageOptions.findIndex((p) => p.is_default);
  const activeDefaultIndex =
    lowestPriceIndex >= 0 && Number(packageOptions[lowestPriceIndex]?.selling_price) > 0
      ? lowestPriceIndex
      : (defaultPkgIndex >= 0 ? defaultPkgIndex : 0);
  const activeDefaultPkg = packageOptions[activeDefaultIndex];

  const cdnBase = import.meta.env.VITE_CDN_URL?.trim() || "https://media.trip2honeymoon.com";
  const getImagePreviewUrl = (imgKey) => {
    if (!imgKey) return "";
    if (previewUrls[imgKey]) return previewUrls[imgKey];
    if (imgKey.startsWith("http://") || imgKey.startsWith("https://") || imgKey.startsWith("blob:")) return imgKey;
    return `${cdnBase}/${imgKey}`;
  };

  const handlePackageImageUpload = async (index, e) => {
    const inputEl = e.target;
    const file = inputEl.files?.[0];
    if (!file) return;

    setUploadingImageIndex(index);
    try {
      const localBlobUrl = URL.createObjectURL(file);
      // uploadFileToS3 automatically converts file to WebP
      const { s3Key, viewUrl, publicUrl } = await uploadFileToS3(file, {
        type: "activities",
        fileType: "package_options",
      });

      const displayUrl = viewUrl || localBlobUrl || publicUrl;
      if (s3Key && displayUrl) {
        setPreviewUrls((prev) => ({ ...prev, [s3Key]: displayUrl }));
      }

      handlePackageFieldChange(index, "image", s3Key);
      toast.success("Package image converted to WebP & uploaded!");
    } catch (err) {
      console.error("Package image upload error:", err);
      toast.error("Failed to upload package image");
    } finally {
      setUploadingImageIndex(null);
      if (inputEl) inputEl.value = "";
    }
  };

  const handleAddPackage = () => {
    const newPackage = {
      title: "",
      description: "",
      duration: formData.duration || "",
      original_price: "",
      selling_price: "",
      price_unit: "per person",
      discount_label: "",
      age_policy: "",
      image: "",
      inclusions: [],
      exclusions: [],
      is_default: packageOptions.length === 0,
    };
    const updated = [...packageOptions, newPackage];
    handleInputChange({ target: { name: "package_options", value: updated } });
    setExpandedIndex(updated.length - 1);
  };

  const handleRemovePackage = (index) => {
    const updated = packageOptions.filter((_, idx) => idx !== index);
    if (updated.length > 0 && !updated.some((p) => p.is_default)) {
      updated[0].is_default = true;
    }
    handleInputChange({ target: { name: "package_options", value: updated } });
    if (expandedIndex >= updated.length) {
      setExpandedIndex(Math.max(0, updated.length - 1));
    }
  };

  const handlePackageFieldChange = (index, field, value) => {
    const updated = [...packageOptions];
    updated[index] = { ...updated[index], [field]: value };
    handleInputChange({ target: { name: "package_options", value: updated } });
  };

  const handleAddInclusion = (index, text) => {
    if (!text || !text.trim()) return;
    const splitItems = text
      .split(/[,|\n]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (splitItems.length === 0) return;

    const updated = [...packageOptions];
    const currentInc = Array.isArray(updated[index].inclusions)
      ? updated[index].inclusions
      : [];
    const newItems = splitItems.filter(
      (item) => !currentInc.some((c) => c.toLowerCase() === item.toLowerCase())
    );
    if (newItems.length === 0) return;

    updated[index].inclusions = [...currentInc, ...newItems];
    handleInputChange({ target: { name: "package_options", value: updated } });
  };

  const handleClearInclusions = (index) => {
    const updated = [...packageOptions];
    updated[index].inclusions = [];
    handleInputChange({ target: { name: "package_options", value: updated } });
  };

  const handleRemoveInclusion = (pkgIndex, incIndex) => {
    const updated = [...packageOptions];
    const currentInc = Array.isArray(updated[pkgIndex].inclusions)
      ? updated[pkgIndex].inclusions
      : [];
    updated[pkgIndex].inclusions = currentInc.filter((_, i) => i !== incIndex);
    handleInputChange({ target: { name: "package_options", value: updated } });
  };

  const handleAddExclusion = (index, text) => {
    if (!text || !text.trim()) return;
    const splitItems = text
      .split(/[,|\n]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (splitItems.length === 0) return;

    const updated = [...packageOptions];
    const currentExc = Array.isArray(updated[index].exclusions)
      ? updated[index].exclusions
      : [];
    const newItems = splitItems.filter(
      (item) => !currentExc.some((c) => c.toLowerCase() === item.toLowerCase())
    );
    if (newItems.length === 0) return;

    updated[index].exclusions = [...currentExc, ...newItems];
    handleInputChange({ target: { name: "package_options", value: updated } });
  };

  const handleClearExclusions = (index) => {
    const updated = [...packageOptions];
    updated[index].exclusions = [];
    handleInputChange({ target: { name: "package_options", value: updated } });
  };

  const handleRemoveExclusion = (pkgIndex, excIndex) => {
    const updated = [...packageOptions];
    const currentExc = Array.isArray(updated[pkgIndex].exclusions)
      ? updated[pkgIndex].exclusions
      : [];
    updated[pkgIndex].exclusions = currentExc.filter((_, i) => i !== excIndex);
    handleInputChange({ target: { name: "package_options", value: updated } });
  };

  const handleSetDefault = (index) => {
    const updated = packageOptions.map((pkg, idx) => ({
      ...pkg,
      is_default: idx === index,
    }));
    handleInputChange({ target: { name: "package_options", value: updated } });
  };

  return (
    <div className={cardStyle}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-3.5">
          <div className="size-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 shrink-0">
            <Layers size={20} />
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Package Options & Variants
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
              Offer multiple tickets or experience tiers (e.g. Standard Pass, VIP Pass with Transfers)
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 rounded-xl text-[10px] font-black uppercase tracking-wider">
            {packageOptions.length} Options
          </span>
          <button
            type="button"
            onClick={handleAddPackage}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-md shadow-indigo-600/30 cursor-pointer active:scale-95"
          >
            <Plus size={15} />
            <span>Add Package Option</span>
          </button>
        </div>
      </div>

      {/* Starting Rate Status Banner */}
      {packageOptions.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3.5 sm:p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/25">
          <div className="flex items-center gap-2.5 text-xs">
            <span className="size-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="font-bold text-slate-800 dark:text-slate-200">
              Starting / Display Price:
            </span>
            {activeDefaultPkg && Number(activeDefaultPkg.selling_price) > 0 ? (
              <span className="font-black text-indigo-600 dark:text-indigo-400">
                INR {Number(activeDefaultPkg.selling_price).toLocaleString()} / {activeDefaultPkg.price_unit || "person"}
                <span className="text-slate-500 dark:text-slate-400 font-semibold ml-1.5">
                  ({activeDefaultPkg.title || `Option #${activeDefaultIndex + 1}`})
                </span>
              </span>
            ) : (
              <span className="text-amber-500 font-bold">
                Set selling price on Option #{activeDefaultIndex + 1}
              </span>
            )}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            This price is shown on listing cards (lowest or default option like Thrillophilia).
          </span>
        </div>
      )}

      {errors.package_options && (
        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold flex items-center gap-2">
          <span>⚠</span>
          <span>{errors.package_options}</span>
        </div>
      )}

      {/* Package Option Cards */}
      <div className="space-y-4 pt-2">
        {packageOptions.map((pkg, idx) => {
          const isExpanded = expandedIndex === idx;

          return (
            <div
              key={idx}
              className={`rounded-2xl border transition-all ${
                isExpanded
                  ? "bg-slate-50 dark:bg-[#050A17] border-indigo-500/40 shadow-lg shadow-indigo-500/5"
                  : "bg-slate-50/50 dark:bg-[#050A17]/60 border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700"
              }`}
            >
              {/* Card Title Bar */}
              <div
                className="p-4 sm:p-5 flex items-center justify-between gap-3 cursor-pointer select-none"
                onClick={() => setExpandedIndex(isExpanded ? null : idx)}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {pkg.image ? (
                    <img
                      src={getImagePreviewUrl(pkg.image)}
                      alt={pkg.title || "Package thumbnail"}
                      className="size-8 rounded-xl object-cover shrink-0 border border-indigo-500/30 shadow-xs"
                    />
                  ) : (
                    <span className="size-7 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-xs font-black shrink-0 border border-indigo-500/20">
                      {idx + 1}
                    </span>
                  )}
                  <div className="truncate">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {pkg.title || `Package Option #${idx + 1} (Untitled)`}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                      <span>INR {(Number(pkg.selling_price) || 0).toLocaleString()}</span>
                      {pkg.duration && (
                        <>
                          <span>•</span>
                          <span>{pkg.duration}</span>
                        </>
                      )}
                      {pkg.is_default && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                          <Check size={10} /> Default (Starting Price)
                        </span>
                      )}
                      {!pkg.is_default && idx === lowestPriceIndex && Number(pkg.selling_price) > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 text-[10px] font-black uppercase tracking-wider">
                          Lowest Price
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemovePackage(idx);
                    }}
                    className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Delete package option"
                  >
                    <Trash2 size={16} />
                  </button>
                  <button
                    type="button"
                    className="p-2 rounded-xl text-slate-400 hover:text-white transition-colors"
                  >
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                </div>
              </div>

              {/* Card Body */}
              {isExpanded && (
                <div className="p-4 sm:p-6 pt-0 space-y-5 border-t border-slate-200 dark:border-slate-800/80">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-4">
                    <div className="sm:col-span-2">
                      <label className={labelStyle}>
                        <span>Package Title *</span>
                      </label>
                      <input
                        type="text"
                        value={pkg.title}
                        onChange={(e) => handlePackageFieldChange(idx, "title", e.target.value)}
                        placeholder="e.g. Standard Admission Pass with Video"
                        className={inputStyle}
                      />
                    </div>

                    <div>
                      <label className={labelStyle}>
                        <Clock size={13} className="text-indigo-400" />
                        <span>Duration</span>
                      </label>
                      <input
                        type="text"
                        value={pkg.duration}
                        onChange={(e) => handlePackageFieldChange(idx, "duration", e.target.value)}
                        placeholder="e.g. 1.5 Hours"
                        className={inputStyle}
                      />
                    </div>
                  </div>

                  {/* Pricing Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className={labelStyle}>
                        <IndianRupee size={13} className="text-emerald-400" />
                        <span>Selling Price (INR) *</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={pkg.selling_price}
                        onChange={(e) =>
                          handlePackageFieldChange(idx, "selling_price", e.target.value)
                        }
                        placeholder="e.g. 4000"
                        className={inputStyle}
                      />
                    </div>

                    <div>
                      <label className={labelStyle}>
                        <IndianRupee size={13} className="text-slate-400" />
                        <span>Original Price (INR)</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={pkg.original_price}
                        onChange={(e) =>
                          handlePackageFieldChange(idx, "original_price", e.target.value)
                        }
                        placeholder="e.g. 6000"
                        className={inputStyle}
                      />
                    </div>

                    <div>
                      <label className={labelStyle}>
                        <span>Price Unit</span>
                      </label>
                      <input
                        type="text"
                        value={pkg.price_unit}
                        onChange={(e) => handlePackageFieldChange(idx, "price_unit", e.target.value)}
                        placeholder="per person / per adult"
                        className={inputStyle}
                      />
                    </div>

                    <div>
                      <label className={labelStyle}>
                        <Tag size={13} className="text-purple-400" />
                        <span>Discount / Offer Tag</span>
                      </label>
                      <input
                        type="text"
                        value={pkg.discount_label || ""}
                        onChange={(e) =>
                          handlePackageFieldChange(idx, "discount_label", e.target.value)
                        }
                        placeholder="e.g. 6% OFF, Monsoon Sale"
                        className={inputStyle}
                      />
                    </div>
                  </div>

                  {/* 1. Description & Age Policy (Full Width, List-Wise) */}
                  <div className="space-y-4">
                    {/* Option Description */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className={labelStyle}>
                          <FileText size={13} className="text-indigo-400" />
                          <span>Option Description</span>
                        </label>
                        <span className="text-[10px] text-slate-400 font-semibold">
                          {(pkg.description || "").length} chars
                        </span>
                      </div>
                      <textarea
                        rows={3}
                        value={pkg.description}
                        onChange={(e) =>
                          handlePackageFieldChange(idx, "description", e.target.value)
                        }
                        placeholder="e.g. Planning to visit Burj Khalifa? Grab the Level 124 & 125 Tickets and make your trip unforgettable with breathtaking observation deck views..."
                        className={`${inputStyle} resize-y min-h-[88px] leading-relaxed`}
                      />
                    </div>

                    {/* Age Policy / Restrictions */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className={labelStyle}>
                          <ShieldAlert size={13} className="text-amber-400" />
                          <span>Age Policy / Restrictions</span>
                        </label>
                      </div>
                      <textarea
                        rows={2}
                        value={pkg.age_policy}
                        onChange={(e) =>
                          handlePackageFieldChange(idx, "age_policy", e.target.value)
                        }
                        placeholder="e.g. Visitors under 3 years free admission (infants). Visitors aged 3 to 8 charged as child."
                        className={`${inputStyle} resize-y min-h-[60px] leading-relaxed`}
                      />
                    </div>
                  </div>

                  {/* 2. Package Visual (Optional) - In Bottom with Space */}
                  <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800/80 space-y-2.5">
                    <div className="flex items-center justify-between mb-0.5">
                      <div className="flex items-center gap-2">
                        <label className={labelStyle}>
                          <ImageIcon size={13} className="text-indigo-400" />
                          <span>Package Visual (Optional)</span>
                        </label>
                        <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/25 text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                          <Sparkles size={9} /> WebP
                        </span>
                      </div>
                      {pkg.image && (
                        <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                          <Check size={12} /> Photo Attached
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Visual thumbnail shown above option details on public activity page (auto WebP conversion).
                    </p>

                    {pkg.image ? (
                      <div className="relative group rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#030712] h-44 sm:h-52 shadow-inner">
                        <img
                          src={getImagePreviewUrl(pkg.image)}
                          alt={pkg.title || "Package Option Preview"}
                          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/50 sm:bg-black/60 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                          <label className="px-3.5 py-2 bg-white text-slate-900 font-bold rounded-xl text-xs cursor-pointer shadow-md hover:bg-slate-100 transition-colors flex items-center gap-1.5 active:scale-95">
                            <UploadCloud size={14} />
                            <span>Replace</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handlePackageImageUpload(idx, e)}
                              className="hidden"
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => handlePackageFieldChange(idx, "image", "")}
                            className="px-3.5 py-2 bg-red-600 text-white font-bold rounded-xl text-xs shadow-md hover:bg-red-700 transition-colors cursor-pointer flex items-center gap-1.5 active:scale-95"
                          >
                            <X size={14} />
                            <span>Remove</span>
                          </button>
                        </div>
                        <span className="absolute bottom-2.5 left-2.5 bg-black/80 backdrop-blur-md text-white text-[9px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 border border-white/10">
                          <Check size={11} className="text-emerald-400" /> WebP Ready
                        </span>
                      </div>
                    ) : (
                      <label
                        className={`flex flex-col items-center justify-center h-32 sm:h-36 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
                          uploadingImageIndex === idx
                            ? "border-indigo-500/60 bg-indigo-500/10"
                            : "border-slate-300 dark:border-slate-800 hover:border-indigo-500/60 bg-slate-50/60 dark:bg-[#030712]/70 hover:bg-white dark:hover:bg-[#060D20]"
                        }`}
                      >
                        <input
                          type="file"
                          accept="image/*"
                          disabled={uploadingImageIndex === idx}
                          onChange={(e) => handlePackageImageUpload(idx, e)}
                          className="hidden"
                        />
                        {uploadingImageIndex === idx ? (
                          <div className="flex flex-col items-center gap-2 text-indigo-400">
                            <Loader2 className="animate-spin" size={24} />
                            <span className="text-xs font-bold">Converting to WebP & Uploading...</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center text-center p-4">
                            <div className="size-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-1.5 border border-indigo-500/20">
                              <UploadCloud size={20} />
                            </div>
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                              Upload Option Photo
                            </span>
                            <span className="text-[10px] text-slate-400 mt-0.5">
                              Click or drop image • Auto-WebP
                            </span>
                          </div>
                        )}
                      </label>
                    )}
                  </div>

                  {/* Inclusions (Price Includes) */}
                  <PackageFeatureTagInput
                    type="inclusion"
                    title="Price Includes (Inclusions)"
                    items={pkg.inclusions || []}
                    onAdd={(text) => handleAddInclusion(idx, text)}
                    onRemove={(incIdx) => handleRemoveInclusion(idx, incIdx)}
                    onClear={() => handleClearInclusions(idx)}
                    placeholder="e.g. High-definition underwater video & photos"
                    suggestions={SUGGESTED_INCLUSIONS}
                  />

                  {/* Exclusions (Price Excludes) */}
                  <PackageFeatureTagInput
                    type="exclusion"
                    title="Price Excludes (Optional)"
                    items={pkg.exclusions || []}
                    onAdd={(text) => handleAddExclusion(idx, text)}
                    onRemove={(excIdx) => handleRemoveExclusion(idx, excIdx)}
                    onClear={() => handleClearExclusions(idx)}
                    placeholder="e.g. Hotel pickup & drop-off"
                    suggestions={SUGGESTED_EXCLUSIONS}
                  />

                  {/* Default / Recommended Toggle */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800/80">
                    <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300 group">
                      <input
                        type="radio"
                        name="activity_default_package_option"
                        checked={Boolean(pkg.is_default)}
                        onChange={() => handleSetDefault(idx)}
                        className="size-4 text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
                      />
                      <span className="flex items-center gap-2">
                        <span>Set as Default / Starting Package Option</span>
                        {pkg.is_default && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase tracking-wider">
                            Active Starting Rate
                          </span>
                        )}
                      </span>
                    </label>

                    {packageOptions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemovePackage(idx)}
                        className="text-xs text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1 transition-colors self-end sm:self-auto cursor-pointer"
                      >
                        <Trash2 size={13} />
                        <span>Remove Option</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {packageOptions.length === 0 && (
          <div className="p-8 text-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20">
            <Layers size={32} className="mx-auto text-slate-400 mb-2" />
            <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
              No package options added yet.
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Click &quot;Add Package Option&quot; above to offer customized tiers and variants.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
