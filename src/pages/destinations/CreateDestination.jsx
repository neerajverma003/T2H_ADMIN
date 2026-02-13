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

const CreateDestination = () => {
  const [data, setData] = useState({
    type: "domestic",
    destination_name: "",
    image: [],
    destination_type: [],
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

    const formData = new FormData()
    formData.append("type", data.type)
    formData.append("destination_name", data.destination_name)

    data.image.forEach((img) => formData.append("image", img))
    data.destination_type.forEach((t) =>
      formData.append("destination_type", t)
    )

    setIsLoading(true)
    const result = await createDestination(formData)

    if (result.success) {
      setData({
        type: data.type,
        destination_name: "",
        image: [],
        destination_type: [],
      })
      fetchDestinationList(data.type)
    }

    setIsLoading(false)
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

          {/* CATEGORIES */}
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-3">
              Destination Categories
            </label>

            <div className="flex flex-wrap gap-6">
              {["trending", "TopMost Destination", "Top destination", "home", "honeymoon"].map(
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
