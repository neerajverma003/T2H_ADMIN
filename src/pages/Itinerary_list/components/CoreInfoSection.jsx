import {
    Globe,
    MapPin,
    Calendar,
    Eye,
    Layers,
    ListChecks,
    Text,
    Sparkles,
    Heart
} from "lucide-react";
import { useEffect } from "react";
import { usePlaceStore } from "../../../stores/usePlaceStore";

const CoreDetailsSection = ({
    formData,
    handleInputChange,
    styles,
    isEditing,
}) => {
    const { cardStyle, labelStyle, inputStyle } = styles;

    const themes = ["Family", "Honeymoon", "Adventures", "Solo", "Wildlife", "Beach", "Pilgrimage", "Hill Station", "Heritage Tour", "Ayurveda Tour", "Cultural Tour", "Luxury Tour", "Budget Tour", "Family Tour", "Bachelor Tour", "Women Group", "Special Interest"];
    const classification_types = ["Trending", "Exclusive", "Weekend", "Honeymoon Special", "Top Selling"];

    const { destinationList, fetchDestinationList, isListLoading } = usePlaceStore();

    useEffect(() => {
        if (formData.travel_type) {
            fetchDestinationList(formData.travel_type);
        }
    }, [formData.travel_type, fetchDestinationList]);

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

    const handleTravelTypeChange = (e) => {
        const value = e.target.value;
        handleInputChange({ target: { name: "travel_type", value } });
        handleInputChange({ target: { name: "selected_destination_id", value: "" } });
        handleInputChange({ target: { name: "selected_destination_name", value: "" } });
    };

    const handleDestinationChange = (e) => {
        const selectedId = e.target.value;
        const selectedDestination = destinationList.find((d) => d._id === selectedId);
        const selectedName = selectedDestination ? selectedDestination.destination_name : "";
        handleInputChange({ target: { name: "selected_destination_id", value: selectedId } });
        handleInputChange({ target: { name: "selected_destination_name", value: selectedName } });
    };

    return (
        <div className={cardStyle}>
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <Heart className="text-indigo-600" size={20} />
                    CORE IDENTITY
                </h2>
                <div className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-widest">
                   {isEditing ? 'Editing Mode' : 'View Mode'}
                </div>
            </div>

            <div className="space-y-10">
                {/* Title */}
                <div>
                    <label className={labelStyle}><Text size={14} /> Itinerary Title</label>
                    {isEditing ? (
                        <input
                            type="text"
                            name="title"
                            value={formData.title || ""}
                            onChange={handleInputChange}
                            className={`${inputStyle} text-xl font-bold h-16`}
                            placeholder="Romantic Honeymoon Escape…"
                        />
                    ) : (
                        <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{formData.title || "Untitled Experience"}</p>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-slate-50 dark:border-slate-800">
                    {/* Travel Type */}
                    <div>
                        <label className={labelStyle}><Globe size={14} /> Travel Context</label>
                        {isEditing ? (
                            <div className="flex gap-4 mt-2">
                                {["domestic", "international"].map((type) => (
                                    <label key={type} className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all cursor-pointer ${formData.travel_type === type ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800' : 'border-transparent bg-slate-50 dark:bg-slate-800/50'}`}>
                                        <input type="radio" name="travel_type" value={type} checked={formData.travel_type === type} onChange={handleTravelTypeChange} className="accent-indigo-600" />
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${formData.travel_type === type ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`}>{type}</span>
                                    </label>
                                ))}
                            </div>
                        ) : (
                            <div className="inline-flex px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">{formData.travel_type || "N/A"}</div>
                        )}
                    </div>

                    {/* Destination */}
                    <div>
                        <label className={labelStyle}><MapPin size={14} /> Selected Destination</label>
                        {isEditing ? (
                            <select
                                name="selected_destination_id"
                                value={formData.selected_destination_id || ""}
                                onChange={handleDestinationChange}
                                className={inputStyle}
                                disabled={isListLoading}
                            >
                                <option value="">{isListLoading ? "Synchronizing..." : "-- Select Destination --"}</option>
                                {destinationList.map((place) => (
                                    <option key={place._id} value={place._id}>{place.destination_name}</option>
                                ))}
                            </select>
                        ) : (
                            <p className="text-lg font-bold text-slate-800 dark:text-slate-200">{formData.selected_destination_name || "Unassigned"}</p>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Duration */}
                    <div>
                        <label className={labelStyle}><Calendar size={14} /> Duration</label>
                        {isEditing ? (
                            <select name="duration" value={formData.duration || ""} onChange={handleInputChange} className={inputStyle}>
                                <option value="">-- Select Duration --</option>
                                {["2 Days / 1 Night", "3 Days / 2 Nights", "4 Days / 3 Nights", "5 Days / 4 Nights", "6 Days / 5 Nights", "7 Days / 6 Nights", "10 Days / 9 Nights", "Custom"].map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        ) : (
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{formData.duration || "N/A"}</p>
                        )}
                    </div>

                    {/* Type */}
                    <div>
                        <label className={labelStyle}><Layers size={14} /> Flow Type</label>
                        {isEditing ? (
                            <select name="itinerary_type" value={formData.itinerary_type || ""} onChange={handleInputChange} className={inputStyle}>
                                <option value="flexible">Flexible Flow</option>
                                <option value="fixed">Fixed Schedule</option>
                            </select>
                        ) : (
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase">{formData.itinerary_type || "flexible"}</p>
                        )}
                    </div>

                    {/* Visibility */}
                    <div>
                        <label className={labelStyle}><Eye size={14} /> Visibility</label>
                        {isEditing ? (
                            <select name="itinerary_visibility" value={formData.itinerary_visibility || ""} onChange={handleInputChange} className={inputStyle}>
                                <option value="public">Live on Portal</option>
                                <option value="private">Draft / Hidden</option>
                            </select>
                        ) : (
                            <div className={`inline-flex px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${formData.itinerary_visibility === 'public' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}>
                                {formData.itinerary_visibility || "private"}
                            </div>
                        )}
                    </div>
                </div>

                {/* Themes */}
                <div>
                    <label className={labelStyle}><ListChecks size={14} /> Experience Themes</label>
                    <div className="flex flex-wrap gap-3 mt-4">
                        {isEditing ? (
                            themes.map((theme) => (
                                <label key={theme} className={`flex items-center gap-3 px-6 py-3 rounded-2xl border transition-all cursor-pointer ${formData.itinerary_theme?.includes(theme) ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800' : 'border-transparent bg-slate-50 dark:bg-slate-800/50'}`}>
                                    <input type="checkbox" value={theme} checked={formData.itinerary_theme?.includes(theme)} onChange={handleThemeChange} className="accent-indigo-600 size-4" />
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${formData.itinerary_theme?.includes(theme) ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`}>{theme}</span>
                                </label>
                            ))
                        ) : (
                            formData.itinerary_theme?.length > 0 ? (
                                formData.itinerary_theme.map(t => <span key={t} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-500">{t}</span>)
                            ) : <p className="text-xs italic text-slate-400">No themes assigned.</p>
                        )}
                    </div>
                </div>

                {/* Classification */}
                <div>
                    <label className={labelStyle}><Sparkles size={14} /> Classifications</label>
                    <div className="flex flex-wrap gap-3 mt-4">
                        {isEditing ? (
                            classification_types.map((c) => (
                                <label key={c} className={`flex items-center gap-3 px-6 py-3 rounded-2xl border transition-all cursor-pointer ${formData.classification?.includes(c) ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800' : 'border-transparent bg-slate-50 dark:bg-slate-800/50'}`}>
                                    <input type="checkbox" value={c} checked={formData.classification?.includes(c)} onChange={handleClassificationChange} className="accent-indigo-600 size-4" />
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${formData.classification?.includes(c) ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`}>{c}</span>
                                </label>
                            ))
                        ) : (
                            formData.classification?.length > 0 ? (
                                formData.classification.map(c => <span key={c} className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-[9px] font-black uppercase tracking-widest text-indigo-600">{c}</span>)
                            ) : <p className="text-xs italic text-slate-400">No classifications assigned.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CoreDetailsSection;
