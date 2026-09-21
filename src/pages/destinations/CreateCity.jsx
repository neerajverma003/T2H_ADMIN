import { useState, useEffect, useMemo, useRef } from "react"
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
  Building2,
  CheckCircle2,
  Search,
  Trash2,
  Pencil,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ArrowUpDown
} from "lucide-react"
import { usePlaceStore } from "../../stores/usePlaceStore"
import { apiClient } from "../../stores/authStores"
import { convertImageFileToWebP } from "../../utils/imageConverter"
import { motion } from "framer-motion"

const AVAILABLE_CATEGORIES = ["Trending", "Exclusive", "Popular", "New"]
const cardStyle = "bg-white dark:bg-[#091126]/95 rounded-3xl p-7 md:p-9 border border-slate-200/90 dark:border-indigo-500/25 shadow-xl dark:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.7),0_0_30px_2px_rgba(99,102,241,0.18)] ring-1 ring-slate-900/5 dark:ring-white/5 backdrop-blur-xl space-y-7 transition-all"
const inputStyle = "w-full rounded-2xl border border-slate-200 dark:border-slate-800/90 bg-slate-50/90 dark:bg-[#050A17] p-4 text-sm font-semibold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-[#050A17] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 placeholder:font-normal shadow-inner hover:border-indigo-500/40"
const labelStyle = "flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2.5 ml-0.5"

