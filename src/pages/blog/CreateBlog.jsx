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
  Zap,
  ShieldCheck
} from "lucide-react";
import { useTheme } from "../../contexts/ThemeProvider";
import { useParams, useNavigate } from "react-router-dom";
import { useBlogStore } from "../../stores/blogStore";
import { toast } from "react-toastify";
import { ENV } from "../../constants/api";
import { motion } from "framer-motion";

const styleProps = {
  inputStyle: "w-full rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-4 text-lg font-medium focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-white transition-all placeholder:text-slate-500 shadow-inner",
  labelStyle: "flex items-center gap-2 text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1",
  cardStyle: "bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none",
  buttonStyle: "bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/30",
};

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
        <Loader2 className="w-16 h-16 animate-spin text-indigo-600" strokeWidth={1.5} />
        <p className="text-xs font-black text-slate-400 uppercase tracking-[0.4em]">Syncing Story Logic...</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-full mx-auto space-y-6 pb-24 text-left"
    >
      {/* HEADER SECTION */}
      <div className={styleProps.cardStyle + " relative overflow-hidden"}>
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none text-indigo-600 rotate-12"><Zap size={240} /></div>
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-10">
          <div>
            <h1 className="text-3xl font-black text-slate-950 dark:text-white tracking-tight flex items-center gap-4">
              {isEditMode ? <Edit className="text-indigo-600" size={32} /> : <PlusCircle className="text-indigo-600" size={32} />}
              {isEditMode ? "EDIT STORY" : "NEW STORY"}
            </h1>
            <p className="text-slate-500 font-medium mt-1">Share your honeymoon wisdom and strategic travel insights</p>
          </div>
          <div className="flex items-center gap-4">
              <button onClick={() => navigate('/blogs/list')} className="px-8 py-4 rounded-2xl font-black text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-xs uppercase tracking-[0.2em] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">Discard</button>
              <button onClick={handleSubmit} disabled={isLoading} className={styleProps.buttonStyle + " flex items-center gap-3 active:scale-95 disabled:opacity-50"}>
                 {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                 {isEditMode ? "PUSH CHANGES" : "PUBLISH STORY"}
              </button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* SECTION 1: VISUAL IDENTITY */}
        <div className={styleProps.cardStyle}>
          <label className={styleProps.labelStyle}><Layout size={18} className="text-indigo-600" /> Story Visual Identity</label>
          <label className="group relative block w-full aspect-[4/1] rounded-[2rem] border-2 border-dashed border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 cursor-pointer overflow-hidden transition-all hover:border-indigo-600/30">
            {imagePreview ? (
              <>
                <img src={imagePreview} alt="preview" className="h-full w-full object-cover transition-transform group-hover:scale-105 duration-1000" />
                <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all backdrop-blur-[4px]">
                    <div className="px-8 py-4 bg-white text-slate-950 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl flex items-center gap-2">
                      <UploadCloud size={16} /> Replace Visual
                    </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-300 gap-6">
                <div className="size-24 bg-white dark:bg-slate-900 rounded-[2rem] flex items-center justify-center shadow-xl text-indigo-600 group-hover:scale-110 transition-transform border border-slate-100 dark:border-slate-800">
                  <UploadCloud size={48} strokeWidth={1.5} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-black text-slate-950 dark:text-white uppercase tracking-[0.2em] mb-1">Deploy Story Cover</p>
                  <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest opacity-60">UHD Processing Ready</p>
                </div>
              </div>
            )}
            <input type="file" hidden accept="image/*" onChange={handleFileChange} />
          </label>
        </div>

        {/* SECTION 2: METADATA GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className={`${styleProps.cardStyle} lg:col-span-2`}>
            <label className={styleProps.labelStyle}><Type size={18} className="text-indigo-600" /> Story Headline</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`${styleProps.inputStyle} text-2xl font-black h-20 placeholder:italic`}
              placeholder="Draft your story's high-impact title..."
              required
            />
          </div>

          <div className={styleProps.cardStyle}>
            <label className={styleProps.labelStyle}><Layout size={18} className="text-indigo-600" /> Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={`${styleProps.inputStyle} h-20`}
            >
              <option value="honeymoon">Honeymoon Hub</option>
              <option value="travel">Travel Strategy</option>
              <option value="adventure">Pure Adventure</option>
              <option value="other">General Stories</option>
            </select>
          </div>
        </div>

        {/* SECTION 3: VISIBILITY */}
        <div className={styleProps.cardStyle}>
          <label className={styleProps.labelStyle}><Eye size={18} className="text-indigo-600" /> Visibility Matrix</label>
          <div className="flex gap-4">
             {[
               { id: 'public', label: 'Live Broadcast', icon: Zap },
               { id: 'private', label: 'Draft Archive', icon: ShieldCheck }
             ].map((v) => (
               <button
                 key={v.id}
                 type="button"
                 onClick={() => setVisibility(v.id)}
                 className={`flex-1 p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${
                   visibility === v.id 
                   ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 shadow-lg' 
                   : 'border-slate-100 dark:border-slate-800 text-slate-400'
                 }`}
               >
                 <v.icon size={24} />
                 <span className="text-[10px] font-black uppercase tracking-[0.2em]">{v.label}</span>
               </button>
             ))}
          </div>
        </div>

        {/* SECTION 4: STORY CONTENT */}
        <div className={styleProps.cardStyle}>
          <label className={styleProps.labelStyle}><FileText size={18} className="text-indigo-600" /> Story Manuscript</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className={`${styleProps.inputStyle} min-h-[500px] leading-relaxed resize-none p-6`}
            placeholder="Unleash the narrative here... Strategic travel insights required."
            required
          />
          <div className="mt-8 p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 flex items-start gap-4">
              <Sparkles size={20} className="text-indigo-600 shrink-0" />
              <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400 leading-relaxed uppercase tracking-widest">
                Ensuring all narratives adhere to the brand's premium linguistic standards. High-fidelity storytelling is mandatory.
              </p>
          </div>
        </div>
      </form>
    </motion.div>
  );
};

export default CreateBlog;
