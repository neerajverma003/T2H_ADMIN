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
  const [activePage, setActivePage] = useState("home")
  const [heading, setHeading] = useState("")
  const [subHeading, setSubHeading] = useState("")
  const pageOptions = ["home", "about", "domestic", "international", "contact", "blog", "destinations"]

  const { 
    isLoading, 
    fetchVideos, 
    heading: storeHeading, 
    subHeading: storeSubHeading 
  } = useHeroVideoStore()

  useEffect(() => {
    fetchVideos(activePage)
  }, [activePage, fetchVideos])

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
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8 pb-20 font-sans min-h-screen text-slate-900 dark:text-slate-100"
    >
      {/* 1. HEADER HUB & PAGE SWITCHER */}
      <div className="bg-white dark:bg-[#091126]/95 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-indigo-500/25 shadow-xl dark:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.7),0_0_30px_2px_rgba(99,102,241,0.18)] ring-1 ring-slate-900/5 dark:ring-white/5 backdrop-blur-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30 shrink-0">
              <Type size={24} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2 flex-wrap">
                Hero <span className="text-blue-500">Content</span> Lab
              </h1>
              <p className="text-slate-500 dark:text-slate-400 font-semibold mt-0.5 text-xs sm:text-sm">
                Strategic messaging and brand narratives for the main landing portal
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
                className={`px-4 py-2.5 rounded-xl font-bold uppercase tracking-wider text-xs transition-all cursor-pointer whitespace-nowrap ${
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

      {/* 2. MAIN 2-COLUMN LAB (EDITOR & LIVE REFLECTION) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-stretch">
        {/* EDITING PANEL (7 COLS) */}
        <div className="xl:col-span-7">
          <form onSubmit={handleSubmit} className="h-full">
            <div className="bg-white dark:bg-[#091126]/95 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-indigo-500/25 shadow-xl dark:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.7),0_0_30px_2px_rgba(99,102,241,0.18)] ring-1 ring-slate-900/5 dark:ring-white/5 backdrop-blur-xl flex flex-col justify-between h-full space-y-6">
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-5 mb-6">
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-blue-500" />
                    <h3 className="text-xs font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                      Copywriting Lab
                    </h3>
                  </div>
                  <span className="px-3.5 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 rounded-full text-xs font-extrabold uppercase tracking-wider">
                    Active: {activePage}
                  </span>
                </div>

                <div className="space-y-6">
                  {/* Heading Input */}
                  <div>
                    <label className="flex items-center gap-2 text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2.5">
                      <Type size={14} className="text-blue-500" /> Heading Typography
                    </label>
                    <div className="relative group">
                      <input
                        type="text"
                        value={heading}
                        onChange={(e) => setHeading(e.target.value)}
                        placeholder="Enter Majestic Heading..."
                        className="w-full px-5 py-4 bg-slate-50 dark:bg-[#050A17] border border-slate-200 dark:border-slate-800/90 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 rounded-2xl text-lg font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none transition-all shadow-inner"
                      />
                    </div>
                  </div>

                  {/* Subheading Textarea */}
                  <div>
                    <label className="flex items-center gap-2 text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2.5">
                      <FileText size={14} className="text-blue-500" /> Narrative Context
                    </label>
                    <div className="relative group">
                      <textarea
                        value={subHeading}
                        onChange={(e) => setSubHeading(e.target.value)}
                        placeholder="Enter strategic brand narrative..."
                        rows={5}
                        className="w-full px-5 py-4 bg-slate-50 dark:bg-[#050A17] border border-slate-200 dark:border-slate-800/90 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 rounded-2xl text-sm font-medium text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none transition-all leading-relaxed shadow-inner resize-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isUploading}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-70 disabled:cursor-wait"
                >
                  {isUploading ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <Zap size={18} fill="currentColor" />
                  )}
                  <span>{isUploading ? "Synchronizing..." : `Update ${activePage} Messaging`}</span>
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* LIVE PREVIEW (5 COLS) */}
        <div className="xl:col-span-5">
          <div className="bg-white dark:bg-[#091126]/95 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-indigo-500/25 shadow-xl dark:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.7),0_0_30px_2px_rgba(99,102,241,0.18)] ring-1 ring-slate-900/5 dark:ring-white/5 backdrop-blur-xl h-full flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-center justify-between pb-5 border-b border-slate-100 dark:border-slate-800/80 relative z-20">
              <h2 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Monitor size={16} className="text-blue-500" /> Typography Preview
              </h2>
              <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                <MousePointer2 size={13} className="text-blue-500" />
                <span>Live Reflection</span>
              </div>
            </div>

            <div className="flex-1 flex items-center justify-center py-12 relative px-4 z-10">
              <AnimatePresence mode="wait">
                <motion.div 
                  key={heading + subHeading}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className="text-center space-y-6 max-w-lg relative"
                >
                  <Quote className="absolute -top-12 -left-6 text-blue-500/10 dark:text-blue-400/10" size={80} />
                  
                  <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-950 dark:text-white tracking-tight leading-tight">
                    {heading || <span className="opacity-20 italic font-normal">No Heading Sync'd</span>}
                  </h3>
                  
                  <p className="text-sm sm:text-base font-medium text-slate-600 dark:text-slate-300 italic leading-relaxed">
                    {subHeading ? `"${subHeading}"` : <span className="opacity-25 italic">"Narrative context is pending for this portal."</span>}
                  </p>

                  <div className="pt-6 flex items-center justify-center gap-3">
                    <div className="h-0.5 w-12 bg-blue-500/30 rounded-full"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.8)]"></div>
                    <div className="h-0.5 w-12 bg-blue-500/30 rounded-full"></div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="pt-5 border-t border-slate-100 dark:border-slate-800/80 text-center relative z-20">
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.25em]">
                Cinematic Brand Strategy Port
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default HeroContent

