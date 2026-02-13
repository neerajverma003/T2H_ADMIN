// import { useRef, useState, useEffect } from "react"
// import {
//   Loader2,
//   Video,
//   X,
//   Replace,
//   UploadCloud,
//   Film,
//   MapPin,
//   Eye,
//   Text,
//   Trash2,
//   Play,
// } from "lucide-react"
// import { toast } from "react-toastify"
// import { apiClient } from "../../stores/authStores" // ✅ FIXED

// const styleProps = {
//   inputStyle:
//     "block w-full rounded-lg border-2 border-pink-300 dark:border-pink-800 bg-white dark:bg-slate-900 p-2.5 text-slate-900 dark:text-white shadow focus:border-pink-500 focus:ring-pink-500",
//   labelStyle:
//     "block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1",
//   cardStyle:
//     "bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-lg border-2 border-pink-200 dark:border-pink-800",
//   buttonStyle:
//     "flex items-center justify-center gap-2 rounded-xl bg-pink-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-pink-700 transition",
// }

// const UploadVideoTestimonial = () => {
//   const { cardStyle, labelStyle, inputStyle, buttonStyle } = styleProps

//   const [videoFile, setVideoFile] = useState(null)
//   const [isLoading, setIsLoading] = useState(false)
//   const [testimonials, setTestimonials] = useState([])
//   const [isFetching, setIsFetching] = useState(false)
//   const [deletingId, setDeletingId] = useState(null)

//   const nameRef = useRef()
//   const locationRef = useRef()
//   const visibilityRef = useRef()

//   useEffect(() => {
//     fetchTestimonials()
//   }, [])

//   const fetchTestimonials = async () => {
//     try {
//       setIsFetching(true)
//       const res = await apiClient.get("/admin/testimonial-video")
//       if (res.data.success) setTestimonials(res.data.data || [])
//       else toast.error(res.data.message || "Failed to fetch testimonials")
//     } catch {
//       toast.error("Failed to fetch testimonials")
//     } finally {
//       setIsFetching(false)
//     }
//   }

//   const handleVideoFileChange = (e) => {
//     const file = e.target.files[0]
//     if (file && file.type.startsWith("video/")) setVideoFile(file)
//     else toast.error("Please upload a valid video file")
//   }

//   const handleRemoveVideo = () => {
//     setVideoFile(null)
//     const input = document.getElementById("videoUpload")
//     if (input) input.value = ""
//   }

//   const handleSubmit = async (e) => {
//     e.preventDefault()

//     if (!videoFile) return toast.error("Please select a video")

//     const name = nameRef.current.value.trim()
//     const location = locationRef.current.value.trim()
//     const visibility = visibilityRef.current.value

//     if (!name || !location)
//       return toast.error("Please fill all fields")

//     const fd = new FormData()
//     fd.append("image", videoFile)
//     fd.append("title", name)
//     fd.append("location", location)
//     fd.append("visibility", visibility)

