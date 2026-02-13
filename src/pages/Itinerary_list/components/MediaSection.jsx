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

  const [galleryImages, setGalleryImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchImages = async () => {
      if (!formData.selected_destination_id) {
        setGalleryImages([]);
        return;
      }

      try {
        setIsLoading(true);
        const res = await apiClient.get(
          `/admin/image-Gallery/${formData.selected_destination_id}`
        );
        const apiImages = res?.data?.imageGalleryData?.image || [];

        const mergedImages = Array.from(
          new Set([...apiImages, ...(formData.destination_images || [])])
        );
        setGalleryImages(mergedImages);
      } catch {
        setGalleryImages(formData.destination_images || []);
      } finally {
        setIsLoading(false);
      }
    };

    fetchImages();
  }, [formData.selected_destination_id, formData.destination_images]);

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

  const handleThumbnailToggle = (thumbUrl) => {
    const isSelected = formData.destination_thumbnails.includes(thumbUrl);
    const updatedThumbnails = isSelected
      ? formData.destination_thumbnails.filter((url) => url !== thumbUrl)
      : [...formData.destination_thumbnails, thumbUrl];

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
          const isSelected = selectedImages.includes(imgUrl);
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
          <div className="space-y-3 pt-4">
            <label className={labelStyle}>
              <ImageIcon className="mr-2 inline text-pink-500" size={16} />
              Honeymoon Thumbnail Images
            </label>
            {renderImageGrid(
              galleryImages,
              formData.destination_thumbnails || [],
              handleThumbnailToggle
            )}
          </div>

          {/* Gallery */}
          <div className="space-y-3 pt-4">
            <label className={labelStyle}>
              <GalleryHorizontal
                className="mr-2 inline text-pink-500"
                size={16}
              />
              Honeymoon Destination Images
            </label>
            {renderImageGrid(
              galleryImages,
              formData.destination_images || [],
              handleImageToggle
            )}
          </div>

          {/* Upload images */}
          <div className="space-y-3 border-t border-gray-300 pt-4">
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
          </div>

          {/* Upload thumbnails */}
          <div className="space-y-3 border-t border-gray-300 pt-4">
            <label className={labelStyle}>
              <ImageIcon className="mr-2 inline text-pink-500" size={16} />
              Upload Custom Thumbnail Images
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) =>
                handleDirectImageUpload(e, "destination_thumbnails")
              }
              className="block w-full cursor-pointer text-sm file:rounded-md file:border-0 file:bg-blue-100 file:px-4 file:py-2 file:font-semibold file:text-blue-700 hover:file:bg-blue-200"
            />
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
