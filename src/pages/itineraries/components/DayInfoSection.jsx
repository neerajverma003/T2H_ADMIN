import { Heart, CalendarDays, MapPin } from "lucide-react";

const DayInfoSection = ({
    formData,
    handleArrayChange,
    handleAddItem,
    handleRemoveItem,
    styles,
    errors = {},
}) => {
    const { cardStyle, labelStyle, inputStyle, buttonStyle, removeButtonStyle } =
        styles;

    return (
        <div className={cardStyle}>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Heart className="text-pink-500" size={20} />
                Honeymoon Day-wise Plan
            </h2>

            {errors.days_information && (
                <p className="text-red-500 text-sm mb-4">
                    {errors.days_information}
                </p>
            )}

            {formData.days_information.map((item, index) => (
                <div
                    key={index}
                    className="mb-6 rounded-lg border p-4 bg-gray-50 dark:bg-gray-800"
                >
                    {/* Day Header */}
                    <div className="mb-3 flex items-center justify-between">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                            <CalendarDays size={18} />
                            Day {index + 1}
                        </h3>

                        {formData.days_information.length > 1 && (
                            <button
                                type="button"
                                onClick={() =>
                                    handleRemoveItem(index, "days_information")
                                }
                                className={removeButtonStyle}
                            >
                                Remove Day
                            </button>
                        )}
                    </div>

                    {/* Title */}
                    <div className="mb-4">
                        <label className={labelStyle}>
                            <MapPin className="inline mr-2" size={16} />
                            Day Title
                        </label>
                        <input
                            type="text"
                            name="locationName"
                            value={item.locationName}
                            onChange={(e) =>
                                handleArrayChange(
                                    e,
                                    index,
                                    "days_information"
                                )
                            }
                            className={inputStyle}
                            placeholder="Arrival, Romantic Sightseeing, Leisure Day..."
                            maxLength={50000}
                        />
                    </div>

                    {/* Hidden Day Field (kept in sync automatically) */}
                    <input
                        type="hidden"
                        name="day"
                        value={`${index + 1}`}
                    />

                    {/* Description */}
                    <div>
                        <label className={labelStyle}>
                            Day Description
                        </label>
                        <textarea
                            name="locationDetail"
                            value={item.locationDetail}
                            onChange={(e) => {
                                handleArrayChange(
                                    e,
                                    index,
                                    "days_information"
                                );
                                e.target.style.height = "auto";
                                e.target.style.height =
                                    e.target.scrollHeight + "px";
                            }}
                            className={inputStyle}
                            placeholder="Romantic activities, sightseeing, candle light dinner, leisure time..."
                            style={{
                                minHeight: "80px",
                                overflow: "hidden",
                                resize: "none",
                            }}
                            maxLength={50000}
                        />
                    </div>
                </div>
            ))}

            {/* Add Day */}
            <div className="flex justify-end">
                <button
                    type="button"
                    onClick={() =>
                        handleAddItem("days_information", {
                            day: `${formData.days_information.length + 1}`,
                            locationName: "",
                            locationDetail: "",
                        })
                    }
                    className={buttonStyle}
                >
                    + Add Honeymoon Day
                </button>
            </div>
        </div>
    );
};

export default DayInfoSection;
