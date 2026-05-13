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
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full space-y-10 pb-20 px-8 mt-6">
      {/* HEADER HUB */}
      <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none text-indigo-600"><FileText size={200} /></div>
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div>
                <h1 className="text-4xl font-black text-slate-950 dark:text-white tracking-tight flex items-center gap-6">
                    <Type className="text-indigo-600" size={40} /> HERO CONTENT
                </h1>
                <p className="text-slate-500 dark:text-slate-400 font-bold mt-2 text-base italic">Strategic messaging and brand narratives for the main landing portal</p>
            </div>
            <div className="flex items-center gap-4">
                <div className="px-8 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-black uppercase tracking-widest flex items-center gap-3 shadow-2xl shadow-indigo-500/30">
                    <Sparkles size={20} /> BOLD BRAND VOICE
                </div>
            </div>
        </div>
      </div>

      <div className="flex flex-col gap-12">
        {/* EDITING PANEL */}
        <div className="w-full">
            <form onSubmit={handleSubmit}>
                <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none space-y-10">
                    <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-800 pb-8">
                        <h3 className="text-sm font-black text-indigo-600 uppercase tracking-[0.2em]">Copywriting Lab</h3>
                        <div className="px-6 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-xl text-xs font-black uppercase tracking-widest">Active: Home</div>
                    </div>

                    <div className="space-y-10">
                        <div>
                            <label className="flex items-center gap-3 text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-4 ml-1">Heading Typography</label>
                            <div className="relative group">
                                <Type className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={24} />
                                <input
                                    type="text"
                                    value={heading}
                                    onChange={(e) => setHeading(e.target.value)}
                                    placeholder="Enter Majestic Heading..."
                                    className="w-full pl-16 pr-8 py-6 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 focus:ring-4 focus:ring-indigo-500/10 rounded-[1.5rem] text-2xl font-bold text-slate-900 dark:text-white placeholder:text-slate-400 transition-all shadow-inner"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="flex items-center gap-3 text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-4 ml-1">Narrative Context</label>
                            <div className="relative group">
                                <FileText className="absolute left-6 top-8 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={24} />
                                <textarea
                                    value={subHeading}
                                    onChange={(e) => setSubHeading(e.target.value)}
                                    placeholder="Enter strategic brand narrative..."
                                    rows={5}
                                    className="w-full pl-16 pr-8 py-8 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 focus:ring-4 focus:ring-indigo-500/10 rounded-[1.5rem] text-xl font-medium text-slate-800 dark:text-slate-200 placeholder:text-slate-400 transition-all leading-relaxed shadow-inner resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isUploading || (!heading && !subHeading)}
                        className="w-full py-6 mt-6 bg-indigo-600 text-white rounded-[1.5rem] font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-indigo-600/30 hover:bg-indigo-700 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-4 disabled:opacity-50"
                    >
                        {isUploading ? <Loader2 className="animate-spin" size={24} /> : <Zap size={24} fill="currentColor" />}
                        {isUploading ? "Syncing..." : "Update Home Messaging"}
                    </button>
                </div>
            </form>
        </div>

        {/* SLEEK LIVE PREVIEW */}
        <div className="w-full">
            <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-12 border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none min-h-[600px] flex flex-col relative overflow-hidden">
                <div className="flex items-center justify-between mb-12 relative z-20">
                    <h2 className="text-2xl font-black text-slate-950 dark:text-white uppercase tracking-tight flex items-center gap-4">
                        <Monitor size={32} className="text-indigo-600" /> Typography Preview
                    </h2>
                    <div className="flex items-center gap-3 text-slate-400">
                        <MousePointer2 size={18} />
                        <span className="text-xs font-black uppercase tracking-widest italic">Live Reflection</span>
                    </div>
                </div>

                <div className="flex-1 flex items-center justify-center relative px-16 z-10">
                    <AnimatePresence mode="wait">
                        <motion.div 
                            key={heading + subHeading}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center space-y-12 max-w-4xl relative"
                        >
                            <Quote className="absolute -top-24 -left-24 text-indigo-100/40 dark:text-indigo-900/10" size={240} />
                            
                            <h3 className="text-6xl xl:text-8xl font-black text-slate-950 dark:text-white tracking-tighter leading-[0.9] drop-shadow-2xl">
                                {heading || <span className="opacity-10 italic font-thin">No Heading Sync'd</span>}
                            </h3>
                            
                            <p className="text-2xl xl:text-3xl font-bold text-slate-600 dark:text-slate-300 italic leading-relaxed max-w-3xl mx-auto">
                                {subHeading ? `"${subHeading}"` : <span className="opacity-10 italic">"Narrative context is pending for this portal."</span>}
                            </p>

                            <div className="pt-16 flex items-center justify-center gap-8">
                                <div className="h-[4px] w-24 bg-indigo-700/20 rounded-full"></div>
                                <div className="size-5 rounded-full bg-indigo-700 shadow-[0_0_20px_rgba(79,70,229,0.5)]"></div>
                                <div className="h-[4px] w-24 bg-indigo-700/20 rounded-full"></div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* DECORATIVE ELEMENTS */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-50">
                    <div className="absolute -top-40 -right-40 size-[500px] bg-indigo-50 dark:bg-indigo-900/20 rounded-full blur-[150px]"></div>
                    <div className="absolute -bottom-40 -left-40 size-[500px] bg-slate-50 dark:bg-slate-800/30 rounded-full blur-[150px]"></div>
                </div>

                <div className="mt-auto pt-12 border-t border-slate-100 dark:border-slate-800 text-center relative z-20">
                    <p className="text-sm font-black text-slate-400 uppercase tracking-[0.6em]">Cinematic Brand Strategy Port</p>
                </div>
            </div>
        </div>
      </div>
    </motion.div>
  )
}

export default HeroContent
