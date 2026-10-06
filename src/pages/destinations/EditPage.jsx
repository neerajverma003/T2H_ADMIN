import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { apiClient } from "../../stores/authStores";
import axios from "axios";
import { convertImageFileToWebP } from "../../utils/imageConverter";
import { motion } from "framer-motion";
import {
  Upload, X, Check, Image as ImageIcon, Trash2, Plus,
  MapPin, Globe, Navigation, Calendar, Clock, Layers, Eye, Sparkles, Loader2, Heart, Pencil,
  Building2, Compass, Film, Video, Play, Link as LinkIcon, UploadCloud, CheckCircle2
} from "lucide-react";

const cardStyle = "bg-white dark:bg-[#091126]/95 rounded-3xl p-7 md:p-9 border border-slate-200/90 dark:border-indigo-500/25 shadow-xl dark:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.7),0_0_30px_2px_rgba(99,102,241,0.18)] ring-1 ring-slate-900/5 dark:ring-white/5 backdrop-blur-xl space-y-7 transition-all";
const inputStyle = "w-full rounded-2xl border border-slate-200 dark:border-slate-800/90 bg-slate-50/90 dark:bg-[#050A17] p-4 text-sm font-semibold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-[#050A17] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 placeholder:font-normal shadow-inner hover:border-indigo-500/40";
const labelStyle = "flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2.5 ml-0.5";

