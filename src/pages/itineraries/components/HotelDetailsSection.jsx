import { useState, useEffect } from "react";
import { Hotel, Heart, Building, MapPin, Plus, Trash2, Star, Sparkles, Building2, Lock, ChevronDown } from "lucide-react";
import { apiClient } from "../../../stores/authStores";
import { usePlaceStore } from "../../../stores/usePlaceStore";

const HotelDetailsSection = ({
    formData,
    setFormData,
    handleInputChange,
    styles,
}) => {
    const { cardStyle = "bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-xl" } = styles || {};
    const isChecked = formData?.hotel_as_per_category === "As per category";

    const { destinationList } = usePlaceStore();
    const [cityOptions, setCityOptions] = useState([]);
    const [allHotels, setAllHotels] = useState([]);
    const [destinationHotels, setDestinationHotels] = useState([]);
    const [selectedDestObj, setSelectedDestObj] = useState(null);
    const [loadingHotels, setLoadingHotels] = useState(false);

    // Fetch all hotels to populate properties when city is selected
    useEffect(() => {
        const fetchAllHotels = async () => {
            setLoadingHotels(true);
            try {
                const hotelsRes = await apiClient.get("/admin/hotel/all?limit=500");
                if (hotelsRes.data?.success) {
                    setAllHotels(hotelsRes.data.data || []);
                }
            } catch (err) {
                console.error("Failed to load hotel data for itinerary:", err);
            } finally {
                setLoadingHotels(false);
            }
        };

        fetchAllHotels();
    }, []);

    // React to selected destination changes: fetch ONLY hotels for this destination
    useEffect(() => {
        const destId = formData?.selected_destination_id ||
            (typeof formData?.selected_destination === 'object' ? formData?.selected_destination?._id : (typeof formData?.selected_destination === 'string' && formData?.selected_destination.length === 24 ? formData?.selected_destination : null));

        const destName = formData?.selected_destination_name ||
            (typeof formData?.selected_destination === 'object' ? formData?.selected_destination?.destination_name : null) ||
            (typeof formData?.selected_destination === 'string' && formData?.selected_destination.length !== 24 ? formData?.selected_destination : null);

        const destObj = destinationList.find((d) => d._id === destId || d.destination_name === destName);
        setSelectedDestObj(destObj || (destName ? { destination_name: destName } : null));

        if (!destId && !destName) {
            setDestinationHotels([]);
            setCityOptions([]);
            return;
        }

        const fetchDestinationHotelsAndCities = async () => {
            try {
                let dHotels = [];

                // 1. Query API for hotels linked to this destination ID
                if (destId) {
                    const destHotelsRes = await apiClient.get(`/admin/hotel/all?destination=${destId}&limit=500`).catch(() => ({ data: {} }));
                    if (destHotelsRes.data?.success) {
                        dHotels = destHotelsRes.data.data || [];
                    }
                }

                // 2. Filter strictly by matching destination ID or destination name across allHotels pool
                const matchedHotels = allHotels.filter((h) => {
                    if (!h) return false;
                    const hDestId = typeof h.destination === 'object' ? h.destination?._id : h.destination;
                    const hDestName = (typeof h.destination === 'object' ? (h.destination?.destination_name || h.destination?.name) : "") || "";

                    const matchId = destId && hDestId === destId;
                    const matchName = destName && hDestName && hDestName.toLowerCase().trim() === destName.toLowerCase().trim();

                    return matchId || matchName;
                });

                const hotelMap = new Map();
                [...dHotels, ...matchedHotels].forEach((h) => {
                    if (h && (h._id || h.id)) {
                        hotelMap.set(String(h._id || h.id), h);
                    }
                });
                const strictPool = Array.from(hotelMap.values());
                setDestinationHotels(strictPool);

                // Extract cities strictly from destination hotels
                const hotelCities = Array.from(new Set(strictPool.map((h) => h.city_name).filter(Boolean)));
                setCityOptions(hotelCities);

                // Auto-populate stay locations if none exist yet and cities/hotels exist
                if ((!formData?.stay_hotels || formData.stay_hotels.length === 0) && hotelCities.length > 0) {
                    const autoStops = hotelCities.slice(0, 3).map((city) => {
                        const cityLocLower = city.trim().toLowerCase();
                        const cityHotels = strictPool.filter(
                            (h) => h.city_name && h.city_name.trim().toLowerCase() === cityLocLower
                        );

                        const stopObj = { location: city };
                        tiers.forEach((t) => {
                            const match = cityHotels.find(
                                (h) => h.hotel_tier && h.hotel_tier.toLowerCase() === t.tierName.toLowerCase()
                            );
                            stopObj[t.key] = match ? match._id : "";
                        });
                        return stopObj;
                    });

                    if (autoStops.length > 0 && setFormData) {
                        setFormData((prev) => ({ ...prev, stay_hotels: autoStops }));
                    }
                }
            } catch (err) {
                console.error("Error fetching destination hotel cities:", err);
            }
        };

        fetchDestinationHotelsAndCities();
    }, [formData?.selected_destination_id, formData?.selected_destination, destinationList, allHotels]);

    const stayHotels = formData?.stay_hotels || [];

    // Helper to update a specific stay location stop field
    const handleStayHotelChange = (index, field, value) => {
        const updated = [...stayHotels];
        const currentStop = { ...updated[index], [field]: value };

        // If location changed, attempt to auto-select tier hotels for that city if available
        if (field === "location") {
            const locLower = (value || "").trim().toLowerCase();
            if (locLower) {
                const cityHotels = destinationHotels.filter(
                    (h) => h.city_name && h.city_name.trim().toLowerCase() === locLower
                );

                tiers.forEach((t) => {
                    const matchingTierHotel = cityHotels.find(
                        (h) => h.hotel_tier && h.hotel_tier.toLowerCase() === t.tierName.toLowerCase()
                    );
                    if (matchingTierHotel) {
                        currentStop[t.key] = matchingTierHotel._id;
                    } else {
                        currentStop[t.key] = "";
                    }
                });
            } else {
                tiers.forEach((t) => {
                    currentStop[t.key] = "";
                });
            }
        }

        updated[index] = currentStop;
        if (setFormData) {
            setFormData({ ...formData, stay_hotels: updated });
        }
    };

    // Add another city stop
    const addCityStop = () => {
        const newStop = {
            location: "",
            standard_hotel: "",
            deluxe_hotel: "",
            super_deluxe_hotel: "",
            luxury_hotel: "",
        };
        const updated = [...stayHotels, newStop];
        if (setFormData) {
            setFormData({ ...formData, stay_hotels: updated });
        }
    };

    // Remove a city stop
    const removeCityStop = (index) => {
        const updated = stayHotels.filter((_, i) => i !== index);
        if (setFormData) {
            setFormData({ ...formData, stay_hotels: updated });
        }
    };

    // Helper to filter hotels strictly matching selected city location and tier FOR THIS DESTINATION
    const getHotelsForCityAndTier = (locationName, tierName) => {
        const tierLower = tierName.toLowerCase();

        if (!locationName || !locationName.trim()) {
            return destinationHotels.filter((h) => h.hotel_tier && h.hotel_tier.toLowerCase() === tierLower);
        }

        const locLower = locationName.trim().toLowerCase();

        return destinationHotels.filter((h) => {
            const matchCity = h.city_name && h.city_name.trim().toLowerCase() === locLower;
            const matchState = h.state_name && h.state_name.trim().toLowerCase() === locLower;
            const tierMatches = h.hotel_tier && h.hotel_tier.toLowerCase() === tierLower;

            return (matchCity || matchState) && tierMatches;
        });
    };

    // Find hotel object by ID
    const findHotelById = (id) => {
        if (!id) return null;
        if (typeof id === "object") return id;
        return allHotels.find((h) => h._id === id);
    };

    const tiers = [
        { key: "standard_hotel", label: "STANDARD", tierName: "Standard" },
        { key: "deluxe_hotel", label: "DELUXE", tierName: "Deluxe" },
        { key: "super_deluxe_hotel", label: "SUPER DELUXE", tierName: "Super Deluxe" },
        { key: "luxury_hotel", label: "LUXURY", tierName: "Luxury" },
    ];

    const isAsPerBestQuote = formData?.hotel_as_per_category === "As per best quote" ||
        formData?.pricing === "As per best quote" ||
        formData?.pricing === "As per the destination" ||
        Boolean(formData?.pricing?.is_price_on_request);

    const handleBestQuoteToggle = (e) => {
        const checked = e.target.checked;
        if (setFormData) {
            setFormData((prev) => ({
                ...prev,
                hotel_as_per_category: checked ? "As per best quote" : "",
                pricing: checked ? "As per best quote" : (typeof prev?.pricing === "object" && prev?.pricing !== null && !prev?.pricing?.is_price_on_request ? prev.pricing : { standard_price: 0, discounted_price: 0 })
            }));
        } else if (handleInputChange) {
            handleInputChange({ target: { name: "hotel_as_per_category", value: checked ? "As per best quote" : "" } });
        }
    };

    return (
        <div className={cardStyle}>
            {/* LUXURY CARD HEADER */}
            <div className="flex items-center gap-4 pb-6 border-b border-slate-200 dark:border-slate-800/80">
                <div className="size-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 shrink-0">
                    <Building2 size={22} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Accommodation & Hotel Selection</h3>
                    {selectedDestObj ? (
                        <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mt-0.5">
                            Destination: <span className="text-slate-900 dark:text-white font-bold">{selectedDestObj.destination_name}</span> ({cityOptions.length} Hotel Cities available)
                        </p>
                    ) : (
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                            Select a target destination in Core Details to load cities & hotels
                        </p>
                    )}
                </div>
            </div>

            <div className="space-y-7">
                {/* AS PER BEST QUOTE CHECKBOX */}
                <label className={`flex items-center gap-4 p-5 rounded-2xl border transition-all cursor-pointer ${isAsPerBestQuote ? 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-500/50 shadow-lg shadow-indigo-500/10' : 'bg-slate-50 dark:bg-[#050A17] border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'}`}>
                    <input
                        type="checkbox"
                        id="hotel_as_per_category"
                        checked={isAsPerBestQuote}
                        onChange={handleBestQuoteToggle}
                        className="accent-indigo-500 size-5 rounded cursor-pointer"
                    />
                    <div className="flex-1">
                        <p className={`text-sm font-bold uppercase tracking-wider ${isAsPerBestQuote ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'}`}>AS PER BEST QUOTE</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5 flex items-center gap-1.5">
                            <Hotel size={13} className="text-indigo-500 dark:text-indigo-400" /> Enable to set hotels as per best quote. Uncheck to configure stay locations and hotel properties.
                        </p>
                    </div>
                </label>

                {/* STAY LOCATIONS / CITY STOPS — ONLY SHOWN WHEN UNCHECKED */}
                {!isAsPerBestQuote && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                                <MapPin size={14} className="text-indigo-500 dark:text-indigo-400" />
                                Itinerary Stay Locations & Properties ({stayHotels.length})
                            </h3>
                        </div>

                        {stayHotels.length === 0 ? (
                            <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#050A17]">
                                <Building2 className="mx-auto text-slate-400 dark:text-slate-600 mb-3" size={36} />
                                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No Stay Locations added yet</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Add city stops to assign specific hotels for each luxury tier</p>
                                <button
                                    type="button"
                                    onClick={addCityStop}
                                    className="mt-4 px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:opacity-95 transition-all inline-flex items-center gap-2 shadow-lg shadow-indigo-500/20 cursor-pointer active:scale-[0.98]"
                                >
                                    <Plus size={14} /> Add Stay Location
                                </button>
                            </div>
                        ) : (
                            stayHotels.map((stop, stopIdx) => {
                                const isCityChosen = Boolean(stop.location && stop.location.trim());

                                return (
                                    <div
                                        key={stopIdx}
                                        className="p-6 md:p-7 rounded-3xl bg-slate-50/90 dark:bg-[#050A17] border border-slate-200/90 dark:border-slate-800/90 space-y-6 shadow-inner relative group"
                                    >
                                        {/* STOP HEADER */}
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800/80 pb-4">
                                            <div className="flex items-center gap-3 flex-1">
                                                <div className="size-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-black text-xs shadow-md shadow-indigo-500/20">
                                                    {stopIdx + 1}
                                                </div>
                                                <div className="flex-1 max-w-md">
                                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                                                        STAY LOCATION
                                                    </label>
                                                    <div className="relative">
                                                        <select
                                                            value={stop.location || ""}
                                                            onChange={(e) => handleStayHotelChange(stopIdx, "location", e.target.value)}
                                                            className="w-full px-4 py-2.5 pr-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#091126] text-sm font-bold text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 outline-none cursor-pointer appearance-none"
                                                        >
                                                            <option value="" className="bg-white dark:bg-[#091126] text-slate-900 dark:text-white">Choose a Destination City...</option>
                                                            {cityOptions.map((c, i) => (
                                                                <option key={i} value={c} className="bg-white dark:bg-[#091126] text-slate-900 dark:text-white">
                                                                    {c}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={15} />
                                                    </div>
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => removeCityStop(stopIdx)}
                                                className="p-2.5 rounded-xl bg-red-500/10 text-red-500 dark:text-red-400 hover:bg-red-500 hover:text-white transition-all self-end md:self-center cursor-pointer border border-red-500/20"
                                                title="Remove Stop"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>

                                        {/* 4 TIER PROPERTY SELECTORS */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                            {tiers.map((tierObj) => {
                                                const tierHotels = getHotelsForCityAndTier(stop.location, tierObj.tierName);
                                                const hasHotels = isCityChosen && tierHotels.length > 0;
                                                const currentHotelId = typeof stop[tierObj.key] === "object" ? stop[tierObj.key]?._id : stop[tierObj.key];
                                                const selectedHotel = findHotelById(stop[tierObj.key]);

                                                return (
                                                    <div
                                                        key={tierObj.key}
                                                        className="p-4 rounded-2xl bg-white dark:bg-[#091126] border border-slate-200 dark:border-slate-800/90 space-y-3 flex flex-col justify-between"
                                                    >
                                                        <div>
                                                            <div className="flex items-center justify-between mb-2">
                                                                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                                                                    {tierObj.label}
                                                                </span>
                                                            </div>

                                                            {/* PROPERTY DROPDOWN OR PICK CITY INPUT */}
                                                            {!hasHotels ? (
                                                                <div className="flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#050A17] text-slate-400 dark:text-slate-500 text-xs font-semibold select-none">
                                                                    <span>Pick City</span>
                                                                    <Lock size={13} className="text-slate-400 dark:text-slate-500" />
                                                                </div>
                                                            ) : (
                                                                <div className="relative">
                                                                    <select
                                                                        value={currentHotelId || ""}
                                                                        onChange={(e) => handleStayHotelChange(stopIdx, tierObj.key, e.target.value)}
                                                                        className="w-full px-3 py-2 pr-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#050A17] text-xs font-semibold text-slate-900 dark:text-white focus:border-indigo-500 outline-none cursor-pointer appearance-none"
                                                                    >
                                                                        <option value="" className="bg-white dark:bg-[#050A17] text-slate-900 dark:text-white">Select Property</option>
                                                                        {tierHotels.map((h) => (
                                                                            <option key={h._id} value={h._id} className="bg-white dark:bg-[#050A17] text-slate-900 dark:text-white">
                                                                                {h.name} ({h.star_rating || 4}★)
                                                                            </option>
                                                                        ))}
                                                                    </select>
                                                                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={13} />
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* SELECTED PROPERTY PREVIEW CARD */}
                                                        {selectedHotel ? (
                                                            <div className="mt-2 p-2.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-500/30 flex items-center gap-2.5">
                                                                {selectedHotel.thumbnail ? (
                                                                    <img
                                                                        src={selectedHotel.thumbnail}
                                                                        alt={selectedHotel.name}
                                                                        className="size-10 rounded-lg object-cover border border-slate-200 dark:border-slate-800 shrink-0"
                                                                    />
                                                                ) : (
                                                                    <div className="size-10 rounded-lg bg-indigo-500/20 text-indigo-500 dark:text-indigo-400 flex items-center justify-center shrink-0">
                                                                        <Building2 size={16} />
                                                                    </div>
                                                                )}
                                                                <div className="min-w-0 flex-1">
                                                                    <p className="text-[11px] font-bold text-slate-900 dark:text-white truncate">
                                                                        {selectedHotel.name}
                                                                    </p>
                                                                    <p className="text-[9px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-semibold">
                                                                        <Star size={10} className="text-amber-400 fill-amber-400" />
                                                                        {selectedHotel.star_rating || 4} Stars • {selectedHotel.city_name || stop.location}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="p-2.5 text-center rounded-xl bg-slate-50 dark:bg-[#050A17] border border-dashed border-slate-200 dark:border-slate-800">
                                                                <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
                                                                    {!isCityChosen
                                                                        ? "Choose city first"
                                                                        : !hasHotels
                                                                            ? "No hotel in DB"
                                                                            : "No property selected"}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })
                        )}

                        {/* ADD ANOTHER CITY STOP BUTTON */}
                        <button
                            type="button"
                            onClick={addCityStop}
                            className="w-full py-3.5 border border-dashed border-indigo-500/40 hover:border-indigo-500 rounded-2xl text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 hover:bg-indigo-500/5 cursor-pointer active:scale-[0.99]"
                        >
                            <Plus size={16} /> Add Another City Stop
                        </button>
                    </div>
                )}

                {/* HELPER BANNER */}
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#050A17] flex items-start gap-3.5 border border-slate-200 dark:border-slate-800">
                    <div className="bg-indigo-500/10 border border-indigo-500/20 p-2 rounded-xl shrink-0">
                        <Heart size={16} className="text-pink-500 dark:text-pink-400" />
                    </div>
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-400 leading-relaxed">
                        By unchecking "AS PER BEST QUOTE", you can assign specific hotels for each stay location so couples see hand-picked romantic accommodations matching their selected package category.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default HotelDetailsSection;
