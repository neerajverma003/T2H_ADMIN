import { useState } from "react";
import { Sparkles, Send, User, MapPin, Star, Calendar, MessageSquare, Image as ImageIcon, Loader2 } from "lucide-react";
import { apiClient } from "../../stores/authStores";
import { toast } from "react-toastify";
import { convertImageFileToWebP } from "../../utils/imageConverter";

const WrittenTestimonials = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profilePreview, setProfilePreview] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    location: "",
    rating: 5,
    travelDate: "",
    destination: "",
    message: "",
    toShow: true,
    profileImage_key: "",
    trip_image_keys: []
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => setProfilePreview(reader.result);
    reader.readAsDataURL(file);

    try {
      let fileToUpload = file;
      if (file?.type?.startsWith("image/")) {
        fileToUpload = await convertImageFileToWebP(file);
      }

      // 1. Get Presigned URL
      const { data } = await apiClient.post("/admin/generate-presigned-url", {
        fileName: fileToUpload.name,
        fileType: fileToUpload.type,
        folder: "testimonials/profiles"
      });

      if (data.success) {
        // 2. Upload to S3
        await fetch(data.uploadUrl, {
          method: "PUT",
          body: fileToUpload,
          headers: { "Content-Type": fileToUpload.type }
        });

        // 3. Save Key
        setFormData(prev => ({ ...prev, profileImage_key: data.key }));
        toast.success("Profile image uploaded!");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      const res = await apiClient.post("/admin/text-testimonial", formData);

      if (res.data.success) {
        toast.success("Testimonial added successfully!");
        setFormData({
          name: "",
          location: "",
          rating: 5,
          travelDate: "",
          destination: "",
          message: "",
          toShow: true,
          profileImage_key: "",
          trip_image_keys: []
        });
        setProfilePreview(null);
      }
    } catch (error) {
      console.error("Submit error:", error);
      toast.error(error.response?.data?.message || "Failed to add testimonial");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8 pb-20 font-sans min-h-screen text-slate-900 dark:text-slate-100 text-left">
      {/* Header */}
      <div className="bg-white dark:bg-[#091126]/95 rounded-3xl py-4 sm:py-5 px-6 sm:px-8 border border-slate-200/90 dark:border-indigo-500/25 shadow-xl dark:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.7),0_0_30px_2px_rgba(99,102,241,0.18)] ring-1 ring-slate-900/5 dark:ring-white/5 backdrop-blur-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-500/30 shrink-0">
            <Sparkles size={22} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2 flex-wrap">
              Compose <span className="text-blue-500">Written</span> Review
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-semibold mt-0.5 text-xs sm:text-sm">
              Capture a new couple story for the registry
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col: Profile & Details */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-[#091126]/95 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-indigo-500/25 shadow-xl ring-1 ring-slate-900/5 dark:ring-white/5 backdrop-blur-xl">
            <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6">Couple Profile</h3>

            <div className="flex flex-col items-center">
              <div className="relative group">
                <div className="size-28 rounded-full overflow-hidden border-4 border-slate-100 dark:border-slate-800 shadow-xl bg-slate-100 dark:bg-[#050A17] flex items-center justify-center">
                  {profilePreview ? (
                    <img src={profilePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <User size={44} className="text-slate-400 dark:text-slate-600" />
                  )}
                </div>
                <label className="absolute bottom-0 right-0 p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full cursor-pointer shadow-lg hover:scale-105 transition-transform">
                  <ImageIcon size={16} />
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                </label>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-3 text-center">Click the icon to upload couple photo</p>
            </div>

            <div className="mt-8 space-y-5">
              <div>
                <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.15em] mb-2 ml-1">Full Names</label>
                <div className="relative group">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. Rahul & Priya"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800/90 bg-slate-50 dark:bg-[#050A17] text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 outline-none transition-all shadow-inner font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.15em] mb-2 ml-1">Location</label>
                <div className="relative group">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
                  <input
                    type="text"
                    name="location"
                    required
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="e.g. Mumbai, India"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800/90 bg-slate-50 dark:bg-[#050A17] text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 outline-none transition-all shadow-inner font-semibold"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#091126]/95 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-indigo-500/25 shadow-xl ring-1 ring-slate-900/5 dark:ring-white/5 backdrop-blur-xl">
            <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6">Visibility</h3>
            <label className="flex items-center justify-between cursor-pointer group">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-blue-500 transition-colors">Publish to Live Site</span>
              <div className="relative inline-flex items-center">
                <input
                  type="checkbox"
                  name="toShow"
                  checked={formData.toShow}
                  onChange={handleInputChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </div>
            </label>
          </div>
        </div>

        {/* Right Col: Trip Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-[#091126]/95 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-indigo-500/25 shadow-xl ring-1 ring-slate-900/5 dark:ring-white/5 backdrop-blur-xl">
            <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-8">Trip Experience</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.15em] mb-2 ml-1">Destination Visited</label>
                <div className="relative group">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
                  <input
                    type="text"
                    name="destination"
                    required
                    value={formData.destination}
                    onChange={handleInputChange}
                    placeholder="e.g. Maldives"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800/90 bg-slate-50 dark:bg-[#050A17] text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 outline-none transition-all shadow-inner font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.15em] mb-2 ml-1">Travel Date</label>
                <div className="relative group">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
                  <input
                    type="date"
                    name="travelDate"
                    required
                    value={formData.travelDate}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800/90 bg-slate-50 dark:bg-[#050A17] text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 outline-none transition-all shadow-inner font-semibold"
                  />
                </div>
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.15em] mb-2 ml-1">Rating</label>
              <div className="flex items-center gap-4 bg-slate-50 dark:bg-[#050A17] p-4 rounded-2xl border border-slate-200 dark:border-slate-800/90 shadow-inner">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, rating: num }))}
                    className={`p-2 rounded-xl transition-all cursor-pointer ${formData.rating >= num
                      ? "text-amber-400 bg-amber-400/10 scale-110"
                      : "text-slate-300 dark:text-slate-700 hover:text-amber-300"
                      }`}
                  >
                    <Star size={24} fill={formData.rating >= num ? "currentColor" : "none"} />
                  </button>
                ))}
                <span className="ml-auto text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">{formData.rating}/5 Stars</span>
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.15em] mb-2 ml-1">The Story</label>
              <div className="relative group">
                <MessageSquare className="absolute left-3.5 top-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
                <textarea
                  name="message"
                  required
                  rows={6}
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Share the beautiful details of their journey..."
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800/90 bg-slate-50 dark:bg-[#050A17] text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 outline-none transition-all resize-none shadow-inner font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-lg shadow-blue-600/30 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <Send size={18} />
              )}
              Finalize & Publish Testimonial
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default WrittenTestimonials;
