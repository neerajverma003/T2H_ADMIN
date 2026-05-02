import { useEffect, useState } from "react";
import {
  CheckCircle,
  GalleryHorizontal,
  Image as ImageIcon,
  Video,
  X,
} from "lucide-react";
import { apiClient } from "../../../stores/authStore";

const MediaSection = ({ formData, setFormData, styles }) => {
  const { labelStyle, cardStyle } = styles;

  const [destinationImages, setDestinationImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchDestImages = async () => {
      if (!formData.selected_destination_id) {
        setDestinationImages([]);
        return;
      }

      try {
        setIsLoading(true);
        // Fetch destination details to get title_image and show_image
        const res = await apiClient.get(
          `/admin/destination/edit/${formData.selected_destination_id}`
        );
        const destData = res?.data?.destination;
        const images = [
          ...(destData?.title_image || []),
          ...(destData?.show_image || [])
        ];
        // Remove duplicates if any
        setDestinationImages([...new Set(images)]);
      } catch (error) {
        console.error("Error fetching destination images:", error);
        setDestinationImages([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDestImages();
  }, [formData.selected_destination_id]);

  // Extract raw S3 key from presigned URL or return the key directly
  const extractS3Key = (urlOrKey) => {
    if (!urlOrKey || typeof urlOrKey !== "string") return urlOrKey;
    if (!urlOrKey.startsWith("http")) return urlOrKey;
    try {
      const url = new URL(urlOrKey);
      let key = decodeURIComponent(url.pathname);
      if (key.startsWith("/")) key = key.substring(1);
      return key;
    } catch {
      return urlOrKey;
    }
  };

  const isImageSelected = (selectedList, imgUrl) => {
    const imgKey = extractS3Key(imgUrl);
    return selectedList.some((s) => extractS3Key(s) === imgKey);
  };

  const handleImageToggle = (imgUrl) => {
    const imgKey = extractS3Key(imgUrl);
    const isSelected = isImageSelected(formData.destination_images, imgUrl);
    const updatedImages = isSelected
      ? formData.destination_images.filter(
          (url) => extractS3Key(url) !== imgKey
        )
      : [...formData.destination_images, imgKey];

    setFormData((prev) => ({
      ...prev,
      destination_images: updatedImages,
    }));
  };

  const handleThumbnailToggle = (thumbUrl) => {
    const thumbKey = extractS3Key(thumbUrl);
    const isSelected = isImageSelected(formData.destination_thumbnails, thumbUrl);
    const updatedThumbnails = isSelected
      ? formData.destination_thumbnails.filter(
          (url) => extractS3Key(url) !== thumbKey
        )
      : [...formData.destination_thumbnails, thumbKey];

    setFormData((prev) => ({
      ...prev,
      destination_thumbnails: updatedThumbnails,
    }));
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        destination_video: file,
      }));
    }
  };

  const handleRemoveVideo = () => {
    setFormData((prev) => ({
      ...prev,
      destination_video: null,
      destination_video_removed: true,
    }));

    const fileInput = document.getElementById("video-upload");
    if (fileInput) fileInput.value = "";
  };

  const handleDirectImageUpload = (e, type) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result;
        setFormData((prev) => ({
          ...prev,
          [type]: [...prev[type], dataUrl],
        }));
      };
      reader.readAsDataURL(file);
    });

    e.target.value = "";
  };

  const handleRemoveDirectImage = (index, type) => {
    setFormData((prev) => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index),
    }));
  };

  const renderImageGrid = (images, selectedImages, onToggle) => {
    if (isLoading)
      return (
        <p className="text-sm italic text-gray-500">
          Loading honeymoon images…
        </p>
      );
    if (!images.length)
      return (
        <p className="text-sm italic text-gray-500">
          No images available for this destination.
        </p>
      );

    return (
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
        {images.map((imgUrl, idx) => {
          const isSelected = isImageSelected(selectedImages, imgUrl);
          return (
            <div
              key={idx}
              className={`relative cursor-pointer rounded-lg border-2 transition ${
                isSelected
                  ? "border-pink-500"
                  : "border-gray-300 dark:border-gray-600"
              }`}
              onClick={() => onToggle(imgUrl)}
            >
              <img
                src={imgUrl}
                alt=""
                className="h-20 w-full rounded-lg object-cover"
              />
              {isSelected && (
                <CheckCircle
                  size={18}
                  className="absolute right-1 top-1 rounded-full bg-white text-pink-600"
                />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className={`${cardStyle} mt-8 space-y-6 border-pink-200 dark:border-pink-900`}>
      <h2 className="border-b border-pink-200 pb-2 text-xl font-bold text-pink-600 dark:border-pink-900">
        Honeymoon Media Gallery 💕
      </h2>

      {formData.selected_destination_id ? (
        <>
          {/* Video */}
          <div className="space-y-3">
            <label className={labelStyle}>
              <Video className="mr-2 inline text-pink-500" size={16} />
              Honeymoon Highlight Video
            </label>

            {formData.destination_video ? (
              <div className="flex items-center gap-2 rounded-md border bg-pink-50 p-2 dark:bg-gray-800">
                <p className="truncate text-sm font-medium">
                  {formData.destination_video.name ||
                    formData.destination_video}
                </p>
                <button
                  type="button"
                  onClick={handleRemoveVideo}
                  className="ml-auto p-1 text-gray-500 hover:text-red-600"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <input
                id="video-upload"
                type="file"
                accept="video/*"
                onChange={handleVideoChange}
                className="block w-full cursor-pointer text-sm file:rounded-md file:border-0 file:bg-pink-100 file:px-4 file:py-2 file:font-semibold file:text-pink-700 hover:file:bg-pink-200"
              />
            )}
          </div>

          {/* Thumbnails */}
          <div className="space-y-3 pt-4 border-t border-gray-100">
            <label className={labelStyle}>
              <ImageIcon className="mr-2 inline text-pink-500" size={16} />
              Thumbnail Images (from Destination)
            </label>
            {renderImageGrid(
              destinationImages,
              formData.destination_thumbnails || [],
              handleThumbnailToggle
            )}

            <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload New Thumbnails
                </label>
                <input 
                    type="file" 
                    accept="image/*"
                    multiple
                    onChange={(e) => handleDirectImageUpload(e, "destination_thumbnails")}
                    className="block w-full cursor-pointer text-sm file:rounded-md file:border-0 file:bg-blue-100 file:px-4 file:py-2 file:font-semibold file:text-blue-700 hover:file:bg-blue-200"
                />
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2">
                {formData.destination_thumbnails
                    .filter((i) => typeof i === 'string' && i.startsWith("data:"))
                    .map((img, i) => (
                        <div key={i} className="relative group border rounded-lg overflow-hidden shadow-sm">
                            <img src={img} className="h-20 w-full object-cover" alt="Preview" />
                            <button
                                type="button"
                                onClick={() => handleRemoveDirectImage(i, "destination_thumbnails")}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X size={12} />
                            </button>
                        </div>
                    ))}
            </div>
          </div>

          {/* Gallery - Kept empty as requested */}
          <div className="space-y-3 pt-4 border-t border-gray-100">
            <label className={labelStyle}>
              <GalleryHorizontal
                className="mr-2 inline text-pink-500"
                size={16}
              />
              Honeymoon Destination Images
            </label>
            <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-200">
                <p className="text-sm text-gray-400">Gallery images are currently hidden. You can upload custom images below.</p>
            </div>
          </div>

          {/* Upload images */}
          <div className="space-y-3 pt-4 border-t border-gray-100">
            <label className={labelStyle}>
              <ImageIcon className="mr-2 inline text-pink-500" size={16} />
              Upload Your Own Romantic Images
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) =>
                handleDirectImageUpload(e, "destination_images")
              }
              className="block w-full cursor-pointer text-sm file:rounded-md file:border-0 file:bg-green-100 file:px-4 file:py-2 file:font-semibold file:text-green-700 hover:file:bg-green-200"
            />
            
            <div className="grid grid-cols-3 gap-3 pt-2">
                {formData.destination_images
                    .filter((i) => typeof i === 'string' && i.startsWith("data:"))
                    .map((img, i) => (
                        <div key={i} className="relative group border rounded-lg overflow-hidden shadow-sm">
                            <img src={img} className="h-20 w-full object-cover" alt="Preview" />
                            <button
                                type="button"
                                onClick={() => handleRemoveDirectImage(i, "destination_images")}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X size={12} />
                            </button>
                        </div>
                    ))}
            </div>
          </div>
        </>
      ) : (
        <p className="text-sm italic text-gray-500">
          Please select a destination to view honeymoon media options.
        </p>
      )}
    </div>
  );
};

export default MediaSection;
