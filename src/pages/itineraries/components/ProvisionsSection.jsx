import { ListPlus, Ban, Sparkles, CheckCircle, XCircle } from "lucide-react";

const ProvisionsSection = ({
    formData,
    handleInputChange,
    styles,
    errors = {},
}) => {
    const { cardStyle, labelStyle, inputStyle } = styles;

    return (
        <div className={cardStyle}>
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="text-indigo-600" size={20} />
                    SERVICE PROVISIONS
                </h2>
                <div className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-widest">
                   Inclusions & Exclusions
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* INCLUSIONS */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-emerald-50 dark:border-emerald-900/20 pb-4">
                        <label className={`${labelStyle} mb-0 text-emerald-600 dark:text-emerald-400`}>
                            <CheckCircle size={14} className="mr-1" /> What’s Included
                        </label>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded-md italic">
                            Comma Separated
                        </span>
                    </div>

                    <textarea
                        name="inclusion"
                        value={formData.inclusion}
                        onChange={handleInputChange}
                        className={`${inputStyle} min-h-[220px] leading-relaxed border-emerald-100/50 dark:border-emerald-900/20 focus:ring-emerald-500/20 ${errors.inclusion ? "ring-2 ring-red-500" : ""}`}
                        placeholder="e.g. Luxury Overwater Villa, Daily Champagne Breakfast, Private Sunset Cruise..."
                    />

                    {errors.inclusion && (
                        <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest mt-2">
                            {errors.inclusion}
                        </p>
                    )}
                </div>

                {/* EXCLUSIONS */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-rose-50 dark:border-rose-900/20 pb-4">
                        <label className={`${labelStyle} mb-0 text-rose-600 dark:text-rose-400`}>
                            <XCircle size={14} className="mr-1" /> Not Included
                        </label>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded-md italic">
                            Comma Separated
                        </span>
                    </div>

                    <textarea
                        name="exclusion"
                        value={formData.exclusion}
                        onChange={handleInputChange}
                        className={`${inputStyle} min-h-[220px] leading-relaxed border-rose-100/50 dark:border-rose-900/20 focus:ring-rose-500/20 ${errors.exclusion ? "ring-2 ring-red-500" : ""}`}
                        placeholder="e.g. International Airfare, Personal Laundry, Travel Insurance..."
                    />

                    {errors.exclusion && (
                        <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest mt-2">
                            {errors.exclusion}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProvisionsSection;
