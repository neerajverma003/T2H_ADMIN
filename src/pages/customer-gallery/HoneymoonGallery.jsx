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
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-full mx-auto space-y-6 pb-20">
      {/* HEADER */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden text-left">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none text-indigo-600"><ImagePlus size={160} /></div>
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
                <h1 className="text-3xl font-black text-slate-950 dark:text-white tracking-tight flex items-center gap-4">
                    <Sparkles className="text-indigo-600" size={32} /> MEMORY GALLERY
                </h1>
                <p className="text-slate-500 dark:text-slate-400 font-bold mt-1 text-sm italic">Curating the most beautiful honeymoon moments</p>
            </div>
            <div className="flex gap-5">
                <AnimatePresence>
                    {selectedForDeletion.length > 0 && (
                        <motion.button 
                            initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 30, opacity: 0 }}
                            onClick={() => handleDelete(selectedForDeletion)}
                            className="flex items-center gap-3 bg-red-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-red-500/30 hover:bg-red-700 transition-all transform hover:scale-[1.02]"
                        >
                            <Trash2 size={20} /> PURGE {selectedForDeletion.length} ASSETS
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>
        </div>
      </div>

      <div className="flex flex-col gap-12">
          {/* UPLOAD PANEL (TOP - FULL WIDTH) */}
          <div className="w-full">
              <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none space-y-8">
                <div className="flex items-center gap-4 mb-2">
                    <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-500/20"><ImagePlus size={20} /></div>
                    <h2 className="text-lg font-black text-slate-950 dark:text-white uppercase tracking-tight">Asset Sync</h2>
                </div>

                <div className="flex flex-col gap-8">
                    <label className="group relative flex flex-col items-center justify-center w-full aspect-[21/7] border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all hover:border-indigo-600">
                        <div className="size-12 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform mb-4">
                            <Plus size={32} className="text-indigo-600" />
                        </div>
                        <p className="text-sm font-black uppercase tracking-[0.2em] text-slate-950 dark:text-white mb-2">Select New Memories</p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic opacity-70">High-Resolution Multi-Upload: {newImages.length} / 50 selected</p>
                        <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
                    </label>

                    {previewUrls.length > 0 && (
                        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-5 bg-slate-50 dark:bg-slate-800/30 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-inner max-h-[500px] overflow-y-auto">
                            {previewUrls.map((url, i) => (
                                <div key={i} className="relative aspect-square rounded-2xl overflow-hidden group shadow-lg border-2 border-indigo-700">
                                    <img src={url} className="w-full h-full object-cover" alt="" />
                                    <button type="button" onClick={() => removeNewImage(i)} className="absolute inset-0 bg-red-600/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                                        <X size={24} strokeWidth={3} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex justify-end">
                    <button 
                        type="submit" 
                        disabled={newImages.length === 0 || isLoading}
                        className="w-full md:w-auto px-10 py-5 bg-indigo-600 text-white rounded-2xl font-black text-lg uppercase tracking-widest shadow-xl shadow-indigo-500/30 hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-4 active:scale-[0.99]"
                    >
                        {isLoading ? <Loader2 className="animate-spin" size={24} /> : <Navigation size={24} />}
                        {isLoading ? "Synchronizing..." : "COMMIT ASSETS"}
                    </button>
                </div>
              </form>
          </div>

          {/* GALLERY HUB (BOTTOM - FULL WIDTH) */}
          <div className="w-full bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
             <div className="flex items-center justify-between mb-10">
                <div>
                    <h2 className="text-3xl font-black text-slate-950 dark:text-white uppercase tracking-tight">Honeymoon Hub</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-bold mt-1 italic">Managed media repository for ID: {DESTINATION_ID}</p>
                </div>
                <div className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20">
                    {galleryImages.length} Official Assets
                </div>
             </div>

             {isGalleryLoading ? (
                <div className="flex flex-col items-center justify-center py-48 gap-8">
                    <Loader2 className="animate-spin text-indigo-700" size={64} strokeWidth={1.5} />
                    <p className="text-xs font-black uppercase tracking-[0.4em] text-slate-400">Loading Memories...</p>
                </div>
             ) : galleryImages.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10 3xl:grid-cols-12 gap-6">
                   <AnimatePresence>
                      {galleryImages.map((imgPath) => {
                        const isSelected = selectedForDeletion.includes(imgPath);
                        return (
                          <motion.div
                            layout key={imgPath} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                            onClick={() => handleToggleSelection(imgPath)}
                            className={`relative aspect-square rounded-2xl overflow-hidden group cursor-pointer border-4 transition-all duration-300 shadow-lg ${isSelected ? "border-indigo-600 scale-95 shadow-xl shadow-indigo-500/30" : "border-transparent"}`}
                          >
                            <img src={imgPath} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
                            <div className={`absolute inset-0 bg-indigo-700/60 transition-opacity flex items-center justify-center ${isSelected ? 'opacity-100' : 'opacity-0'}`}>
                                <CheckCircle className="text-white" size={48} strokeWidth={3} />
                            </div>
                            {!isSelected && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleDelete([imgPath]); }}
                                    className="absolute bottom-6 right-6 bg-slate-950/70 backdrop-blur-md text-white p-4 rounded-2xl opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all shadow-2xl"
                                >
                                    <Trash2 size={20} />
                                </button>
                            )}
                          </motion.div>
                        );
                      })}
                   </AnimatePresence>
                </div>
             ) : (
                <div className="py-48 text-center border-4 border-dashed border-slate-100 dark:border-slate-800 rounded-[3.5rem]">
                    <Heart className="mx-auto mb-6 text-slate-200 dark:text-slate-800" size={100} strokeWidth={1} />
                    <h3 className="text-3xl font-black text-slate-950 dark:text-white uppercase tracking-tight mb-4">The Gallery is Vacant</h3>
                    <p className="text-slate-600 dark:text-slate-400 font-bold uppercase tracking-widest text-sm italic">No honeymoon memories onboarded yet</p>
                </div>
             )}
          </div>
      </div>
    </motion.div>
  );
};

export default HoneymoonGallery;
