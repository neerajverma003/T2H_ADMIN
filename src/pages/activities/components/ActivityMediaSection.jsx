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
  const [previewUrls, setPreviewUrls] = useState({});

  const cdnBase = import.meta.env.VITE_CDN_URL?.trim() || "https://media.trip2honeymoon.com";
  const getImagePreviewUrl = (imgKey) => {
    if (!imgKey) return "";
    if (previewUrls[imgKey]) return previewUrls[imgKey];
    if (imgKey.startsWith("http://") || imgKey.startsWith("https://") || imgKey.startsWith("blob:")) return imgKey;
    return `${cdnBase}/${imgKey}`;
  };

  // Handle Cover Image Upload
  const handleCoverUpload = async (e) => {
    const inputEl = e.target;
    const file = inputEl.files?.[0];
    if (!file) return;

    setIsUploadingCover(true);
    try {
      // Create immediate blob preview
      const localBlobUrl = URL.createObjectURL(file);

      // uploadFileToS3 automatically converts file to WebP format
      const { s3Key, viewUrl, publicUrl } = await uploadFileToS3(file, {
        type: "activities",
        fileType: "cover",
      });

      const displayUrl = viewUrl || localBlobUrl || publicUrl;
      if (s3Key && displayUrl) {
        setPreviewUrls((prev) => ({ ...prev, [s3Key]: displayUrl }));
      }

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
          const localBlobUrl = URL.createObjectURL(file);
          const { s3Key, viewUrl, publicUrl } = await uploadFileToS3(file, {
            type: "activities",
            fileType: "gallery",
          });

          if (s3Key) {
            const displayUrl = viewUrl || localBlobUrl || publicUrl;
            if (displayUrl) {
              setPreviewUrls((prev) => ({ ...prev, [s3Key]: displayUrl }));
            }

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

      <div className="space-y-8 pt-2">
        {/* 1. Primary Cover Photo (Top, Full Width) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className={labelStyle}>
              <span>Primary Cover Photo</span> <span className="text-red-400">*</span>
            </label>
            {formData.cover_image && (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                <Check size={11} /> Cover Active
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3.5">
            Main display image shown on search cards, destination highlights, and hero header of the activity page.
          </p>

          {formData.cover_image ? (
            <div className="relative group rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#050A17] h-64 sm:h-72 md:h-80 shadow-inner">
              <img
                src={getImagePreviewUrl(formData.cover_image)}
                alt="Activity Cover"
                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <label className="px-4 py-2.5 bg-white text-slate-900 font-bold rounded-xl text-xs cursor-pointer shadow-lg hover:bg-slate-100 transition-colors flex items-center gap-1.5">
                  <UploadCloud size={15} />
                  <span>Replace Photo</span>
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
                  className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs shadow-lg transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <X size={15} />
                  <span>Remove</span>
                </button>
              </div>
              <span className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 border border-white/10">
                <Check size={12} className="text-emerald-400" /> WebP Optimized
              </span>
            </div>
          ) : (
            <label
              className={`flex flex-col items-center justify-center h-56 sm:h-64 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
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

        {/* 2. Mosaic Gallery Photos (Bottom with space) */}
        <div className="pt-8 border-t border-slate-100 dark:border-slate-800/80 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <label className={labelStyle}>
                <span>Mosaic Gallery Photos</span>
              </label>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Upload multiple photos for the experience gallery (supporting multiple file selection with automatic WebP conversion).
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
              <span className="px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-[11px] font-black uppercase tracking-wider">
                {formData.gallery_images?.length || 0} Photos Added
              </span>
            </div>
          </div>

          {/* Upload Dropzone / Gallery Photos List */}
          {(!formData.gallery_images || formData.gallery_images.length === 0) ? (
            <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-indigo-500/60 rounded-2xl bg-slate-50 dark:bg-[#050A17] hover:bg-white dark:hover:bg-[#070D1F] cursor-pointer transition-all">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleGalleryUpload}
                disabled={isUploadingGallery}
                className="hidden"
              />
              {isUploadingGallery ? (
                <div className="flex flex-col items-center gap-2 p-4 text-center">
                  <Loader2 className="animate-spin text-indigo-400" size={28} />
                  <span className="text-xs font-bold text-slate-300">
                    {galleryProgress || "Converting to WebP & Uploading..."}
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-center p-6">
                  <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                    <UploadCloud size={22} />
                  </div>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    Click or drag multiple photos to add to Mosaic Gallery
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    PNG, JPG, JPEG (Select multiple images — all auto-converted to WebP)
                  </span>
                </div>
              )}
            </label>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 sm:gap-4">
                {formData.gallery_images.map((imgKey, index) => (
                  <div
                    key={index}
                    className="relative group rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#050A17] h-32 sm:h-36 shadow-xs hover:shadow-md transition-all"
                  >
                    <img
                      src={getImagePreviewUrl(imgKey)}
                      alt={`Gallery ${index + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {/* Index Badge */}
                    <span className="absolute top-2 left-2 size-6 rounded-lg bg-black/70 backdrop-blur-md text-white text-[10px] font-black flex items-center justify-center border border-white/10">
                      {index + 1}
                    </span>
                    {/* Remove Action */}
                    <button
                      type="button"
                      onClick={() => handleRemoveGalleryImage(index)}
                      className="absolute top-2 right-2 size-7 bg-red-600/90 hover:bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-md flex items-center justify-center"
                      title="Remove photo"
                    >
                      <X size={14} />
                    </button>
                    <span className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-md text-[9px] font-bold text-white px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      WebP
                    </span>
                  </div>
                ))}

                {/* Always-accessible Add More Photos Card in the grid */}
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-indigo-500/60 rounded-2xl bg-slate-50 dark:bg-[#050A17] hover:bg-white dark:hover:bg-[#070D1F] h-32 sm:h-36 cursor-pointer transition-all group">
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
                      <Loader2 className="animate-spin text-indigo-400" size={20} />
                      <span className="text-[10px] font-bold text-slate-400">
                        {galleryProgress || "Uploading..."}
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-center p-2">
                      <div className="size-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <UploadCloud size={16} />
                      </div>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Add More
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        Multiple files
                      </span>
                    </div>
                  )}
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default ActivityMediaSection;
