import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { 
    CoreDetailsSection, 
    DayInfoSection, 
    HotelDetailsSection 
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
import { Loader2, Heart, Sparkles, Navigation, ShieldCheck } from "lucide-react";

const CreateItineriesPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

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
                        destination_type: data.destination_type || "domestic",
                        selected_destination_id: data.selected_destination?._id || data.selected_destination || "",
                        duration: data.duration || "",
                        days_information: data.days_information || [],
                        destination_detail: data.destination_detail || "",
                        destination_images: data.destination_images || [],
                        destination_images_files: [],
                        destination_thumbnails: data.destination_thumbnails || [],
                        destination_thumbnails_files: [],
                        inclusion: data.inclusion || "",
                        exclusion: data.exclusion || "",
                        hotel_as_per_category: data.hotel_as_per_category || "",
                        pricing: data.pricing || "",
                        terms_and_conditions: data.terms_and_conditions || "",
                        payment_mode: data.payment_mode || "",
                        cancellation_policy: data.cancellation_policy || "",
                        video: null,
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
        days_information: [{ day: "1", locationName: "", locationDetail: "" }],
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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const handleArrayChange = (e, index, arrayName) => {
        const { name, value } = e.target;
        const updated = [...formData[arrayName]];
        updated[index][name] = value;
        setFormData((prev) => ({ ...prev, [arrayName]: updated }));
    };

    const handleAddItem = (arrayName, newItem) => {
        setFormData((prev) => ({ ...prev, [arrayName]: [...prev[arrayName], newItem] }));
    };

    const handleRemoveItem = (index, arrayName) => {
        setFormData((prev) => ({ ...prev, [arrayName]: prev[arrayName].filter((_, i) => i !== index) }));
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

        const hasProvidedImage = formData.destination_images.some((i) => typeof i === 'string' && i.startsWith('http'));
        const hasUploadedImage = (formData.destination_images_files || []).length > 0;
        if (!hasProvidedImage && !hasUploadedImage) newErrors.destination_images = "At least one image required";

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
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        const toastId = toast.loading("Saving itinerary... 💍");
        setIsSubmitting(true);

        try {
            const itineraryFolder = `itinerary/${formData.destination_type.charAt(0).toUpperCase() + formData.destination_type.slice(1)}/${formData.title.replace(/\s+/g, '_')}`;

            // Helper for parallel uploads
            const uploadFile = async (file, subfolder) => {
                if (!file) return null;
                const presignedRes = await apiClient.post("/admin/generate-presigned-url", { 
                    fileName: file.name, 
                    fileType: file.type, 
                    folder: `${itineraryFolder}/${subfolder}` 
                });
                const { uploadUrl, key } = presignedRes.data;
                
                // Use a timeout to prevent hanging forever
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

                try {
                    await fetch(uploadUrl, { 
                        method: "PUT", 
                        body: file, 
                        headers: { "Content-Type": file.type },
                        signal: controller.signal
                    });
                    return key;
                } finally {
                    clearTimeout(timeoutId);
                }
            };

            // 1. Upload Gallery Images & Thumbnails in parallel
            const imageUploadPromises = (formData.destination_images_files || []).map(file => uploadFile(file, 'images'));
            const thumbUploadPromises = (formData.destination_thumbnails_files || []).map(file => uploadFile(file, 'thumbnails'));
            
            // 2. Upload Day Images in parallel
            const dayImagePromises = formData.days_information.map(day => 
                day.day_image_file ? uploadFile(day.day_image_file, 'days') : Promise.resolve(null)
            );

            // 3. Upload Video
            const videoPromise = formData.video instanceof File ? uploadFile(formData.video, 'videos') : Promise.resolve(null);

            // Wait for everything
            const [uploadedImageKeys, uploadedThumbnailKeys, dayImageKeys, uploadedVideoKey] = await Promise.all([
                Promise.all(imageUploadPromises),
                Promise.all(thumbUploadPromises),
                Promise.all(dayImagePromises),
                videoPromise
            ]);

            const updatedDaysInfo = formData.days_information.map((day, idx) => {
                const dayObj = { ...day };
                if (dayImageKeys[idx]) dayObj.day_image = dayImageKeys[idx];
                delete dayObj.day_image_file;
                return dayObj;
            });

            const payload = {
                ...formData,
                days_information: updatedDaysInfo,
                destination_images: [
                    ...formData.destination_images.filter(img => typeof img === 'string' && img.startsWith('http')), 
                    ...uploadedImageKeys.filter(k => k !== null)
                ],
                destination_thumbnails: [
                    ...formData.destination_thumbnails.filter(img => typeof img === 'string' && img.startsWith('http')), 
                    ...uploadedThumbnailKeys.filter(k => k !== null)
                ],
                video_key: uploadedVideoKey || undefined
            };

            delete payload.destination_images_files;
            delete payload.destination_thumbnails_files;
            delete payload.video;

            const res = id ? await apiClient.patch(`/admin/itinerary/${id}`, payload) : await apiClient.post("/admin/itinerary", payload);

            toast.update(toastId, { render: "Itinerary saved successfully! ✨", type: "success", isLoading: false, autoClose: 3000 });
            setTimeout(() => navigate("/itineraries/list"), 1500);
        } catch (err) {
            console.error("Save Itinerary Error:", err);
            toast.update(toastId, { render: err.name === 'AbortError' ? "Upload timed out" : "Failed to save itinerary", type: "error", isLoading: false, autoClose: 5000 });
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
                day_image: prev.days_information[i]?.day_image || "",
                day_image_file: null,
            }));
            return { ...prev, days_information: updated };
        });
    }, [formData.duration]);

    const styleProps = {
        inputStyle: "w-full rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-4 text-slate-900 dark:text-slate-100 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all placeholder:text-slate-400",
        labelStyle: "flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2",
        cardStyle: "bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none",
        buttonStyle: "bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20",
        removeButtonStyle: "bg-red-500/10 text-red-500 px-4 py-2 rounded-xl text-xs font-bold hover:bg-red-500 hover:text-white transition-all",
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto space-y-8 pb-20 px-4">
            {/* HEADER */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                            <Navigation className="text-indigo-600" /> {id ? "EDIT ITINERARY" : "NEW ITINERARY"}
                        </h1>
                        <p className="text-slate-500 font-medium mt-1">Crafting unforgettable experiences for couples</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {id && (
                            <a 
                                href={`${import.meta.env.VITE_FRONTEND_SITE_URL}/itinerary/${id}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold uppercase tracking-widest hover:bg-indigo-50 dark:hover:bg-indigo-950/30 hover:text-indigo-600 transition-all border border-transparent hover:border-indigo-100 dark:hover:border-indigo-900/30"
                            >
                                <Sparkles size={14} className="text-amber-500" /> View Live
                            </a>
                        )}
                        <div className="bg-slate-50 dark:bg-slate-800 p-1.5 rounded-2xl flex">
                            {["domestic", "international"].map((t) => (
                                <button key={t} type="button" onClick={() => setFormData({...formData, destination_type: t})} className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${formData.destination_type === t ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-400'}`}>
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <CoreDetailsSection formData={formData} handleInputChange={handleInputChange} styles={styleProps} errors={errors} />
                <DiscriptionDetailsSection formData={formData} handleInputChange={handleInputChange} styles={styleProps} errors={errors} setFormData={setFormData} />
                <MediaSection formData={formData} setFormData={setFormData} styles={styleProps} errors={errors} />
                <DayInfoSection formData={formData} handleArrayChange={handleArrayChange} handleAddItem={handleAddItem} handleRemoveItem={handleRemoveItem} styles={styleProps} errors={errors} />
                <InclusionSection formData={formData} handleInputChange={handleInputChange} styles={styleProps} errors={errors} />
                <ExclusionSection formData={formData} handleInputChange={handleInputChange} styles={styleProps} errors={errors} />
                <HotelDetailsSection formData={formData} handleArrayChange={handleArrayChange} handleAddItem={handleAddItem} handleRemoveItem={handleRemoveItem} handleInputChange={handleInputChange} styles={styleProps} />
                <PricingSection formData={formData} handleInputChange={handleInputChange} styles={styleProps} />
                <TermsSection formData={formData} handleInputChange={handleInputChange} styles={styleProps} />
                <PaymentModeSection formData={formData} handleInputChange={handleInputChange} styles={styleProps} />
                <CancellationPolicySection formData={formData} handleInputChange={handleInputChange} styles={styleProps} />

                <div className="flex justify-end pt-8">
                    <button type="submit" disabled={isSubmitting} className="group relative bg-indigo-600 text-white px-10 py-5 rounded-[2rem] font-black text-lg shadow-2xl shadow-indigo-500/40 hover:bg-indigo-700 transition-all flex items-center gap-3 disabled:opacity-50 overflow-hidden">
                        {isSubmitting ? <Loader2 className="animate-spin" size={24} /> : <Heart size={24} />}
                        {isSubmitting ? 'Syncing...' : id ? 'Push Changes' : 'Commit Itinerary'}
                    </button>
                </div>
            </form>
        </motion.div>
    );
};

export default CreateItineriesPage;
