import { ListPlus, Heart, Sparkles } from "lucide-react";

const InclusionSection = ({
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
                    <ListPlus className="text-indigo-600" size={20} />
                    INCLUSIONS
                </h2>
                <div className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-widest">
                   The Perks
                </div>
            </div>

            <div className="space-y-4">
                <label className={labelStyle}>
                    What’s Included 
                    <span className="ml-2 text-slate-400 lowercase italic tracking-normal">(Separate with commas for best display)</span>
                </label>

                <textarea
                    name="inclusion"
                    value={formData.inclusion}
                    onChange={handleInputChange}
                    className={`${inputStyle} min-h-[150px] leading-relaxed ${errors.inclusion ? "ring-2 ring-red-500" : ""}`}
                    placeholder="e.g. Luxury Overwater Villa, Daily Champagne Breakfast, Private Sunset Cruise..."
                />

                {errors.inclusion && (
                    <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest mt-2">
                        {errors.inclusion}
                    </p>
                )}
            </div>
        </div>
    );
};

export default InclusionSection;
