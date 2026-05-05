import React, { useState, useEffect } from "react";
import {
  UploadCloud,
  PlusCircle,
  Edit,
  Loader2,
  FileText,
  Eye,
  Type,
  Layout
} from "lucide-react";
import { useTheme } from "../../contexts/ThemeProvider"; // 👈 Fixed Import
import { useParams, useNavigate } from "react-router-dom";
import { useBlogStore } from "../../stores/blogStore";
import { toast } from "react-toastify";
import { ENV } from "../../constants/api";
import { motion } from "framer-motion";

const inputStyle =
  "block w-full rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-4 text-slate-900 dark:text-slate-100 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all placeholder:text-slate-400";

const labelStyle =
  "flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2";

const CreateBlog = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const {
    isLoading,
    isFetchingDetails,
    blogToEdit,
    createBlog,
    updateBlog,
    fetchBlogById,
    clearBlogToEdit,
  } = useBlogStore();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState(null);
  const [visibility, setVisibility] = useState("public");
  const [imagePreview, setImagePreview] = useState("");
  const [category, setCategory] = useState("honeymoon");

  useEffect(() => {
    if (isEditMode) fetchBlogById(id);
    return () => clearBlogToEdit();
  }, [id]);

  useEffect(() => {
    if (blogToEdit && isEditMode) {
      setTitle(blogToEdit.title || "");
      setContent(blogToEdit.content || "");
      setVisibility(blogToEdit.visibility || "public");
      setCategory(blogToEdit.category || "honeymoon");
      setImagePreview(blogToEdit.cover_image || "");
    }
  }, [blogToEdit]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let finalCoverImage = blogToEdit?.cover_image || null;

      if (coverImage) {
        const blogFolder = `blog/${title.replace(/\s+/g, '_')}`;
        const presignedRes = await fetch(`${ENV.API_BASE_URL}/admin/generate-presigned-url`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          },
          body: JSON.stringify({
            fileName: coverImage.name,
            fileType: coverImage.type,
            folder: blogFolder
          })
        });

        const { uploadUrl, key } = await presignedRes.json();

        await fetch(uploadUrl, {
          method: "PUT",
          body: coverImage,
          headers: { "Content-Type": coverImage.type }
        });

        finalCoverImage = key;
      }

      const payload = {
        title,
        content,
        visibility,
        category,
        cover_image: finalCoverImage
      };

      if (isEditMode) {
        const res = await updateBlog(id, payload, navigate);
        if (res?.success) {
          toast.success("Story updated successfully!");
        }
      } else {
        const res = await createBlog(payload, navigate);
        if (res?.success) {
          toast.success("Story published successfully!");
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to save the story");
    }
  };

  if (isFetchingDetails) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Retrieving Story Data...</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto space-y-8 pb-12"
    >
      {/* HEADER SECTION */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              {isEditMode ? <Edit className="text-indigo-600" /> : <PlusCircle className="text-indigo-600" />}
              {isEditMode ? "EDIT STORY" : "WRITE A NEW STORY"}
            </h1>
            <p className="text-slate-500 font-medium mt-1">Share your honeymoon wisdom with the world</p>
          </div>
          <div className="flex items-center gap-3">
             <button onClick={() => navigate('/blogs/list')} className="px-6 py-3 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 transition-all text-sm">Cancel</button>
             <button onClick={handleSubmit} disabled={isLoading} className="bg-indigo-600 text-white px-8 py-3.5 rounded-2xl font-bold shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center gap-2">
                {isLoading ? <Loader2 className="animate-spin" size={18} /> : (isEditMode ? <Edit size={18} /> : <PlusCircle size={18} />)}
                {isEditMode ? "Save Changes" : "Publish Story"}
             </button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* MAIN CONTENT AREA */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
            <label className={labelStyle}><Type size={14} /> Story Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`${inputStyle} text-xl font-bold h-16`}
              placeholder="Give your story a catchy title..."
              required
            />
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
            <label className={labelStyle}><FileText size={14} /> Body Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className={`${inputStyle} min-h-[500px] leading-relaxed resize-none`}
              placeholder="Tell your story here... (Rich text formatting supported)"
              required
            />
          </div>
        </div>

        {/* SIDEBAR OPTIONS */}
        <div className="lg:col-span-4 space-y-8">
          {/* COVER IMAGE */}
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
            <label className={labelStyle}><Layout size={14} /> Featured Image</label>
            <label className="group relative block w-full h-56 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 cursor-pointer overflow-hidden transition-all hover:border-indigo-500">
              {imagePreview ? (
                <>
                  <img src={imagePreview} alt="preview" className="h-full w-full object-cover rounded-[1.4rem]" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                     <p className="text-white text-xs font-black uppercase tracking-widest">Change Image</p>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                  <UploadCloud size={40} strokeWidth={1.5} />
                  <p className="mt-3 text-[10px] font-black uppercase tracking-widest">Drag & Drop Image</p>
                </div>
              )}
              <input type="file" hidden accept="image/*" onChange={handleFileChange} />
            </label>
          </div>

          {/* SETTINGS */}
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none space-y-6">
            <div>
              <label className={labelStyle}><Layout size={14} /> Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={inputStyle}
              >
                <option value="honeymoon">Honeymoon Hub</option>
                <option value="travel">Travel Guides</option>
                <option value="adventure">Adventures</option>
                <option value="other">Other Stories</option>
              </select>
            </div>

            <div>
              <label className={labelStyle}><Eye size={14} /> Visibility</label>
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value)}
                className={inputStyle}
              >
                <option value="public">Live on Site</option>
                <option value="private">Draft Mode</option>
              </select>
            </div>
          </div>
        </div>
      </form>
    </motion.div>
  );
};

export default CreateBlog;
