import { useEffect, useState, useMemo } from "react";
import { DollarSign, Sparkles, TrendingUp, ShieldCheck, RotateCcw, Trash2 } from "lucide-react";
import { apiClient } from "../../../stores/authStores";

const ALL_CATEGORIES = [
    { key: "standard", label: "STANDARD", color: "indigo", tierMatch: "standard" },
    { key: "deluxe", label: "DELUXE", color: "sky", tierMatch: "deluxe" },
    { key: "super_deluxe", label: "SUPER DELUXE", color: "purple", tierMatch: "super deluxe" },
    { key: "luxury", label: "LUXURY", color: "amber", tierMatch: "luxury" }
];

const PricingSection = ({ formData, handleInputChange, setFormData, styles }) => {
    const { labelStyle, inputStyle, cardStyle } = styles || {
        labelStyle: "text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 block",
        inputStyle: "w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-3 text-sm font-bold outline-none",
        cardStyle: "bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-xl"
    };

    const isQuoteBased = formData?.hotel_as_per_category === "As per best quote" || 
                         formData?.pricing === "As per the destination" || 
                         formData?.pricing === "As per best quote" || 
                         Boolean(formData?.pricing?.is_price_on_request);

    const [isBestQuote, setIsBestQuote] = useState(isQuoteBased);
    const [destinationHotels, setDestinationHotels] = useState([]);

    const [categoryPrices, setCategoryPrices] = useState({
        standard: { hotel_price: "", discounted_price: "" },
        deluxe: { hotel_price: "", discounted_price: "" },
        super_deluxe: { hotel_price: "", discounted_price: "" },
        luxury: { hotel_price: "", discounted_price: "" },
    });

    // Fetch hotels for destination to filter available category cards strictly
    useEffect(() => {
        const destId = formData?.selected_destination_id || 
                       (typeof formData?.selected_destination === 'object' ? formData?.selected_destination?._id : (typeof formData?.selected_destination === 'string' && formData?.selected_destination.length === 24 ? formData?.selected_destination : null));

        const destName = formData?.selected_destination_name || 
                         (typeof formData?.selected_destination === 'object' ? formData?.selected_destination?.destination_name : null) ||
                         (typeof formData?.selected_destination === 'string' && formData?.selected_destination.length !== 24 ? formData?.selected_destination : null);

        if (!destId && !destName) {
            setDestinationHotels([]);
            return;
        }

        const fetchHotels = async () => {
            try {
                let dHotels = [];
                if (destId) {
                    const res = await apiClient.get(`/admin/hotel/all?destination=${destId}&limit=500`).catch(() => ({ data: {} }));
                    if (res.data?.success) dHotels = res.data.data || [];
                }

                const allRes = await apiClient.get(`/admin/hotel/all?limit=500`).catch(() => ({ data: {} }));
                let allHotels = allRes.data?.data || [];

                const matched = allHotels.filter((h) => {
                    if (!h) return false;
                    const hDestId = typeof h.destination === 'object' ? h.destination?._id : h.destination;
                    const hDestName = (typeof h.destination === 'object' ? (h.destination?.destination_name || h.destination?.name) : "") || "";
                    const matchId = destId && hDestId === destId;
                    const matchName = destName && hDestName && hDestName.toLowerCase().trim() === destName.toLowerCase().trim();
                    return matchId || matchName;
                });

                const hotelMap = new Map();
                [...dHotels, ...matched].forEach((h) => {
                    if (h && (h._id || h.id)) {
                        hotelMap.set(String(h._id || h.id), h);
                    }
                });
                const pool = Array.from(hotelMap.values());
                setDestinationHotels(pool);
            } catch (err) {
                console.error("Error fetching destination hotels for pricing section:", err);
            }
        };

        fetchHotels();
    }, [formData?.selected_destination_id, formData?.selected_destination]);

    // Compute active categories strictly based on hotels available for this destination or assigned in stay_hotels
    const activeCategories = useMemo(() => {
        const availableTiers = new Set();

        // 1. Check destinationHotels pool
        if (destinationHotels && destinationHotels.length > 0) {
            destinationHotels.forEach((h) => {
                if (!h?.hotel_tier) return;
                const tLower = h.hotel_tier.trim().toLowerCase();
                if (tLower.includes("super")) {
                    availableTiers.add("super_deluxe");
                } else if (tLower.includes("deluxe")) {
                    availableTiers.add("deluxe");
                } else if (tLower.includes("standard")) {
                    availableTiers.add("standard");
                } else if (tLower.includes("luxury")) {
                    availableTiers.add("luxury");
                }
            });
        }

        // 2. Check stay_hotels mapping if any hotels are explicitly selected
        if (formData?.stay_hotels && Array.isArray(formData.stay_hotels)) {
            formData.stay_hotels.forEach((sh) => {
                if (sh?.standard_hotel) availableTiers.add("standard");
                if (sh?.deluxe_hotel) availableTiers.add("deluxe");
                if (sh?.super_deluxe_hotel) availableTiers.add("super_deluxe");
                if (sh?.luxury_hotel) availableTiers.add("luxury");
            });
        }

        // 3. Check existing pricing categories if prices are already saved (> 0)
        if (formData?.pricing && typeof formData.pricing === "object" && formData.pricing.categories) {
            Object.keys(formData.pricing.categories).forEach((catKey) => {
                const catObj = formData.pricing.categories[catKey];
                if (catObj && (Number(catObj.hotel_price) > 0 || Number(catObj.discounted_price) > 0)) {
                    availableTiers.add(catKey);
                }
            });
        }

        if (availableTiers.size === 0) {
            return [];
        }

        return ALL_CATEGORIES.filter((cat) => availableTiers.has(cat.key));
    }, [destinationHotels, formData?.stay_hotels, formData?.pricing]);

    useEffect(() => {
        const quoteActive = formData?.hotel_as_per_category === "As per best quote" || 
                            formData?.pricing === "As per the destination" || 
                            formData?.pricing === "As per best quote" || 
                            Boolean(formData?.pricing?.is_price_on_request);

        setIsBestQuote(quoteActive);

        if (typeof formData?.pricing === "object" && formData.pricing !== null) {
            const cats = formData.pricing.categories || {};

            const parsePos = (val) => {
                const n = Number(val);
                if (!isNaN(n) && n > 0) return n;
                return "";
            };

            setCategoryPrices({
                standard: {
                    hotel_price: parsePos(cats.standard?.hotel_price, ""),
                    discounted_price: parsePos(cats.standard?.discounted_price, "")
                },
                deluxe: {
                    hotel_price: parsePos(cats.deluxe?.hotel_price, ""),
                    discounted_price: parsePos(cats.deluxe?.discounted_price, "")
                },
                super_deluxe: {
                    hotel_price: parsePos(cats.super_deluxe?.hotel_price, ""),
                    discounted_price: parsePos(cats.super_deluxe?.discounted_price, "")
                },
                luxury: {
                    hotel_price: parsePos(cats.luxury?.hotel_price, ""),
                    discounted_price: parsePos(cats.luxury?.discounted_price, "")
                }
            });
        }
    }, [formData?.pricing, formData?.hotel_as_per_category]);

    const getLowestPositivePrice = (cats) => {
        let lowestStd = 0;
        let lowestDisc = 0;

        for (const catKey of activeCategories.map(c => c.key)) {
            const hPrice = Number(cats[catKey]?.hotel_price);
            const dPrice = Number(cats[catKey]?.discounted_price);

            if (!isNaN(hPrice) && hPrice > 0) {
                if (lowestStd === 0 || hPrice < lowestStd) lowestStd = hPrice;
            }
            if (!isNaN(dPrice) && dPrice > 0) {
                if (lowestDisc === 0 || dPrice < lowestDisc) lowestDisc = dPrice;
            }
        }

        const finalStd = lowestStd > 0 ? lowestStd : lowestDisc;
        const finalDisc = lowestDisc > 0 ? lowestDisc : finalStd;

        return { finalStd, finalDisc };
    };

    const syncPricingToParent = (updatedCats, bestQuoteFlag) => {
        if (bestQuoteFlag) {
            if (setFormData) {
                setFormData((prev) => ({
                    ...prev,
                    hotel_as_per_category: "As per best quote",
                    pricing: "As per best quote"
                }));
            } else if (handleInputChange) {
                handleInputChange({ target: { name: "pricing", value: "As per best quote" } });
                handleInputChange({ target: { name: "hotel_as_per_category", value: "As per best quote" } });
            }
            return;
        }

        const { finalStd, finalDisc } = getLowestPositivePrice(updatedCats);

        const pricingPayload = {
            standard_price: finalStd,
            discounted_price: finalDisc,
            categories: updatedCats
        };

        if (setFormData) {
            setFormData((prev) => ({
                ...prev,
                hotel_as_per_category: "",
                pricing: pricingPayload
            }));
        } else if (handleInputChange) {
            handleInputChange({ target: { name: "pricing", value: pricingPayload } });
            handleInputChange({ target: { name: "hotel_as_per_category", value: "" } });
        }
    };

    const handleBestQuoteToggle = (e) => {
        const checked = e.target.checked;
        setIsBestQuote(checked);
        syncPricingToParent(categoryPrices, checked);
    };

    const handleCategoryPriceChange = (catKey, field, rawValue) => {
        const valNum = Number(rawValue);
        const cleanVal = rawValue === "" ? "" : (!isNaN(valNum) && valNum >= 0 ? valNum : "");

        const updated = {
            ...categoryPrices,
            [catKey]: {
                ...categoryPrices[catKey],
                [field]: cleanVal
            }
        };
        setCategoryPrices(updated);
        syncPricingToParent(updated, isBestQuote);
    };

    const handleClearAllPrices = () => {
        const emptyCats = {
            standard: { hotel_price: "", discounted_price: "" },
            deluxe: { hotel_price: "", discounted_price: "" },
            super_deluxe: { hotel_price: "", discounted_price: "" },
            luxury: { hotel_price: "", discounted_price: "" },
        };
        setCategoryPrices(emptyCats);
        syncPricingToParent(emptyCats, isBestQuote);
    };

    const handleClearCategoryPrice = (catKey) => {
        const updated = {
            ...categoryPrices,
            [catKey]: { hotel_price: "", discounted_price: "" }
        };
        setCategoryPrices(updated);
        syncPricingToParent(updated, isBestQuote);
    };

    return (
        <div className={cardStyle}>
            {/* LUXURY CARD HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800/80">
                <div className="flex items-center gap-4">
                    <div className="size-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 shrink-0">
                        <DollarSign size={22} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Hotel Category Pricing</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                            Set base and discounted rates for destination hotel categories {activeCategories.length > 0 ? `(${activeCategories.map(c => c.label).join(" / ")})` : ""}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    {!isBestQuote && (
                        <button
                            type="button"
                            onClick={handleClearAllPrices}
                            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-red-500/20 bg-red-500/10 text-red-500 dark:text-red-400 hover:bg-red-500 hover:text-white transition-all font-bold text-xs uppercase tracking-wider cursor-pointer"
                            title="Clear all category prices"
                        >
                            <RotateCcw size={13} /> Clear Prices
                        </button>
                    )}

                    {/* AS PER BEST QUOTE CHECKBOX TOGGLE */}
                    <label className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all cursor-pointer shrink-0 ${isBestQuote ? 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-500/50 shadow-sm' : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#050A17] hover:border-slate-300 dark:hover:border-slate-700'}`}>
                        <input 
                            type="checkbox" 
                            checked={isBestQuote} 
                            onChange={handleBestQuoteToggle} 
                            className="accent-indigo-500 size-4 rounded cursor-pointer" 
                        />
                        <span className={`text-xs font-bold uppercase tracking-wider ${isBestQuote ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'}`}>
                            AS PER BEST QUOTE
                        </span>
                    </label>
                </div>
            </div>

            {/* DYNAMIC CATEGORY CARDS GRID */}
            {!isBestQuote ? (
                activeCategories.length > 0 ? (
                    <div className={`grid grid-cols-1 gap-6 ${activeCategories.length === 1 ? 'max-w-md' : activeCategories.length === 2 ? 'sm:grid-cols-2 max-w-2xl' : 'sm:grid-cols-2 lg:grid-cols-4'}`}>
                        {activeCategories.map((cat) => (
                            <div key={cat.key} className="p-6 rounded-3xl bg-slate-50/90 dark:bg-[#050A17] border border-slate-200/90 dark:border-slate-800/90 space-y-4 shadow-inner">
                                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-3">
                                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                                        <TrendingUp size={14} /> {cat.label}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => handleClearCategoryPrice(cat.key)}
                                        className="text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors flex items-center gap-1 cursor-pointer"
                                        title={`Clear ${cat.label} price`}
                                    >
                                        <Trash2 size={12} /> Clear
                                    </button>
                                </div>

                                <div className="space-y-3.5">
                                    <div>
                                        <label className={labelStyle}>HOTEL PRICE</label>
                                        <div className="relative">
                                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400 dark:text-slate-500 text-xs">₹</span>
                                            <input
                                                type="number"
                                                min="0"
                                                value={categoryPrices[cat.key]?.hotel_price ?? ""}
                                                onChange={(e) => handleCategoryPriceChange(cat.key, "hotel_price", e.target.value)}
                                                className={`${inputStyle} pl-8 text-slate-900 dark:text-white font-bold text-sm`}
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className={labelStyle}>DISCOUNTED PRICE</label>
                                        <div className="relative">
                                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-emerald-500 dark:text-emerald-400 text-xs">₹</span>
                                            <input
                                                type="number"
                                                min="0"
                                                value={categoryPrices[cat.key]?.discounted_price ?? ""}
                                                onChange={(e) => handleCategoryPriceChange(cat.key, "discounted_price", e.target.value)}
                                                className={`${inputStyle} pl-8 text-emerald-600 dark:text-emerald-400 font-bold text-sm border-emerald-500/30 focus:border-emerald-500/60`}
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-10 rounded-2xl bg-slate-50 dark:bg-[#050A17] border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center space-y-2 py-12">
                        <div className="size-12 rounded-xl bg-white dark:bg-[#091126] border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 font-bold text-xl shadow-sm">
                            ₹
                        </div>
                        <p className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                            Assign hotels above to enable category-wise pricing.
                        </p>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                            Select hotels in Accommodation Setup first
                        </p>
                    </div>
                )
            ) : (
                <div className="p-6 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/20 border border-indigo-500/30 flex items-start gap-4">
                    <Sparkles size={22} className="text-indigo-500 dark:text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                            As Per Best Quote Active
                        </p>
                        <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                            Custom pricing for each category will be calculated and provided on request based on client travel dates and seasonal availability.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PricingSection;
