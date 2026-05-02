import { useState, useEffect } from "react"
import { toast } from "react-toastify"
import {
  MapPin,
  Globe,
  UploadCloud,
  X,
  Loader2,
  Image as ImageIcon,
} from "lucide-react"
import { usePlaceStore } from "../../stores/usePlaceStore"
import { apiClient } from "../../stores/authStores"

const AVAILABLE_CATEGORIES = ["Trending", "Exclusive", "Popular", "New"]

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
    if (!selectedCityId) return

    const fetchCity = async () => {
      try {
        const res = await apiClient.get(`/admin/city/${selectedCityId}`)
        const c = res.data?.cityData
        if (!c) return

        setCityName(c.city_name)
        setCategories(c.city_category || [])
        setVisibility(c.visibility)
        setExistingImages(c.city_image || [])
        setNewImageFiles([])
      } catch {
        toast.error("Failed to load city")
      }
    }

    fetchCity()
  }, [selectedCityId])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!cityName || !selectedState) {
      toast.error("Please fill required fields")
      return
    }

    try {
      const cityFolder = `cities/${cityName.replace(/\s+/g, '_')}`;
      const uploadedImageKeys = [];

      // 1. Upload new images to S3
      if (newImageFiles && newImageFiles.length > 0) {
        for (const file of newImageFiles) {
          const presignedRes = await apiClient.post("/admin/generate-presigned-url", {
            fileName: file.name,
            fileType: file.type,
            folder: cityFolder
          });
          const { uploadUrl, key } = presignedRes.data;

          await fetch(uploadUrl, {
            method: "PUT",
            body: file,
            headers: { "Content-Type": file.type }
          });
          uploadedImageKeys.push(key);
        }
      }

      // 2. Build JSON Payload
      const payload = {
        city_name: cityName,
        visibility: visibility,
        city_category: categories,
        images: uploadedImageKeys,
        id: selectedState
      };

      if (isUpdateMode) {
        payload.existingImages = existingImages;
        await apiClient.patch(`/admin/city/${selectedCityId}`, payload);
        toast.success("City updated successfully!");
      } else {
        await apiClient.post("/admin/city", payload);
        toast.success("City created successfully!");
      }

      setCityName("")
      setCategories([])
      setNewImageFiles([])
      setExistingImages([])
      setSelectedCityId("")
    } catch {
      toast.error("Failed to save city")
    }
  }

  return (
    <div className="flex flex-col gap-8 p-4 md:p-6 bg-slate-200 dark:bg-slate-950 min-h-screen">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
          🏙️ City Management
        </h1>
        <p className="text-sm text-slate-700 dark:text-slate-400">
          Create and manage cities for Trip to Honeymoon
        </p>
      </div>

      {/* BASIC SELECTION */}
      <div className="bg-white dark:bg-slate-900 border-2 border-slate-400 dark:border-slate-700 rounded-xl p-6 shadow grid grid-cols-1 md:grid-cols-3 gap-6">

        <div>
          <label className="block text-sm font-bold text-slate-800 dark:text-slate-200">
            <Globe size={16} className="inline mr-1" /> Travel Type
          </label>
          <div className="flex gap-6 mt-2 text-slate-700 dark:text-slate-300">
            {["domestic", "international"].map((t) => (
              <label key={t} className="flex items-center gap-2">
                <input
                  type="radio"
                  value={t}
                  checked={travelType === t}
                  onChange={() => setTravelType(t)}
                  className="accent-pink-600"
                />
                {t}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-800 dark:text-slate-200">
            Select State
          </label>
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="mt-1 w-full rounded-lg border-2 border-slate-400 dark:border-slate-600 bg-white dark:bg-slate-900 p-2 text-slate-900 dark:text-white"
          >
            <option value="">-- Select State --</option>
            {stateList.map((s) => (
              <option key={s._id} value={s._id}>
                {s.destination_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-800 dark:text-slate-200">
            Edit City
          </label>
          <select
            value={selectedCityId}
            onChange={(e) => setSelectedCityId(e.target.value)}
            className="mt-1 w-full rounded-lg border-2 border-slate-400 dark:border-slate-600 bg-white dark:bg-slate-900 p-2 text-slate-900 dark:text-white"
            disabled={!selectedState}
          >
            <option value="">-- New City --</option>
            {cityList.map((c) => (
              <option key={c._id} value={c._id}>
                {c.city_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* FORM */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border-2 border-slate-400 dark:border-slate-700 rounded-xl p-6 shadow space-y-6">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-slate-800 dark:text-slate-200">
              City Name
            </label>
            <input
              value={cityName}
              onChange={(e) => setCityName(e.target.value)}
              className="mt-1 w-full rounded-lg border-2 border-slate-400 dark:border-slate-600 bg-white dark:bg-slate-900 p-2 text-slate-900 dark:text-white"
              placeholder="e.g. Paris"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-800 dark:text-slate-200">
              Visibility
            </label>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
              className="mt-1 w-full rounded-lg border-2 border-slate-400 dark:border-slate-600 bg-white dark:bg-slate-900 p-2 text-slate-900 dark:text-white"
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-800 dark:text-slate-200">
            Categories
          </label>
          <div className="flex flex-wrap gap-4 mt-2 text-slate-700 dark:text-slate-300">
            {AVAILABLE_CATEGORIES.map((c) => (
              <label key={c} className="flex gap-2 items-center">
                <input
                  type="checkbox"
                  value={c}
                  checked={categories.includes(c)}
                  onChange={(e) =>
                    setCategories((p) =>
                      e.target.checked ? [...p, c] : p.filter((x) => x !== c)
                    )
                  }
                  className="accent-pink-600"
                />
                {c}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-800 dark:text-slate-200">
            <ImageIcon size={16} className="inline mr-1" /> City Images
          </label>
          <label className="mt-2 flex flex-col items-center justify-center h-48 border-2 border-dashed border-slate-400 dark:border-slate-600 rounded-lg cursor-pointer bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            <UploadCloud size={36} />
            Click to upload images
            <input
              type="file"
              multiple
              accept="image/*"
              hidden
              onChange={(e) => setNewImageFiles([...e.target.files])}
            />
          </label>
        </div>

        <button
          type="submit"
          className="bg-pink-700 hover:bg-pink-800 text-white px-6 py-3 rounded-xl font-bold shadow-lg"
          disabled={!selectedState || !cityName}
        >
          {isUpdateMode ? "Update City" : "Create City"}
        </button>
      </form>
    </div>
  )
}

export default CreateCity