const EditDestination = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const isValidObjectId = (val) => /^[0-9a-fA-F]{24}$/.test(val);

  const [data, setData] = useState({
    type: "domestic",
    destination_name: "",
    destination_type: [],
    best_time: "",
    ideal_duration: "",
    short_description: "",
  });

  // ── Existing Assets (From Database) ──
  const [existingThumbnail, setExistingThumbnail] = useState(null); // single URL string
  const [existingDestinationImages, setExistingDestinationImages] = useState([]); // array of URLs
  const [existingActivityImages, setExistingActivityImages] = useState([]); // array of URLs
  const [existingTestimonialImages, setExistingTestimonialImages] = useState([]); // array of URLs
  const [existingTestimonialVideos, setExistingTestimonialVideos] = useState([]); // array of URLs

  // ── Partition Navigation ──
  const [activePartition, setActivePartition] = useState("thumbnail"); // "thumbnail" | "destination_images" | "activities" | "testimonials"

  // ── Newly Added Assets For Upload ──
  // 1. Thumbnail
  const [newThumbnailFile, setNewThumbnailFile] = useState(null);
  const [newThumbnailPreview, setNewThumbnailPreview] = useState(null);
  const thumbnailInputRef = useRef(null);

  // 2. Destination Images
  const [newDestinationFiles, setNewDestinationFiles] = useState([]);
  const [newDestinationPreviews, setNewDestinationPreviews] = useState([]);
  const destinationInputRef = useRef(null);

  // 3. Activities
  const [newActivityFiles, setNewActivityFiles] = useState([]);
  const [newActivityPreviews, setNewActivityPreviews] = useState([]);
  const activityInputRef = useRef(null);

  // 4. Testimonials (Dual)
  const [testimonialMode, setTestimonialMode] = useState("image"); // "image" | "video"
  const [newTestimonialImageFiles, setNewTestimonialImageFiles] = useState([]);
  const [newTestimonialImagePreviews, setNewTestimonialImagePreviews] = useState([]);
  const testimonialImageInputRef = useRef(null);

  const [newTestimonialVideoFiles, setNewTestimonialVideoFiles] = useState([]); // array of { file, previewUrl, name, size }
  const [newTestimonialVideoUrls, setNewTestimonialVideoUrls] = useState([]); // array of external URL strings
  const [newVideoUrlInput, setNewVideoUrlInput] = useState("");
  const testimonialVideoInputRef = useRef(null);

  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");

  useEffect(() => {
    if (!isValidObjectId(id)) {
      toast.error("Invalid destination id");
      navigate("/destinations");
      return;
    }
    async function fetchData() {
      try {
        const res = await apiClient.get(`/admin/destination/edit/${id}`);
        if (res.data.success) {
          const dest = res.data.destination;
          setData({
            type: dest.domestic_or_international?.toLowerCase().trim() || "domestic",
            destination_name: dest.destination_name || "",
            destination_type: dest.destination_type || [],
            best_time: dest.best_time || "",
            ideal_duration: dest.ideal_duration || "",
            short_description: dest.short_description || "",
          });

          // 1. Thumbnail: use destination_thumbnail[0] if present, else title_image[0]
          const thumb = (dest.destination_thumbnail && dest.destination_thumbnail.length > 0)
            ? dest.destination_thumbnail[0]
            : (dest.title_image && dest.title_image.length > 0 ? dest.title_image[0] : null);
          setExistingThumbnail(thumb || null);

          // 2. Destination Images: use destination_images if present, else title_image.slice(1)
          let destImgs = [];
          if (dest.destination_images && dest.destination_images.length > 0) {
            destImgs = dest.destination_images;
          } else if (dest.title_image && dest.title_image.length > 1) {
            destImgs = dest.title_image.slice(1);
          }
          setExistingDestinationImages(destImgs || []);

          // 3. Activities
          setExistingActivityImages(dest.activity_images || []);

          // 4. Testimonials
          setExistingTestimonialImages(dest.testimonial_images || []);
          setExistingTestimonialVideos(dest.testimonial_videos || []);
        }
      } catch {
        toast.error("Server error while fetching destination.");
      }
    }
    fetchData();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    if (name === "destination_type") {
      setData((prev) => ({
        ...prev,
        destination_type: checked
          ? [...prev.destination_type, value]
          : prev.destination_type.filter((t) => t !== value),
      }));
    } else {
      setData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // ── Thumbnail Handlers ──
  const handleNewThumbnailChange = (file) => {
    if (!file) return;
    if (newThumbnailPreview?.url) URL.revokeObjectURL(newThumbnailPreview.url);
    setNewThumbnailFile(file);
    setNewThumbnailPreview({
      url: URL.createObjectURL(file),
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2)
    });
  };

  const handleRemoveThumbnail = () => {
    if (newThumbnailPreview?.url) URL.revokeObjectURL(newThumbnailPreview.url);
    setNewThumbnailFile(null);
    setNewThumbnailPreview(null);
    setExistingThumbnail(null);
    if (thumbnailInputRef.current) thumbnailInputRef.current.value = "";
  };

  // ── Destination Images Handlers ──
  const handleNewDestinationFilesChange = (files) => {
    const validImages = files.filter(f => f.type.startsWith("image/"));
    setNewDestinationFiles(prev => [...prev, ...validImages]);
    const previews = validImages.map(file => ({
      url: URL.createObjectURL(file),
      name: file.name
    }));
    setNewDestinationPreviews(prev => [...prev, ...previews]);
  };

  const handleRemoveNewDestinationFile = (index) => {
    if (newDestinationPreviews[index]?.url) URL.revokeObjectURL(newDestinationPreviews[index].url);
    setNewDestinationPreviews(prev => prev.filter((_, i) => i !== index));
    setNewDestinationFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExistingDestinationImage = (index) => {
    setExistingDestinationImages(prev => prev.filter((_, i) => i !== index));
  };

  // ── Activity Images Handlers ──
  const handleNewActivityFilesChange = (files) => {
    const validImages = files.filter(f => f.type.startsWith("image/"));
    setNewActivityFiles(prev => [...prev, ...validImages]);
    const previews = validImages.map(file => ({
      url: URL.createObjectURL(file),
      name: file.name
    }));
    setNewActivityPreviews(prev => [...prev, ...previews]);
  };

  const handleRemoveNewActivityFile = (index) => {
    if (newActivityPreviews[index]?.url) URL.revokeObjectURL(newActivityPreviews[index].url);
    setNewActivityPreviews(prev => prev.filter((_, i) => i !== index));
    setNewActivityFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExistingActivityImage = (index) => {
    setExistingActivityImages(prev => prev.filter((_, i) => i !== index));
  };

  // ── Testimonials Handlers ──
  const handleNewTestimonialImageFilesChange = (files) => {
    const validImages = files.filter(f => f.type.startsWith("image/"));
    setNewTestimonialImageFiles(prev => [...prev, ...validImages]);
    const previews = validImages.map(file => ({
      url: URL.createObjectURL(file),
      name: file.name
    }));
    setNewTestimonialImagePreviews(prev => [...prev, ...previews]);
  };

  const handleRemoveNewTestimonialImageFile = (index) => {
    if (newTestimonialImagePreviews[index]?.url) URL.revokeObjectURL(newTestimonialImagePreviews[index].url);
    setNewTestimonialImagePreviews(prev => prev.filter((_, i) => i !== index));
    setNewTestimonialImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExistingTestimonialImage = (index) => {
    setExistingTestimonialImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleNewTestimonialVideoFilesChange = (files) => {
    const validVideos = files.filter(f => f.type.startsWith("video/") || /\.(mp4|webm|mov|mkv|avi)$/i.test(f.name));
    const items = validVideos.map(file => ({
      file,
      previewUrl: URL.createObjectURL(file),
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2)
    }));
    setNewTestimonialVideoFiles(prev => [...prev, ...items]);
  };

  const handleRemoveNewTestimonialVideoFile = (index) => {
    if (newTestimonialVideoFiles[index]?.previewUrl) URL.revokeObjectURL(newTestimonialVideoFiles[index].previewUrl);
    setNewTestimonialVideoFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExistingTestimonialVideo = (index) => {
    setExistingTestimonialVideos(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddVideoUrl = () => {
    const trimmed = newVideoUrlInput.trim();
    if (!trimmed) return;
    if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
      return toast.error("Please enter a valid URL starting with http:// or https://");
    }
    setNewTestimonialVideoUrls(prev => [...prev, trimmed]);
    setNewVideoUrlInput("");
  };

  const handleRemoveVideoUrl = (index) => {
    setNewTestimonialVideoUrls(prev => prev.filter((_, i) => i !== index));
  };

  // ── Submit Handlers ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!data.destination_name.trim()) return toast.error("Please enter a destination name");

    setIsLoading(true);
    setUploadProgress("Preparing assets...");

    try {
      const capitalizedType = data.type.charAt(0).toUpperCase() + data.type.slice(1);
      const safeName = data.destination_name.trim().replace(/\s+/g, '_');
      const baseFolder = `destination/${capitalizedType}/${safeName}`;

      // Helper to convert to WebP and upload
      const uploadWebpImage = async (file, subfolder, label = "image") => {
        setUploadProgress(`Converting ${label} to WebP...`);
        const webpFile = await convertImageFileToWebP(file);
        setUploadProgress(`Uploading ${webpFile.name} to S3...`);
        const presignedRes = await apiClient.post("/admin/generate-presigned-url", {
          fileName: webpFile.name,
          fileType: webpFile.type,
          folder: `${baseFolder}/${subfolder}`
        });
        const { uploadUrl, key } = presignedRes.data;
        await axios.put(uploadUrl, webpFile, {
          headers: { "Content-Type": webpFile.type }
        });
        return key;
      };

      // 1. Upload new thumbnail (if any)
      let finalThumbnailKey = existingThumbnail ? existingThumbnail : null;
      if (newThumbnailFile) {
        finalThumbnailKey = await uploadWebpImage(newThumbnailFile, "thumbnail", "thumbnail cover");
      }

      // 2. Upload new destination images
      const newDestKeys = [];
      for (let i = 0; i < newDestinationFiles.length; i++) {
        const key = await uploadWebpImage(newDestinationFiles[i], "destination_images", `destination photo ${i + 1}`);
        newDestKeys.push(key);
      }

      // 3. Upload new activity images
      const newActivityKeys = [];
      for (let i = 0; i < newActivityFiles.length; i++) {
        const key = await uploadWebpImage(newActivityFiles[i], "activities", `activity photo ${i + 1}`);
        newActivityKeys.push(key);
      }

      // 4. Upload new testimonial images
      const newTestimonialImageKeys = [];
      for (let i = 0; i < newTestimonialImageFiles.length; i++) {
        const key = await uploadWebpImage(newTestimonialImageFiles[i], "testimonials/images", `testimonial photo ${i + 1}`);
        newTestimonialImageKeys.push(key);
      }

      // 5. Upload new testimonial videos
      const newTestimonialVideoKeys = [];
      for (let i = 0; i < newTestimonialVideoFiles.length; i++) {
        const v = newTestimonialVideoFiles[i];
        setUploadProgress(`Uploading video ${v.name}...`);
        const presignedRes = await apiClient.post("/admin/generate-presigned-url", {
          fileName: v.file.name,
          fileType: v.file.type || "video/mp4",
          folder: `${baseFolder}/testimonials/videos`
        });
        const { uploadUrl, key } = presignedRes.data;
        await axios.put(uploadUrl, v.file, {
          headers: { "Content-Type": v.file.type || "video/mp4" }
        });
        newTestimonialVideoKeys.push(key);
      }

      // Combine existing + newly uploaded
      const finalThumbnailArr = finalThumbnailKey ? [finalThumbnailKey] : [];
      const finalDestinationImages = [...existingDestinationImages, ...newDestKeys];
      const finalActivityImages = [...existingActivityImages, ...newActivityKeys];
      const finalTestimonialImages = [...existingTestimonialImages, ...newTestimonialImageKeys];
      const finalTestimonialVideos = [
        ...existingTestimonialVideos,
        ...newTestimonialVideoKeys,
        ...newTestimonialVideoUrls
      ];

      // Sync title_image & show_image for backward compatibility
      const finalTitleImage = [...finalThumbnailArr, ...finalDestinationImages];

      const payload = {
        type: data.type,
        destination_name: data.destination_name,
        destination_type: data.destination_type,
        best_time: data.best_time,
        ideal_duration: data.ideal_duration,
        short_description: data.short_description,
        destination_thumbnail: finalThumbnailArr,
        destination_images: finalDestinationImages,
        activity_images: finalActivityImages,
        testimonial_images: finalTestimonialImages,
        testimonial_videos: finalTestimonialVideos,
        title_image: finalTitleImage,
        show_image: finalTitleImage
      };

      const response = await apiClient.patch(`/admin/destination/${id}`, payload);
      if (response.data.success) {
        toast.success("Destination Updated Successfully! 🎉");

        // Clean new local previews
        if (newThumbnailPreview?.url) URL.revokeObjectURL(newThumbnailPreview.url);
        newDestinationPreviews.forEach(p => URL.revokeObjectURL(p.url));
        newActivityPreviews.forEach(p => URL.revokeObjectURL(p.url));
        newTestimonialImagePreviews.forEach(p => URL.revokeObjectURL(p.url));
        newTestimonialVideoFiles.forEach(v => URL.revokeObjectURL(v.previewUrl));

        setNewThumbnailFile(null);
        setNewThumbnailPreview(null);
        setNewDestinationFiles([]);
        setNewDestinationPreviews([]);
        setNewActivityFiles([]);
        setNewActivityPreviews([]);
        setNewTestimonialImageFiles([]);
        setNewTestimonialImagePreviews([]);
        setNewTestimonialVideoFiles([]);
        setNewTestimonialVideoUrls([]);

        // Re-fetch to get newly signed URLs
        const refreshRes = await apiClient.get(`/admin/destination/edit/${id}`);
        if (refreshRes.data.success) {
          const dest = refreshRes.data.destination;
          const thumb = (dest.destination_thumbnail && dest.destination_thumbnail.length > 0)
            ? dest.destination_thumbnail[0]
            : (dest.title_image && dest.title_image.length > 0 ? dest.title_image[0] : null);
          setExistingThumbnail(thumb || null);

          let destImgs = [];
          if (dest.destination_images && dest.destination_images.length > 0) {
            destImgs = dest.destination_images;
          } else if (dest.title_image && dest.title_image.length > 1) {
            destImgs = dest.title_image.slice(1);
          }
          setExistingDestinationImages(destImgs || []);
          setExistingActivityImages(dest.activity_images || []);
          setExistingTestimonialImages(dest.testimonial_images || []);
          setExistingTestimonialVideos(dest.testimonial_videos || []);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.msg || "Failed to update destination.");
    } finally {
      setIsLoading(false);
      setUploadProgress("");
    }
  };

  const totalAssetCount =
    (existingThumbnail || newThumbnailPreview ? 1 : 0) +
    existingDestinationImages.length + newDestinationPreviews.length +
    existingActivityImages.length + newActivityPreviews.length +
    existingTestimonialImages.length + newTestimonialImagePreviews.length +
    existingTestimonialVideos.length + newTestimonialVideoFiles.length + newTestimonialVideoUrls.length;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8 pb-16">
      {/* ─── HEADER ─── */}
      <div className="bg-white dark:bg-[#091126]/95 rounded-3xl py-4 sm:py-5 px-6 sm:px-8 border border-slate-200/90 dark:border-indigo-500/25 shadow-xl dark:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.7),0_0_30px_2px_rgba(99,102,241,0.18)] ring-1 ring-slate-900/5 dark:ring-white/5 backdrop-blur-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-indigo-500/30 shrink-0">
                <Pencil size={22} />
              </div>
              <span>
                EDIT <span className="text-indigo-500">DESTINATION</span>
              </span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-semibold mt-1 text-xs sm:text-sm">
              Manage visual partitions, activities, and testimonials for {data.destination_name || "destination"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-slate-100 dark:bg-[#050A17] p-1.5 rounded-2xl flex border border-slate-200 dark:border-slate-800/90 shadow-inner">
              {["domestic", "international"].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setData({ ...data, type: t })}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    data.type === t
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          {/* ─── 1. CORE DETAILS ─── */}
          <div className={cardStyle}>
            <div className="flex items-center gap-3.5 pb-5 border-b border-slate-100 dark:border-slate-800/80">
              <div className="size-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 shrink-0">
                <MapPin size={22} />
              </div>
              <div>
                <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Destination Identity
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                  Core location naming and travel parameters
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className={labelStyle}>
                  <MapPin size={13} className="text-indigo-600 dark:text-indigo-400" /> GLOBAL LOCATION NAME
                </label>
                <input
                  name="destination_name"
                  value={data.destination_name}
                  onChange={handleChange}
                  placeholder="Destination name"
                  className={inputStyle}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className={labelStyle}>
                    <Calendar size={13} className="text-indigo-600 dark:text-indigo-400" /> BEST TIME TO VISIT
                  </label>
                  <input
                    name="best_time"
                    value={data.best_time}
                    onChange={handleChange}
                    placeholder="e.g. Oct - Mar"
                    className={inputStyle}
                  />
                </div>
                <div>
                  <label className={labelStyle}>
                    <Clock size={13} className="text-indigo-600 dark:text-indigo-400" /> IDEAL DURATION
                  </label>
                  <input
                    name="ideal_duration"
                    value={data.ideal_duration}
                    onChange={handleChange}
                    placeholder="e.g. 5 Days / 4 Nights"
                    className={inputStyle}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className={labelStyle}>
                    <Sparkles size={13} className="text-indigo-600 dark:text-indigo-400" /> SHORT DESCRIPTION
                  </label>
                  <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">
                    {data.short_description?.length || 0}/150
                  </span>
                </div>
                <textarea
                  name="short_description"
                  value={data.short_description}
                  onChange={handleChange}
                  maxLength={150}
                  placeholder="A romantic blurb for the destination cards..."
                  className={`${inputStyle} h-28 resize-none font-medium text-sm leading-relaxed`}
                />
              </div>
            </div>
          </div>

          {/* ─── 2. VISUAL ASSETS CARD WITH PARTITIONS ─── */}
          <div className={cardStyle}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-3.5">
                <div className="size-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 shrink-0">
                  <ImageIcon size={22} />
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                    Visual Assets & Partitions
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                    Thumbnail • Destination Gallery • Activities • Testimonials (Photos & Videos)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider">
                  {totalAssetCount} TOTAL ASSETS
                </span>
              </div>
            </div>

            {/* PARTITION TABS SELECTOR */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 p-1.5 rounded-2xl bg-slate-100/80 dark:bg-[#050A17] border border-slate-200/80 dark:border-slate-800">
              {[
                {
                  id: "thumbnail",
                  label: "Thumbnail",
                  subtitle: "Destination Cover",
                  icon: ImageIcon,
                  count: existingThumbnail || newThumbnailPreview ? 1 : 0
                },
                {
                  id: "destination_images",
                  label: "Destination Images",
                  subtitle: "Scenery Gallery",
                  icon: Building2,
                  count: existingDestinationImages.length + newDestinationPreviews.length
                },
                {
                  id: "activities",
                  label: "Activities",
                  subtitle: "Things to Do",
                  icon: Compass,
                  count: existingActivityImages.length + newActivityPreviews.length
                },
                {
                  id: "testimonials",
                  label: "Testimonials",
                  subtitle: "Images & Videos",
                  icon: Film,
                  count: existingTestimonialImages.length + newTestimonialImagePreviews.length + existingTestimonialVideos.length + newTestimonialVideoFiles.length + newTestimonialVideoUrls.length
                }
              ].map((part) => {
                const IconComp = part.icon;
                const isActive = activePartition === part.id;
                return (
                  <button
                    key={part.id}
                    type="button"
                    onClick={() => setActivePartition(part.id)}
                    className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-3.5 rounded-xl transition-all cursor-pointer text-left ${
                      isActive
                        ? "bg-white dark:bg-[#091126] text-slate-900 dark:text-white shadow-md border border-indigo-500/30 ring-2 ring-indigo-500/20"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-900/40"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`size-8 rounded-lg flex items-center justify-center shrink-0 ${
                          isActive
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        <IconComp size={16} />
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-bold leading-tight truncate">{part.label}</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate hidden sm:block">
                          {part.subtitle}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`mt-1 sm:mt-0 text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        part.count > 0
                          ? "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400"
                          : "bg-slate-200/60 dark:bg-slate-800 text-slate-400"
                      }`}
                    >
                      {part.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* ─── TAB 1: THUMBNAIL OF DESTINATION ─── */}
            {activePartition === "thumbnail" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                      <ImageIcon size={16} className="text-indigo-500" />
                      Thumbnail of Destination (Primary Cover)
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      This image represents the destination across listing cards, search results, and hero banners.
                    </p>
                  </div>
                  {(newThumbnailPreview || existingThumbnail) && (
                    <button
                      type="button"
                      onClick={handleRemoveThumbnail}
                      className="text-xs font-bold text-red-500 hover:text-red-600 cursor-pointer transition-colors"
                    >
                      Remove Cover
                    </button>
                  )}
                </div>

                {newThumbnailPreview ? (
                  <div className="relative max-w-md aspect-[16/9] rounded-2xl overflow-hidden border-2 border-indigo-500 shadow-md group bg-slate-900">
                    <img src={newThumbnailPreview.url} alt="New cover" className="w-full h-full object-cover" />
                    <div className="absolute top-2.5 left-2.5 bg-indigo-600 text-[10px] font-bold text-white px-2.5 py-1 rounded-md shadow">
                      New Cover (Pending Save)
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveThumbnail}
                      className="absolute top-2.5 right-2.5 p-1.5 bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ) : existingThumbnail ? (
                  <div className="relative max-w-md aspect-[16/9] rounded-2xl overflow-hidden border-2 border-emerald-500 shadow-md group bg-slate-900">
                    <img src={existingThumbnail} alt="Current cover" className="w-full h-full object-cover" />
                    <div className="absolute top-2.5 left-2.5 bg-emerald-600 text-[10px] font-bold text-white px-2.5 py-1 rounded-md shadow">
                      Current Cover
                    </div>
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => thumbnailInputRef.current?.click()}
                        className="px-3.5 py-1.5 bg-white text-slate-900 font-bold text-xs rounded-xl shadow cursor-pointer hover:bg-slate-100"
                      >
                        Change Cover
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveThumbnail}
                        className="p-2 bg-red-600 text-white rounded-xl shadow cursor-pointer hover:bg-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => thumbnailInputRef.current?.click()}
                    className="w-full py-12 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 bg-slate-50/50 dark:bg-[#050A17]/60 cursor-pointer flex flex-col items-center justify-center transition-all group"
                  >
                    <div className="size-12 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <UploadCloud size={24} />
                    </div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Upload Destination Thumbnail
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">High-resolution landscape image • Auto WebP optimized</p>
                  </div>
                )}
                <input
                  ref={thumbnailInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleNewThumbnailChange(e.target.files[0]);
                    e.target.value = "";
                  }}
                />
              </div>
            )}

            {/* ─── TAB 2: DESTINATION IMAGES ─── */}
            {activePartition === "destination_images" && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                      <Building2 size={16} className="text-indigo-500" />
                      Destination Images (Scenery Gallery)
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      General sights, monuments, beaches, resorts, and panoramic landscapes of this destination.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-slate-400">
                    {existingDestinationImages.length + newDestinationPreviews.length} Photos
                  </span>
                </div>

                {/* Existing Photos Grid */}
                {existingDestinationImages.length > 0 && (
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2.5">
                      Current Gallery Photos ({existingDestinationImages.length})
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {existingDestinationImages.map((imgUrl, idx) => (
                        <div key={`exist-dest-${idx}`} className="group relative aspect-video rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 shadow-xs">
                          <img src={imgUrl} alt="Destination" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveExistingDestinationImage(idx)}
                              className="p-1.5 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 transition-all cursor-pointer"
                              title="Remove image"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Newly Added Photos Grid */}
                {newDestinationPreviews.length > 0 && (
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-500 mb-2.5">
                      New Photos to Upload ({newDestinationPreviews.length})
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {newDestinationPreviews.map((prev, idx) => (
                        <div key={`new-dest-${idx}`} className="group relative aspect-video rounded-xl overflow-hidden border-2 border-indigo-500/60 bg-slate-900 shadow-xs">
                          <img src={prev.url} alt="New" className="w-full h-full object-cover" />
                          <div className="absolute top-1.5 left-1.5 bg-indigo-600 text-[9px] font-bold text-white px-2 py-0.5 rounded shadow">
                            New
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveNewDestinationFile(idx)}
                            className="absolute top-1.5 right-1.5 p-1 bg-red-600 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Dropzone */}
                <div
                  onClick={() => destinationInputRef.current?.click()}
                  className="w-full py-10 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 bg-slate-50/50 dark:bg-[#050A17]/60 cursor-pointer flex flex-col items-center justify-center transition-all group"
                >
                  <div className="size-11 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                    <UploadCloud size={22} />
                  </div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Add More Destination Photos
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">Select one or multiple images • Auto WebP optimized</p>
                </div>
                <input
                  ref={destinationInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files) handleNewDestinationFilesChange(Array.from(e.target.files));
                    e.target.value = "";
                  }}
                />
              </div>
            )}

            {/* ─── TAB 3: ACTIVITIES ─── */}
            {activePartition === "activities" && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                      <Compass size={16} className="text-indigo-500" />
                      Activities (Things to Do)
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Adventure sports, local sightseeing, candlelight dinners, boat rides, and excursion memories.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-slate-400">
                    {existingActivityImages.length + newActivityPreviews.length} Photos
                  </span>
                </div>

                {/* Existing Activities Grid */}
                {existingActivityImages.length > 0 && (
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2.5">
                      Current Activity Photos ({existingActivityImages.length})
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {existingActivityImages.map((imgUrl, idx) => (
                        <div key={`exist-act-${idx}`} className="group relative aspect-video rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 shadow-xs">
                          <img src={imgUrl} alt="Activity" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveExistingActivityImage(idx)}
                              className="p-1.5 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 transition-all cursor-pointer"
                              title="Remove activity photo"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Newly Added Activities Grid */}
                {newActivityPreviews.length > 0 && (
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-500 mb-2.5">
                      New Activity Photos to Upload ({newActivityPreviews.length})
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {newActivityPreviews.map((prev, idx) => (
                        <div key={`new-act-${idx}`} className="group relative aspect-video rounded-xl overflow-hidden border-2 border-indigo-500/60 bg-slate-900 shadow-xs">
                          <img src={prev.url} alt="New Activity" className="w-full h-full object-cover" />
                          <div className="absolute top-1.5 left-1.5 bg-indigo-600 text-[9px] font-bold text-white px-2 py-0.5 rounded shadow">
                            New
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveNewActivityFile(idx)}
                            className="absolute top-1.5 right-1.5 p-1 bg-red-600 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Dropzone */}
                <div
                  onClick={() => activityInputRef.current?.click()}
                  className="w-full py-10 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 bg-slate-50/50 dark:bg-[#050A17]/60 cursor-pointer flex flex-col items-center justify-center transition-all group"
                >
                  <div className="size-11 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                    <UploadCloud size={22} />
                  </div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Add More Activity Photos
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">Activities & excursions • Auto WebP optimized</p>
                </div>
                <input
                  ref={activityInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files) handleNewActivityFilesChange(Array.from(e.target.files));
                    e.target.value = "";
                  }}
                />
              </div>
            )}

            {/* ─── TAB 4: TESTIMONIALS (DUAL) ─── */}
            {activePartition === "testimonials" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                      <Film size={16} className="text-indigo-500" />
                      Testimonials (Photos & Videos)
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Real traveler stories, couple reviews, romantic reels, and feedback media.
                    </p>
                  </div>

                  {/* Dual Mode Switcher */}
                  <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-200/80 dark:bg-[#050A17] border border-slate-200 dark:border-slate-800 self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => setTestimonialMode("image")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        testimonialMode === "image"
                          ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                      }`}
                    >
                      <ImageIcon size={13} />
                      <span>Photos ({existingTestimonialImages.length + newTestimonialImagePreviews.length})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTestimonialMode("video")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        testimonialMode === "video"
                          ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                      }`}
                    >
                      <Video size={13} />
                      <span>Videos ({existingTestimonialVideos.length + newTestimonialVideoFiles.length + newTestimonialVideoUrls.length})</span>
                    </button>
                  </div>
                </div>

                {testimonialMode === "image" ? (
                  <div className="space-y-5">
                    {/* Existing Testimonial Photos */}
                    {existingTestimonialImages.length > 0 && (
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2.5">
                          Current Traveler Photos ({existingTestimonialImages.length})
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                          {existingTestimonialImages.map((imgUrl, idx) => (
                            <div key={`exist-test-img-${idx}`} className="group relative aspect-video rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 shadow-xs">
                              <img src={imgUrl} alt="Testimonial" className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveExistingTestimonialImage(idx)}
                                  className="p-1.5 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 transition-all cursor-pointer"
                                  title="Remove testimonial photo"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Newly Added Testimonial Photos */}
                    {newTestimonialImagePreviews.length > 0 && (
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-500 mb-2.5">
                          New Traveler Photos to Upload ({newTestimonialImagePreviews.length})
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                          {newTestimonialImagePreviews.map((prev, idx) => (
                            <div key={`new-test-img-${idx}`} className="group relative aspect-video rounded-xl overflow-hidden border-2 border-indigo-500/60 bg-slate-900 shadow-xs">
                              <img src={prev.url} alt="New Testimonial" className="w-full h-full object-cover" />
                              <div className="absolute top-1.5 left-1.5 bg-indigo-600 text-[9px] font-bold text-white px-2 py-0.5 rounded shadow">
                                New
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveNewTestimonialImageFile(idx)}
                                className="absolute top-1.5 right-1.5 p-1 bg-red-600 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Dropzone */}
                    <div
                      onClick={() => testimonialImageInputRef.current?.click()}
                      className="w-full py-10 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 bg-slate-50/50 dark:bg-[#050A17]/60 cursor-pointer flex flex-col items-center justify-center transition-all group"
                    >
                      <div className="size-11 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                        <UploadCloud size={22} />
                      </div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Upload Traveler Photos
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">Couple review moments • Auto WebP optimized</p>
                    </div>
                    <input
                      ref={testimonialImageInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files) handleNewTestimonialImageFilesChange(Array.from(e.target.files));
                        e.target.value = "";
                      }}
                    />
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Existing Videos */}
                    {existingTestimonialVideos.length > 0 && (
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2.5">
                          Current Testimonial Videos ({existingTestimonialVideos.length})
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                          {existingTestimonialVideos.map((videoUrl, idx) => (
                            <div key={`exist-vid-${idx}`} className="group relative aspect-video rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 shadow-xs flex items-center justify-center">
                              {!videoUrl.includes('youtube') && !videoUrl.includes('youtu.be') ? (
                                <video src={videoUrl} preload="metadata" className="w-full h-full object-cover" />
                              ) : (
                                <div className="text-xs text-white/70 font-semibold p-2 truncate">YouTube Video: {videoUrl}</div>
                              )}
                              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors flex items-center justify-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveExistingTestimonialVideo(idx)}
                                  className="p-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 transition-all cursor-pointer"
                                  title="Remove video"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Newly Added Video Files */}
                    {newTestimonialVideoFiles.length > 0 && (
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-500 mb-2.5">
                          New Video Files to Upload ({newTestimonialVideoFiles.length})
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                          {newTestimonialVideoFiles.map((v, idx) => (
                            <div key={`new-vid-file-${idx}`} className="group relative aspect-video rounded-xl overflow-hidden border-2 border-indigo-500/60 bg-slate-900 shadow-xs flex items-center justify-center">
                              <video src={v.previewUrl} preload="metadata" className="w-full h-full object-cover" />
                              <div className="absolute top-1.5 left-1.5 bg-indigo-600 text-[9px] font-bold text-white px-2 py-0.5 rounded shadow">
                                New File ({v.size} MB)
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveNewTestimonialVideoFile(idx)}
                                className="absolute top-1.5 right-1.5 p-1 bg-red-600 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Newly Added Video URLs */}
                    {newTestimonialVideoUrls.length > 0 && (
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-500 mb-2.5">
                          New Video Links Added ({newTestimonialVideoUrls.length})
                        </p>
                        <div className="space-y-2">
                          {newTestimonialVideoUrls.map((url, idx) => (
                            <div key={`new-vid-url-${idx}`} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#050A17] border border-slate-200 dark:border-slate-800 text-xs">
                              <span className="font-semibold truncate max-w-md text-slate-700 dark:text-slate-300">{url}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveVideoUrl(idx)}
                                className="p-1 text-red-500 hover:text-red-700 cursor-pointer"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Video Upload Dropzone & URL Input */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div
                        onClick={() => testimonialVideoInputRef.current?.click()}
                        className="p-6 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-800 hover:border-indigo-500 bg-slate-50/50 dark:bg-[#050A17]/60 cursor-pointer flex flex-col items-center justify-center transition-all group"
                      >
                        <div className="size-10 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                          <Video size={20} />
                        </div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                          Upload Video Clip
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">MP4, WebM, MOV</p>
                      </div>
                      <input
                        ref={testimonialVideoInputRef}
                        type="file"
                        multiple
                        accept="video/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files) handleNewTestimonialVideoFilesChange(Array.from(e.target.files));
                          e.target.value = "";
                        }}
                      />

                      <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#050A17]/60 flex flex-col justify-between">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1">
                            <LinkIcon size={13} className="text-indigo-500" /> Or Add Video URL
                          </p>
                          <p className="text-[10px] text-slate-400 mb-3">Paste direct MP4 or YouTube embed link</p>
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="url"
                            value={newVideoUrlInput}
                            onChange={(e) => setNewVideoUrlInput(e.target.value)}
                            placeholder="https://..."
                            className="flex-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs outline-none focus:border-indigo-500"
                          />
                          <button
                            type="button"
                            onClick={handleAddVideoUrl}
                            className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Plus size={13} /> Add
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ─── RIGHT SIDEBAR (TAXONOMY & SUBMIT) ─── */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white dark:bg-[#091126]/95 rounded-3xl p-7 border border-slate-200/90 dark:border-indigo-500/25 shadow-xl dark:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.7),0_0_30px_2px_rgba(99,102,241,0.18)]">
            <label className={labelStyle}><Layers size={14} /> Taxonomy</label>
            <div className="grid grid-cols-1 gap-2.5 mt-2">
              {["trending", "TopMost Destination", "exclusive", "weekend", "home", "honeymoon", "Alpine Escape", "Tropical Paradise", "Himalayan Escape", "Iconic Getaway"].map((opt) => (
                <label
                  key={opt}
                  className={`flex items-center gap-3 p-3 rounded-2xl border transition-all cursor-pointer ${
                    data.destination_type.includes(opt)
                      ? "bg-indigo-50/80 border-indigo-200 dark:bg-indigo-950/40 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 font-bold"
                      : "border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-[#050A17]/50 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  <input
                    type="checkbox"
                    name="destination_type"
                    value={opt}
                    checked={data.destination_type.includes(opt)}
                    onChange={handleChange}
                    className="accent-indigo-600 size-4 rounded cursor-pointer"
                  />
                  <span className="text-xs font-semibold capitalize">{opt}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 rounded-2xl font-bold shadow-xl shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Heart size={18} fill="currentColor" />}
            <span>{isLoading ? `Pushing Updates (${uploadProgress || "..."})` : "Commit Changes"}</span>
          </button>

          <button
            type="button"
            onClick={() => navigate("/destinations/create")}
            className="w-full text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-bold text-xs uppercase tracking-widest py-2 transition-all cursor-pointer text-center"
          >
            Cancel & Return
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default EditDestination;
