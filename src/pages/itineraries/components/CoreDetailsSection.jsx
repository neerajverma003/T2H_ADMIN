import {
    MapPin,
    Calendar,
    Eye,
    Layers,
    ListChecks,
    Text,
    Heart,
    Sparkles
} from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { usePlaceStore } from "../../../stores/usePlaceStore";

const CoreDetailsSection = ({ formData, handleInputChange, styles, errors = {} }) => {
    const { cardStyle, labelStyle, inputStyle } = styles;

    const themes = ["Honeymoon", "Romantic", "Luxury Tour", "Beach", "Hill Station", "Heritage Tour", "Ayurveda Tour"];
    const classificationTypes = ["Honeymoon Special", "Exclusive", "Top Selling", "Trending"];

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
            // Optional: Remove it if destination is not trending? 
            // Better to leave it to the user or keep it in sync. 
            // I'll keep it in sync for "automatic" behavior.
            handleInputChange({
                target: {
                    name: "classification",
                    value: formData.classification.filter(c => c !== "Trending")
                }
            });
        }
    }, [formData.selected_destination_id, destinationList, isListLoading]);

    const handleThemeChange = (e) => {
        const { value, checked } = e.target;
        const updatedThemes = checked ? [...formData.itinerary_theme, value] : formData.itinerary_theme.filter((t) => t !== value);
        handleInputChange({ target: { name: "itinerary_theme", value: updatedThemes } });
    };

    const handleClassificationChange = (e) => {
        const { value, checked } = e.target;
        const updated = checked ? [...formData.classification, value] : formData.classification.filter((c) => c !== value);
        handleInputChange({ target: { name: "classification", value: updated } });
    };

    useEffect(() => {
        if (formData.destination_type) {
            fetchDestinationList(formData.destination_type);
        }
    }, [fetchDestinationList, formData.destination_type]);

    return (
        <div className={cardStyle}>
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <Heart className="text-indigo-600" size={20} />
                    CORE DETAILS
                </h2>
                <div className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-widest">
                    Itinerary DNA
                </div>
            </div>

            <div className="space-y-10">
                {/* Title */}
                <div>
                    <label htmlFor="title" className={labelStyle}><Text size={14} /> Itinerary Title</label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="e.g. Romantic Bali Honeymoon Escape"
                        className={`${inputStyle} ${errors.title ? "ring-2 ring-red-500" : ""}`}
                    />
                    {errors.title && <p className="mt-2 text-[10px] font-bold text-red-500 uppercase tracking-widest">{errors.title}</p>}
                </div>

                <div className="space-y-10">
                    {/* Destination */}
                    <div>
                        <label htmlFor="selected_destination_id" className={labelStyle}><MapPin size={16} className="text-indigo-600" /> Target Destination</label>
                        <select
                            id="selected_destination_id"
                            name="selected_destination_id"
                            value={formData.selected_destination_id}
                            onChange={(e) => handleInputChange({ target: { name: "selected_destination_id", value: e.target.value } })}
                            className={`${inputStyle} ${errors.selected_destination_id ? "ring-2 ring-red-500" : ""}`}
                            disabled={isListLoading}
                        >
                            <option value="">{isListLoading ? "Synchronizing destinations..." : "-- Select Destination Territory --"}</option>
                            {destinationList.map((place) => (
                                <option key={place._id} value={place._id}>{place.destination_name}</option>
                            ))}
                        </select>
                        {errors.selected_destination_id && <p className="mt-2 text-[10px] font-bold text-red-500 uppercase tracking-widest">{errors.selected_destination_id}</p>}
                    </div>

                    {/* Duration */}
                    <div>
                        <label htmlFor="duration" className={labelStyle}><Calendar size={16} className="text-indigo-600" /> Experience Duration</label>
                        <select
                            id="duration"
                            name="duration"
                            value={formData.duration}
                            onChange={handleInputChange}
                            className={`${inputStyle} ${errors.duration ? "ring-2 ring-red-500" : ""}`}
                        >
                            <option value="">-- Select Timeline --</option>
                            {["3 Days / 2 Nights", "4 Days / 3 Nights", "5 Days / 4 Nights", "6 Days / 5 Nights", "7 Days / 6 Nights", "Custom"].map(d => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                        {errors.duration && <p className="mt-2 text-[10px] font-bold text-red-500 uppercase tracking-widest">{errors.duration}</p>}
                    </div>

                    {/* Conditional Custom Days Input */}
                    {formData.duration === "Custom" && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="pt-4"
                        >
                            <label htmlFor="custom_days" className={labelStyle}><Sparkles size={14} className="text-indigo-600" /> Specify Total Days</label>
                            <CustomDaysInput 
                                initialValue={formData.days_information.length} 
                                onSync={(val) => handleInputChange({ target: { name: "custom_days_trigger", value: val } })}
                                styles={styles}
                            />
                            <p className="mt-2 text-[10px] font-medium text-slate-500 italic uppercase tracking-wider">Adjusting this will sync the Daily Timeline below</p>
                        </motion.div>
                    )}
                </div>

                {/* Themes */}
                <div className="pt-10 border-t-4 border-slate-50 dark:border-slate-800">
                    <label className={labelStyle}><ListChecks size={16} className="text-indigo-600" /> Honeymoon Themes</label>
                    <div className="flex flex-wrap gap-4 mt-6">
                        {themes.map((theme) => (
                            <label key={theme} className={`flex items-center gap-3 px-5 py-3 rounded-xl border-2 transition-all cursor-pointer ${formData.itinerary_theme.includes(theme) ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800 shadow-lg' : 'border-transparent bg-slate-50 dark:bg-slate-800/50 hover:border-slate-100'}`}>
                                <input type="checkbox" value={theme} checked={formData.itinerary_theme.includes(theme)} onChange={handleThemeChange} className="accent-indigo-600 size-4 rounded" />
                                <span className={`text-xs font-bold uppercase tracking-tight ${formData.itinerary_theme.includes(theme) ? 'text-indigo-700 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'}`}>{theme}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Classification */}
                <div className="pt-10 border-t-4 border-slate-50 dark:border-slate-800">
                    <label className={labelStyle}><Layers size={16} className="text-indigo-600" /> Strategic Classification</label>
                    <div className="flex flex-wrap gap-4 mt-6">
                        {classificationTypes.map((c) => (
                            <label key={c} className={`flex items-center gap-3 px-5 py-3 rounded-xl border-2 transition-all cursor-pointer ${formData.classification.includes(c) ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800 shadow-lg' : 'border-transparent bg-slate-50 dark:bg-slate-800/50 hover:border-slate-100'}`}>
                                <input type="checkbox" value={c} checked={formData.classification.includes(c)} onChange={handleClassificationChange} className="accent-indigo-600 size-4 rounded" />
                                <span className={`text-xs font-bold uppercase tracking-tight ${formData.classification.includes(c) ? 'text-indigo-700 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'}`}>{c}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* SETTINGS */}
                <div className="pt-10 border-t-4 border-slate-50 dark:border-slate-800 space-y-10">
                    <div>
                        <label className={labelStyle}><Sparkles size={16} className="text-indigo-600" /> Operational Flow</label>
                        <select name="itinerary_type" value={formData.itinerary_type} onChange={handleInputChange} className={inputStyle}>
                            <option value="flexible">Flexible </option>
                            <option value="fixed">Fixed </option>
                        </select>
                    </div>
                    <div>
                        <label className={labelStyle}><Eye size={16} className="text-indigo-600" /> Visibility</label>
                        <select name="itinerary_visibility" value={formData.itinerary_visibility} onChange={handleInputChange} className={inputStyle}>
                            <option value="public">PUBLIC</option>
                            <option value="private">PRIVATE</option>
                        </select>
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