const CreateCity = () => {
  const [travelType, setTravelType] = useState("domestic")
  const [selectedState, setSelectedState] = useState("")
  const [allCitiesList, setAllCitiesList] = useState([])
  const [isCityListLoading, setIsCityListLoading] = useState(false)
  const [selectedCityId, setSelectedCityId] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(9)
  const [sortOrder, setSortOrder] = useState("newest")
  const formRef = useRef(null)

  const [cityName, setCityName] = useState("")
  const [categories, setCategories] = useState([])
  const [visibility, setVisibility] = useState("public")
  const [newImageFiles, setNewImageFiles] = useState([])
  const [existingImages, setExistingImages] = useState([])
  const [counts, setCounts] = useState({ domestic: 0, international: 0 })
  const [countsLoading, setCountsLoading] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const isUpdateMode = Boolean(selectedCityId)

  const {
    destinationList: stateList,
    fetchDestinationList,
  } = usePlaceStore()

  const fetchCounts = async () => {
    try {
      setCountsLoading(true)
      const res = await apiClient.get("/admin/city-counts")
      if (res.data?.success && res.data?.counts) {
        setCounts({
          domestic: res.data.counts.domestic ?? 0,
          international: res.data.counts.international ?? 0
        })
      }
    } catch (err) {
      console.error("Failed to load city counts:", err)
    } finally {
      setCountsLoading(false)
    }
  }

  const fetchAllCities = async () => {
    try {
      setIsCityListLoading(true)
      const res = await apiClient.get(`/admin/all-cities?type=${travelType}`)
      if (res.data?.success) {
        setAllCitiesList(res.data.cities || [])
      }
    } catch (err) {
      console.error("Failed to fetch all cities:", err)
    } finally {
      setIsCityListLoading(false)
    }
  }

  useEffect(() => {
    fetchCounts()
  }, [])

  useEffect(() => {
    fetchDestinationList(travelType)
    fetchAllCities()
    setSelectedCityId("")
    setSelectedState("")
  }, [travelType])

  // Filter dropdown cities by selected parent destination if any
  const dropdownCities = useMemo(() => {
    if (selectedState) {
      return allCitiesList.filter(
        (c) => (c.state?._id || c.state) === selectedState
      )
    }
    return allCitiesList
  }, [allCitiesList, selectedState])

  // Sort cities by newest / oldest
  const sortedCities = useMemo(() => {
    return [...allCitiesList].sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0
      let diff = 0
      if (timeA && timeB && timeA !== timeB) {
        diff = timeB - timeA
      } else {
        diff = String(b._id || "").localeCompare(String(a._id || ""))
      }
      return sortOrder === "newest" ? diff : -diff
    })
  }, [allCitiesList, sortOrder])

  // Filter directory list by search query
  const filteredCities = useMemo(() => {
    if (!searchQuery.trim()) return sortedCities
    const q = searchQuery.toLowerCase().trim()
    return sortedCities.filter(
      (c) =>
        c.city_name?.toLowerCase().includes(q) ||
        c.state?.destination_name?.toLowerCase().includes(q) ||
        (Array.isArray(c.city_category) &&
          c.city_category.some((cat) => cat && cat.toLowerCase().includes(q)))
    )
  }, [sortedCities, searchQuery])

  // Reset pagination on filter/search change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, travelType, sortOrder, itemsPerPage])

  // Pagination calculation
  const totalItems = filteredCities.length
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage))
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedCities = filteredCities.slice(startIndex, startIndex + itemsPerPage)

  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }
    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, "...", totalPages]
    }
    if (currentPage >= totalPages - 3) {
      return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
    }
    return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages]
  }

  // Load single city details when selectedCityId changes
  useEffect(() => {
    if (!selectedCityId) {
      setCityName("")
      setCategories([])
      setVisibility("public")
      setExistingImages([])
      setNewImageFiles([])
      return
    }

    const fetchCity = async () => {
      try {
        const res = await apiClient.get(`/admin/city/${selectedCityId}`)
        const c = res.data?.cityData
        if (!c) return
        setCityName(c.city_name || "")
        setCategories(c.city_category || [])
        setVisibility(c.visibility ? c.visibility.toLowerCase() : "public")
        setExistingImages(c.city_image || [])
        setNewImageFiles([])
        if (c.state && (c.state._id || c.state)) {
          setSelectedState(c.state._id || c.state)
        }
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
      setIsLoading(true)
      const cityFolder = `cities/${cityName.replace(/\s+/g, '_')}`
      const uploadedImageKeys = []

      if (newImageFiles && newImageFiles.length > 0) {
        for (const file of newImageFiles) {
          const uploadImage = await convertImageFileToWebP(file)
          const presignedRes = await apiClient.post("/admin/generate-presigned-url", {
            fileName: uploadImage.name,
            fileType: uploadImage.type,
            folder: cityFolder
          })
          const { uploadUrl, key } = presignedRes.data
          await fetch(uploadUrl, {
            method: "PUT",
            body: uploadImage,
            headers: { "Content-Type": uploadImage.type }
          })
          uploadedImageKeys.push(key)
        }
      }

      const payload = {
        city_name: cityName,
        visibility: visibility,
        city_category: categories,
        images: uploadedImageKeys,
        id: selectedState
      }

      if (isUpdateMode) {
        payload.existingImages = existingImages
        await apiClient.patch(`/admin/city/${selectedCityId}`, payload)
        toast.success("City updated successfully!")
      } else {
        await apiClient.post("/admin/city", payload)
        toast.success("City created successfully!")
      }

      setCityName("")
      setCategories([])
      setNewImageFiles([])
      setExistingImages([])
      setSelectedCityId("")
      fetchAllCities()
      fetchCounts()
    } catch {
      toast.error("Failed to save city")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteCity = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name || 'this city'}"?`)) {
      try {
        await apiClient.delete(`/admin/city/${id}`)
        toast.success("City deleted successfully!")
        if (selectedCityId === id) {
          setSelectedCityId("")
        }
        fetchAllCities()
        fetchCounts()
      } catch (err) {
        toast.error(err.response?.data?.msg || "Failed to delete city")
      }
    }
  }

  const handleEditClick = (city) => {
    setSelectedCityId(city._id)
    setCityName(city.city_name || "")
    setCategories(Array.isArray(city.city_category) ? city.city_category : [])
    setVisibility(city.visibility ? city.visibility.toLowerCase() : "public")
    setExistingImages(city.city_image || [])
    setNewImageFiles([])
    if (city.state && (city.state._id || city.state)) {
      setSelectedState(city.state._id || city.state)
    }

    toast.info(`Editing "${city.city_name}". Form loaded above.`, { autoClose: 2500 })

    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    const mainContainer = document.querySelector("main")
    if (mainContainer) {
      mainContainer.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8 pb-16">
      {/* ─── TOP HEADER CARD ─── */}
      <div className="bg-white dark:bg-[#091126]/95 rounded-3xl py-4 sm:py-5 px-6 sm:px-8 border border-slate-200/90 dark:border-indigo-500/25 shadow-xl dark:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.7),0_0_30px_2px_rgba(99,102,241,0.18)] ring-1 ring-slate-900/5 dark:ring-white/5 backdrop-blur-xl relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-blue-500/10 dark:bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-indigo-500/10 dark:bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-500/30 shrink-0">
              <Building size={22} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2 flex-wrap">
                CITY <span className="text-blue-500">HUB</span>
              </h1>
              <p className="text-slate-500 dark:text-slate-400 font-semibold mt-0.5 text-xs sm:text-sm">
                Refining urban locations across destinations
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* DOMESTIC COUNT CARD */}
            <button
              type="button"
              onClick={() => setTravelType("domestic")}
              className={`flex items-center gap-3.5 px-5 py-2.5 rounded-2xl border transition-all cursor-pointer ${
                travelType === "domestic"
                  ? "bg-blue-50 dark:bg-blue-950/40 border-blue-500/60 dark:border-blue-500/50 shadow-md shadow-blue-500/10 ring-2 ring-blue-500/20"
                  : "bg-white dark:bg-[#080E21] border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm"
              }`}
            >
              <div className="size-9 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Building2 size={18} strokeWidth={2.2} />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xl font-bold text-slate-900 dark:text-white leading-none mb-1">
                  {countsLoading ? "..." : counts.domestic}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  DOMESTIC
                </span>
              </div>
            </button>

            {/* INTERNATIONAL COUNT CARD */}
            <button
              type="button"
              onClick={() => setTravelType("international")}
              className={`flex items-center gap-3.5 px-5 py-2.5 rounded-2xl border transition-all cursor-pointer ${
                travelType === "international"
                  ? "bg-purple-50 dark:bg-purple-950/40 border-purple-500/60 dark:border-purple-500/50 shadow-md shadow-purple-500/10 ring-2 ring-purple-500/20"
                  : "bg-white dark:bg-[#080E21] border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm"
              }`}
            >
              <div className="size-9 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                <Globe size={18} strokeWidth={2.2} />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xl font-bold text-slate-900 dark:text-white leading-none mb-1">
                  {countsLoading ? "..." : counts.international}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                  INTERNATIONAL
                </span>
              </div>
            </button>

            {/* TOGGLE SWITCHER */}
            <div className="bg-slate-100 dark:bg-[#050A17] p-1 rounded-2xl flex border border-slate-200 dark:border-slate-800 shadow-inner">
              {["domestic", "international"].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTravelType(t)}
                  className={`px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    travelType === t
                      ? "bg-white text-indigo-600 border border-slate-200 shadow-sm dark:bg-[#0D1630] dark:text-indigo-400 dark:border-slate-700/80"
                      : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>


      {/* ─── FORM WORKSPACE (ORDER: SCREENSHOT 2 (City Identity) -> SCREENSHOT 1 (Selection)) ─── */}
      <form onSubmit={handleSubmit} className="space-y-8" ref={formRef}>
        {/* 1. CITY IDENTITY CARD (SECOND SCREENSHOT) */}
        <div className={cardStyle}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center gap-3.5">
              <div className="size-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 shrink-0">
                <Building size={22} />
              </div>
              <div>
                <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {isUpdateMode ? `Edit City: ${cityName || "Selected City"}` : "City Identity"}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                  {isUpdateMode ? "Update city details, tags, and media assets" : "Define the name, visibility, taxonomy, and gallery"}
                </p>
              </div>
            </div>
            {isUpdateMode && (
              <div className="flex items-center gap-2">
                <span className="px-3.5 py-1 rounded-full text-xs font-bold uppercase bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-500/40">
                  Editing Mode Active
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedCityId("")}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 px-3 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-500/30 cursor-pointer transition-colors"
                >
                  Reset
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelStyle}>
                <MapPin size={14} className="text-indigo-600 dark:text-indigo-400" /> City Identity
              </label>
              <input
                value={cityName}
                onChange={(e) => setCityName(e.target.value)}
                placeholder="e.g. Paris, Tokyo, Mumbai, Dhanbad"
                className={inputStyle}
              />
            </div>
            <div>
              <label className={labelStyle}>
                <Eye size={14} className="text-indigo-600 dark:text-indigo-400" /> Visibility
              </label>
              <div className="relative">
                <select
                  value={visibility.toLowerCase()}
                  onChange={(e) => setVisibility(e.target.value)}
                  className={`${inputStyle} cursor-pointer appearance-none pr-9`}
                >
                  <option value="public" className="bg-white dark:bg-[#050A17] text-slate-800 dark:text-white">
                    Publicly Visible
                  </option>
                  <option value="private" className="bg-white dark:bg-[#050A17] text-slate-800 dark:text-white">
                    Internal Use Only
                  </option>
                </select>
                <ChevronDown size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <div>
            <label className={labelStyle}>
              <Layers size={14} className="text-indigo-600 dark:text-indigo-400" /> Taxonomy
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
              {AVAILABLE_CATEGORIES.map((c) => {
                const isChecked = categories.includes(c)
                return (
                  <label
                    key={c}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all cursor-pointer select-none ${
                      isChecked
                        ? "bg-indigo-50 dark:bg-indigo-950/50 border-indigo-500/60 text-indigo-700 dark:text-indigo-300 shadow-sm ring-1 ring-indigo-500/30 font-bold"
                        : "bg-slate-50/80 dark:bg-[#050A17] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 font-semibold"
                    }`}
                  >
                    <input
                      type="checkbox"
                      value={c}
                      checked={isChecked}
                      onChange={(e) =>
                        setCategories((p) =>
                          e.target.checked ? [...p, c] : p.filter((x) => x !== c)
                        )
                      }
                      className="size-4.5 rounded text-indigo-600 accent-indigo-600 cursor-pointer"
                    />
                    <span className="text-xs uppercase tracking-wider">
                      {c}
                    </span>
                  </label>
                )
              })}
            </div>
          </div>

          <div>
            <label className={labelStyle}>
              <ImageIcon size={14} className="text-indigo-600 dark:text-indigo-400" /> Visual Media
            </label>

            {existingImages.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">
                  Existing Gallery ({existingImages.length}):
                </p>
                <div className="flex flex-wrap gap-3">
                  {existingImages.map((img, i) => (
                    <div
                      key={i}
                      className="size-20 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 relative group shadow-sm"
                    >
                      <img src={img} alt="City asset" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setExistingImages((prev) => prev.filter((_, idx) => idx !== i))}
                        className="absolute top-1.5 right-1.5 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 shadow transition-all cursor-pointer opacity-90 group-hover:opacity-100"
                        title="Remove image"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <label className="group relative block w-full rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/70 dark:bg-[#050A17]/60 hover:border-indigo-500 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 cursor-pointer p-8 transition-all text-center">
              <div className="flex flex-col items-center justify-center">
                <div className="size-14 bg-white dark:bg-[#091126] rounded-2xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform mb-3 border border-slate-200 dark:border-slate-800 text-indigo-600 dark:text-indigo-400">
                  <UploadCloud size={28} />
                </div>
                <p className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                  {newImageFiles.length > 0
                    ? `${newImageFiles.length} High-Res Assets Ready`
                    : "Upload City Gallery"}
                </p>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
                  Drag & drop or browse photos (converted to WebP automatically)
                </p>
              </div>
              <input
                type="file"
                multiple
                accept="image/*"
                hidden
                onChange={(e) => setNewImageFiles([...e.target.files])}
              />
            </label>

            {newImageFiles.length > 0 && (
              <div className="mt-3 flex items-center justify-between px-4 py-2.5 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-500/30 rounded-xl">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 dark:text-indigo-300">
                  <CheckCircle2 size={15} />
                  <span>{newImageFiles.length} new image(s) ready to upload</span>
                </div>
                <button
                  type="button"
                  onClick={() => setNewImageFiles([])}
                  className="text-xs font-bold text-red-500 dark:text-red-400 hover:text-red-600 cursor-pointer"
                >
                  Clear Selection
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 2. SELECTION CARD (FIRST SCREENSHOT - BELOW SECOND SCREENSHOT) */}
        <div className={cardStyle}>
          <div className="flex items-center gap-3 pb-5 border-b border-slate-100 dark:border-slate-800/80">
            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <Navigation size={20} />
            </div>
            <div>
              <h2 className="text-base md:text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Selection
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Filter or choose city to edit
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelStyle}>
                <MapPin size={14} className="text-indigo-600 dark:text-indigo-400" /> Parent Destination
              </label>
              <div className="relative">
                <select
                  value={selectedState}
                  onChange={(e) => {
                    setSelectedState(e.target.value)
                    setSelectedCityId("")
                  }}
                  className={`${inputStyle} cursor-pointer appearance-none pr-9`}
                >
                  <option value="" className="bg-white dark:bg-[#050A17] text-slate-800 dark:text-white">
                    -- All {travelType} destinations --
                  </option>
                  {stateList.map((s) => (
                    <option key={s._id} value={s._id} className="bg-white dark:bg-[#050A17] text-slate-800 dark:text-white">
                      {s.destination_name}
                    </option>
                  ))}
                </select>
                <ChevronDown size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
              {selectedState && (
                <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold mt-1.5 ml-1">
                  Filtered to destination
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2.5">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider ml-0.5">
                  <Layers size={14} className="text-indigo-600 dark:text-indigo-400" /> Modification Mode
                </label>
                {isUpdateMode && (
                  <button
                    type="button"
                    onClick={() => setSelectedCityId("")}
                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    + New City
                  </button>
                )}
              </div>
              <div className="relative">
                <select
                  value={selectedCityId}
                  onChange={(e) => {
                    const cityId = e.target.value
                    setSelectedCityId(cityId)
                    if (cityId) {
                      const found = allCitiesList.find((c) => c._id === cityId)
                      if (found && (found.state?._id || found.state)) {
                        setSelectedState(found.state?._id || found.state)
                      }
                    }
                  }}
                  className={`${inputStyle} cursor-pointer appearance-none pr-9`}
                >
                  <option value="" className="bg-white dark:bg-[#050A17] text-slate-800 dark:text-white">
                    + Register New City
                  </option>
                  {dropdownCities.map((c) => (
                    <option key={c._id} value={c._id} className="bg-white dark:bg-[#050A17] text-slate-800 dark:text-white">
                      {c.city_name} {c.state?.destination_name ? `(${c.state.destination_name})` : ""}
                    </option>
                  ))}
                </select>
                <ChevronDown size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
              <div className="flex items-center gap-2 mt-3 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#050A17] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold w-fit">
                <Building size={13} className="text-indigo-600 dark:text-indigo-400" />
                <span>{dropdownCities.length} {travelType} {dropdownCities.length === 1 ? "city" : "cities"} registered</span>
              </div>
            </div>
          </div>

          <div className="pt-4 flex flex-wrap items-center justify-end gap-4 border-t border-slate-100 dark:border-slate-800/80">
            {isUpdateMode && (
              <button
                type="button"
                onClick={() => setSelectedCityId("")}
                className="px-6 py-4 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-2xl font-bold text-sm transition-all cursor-pointer shadow-sm"
              >
                Cancel Edit
              </button>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto px-10 py-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white rounded-2xl font-bold text-sm shadow-xl shadow-blue-600/30 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  <span>Processing City...</span>
                </>
              ) : (
                <>
                  {isUpdateMode ? <Sparkles size={18} /> : <CheckCircle2 size={18} />}
                  <span>{isUpdateMode ? "Push City Updates" : "Register New City"}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* ─── CITY DIRECTORY (FIFTH SCREENSHOT SYMMETRY) ─── */}
      <div className="bg-white dark:bg-[#091126]/95 rounded-3xl border border-slate-200/90 dark:border-indigo-500/25 shadow-xl dark:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.7),0_0_30px_2px_rgba(99,102,241,0.18)] ring-1 ring-slate-900/5 dark:ring-white/5 backdrop-blur-xl overflow-hidden transition-all">
        <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800/80 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
                <Sparkles size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="text-base md:text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    CURRENT CITY DIRECTORY
                  </h2>
                  <span className="px-2.5 py-0.5 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300 rounded-lg text-[11px] font-extrabold uppercase tracking-wider">
                    {filteredCities.length} {filteredCities.length === 1 ? "CITY" : "CITIES"}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                  Viewing all registered {travelType} destinations and urban hubs
                </p>
              </div>
            </div>

            <div className="relative w-full lg:w-80">
              <input
                type="text"
                placeholder="Search city, destination, or tag..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#050A17] text-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-500/40 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-inner"
              />
              <Search className="absolute left-3.5 top-3 text-slate-400 dark:text-slate-500" size={14} />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* TOOLBAR CONTROLS: SORT DROPDOWN & ITEMS PER PAGE DROPDOWN */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-100 dark:border-slate-800/60">
            {/* SORT DROPDOWN */}
            <div className="flex items-center gap-2.5">
              <span className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <ArrowUpDown size={13} className="text-indigo-600 dark:text-indigo-400" /> Sort:
              </span>
              <div className="relative">
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="appearance-none bg-slate-50 dark:bg-[#050A17] hover:bg-slate-100 dark:hover:bg-[#080E21] border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 text-slate-800 dark:text-white text-xs font-bold py-2 pl-3.5 pr-8 rounded-xl outline-none focus:ring-1 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all cursor-pointer shadow-inner"
                >
                  <option value="newest" className="bg-white dark:bg-[#050A17] text-slate-800 dark:text-white">
                    New City
                  </option>
                  <option value="oldest" className="bg-white dark:bg-[#050A17] text-slate-800 dark:text-white">
                    Old City
                  </option>
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* PER PAGE DROPDOWN */}
            <div className="flex items-center gap-2.5">
              <span className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                Per Page:
              </span>
              <div className="relative">
                <select
                  value={itemsPerPage >= totalItems && totalItems > 0 && itemsPerPage > 27 ? "all" : itemsPerPage}
                  onChange={(e) => {
                    if (e.target.value === "all") {
                      setItemsPerPage(totalItems > 0 ? totalItems : 1000)
                    } else {
                      setItemsPerPage(Number(e.target.value))
                    }
                  }}
                  className="appearance-none bg-slate-50 dark:bg-[#050A17] hover:bg-slate-100 dark:hover:bg-[#080E21] border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 text-slate-800 dark:text-white text-xs font-bold py-2 pl-3.5 pr-8 rounded-xl outline-none focus:ring-1 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all cursor-pointer shadow-inner"
                >
                  <option value={9} className="bg-white dark:bg-[#050A17] text-slate-800 dark:text-white">9 / page</option>
                  <option value={18} className="bg-white dark:bg-[#050A17] text-slate-800 dark:text-white">18 / page</option>
                  <option value={27} className="bg-white dark:bg-[#050A17] text-slate-800 dark:text-white">27 / page</option>
                  <option value="all" className="bg-white dark:bg-[#050A17] text-slate-800 dark:text-white">All Cities</option>
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {isCityListLoading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="animate-spin text-indigo-500" size={32} />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-[#050A17]/80 border-b border-slate-200 dark:border-slate-800/80">
                  <tr>
                    <th className="px-6 py-4 text-left font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-xs">
                      City Name
                    </th>
                    <th className="px-6 py-4 text-left font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-xs">
                      Parent Destination
                    </th>
                    <th className="px-6 py-4 text-left font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-xs">
                      Visibility
                    </th>
                    <th className="px-6 py-4 text-left font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-xs">
                      Tags
                    </th>
                    <th className="px-6 py-4 text-right font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-xs whitespace-nowrap">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredCities.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-slate-500 font-medium">
                        No matching {travelType} cities found in the directory.
                      </td>
                    </tr>
                  ) : (
                    paginatedCities.map((city) => (
                      <tr
                        key={city._id}
                        className={`group transition-colors ${
                          city._id === selectedCityId
                            ? "bg-indigo-50 dark:bg-indigo-950/40 ring-1 ring-inset ring-indigo-500/40"
                            : "hover:bg-slate-50/80 dark:hover:bg-[#050A17]/60"
                        }`}
                      >
                        <td className="px-6 py-4 font-bold text-slate-900 dark:text-white text-sm">
                          <div className="flex items-center gap-3">
                            {city.city_image && city.city_image[0] ? (
                              <img
                                src={city.city_image[0]}
                                alt={city.city_name}
                                className="size-10 rounded-xl object-cover shadow-sm border border-slate-200 dark:border-slate-800"
                              />
                            ) : (
                              <div className="size-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500">
                                <Building size={18} />
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <span className="text-slate-900 dark:text-white font-bold">{city.city_name}</span>
                              {city._id === selectedCityId && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-indigo-600 text-white shadow-sm shadow-indigo-600/30">
                                  Editing
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-700 dark:text-slate-300 font-semibold text-xs">
                          <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300 rounded-xl text-xs font-bold uppercase">
                            {city.state?.destination_name || "Unassigned"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                              city.visibility === "Public" || city.visibility === "public"
                                ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30"
                                : "bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800"
                            }`}
                          >
                            {city.visibility || "Public"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1.5 max-w-md">
                            {(Array.isArray(city.city_category) ? city.city_category : []).map((tag) => (
                              <span
                                key={tag}
                                className="px-2.5 py-0.5 bg-slate-100 dark:bg-[#050A17] border border-slate-200 dark:border-slate-800 rounded-lg text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 shadow-sm"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => handleEditClick(city)}
                              className={`p-2 rounded-xl transition-all cursor-pointer ${
                                city._id === selectedCityId
                                  ? "text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-950/60 scale-110"
                                  : "text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
                              }`}
                              title="Edit City"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteCity(city._id, city.city_name)}
                              className="p-2 rounded-xl text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-all cursor-pointer"
                              title="Delete City"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* PAGINATION CONTROLS */}
            {totalItems > 0 && (
              <div className="p-4 sm:p-6 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/70 dark:bg-[#050A17]/50">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Showing <span className="text-slate-900 dark:text-white font-bold">{startIndex + 1}</span> to{" "}
                  <span className="text-slate-900 dark:text-white font-bold">{Math.min(startIndex + itemsPerPage, totalItems)}</span> of{" "}
                  <span className="text-slate-900 dark:text-white font-bold">{totalItems}</span> cities
                  <span className="text-slate-400 dark:text-slate-500 font-medium ml-1.5">
                    ({sortOrder === "newest" ? "Newest First" : "Oldest First"} &bull; {itemsPerPage >= totalItems ? "All per page" : `${itemsPerPage} per page`})
                  </span>
                </span>

                {totalPages > 1 && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className="px-3 py-2 rounded-xl bg-white dark:bg-[#050A17] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold shadow-sm"
                    >
                      <ChevronLeft size={15} />
                      <span>Prev</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      {getPageNumbers().map((item, idx) => {
                        if (item === "...") {
                          return (
                            <span key={`ellipsis-${idx}`} className="px-2 text-slate-400 dark:text-slate-500 text-xs font-bold select-none">
                              ...
                            </span>
                          )
                        }
                        const pageNum = Number(item)
                        const isActive = currentPage === pageNum
                        return (
                          <button
                            key={`page-${pageNum}`}
                            type="button"
                            onClick={() => setCurrentPage(pageNum)}
                            className={`size-8.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                              isActive
                                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-extrabold"
                                : "bg-white dark:bg-[#050A17] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700 shadow-sm"
                            }`}
                          >
                            {pageNum}
                          </button>
                        )
                      })}
                    </div>

                    <button
                      type="button"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      className="px-3 py-2 rounded-xl bg-white dark:bg-[#050A17] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold shadow-sm"
                    >
                      <span>Next</span>
                      <ChevronRight size={15} />
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
  )
}

export default CreateCity
