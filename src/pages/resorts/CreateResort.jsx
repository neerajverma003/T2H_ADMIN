import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { apiClient } from "../../stores/authStores";
import { ENV } from "../../constants/api";
import { 
    Building, 
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
    Tag,
    Star,
    CheckCircle2,
    Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const HoneymoonResortForm = ({ editId }) => {
    const location = useLocation();
    const isViewMode = location.pathname.includes('/view/');
    const [selectedImage, setSelectedImage] = useState(null);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        images: null,
        is_active: true,
        price_per_night: 0,
        destination: "",
        city: "",
        state: "",
        country: "",
        duration_days: 1,
        average_rating: 0,
        review_count: 0,
        number_of_ratings: 0,
        inclusions: [],
        tags: [],
        visibility: "public",
        discount: 0,
        start_date: "",
        end_date: "",
        availability_status: "Available",
        amenities: [],
        policies: "",
        contact_email: "",
        contact_phone: "",
        is_featured: false,
    });

    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(!!editId);
    const navigate = useNavigate();
    const id = editId;

    const [existingImages, setExistingImages] = useState([]);
    const [removedImageIndexes, setRemovedImageIndexes] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);

    useEffect(() => {
        if (id) fetchResortData();
    }, [id]);

    const fetchResortData = async () => {
        try {
            const res = await apiClient.get(`/admin/resort/get/${id}`);
            const resort = res.data.data || res.data;

            setFormData({
                ...resort,
                images: null,
                is_active: resort.is_active !== false,
            });

            if (resort.images && Array.isArray(resort.images)) {
                setExistingImages(resort.images);
            }
        } catch (error) {
            console.error("Error fetching resort:", error);
            if (error.response?.status === 401) navigate("/login");
        } finally {
            setPageLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked, files } = e.target;
        if (type === "file") {
            setFormData((prev) => ({ ...prev, images: files }));
            const urls = Array.from(files).map(file => URL.createObjectURL(file));
            setPreviewUrls(urls);
        } else if (type === "checkbox") {
            setFormData((prev) => ({ ...prev, [name]: checked }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const imageUrls = [];
            const resortFolder = `resort/${formData.title.replace(/\s+/g, '_')}`;

            if (formData.images && formData.images.length > 0) {
                for (let i = 0; i < formData.images.length; i++) {
                    const img = formData.images[i];
                    const presignedRes = await apiClient.post("/admin/generate-presigned-url", {
                        fileName: img.name,
                        fileType: img.type,
                        folder: resortFolder
                    });
                    const { uploadUrl, key } = presignedRes.data;
                    await fetch(uploadUrl, { method: "PUT", body: img, headers: { "Content-Type": img.type } });
                    imageUrls.push(key);
                }
            }

            const payload = {
                ...formData,
                images: imageUrls,
                removedImageIndexes: removedImageIndexes.length > 0 ? removedImageIndexes : undefined
            };

            if (id) {
                await apiClient.patch(`/admin/resort/update/${id}`, payload);
            } else {
                await apiClient.post("/admin/resort", payload);
            }

            navigate("/resorts/list");
        } catch (error) {
            console.error("Error saving resort:", error);
            if (error.response?.status === 401) navigate("/login");
        } finally {
            setLoading(false);
        }
    };

    const styleProps = {
        inputStyle: "w-full rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-4 text-lg font-medium focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-white transition-all placeholder:text-slate-500 disabled:opacity-100 disabled:text-slate-950 dark:disabled:text-white disabled:cursor-default",
        labelStyle: "flex items-center gap-2 text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1",
        cardStyle: "bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none",
    };

    if (pageLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-40 gap-8">
                <Loader2 className="animate-spin text-indigo-700" size={64} strokeWidth={1.5} />
                <p className="text-xs font-black uppercase tracking-[0.4em] text-slate-400">Synchronizing Resort Data...</p>
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-full mx-auto space-y-6 pb-20 relative">
            {/* HEADER */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-black text-slate-950 dark:text-white tracking-tight flex items-center gap-4">
                            <Building className="text-indigo-600" size={28} /> {isViewMode ? "VIEW RESORT" : id ? "EDIT RESORT" : "NEW RESORT"}
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 font-bold mt-1 text-sm italic">Defining luxury standards for romantic getaways</p>
                    </div>
                    <div className="flex items-center gap-4 bg-slate-100 dark:bg-slate-800 p-2 rounded-[1.5rem]">
                         <div className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest ${formData.is_active ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30' : 'bg-slate-300 text-slate-600'}`}>
                            {formData.is_active ? 'Live on Portal' : 'Draft / Offline'}
                         </div>
                         {formData.is_featured && (
                            <div className="px-6 py-3 bg-amber-500 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-amber-500/30">
                                <Sparkles size={16} /> Featured Premium
                            </div>
                         )}
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-10">
                {/* CORE INFO */}
                <div className={styleProps.cardStyle}>
                    <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-indigo-700 rounded-2xl text-white shadow-xl shadow-indigo-500/30"><Info size={20} /></div>
                            <h2 className="text-lg font-black text-slate-950 dark:text-white uppercase tracking-tight">Resort Specifications</h2>
                        </div>
                    </div>
                    <div className="space-y-10">
                        <div className="w-full">
                            <label className={styleProps.labelStyle}>Resort Title</label>
                            <input disabled={isViewMode} name="title" value={formData.title} onChange={handleChange} className={styleProps.inputStyle} placeholder="e.g. Soneva Jani Luxury Villas" />
                        </div>
                        <div className="w-full">
                            <label className={styleProps.labelStyle}>Narrative Description</label>
                            <textarea disabled={isViewMode} name="description" value={formData.description} onChange={handleChange} className={`${styleProps.inputStyle} h-40 resize-none italic`} placeholder="Describe the romantic essence of this resort..." />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className={styleProps.labelStyle}>Price Per Night (₹)</label>
                                <div className="relative group">
                                    <div className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-slate-600 group-focus-within:text-indigo-700 transition-colors">₹</div>
                                    <input disabled={isViewMode} type="number" name="price_per_night" value={formData.price_per_night} onChange={handleChange} className={`${styleProps.inputStyle} pl-12`} />
                                </div>
                            </div>
                            <div>
                                <label className={styleProps.labelStyle}>Duration Preference</label>
                                <div className="relative group">
                                    <Calendar size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-700 transition-colors" />
                                    <input disabled={isViewMode} type="number" name="duration_days" value={formData.duration_days} onChange={handleChange} className={`${styleProps.inputStyle} pl-14`} />
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Days</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* LOCATION & CONTACT */}
                <div className={styleProps.cardStyle}>
                    <div className="flex items-center gap-4 mb-10">
                        <div className="p-3 bg-indigo-700 rounded-2xl text-white shadow-xl shadow-indigo-500/30"><MapPin size={20} /></div>
                        <h2 className="text-lg font-black text-slate-950 dark:text-white uppercase tracking-tight">Location & Connectivity</h2>
                    </div>
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className={styleProps.labelStyle}>City / Region</label>
                                <input disabled={isViewMode} name="city" value={formData.city} onChange={handleChange} className={styleProps.inputStyle} />
                            </div>
                            <div>
                                <label className={styleProps.labelStyle}>Destination</label>
                                <input disabled={isViewMode} name="destination" value={formData.destination} onChange={handleChange} className={styleProps.inputStyle} />
                            </div>
                            <div>
                                <label className={styleProps.labelStyle}>State / Province</label>
                                <input disabled={isViewMode} name="state" value={formData.state} onChange={handleChange} className={styleProps.inputStyle} />
                            </div>
                            <div>
                                <label className={styleProps.labelStyle}>Country</label>
                                <input disabled={isViewMode} name="country" value={formData.country} onChange={handleChange} className={styleProps.inputStyle} />
                            </div>
                        </div>
                        <div className="pt-8 border-t border-slate-100 dark:border-slate-800 space-y-6">
                            <div>
                                <label className={styleProps.labelStyle}><Phone size={16} className="text-indigo-600" /> Primary Contact Line</label>
                                <input disabled={isViewMode} type="tel" name="contact_phone" value={formData.contact_phone} onChange={handleChange} className={styleProps.inputStyle} placeholder="+91..." />
                            </div>
                            <div>
                                <label className={styleProps.labelStyle}><Mail size={16} className="text-indigo-600" /> Official Registry Email</label>
                                <input disabled={isViewMode} type="email" name="contact_email" value={formData.contact_email} onChange={handleChange} className={styleProps.inputStyle} placeholder="hello@resort.com" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* MEDIA HUB */}
                <div className={styleProps.cardStyle}>
                    <div className="flex items-center gap-4 mb-10">
                        <div className="p-3 bg-indigo-700 rounded-2xl text-white shadow-xl shadow-indigo-500/30"><ImageIcon size={20} /></div>
                        <h2 className="text-lg font-black text-slate-950 dark:text-white uppercase tracking-tight">Premium Media Hub</h2>
                    </div>
                    
                    <div className="space-y-12">
                        {!isViewMode && <label className="group relative flex flex-col items-center justify-center w-full aspect-[21/7] border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all hover:border-indigo-600">
                            <div className="size-12 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform mb-3">
                                <Plus size={24} className="text-indigo-600" />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-black text-slate-900 dark:text-white mb-1">Click to Upload Images</p>
                                <p className="text-xs text-slate-400">JPG, PNG, WEBP supported</p>
                            </div>
                            <input disabled={isViewMode} type="file" multiple accept="image/*" onChange={handleChange} className="hidden" />
                        </label>}

                        {/* PREVIEWS */}
                        {(previewUrls.length > 0 || existingImages.length > 0) && (
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6 bg-slate-50 dark:bg-slate-800/30 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-inner">
                                {existingImages.map((src, idx) => (
                                    <div 
                                        key={idx} 
                                        onClick={() => { if (isViewMode) setSelectedImage(src.startsWith('http') ? src : `${ENV.API_BASE_URL}${src}`); }}
                                        className={`relative aspect-square rounded-[2rem] overflow-hidden group border-4 ${removedImageIndexes.includes(idx) ? 'border-red-600 opacity-50' : 'border-transparent shadow-xl'} ${isViewMode ? 'cursor-pointer hover:shadow-2xl hover:shadow-indigo-500/30' : ''}`}
                                    >
                                        <img src={src.startsWith('http') ? src : `${ENV.API_BASE_URL}${src}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="" />
                                        {!isViewMode && <button type="button" onClick={() => setRemovedImageIndexes(p => p.includes(idx) ? p.filter(i => i !== idx) : [...p, idx])} className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all backdrop-blur-[2px]">
                                            <X size={32} className="text-white" />
                                        </button>}
                                        <div className="absolute top-4 left-4 px-4 py-1.5 bg-slate-950/80 backdrop-blur-md rounded-xl shadow-2xl">
                                            <p className="text-[10px] font-black text-white uppercase tracking-widest">Active Hub Asset</p>
                                        </div>
                                    </div>
                                ))}
                                {previewUrls.map((url, idx) => (
                                    <div key={idx} className="relative aspect-square rounded-[2rem] overflow-hidden group border-4 border-indigo-700 shadow-2xl shadow-indigo-500/30">
                                        <img src={url} className="w-full h-full object-cover" alt="" />
                                        <div className="absolute top-4 left-4 px-4 py-1.5 bg-indigo-700 rounded-xl shadow-2xl">
                                            <p className="text-[10px] font-black text-white uppercase tracking-widest">New Deployment</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* STATUS & ATTRIBUTES */}
                <div className="space-y-10">
                    <div className={styleProps.cardStyle}>
                        <div className="flex items-center gap-4 mb-10">
                            <div className="p-3 bg-indigo-700 rounded-2xl text-white shadow-xl shadow-indigo-500/30"><Eye size={20} /></div>
                            <h2 className="text-lg font-black text-slate-950 dark:text-white uppercase tracking-tight">Visibility Settings</h2>
                        </div>
                        <div className="space-y-6">
                            <div className="w-full">
                                <label className={styleProps.labelStyle}>Visibility</label>
                                <select disabled={isViewMode} name="visibility" value={formData.visibility} onChange={handleChange} className={styleProps.inputStyle}>
                                    <option value="public">Public — Visible to everyone</option>
                                    <option value="private">Private — Hidden from users</option>
                                </select>
                            </div>
                            <div className="w-full">
                                <label className={styleProps.labelStyle}>Availability</label>
                                <select disabled={isViewMode} name="availability_status" value={formData.availability_status} onChange={handleChange} className={styleProps.inputStyle}>
                                    <option value="Available">Available</option>
                                    <option value="Booked">Sold Out</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className={styleProps.cardStyle}>
                        <div className="flex items-center gap-4 mb-10">
                            <div className="p-3 bg-indigo-700 rounded-2xl text-white shadow-xl shadow-indigo-500/30"><Tag size={20} /></div>
                            <h2 className="text-lg font-black text-slate-950 dark:text-white uppercase tracking-tight">Active & Featured Settings</h2>
                        </div>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border-2 border-slate-100 dark:border-slate-800 shadow-inner">
                                <div className="flex items-center gap-4">
                                    <div className={`size-12 rounded-xl shadow-lg flex items-center justify-center ${formData.is_active ? 'bg-emerald-600 text-white shadow-emerald-500/40' : 'bg-slate-200 text-slate-400'}`}><CheckCircle2 size={24} /></div>
                                    <div>
                                        <p className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">Active Resort</p>
                                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest italic opacity-60">Enable this resort to be shown to customers</p>
                                    </div>
                                </div>
                                <input disabled={isViewMode} type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange} className="size-8 accent-emerald-600 cursor-pointer" />
                            </div>
                            <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border-2 border-slate-100 dark:border-slate-800 shadow-inner">
                                <div className="flex items-center gap-4">
                                    <div className={`size-12 rounded-xl shadow-lg flex items-center justify-center ${formData.is_featured ? 'bg-amber-500 text-white shadow-amber-500/40' : 'bg-slate-200 text-slate-400'}`}><Sparkles size={24} /></div>
                                    <div>
                                        <p className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">Feature on Homepage</p>
                                        <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest italic opacity-60">Show this resort in the Top / Trending section</p>
                                    </div>
                                </div>
                                <input disabled={isViewMode} type="checkbox" name="is_featured" checked={formData.is_featured} onChange={handleChange} className="size-8 accent-amber-500 cursor-pointer" />
                            </div>
                        </div>
                    </div>
                </div>

                {!isViewMode && <div className="flex justify-end pt-12">
                    <button type="submit" disabled={loading} className="group relative bg-indigo-700 text-white px-10 py-5 rounded-[1.5rem] font-black text-lg shadow-2xl shadow-indigo-500/50 hover:bg-indigo-800 transition-all flex items-center gap-4 disabled:opacity-50 overflow-hidden transform hover:scale-[1.02] active:scale-95 uppercase tracking-widest">
                        {loading ? <Loader2 className="animate-spin" size={24} /> : (id ? <ShieldCheck size={24} /> : <Plus size={24} />)}
                        {loading ? 'Committing...' : (id ? 'PUSH UPDATES' : 'FINALIZE REGISTRY')}
                    </button>
                </div>}
            </form>

            {/* LIGHTBOX MODAL */}
            <AnimatePresence>
                {selectedImage && (
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedImage(null)}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-sm p-4 cursor-zoom-out"
                    >
                        <motion.img 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            src={selectedImage} 
                            className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl" 
                            alt="Resort Detail" 
                        />
                        <button 
                            onClick={() => setSelectedImage(null)}
                            className="absolute top-6 right-6 p-3 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default HoneymoonResortForm;
