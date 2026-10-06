import { useState, useEffect, useRef } from "react"
import { toast } from "react-toastify"
import {
  MapPin,
  Globe,
  Loader2,
  Pencil,
  Trash2,
  Image as ImageIcon,
  Sparkles,
  Navigation,
  Clock,
  Calendar,
  Layers,
  Search,
  Building2,
  UploadCloud,
  CheckCircle2,
  X,
  Compass,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ArrowUpDown,
  Film,
  Video,
  Play,
  Plus,
  Link as LinkIcon
} from "lucide-react"
import { usePlaceStore } from "../../stores/usePlaceStore"
import { useNavigate } from "react-router-dom"
import { apiClient } from "../../stores/authStores"
import axios from "axios"
import { convertImageFileToWebP } from "../../utils/imageConverter"
import { motion } from "framer-motion"

const AVAILABLE_TAGS = [
  "trending",
  "TopMost Destination",
  "exclusive",
  "weekend",
  "home",
  "honeymoon",
  "Alpine Escape",
  "Tropical Paradise",
  "Himalayan Escape",
  "Iconic Getaway"
]

const cardStyle = "bg-white dark:bg-[#091126]/95 rounded-3xl p-7 md:p-9 border border-slate-200/90 dark:border-indigo-500/25 shadow-xl dark:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.7),0_0_30px_2px_rgba(99,102,241,0.18)] ring-1 ring-slate-900/5 dark:ring-white/5 backdrop-blur-xl space-y-7 transition-all"
const inputStyle = "w-full rounded-2xl border border-slate-200 dark:border-slate-800/90 bg-slate-50/90 dark:bg-[#050A17] p-4 text-sm font-semibold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-[#050A17] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 placeholder:font-normal shadow-inner hover:border-indigo-500/40"
const labelStyle = "flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2.5 ml-0.5"

