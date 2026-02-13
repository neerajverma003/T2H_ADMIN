import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Custom alert function to replace Swal
const showAlert = (type, title, message) => {
  if (type === "success") {
    alert(`✅ ${title}\n\n${message}`);
  } else if (type === "error") {
    alert(`❌ ${title}\n\n${message}`);
  } else if (type === "warning") {
    alert(`⚠️ ${title}\n\n${message}`);
  }
};

// Accept optional prop `editId` to enable edit mode
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
  const [pageLoading, setPageLoading] = useState(editId ? true : false);
  const navigate = useNavigate();
  const id = editId;

  const [existingImages, setExistingImages] = useState([]);
  const [removedImageIndexes, setRemovedImageIndexes] = useState([]);

  // Fetch resort data if in edit mode
  useEffect(() => {
    if (id) {
      fetchResortData();
    }
  }, [id]);

  const fetchResortData = async () => {
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        showAlert("error", "Authentication Error", "Please login first");
        navigate("/login");
        return;
      }

      const response = await fetch(`http://localhost:5000/admin/resort/get/${id}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch resort: ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      let data;

      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        throw new Error("Server returned invalid response format");
      }

      const resort = data.data || data;

      setFormData({
        title: resort.title || "",
        description: resort.description || "",
        images: null,
        is_active: resort.is_active !== false,
        price_per_night: resort.price_per_night || 0,
        destination: resort.destination || "",
        city: resort.city || "",
        state: resort.state || "",
        country: resort.country || "",
        duration_days: resort.duration_days || 1,
        average_rating: resort.average_rating || 0,
        review_count: resort.review_count || 0,
        number_of_ratings: resort.number_of_ratings || 0,
        inclusions: resort.inclusions || [],
        tags: resort.tags || [],
        visibility: resort.visibility || "public",
        discount: resort.discount || 0,
        start_date: resort.start_date || "",
        end_date: resort.end_date || "",
        availability_status: resort.availability_status || "Available",
        amenities: resort.amenities || [],
        policies: resort.policies || "",
        contact_email: resort.contact_email || "",
        contact_phone: resort.contact_phone || "",
        is_featured: resort.is_featured || false,
      });

      if (resort.images && Array.isArray(resort.images)) {
        setExistingImages(resort.images);
      }
    } catch (error) {
      console.error("Error fetching resort:", error);
      showAlert("error", "Error", error.message || "Failed to load resort data. Make sure the backend is running.");
    } finally {
      setPageLoading(false);
    }
  };

  const styleProps = {
    inputStyle:
      "block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 p-2 text-gray-900 dark:text-white shadow-sm",
    labelStyle:
      "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1",
    cardStyle:
      "bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700",
    buttonStyle:
      "flex items-center gap-2 rounded-md bg-pink-600 px-4 py-2 text-sm font-semibold text-white hover:bg-pink-500",
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === "checkbox" && Array.isArray(formData[name])) {
      setFormData((prev) => ({
        ...prev,
        [name]: checked
          ? [...prev[name], value]
          : prev[name].filter((i) => i !== value),
      }));
    } else if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (type === "file") {
      setFormData((prev) => ({ ...prev, images: files }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.title || !formData.description) {
        showAlert("error", "Validation Error", "Please fill in title and description");
        setLoading(false);
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        showAlert("error", "Authentication Error", "Please login first");
        setLoading(false);
        navigate("/login");
        return;
      }

      const payload = new FormData();
      
      // Add all form fields to payload
      Object.entries(formData).forEach(([key, val]) => {
        if (Array.isArray(val) && val.length > 0) {
          payload.append(key, JSON.stringify(val));
        } else if (val !== null && val !== "" && !Array.isArray(val)) {
          payload.append(key, val);
        }
      });

      // Add new images
      if (formData.images && formData.images.length > 0) {
        for (let i = 0; i < formData.images.length; i++) {
          payload.append("images", formData.images[i]);
        }
      }

      // For editing, include removed image indexes
      if (id && removedImageIndexes.length > 0) {
        payload.append("removedImageIndexes", JSON.stringify(removedImageIndexes));
      }

      // Determine URL and method
      const url = id
        ? `http://localhost:5000/admin/resort/update/${id}`
        : "http://localhost:5000/admin/resort";
      const method = id ? "PATCH" : "POST";

      console.log("Submitting to:", url, "Method:", method);
      console.log("Form data keys:", Array.from(payload.keys()));

      // Make request
      const response = await fetch(url, {
        method,
        body: payload,
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      console.log("Response status:", response.status);

      const contentType = response.headers.get("content-type");
      let data;

      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.error("Non-JSON response:", text.substring(0, 200));
        throw new Error("Server error: Invalid response format");
      }

      if (!response.ok) {
        throw new Error(data?.message || `Server error: ${response.status}`);
      }

      console.log("Success response:", data);

      // Success message
      showAlert("success", id ? "Resort Updated!" : "Resort Created!", 
        `Your ${id ? "resort has been updated" : "new resort has been created"} successfully.`);

      // Reset form
      setFormData({
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

      // Redirect to resorts list
      setTimeout(() => {
        navigate("/resorts");
      }, 1500);
    } catch (error) {
      console.error("Error saving resort:", error);
      showAlert("error", "Error", error.message || "Failed to save resort. Please check the backend server is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6 text-white">
      <div className="max-w-4xl mx-auto">
        {pageLoading ? (
          <div className="text-center py-12">
            <p className="text-xl">Loading resort data...</p>
          </div>
        ) : (
          <>
        <h1 className="text-3xl font-bold mb-6">
          {id ? "Edit Resort" : "Create New Resort"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Trip Details */}
          <div className={styleProps.cardStyle}>
            <h2 className="text-xl font-semibold mb-4">Trip Details</h2>

            <label className={styleProps.labelStyle}>Title</label>
            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={styleProps.inputStyle}
            />

            <label className={`${styleProps.labelStyle} mt-4`}>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={`${styleProps.inputStyle} h-24`}
            />
          </div>

          {/* Destination */}
          <div className={styleProps.cardStyle}>
            <h2 className="text-xl font-semibold mb-4">Destination & Pricing</h2>

            {["destination", "city", "state", "country"].map((f) => (
              <div key={f} className="mb-3">
                <label className={styleProps.labelStyle}>
                  {f.replace("_", " ").toUpperCase()}
                </label>
                <input
                  name={f}
                  value={formData[f]}
                  onChange={handleChange}
                  className={styleProps.inputStyle}
                />
              </div>
            ))}

            <div className="mb-3">
              <label className={styleProps.labelStyle}>Price Per Night (₹)</label>
              <input
                type="number"
                name="price_per_night"
                value={formData.price_per_night}
                onChange={handleChange}
                className={styleProps.inputStyle}
              />
            </div>

            <div className="mb-3">
              <label className={styleProps.labelStyle}>Contact Phone</label>
              <input
                type="tel"
                name="contact_phone"
                value={formData.contact_phone}
                onChange={handleChange}
                className={styleProps.inputStyle}
                placeholder="e.g., 9876543210"
              />
            </div>

            <div className="mb-3">
              <label className={styleProps.labelStyle}>Contact Email</label>
              <input
                type="email"
                name="contact_email"
                value={formData.contact_email}
                onChange={handleChange}
                className={styleProps.inputStyle}
              />
            </div>
          </div>

          {/* Trip Dates */}
          <div className={styleProps.cardStyle}>
            <h2 className="text-xl font-semibold mb-4">Trip Dates</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={styleProps.labelStyle}>Start Date</label>
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                  className={styleProps.inputStyle}
                />
              </div>

              <div>
                <label className={styleProps.labelStyle}>End Date</label>
                <input
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleChange}
                  className={styleProps.inputStyle}
                />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className={styleProps.cardStyle}>
            <h2 className="text-xl font-semibold mb-4">Images & Amenities</h2>
            
            <label className={styleProps.labelStyle}>Resort Images</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleChange}
              className={styleProps.inputStyle}
            />

            {existingImages.length > 0 && (
              <div className="mt-4 flex gap-3 flex-wrap">
                {existingImages.map((src, idx) => {
                  // Construct full image URL for existing images
                  const baseUrl = import.meta.env.VITE_API_BASE || "http://localhost:5000";
                  const fullImageUrl = src.startsWith("http") ? src : `${baseUrl}${src}`;
                  
                  return (
                  <div key={idx} className="relative group">
                    <img
                      src={fullImageUrl}
                      alt="existing"
                      className={`h-20 w-20 rounded object-cover border ${
                        removedImageIndexes.includes(idx)
                          ? "opacity-30"
                          : ""
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setRemovedImageIndexes((prev) =>
                          prev.includes(idx)
                            ? prev.filter((i) => i !== idx)
                            : [...prev, idx]
                        )
                      }
                      className="absolute -top-2 -right-2 bg-red-600 text-white w-6 h-6 rounded-full text-sm opacity-0 group-hover:opacity-100"
                    >
                      ✕
                    </button>
                  </div>
                  );
                })}
              </div>
            )}

            <label className={`${styleProps.labelStyle} mt-4`}>Amenities (comma separated)</label>
            <input
              type="text"
              name="amenities"
              placeholder="e.g., WiFi, Pool, Gym, Spa"
              onChange={(e) => {
                const amenitiesArray = e.target.value.split(",").map(a => a.trim());
                setFormData(prev => ({ ...prev, amenities: amenitiesArray }));
              }}
              className={styleProps.inputStyle}
            />
          </div>

          {/* Visibility & Status */}
          <div className={styleProps.cardStyle}>
            <h2 className="text-xl font-semibold mb-4">Visibility & Status</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={styleProps.labelStyle}>Visibility</label>
                <select
                  name="visibility"
                  value={formData.visibility}
                  onChange={handleChange}
                  className={styleProps.inputStyle}
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>

              <div>
                <label className={styleProps.labelStyle}>
                  Availability Status
                </label>
                <select
                  name="availability_status"
                  value={formData.availability_status}
                  onChange={handleChange}
                  className={styleProps.inputStyle}
                >
                  <option value="Available">Available</option>
                  <option value="Unavailable">Unavailable</option>
                  <option value="Booked">Booked</option>
                </select>
              </div>
            </div>
          </div>

          {/* Toggles */}
          <div className={styleProps.cardStyle}>
            <h2 className="text-xl font-semibold mb-4">Toggles</h2>

            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                />
                Active
              </label>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="is_featured"
                  checked={formData.is_featured}
                  onChange={handleChange}
                />
                Featured
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-md bg-gray-600 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`rounded-md px-4 py-2 text-sm font-semibold text-white transition ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-pink-600 hover:bg-pink-700"
              }`}
            >
              {loading ? "Saving..." : id ? "Update Resort" : "Create Resort"}
            </button>
          </div>
        </form>
          </>
        )}
      </div>
    </div>
  );
};

export default HoneymoonResortForm;
