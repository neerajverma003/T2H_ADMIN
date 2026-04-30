import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import {
    CoreDetailsSection,
    DayInfoSection,
    HotelDetailsSection,
} from "./components";

import DiscriptionDetailsSection from "./components/DiscriptionDetailsSection";
import InclusionSection from "./components/InclusionSection";
import ExclusionSection from "./components/ExclusionSection";
import TermsSection from "./components/TermsSection";
import PaymentModeSection from "./components/PaymentModeSection";
import CancellationPolicySection from "./components/CancellationPolicySection";
import MediaSection from "./components/MediaSection";
import PricingSection from "./components/PricingSection";

import { extractDaysAndNights } from "../../utils/extractDaysFromDuration";
import { apiClient } from "../../stores/authStores";

const CreateItineriesPage = () => {
    const navigate = useNavigate();

    // ========================
    // STATE
    // ========================
    const [formData, setFormData] = useState({
        title: "",
        travel_type: "honeymoon",
        itinerary_type: "flexible",
        itinerary_visibility: "public",

        classification: ["Honeymoon Special"],
        itinerary_theme: ["Honeymoon", "Romantic"],

        destination_type: "domestic", // ✅ ADDED
        selected_destination_id: "",
        duration: "",

        days_information: [
            { day: "1", locationName: "", locationDetail: "" },
        ],

        destination_detail: "",
        destination_images: [],
        destination_images_files: [],
        destination_thumbnails: [],
        destination_thumbnails_files: [],

        inclusion: "",
        exclusion: "",
        hotel_as_per_category: "",
        pricing: "",

        terms_and_conditions: "",
        payment_mode: "",
        cancellation_policy: "",

        video: null,
    });

    const [errors, setErrors] = useState({});

    // ========================
    // INPUT HANDLERS
    // ========================
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const handleArrayChange = (e, index, arrayName) => {
        const { name, value } = e.target;
        const updated = [...formData[arrayName]];
        updated[index][name] = value;
        setFormData((prev) => ({ ...prev, [arrayName]: updated }));
    };

    const handleAddItem = (arrayName, newItem) => {
        setFormData((prev) => ({
            ...prev,
            [arrayName]: [...prev[arrayName], newItem],
        }));
    };

    const handleRemoveItem = (index, arrayName) => {
        setFormData((prev) => ({
            ...prev,
            [arrayName]: prev[arrayName].filter((_, i) => i !== index),
        }));
    };

    // ========================
    // VALIDATION
    // ========================
    const validateForm = () => {
        const newErrors = {};

        if (!formData.title.trim()) newErrors.title = "Title is required";
        if (!formData.travel_type) newErrors.travel_type = "Travel type required";
        if (!formData.selected_destination_id)
            newErrors.selected_destination_id = "Destination required";
        if (!formData.duration) newErrors.duration = "Duration required";
        if (!formData.destination_detail.trim())
            newErrors.destination_detail = "Destination detail required";
        if (!formData.inclusion.trim())
            newErrors.inclusion = "Inclusions required";
        if (!formData.exclusion.trim())
            newErrors.exclusion = "Exclusions required";

        const invalidDays = formData.days_information.some(
            (d) => !d.locationName.trim() || !d.locationDetail.trim()
        );
        if (invalidDays)
            newErrors.days_information =
                "All days must have location name & detail";

        // Ensure at least one destination image is provided either by selecting existing URL(s) or uploading files
        const hasProvidedImage = formData.destination_images.some(
            (i) => typeof i === 'string' && i.startsWith('http')
        );
        const hasUploadedImage = (formData.destination_images_files || []).length > 0;
        if (!hasProvidedImage && !hasUploadedImage)
            newErrors.destination_images = "At least one image required";

        setErrors(newErrors);

        // return an object with result + first error info for better UX
        const keys = Object.keys(newErrors);
        return {
            valid: keys.length === 0,
            firstErrorKey: keys[0],
            firstErrorMessage: keys.length ? newErrors[keys[0]] : null,
        };
    };

    // ========================
    // SUBMIT
    // ========================
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validation = validateForm();
        if (!validation.valid) {
            toast.error(validation.firstErrorMessage || "Please fix the highlighted errors");
            const el = validation.firstErrorKey && document.getElementById(validation.firstErrorKey);
            if (el) el.focus();
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        const toastId = toast.loading("Uploading media & creating itinerary... 💕");
        setIsSubmitting(true);

        try {
            const token = localStorage.getItem("token");
            const itineraryFolder = `itinerary/${formData.destination_type.charAt(0).toUpperCase() + formData.destination_type.slice(1)}/${formData.title.replace(/\s+/g, '_')}`;

            // 1. Upload Images to S3
            const uploadedImageKeys = [];
            for (const file of (formData.destination_images_files || [])) {
                if (!file) continue;
                const presignedRes = await apiClient.post("/admin/generate-presigned-url", {
                    fileName: file.name,
                    fileType: file.type,
                    folder: `${itineraryFolder}/images`
                });
                const { uploadUrl, key } = presignedRes.data;
                await fetch(uploadUrl, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
                uploadedImageKeys.push(key);
            }

            // 2. Upload Thumbnails to S3
            const uploadedThumbnailKeys = [];
            for (const file of (formData.destination_thumbnails_files || [])) {
                if (!file) continue;
                const presignedRes = await apiClient.post("/admin/generate-presigned-url", {
                    fileName: file.name,
                    fileType: file.type,
                    folder: `${itineraryFolder}/thumbnails`
                });
                const { uploadUrl, key } = presignedRes.data;
                await fetch(uploadUrl, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
                uploadedThumbnailKeys.push(key);
            }

            // 3. Upload Video to S3
            let uploadedVideoKey = null;
            if (formData.video instanceof File) {
                const presignedRes = await apiClient.post("/admin/generate-presigned-url", {
                    fileName: formData.video.name,
                    fileType: formData.video.type,
                    folder: `${itineraryFolder}/videos`
                });
                const { uploadUrl, key } = presignedRes.data;
                await fetch(uploadUrl, { method: "PUT", body: formData.video, headers: { "Content-Type": formData.video.type } });
                uploadedVideoKey = key;
            }

            // 4. Prepare JSON Payload
            const payload = {
                ...formData,
                destination_images: [
                    ...formData.destination_images.filter(img => typeof img === 'string' && img.startsWith('http')),
                    ...uploadedImageKeys
                ],
                destination_thumbnails: [
                    ...formData.destination_thumbnails.filter(img => typeof img === 'string' && img.startsWith('http')),
                    ...uploadedThumbnailKeys
                ],
                video_key: uploadedVideoKey
            };

            // Remove file objects before sending
            delete payload.destination_images_files;
            delete payload.destination_thumbnails_files;
            delete payload.video;

            const res = await apiClient.post("/admin/itinerary", payload);

            toast.update(toastId, {
                render: "Honeymoon itinerary created successfully 💍",
                type: "success",
                isLoading: false,
                autoClose: 3000,
            });

            setTimeout(() => {
                navigate("/admin/itineraries");
            }, 1200);
        } catch (err) {
            console.error("Submit Error:", err);
            toast.update(toastId, {
                render: err.response?.data?.message || err.response?.data?.msg || "Something went wrong",
                type: "error",
                isLoading: false,
                autoClose: 5000,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // ========================
    // DAYS AUTO UPDATE
    // ========================
    useEffect(() => {
        if (!formData.duration || formData.duration === "Custom") return;

        const { days } = extractDaysAndNights(formData.duration);

        setFormData((prev) => {
            if (prev.days_information.length === days) return prev;

            const updated = Array.from({ length: days }, (_, i) => ({
                day: `${i + 1}`,
                locationName: prev.days_information[i]?.locationName || "",
                locationDetail: prev.days_information[i]?.locationDetail || "",
            }));

            return { ...prev, days_information: updated };
        });
    }, [formData.duration]);

    // ========================
    // STYLES
    // ========================
    const styleProps = {
        inputStyle:
            "block w-full rounded-md border p-2 bg-white dark:bg-gray-700 text-black dark:text-white",
        labelStyle:
            "block mb-1 text-sm font-medium text-black dark:text-white",
        cardStyle:
            "bg-white dark:bg-gray-800 p-6 rounded-lg shadow text-black dark:text-white",
        buttonStyle: "bg-blue-600 text-white px-4 py-2 rounded",
        removeButtonStyle: "bg-red-600 text-white px-4 py-2 rounded",
    };

    // ========================
    // RENDER
    // ========================
    return (
        <div className="min-h-screen p-6 bg-gray-100 dark:bg-gray-900">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-6 text-black dark:text-white">
                    Create Honeymoon Itinerary 💕
                </h1>

                <form onSubmit={handleSubmit} className="space-y-8">

                    {/* Destination Type */}
                    <div className={styleProps.cardStyle}>
                        <label className={styleProps.labelStyle}>
                            Destination Type
                        </label>
                        <select
                            name="destination_type"
                            value={formData.destination_type}
                            onChange={handleInputChange}
                            className={styleProps.inputStyle}
                        >
                            <option value="domestic">Domestic</option>
                            <option value="international">International</option>
                        </select>
                    </div>

                    <CoreDetailsSection
                        formData={formData}
                        handleInputChange={handleInputChange}
                        styles={styleProps}
                        errors={errors}
                    />

                    <DiscriptionDetailsSection
                        formData={formData}
                        handleInputChange={handleInputChange}
                        styles={styleProps}
                        errors={errors}
                    />

                    <MediaSection
                        formData={formData}
                        setFormData={setFormData}
                        styles={styleProps}
                        errors={errors}
                    />

                    <DayInfoSection
                        formData={formData}
                        handleArrayChange={handleArrayChange}
                        handleAddItem={handleAddItem}
                        handleRemoveItem={handleRemoveItem}
                        styles={styleProps}
                        errors={errors}
                    />

                    <InclusionSection
                        formData={formData}
                        handleInputChange={handleInputChange}
                        styles={styleProps}
                        errors={errors}
                    />

                    <ExclusionSection
                        formData={formData}
                        handleInputChange={handleInputChange}
                        styles={styleProps}
                        errors={errors}
                    />

                    <HotelDetailsSection
                        formData={formData}
                        handleArrayChange={handleArrayChange}
                        handleAddItem={handleAddItem}
                        handleRemoveItem={handleRemoveItem}
                        handleInputChange={handleInputChange}
                        styles={styleProps}
                    />

                    <PricingSection
                        formData={formData}
                        handleInputChange={handleInputChange}
                        styles={styleProps}
                    />

                    <TermsSection
                        formData={formData}
                        handleInputChange={handleInputChange}
                        styles={styleProps}
                    />

                    <PaymentModeSection
                        formData={formData}
                        handleInputChange={handleInputChange}
                        styles={styleProps}
                    />

                    <CancellationPolicySection
                        formData={formData}
                        handleInputChange={handleInputChange}
                        styles={styleProps}
                    />

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            className={`bg-green-600 text-white px-8 py-3 text-lg rounded shadow ${isSubmitting ? 'opacity-60 cursor-not-allowed' : ''}`}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Submitting…' : 'Submit Honeymoon Itinerary 💍'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateItineriesPage;
