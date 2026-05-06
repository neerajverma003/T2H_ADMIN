import { useEffect, useState } from "react";
import { IndianRupee, Percent, Heart, Sparkles, Tag, Receipt } from "lucide-react";

const PricingSection = ({ formData, handleInputChange, styles }) => {
    const { labelStyle, inputStyle, cardStyle } = styles;

    const isQuoteBased = formData.pricing === "As per the destination" || formData.pricing === "As per best quote";
    const [isBestQuote, setIsBestQuote] = useState(isQuoteBased);

    const [standardPrice, setStandardPrice] = useState(typeof formData.pricing === "object" ? formData.pricing.standard_price || "" : "");
    const [discountedPrice, setDiscountedPrice] = useState(typeof formData.pricing === "object" ? formData.pricing.discounted_price || "" : "");

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
            handleInputChange({ target: { name: "pricing", value: "As per best quote" } });
        } else {
            handleInputChange({ target: { name: "pricing", value: { standard_price: Number(standardPrice) || 0, discounted_price: Number(discountedPrice) || 0 } } });
        }
    };

    const handleStandardPriceChange = (e) => {
        const value = e.target.value;
        setStandardPrice(value);
        handleInputChange({ target: { name: "pricing", value: { standard_price: Number(value) || 0, discounted_price: Number(discountedPrice) || 0 } } });
    };

    const handleDiscountedPriceChange = (e) => {
        const value = e.target.value;
        setDiscountedPrice(value);
        handleInputChange({ target: { name: "pricing", value: { standard_price: Number(standardPrice) || 0, discounted_price: Number(value) || 0 } } });
    };

    return (
        <div className={cardStyle}>
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <Receipt className="text-indigo-600" size={20} />
                    PRICING ENGINE
                </h2>
                <div className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-widest">
                   Value Proposition
                </div>
            </div>

            <div className="space-y-8">
                {/* Quote toggle */}
                <label className={`flex items-center gap-4 p-6 rounded-3xl border-2 transition-all cursor-pointer ${isBestQuote ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800' : 'border-transparent bg-slate-50 dark:bg-slate-800/50'}`}>
                    <input type="checkbox" checked={isBestQuote} onChange={handleBestQuoteToggle} className="accent-indigo-600 size-5 rounded" />
                    <div className="flex-1">
                       <p className={`text-sm font-black uppercase tracking-widest ${isBestQuote ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`}>Price on Request / Best Quote</p>
                       <p className="text-[10px] text-slate-700 font-bold mt-0.5 tracking-wide">Enable this if pricing depends on seasonal availability or customization.</p>
                    </div>
                </label>

                {!isBestQuote && (
                    <div className="space-y-10 pt-4">
                        <div>
                            <label className={labelStyle}><IndianRupee size={16} className="text-indigo-600" /> Standard Registry Price</label>
                            <div className="relative group">
                                <div className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-slate-700 group-focus-within:text-indigo-700 text-2xl transition-colors">₹</div>
                                <input
                                    type="number"
                                    value={standardPrice}
                                    onChange={handleStandardPriceChange}
                                    className={`${inputStyle} text-2xl font-bold pl-14`}
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        <div>
                            <label className={labelStyle}><Tag size={16} className="text-emerald-600" /> Promotional / Offer Tier Price</label>
                            <div className="relative group">
                                <div className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-emerald-400 group-focus-within:text-emerald-600 text-2xl transition-colors">₹</div>
                                <input
                                    type="number"
                                    value={discountedPrice}
                                    onChange={handleDiscountedPriceChange}
                                    className={`${inputStyle} text-2xl font-bold pl-14 border-emerald-100 dark:border-emerald-900/20 bg-emerald-50/30 dark:bg-emerald-950/10 focus:ring-emerald-500/10 focus:border-emerald-600/30`}
                                    placeholder="0.00 (Optional)"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {isBestQuote && (
                    <div className="p-6 rounded-3xl bg-indigo-50/50 dark:bg-indigo-950/10 border border-indigo-100 dark:border-indigo-900/20 flex items-start gap-4">
                        <Sparkles size={18} className="text-indigo-600 mt-1" />
                        <p className="text-xs font-bold text-slate-700 leading-relaxed italic">
                            Smart Quote Enabled: Detailed pricing will be calculated based on the couple's specific travel dates, cabin preferences, and available honeymoon bonuses.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PricingSection;
