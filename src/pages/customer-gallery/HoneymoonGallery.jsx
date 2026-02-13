import { useEffect, useState } from "react";
import { ImagePlus, Trash2, CheckCircle } from "lucide-react";
import { toast } from "react-toastify";
import { apiClient } from "../../stores/authStores";

const DESTINATION_ID = "HONEYMOON"; // use real destination_id if needed
const BACKEND_URL = "http://localhost:5000";

const HoneymoonGallery = () => {
  const [newImages, setNewImages] = useState([]);
  const [galleryImages, setGalleryImages] = useState([]);
  const [selectedForDeletion, setSelectedForDeletion] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGalleryLoading, setIsGalleryLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  // ✅ FIXED: correct GET route
  const fetchGalleryImages = async () => {
    setIsGalleryLoading(true);
    try {
      const response = await apiClient.get(
        `/admin/image-Gallery/${DESTINATION_ID}`
      );

      setGalleryImages(
        response?.data?.imageGalleryData?.image || []
      );
    } catch {
      toast.error("Could not load honeymoon gallery images.");
    } finally {
      setIsGalleryLoading(false);
    }
  };

  useEffect(() => {
    fetchGalleryImages();
  }, []);

  const handleImageChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length + newImages.length > 50) {
      toast.warn("You can upload a maximum of 50 honeymoon images.");
      return;
    }
    setNewImages((prev) => [...prev, ...selectedFiles]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newImages.length === 0) {
      toast.error("Please select at least one honeymoon image to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("destination_id", DESTINATION_ID);
    newImages.forEach((img) => formData.append("image", img));

    const toastId = toast.loading("Uploading honeymoon images...");
    setIsLoading(true);

    try {
      // ✅ FIXED: correct POST route
      await apiClient.post("/admin/image-Gallery", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.update(toastId, {
        render: "Honeymoon images uploaded successfully!",
        type: "success",
        isLoading: false,
        autoClose: 4000,
      });

      setNewImages([]);
      fetchGalleryImages();
    } catch {
      toast.update(toastId, {
        render: "An error occurred while uploading honeymoon images.",
        type: "error",
        isLoading: false,
        autoClose: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ FIXED: use image path (string), not _id
  const handleToggleSelection = (imgPath) => {
    setSelectedForDeletion((prev) =>
      prev.includes(imgPath)
        ? prev.filter((x) => x !== imgPath)
        : [...prev, imgPath]
    );
  };

  const handleDelete = async (imagePaths) => {
    if (!imagePaths || imagePaths.length === 0) {
      toast.info("No honeymoon images selected for deletion.");
      return;
    }

    if (!window.confirm(`Delete ${imagePaths.length} honeymoon image(s)?`))
      return;

    setIsDeleting(true);
    try {
      // ✅ FIXED: backend uses POST, not DELETE
      await apiClient.post("/admin/image-Gallery/delete", {
        destination_id: DESTINATION_ID,
        image_urls: imagePaths,
      });

      toast.success("Honeymoon image(s) deleted successfully.");
      setGalleryImages((prev) =>
        prev.filter((img) => !imagePaths.includes(img))
      );
      setSelectedForDeletion([]);
    } catch {
      toast.error("Failed to delete honeymoon images.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white p-6 sm:p-10">
      <div className="max-w-5xl mx-auto space-y-10">

        {/* UPLOAD (UNCHANGED UI) */}
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-8 border">
          <h1 className="text-3xl font-bold border-b pb-3">
            Honeymoon Trip Gallery
          </h1>

          <label className="block text-sm font-medium mb-2">
            Upload Honeymoon Images (Max 50)
          </label>

          <label
            htmlFor="imageUpload"
            className="flex flex-col items-center justify-center gap-2 cursor-pointer rounded-md border-2 border-dashed p-6 text-center"
          >
            <ImagePlus size={36} />
            <span>{newImages.length} / 50 selected</span>
            <input
              id="imageUpload"
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="hidden"
            />
          </label>

          <button
            type="submit"
            disabled={newImages.length === 0 || isLoading}
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-white"
          >
            {isLoading ? "Uploading..." : "Upload Honeymoon Images"}
          </button>
        </form>

        {/* GALLERY (UNCHANGED UI) */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-6 border">
          <h2 className="text-2xl font-bold">Honeymoon Memories</h2>

          {isGalleryLoading ? (
            <p>Loading honeymoon gallery...</p>
          ) : galleryImages.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {galleryImages.map((imgPath) => {
                const isSelected = selectedForDeletion.includes(imgPath);
                return (
                  <div
                    key={imgPath}
                    onClick={() => handleToggleSelection(imgPath)}
                    className={`relative cursor-pointer border-2 ${
                      isSelected ? "border-blue-500 scale-105" : ""
                    }`}
                  >
                    <img
                      src={`${BACKEND_URL}/${imgPath}`}
                      className="h-32 w-full object-cover"
                    />
                    {isSelected && (
                      <CheckCircle size={20} className="absolute top-1 right-1" />
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete([imgPath]);
                      }}
                      className="absolute bottom-1 right-1 bg-black/60 text-white p-1 rounded"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center py-10">No honeymoon images yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default HoneymoonGallery;
