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
const inputStyle = "w-full rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-4 text-slate-900 dark:text-slate-100 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all placeholder:text-slate-400";
const labelStyle = "flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2";

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
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* HEADER */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              <Building className="text-indigo-600" /> CITY HUB
            </h1>
            <p className="text-slate-500 font-medium mt-1">Refining urban locations across destinations</p>
          </div>
          <div className="flex items-center gap-3">
             <div className="bg-slate-50 dark:bg-slate-800 p-1.5 rounded-2xl flex">
               {["domestic", "international"].map((t) => (
                 <button key={t} onClick={() => setTravelType(t)} className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${travelType === t ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-400'}`}>
                   {t}
                 </button>
               ))}
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* SELECTION PANEL */}
        <div className="lg:col-span-4 space-y-8">
           <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none sticky top-24">
              <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                 <Navigation size={16} className="text-indigo-600" /> Selection
              </h2>
              
              <div className="space-y-6">
                 <div>
                    <label className={labelStyle}>Parent State</label>
                    <select value={selectedState} onChange={(e) => setSelectedState(e.target.value)} className={inputStyle}>
                      <option value="">-- Select State --</option>
                      {stateList.map((s) => <option key={s._id} value={s._id}>{s.destination_name}</option>)}
                    </select>
                 </div>

                 <div>
                    <label className={labelStyle}>Modification Mode</label>
                    <select value={selectedCityId} onChange={(e) => setSelectedCityId(e.target.value)} className={inputStyle} disabled={!selectedState}>
                      <option value="">+ Create New City</option>
                      {cityList.map((c) => <option key={c._id} value={c._id}>{c.city_name}</option>)}
                    </select>
                 </div>
              </div>
           </div>
        </div>

        {/* MAIN FORM */}
        <div className="lg:col-span-8 space-y-8">
           <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className={labelStyle}>City Name</label>
                  <input value={cityName} onChange={(e) => setCityName(e.target.value)} placeholder="e.g. Paris, Tokyo, Mumbai" className={`${inputStyle} text-lg font-bold`} />
                </div>
                <div>
                  <label className={labelStyle}><Eye size={14} /> Visibility</label>
                  <select value={visibility} onChange={(e) => setVisibility(e.target.value)} className={inputStyle}>
                    <option value="public">Publicly Visible</option>
                    <option value="private">Internal Use Only</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={labelStyle}><Layers size={14} /> Taxonomy</label>
                <div className="flex flex-wrap gap-3 mt-4">
                  {AVAILABLE_CATEGORIES.map((c) => (
                    <label key={c} className={`flex items-center gap-3 px-6 py-3 rounded-2xl border transition-all cursor-pointer ${categories.includes(c) ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800' : 'border-transparent bg-slate-50 dark:bg-slate-800/50'}`}>
                      <input type="checkbox" value={c} checked={categories.includes(c)} onChange={(e) => setCategories((p) => e.target.checked ? [...p, c] : p.filter((x) => x !== c))} className="accent-indigo-600 size-4" />
                      <span className={`text-xs font-bold uppercase tracking-widest ${categories.includes(c) ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`}>{c}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className={labelStyle}><ImageIcon size={14} /> Visual Media</label>
                <label className="group relative block w-full h-48 rounded-3xl border-2 border-dashed border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 cursor-pointer overflow-hidden transition-all hover:border-indigo-500 flex flex-col items-center justify-center text-slate-400">
                   <UploadCloud size={32} strokeWidth={1.5} />
                   <p className="mt-2 text-[10px] font-black uppercase tracking-widest">{newImageFiles.length > 0 ? `${newImageFiles.length} New Images Added` : 'Upload City Gallery'}</p>
                   <input type="file" multiple accept="image/*" hidden onChange={(e) => setNewImageFiles([...e.target.files])} />
                </label>
              </div>

              <div className="pt-4">
                <button type="submit" disabled={!selectedState || !cityName} className="w-full md:w-auto px-10 bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-xl shadow-indigo-500/30 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                   {isUpdateMode ? <Sparkles size={20} /> : <CheckCircle2 size={20} />}
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
