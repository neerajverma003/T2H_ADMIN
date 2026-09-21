import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { convertImageFileToWebP } from "../../utils/imageConverter";
import {
    CoreDetailsSection,
    DayInfoSection,
    MediaSection,
    ProvisionsSection,
    HotelDetailsSection,
    PricingSection,
    CuratedAddonsSection,
} from "./components";

import DiscriptionDetailsSection from "./components/DiscriptionDetailsSection";
import { extractDaysAndNights } from "../../utils/extractDaysFromDuration";
import { apiClient } from "../../stores/authStores";
import { Loader2, Heart, Sparkles, Navigation, ShieldCheck } from "lucide-react";

const CreateItineriesPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const isViewMode = location.pathname.includes('/view/');

    // Scroll main container to top on mount
    useEffect(() => {
        const mainEl = document.querySelector('main');
        if (mainEl) {
            mainEl.scrollTo({ top: 0, behavior: 'instant' });
        }
    }, [id, location.pathname]);

    // ========================
    // DATA FETCHING (FOR EDIT)
    // ========================
    useEffect(() => {
        if (!id) return;

        const fetchItinerary = async () => {
            try {
                const res = await apiClient.get(`/admin/itinerary/${id}`);
                const data = res.data.data || res.data.itinerary;

                if (data) {
                    setFormData({
                        title: data.title || "",
                        travel_type: data.travel_type || "honeymoon",
                        itinerary_type: data.itinerary_type || "flexible",
                        itinerary_visibility: data.itinerary_visibility || "public",
                        classification: data.classification || [],
                        itinerary_theme: data.itinerary_theme || [],
                        destination_type: data.selected_destination?.domestic_or_international?.toLowerCase() || data.destination_type || "domestic",
                        selected_destination_id: data.selected_destination?._id || data.selected_destination || "",
                        duration: data.duration || "",
                        days_information: (data.days_information || []).map(day => ({
                            ...day,
                            day_images: day.day_images || (day.day_image ? [day.day_image] : []),
                            day_images_files: []
                        })),
                        destination_detail: data.destination_detail || "",
                        destination_images: data.destination_images || [],
                        destination_images_files: [],
                        destination_thumbnails: data.destination_thumbnails || [],
                        destination_thumbnails_files: [],
                        inclusion: data.inclusion || "",
                        exclusion: data.exclusion || "",
                        hotel_as_per_category: data.hotel_as_per_category || "",
                        stay_hotels: (data.stay_hotels || []).map(s => ({
                            location: s.location || "",
                            standard_hotel: s.standard_hotel?._id || s.standard_hotel || "",
                            deluxe_hotel: s.deluxe_hotel?._id || s.deluxe_hotel || "",
                            super_deluxe_hotel: s.super_deluxe_hotel?._id || s.super_deluxe_hotel || "",
                            luxury_hotel: s.luxury_hotel?._id || s.luxury_hotel || ""
                        })),
                        pricing: data.pricing || "",
                        terms_and_conditions: data.terms_and_conditions || "",
                        payment_mode: data.payment_mode || "",
                        cancellation_policy: data.cancellation_policy || "",
                        about_the_tour: data.about_the_tour || "",
                        video: null,
                        reviews: data.reviews || [],
                        addons: data.addons || [],
                    });
                }
            } catch (error) {
                console.error("Fetch Itinerary Error:", error);
                toast.error("Failed to load itinerary data");
            }
        };

        fetchItinerary();
    }, [id]);

    const [formData, setFormData] = useState({
        title: "",
        travel_type: "honeymoon",
        itinerary_type: "flexible",
        itinerary_visibility: "public",
        classification: ["Honeymoon Special"],
        itinerary_theme: ["Honeymoon", "Romantic"],
        destination_type: "domestic",
        selected_destination_id: "",
        duration: "",
        days_information: [{
            day: "1",
            locationName: "",
            locationDetail: "",
            sightseeing: "",
            transfer: "",
            weather: "",
            date: "",
            day_image: "",
            day_image_file: null,
            day_images: [],
            day_images_files: []
        }],
        destination_detail: "",
        destination_images: [],
        destination_images_files: [],
        destination_thumbnails: [],
        destination_thumbnails_files: [],
        inclusion: "",
        exclusion: "",
        hotel_as_per_category: "",
        stay_hotels: [],
        pricing: "",
        terms_and_conditions: "",
        payment_mode: "",
        cancellation_policy: "",
        about_the_tour: "",
        reviews: [],
        addons: [],
    });

    const [errors, setErrors] = useState({});

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        // Handle Custom Days Sync
        if (name === "custom_days_trigger") {
            const days = parseInt(value) || 1;
            setFormData((prev) => {
                const updated = Array.from({ length: days }, (_, i) => ({
                    day: `${i + 1}`,
                    locationName: prev.days_information[i]?.locationName || "",
                    locationDetail: prev.days_information[i]?.locationDetail || "",
                    sightseeing: prev.days_information[i]?.sightseeing || "",
                    transfer: prev.days_information[i]?.transfer || "",
                    weather: prev.days_information[i]?.weather || "",
                    date: prev.days_information[i]?.date || "",
                    day_image: prev.days_information[i]?.day_image || "",
                    day_image_file: null,
                    day_images: prev.days_information[i]?.day_images || [],
                    day_images_files: prev.days_information[i]?.day_images_files || []
                }));
                return { ...prev, days_information: updated };
            });
            return;
        }

        // Handle 'Custom' Selection Reset
        if (name === "itinerary_type" && value === "flexible") {
            setFormData((prev) => ({
                ...prev,
                itinerary_type: value,
                days_information: [{
                    day: "1",
                    locationName: "",
                    locationDetail: "",
                    sightseeing: "",
                    transfer: "",
                    weather: "",
                    date: "",
                    day_image: "",
                    day_image_file: null,
                    day_images: [],
                    day_images_files: []
                }]
            }));
            return;
        }

        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    // Auto-fetch Category Payment Terms and Cancellation Policy when destination_type changes
    useEffect(() => {
        const type = formData.destination_type || 'domestic';
        const fetchCategoryPolicies = async () => {
            try {
                const [payRes, cancelRes] = await Promise.all([
                    apiClient.get(`/admin/honeymoon/payment-mode/${type}`),
                    apiClient.get(`/admin/honeymoon-cancellation-policy?type=${type}`)
                ]);

                const payText = payRes.data?.destinationPaymentModeData?.payment_mode ||
                    payRes.data?.destinationPaymentModeData?.honeymoon_payment_mode;
                const cancelText = cancelRes.data?.data?.honeymoon_cancellation_policy;

                setFormData((prev) => ({
                    ...prev,
                    payment_mode: (prev.payment_mode && prev.payment_mode.trim()) ? prev.payment_mode : (payText || ""),
                    cancellation_policy: (prev.cancellation_policy && prev.cancellation_policy.trim()) ? prev.cancellation_policy : (cancelText || ""),
                }));
            } catch (err) {
                console.error("Error fetching category policies:", err);
            }
        };

        fetchCategoryPolicies();
    }, [formData.destination_type]);

    // Auto-fetch Destination-specific Terms & Conditions when selected_destination_id changes
    useEffect(() => {
        const destId = formData.selected_destination_id;
        if (!destId) return;

        const fetchDestinationTerms = async () => {
            try {
                const res = await apiClient.get(`/admin/tnc/${destId}`);
                if (res.data?.success && res.data?.tnc && res.data.tnc.terms_And_condition) {
                    setFormData((prev) => ({
                        ...prev,
                        terms_and_conditions: res.data.tnc.terms_And_condition,
                    }));
                } else {
                    setFormData((prev) => ({
                        ...prev,
                        terms_and_conditions: "",
                    }));
                }
            } catch (err) {
                console.error("Error fetching destination terms:", err);
            }
        };

        fetchDestinationTerms();
    }, [formData.selected_destination_id]);

    const handleArrayChange = (e, index, arrayName) => {
        const { name, value } = e.target;
        setFormData((prev) => {
            const updatedArray = [...prev[arrayName]];
            // Create a fresh copy of the object at this index to avoid mutation
            updatedArray[index] = { ...updatedArray[index], [name]: value };
            return { ...prev, [arrayName]: updatedArray };
        });
    };

    const handleAddItem = (arrayName, newItem) => {
        setFormData((prev) => ({
            ...prev,
            [arrayName]: [...(prev[arrayName] || []), newItem]
        }));
    };

    const handleRemoveItem = (index, arrayName) => {
        setFormData((prev) => ({
            ...prev,
            [arrayName]: prev[arrayName].filter((_, i) => i !== index)
        }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.title.trim()) newErrors.title = "Title is required";
        if (!formData.travel_type) newErrors.travel_type = "Travel type required";
        if (!formData.selected_destination_id) newErrors.selected_destination_id = "Destination required";
        if (!formData.duration) newErrors.duration = "Duration required";
        if (!formData.destination_detail.trim()) newErrors.destination_detail = "Destination detail required";
        if (!formData.inclusion.trim()) newErrors.inclusion = "Inclusions required";
        if (!formData.exclusion.trim()) newErrors.exclusion = "Exclusions required";

        const invalidDays = formData.days_information.some((d) => !d.locationName.trim() || !d.locationDetail.trim());
        if (invalidDays) newErrors.days_information = "All days must have location name & detail";

        // Accept media from either custom gallery OR destination source asset thumbnails
        const hasCustomGallery = formData.destination_images.some((i) => typeof i === 'string' && i.trim() !== '');
        const hasUploadedGallery = (formData.destination_images_files || []).length > 0;
        const hasThumbnails = formData.destination_thumbnails.some((i) => typeof i === 'string' && i.trim() !== '');
        const hasUploadedThumbnails = (formData.destination_thumbnails_files || []).length > 0;
        if (!hasCustomGallery && !hasUploadedGallery && !hasThumbnails && !hasUploadedThumbnails) {
            newErrors.destination_images = "At least one image is required (select from Source Assets or upload a custom image)";
        }

        setErrors(newErrors);
        const keys = Object.keys(newErrors);
        return { valid: keys.length === 0, firstErrorKey: keys[0], firstErrorMessage: keys.length ? newErrors[keys[0]] : null };
    };

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validation = validateForm();
        if (!validation.valid) {
            toast.error(validation.firstErrorMessage || "Please fix errors");
            const mainEl = document.querySelector('main');
            if (mainEl) {
                mainEl.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
            return;
        }

        const toastId = toast.loading("Saving itinerary... 💍");
        setIsSubmitting(true);

        try {
            const itineraryFolder = `itinerary/${formData.destination_type.charAt(0).toUpperCase() + formData.destination_type.slice(1)}/${formData.title.replace(/\s+/g, '_')}`;

            // Helper for parallel uploads
            const uploadFile = async (file, subfolder) => {
                if (!file) return null;
                let fileToUpload = file;
                if (file.type?.startsWith('image/')) {
                    fileToUpload = await convertImageFileToWebP(file);
                }
                const presignedRes = await apiClient.post("/admin/generate-presigned-url", {
                    fileName: fileToUpload.name,
                    fileType: fileToUpload.type,
                    folder: `${itineraryFolder}/${subfolder}`
                });
                const { uploadUrl, key } = presignedRes.data;

                // Use a timeout to prevent hanging forever
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

                try {
                    await fetch(uploadUrl, {
                        method: "PUT",
                        body: fileToUpload,
                        headers: { "Content-Type": fileToUpload.type },
                        signal: controller.signal,
                    });
                    return key;
                } finally {
                    clearTimeout(timeoutId);
                }
            };

            // 1. Upload Gallery Images & Thumbnails in parallel
            const imageUploadPromises = (formData.destination_images_files || []).map(file => uploadFile(file, 'images'));
            const thumbUploadPromises = (formData.destination_thumbnails_files || []).map(file => uploadFile(file, 'thumbnails'));

            // 2. Upload Day Images in parallel (multiple files per day)
            const dayImagesPromises = formData.days_information.map(async (day) => {
                const newUploadPromises = (day.day_images_files || []).map(file => uploadFile(file, 'days'));
                const newKeys = await Promise.all(newUploadPromises);
                return {
                    day_images: [
                        ...(day.day_images || []),
                        ...newKeys.filter(Boolean)
                    ]
                };
            });

            // 3. Upload Review Profile Images in parallel
            const reviewImagePromises = (formData.reviews || []).map(rev =>
                rev.profileImage_file ? uploadFile(rev.profileImage_file, 'reviews') : Promise.resolve(null)
            );

            // 4. Wait for everything
            const [uploadedImageKeys, uploadedThumbnailKeys, uploadedDayImagesResults, reviewImageKeys] = await Promise.all([
                Promise.all(imageUploadPromises),
                Promise.all(thumbUploadPromises),
                Promise.all(dayImagesPromises),
                Promise.all(reviewImagePromises)
            ]);

            const updatedDaysInfo = formData.days_information.map((day, idx) => {
                const dayObj = { ...day };
                dayObj.day_images = uploadedDayImagesResults[idx].day_images;
                // Maintain backward compatibility by keeping day_image as the first element of day_images
                dayObj.day_image = dayObj.day_images[0] || "";
                delete dayObj.day_images_files;
                delete dayObj.day_image_file;
                return dayObj;
            });

            const updatedReviews = (formData.reviews || []).map((rev, idx) => {
                const revObj = { ...rev };
                if (reviewImageKeys[idx]) revObj.profileImage = reviewImageKeys[idx];
                delete revObj.profileImage_file;
                return revObj;
            });

            const cleanedStayHotels = (formData.stay_hotels || []).map(item => ({
                location: item.location || "",
                standard_hotel: item.standard_hotel || null,
                deluxe_hotel: item.deluxe_hotel || null,
                super_deluxe_hotel: item.super_deluxe_hotel || null,
                luxury_hotel: item.luxury_hotel || null,
            }));

            const payload = {
                ...formData,
                days_information: updatedDaysInfo,
                reviews: updatedReviews,
                stay_hotels: JSON.stringify(cleanedStayHotels),
                destination_images: [
                    ...formData.destination_images.filter(img => typeof img === 'string' && img.trim() !== '' && !img.startsWith('data:')),
                    ...uploadedImageKeys.filter(k => k !== null)
                ],
                destination_thumbnails: [
                    ...formData.destination_thumbnails.filter(img => typeof img === 'string' && img.trim() !== '' && !img.startsWith('data:')),
                    ...uploadedThumbnailKeys.filter(k => k !== null)
                ]
            };

            delete payload.destination_images_files;
            delete payload.destination_thumbnails_files;

            const res = id ? await apiClient.patch(`/admin/itinerary/${id}`, payload) : await apiClient.post("/admin/itinerary", payload);

            toast.dismiss(toastId);
            const successMsg = id ? "Itinerary updated successfully! ✨" : "Itinerary created successfully! 🎉";
            toast.success(successMsg);
            setTimeout(() => navigate("/itineraries/list"), 1500);
        } catch (err) {
            console.error("Save Itinerary Error:", err);
            toast.dismiss(toastId);
            const serverMsg = err.response?.data?.message || err.response?.data?.msg || (err.name === 'AbortError' ? "Upload timed out" : "Failed to save itinerary");
            if (
                err.response?.status === 409 ||
                err.response?.data?.error === 'DUPLICATE_ITINERARY_TITLE' ||
                (typeof serverMsg === 'string' && (serverMsg.toLowerCase().includes('already exists') || serverMsg.toLowerCase().includes('duplicate')))
            ) {
                toast.warning(serverMsg || "An itinerary with this title already exists. Please use a different title.");
            } else {
                toast.error(serverMsg);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        if (!formData.duration || formData.duration === "Custom") return;
        const { days } = extractDaysAndNights(formData.duration);
        setFormData((prev) => {
            if (prev.days_information.length === days) return prev;
            const updated = Array.from({ length: days }, (_, i) => ({
                day: `${i + 1}`,
                locationName: prev.days_information[i]?.locationName || "",
                locationDetail: prev.days_information[i]?.locationDetail || "",
                sightseeing: prev.days_information[i]?.sightseeing || "",
                transfer: prev.days_information[i]?.transfer || "",
                weather: prev.days_information[i]?.weather || "",
                date: prev.days_information[i]?.date || "",
                day_image: prev.days_information[i]?.day_image || "",
                day_image_file: null,
                day_images: prev.days_information[i]?.day_images || [],
                day_images_files: prev.days_information[i]?.day_images_files || []
            }));
            return { ...prev, days_information: updated };
        });
    }, [formData.duration]);

    const styleProps = {
        inputStyle: "w-full rounded-2xl border border-slate-200 dark:border-slate-800/90 bg-slate-50/90 dark:bg-[#050A17] p-4 text-sm font-semibold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-[#050A17] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 placeholder:font-normal shadow-inner hover:border-indigo-500/40",
        labelStyle: "flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2.5 ml-0.5",
        cardStyle: "bg-white dark:bg-[#091126]/95 rounded-3xl p-7 md:p-9 border border-slate-200/90 dark:border-indigo-500/25 shadow-xl dark:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.7),0_0_30px_2px_rgba(99,102,241,0.18)] ring-1 ring-slate-900/5 dark:ring-white/5 backdrop-blur-xl space-y-7 transition-all",
        buttonStyle: "px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-sm shadow-xl shadow-blue-600/30 transition-all cursor-pointer active:scale-[0.98] uppercase tracking-wider",
        removeButtonStyle: "bg-red-500/10 hover:bg-red-600 hover:text-white text-red-500 dark:text-red-400 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer",
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8 pb-16">
            {/* TOP HEADER CARD */}
            <div className="bg-white dark:bg-[#091126]/95 rounded-3xl py-4 sm:py-5 px-6 sm:px-8 border border-slate-200/90 dark:border-indigo-500/25 shadow-xl dark:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.7),0_0_30px_2px_rgba(99,102,241,0.18)] ring-1 ring-slate-900/5 dark:ring-white/5 backdrop-blur-xl relative overflow-hidden">
                <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                            <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-500/30 shrink-0">
                                <Navigation size={22} />
                            </div>
                            <span>
                                {isViewMode ? "VIEW ITINERARY" : id ? "EDIT ITINERARY" : <>NEW <span className="text-blue-500">ITINERARY</span></>}
                            </span>
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 font-semibold mt-1 text-xs sm:text-sm">
                            Crafting unforgettable experiences for couples
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <fieldset disabled={isViewMode} className="border-none p-0 m-0">
                            <div className="bg-slate-100 dark:bg-[#050A17] p-1.5 rounded-2xl flex border border-slate-200 dark:border-slate-800/90 shadow-inner">
                                {["domestic", "international"].map((t) => (
                                    <button
                                        key={t}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, destination_type: t })}
                                        className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                                            formData.destination_type === t
                                                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                                                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                                        }`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </fieldset>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-10 md:gap-12">
                <fieldset disabled={isViewMode} className="border-none p-0 m-0 min-w-0 flex flex-col gap-10 md:gap-12">
                    <CoreDetailsSection formData={formData} handleInputChange={handleInputChange} styles={styleProps} errors={errors} />
                    <DiscriptionDetailsSection formData={formData} handleInputChange={handleInputChange} styles={styleProps} errors={errors} setFormData={setFormData} />
                    <MediaSection formData={formData} setFormData={setFormData} styles={styleProps} errors={errors} />
                    <DayInfoSection isViewMode={isViewMode} formData={formData} handleArrayChange={handleArrayChange} handleAddItem={handleAddItem} handleRemoveItem={handleRemoveItem} styles={styleProps} errors={errors} />
                    <ProvisionsSection formData={formData} handleInputChange={handleInputChange} styles={styleProps} errors={errors} />
                    {/* <CuratedAddonsSection formData={formData} setFormData={setFormData} isViewMode={isViewMode} styles={styleProps} /> */}
                    <HotelDetailsSection formData={formData} setFormData={setFormData} handleArrayChange={handleArrayChange} handleAddItem={handleAddItem} handleRemoveItem={handleRemoveItem} handleInputChange={handleInputChange} styles={styleProps} />
                    <PricingSection formData={formData} setFormData={setFormData} handleInputChange={handleInputChange} styles={styleProps} />
                </fieldset>

                {!isViewMode && (
                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full sm:w-auto px-10 py-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white rounded-2xl font-bold text-sm shadow-xl shadow-blue-600/30 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider cursor-pointer"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Heart size={20} />}
                            {isSubmitting ? "Syncing..." : id ? "Push Changes" : "Commit Itinerary"}
                        </button>
                    </div>
                )}
            </form>
        </motion.div>
    );
};

export default CreateItineriesPage;
