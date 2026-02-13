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
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <HeartCrack className="text-red-500" size={20} />
                Honeymoon Exclusions
            </h2>

            <label className={labelStyle}>
                <Ban className="inline mr-2" size={16} />
                What’s Not Included
                <span className="ml-1 text-xs text-muted-foreground">
                    (comma separated)
                </span>
            </label>

            <textarea
                name="exclusion"
                rows={4}
                value={formData.exclusion}
                onChange={handleInputChange}
                className={`${inputStyle} ${
                    errors.exclusion ? "border-red-500 focus:ring-red-500" : ""
                }`}
                placeholder="Airfare, personal expenses, travel insurance, optional activities"
                maxLength={50000}
            />

            {errors.exclusion && (
                <p className="text-red-500 text-sm mt-1">
                    {errors.exclusion}
                </p>
            )}
        </div>
    );
};

export default ExclusionSection;
