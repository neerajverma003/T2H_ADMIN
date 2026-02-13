import { Hotel, Heart } from "lucide-react";

const HotelDetailsSection = ({
    formData,
    handleInputChange,
    styles,
}) => {
    const { cardStyle, labelStyle } = styles;

    // Checkbox state
    const isChecked = formData.hotel_as_per_category === "As per category";

    return (
        <div className={cardStyle}>
            <h2 className="text-xl font-semibold mb-4 border-b border-gray-700 pb-2 flex items-center gap-2">
                <Heart className="text-pink-500" size={20} />
                Honeymoon Hotel Details
            </h2>

            {/* As per category */}
            <div className="mb-4">
                <label
                    htmlFor="hotel_as_per_category"
                    className={`${labelStyle} flex items-center gap-2`}
                >
                    <input
                        type="checkbox"
                        id="hotel_as_per_category"
                        name="hotel_as_per_category"
                        checked={isChecked}
                        onChange={(e) =>
                            handleInputChange({
                                target: {
                                    name: "hotel_as_per_category",
                                    value: e.target.checked
                                        ? "As per category"
                                        : "",
                                },
                            })
                        }
                    />
                    <Hotel size={16} />
                    Hotel selection as per honeymoon package category
                </label>

                <p className="mt-2 text-sm text-muted-foreground">
                    Hotels will be arranged according to the selected honeymoon
                    category (3★ / 4★ / 5★ or equivalent romantic resorts).
                </p>
            </div>
        </div>
    );
};

export default HotelDetailsSection;
