import React, { useState } from "react";
import {
  Star,
  Plus,
  Trash2,
  MessageSquare,
  UploadCloud,
  Image as ImageIcon,
  Loader2,
  X,
  Sparkles,
  Heart,
  Calendar,
} from "lucide-react";
import { uploadFileToS3 } from "../../../utils/s3Uploader";
import { toast } from "react-toastify";

export const ActivityReviewsSection = ({
  formData,
  handleInputChange,
  styles,
}) => {
  const { cardStyle, labelStyle, inputStyle } = styles;
  const reviews = formData.reviews || [];

  const [uploadingAvatarIdx, setUploadingAvatarIdx] = useState(null);
  const [uploadingPhotosIdx, setUploadingPhotosIdx] = useState(null);
  const [localBlobUrls, setLocalBlobUrls] = useState({});

  const cdnBase = import.meta.env.VITE_CDN_URL?.trim() || "https://media.trip2honeymoon.com";
  const getDisplayUrl = (key) => {
    if (!key) return "";
    if (localBlobUrls[key]) return localBlobUrls[key];
    if (key.startsWith("http://") || key.startsWith("https://") || key.startsWith("blob:")) return key;
    return `${cdnBase}/${key}`;
  };

  const handleAddReview = () => {
    const today = new Date();
    const dateStr = today.toLocaleString("default", { month: "short", year: "numeric" });
    const newRev = {
      name: "",
      profile_image: "",
      rating: 5,
      review_tag: "Excellent",
      review_date: dateStr,
      message: "",
      images: [],
    };
    const updated = [...reviews, newRev];
    handleInputChange({ target: { name: "reviews", value: updated } });
  };

  const handleRemoveReview = (index) => {
    const updated = reviews.filter((_, idx) => idx !== index);
    handleInputChange({ target: { name: "reviews", value: updated } });
  };

  const handleReviewFieldChange = (index, field, value) => {
    const updated = [...reviews];
    updated[index] = { ...updated[index], [field]: value };
    handleInputChange({ target: { name: "reviews", value: updated } });
  };

  // Avatar Upload
  const handleAvatarUpload = async (index, file) => {
    if (!file) return;
    setUploadingAvatarIdx(index);
    try {
      const localBlob = URL.createObjectURL(file);
      const { s3Key, viewUrl, publicUrl } = await uploadFileToS3(file, {
        type: "activities",
        fileType: "review_avatar",
      });
      const display = viewUrl || localBlob || publicUrl;
      if (s3Key && display) {
        setLocalBlobUrls((prev) => ({ ...prev, [s3Key]: display }));
      }
      handleReviewFieldChange(index, "profile_image", s3Key);
      toast.success("Reviewer avatar uploaded!");
    } catch (err) {
      console.error("Avatar upload error:", err);
      toast.error("Failed to upload avatar");
    } finally {
      setUploadingAvatarIdx(null);
    }
  };

  // Review Gallery Photos Upload
  const handlePhotosUpload = async (index, filesList) => {
    const files = Array.from(filesList || []);
    if (files.length === 0) return;
    setUploadingPhotosIdx(index);

    try {
      const updated = [...reviews];
      const existingImages = [...(updated[index].images || [])];

      for (const file of files) {
        const localBlob = URL.createObjectURL(file);
        const { s3Key, viewUrl, publicUrl } = await uploadFileToS3(file, {
          type: "activities",
          fileType: "review_gallery",
        });
        const display = viewUrl || localBlob || publicUrl;
        if (s3Key && display) {
          setLocalBlobUrls((prev) => ({ ...prev, [s3Key]: display }));
        }
        existingImages.push(s3Key);
      }

      updated[index].images = existingImages;
      handleInputChange({ target: { name: "reviews", value: updated } });
      toast.success(`${files.length} review photo(s) uploaded!`);
    } catch (err) {
      console.error("Review photo upload error:", err);
      toast.error("Failed to upload review photos");
    } finally {
      setUploadingPhotosIdx(null);
    }
  };

  const handleRemovePhoto = (revIndex, photoIndex) => {
    const updated = [...reviews];
    updated[revIndex].images = (updated[revIndex].images || []).filter(
      (_, i) => i !== photoIndex
    );
    handleInputChange({ target: { name: "reviews", value: updated } });
  };

  return (
    <div className={cardStyle}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-3.5">
          <div className="size-11 rounded-2xl bg-gradient-to-br from-amber-500 to-rose-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/25 shrink-0">
            <Star size={20} className="fill-white" />
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Customer Reviews & Experiences
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
              Admin-curated reviews with traveler photos, ratings, and testimonials
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-xl text-[10px] font-black uppercase tracking-wider">
            {reviews.length} Reviews Added
          </span>
          <button
            type="button"
            onClick={handleAddReview}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-md shadow-amber-600/30 cursor-pointer active:scale-95"
          >
            <Plus size={15} />
            <span>Add Review</span>
          </button>
        </div>
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400">
        Curate real customer feedback, high ratings, and holiday photos to build trust and elevate booking conversion.
      </p>

      {/* Review List */}
      <div className="space-y-5 pt-2">
        {reviews.map((rev, idx) => (
          <div
            key={idx}
            className="p-5 sm:p-6 rounded-2xl bg-slate-50 dark:bg-[#050A17] border border-slate-200 dark:border-slate-800/80 shadow-inner relative space-y-5"
          >
            {/* Header: Reviewer Index & Delete */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="size-6 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center text-xs font-black">
                  #{idx + 1}
                </span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {rev.name ? rev.name : "New Review"}
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleRemoveReview(idx)}
                className="text-xs text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-rose-500/10 transition-colors"
              >
                <Trash2 size={14} />
                <span>Delete</span>
              </button>
            </div>

            {/* Profile Info, Rating, Tag, Date */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start">
              {/* Profile Avatar Upload */}
              <div className="sm:col-span-3 flex flex-col items-center sm:items-start gap-2">
                <label className={labelStyle}>
                  <span>Profile Photo</span>
                </label>
                <div className="relative group size-20 rounded-full overflow-hidden border-2 border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center justify-center cursor-pointer hover:border-amber-500 transition-colors">
                  {rev.profile_image ? (
                    <img
                      src={getDisplayUrl(rev.profile_image)}
                      alt="Avatar"
                      className="size-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-400 group-hover:text-amber-400">
                      <ImageIcon size={22} />
                      <span className="text-[9px] uppercase font-bold mt-0.5">Upload</span>
                    </div>
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleAvatarUpload(idx, file);
                    }}
                  />

                  {uploadingAvatarIdx === idx && (
                    <div className="absolute inset-0 bg-slate-950/70 flex items-center justify-center text-white">
                      <Loader2 size={18} className="animate-spin" />
                    </div>
                  )}
                </div>
              </div>

              {/* Name, Tag, Date */}
              <div className="sm:col-span-9 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-1">
                    <label className={labelStyle}>
                      <span>Reviewer Name *</span>
                    </label>
                    <input
                      type="text"
                      value={rev.name}
                      onChange={(e) => handleReviewFieldChange(idx, "name", e.target.value)}
                      placeholder="e.g. Agnese Rudzinska"
                      className={inputStyle}
                    />
                  </div>

                  <div>
                    <label className={labelStyle}>
                      <span>Review Tag</span>
                    </label>
                    <input
                      type="text"
                      value={rev.review_tag}
                      onChange={(e) => handleReviewFieldChange(idx, "review_tag", e.target.value)}
                      placeholder="e.g. Excellent / Superb"
                      className={inputStyle}
                    />
                  </div>

                  <div>
                    <label className={labelStyle}>
                      <Calendar size={12} className="text-slate-400" />
                      <span>Date</span>
                    </label>
                    <input
                      type="text"
                      value={rev.review_date}
                      onChange={(e) => handleReviewFieldChange(idx, "review_date", e.target.value)}
                      placeholder="e.g. Oct 2026"
                      className={inputStyle}
                    />
                  </div>
                </div>

                {/* Rating Stars Selector */}
                <div>
                  <label className={labelStyle}>
                    <Star size={12} className="text-amber-400 fill-amber-400" />
                    <span>Star Rating ({rev.rating || 5} Stars)</span>
                  </label>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleReviewFieldChange(idx, "rating", star)}
                        className={`p-1.5 rounded-lg transition-transform hover:scale-125 cursor-pointer ${
                          star <= (rev.rating || 5)
                            ? "text-amber-400"
                            : "text-slate-300 dark:text-slate-700"
                        }`}
                      >
                        <Star
                          size={22}
                          className={star <= (rev.rating || 5) ? "fill-amber-400" : ""}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Review Message */}
            <div>
              <label className={labelStyle}>
                <MessageSquare size={12} className="text-indigo-400" />
                <span>Review Story / Testimonial *</span>
              </label>
              <textarea
                rows={3}
                value={rev.message}
                onChange={(e) => handleReviewFieldChange(idx, "message", e.target.value)}
                placeholder="Share their experience (e.g. Everything was great. No waiting. Beautiful sunrise and perfect views...)"
                className={`${inputStyle} resize-none mt-1 leading-relaxed`}
              />
            </div>

            {/* Attached Vacation / Activity Photos */}
            <div className="p-4 rounded-xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <label className={labelStyle}>
                  <ImageIcon size={13} className="text-amber-400" />
                  <span>Attached Trip Photos (Optional)</span>
                </label>
                <label className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors">
                  {uploadingPhotosIdx === idx ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <UploadCloud size={13} />
                  )}
                  <span>Upload Photos</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    disabled={uploadingPhotosIdx === idx}
                    onChange={(e) => handlePhotosUpload(idx, e.target.files)}
                  />
                </label>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 pt-1">
                {(rev.images || []).map((img, imgIdx) => (
                  <div
                    key={imgIdx}
                    className="relative group aspect-square rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 bg-slate-200 dark:bg-slate-800"
                  >
                    <img
                      src={getDisplayUrl(img)}
                      alt={`Review photo ${imgIdx + 1}`}
                      className="size-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(idx, imgIdx)}
                      className="absolute top-1 right-1 p-1 rounded-full bg-rose-600/90 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove photo"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}

                {(rev.images || []).length === 0 && (
                  <div className="col-span-full text-center py-3 text-xs text-slate-500">
                    No photos attached yet. You can attach guest travel photos matching the Thrillophilia review gallery.
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {reviews.length === 0 && (
          <div className="p-8 text-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20">
            <Star size={32} className="mx-auto text-slate-400 mb-2" />
            <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
              No customer reviews added yet.
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Click &quot;Add Review&quot; to showcase honeymooner testimonials and trip photos.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
