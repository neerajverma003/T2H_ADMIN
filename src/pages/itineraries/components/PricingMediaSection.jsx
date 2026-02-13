import {
    IndianRupee,
    Percent,
    BadgeIndianRupee,
    Heart,
} from "lucide-react";

const PricingSection = ({
    formData,
    handleInputChange,
    styles,
}) => {
    const { cardStyle, labelStyle, inputStyle } = styles;

    return (
        <div className={cardStyle}>
            <h2 className="text-xl font-semibold mb-4 border-b border-gray-700 pb-2 flex items-center gap-2">
                <Heart className="text-pink-500" size={20} />
                Honeymoon Pricing
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Standard Price */}
                <div>
                    <label htmlFor="pricing" className={labelStyle}>
                        <IndianRupee className="inline mr-1" size={16} />
                        Package Price
                    </label>
                    <input
                        type="number"
                        name="pricing"
                        id="pricing"
                        value={formData.pricing}
                        onChange={handleInputChange}
                        className={inputStyle}
                        placeholder="Total honeymoon package price"
                        min={0}
                    />
                </div>

                {/* Best Offer */}
                <div>
                    <label htmlFor="best_price" className={labelStyle}>
                        <BadgeIndianRupee
                            className="inline mr-1"
                            size={16}
                        />
                        Special Honeymoon Offer (optional)
                    </label>
                    <input
                        type="number"
                        name="best_price"
                        id="best_price"
                        value={formData.best_price || ""}
                        onChange={handleInputChange}
                        className={inputStyle}
                        placeholder="Special discounted price"
                        min={0}
                    />
                </div>

                {/* Discount */}
                <div className="md:col-span-2">
                    <label htmlFor="discount" className={labelStyle}>
                        <Percent className="inline mr-1" size={16} />
                        Discount Percentage (optional)
                    </label>
                    <input
                        type="number"
                        name="discount"
                        id="discount"
                        value={formData.discount || ""}
                        onChange={handleInputChange}
                        className={inputStyle}
                        placeholder="e.g. 10"
                        min={0}
                        max={100}
                    />
                </div>
            </div>

            <p className="mt-4 text-sm text-muted-foreground">
                💡 Tip: Honeymoon packages often include seasonal or limited-time offers.
            </p>
        </div>
    );
};

export default PricingSection;
