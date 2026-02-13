import { PlusCircle, Trash2 } from "lucide-react";

const HotelDetailsSection = ({
  formData,
  handleArrayChange,
  handleAddItem,
  handleRemoveItem,
  styles,
  handleInputChange,
}) => {
  const { cardStyle, labelStyle, inputStyle } = styles;

  // Convert the string to a boolean for checkbox checked state
  const isChecked = formData.hotel_as_per_category === "As per category";

  return (
    <div className={`${cardStyle} border-pink-200 dark:border-pink-900`}>
      <h2 className="mb-4 border-b border-pink-200 pb-2 text-xl font-bold text-pink-600 dark:border-pink-900">
        Honeymoon Hotel Details 🏨💍
      </h2>

      {/* Checkbox input */}
      <div className="mb-5 flex items-center rounded-md bg-pink-50 p-3 dark:bg-gray-800">
        <input
          type="checkbox"
          id="hotel_as_per_category"
          name="hotel_as_per_category"
          checked={isChecked}
          onChange={(e) =>
            handleInputChange({
              target: {
                name: "hotel_as_per_category",
                value: e.target.checked ? "As per category" : "",
              },
            })
          }
          className="mr-3 h-4 w-4 accent-pink-600"
        />
        <label
          htmlFor="hotel_as_per_category"
          className="font-medium text-gray-700 dark:text-gray-300"
        >
          Luxury stay as per honeymoon category
        </label>
      </div>

      {/* Hotel info fields */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="hotel_name" className={labelStyle}>
            💖 Hotel Name
          </label>
          <input
            type="text"
            id="hotel_name"
            name="hotel_name"
            value={formData.hotel_name || ""}
            onChange={handleInputChange}
            className={`${inputStyle} focus:ring-pink-300`}
            placeholder="Romantic resort / boutique hotel"
          />
        </div>

        <div>
          <label htmlFor="hotel_category" className={labelStyle}>
            ⭐ Hotel Category
          </label>
          <input
            type="text"
            id="hotel_category"
            name="hotel_category"
            value={formData.hotel_category || ""}
            onChange={handleInputChange}
            className={`${inputStyle} focus:ring-pink-300`}
            placeholder="4★ Luxury, 5★ Premium, Beach Resort"
          />
        </div>
      </div>
    </div>
  );
};

export default HotelDetailsSection;
