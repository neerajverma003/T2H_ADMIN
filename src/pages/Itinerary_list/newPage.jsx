import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

import MediaSection from "./components/MediaSection";
import CoreDetails from "./components/CoreInfoSection";
import DayInfoSection from "./components/DayInfoSection";
import DescriptionsSection from "./components/DescriptionSection";
import HotelDetailsSection from "./components/HotelDetailsSection";
import PricingSection from "./components/PricingSection";

import { apiClient } from "../../stores/authStores";

const ItineraryDetailsPage = () => {
    const { id } = useParams();
    const [formData, setFormData] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // 🔹 Normalize API response (UNCHANGED)
    const normalizeItineraryData = (data) => ({
        ...data,
        days_information: data.days_information || [],
        destination_images: data.destination_images || [],
        destination_thumbnails: data.destination_thumbnails || [],
        itinerary_theme: data.itinerary_theme || [],
        classification: data.classification || [],
    });

    // 🔹 Handlers (UNCHANGED)
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleArrayChange = (e, index, arrayName) => {
        const { name, value } = e.target;
        const newArray = [...formData[arrayName]];
        newArray[index][name] = value;
        setFormData((prev) => ({ ...prev, [arrayName]: newArray }));
    };

    const handleAddItem = (arrayName, newItem) => {
        setFormData((prev) => ({
            ...prev,
            [arrayName]: [...prev[arrayName], newItem],
        }));
    };

    const handleRemoveItem = (index, arrayName) => {
        const newArray = formData[arrayName].filter((_, i) => i !== index);
        setFormData((prev) => ({ ...prev, [arrayName]: newArray }));
    };

    // 🔹 Fetch data (UNCHANGED)
    useEffect(() => {
        const fetchItineraryData = async () => {
            try {
                setIsLoading(true);
                const res = await apiClient.get(
                    `/admin/itinerary-details/${id}`
                );

                const data = normalizeItineraryData(res.data.data);

                if (data.selected_destination) {
                    data.selected_destination_id =
                        data.selected_destination._id;
                    data.selected_destination_name =
                        data.selected_destination.destination_name;
                    data.destination_type =
                        data.selected_destination.destination_type || [];
                }

                setFormData(data);
            } catch {
                toast.error("Failed to fetch itinerary");
            } finally {
                setIsLoading(false);
            }
        };
        fetchItineraryData();
    }, [id]);

    // 🔹 Update (UNCHANGED)
    const handleUpdate = async () => {
        try {
            setIsLoading(true);
            const formDataToSend = new FormData();

            Object.entries(formData).forEach(([key, value]) => {
                if (
                    [
                        "days_information",
                        "classification",
                        "itinerary_theme",
                        "destination_images",
                        "destination_thumbnails",
                    ].includes(key)
                ) {
                    formDataToSend.append(key, JSON.stringify(value));
                } else if (key === "destination_video") {
                    if (value instanceof File) {
                        formDataToSend.append(key, value);
                    }
                } else if (key === "selected_destination_id") {
                    formDataToSend.append("selected_destination_id", value);
                } else if (
                    value !== null &&
                    value !== undefined &&
                    key !== "selected_destination_name" &&
                    key !== "selected_destination"
                ) {
                    formDataToSend.append(key, value);
                }
            });

            await apiClient.patch(`/admin/itinerary/${id}`, formDataToSend);

            toast.success("Honeymoon itinerary updated 💍");
            setIsEditing(false);
        } catch {
            toast.error("Failed to update itinerary");
        } finally {
            setIsLoading(false);
        }
    };

    if (!formData || isLoading) {
        return (
            <p className="p-8 text-center text-gray-500">
                Loading honeymoon itinerary…
            </p>
        );
    }

    // 🎨 VISUAL STYLES ONLY
    const styleProps = {
        inputStyle:
            "block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 p-2 text-gray-900 dark:text-white shadow-sm focus:border-pink-400 focus:ring-2 focus:ring-pink-200",
        labelStyle:
            "block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1",
        cardStyle:
            "bg-white dark:bg-gray-800 p-6 rounded-xl shadow border border-gray-200 dark:border-gray-700",
        buttonStyle:
            "flex items-center gap-2 rounded-md bg-pink-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-pink-700",
        removeButtonStyle:
            "flex items-center gap-2 rounded-md bg-red-500 px-3 py-2 text-sm font-semibold text-white shadow hover:bg-red-600",
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 p-6 dark:from-gray-900 dark:to-gray-800">
            <div className="mx-auto max-w-6xl">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-pink-600">
                        {isEditing
                            ? "Edit Honeymoon Itinerary 💕"
                            : "Honeymoon Itinerary Details 💍"}
                    </h1>

                    <div className="flex gap-2">
                        <button
                            onClick={
                                isEditing
                                    ? handleUpdate
                                    : () => setIsEditing(true)
                            }
                            className={`rounded-md px-4 py-2 text-white ${
                                isEditing
                                    ? "bg-green-600 hover:bg-green-700"
                                    : "bg-pink-600 hover:bg-pink-700"
                            }`}
                            disabled={isLoading}
                        >
                            {isLoading
                                ? "Processing..."
                                : isEditing
                                ? "Save Changes"
                                : "Edit"}
                        </button>

                        {isEditing && (
                            <button
                                onClick={() => setIsEditing(false)}
                                className="rounded-md bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
                                disabled={isLoading}
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </div>

                {/* Sections */}
                <div className="space-y-8">
                    <CoreDetails
                        formData={formData}
                        handleInputChange={handleInputChange}
                        setFormData={setFormData}
                        isEditing={isEditing}
                        styles={styleProps}
                    />

                    <DayInfoSection
                        formData={formData}
                        handleInputChange={handleInputChange}
                        handleArrayChange={handleArrayChange}
                        handleAddItem={handleAddItem}
                        handleRemoveItem={handleRemoveItem}
                        setFormData={setFormData}
                        isEditing={isEditing}
                        styles={styleProps}
                    />

                    <PricingSection
                        formData={formData}
                        setFormData={setFormData}
                        handleInputChange={handleInputChange}
                        isEditing={isEditing}
                        styles={styleProps}
                    />

                    <MediaSection
                        formData={formData}
                        setFormData={setFormData}
                        handleInputChange={handleInputChange}
                        isEditing={isEditing}
                        styles={styleProps}
                    />

                    <DescriptionsSection
                        formData={formData}
                        setFormData={setFormData}
                        handleInputChange={handleInputChange}
                        isEditing={isEditing}
                        styles={styleProps}
                    />

                    <HotelDetailsSection
                        formData={formData}
                        setFormData={setFormData}
                        handleInputChange={handleInputChange}
                        isEditing={isEditing}
                        styles={styleProps}
                    />
                </div>
            </div>
        </div>
    );
};

export default ItineraryDetailsPage;
