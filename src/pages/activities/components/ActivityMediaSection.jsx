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
      <div className="flex items-center justify-between pb-5 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-3.5">
          <div className="size-11 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 shrink-0">
            <ImageIcon size={20} />
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Media & Photo Gallery
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
              High-resolution cover visual and mosaic gallery with automated WebP conversion
            </p>
          </div>
        </div>
        <div className="px-3.5 py-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles size={11} className="text-amber-400" /> WebP Auto-Compression
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Cover Image Section */}
        <div>
          <label className={labelStyle}>
            Primary Cover Photo <span className="text-red-400">*</span>
          </label>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
            Main display image shown on search cards and top of details page.
          </p>

          {formData.cover_image ? (
            <div className="relative group rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#050A17] h-64 shadow-inner">
              <img
                src={getImagePreviewUrl(formData.cover_image)}
                alt="Activity Cover"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
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
              <span className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 border border-white/10">
                <Check size={12} className="text-emerald-400" /> WebP Optimized
              </span>
            </div>
          ) : (
            <label
              className={`flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
                errors.cover_image
                  ? "border-red-500/60 bg-red-500/10"
                  : "border-slate-200 dark:border-slate-800 hover:border-indigo-500/60 bg-slate-50 dark:bg-[#050A17] hover:bg-white dark:hover:bg-[#070D1F]"
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
                  <Loader2 className="animate-spin text-indigo-400" size={32} />
                  <span className="text-xs font-bold text-slate-300">
                    Converting to WebP & Uploading...
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 p-6 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-1">
                    <UploadCloud size={24} />
                  </div>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    Click to upload Cover Photo
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    PNG, JPG, JPEG (Automatically converted to WebP)
                  </span>
                </div>
              )}
            </label>
          )}
          {errors.cover_image && (
            <p className="mt-1.5 text-xs font-bold text-red-400 uppercase tracking-wider">
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
                className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#050A17] h-28 shadow-inner"
              >
                <img
                  src={getImagePreviewUrl(imgKey)}
                  alt={`Gallery ${index}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveGalleryImage(index)}
                  className="absolute top-1.5 right-1.5 p-1 bg-red-600/90 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-md hover:bg-red-700"
                  title="Remove photo"
                >
                  <X size={12} />
                </button>
              </div>
            ))}

            <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-indigo-500/60 rounded-xl bg-slate-50 dark:bg-[#050A17] hover:bg-white dark:hover:bg-[#070D1F] h-28 cursor-pointer transition-all">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleGalleryUpload}
                disabled={isUploadingGallery}
                className="hidden"
              />
              {isUploadingGallery ? (
                <div className="flex flex-col items-center gap-1.5 p-2 text-center">
                  <Loader2 className="animate-spin text-indigo-400" size={18} />
                  <span className="text-[10px] font-bold text-slate-400">
                    {galleryProgress || "Uploading..."}
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1 text-center p-2">
                  <UploadCloud size={18} className="text-indigo-400" />
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-300">Add Photos</span>
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
