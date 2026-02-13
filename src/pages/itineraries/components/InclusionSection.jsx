import { ListPlus, Heart } from "lucide-react";

const InclusionSection = ({
    formData,
    handleInputChange,
    styles,
    errors = {},
}) => {
    const { cardStyle, labelStyle, inputStyle } = styles;

    return (
        <div className={cardStyle}>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Heart className="text-pink-500" size={20} />
                Honeymoon Inclusions
            </h2>

            <label className={labelStyle}>
                <ListPlus className="inline mr-2" size={16} />
                What’s Included
                <span className="ml-1 text-xs text-muted-foreground">
                    (comma separated)
                </span>
            </label>

            <textarea
                name="inclusion"
                rows={4}
                value={formData.inclusion}
                onChange={handleInputChange}
                className={`${inputStyle} ${
                    errors.inclusion ? "border-red-500 focus:ring-red-500" : ""
                }`}
                placeholder="Romantic hotel stay, candle light dinner, private transfers, honeymoon cake"
                maxLength={50000}
            />

            {errors.inclusion && (
                <p className="text-red-500 text-sm mt-1">
                    {errors.inclusion}
                </p>
            )}
        </div>
    );
};

export default InclusionSection;
