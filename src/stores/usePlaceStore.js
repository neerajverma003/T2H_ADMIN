import { create } from "zustand"
import { toast } from "react-toastify"
import { apiClient } from "./authStores"

export const usePlaceStore = create((set, get) => ({
  // ======================================================
  // STATE
  // ======================================================
  isContentLoading: false,
  currentTermsContent: "",
  isListLoading: false,

  destinationList: [],
  cityList: [], // ✅ NEW

  // ======================================================
  // DESTINATION ACTIONS
  // ======================================================

  createDestination: async (destinationData) => {
    try {
      await apiClient.post(`/admin/new-destination`, destinationData)

      // Handle both FormData (backward compatibility) and JSON payload
      const name = destinationData instanceof FormData 
        ? destinationData.get("destination_name") 
        : destinationData.destination_name;
        
      const travelType = destinationData instanceof FormData 
        ? destinationData.get("type") 
        : destinationData.type;

      toast.success(`Destination "${name}" created successfully!`)

      if (travelType) {
        await get().fetchDestinationList(travelType)
      }

      return { success: true }
    } catch (error) {
      console.error("Error creating destination:", error)
      toast.error(error.response?.data?.msg || "Failed to create destination.")
      return { success: false }
    }
  },

  fetchDestinationList: async (travelType) => {
    if (!travelType) return

    set({ isListLoading: true })
    try {
      const res = await apiClient.get(`/admin/destination/${travelType}`)
      set({ destinationList: res.data.places, isListLoading: false })
    } catch (error) {
      console.error("Fetch destination error:", error)
      set({ destinationList: [], isListLoading: false })
    }
  },

  deleteDestination: async (id) => {
    set({ isListLoading: true })
    try {
      const res = await apiClient.delete(`/admin/destination/delete/${id}`)
      toast.success("Destination deleted successfully!")
      await get().fetchDestinationList(res.data.type)
    } catch (error) {
      console.error("Delete destination error:", error)
      toast.error("Failed to delete destination.")
    } finally {
      set({ isListLoading: false })
    }
  },

  // ======================================================
  // CITY ACTIONS  ✅ NEW
  // ======================================================

  createCity: async (cityData) => {
    try {
      await apiClient.post(`/admin/create-city`, cityData)
      toast.success("City created successfully!")
      await get().fetchCityList()
      return { success: true }
    } catch (error) {
      console.error("Error creating city:", error)
      toast.error(error.response?.data?.msg || "Failed to create city.")
      return { success: false }
    }
  },

  fetchCityList: async () => {
    set({ isListLoading: true })
    try {
      const res = await apiClient.get(`/admin/cities`)
      set({ cityList: res.data.cities, isListLoading: false })
    } catch (error) {
      console.error("Fetch city error:", error)
      set({ cityList: [], isListLoading: false })
    }
  },

  deleteCity: async (id) => {
    set({ isListLoading: true })
    try {
      await apiClient.delete(`/admin/city/delete/${id}`)
      toast.success("City deleted successfully!")
      await get().fetchCityList()
    } catch (error) {
      console.error("Delete city error:", error)
      toast.error("Failed to delete city.")
    } finally {
      set({ isListLoading: false })
    }
  },

  // ======================================================
  // TERMS & CONDITIONS
  // ======================================================

  fetchTermsContent: async (placeId) => {
    if (!placeId) {
      set({ currentTermsContent: "" })
      return
    }

    set({ isContentLoading: true })
    try {
      const res = await apiClient.get(`/admin/tnc/${placeId}`)
      set({
        currentTermsContent: res.data.tnc.terms_And_condition || "",
        isContentLoading: false,
      })
    } catch (error) {
      console.error("Fetch TNC error:", error)
      set({
        currentTermsContent: "Failed to load content.",
        isContentLoading: false,
      })
    }
  },

  updateTermsContent: async (data) => {
    try {
      const res = await apiClient.patch(`/admin/tnc`, data)
      toast.success("Terms and conditions saved successfully!")
      set({
        currentTermsContent: res.data.data.terms_And_condition || "",
      })
      return { success: true }
    } catch (error) {
      console.error("Update TNC error:", error)
      toast.error("Something went wrong while saving.")
      return { success: false }
    }
  },

  // ======================================================
  // BACKWARD COMPATIBILITY (DO NOT REMOVE)
  // ======================================================

  get termsList() {
    return get().destinationList
  },
  get galleryPlaces() {
    return get().destinationList
  },
  get itineraryPlaces() {
    return get().destinationList
  },

  fetchTermsList: (travelType) => get().fetchDestinationList(travelType),
  fetchGalleryPlaces: (travelType) => get().fetchDestinationList(travelType),
  fetchItineraryPlaces: (travelType) => get().fetchDestinationList(travelType),
}))
