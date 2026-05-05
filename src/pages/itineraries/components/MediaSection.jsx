import { useEffect, useState } from "react";
import {
    CheckCircle,
    GalleryHorizontal,
    Image as ImageIcon,
    Video,
    X,
    Heart,
    Sparkles,
    UploadCloud,
    Film,
    Play
} from "lucide-react";
import { apiClient } from "../../../stores/authStores";

const MediaSection = ({ formData, setFormData, styles, errors = {} }) => {
    const { labelStyle, cardStyle, inputStyle } = styles;

    const [destinationImages, setDestinationImages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

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
        setFormData((prev) => {
            const urlKey = extractS3Key(url);
            const exists = prev[key].some(i => extractS3Key(i) === urlKey);
            return {
                ...prev,
                [key]: exists ? prev[key].filter((i) => extractS3Key(i) !== urlKey) : [...prev[key], url],
            };
        });
    };

    const handleVideoChange = (e) => {
        const file = e.target.files?.[0];
        if (file) setFormData((prev) => ({ ...prev, video: file }));
    };

    const removeVideo = () => {
        setFormData((prev) => ({ ...prev, video: null }));
        const input = document.getElementById('video-upload');
        if (input) input.value = '';
    };

    const handleDirectUpload = (e, key) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;
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
        e.target.value = '';
    };

    const removeDirectImage = (index, key) => {
        setFormData((prev) => ({ ...prev, [key]: prev[key].filter((_, i) => i !== index) }));
    };

    const renderGrid = (images, selected, key) => {
        if (isLoading) return <div className="py-12 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;
        if (!images || !images.length) return <div className="p-10 rounded-3xl bg-slate-50 dark:bg-slate-800/50 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">No destination assets found.</div>;

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
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Select a destination to unlock media manager</p>
                </div>
            ) : (
                <div className="space-y-12">
                    {/* VIDEO SECTION */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] p-8 border border-transparent hover:border-indigo-100 dark:hover:border-indigo-900/30 transition-all">
                        <label className={labelStyle}><Film size={14} /> Highlight Reel</label>
                        {formData.video ? (
                            <div className="mt-4 group relative aspect-video max-w-md rounded-3xl overflow-hidden border-4 border-white dark:border-slate-900 shadow-2xl">
                                <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center">
                                    <div className="bg-white/20 backdrop-blur-md p-4 rounded-full"><Play size={32} className="text-white fill-white" /></div>
                                </div>
                                <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-between">
                                   <p className="text-white text-[10px] font-black uppercase tracking-widest truncate">{formData.video.name}</p>
                                   <button onClick={removeVideo} className="p-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all"><X size={14} /></button>
                                </div>
                            </div>
                        ) : (
                            <label className="mt-4 group relative block w-full h-32 rounded-[1.5rem] border-2 border-dashed border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 cursor-pointer overflow-hidden transition-all hover:border-indigo-500 flex flex-col items-center justify-center text-slate-400">
                               <Film size={24} strokeWidth={1.5} />
                               <p className="mt-2 text-[9px] font-black uppercase tracking-widest">Upload Cinematic Preview</p>
                               <input id="video-upload" type="file" accept="video/*" onChange={handleVideoChange} hidden />
                            </label>
                        )}
                    </div>

                    {/* THUMBNAILS */}
                    <div className="space-y-8">
                        <div>
                            <label className={labelStyle}><Sparkles size={14} /> Destination Source Assets</label>
                            {renderGrid(destinationImages, formData.destination_thumbnails, "destination_thumbnails")}
                        </div>

                        <div>
                            <label className={labelStyle}><UploadCloud size={14} /> Upload Custom Thumbnails</label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4 mt-4">
                                {formData.destination_thumbnails.filter(i => typeof i === 'string' && i.startsWith("data:")).map((img, i) => (
                                    <div key={i} className="group relative aspect-square rounded-2xl overflow-hidden border-2 border-indigo-100 dark:border-indigo-900 shadow-lg">
                                        {img && <img src={img} className="h-full w-full object-cover" alt="" />}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <button onClick={() => removeDirectImage(i, "destination_thumbnails")} className="p-2 bg-red-500 text-white rounded-xl"><X size={14} /></button>
                                        </div>
                                    </div>
                                ))}
                                <label className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 cursor-pointer flex flex-col items-center justify-center text-slate-400 hover:border-indigo-500 transition-all">
                                    <Plus size={20} />
                                    <input type="file" accept="image/*" multiple onChange={(e) => handleDirectUpload(e, "destination_thumbnails")} hidden />
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* CUSTOM GALLERY */}
                    <div className="pt-8 border-t border-slate-50 dark:border-slate-800 space-y-8">
                        <label className={labelStyle}><GalleryHorizontal size={14} /> Custom Itinerary Gallery</label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4 mt-4">
                            {formData.destination_images.filter(i => typeof i === 'string' && i.startsWith("data:")).map((img, i) => (
                                <div key={i} className="group relative aspect-square rounded-2xl overflow-hidden border-2 border-indigo-100 dark:border-indigo-900 shadow-lg">
                                    {img && <img src={img} className="h-full w-full object-cover" alt="" />}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button onClick={() => removeDirectImage(i, "destination_images")} className="p-2 bg-red-500 text-white rounded-xl"><X size={14} /></button>
                                    </div>
                                </div>
                            ))}
                            <label className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 cursor-pointer flex flex-col items-center justify-center text-slate-400 hover:border-indigo-500 transition-all">
                                <Plus size={20} />
                                <input type="file" accept="image/*" multiple onChange={(e) => handleDirectUpload(e, "destination_images")} hidden />
                            </label>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const Plus = ({ size }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;

export default MediaSection;
