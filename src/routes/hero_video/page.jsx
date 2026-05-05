import { useRef, useState, useEffect } from "react"
import {
  Loader2,
  Video,
  Image as ImageIcon,
  X,
  Replace,
  LayoutTemplate,
  Eye,
  Trash2,
  UploadCloud,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertCircle,
  Monitor,
  Smartphone,
  MousePointer2,
  Type,
  FileText
} from "lucide-react"
import { toast } from "react-toastify"
import { apiClient } from "../../stores/authStores"
import { useHeroVideoStore } from "../../stores/heroVideoStore"
import axios from "axios"
import { motion, AnimatePresence } from "framer-motion"

const HoneymoonHeroVideo = () => {
  const [mediaFile, setMediaFile] = useState(null)
  const [mediaType, setMediaType] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [visibility, setVisibility] = useState("public")
  const [activePage, setActivePage] = useState("home")
  const [heading, setHeading] = useState("")
  const [subHeading, setSubHeading] = useState("")

  const { videos, isLoading, title, fetchVideos, deleteVideo, updateVisibility, heading: storeHeading, subHeading: storeSubHeading } =
    useHeroVideoStore()

  const pageRef = useRef()

  useEffect(() => {
    fetchVideos(activePage)
  }, [activePage, fetchVideos])

  useEffect(() => {
    setHeading(storeHeading || "")
    setSubHeading(storeSubHeading || "")
  }, [storeHeading, storeSubHeading, activePage])

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
    const page = activePage
    if (!page) return toast.error("Selection required")

    if (!mediaFile && (!heading || !subHeading)) {
        return toast.error("Content required for synchronization")
    }

    try {
      setIsUploading(true)
      let key = null

      if (mediaFile) {
        const heroFolder = `hero-section/${page.replace(/\s+/g, '_')}`
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
      }

      const payload = {
        title: page,
        visibility,
        video_key: key,
        heading,
        sub_heading: subHeading
      }

      const response = await apiClient.post("/admin/hero-section", payload)
      if (response.data.success) {
        toast.success("Hero synchronized successfully! 💕")
        handleRemoveMedia()
        fetchVideos(page)
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
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-[1400px] mx-auto space-y-10 pb-20 px-6">
      {/* HEADER HUB */}
      <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-12 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none text-indigo-600"><Monitor size={200} /></div>
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div>
                <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-4">
                    <Zap className="text-indigo-600" size={36} /> HERO REGISTRY
                </h1>
                <p className="text-slate-500 font-medium mt-2 text-lg italic">Cinematic visuals and strategic messaging for landing portals</p>
            </div>
            <div className="flex items-center gap-3">
                <div className="px-6 py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-2xl shadow-indigo-500/30">
                    <Sparkles size={16} /> HIGH FIDELITY MEDIA
                </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* CONFIGURATION PANEL */}
        <div className="lg:col-span-5 space-y-8">
            <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none space-y-8">
                <div className="space-y-6">
                    <div>
                        <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Target Portal</label>
                        <div className="grid grid-cols-3 gap-2">
                            {pageOptions.map((p) => (
                                <button
                                    key={p}
                                    type="button"
                                    onClick={() => setActivePage(p)}
                                    className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                        activePage === p 
                                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" 
                                        : "bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-indigo-600"
                                    }`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50 dark:border-slate-800">
                        <div>
                            <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Visibility</label>
                            <select
                                value={visibility}
                                onChange={(e) => setVisibility(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-xs font-bold text-slate-600 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500/20"
                            >
                                <option value="public">Public</option>
                                <option value="private">Private Access</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-slate-50 dark:border-slate-800">
                        <div>
                            <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Heading Typography</label>
                            <div className="relative group">
                                <Type className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={16} />
                                <input
                                    type="text"
                                    value={heading}
                                    onChange={(e) => setHeading(e.target.value)}
                                    placeholder="Majestic Ladakh Experience"
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold placeholder:text-slate-300 focus:ring-2 focus:ring-indigo-500/20"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Narrative Context</label>
                            <div className="relative group">
                                <FileText className="absolute left-4 top-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={16} />
                                <textarea
                                    value={subHeading}
                                    onChange={(e) => setSubHeading(e.target.value)}
                                    placeholder="Enter strategic brand narrative..."
                                    rows={3}
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold placeholder:text-slate-300 focus:ring-2 focus:ring-indigo-500/20"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-50 dark:border-slate-800">
                        <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Media Acquisition</label>
                        {mediaFile ? (
                            <div className="relative group/media rounded-[2rem] overflow-hidden bg-slate-900 shadow-2xl shadow-black/20 aspect-video flex items-center justify-center">
                                {mediaType === 'video' ? (
                                    <video src={previewUrl} className="w-full h-full object-cover opacity-80" autoPlay muted loop />
                                ) : (
                                    <img src={previewUrl} className="w-full h-full object-cover opacity-80" alt="Preview" />
                                )}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/media:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                    <label htmlFor="mediaUpload" className="p-4 bg-white text-indigo-600 rounded-2xl cursor-pointer hover:scale-110 transition-transform"><Replace size={20} /></label>
                                    <button type="button" onClick={handleRemoveMedia} className="p-4 bg-rose-500 text-white rounded-2xl hover:scale-110 transition-transform"><X size={20} /></button>
                                </div>
                            </div>
                        ) : (
                            <label htmlFor="mediaUpload" className="flex flex-col items-center justify-center gap-4 cursor-pointer rounded-[2.5rem] border-2 border-dashed border-indigo-100 dark:border-indigo-900/30 bg-slate-50 dark:bg-slate-800/50 p-12 hover:border-indigo-300 transition-all group">
                                <div className="size-16 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center text-indigo-600 shadow-lg group-hover:scale-110 transition-transform">
                                    <UploadCloud size={32} />
                                </div>
                                <div className="text-center">
                                    <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest mb-1">Acquire Media</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">JPG, PNG, MP4, WEBM</p>
                                </div>
                            </label>
                        )}
                        <input id="mediaUpload" type="file" accept="image/*,video/*" onChange={handleMediaChange} className="hidden" />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isUploading || (!mediaFile && !heading && !subHeading)}
                    className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-indigo-500/30 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 disabled:opacity-30"
                >
                    {isUploading ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} />}
                    {isUploading ? "Synchronizing..." : "Update Hero Registry"}
                </button>
            </form>
        </div>

        {/* REGISTRY PREVIEW */}
        <div className="lg:col-span-7 space-y-8">
            <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none min-h-[600px]">
                <div className="flex items-center justify-between mb-10">
                    <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                        <Monitor size={20} className="text-indigo-600" /> Active Media: <span className="text-indigo-600 capitalize">{activePage}</span>
                    </h2>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-40 gap-4">
                        <Loader2 className="animate-spin text-indigo-600" size={48} strokeWidth={1} />
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Syncing Active Registry</p>
                    </div>
                ) : videos?.length ? (
                    <div className="space-y-8">
                        {videos.map((v) => (
                            <motion.div key={v._id} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="group relative bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 overflow-hidden transition-all hover:shadow-2xl">
                                <div className="flex flex-col xl:flex-row h-full">
                                    <div className="xl:w-1/2 aspect-video xl:aspect-auto bg-slate-900 relative">
                                        {v.url ? (
                                            v.media_type === 'image' ? (
                                                <img src={v.url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Hero" />
                                            ) : (
                                                <video src={v.url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" controls muted />
                                            )
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-slate-500 gap-2">
                                                <AlertCircle size={32} />
                                                <p className="text-[10px] font-black uppercase tracking-widest">Media Pending Sync</p>
                                            </div>
                                        )}
                                        <div className="absolute top-6 left-6 flex gap-2">
                                            <div className="px-4 py-2 bg-white/90 backdrop-blur-md rounded-xl text-[10px] font-black uppercase tracking-widest text-indigo-600 flex items-center gap-2 shadow-lg">
                                                {v.media_type === 'image' ? <ImageIcon size={14} /> : <Video size={14} />} {v.media_type}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="xl:w-1/2 p-8 flex flex-col justify-between">
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Global Identity</p>
                                                <button onClick={() => handleVisibilityChange(v._id)} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                                                    v.visibility === "Public" ? "bg-emerald-50 text-emerald-600" : "bg-slate-200 text-slate-500"
                                                }`}>
                                                    {v.visibility}
                                                </button>
                                            </div>
                                            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">{v.heading || "No Heading"}</h3>
                                            <p className="text-sm font-bold text-slate-500 italic leading-relaxed">"{v.sub_heading || "No narrative set."}"</p>
                                        </div>

                                        <div className="pt-8 mt-8 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-slate-300">
                                                <MousePointer2 size={14} />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Portal Lead</span>
                                            </div>
                                            <div className="flex gap-3">
                                                <button onClick={() => handleDelete(v._id)} className="p-3 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm">
                                                    <Trash2 size={18} />
                                                </button>
                                                <button className="p-3 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                                                    <ArrowUpRight size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="py-40 text-center bg-slate-50 dark:bg-slate-800/50 rounded-[3rem] border border-slate-100 dark:border-slate-800 border-dashed">
                        <Zap className="mx-auto mb-4 text-slate-100" size={80} strokeWidth={1} />
                        <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-xs">The media registry for {activePage} is empty</p>
                    </div>
                )}
            </div>
        </div>
      </div>
    </motion.div>
  )
}

export default HoneymoonHeroVideo
