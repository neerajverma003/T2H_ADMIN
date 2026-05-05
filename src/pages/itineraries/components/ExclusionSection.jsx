import { Ban, HeartCrack } from "lucide-react";

const ExclusionSection = ({
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
                    <Ban className="text-red-500" size={20} />
                    EXCLUSIONS
                </h2>
                <div className="px-3 py-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full text-[10px] font-black uppercase tracking-widest">
                   Not Included
                </div>
            </div>

            <div className="space-y-4">
                <label className={labelStyle}>
                    Honeymoon Exclusions
                    <span className="ml-2 text-slate-400 lowercase italic tracking-normal">(Separate with commas)</span>
                </label>

                <textarea
                    name="exclusion"
                    value={formData.exclusion}
                    onChange={handleInputChange}
                    className={`${inputStyle} min-h-[150px] leading-relaxed ${errors.exclusion ? "ring-2 ring-red-500" : ""}`}
                    placeholder="e.g. International Airfare, Personal Laundry, Travel Insurance..."
                />

                {errors.exclusion && (
                    <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest mt-2">
                        {errors.exclusion}
                    </p>
                )}
            </div>
        </div>
    );
};

export default ExclusionSection;
