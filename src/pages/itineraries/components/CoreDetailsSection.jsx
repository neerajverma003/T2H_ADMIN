import {
    MapPin,
    Calendar,
    Eye,
    Layers,
    ListChecks,
    Text,
    Heart,
} from "lucide-react";
import { useEffect } from "react";
import { usePlaceStore } from "../../../stores/usePlaceStore";

const CoreDetailsSection = ({ formData, handleInputChange, styles, errors = {} }) => {
    const { cardStyle, labelStyle, inputStyle } = styles;

    // Honeymoon-friendly themes
    const themes = [
        "Honeymoon",
        "Romantic",
        "Luxury Tour",
        "Beach",
        "Hill Station",
        "Heritage Tour",
        "Ayurveda Tour",
    ];

    const classificationTypes = [
        "Honeymoon Special",
        "Exclusive",
        "Top Selling",
    ];

    const { destinationList, fetchDestinationList, isListLoading } =
        usePlaceStore();

    // Theme checkbox handler
    const handleThemeChange = (e) => {
        const { value, checked } = e.target;
        const updatedThemes = checked
            ? [...formData.itinerary_theme, value]
            : formData.itinerary_theme.filter((t) => t !== value);

        handleInputChange({
            target: {
                name: "itinerary_theme",
                value: updatedThemes,
            },
        });
    };

    // Classification checkbox handler
    const handleClassificationChange = (e) => {
        const { value, checked } = e.target;
        const updated = checked
            ? [...formData.classification, value]
            : formData.classification.filter((c) => c !== value);

        handleInputChange({
            target: {
                name: "classification",
                value: updated,
            },
        });
    };

    // Destination handler
    const handleDestinationChange = (e) => {
        handleInputChange({
            target: {
                name: "selected_destination_id",
                value: e.target.value,
            },
        });
    };

    // Fetch destinations once (honeymoon trips don’t switch travel type)
    useEffect(() => {
        fetchDestinationList("honeymoon");
    }, [fetchDestinationList]);

    return (
        <div className={cardStyle}>
            <h2 className="mb-4 border-b border-gray-700 pb-2 text-xl font-semibold">
                <Heart className="mr-2 inline text-pink-500" size={20} />
                Honeymoon Core Details
            </h2>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Title */}
                <div>
                    <label htmlFor="title" className={labelStyle}>
                        <Text className="mr-2 inline" size={16} />
                        Itinerary Title
                    </label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="Romantic Bali Honeymoon Escape"
                        className={`${inputStyle} ${
                            errors.title ? "border-red-500" : ""
                        }`}
                        maxLength={50000}
                    />
                    {errors.title && (
                        <p className="mt-1 text-sm text-red-500">
                            {errors.title}
                        </p>
                    )}
                </div>

                {/* Destination */}
                <div>
                    <label
                        htmlFor="selected_destination_id"
                        className={labelStyle}
                    >
                        <MapPin className="mr-2 inline" size={16} />
                        Destination
                    </label>
                    <select
                        id="selected_destination_id"
                        name="selected_destination_id"
                        value={formData.selected_destination_id}
                        onChange={handleDestinationChange}
                        className={`${inputStyle} ${
                            errors.selected_destination_id
                                ? "border-red-500"
                                : ""
                        }`}
                        disabled={isListLoading}
                    >
                        <option value="">
                            {isListLoading
                                ? "Loading destinations..."
                                : "-- Select Destination --"}
                        </option>
                        {destinationList.map((place) => (
                            <option key={place._id} value={place._id}>
                                {place.destination_name}
                            </option>
                        ))}
                    </select>
                    {errors.selected_destination_id && (
                        <p className="mt-1 text-sm text-red-500">
                            {errors.selected_destination_id}
                        </p>
                    )}
                </div>

                {/* Duration */}
                <div>
                    <label htmlFor="duration" className={labelStyle}>
                        <Calendar className="mr-2 inline" size={16} />
                        Duration
                    </label>
                    <select
                        id="duration"
                        name="duration"
                        value={formData.duration}
                        onChange={handleInputChange}
                        className={`${inputStyle} ${
                            errors.duration ? "border-red-500" : ""
                        }`}
                    >
                        <option value="">-- Select Duration --</option>
                        <option value="3 Days / 2 Nights">
                            3 Days / 2 Nights
                        </option>
                        <option value="4 Days / 3 Nights">
                            4 Days / 3 Nights
                        </option>
                        <option value="5 Days / 4 Nights">
                            5 Days / 4 Nights
                        </option>
                        <option value="6 Days / 5 Nights">
                            6 Days / 5 Nights
                        </option>
                        <option value="7 Days / 6 Nights">
                            7 Days / 6 Nights
                        </option>
                        <option value="Custom">Custom</option>
                    </select>
                    {errors.duration && (
                        <p className="mt-1 text-sm text-red-500">{errors.duration}</p>
                    )}
                </div>

                {/* Themes */}
                <div>
                    <label className={labelStyle}>
                        <ListChecks className="mr-2 inline" size={16} />
                        Honeymoon Themes
                    </label>
                    <div className="mt-2 flex flex-wrap gap-3">
                        {themes.map((theme) => (
                            <label
                                key={theme}
                                className="flex items-center gap-2"
                            >
                                <input
                                    type="checkbox"
                                    value={theme}
                                    checked={formData.itinerary_theme.includes(
                                        theme
                                    )}
                                    onChange={handleThemeChange}
                                />
                                <span>{theme}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Classification */}
                <div>
                    <label className={labelStyle}>
                        <Layers className="mr-2 inline" size={16} />
                        Classification
                    </label>
                    <div className="mt-2 flex flex-wrap gap-3">
                        {classificationTypes.map((c) => (
                            <label
                                key={c}
                                className="flex items-center gap-2"
                            >
                                <input
                                    type="checkbox"
                                    value={c}
                                    checked={formData.classification.includes(
                                        c
                                    )}
                                    onChange={handleClassificationChange}
                                />
                                <span>{c}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Itinerary Type */}
                <div>
                    <label className={labelStyle}>
                        <Layers className="mr-2 inline" size={16} />
                        Itinerary Type
                    </label>
                    <select
                        name="itinerary_type"
                        value={formData.itinerary_type}
                        onChange={handleInputChange}
                        className={inputStyle}
                    >
                        <option value="flexible">Flexible</option>
                        <option value="fixed">Fixed</option>
                    </select>
                </div>

                {/* Visibility */}
                <div>
                    <label className={labelStyle}>
                        <Eye className="mr-2 inline" size={16} />
                        Visibility
                    </label>
                    <select
                        name="itinerary_visibility"
                        value={formData.itinerary_visibility}
                        onChange={handleInputChange}
                        className={inputStyle}
                    >
                        <option value="public">Public</option>
                        <option value="private">Private</option>
                    </select>
                </div>
            </div>
        </div>
    );
};

export default CoreDetailsSection;
