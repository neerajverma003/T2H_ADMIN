import { useRef, useState, useEffect } from "react"
import {
  Loader2,
  Video,
  X,
  Replace,
  LayoutTemplate,
  Eye,
  Trash2,
} from "lucide-react"
import { toast } from "react-toastify"
import { apiClient } from "../../stores/authStores"
import { useHeroVideoStore } from "../../stores/heroVideoStore"

const HoneymoonHeroVideo = () => {
  const [video, setVideo] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [visibility, setVisibility] = useState("public")
  const [activePage, setActivePage] = useState("home")

  const { videos, isLoading, title, fetchVideos, deleteVideo, updateVisibility } =
    useHeroVideoStore()

  const pageRef = useRef()

  useEffect(() => {
    fetchVideos(activePage)
  }, [activePage, fetchVideos])

  const handleVideoChange = (e) => {
    const file = e.target.files[0]
    if (file && file.type.startsWith("video/")) {
      setVideo(file)
    } else if (file) {
      toast.error("Please upload a valid honeymoon video file.")
    }
  }

  const handleRemoveVideo = () => {
    setVideo(null)
    if (document.getElementById("videoUpload")) {
      document.getElementById("videoUpload").value = ""
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!video) return toast.error("Please select a honeymoon hero video.")

    const page = pageRef.current?.value
    if (!page) return toast.error("Please select a destination page.")

    const formData = new FormData()
    formData.append("image", video)
    formData.append("title", page)
    formData.append("visibility", visibility)


    try {
      setIsUploading(true)
      const response = await apiClient.post("/admin/hero-section", formData)
      if (response.data.success) {
        toast.success("Honeymoon hero video uploaded successfully 💕")
        handleRemoveVideo()
        pageRef.current.value = "home"
        setVisibility("public")
        fetchVideos(page)
        setActivePage(page)
      } else {
        toast.error(response.data.msg || "Upload failed.")
      }
    } catch {
      toast.error("Something went wrong while uploading.")
    } finally {
      setIsUploading(false)
    }
  }

  // const handleDelete = (id) => deleteVideo(id, activePage)
  // const handleVisibilityChange = (id) => updateVisibility(id)

  const handleDelete = (id) => deleteVideo(id, activePage)
  const handleVisibilityChange = (id) => updateVisibility(id, activePage)


  const inputStyle =
    "block w-full rounded-lg border-2 border-slate-400 dark:border-slate-600 bg-white dark:bg-slate-900 p-2.5 text-slate-900 dark:text-white shadow focus:border-pink-500 focus:ring-pink-500"

  const labelStyle =
    "block text-sm font-bold text-slate-800 dark:text-slate-200 mb-1"

  const pageOptions = ["home", "about", "domestic", "international", "contact", "blog"]

  return (
    <div className="min-h-screen bg-slate-200 dark:bg-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-10">

        {/* UPLOAD FORM */}
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-6 space-y-8 border-2 border-slate-400 dark:border-slate-700"
        >
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white border-b pb-3">
            💍 Honeymoon Hero Video Manager
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelStyle}>
                <LayoutTemplate size={16} className="inline mr-1" />
                Select Page
              </label>
              <select ref={pageRef} defaultValue="home" className={inputStyle}>
                {pageOptions.map((p) => (
                  <option key={p} value={p} className="capitalize">
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelStyle}>
                <Eye size={16} className="inline mr-1" />
                Visibility
              </label>
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value)}
                className={inputStyle}
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </div>
          </div>

          {/* VIDEO UPLOAD */}
          <div>
            <label className={labelStyle}>Hero Honeymoon Video</label>

            {video ? (
              <div className="relative rounded-xl border-2 border-slate-400 dark:border-slate-700 overflow-hidden bg-black shadow">
                <video
                  src={URL.createObjectURL(video)}
                  controls
                  autoPlay
                  muted
                  loop
                  className="w-full max-h-96 object-contain"
                />
                <div className="absolute top-2 right-2 flex gap-2">
                  <label
                    htmlFor="videoUpload"
                    className="bg-pink-600 hover:bg-pink-700 text-white rounded-full p-2 cursor-pointer"
                  >
                    <Replace size={18} />
                  </label>
                  <button
                    type="button"
                    onClick={handleRemoveVideo}
                    className="bg-red-600 hover:bg-red-700 text-white rounded-full p-2"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
            ) : (
              <label
                htmlFor="videoUpload"
                className="flex flex-col items-center justify-center gap-2 cursor-pointer rounded-xl border-2 border-dashed border-pink-400 bg-pink-50 dark:bg-slate-800 p-10 hover:bg-pink-100 transition"
              >
                <Video size={40} className="text-pink-600" />
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                  Upload Honeymoon Hero Video
                </span>
                <span className="text-xs text-slate-500">MP4, WebM, Ogg supported</span>
              </label>
            )}

            <input
              id="videoUpload"
              type="file"
              accept="video/*"
              onChange={handleVideoChange}
              className="hidden"
            />
          </div>

          <button
            type="submit"
            disabled={!video || isUploading}
            className="w-full rounded-xl bg-pink-700 hover:bg-pink-800 text-white py-3 font-bold shadow-lg disabled:opacity-50"
          >
            {isUploading ? "Uploading..." : "Upload Honeymoon Video"}
          </button>
        </form>

        {/* VIDEO LIST */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-6 border-2 border-slate-400 dark:border-slate-700">
          <div className="flex flex-wrap gap-3 mb-6">
            {pageOptions.map((page) => (
              <button
                key={page}
                onClick={() => setActivePage(page)}
                className={`px-4 py-2 rounded-lg font-semibold capitalize ${
                  activePage === page
                    ? "bg-pink-700 text-white shadow"
                    : "bg-slate-300 dark:bg-slate-800 text-slate-800 dark:text-slate-300"
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-pink-600" />
            </div>
          ) : videos?.length ? (
            <div className="space-y-4">
              {videos.map((v) => (
                <div
                  key={v._id}
                  className="flex flex-col md:flex-row gap-4 p-4 border-2 border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800"
                >
                  <video
                    src={v.url}
                    controls
                    muted
                    className="w-full md:w-1/3 rounded-lg bg-black"
                  />

                  <div className="flex-1">
                    <h3 className="text-lg font-bold capitalize text-slate-800 dark:text-white">
                      {title}
                    </h3>
                    <p className="text-sm text-slate-500">ID: {v._id}</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleVisibilityChange(v._id)}
                      className={`px-4 py-2 rounded-lg text-sm font-bold ${
                        v.visibility === "Public"
                          ? "bg-green-600 text-white"
                          : "bg-slate-300 dark:bg-slate-700 text-slate-800 dark:text-slate-300"
                      }`}
                    >
                      {v.visibility}
                    </button>

                    <button
                      onClick={() => handleDelete(v._id)}
                      className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-full"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-slate-600 dark:text-slate-400 py-10">
              No honeymoon videos found for {activePage}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default HoneymoonHeroVideo
