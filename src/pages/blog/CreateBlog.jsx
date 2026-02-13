import React, { useState, useEffect } from "react";
import {
  UploadCloud,
  PlusCircle,
  Edit,
  Loader2,
} from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { useParams, useNavigate } from "react-router-dom";
import { useBlogStore } from "../../stores/blogStore";
import { toast } from "react-toastify";

const inputStyle =
  "block w-full rounded-lg border-2 border-slate-400 dark:border-slate-600 bg-white dark:bg-slate-900 p-3 text-slate-900 dark:text-slate-100 shadow-sm focus:border-pink-600 focus:ring-pink-600";

const labelStyle =
  "block text-sm font-bold text-slate-800 dark:text-slate-200 mb-1";

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

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("visibility", visibility);
    formData.append("category", category);
    if (coverImage) formData.append("coverImage", coverImage);

    try {
      if (isEditMode) {
        const res = await updateBlog(id, formData, navigate);
        if (res?.success) {
          toast.success("💍 Story updated successfully!");
        } else {
          toast.error(res?.msg || "Failed to update story.");
        }
      } else {
        const res = await createBlog(formData, navigate);
        if (res?.success) {
          toast.success("✨ Story published successfully!");
        } else {
          toast.error(res?.msg || "Failed to publish story.");
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong while saving the story");
    }
  };

  if (isFetchingDetails) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-pink-600" />
        <p className="ml-3 text-lg font-bold text-slate-800 dark:text-slate-200">
          Loading Story...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-200 dark:bg-slate-950 p-6">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* HEADER */}
        <div className="bg-white dark:bg-slate-900 border-2 border-slate-400 dark:border-slate-700 rounded-xl p-5 shadow">
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            {isEditMode ? <Edit /> : <PlusCircle />}
            {isEditMode ? "Edit Story" : "Create Story"}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* DETAILS */}
          <div className="bg-white dark:bg-slate-900 border-2 border-slate-400 dark:border-slate-700 rounded-xl p-6 shadow space-y-4">
            <div>
              <label className={labelStyle}>Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={inputStyle}
                placeholder="Enter story title"
                required
              />
            </div>

            <div>
              <label className={labelStyle}>Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={inputStyle}
              >
                <option value="honeymoon">Honeymoon</option>
                <option value="travel">Travel</option>
                <option value="adventure">Adventure</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className={labelStyle}>Visibility</label>
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value)}
                className={inputStyle}
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </div>
          </div>

          {/* COVER IMAGE */}
          <div className="bg-white dark:bg-slate-900 border-2 border-slate-400 dark:border-slate-700 rounded-xl p-6 shadow">
            <label className={labelStyle}>Cover Image</label>
            <label className="mt-2 flex items-center justify-center h-64 border-2 border-dashed border-slate-400 dark:border-slate-600 rounded-lg cursor-pointer bg-slate-100 dark:bg-slate-800">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="preview"
                  className="h-full w-full object-cover rounded-lg"
                />
              ) : (
                <div className="text-center text-slate-700 dark:text-slate-300">
                  <UploadCloud className="mx-auto" size={40} />
                  <p className="mt-2 text-sm font-semibold">
                    Upload cover image
                  </p>
                </div>
              )}
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleFileChange}
              />
            </label>
          </div>

          {/* CONTENT */}
          <div className="bg-white dark:bg-slate-900 border-2 border-slate-400 dark:border-slate-700 rounded-xl p-6 shadow">
            <label className={labelStyle}>Story Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className={`${inputStyle} min-h-[300px] bg-slate-50 dark:bg-slate-800 font-mono`}
              placeholder="Write your story here... (Markdown supported)"
              required
            />
          </div>

          {/* SUBMIT */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-pink-700 hover:bg-pink-800 disabled:bg-pink-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" />
              ) : isEditMode ? (
                <Edit />
              ) : (
                <PlusCircle />
              )}
              {isEditMode ? "Update Story" : "Publish"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default CreateBlog;
