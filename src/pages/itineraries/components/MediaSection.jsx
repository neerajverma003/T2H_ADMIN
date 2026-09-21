import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    CheckCircle,
    GalleryHorizontal,
    Image as ImageIcon,
    X,
    Sparkles,
    UploadCloud,
    Plus,
} from "lucide-react";
import { apiClient } from "../../../stores/authStores";
import { getCdnUrl } from "../../../utils/media";

const MediaSection = ({ formData, setFormData, styles, errors = {} }) => {
    const { labelStyle, cardStyle } = styles;
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
            Promise.all(
                files.map(
                    (file) =>
                        new Promise((resolve) => {
                            const reader = new FileReader();
                            reader.onload = (ev) => resolve({ preview: ev.target.result, file });
                            reader.readAsDataURL(file);
                        })
                )
            ).then((results) => {
                setFormData((prev) => ({
                    ...prev,
                    [key]: [...prev[key], ...results.map((r) => r.preview)],
                    [`${key}_files`]: [...(prev[`${key}_files`] || []), ...results.map((r) => r.file)],
                }));
            });
        }
        e.target.value = '';
    };

    const removeDirectImage = (index, key) => {
        if (isViewMode) return;
        setFormData((prev) => ({ ...prev, [key]: prev[key].filter((_, i) => i !== index) }));
    };

    const renderGrid = (images, selected, key) => {
        if (isLoading) return <div className="py-10 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div></div>;
        if (!images || !images.length) {
            return (
                <div className="p-8 rounded-2xl bg-slate-50 dark:bg-[#050A17] border border-slate-200 dark:border-slate-800 text-center text-xs font-semibold text-slate-500 dark:text-slate-400">
                    No destination assets found for the selected destination.
                </div>
            );
        }

        return (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
                {images.map((url, idx) => {
                    const urlKey = extractS3Key(url);
                    const isSelected = selected.some(i => extractS3Key(i) === urlKey);
                    return (
                        <div
                            key={`${key}-${idx}`}
                            onClick={() => toggleSelection(key, url)}
                            className={`group relative aspect-square cursor-pointer rounded-2xl overflow-hidden border-2 transition-all ${
                                isSelected ? 'border-indigo-500 ring-4 ring-indigo-500/20 shadow-lg shadow-indigo-500/10' : 'border-slate-200 dark:border-slate-800/90 bg-slate-50 dark:bg-[#050A17] hover:border-slate-300 dark:hover:border-slate-700'
                            }`}
                        >
                            {url ? (
                                <img
                                    src={getCdnUrl(url)}
                                    alt=""
                                    className={`h-full w-full object-cover transition-transform group-hover:scale-105 ${!isSelected && 'opacity-70 group-hover:opacity-100'}`}
                                />
                            ) : (
                                <div className="h-full w-full bg-slate-100 dark:bg-[#050A17] flex items-center justify-center text-[10px] font-bold text-slate-400 dark:text-slate-500">Missing</div>
                            )}
                            {isSelected && (
                                <div className="absolute inset-0 bg-indigo-950/40 flex items-center justify-center">
                                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full p-1.5 shadow-lg shadow-indigo-500/30">
                                        <CheckCircle size={18} className="text-white" />
                                    </div>
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
            {/* LUXURY CARD HEADER */}
            <div className="flex items-center gap-4 pb-6 border-b border-slate-200 dark:border-slate-800/80">
                <div className="size-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 shrink-0">
                    <ImageIcon size={22} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Media & Visual Assets</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Select destination assets and upload custom thumbnails or gallery photos</p>
                </div>
            </div>

            {/* DESTINATION GALLERY INFO AMBER BANNER */}
            <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/20 border border-amber-500/30 flex items-start gap-3">
                <div className="p-1.5 bg-amber-500/10 rounded-lg text-amber-500 dark:text-amber-400 mt-0.5 shrink-0">
                    <ImageIcon size={16} />
                </div>
                <div>
                    <h4 className="text-[11px] font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider">
                        DESTINATION GALLERY INFO
                    </h4>
                    <p className="text-xs text-amber-800/80 dark:text-amber-200/80 mt-0.5 leading-relaxed font-medium">
                        Select a destination in Core Details to load its pre-saved image gallery, or upload your own custom images directly below
                    </p>
                </div>
            </div>

            {errors.destination_images && (
                <p className="p-4 bg-red-50 dark:bg-red-950/20 rounded-2xl border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold">
                    {errors.destination_images}
                </p>
            )}

            {!formData.selected_destination_id ? (
                <div className="p-10 text-center bg-slate-50 dark:bg-[#050A17] rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                    <ImageIcon className="mx-auto mb-3 text-slate-400 dark:text-slate-600" size={40} strokeWidth={1.5} />
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Select a destination in Core Details to unlock media manager
                    </p>
                </div>
            ) : (
                <div className="space-y-8">
                    {/* THUMBNAILS */}
                    <div className="space-y-6">
                        <div>
                            <label className={labelStyle}><Sparkles size={13} className="text-indigo-400" /> Destination Source Assets</label>
                            {renderGrid(destinationImages, formData.destination_thumbnails, "destination_thumbnails")}
                        </div>

                        <div>
                            <label className={labelStyle}><UploadCloud size={13} className="text-indigo-400" /> Upload Custom Thumbnails</label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4 mt-3">
                                {formData.destination_thumbnails.map((img, i) => (
                                    <div 
                                        key={i} 
                                        onClick={() => { if (isViewMode) setSelectedLightboxImage(img); }}
                                        className={`group relative aspect-square rounded-2xl overflow-hidden border border-indigo-500/30 shadow-md ${isViewMode ? 'cursor-pointer hover:scale-105 transition-all' : ''}`}
                                    >
                                        {img && <img src={getCdnUrl(img)} className="h-full w-full object-cover" alt="" />}
                                        {(!isViewMode) && (
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <button 
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); removeDirectImage(i, "destination_thumbnails"); }} 
                                                    className="p-2 bg-red-500/90 text-white rounded-xl hover:bg-red-600 transition-colors shadow-lg cursor-pointer"
                                                >
                                                    <X size={15} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {(!isViewMode) && (
                                    <label className="aspect-square rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#050A17] cursor-pointer flex flex-col items-center justify-center text-slate-400 hover:border-indigo-500/60 hover:text-indigo-500 hover:bg-indigo-500/5 transition-all">
                                        <Plus size={22} />
                                        <span className="text-[11px] font-bold mt-1.5 uppercase tracking-wider">Upload</span>
                                        <input type="file" accept="image/*" multiple onChange={(e) => handleDirectUpload(e, "destination_thumbnails")} hidden />
                                    </label>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* CUSTOM GALLERY */}
                    <div className="pt-6 border-t border-slate-200 dark:border-slate-800/80 space-y-6">
                        <label className={labelStyle}><GalleryHorizontal size={13} className="text-indigo-400" /> Custom Itinerary Gallery</label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4 mt-3">
                            {formData.destination_images.map((img, i) => (
                                <div 
                                    key={i} 
                                    onClick={() => { if (isViewMode) setSelectedLightboxImage(img); }}
                                    className={`group relative aspect-square rounded-2xl overflow-hidden border border-indigo-500/30 shadow-md ${isViewMode ? 'cursor-pointer hover:scale-105 transition-all' : ''}`}
                                >
                                    {img && <img src={getCdnUrl(img)} className="h-full w-full object-cover" alt="" />}
                                    {(!isViewMode) && (
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <button 
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); removeDirectImage(i, "destination_images"); }} 
                                                className="p-2 bg-red-500/90 text-white rounded-xl hover:bg-red-600 transition-colors shadow-lg cursor-pointer"
                                            >
                                                <X size={15} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                            {(!isViewMode) && (
                                <label className="aspect-square rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#050A17] cursor-pointer flex flex-col items-center justify-center text-slate-400 hover:border-indigo-500/60 hover:text-indigo-500 hover:bg-indigo-500/5 transition-all">
                                    <Plus size={22} />
                                    <span className="text-[11px] font-bold mt-1.5 uppercase tracking-wider">Upload</span>
                                    <input type="file" accept="image/*" multiple onChange={(e) => handleDirectUpload(e, "destination_images")} hidden />
                                </label>
                            )}
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

export default MediaSection;
