import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { apiClient } from "../../stores/authStores";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Upload, X, Check, Image as ImageIcon, Trash2, Plus, 
  MapPin, Globe, Navigation, Calendar, Clock, Layers, Eye, Sparkles, Loader2, Heart, Pencil
} from "lucide-react";

const inputStyle = "w-full rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-4 text-slate-900 dark:text-slate-100 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all placeholder:text-slate-400";
const labelStyle = "flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2";

const EditDestination = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const isValidObjectId = (val) => /^[0-9a-fA-F]{24}$/.test(val);

  const [data, setData] = useState({
    type: "",
    destination_name: "",
    newFiles: [],           
    existingImages: [],     
    destination_type: [],
    show_image: [],
    best_time: "",
    ideal_duration: "",
    short_description: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [newFilePreviews, setNewFilePreviews] = useState([]);
  const [isDragging, setIsDragging] = useState(false);

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
            best_time: res.data.destination.best_time || "",
            ideal_duration: res.data.destination.ideal_duration || "",
            short_description: res.data.destination.short_description || "",
          });
        }
      } catch {
        toast.error("Server error while fetching destination.");
      }
    }
    fetchData();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value, files, checked } = e.target;
    if (name === "image") {
      const selectedFiles = Array.from(files);
      setData((prev) => ({ ...prev, newFiles: selectedFiles }));
      const previews = selectedFiles.map(file => URL.createObjectURL(file));
      setNewFilePreviews(previews);
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

  const handleRemoveNewFile = (index) => {
    setData(prev => {
      const updatedFiles = [...prev.newFiles];
      updatedFiles.splice(index, 1);
      return { ...prev, newFiles: updatedFiles };
    });
    setNewFilePreviews(prev => {
      const updatedPreviews = [...prev];
      URL.revokeObjectURL(updatedPreviews[index]);
      updatedPreviews.splice(index, 1);
      return updatedPreviews;
    });
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
    if(!window.confirm("Delete this image permanently?")) return;
    try {
      const res = await apiClient.patch(`/admin/destination/${id}/delete-image`, { imagePath: img });
      if (res.data.success) {
        setData((prev) => ({
          ...prev,
          existingImages: prev.existingImages.filter((i) => i !== img),
          show_image: prev.show_image.filter((i) => i !== img),
        }));
        toast.success("Image removed");
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
      const newImageKeys = [];
      if (data.newFiles.length > 0) {
        const capitalizedType = data.type.charAt(0).toUpperCase() + data.type.slice(1);
        const folder = `destination/${capitalizedType}/${data.destination_name.replace(/\s+/g, "_")}`;

        for (let i = 0; i < data.newFiles.length; i++) {
          const file = data.newFiles[i];
          setUploadProgress(`${i + 1}/${data.newFiles.length}`);
          const presignedRes = await apiClient.post("/admin/generate-presigned-url", { fileName: file.name, fileType: file.type, folder });
          const { uploadUrl, key } = presignedRes.data;
          await axios.put(uploadUrl, file, { headers: { "Content-Type": file.type } });
          newImageKeys.push(key);
        }
      }

      const payload = {
        type: data.type,
        destination_name: data.destination_name,
        destination_type: data.destination_type,
        show_image: data.show_image,
        new_image_keys: newImageKeys,
        best_time: data.best_time,
        ideal_duration: data.ideal_duration,
        short_description: data.short_description,
      };

      const response = await apiClient.patch(`/admin/destination/${id}`, payload);
      if (response.data.success) {
        toast.success("Updated Successfully");
        setData(prev => ({ ...prev, newFiles: [] }));
        setNewFilePreviews([]);
        const refreshRes = await apiClient.get(`/admin/destination/edit/${id}`);
        if (refreshRes.data.success) {
          setData(prev => ({ ...prev, existingImages: refreshRes.data.destination.title_image || [], show_image: refreshRes.data.destination.show_image || [] }));
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.msg || "Failed to update.");
    } finally {
      setIsLoading(false);
      setUploadProgress("");
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-full mx-auto space-y-8 pb-12">
      {/* HEADER */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              <Pencil className="text-indigo-600" /> EDIT DESTINATION
            </h1>
            <p className="text-slate-500 font-medium mt-1">Modifying {data.destination_name || 'Destination'}</p>
          </div>
          <div className="flex items-center gap-3">
             <div className="bg-slate-50 dark:bg-slate-800 p-1.5 rounded-2xl flex">
               {["domestic", "international"].map((t) => (
                 <button key={t} type="button" onClick={() => setData({...data, type: t})} className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${data.type === t ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-400'}`}>
                   {t}
                 </button>
               ))}
             </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          {/* CORE DETAILS */}
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
            <label className={labelStyle}><MapPin size={14} /> Destination Name</label>
            <input name="destination_name" value={data.destination_name} onChange={handleChange} placeholder="Destination name" className={`${inputStyle} text-xl font-bold h-16`} />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
               <div>
                 <label className={labelStyle}><Calendar size={14} /> Best Time</label>
                 <input name="best_time" value={data.best_time} onChange={handleChange} placeholder="e.g. Oct - March" className={inputStyle} />
               </div>
               <div>
                 <label className={labelStyle}><Clock size={14} /> Ideal Duration</label>
                 <input name="ideal_duration" value={data.ideal_duration} onChange={handleChange} placeholder="e.g. 5-7 Days" className={inputStyle} />
               </div>
            </div>
            <div className="mt-8">
               <label className={labelStyle}><Sparkles size={14} /> Short Description (Max 150 characters)</label>
               <textarea 
                 name="short_description" 
                 value={data.short_description} 
                 onChange={handleChange} 
                 maxLength={150}
                 placeholder="A romantic blurb for the destination cards..." 
                 className={`${inputStyle} h-32 resize-none`} 
               />
               <p className="text-[10px] text-slate-400 mt-2 text-right">{data.short_description?.length || 0}/150</p>
            </div>
          </div>

          {/* MEDIA MANAGEMENT */}
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none space-y-8">
             <div>
                <label className={labelStyle}><Upload size={14} /> Add New Media</label>
                <label className="group relative block w-full h-32 rounded-3xl border-2 border-dashed border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 cursor-pointer overflow-hidden transition-all hover:border-indigo-500 flex flex-col items-center justify-center text-slate-400">
                   <ImageIcon size={24} strokeWidth={1.5} />
                   <p className="mt-2 text-[10px] font-black uppercase tracking-widest">{data.newFiles.length > 0 ? `${data.newFiles.length} New Photos` : 'Click to add more photos'}</p>
                   <input type="file" name="image" multiple accept="image/*" onChange={handleChange} hidden />
                </label>
             </div>

             {/* Existing Gallery */}
             {data.existingImages.length > 0 && (
               <div>
                  <label className={labelStyle}><Sparkles size={14} /> Active Gallery</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {data.existingImages.map((img, idx) => {
                      const isSelected = data.show_image.includes(img);
                      return (
                        <div key={idx} className={`group relative aspect-video rounded-2xl overflow-hidden border-2 transition-all ${isSelected ? 'border-indigo-500 ring-4 ring-indigo-500/10' : 'border-slate-100 dark:border-slate-800'}`}>
                           <img src={img} alt="" className={`w-full h-full object-cover transition-transform group-hover:scale-110 ${!isSelected && 'grayscale opacity-50'}`} />
                           <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                           
                           <button type="button" onClick={() => handleShowImageToggle(img)} className={`absolute bottom-2 left-2 p-2 rounded-lg backdrop-blur-md transition-all ${isSelected ? 'bg-indigo-600 text-white' : 'bg-white/90 text-slate-900'}`}>
                              <Eye size={14} />
                           </button>
                           <button type="button" onClick={() => handleDeleteImage(img)} className="absolute bottom-2 right-2 p-2 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                              <Trash2 size={14} />
                           </button>
                        </div>
                      )
                    })}
                  </div>
               </div>
             )}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
          {/* CATEGORIES */}
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
            <label className={labelStyle}><Layers size={14} /> Taxonomy</label>
            <div className="grid grid-cols-1 gap-3">
              {["trending", "TopMost Destination", "exclusive", "weekend", "home", "honeymoon"].map((opt) => (
                <label key={opt} className={`flex items-center gap-3 p-3 rounded-2xl border transition-all cursor-pointer ${data.destination_type.includes(opt) ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800' : 'border-transparent bg-slate-50 dark:bg-slate-800/50'}`}>
                  <input type="checkbox" name="destination_type" value={opt} checked={data.destination_type.includes(opt)} onChange={handleChange} className="accent-indigo-600 size-4 rounded" />
                  <span className={`text-xs font-bold capitalize ${data.destination_type.includes(opt) ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`}>{opt}</span>
                </label>
              ))}
            </div>
          </div>

          <button type="submit" disabled={isLoading} className="w-full bg-indigo-600 text-white py-5 rounded-[2rem] font-bold shadow-xl shadow-indigo-500/30 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50">
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Heart size={20} />}
            {isLoading ? `Pushing Updates (${uploadProgress || '...'})` : "Commit Changes"}
          </button>

          <button type="button" onClick={() => navigate("/destinations/create")} className="w-full text-slate-500 font-bold text-xs uppercase tracking-widest py-4 hover:text-indigo-600 transition-all">
             Cancel & Return
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default EditDestination;
