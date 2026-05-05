import { useState, useEffect, useRef } from "react"
import { toast } from "react-toastify"
import {
  MapPin,
  Globe,
  Loader2,
  Pencil,
  Trash2,
  Image as ImageIcon,
  Heart,
  Sparkles,
  Navigation,
  Clock,
  Calendar,
  Layers,
  ArrowRight
} from "lucide-react"
import { usePlaceStore } from "../../stores/usePlaceStore"
import { useNavigate } from "react-router-dom"
import { apiClient } from "../../stores/authStores"
import axios from "axios"
import { motion } from "framer-motion"

const inputStyle = "w-full rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-4 text-slate-900 dark:text-slate-100 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all placeholder:text-slate-400";
const labelStyle = "flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2";

const CreateDestination = () => {
  const [data, setData] = useState({
    type: "domestic",
    destination_name: "",
    image: [],
    destination_type: [],
    best_time: "",
    ideal_duration: "",
  })

  const [isLoading, setIsLoading] = useState(false)
  const { createDestination, fetchDestinationList, destinationList, isListLoading } = usePlaceStore()
  const navigate = useNavigate()
  const typeRef = useRef(data.type)

  useEffect(() => {
    fetchDestinationList(data.type)
    typeRef.current = data.type
  }, [data.type, fetchDestinationList])

  const handleChange = (e) => {
    const { name, value, files, checked } = e.target
    if (name === "image") {
      setData({ ...data, image: Array.from(files) })
    } else if (name === "destination_type") {
      setData({
        ...data,
        destination_type: checked
          ? [...data.destination_type, value]
          : data.destination_type.filter((i) => i !== value),
      })
    } else {
      setData({ ...data, [name]: value })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!data.destination_name.trim()) return toast.error("Please enter a destination name")
    if (data.image.length === 0) return toast.error("Please select at least one image.")
    
    setIsLoading(true)
    try {
      const imageUrls = []
      const capitalizedType = data.type.charAt(0).toUpperCase() + data.type.slice(1);
      const destinationFolder = `destination/${capitalizedType}/${data.destination_name.replace(/\s+/g, '_')}`;

      for (const img of data.image) {
        const presignedRes = await apiClient.post("/admin/generate-presigned-url", {
          fileName: img.name, fileType: img.type, folder: destinationFolder
        })
        const { uploadUrl, key } = presignedRes.data
        await axios.put(uploadUrl, img, { headers: { "Content-Type": img.type } })
        imageUrls.push(key)
      }

      const payload = {
        type: data.type,
        destination_name: data.destination_name,
        destination_type: data.destination_type,
        title_image: imageUrls,
        best_time: data.best_time,
        ideal_duration: data.ideal_duration
      }

      const result = await createDestination(payload)
      if (result) {
        toast.success(`Destination created successfully!`);
        setData({ type: "domestic", destination_name: "", destination_type: [], image: [], best_time: "", ideal_duration: "" })
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = "";
      }
    } catch (err) {
      toast.error(err.response?.data?.msg || "Failed to save destination.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this destination?")) {
      await usePlaceStore.getState().deleteDestination(id)
      fetchDestinationList(typeRef.current)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* HEADER */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              <Navigation className="text-indigo-600" /> NEW DESTINATION
            </h1>
            <p className="text-slate-500 font-medium mt-1">Expanding the horizons of Trip to Honeymoon</p>
          </div>
          <div className="flex items-center gap-3">
             <div className="bg-slate-50 dark:bg-slate-800 p-1.5 rounded-2xl flex">
               {["domestic", "international"].map((t) => (
                 <button key={t} onClick={() => setData({...data, type: t})} className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${data.type === t ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-400'}`}>
                   {t}
                 </button>
               ))}
             </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          {/* CORE DETAILS */}
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
            <label className={labelStyle}><MapPin size={14} /> Destination Name</label>
            <input name="destination_name" value={data.destination_name} onChange={handleChange} placeholder="e.g. Maldives, Switzerland, Bali" className={`${inputStyle} text-xl font-bold h-16`} />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
               <div>
                 <label className={labelStyle}><Calendar size={14} /> Best Time</label>
                 <input name="best_time" value={data.best_time} onChange={handleChange} placeholder="e.g. Oct - March" className={inputStyle} />
               </div>
               <div>
                 <label className={labelStyle}><Clock size={14} /> Ideal Duration</label>
                 <input name="ideal_duration" value={data.ideal_duration} onChange={handleChange} placeholder="e.g. 5-7 Days" className={inputStyle} />
               </div>
            </div>
          </div>

          {/* MEDIA */}
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
            <label className={labelStyle}><ImageIcon size={14} /> Gallery Photos</label>
            <label className="group relative block w-full h-40 rounded-3xl border-2 border-dashed border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 cursor-pointer overflow-hidden transition-all hover:border-indigo-500 flex flex-col items-center justify-center text-slate-400">
               <ImageIcon size={32} strokeWidth={1.5} />
               <p className="mt-2 text-[10px] font-black uppercase tracking-widest">{data.image.length > 0 ? `${data.image.length} Files Selected` : 'Click to Upload Images'}</p>
               <input type="file" name="image" multiple accept="image/*" onChange={handleChange} hidden />
            </label>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
          {/* CATEGORIES */}
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
            <label className={labelStyle}><Layers size={14} /> Category Tags</label>
            <div className="grid grid-cols-1 gap-3">
              {["trending", "TopMost Destination", "exclusive", "weekend", "home", "honeymoon"].map((opt) => (
                <label key={opt} className={`flex items-center gap-3 p-3 rounded-2xl border transition-all cursor-pointer ${data.destination_type.includes(opt) ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800' : 'border-transparent bg-slate-50 dark:bg-slate-800/50'}`}>
                  <input type="checkbox" name="destination_type" value={opt} checked={data.destination_type.includes(opt)} onChange={handleChange} className="accent-indigo-600 size-4 rounded" />
                  <span className={`text-xs font-bold capitalize ${data.destination_type.includes(opt) ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`}>{opt}</span>
                </label>
              ))}
            </div>
          </div>

          <button type="submit" disabled={isLoading} className="w-full bg-indigo-600 text-white py-5 rounded-[2rem] font-bold shadow-xl shadow-indigo-500/30 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50">
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Heart size={20} />}
            {isLoading ? "Saving..." : "Create Destination"}
          </button>
        </div>
      </form>

      {/* DIRECTORY LIST */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
        <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
           <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
             <Sparkles size={20} className="text-indigo-600" /> Current Directory
           </h2>
           <div className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-widest">
              {data.type}
           </div>
        </div>
        
        {isListLoading ? (
          <div className="flex justify-center py-24"><Loader2 className="animate-spin text-indigo-600" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th className="px-8 py-5 text-left font-bold text-slate-400 uppercase tracking-widest text-[10px]">Location Name</th>
                  <th className="px-8 py-5 text-left font-bold text-slate-400 uppercase tracking-widest text-[10px]">Classification</th>
                  <th className="px-8 py-5 text-right font-bold text-slate-400 uppercase tracking-widest text-[10px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {destinationList.map((dest) => (
                  <tr key={dest._id} className="group hover:bg-indigo-50/30 dark:hover:bg-indigo-900/5 transition-colors">
                    <td className="px-8 py-5 font-bold text-slate-900 dark:text-white">{dest.destination_name}</td>
                    <td className="px-8 py-5">
                       <div className="flex flex-wrap gap-2">
                          {(Array.isArray(dest.destination_type) ? dest.destination_type : []).map(tag => (
                            <span key={tag} className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-400">{tag}</span>
                          ))}
                       </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                       <button onClick={() => navigate(`/destinations/edit/${dest._id}`)} className="p-2 text-slate-400 hover:text-indigo-600 transition-all"><Pencil size={18} /></button>
                       <button onClick={() => handleDelete(dest._id)} className="p-2 text-slate-400 hover:text-red-500 transition-all ml-2"><Trash2 size={18} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default CreateDestination
