import { create } from 'zustand';

export const useItineraryStore = create((set) => ({
    formData: {
        title: "",
        travel_type: "domestic",
        itinerary_visibility: "public",
        itinerary_type: "flexible",
        duration: "",
        selected_destination: "",
        itinerary_theme: ["Family"],
        destination_detail: "",
        inclusion: "",
        exclusion: "",
        terms_and_conditions: "All bookings are subject to availability. Cancellation charges may apply.",
        payment_mode: "",
        cancellation_policy: "",
        pricing: "",
        best_price: "",
        discount: "",
        destination_thumbnail: "",
        destination_images: [""],
        hotel_details: [{ type: "Delux", roomType: "", price: "", discount: "" }],
        days_information: [{ day: "1", locationName: "", locationDetail: "" }],
    },

    // Setter
    setFormData: (newData) =>
        set((state) => ({
            formData: {
                ...state.formData,
                ...newData,
            },
        })),
}));
