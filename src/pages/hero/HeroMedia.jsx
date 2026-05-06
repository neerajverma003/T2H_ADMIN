import { useRef, useState, useEffect } from "react"
import {
  Loader2,
  Video,
  Image as ImageIcon,
  X,
  Replace,
  Trash2,
  UploadCloud,
  Sparkles,
  Zap,
  Monitor,
  AlertCircle,
  Eye,
  EyeOff,
  MousePointer2,
  ArrowUpRight
} from "lucide-react"
import { toast } from "react-toastify"
import { apiClient } from "../../stores/authStores"
import { useHeroVideoStore } from "../../stores/heroVideoStore"
import axios from "axios"
import { motion } from "framer-motion"

const HeroMedia = () => {
  const [mediaFile, setMediaFile] = useState(null)
  const [mediaType, setMediaType] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [visibility, setVisibility] = useState("public")
  const [activePage, setActivePage] = useState("home")

  const { 
    videos, 
    isLoading, 
    fetchVideos, 
    deleteVideo, 
    updateVisibility, 
    heading: storeHeading, 
    subHeading: storeSubHeading 
  } = useHeroVideoStore()

  useEffect(() => {
    fetchVideos(activePage)
  }, [activePage, fetchVideos])

  useEffect(() => {
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl) }
  }, [previewUrl])

  const IMAGE_EXTS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'svg']

  const handleMediaChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const ext = file.name.split('.').pop()?.toLowerCase()
    const isImage = IMAGE_EXTS.includes(ext)
    const isVideo = file.type.startsWith('video/')

    if (!isImage && !isVideo) {
      toast.error("Invalid format. Sync aborted.")
      return
    }

    setMediaFile(file)
    setMediaType(isImage ? 'image' : 'video')
    setPreviewUrl(URL.createObjectURL(file))
  }

  const handleRemoveMedia = () => {
    setMediaFile(null)
    setMediaType(null)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
    const input = document.getElementById("mediaUpload")
    if (input) input.value = ""
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!mediaFile) return toast.error("Media selection required")

    try {
      setIsUploading(true)
      let key = null

      const heroFolder = `hero-section/${activePage.replace(/\s+/g, '_')}`
      const presignedRes = await apiClient.post("/admin/generate-presigned-url", {
        fileName: mediaFile.name,
        fileType: mediaFile.type,
        folder: heroFolder
      })
      const { uploadUrl, key: uploadedKey } = presignedRes.data
      key = uploadedKey

      await axios.put(uploadUrl, mediaFile, {
        headers: { "Content-Type": mediaFile.type }
      })

      const payload = {
        title: activePage,
        visibility,
        video_key: key,
        heading: storeHeading,
        sub_heading: storeSubHeading
      }

      const response = await apiClient.post("/admin/hero-section", payload)
      if (response.data.success) {
        toast.success("Hero media synchronized successfully! 💕")
        handleRemoveMedia()
        fetchVideos(activePage)
      }
    } catch (err) {
      toast.error("Synchronization failure")
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = (id) => deleteVideo(id, activePage)
  const handleVisibilityChange = (id) => updateVisibility(id, activePage)

  const pageOptions = ["home", "about", "domestic", "international", "contact", "blog"]

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-full mx-auto space-y-10 pb-20 px-6">
      {/* HEADER HUB */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none text-indigo-600"><Video size={160} /></div>
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
                <h1 className="text-3xl font-black text-slate-950 dark:text-white tracking-tight flex items-center gap-4">
                    <Zap className="text-indigo-600" size={32} /> HERO REGISTRY
                </h1>
                <p className="text-slate-500 dark:text-slate-400 font-bold mt-1 text-sm italic">Cinematic visuals and high-fidelity media for landing portals</p>
            </div>
            <div className="flex items-center gap-3">
                <div className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-indigo-500/20">
                    <Sparkles size={16} /> HIGH FIDELITY MEDIA
                </div>
            </div>
        </div>
      </div>
      <div className="flex flex-col gap-8">
        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
            {/* TOP CONTROL CENTER */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* CONFIGURATION */}
                <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-600 rounded-lg text-white"><Monitor size={18} /></div>
                        <h2 className="text-sm font-black text-slate-950 dark:text-white uppercase tracking-widest">Configuration</h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Target Portal</label>
                            <div className="grid grid-cols-3 gap-2">
                                {pageOptions.map((p) => (
                                    <button
                                        key={p}
                                        type="button"
                                        onClick={() => setActivePage(p)}
                                        className={`py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border ${
                                            activePage === p 
                                            ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-500/20" 
                                            : "bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-500"
                                        }`}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Privacy Status</label>
                            <div className="flex gap-2">
                                {["public", "private"].map((v) => (
                                    <button
                                        key={v}
                                        type="button"
                                        onClick={() => setVisibility(v)}
                                        className={`flex-1 py-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest border-2 transition-all ${
                                            visibility === v
                                            ? "bg-slate-900 border-slate-900 text-white shadow-sm"
                                            : "bg-transparent border-slate-100 dark:border-slate-800 text-slate-400"
                                        }`}
                                    >
                                        {v} ACCESS
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ACQUISITION */}
                <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-600 rounded-lg text-white"><UploadCloud size={18} /></div>
                            <h2 className="text-sm font-black text-slate-950 dark:text-white uppercase tracking-widest">Media Acquisition</h2>
                        </div>
                    </div>
                    
                    <div className="flex-1 min-h-[160px]">
                        {mediaFile ? (
                            <div className="relative group/media rounded-2xl overflow-hidden bg-slate-950 h-full flex items-center justify-center border-2 border-slate-900">
                                {mediaType === 'video' ? (
                                    <video src={previewUrl} className="w-full h-full object-contain" autoPlay muted loop />
                                ) : (
                                    <img src={previewUrl} className="w-full h-full object-contain" alt="Preview" />
                                )}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/media:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <label htmlFor="mediaUpload" className="px-4 py-2 bg-white text-indigo-600 rounded-lg cursor-pointer font-black text-[9px] uppercase tracking-widest flex items-center gap-2"><Replace size={14} /> Change</label>
                                    <button type="button" onClick={handleRemoveMedia} className="px-4 py-2 bg-rose-600 text-white rounded-lg font-black text-[9px] uppercase tracking-widest flex items-center gap-2"><Trash2 size={14} /> Purge</button>
                                </div>
                            </div>
                        ) : (
                            <label htmlFor="mediaUpload" className="flex flex-col items-center justify-center gap-3 cursor-pointer rounded-2xl border-2 border-dashed border-slate-100 dark:border-indigo-900/30 bg-slate-50 dark:bg-slate-800/50 h-full hover:border-indigo-600 transition-all group">
                                <UploadCloud size={28} className="text-indigo-400 group-hover:scale-110 transition-transform" />
                                <div className="text-center">
                                    <p className="text-[11px] font-black text-slate-950 dark:text-white uppercase tracking-widest">Initialize Sync</p>
                                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest italic">UHD Pipeline Active</p>
                                </div>
                            </label>
                        )}
                        <input id="mediaUpload" type="file" accept="image/*,video/*" onChange={handleMediaChange} className="hidden" />
                    </div>

                    <button
                        type="submit"
                        disabled={isUploading || !mediaFile}
                        className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        {isUploading ? <Loader2 className="animate-spin" size={16} /> : <Zap size={16} />}
                        {isUploading ? "Syncing..." : "DEPLOY TO REGISTRY"}
                    </button>
                </div>
            </div>

            {/* LIVE REGISTRY */}
            <div className="w-full bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none min-h-[400px]">
                <div className="flex items-center justify-between mb-6 border-b border-slate-50 dark:border-slate-800 pb-4">
                    <h2 className="text-sm font-black text-slate-950 dark:text-white uppercase tracking-widest flex items-center gap-3">
                        <Monitor size={20} className="text-indigo-600" /> Live Registry: <span className="text-indigo-600 italic">{activePage}</span>
                    </h2>
                    <div className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-md text-[9px] font-black uppercase tracking-widest">Total Assets: {videos?.length || 0}</div>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <Loader2 className="animate-spin text-indigo-600" size={32} strokeWidth={1} />
                        <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Loading Registry</p>
                    </div>
                ) : videos?.length ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {videos.map((v) => (
                            <motion.div key={v._id} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="group relative bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 overflow-hidden transition-all hover:shadow-lg">
                                <div className="flex flex-col h-full">
                                    <div className="aspect-video bg-slate-950 relative overflow-hidden">
                                        {v.url ? (
                                            v.media_type === 'image' ? (
                                                <img src={v.url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" alt="Hero" />
                                            ) : (
                                                <video src={v.url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" autoPlay muted loop />
                                            )
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-slate-900 text-slate-700">
                                                <AlertCircle size={24} />
                                            </div>
                                        )}
                                        <div className="absolute top-3 left-3 flex gap-1.5">
                                            <div className="px-2 py-1 bg-white/90 backdrop-blur-xl rounded-md text-[8px] font-black uppercase tracking-widest text-indigo-700 flex items-center gap-1 shadow-sm">
                                                {v.media_type === 'image' ? <ImageIcon size={10} /> : <Video size={10} />} {v.media_type}
                                            </div>
                                            <div className={`px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest shadow-sm ${v.visibility === 'Public' ? 'bg-emerald-600 text-white' : 'bg-slate-950 text-slate-300'}`}>
                                                {v.visibility}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 flex flex-col justify-between flex-1 gap-4">
                                        <div className="space-y-2">
                                            <h3 className="text-[11px] font-black text-slate-950 dark:text-white tracking-tight leading-tight uppercase truncate">{v.heading || "No Heading"}</h3>
                                            <p className="text-[9px] font-bold text-slate-500 dark:text-slate-400 italic leading-relaxed line-clamp-2">"{v.sub_heading || "Narrative finalized."}"</p>
                                        </div>

                                        <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3">
                                            <div className="flex items-center gap-1.5 text-slate-400">
                                                <MousePointer2 size={12} />
                                                <span className="text-[8px] font-black uppercase tracking-widest">Portal</span>
                                            </div>
                                            <div className="flex gap-1.5">
                                                <button type="button" onClick={() => handleVisibilityChange(v._id)} className="p-2 bg-white dark:bg-slate-800 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-all shadow-sm border border-slate-100 dark:border-slate-800">
                                                    {v.visibility === "Public" ? <EyeOff size={14} /> : <Eye size={14} />}
                                                </button>
                                                <button type="button" onClick={() => handleDelete(v._id)} className="p-2 bg-white dark:bg-slate-800 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all shadow-sm border border-slate-100 dark:border-slate-800">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="py-20 text-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-slate-100 dark:border-slate-800 border-dashed">
                        <Zap className="mx-auto mb-4 text-slate-200 dark:text-slate-800" size={60} strokeWidth={1} />
                        <h3 className="text-lg font-black text-slate-950 dark:text-white uppercase tracking-tight mb-2">Registry Offline</h3>
                    </div>
                )}
            </div>
        </form>
      </div>
    </motion.div>
  )
}

export default HeroMedia
