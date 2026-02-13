import React, { useEffect, useState } from "react";
import { IndianRupee, Percent } from "lucide-react";

const PricingSection = ({ formData, handleInputChange, styles }) => {
  const { labelStyle, inputStyle, cardStyle } = styles;

  const [isBestQuote, setIsBestQuote] = useState(
    formData.pricing === "As per the destination"
  );

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

  // 🔄 Sync state when formData changes externally
  useEffect(() => {
    if (formData.pricing === "As per the destination") {
      setIsBestQuote(true);
    } else if (typeof formData.pricing === "object") {
      setIsBestQuote(false);
      setStandardPrice(formData.pricing.standard_price || "");
      setDiscountedPrice(formData.pricing.discounted_price || "");
    }
  }, [formData.pricing]);

  const handleBestQuoteToggle = (e) => {
    const checked = e.target.checked;
    setIsBestQuote(checked);

    handleInputChange({
      target: {
        name: "pricing",
        value: checked
          ? "As per the destination"
          : {
              standard_price: Number(standardPrice) || 0,
              discounted_price: Number(discountedPrice) || 0,
            },
      },
    });
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
    <div className={`${cardStyle} border border-pink-200 dark:border-pink-900`}>
      <h2 className="mb-4 border-b border-pink-200 pb-2 text-xl font-bold text-pink-600 dark:border-pink-900">
        Honeymoon Pricing 💕
      </h2>

      {/* 💍 Best Quote Toggle */}
      <div className="mb-4 rounded-lg bg-pink-50 p-3 dark:bg-pink-900/20">
        <label htmlFor="best_quote_toggle" className={`${labelStyle} flex items-center`}>
          <input
            type="checkbox"
            id="best_quote_toggle"
            checked={isBestQuote}
            onChange={handleBestQuoteToggle}
            className="mr-3 h-4 w-4 accent-pink-500"
          />
          <IndianRupee className="inline mr-2 text-pink-500" size={16} />
          As per best quote (Custom honeymoon pricing)
        </label>
      </div>

      {!isBestQuote && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Standard Price */}
          <div>
            <label htmlFor="standard_price" className={labelStyle}>
              <IndianRupee className="inline mr-2 text-pink-500" size={16} />
              Standard Price
            </label>
            <input
              type="number"
              id="standard_price"
              value={standardPrice}
              onChange={handleStandardPriceChange}
              className={`${inputStyle} focus:ring-pink-300 focus:border-pink-400`}
              placeholder="Base honeymoon package price"
            />
          </div>

          {/* Discounted Price */}
          <div className="md:col-span-2">
            <label htmlFor="discounted_price" className={labelStyle}>
              <Percent className="inline mr-2 text-pink-500" size={16} />
              Discounted Price
            </label>
            <input
              type="number"
              id="discounted_price"
              value={discountedPrice}
              onChange={handleDiscountedPriceChange}
              className={`${inputStyle} focus:ring-pink-300 focus:border-pink-400`}
              placeholder="Special honeymoon offer price"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PricingSection;
