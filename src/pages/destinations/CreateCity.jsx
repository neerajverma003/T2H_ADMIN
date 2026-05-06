import { useState, useEffect } from "react"
import { toast } from "react-toastify"
import {
  MapPin,
  Globe,
  UploadCloud,
  X,
  Loader2,
  Image as ImageIcon,
  Sparkles,
  Navigation,
  Eye,
  Layers,
  Building,
  CheckCircle2
} from "lucide-react"
import { usePlaceStore } from "../../stores/usePlaceStore"
import { apiClient } from "../../stores/authStores"
import { motion } from "framer-motion"

const AVAILABLE_CATEGORIES = ["Trending", "Exclusive", "Popular", "New"]
const inputStyle = "w-full rounded-[1.5rem] border-2 border-transparent bg-slate-50 dark:bg-slate-800/50 p-5 text-slate-950 dark:text-white text-lg font-black focus:border-indigo-600/20 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:text-slate-400";
const labelStyle = "flex items-center gap-2 text-xs font-black text-slate-950 dark:text-slate-200 uppercase tracking-[0.3em] mb-3 ml-1";

const CreateCity = () => {
  const [travelType, setTravelType] = useState("domestic")
  const [selectedState, setSelectedState] = useState("")
  const [cityList, setCityList] = useState([])
  const [isCityListLoading, setIsCityListLoading] = useState(false)
  const [selectedCityId, setSelectedCityId] = useState("")

  const [cityName, setCityName] = useState("")
  const [categories, setCategories] = useState([])
  const [visibility, setVisibility] = useState("public")
  const [newImageFiles, setNewImageFiles] = useState([])
  const [existingImages, setExistingImages] = useState([])

  const isUpdateMode = Boolean(selectedCityId)

  const {
    destinationList: stateList,
    isListLoading: isStateListLoading,
    fetchDestinationList,
  } = usePlaceStore()

  useEffect(() => {
    fetchDestinationList(travelType)
  }, [travelType, fetchDestinationList])

  useEffect(() => {
    if (!selectedState) return setCityList([])

    const fetchCities = async () => {
      setIsCityListLoading(true)
      try {
        const res = await apiClient.get(`/admin/state/${selectedState}`)
        setCityList(res.data?.citiesData || [])
      } catch {
        toast.error("Failed to fetch cities")
      } finally {
        setIsCityListLoading(false)
      }
    }

    fetchCities()
  }, [selectedState])

  useEffect(() => {
    if (!selectedCityId) {
       setCityName(""); setCategories([]); setVisibility("public"); setExistingImages([]); setNewImageFiles([]);
       return;
    }

    const fetchCity = async () => {
      try {
        const res = await apiClient.get(`/admin/city/${selectedCityId}`)
        const c = res.data?.cityData
        if (!c) return
        setCityName(c.city_name); setCategories(c.city_category || []); setVisibility(c.visibility); setExistingImages(c.city_image || []); setNewImageFiles([]);
      } catch {
        toast.error("Failed to load city")
      }
    }
    fetchCity()
  }, [selectedCityId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!cityName || !selectedState) return toast.error("Please fill required fields")

    try {
      const cityFolder = `cities/${cityName.replace(/\s+/g, '_')}`;
      const uploadedImageKeys = [];

      if (newImageFiles && newImageFiles.length > 0) {
        for (const file of newImageFiles) {
          const presignedRes = await apiClient.post("/admin/generate-presigned-url", {
            fileName: file.name, fileType: file.type, folder: cityFolder
          });
          const { uploadUrl, key } = presignedRes.data;
          await fetch(uploadUrl, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
          uploadedImageKeys.push(key);
        }
      }

      const payload = { city_name: cityName, visibility: visibility, city_category: categories, images: uploadedImageKeys, id: selectedState };

      if (isUpdateMode) {
        payload.existingImages = existingImages;
        await apiClient.patch(`/admin/city/${selectedCityId}`, payload);
        toast.success("City updated successfully!");
      } else {
        await apiClient.post("/admin/city", payload);
        toast.success("City created successfully!");
      }

      setCityName(""); setCategories([]); setNewImageFiles([]); setExistingImages([]); setSelectedCityId("");
    } catch {
      toast.error("Failed to save city")
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-full mx-auto space-y-10 pb-16">
      {/* HEADER */}
      <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-12 border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <h1 className="text-4xl font-black text-slate-950 dark:text-white tracking-tight flex items-center gap-5">
              <Building className="text-indigo-700" size={40} /> CITY HUB
            </h1>
            <p className="text-slate-600 dark:text-slate-400 font-bold mt-2 text-xl italic">Refining urban locations across destinations</p>
          </div>
          <div className="flex items-center gap-4">
             <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-[1.5rem] flex shadow-inner">
               {["domestic", "international"].map((t) => (
                 <button 
                  key={t} 
                  onClick={() => setTravelType(t)} 
                  className={`px-8 py-3 rounded-[1.25rem] text-sm font-black uppercase tracking-[0.15em] transition-all ${travelType === t ? 'bg-indigo-700 text-white shadow-xl shadow-indigo-500/40' : 'text-slate-500 hover:text-slate-900'}`}
                 >
                   {t}
                 </button>
               ))}
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* SELECTION PANEL */}
        <div className="lg:col-span-4 space-y-10">
           <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none sticky top-24">
              <h2 className="text-xl font-black text-slate-950 dark:text-white uppercase tracking-tight mb-8 flex items-center gap-3">
                 <Navigation size={24} className="text-indigo-700" /> Selection
              </h2>
              
              <div className="space-y-8">
                 <div>
                    <label className={labelStyle}>Parent Destination</label>
                    <select value={selectedState} onChange={(e) => setSelectedState(e.target.value)} className={inputStyle}>
                      <option value="">-- Choose Target --</option>
                      {stateList.map((s) => <option key={s._id} value={s._id}>{s.destination_name}</option>)}
                    </select>
                 </div>

                 <div>
                    <label className={labelStyle}>Modification Mode</label>
                    <select value={selectedCityId} onChange={(e) => setSelectedCityId(e.target.value)} className={inputStyle} disabled={!selectedState}>
                      <option value="">+ Register New City</option>
                      {cityList.map((c) => <option key={c._id} value={c._id}>{c.city_name}</option>)}
                    </select>
                 </div>
              </div>
           </div>
        </div>

        {/* MAIN FORM */}
        <div className="lg:col-span-8 space-y-10">
           <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-12 border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div>
                  <label className={labelStyle}>City Identity</label>
                  <input value={cityName} onChange={(e) => setCityName(e.target.value)} placeholder="e.g. Paris, Tokyo, Mumbai" className={inputStyle} />
                </div>
                <div>
                  <label className={labelStyle}><Eye size={18} className="text-indigo-700" /> Visibility</label>
                  <select value={visibility} onChange={(e) => setVisibility(e.target.value)} className={inputStyle}>
                    <option value="public">Publicly Visible</option>
                    <option value="private">Internal Use Only</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={labelStyle}><Layers size={18} className="text-indigo-700" /> Taxonomy</label>
                <div className="flex flex-wrap gap-4 mt-6">
                  {AVAILABLE_CATEGORIES.map((c) => (
                    <label key={c} className={`flex items-center gap-4 px-8 py-4 rounded-[1.5rem] border-2 transition-all cursor-pointer ${categories.includes(c) ? 'bg-indigo-700 border-indigo-700 text-white shadow-xl shadow-indigo-500/30' : 'border-slate-100 bg-slate-50 dark:bg-slate-800/50 dark:border-slate-800'}`}>
                      <input type="checkbox" value={c} checked={categories.includes(c)} onChange={(e) => setCategories((p) => e.target.checked ? [...p, c] : p.filter((x) => x !== c))} className="accent-white size-5" />
                      <span className="text-sm font-black uppercase tracking-[0.2em]">{c}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className={labelStyle}><ImageIcon size={18} className="text-indigo-700" /> Visual Media</label>
                <label className="group relative block w-full h-56 rounded-[2rem] border-4 border-dashed border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 cursor-pointer overflow-hidden transition-all hover:border-indigo-700 flex flex-col items-center justify-center text-slate-400">
                   <div className="size-20 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform mb-4">
                      <UploadCloud size={40} className="text-indigo-700" />
                   </div>
                   <p className="text-xs font-black uppercase tracking-[0.3em]">{newImageFiles.length > 0 ? `${newImageFiles.length} High-Res Assets Ready` : 'Upload City Gallery'}</p>
                   <input type="file" multiple accept="image/*" hidden onChange={(e) => setNewImageFiles([...e.target.files])} />
                </label>
              </div>

              <div className="pt-6">
                <button type="submit" disabled={!selectedState || !cityName} className="w-full md:w-auto px-14 py-5 bg-indigo-700 text-white rounded-[1.5rem] font-black text-lg shadow-2xl shadow-indigo-500/40 hover:bg-indigo-800 transition-all flex items-center justify-center gap-4 disabled:opacity-50 uppercase tracking-widest">
                   {isUpdateMode ? <Sparkles size={24} /> : <CheckCircle2 size={24} />}
                   {isUpdateMode ? "Push City Updates" : "Register New City"}
                </button>
              </div>
           </form>
        </div>
      </div>
    </motion.div>
  )
}

export default CreateCity
