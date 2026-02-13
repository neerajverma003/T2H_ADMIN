import {
  Globe,
  MapPin,
  Calendar,
  Eye,
  Layers,
  ListChecks,
  Text,
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

  const themes = [
    "Family",
    "Honeymoon",
    "Adventures",
    "Solo",
    "Wildlife",
    "Beach",
    "Pilgrimage",
    "Hill Station",
    "Heritage Tour",
    "Ayurveda Tour",
    "Cultural Tour",
    "Luxury Tour",
    "Budget Tour",
    "Family Tour",
    "Bachelor Tour",
    "Women Group",
    "Special Interest",
  ];

  const classification_types = ["Trending", "Exclusive", "Weekend"];

  const { destinationList, fetchDestinationList, isListLoading } =
    usePlaceStore();

  useEffect(() => {
    async function fetchPlacesData() {
      if (formData.travel_type) {
        await fetchDestinationList(formData.travel_type);
      }
    }
    fetchPlacesData();
  }, [formData.travel_type, fetchDestinationList]);

  const handleThemeChange = (e) => {
    const { value, checked } = e.target;
    const updatedThemes = checked
      ? [...formData.itinerary_theme, value]
      : formData.itinerary_theme.filter((theme) => theme !== value);

    handleInputChange({
      target: { name: "itinerary_theme", value: updatedThemes },
    });
  };

  const handleClassificationChange = (e) => {
    const { value, checked } = e.target;
    const updatedClassification = checked
      ? [...formData.classification, value]
      : formData.classification.filter((c) => c !== value);

    handleInputChange({
      target: { name: "classification", value: updatedClassification },
    });
  };

  const handleTravelTypeChange = (e) => {
    const value = e.target.value;
    handleInputChange({ target: { name: "travel_type", value } });
    handleInputChange({
      target: { name: "selected_destination_id", value: "" },
    });
    handleInputChange({
      target: { name: "selected_destination_name", value: "" },
    });
  };

  const handleDestinationChange = (e) => {
    const selectedId = e.target.value;
    const selectedDestination = destinationList.find(
      (d) => d._id === selectedId
    );
    const selectedName = selectedDestination
      ? selectedDestination.destination_name
      : "";

    handleInputChange({
      target: { name: "selected_destination_id", value: selectedId },
    });
    handleInputChange({
      target: { name: "selected_destination_name", value: selectedName },
    });
  };

  return (
    <div className={`${cardStyle} border-pink-200 dark:border-pink-900`}>
      <h2 className="mb-4 flex items-center border-b border-pink-200 pb-2 text-xl font-bold text-pink-600 dark:border-pink-900">
        <Layers className="mr-2 text-pink-500" size={20} />
        Honeymoon Core Details 💕
      </h2>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Title */}
        <div>
          <label className={labelStyle}>
            <Text className="mr-2 inline text-pink-500" size={16} />
            Title
          </label>
          {isEditing ? (
            <input
              type="text"
              name="title"
              value={formData.title || ""}
              onChange={handleInputChange}
              className={`${inputStyle} focus:ring-pink-300`}
              placeholder="Romantic Honeymoon Escape…"
            />
          ) : (
            <p className="rounded-md bg-pink-50 p-2 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
              {formData.title || "-"}
            </p>
          )}
        </div>

        {/* Travel Type + Destination */}
        <div>
          <label className={labelStyle}>
            <Globe className="mr-2 inline text-pink-500" size={16} />
            Travel Type
          </label>

          {isEditing ? (
            <div className="mt-2 flex gap-6">
              {["domestic", "international"].map((type) => (
                <label key={type} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="travel_type"
                    value={type}
                    checked={formData.travel_type === type}
                    onChange={handleTravelTypeChange}
                  />
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </label>
              ))}
            </div>
          ) : (
            <p className="rounded-md bg-pink-50 p-2">
              {formData.travel_type || "-"}
            </p>
          )}

          <label className={`${labelStyle} mt-4 block`}>
            <MapPin className="mr-2 inline text-pink-500" size={16} />
            Destination
          </label>

          {isEditing ? (
            <select
              name="selected_destination_id"
              value={formData.selected_destination_id || ""}
              onChange={handleDestinationChange}
              className={`${inputStyle} focus:ring-pink-300`}
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
          ) : (
            <p className="rounded-md bg-pink-50 p-2">
              {formData.selected_destination_name || "-"}
            </p>
          )}
        </div>

        {/* Duration */}
        <div>
          <label className={labelStyle}>
            <Calendar className="mr-2 inline text-pink-500" size={16} />
            Duration
          </label>

          {isEditing ? (
            <select
              name="duration"
              value={formData.duration || ""}
              onChange={handleInputChange}
              className={`${inputStyle} focus:ring-pink-300`}
            >
              <option value="">-- Select Duration --</option>
              {[
                "2 Days / 1 Night",
                "3 Days / 2 Nights",
                "4 Days / 3 Nights",
                "5 Days / 4 Nights",
                "6 Days / 5 Nights",
                "7 Days / 6 Nights",
                "10 Days / 9 Nights",
                "Custom",
              ].map((dur) => (
                <option key={dur} value={dur}>
                  {dur}
                </option>
              ))}
            </select>
          ) : (
            <p className="rounded-md bg-pink-50 p-2">
              {formData.duration || "-"}
            </p>
          )}
        </div>

        {/* Theme */}
        <div>
          <label className={labelStyle}>
            <ListChecks className="mr-2 inline text-pink-500" size={16} />
            Theme
          </label>

          {isEditing ? (
            <div className="mt-2 flex flex-wrap gap-3">
              {themes.map((theme) => (
                <label key={theme} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    value={theme}
                    checked={formData.itinerary_theme?.includes(theme)}
                    onChange={handleThemeChange}
                  />
                  <span>{theme}</span>
                </label>
              ))}
            </div>
          ) : (
            <p className="rounded-md bg-pink-50 p-2">
              {formData.itinerary_theme?.join(", ") || "-"}
            </p>
          )}
        </div>

        {/* Classification */}
        <div>
          <label className={labelStyle}>
            <ListChecks className="mr-2 inline text-pink-500" size={16} />
            Classification
          </label>

          {isEditing ? (
            <div className="mt-2 flex flex-wrap gap-3">
              {classification_types.map((classi) => (
                <label key={classi} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    value={classi}
                    checked={formData.classification?.includes(classi)}
                    onChange={handleClassificationChange}
                  />
                  <span>{classi}</span>
                </label>
              ))}
            </div>
          ) : (
            <p className="rounded-md bg-pink-50 p-2">
              {formData.classification?.join(", ") || "-"}
            </p>
          )}
        </div>

        {/* Type */}
        <div>
          <label className={labelStyle}>
            <Layers className="mr-2 inline text-pink-500" size={16} />
            Itinerary Type
          </label>

          {isEditing ? (
            <select
              name="itinerary_type"
              value={formData.itinerary_type || ""}
              onChange={handleInputChange}
              className={`${inputStyle} focus:ring-pink-300`}
            >
              <option value="flexible">Flexible</option>
              <option value="fixed">Fixed</option>
            </select>
          ) : (
            <p className="rounded-md bg-pink-50 p-2">
              {formData.itinerary_type || "-"}
            </p>
          )}
        </div>

        {/* Visibility */}
        <div>
          <label className={labelStyle}>
            <Eye className="mr-2 inline text-pink-500" size={16} />
            Visibility
          </label>

          {isEditing ? (
            <select
              name="itinerary_visibility"
              value={formData.itinerary_visibility || ""}
              onChange={handleInputChange}
              className={`${inputStyle} focus:ring-pink-300`}
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          ) : (
            <p className="rounded-md bg-pink-50 p-2">
              {formData.itinerary_visibility || "-"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoreDetailsSection;
