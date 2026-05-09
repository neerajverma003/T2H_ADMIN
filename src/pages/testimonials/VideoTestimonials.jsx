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

  const handleVideoFileChange = (e) => {
    const file = e.target.files[0]
    if (file && file.type.startsWith("video/")) {
      setVideoFile(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
    else toast.error("Please upload a valid video file")
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
      // 1. Request a secure, short-lived 'Presigned URL' from the backend
      const presignedRes = await apiClient.post("/admin/generate-presigned-url", {
        fileName: videoFile.name,
        fileType: videoFile.type,
        folder: TESTIMONIAL_S3_FOLDER
      })
      const { uploadUrl, key } = presignedRes.data

      // 2. Upload the file directly to S3 using the Presigned URL (Method: PUT)
      // This reduces server load as the file never passes through your backend.
      await fetch(uploadUrl, {
        method: "PUT",
        body: videoFile,
        headers: { "Content-Type": videoFile.type }
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
    inputStyle: "w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-white transition-all placeholder:text-slate-400",
    labelStyle: "flex items-center gap-2 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.15em] mb-1.5 ml-1",
    cardStyle: "bg-white dark:bg-slate-900 rounded-[2rem] p-6 lg:p-8 border border-slate-100 dark:border-slate-800 shadow-sm dark:shadow-none",
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full space-y-6 pb-12 text-left">
      {/* HEADER */}
      <div className={cardStyle}>
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none text-indigo-600"><Video size={100} /></div>
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-slate-950 dark:text-white tracking-tight flex items-center gap-3">
              <Film className="text-indigo-600" size={32} /> VIDEO STORIES
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium mt-2 text-sm italic text-left">Capturing the joy of perfectly planned honeymoons</p>
          </div>
          <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 p-1.5 rounded-xl border border-slate-100 dark:border-slate-800">
            <div className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-sm">
              <Sparkles size={16} /> {testimonials.length} Official Memories
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {/* UPLOAD FORM */}
        <div className="w-full">
          <form onSubmit={handleSubmit} className={cardStyle}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-indigo-600 rounded-xl text-white shadow-sm"><UploadCloud size={24} /></div>
              <h2 className="text-2xl font-black text-slate-950 dark:text-white uppercase tracking-tight">Onboard Story</h2>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
              {/* LEFT: MASTER ASSET (COMPACT) */}
              <div className="w-full lg:w-1/3 shrink-0">
                <label className={labelStyle}>Cinematic Master Asset</label>
                {previewUrl ? (
                  <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-slate-950 border border-slate-800">
                    <video src={previewUrl} controls className="w-full h-full object-contain" />
                    <div className="absolute top-3 right-3 flex gap-2">
                      <label htmlFor="videoUpload" className="px-3 py-1.5 bg-slate-900/80 backdrop-blur-xl rounded-lg flex items-center gap-1.5 text-white cursor-pointer hover:bg-indigo-600 transition-all border border-white/10 text-[10px] font-black uppercase tracking-widest">
                        <Replace size={14} /> Swap
                      </label>
                      <button type="button" onClick={handleRemoveVideo} className="size-7 bg-red-600/80 backdrop-blur-xl rounded-lg flex items-center justify-center text-white hover:bg-red-600 transition-all border border-white/10">
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <label htmlFor="videoUpload" className="group flex flex-col items-center justify-center w-full aspect-[4/3] border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all hover:border-indigo-600">
                    <div className="flex flex-col items-center justify-center p-6 text-center">
                      <div className="size-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center text-indigo-600 mb-4 transition-transform group-hover:scale-110">
                        <UploadCloud size={24} />
                      </div>
                      <p className="text-base font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">Sync Video</p>
                      <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest italic">Direct-to-S3 Upload</p>
                    </div>
                    <input id="videoUpload" type="file" hidden accept="video/*" onChange={handleVideoFileChange} />
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
                      <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                      <input ref={locationRef} className={`${inputStyle} pl-12`} placeholder="e.g. Maldives" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className={labelStyle}>Visibility & Publishing</label>
                  <div className="flex gap-3">
                    <button type="button" onClick={() => setVisibility("public")} className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest border transition-all flex items-center justify-center gap-2 ${visibility === "public" ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300'}`}>
                      <Eye size={16} /> Public
                    </button>
                    <button type="button" onClick={() => setVisibility("private")} className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest border transition-all flex items-center justify-center gap-2 ${visibility === "private" ? 'bg-slate-900 border-slate-900 text-white shadow-md' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300'}`}>
                      <EyeOff size={16} /> Private
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button disabled={!videoFile || isLoading} className="w-full bg-indigo-600 text-white py-4 rounded-xl font-black text-base uppercase tracking-widest shadow-md hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                    {isLoading ? <Loader2 className="animate-spin" size={20} /> : <ShieldCheck size={20} />}
                    {isLoading ? "Synchronizing..." : "FINALIZE & PUBLISH"}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* LIST HUB */}
        <div className={cardStyle}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-black text-slate-950 dark:text-white uppercase tracking-tight">Story Registry</h2>
              <p className="text-sm text-slate-500 font-bold mt-2 uppercase tracking-widest">Managed social proof and video assets</p>
            </div>
            <div className="size-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center text-indigo-600">
              <Play size={20} />
            </div>
          </div>

          {isFetching ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <Loader2 className="animate-spin text-indigo-600" size={40} />
              <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Loading Assets...</p>
            </div>
          ) : testimonials.length === 0 ? (
            <div className="py-24 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2rem]">
              <Video className="mx-auto mb-4 text-slate-300 dark:text-slate-700" size={64} />
              <h3 className="text-2xl font-black text-slate-950 dark:text-white uppercase tracking-tight mb-2">No Stories Onboarded</h3>
              <p className="text-slate-500 font-medium text-sm">Capture your first couple memory to begin</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <AnimatePresence>
                {testimonials.map((t) => (
                  <motion.div layout key={t._id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="group relative bg-slate-50 dark:bg-slate-800/50 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-lg transition-all hover:shadow-xl hover:shadow-indigo-500/10">
                    <div className="relative aspect-video overflow-hidden">
                      <video src={t.video_url} muted className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-slate-950/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300 backdrop-blur-sm">
                        <div className="size-20 bg-white rounded-full flex items-center justify-center text-indigo-700 shadow-2xl scale-75 group-hover:scale-100 transition-transform">
                          <Play className="ml-1" size={36} fill="currentColor" />
                        </div>
                      </div>
                      <div className={`absolute top-4 left-4 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-[0.2em] backdrop-blur-md shadow-2xl ${t.visibility === 'public' ? 'bg-emerald-600/90 text-white' : 'bg-slate-950/90 text-slate-300'}`}>
                        {t.visibility}
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="text-lg font-black text-slate-950 dark:text-white truncate tracking-tight mb-2">{t.title}</h3>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2 text-slate-500">
                          <MapPin size={16} className="text-indigo-600" />
                          <span className="text-xs font-black uppercase tracking-widest">{t.location}</span>
                        </div>
                        <button onClick={() => handleDeleteTestimonial(t._id)} className="p-3 bg-white text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-md border border-slate-50">
                          {deletingId === t._id ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default VideoTestimonials
