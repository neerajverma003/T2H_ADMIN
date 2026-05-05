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
      const testimonialFolder = `testimonials/${name.replace(/\s+/g, '_')}`
      
      const presignedRes = await apiClient.post("/admin/generate-presigned-url", {
        fileName: videoFile.name,
        fileType: videoFile.type,
        folder: testimonialFolder
      })
      const { uploadUrl, key } = presignedRes.data
      await fetch(uploadUrl, { method: "PUT", body: videoFile, headers: { "Content-Type": videoFile.type } })

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
    } catch {
      toast.error("Upload failed")
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

  const styleProps = {
    inputStyle: "w-full rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-4 text-slate-900 dark:text-slate-100 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all placeholder:text-slate-400",
    labelStyle: "flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2",
    cardStyle: "bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none",
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto space-y-10 pb-20 px-4">
      {/* HEADER */}
      <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none text-indigo-600"><Video size={200} /></div>
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                    <Film className="text-indigo-600" /> VIDEO TESTIMONIALS
                </h1>
                <p className="text-slate-500 font-medium mt-1 italic">Capturing the joy of perfectly planned honeymoons</p>
            </div>
            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 p-2 rounded-2xl">
                <div className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                    <Sparkles size={12} /> {testimonials.length} Stories Shared
                </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* UPLOAD FORM */}
        <div className="lg:col-span-5">
            <form onSubmit={handleSubmit} className={styleProps.cardStyle}>
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-indigo-600 dark:text-indigo-400"><UploadCloud size={20} /></div>
                    <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Onboard Story</h2>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className={styleProps.labelStyle}>Cinematic Video</label>
                        {previewUrl ? (
                            <div className="relative aspect-video rounded-3xl overflow-hidden bg-black shadow-2xl">
                                <video src={previewUrl} controls className="w-full h-full object-contain" />
                                <div className="absolute top-4 right-4 flex gap-2">
                                    <label htmlFor="videoUpload" className="size-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-white cursor-pointer hover:bg-indigo-600 transition-all">
                                        <Replace size={18} />
                                    </label>
                                    <button type="button" onClick={handleRemoveVideo} className="size-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-white hover:bg-red-500 transition-all">
                                        <X size={18} />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <label htmlFor="videoUpload" className="group flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[2.5rem] cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all">
                                <div className="flex flex-col items-center justify-center p-6 text-center">
                                    <div className="size-16 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center text-indigo-600 mb-4 transition-transform group-hover:scale-110">
                                        <UploadCloud size={32} />
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Sync Customer Video</p>
                                    <p className="text-[10px] text-slate-300 mt-1 italic">Direct-to-S3 Processing</p>
                                </div>
                                <input id="videoUpload" type="file" hidden accept="video/*" onChange={handleVideoFileChange} />
                            </label>
                        )}
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        <div>
                            <label className={styleProps.labelStyle}>Couple Name / Title</label>
                            <input ref={nameRef} className={styleProps.inputStyle} placeholder="e.g. John & Emma's Maldives Escape" />
                        </div>
                        <div>
                            <label className={styleProps.labelStyle}>Honeymoon Location</label>
                            <div className="relative">
                                <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input ref={locationRef} className={`${styleProps.inputStyle} pl-12`} placeholder="e.g. Maldives" />
                            </div>
                        </div>
                        <div>
                            <label className={styleProps.labelStyle}>Visibility Priority</label>
                            <div className="flex gap-4">
                                <button type="button" onClick={() => setVisibility("public")} className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all flex items-center justify-center gap-2 ${visibility === "public" ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400'}`}>
                                    <Eye size={14} /> Public
                                </button>
                                <button type="button" onClick={() => setVisibility("private")} className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all flex items-center justify-center gap-2 ${visibility === "private" ? 'bg-slate-900 border-slate-900 text-white shadow-lg shadow-black/20' : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400'}`}>
                                    <EyeOff size={14} /> Private
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-slate-50 dark:border-slate-800">
                        <button disabled={!videoFile || isLoading} className="w-full bg-indigo-600 text-white py-5 rounded-[1.5rem] font-black text-sm shadow-2xl shadow-indigo-500/30 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50">
                            {isLoading ? <Loader2 className="animate-spin" size={20} /> : <ShieldCheck size={20} />}
                            {isLoading ? "Syncing Store..." : "FINALIZE TESTIMONIAL"}
                        </button>
                    </div>
                </div>
            </form>
        </div>

        {/* LIST HUB */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-wider">Story Registry</h2>
                    <p className="text-xs text-slate-500 font-medium mt-1">Managed social proof and video assets</p>
                </div>
                <div className="size-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <Play size={20} />
                </div>
            </div>

            {isFetching ? (
                <div className="flex flex-col items-center justify-center py-40 gap-4">
                    <Loader2 className="animate-spin text-indigo-600" size={48} strokeWidth={1} />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Loading Assets</p>
                </div>
            ) : testimonials.length === 0 ? (
                <div className="py-40 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[3rem]">
                    <Video className="mx-auto mb-4 text-slate-200" size={64} strokeWidth={1} />
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No video stories onboarded yet</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <AnimatePresence>
                        {testimonials.map((t) => (
                            <motion.div layout key={t._id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="group relative bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] overflow-hidden border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/5 transition-all hover:shadow-2xl">
                                <div className="relative aspect-video overflow-hidden">
                                    <video src={t.video_url} muted className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300 backdrop-blur-sm">
                                        <Play className="text-white scale-75 group-hover:scale-100 transition-transform" size={48} />
                                    </div>
                                    <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest backdrop-blur-md ${t.visibility === 'public' ? 'bg-emerald-500/80 text-white' : 'bg-black/50 text-slate-300'}`}>
                                        {t.visibility}
                                    </div>
                                </div>
                                <div className="p-6">
                                    <h3 className="font-black text-slate-900 dark:text-white truncate tracking-tight">{t.title}</h3>
                                    <div className="flex items-center justify-between mt-4">
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <MapPin size={12} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">{t.location}</span>
                                        </div>
                                        <button onClick={() => handleDeleteTestimonial(t._id)} className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm">
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
