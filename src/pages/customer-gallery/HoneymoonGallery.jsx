import { useEffect, useState, useMemo } from "react";
import { 
  ImagePlus, 
  Trash2, 
  CheckCircle, 
  Sparkles, 
  Navigation, 
  Loader2, 
  Plus, 
  X, 
  Heart,
  UploadCloud,
  CheckCircle2,
  FolderHeart,
  Layers,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ArrowUpDown,
  Clock,
  CheckSquare,
  Square
} from "lucide-react";
import { toast } from "react-toastify";
import { apiClient } from "../../stores/authStores";
import { convertImageFileToWebP } from "../../utils/imageConverter";
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

  // Pagination & Sorting State
  const [sortOrder, setSortOrder] = useState("newest"); // "newest" | "oldest"
  const [itemsPerPage, setItemsPerPage] = useState(24); // 12 | 24 | 48 | "All"
  const [currentPage, setCurrentPage] = useState(1);

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
    const MAX_UPLOAD_IMAGES = 20;
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length === 0) return;
    if (selectedFiles.length > MAX_UPLOAD_IMAGES || selectedFiles.length + newImages.length > MAX_UPLOAD_IMAGES) {
      toast.warn(`Please upload no more than ${MAX_UPLOAD_IMAGES} images at a time.`);
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
    if (newImages.length === 0) {
      return toast.info("Please select memory images to upload");
    }

    const toastId = toast.loading("Synchronizing honeymoon memories...");
    setIsLoading(true);

    try {
      const galleryFolder = `image_gallery/${DESTINATION_ID}`;
      const uploadedImageKeys = [];

      for (const file of newImages) {
        const uploadImage = await convertImageFileToWebP(file);
        const presignedRes = await apiClient.post("/admin/generate-presigned-url", {
          fileName: uploadImage.name,
          fileType: uploadImage.type,
          folder: galleryFolder
        });
        const { uploadUrl, key } = presignedRes.data;
        await fetch(uploadUrl, { method: "PUT", body: uploadImage, headers: { "Content-Type": uploadImage.type } });
        uploadedImageKeys.push(key);
      }

      await apiClient.post("/admin/image-Gallery", {
        destination_id: DESTINATION_ID,
        images: uploadedImageKeys
      });

      toast.dismiss(toastId);
      toast.success("Gallery synchronized successfully! ✨");
      setNewImages([]);
      setPreviewUrls([]);
      fetchGalleryImages();
      setCurrentPage(1);
    } catch {
      toast.dismiss(toastId);
      toast.error("Synchronization failed.");
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
      setSelectedForDeletion((prev) => prev.filter((img) => !imagePaths.includes(img)));
    } catch {
      toast.error("Failed to remove memory.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Process sorting (Newest vs Oldest)
  const sortedGallery = useMemo(() => {
    if (!galleryImages || galleryImages.length === 0) return [];
    if (sortOrder === "newest") {
      return [...galleryImages].reverse();
    }
    return [...galleryImages];
  }, [galleryImages, sortOrder]);

  // Pagination calculations
  const totalItems = sortedGallery.length;
  const totalPages = itemsPerPage === "All" ? 1 : Math.max(1, Math.ceil(totalItems / itemsPerPage));

  // Safety check for currentPage within bounds
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const paginatedGallery = useMemo(() => {
    if (itemsPerPage === "All") return sortedGallery;
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedGallery.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedGallery, currentPage, itemsPerPage]);

  const startIndex = totalItems === 0 ? 0 : itemsPerPage === "All" ? 1 : (currentPage - 1) * itemsPerPage + 1;
  const endIndex = itemsPerPage === "All" ? totalItems : Math.min(currentPage * itemsPerPage, totalItems);

  // Toggle selection for all items on current page
  const isAllCurrentPageSelected = paginatedGallery.length > 0 && paginatedGallery.every(img => selectedForDeletion.includes(img));
  const handleToggleSelectCurrentPage = () => {
    if (isAllCurrentPageSelected) {
      setSelectedForDeletion(prev => prev.filter(img => !paginatedGallery.includes(img)));
    } else {
      setSelectedForDeletion(prev => Array.from(new Set([...prev, ...paginatedGallery])));
    }
  };

  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, "...", totalPages];
    }
    if (currentPage >= totalPages - 3) {
      return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8 pb-20 font-sans min-h-screen text-slate-900 dark:text-slate-100"
    >
      {/* 1. HEADER HUB */}
      <div className="bg-white dark:bg-[#091126]/95 rounded-3xl py-4 sm:py-5 px-6 sm:px-8 border border-slate-200/90 dark:border-indigo-500/25 shadow-xl dark:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.7),0_0_30px_2px_rgba(99,102,241,0.18)] ring-1 ring-slate-900/5 dark:ring-white/5 backdrop-blur-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-500/30 shrink-0">
              <ImagePlus size={22} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2 flex-wrap">
                Memory <span className="text-blue-500">Gallery</span> Hub
              </h1>
              <p className="text-slate-500 dark:text-slate-400 font-semibold mt-0.5 text-xs sm:text-sm">
                Curating high-resolution romantic moments and honeymoon customer memories
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <AnimatePresence>
              {selectedForDeletion.length > 0 && (
                <motion.button
                  initial={{ scale: 0.9, opacity: 0 }} 
                  animate={{ scale: 1, opacity: 1 }} 
                  exit={{ scale: 0.9, opacity: 0 }}
                  onClick={() => handleDelete(selectedForDeletion)}
                  disabled={isDeleting}
                  className="flex items-center gap-2.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg shadow-rose-600/30 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isDeleting ? <Loader2 className="animate-spin" size={15} /> : <Trash2 size={15} />}
                  <span>Purge {selectedForDeletion.length} Selected</span>
                </motion.button>
              )}
            </AnimatePresence>
            <div className="px-4 py-2 bg-slate-50 dark:bg-[#050A17] text-slate-700 dark:text-slate-300 rounded-2xl text-xs font-extrabold uppercase tracking-wider border border-slate-200 dark:border-slate-800/90 shadow-sm flex items-center gap-2">
              <Layers size={14} className="text-blue-500" />
              <span>{galleryImages.length} Deployed Memories</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. UPLOAD & ASSET SYNC PANEL */}
      <div className="bg-white dark:bg-[#091126]/95 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-indigo-500/25 shadow-xl dark:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.7),0_0_30px_2px_rgba(99,102,241,0.18)] ring-1 ring-slate-900/5 dark:ring-white/5 backdrop-blur-xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4">
            <div className="flex items-center gap-2.5">
              <UploadCloud size={18} className="text-blue-500" />
              <h2 className="text-xs font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                Asset Acquisition &amp; Sync
              </h2>
            </div>
            <span className="px-3 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 rounded-full text-xs font-extrabold uppercase tracking-wider">
              Destination: {DESTINATION_ID}
            </span>
          </div>

          <div className="space-y-4">
            <label className="group relative flex flex-col items-center justify-center w-full py-10 lg:py-14 border-2 border-dashed border-slate-200 dark:border-slate-800/90 rounded-3xl cursor-pointer bg-slate-50 dark:bg-[#050A17] hover:border-blue-500 transition-all shadow-inner">
              <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform mb-2.5 text-blue-600 dark:text-blue-400">
                <Plus size={24} />
              </div>
              <p className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white mb-0.5">
                Select New Memories
              </p>
              <p className="text-xs font-semibold text-slate-400">
                High-Resolution Multi-Upload: {newImages.length} / 20 selected (Auto-WebP Optimized)
              </p>
              <input id="galleryUploadInput" type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>

            {previewUrls.length > 0 && (
              <div className="p-4 bg-slate-50 dark:bg-[#050A17] rounded-2xl border border-slate-200 dark:border-slate-800/90 shadow-inner">
                <div className="flex items-center justify-between mb-3 px-1">
                  <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Staged Previews ({previewUrls.length})
                  </span>
                  <button
                    type="button"
                    onClick={() => { setNewImages([]); setPreviewUrls([]); }}
                    className="text-xs font-bold text-rose-500 hover:text-rose-600 cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3 max-h-[260px] overflow-y-auto no-scrollbar">
                  {previewUrls.map((url, i) => (
                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden group shadow-sm border border-slate-200 dark:border-slate-800">
                      <img src={url} className="w-full h-full object-cover" alt="Preview" />
                      <button 
                        type="button" 
                        onClick={() => removeNewImage(i)} 
                        className="absolute inset-0 bg-rose-600/80 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity backdrop-blur-[2px] cursor-pointer"
                        title="Remove Image"
                      >
                        <X size={18} strokeWidth={3} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <CheckCircle2 size={15} className="text-blue-500" />
              <span>Images are automatically processed to WebP &amp; uploaded to S3 storage.</span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto sm:min-w-[220px] py-4 px-8 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-70 disabled:cursor-wait"
            >
              {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Navigation size={18} />}
              <span>{isLoading ? "Synchronizing..." : "Commit Assets"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* 3. GALLERY ASSETS HUB WITH FILTER & PAGINATION */}
      <div className="bg-white dark:bg-[#091126]/95 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-indigo-500/25 shadow-xl dark:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.7),0_0_30px_2px_rgba(99,102,241,0.18)] ring-1 ring-slate-900/5 dark:ring-white/5 backdrop-blur-xl space-y-6">
        
        {/* Hub Header & Controls Toolbar */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800/80 gap-5">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <FolderHeart className="text-blue-500" size={22} /> Honeymoon Live Gallery
            </h2>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
              Live customer memories currently active on public portals
            </p>
          </div>

          {/* FILTERS TOOLBAR: NEW/OLD DROPDOWN + PER PAGE DROPDOWN + SELECTION */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Gallery Sort Order Dropdown */}
            <div className="relative">
              <select
                value={sortOrder}
                onChange={(e) => { setSortOrder(e.target.value); setCurrentPage(1); }}
                className="appearance-none bg-slate-50 dark:bg-[#050A17] hover:bg-white dark:hover:bg-[#080E21] border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 dark:hover:border-indigo-500/50 text-slate-900 dark:text-white text-xs font-bold py-2.5 pl-4 pr-9 rounded-2xl outline-none focus:ring-1 focus:ring-blue-500/40 focus:border-blue-500 transition-all cursor-pointer shadow-inner min-w-[145px]"
              >
                <option value="newest" className="bg-white dark:bg-[#050A17] text-slate-900 dark:text-white">New Gallery</option>
                <option value="oldest" className="bg-white dark:bg-[#050A17] text-slate-900 dark:text-white">Old Gallery</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            {/* Per Page Dropdown */}
            <div className="relative">
              <select
                value={itemsPerPage}
                onChange={(e) => { setItemsPerPage(e.target.value === "All" ? "All" : Number(e.target.value)); setCurrentPage(1); }}
                className="appearance-none bg-slate-50 dark:bg-[#050A17] hover:bg-white dark:hover:bg-[#080E21] border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 dark:hover:border-indigo-500/50 text-slate-900 dark:text-white text-xs font-bold py-2.5 pl-4 pr-9 rounded-2xl outline-none focus:ring-1 focus:ring-blue-500/40 focus:border-blue-500 transition-all cursor-pointer shadow-inner min-w-[135px]"
              >
                <option value={12} className="bg-white dark:bg-[#050A17] text-slate-900 dark:text-white">12 per page</option>
                <option value={24} className="bg-white dark:bg-[#050A17] text-slate-900 dark:text-white">24 per page</option>
                <option value={48} className="bg-white dark:bg-[#050A17] text-slate-900 dark:text-white">48 per page</option>
                <option value="All" className="bg-white dark:bg-[#050A17] text-slate-900 dark:text-white">Show All</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            {/* Select Current Page Button */}
            {paginatedGallery.length > 0 && (
              <button
                type="button"
                onClick={handleToggleSelectCurrentPage}
                className="px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-[#050A17] border border-slate-200 dark:border-slate-800/90 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1.5 transition-all cursor-pointer shadow-inner"
                title="Select/Deselect all images on current page"
              >
                {isAllCurrentPageSelected ? <CheckSquare size={14} className="text-blue-500" /> : <Square size={14} />}
                <span>{isAllCurrentPageSelected ? "Deselect Page" : "Select Page"}</span>
              </button>
            )}
          </div>
        </div>

        {/* Gallery Content Grid */}
        {isGalleryLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="animate-spin text-blue-500" size={40} />
            <p className="text-xs font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              Synchronizing Memories...
            </p>
          </div>
        ) : paginatedGallery.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
              <AnimatePresence>
                {paginatedGallery.map((imgPath) => {
                  const isSelected = selectedForDeletion.includes(imgPath);
                  return (
                    <motion.div
                      layout 
                      key={imgPath} 
                      initial={{ opacity: 0, scale: 0.9 }} 
                      animate={{ opacity: 1, scale: 1 }}
                      onClick={() => handleToggleSelection(imgPath)}
                      className={`relative aspect-square rounded-2xl overflow-hidden group cursor-pointer border-2 transition-all duration-300 shadow-sm ${
                        isSelected 
                          ? "border-blue-500 ring-4 ring-blue-500/30 scale-95" 
                          : "border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-indigo-500/60"
                      }`}
                    >
                      <img src={imgPath} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" alt="Honeymoon Memory" />
                      <div className={`absolute inset-0 bg-blue-600/70 transition-opacity flex items-center justify-center backdrop-blur-[2px] ${isSelected ? 'opacity-100' : 'opacity-0'}`}>
                        <CheckCircle className="text-white" size={36} strokeWidth={2.5} />
                      </div>
                      {!isSelected && (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleDelete([imgPath]); }}
                          className="absolute bottom-2.5 right-2.5 bg-slate-950/80 backdrop-blur-md text-white p-2.5 rounded-xl opacity-0 group-hover:opacity-100 hover:bg-rose-600 transition-all shadow-lg cursor-pointer"
                          title="Delete this asset"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Bottom Pagination & Range Bar */}
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Showing <span className="font-bold text-slate-900 dark:text-white">{startIndex}</span> to{" "}
                <span className="font-bold text-slate-900 dark:text-white">{endIndex}</span> of{" "}
                <span className="font-bold text-slate-900 dark:text-white">{totalItems}</span> memories
              </div>

              {totalPages > 1 && (
                <div className="flex items-center gap-1.5">
                  {/* Prev Button */}
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#050A17] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold shadow-sm"
                  >
                    <ChevronLeft size={15} />
                    <span>Prev</span>
                  </button>

                  {/* Page Numbers */}
                  <div className="flex items-center gap-1">
                    {getPageNumbers().map((item, idx) => {
                      if (item === "...") {
                        return (
                          <span key={`ellipsis-${idx}`} className="px-2 text-slate-400 dark:text-slate-500 text-xs font-bold select-none">
                            ...
                          </span>
                        );
                      }
                      const pageNum = Number(item);
                      const isActive = currentPage === pageNum;
                      return (
                        <button
                          key={`page-${pageNum}`}
                          type="button"
                          onClick={() => setCurrentPage(pageNum)}
                          className={`size-8.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                            isActive
                              ? "bg-blue-600 text-white shadow-md shadow-blue-600/30 font-extrabold"
                              : "bg-slate-50 dark:bg-[#050A17] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700 shadow-sm"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  {/* Next Button */}
                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#050A17] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold shadow-sm"
                  >
                    <span>Next</span>
                    <ChevronRight size={15} />
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="py-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-800/90 rounded-3xl bg-slate-50 dark:bg-[#050A17]/60">
            <Heart className="mx-auto mb-3 text-slate-300 dark:text-slate-600" size={54} />
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-1">The Gallery is Vacant</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">No honeymoon memories onboarded yet. Upload assets above to launch.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default HoneymoonGallery;
