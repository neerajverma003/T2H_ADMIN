import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { apiClient } from "../../stores/authStores";
import { ENV } from "../../constants/api";
import { convertImageFileToWebP } from "../../utils/imageConverter";
import { toast } from "react-toastify";
import {
    Building2,
    MapPin,
    Globe,
    Phone,
    Mail,
    Calendar,
    ShieldCheck,
    Sparkles,
    Image as ImageIcon,
    Plus,
    X,
    Loader2,
    Eye,
    Pencil,
    Tag,
    CheckCircle2,
    Info,
    ArrowLeft,
    UploadCloud,
    Compass,
    Navigation,
    Percent,
    SlidersHorizontal,
    Maximize2,
    ChevronDown,
    Search,
    Clock,
    FileText
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const cardStyle = "bg-white dark:bg-[#091126]/95 rounded-3xl p-6 md:p-8 border border-slate-200/90 dark:border-indigo-500/25 shadow-xl dark:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.7),0_0_30px_2px_rgba(99,102,241,0.18)] ring-1 ring-slate-900/5 dark:ring-white/5 backdrop-blur-xl space-y-6 transition-all";
const inputStyle = "w-full rounded-2xl border border-slate-200 dark:border-slate-800/90 bg-slate-50/90 dark:bg-[#050A17] p-3.5 text-sm font-semibold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-[#050A17] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 placeholder:font-normal shadow-inner hover:border-indigo-500/40 disabled:opacity-60 disabled:cursor-not-allowed";
const selectStyle = "w-full rounded-2xl border border-slate-200 dark:border-slate-800/90 bg-slate-50/90 dark:bg-[#050A17] p-3.5 pr-10 text-sm font-semibold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-[#050A17] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 outline-none transition-all appearance-none cursor-pointer shadow-inner hover:border-indigo-500/40 disabled:opacity-60 disabled:cursor-not-allowed";
const labelStyle = "flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2 ml-0.5";

const HoneymoonResortForm = ({ editId, isViewMode: propIsViewMode }) => {
    const location = useLocation();
    const { id: paramId } = useParams();
    const id = editId || paramId;
    const isViewMode = propIsViewMode || location.pathname.includes('/view/');
    const [selectedImage, setSelectedImage] = useState(null);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        images: null,
        is_active: true,
        price_per_night: "",
        destination: "",
        city: "",
        state: "",
        country: "",
        address: "",
        duration_days: "",
        average_rating: "",
        review_count: "",
        number_of_ratings: "",
        inclusions: [],
        tags: [],
        visibility: "public",
        discount: "",
        start_date: "",
        end_date: "",
        availability_status: "Available",
        amenities: [],
        policies: "",
        check_in_time: "",
        check_out_time: "",
        contact_email: "",
        contact_phone: "",
        is_featured: false,
    });

    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(Boolean(editId || paramId));
    const navigate = useNavigate();

    const [existingImages, setExistingImages] = useState([]);
    const [removedImageIndexes, setRemovedImageIndexes] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);
    const [newFiles, setNewFiles] = useState([]);
    const fileInputRef = useRef(null);

    const [destinations, setDestinations] = useState({ domestic: [], international: [] });
    const [destinationsLoading, setDestinationsLoading] = useState(false);
    const [geographicZone, setGeographicZone] = useState("domestic");
    const [destDropdownOpen, setDestDropdownOpen] = useState(false);
    const [destSearchQuery, setDestSearchQuery] = useState("");
    const destDropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (destDropdownRef.current && !destDropdownRef.current.contains(event.target)) {
                setDestDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelectDestination = async (dest) => {
        const destName = dest.destination_name;
        const isDomestic = geographicZone === "domestic";
        const defaultCountry = isDomestic ? "India" : destName;
        const defaultState = destName;
        let defaultCity = destName;

        if (dest._id) {
            try {
                const res = await apiClient.get(`/admin/state/${dest._id}`);
                const citiesData = res.data?.citiesData || [];
                if (citiesData.length > 0 && citiesData[0]?.city_name) {
                    defaultCity = citiesData[0].city_name;
                }
            } catch (e) {
                console.error("Error fetching cities for destination:", e);
            }
        }

        setFormData((prev) => ({
            ...prev,
            destination: destName,
            country: defaultCountry,
            state: defaultState,
            city: defaultCity,
        }));

        setDestDropdownOpen(false);
        setDestSearchQuery("");
        toast.info(`Auto-filled details for ${destName}`);
    };

    const currentZoneDestinations = (geographicZone === "domestic" ? destinations.domestic : destinations.international) || [];
    const filteredZoneDestinations = currentZoneDestinations.filter((d) =>
        d.destination_name?.toLowerCase().includes(destSearchQuery.toLowerCase().trim())
    );

    useEffect(() => {
        const fetchDestinations = async () => {
            try {
                setDestinationsLoading(true);
                const [domRes, intRes] = await Promise.all([
                    apiClient.get("/admin/destination/domestic"),
                    apiClient.get("/admin/destination/international")
                ]);
                setDestinations({
                    domestic: domRes.data?.places || [],
                    international: intRes.data?.places || []
                });
            } catch (err) {
                console.error("Error fetching destinations for resort:", err);
            } finally {
                setDestinationsLoading(false);
            }
        };
        fetchDestinations();
    }, []);

    const allDestinationNames = [
        ...(destinations.domestic || []).map((d) => d.destination_name),
        ...(destinations.international || []).map((d) => d.destination_name),
    ];

    useEffect(() => {
        if (id) fetchResortData();
    }, [id]);

    const fetchResortData = async () => {
        try {
            const res = await apiClient.get(`/admin/resort/get/${id}`);
            const resort = res.data?.data || res.data?.resort || res.data?.itinerary || res.data;

            setFormData({
                ...resort,
                price_per_night: resort.price_per_night ?? "",
                duration_days: resort.duration_days ?? "",
                discount: resort.discount ?? "",
                address: resort.address ?? "",
                destination: resort.destination ?? "",
                city: resort.city ?? "",
                state: resort.state ?? "",
                country: resort.country ?? "",
                check_in_time: resort.check_in_time ?? "",
                check_out_time: resort.check_out_time ?? "",
                policies: resort.policies ?? "",
                images: null,
                is_active: resort.is_active !== false,
                is_featured: !!resort.is_featured,
            });

            if (resort.country && resort.country.toLowerCase() !== "india") {
                setGeographicZone("international");
            } else {
                setGeographicZone("domestic");
            }

            if (resort.images && Array.isArray(resort.images)) {
                setExistingImages(resort.images);
            }
        } catch (error) {
            console.error("Error fetching resort:", error);
            toast.error("Failed to load resort details");
            if (error.response?.status === 401) navigate("/login");
        } finally {
            setPageLoading(false);
        }
    };

    const removeNewImage = (indexToRemove) => {
        setNewFiles((prev) => prev.filter((_, i) => i !== indexToRemove));
        setPreviewUrls((prev) => {
            // Revoke the URL to free memory
            URL.revokeObjectURL(prev[indexToRemove]);
            return prev.filter((_, i) => i !== indexToRemove);
        });
    };

    const handleChange = (e) => {
        const { name, value, type, checked, files } = e.target;
        if (type === "file") {
            const addedFiles = Array.from(files);
            // Accumulate new files instead of replacing
            setNewFiles((prev) => [...prev, ...addedFiles]);
            const newUrls = addedFiles.map((file) => URL.createObjectURL(file));
            setPreviewUrls((prev) => [...prev, ...newUrls]);
            // Reset file input so the same file can be selected again
            if (fileInputRef.current) fileInputRef.current.value = "";
        } else if (type === "checkbox") {
            setFormData((prev) => ({ ...prev, [name]: checked }));
        } else if (type === "number") {
            const cleanedVal = value === "" ? "" : String(Number(value));
            setFormData((prev) => ({ ...prev, [name]: cleanedVal === "NaN" ? "" : cleanedVal }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title || !formData.title.trim()) {
            toast.error("Please enter a Resort Title");
            return;
        }

        setLoading(true);

        try {
            const imageUrls = [];
            const safeTitle = (formData.title || "resort").trim().replace(/\s+/g, '_');
            const resortFolder = `resort/${safeTitle}`;

            if (newFiles.length > 0) {
                for (let i = 0; i < newFiles.length; i++) {
                    const img = newFiles[i];
                    const uploadImage = await convertImageFileToWebP(img);
                    const presignedRes = await apiClient.post("/admin/generate-presigned-url", {
                        fileName: uploadImage.name,
                        fileType: uploadImage.type,
                        folder: resortFolder,
                    });
                    const { uploadUrl, key } = presignedRes.data;
                    await fetch(uploadUrl, { method: "PUT", body: uploadImage, headers: { "Content-Type": uploadImage.type } });
                    imageUrls.push(key);
                }
            }

            const { _id, createdAt, updatedAt, __v, images: unusedImages, ...cleanData } = formData;

            const payload = {
                ...cleanData,
                title: cleanData.title.trim(),
                price_per_night: cleanData.price_per_night !== "" ? Number(cleanData.price_per_night) : 0,
                duration_days: cleanData.duration_days !== "" ? Number(cleanData.duration_days) : 1,
                discount: cleanData.discount !== "" ? Number(cleanData.discount) : 0,
                images: imageUrls.length > 0 ? imageUrls : undefined,
                removedImageIndexes: removedImageIndexes.length > 0 ? removedImageIndexes : undefined,
            };

            if (id) {
                const res = await apiClient.patch(`/admin/resort/update/${id}`, payload);
                toast.success(res.data?.message || "Resort updated successfully!");
            } else {
                const res = await apiClient.post("/admin/resort", payload);
                toast.success(res.data?.message || "Resort created successfully!");
            }

            navigate("/resorts/list");
        } catch (error) {
            console.error("Error saving resort:", error);
            const msg = error.response?.data?.message || error.response?.data?.msg || "Error saving resort. Please try again.";
            toast.error(msg);
            if (error.response?.status === 401) navigate("/login");
        } finally {
            setLoading(false);
        }
    };

    if (pageLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-40 gap-6">
                <div className="size-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.25)]">
                    <Loader2 className="animate-spin text-indigo-400" size={36} strokeWidth={2} />
                </div>
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400">Loading Resort Details...</p>
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8 pb-20 font-sans">
            {/* TOP HEADER CARD */}
            <div className="bg-white dark:bg-[#091126]/95 rounded-3xl py-4 sm:py-5 px-6 sm:px-8 border border-slate-200/90 dark:border-indigo-500/25 shadow-xl dark:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.7),0_0_30px_2px_rgba(99,102,241,0.18)] ring-1 ring-slate-900/5 dark:ring-white/5 backdrop-blur-xl relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <button
                            type="button"
                            onClick={() => navigate("/resorts/list")}
                            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 uppercase tracking-wider transition-colors mb-1.5 group cursor-pointer"
                        >
                            <ArrowLeft size={13} className="group-hover:-translate-x-1 transition-transform" />
                            Back to Resorts
                        </button>
                        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                            <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-500/30 shrink-0">
                                <Building2 size={22} />
                            </div>
                            <span>
                                {isViewMode ? (
                                    <>View <span className="text-blue-500">Resort</span></>
                                ) : id ? (
                                    <>Edit <span className="text-blue-500">Resort</span></>
                                ) : (
                                    <>New <span className="text-blue-500">Resort</span></>
                                )}
                            </span>
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 font-semibold mt-1 text-xs sm:text-sm">
                            Define luxury standards, suite rates, and connectivity for romantic getaways.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        {/* View mode Edit button */}
                        {isViewMode && (
                            <button
                                type="button"
                                onClick={() => navigate(`/resorts/edit/${id}`)}
                                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-xs shadow-lg shadow-blue-600/30 uppercase tracking-wider transition-all cursor-pointer active:scale-95"
                            >
                                <Pencil size={14} /> Edit This Resort
                            </button>
                        )}

                        {/* Live / Offline Status Badge */}
                        <div className="bg-slate-50 dark:bg-[#050A17] border border-slate-200 dark:border-slate-800/90 rounded-2xl px-4 py-2.5 flex items-center gap-2.5 shadow-inner">
                            <span className={`size-2.5 rounded-full ${formData.is_active ? "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)] animate-pulse" : "bg-slate-500"}`} />
                            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                {formData.is_active ? "Live on Portal" : "Draft / Offline"}
                            </span>
                        </div>

                        {/* Featured Badge */}
                        {formData.is_featured && (
                            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl px-4 py-2.5 flex items-center gap-2 text-amber-400 shadow-inner">
                                <Sparkles size={14} />
                                <span className="text-xs font-bold uppercase tracking-wider">Featured</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* 1. RESORT SPECIFICATIONS */}
                <div className={cardStyle}>
                    <div className="flex items-center gap-3.5 pb-5 border-b border-slate-100 dark:border-slate-800/80">
                        <div className="size-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 shrink-0">
                            <Building2 size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                                Resort Specifications
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                                Core title, romantic description, and nightly room tariffs
                            </p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Resort Title */}
                        <div>
                            <label className={labelStyle}>
                                <Tag size={13} className="text-indigo-400" /> Resort Title *
                            </label>
                            <input
                                disabled={isViewMode}
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className={inputStyle}
                                placeholder="e.g. Soneva Jani Luxury Overwater Villas"
                                required
                            />
                        </div>

                        {/* Narrative Description */}
                        <div>
                            <label className={labelStyle}>
                                <Info size={13} className="text-indigo-400" /> Narrative Description
                            </label>
                            <textarea
                                disabled={isViewMode}
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={4}
                                className={`${inputStyle} resize-y min-h-[110px] leading-relaxed`}
                                placeholder="Describe the romantic essence, lagoon views, signature amenities, and serene atmosphere..."
                            />
                        </div>

                        {/* Financials & Stay Duration */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {/* Price per night */}
                            <div>
                                <label className={labelStyle}>
                                    Price Per Night (₹)
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm pointer-events-none">
                                        ₹
                                    </span>
                                    <input
                                        disabled={isViewMode}
                                        type="number"
                                        name="price_per_night"
                                        value={formData.price_per_night}
                                        onChange={handleChange}
                                        placeholder="e.g. 25000"
                                        min="0"
                                        className={`${inputStyle} pl-9`}
                                    />
                                </div>
                            </div>

                            {/* Duration Preference */}
                            <div>
                                <label className={labelStyle}>
                                    Duration Preference (Days)
                                </label>
                                <div className="relative">
                                    <Calendar size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                    <input
                                        disabled={isViewMode}
                                        type="number"
                                        name="duration_days"
                                        value={formData.duration_days}
                                        onChange={handleChange}
                                        placeholder="e.g. 5"
                                        min="1"
                                        className={`${inputStyle} pl-10 pr-14`}
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                        Days
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. LOCATION & ADDRESS */}
                <div className={`${cardStyle} relative z-30 overflow-visible`}>
                    <div className="flex items-center gap-3.5 pb-5 border-b border-slate-100 dark:border-slate-800/80">
                        <div className="size-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 shrink-0">
                            <MapPin size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                                Location & Destination Mapping
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                                Regional territory, destination anchor, and specific property address
                            </p>
                        </div>
                    </div>

                    <div className="space-y-6 overflow-visible">
                        {/* TOP CONTROLS: GEOGRAPHIC ZONE + AUTO-FILL DROPDOWN */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 pb-6 border-b border-slate-100 dark:border-slate-800/80 relative z-30">
                            {/* Left: GEOGRAPHIC ZONE */}
                            <div>
                                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2.5">
                                    <Globe size={13} className="text-indigo-400" /> Geographic Zone
                                </label>
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        disabled={isViewMode}
                                        onClick={() => {
                                            setGeographicZone("domestic");
                                            setDestSearchQuery("");
                                        }}
                                        className={`px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                                            geographicZone === "domestic"
                                                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 ring-1 ring-blue-400/50"
                                                : "bg-slate-50 dark:bg-[#050A17] border border-slate-200 dark:border-slate-800/90 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700"
                                        }`}
                                    >
                                        Domestic
                                    </button>
                                    <button
                                        type="button"
                                        disabled={isViewMode}
                                        onClick={() => {
                                            setGeographicZone("international");
                                            setDestSearchQuery("");
                                        }}
                                        className={`px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                                            geographicZone === "international"
                                                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 ring-1 ring-blue-400/50"
                                                : "bg-slate-50 dark:bg-[#050A17] border border-slate-200 dark:border-slate-800/90 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700"
                                        }`}
                                    >
                                        International
                                    </button>
                                </div>
                            </div>

                            {/* Right: AUTO-FILL FROM DESTINATION */}
                            <div className="relative md:w-80 lg:w-96 z-40" ref={destDropdownRef}>
                                <label className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2.5">
                                    <Sparkles size={13} className="text-blue-500" /> Auto-Fill From Destination ({geographicZone.toUpperCase()})
                                </label>

                                {/* Dropdown Trigger Button */}
                                <button
                                    type="button"
                                    disabled={isViewMode || destinationsLoading}
                                    onClick={() => setDestDropdownOpen((p) => !p)}
                                    className="w-full flex items-center justify-between bg-slate-50 dark:bg-[#050A17] hover:bg-white dark:hover:bg-[#070D1F] border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 text-slate-900 dark:text-white rounded-2xl px-4 py-3 text-sm font-semibold transition-all shadow-inner cursor-pointer"
                                >
                                    <span className="flex items-center gap-2 truncate">
                                        <MapPin size={15} className="text-blue-500 shrink-0" />
                                        <span className={formData.destination ? "text-slate-900 dark:text-white font-bold" : "text-slate-400 dark:text-slate-500 font-normal"}>
                                            {destinationsLoading
                                                ? "Loading destinations..."
                                                : formData.destination
                                                ? formData.destination
                                                : `Select ${geographicZone === "domestic" ? "Domestic" : "International"} Destination...`}
                                        </span>
                                    </span>
                                    <ChevronDown
                                        size={16}
                                        className={`text-slate-400 transition-transform duration-200 ${
                                            destDropdownOpen ? "rotate-180" : ""
                                        }`}
                                    />
                                </button>

                                {/* Popup Searchable Dropdown List */}
                                {destDropdownOpen && (
                                    <div className="absolute right-0 top-full mt-2 w-full min-w-[300px] sm:min-w-[340px] bg-white dark:bg-[#070D1F] border border-slate-200 dark:border-slate-700/80 rounded-2xl p-3 shadow-2xl dark:shadow-[0_25px_60px_rgba(0,0,0,0.95)] z-[100] space-y-3 backdrop-blur-2xl ring-1 ring-slate-900/5 dark:ring-white/10">
                                        {/* Search Input */}
                                        <div className="relative">
                                            <Search
                                                size={14}
                                                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                                            />
                                            <input
                                                type="text"
                                                placeholder={`Search ${geographicZone} destination...`}
                                                value={destSearchQuery}
                                                onChange={(e) => setDestSearchQuery(e.target.value)}
                                                className="w-full bg-slate-50 dark:bg-[#050A17] border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-indigo-500"
                                                autoFocus
                                            />
                                        </div>

                                        {/* Group Heading with Count */}
                                        <div className="flex items-center justify-between px-2 pt-1 text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                                            <span className="flex items-center gap-1.5">
                                                <Globe size={12} />{" "}
                                                {geographicZone === "domestic"
                                                    ? "Domestic Destinations / States"
                                                    : "International Destinations"}
                                            </span>
                                            <span className="bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-300 px-2 py-0.5 rounded-full text-[9px] font-bold">
                                                {filteredZoneDestinations.length}
                                            </span>
                                        </div>

                                        {/* Destinations List */}
                                        <div className="max-h-60 overflow-y-auto space-y-1 pr-1">
                                            {filteredZoneDestinations.length === 0 ? (
                                                <div className="text-center py-6 text-xs text-slate-400 dark:text-slate-500 font-semibold">
                                                    No destinations found
                                                </div>
                                            ) : (
                                                filteredZoneDestinations.map((dest) => (
                                                    <div
                                                        key={dest._id || dest.destination_name}
                                                        onClick={() => handleSelectDestination(dest)}
                                                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors cursor-pointer group"
                                                    >
                                                        <div>
                                                            <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                                {dest.destination_name}
                                                            </p>
                                                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                                                                {geographicZone === "domestic"
                                                                    ? "India"
                                                                    : dest.destination_name}
                                                            </p>
                                                        </div>
                                                        <span
                                                            className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                                                                geographicZone === "domestic"
                                                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                                                                    : "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30"
                                                            }`}
                                                        >
                                                            {geographicZone.toUpperCase()}
                                                        </span>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* BOTTOM INPUTS: CITY, STATE, COUNTRY */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                            {/* City / Region */}
                            <div>
                                <label className={labelStyle}>
                                    <MapPin size={13} className="text-indigo-400" /> City / Region
                                </label>
                                <input
                                    disabled={isViewMode}
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    className={inputStyle}
                                    placeholder="e.g. Munnar"
                                />
                            </div>

                            {/* State / Province */}
                            <div>
                                <label className={labelStyle}>
                                    <Compass size={13} className="text-indigo-400" /> State / Province
                                </label>
                                <input
                                    disabled={isViewMode}
                                    name="state"
                                    value={formData.state}
                                    onChange={handleChange}
                                    className={inputStyle}
                                    placeholder="e.g. Kerala"
                                />
                            </div>

                            {/* Country */}
                            <div>
                                <label className={labelStyle}>
                                    <Globe size={13} className="text-indigo-400" /> Country
                                </label>
                                <input
                                    disabled={isViewMode}
                                    name="country"
                                    value={formData.country}
                                    onChange={handleChange}
                                    className={inputStyle}
                                    placeholder="e.g. India"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. DIRECT CONTACTS */}
                <div className={cardStyle}>
                    <div className="flex items-center gap-3.5 pb-5 border-b border-slate-100 dark:border-slate-800/80">
                        <div className="size-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 shrink-0">
                            <Phone size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                                Direct Communications
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                                Official front desk telephone and reservation registry email
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <label className={labelStyle}>
                                <Phone size={13} className="text-indigo-400" /> Primary Contact Line
                            </label>
                            <input
                                disabled={isViewMode}
                                type="tel"
                                name="contact_phone"
                                value={formData.contact_phone}
                                onChange={handleChange}
                                className={inputStyle}
                                placeholder="+91 98765 43210"
                            />
                        </div>

                        <div>
                            <label className={labelStyle}>
                                <Mail size={13} className="text-indigo-400" /> Official Registry Email
                            </label>
                            <input
                                disabled={isViewMode}
                                type="email"
                                name="contact_email"
                                value={formData.contact_email}
                                onChange={handleChange}
                                className={inputStyle}
                                placeholder="reservations@resort.com"
                            />
                        </div>
                    </div>
                </div>

                {/* 4. PREMIUM MEDIA HUB */}
                <div className={cardStyle}>
                    <div className="flex items-center gap-3.5 pb-5 border-b border-slate-100 dark:border-slate-800/80">
                        <div className="size-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 shrink-0">
                            <ImageIcon size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                                Visual Showcase & Gallery
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                                High resolution photography of beachfront villas, infinity pools, and dining experiences
                            </p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {!isViewMode && (
                            <label className="group relative flex flex-col items-center justify-center w-full py-10 px-6 border-2 border-dashed border-indigo-200 dark:border-indigo-500/30 hover:border-indigo-400/80 bg-slate-50/80 dark:bg-[#050A17]/60 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/20 rounded-3xl cursor-pointer transition-all shadow-inner">
                                <div className="size-14 bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border border-indigo-500/30 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform mb-3">
                                    <UploadCloud size={26} className="text-indigo-400" />
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                                        Click to Upload Resort Photos
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        JPG, PNG, WebP supported • Select multiple images at once • Automatic WebP optimization
                                    </p>
                                </div>
                                <input
                                    ref={fileInputRef}
                                    disabled={isViewMode}
                                    type="file"
                                    name="images"
                                    multiple
                                    accept="image/*"
                                    onChange={handleChange}
                                    className="hidden"
                                />
                            </label>
                        )}

                        {/* Previews Grid */}
                        {(previewUrls.length > 0 || existingImages.length > 0) && (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    <span>Uploaded Media ({existingImages.length - removedImageIndexes.length + previewUrls.length})</span>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 bg-slate-50 dark:bg-[#050A17]/80 p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-inner">
                                    {/* Existing Images */}
                                    {existingImages.map((src, idx) => {
                                        const fullUrl = src.startsWith("http") ? src : `${ENV.API_BASE_URL}${src}`;
                                        const isMarkedForRemoval = removedImageIndexes.includes(idx);

                                        return (
                                            <div
                                                key={`exist-${idx}`}
                                                className={`relative aspect-square rounded-2xl overflow-hidden group border-2 ${
                                                    isMarkedForRemoval ? "border-red-500/60 opacity-40" : "border-slate-200 dark:border-slate-800/90 hover:border-indigo-500/60"
                                                } transition-all shadow-lg`}
                                            >
                                                <img src={fullUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Resort Asset" />

                                                {/* Overlay Actions */}
                                                <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-all backdrop-blur-[2px]">
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedImage(fullUrl)}
                                                        className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-colors cursor-pointer"
                                                        title="View full image"
                                                    >
                                                        <Maximize2 size={16} />
                                                    </button>
                                                    {!isViewMode && (
                                                        <button
                                                            type="button"
                                                            onClick={() => setRemovedImageIndexes((p) => (p.includes(idx) ? p.filter((i) => i !== idx) : [...p, idx]))}
                                                            className={`p-2 rounded-xl transition-colors cursor-pointer ${
                                                                isMarkedForRemoval ? "bg-emerald-600 hover:bg-emerald-500 text-white" : "bg-red-600/80 hover:bg-red-600 text-white"
                                                            }`}
                                                            title={isMarkedForRemoval ? "Restore image" : "Remove image"}
                                                        >
                                                            {isMarkedForRemoval ? <Plus size={16} /> : <X size={16} />}
                                                        </button>
                                                    )}
                                                </div>

                                                <div className="absolute top-2 left-2 px-2.5 py-0.5 bg-slate-950/80 backdrop-blur-md rounded-lg border border-white/10">
                                                    <span className="text-[9px] font-bold text-slate-300 uppercase tracking-wider">Saved</span>
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {/* New Upload Previews */}
                                    {previewUrls.map((url, idx) => (
                                        <div
                                            key={`preview-${idx}`}
                                            className="relative aspect-square rounded-2xl overflow-hidden group border-2 border-indigo-500/60 shadow-lg shadow-indigo-500/20"
                                        >
                                            <img src={url} className="w-full h-full object-cover" alt="New Upload" />
                                            <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-all backdrop-blur-[2px]">
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedImage(url)}
                                                    className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-colors cursor-pointer"
                                                    title="View full image"
                                                >
                                                    <Maximize2 size={16} />
                                                </button>
                                                {!isViewMode && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeNewImage(idx)}
                                                        className="p-2 bg-red-500/80 hover:bg-red-600 text-white rounded-xl transition-colors cursor-pointer"
                                                        title="Remove image"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                )}
                                            </div>
                                            <div className="absolute top-2 left-2 px-2.5 py-0.5 bg-indigo-600/90 backdrop-blur-md rounded-lg shadow">
                                                <span className="text-[9px] font-bold text-white uppercase tracking-wider">New</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* 5. CHECK-IN & STAY POLICIES */}
                <div className={cardStyle}>
                    <div className="flex items-center gap-3.5 pb-5 border-b border-slate-100 dark:border-slate-800/80">
                        <div className="size-11 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/25 shrink-0">
                            <Clock size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                                Check-In & Stay Policies
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                                Define check-in/check-out timings and cancellation or stay policies
                            </p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {/* Check-In Time */}
                            <div>
                                <label className={labelStyle}>
                                    <Clock size={13} className="text-amber-400" /> Check-In Time
                                </label>
                                <input
                                    disabled={isViewMode}
                                    type="time"
                                    name="check_in_time"
                                    value={formData.check_in_time}
                                    onChange={handleChange}
                                    className={inputStyle}
                                    placeholder="e.g. 14:00"
                                />
                            </div>

                            {/* Check-Out Time */}
                            <div>
                                <label className={labelStyle}>
                                    <Clock size={13} className="text-amber-400" /> Check-Out Time
                                </label>
                                <input
                                    disabled={isViewMode}
                                    type="time"
                                    name="check_out_time"
                                    value={formData.check_out_time}
                                    onChange={handleChange}
                                    className={inputStyle}
                                    placeholder="e.g. 11:00"
                                />
                            </div>
                        </div>

                        {/* Policies & Cancellation */}
                        <div>
                            <label className={labelStyle}>
                                <FileText size={13} className="text-amber-400" /> Policies & Cancellation
                            </label>
                            <textarea
                                disabled={isViewMode}
                                name="policies"
                                value={formData.policies}
                                onChange={handleChange}
                                rows={4}
                                className={`${inputStyle} resize-y min-h-[110px] leading-relaxed`}
                                placeholder="Describe cancellation terms, refund policy, pet policy, smoking rules, special requirements..."
                            />
                        </div>
                    </div>
                </div>

                {/* 6. VISIBILITY & PORTAL STATUS */}
                <div className={cardStyle}>
                    <div className="flex items-center gap-3.5 pb-5 border-b border-slate-100 dark:border-slate-800/80">
                        <div className="size-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 shrink-0">
                            <SlidersHorizontal size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                                Publishing & Portal Status
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                                Public accessibility, inventory booking state, and homepage featuring
                            </p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {/* Visibility */}
                            <div>
                                <label className={labelStyle}>
                                    <Eye size={13} className="text-indigo-400" /> Platform Visibility
                                </label>
                                <select
                                    disabled={isViewMode}
                                    name="visibility"
                                    value={formData.visibility}
                                    onChange={handleChange}
                                    className={selectStyle}
                                >
                                    <option value="public" className="bg-white dark:bg-[#050A17] text-slate-900 dark:text-white">Public — Visible to everyone</option>
                                    <option value="private" className="bg-white dark:bg-[#050A17] text-slate-900 dark:text-white">Private — Hidden from guests</option>
                                </select>
                            </div>

                            {/* Availability */}
                            <div>
                                <label className={labelStyle}>
                                    <CheckCircle2 size={13} className="text-indigo-400" /> Booking Availability
                                </label>
                                <select
                                    disabled={isViewMode}
                                    name="availability_status"
                                    value={formData.availability_status}
                                    onChange={handleChange}
                                    className={selectStyle}
                                >
                                    <option value="Available" className="bg-white dark:bg-[#050A17] text-slate-900 dark:text-white">Available for Booking</option>
                                    <option value="Booked" className="bg-white dark:bg-[#050A17] text-slate-900 dark:text-white">Sold Out / Fully Booked</option>
                                    <option value="Unavailable" className="bg-white dark:bg-[#050A17] text-slate-900 dark:text-white">Unavailable / Maintenance</option>
                                </select>
                            </div>
                        </div>

                        {/* Interactive Toggles */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                            {/* Active Toggle Card */}
                            <label
                                className={`flex items-center justify-between p-5 rounded-2xl border transition-all cursor-pointer ${
                                    formData.is_active
                                        ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/40 shadow-inner"
                                        : "bg-slate-50/80 dark:bg-[#050A17] border-slate-200 dark:border-slate-800/90 hover:border-slate-300 dark:hover:border-slate-700"
                                } ${isViewMode ? "pointer-events-none opacity-80" : ""}`}
                            >
                                <div className="flex items-center gap-3.5">
                                    <div
                                        className={`size-11 rounded-xl flex items-center justify-center transition-all ${
                                            formData.is_active
                                                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                                                : "bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                                        }`}
                                    >
                                        <CheckCircle2 size={20} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                            Active Resort
                                        </p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                            Enable this resort to be shown to customers
                                        </p>
                                    </div>
                                </div>
                                <input
                                    disabled={isViewMode}
                                    type="checkbox"
                                    name="is_active"
                                    checked={formData.is_active}
                                    onChange={handleChange}
                                    className="size-5 rounded-md accent-emerald-500 cursor-pointer"
                                />
                            </label>

                            {/* Featured Toggle Card */}
                            <label
                                className={`flex items-center justify-between p-5 rounded-2xl border transition-all cursor-pointer ${
                                    formData.is_featured
                                        ? "bg-amber-50 dark:bg-amber-500/10 border-amber-300 dark:border-amber-500/40 shadow-inner"
                                        : "bg-slate-50/80 dark:bg-[#050A17] border-slate-200 dark:border-slate-800/90 hover:border-slate-300 dark:hover:border-slate-700"
                                } ${isViewMode ? "pointer-events-none opacity-80" : ""}`}
                            >
                                <div className="flex items-center gap-3.5">
                                    <div
                                        className={`size-11 rounded-xl flex items-center justify-center transition-all ${
                                            formData.is_featured
                                                ? "bg-amber-500 text-white shadow-lg shadow-amber-500/30"
                                                : "bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                                        }`}
                                    >
                                        <Sparkles size={20} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                            Feature on Homepage
                                        </p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                            Spotlight in Top / Trending Collections
                                        </p>
                                    </div>
                                </div>
                                <input
                                    disabled={isViewMode}
                                    type="checkbox"
                                    name="is_featured"
                                    checked={formData.is_featured}
                                    onChange={handleChange}
                                    className="size-5 rounded-md accent-amber-500 cursor-pointer"
                                />
                            </label>
                        </div>
                    </div>
                </div>

                {/* BOTTOM ACTION BAR */}
                {!isViewMode && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-slate-800/80">
                        <button
                            type="button"
                            onClick={() => navigate("/resorts/list")}
                            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#050A17] hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm"
                        >
                            Cancel & Return
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full sm:w-auto px-9 py-3.5 bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:opacity-95 text-white rounded-2xl font-bold text-xs shadow-xl shadow-indigo-600/30 uppercase tracking-wider transition-all flex items-center justify-center gap-2.5 cursor-pointer active:scale-[0.98] disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin" size={16} />
                                    Saving Resort...
                                </>
                            ) : id ? (
                                <>
                                    <ShieldCheck size={16} />
                                    Update Resort
                                </>
                            ) : (
                                <>
                                    <Plus size={16} strokeWidth={2.5} />
                                    Create Resort
                                </>
                            )}
                        </button>
                    </div>
                )}
            </form>

            {/* LIGHTBOX MODAL */}
            <AnimatePresence>
                {selectedImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedImage(null)}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 cursor-zoom-out"
                    >
                        <motion.img
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            src={selectedImage}
                            className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl border border-white/10"
                            alt="Resort View"
                        />
                        <button
                            onClick={() => setSelectedImage(null)}
                            className="absolute top-6 right-6 p-3 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors"
                        >
                            <X size={22} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default HoneymoonResortForm;
