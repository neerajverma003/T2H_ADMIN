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
    ArrowRight,
    Settings2,
    Play,
    Calendar
} from "lucide-react"
import { toast } from "react-toastify"
import { apiClient } from "../../stores/authStores"
import { useHeroVideoStore } from "../../stores/heroVideoStore"
import axios from "axios"
import { motion, AnimatePresence } from "framer-motion"

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
            toast.error("Invalid format. UHD Sync aborted.")
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
            const heroFolder = `hero-section/${activePage.replace(/\s+/g, '_')}`
            const presignedRes = await apiClient.post("/admin/generate-presigned-url", {
                fileName: mediaFile.name,
                fileType: mediaFile.type,
                folder: heroFolder
            })
            const { uploadUrl, key } = presignedRes.data

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
                toast.success("Hero Synchronized! ✨")
                handleRemoveMedia()
                fetchVideos(activePage)
            }
        } catch (err) {
            toast.error("Sync failure")
        } finally {
            setIsUploading(false)
        }
    }

    const pageOptions = ["home", "about", "domestic", "international", "contact", "blog"]

    return (
        <div className="w-full space-y-8 pb-20 px-8 mt-6">
            {/* 1. COMPACT HEADER & PAGE SWITCHER (HORIZONTAL ROW) */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 border border-slate-100 dark:border-slate-800 shadow-md flex flex-col xl:flex-row items-center justify-between gap-8">
                <div className="flex items-center gap-6">
                    <div className="size-16 bg-indigo-600 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl shadow-indigo-500/20">
                        <Zap size={32} fill="currentColor" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Hero Registry</h1>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest italic">High-fidelity portal management</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 p-2 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 overflow-x-auto no-scrollbar max-w-full">
                    {pageOptions.map((p) => (
                        <button
                            key={p}
                            onClick={() => setActivePage(p)}
                            className={`px-8 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                                activePage === p 
                                ? "bg-white dark:bg-slate-700 text-indigo-600 shadow-md border border-slate-200 dark:border-slate-600 scale-105" 
                                : "text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700/50"
                            }`}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            </div>

            {/* 2. LIVE REGISTRY (HORIZONTAL TYPE CARDS) */}
            <div className="space-y-6">
                <div className="flex items-center justify-between px-6">
                    <h2 className="text-sm font-black text-slate-500 uppercase tracking-[0.25em] flex items-center gap-3">
                        <Monitor size={18} /> Currently Active: <span className="text-indigo-600 italic">{activePage}</span>
                    </h2>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{videos?.length || 0} Assets Deployed</div>
                </div>

                {isLoading ? (
                    <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-32 flex flex-col items-center justify-center border border-slate-100 dark:border-slate-800 shadow-sm">
                        <Loader2 className="animate-spin text-indigo-600 mb-6" size={48} strokeWidth={1} />
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Accessing UHD Registry...</p>
                    </div>
                ) : videos?.length > 0 ? (
                    <div className="space-y-6">
                        <AnimatePresence>
                            {videos.map((v) => (
                                <motion.div 
                                    key={v._id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 border border-slate-100 dark:border-slate-800 shadow-md group hover:border-indigo-400 dark:hover:border-indigo-800 transition-all duration-500"
                                >
                                    <div className="flex flex-col xl:flex-row items-center gap-10">
                                        {/* Horizontal Thumbnail */}
                                        <div className="w-full xl:w-96 aspect-video bg-slate-950 rounded-[2rem] overflow-hidden relative group-hover:shadow-2xl transition-all duration-700">
                                            {v.media_type === 'image' ? (
                                                <img src={v.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s]" alt="Hero" />
                                            ) : (
                                                <video src={v.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s]" muted loop />
                                            )}
                                            <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                                <div className="size-16 bg-white rounded-full flex items-center justify-center text-indigo-600 shadow-2xl scale-75 group-hover:scale-100 transition-transform duration-500">
                                                    <Play size={32} fill="currentColor" />
                                                </div>
                                            </div>
                                            <div className="absolute top-4 left-4 flex gap-2">
                                                <span className="px-4 py-1.5 bg-white/90 backdrop-blur-xl rounded-xl text-[10px] font-black uppercase tracking-widest text-indigo-700 shadow-lg">{v.media_type}</span>
                                            </div>
                                        </div>

                                        {/* Horizontal Data */}
                                        <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-10 w-full">
                                            <div className="space-y-4">
                                                <div>
                                                    <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">{v.heading || "No Heading"}</h3>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400 italic leading-relaxed line-clamp-2 max-w-2xl font-medium">"{v.sub_heading || "Default narrative active."}"</p>
                                                </div>
                                                <div className="flex items-center gap-6">
                                                    <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${v.visibility === 'Public' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-400 border border-slate-200'}`}>
                                                        {v.visibility} Access
                                                    </div>
                                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                        <Calendar size={14} className="text-indigo-500" />
                                                        Deployed: {new Date(v.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <button 
                                                    onClick={() => updateVisibility(v._id, activePage)}
                                                    className="p-4 bg-white dark:bg-slate-800 text-slate-500 hover:text-indigo-600 rounded-2xl border border-slate-100 dark:border-slate-700 transition-all hover:shadow-xl hover:scale-110"
                                                    title="Toggle Visibility"
                                                >
                                                    {v.visibility === "Public" ? <EyeOff size={22} /> : <Eye size={22} />}
                                                </button>
                                                <button 
                                                    onClick={() => deleteVideo(v._id, activePage)}
                                                    className="p-4 bg-rose-50 dark:bg-rose-900/10 text-rose-500 rounded-2xl border border-rose-100 dark:border-rose-900/30 transition-all hover:shadow-xl hover:bg-rose-600 hover:text-white hover:scale-110"
                                                    title="Delete Asset"
                                                >
                                                    <Trash2 size={22} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                ) : (
                    <div className="bg-slate-50 dark:bg-slate-800/30 rounded-[3rem] p-24 text-center border-2 border-dashed border-slate-100 dark:border-slate-800">
                        <Zap className="mx-auto mb-6 text-slate-200" size={80} strokeWidth={0.5} />
                        <h3 className="text-lg font-black text-slate-400 uppercase tracking-widest">Registry Offline</h3>
                        <p className="text-xs text-slate-400 mt-2 font-bold uppercase tracking-widest italic">Waiting for high-fidelity deployment</p>
                    </div>
                )}
            </div>

            {/* 3. MEDIA ACQUISITION (HORIZONTAL TYPE WORKFLOW) */}
            <div className="space-y-6">
                <h2 className="text-sm font-black text-slate-500 uppercase tracking-[0.25em] px-6 flex items-center gap-3">
                    <UploadCloud size={18} /> Synchronize New Media
                </h2>

                <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-slate-100 dark:border-slate-800 shadow-2xl shadow-indigo-500/5 dark:shadow-none">
                    <div className="flex flex-col lg:flex-row gap-16 items-center">
                        {/* Compact Drop Zone */}
                        <div className="w-full lg:w-[400px] shrink-0">
                            {previewUrl ? (
                                <div className="relative group/media rounded-[2.5rem] overflow-hidden bg-slate-950 aspect-video border-4 border-indigo-600 shadow-2xl">
                                    {mediaType === 'video' ? (
                                        <video src={previewUrl} className="w-full h-full object-contain" autoPlay muted loop />
                                    ) : (
                                        <img src={previewUrl} className="w-full h-full object-contain" alt="Preview" />
                                    )}
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/media:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-sm">
                                        <label htmlFor="mediaUpload" className="p-4 bg-white text-indigo-600 rounded-2xl cursor-pointer hover:scale-110 transition-transform shadow-2xl"><Replace size={24} /></label>
                                        <button type="button" onClick={handleRemoveMedia} className="p-4 bg-rose-600 text-white rounded-2xl hover:scale-110 transition-transform shadow-2xl"><Trash2 size={24} /></button>
                                    </div>
                                </div>
                            ) : (
                                <label htmlFor="mediaUpload" className="flex flex-col items-center justify-center gap-4 cursor-pointer rounded-[2.5rem] border-4 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 aspect-video hover:border-indigo-600 transition-all group shadow-inner">
                                    <div className="size-20 bg-white dark:bg-slate-800 rounded-3xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform border border-slate-100 dark:border-slate-700">
                                        <UploadCloud size={40} className="text-indigo-600" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Initialize UHD Sync</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic mt-1">Direct S3 Pipeline Active</p>
                                    </div>
                                    <input id="mediaUpload" type="file" accept="image/*,video/*" onChange={handleMediaChange} className="hidden" />
                                </label>
                            )}
                        </div>

                        {/* Horizontal Configuration & Action */}
                        <div className="flex-1 w-full flex flex-col xl:flex-row items-end gap-12">
                            <div className="flex-1 space-y-8 w-full">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-4 ml-1">Privacy Tier</label>
                                        <div className="flex gap-4">
                                            {["public", "private"].map((v) => (
                                                <button
                                                    key={v}
                                                    type="button"
                                                    onClick={() => setVisibility(v)}
                                                    className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${visibility === v
                                                            ? "bg-slate-900 border-slate-900 text-white shadow-2xl scale-105"
                                                            : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400 hover:border-slate-300"
                                                        }`}
                                                >
                                                    {v} Access
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex flex-col justify-end">
                                        <div className="bg-indigo-50 dark:bg-indigo-900/10 p-5 rounded-[1.5rem] border border-indigo-100 dark:border-indigo-900/30 flex items-center justify-between shadow-sm">
                                            <div className="flex items-center gap-3">
                                                <Settings2 className="text-indigo-600" size={20} />
                                                <span className="text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">Target: {activePage}</span>
                                            </div>
                                            <div className="size-3 bg-indigo-600 rounded-full animate-pulse shadow-[0_0_10px_rgba(79,70,229,0.8)]" />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                                    <AlertCircle size={16} className="text-slate-400 mt-0.5" />
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">Messaging (Heading/Sub-heading) will be automatically synchronized from the "Hero Content" module during deployment.</p>
                                </div>
                            </div>

                            <div className="w-full xl:w-auto">
                                <button
                                    type="submit"
                                    disabled={isUploading || !mediaFile}
                                    className="w-full xl:w-80 py-6 bg-indigo-600 text-white rounded-[1.5rem] font-black text-sm uppercase tracking-[0.25em] shadow-2xl shadow-indigo-600/30 hover:bg-indigo-700 hover:scale-105 transition-all flex items-center justify-center gap-4 disabled:opacity-50 disabled:scale-100 active:scale-95"
                                >
                                    {isUploading ? <Loader2 className="animate-spin" size={24} /> : <Zap size={24} fill="currentColor" />}
                                    {isUploading ? "Syncing..." : "Deploy UHD"}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
        
    )
}

export default HeroMedia
