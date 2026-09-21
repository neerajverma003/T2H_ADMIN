import {
    MapPin,
    Calendar,
    Eye,
    Layers,
    ListChecks,
    Text,
    Heart,
    Sparkles,
    Compass,
    Globe,
    LayoutTemplate,
    Grid,
    ChevronDown
} from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { usePlaceStore } from "../../../stores/usePlaceStore";

const CoreDetailsSection = ({ formData, handleInputChange, styles, errors = {} }) => {
    const { cardStyle, labelStyle, inputStyle } = styles;

    const themes = [
        "Family", "Honeymoon", "Romantic", "Adventures", "Solo", "Wildlife", "Beach",
        "Pilgrimage", "Hill Station", "Heritage Tour", "Ayurveda Tour", "Cultural Tour",
        "Luxury Tour", "Budget Tour", "Bachelor Tour", "Women Group", "Special Interest"
    ];
    const classificationTypes = ["Trending", "Exclusive", "Weekend", "Top Selling", "Group", "Honeymoon Special"];

    const { destinationList, fetchDestinationList, isListLoading } = usePlaceStore();

    // Auto-sync Trending status based on destination selection
    useEffect(() => {
        if (!formData.selected_destination_id || isListLoading) return;

        const selectedDest = destinationList.find(d => d._id === formData.selected_destination_id);
        const isTrendingDest = selectedDest?.options?.includes("trending");

        if (isTrendingDest && !formData.classification.includes("Trending")) {
            handleInputChange({
                target: {
                    name: "classification",
                    value: [...formData.classification, "Trending"]
                }
            });
        } else if (!isTrendingDest && formData.classification.includes("Trending")) {
            handleInputChange({
                target: {
                    name: "classification",
                    value: formData.classification.filter(c => c !== "Trending")
                }
            });
        }
    }, [formData.selected_destination_id, destinationList, isListLoading]);

    const handleThemeToggle = (theme) => {
        const isSelected = formData.itinerary_theme.includes(theme);
        const updated = isSelected
            ? formData.itinerary_theme.filter((t) => t !== theme)
            : [...formData.itinerary_theme, theme];
        handleInputChange({ target: { name: "itinerary_theme", value: updated } });
    };

    const handleClassificationToggle = (c) => {
        const isSelected = formData.classification.includes(c);
        const updated = isSelected
            ? formData.classification.filter((item) => item !== c)
            : [...formData.classification, c];
        handleInputChange({ target: { name: "classification", value: updated } });
    };

    useEffect(() => {
        if (formData.destination_type) {
            fetchDestinationList(formData.destination_type);
        }
    }, [fetchDestinationList, formData.destination_type]);

    return (
        <div className={cardStyle}>
            {/* CARD HEADER */}
            <div className="flex items-center gap-3.5 pb-5 border-b border-slate-200 dark:border-slate-800/80">
                <div className="size-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 shrink-0">
                    <Layers size={22} />
                </div>
                <div>
                    <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                        Core Details
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                        Package title, travel parameters, destination, duration, and classification
                    </p>
                </div>
            </div>

            <div className="space-y-6">
                {/* TITLE */}
                <div>
                    <label htmlFor="title" className={labelStyle}>
                        <LayoutTemplate size={14} className="text-indigo-400" /> TITLE
                    </label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="e.g., Amazing 5-Day Paris Adventure"
                        className={`${inputStyle} ${errors.title ? "ring-2 ring-red-500 border-red-500" : ""}`}
                    />
                    {errors.title && <p className="mt-1.5 text-xs font-bold text-red-400">{errors.title}</p>}
                </div>

                {/* TRAVEL TYPE & DESTINATION */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* TRAVEL TYPE TOGGLE */}
                    <div>
                        <label className={labelStyle}>
                            <Compass size={14} className="text-indigo-400" /> TRAVEL TYPE
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            {["domestic", "international"].map((t) => {
                                const isActive = formData.destination_type === t;
                                return (
                                    <button
                                        key={t}
                                        type="button"
                                        onClick={() => handleInputChange({ target: { name: "destination_type", value: t } })}
                                        className={`flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-2xl text-xs font-bold capitalize transition-all cursor-pointer ${
                                            isActive
                                                ? "bg-indigo-50 dark:bg-indigo-950/50 border-2 border-indigo-500 text-indigo-700 dark:text-white shadow-sm ring-1 ring-indigo-500/30"
                                                : "bg-slate-50 dark:bg-[#050A17] border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                                        }`}
                                    >
                                        <div className={`size-3.5 rounded-full border flex items-center justify-center ${isActive ? "border-indigo-400 bg-indigo-500" : "border-slate-600"}`}>
                                            {isActive && <div className="size-1.5 rounded-full bg-white" />}
                                        </div>
                                        <span>{t.charAt(0).toUpperCase() + t.slice(1)}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* DESTINATION */}
                    <div>
                        <label htmlFor="selected_destination_id" className={labelStyle}>
                            <MapPin size={14} className="text-indigo-400" /> DESTINATION
                        </label>
                        <div className="relative">
                            <select
                                id="selected_destination_id"
                                name="selected_destination_id"
                                value={formData.selected_destination_id}
                                onChange={(e) => handleInputChange({ target: { name: "selected_destination_id", value: e.target.value } })}
                                className={`${inputStyle} cursor-pointer appearance-none pr-10 ${errors.selected_destination_id ? "ring-2 ring-red-500" : ""}`}
                                disabled={isListLoading}
                            >
                                <option value="" className="bg-white dark:bg-[#050A17] text-slate-500 dark:text-slate-400">
                                    {isListLoading ? "Synchronizing destinations..." : "-- Select Destination --"}
                                </option>
                                {destinationList.map((place) => (
                                    <option key={place._id} value={place._id} className="bg-white dark:bg-[#050A17] text-slate-900 dark:text-white">
                                        {place.destination_name}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                        </div>
                        {errors.selected_destination_id && <p className="mt-1.5 text-xs font-bold text-red-400">{errors.selected_destination_id}</p>}
                    </div>
                </div>

                {/* DURATION, TYPE & VISIBILITY (3-COLUMN ROW) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {/* DURATION */}
                    <div>
                        <label htmlFor="duration" className={labelStyle}>
                            <Calendar size={14} className="text-indigo-400" /> DURATION
                        </label>
                        <div className="relative">
                            <select
                                id="duration"
                                name="duration"
                                value={formData.duration}
                                onChange={handleInputChange}
                                className={`${inputStyle} cursor-pointer appearance-none pr-10 ${errors.duration ? "ring-2 ring-red-500" : ""}`}
                            >
                                <option value="" className="bg-white dark:bg-[#050A17] text-slate-500 dark:text-slate-400">
                                    -- Select Duration --
                                </option>
                                {["3 Days / 2 Nights", "4 Days / 3 Nights", "5 Days / 4 Nights", "6 Days / 5 Nights", "7 Days / 6 Nights", "Custom"].map(d => (
                                    <option key={d} value={d} className="bg-white dark:bg-[#050A17] text-slate-900 dark:text-white">
                                        {d}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                        </div>
                        {errors.duration && <p className="mt-1.5 text-xs font-bold text-red-400">{errors.duration}</p>}
                    </div>

                    {/* OPERATIONAL TYPE */}
                    <div>
                        <label className={labelStyle}>
                            <Sparkles size={14} className="text-indigo-400" /> TYPE
                        </label>
                        <div className="relative">
                            <select
                                name="itinerary_type"
                                value={formData.itinerary_type}
                                onChange={handleInputChange}
                                className={`${inputStyle} cursor-pointer appearance-none pr-10`}
                            >
                                <option value="flexible" className="bg-white dark:bg-[#050A17] text-slate-900 dark:text-white">Flexible</option>
                                <option value="fixed" className="bg-white dark:bg-[#050A17] text-slate-900 dark:text-white">Fixed</option>
                            </select>
                            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                        </div>
                    </div>

                    {/* VISIBILITY */}
                    <div>
                        <label className={labelStyle}>
                            <Eye size={14} className="text-indigo-400" /> VISIBILITY
                        </label>
                        <div className="relative">
                            <select
                                name="itinerary_visibility"
                                value={formData.itinerary_visibility}
                                onChange={handleInputChange}
                                className={`${inputStyle} cursor-pointer appearance-none pr-10`}
                            >
                                <option value="public" className="bg-white dark:bg-[#050A17] text-slate-900 dark:text-white">Public</option>
                                <option value="private" className="bg-white dark:bg-[#050A17] text-slate-900 dark:text-white">Private</option>
                            </select>
                            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                        </div>
                    </div>
                </div>

                {/* Conditional Custom Days Input */}
                {formData.duration === "Custom" && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="p-5 rounded-2xl bg-slate-50 dark:bg-[#050A17] border border-indigo-500/30 space-y-2"
                    >
                        <label htmlFor="custom_days" className={labelStyle}>
                            <Sparkles size={14} className="text-indigo-400" /> SPECIFY TOTAL DAYS
                        </label>
                        <CustomDaysInput 
                            initialValue={formData.days_information.length} 
                            onSync={(val) => handleInputChange({ target: { name: "custom_days_trigger", value: val } })}
                            styles={styles}
                        />
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Adjusting this will automatically sync the Daily Timeline below</p>
                    </motion.div>
                )}

                {/* THEMES (PILLS) */}
                <div>
                    <label className={labelStyle}>
                        <Grid size={14} className="text-indigo-400" /> THEMES
                    </label>
                    <div className="flex flex-wrap gap-2.5 mt-2">
                        {themes.map((theme) => {
                            const isSelected = formData.itinerary_theme.includes(theme);
                            return (
                                <button
                                    key={theme}
                                    type="button"
                                    onClick={() => handleThemeToggle(theme)}
                                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                        isSelected
                                            ? "bg-indigo-600 text-white border border-indigo-500 shadow-sm shadow-indigo-600/30"
                                            : "bg-slate-50 dark:bg-[#050A17] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-900 dark:hover:text-white"
                                    }`}
                                >
                                    {theme}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* CLASSIFICATIONS (PILLS) */}
                <div>
                    <label className={labelStyle}>
                        <Grid size={14} className="text-indigo-400" /> CLASSIFICATIONS
                    </label>
                    <div className="flex flex-wrap gap-2.5 mt-2">
                        {classificationTypes.map((c) => {
                            const isSelected = formData.classification.includes(c);
                            return (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => handleClassificationToggle(c)}
                                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                        isSelected
                                            ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-500/50 shadow-sm shadow-emerald-500/10"
                                            : "bg-slate-50 dark:bg-[#050A17] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-900 dark:hover:text-white"
                                    }`}
                                >
                                    {c}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Sub-component to handle local state for clean typing
const CustomDaysInput = ({ initialValue, onSync, styles }) => {
    const [val, setVal] = useState(initialValue);

    useEffect(() => {
        setVal(initialValue);
    }, [initialValue]);

    const handleChange = (e) => {
        const input = e.target.value;
        if (input === "") {
            setVal("");
            return;
        }
        const num = parseInt(input);
        if (!isNaN(num)) {
            setVal(num);
            if (num > 0 && num <= 50) {
                onSync(num);
            }
        }
    };

    return (
        <input
            type="text"
            inputMode="numeric"
            value={val}
            onChange={handleChange}
            className={styles.inputStyle}
            placeholder="e.g. 5"
        />
    );
};

export default CoreDetailsSection;

