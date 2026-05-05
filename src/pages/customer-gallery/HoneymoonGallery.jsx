import { useEffect, useState } from "react";
import { ImagePlus, Trash2, CheckCircle, Sparkles, Navigation, Loader2, Plus, X, Heart } from "lucide-react";
import { toast } from "react-toastify";
import { apiClient } from "../../stores/authStores";
import { ENV } from "../../constants/api";
import { motion, AnimatePresence } from "framer-motion";

const DESTINATION_ID = "HONEYMOON";
const BACKEND_URL = ENV.API_BASE_URL;

const HoneymoonGallery = () => {
  const [newImages, setNewImages] = useState([]);
  const [galleryImages, setGalleryImages] = useState([]);
  const [selectedForDeletion, setSelectedForDeletion] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGalleryLoading, setIsGalleryLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [previewUrls, setPreviewUrls] = useState([]);

  const fetchGalleryImages = async () => {
    setIsGalleryLoading(true);
    try {
      const response = await apiClient.get(`/admin/image-Gallery/${DESTINATION_ID}`);
      setGalleryImages(response?.data?.imageGalleryData?.image || []);
    } catch {
      toast.error("Could not load gallery.");
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
      toast.warn("Max 50 images allowed.");
      return;
    }
    setNewImages((prev) => [...prev, ...selectedFiles]);
    const urls = selectedFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls(prev => [...prev, ...urls]);
  };

  const removeNewImage = (index) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newImages.length === 0) return;

    const toastId = toast.loading("Synchronizing honeymoon memories...");
    setIsLoading(true);

    try {
      const galleryFolder = `image_gallery/${DESTINATION_ID}`;
      const uploadedImageKeys = [];

      for (const file of newImages) {
        const presignedRes = await apiClient.post("/admin/generate-presigned-url", {
          fileName: file.name,
          fileType: file.type,
          folder: galleryFolder
        });
        const { uploadUrl, key } = presignedRes.data;
        await fetch(uploadUrl, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
        uploadedImageKeys.push(key);
      }

      await apiClient.post("/admin/image-Gallery", {
        destination_id: DESTINATION_ID,
        images: uploadedImageKeys
      });

      toast.update(toastId, { render: "Gallery synchronized successfully! ✨", type: "success", isLoading: false, autoClose: 3000 });
      setNewImages([]);
      setPreviewUrls([]);
      fetchGalleryImages();
    } catch {
      toast.update(toastId, { render: "Synchronization failed.", type: "error", isLoading: false, autoClose: 5000 });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSelection = (imgPath) => {
    setSelectedForDeletion((prev) =>
      prev.includes(imgPath) ? prev.filter((x) => x !== imgPath) : [...prev, imgPath]
    );
  };

  const handleDelete = async (imagePaths) => {
    if (!imagePaths || imagePaths.length === 0) return;
    if (!window.confirm(`Permanently remove ${imagePaths.length} honeymoon memory?`)) return;

    setIsDeleting(true);
    try {
      const extractKey = (urlStr) => {
        try {
          const urlObj = new URL(urlStr);
          return decodeURIComponent(urlObj.pathname.substring(1));
        } catch { return urlStr; }
      };
      const keysToDelete = imagePaths.map(extractKey);

      await apiClient.post("/admin/image-Gallery/delete", {
        destination_id: DESTINATION_ID,
        image_urls: keysToDelete,
      });

      toast.success("Memory removed successfully.");
      setGalleryImages((prev) => prev.filter((img) => !imagePaths.includes(img)));
      setSelectedForDeletion([]);
    } catch {
      toast.error("Failed to remove memory.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-[1400px] mx-auto space-y-10 pb-20 px-6">
      {/* HEADER */}
      <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-12 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none text-indigo-600"><ImagePlus size={200} /></div>
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div>
                <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-4">
                    <Sparkles className="text-indigo-600" size={36} /> MEMORY GALLERY
                </h1>
                <p className="text-slate-500 font-medium mt-2 text-lg">Curating the most beautiful honeymoon moments</p>
            </div>
            <div className="flex gap-4">
                <AnimatePresence>
                    {selectedForDeletion.length > 0 && (
                        <motion.button 
                            initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 20, opacity: 0 }}
                            onClick={() => handleDelete(selectedForDeletion)}
                            className="flex items-center gap-3 bg-red-500 text-white px-8 py-5 rounded-[2rem] font-black shadow-2xl shadow-red-500/40 hover:bg-red-600 transition-all"
                        >
                            <Trash2 size={20} /> DELETE {selectedForDeletion.length}
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* UPLOAD PANEL */}
          <div className="lg:col-span-4 space-y-8">
              <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none space-y-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-indigo-600 dark:text-indigo-400"><ImagePlus size={20} /></div>
                    <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Asset Sync</h2>
                </div>

                <label className="group relative flex flex-col items-center justify-center w-full h-56 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[2rem] cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all">
                    <div className="flex flex-col items-center justify-center p-6 text-center">
                        <Plus size={32} className="text-indigo-600 mb-4 transition-transform group-hover:scale-110" />
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Select New Memories</p>
                        <p className="text-[10px] font-medium text-slate-300">{newImages.length} / 50 selected</p>
                    </div>
                    <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>

                {previewUrls.length > 0 && (
                    <div className="grid grid-cols-3 gap-3">
                        {previewUrls.map((url, i) => (
                            <div key={i} className="relative aspect-square rounded-2xl overflow-hidden group">
                                <img src={url} className="w-full h-full object-cover" alt="" />
                                <button type="button" onClick={() => removeNewImage(i)} className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                                    <X size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <button 
                    type="submit" 
                    disabled={newImages.length === 0 || isLoading}
                    className="w-full py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black text-sm shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                >
                    {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Navigation size={18} />}
                    {isLoading ? "Syncing..." : "COMMIT ASSETS"}
                </button>
              </form>
          </div>

          {/* GALLERY HUB */}
          <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
             <div className="flex items-center justify-between mb-10">
                <div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-wider">Honeymoon Hub</h2>
                    <p className="text-xs text-slate-500 font-medium mt-1">Managed media for destination ID: {DESTINATION_ID}</p>
                </div>
                <div className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl text-[10px] font-black uppercase tracking-widest">
                    {galleryImages.length} Assets
                </div>
             </div>

             {isGalleryLoading ? (
                <div className="flex flex-col items-center justify-center py-40 gap-4">
                    <Loader2 className="animate-spin text-indigo-600" size={48} strokeWidth={1} />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Loading Memories</p>
                </div>
             ) : galleryImages.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                   <AnimatePresence>
                      {galleryImages.map((imgPath) => {
                        const isSelected = selectedForDeletion.includes(imgPath);
                        return (
                          <motion.div
                            layout key={imgPath} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                            onClick={() => handleToggleSelection(imgPath)}
                            className={`relative aspect-square rounded-[2rem] overflow-hidden group cursor-pointer border-4 transition-all duration-300 ${isSelected ? "border-indigo-600 scale-95 shadow-2xl shadow-indigo-500/40" : "border-transparent"}`}
                          >
                            <img src={imgPath} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
                            <div className={`absolute inset-0 bg-indigo-600/40 transition-opacity flex items-center justify-center ${isSelected ? 'opacity-100' : 'opacity-0'}`}>
                                <CheckCircle className="text-white" size={32} />
                            </div>
                            {!isSelected && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleDelete([imgPath]); }}
                                    className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-md text-white p-3 rounded-2xl opacity-0 group-hover:opacity-100 hover:bg-red-500 transition-all"
                                >
                                    <Trash2 size={16} />
                                </button>
                            )}
                          </motion.div>
                        );
                      })}
                   </AnimatePresence>
                </div>
             ) : (
                <div className="py-40 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[3rem]">
                    <Heart className="mx-auto mb-4 text-slate-200" size={64} strokeWidth={1} />
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No honeymoon memories onboarded</p>
                </div>
             )}
          </div>
      </div>
    </motion.div>
  );
};

export default HoneymoonGallery;
