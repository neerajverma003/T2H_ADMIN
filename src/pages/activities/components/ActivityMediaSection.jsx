import React, { useState } from "react";
import { Image as ImageIcon, UploadCloud, X, Loader2, Sparkles, Check } from "lucide-react";
import { uploadFileToS3 } from "../../../utils/s3Uploader";
import { toast } from "react-toastify";

export const ActivityMediaSection = ({
  formData,
  handleInputChange,
  styles,
  errors = {},
}) => {
  const { cardStyle, labelStyle } = styles;
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [galleryProgress, setGalleryProgress] = useState("");

  const cdnBase = import.meta.env.VITE_CDN_URL?.trim() || "https://media.trip2honeymoon.com";
  const getImagePreviewUrl = (imgKey) => {
    if (!imgKey) return "";
    if (imgKey.startsWith("http://") || imgKey.startsWith("https://")) return imgKey;
    return `${cdnBase}/${imgKey}`;
  };

  // Handle Cover Image Upload
  const handleCoverUpload = async (e) => {
    const inputEl = e.target;
    const file = inputEl.files?.[0];
    if (!file) return;

    setIsUploadingCover(true);
    try {
      // uploadFileToS3 automatically converts file to WebP format
      const { s3Key } = await uploadFileToS3(file, {
        type: "activities",
        fileType: "cover",
      });

      handleInputChange({
        target: { name: "cover_image", value: s3Key },
      });
      toast.success("Cover image converted to WebP & uploaded!");
    } catch (err) {
      console.error("Cover upload error:", err);
      toast.error("Failed to upload cover image");
    } finally {
      setIsUploadingCover(false);
      if (inputEl) inputEl.value = "";
    }
  };

  // Handle Gallery Images Upload (Sequential with Real-Time Feedback)
  const handleGalleryUpload = async (e) => {
    const inputEl = e.target;
    const files = Array.from(inputEl.files || []);
    if (files.length === 0) return;

    setIsUploadingGallery(true);
    let currentGallery = [...(formData.gallery_images || [])];
    let successCount = 0;

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setGalleryProgress(`Uploading ${i + 1}/${files.length}...`);

        try {
          const { s3Key } = await uploadFileToS3(file, {
            type: "activities",
            fileType: "gallery",
          });

          if (s3Key) {
            currentGallery = [...currentGallery, s3Key];
            successCount++;
            // Update form state immediately as each photo finishes
            handleInputChange({
              target: { name: "gallery_images", value: currentGallery },
            });
          }
        } catch (fileErr) {
          console.error(`Failed to upload ${file.name}:`, fileErr);
          toast.warn(`Failed to upload ${file.name}`);
        }
      }

      if (successCount > 0) {
        toast.success(`${successCount} photo${successCount > 1 ? "s" : ""} added to mosaic gallery!`);
      }
    } catch (err) {
      console.error("Gallery upload error:", err);
      toast.error("Failed to upload gallery images");
    } finally {
      setIsUploadingGallery(false);
      setGalleryProgress("");
      if (inputEl) inputEl.value = "";
    }
  };

  // Remove Gallery Image
  const handleRemoveGalleryImage = (indexToRemove) => {
    const updated = (formData.gallery_images || []).filter((_, idx) => idx !== indexToRemove);
    handleInputChange({
      target: { name: "gallery_images", value: updated },
    });
  };

  return (
    <div className={cardStyle}>
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100 dark:border-slate-800">
        <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <ImageIcon className="text-blue-600 dark:text-blue-400" size={22} />
          Media & Photo Gallery
        </h2>
        <div className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-[11px] font-black uppercase tracking-widest flex items-center gap-1.5">
          <Sparkles size={12} className="text-amber-500" /> WebP Auto-Compression
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Cover Image Section */}
        <div>
          <label className={labelStyle}>
            Primary Cover Photo <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
            Main display image shown on search cards and top of details page.
          </p>

          {formData.cover_image ? (
            <div className="relative group rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 h-64">
              <img
                src={getImagePreviewUrl(formData.cover_image)}
                alt="Activity Cover"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <label className="px-4 py-2 bg-white text-slate-900 font-bold rounded-xl text-xs cursor-pointer shadow-lg hover:bg-slate-100 transition-colors">
                  Replace Photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverUpload}
                    className="hidden"
                  />
                </label>
                <button
                  type="button"
                  onClick={() =>
                    handleInputChange({ target: { name: "cover_image", value: "" } })
                  }
                  className="px-4 py-2 bg-red-600 text-white font-bold rounded-xl text-xs shadow-lg hover:bg-red-700 transition-colors cursor-pointer"
                >
                  Remove
                </button>
              </div>
              <span className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1">
                <Check size={12} className="text-emerald-400" /> WebP Optimized
              </span>
            </div>
          ) : (
            <label
              className={`flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
                errors.cover_image
                  ? "border-red-500 bg-red-50/20"
                  : "border-slate-300 dark:border-slate-700 hover:border-blue-500 bg-slate-50 dark:bg-slate-800/40"
              }`}
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverUpload}
                disabled={isUploadingCover}
                className="hidden"
              />
              {isUploadingCover ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="animate-spin text-blue-600" size={32} />
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    Converting to WebP & Uploading...
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 p-6 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center mb-1">
                    <UploadCloud size={24} />
                  </div>
                  <span className="text-sm font-bold text-slate-800 dark:text-white">
                    Click to upload Cover Photo
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    PNG, JPG, JPEG (Automatically converted to WebP)
                  </span>
                </div>
              )}
            </label>
          )}
          {errors.cover_image && (
            <p className="mt-1.5 text-xs font-bold text-red-500 uppercase tracking-wider">
              {errors.cover_image}
            </p>
          )}
        </div>

        {/* Gallery Images Section */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className={labelStyle}>Mosaic Gallery Photos</label>
            <span className="text-xs font-bold text-slate-400">
              {formData.gallery_images?.length || 0} Photos Added
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
            Upload multiple photos for the 5-image mosaic grid (matching Thrillophilia style).
          </p>

          <div className="grid grid-cols-3 gap-3 max-h-64 overflow-y-auto p-1 custom-scrollbar">
            {formData.gallery_images?.map((imgKey, index) => (
              <div
                key={index}
                className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 h-28"
              >
                <img
                  src={getImagePreviewUrl(imgKey)}
                  alt={`Gallery ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveGalleryImage(index)}
                  className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-600/90 hover:bg-red-700 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-md"
                  title="Remove image"
                >
                  <X size={13} />
                </button>
                <span className="absolute bottom-1 left-1 bg-slate-900/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                  #{index + 1}
                </span>
              </div>
            ))}

            {/* Add More Button */}
            <label className="flex flex-col items-center justify-center h-28 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl hover:border-blue-500 bg-slate-50 dark:bg-slate-800/40 cursor-pointer transition-all">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleGalleryUpload}
                disabled={isUploadingGallery}
                className="hidden"
              />
              {isUploadingGallery ? (
                <div className="flex flex-col items-center gap-1.5 p-2 text-center">
                  <Loader2 className="animate-spin text-blue-600" size={22} />
                  <span className="text-[10px] font-black text-blue-600 dark:text-blue-400">
                    {galleryProgress || "Uploading..."}
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1 text-slate-500 dark:text-slate-400">
                  <UploadCloud size={20} className="text-blue-600" />
                  <span className="text-[11px] font-bold text-center">Add Photos</span>
                </div>
              )}
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ActivityMediaSection;
