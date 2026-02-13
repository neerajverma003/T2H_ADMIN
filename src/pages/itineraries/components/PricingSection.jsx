import { useEffect, useState } from "react";
import { IndianRupee, Percent, Heart } from "lucide-react";

const PricingSection = ({ formData, handleInputChange, styles }) => {
    const { labelStyle, inputStyle, cardStyle } = styles;

    // Determine if pricing is quote-based
    const isQuoteBased =
        formData.pricing === "As per the destination" ||
        formData.pricing === "As per best quote";

    const [isBestQuote, setIsBestQuote] = useState(isQuoteBased);

    const [standardPrice, setStandardPrice] = useState(
        typeof formData.pricing === "object"
            ? formData.pricing.standard_price || ""
            : ""
    );

    const [discountedPrice, setDiscountedPrice] = useState(
        typeof formData.pricing === "object"
            ? formData.pricing.discounted_price || ""
            : ""
    );

    // Sync local state if pricing changes externally
    useEffect(() => {
        if (typeof formData.pricing === "object") {
            setStandardPrice(formData.pricing.standard_price || "");
            setDiscountedPrice(formData.pricing.discounted_price || "");
            setIsBestQuote(false);
        } else if (typeof formData.pricing === "string") {
            setIsBestQuote(true);
        }
    }, [formData.pricing]);

    const handleBestQuoteToggle = (e) => {
        const checked = e.target.checked;
        setIsBestQuote(checked);

        if (checked) {
            handleInputChange({
                target: {
                    name: "pricing",
                    value: "As per best quote",
                },
            });
        } else {
            handleInputChange({
                target: {
                    name: "pricing",
                    value: {
                        standard_price: Number(standardPrice) || 0,
                        discounted_price: Number(discountedPrice) || 0,
                    },
                },
            });
        }
    };

    const handleStandardPriceChange = (e) => {
        const value = e.target.value;
        setStandardPrice(value);

        handleInputChange({
            target: {
                name: "pricing",
                value: {
                    standard_price: Number(value) || 0,
                    discounted_price: Number(discountedPrice) || 0,
                },
            },
        });
    };

    const handleDiscountedPriceChange = (e) => {
        const value = e.target.value;
        setDiscountedPrice(value);

        handleInputChange({
            target: {
                name: "pricing",
                value: {
                    standard_price: Number(standardPrice) || 0,
                    discounted_price: Number(value) || 0,
                },
            },
        });
    };

    return (
        <div className={cardStyle}>
            <h2 className="text-xl font-semibold mb-4 border-b border-gray-700 pb-2 flex items-center gap-2">
                <Heart className="text-pink-500" size={20} />
                Honeymoon Pricing
            </h2>

            {/* Quote toggle */}
            <div className="mb-4">
                <label htmlFor="best_quote_toggle" className={labelStyle}>
                    <input
                        type="checkbox"
                        id="best_quote_toggle"
                        checked={isBestQuote}
                        onChange={handleBestQuoteToggle}
                        className="mr-2"
                    />
                    <IndianRupee
                        className="inline mr-1 text-muted-foreground"
                        size={16}
                    />
                    Price on Request / Best Quote
                </label>
            </div>

            {/* Fixed pricing */}
            {!isBestQuote && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label
                            htmlFor="standard_price"
                            className={labelStyle}
                        >
                            <IndianRupee
                                className="inline mr-1 text-muted-foreground"
                                size={16}
                            />
                            Standard Package Price
                        </label>
                        <input
                            type="number"
                            id="standard_price"
                            value={standardPrice}
                            onChange={handleStandardPriceChange}
                            className={inputStyle}
                            placeholder="Total honeymoon package price"
                            min={0}
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label
                            htmlFor="discounted_price"
                            className={labelStyle}
                        >
                            <Percent
                                className="inline mr-1 text-muted-foreground"
                                size={16}
                            />
                            Discounted / Offer Price
                        </label>
                        <input
                            type="number"
                            id="discounted_price"
                            value={discountedPrice}
                            onChange={handleDiscountedPriceChange}
                            className={inputStyle}
                            placeholder="Special honeymoon offer price (optional)"
                            min={0}
                        />
                    </div>
                </div>
            )}

            {isBestQuote && (
                <p className="mt-3 text-sm italic text-muted-foreground">
                    💡 Pricing will be shared after understanding the couple’s
                    preferences and travel dates.
                </p>
            )}
        </div>
    );
};

export default PricingSection;
