import { Heart, CalendarDays, MapPin, Image as ImageIcon } from "lucide-react";

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

                    {/* Day Image Upload */}
                    <div className="mt-4">
                        <label className={labelStyle}>
                            <ImageIcon className="inline mr-2" size={16} />
                            Day Image
                        </label>
                        <input
                            type="file"
                            name="day_image_file"
                            accept="image/*"
                            onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                    const event = { target: { name: 'day_image_file', value: file } };
                                    handleArrayChange(event, index, "days_information");
                                }
                            }}
                            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100 dark:text-slate-300 dark:file:bg-gray-700 dark:file:text-pink-400"
                        />
                        {/* Show selected file preview */}
                        {item.day_image_file && (
                            <div className="mt-2 relative inline-block">
                                <img 
                                    src={URL.createObjectURL(item.day_image_file)} 
                                    alt="Preview" 
                                    className="h-20 w-32 object-cover rounded-md shadow-sm border-2 border-blue-400" 
                                />
                                <span className="absolute top-1 left-1 bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded shadow">New</span>
                            </div>
                        )}

                        {/* Show existing image if it's a string (edit mode) and NO new file is selected */}
                        {!item.day_image_file && item.day_image && typeof item.day_image === 'string' && item.day_image.startsWith('http') && (
                            <div className="mt-2 relative inline-block">
                                <img src={item.day_image} alt={`Day ${index + 1}`} className="h-20 w-32 object-cover rounded-md shadow-sm border border-gray-200" />
                                <span className="absolute top-1 left-1 bg-green-600 text-white text-[10px] px-1.5 py-0.5 rounded shadow">Existing</span>
                            </div>
                        )}
                        
                        {/* Show selected file name */}
                        {item.day_image_file && item.day_image_file.name && (
                            <p className="mt-1 text-xs text-blue-500 font-medium">Ready to upload: {item.day_image_file.name}</p>
                        )}
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
                            day_image: "",
                            day_image_file: null,
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