//     try {
//       setIsLoading(true)
//       const res = await apiClient.post("/admin/testimonial-video", fd)
//       if (res.data.success) {
//         toast.success("Honeymoon testimonial uploaded 💕")
//         setVideoFile(null)
//         nameRef.current.value = ""
//         locationRef.current.value = ""
//         visibilityRef.current.value = "public"
//         document.getElementById("videoUpload").value = ""
//         fetchTestimonials()
//       }
//     } catch {
//       toast.error("Upload failed")
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   const handleDeleteTestimonial = async (id) => {
//     if (!window.confirm("Delete this testimonial?")) return
//     try {
//       setDeletingId(id)
//       const res = await apiClient.delete(`/admin/testimonial-video/${id}`)
//       if (res.data.success) {
//         toast.success("Deleted successfully")
//         fetchTestimonials()
//       }
//     } catch {
//       toast.error("Delete failed")
//     } finally {
//       setDeletingId(null)
//     }
//   }

//   return (
//     <div className="min-h-screen bg-pink-50 dark:bg-slate-950 p-6 space-y-8">

//       {/* UPLOAD */}
//       <form onSubmit={handleSubmit} className={cardStyle}>
//         <h1 className="text-2xl font-extrabold mb-6 flex items-center border-b border-pink-300 pb-3 text-pink-700">
//           <Film className="mr-3" /> Upload Honeymoon Testimonial
//         </h1>

//         <div className="space-y-6">

//           <div>
//             <label className={labelStyle}>Video File</label>
//             {videoFile ? (
//               <div className="relative border-2 border-pink-300 rounded-xl bg-black overflow-hidden">
//                 <video
//                   src={URL.createObjectURL(videoFile)}
//                   controls
//                   className="w-full max-h-72 object-contain"
//                 />
//                 <div className="absolute top-2 right-2 flex gap-2">
//                   <label htmlFor="videoUpload" className="bg-black/70 p-2 rounded-full text-white cursor-pointer">
//                     <Replace size={18} />
//                   </label>
//                   <button onClick={handleRemoveVideo} type="button" className="bg-black/70 p-2 rounded-full text-white">
//                     <X size={18} />
//                   </button>
//                 </div>
//               </div>
//             ) : (
//               <label
//                 htmlFor="videoUpload"
//                 className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-pink-400 bg-pink-50 p-10 cursor-pointer hover:bg-pink-100"
//               >
//                 <UploadCloud size={40} className="text-pink-600" />
//                 <p className="font-semibold text-pink-700">Upload Honeymoon Video</p>
//               </label>
//             )}
//             <input id="videoUpload" type="file" hidden accept="video/*" onChange={handleVideoFileChange} />
//           </div>

//           <div>
//             <label className={labelStyle}>Title</label>
//             <input ref={nameRef} className={inputStyle} placeholder="Our Maldives Honeymoon" />
//           </div>

//           <div>
//             <label className={labelStyle}>Location</label>
//             <input ref={locationRef} className={inputStyle} placeholder="Maldives" />
//           </div>

//           <div>
//             <label className={labelStyle}>Visibility</label>
//             <select ref={visibilityRef} defaultValue="public" className={inputStyle}>
//               <option value="public">Public</option>
//               <option value="private">Private</option>
//             </select>
//           </div>
//         </div>

//         <div className="pt-6 mt-6 border-t border-pink-300">
//           <button disabled={!videoFile || isLoading} className={buttonStyle}>
//             {isLoading ? <Loader2 className="animate-spin" /> : "Upload Testimonial"}
//           </button>
//         </div>
//       </form>

//       {/* LIST */}
//       <div className={cardStyle}>
//         <h2 className="text-xl font-bold mb-6 flex items-center text-pink-700">
//           <Play className="mr-2" /> Honeymoon Testimonials
//         </h2>

//         {isFetching ? (
//           <div className="flex justify-center py-10">
//             <Loader2 className="animate-spin text-pink-600" size={32} />
//           </div>
//         ) : testimonials.length === 0 ? (
//           <p className="text-center text-slate-600">No testimonials yet</p>
//         ) : (
//           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {testimonials.map((t) => (
//               <div key={t._id} className="rounded-xl border-2 border-pink-200 overflow-hidden shadow hover:shadow-lg transition">
//                 <video src={t.video_url} muted className="w-full h-48 object-cover" />
//                 <div className="p-4">
//                   <h3 className="font-bold text-pink-700 truncate">{t.title}</h3>
//                   <p className="text-sm text-slate-600 flex items-center gap-1">
//                     <MapPin size={14} /> {t.location}
//                   </p>
//                   <button
//                     onClick={() => handleDeleteTestimonial(t._id)}
//                     disabled={deletingId === t._id}
//                     className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white rounded-lg py-2 font-semibold"
//                   >
//                     {deletingId === t._id ? "Deleting..." : "Delete"}
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }

// export default UploadVideoTestimonial

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
} from "lucide-react"
import { toast } from "react-toastify"
import { apiClient } from "../../stores/authStores"

const styleProps = {
  inputStyle:
    "block w-full rounded-xl border border-blue-300/60 dark:border-blue-700 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md p-3 text-slate-800 dark:text-white shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-400 transition",

  labelStyle:
    "block text-sm font-semibold text-blue-700 dark:text-blue-300 mb-2 tracking-wide",

  cardStyle:
    "bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-blue-200/60 dark:border-blue-800/50",

  buttonStyle:
    "flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 via-indigo-500 to-sky-500 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:scale-[1.02] hover:shadow-blue-300/40 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed",
}

