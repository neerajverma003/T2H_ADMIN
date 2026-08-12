import React from 'react';
import { Plus, Trash2, Sparkles, Gift } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const EMOJI_OPTIONS = ['✨', '🕯️', '🏖️', '💆', '🌹', '📸', '🍷', '🚤', '⛵', '🌅', '🎉', '🎁'];

const CuratedAddonsSection = ({ formData, setFormData, isViewMode }) => {
  const addons = formData.addons || [];

  const handleAddAddon = () => {
    const newAddon = {
      id: `addon_${Date.now()}`,
      title: '',
      desc: '',
      price: 0,
      emoji: '✨',
    };
    setFormData(prev => ({
      ...prev,
      addons: [...(prev.addons || []), newAddon],
    }));
  };

  const handleRemoveAddon = (index) => {
    setFormData(prev => ({
      ...prev,
      addons: (prev.addons || []).filter((_, i) => i !== index),
    }));
  };

  const handleUpdateAddon = (index, field, value) => {
    setFormData(prev => {
      const updated = [...(prev.addons || [])];
      updated[index] = {
        ...updated[index],
        [field]: field === 'price' ? Number(value) || 0 : value,
      };
      return { ...prev, addons: updated };
    });
  };

  return (
    <div className="bg-slate-900 text-white rounded-[2.5rem] p-8 border border-slate-800 shadow-2xl mb-8">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 border-b border-slate-800 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20 shadow-inner">
            <Gift size={28} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-white tracking-tight italic">
              Curated Experiences
            </h2>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1 flex items-center gap-2">
              <Sparkles size={12} className="text-amber-500" /> Optional Add-ons for Checkout
            </p>
          </div>
        </div>

        {!isViewMode && (
          <button
            type="button"
            disabled
            className="flex items-center gap-3 bg-slate-800 text-slate-500 border border-slate-700 px-8 py-4 rounded-2xl font-black uppercase tracking-widest cursor-not-allowed opacity-50 shrink-0"
            title="Feature disabled for now"
          >
            <Plus size={20} />
            Add Experience (Disabled)
          </button>
        )}
      </div>

      {/* Experience Cards Grid */}
      {addons.length === 0 ? (
        <div className="text-center py-12 bg-slate-800/40 rounded-[2.5rem] border border-dashed border-slate-800 p-8">
          <Sparkles className="mx-auto text-amber-400 mb-3 animate-pulse" size={32} />
          <h4 className="text-base font-extrabold text-slate-200 mb-1">No curated experiences added yet</h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            If left empty, default honeymoon experiences will be displayed at checkout. Click <span className="font-bold text-amber-400">+ Add Experience</span> above to add custom experience options for this itinerary!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <AnimatePresence mode="popLayout">
            {addons.map((addon, index) => (
              <motion.div
                key={addon.id || index}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                className="relative group bg-slate-800/60 rounded-[2.5rem] p-8 border border-slate-700/80 hover:border-amber-500/50 transition-all duration-500 text-white"
              >
                {!isViewMode && (
                  <button
                    type="button"
                    onClick={() => handleRemoveAddon(index)}
                    className="absolute -top-3 -right-3 size-10 bg-slate-900 text-red-400 rounded-xl shadow-lg border border-slate-700 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all z-10 cursor-pointer"
                    title="Remove Experience"
                  >
                    <Trash2 size={18} />
                  </button>
                )}

                <div className="space-y-6">
                  {/* Emoji Select + Title Input */}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
                      Title & Emoji Icon
                    </label>
                    <div className="flex items-center gap-3">
                      <select
                        disabled={isViewMode}
                        value={addon.emoji || '✨'}
                        onChange={(e) => handleUpdateAddon(index, 'emoji', e.target.value)}
                        className="bg-slate-900 border border-slate-700 rounded-2xl px-4 py-3.5 text-2xl outline-none cursor-pointer text-white transition-all"
                      >
                        {EMOJI_OPTIONS.map(emo => (
                          <option key={emo} value={emo} className="bg-slate-900 text-white">{emo}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        disabled={isViewMode}
                        value={addon.title || ''}
                        onChange={(e) => handleUpdateAddon(index, 'title', e.target.value)}
                        placeholder="e.g. Candle Light Dinner"
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-2xl p-4 text-base font-bold text-white outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all placeholder:text-slate-500"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
                      Description
                    </label>
                    <textarea
                      rows="2"
                      disabled={isViewMode}
                      value={addon.desc || ''}
                      onChange={(e) => handleUpdateAddon(index, 'desc', e.target.value)}
                      placeholder="e.g. Private 3-course meal with romantic decor setup"
                      className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-4 text-sm font-medium text-slate-200 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all resize-none placeholder:text-slate-500 leading-relaxed"
                    />
                  </div>

                  {/* Price */}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
                      Add-on Price (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      disabled={isViewMode}
                      value={addon.price ?? 0}
                      onChange={(e) => handleUpdateAddon(index, 'price', e.target.value)}
                      placeholder="5500"
                      className="w-full sm:w-1/2 bg-slate-900 border border-slate-700 rounded-2xl p-4 text-base font-black text-amber-400 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all placeholder:text-slate-500"
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default CuratedAddonsSection;
