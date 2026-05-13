import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    CheckCircle,
    GalleryHorizontal,
    Image as ImageIcon,
    X,
    Heart,
    Sparkles,
    UploadCloud,
    Film
} from "lucide-react";
import { apiClient } from "../../../stores/authStores";

const MediaSection = ({ formData, setFormData, styles, errors = {} }) => {
    const { labelStyle, cardStyle, inputStyle } = styles;
    const location = useLocation();
    const isViewMode = location.pathname.includes('/view/');

    const [destinationImages, setDestinationImages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedLightboxImage, setSelectedLightboxImage] = useState(null);

    useEffect(() => {
        const fetchDestImages = async () => {
            if (!formData.selected_destination_id) {
                setDestinationImages([]);
                return;
            }
            try {
                setIsLoading(true);
                const res = await apiClient.get(`/admin/destination/edit/${formData.selected_destination_id}`);
                const destData = res?.data?.destination;
                const images = [...(destData?.title_image || []), ...(destData?.show_image || [])];
                setDestinationImages([...new Set(images)]);
            } catch (error) {
                console.error("Error fetching destination images:", error);
                setDestinationImages([]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDestImages();
    }, [formData.selected_destination_id]);

    const extractS3Key = (urlOrKey) => {
        if (!urlOrKey || typeof urlOrKey !== 'string') return urlOrKey;
        if (!urlOrKey.startsWith('http')) return urlOrKey;
        try {
            const url = new URL(urlOrKey);
            let key = decodeURIComponent(url.pathname);
            if (key.startsWith('/')) key = key.substring(1);
            return key;
        } catch {
            return urlOrKey;
        }
    };

    const toggleSelection = (key, url) => {
        if (isViewMode) {
            setSelectedLightboxImage(url);
            return;
        }
        setFormData((prev) => {
            const urlKey = extractS3Key(url);
            
            // Single selection logic for thumbnails
            if (key === 'destination_thumbnails') {
                const exists = prev[key].some(i => extractS3Key(i) === urlKey);
                return {
                    ...prev,
                    [key]: exists ? [] : [url],
                };
            }

            // Multiple selection logic for other gallery keys
            const exists = prev[key].some(i => extractS3Key(i) === urlKey);
            return {
                ...prev,
                [key]: exists ? prev[key].filter((i) => extractS3Key(i) !== urlKey) : [...prev[key], url],
            };
        });
    };

    const handleDirectUpload = (e, key) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;
        
        // For single selection keys like thumbnails, we only take the last file uploaded
        if (key === 'destination_thumbnails') {
            const file = files[files.length - 1];
            const reader = new FileReader();
            reader.onload = (ev) => {
                setFormData((prev) => ({
                    ...prev,
                    [key]: [ev.target.result],
                    [`${key}_files`]: [file],
                }));
            };
            reader.readAsDataURL(file);
        } else {
            files.forEach((file) => {
                const reader = new FileReader();
                reader.onload = (ev) => {
                    setFormData((prev) => ({
                        ...prev,
                        [key]: [...prev[key], ev.target.result],
                        [`${key}_files`]: [...(prev[`${key}_files`] || []), file],
                    }));
                };
                reader.readAsDataURL(file);
            });
        }
        e.target.value = '';
    };

    const removeDirectImage = (index, key) => {
        if (isViewMode) return;
        setFormData((prev) => ({ ...prev, [key]: prev[key].filter((_, i) => i !== index) }));
    };

    const renderGrid = (images, selected, key) => {
        if (isLoading) return <div className="py-12 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;
        if (!images || !images.length) return <div className="p-10 rounded-3xl bg-slate-50 dark:bg-slate-800/50 text-center text-[10px] font-black uppercase tracking-widest text-slate-700">No destination assets found.</div>;

        return (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
                {images.map((url, idx) => {
                    const urlKey = extractS3Key(url);
                    const isSelected = selected.some(i => extractS3Key(i) === urlKey);
                    return (
                        <div
                            key={`${key}-${idx}`}
                            onClick={() => toggleSelection(key, url)}
                            className={`group relative aspect-square cursor-pointer rounded-2xl overflow-hidden border-2 transition-all ${isSelected ? 'border-indigo-500 ring-4 ring-indigo-500/10' : 'border-transparent bg-slate-100 dark:bg-slate-800'}`}
                        >
                            {url ? (
                                <img src={url} alt="" className={`h-full w-full object-cover transition-transform group-hover:scale-110 ${!isSelected && 'grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100'}`} />
                            ) : (
                                <div className="h-full w-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[8px] font-black uppercase text-slate-400">Missing</div>
                            )}
                            {isSelected && (
                                <div className="absolute inset-0 bg-indigo-600/10 flex items-center justify-center">
                                    <div className="bg-indigo-600 rounded-full p-1 shadow-lg"><CheckCircle size={20} className="text-white" /></div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className={cardStyle}>
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <Film className="text-indigo-600" size={20} />
                    MEDIA HUB
                </h2>
                <div className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-widest">
                    Visual Assets
                </div>
            </div>

            {errors.destination_images && <p className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 rounded-2xl border border-red-100 dark:border-red-900/30 text-red-500 text-[10px] font-black uppercase tracking-widest">{errors.destination_images}</p>}

            {!formData.selected_destination_id ? (
                <div className="p-12 text-center bg-slate-50 dark:bg-slate-800/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                    <ImageIcon className="mx-auto mb-4 text-slate-300" size={48} strokeWidth={1} />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-700">Select a destination to unlock media manager</p>
                </div>
            ) : (
                <div className="space-y-12">


                    {/* THUMBNAILS */}
                    <div className="space-y-8">
                        <div>
                            <label className={labelStyle}><Sparkles size={14} /> Destination Source Assets</label>
                            {renderGrid(destinationImages, formData.destination_thumbnails, "destination_thumbnails")}
                        </div>

                        <div>
                            <label className={labelStyle}><UploadCloud size={14} /> Upload Custom Thumbnails</label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4 mt-4">
                                {formData.destination_thumbnails.map((img, i) => (
                                    <div 
                                        key={i} 
                                        onClick={() => { if (isViewMode) setSelectedLightboxImage(img); }}
                                        className={`group relative aspect-square rounded-2xl overflow-hidden border-2 border-indigo-100 dark:border-indigo-900 shadow-lg ${isViewMode ? 'cursor-pointer hover:shadow-indigo-500/30 hover:scale-105 transition-all' : ''}`}
                                    >
                                        {img && <img src={img} className="h-full w-full object-cover" alt="" />}
                                        {(!isViewMode) && <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <button 
                                                type="button"
                                                onClick={() => removeDirectImage(i, "destination_thumbnails")} 
                                                className="p-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>}
                                    </div>
                                ))}
                                {(!isViewMode) && <label className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 cursor-pointer flex flex-col items-center justify-center text-slate-400 hover:border-indigo-500 transition-all">
                                    <Plus size={20} />
                                    <input type="file" accept="image/*" multiple onChange={(e) => handleDirectUpload(e, "destination_thumbnails")} hidden />
                                </label>}
                            </div>
                        </div>
                    </div>

                    {/* CUSTOM GALLERY */}
                    <div className="pt-8 border-t border-slate-50 dark:border-slate-800 space-y-8">
                        <label className={labelStyle}><GalleryHorizontal size={14} /> Custom Itinerary Gallery</label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4 mt-4">
                            {formData.destination_images.map((img, i) => (
                                <div 
                                    key={i} 
                                    onClick={() => { if (isViewMode) setSelectedLightboxImage(img); }}
                                    className={`group relative aspect-square rounded-2xl overflow-hidden border-2 border-indigo-100 dark:border-indigo-900 shadow-lg ${isViewMode ? 'cursor-pointer hover:shadow-indigo-500/30 hover:scale-105 transition-all' : ''}`}
                                >
                                    {img && <img src={img} className="h-full w-full object-cover" alt="" />}
                                    {(!isViewMode) && <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button 
                                            type="button"
                                            onClick={() => removeDirectImage(i, "destination_images")} 
                                            className="p-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>}
                                </div>
                            ))}
                            {(!isViewMode) && <label className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 cursor-pointer flex flex-col items-center justify-center text-slate-400 hover:border-indigo-500 transition-all">
                                <Plus size={20} />
                                <input type="file" accept="image/*" multiple onChange={(e) => handleDirectUpload(e, "destination_images")} hidden />
                            </label>}
                        </div>
                    </div>
                </div>
            )}

            {/* LIGHTBOX MODAL */}
            <AnimatePresence>
                {selectedLightboxImage && (
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedLightboxImage(null)}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-sm p-4 cursor-zoom-out"
                    >
                        <motion.img 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            src={selectedLightboxImage} 
                            className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl" 
                            alt="Large View" 
                        />
                        <button 
                            onClick={() => setSelectedLightboxImage(null)}
                            className="absolute top-6 right-6 p-3 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const Plus = ({ size }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;

export default MediaSection;