const CreateDestination = () => {
  const [data, setData] = useState({
    type: "domestic",
    destination_name: "",
    destination_type: [],
    best_time: "",
    ideal_duration: "",
    short_description: "",
  })

  // ── Partitioned Visual Asset States ──
  const [activePartition, setActivePartition] = useState("thumbnail") // "thumbnail" | "destination_images" | "activities" | "testimonials"

  // 1. Destination Thumbnail (Cover)
  const [thumbnailFile, setThumbnailFile] = useState(null)
  const [thumbnailPreview, setThumbnailPreview] = useState(null)
  const thumbnailInputRef = useRef(null)

  // 2. Destination Images (Scenery Gallery)
  const [destinationImages, setDestinationImages] = useState([])
  const [destinationPreviews, setDestinationPreviews] = useState([])
  const galleryInputRef = useRef(null)

  // 3. Activities Images
  const [activityImages, setActivityImages] = useState([])
  const [activityPreviews, setActivityPreviews] = useState([])
  const activityInputRef = useRef(null)

  // 4. Testimonials (Images & Videos)
  const [testimonialMode, setTestimonialMode] = useState("image") // "image" | "video"
  const [testimonialImages, setTestimonialImages] = useState([])
  const [testimonialPreviews, setTestimonialPreviews] = useState([])
  const testimonialImageInputRef = useRef(null)
  const [testimonialVideos, setTestimonialVideos] = useState([]) // array of { file, previewUrl, name, size }
  const [testimonialVideoUrls, setTestimonialVideoUrls] = useState([]) // array of external / direct video strings
  const [newVideoUrlInput, setNewVideoUrlInput] = useState("")
  const testimonialVideoInputRef = useRef(null)

  const [isLoading, setIsLoading] = useState(false)
  const [uploadStatusText, setUploadStatusText] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(9)
  const [sortOrder, setSortOrder] = useState("newest")
  const [counts, setCounts] = useState({ domestic: 0, international: 0 })
  const [countsLoading, setCountsLoading] = useState(false)

  const { createDestination, fetchDestinationList, destinationList, isListLoading } = usePlaceStore()
  const navigate = useNavigate()
  const typeRef = useRef(data.type)

  const fetchCounts = async () => {
    try {
      setCountsLoading(true)
      const [domRes, intRes] = await Promise.all([
        apiClient.get("/admin/destination/domestic"),
        apiClient.get("/admin/destination/international")
      ])
      const domCount = domRes.data?.places?.length || 0
      const intCount = intRes.data?.places?.length || 0
      setCounts({ domestic: domCount, international: intCount })
    } catch (err) {
      console.error("Failed to load destination counts:", err)
    } finally {
      setCountsLoading(false)
    }
  }

  useEffect(() => {
    fetchCounts()
  }, [])

  useEffect(() => {
    fetchDestinationList(data.type)
    typeRef.current = data.type
  }, [data.type, fetchDestinationList])

  // Handlers for Thumbnail
  const handleThumbnailChange = (file) => {
    if (!file) return
    if (thumbnailPreview?.url) URL.revokeObjectURL(thumbnailPreview.url)
    setThumbnailFile(file)
    setThumbnailPreview({
      url: URL.createObjectURL(file),
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2)
    })
  }

  const handleRemoveThumbnail = () => {
    if (thumbnailPreview?.url) URL.revokeObjectURL(thumbnailPreview.url)
    setThumbnailFile(null)
    setThumbnailPreview(null)
    if (thumbnailInputRef.current) thumbnailInputRef.current.value = ""
  }

  // Handlers for Destination Images
  const handleDestinationImagesChange = (newFiles) => {
    setDestinationImages((prev) => [...prev, ...newFiles])
    const newPreviews = newFiles.map((file) => ({
      url: URL.createObjectURL(file),
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2)
    }))
    setDestinationPreviews((prev) => [...prev, ...newPreviews])
  }

  const handleRemoveDestinationImage = (index) => {
    if (destinationPreviews[index]?.url) URL.revokeObjectURL(destinationPreviews[index].url)
    setDestinationPreviews((prev) => prev.filter((_, i) => i !== index))
    setDestinationImages((prev) => prev.filter((_, i) => i !== index))
  }

  // Handlers for Activities
  const handleActivityImagesChange = (newFiles) => {
    setActivityImages((prev) => [...prev, ...newFiles])
    const newPreviews = newFiles.map((file) => ({
      url: URL.createObjectURL(file),
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2)
    }))
    setActivityPreviews((prev) => [...prev, ...newPreviews])
  }

  const handleRemoveActivityImage = (index) => {
    if (activityPreviews[index]?.url) URL.revokeObjectURL(activityPreviews[index].url)
    setActivityPreviews((prev) => prev.filter((_, i) => i !== index))
    setActivityImages((prev) => prev.filter((_, i) => i !== index))
  }

  // Handlers for Testimonials: Images
  const handleTestimonialImagesChange = (newFiles) => {
    setTestimonialImages((prev) => [...prev, ...newFiles])
    const newPreviews = newFiles.map((file) => ({
      url: URL.createObjectURL(file),
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2)
    }))
    setTestimonialPreviews((prev) => [...prev, ...newPreviews])
  }

  const handleRemoveTestimonialImage = (index) => {
    if (testimonialPreviews[index]?.url) URL.revokeObjectURL(testimonialPreviews[index].url)
    setTestimonialPreviews((prev) => prev.filter((_, i) => i !== index))
    setTestimonialImages((prev) => prev.filter((_, i) => i !== index))
  }

  // Handlers for Testimonials: Videos
  const handleTestimonialVideoFilesChange = (newFiles) => {
    const validVideos = newFiles.filter(f => f.type.startsWith("video/") || /\.(mp4|webm|mov|mkv|avi)$/i.test(f.name))
    if (validVideos.length < newFiles.length) {
      toast.warn("Some non-video files were skipped. Supported: MP4, WebM, MOV, MKV")
    }
    const newItems = validVideos.map(file => ({
      file,
      previewUrl: URL.createObjectURL(file),
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2)
    }))
    setTestimonialVideos((prev) => [...prev, ...newItems])
  }

  const handleRemoveTestimonialVideo = (index) => {
    if (testimonialVideos[index]?.previewUrl) URL.revokeObjectURL(testimonialVideos[index].previewUrl)
    setTestimonialVideos((prev) => prev.filter((_, i) => i !== index))
  }

  const handleAddVideoUrl = () => {
    const trimmed = newVideoUrlInput.trim()
    if (!trimmed) return
    if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
      return toast.error("Please enter a valid URL starting with http:// or https://")
    }
    setTestimonialVideoUrls((prev) => [...prev, trimmed])
    setNewVideoUrlInput("")
  }

  const handleRemoveVideoUrl = (index) => {
    setTestimonialVideoUrls((prev) => prev.filter((_, i) => i !== index))
  }

  const handleTagToggle = (tag) => {
    setData((prev) => ({
      ...prev,
      destination_type: prev.destination_type.includes(tag)
        ? prev.destination_type.filter((t) => t !== tag)
        : [...prev.destination_type, tag]
    }))
  }

  const clearAllPreviews = () => {
    if (thumbnailPreview?.url) URL.revokeObjectURL(thumbnailPreview.url)
    setThumbnailFile(null)
    setThumbnailPreview(null)

    destinationPreviews.forEach(p => URL.revokeObjectURL(p.url))
    setDestinationImages([])
    setDestinationPreviews([])

    activityPreviews.forEach(p => URL.revokeObjectURL(p.url))
    setActivityImages([])
    setActivityPreviews([])

    testimonialPreviews.forEach(p => URL.revokeObjectURL(p.url))
    setTestimonialImages([])
    setTestimonialPreviews([])

    testimonialVideos.forEach(v => URL.revokeObjectURL(v.previewUrl))
    setTestimonialVideos([])
    setTestimonialVideoUrls([])
    setNewVideoUrlInput("")

    if (thumbnailInputRef.current) thumbnailInputRef.current.value = ""
    if (galleryInputRef.current) galleryInputRef.current.value = ""
    if (activityInputRef.current) activityInputRef.current.value = ""
    if (testimonialImageInputRef.current) testimonialImageInputRef.current.value = ""
    if (testimonialVideoInputRef.current) testimonialVideoInputRef.current.value = ""
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!data.destination_name.trim()) return toast.error("Please enter a destination name")
    
    const hasAnyImage = thumbnailFile || destinationImages.length > 0
    if (!hasAnyImage) {
      return toast.error("Please provide at least a Thumbnail or a Destination Image.")
    }

    setIsLoading(true)
    setUploadStatusText("Preparing and converting visual assets to WebP...")
    try {
      const capitalizedType = data.type.charAt(0).toUpperCase() + data.type.slice(1)
      const safeName = data.destination_name.trim().replace(/\s+/g, '_')
      const baseFolder = `destination/${capitalizedType}/${safeName}`

      // Helper function to upload an image converted to WebP
      const uploadWebpImage = async (file, subfolder, label = "image") => {
        setUploadStatusText(`Converting ${label} to WebP...`)
        const webpFile = await convertImageFileToWebP(file)
        setUploadStatusText(`Deploying ${webpFile.name} to S3...`)
        const presignedRes = await apiClient.post("/admin/generate-presigned-url", {
          fileName: webpFile.name,
          fileType: webpFile.type,
          folder: `${baseFolder}/${subfolder}`
        })
        const { uploadUrl, key } = presignedRes.data
        await axios.put(uploadUrl, webpFile, { headers: { "Content-Type": webpFile.type } })
        return key
      }

      // Helper function to upload video
      const uploadVideo = async (file, subfolder) => {
        setUploadStatusText(`Uploading video ${file.name}...`)
        const ext = file.name.split('.').pop()?.toLowerCase() || 'mp4'
        let resolvedType = file.type || `video/${ext}`
        const presignedRes = await apiClient.post("/admin/generate-presigned-url", {
          fileName: file.name,
          fileType: resolvedType,
          folder: `${baseFolder}/${subfolder}`
        })
        const { uploadUrl, key } = presignedRes.data
        await axios.put(uploadUrl, file, { headers: { "Content-Type": resolvedType } })
        return key
      }

      // 1. Upload Thumbnail
      let uploadedThumbnailKey = null
      if (thumbnailFile) {
        uploadedThumbnailKey = await uploadWebpImage(thumbnailFile, "thumbnail", "Thumbnail")
      }

      // 2. Upload Destination Gallery Images
      const uploadedDestinationKeys = []
      for (let i = 0; i < destinationImages.length; i++) {
        setUploadStatusText(`Uploading Destination photo ${i + 1} of ${destinationImages.length}...`)
        const k = await uploadWebpImage(destinationImages[i], "destination_images", `Destination Photo ${i + 1}`)
        uploadedDestinationKeys.push(k)
      }

      // 3. Upload Activity Images
      const uploadedActivityKeys = []
      for (let i = 0; i < activityImages.length; i++) {
        setUploadStatusText(`Uploading Activity photo ${i + 1} of ${activityImages.length}...`)
        const k = await uploadWebpImage(activityImages[i], "activities", `Activity Photo ${i + 1}`)
        uploadedActivityKeys.push(k)
      }

      // 4. Upload Testimonial Images
      const uploadedReviewImageKeys = []
      for (let i = 0; i < testimonialImages.length; i++) {
        setUploadStatusText(`Uploading Testimonial photo ${i + 1} of ${testimonialImages.length}...`)
        const k = await uploadWebpImage(testimonialImages[i], "testimonials/images", `Testimonial Photo ${i + 1}`)
        uploadedReviewImageKeys.push(k)
      }

      // 5. Upload Testimonial Videos
      const uploadedVideoKeys = []
      for (let i = 0; i < testimonialVideos.length; i++) {
        setUploadStatusText(`Uploading Testimonial video ${i + 1} of ${testimonialVideos.length}...`)
        const k = await uploadVideo(testimonialVideos[i].file, "testimonials/videos")
        uploadedVideoKeys.push(k)
      }

      const allVideoAssets = [...uploadedVideoKeys, ...testimonialVideoUrls]
      const fallbackThumbnail = uploadedThumbnailKey || uploadedDestinationKeys[0] || ""
      const combinedTitleImages = [uploadedThumbnailKey, ...uploadedDestinationKeys].filter(Boolean)

      setUploadStatusText("Saving destination record...")
      const payload = {
        type: data.type,
        destination_name: data.destination_name.trim(),
        destination_type: data.destination_type,
        destination_thumbnail: fallbackThumbnail ? [fallbackThumbnail] : [],
        destination_images: uploadedDestinationKeys,
        activity_images: uploadedActivityKeys,
        testimonial_images: uploadedReviewImageKeys,
        testimonial_videos: allVideoAssets,
        title_image: combinedTitleImages,
        show_image: combinedTitleImages,
        best_time: data.best_time.trim(),
        ideal_duration: data.ideal_duration.trim(),
        short_description: data.short_description.trim()
      }

      const result = await createDestination(payload)
      if (result && result.success !== false) {
        clearAllPreviews()
        setData({
          type: data.type,
          destination_name: "",
          destination_type: [],
          best_time: "",
          ideal_duration: "",
          short_description: ""
        })
        fetchCounts()
      }
    } catch (err) {
      toast.error(err.response?.data?.msg || "Failed to save destination.")
    } finally {
      setIsLoading(false)
      setUploadStatusText("")
    }
  }

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name || 'this destination'}"?`)) {
      try {
        await usePlaceStore.getState().deleteDestination(id)
        toast.success("Destination deleted successfully!")
        fetchDestinationList(typeRef.current)
        fetchCounts()
      } catch {
        toast.error("Failed to delete destination")
      }
    }
  }

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, data.type, sortOrder, itemsPerPage])

  const sortedDestinations = (destinationList || []).slice().sort((a, b) => {
    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0
    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0
    let diff = 0
    if (timeA && timeB && timeA !== timeB) {
      diff = timeB - timeA
    } else {
      diff = String(b._id || "").localeCompare(String(a._id || ""))
    }
    return sortOrder === "newest" ? diff : -diff
  })

  const filteredDestinations = sortedDestinations.filter((dest) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase().trim()
    return (
      (dest.destination_name && typeof dest.destination_name === "string" && dest.destination_name.toLowerCase().includes(q)) ||
      (Array.isArray(dest.destination_type) &&
        dest.destination_type.some((t) => t && typeof t === "string" && t.toLowerCase().includes(q))) ||
      (typeof dest.destination_type === "string" && dest.destination_type.toLowerCase().includes(q)) ||
      (dest.best_time && typeof dest.best_time === "string" && dest.best_time.toLowerCase().includes(q)) ||
      (dest.ideal_duration && typeof dest.ideal_duration === "string" && dest.ideal_duration.toLowerCase().includes(q))
    )
  })

  const totalItems = filteredDestinations.length
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage))
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedDestinations = filteredDestinations.slice(startIndex, startIndex + itemsPerPage)

  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }
    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, "...", totalPages]
    }
    if (currentPage >= totalPages - 3) {
      return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
    }
    return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages]
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8 pb-16">
      {/* ─── TOP HEADER CARD ─── */}
      <div className="bg-white dark:bg-[#091126]/95 rounded-3xl py-4 sm:py-5 px-6 sm:px-8 border border-slate-200/90 dark:border-indigo-500/25 shadow-xl dark:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.7),0_0_30px_2px_rgba(99,102,241,0.18)] ring-1 ring-slate-900/5 dark:ring-white/5 backdrop-blur-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-500/30 shrink-0">
                <Navigation size={22} />
              </div>
              <span>
                NEW <span className="text-blue-500">DESTINATION</span>
              </span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-semibold mt-1 text-xs sm:text-sm">
              Expanding the horizons of Trip to Honeymoon
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* DOMESTIC COUNT CARD */}
            <button
              type="button"
              onClick={() => setData((prev) => ({ ...prev, type: "domestic" }))}
              className={`flex items-center gap-3.5 px-5 py-2.5 rounded-2xl border transition-all cursor-pointer ${
                data.type === "domestic"
                  ? "bg-blue-50 dark:bg-blue-950/40 border-blue-500/60 dark:border-blue-500/50 shadow-md shadow-blue-500/10 ring-2 ring-blue-500/20"
                  : "bg-slate-50 dark:bg-[#050A17] border-slate-200 dark:border-slate-800/90 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm"
              }`}
            >
              <div className="size-9 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Building2 size={18} strokeWidth={2.2} />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xl font-bold text-slate-900 dark:text-white leading-none mb-1">
                  {countsLoading ? "..." : counts.domestic}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  DOMESTIC
                </span>
              </div>
            </button>

            {/* INTERNATIONAL COUNT CARD */}
            <button
              type="button"
              onClick={() => setData((prev) => ({ ...prev, type: "international" }))}
              className={`flex items-center gap-3.5 px-5 py-2.5 rounded-2xl border transition-all cursor-pointer ${
                data.type === "international"
                  ? "bg-purple-50 dark:bg-purple-950/40 border-purple-500/60 dark:border-purple-500/50 shadow-md shadow-purple-500/10 ring-2 ring-purple-500/20"
                  : "bg-slate-50 dark:bg-[#050A17] border-slate-200 dark:border-slate-800/90 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm"
              }`}
            >
              <div className="size-9 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                <Globe size={18} strokeWidth={2.2} />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xl font-bold text-slate-900 dark:text-white leading-none mb-1">
                  {countsLoading ? "..." : counts.international}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                  INTERNATIONAL
                </span>
              </div>
            </button>

            {/* TOGGLE SWITCHER */}
            <div className="bg-slate-100 dark:bg-[#050A17] p-1.5 rounded-2xl flex border border-slate-200 dark:border-slate-800/90 shadow-inner">
              {["domestic", "international"].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setData((prev) => ({ ...prev, type: t }))}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    data.type === t
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
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


      {/* ─── FORM WORKSPACE (ORDER: SCREENSHOT 2 -> SCREENSHOT 3 -> SCREENSHOT 4) ─── */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 1. DESTINATION IDENTITY CARD (SECOND SCREENSHOT) */}
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
                onChange={(e) => setData((prev) => ({ ...prev, destination_name: e.target.value }))}
                placeholder="e.g. Maldives, Switzerland, Bali, Kashmir"
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
                  onChange={(e) => setData((prev) => ({ ...prev, best_time: e.target.value }))}
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
                  onChange={(e) => setData((prev) => ({ ...prev, ideal_duration: e.target.value }))}
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
                onChange={(e) => setData((prev) => ({ ...prev, short_description: e.target.value }))}
                maxLength={150}
                placeholder="A romantic blurb for the destination cards and traveler packages..."
                className={`${inputStyle} h-28 resize-none font-medium text-sm leading-relaxed`}
              />
            </div>
          </div>
        </div>

        {/* 2. VISUAL ASSETS CARD WITH PARTITIONS */}
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
                {(thumbnailFile ? 1 : 0) + destinationImages.length + activityImages.length + testimonialImages.length + testimonialVideos.length + testimonialVideoUrls.length} TOTAL ASSETS
              </span>
            </div>
          </div>

          {/* ─── PARTITION TABS SELECTOR ─── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 p-1.5 rounded-2xl bg-slate-100/80 dark:bg-[#050A17] border border-slate-200/80 dark:border-slate-800">
            {[
              {
                id: "thumbnail",
                label: "Thumbnail",
                subtitle: "Destination Cover",
                icon: ImageIcon,
                count: thumbnailFile ? 1 : 0
              },
              {
                id: "destination_images",
                label: "Destination Images",
                subtitle: "Scenery Gallery",
                icon: Building2,
                count: destinationImages.length
              },
              {
                id: "activities",
                label: "Activities",
                subtitle: "Things to Do",
                icon: Compass,
                count: activityImages.length
              },
              {
                id: "testimonials",
                label: "Testimonials",
                subtitle: "Images & Videos",
                icon: Film,
                count: testimonialImages.length + testimonialVideos.length + testimonialVideoUrls.length
              }
            ].map((part) => {
              const IconComp = part.icon
              const isActive = activePartition === part.id
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
              )
            })}
          </div>

          {/* ─── TAB 1: DESTINATION THUMBNAIL ─── */}
          {activePartition === "thumbnail" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <ImageIcon size={16} className="text-indigo-500" />
                    Thumbnail of Destination (Primary Cover)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    This image will represent the destination across listing cards, search results, and hero banners.
                  </p>
                </div>
                {thumbnailPreview && (
                  <button
                    type="button"
                    onClick={handleRemoveThumbnail}
                    className="text-xs font-bold text-red-500 hover:text-red-600 cursor-pointer transition-colors"
                  >
                    Remove Cover
                  </button>
                )}
              </div>

              {thumbnailPreview ? (
                <div className="relative max-w-md aspect-[16/9] rounded-2xl overflow-hidden border-2 border-indigo-500 shadow-md group bg-slate-900">
                  <img
                    src={thumbnailPreview.url}
                    alt={thumbnailPreview.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2.5 left-2.5 bg-indigo-600 text-[10px] font-bold text-white px-2.5 py-1 rounded-md shadow">
                    Primary Cover
                  </div>
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold px-3 py-1.5 rounded-xl flex items-center justify-between">
                    <span className="truncate max-w-[200px]">{thumbnailPreview.name}</span>
                    <span>{thumbnailPreview.size} MB</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveThumbnail}
                    className="absolute top-2.5 right-2.5 bg-red-600 hover:bg-red-700 text-white rounded-full p-1.5 shadow transition-all cursor-pointer opacity-90 group-hover:opacity-100"
                    title="Remove Thumbnail"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <label className="group relative block w-full rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/70 dark:bg-[#050A17]/60 hover:border-indigo-500 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/15 cursor-pointer p-8 sm:p-10 transition-all text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="size-14 bg-white dark:bg-[#080E21] rounded-2xl flex items-center justify-center shadow-md dark:shadow-lg group-hover:scale-110 transition-transform mb-3.5 border border-slate-200 dark:border-slate-800 text-indigo-600 dark:text-indigo-400">
                      <UploadCloud size={28} />
                    </div>
                    <p className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                      Upload Destination Thumbnail
                    </p>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
                      High-resolution landscape image • Auto WebP optimized
                    </p>
                  </div>
                  <input
                    ref={thumbnailInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files?.[0]) handleThumbnailChange(e.target.files[0])
                    }}
                    hidden
                  />
                </label>
              )}
            </div>
          )}

          {/* ─── TAB 2: DESTINATION IMAGES (GALLERY) ─── */}
          {activePartition === "destination_images" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <Building2 size={16} className="text-indigo-500" />
                    Destination Images (Gallery & Scenery)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Upload panoramic and landmark photographs for this destination's main image gallery.
                  </p>
                </div>
                {destinationImages.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      destinationPreviews.forEach((p) => URL.revokeObjectURL(p.url))
                      setDestinationPreviews([])
                      setDestinationImages([])
                      if (galleryInputRef.current) galleryInputRef.current.value = ""
                    }}
                    className="text-xs font-bold text-red-500 hover:text-red-600 cursor-pointer transition-colors"
                  >
                    Clear All ({destinationImages.length})
                  </button>
                )}
              </div>

              <label className="group relative block w-full rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/70 dark:bg-[#050A17]/60 hover:border-indigo-500 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/15 cursor-pointer p-7 transition-all text-center">
                <div className="flex flex-col items-center justify-center">
                  <div className="size-12 bg-white dark:bg-[#080E21] rounded-2xl flex items-center justify-center shadow-md dark:shadow-lg group-hover:scale-110 transition-transform mb-2.5 border border-slate-200 dark:border-slate-800 text-indigo-600 dark:text-indigo-400">
                    <UploadCloud size={24} />
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                    {destinationImages.length > 0
                      ? `${destinationImages.length} Gallery Photos Selected - Add More`
                      : "Upload Destination Gallery Images"}
                  </p>
                  <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                    Multi-upload supported • Auto WebP optimized
                  </p>
                </div>
                <input
                  ref={galleryInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files) handleDestinationImagesChange(Array.from(e.target.files))
                  }}
                  hidden
                />
              </label>

              {destinationPreviews.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 max-h-64 overflow-y-auto p-1 custom-scrollbar">
                  {destinationPreviews.map((preview, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-square rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 group shadow-sm bg-slate-100 dark:bg-[#050A17]"
                    >
                      <img
                        src={preview.url}
                        alt={preview.name}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveDestinationImage(idx)}
                        className="absolute top-1.5 right-1.5 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 shadow transition-all cursor-pointer opacity-90 group-hover:opacity-100"
                        title="Remove image"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ─── TAB 3: ACTIVITIES IMAGES ─── */}
          {activePartition === "activities" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <Compass size={16} className="text-indigo-500" />
                    Activities & Experiences
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Showcase specific adventures, water sports, sightseeing, and unique couple activities for this destination.
                  </p>
                </div>
                {activityImages.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      activityPreviews.forEach((p) => URL.revokeObjectURL(p.url))
                      setActivityPreviews([])
                      setActivityImages([])
                      if (activityInputRef.current) activityInputRef.current.value = ""
                    }}
                    className="text-xs font-bold text-red-500 hover:text-red-600 cursor-pointer transition-colors"
                  >
                    Clear All ({activityImages.length})
                  </button>
                )}
              </div>

              <label className="group relative block w-full rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/70 dark:bg-[#050A17]/60 hover:border-indigo-500 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/15 cursor-pointer p-7 transition-all text-center">
                <div className="flex flex-col items-center justify-center">
                  <div className="size-12 bg-white dark:bg-[#080E21] rounded-2xl flex items-center justify-center shadow-md dark:shadow-lg group-hover:scale-110 transition-transform mb-2.5 border border-slate-200 dark:border-slate-800 text-indigo-600 dark:text-indigo-400">
                    <UploadCloud size={24} />
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                    {activityImages.length > 0
                      ? `${activityImages.length} Activity Photos Selected - Add More`
                      : "Upload Activity & Adventure Photos"}
                  </p>
                  <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                    Multi-upload supported • Auto WebP optimized
                  </p>
                </div>
                <input
                  ref={activityInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files) handleActivityImagesChange(Array.from(e.target.files))
                  }}
                  hidden
                />
              </label>

              {activityPreviews.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 max-h-64 overflow-y-auto p-1 custom-scrollbar">
                  {activityPreviews.map((preview, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-square rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 group shadow-sm bg-slate-100 dark:bg-[#050A17]"
                    >
                      <img
                        src={preview.url}
                        alt={preview.name}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveActivityImage(idx)}
                        className="absolute top-1.5 right-1.5 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 shadow transition-all cursor-pointer opacity-90 group-hover:opacity-100"
                        title="Remove activity image"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ─── TAB 4: TESTIMONIALS (TWO OPTIONS: IMAGE / VIDEOS) ─── */}
          {activePartition === "testimonials" && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <Film size={16} className="text-indigo-500" />
                    Testimonials & Couple Reviews
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Add customer reviews for this destination. Choose between Photo Stories or Video Testimonials.
                  </p>
                </div>

                {/* TWO OPTIONS SWITCHER */}
                <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-[#050A17] p-1 rounded-xl border border-slate-200 dark:border-slate-800/80 shrink-0">
                  <button
                    type="button"
                    onClick={() => setTestimonialMode("image")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      testimonialMode === "image"
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <ImageIcon size={13} />
                    <span>Images ({testimonialImages.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTestimonialMode("video")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      testimonialMode === "video"
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <Video size={13} />
                    <span>Videos ({testimonialVideos.length + testimonialVideoUrls.length})</span>
                  </button>
                </div>
              </div>

              {/* TESTIMONIAL OPTION A: IMAGES */}
              {testimonialMode === "image" && (
                <div className="space-y-4">
                  <label className="group relative block w-full rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/70 dark:bg-[#050A17]/60 hover:border-indigo-500 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/15 cursor-pointer p-7 transition-all text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="size-12 bg-white dark:bg-[#080E21] rounded-2xl flex items-center justify-center shadow-md dark:shadow-lg group-hover:scale-110 transition-transform mb-2.5 border border-slate-200 dark:border-slate-800 text-indigo-600 dark:text-indigo-400">
                        <UploadCloud size={24} />
                      </div>
                      <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                        {testimonialImages.length > 0
                          ? `${testimonialImages.length} Testimonial Photos Selected - Add More`
                          : "Upload Traveler Photo Testimonials"}
                      </p>
                      <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                        Real traveler moments & couple photos • Auto WebP optimized
                      </p>
                    </div>
                    <input
                      ref={testimonialImageInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files) handleTestimonialImagesChange(Array.from(e.target.files))
                      }}
                      hidden
                    />
                  </label>

                  {testimonialPreviews.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 max-h-64 overflow-y-auto p-1 custom-scrollbar">
                      {testimonialPreviews.map((preview, idx) => (
                        <div
                          key={idx}
                          className="relative aspect-square rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 group shadow-sm bg-slate-100 dark:bg-[#050A17]"
                        >
                          <img
                            src={preview.url}
                            alt={preview.name}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveTestimonialImage(idx)}
                            className="absolute top-1.5 right-1.5 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 shadow transition-all cursor-pointer opacity-90 group-hover:opacity-100"
                            title="Remove testimonial image"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TESTIMONIAL OPTION B: VIDEOS */}
              {testimonialMode === "video" && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* VIDEO FILE UPLOAD */}
                    <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-[#050A17]/80 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        <Video size={15} className="text-indigo-500" />
                        <span>Upload Video Files</span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Upload short couple reels or feedback clips (MP4, WebM, MOV, MKV).
                      </p>

                      <label className="block w-full border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 rounded-xl p-4 text-center cursor-pointer transition-all bg-white dark:bg-[#080E21]">
                        <UploadCloud size={20} className="mx-auto text-indigo-500 mb-1" />
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          Select Video File
                        </span>
                        <input
                          ref={testimonialVideoInputRef}
                          type="file"
                          multiple
                          accept="video/*,.mp4,.webm,.mov,.mkv,.avi"
                          onChange={(e) => {
                            if (e.target.files) handleTestimonialVideoFilesChange(Array.from(e.target.files))
                          }}
                          hidden
                        />
                      </label>
                    </div>

                    {/* VIDEO URL INPUT */}
                    <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-[#050A17]/80 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        <LinkIcon size={15} className="text-indigo-500" />
                        <span>External Video Link</span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Add direct video link, YouTube, or Vimeo embed URL.
                      </p>

                      <div className="flex gap-2">
                        <input
                          type="url"
                          value={newVideoUrlInput}
                          onChange={(e) => setNewVideoUrlInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault()
                              handleAddVideoUrl()
                            }
                          }}
                          placeholder="https://youtu.be/... or .mp4 URL"
                          className={`${inputStyle} py-2.5 text-xs`}
                        />
                        <button
                          type="button"
                          onClick={handleAddVideoUrl}
                          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shrink-0 cursor-pointer transition-colors shadow-sm"
                        >
                          Add Link
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* VIDEO PREVIEWS LIST */}
                  {(testimonialVideos.length > 0 || testimonialVideoUrls.length > 0) && (
                    <div className="space-y-3 pt-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Selected Video Testimonials ({testimonialVideos.length + testimonialVideoUrls.length}):
                      </span>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {/* Uploaded File Previews */}
                        {testimonialVideos.map((v, idx) => (
                          <div
                            key={`v-file-${idx}`}
                            className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 group p-2 space-y-2 shadow-sm"
                          >
                            <video
                              src={v.previewUrl}
                              className="w-full aspect-video rounded-xl object-cover bg-black"
                              controls
                            />
                            <div className="flex items-center justify-between px-1 text-white text-xs">
                              <span className="truncate max-w-[160px] font-semibold text-[11px]">{v.name}</span>
                              <span className="text-[10px] text-slate-400">{v.size} MB</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveTestimonialVideo(idx)}
                              className="absolute top-3 right-3 bg-red-600 hover:bg-red-700 text-white rounded-full p-1.5 shadow transition-all cursor-pointer opacity-90 group-hover:opacity-100"
                              title="Remove video"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}

                        {/* Video URL Previews */}
                        {testimonialVideoUrls.map((url, idx) => (
                          <div
                            key={`v-url-${idx}`}
                            className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#080E21] p-3 flex items-center justify-between gap-2 shadow-sm"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="size-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
                                <Film size={16} />
                              </div>
                              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                                {url}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveVideoUrl(idx)}
                              className="text-red-500 hover:text-red-600 p-1 cursor-pointer transition-colors"
                              title="Remove link"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ACTION SUMMARY & SUBMIT BUTTON */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 gap-2">
              <span className="flex items-center gap-1.5">
                <Compass size={14} className="text-blue-600 dark:text-blue-400" /> Active Scope:
                <span className="uppercase text-blue-600 dark:text-blue-400 font-bold tracking-wider ml-1">
                  {data.type} DESTINATION
                </span>
              </span>

              <span className="text-[11px] text-slate-400">
                {thumbnailFile ? "✓ Thumbnail" : "○ No Thumbnail"} • {destinationImages.length} Gallery • {activityImages.length} Activities • {testimonialImages.length + testimonialVideos.length + testimonialVideoUrls.length} Testimonials
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white py-4 rounded-2xl font-bold text-base uppercase tracking-wider shadow-xl shadow-blue-600/30 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>{uploadStatusText || "Synchronizing Asset Hub..."}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={20} />
                  <span>CREATE DESTINATION</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 3. CLASSIFICATION & TAGS CARD (FOURTH SCREENSHOT) */}
        <div className={cardStyle}>
          <div className="flex items-center gap-3.5 pb-5 border-b border-slate-100 dark:border-slate-800/80">
            <div className="size-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 shrink-0">
              <Layers size={22} />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                Classification & Tags
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                Assign discovery tags for curated couples packages
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {AVAILABLE_TAGS.map((tag) => {
              const isChecked = data.destination_type.includes(tag)
              return (
                <label
                  key={tag}
                  className={`flex items-center gap-3.5 p-4 rounded-2xl border transition-all cursor-pointer select-none ${
                    isChecked
                      ? "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 text-indigo-900 dark:text-white shadow-sm ring-1 ring-indigo-500/40"
                      : "bg-slate-50/80 dark:bg-[#050A17] border-slate-200 dark:border-slate-800/90 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleTagToggle(tag)}
                    className="size-4.5 rounded text-indigo-600 accent-indigo-600 cursor-pointer shrink-0"
                  />
                  <span className="text-xs font-bold uppercase tracking-wider truncate" title={tag}>
                    {tag.toUpperCase()}
                  </span>
                </label>
              )
            })}
          </div>

          {/* ACTION SUMMARY & SUBMIT BUTTON AT BOTTOM OF FORM */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
              <Compass size={15} className="text-blue-600 dark:text-blue-400" />
              <span>Target Scope:</span>
              <span className="uppercase text-blue-600 dark:text-blue-400 font-extrabold tracking-wider">
                {data.type} DESTINATION
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto px-10 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white py-4 rounded-2xl font-bold text-sm uppercase tracking-wider shadow-xl shadow-blue-600/30 transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  <span>Saving Destination...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  <span>CREATE DESTINATION</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* ─── 4. CURRENT DESTINATION DIRECTORY (FIFTH SCREENSHOT) ─── */}
      <div className="bg-white dark:bg-[#091126]/95 rounded-3xl border border-slate-200/90 dark:border-indigo-500/25 shadow-xl dark:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.7),0_0_30px_2px_rgba(99,102,241,0.18)] ring-1 ring-slate-900/5 dark:ring-white/5 backdrop-blur-xl overflow-hidden transition-all">
        <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800/80 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
                <Sparkles size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="text-base md:text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    CURRENT DESTINATION DIRECTORY
                  </h2>
                  <span className="px-2.5 py-0.5 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300 rounded-lg text-[11px] font-extrabold uppercase tracking-wider">
                    {filteredDestinations.length} {filteredDestinations.length === 1 ? "DESTINATION" : "DESTINATIONS"}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                  Viewing all registered {data.type} destinations
                </p>
              </div>
            </div>

            <div className="relative w-full lg:w-80">
              <input
                type="text"
                placeholder="Search destination, timing, or tag..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#050A17] text-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-500/40 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-inner"
              />
              <Search className="absolute left-3.5 top-3 text-slate-400 dark:text-slate-500" size={14} />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* TOOLBAR CONTROLS: SORT DROPDOWN & ITEMS PER PAGE DROPDOWN */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-100 dark:border-slate-800/60">
            {/* SORT DROPDOWN */}
            <div className="flex items-center gap-2.5">
              <span className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <ArrowUpDown size={13} className="text-indigo-600 dark:text-indigo-400" /> Sort:
              </span>
              <div className="relative">
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="appearance-none bg-slate-50 dark:bg-[#050A17] hover:bg-slate-100 dark:hover:bg-[#080E21] border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 text-slate-800 dark:text-white text-xs font-bold py-2 pl-3.5 pr-8 rounded-xl outline-none focus:ring-1 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all cursor-pointer shadow-inner"
                >
                  <option value="newest" className="bg-white dark:bg-[#050A17] text-slate-800 dark:text-white">
                    New Destination
                  </option>
                  <option value="oldest" className="bg-white dark:bg-[#050A17] text-slate-800 dark:text-white">
                    Old Destination
                  </option>
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* PER PAGE DROPDOWN */}
            <div className="flex items-center gap-2.5">
              <span className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                Per Page:
              </span>
              <div className="relative">
                <select
                  value={itemsPerPage >= totalItems && totalItems > 0 && itemsPerPage > 27 ? "all" : itemsPerPage}
                  onChange={(e) => {
                    if (e.target.value === "all") {
                      setItemsPerPage(totalItems > 0 ? totalItems : 1000)
                    } else {
                      setItemsPerPage(Number(e.target.value))
                    }
                  }}
                  className="appearance-none bg-slate-50 dark:bg-[#050A17] hover:bg-slate-100 dark:hover:bg-[#080E21] border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 text-slate-800 dark:text-white text-xs font-bold py-2 pl-3.5 pr-8 rounded-xl outline-none focus:ring-1 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all cursor-pointer shadow-inner"
                >
                  <option value={9} className="bg-white dark:bg-[#050A17] text-slate-800 dark:text-white">9 / page</option>
                  <option value={18} className="bg-white dark:bg-[#050A17] text-slate-800 dark:text-white">18 / page</option>
                  <option value={27} className="bg-white dark:bg-[#050A17] text-slate-800 dark:text-white">27 / page</option>
                  <option value="all" className="bg-white dark:bg-[#050A17] text-slate-800 dark:text-white">All Destinations</option>
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {isListLoading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="animate-spin text-indigo-500" size={32} />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-[#050A17]/80 border-b border-slate-200 dark:border-slate-800/80">
                <tr>
                  <th className="px-6 py-4 text-left font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-xs">
                    LOCATION NAME
                  </th>
                  <th className="px-6 py-4 text-left font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-xs">
                    SEASON & DURATION
                  </th>
                  <th className="px-6 py-4 text-left font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-xs">
                    CLASSIFICATION
                  </th>
                  <th className="px-6 py-4 text-right font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-xs whitespace-nowrap">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredDestinations.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-slate-500 font-medium">
                      No matching {data.type} destinations found in the directory.
                    </td>
                  </tr>
                ) : (
                  paginatedDestinations.map((dest) => (
                    <tr
                      key={dest._id}
                      className="group hover:bg-slate-50/80 dark:hover:bg-[#050A17]/60 transition-colors"
                    >
                      <td className="px-6 py-4 font-bold text-slate-900 dark:text-white text-sm">
                        <div className="flex items-center gap-3">
                          {dest.title_image && dest.title_image[0] ? (
                            <img
                              src={dest.title_image[0]}
                              alt={dest.destination_name}
                              className="size-10 rounded-xl object-cover shadow-sm border border-slate-200 dark:border-slate-800"
                            />
                          ) : (
                            <div className="size-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500">
                              <MapPin size={18} />
                            </div>
                          )}
                          <div className="flex flex-col">
                            <span className="text-slate-900 dark:text-white font-bold">{dest.destination_name}</span>
                            {dest.short_description && (
                              <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400 line-clamp-1 max-w-xs">
                                {dest.short_description}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
                        <div className="flex flex-col gap-1">
                          {dest.best_time && (
                            <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200">
                              <Calendar size={12} className="text-indigo-600 dark:text-indigo-400" /> {dest.best_time}
                            </span>
                          )}
                          {dest.ideal_duration && (
                            <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                              <Clock size={12} className="text-slate-400" /> {dest.ideal_duration}
                            </span>
                          )}
                          {!dest.best_time && !dest.ideal_duration && (
                            <span className="text-slate-400 dark:text-slate-500 italic">Not specified</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1.5 max-w-md">
                          {(Array.isArray(dest.destination_type)
                            ? dest.destination_type
                            : typeof dest.destination_type === "string"
                            ? [dest.destination_type]
                            : []
                          )
                            .filter((tag) => tag && typeof tag === "string" && tag.trim())
                            .map((tag, idx) => (
                              <span
                                key={`${dest._id}-tag-${idx}`}
                                className="px-2.5 py-0.5 bg-slate-100 dark:bg-[#050A17] border border-slate-200 dark:border-slate-800 rounded-lg text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 shadow-sm"
                              >
                                {String(tag).toUpperCase()}
                              </span>
                            ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => navigate(`/destinations/edit/${dest._id}`)}
                            className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-all cursor-pointer"
                            title="Edit Destination"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(dest._id, dest.destination_name)}
                            className="p-2 rounded-xl text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-all cursor-pointer"
                            title="Delete Destination"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION CONTROLS */}
          {totalItems > 0 && (
            <div className="p-4 sm:p-6 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/70 dark:bg-[#050A17]/50">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Showing <span className="text-slate-900 dark:text-white font-bold">{startIndex + 1}</span> to{" "}
                <span className="text-slate-900 dark:text-white font-bold">{Math.min(startIndex + itemsPerPage, totalItems)}</span> of{" "}
                <span className="text-slate-900 dark:text-white font-bold">{totalItems}</span> destinations
                <span className="text-slate-400 dark:text-slate-500 font-medium ml-1.5">
                  ({sortOrder === "newest" ? "Newest First" : "Oldest First"} &bull; {itemsPerPage >= totalItems ? "All per page" : `${itemsPerPage} per page`})
                </span>
              </span>

              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-2 rounded-xl bg-white dark:bg-[#050A17] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold shadow-sm"
                  >
                    <ChevronLeft size={15} />
                    <span>Prev</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    {getPageNumbers().map((item, idx) => {
                      if (item === "...") {
                        return (
                          <span key={`ellipsis-${idx}`} className="px-2 text-slate-400 dark:text-slate-500 text-xs font-bold select-none">
                            ...
                          </span>
                        )
                      }
                      const pageNum = Number(item)
                      const isActive = currentPage === pageNum
                      return (
                        <button
                          key={`page-${pageNum}`}
                          type="button"
                          onClick={() => setCurrentPage(pageNum)}
                          className={`size-8.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                            isActive
                              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-extrabold"
                              : "bg-white dark:bg-[#050A17] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700 shadow-sm"
                          }`}
                        >
                          {pageNum}
                        </button>
                      )
                    })}
                  </div>

                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="px-3 py-2 rounded-xl bg-white dark:bg-[#050A17] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold shadow-sm"
                  >
                    <span>Next</span>
                    <ChevronRight size={15} />
                  </button>
                </div>
              )}
            </div>
          )}
          </>
        )}
      </div>

    </motion.div>
  )
}

export default CreateDestination
