import { useState, useEffect } from "react"
import {
  Loader2,
  Zap,
  Sparkles,
  Monitor,
  Type,
  FileText,
  MousePointer2,
  Quote
} from "lucide-react"
import { toast } from "react-toastify"
import { apiClient } from "../../stores/authStores"
import { useHeroVideoStore } from "../../stores/heroVideoStore"
import { motion, AnimatePresence } from "framer-motion"

const HeroContent = () => {
  const [isUploading, setIsUploading] = useState(false)
  const activePage = "home"
  const [heading, setHeading] = useState("")
  const [subHeading, setSubHeading] = useState("")

  const { 
    isLoading, 
    fetchVideos, 
    heading: storeHeading, 
    subHeading: storeSubHeading 
  } = useHeroVideoStore()

  useEffect(() => {
    fetchVideos(activePage)
  }, [fetchVideos])

  useEffect(() => {
    setHeading(storeHeading || "")
    setSubHeading(storeSubHeading || "")
  }, [storeHeading, storeSubHeading])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!heading || !subHeading) {
      return toast.error("Content required for synchronization")
    }

    try {
      setIsUploading(true)
      const payload = {
        title: activePage,
        heading,
        sub_heading: subHeading
      }

      const response = await apiClient.post("/admin/hero-section", payload)
      if (response.data.success) {
        toast.success("Messaging synchronized successfully! 💕")
        fetchVideos(activePage)
      }
    } catch (err) {
      toast.error("Synchronization failure")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-full mx-auto space-y-10 pb-20 px-6">
      {/* HEADER HUB */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none text-indigo-600"><FileText size={160} /></div>
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
                <h1 className="text-3xl font-black text-slate-950 dark:text-white tracking-tight flex items-center gap-4">
                    <Type className="text-indigo-600" size={32} /> HERO CONTENT
                </h1>
                <p className="text-slate-500 dark:text-slate-400 font-bold mt-1 text-sm italic">Strategic messaging and brand narratives for the main landing portal</p>
            </div>
            <div className="flex items-center gap-3">
                <div className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-indigo-500/20">
                    <Sparkles size={16} /> BOLD BRAND VOICE
                </div>
            </div>
        </div>
      </div>

      <div className="flex flex-col gap-10">
        {/* EDITING PANEL */}
        <div className="w-full">
            <form onSubmit={handleSubmit}>
                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none space-y-8">
                    <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-800 pb-6">
                        <h3 className="text-xs font-black text-indigo-600 uppercase tracking-widest">Copywriting Lab</h3>
                        <div className="px-4 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest">Active: Home</div>
                    </div>

                    <div className="space-y-8">
                        <div>
                            <label className="flex items-center gap-2 text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-2 ml-1">Heading Typography</label>
                            <div className="relative group">
                                <Type className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                                <input
                                    type="text"
                                    value={heading}
                                    onChange={(e) => setHeading(e.target.value)}
                                    placeholder="Enter Majestic Heading..."
                                    className="w-full pl-14 pr-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 focus:ring-2 focus:ring-indigo-500/20 rounded-2xl text-lg font-medium text-slate-900 dark:text-white placeholder:text-slate-500 transition-all"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="flex items-center gap-2 text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-2 ml-1">Narrative Context</label>
                            <div className="relative group">
                                <FileText className="absolute left-5 top-6 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                                <textarea
                                    value={subHeading}
                                    onChange={(e) => setSubHeading(e.target.value)}
                                    placeholder="Enter strategic brand narrative..."
                                    rows={4}
                                    className="w-full pl-14 pr-6 py-5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 focus:ring-2 focus:ring-indigo-500/20 rounded-2xl text-lg font-medium text-slate-800 dark:text-slate-200 placeholder:text-slate-500 transition-all leading-relaxed"
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isUploading || (!heading && !subHeading)}
                        className="w-full py-5 mt-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        {isUploading ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} />}
                        {isUploading ? "Syncing..." : "Update Home Messaging"}
                    </button>
                </div>
            </form>
        </div>

        {/* SLEEK LIVE PREVIEW */}
        <div className="w-full">
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none min-h-[500px] flex flex-col relative overflow-hidden">
                <div className="flex items-center justify-between mb-10 relative z-20">
                    <h2 className="text-xl font-black text-slate-950 dark:text-white uppercase tracking-tight flex items-center gap-3">
                        <Monitor size={24} className="text-indigo-600" /> Typography Preview
                    </h2>
                    <div className="flex items-center gap-2 text-slate-400">
                        <MousePointer2 size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest italic">Live Content Reflection</span>
                    </div>
                </div>

                <div className="flex-1 flex items-center justify-center relative px-12 z-10">
                    <AnimatePresence mode="wait">
                        <motion.div 
                            key={heading + subHeading}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center space-y-10 max-w-3xl relative"
                        >
                            <Quote className="absolute -top-16 -left-16 text-indigo-100/40 dark:text-indigo-900/10" size={160} />
                            
                            <h3 className="text-5xl xl:text-6xl font-black text-slate-950 dark:text-white tracking-tighter leading-[0.95] drop-shadow-sm">
                                {heading || <span className="opacity-10 italic font-thin">No Heading Sync'd</span>}
                            </h3>
                            
                            <p className="text-xl xl:text-2xl font-bold text-slate-600 dark:text-slate-300 italic leading-relaxed max-w-2xl mx-auto">
                                {subHeading ? `"${subHeading}"` : <span className="opacity-10 italic">"Narrative context is pending for this portal."</span>}
                            </p>

                            <div className="pt-12 flex items-center justify-center gap-6">
                                <div className="h-[3px] w-16 bg-indigo-700/20"></div>
                                <div className="size-3 rounded-full bg-indigo-700 shadow-lg shadow-indigo-500/50"></div>
                                <div className="h-[3px] w-16 bg-indigo-700/20"></div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* DECORATIVE ELEMENTS */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
                    <div className="absolute -top-20 -right-20 size-96 bg-indigo-50 dark:bg-indigo-900/20 rounded-full blur-[120px]"></div>
                    <div className="absolute -bottom-20 -left-20 size-96 bg-slate-50 dark:bg-slate-800/30 rounded-full blur-[120px]"></div>
                </div>

                <div className="mt-auto pt-10 border-t border-slate-100 dark:border-slate-800 text-center relative z-20">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-[0.5em]">Cinematic Brand Strategy Port</p>
                </div>
            </div>
        </div>
      </div>
    </motion.div>
  )
}

export default HeroContent
