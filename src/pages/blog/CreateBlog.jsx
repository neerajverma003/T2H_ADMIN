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
import { useQuill } from "react-quilljs";
import { convertImageFileToWebP } from "../../utils/imageConverter";
import "quill/dist/quill.snow.css";

const styleProps = {
  inputStyle: "w-full rounded-2xl border border-slate-200 dark:border-slate-800/90 bg-slate-50 dark:bg-[#050A17] p-4 text-base font-semibold focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 text-slate-900 dark:text-white transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-inner",
  labelStyle: "flex items-center gap-2 text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2 ml-1",
  cardStyle: "bg-white dark:bg-[#091126]/95 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-indigo-500/25 shadow-xl ring-1 ring-slate-900/5 dark:ring-white/5 backdrop-blur-xl",
  buttonStyle: "bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 text-white px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider shadow-lg shadow-blue-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer",
};

const CreateBlog = ({ postType = 'blog' }) => {
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
  const [quote, setQuote] = useState("");
  const { quill, quillRef } = useQuill({
    modules: {
      toolbar: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        [{ 'color': [] }, { 'background': [] }],
        ['blockquote', 'code-block'],
        ['clean']
      ]
    },
    placeholder: "Unleash the narrative here... Strategic travel insights required."
  });

  useEffect(() => {
    if (quill) {
      quill.on("text-change", () => {
        setContent(quill.root.innerHTML);
      });
    }
  }, [quill]);

  useEffect(() => {
    if (blogToEdit && isEditMode && quill) {
      if (quill.root.innerHTML !== blogToEdit.content) {
        quill.root.innerHTML = blogToEdit.content || "";
      }
    }
  }, [blogToEdit, quill, isEditMode]);

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
      setQuote(blogToEdit.quote || "");
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

    // Dynamic Validation check
    const missingFields = [];
    if (!title.trim()) missingFields.push("Story Title");

    const isContentEmpty = !content.trim() || content.trim() === "<p><br></p>" || content.trim() === "<p></p>";
    if (isContentEmpty) missingFields.push("Story Manuscript (Content)");

    const hasImage = coverImage || (isEditMode && imagePreview);
    if (!hasImage) missingFields.push("Story Visual Identity (Cover Image)");

    if (postType === 'article' && !quote.trim()) {
      missingFields.push("Editorial Quote / Spotlight Summary");
    }

    if (missingFields.length > 0) {
      toast.error(
        <div>
          <span className="font-bold block mb-1">Please fill in the following:</span>
          <ul className="list-disc pl-4 text-xs space-y-0.5">
            {missingFields.map((field) => (
              <li key={field}>{field} is required.</li>
            ))}
          </ul>
        </div>,
        { autoClose: 5000 }
      );
      return;
    }

    try {
      let finalCoverImage = blogToEdit?.cover_image || null;

      if (coverImage) {
        const blogFolder = `blog/${title.replace(/\s+/g, '_')}`;
        const convertedCoverImage = await convertImageFileToWebP(coverImage);
        const presignedRes = await fetch(`${ENV.API_BASE_URL}/admin/generate-presigned-url`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          },
          body: JSON.stringify({
            fileName: convertedCoverImage.name,
            fileType: convertedCoverImage.type,
            folder: blogFolder
          })
        });

        const { uploadUrl, key } = await presignedRes.json();

        await fetch(uploadUrl, {
          method: "PUT",
          body: convertedCoverImage,
          headers: { "Content-Type": convertedCoverImage.type }
        });

        finalCoverImage = key;
      }

      const payload = {
        title,
        content,
        visibility,
        category,
        cover_image: finalCoverImage,
        post_type: postType,
        quote: postType == 'article' ? quote : undefined
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
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8 pb-20 font-sans min-h-screen text-slate-900 dark:text-slate-100 text-left"
    >
      {/* HEADER SECTION */}
      <div className="bg-white dark:bg-[#091126]/95 rounded-3xl py-4 sm:py-5 px-6 sm:px-8 border border-slate-200/90 dark:border-indigo-500/25 shadow-xl dark:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.7),0_0_30px_2px_rgba(99,102,241,0.18)] ring-1 ring-slate-900/5 dark:ring-white/5 backdrop-blur-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-500/30 shrink-0">
            {isEditMode ? <Edit size={22} /> : <PlusCircle size={22} />}
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2 flex-wrap">
              {postType === 'article'
                ? (isEditMode ? <>Edit <span className="text-blue-500">Spotlight & Trending</span> Article</> : <>Write <span className="text-blue-500">Spotlight & Trending</span> Article</>)
                : (isEditMode ? <>Edit <span className="text-blue-500">Story</span></> : <>New <span className="text-blue-500">Story</span></>)}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-semibold mt-0.5 text-xs sm:text-sm">
              {postType === 'article'
                ? "Forge high-fidelity narratives displayed in the Editorial Spotlight & Trending sections"
                : "Share your honeymoon wisdom and strategic travel insights"}
            </p>
          </div>
        </div>
        <div className="relative z-10 flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(postType === 'article' ? '/articles/list' : '/blogs/list')}
            className="px-5 py-2.5 rounded-xl font-black text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#050A17] transition-all text-xs uppercase tracking-wider border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#091126] shadow-sm cursor-pointer"
          >
            Discard
          </button>
          <button onClick={handleSubmit} disabled={isLoading} className={styleProps.buttonStyle + " flex items-center gap-2"}>
            {isLoading ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
            {isEditMode ? "PUSH CHANGES" : "PUBLISH STORY"}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* SECTION 1: VISUAL IDENTITY */}
        <div className={styleProps.cardStyle}>
          <label className={styleProps.labelStyle}><Layout size={18} className="text-blue-500" /> Story Visual Identity</label>
          <label className="group relative block w-full aspect-[4/1] rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#050A17] cursor-pointer overflow-hidden transition-all hover:border-blue-500/50 shadow-inner">
            {imagePreview ? (
              <>
                <img src={imagePreview} alt="preview" className="h-full w-full object-cover transition-transform group-hover:scale-105 duration-1000" />
                <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all backdrop-blur-[4px]">
                  <div className="px-6 py-3 bg-white text-slate-950 rounded-xl font-black text-xs uppercase tracking-wider shadow-2xl flex items-center gap-2">
                    <UploadCloud size={16} /> Replace Visual
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3">
                <div className="w-14 h-14 bg-white dark:bg-[#091126] rounded-2xl flex items-center justify-center shadow-md text-blue-500 group-hover:scale-105 transition-transform border border-slate-200 dark:border-slate-800">
                  <UploadCloud size={28} strokeWidth={1.5} />
                </div>
                <div className="text-center">
                  <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider mb-0.5">Deploy Story Cover</p>
                  <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest opacity-80">UHD Processing Ready</p>
                </div>
              </div>
            )}
            <input type="file" hidden accept="image/*" onChange={handleFileChange} />
          </label>
        </div>

        {/* SECTION 2: METADATA GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          <div className={`${styleProps.cardStyle} lg:col-span-2`}>
            <label className={styleProps.labelStyle}><Type size={18} className="text-blue-500" /> Story Headline</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`${styleProps.inputStyle} text-xl font-bold h-16`}
              placeholder="Draft your story's high-impact title..."
              required
            />
          </div>

          <div className={styleProps.cardStyle}>
            <label className={styleProps.labelStyle}><Layout size={18} className="text-blue-500" /> Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={`${styleProps.inputStyle} h-16`}
            >
              <option value="honeymoon">Honeymoon Hub</option>
              <option value="travel">Travel Strategy</option>
              <option value="adventure">Pure Adventure</option>
              <option value="other">General Stories</option>
            </select>
          </div>
        </div>

        {/* SECTION 2.5: EDITORIAL QUOTE (Only for Spotlight/Trending Articles) */}
        {postType === 'article' && (
          <div className={styleProps.cardStyle}>
            <label className={styleProps.labelStyle}><Sparkles size={18} className="text-blue-500" /> Editorial Quote / Spotlight Summary</label>
            <textarea
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              className={`${styleProps.inputStyle} min-h-[100px] py-3`}
              placeholder="Enter the signature quote to highlight (e.g., 'The perfect blend of romantic sunsets, pristine overwater villas...')"
            />
            <span className="text-[11px] text-amber-500 font-semibold flex items-center gap-1 mt-2 pl-1">
              ✦ Note: Write the quote naturally. Do not include outer quotation marks (" or “) here; the system adds gorgeous editorial serif quote flourishes automatically.
            </span>
          </div>
        )}

        {/* SECTION 3: VISIBILITY */}
        <div className={styleProps.cardStyle}>
          <label className={styleProps.labelStyle}><Eye size={18} className="text-blue-500" /> Visibility Matrix</label>
          <div className="flex gap-4">
            {[
              { id: 'public', label: 'Live Broadcast', icon: Zap },
              { id: 'private', label: 'Draft Archive', icon: ShieldCheck }
            ].map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setVisibility(v.id)}
                className={`flex-1 p-5 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 cursor-pointer ${visibility === v.id
                  ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 shadow-md'
                  : 'border-slate-200 dark:border-slate-800/90 text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
              >
                <v.icon size={22} />
                <span className="text-[10px] font-black uppercase tracking-wider">{v.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* SECTION 4: STORY CONTENT */}
        <div className={styleProps.cardStyle}>
          <label className={styleProps.labelStyle}><FileText size={18} className="text-blue-500" /> Story Manuscript</label>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1 mt-0.5 mb-3 pl-0.5">
            💡 Writing Tip: Use "Heading 2" (H2) for section headers inside the editor below to trigger beautiful styling with highlights automatically!
          </span>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="hidden"
          />
          <div className="mt-2 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner">
            <div ref={quillRef} />
          </div>
          <style dangerouslySetInnerHTML={{
            __html: `
            .ql-toolbar.ql-snow {
              border: 0 !important;
              border-bottom: 1px solid #e2e8f0 !important;
              background-color: #f8fafc !important;
              padding: 12px 16px !important;
            }
            .ql-container.ql-snow {
              border: 0 !important;
              min-height: 400px !important;
              font-family: inherit !important;
              font-size: 15px !important;
              background-color: #ffffff !important;
            }
            .dark .ql-toolbar.ql-snow {
              background-color: #050A17 !important;
              border-bottom-color: #1e293b !important;
            }
            .dark .ql-container.ql-snow {
              background-color: #050A17 !important;
              color: #ffffff !important;
            }
            .dark .ql-snow .ql-stroke {
              stroke: #94a3b8 !important;
            }
            .dark .ql-snow .ql-fill {
              fill: #94a3b8 !important;
            }
            .dark .ql-snow .ql-picker {
              color: #94a3b8 !important;
            }
            .ql-editor {
              min-height: 400px !important;
            }
            .ql-editor.ql-blank::before {
              color: #94a3b8 !important;
              font-style: italic !important;
            }
          `}} />
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-2xl border border-blue-100 dark:border-blue-900/40 flex items-center gap-3">
            <Sparkles size={18} className="text-blue-500 shrink-0" />
            <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400 leading-relaxed uppercase tracking-wider">
              Ensuring all narratives adhere to the brand's premium linguistic standards. High-fidelity storytelling is mandatory.
            </p>
          </div>
        </div>
      </form>
    </motion.div>
  );
};

export default CreateBlog;
