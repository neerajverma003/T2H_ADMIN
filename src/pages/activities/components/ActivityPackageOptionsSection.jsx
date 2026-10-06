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
} from "lucide-react";

export const ActivityPackageOptionsSection = ({
  formData,
  handleInputChange,
  styles,
}) => {
  const { cardStyle, labelStyle, inputStyle } = styles;
  const packageOptions = formData.package_options || [];

  const [expandedIndex, setExpandedIndex] = useState(0);

  const handleAddPackage = () => {
    const newPackage = {
      title: "",
      description: "",
      duration: formData.duration || "",
      original_price: formData.pricing?.original_price || 0,
      selling_price: formData.pricing?.selling_price || 0,
      price_unit: formData.pricing?.price_unit || "per person",
      discount_label: "",
      age_policy: "",
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
    if (!text.trim()) return;
    const updated = [...packageOptions];
    const currentInc = updated[index].inclusions || [];
    updated[index].inclusions = [...currentInc, text.trim()];
    handleInputChange({ target: { name: "package_options", value: updated } });
  };

  const handleRemoveInclusion = (pkgIndex, incIndex) => {
    const updated = [...packageOptions];
    updated[pkgIndex].inclusions = (updated[pkgIndex].inclusions || []).filter(
      (_, i) => i !== incIndex
    );
    handleInputChange({ target: { name: "package_options", value: updated } });
  };

  const handleAddExclusion = (index, text) => {
    if (!text.trim()) return;
    const updated = [...packageOptions];
    const currentExc = updated[index].exclusions || [];
    updated[index].exclusions = [...currentExc, text.trim()];
    handleInputChange({ target: { name: "package_options", value: updated } });
  };

  const handleRemoveExclusion = (pkgIndex, excIndex) => {
    const updated = [...packageOptions];
    updated[pkgIndex].exclusions = (updated[pkgIndex].exclusions || []).filter(
      (_, i) => i !== excIndex
    );
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

      <p className="text-xs text-slate-500 dark:text-slate-400">
        Customers can compare and pick package options right on the activity page. If no options are added, the default single pricing will be used.
      </p>

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
                  <span className="size-7 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-xs font-black shrink-0 border border-indigo-500/20">
                    {idx + 1}
                  </span>
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
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider">
                          Default
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
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                  </div>

                  {/* Description & Age Policy */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelStyle}>
                        <span>Option Description</span>
                      </label>
                      <textarea
                        rows={2}
                        value={pkg.description}
                        onChange={(e) =>
                          handlePackageFieldChange(idx, "description", e.target.value)
                        }
                        placeholder="Brief summary of what this specific package option includes..."
                        className={`${inputStyle} resize-none`}
                      />
                    </div>

                    <div>
                      <label className={labelStyle}>
                        <ShieldAlert size={13} className="text-amber-400" />
                        <span>Age Policy / Restrictions</span>
                      </label>
                      <textarea
                        rows={2}
                        value={pkg.age_policy}
                        onChange={(e) => handlePackageFieldChange(idx, "age_policy", e.target.value)}
                        placeholder="e.g. 0-4 years free admission, 5+ charged as adult."
                        className={`${inputStyle} resize-none`}
                      />
                    </div>
                  </div>

                  {/* Inclusions (Price Includes) */}
                  <div className="p-4 rounded-xl bg-slate-100/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-2">
                      <label className={labelStyle}>
                        <CheckCircle2 size={13} className="text-emerald-400" />
                        <span>Price Includes (Inclusions)</span>
                      </label>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                        {(pkg.inclusions || []).length} Included
                      </span>
                    </div>

                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        id={`new-inc-${idx}`}
                        placeholder="e.g. High-definition underwater video & photos"
                        className={`${inputStyle} text-xs py-2`}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddInclusion(idx, e.currentTarget.value);
                            e.currentTarget.value = "";
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const el = document.getElementById(`new-inc-${idx}`);
                          if (el) {
                            handleAddInclusion(idx, el.value);
                            el.value = "";
                          }
                        }}
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider shrink-0 transition-colors cursor-pointer"
                      >
                        Add
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {(pkg.inclusions || []).map((inc, incIdx) => (
                        <span
                          key={incIdx}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold"
                        >
                          <CheckCircle2 size={12} />
                          <span>{inc}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveInclusion(idx, incIdx)}
                            className="hover:text-red-400 transition-colors ml-1 cursor-pointer"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Exclusions */}
                  <div className="p-4 rounded-xl bg-slate-100/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-2">
                      <label className={labelStyle}>
                        <XCircle size={13} className="text-rose-400" />
                        <span>Price Excludes (Optional)</span>
                      </label>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                        {(pkg.exclusions || []).length} Excluded
                      </span>
                    </div>

                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        id={`new-exc-${idx}`}
                        placeholder="e.g. Hotel pickup & drop-off"
                        className={`${inputStyle} text-xs py-2`}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddExclusion(idx, e.currentTarget.value);
                            e.currentTarget.value = "";
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const el = document.getElementById(`new-exc-${idx}`);
                          if (el) {
                            handleAddExclusion(idx, el.value);
                            el.value = "";
                          }
                        }}
                        className="px-3.5 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider shrink-0 transition-colors cursor-pointer"
                      >
                        Add
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {(pkg.exclusions || []).map((exc, excIdx) => (
                        <span
                          key={excIdx}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-semibold"
                        >
                          <XCircle size={12} />
                          <span>{exc}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveExclusion(idx, excIdx)}
                            className="hover:text-red-400 transition-colors ml-1 cursor-pointer"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Default / Recommended Toggle */}
                  <div className="flex items-center justify-between pt-2">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300">
                      <input
                        type="checkbox"
                        checked={Boolean(pkg.is_default)}
                        onChange={() => handleSetDefault(idx)}
                        className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 size-4 cursor-pointer"
                      />
                      <span>Set as Default / Recommended Package Option</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => handleRemovePackage(idx)}
                      className="text-xs text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1 transition-colors"
                    >
                      <Trash2 size={13} />
                      <span>Remove Option</span>
                    </button>
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
