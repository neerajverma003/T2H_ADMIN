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

    const [galleryImages, setGalleryImages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // ======================
    // Fetch destination gallery
    // ======================
    useEffect(() => {
        const fetchImages = async () => {
            if (!formData.selected_destination_id) {
                setGalleryImages([]);
                return;
            }

            try {
                setIsLoading(true);
                const res = await apiClient.get(
                    `/admin/image-Gallery/${formData.selected_destination_id}`
                );
                setGalleryImages(res?.data?.imageGalleryData?.image || []);
            } catch {
                setGalleryImages([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchImages();
    }, [formData.selected_destination_id]);

    // ======================
    // Handlers
    // ======================
    const toggleSelection = (key, url) => {
        setFormData((prev) => {
            const exists = prev[key].includes(url);
            return {
                ...prev,
                [key]: exists
                    ? prev[key].filter((i) => i !== url)
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
        const input = document.getElementById("video-upload");
        if (input) input.value = "";
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

        e.target.value = "";
    };

    const removeDirectImage = (index, key) => {
        setFormData((prev) => ({
            ...prev,
            [key]: prev[key].filter((_, i) => i !== index),
        }));
    };

    const renderGrid = (images, selected, key) => {
        if (isLoading)
            return <p className="text-sm italic">Loading images…</p>;

        if (!images.length)
            return (
                <p className="text-sm italic text-gray-500">
                    No images found for this destination.
                </p>
            );

        return (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
                {images.map((url, idx) => {
                    const isSelected = selected.includes(url);
                    return (
                        <div
                            key={`${key}-${idx}`}
                            onClick={() => toggleSelection(key, url)}
                            className={`relative cursor-pointer rounded-md border-2 ${
                                isSelected
                                    ? "border-pink-500"
                                    : "border-gray-300"
                            }`}
                        >
                            <img
                                src={url}
                                alt="gallery"
                                className="h-20 w-full rounded-md object-cover"
                            />
                            {isSelected && (
                                <CheckCircle
                                    size={18}
                                    className="absolute top-1 right-1 bg-white rounded-full text-pink-600"
                                />
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
            <h2 className="text-xl font-semibold border-b pb-2 flex items-center gap-2">
                <Heart className="text-pink-500" size={20} />
                Honeymoon Media
            </h2>

            {errors.destination_images && (
                <p className="text-red-500 text-sm">
                    {errors.destination_images}
                </p>
            )}

            {!formData.selected_destination_id ? (
                <p className="italic text-gray-500 text-sm">
                    Select a destination to load romantic media options.
                </p>
            ) : (
                <>
                    {/* Video */}
                    <div>
                        <label className={labelStyle}>
                            <Video className="inline mr-2" size={16} />
                            Honeymoon Video
                        </label>

                        {formData.video ? (
                            <div className="flex items-center gap-2 border p-2 rounded">
                                <span className="text-sm truncate">
                                    {formData.video.name}
                                </span>
                                <button
                                    type="button"
                                    onClick={removeVideo}
                                    className="ml-auto text-red-500"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ) : (
                            <input
                                id="video-upload"
                                type="file"
                                accept="video/*"
                                onChange={handleVideoChange}
                            />
                        )}
                    </div>

                    {/* Thumbnails */}
                    <div>
                        <label className={labelStyle}>
                            <ImageIcon className="inline mr-2" size={16} />
                            Thumbnail Images
                        </label>
                        {renderGrid(
                            galleryImages,
                            formData.destination_thumbnails,
                            "destination_thumbnails"
                        )}
                    </div>

                    {/* Gallery */}
                    <div>
                        <label className={labelStyle}>
                            <GalleryHorizontal
                                className="inline mr-2"
                                size={16}
                            />
                            Destination Images
                        </label>
                        {renderGrid(
                            galleryImages,
                            formData.destination_images,
                            "destination_images"
                        )}
                    </div>

                    {/* Upload Own Images */}
                    <div className="pt-4 border-t">
                        <label className={labelStyle}>
                            Upload Your Own Images
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) =>
                                handleDirectUpload(
                                    e,
                                    "destination_images"
                                )
                            }
                        />

                        <div className="grid grid-cols-3 gap-3 pt-3">
                            {formData.destination_images
                                .filter((i) => i.startsWith("data:"))
                                .map((img, i) => (
                                    <div
                                        key={i}
                                        className="relative border rounded"
                                    >
                                        <img
                                            src={img}
                                            className="h-20 w-full object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                removeDirectImage(
                                                    i,
                                                    "destination_images"
                                                )
                                            }
                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
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
