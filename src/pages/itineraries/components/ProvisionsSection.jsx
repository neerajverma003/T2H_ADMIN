import { ListPlus, Sparkles, CheckCircle, XCircle } from "lucide-react";

const ProvisionsSection = ({
    formData,
    handleInputChange,
    styles,
    errors = {},
}) => {
    const { cardStyle = "bg-white dark:bg-[#091126]/95 rounded-3xl p-7 md:p-9 border border-slate-200/90 dark:border-indigo-500/25 shadow-xl dark:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.7),0_0_30px_2px_rgba(99,102,241,0.18)] ring-1 ring-slate-900/5 dark:ring-white/5 backdrop-blur-xl space-y-7 transition-all", inputStyle } = styles || {};

    return (
        <div className={cardStyle}>
            {/* LUXURY CARD HEADER */}
            <div className="flex items-center gap-4 pb-6 border-b border-slate-200 dark:border-slate-800/80">
                <div className="size-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 shrink-0">
                    <ListPlus size={22} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Service Provisions</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Specify inclusions and exclusions for package transparency</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* INCLUSIONS */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-3">
                        <label className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-0">
                            <CheckCircle size={15} /> What’s Included
                        </label>
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400/90 uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-lg">
                            Comma / Line Separated
                        </span>
                    </div>

                    <textarea
                        name="inclusion"
                        value={formData.inclusion}
                        onChange={handleInputChange}
                        className={`${inputStyle} min-h-[220px] leading-relaxed focus:border-emerald-500/60 focus:ring-emerald-500/20 ${errors.inclusion ? "border-red-500" : ""}`}
                        placeholder="e.g. Luxury Overwater Villa, Daily Champagne Breakfast, Private Sunset Cruise, Airport Transfers..."
                    />

                    {errors.inclusion && (
                        <p className="text-xs font-bold text-red-400">
                            {errors.inclusion}
                        </p>
                    )}
                </div>

                {/* EXCLUSIONS */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-3">
                        <label className="flex items-center gap-2 text-xs font-bold text-rose-500 dark:text-rose-400 uppercase tracking-wider mb-0">
                            <XCircle size={15} /> Not Included
                        </label>
                        <span className="text-[10px] font-bold text-rose-500 dark:text-rose-400/90 uppercase tracking-wider bg-rose-500/10 border border-rose-500/20 px-2.5 py-0.5 rounded-lg">
                            Comma / Line Separated
                        </span>
                    </div>

                    <textarea
                        name="exclusion"
                        value={formData.exclusion}
                        onChange={handleInputChange}
                        className={`${inputStyle} min-h-[220px] leading-relaxed focus:border-rose-500/60 focus:ring-rose-500/20 ${errors.exclusion ? "border-red-500" : ""}`}
                        placeholder="e.g. International Airfare, Personal Laundry, Travel Insurance, Optional Excursions..."
                    />

                    {errors.exclusion && (
                        <p className="text-xs font-bold text-red-400">
                            {errors.exclusion}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProvisionsSection;
