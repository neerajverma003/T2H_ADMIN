import React, { useState, useEffect } from 'react';
import { apiClient } from '../../stores/authStores';
import { motion, AnimatePresence } from 'framer-motion';
import { Percent, Plus, Trash2, Save, Sparkles, Tag, ShieldCheck, AlertCircle, CheckCircle2, ArrowRight, Layers, DollarSign } from 'lucide-react';
import { toast } from 'react-toastify';

const GiftDiscount = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [title, setTitle] = useState('User Gift Discount');
  const [description, setDescription] = useState('Dedicated discount configuration for regular public users (B2C).');
  const [tiers, setTiers] = useState([]);

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const fetchDiscounts = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/admin/giftcard/discounts');
      if (response.data?.success && response.data?.data) {
        const data = response.data.data;
        setIsActive(data.is_active !== undefined ? data.is_active : true);
        setTitle(data.title || 'User Gift Discount');
        setDescription(data.description || 'Dedicated discount configuration for regular public users (B2C).');
        setTiers(Array.isArray(data.tiers) ? data.tiers : []);
      } else {
        toast.error(response.data?.msg || 'Failed to load discount settings.');
      }
    } catch (err) {
      console.error('fetchDiscounts error:', err);
      toast.error(err.response?.data?.msg || 'Error loading discount configuration.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTier = () => {
    const newTier = {
      discount_percentage: 5,
      min_purchase_amount: tiers.length > 0 ? (Number(tiers[tiers.length - 1].min_purchase_amount) + 2000) : 3000,
      max_discount_cap: tiers.length > 0 ? (Number(tiers[tiers.length - 1].max_discount_cap) + 3000) : 5000,
      is_active: true
    };
    setTiers([...tiers, newTier]);
  };

  const handleRemoveTier = (index) => {
    const updated = tiers.filter((_, i) => i !== index);
    setTiers(updated);
  };

  const handleTierChange = (index, field, value) => {
    const updated = [...tiers];
    // Strip leading zeros unless it's strictly empty or 0
    let cleanVal = value;
    if (typeof value === 'string') {
      cleanVal = value.replace(/^0+(?=\d)/, '');
    }
    
    updated[index] = {
      ...updated[index],
      [field]: cleanVal === '' ? '' : Number(cleanVal)
    };
    setTiers(updated);
  };

  const handleSave = async () => {
    // Validation
    for (let i = 0; i < tiers.length; i++) {
      const t = tiers[i];
      const perc = Number(t.discount_percentage);
      const minP = Number(t.min_purchase_amount);
      const maxC = Number(t.max_discount_cap);

      if (isNaN(perc) || perc <= 0 || perc > 100) {
        toast.error(`Tier ${i + 1}: Discount percentage must be between 1% and 100%.`);
        return;
      }
      if (isNaN(minP) || minP <= 0) {
        toast.error(`Tier ${i + 1}: Minimum purchase amount must be greater than ₹0.`);
        return;
      }
      if (isNaN(maxC) || maxC <= 0) {
        toast.error(`Tier ${i + 1}: Maximum discount cap must be greater than ₹0.`);
        return;
      }
    }

    setSaving(true);
    try {
      const payload = {
        title,
        description,
        is_active: isActive,
        tiers: tiers.map(t => ({
          discount_percentage: Number(t.discount_percentage),
          min_purchase_amount: Number(t.min_purchase_amount),
          max_discount_cap: Number(t.max_discount_cap),
          is_active: t.is_active !== false
        }))
      };

      const response = await apiClient.put('/admin/giftcard/discounts', payload);
      if (response.data?.success) {
        toast.success('Gift discount rules saved successfully!');
        if (response.data.data) {
          setTiers(response.data.data.tiers || []);
        }
      } else {
        toast.error(response.data?.msg || 'Failed to save discount configuration.');
      }
    } catch (err) {
      console.error('handleSave error:', err);
      toast.error(err.response?.data?.msg || 'Error saving discount configuration.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 md:p-8 w-full min-h-screen text-slate-900 dark:text-slate-100 transition-colors space-y-8">
      
      {/* Top Banner Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 dark:bg-[#0d162b] dark:shadow-xl dark:border-[#1b2a47] p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2 flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
                <Percent size={24} />
              </div>
              Gift Card Discount
            </h1>
            <p className="text-slate-500 dark:text-slate-400 max-w-2xl text-sm font-semibold">
              Configure tiered percentage discounts for user gift card purchases based on minimum purchase amounts and maximum discount caps.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-50 dark:bg-[#15233e] border border-slate-200 dark:border-[#233558] p-2 px-4 rounded-2xl">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Discount Status:</span>
            <button
              onClick={() => setIsActive(!isActive)}
              className={`px-3 py-1 rounded-xl text-xs font-black uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                isActive
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
              }`}
            >
              {isActive ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
              {isActive ? 'Active' : 'Disabled'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Configuration Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 dark:bg-[#0d162b] dark:shadow-xl dark:border-[#1b2a47] p-6 md:p-8">
        
        {/* Section Header with Action Buttons */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800/80 mb-8">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-blue-50 dark:bg-blue-600/15 border border-blue-200 dark:border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">User Gift Discount Configuration</h2>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                Set minimum qualifying amounts, percentage rates, and maximum discount caps.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleAddTier}
              className="flex-1 sm:flex-none px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus size={18} />
              ADD DISCOUNT
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex-1 sm:flex-none px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {saving ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save size={18} />
                  SAVE CONFIG
                </>
              )}
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-10 h-10 border-4 border-blue-600 dark:border-[#2563EB] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : tiers.length === 0 ? (
          <div className="bg-slate-50 dark:bg-[#15233e]/50 rounded-2xl border border-dashed border-slate-200 dark:border-[#233558] p-12 text-center">
            <div className="w-16 h-16 bg-blue-50 dark:bg-[#182745] text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <Percent size={28} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No Discount Tiers Configured</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
              Add discount tiers so users receive instant percentage discounts when purchasing gift cards above specific amounts.
            </p>
            <button
              onClick={handleAddTier}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md transition-all inline-flex items-center gap-2"
            >
              <Plus size={18} /> Add First Discount Tier
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <AnimatePresence>
              {tiers.map((tier, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="bg-slate-50/80 dark:bg-[#15233e]/70 border border-slate-200/80 dark:border-[#233558] rounded-2xl p-6 relative group hover:border-blue-500/50 transition-all shadow-sm"
                >
                  {/* Tier Header */}
                  <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200/60 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <Tag size={16} className="text-blue-600 dark:text-blue-400" />
                      <span className="font-extrabold text-xs tracking-wider uppercase text-blue-600 dark:text-blue-400">
                        DISCOUNT TIER {index + 1}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveTier(index)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-transparent hover:border-rose-200 dark:hover:border-rose-900 transition-all flex items-center gap-1.5 cursor-pointer"
                      title="Remove Tier"
                    >
                      <Trash2 size={14} />
                      Remove
                    </button>
                  </div>

                  {/* Tier Inputs Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Discount Percentage */}
                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                        DISCOUNT PERCENTAGE (%)
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          inputMode="numeric"
                          value={tier.discount_percentage === 0 ? '0' : (tier.discount_percentage ?? '')}
                          onChange={(e) => handleTierChange(index, 'discount_percentage', e.target.value)}
                          placeholder="e.g. 5"
                          className="w-full px-4 py-3.5 bg-white dark:bg-[#0d162b] border border-slate-200 dark:border-[#233558] rounded-xl text-slate-900 dark:text-white font-bold text-base focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">E.g., 5 for 5% off</p>
                    </div>

                    {/* Minimum Purchase Amount */}
                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                        MINIMUM PURCHASE AMOUNT (₹)
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={tier.min_purchase_amount === 0 ? '0' : (tier.min_purchase_amount ?? '')}
                          onChange={(e) => handleTierChange(index, 'min_purchase_amount', e.target.value)}
                          placeholder="e.g. 3000"
                          className="w-full pl-8 pr-4 py-3.5 bg-white dark:bg-[#0d162b] border border-slate-200 dark:border-[#233558] rounded-xl text-slate-900 dark:text-white font-bold text-base focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all"
                        />
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">Qualifying purchase threshold</p>
                    </div>

                    {/* Maximum Discount Cap */}
                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                        MAXIMUM DISCOUNT CAP (₹)
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={tier.max_discount_cap === 0 ? '0' : (tier.max_discount_cap ?? '')}
                          onChange={(e) => handleTierChange(index, 'max_discount_cap', e.target.value)}
                          placeholder="e.g. 5000"
                          className="w-full pl-8 pr-4 py-3.5 bg-white dark:bg-[#0d162b] border border-slate-200 dark:border-[#233558] rounded-xl text-slate-900 dark:text-white font-bold text-base focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all"
                        />
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">Max deduction allowed</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Bottom Save Action */}
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {saving ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Save size={18} />
                    SAVE CONFIGURATION
                  </>
                )}
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Categorized Discount Rules Summary Table at Bottom */}
      {tiers.length > 0 && (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 dark:bg-[#0d162b] dark:shadow-xl dark:border-[#1b2a47] p-6 md:p-8">
          <div className="flex items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800/80 mb-6">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-purple-50 dark:bg-purple-600/15 border border-purple-200 dark:border-purple-500/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                <Layers size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Active Discount Categories & Rules Summary</h3>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                  Live overview of the price brackets and discount percentages configured for public user purchases.
                </p>
              </div>
            </div>
            <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700/50 text-blue-600 dark:text-blue-400 text-xs font-black rounded-full uppercase tracking-wider">
              {tiers.length} ACTIVE TIERS
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  <th className="pb-3 px-4">PRICE CATEGORY / TIER</th>
                  <th className="pb-3 px-4">MINIMUM PURCHASE (₹)</th>
                  <th className="pb-3 px-4">DISCOUNT APPLIED</th>
                  <th className="pb-3 px-4">MAX DISCOUNT CAP (₹)</th>
                  <th className="pb-3 px-4">EXAMPLE USER BENEFIT</th>
                  <th className="pb-3 px-4 text-right">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm">
                {tiers.map((tier, idx) => {
                  const minAmt = Number(tier.min_purchase_amount) || 0;
                  const discPerc = Number(tier.discount_percentage) || 0;
                  const maxCap = Number(tier.max_discount_cap) || 0;
                  const sampleCalc = Math.min(Math.round((minAmt * discPerc) / 100), maxCap);
                  const userPays = minAmt - sampleCalc;

                  return (
                    <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-[#15233e]/50 transition-colors">
                      <td className="py-4 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
                        <span className="size-7 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400 font-black text-xs flex items-center justify-center border border-blue-200 dark:border-blue-800/80">
                          {idx + 1}
                        </span>
                        Discount Tier {idx + 1}
                      </td>
                      <td className="py-4 px-4 font-bold text-slate-700 dark:text-slate-300">
                        ₹{minAmt.toLocaleString('en-IN')}+
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-black bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/80">
                          {discPerc}% OFF
                        </span>
                      </td>
                      <td className="py-4 px-4 font-bold text-slate-700 dark:text-slate-300">
                        ₹{maxCap.toLocaleString('en-IN')}
                      </td>
                      <td className="py-4 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
                        Buy ₹{minAmt.toLocaleString('en-IN')} → Pay <span className="font-bold text-emerald-600 dark:text-emerald-400">₹{userPays.toLocaleString('en-IN')}</span> (Save ₹{sampleCalc.toLocaleString('en-IN')})
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 size={12} />
                          Active
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};

export default GiftDiscount;
