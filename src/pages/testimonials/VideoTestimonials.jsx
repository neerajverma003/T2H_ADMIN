import { useRef, useState, useEffect } from "react"
import {
  Loader2,
  Video,
  X,
  Replace,
  UploadCloud,
  Film,
  MapPin,
  Play,
  Sparkles,
  ShieldCheck,
  Eye,
  EyeOff,
  Plus,
  Trash2
} from "lucide-react"
import { toast } from "react-toastify"
import { apiClient } from "../../stores/authStores"
import { motion, AnimatePresence } from "framer-motion"

/**
 * S3 folder where all testimonial videos are stored.
 * Must match the folder structure used in your S3 bucket.
 * Format: "<folder-name>" (no leading or trailing slashes)
 */
const TESTIMONIAL_S3_FOLDER = "testimonials"

const VideoTestimonials = () => {
  const [videoFile, setVideoFile] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [testimonials, setTestimonials] = useState([])
  const [isFetching, setIsFetching] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)

  const nameRef = useRef()
  const locationRef = useRef()
  const [visibility, setVisibility] = useState("public")

  useEffect(() => {
    fetchTestimonials()
  }, [])

  const fetchTestimonials = async () => {
    try {
      setIsFetching(true)
      const res = await apiClient.get("/admin/testimonial-video")
      if (res.data.success) setTestimonials(res.data.data || [])
    } catch {
      toast.error("Failed to fetch testimonials")
    } finally {
      setIsFetching(false)
    }
  }

  const VIDEO_EXTS = ["mp4", "webm", "ogg", "mov", "avi", "mkv", "av1"]

  const handleVideoFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const ext = file.name.split('.').pop()?.toLowerCase()
    const isVideo = file.type.startsWith("video/") || VIDEO_EXTS.includes(ext)

    if (isVideo) {
      setVideoFile(file)
      setPreviewUrl(URL.createObjectURL(file))
    } else {
      toast.error("Please upload a valid video file")
    }
  }

  const handleRemoveVideo = () => {
    setVideoFile(null)
    setPreviewUrl(null)
    const input = document.getElementById("videoUpload")
    if (input) input.value = ""
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!videoFile) return toast.error("Please select a video")
    const name = nameRef.current.value.trim()
    const location = locationRef.current.value.trim()
    if (!name || !location) return toast.error("Please fill all fields")

    try {
      setIsLoading(true)
      const ext = videoFile.name.split('.').pop()?.toLowerCase()
      let resolvedType = videoFile.type
      if (!resolvedType || resolvedType === "application/octet-stream") {
        if (ext === 'av1') resolvedType = 'video/av1'
        else if (ext === 'mkv') resolvedType = 'video/x-matroska'
        else if (ext === 'webm') resolvedType = 'video/webm'
        else if (ext === 'mp4') resolvedType = 'video/mp4'
        else resolvedType = 'video/mp4'
      }

      // 1. Request a secure, short-lived 'Presigned URL' from the backend
      const presignedRes = await apiClient.post("/admin/generate-presigned-url", {
        fileName: videoFile.name,
        fileType: resolvedType,
        folder: TESTIMONIAL_S3_FOLDER
      })
      const { uploadUrl, key } = presignedRes.data

      // 2. Upload the file directly to S3 using the Presigned URL (Method: PUT)
      // This reduces server load as the file never passes through your backend.
      await fetch(uploadUrl, {
        method: "PUT",
        body: videoFile,
        headers: { "Content-Type": resolvedType }
      })

      // 3. Save only the 'S3 Key' to your database for future retrieval via CDN
      const payload = { title: name, location, visibility, video_key: key }
      const res = await apiClient.post("/admin/testimonial-video", payload)
      if (res.data.success) {
        toast.success("Memory captured successfully! ✨")
        handleRemoveVideo()
        nameRef.current.value = ""
        locationRef.current.value = ""
        setVisibility("public")
        fetchTestimonials()
      }
    } catch (err) {
      // Log the full error so production issues are diagnosable in server logs / Sentry
      console.error("[VideoTestimonials] Upload failed:", err?.response?.data || err?.message || err)
      toast.error(err?.response?.data?.message || "Upload failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteTestimonial = async (id) => {
    if (!window.confirm("Permanently remove this testimonial?")) return
    try {
      setDeletingId(id)
      const res = await apiClient.delete(`/admin/testimonial-video/${id}`)
      if (res.data.success) {
        toast.success("Deleted successfully")
        fetchTestimonials()
      }
    } catch {
      toast.error("Delete failed")
    } finally {
      setDeletingId(null)
    }
  }

  const { inputStyle, labelStyle, cardStyle } = {
    inputStyle: "w-full rounded-2xl border border-slate-200 dark:border-slate-800/90 bg-slate-50 dark:bg-[#050A17] p-3 text-sm font-semibold focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 text-slate-900 dark:text-white transition-all placeholder:text-slate-400 dark:placeholder-slate-500 shadow-inner outline-none",
    labelStyle: "flex items-center gap-2 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.15em] mb-2 ml-1",
    cardStyle: "bg-white dark:bg-[#091126]/95 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-indigo-500/25 shadow-xl dark:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.7),0_0_30px_2px_rgba(99,102,241,0.18)] ring-1 ring-slate-900/5 dark:ring-white/5 backdrop-blur-xl",
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8 pb-20 font-sans min-h-screen text-slate-900 dark:text-slate-100 text-left"
    >
      {/* HEADER HUB */}
      <div className="bg-white dark:bg-[#091126]/95 rounded-3xl py-4 sm:py-5 px-6 sm:px-8 border border-slate-200/90 dark:border-indigo-500/25 shadow-xl dark:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.7),0_0_30px_2px_rgba(99,102,241,0.18)] ring-1 ring-slate-900/5 dark:ring-white/5 backdrop-blur-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-500/30 shrink-0">
            <Film size={22} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2 flex-wrap">
              Video <span className="text-blue-500">Stories</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-semibold mt-0.5 text-xs sm:text-sm">
              Capturing the joy of perfectly planned honeymoons
            </p>
          </div>
        </div>
        <div className="relative z-10 flex items-center gap-3">
          <div className="px-4 py-2 bg-slate-50 dark:bg-[#050A17] text-slate-700 dark:text-slate-300 rounded-2xl text-xs font-extrabold uppercase tracking-wider border border-slate-200 dark:border-slate-800/90 shadow-sm flex items-center gap-2">
            <Sparkles size={14} className="text-blue-500" />
            <span>{testimonials.length} Official Memories</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {/* UPLOAD FORM */}
        <div className="w-full">
          <form onSubmit={handleSubmit} className={cardStyle}>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-blue-50 dark:bg-blue-950/40 rounded-xl flex items-center justify-center text-blue-500 border border-blue-200 dark:border-blue-800/60 shadow-sm">
                <UploadCloud size={22} />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Onboard New Video Story</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Upload couple video and assign destination metadata</p>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
              {/* LEFT: MASTER ASSET */}
              <div className="w-full lg:w-1/3 shrink-0">
                <label className={labelStyle}>Cinematic Master Asset</label>
                {previewUrl ? (
                  <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-inner">
                    <video src={previewUrl} controls className="w-full h-full object-contain" />
                    <div className="absolute top-3 right-3 flex gap-2">
                      <label htmlFor="videoUpload" className="px-3 py-1.5 bg-slate-900/80 backdrop-blur-xl rounded-lg flex items-center gap-1.5 text-white cursor-pointer hover:bg-blue-600 transition-all border border-white/10 text-[10px] font-black uppercase tracking-widest shadow-md">
                        <Replace size={14} /> Swap
                      </label>
                      <button type="button" onClick={handleRemoveVideo} className="size-7 bg-red-600/80 backdrop-blur-xl rounded-lg flex items-center justify-center text-white hover:bg-red-600 transition-all border border-white/10 shadow-md">
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <label htmlFor="videoUpload" className="group flex flex-col items-center justify-center w-full aspect-[4/3] border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl cursor-pointer bg-slate-50 dark:bg-[#050A17] hover:bg-slate-100 dark:hover:bg-[#0c142b] transition-all hover:border-blue-500/50 shadow-inner">
                    <div className="flex flex-col items-center justify-center p-6 text-center">
                      <div className="size-12 bg-white dark:bg-[#091126] rounded-2xl flex items-center justify-center text-blue-500 mb-3 shadow-md border border-slate-200 dark:border-slate-800 transition-transform group-hover:scale-110">
                        <UploadCloud size={24} strokeWidth={1.5} />
                      </div>
                      <p className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">Sync Video</p>
                      <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mt-1 opacity-80">Direct-to-S3 Upload</p>
                    </div>
                    <input id="videoUpload" type="file" hidden accept="video/*,.av1,.mkv" onChange={handleVideoFileChange} />
                  </label>
                )}
              </div>

              {/* RIGHT: DATA INPUTS */}
              <div className="w-full flex flex-col justify-between space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={labelStyle}>Couple Identity / Story Title</label>
                    <input ref={nameRef} className={inputStyle} placeholder="e.g. John & Emma's Escape" />
                  </div>
                  <div>
                    <label className={labelStyle}>Honeymoon Destination</label>
                    <div className="relative group">
                      <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                      <input ref={locationRef} className={`${inputStyle} pl-12`} placeholder="e.g. Maldives" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className={labelStyle}>Visibility & Publishing</label>
                  <div className="flex gap-3">
                    <button 
                      type="button" 
                      onClick={() => setVisibility("public")} 
                      className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        visibility === "public" 
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 border-transparent text-white shadow-lg shadow-blue-600/25' 
                          : 'bg-slate-50 dark:bg-[#050A17] border-slate-200 dark:border-slate-800/90 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <Eye size={16} /> Public
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setVisibility("private")} 
                      className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        visibility === "private" 
                          ? 'bg-slate-900 border-slate-900 text-white shadow-md' 
                          : 'bg-slate-50 dark:bg-[#050A17] border-slate-200 dark:border-slate-800/90 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <EyeOff size={16} /> Private
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button 
                    disabled={!videoFile || isLoading} 
                    className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 text-white py-3.5 rounded-xl font-black text-xs uppercase tracking-wider shadow-lg shadow-blue-600/30 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {isLoading ? <Loader2 className="animate-spin" size={18} /> : <ShieldCheck size={18} />}
                    {isLoading ? "Synchronizing..." : "FINALIZE & PUBLISH"}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </motion.div>
  )
}

export default VideoTestimonials
