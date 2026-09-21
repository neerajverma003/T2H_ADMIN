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
import { convertImageFileToWebP } from "../../utils/imageConverter"

const HeroMedia = () => {
    const [mediaFile, setMediaFile] = useState(null)
    const [mediaType, setMediaType] = useState(null)
    const [previewUrl, setPreviewUrl] = useState(null)
    const [isUploading, setIsUploading] = useState(false)
    const [visibility, setVisibility] = useState("public")
    const [activePage, setActivePage] = useState("home")
    const [selectedMedia, setSelectedMedia] = useState(null)

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
    const VIDEO_EXTS = ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv', 'av1']

    const handleMediaChange = (e) => {
        const file = e.target.files[0]
        if (!file) return

        const ext = file.name.split('.').pop()?.toLowerCase()
        const isImage = IMAGE_EXTS.includes(ext)
        const isVideo = file.type.startsWith('video/') || VIDEO_EXTS.includes(ext)

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
            const ext = mediaFile.name.split('.').pop()?.toLowerCase()
            let resolvedType = mediaFile.type
            if (!resolvedType || resolvedType === "application/octet-stream") {
                if (ext === 'av1') resolvedType = 'video/av1'
                else if (ext === 'mkv') resolvedType = 'video/x-matroska'
                else if (ext === 'webm') resolvedType = 'video/webm'
                else if (ext === 'mp4') resolvedType = 'video/mp4'
                else if (mediaType === 'video') resolvedType = 'video/mp4'
            }

            const heroFolder = `hero-section/${activePage.replace(/\s+/g, '_')}`
            let fileToUpload = mediaFile
            if (mediaType === 'image') {
                fileToUpload = await convertImageFileToWebP(mediaFile)
            }
            const uploadMimeType = fileToUpload.type || resolvedType
            const presignedRes = await apiClient.post("/admin/generate-presigned-url", {
                fileName: fileToUpload.name,
                fileType: uploadMimeType,
                folder: heroFolder
            })
            const { uploadUrl, key } = presignedRes.data

            await axios.put(uploadUrl, fileToUpload, {
                headers: { "Content-Type": fileToUpload.type || resolvedType }
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

    const pageOptions = ["home", "about", "domestic", "international", "contact", "blog", "destinations"]

    const formatDate = (dateStr) => {
        if (!dateStr) return "Active Deployment";
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return "Active Deployment";
        return `Deployed: ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8 pb-20 font-sans min-h-screen text-slate-900 dark:text-slate-100"
        >
            {/* 1. HEADER & PAGE SWITCHER */}
            <div className="bg-white dark:bg-[#091126]/95 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-indigo-500/25 shadow-xl dark:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.7),0_0_30px_2px_rgba(99,102,241,0.18)] ring-1 ring-slate-900/5 dark:ring-white/5 backdrop-blur-xl relative overflow-hidden">
                <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30 shrink-0">
                            <Zap size={24} fill="currentColor" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2 flex-wrap">
                                Hero <span className="text-blue-500">Media</span> Registry
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 font-semibold mt-0.5 text-xs sm:text-sm">
                                High-fidelity portal banner and background media management
                            </p>
                        </div>
                    </div>

                    {/* Page Switcher Tabs */}
                    <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-[#050A17] p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800/90 overflow-x-auto no-scrollbar max-w-full shrink-0">
                        {pageOptions.map((p) => (
                            <button
                                key={p}
                                type="button"
                                onClick={() => setActivePage(p)}
                                className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                                    activePage === p
                                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                                        : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800/50"
                                }`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* 2. LIVE REGISTRY (ACTIVE DEPLOYED ASSETS) */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-3 text-xs font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        <Monitor size={16} className="text-blue-500" />
                        <span>Currently Active:</span>
                        <span className="px-3 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 rounded-full text-xs font-extrabold uppercase tracking-wider">
                            {activePage}
                        </span>
                    </div>
                    <span className="px-3 py-1 rounded-xl bg-white dark:bg-[#091126]/95 border border-slate-200 dark:border-slate-800/90 text-xs font-bold text-slate-500 dark:text-slate-400 shadow-sm">
                        {videos?.length || 0} Assets Deployed
                    </span>
                </div>

                {isLoading ? (
                    <div className="bg-white dark:bg-[#091126]/95 rounded-3xl p-24 flex flex-col items-center justify-center border border-slate-200/90 dark:border-indigo-500/25 shadow-xl ring-1 ring-slate-900/5 dark:ring-white/5 backdrop-blur-xl">
                        <Loader2 className="animate-spin text-blue-500 mb-4" size={40} />
                        <span className="text-base font-bold text-slate-800 dark:text-slate-200">Synchronizing Media Registry...</span>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Fetching high-fidelity video and image assets</p>
                    </div>
                ) : videos?.length > 0 ? (
                    <div className="space-y-4">
                        <AnimatePresence>
                            {videos.map((v) => (
                                <motion.div
                                    key={v._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="bg-white dark:bg-[#091126]/95 rounded-3xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800/90 hover:border-blue-500/50 dark:hover:border-indigo-500/50 shadow-xl dark:shadow-[0_8px_30px_rgb(0,0,0,0.35)] ring-1 ring-slate-900/5 dark:ring-white/5 backdrop-blur-xl transition-all duration-300 group"
                                >
                                    <div className="flex flex-col xl:flex-row items-center gap-8">
                                        {/* Horizontal Thumbnail */}
                                        <div
                                            onClick={() => setSelectedMedia(v)}
                                            className="w-full xl:w-88 aspect-video bg-slate-950 rounded-2xl overflow-hidden relative group-hover:shadow-2xl transition-all duration-500 cursor-pointer shrink-0 border border-slate-200 dark:border-slate-800"
                                        >
                                            {v.media_type === 'image' ? (
                                                <img src={v.url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Hero" />
                                            ) : (
                                                <video src={v.url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" muted loop autoPlay playsInline />
                                            )}
                                            <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                                <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-2xl scale-90 group-hover:scale-100 transition-transform duration-300">
                                                    <Play size={24} fill="currentColor" />
                                                </div>
                                            </div>
                                            <div className="absolute top-3 left-3 flex gap-2">
                                                <span className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[10px] font-extrabold uppercase tracking-wider text-white border border-white/20">
                                                    {v.media_type}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Horizontal Data */}
                                        <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-6 w-full">
                                            <div className="space-y-3">
                                                <div>
                                                    <h3 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                                                        {v.heading || "No Heading Defined"}
                                                    </h3>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400 italic leading-relaxed line-clamp-2 max-w-2xl font-medium mt-1">
                                                        "{v.sub_heading || "Default narrative active."}"
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-4 flex-wrap">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider border ${
                                                        v.visibility === 'Public'
                                                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                                                    }`}>
                                                        {v.visibility} Access
                                                    </span>
                                                    <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                                                        <Calendar size={13} className="text-blue-500" />
                                                        <span>{formatDate(v.updatedAt || v.createdAt)}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 shrink-0">
                                                <button
                                                    onClick={() => updateVisibility(v._id, activePage)}
                                                    className="p-3 bg-slate-50 dark:bg-[#050A17] text-slate-600 dark:text-slate-400 hover:text-white hover:bg-blue-600 dark:hover:bg-blue-600 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-600 transition-all cursor-pointer shadow-sm active:scale-95"
                                                    title="Toggle Visibility"
                                                >
                                                    {v.visibility === "Public" ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </button>
                                                <button
                                                    onClick={() => deleteVideo(v._id, activePage)}
                                                    className="p-3 bg-rose-50 dark:bg-[#050A17] text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white rounded-2xl border border-rose-200 dark:border-slate-800 hover:border-rose-600 transition-all cursor-pointer shadow-sm active:scale-95"
                                                    title="Delete Asset"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-[#091126]/95 rounded-3xl p-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-800/90 shadow-xl ring-1 ring-slate-900/5 dark:ring-white/5 backdrop-blur-xl">
                        <div className="w-16 h-16 bg-slate-50 dark:bg-[#050A17] rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400 border border-slate-200 dark:border-slate-800">
                            <Zap size={28} />
                        </div>
                        <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-1">Registry Offline</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">No media deployed for the {activePage} section yet.</p>
                    </div>
                )}
            </div>

            {/* 3. MEDIA ACQUISITION FORM */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 px-2">
                    <UploadCloud size={16} className="text-blue-500" />
                    <h2 className="text-xs font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                        Synchronize New Media
                    </h2>
                </div>

                <form onSubmit={handleSubmit} className="bg-white dark:bg-[#091126]/95 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-indigo-500/25 shadow-xl dark:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.7),0_0_30px_2px_rgba(99,102,241,0.18)] ring-1 ring-slate-900/5 dark:ring-white/5 backdrop-blur-xl">
                    <div className="flex flex-col lg:flex-row gap-10 items-stretch">
                        {/* Compact Drop Zone */}
                        <div className="w-full lg:w-[380px] shrink-0">
                            {previewUrl ? (
                                <div className="relative group/media rounded-2xl overflow-hidden bg-slate-950 aspect-video border-2 border-blue-500 shadow-xl">
                                    {mediaType === 'video' ? (
                                        <video src={previewUrl} className="w-full h-full object-contain" autoPlay muted loop />
                                    ) : (
                                        <img src={previewUrl} className="w-full h-full object-contain" alt="Preview" />
                                    )}
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/media:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-sm">
                                        <label htmlFor="mediaUpload" className="p-3 bg-white text-blue-600 rounded-xl cursor-pointer hover:scale-105 transition-transform shadow-lg">
                                            <Replace size={20} />
                                        </label>
                                        <button type="button" onClick={handleRemoveMedia} className="p-3 bg-rose-600 text-white rounded-xl hover:scale-105 transition-transform shadow-lg cursor-pointer">
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <label htmlFor="mediaUpload" className="flex flex-col items-center justify-center gap-3 cursor-pointer rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800/90 bg-slate-50 dark:bg-[#050A17] aspect-video hover:border-blue-500 transition-all group shadow-inner">
                                    <div className="w-14 h-14 bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform">
                                        <UploadCloud size={28} />
                                    </div>
                                    <div className="text-center px-4">
                                        <p className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">Initialize UHD Sync</p>
                                        <p className="text-[11px] font-semibold text-slate-400 mt-0.5">Images (WebP) or Videos (.mp4, .webm, .mkv)</p>
                                    </div>
                                    <input id="mediaUpload" type="file" accept="image/*,video/*,.av1,.mkv" onChange={handleMediaChange} className="hidden" />
                                </label>
                            )}
                        </div>

                        {/* Configuration & Action */}
                        <div className="flex-1 w-full flex flex-col justify-between gap-6">
                            <div className="space-y-5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                                            Privacy Tier
                                        </label>
                                        <div className="flex gap-2">
                                            {["public", "private"].map((v) => (
                                                <button
                                                    key={v}
                                                    type="button"
                                                    onClick={() => setVisibility(v)}
                                                    className={`flex-1 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                                                        visibility === v
                                                            ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/30"
                                                            : "bg-slate-50 dark:bg-[#050A17] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"
                                                    }`}
                                                >
                                                    {v} Access
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                                            Target Destination
                                        </label>
                                        <div className="bg-blue-50 dark:bg-blue-950/30 py-3 px-4 rounded-2xl border border-blue-200 dark:border-blue-800/40 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Settings2 className="text-blue-600 dark:text-blue-400" size={16} />
                                                <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                                                    Target: {activePage}
                                                </span>
                                            </div>
                                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-2.5 p-3.5 bg-slate-50 dark:bg-[#050A17] rounded-2xl border border-slate-200 dark:border-slate-800">
                                    <AlertCircle size={15} className="text-blue-500 shrink-0 mt-0.5" />
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                                        Heading & Subheading messaging will be automatically synchronized from the "Hero Content" module during deployment.
                                    </p>
                                </div>
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={isUploading}
                                    className="w-full sm:w-auto sm:min-w-[220px] py-4 px-8 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-70 disabled:cursor-wait"
                                >
                                    {isUploading ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} fill="currentColor" />}
                                    <span>{isUploading ? "Synchronizing..." : "Deploy UHD Asset"}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>

            {/* Lightbox Modal */}
            <AnimatePresence>
                {selectedMedia && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-950/90 p-4 md:p-10 backdrop-blur-md"
                        onClick={() => setSelectedMedia(null)}
                    >
                        <motion.button
                            initial={{ y: -10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors bg-white/10 hover:bg-white/20 p-3 rounded-2xl backdrop-blur-md cursor-pointer"
                            onClick={() => setSelectedMedia(null)}
                        >
                            <X size={24} />
                        </motion.button>

                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="relative max-w-5xl w-full max-h-[85vh] flex items-center justify-center"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {selectedMedia.media_type === 'image' ? (
                                <img
                                    src={selectedMedia.url}
                                    alt="Full screen preview"
                                    className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl border border-white/10"
                                />
                            ) : (
                                <video
                                    src={selectedMedia.url}
                                    className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl border border-white/10"
                                    controls
                                    autoPlay
                                    playsInline
                                />
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}

export default HeroMedia
