import {
  Image as ImageIcon,
  CheckCircle,
  IndianRupee,
  Percent,
  GalleryHorizontal,
  BadgeIndianRupee,
} from "lucide-react";

const dummyImageData = {
  Delhi: [
    "https://placehold.co/600x400?text=Delhi+1",
    "https://placehold.co/600x400?text=Delhi+2",
    "https://placehold.co/600x400?text=Delhi+3",
  ],
  Goa: [
    "https://placehold.co/600x400?text=Goa+1",
    "https://placehold.co/600x400?text=Goa+2",
    "https://placehold.co/600x400?text=Goa+3",
  ],
  Jaipur: [
    "https://placehold.co/600x400?text=Jaipur+1",
    "https://placehold.co/600x400?text=Jaipur+2",
    "https://placehold.co/600x400?text=Jaipur+3",
  ],
};

const PricingMediaSection = ({
  formData,
  setFormData,
  handleInputChange,
  styles,
}) => {
  const { cardStyle, labelStyle, inputStyle } = styles;

  const handleImageToggle = (imgUrl) => {
    const isSelected = formData.destination_images.includes(imgUrl);
    const updatedImages = isSelected
      ? formData.destination_images.filter((url) => url !== imgUrl)
      : [...formData.destination_images, imgUrl];

    setFormData((prev) => ({
      ...prev,
      destination_images: updatedImages,
    }));
  };

  return (
    <div className={`${cardStyle} border border-pink-200 dark:border-pink-900`}>
      <h2 className="mb-4 border-b border-pink-200 pb-2 text-xl font-bold text-pink-600 dark:border-pink-900">
        Honeymoon Pricing & Media 💕
      </h2>

      {/* 💰 Pricing Section */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label className={labelStyle}>
            <IndianRupee className="inline mr-2 text-pink-500" size={16} />
            Standard Honeymoon Price
          </label>
          <input
            type="number"
            name="pricing"
            value={formData.pricing}
            onChange={handleInputChange}
            className={`${inputStyle} focus:ring-pink-300`}
            placeholder="Base honeymoon package price"
          />
        </div>

        <div>
          <label className={labelStyle}>
            <BadgeIndianRupee className="inline mr-2 text-pink-500" size={16} />
            Best Quote (Optional)
          </label>
          <input
            type="number"
            name="best_price"
            value={formData.best_price || ""}
            onChange={handleInputChange}
            className={`${inputStyle} focus:ring-pink-300`}
            placeholder="Special honeymoon deal"
          />
        </div>

        <div className="md:col-span-2">
          <label className={labelStyle}>
            <Percent className="inline mr-2 text-pink-500" size={16} />
            Honeymoon Discount
          </label>
          <input
            type="number"
            name="discount"
            value={formData.discount}
            onChange={handleInputChange}
            className={`${inputStyle} focus:ring-pink-300`}
            placeholder="Discount if applicable"
          />
        </div>

        <div className="md:col-span-2">
          <label className={labelStyle}>
            <ImageIcon className="inline mr-2 text-pink-500" size={16} />
            Thumbnail Image URL
          </label>
          <input
            type="url"
            name="destination_thumbnail"
            value={formData.destination_thumbnail}
            onChange={handleInputChange}
            className={`${inputStyle} focus:ring-pink-300`}
            placeholder="https://example.com/romantic-cover.jpg"
          />
        </div>
      </div>

      {/* 🖼️ Image Picker */}
      {formData.selected_destination &&
      dummyImageData[formData.selected_destination] ? (
        <div className="mt-6">
          <label className={labelStyle}>
            <GalleryHorizontal className="inline mr-2 text-pink-500" size={16} />
            Select Honeymoon Images for {formData.selected_destination}
          </label>

          <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
            {dummyImageData[formData.selected_destination].map(
              (imgUrl, idx) => {
                const isSelected =
                  formData.destination_images.includes(imgUrl);
                return (
                  <div
                    key={idx}
                    className={`relative cursor-pointer rounded-lg border-2 transition ${
                      isSelected
                        ? "border-pink-500"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                    onClick={() => handleImageToggle(imgUrl)}
                  >
                    <img
                      src={imgUrl}
                      alt={`img-${idx}`}
                      className="h-20 w-full rounded-lg object-cover"
                    />
                    {isSelected && (
                      <CheckCircle
                        size={18}
                        className="absolute top-1 right-1 rounded-full bg-white text-pink-600"
                      />
                    )}
                  </div>
                );
              }
            )}
          </div>
        </div>
      ) : (
        <p className="mt-4 text-sm italic text-gray-500">
          Please select a destination to view honeymoon images.
        </p>
      )}
    </div>
  );
};

export default PricingMediaSection;
