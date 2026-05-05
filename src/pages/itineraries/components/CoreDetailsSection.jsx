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
import { useEffect } from "react";
import { usePlaceStore } from "../../../stores/usePlaceStore";

const CoreDetailsSection = ({ formData, handleInputChange, styles, errors = {} }) => {
    const { cardStyle, labelStyle, inputStyle } = styles;

    const themes = ["Honeymoon", "Romantic", "Luxury Tour", "Beach", "Hill Station", "Heritage Tour", "Ayurveda Tour"];
    const classificationTypes = ["Honeymoon Special", "Exclusive", "Top Selling"];

    const { destinationList, fetchDestinationList, isListLoading } = usePlaceStore();

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
                        className={`${inputStyle} text-xl font-bold h-16 ${errors.title ? "ring-2 ring-red-500" : ""}`}
                    />
                    {errors.title && <p className="mt-2 text-[10px] font-bold text-red-500 uppercase tracking-widest">{errors.title}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Destination */}
                    <div>
                        <label htmlFor="selected_destination_id" className={labelStyle}><MapPin size={14} /> Destination</label>
                        <select
                            id="selected_destination_id"
                            name="selected_destination_id"
                            value={formData.selected_destination_id}
                            onChange={(e) => handleInputChange({ target: { name: "selected_destination_id", value: e.target.value } })}
                            className={`${inputStyle} ${errors.selected_destination_id ? "ring-2 ring-red-500" : ""}`}
                            disabled={isListLoading}
                        >
                            <option value="">{isListLoading ? "Loading..." : "-- Select Destination --"}</option>
                            {destinationList.map((place) => (
                                <option key={place._id} value={place._id}>{place.destination_name}</option>
                            ))}
                        </select>
                        {errors.selected_destination_id && <p className="mt-2 text-[10px] font-bold text-red-500 uppercase tracking-widest">{errors.selected_destination_id}</p>}
                    </div>

                    {/* Duration */}
                    <div>
                        <label htmlFor="duration" className={labelStyle}><Calendar size={14} /> Duration</label>
                        <select
                            id="duration"
                            name="duration"
                            value={formData.duration}
                            onChange={handleInputChange}
                            className={`${inputStyle} ${errors.duration ? "ring-2 ring-red-500" : ""}`}
                        >
                            <option value="">-- Select Duration --</option>
                            {["3 Days / 2 Nights", "4 Days / 3 Nights", "5 Days / 4 Nights", "6 Days / 5 Nights", "7 Days / 6 Nights", "Custom"].map(d => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                        {errors.duration && <p className="mt-2 text-[10px] font-bold text-red-500 uppercase tracking-widest">{errors.duration}</p>}
                    </div>
                </div>

                {/* Themes */}
                <div>
                    <label className={labelStyle}><ListChecks size={14} /> Honeymoon Themes</label>
                    <div className="flex flex-wrap gap-3 mt-4">
                        {themes.map((theme) => (
                            <label key={theme} className={`flex items-center gap-3 px-6 py-3 rounded-2xl border transition-all cursor-pointer ${formData.itinerary_theme.includes(theme) ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800' : 'border-transparent bg-slate-50 dark:bg-slate-800/50'}`}>
                                <input type="checkbox" value={theme} checked={formData.itinerary_theme.includes(theme)} onChange={handleThemeChange} className="accent-indigo-600 size-4" />
                                <span className={`text-xs font-bold ${formData.itinerary_theme.includes(theme) ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`}>{theme}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Classification */}
                    <div className="md:col-span-2">
                        <label className={labelStyle}><Layers size={14} /> Classification</label>
                        <div className="flex flex-wrap gap-3 mt-4">
                            {classificationTypes.map((c) => (
                                <label key={c} className={`flex items-center gap-3 px-6 py-3 rounded-2xl border transition-all cursor-pointer ${formData.classification.includes(c) ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800' : 'border-transparent bg-slate-50 dark:bg-slate-800/50'}`}>
                                    <input type="checkbox" value={c} checked={formData.classification.includes(c)} onChange={handleClassificationChange} className="accent-indigo-600 size-4" />
                                    <span className={`text-xs font-bold ${formData.classification.includes(c) ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`}>{c}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div>
                            <label className={labelStyle}><Sparkles size={14} /> Flow Type</label>
                            <select name="itinerary_type" value={formData.itinerary_type} onChange={handleInputChange} className={inputStyle}>
                                <option value="flexible">Flexible Flow</option>
                                <option value="fixed">Fixed Schedule</option>
                            </select>
                        </div>
                        <div>
                            <label className={labelStyle}><Eye size={14} /> Visibility</label>
                            <select name="itinerary_visibility" value={formData.itinerary_visibility} onChange={handleInputChange} className={inputStyle}>
                                <option value="public">Live on Portal</option>
                                <option value="private">Hidden / Draft</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CoreDetailsSection;
