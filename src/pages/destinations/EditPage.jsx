import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { apiClient } from "../../stores/authStores";
import axios from "axios";

const EditDestination = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const isValidObjectId = (val) => /^[0-9a-fA-F]{24}$/.test(val);

  const [data, setData] = useState({
    type: "",
    destination_name: "",
    newFiles: [],           // raw File objects chosen by user
    existingImages: [],     // presigned URLs from backend (for display)
    destination_type: [],
    show_image: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");

  useEffect(() => {
    if (!isValidObjectId(id)) {
      toast.error("Invalid destination id");
      navigate("/destinations");
      return;
    }
    async function fetchData() {
      try {
        const res = await apiClient.get(`/admin/destination/edit/${id}`);
        if (res.data.success) {
          setData({
            type: res.data.destination.domestic_or_international?.toLowerCase().trim() || "",
            destination_name: res.data.destination.destination_name || "",
            newFiles: [],
            existingImages: res.data.destination.title_image || [],
            destination_type: res.data.destination.destination_type || [],
            show_image: res.data.destination.show_image || [],
          });
        } else {
          toast.error("Failed to load destination data.");
        }
      } catch {
        toast.error("Server error while fetching destination.");
      }
    }
    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, files, checked } = e.target;
    if (name === "image") {
      setData((prev) => ({ ...prev, newFiles: Array.from(files) }));
    } else if (name === "destination_type") {
      setData((prev) => ({
        ...prev,
        destination_type: checked
          ? [...prev.destination_type, value]
          : prev.destination_type.filter((t) => t !== value),
      }));
    } else {
      setData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleShowImageToggle = (img) => {
    setData((prev) => ({
      ...prev,
      show_image: prev.show_image.includes(img)
        ? prev.show_image.filter((i) => i !== img)
        : [...prev.show_image, img],
    }));
  };

  const handleDeleteImage = async (img) => {
    try {
      const res = await apiClient.patch(`/admin/destination/${id}/delete-image`, {
        imagePath: img,
      });
      if (res.data.success) {
        setData((prev) => ({
          ...prev,
          existingImages: prev.existingImages.filter((i) => i !== img),
          show_image: prev.show_image.filter((i) => i !== img),
        }));
        toast.success("Image deleted successfully");
      } else {
        toast.error(res.data.msg || "Failed to delete image");
      }
    } catch {
      toast.error("Server error while deleting image.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setUploadProgress("");

    try {
      if (!isValidObjectId(id)) {
        toast.error("Invalid destination id");
        setIsLoading(false);
        return;
      }

      // ─── Step 1: Upload new files directly to S3 (same as CreateDestination) ───
      const newImageKeys = [];
      if (data.newFiles.length > 0) {
        const capitalizedType =
          data.type.charAt(0).toUpperCase() + data.type.slice(1);
        const folder = `destination/${capitalizedType}/${data.destination_name.replace(/\s+/g, "_")}`;

        for (let i = 0; i < data.newFiles.length; i++) {
          const file = data.newFiles[i];
          setUploadProgress(`Uploading image ${i + 1} of ${data.newFiles.length}...`);

          const presignedRes = await apiClient.post("/admin/generate-presigned-url", {
            fileName: file.name,
            fileType: file.type,
            folder,
          });

          const { uploadUrl, key } = presignedRes.data;

          // PUT directly to S3 (bypasses our backend)
          await axios.put(uploadUrl, file, {
            headers: { "Content-Type": file.type },
          });

          newImageKeys.push(key);
        }
        setUploadProgress("");
      }

      // ─── Step 2: Send JSON to backend ───────────────────────────────────────────
      const payload = {
        type: data.type,
        destination_name: data.destination_name,
        destination_type: data.destination_type,
        show_image: data.show_image,
        new_image_keys: newImageKeys,  // S3 keys of newly uploaded images
      };

      const response = await apiClient.patch(`/admin/destination/${id}`, payload);
      if (response.data.success) {
        toast.success("Destination updated successfully 💍");
        navigate("/destinations/create");
      } else {
        toast.error(response.data.message || "Update failed.");
      }
    } catch (err) {
      console.error("Edit destination error:", err);
      toast.error(
        err.response?.data?.msg || "Server error while updating destination."
      );
    }
    setIsLoading(false);
  };

  return (
    <div className="mx-auto max-w-3xl rounded-2xl bg-slate-900 p-6 shadow-lg border border-slate-700">
      <h1 className="mb-6 text-2xl font-bold text-white">Edit Destination</h1>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Destination Type */}
        <div>
          <label className="block text-sm font-medium text-slate-300">
            Destination Type
          </label>
          <select
            name="type"
            value={data.type}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2
              text-slate-100 focus:ring-2 focus:ring-pink-500 focus:outline-none"
          >
            <option value="">Select Type</option>
            <option value="domestic">Domestic</option>
            <option value="international">International</option>
          </select>
        </div>

        {/* Destination Name */}
        <div>
          <label className="block text-sm font-medium text-slate-300">
            Destination Name
          </label>
          <input
            type="text"
            name="destination_name"
            value={data.destination_name}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2
              text-slate-100 focus:ring-2 focus:ring-pink-500 focus:outline-none"
          />
        </div>

        {/* Categories */}
        <div>
          <label className="block text-sm font-medium text-slate-300">
            Categories
          </label>
          <div className="mt-2 flex flex-wrap gap-4">
            {["trending", "TopMost Destination", "exclusive", "weekend", "home", "honeymoon"].map((opt) => (
              <label key={opt} className="flex items-center gap-2 text-slate-300">
                <input
                  type="checkbox"
                  name="destination_type"
                  value={opt}
                  checked={data.destination_type.includes(opt)}
                  onChange={handleChange}
                  className="accent-pink-600"
                />
                <span className="capitalize">{opt}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Upload New Images */}
        <div>
          <label className="block text-sm font-medium text-slate-300">
            Upload New Images
          </label>
          <input
            type="file"
            name="image"
            multiple
            accept="image/*"
            onChange={handleChange}
            className="mt-1 block w-full text-sm text-slate-300"
          />
          {data.newFiles.length > 0 && (
            <p className="mt-1 text-xs text-slate-400">
              {data.newFiles.length} new file(s) selected
            </p>
          )}
          {uploadProgress && (
            <p className="mt-1 text-xs text-blue-400">{uploadProgress}</p>
          )}
        </div>

        {/* Existing Images Preview */}
        {data.existingImages.length > 0 && (
          <div>
            <h2 className="mb-3 mt-4 font-medium text-slate-300">
              Existing Images
              <span className="ml-2 text-xs text-slate-500">
                (✓ = set as show image, ✕ = delete)
              </span>
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {data.existingImages.map((img, idx) => (
                <div
                  key={idx}
                  className="group relative rounded-md border border-slate-700 bg-slate-800 p-1"
                >
                  <img
                    src={img}
                    alt={`Destination ${idx + 1}`}
                    className="h-28 w-full rounded-md object-cover"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                  {/* Fallback placeholder */}
                  <div
                    className="hidden h-28 w-full items-center justify-center rounded-md bg-slate-700 text-xs text-slate-400"
                  >
                    Image unavailable
                  </div>

                  <span className="absolute top-1 left-1 rounded bg-emerald-600 px-2 py-0.5 text-xs text-white">
                    Existing
                  </span>

                  {/* Show image toggle checkbox */}
                  <label className="absolute left-1 bottom-1 rounded bg-black/60 p-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={data.show_image.includes(img)}
                      onChange={() => handleShowImageToggle(img)}
                      className="h-4 w-4 accent-pink-600"
                    />
                  </label>

                  {/* Delete button */}
                  <button
                    type="button"
                    onClick={() => handleDeleteImage(img)}
                    className="absolute right-1 top-1 rounded-full bg-red-600 p-1 text-xs text-white
                      opacity-0 transition group-hover:opacity-100"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-md bg-pink-600 px-4 py-2.5 font-semibold text-white
            hover:bg-pink-700 transition disabled:opacity-50"
        >
          {isLoading
            ? uploadProgress || "Updating..."
            : "Update Destination"}
        </button>
      </form>
    </div>
  );
};

export default EditDestination;
