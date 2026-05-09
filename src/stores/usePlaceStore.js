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
      // Correct route: POST /admin/city (admin.route.js L190)
      await apiClient.post(`/admin/city`, cityData)
      toast.success("City created successfully!")
      return { success: true }
    } catch (error) {
      console.error('[createCity] Failed:', error?.response?.data || error?.message)
      toast.error(error.response?.data?.msg || "Failed to create city.")
      return { success: false }
    }
  },

  // Fetch cities belonging to a specific destination (state).
  // Correct route: GET /admin/state/:destinationId (admin.route.js L191)
  // Response shape: { citiesData: [...] }
  fetchCitiesByDestination: async (destinationId) => {
    if (!destinationId) return
    set({ isListLoading: true })
    try {
      const res = await apiClient.get(`/admin/state/${destinationId}`)
      set({ cityList: res.data.citiesData || [], isListLoading: false })
    } catch (error) {
      console.error('[fetchCitiesByDestination] Failed:', error?.response?.data || error?.message)
      set({ cityList: [], isListLoading: false })
    }
  },

  deleteCity: async (id) => {
    set({ isListLoading: true })
    try {
      // Correct route: DELETE /admin/city/:cityId (admin.route.js L194)
      await apiClient.delete(`/admin/city/${id}`)
      toast.success("City deleted successfully!")
      // Optimistically remove from local list without needing a destinationId to refetch
      set((state) => ({ cityList: state.cityList.filter((c) => c._id !== id), isListLoading: false }))
    } catch (error) {
      console.error('[deleteCity] Failed:', error?.response?.data || error?.message)
      toast.error("Failed to delete city.")
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
