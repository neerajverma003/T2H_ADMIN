import { useEffect, useState } from "react";
import {
    CheckCircle,
    GalleryHorizontal,
    Image as ImageIcon,
    Video,
    X,
    Heart,
} from "lucide-react";
import { apiClient } from "../../../stores/authStores";

const MediaSection = ({ formData, setFormData, styles, errors = {} }) => {
    const { labelStyle, cardStyle } = styles;

    const [destinationImages, setDestinationImages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // ======================
    // Fetch destination images (title_image and show_image)
    // ======================
    useEffect(() => {
        const fetchDestImages = async () => {
            if (!formData.selected_destination_id) {
                setDestinationImages([]);
                return;
            }

            try {
                setIsLoading(true);
                // Fetch destination details to get title_image and show_image
                const res = await apiClient.get(
                    `/admin/destination/edit/${formData.selected_destination_id}`
                );
                const destData = res?.data?.destination;
                const images = [
                    ...(destData?.title_image || []),
                    ...(destData?.show_image || [])
                ];
                // Remove duplicates if any
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

    // ======================
    // Handlers
    // ======================
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
                [key]: exists
                    ? prev[key].filter((i) => extractS3Key(i) !== urlKey)
                    : [...prev[key], url],
            };
        });
    };

    const handleVideoChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setFormData((prev) => ({
            ...prev,
            video: file,
        }));
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
        setFormData((prev) => ({
            ...prev,
            [key]: prev[key].filter((_, i) => i !== index),
        }));
    };

    const renderGrid = (images, selected, key) => {
        if (isLoading)
            return <p className="text-sm italic text-gray-500">Loading images…</p>;

        if (!images || !images.length)
            return (
                <p className="text-sm italic text-gray-500">
                    No images found for this destination.
                </p>
            );

        return (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
                {images.map((url, idx) => {
                    const urlKey = extractS3Key(url);
                    const isSelected = selected.some(i => extractS3Key(i) === urlKey);
                    return (
                        <div
                            key={`${key}-${idx}`}
                            onClick={() => toggleSelection(key, url)}
                            className={`relative cursor-pointer rounded-md border-2 transition-all duration-200 ${
                                isSelected
                                    ? 'border-indigo-600 ring-2 ring-indigo-200'
                                    : 'border-gray-200 hover:border-indigo-300'
                            }`}
                        >
                            <img
                                src={url}
                                alt="Gallery Image"
                                className="h-24 w-full rounded-md object-cover bg-gray-50"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "https://via.placeholder.com/150?text=Image+Unavailable";
                                }}
                            />
                            {isSelected && (
                                <div className="absolute -top-2 -right-2 bg-indigo-600 rounded-full p-0.5 shadow-md">
                                    <CheckCircle
                                        size={18}
                                        className="text-white"
                                    />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    // ======================
    // Render
    // ======================
    return (
        <div className={`${cardStyle} space-y-6`}>
            <h2 className="text-xl font-semibold border-b pb-2 flex items-center gap-2 text-gray-800">
                <Heart className="text-indigo-600" size={22} />
                Honeymoon Media Settings
            </h2>

            {errors.destination_images && (
                <p className="text-red-500 text-sm font-medium">
                    {errors.destination_images}
                </p>
            )}

            {!formData.selected_destination_id ? (
                <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <p className="text-gray-500 text-sm">
                        Please select a destination above to configure its honeymoon media.
                    </p>
                </div>
            ) : (
                <>
                    {/* Video */}
                    <div className="space-y-3">
                        <label className={`${labelStyle} flex items-center gap-2`}>
                            <Video className="text-indigo-600" size={18} />
                            Honeymoon Highlight Video
                        </label>

                        {formData.video ? (
                            <div className="flex items-center gap-3 bg-indigo-50 border border-indigo-100 p-3 rounded-lg shadow-sm">
                                <Video className="text-indigo-600" size={20} />
                                <span className="text-sm font-medium text-indigo-700 truncate flex-1">
                                    {formData.video.name}
                                </span>
                                <button
                                    type="button"
                                    onClick={removeVideo}
                                    className="p-1 hover:bg-indigo-100 rounded-full text-indigo-600 transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center w-full">
                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <Video className="w-8 h-8 mb-3 text-gray-400" />
                                        <p className="mb-2 text-sm text-gray-500 font-semibold text-center px-4">Click to upload or drag and drop video</p>
                                    </div>
                                    <input 
                                        id="video-upload" 
                                        type="file" 
                                        className="hidden" 
                                        accept="video/*"
                                        onChange={handleVideoChange}
                                    />
                                </label>
                            </div>
                        )}
                    </div>

                    {/* Thumbnails */}
                    <div className="space-y-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                            <label className={`${labelStyle} flex items-center gap-2`}>
                                <ImageIcon className="text-indigo-600" size={18} />
                                Thumbnail Images (from Destination)
                            </label>
                        </div>
                        
                        {renderGrid(
                            destinationImages,
                            formData.destination_thumbnails,
                            "destination_thumbnails"
                        )}

                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Upload New Thumbnails
                            </label>
                            <div className="flex items-center justify-center w-full">
                                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <ImageIcon className="w-6 h-6 mb-2 text-gray-400" />
                                        <p className="text-xs text-gray-500">PNG, JPG or WEBP (Max 5MB)</p>
                                    </div>
                                    <input 
                                        type="file" 
                                        className="hidden" 
                                        accept="image/*"
                                        multiple
                                        onChange={(e) => handleDirectUpload(e, "destination_thumbnails")}
                                    />
                                </label>
                            </div>
                        </div>

                        {/* Preview uploaded thumbnails */}
                        <div className="grid grid-cols-3 gap-3 pt-2">
                            {formData.destination_thumbnails
                                .filter((i) => typeof i === 'string' && i.startsWith("data:"))
                                .map((img, i) => (
                                    <div key={i} className="relative group border rounded-lg overflow-hidden shadow-sm">
                                        <img src={img} className="h-20 w-full object-cover" alt="Preview" />
                                        <button
                                            type="button"
                                            onClick={() => removeDirectImage(i, "destination_thumbnails")}
                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                ))}
                        </div>
                    </div>

                    {/* Destination Images - Kept empty as requested */}
                    <div className="space-y-3 pt-4 border-t border-gray-100">
                        <label className={`${labelStyle} flex items-center gap-2`}>
                            <GalleryHorizontal className="text-indigo-600" size={18} />
                            Destination Gallery Images
                        </label>
                        <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-200">
                            <p className="text-sm text-gray-400">Gallery images are currently hidden. You can upload custom images below.</p>
                        </div>
                    </div>

                    {/* Upload Custom Gallery Images */}
                    <div className="space-y-4">
                        <label className="block text-sm font-medium text-gray-700">
                            Upload Custom Gallery Images
                        </label>
                        <div className="flex items-center justify-center w-full">
                            <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <ImageIcon className="w-6 h-6 mb-2 text-gray-400" />
                                    <p className="text-xs text-gray-500 text-center">Click to add more romantic images to this itinerary</p>
                                </div>
                                <input 
                                    type="file" 
                                    className="hidden" 
                                    accept="image/*"
                                    multiple
                                    onChange={(e) => handleDirectUpload(e, "destination_images")}
                                />
                            </label>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            {formData.destination_images
                                .filter((i) => typeof i === 'string' && i.startsWith("data:"))
                                .map((img, i) => (
                                    <div key={i} className="relative group border rounded-lg overflow-hidden shadow-sm">
                                        <img src={img} className="h-20 w-full object-cover" alt="Preview" />
                                        <button
                                            type="button"
                                            onClick={() => removeDirectImage(i, "destination_images")}
                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default MediaSection;
