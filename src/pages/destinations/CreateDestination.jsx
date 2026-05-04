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
} from "lucide-react"
import { usePlaceStore } from "../../stores/usePlaceStore"
import { useNavigate } from "react-router-dom"
import { apiClient } from "../../stores/authStores"
import axios from "axios"

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

  const {
    createDestination,
    fetchDestinationList,
    destinationList,
    isListLoading,
  } = usePlaceStore()

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

    if (!data.destination_name.trim()) {
      toast.error("Please enter a destination name")
      return
    }

    if (data.image.length === 0) {
      return toast.error("Please select at least one image.");
    }

    setIsLoading(true)

    try {
      const imageUrls = []

      // 1. Get presigned URL and upload to S3 directly
      const capitalizedType = data.type.charAt(0).toUpperCase() + data.type.slice(1);
      const destinationFolder = `destination/${capitalizedType}/${data.destination_name.replace(/\s+/g, '_')}`;

      for (const img of data.image) {
        const presignedRes = await apiClient.post("/admin/generate-presigned-url", {
          fileName: img.name,
          fileType: img.type,
          folder: destinationFolder
        })

        const { uploadUrl, key } = presignedRes.data

        // PUT request bypasses our backend and goes directly to AWS S3
        await axios.put(uploadUrl, img, {
          headers: {
            "Content-Type": img.type
          }
        })

        imageUrls.push(key)
      }

      // 2. Submit lightweight JSON data to our backend
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
        toast.success(`Destination "${data.destination_name}" created!`);
        // Reset form state
        setData({
          type: "domestic",
          destination_name: "",
          destination_type: [],
          image: [],
          best_time: "",
          ideal_duration: "",
        })
        // Manually clear the file input
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = "";
      }

    } catch (err) {
      console.error("Error saving destination:", err)
      toast.error(err.response?.data?.msg || "Failed to upload to S3 or save destination.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id) => {
    await usePlaceStore.getState().deleteDestination(id)
    fetchDestinationList(typeRef.current)
  }

  return (
    <div className="flex flex-col gap-10">

      {/* PAGE HEADER */}
      <div>
        <h1 className="text-4xl font-bold text-white">
          Create New Destination
        </h1>
        <p className="mt-2 text-slate-400">
          Manage domestic & international honeymoon destinations
        </p>
      </div>

      {/* CREATE DESTINATION CARD */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 p-8">

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* DESTINATION TYPE */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-200 mb-3">
              <Globe size={18} /> Destination Type
            </label>

            <div className="flex gap-8">
              {["domestic", "international"].map((t) => (
                <label key={t} className="flex items-center gap-2 text-slate-300">
                  <input
                    type="radio"
                    name="type"
                    value={t}
                    checked={data.type === t}
                    onChange={handleChange}
                    className="accent-blue-500"
                  />
                  <span className="capitalize">{t}</span>
                </label>
              ))}
            </div>
          </div>

          {/* DESTINATION NAME */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-200 mb-2">
              <MapPin size={18} /> Destination Name
            </label>
            <input
              type="text"
              name="destination_name"
              value={data.destination_name}
              onChange={handleChange}
              placeholder="e.g. Goa, Paris"
              className="w-full rounded-lg bg-slate-900 border border-slate-700 px-4 py-3 text-sm
                text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-8">
            {/* BEST TIME */}
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">
                Best Time to Visit
              </label>
              <input
                type="text"
                name="best_time"
                value={data.best_time}
                onChange={handleChange}
                placeholder="e.g. Oct - March"
                className="w-full rounded-lg bg-slate-900 border border-slate-700 px-4 py-3 text-sm
                  text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            {/* IDEAL DURATION */}
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">
                Ideal Duration
              </label>
              <input
                type="text"
                name="ideal_duration"
                value={data.ideal_duration}
                onChange={handleChange}
                placeholder="e.g. 5-7 Days"
                className="w-full rounded-lg bg-slate-900 border border-slate-700 px-4 py-3 text-sm
                  text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* CATEGORIES */}
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-3">
              Destination Categories
            </label>

            <div className="flex flex-wrap gap-6">
              {["trending", "TopMost Destination", "exclusive", "weekend", "home", "honeymoon"].map(
                (opt) => (
                  <label key={opt} className="flex items-center gap-2 text-slate-300">
                    <input
                      type="checkbox"
                      name="destination_type"
                      value={opt}
                      checked={data.destination_type.includes(opt)}
                      onChange={handleChange}
                      className="accent-blue-500"
                    />
                    <span className="capitalize">{opt}</span>
                  </label>
                )
              )}
            </div>
          </div>

          {/* IMAGES */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-200 mb-2">
              <ImageIcon size={18} /> Upload Images
            </label>
            <input
              type="file"
              name="image"
              multiple
              accept="image/*"
              onChange={handleChange}
              className="text-sm text-slate-300"
            />
          </div>

          {/* SAVE BUTTON */}
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3
              text-sm font-semibold text-white hover:bg-blue-700 transition disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Heart size={18} />
                Save Destination
              </>
            )}
          </button>
        </form>
      </div>

      {/* DESTINATION LIST */}
      <div className="rounded-2xl bg-slate-900 border border-slate-700 p-6">

        <h2 className="text-xl font-semibold text-white mb-6">
          {data.type === "domestic" ? "Domestic" : "International"} Destinations
        </h2>

        {isListLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : destinationList.length === 0 ? (
          <p className="text-slate-400">No destinations found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-800">
              <tr>
                <th className="text-left px-4 py-3 text-slate-300 font-semibold">
                  Destination Name
                </th>
                <th className="text-left px-4 py-3 text-slate-300 font-semibold">
                  Category
                </th>
                <th className="text-right px-4 py-3 text-slate-300 font-semibold">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {destinationList.map((dest) => (
                <tr key={dest._id}>
                  <td className="px-4 py-3 text-slate-200">
                    {dest.destination_name}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {(Array.isArray(dest.destination_type) ? dest.destination_type : []).map(type => (
                        <span key={type} className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                          type && type.toLowerCase().includes('topmost') 
                            ? 'bg-amber-500/20 text-amber-500' 
                            : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          {type || 'General'}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() =>
                        navigate(`/destinations/edit/${dest._id}`)
                      }
                      className="text-blue-500 hover:text-blue-400 mr-4"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(dest._id)}
                      className="text-red-500 hover:text-red-400"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default CreateDestination
