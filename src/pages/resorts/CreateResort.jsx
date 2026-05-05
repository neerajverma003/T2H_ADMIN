import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
            const token = localStorage.getItem("token");
            if (!token) {
                navigate("/login");
                return;
            }

            const response = await fetch(`${ENV.API_BASE_URL}/admin/resort/get/${id}`, {
                headers: { "Authorization": `Bearer ${token}` },
            });
            
            if (!response.ok) throw new Error(`Failed to fetch resort: ${response.status}`);
            const data = await response.json();
            const resort = data.data || data;

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
            const token = localStorage.getItem("token");
            const imageUrls = [];
            const resortFolder = `resort/${formData.title.replace(/\s+/g, '_')}`;

            if (formData.images && formData.images.length > 0) {
                for (let i = 0; i < formData.images.length; i++) {
                    const img = formData.images[i];
                    const presignedRes = await fetch(`${ENV.API_BASE_URL}/admin/generate-presigned-url`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`
                        },
                        body: JSON.stringify({ fileName: img.name, fileType: img.type, folder: resortFolder })
                    });
                    const { uploadUrl, key } = await presignedRes.json();
                    await fetch(uploadUrl, { method: "PUT", body: img, headers: { "Content-Type": img.type } });
                    imageUrls.push(key);
                }
            }

            const payload = {
                ...formData,
                images: imageUrls,
                removedImageIndexes: removedImageIndexes.length > 0 ? removedImageIndexes : undefined
            };

            const url = id ? `${ENV.API_BASE_URL}/admin/resort/update/${id}` : `${ENV.API_BASE_URL}/admin/resort`;
            const method = id ? "PATCH" : "POST";

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) throw new Error("Submission failed");
            navigate("/resorts/list");
        } catch (error) {
            console.error("Error saving resort:", error);
        } finally {
            setLoading(false);
        }
    };

    const styleProps = {
        inputStyle: "w-full rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-4 text-slate-900 dark:text-slate-100 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all placeholder:text-slate-400",
        labelStyle: "flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2",
        cardStyle: "bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none",
    };

    if (pageLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-40 gap-4">
                <Loader2 className="animate-spin text-indigo-600" size={48} strokeWidth={1} />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Synchronizing Resort Data</p>
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto space-y-8 pb-20 px-4">
            {/* HEADER */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                            <Building className="text-indigo-600" /> {id ? "EDIT RESORT" : "ONBOARD NEW RESORT"}
                        </h1>
                        <p className="text-slate-500 font-medium mt-1 italic">Defining luxury standards for romantic getaways</p>
                    </div>
                    <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 p-2 rounded-2xl">
                         <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${formData.is_active ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                            {formData.is_active ? 'Live' : 'Draft'}
                         </div>
                         {formData.is_featured && (
                            <div className="px-4 py-2 bg-amber-400 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                <Sparkles size={12} /> Featured
                            </div>
                         )}
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* CORE INFO */}
                <div className={styleProps.cardStyle}>
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-indigo-600 dark:text-indigo-400"><Info size={20} /></div>
                        <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Resort Specifications</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="md:col-span-2">
                            <label className={styleProps.labelStyle}>Resort Title</label>
                            <input name="title" value={formData.title} onChange={handleChange} className={`${styleProps.inputStyle} text-xl font-bold h-16`} placeholder="e.g. Soneva Jani Luxury Villas" />
                        </div>
                        <div className="md:col-span-2">
                            <label className={styleProps.labelStyle}>Narrative Description</label>
                            <textarea name="description" value={formData.description} onChange={handleChange} className={`${styleProps.inputStyle} h-40 resize-none`} placeholder="Describe the romantic essence of this resort..." />
                        </div>
                        <div>
                            <label className={styleProps.labelStyle}>Price Per Night (₹)</label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">₹</div>
                                <input type="number" name="price_per_night" value={formData.price_per_night} onChange={handleChange} className={`${styleProps.inputStyle} pl-10`} />
                            </div>
                        </div>
                        <div>
                            <label className={styleProps.labelStyle}>Duration Preference</label>
                            <div className="relative">
                                <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input type="number" name="duration_days" value={formData.duration_days} onChange={handleChange} className={`${styleProps.inputStyle} pl-12`} />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Days</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* LOCATION & CONTACT */}
                <div className={styleProps.cardStyle}>
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-indigo-600 dark:text-indigo-400"><MapPin size={20} /></div>
                        <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Location & Connectivity</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label className={styleProps.labelStyle}>City / Region</label>
                            <input name="city" value={formData.city} onChange={handleChange} className={styleProps.inputStyle} />
                        </div>
                        <div>
                            <label className={styleProps.labelStyle}>Destination</label>
                            <input name="destination" value={formData.destination} onChange={handleChange} className={styleProps.inputStyle} />
                        </div>
                        <div>
                            <label className={styleProps.labelStyle}>State / Province</label>
                            <input name="state" value={formData.state} onChange={handleChange} className={styleProps.inputStyle} />
                        </div>
                        <div>
                            <label className={styleProps.labelStyle}>Country</label>
                            <input name="country" value={formData.country} onChange={handleChange} className={styleProps.inputStyle} />
                        </div>
                        <div className="pt-4 border-t border-slate-50 dark:border-slate-800 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className={styleProps.labelStyle}><Phone size={14} /> Contact Phone</label>
                                <input type="tel" name="contact_phone" value={formData.contact_phone} onChange={handleChange} className={styleProps.inputStyle} placeholder="+91..." />
                            </div>
                            <div>
                                <label className={styleProps.labelStyle}><Mail size={14} /> Official Email</label>
                                <input type="email" name="contact_email" value={formData.contact_email} onChange={handleChange} className={styleProps.inputStyle} placeholder="hello@resort.com" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* MEDIA HUB */}
                <div className={styleProps.cardStyle}>
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-indigo-600 dark:text-indigo-400"><ImageIcon size={20} /></div>
                        <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Premium Media Hub</h2>
                    </div>
                    
                    <div className="space-y-6">
                        <label className="group relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[2rem] cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Plus size={32} className="text-indigo-600 mb-4 transition-transform group-hover:scale-110" />
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Sync New Assets</p>
                            </div>
                            <input type="file" multiple accept="image/*" onChange={handleChange} className="hidden" />
                        </label>

                        {/* PREVIEWS */}
                        {(previewUrls.length > 0 || existingImages.length > 0) && (
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {existingImages.map((src, idx) => (
                                    <div key={idx} className={`relative aspect-square rounded-[1.5rem] overflow-hidden group border-2 ${removedImageIndexes.includes(idx) ? 'border-red-500 opacity-50' : 'border-transparent'}`}>
                                        <img src={src.startsWith('http') ? src : `${ENV.API_BASE_URL}${src}`} className="w-full h-full object-cover" alt="" />
                                        <button type="button" onClick={() => setRemovedImageIndexes(p => p.includes(idx) ? p.filter(i => i !== idx) : [...p, idx])} className="absolute top-2 right-2 size-8 bg-black/50 backdrop-blur-md rounded-xl flex items-center justify-center text-white hover:bg-red-500 transition-colors">
                                            <X size={16} />
                                        </button>
                                        <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/50 backdrop-blur-md rounded-md">
                                            <p className="text-[8px] font-black text-white uppercase tracking-widest">Existing</p>
                                        </div>
                                    </div>
                                ))}
                                {previewUrls.map((url, idx) => (
                                    <div key={idx} className="relative aspect-square rounded-[1.5rem] overflow-hidden group border-2 border-indigo-500">
                                        <img src={url} className="w-full h-full object-cover shadow-2xl shadow-indigo-500/20" alt="" />
                                        <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-indigo-600 rounded-md">
                                            <p className="text-[8px] font-black text-white uppercase tracking-widest">New</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* STATUS & ATTRIBUTES */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className={styleProps.cardStyle}>
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-indigo-600 dark:text-indigo-400"><Eye size={20} /></div>
                            <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Portal Visibility</h2>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <label className={styleProps.labelStyle}>Visibility Mode</label>
                                <select name="visibility" value={formData.visibility} onChange={handleChange} className={styleProps.inputStyle}>
                                    <option value="public">Published on Portal</option>
                                    <option value="private">Hidden / Internal</option>
                                </select>
                            </div>
                            <div>
                                <label className={styleProps.labelStyle}>Availability</label>
                                <select name="availability_status" value={formData.availability_status} onChange={handleChange} className={styleProps.inputStyle}>
                                    <option value="Available">Available for Booking</option>
                                    <option value="Unavailable">Maintenance / Offline</option>
                                    <option value="Booked">Fully Committed</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className={styleProps.cardStyle}>
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-indigo-600 dark:text-indigo-400"><Tag size={20} /></div>
                            <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Marketing Attributes</h2>
                        </div>
                        <div className="space-y-8">
                            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${formData.is_active ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'}`}><CheckCircle2 size={16} /></div>
                                    <p className="text-xs font-bold text-slate-700 dark:text-slate-200">Active Status</p>
                                </div>
                                <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange} className="size-6 accent-indigo-600" />
                            </div>
                            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${formData.is_featured ? 'bg-amber-400 text-white' : 'bg-slate-200 text-slate-400'}`}><Sparkles size={16} /></div>
                                    <p className="text-xs font-bold text-slate-700 dark:text-slate-200">Featured Highlight</p>
                                </div>
                                <input type="checkbox" name="is_featured" checked={formData.is_featured} onChange={handleChange} className="size-6 accent-indigo-600" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-8">
                    <button type="submit" disabled={loading} className="group relative bg-indigo-600 text-white px-12 py-5 rounded-[2rem] font-black text-lg shadow-2xl shadow-indigo-500/40 hover:bg-indigo-700 transition-all flex items-center gap-3 disabled:opacity-50 overflow-hidden transform hover:scale-105 active:scale-95">
                        {loading ? <Loader2 className="animate-spin" size={24} /> : (id ? <ShieldCheck size={24} /> : <Plus size={24} />)}
                        {loading ? 'Committing...' : (id ? 'PUSH UPDATES' : 'FINALIZE REGISTRY')}
                    </button>
                </div>
            </form>
        </motion.div>
    );
};

export default HoneymoonResortForm;
