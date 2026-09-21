import React from "react";
import { IndianRupee, Percent } from "lucide-react";

export const ActivityPricingSection = ({
  formData,
  handlePricingChange,
  styles,
  errors = {},
}) => {
  const { cardStyle, labelStyle, inputStyle } = styles;
  const selling = Number(formData.pricing?.selling_price) || 0;
  const original = Number(formData.pricing?.original_price) || 0;
  const discountPercent =
    original > selling && original > 0
      ? Math.round(((original - selling) / original) * 100)
      : 0;

  return (
    <div className={cardStyle}>
      <div className="flex items-center justify-between pb-5 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-3.5">
          <div className="size-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/25 shrink-0">
            <IndianRupee size={20} />
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Pricing Structure
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
              Selling rates, retail MSRP, auto-computed discounts, and billing unit
            </p>
          </div>
        </div>
        {discountPercent > 0 && (
          <div className="px-3.5 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
            <Percent size={11} /> {discountPercent}% OFF (Auto-Calculated)
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Selling Price */}
        <div>
          <label htmlFor="selling_price" className={labelStyle}>
            Selling Price (INR) <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm pointer-events-none">
              ₹
            </span>
            <input
              type="number"
              id="selling_price"
              name="selling_price"
              min="0"
              value={formData.pricing?.selling_price ?? ""}
              onChange={handlePricingChange}
              placeholder="3715"
              className={`${inputStyle} pl-9 ${
                errors.selling_price ? "ring-1 ring-red-500 border-red-500/50" : ""
              }`}
            />
          </div>
          {errors.selling_price && (
            <p className="mt-1.5 text-xs font-bold text-red-400 uppercase tracking-wider">
              {errors.selling_price}
            </p>
          )}
        </div>

        {/* Original Price */}
        <div>
          <label htmlFor="original_price" className={labelStyle}>
            Original Price (MSRP)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm pointer-events-none">
              ₹
            </span>
            <input
              type="number"
              id="original_price"
              name="original_price"
              min="0"
              value={formData.pricing?.original_price ?? ""}
              onChange={handlePricingChange}
              placeholder="4458"
              className={`${inputStyle} pl-9`}
            />
          </div>
          <p className="mt-1.5 text-[11px] text-slate-500 font-medium">Shown with strike-through</p>
        </div>

        {/* Price Unit */}
        <div>
          <label htmlFor="price_unit" className={labelStyle}>
            Price Unit
          </label>
          <div className="relative">
            <select
              id="price_unit"
              name="price_unit"
              value={formData.pricing?.price_unit || "per person"}
              onChange={handlePricingChange}
              className={`${inputStyle} appearance-none cursor-pointer pr-10`}
            >
              <option value="per person" className="bg-white dark:bg-[#050A17] text-slate-900 dark:text-white">per person</option>
              <option value="per adult" className="bg-white dark:bg-[#050A17] text-slate-900 dark:text-white">per adult</option>
              <option value="per couple" className="bg-white dark:bg-[#050A17] text-slate-900 dark:text-white">per couple</option>
              <option value="per ticket" className="bg-white dark:bg-[#050A17] text-slate-900 dark:text-white">per ticket</option>
              <option value="per group" className="bg-white dark:bg-[#050A17] text-slate-900 dark:text-white">per group</option>
            </select>
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xs">▼</span>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ActivityPricingSection;
