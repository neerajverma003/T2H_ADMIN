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

const inputStyle = "w-full rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-4 text-lg font-medium focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-white transition-all placeholder:text-slate-500";
const labelStyle = "flex items-center gap-2 text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1";

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
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-full mx-auto space-y-6 pb-12">
      {/* HEADER */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-slate-950 dark:text-white tracking-tight flex items-center gap-4">
              <Navigation className="text-indigo-600" size={28} /> NEW DESTINATION
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-bold mt-1 text-sm italic">Expanding the horizons of Trip to Honeymoon</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-slate-50 dark:bg-slate-800 p-1.5 rounded-2xl flex">
              {["domestic", "international"].map((t) => (
                <button key={t} onClick={() => setData({ ...data, type: t })} className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${data.type === t ? 'bg-white dark:bg-slate-700 text-indigo-700 shadow-md' : 'text-slate-400'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-12">
        {/* CORE DETAILS (FULL WIDTH) */}
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none">
          <div className="flex items-center gap-4 mb-10">
            <div className="p-3 bg-indigo-700 rounded-2xl text-white shadow-xl shadow-indigo-500/30"><MapPin size={24} /></div>
            <h2 className="text-lg font-black text-slate-950 dark:text-white uppercase tracking-tight">Destination Identity</h2>
          </div>

          <div className="space-y-8">
            <div>
              <label className={labelStyle}>Global Location Name</label>
              <input name="destination_name" value={data.destination_name} onChange={handleChange} placeholder="e.g. Maldives, Switzerland, Bali" className={inputStyle} />
            </div>
            <div className="space-y-8">
              <div>
                <label className={labelStyle}><Calendar size={16} className="text-indigo-600" /> Optimal Visitation Period</label>
                <input name="best_time" value={data.best_time} onChange={handleChange} placeholder="e.g. Oct - March" className={inputStyle} />
              </div>
              <div>
                <label className={labelStyle}><Clock size={16} className="text-indigo-600" /> Recommended Itinerary Length</label>
                <input name="ideal_duration" value={data.ideal_duration} onChange={handleChange} placeholder="e.g. 5-7 Days" className={inputStyle} />
              </div>
            </div>
          </div>
        </div>

        {/* MEDIA & ASSETS (FULL WIDTH) */}
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none">
          <div className="flex items-center gap-4 mb-10">
            <div className="p-3 bg-indigo-700 rounded-2xl text-white shadow-xl shadow-indigo-500/30"><ImageIcon size={24} /></div>
            <h2 className="text-lg font-black text-slate-950 dark:text-white uppercase tracking-tight">Visual Content Gallery</h2>
          </div>
          <label className="group relative block w-full aspect-[21/7] rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 cursor-pointer overflow-hidden transition-all hover:border-indigo-600 flex flex-col items-center justify-center text-slate-400">
            <div className="size-12 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center text-indigo-600 mb-4 shadow-lg transition-transform group-hover:scale-110">
              <ImageIcon size={28} strokeWidth={1.5} />
            </div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-slate-950 dark:text-white">{data.image.length > 0 ? `${data.image.length} Assets Selected` : 'Deploy Visual Assets'}</p>
            <p className="text-[10px] font-bold text-slate-500 mt-2 uppercase tracking-widest italic opacity-70">High-Resolution Multi-Upload Supported</p>
            <input type="file" name="image" multiple accept="image/*" onChange={handleChange} hidden />
          </label>
        </div>

        {/* CATEGORIES & PUBLISHING (FULL WIDTH) */}
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none">
          <div className="flex items-center gap-4 mb-10">
            <div className="p-3 bg-indigo-700 rounded-2xl text-white shadow-xl shadow-indigo-500/30"><Layers size={24} /></div>
            <h2 className="text-lg font-black text-slate-950 dark:text-white uppercase tracking-tight">Classification & Tags</h2>
          </div>
          <div className="flex flex-wrap gap-3 mb-8">
            {["trending", "TopMost Destination", "exclusive", "weekend", "home", "honeymoon"].map((opt) => (
              <label key={opt} className={`flex items-center gap-3 px-5 py-3 rounded-xl border-2 transition-all cursor-pointer ${data.destination_type.includes(opt) ? 'bg-indigo-50 border-indigo-700 dark:bg-indigo-900/20 shadow-lg' : 'border-transparent bg-slate-50 dark:bg-slate-800/50 hover:border-slate-200'}`}>
                <input type="checkbox" name="destination_type" value={opt} checked={data.destination_type.includes(opt)} onChange={handleChange} className="accent-indigo-700 size-4 rounded" />
                <span className={`text-xs font-bold uppercase tracking-tight ${data.destination_type.includes(opt) ? 'text-indigo-700 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-300'}`}>{opt}</span>
              </label>
            ))}
          </div>

          <button type="submit" disabled={isLoading} className="w-full bg-indigo-700 text-white py-6 rounded-[1.5rem] font-black text-lg uppercase tracking-widest shadow-2xl shadow-indigo-500/40 hover:bg-indigo-800 transition-all flex items-center justify-center gap-5 disabled:opacity-50 active:scale-[0.99]">
            {isLoading ? <Loader2 className="animate-spin" size={32} /> : <Heart size={32} />}
            {isLoading ? "Synchronizing Asset Hub..." : "INITIALIZE DESTINATION"}
          </button>
        </div>
      </form>

      {/* DIRECTORY LIST */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
        <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-950 dark:text-white uppercase tracking-wider flex items-center gap-3">
            <Sparkles size={24} className="text-indigo-700" /> Current Directory
          </h2>
          <div className="px-4 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 rounded-full text-xs font-black uppercase tracking-widest">
            {data.type}
          </div>
        </div>

        {isListLoading ? (
          <div className="flex justify-center py-24"><Loader2 className="animate-spin text-indigo-600" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 dark:bg-slate-800">
                <tr>
                  <th className="px-8 py-6 text-left font-black text-slate-950 dark:text-slate-200 uppercase tracking-[0.3em] text-xs">Location Name</th>
                  <th className="px-8 py-6 text-left font-black text-slate-950 dark:text-slate-200 uppercase tracking-[0.3em] text-xs">Classification</th>
                  <th className="px-8 py-6 text-right font-black text-slate-950 dark:text-slate-200 uppercase tracking-[0.3em] text-xs">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {destinationList.map((dest) => (
                  <tr key={dest._id} className="group hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-colors">
                    <td className="px-8 py-6 font-black text-slate-950 dark:text-white text-base">{dest.destination_name}</td>
                    <td className="px-8 py-5">
                      <div className="flex flex-wrap gap-2">
                        {(Array.isArray(dest.destination_type) ? dest.destination_type : []).map(tag => (
                          <span key={tag} className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-[11px] font-black uppercase tracking-[0.1em] text-slate-900 dark:text-slate-100 shadow-sm">{tag}</span>
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