const UploadVideoTestimonial = () => {
  const { cardStyle, labelStyle, inputStyle, buttonStyle } = styleProps

  const [videoFile, setVideoFile] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [testimonials, setTestimonials] = useState([])
  const [isFetching, setIsFetching] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  const nameRef = useRef()
  const locationRef = useRef()
  const visibilityRef = useRef()

  useEffect(() => {
    fetchTestimonials()
  }, [])

  const fetchTestimonials = async () => {
    try {
      setIsFetching(true)
      const res = await apiClient.get("/admin/testimonial-video")
      if (res.data.success) setTestimonials(res.data.data || [])
      else toast.error(res.data.message || "Failed to fetch testimonials")
    } catch {
      toast.error("Failed to fetch testimonials")
    } finally {
      setIsFetching(false)
    }
  }

  const handleVideoFileChange = (e) => {
    const file = e.target.files[0]
    if (file && file.type.startsWith("video/")) setVideoFile(file)
    else toast.error("Please upload a valid video file")
  }

  const handleRemoveVideo = () => {
    setVideoFile(null)
    const input = document.getElementById("videoUpload")
    if (input) input.value = ""
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!videoFile) return toast.error("Please select a video")

    const name = nameRef.current.value.trim()
    const location = locationRef.current.value.trim()
    const visibility = visibilityRef.current.value

    if (!name || !location)
      return toast.error("Please fill all fields")

    const fd = new FormData()
    fd.append("image", videoFile)
    fd.append("title", name)
    fd.append("location", location)
    fd.append("visibility", visibility)

    try {
      setIsLoading(true)
      const res = await apiClient.post("/admin/testimonial-video", fd)
      if (res.data.success) {
        toast.success("Honeymoon testimonial uploaded 💙")
        setVideoFile(null)
        nameRef.current.value = ""
        locationRef.current.value = ""
        visibilityRef.current.value = "public"
        document.getElementById("videoUpload").value = ""
        fetchTestimonials()
      }
    } catch {
      toast.error("Upload failed")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteTestimonial = async (id) => {
    if (!window.confirm("Delete this testimonial?")) return
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-6 space-y-10">

      {/* UPLOAD */}
      <form onSubmit={handleSubmit} className={cardStyle}>
        <h1 className="text-3xl font-extrabold mb-8 flex items-center border-b border-blue-300/50 pb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          <Film className="mr-3 text-blue-500" /> Upload Honeymoon Testimonial
        </h1>

        <div className="space-y-6">

          <div>
            <label className={labelStyle}>Video File</label>
            {videoFile ? (
              <div className="relative border border-blue-300/60 rounded-2xl bg-black overflow-hidden shadow-lg">
                <video
                  src={URL.createObjectURL(videoFile)}
                  controls
                  className="w-full max-h-72 object-contain"
                />
                <div className="absolute top-3 right-3 flex gap-2">
                  <label htmlFor="videoUpload" className="bg-white/20 backdrop-blur-md p-2 rounded-full text-white cursor-pointer hover:scale-110 transition">
                    <Replace size={18} />
                  </label>
                  <button onClick={handleRemoveVideo} type="button" className="bg-white/20 backdrop-blur-md p-2 rounded-full text-white hover:scale-110 transition">
                    <X size={18} />
                  </button>
                </div>
              </div>
            ) : (
              <label
                htmlFor="videoUpload"
                className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-blue-400 bg-blue-50/60 dark:bg-slate-800/40 p-12 cursor-pointer hover:bg-blue-100 dark:hover:bg-slate-800 transition"
              >
                <UploadCloud size={44} className="text-blue-500" />
                <p className="font-semibold text-blue-700 dark:text-blue-300">
                  Upload Honeymoon Video
                </p>
              </label>
            )}
            <input id="videoUpload" type="file" hidden accept="video/*" onChange={handleVideoFileChange} />
          </div>

          <div>
            <label className={labelStyle}>Title</label>
            <input ref={nameRef} className={inputStyle} placeholder="Our Maldives Honeymoon" />
          </div>

          <div>
            <label className={labelStyle}>Location</label>
            <input ref={locationRef} className={inputStyle} placeholder="Maldives" />
          </div>

          <div>
            <label className={labelStyle}>Visibility</label>
            <select ref={visibilityRef} defaultValue="public" className={inputStyle}>
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </div>
        </div>

        <div className="pt-8 mt-8 border-t border-blue-300/40">
          <button disabled={!videoFile || isLoading} className={buttonStyle}>
            {isLoading ? <Loader2 className="animate-spin" /> : "Upload Testimonial"}
          </button>
        </div>
      </form>

      {/* LIST */}
      <div className={cardStyle}>
        <h2 className="text-2xl font-bold mb-8 flex items-center text-blue-700 dark:text-blue-300">
          <Play className="mr-3 text-blue-500" /> Honeymoon Testimonials
        </h2>

        {isFetching ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-blue-500" size={32} />
          </div>
        ) : testimonials.length === 0 ? (
          <p className="text-center text-slate-600 dark:text-slate-400">
            No testimonials yet
          </p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((t) => (
              <div key={t._id} className="rounded-2xl border border-blue-200/60 dark:border-blue-800/50 overflow-hidden shadow-lg hover:shadow-blue-300/40 transition-all duration-300 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md">
                <video src={t.video_url} muted className="w-full h-48 object-cover" />
                <div className="p-5">
                  <h3 className="font-bold text-blue-700 dark:text-blue-300 truncate text-lg">
                    {t.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-1 mt-1">
                    <MapPin size={14} /> {t.location}
                  </p>
                  <button
                    onClick={() => handleDeleteTestimonial(t._id)}
                    disabled={deletingId === t._id}
                    className="mt-5 w-full bg-gradient-to-r from-red-500 to-rose-600 hover:opacity-90 text-white rounded-xl py-2.5 font-semibold transition disabled:opacity-60"
                  >
                    {deletingId === t._id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default UploadVideoTestimonial
