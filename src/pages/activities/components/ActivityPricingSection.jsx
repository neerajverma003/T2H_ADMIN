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
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100 dark:border-slate-800">
        <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <IndianRupee className="text-emerald-600 dark:text-emerald-400" size={22} />
          Pricing Structure
        </h2>
        {discountPercent > 0 && (
          <div className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-full text-[11px] font-black uppercase tracking-widest flex items-center gap-1">
            <Percent size={12} /> {discountPercent} OFF (Auto-Calculated)
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Selling Price */}
        <div>
          <label htmlFor="selling_price" className={labelStyle}>
            Selling Price (INR) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
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
                errors.selling_price ? "ring-2 ring-red-500" : ""
              }`}
            />
          </div>
          {errors.selling_price && (
            <p className="mt-1.5 text-xs font-bold text-red-500 uppercase tracking-wider">
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
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
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
          <p className="mt-1 text-[11px] text-slate-400">Shown with strike-through</p>
        </div>

        {/* Price Unit */}
        <div>
          <label htmlFor="price_unit" className={labelStyle}>
            Price Unit
          </label>
          <select
            id="price_unit"
            name="price_unit"
            value={formData.pricing?.price_unit || "per person"}
            onChange={handlePricingChange}
            className={inputStyle}
          >
            <option value="per person">per person</option>
            <option value="per adult">per adult</option>
            <option value="per couple">per couple</option>
            <option value="per ticket">per ticket</option>
            <option value="per group">per group</option>
          </select>
        </div>
      </div>
    </div>
  );
};
export default ActivityPricingSection;
