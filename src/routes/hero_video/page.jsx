import { useRef, useState, useEffect } from "react"
import {
  Loader2,
  Video,
  Image as ImageIcon,
  X,
  Replace,
  LayoutTemplate,
  Eye,
  Trash2,
  UploadCloud,
} from "lucide-react"
import { toast } from "react-toastify"
import { apiClient } from "../../stores/authStores"
import { useHeroVideoStore } from "../../stores/heroVideoStore"
import axios from "axios"

const HoneymoonHeroVideo = () => {
  const [mediaFile, setMediaFile] = useState(null)      // File object
  const [mediaType, setMediaType] = useState(null)       // 'image' | 'video'
  const [previewUrl, setPreviewUrl] = useState(null)     // local object URL for preview
  const [isUploading, setIsUploading] = useState(false)
  const [visibility, setVisibility] = useState("public")
  const [activePage, setActivePage] = useState("home")

  const { videos, isLoading, title, fetchVideos, deleteVideo, updateVisibility } =
    useHeroVideoStore()

  const pageRef = useRef()

  useEffect(() => {
    fetchVideos(activePage)
  }, [activePage, fetchVideos])

  // Clean up local object URL on unmount / file change
  useEffect(() => {
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl) }
  }, [previewUrl])

  const IMAGE_EXTS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'svg']

  const handleMediaChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const ext = file.name.split('.').pop()?.toLowerCase()
    const isImage = IMAGE_EXTS.includes(ext)
    const isVideo = file.type.startsWith('video/')

    if (!isImage && !isVideo) {
      toast.error("Please upload a valid image or video file.")
      return
    }

    setMediaFile(file)
    setMediaType(isImage ? 'image' : 'video')
    setPreviewUrl(URL.createObjectURL(file))
  }

  const handleRemoveMedia = () => {
    setMediaFile(null)
    setMediaType(null)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
    const input = document.getElementById("mediaUpload")
    if (input) input.value = ""
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!mediaFile) return toast.error("Please select an image or video.")

    const page = pageRef.current?.value
    if (!page) return toast.error("Please select a destination page.")

    try {
      setIsUploading(true)

      // 1. Get presigned upload URL from backend
      const heroFolder = `hero-section/${page.replace(/\s+/g, '_')}`
      const presignedRes = await apiClient.post("/admin/generate-presigned-url", {
        fileName: mediaFile.name,
        fileType: mediaFile.type,
        folder: heroFolder
      })
      const { uploadUrl, key } = presignedRes.data

      // 2. Upload directly to S3
      await axios.put(uploadUrl, mediaFile, {
        headers: { "Content-Type": mediaFile.type }
      })

      // 3. Send key to backend (backend auto-detects media_type from extension)
      const payload = {
        title: page,
        visibility,
        video_key: key   // field name kept for API compat
      }

      const response = await apiClient.post("/admin/hero-section", payload)
      if (response.data.success) {
        toast.success(`Hero ${mediaType} uploaded successfully! 💕`)
        handleRemoveMedia()
        setVisibility("public")
        fetchVideos(page)
        setActivePage(page)
      } else {
        toast.error(response.data.msg || "Upload failed.")
      }
    } catch (err) {
      console.error(err)
      toast.error("Something went wrong while uploading.")
    } finally {
      setIsUploading(false)
    }
  }

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
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white border-b pb-3">
              💍 Hero Media Manager
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Upload one image <strong>or</strong> one video per page. Uploading replaces the current media for that page.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelStyle}>
                <LayoutTemplate size={16} className="inline mr-1" />
                Select Page
              </label>
              <select ref={pageRef} defaultValue="home" className={inputStyle}>
                {pageOptions.map((p) => (
                  <option key={p} value={p} className="capitalize">{p}</option>
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

          {/* MEDIA UPLOAD AREA */}
          <div>
            <label className={labelStyle}>
              Hero Media (Image or Video)
            </label>

            {mediaFile ? (
              <div className="relative rounded-xl border-2 border-slate-400 dark:border-slate-700 overflow-hidden bg-black shadow">
                {/* Preview */}
                {mediaType === 'video' ? (
                  <video
                    src={previewUrl}
                    controls
                    autoPlay
                    muted
                    loop
                    className="w-full max-h-96 object-cover"
                  />
                ) : (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full max-h-96 object-cover"
                  />
                )}

                {/* Type badge */}
                <span className="absolute top-2 left-2 bg-black/70 text-white text-xs font-bold px-2 py-1 rounded-full capitalize">
                  {mediaType === 'video' ? <Video size={12} className="inline mr-1" /> : <ImageIcon size={12} className="inline mr-1" />}
                  {mediaType}
                </span>

                {/* Replace / Remove buttons */}
                <div className="absolute top-2 right-2 flex gap-2">
                  <label
                    htmlFor="mediaUpload"
                    className="bg-pink-600 hover:bg-pink-700 text-white rounded-full p-2 cursor-pointer"
                    title="Replace"
                  >
                    <Replace size={18} />
                  </label>
                  <button
                    type="button"
                    onClick={handleRemoveMedia}
                    className="bg-red-600 hover:bg-red-700 text-white rounded-full p-2"
                    title="Remove"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
            ) : (
              <label
                htmlFor="mediaUpload"
                className="flex flex-col items-center justify-center gap-3 cursor-pointer rounded-xl border-2 border-dashed border-pink-400 bg-pink-50 dark:bg-slate-800 p-10 hover:bg-pink-100 dark:hover:bg-slate-700 transition"
              >
                <UploadCloud size={44} className="text-pink-500" />
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200 text-center">
                  Click to upload an Image or Video
                </span>
                <span className="text-xs text-slate-500">
                  JPG, PNG, WebP, GIF • MP4, WebM, Ogg
                </span>
              </label>
            )}

            <input
              id="mediaUpload"
              type="file"
              accept="image/*,video/*"
              onChange={handleMediaChange}
              className="hidden"
            />
          </div>

          <button
            type="submit"
            disabled={!mediaFile || isUploading}
            className="w-full rounded-xl bg-pink-700 hover:bg-pink-800 text-white py-3 font-bold shadow-lg disabled:opacity-50"
          >
            {isUploading ? "Uploading..." : `Upload ${mediaType === 'image' ? 'Image' : 'Video'} for ${pageRef.current?.value || 'Page'}`}
          </button>
        </form>

        {/* CURRENT MEDIA LIST */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-6 border-2 border-slate-400 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Current Hero Media</h2>

          {/* Page tabs */}
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
                  {/* Render image or video based on media_type */}
                  {v.media_type === 'image' ? (
                    <img
                      src={v.url}
                      alt="Hero media"
                      className="w-full md:w-1/3 rounded-lg object-cover max-h-48"
                    />
                  ) : (
                    <video
                      src={v.url}
                      controls
                      muted
                      className="w-full md:w-1/3 rounded-lg bg-black max-h-48"
                    />
                  )}

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="capitalize text-lg font-bold text-slate-800 dark:text-white">
                        {title}
                      </span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        v.media_type === 'image'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-purple-100 text-purple-700'
                      }`}>
                        {v.media_type === 'image' ? '🖼 Image' : '🎬 Video'}
                      </span>
                    </div>
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
              No media set for <strong className="capitalize">{activePage}</strong> page yet.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default HoneymoonHeroVideo

