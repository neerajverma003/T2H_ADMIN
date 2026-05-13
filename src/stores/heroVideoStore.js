// import { create } from "zustand"
// import { toast } from "react-toastify"
// import { apiClient } from "./authStores" // ✅ FIXED import (very important)

// export const useHeroVideoStore = create((set, get) => ({
//   /* =====================
//      STATE
//   ===================== */
//   videos: [],
//   isLoading: false,
//   error: null,
//   visibility: "public",
//   title: null,

//   /* =====================
//      ACTIONS
//   ===================== */

//   // Fetch videos by page
//   fetchVideos: async (page) => {
//     set({ isLoading: true, error: null })

//     try {
//       const response = await apiClient.get(`/admin/hero-section/${page}`)

//       if (response.data.success && response.data.heroVideoData?.length) {
//         const data = response.data.heroVideoData[0]

//         set({
//           videos: data.video_url || [],
//           visibility: data.visibility || "public",
//           title: data.title || page,
//         })
//       } else {
//         set({
//           videos: [],
//           visibility: "public",
//           title: page,
//         })
//       }
//     } catch (error) {
//       console.error("Fetch Videos Error:", error)
//       toast.error(error.message || "Failed to fetch hero videos")
//       set({ error: error.message })
//     } finally {
//       set({ isLoading: false })
//     }
//   },

//   // Delete video
//   deleteVideo: async (videoId) => {
//     if (!window.confirm("Are you sure you want to delete this video?")) return

//     try {
//       const response = await apiClient.delete(
//         `/admin/hero-section/${videoId}?title=${get().title}`
//       )

//       if (response.data.success) {
//         toast.success(response.data.msg || "Video deleted successfully!")
//         get().fetchVideos(get().title)
//       } else {
//         throw new Error(response.data.msg)
//       }
//     } catch (error) {
//       console.error("Delete Video Error:", error)
//       toast.error(error.message || "Failed to delete video")
//     }
//   },

//   // Toggle visibility
//   updateVisibility: async (videoId) => {
//     try {
//       const response = await apiClient.patch(`/admin/hero-section/${videoId}`, {
//         title: get().title,
//       })

//       if (response.data.success) {
//         toast.success(response.data.msg || "Visibility updated")
//         get().fetchVideos(get().title)
//       } else {
//         throw new Error(response.data.msg)
//       }
//     } catch (error) {
//       console.error("Visibility Change Error:", error)
//       toast.error(error.message || "Failed to update visibility")
//     }
//   },
// }))


import { create } from "zustand"
import { toast } from "react-toastify"
import { apiClient } from "./authStores"
import { getCdnUrl } from "../utils/media"

export const useHeroVideoStore = create((set, get) => ({
  /* =====================
     STATE
  ===================== */
  videos: [],
  isLoading: false,
  error: null,
  title: null,
  heading: "",
  subHeading: "",



  /**
   * =====================
   * FETCH HERO VIDEOS
   * =====================
   */
  fetchVideos: async (page) => {
    if (!page) return

    set({ isLoading: true, error: null })

    try {
      const response = await apiClient.get(`/admin/hero-section/${page}`)

      if (response.data?.success) {
        // Normalize each video's url to a full absolute URL so <video src=...> works in the admin app
        const raw = response.data.data || [];
        const normalized = raw.map((v) => ({
          ...v,
          url: getCdnUrl(v.url)
        }));

        set({
          videos: normalized,
          title: response.data.title || page,
          heading: response.data.heading || "Majestic Ladakh",
          subHeading: response.data.sub_heading || "Explore the breathtaking landscapes of Ladakh...",
        })
      } else {
        set({
          videos: [],
          title: page,
          heading: "Majestic Ladakh",
          subHeading: "Explore the breathtaking landscapes of Ladakh...",
        })
      }
    } catch (error) {
      console.error("Fetch Videos Error:", error)

      set({
        videos: [],
        error: error.message,
        title: page,
      })

      toast.error(
        error.response?.data?.msg || "Failed to fetch hero videos"
      )
    } finally {
      set({ isLoading: false })
    }
  },

  /**
   * =====================
   * DELETE HERO VIDEO
   * =====================
   */
  deleteVideo: async (videoId, page) => {
    if (!videoId) return

    const title = page || get().title
    if (!title) return toast.error("Page title missing")

    if (!window.confirm("Are you sure you want to delete this video?")) return

    try {
      const response = await apiClient.delete(
        `/admin/hero-section/${videoId}?title=${title}`
      )

      if (response.data?.success) {
        toast.success(response.data.msg || "Video deleted successfully")
        get().fetchVideos(title)
      } else {
        throw new Error(response.data?.msg)
      }
    } catch (error) {
      console.error("Delete Video Error:", error)
      toast.error(
        error.response?.data?.msg || "Failed to delete video"
      )
    }
  },

  /**
   * =====================
   * TOGGLE VISIBILITY
   * =====================
   */
  updateVisibility: async (videoId, page) => {
    if (!videoId) return

    const title = page || get().title
    if (!title) return toast.error("Page title missing")

    try {
      const response = await apiClient.patch(
        `/admin/hero-section/${videoId}`,
        { title }
      )

      if (response.data?.success) {
        toast.success(response.data.msg || "Visibility updated")
        get().fetchVideos(title)
      } else {
        throw new Error(response.data?.msg)
      }
    } catch (error) {
      console.error("Visibility Update Error:", error)
      toast.error(
        error.response?.data?.msg || "Failed to update visibility"
      )
    }
  },
}))
