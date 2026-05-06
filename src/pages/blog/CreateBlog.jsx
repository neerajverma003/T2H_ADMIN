import React, { useState, useEffect } from "react";
import {
  UploadCloud,
  PlusCircle,
  Edit,
  Loader2,
  FileText,
  Eye,
  Type,
  Layout,
  Sparkles,
  Zap
} from "lucide-react";
import { useTheme } from "../../contexts/ThemeProvider";
import { useParams, useNavigate } from "react-router-dom";
import { useBlogStore } from "../../stores/blogStore";
import { toast } from "react-toastify";
import { ENV } from "../../constants/api";
import { motion } from "framer-motion";

const inputStyle =
  "block w-full rounded-[1.5rem] border-4 border-transparent bg-slate-50 dark:bg-slate-800/50 p-6 text-slate-950 dark:text-white text-xl font-black focus:border-indigo-700/10 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all placeholder:text-slate-400 shadow-inner";

const labelStyle =
  "flex items-center gap-3 text-xs font-black text-slate-950 dark:text-slate-200 uppercase tracking-[0.35em] mb-4";

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
    if (!title || !content) {
        toast.error("Please provide both a title and content for the story.");
        return;
    }

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
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
        <Loader2 className="w-16 h-16 animate-spin text-indigo-700" strokeWidth={1.5} />
        <p className="text-xs font-black text-slate-400 uppercase tracking-[0.4em]">Syncing Story Logic...</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-full mx-auto space-y-6 pb-24 text-left"
    >
      {/* HEADER SECTION */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none text-indigo-700 rotate-12"><Zap size={240} /></div>
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-10">
          <div>
            <h1 className="text-4xl font-black text-slate-950 dark:text-white tracking-tight flex items-center gap-5">
              {isEditMode ? <Edit className="text-indigo-700" size={44} /> : <PlusCircle className="text-indigo-700" size={44} />}
              {isEditMode ? "EDIT STORY ARCHIVE" : "PUBLISH NEW STORY"}
            </h1>
            <p className="text-slate-600 dark:text-slate-400 font-bold mt-2 text-xl italic text-left">Share your honeymoon wisdom and strategic travel insights</p>
          </div>
          <div className="flex items-center gap-5">
              <button onClick={() => navigate('/blogs/list')} className="px-10 py-5 rounded-[1.5rem] font-black text-slate-600 hover:bg-slate-100 transition-all text-xs uppercase tracking-[0.2em] border border-slate-100 bg-white shadow-sm">Discard</button>
              <button onClick={handleSubmit} disabled={isLoading} className="bg-indigo-700 text-white px-12 py-6 rounded-[2rem] font-black text-sm uppercase tracking-[0.3em] shadow-2xl shadow-indigo-500/40 hover:bg-indigo-800 transition-all disabled:opacity-50 flex items-center gap-4 active:scale-95">
                 {isLoading ? <Loader2 className="animate-spin" size={24} /> : <Sparkles size={24} />}
                 {isEditMode ? "Commit Changes" : "Commit to Live"}
              </button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-10 text-left">
        {/* SECTION 1: VISUAL IDENTITY (TOP - PANORAMIC) */}
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none">
          <label className={labelStyle}><Layout size={24} className="text-indigo-700" /> Story Visual Identity</label>
          <label className="group relative block w-full aspect-[21/7] rounded-[3rem] border-4 border-dashed border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 cursor-pointer overflow-hidden transition-all hover:border-indigo-700/30 shadow-inner">
            {imagePreview ? (
              <>
                <img src={imagePreview} alt="preview" className="h-full w-full object-cover transition-transform group-hover:scale-105 duration-1000" />
                <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all backdrop-blur-[4px]">
                    <div className="px-10 py-5 bg-white text-slate-950 rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-2xl flex items-center gap-3">
                      <UploadCloud size={20} /> Replace Narrative Visual
                    </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-300 gap-6">
                <div className="size-32 bg-white dark:bg-slate-900 rounded-[2.5rem] flex items-center justify-center shadow-2xl text-indigo-700 group-hover:scale-110 transition-transform">
                  <UploadCloud size={64} strokeWidth={1.5} />
                </div>
                <div className="text-center">
                  <p className="text-lg font-black text-slate-950 dark:text-white uppercase tracking-[0.3em] mb-2">Deploy Story Cover</p>
                  <p className="text-xs font-black text-indigo-700 uppercase tracking-widest italic opacity-60">High-Fidelity UHD Processing Pipeline</p>
                </div>
              </div>
            )}
            <input type="file" hidden accept="image/*" onChange={handleFileChange} />
          </label>
        </div>

        {/* SECTION 2: EXECUTIVE HEADLINE */}
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none">
          <label className={labelStyle}><Type size={24} className="text-indigo-700" /> Executive Headline</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={`${inputStyle} text-4xl font-black h-28 placeholder:italic rounded-[2rem]`}
            placeholder="Draft your story's high-impact title..."
            required
          />
        </div>

        {/* SECTION 3: TAXONOMY & VISIBILITY (HORIZONTAL STACK) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none">
            <label className={labelStyle}><Layout size={20} className="text-indigo-700" /> Taxonomy Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={`${inputStyle} text-xl py-6 px-8 h-24`}
            >
              <option value="honeymoon">Honeymoon Hub</option>
              <option value="travel">Travel Strategy</option>
              <option value="adventure">Pure Adventure</option>
              <option value="other">General Stories</option>
            </select>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none">
            <label className={labelStyle}><Eye size={20} className="text-indigo-700" /> Visibility Matrix</label>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
              className={`${inputStyle} text-xl py-6 px-8 h-24`}
            >
              <option value="public">Live Broadcast</option>
              <option value="private">Draft Archive</option>
            </select>
          </div>
        </div>

        {/* SECTION 4: STORY MANUSCRIPT */}
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none">
          <label className={labelStyle}><FileText size={24} className="text-indigo-700" /> Story Manuscript</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className={`${inputStyle} min-h-[1000px] leading-relaxed resize-none text-2xl font-bold text-slate-950 dark:text-slate-200 p-12 placeholder:italic italic rounded-[3rem]`}
            placeholder="Unleash the narrative here... Strategic travel insights required."
            required
          />
          <div className="pt-12 mt-12 border-t-4 border-slate-50 dark:border-slate-800">
            <div className="p-8 bg-indigo-50 dark:bg-indigo-900/20 rounded-[2.5rem] border-2 border-indigo-100 dark:border-indigo-900/50 flex items-start gap-6">
                <Zap size={32} className="text-indigo-700 shrink-0" />
                <div>
                  <p className="text-xs font-black text-indigo-700 uppercase tracking-widest leading-relaxed mb-1">Brand Compliance Notice</p>
                  <p className="text-sm font-bold text-slate-600 dark:text-slate-400">Ensure all narratives adhere to the brand's premium linguistic standards. High-fidelity storytelling is mandatory for all live broadcasts.</p>
                </div>
            </div>
          </div>
        </div>
      </form>
    </motion.div>
  );
};

export default CreateBlog;
