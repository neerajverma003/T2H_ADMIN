import React, { useEffect } from "react";
import {
  Pencil,
  Trash2,
  PlusCircle,
  Eye,
  EyeOff,
  ArrowRight,
  List,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useBlogStore } from "../../stores/blogStore";

const HoneymoonBlogCard = ({ blog, onEdit, onDelete, onToggleVisibility }) => {
  return (
    <div className="bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 rounded-2xl shadow-md hover:shadow-xl transition-all">
      {/* IMAGE */}
      <div className="relative">
        <img
          src={blog.cover_image}
          alt={blog.title}
          className="w-full h-56 object-cover"
        />

        {/* ICONS */}
        <div className="absolute top-3 right-3 flex gap-2">
          <button
            onClick={() => onEdit(blog._id)}
            className="p-2 bg-blue-600 text-white rounded-full shadow hover:bg-blue-700"
          >
            <Pencil size={16} />
          </button>

          <button
            onClick={() => onDelete(blog._id)}
            className="p-2 bg-red-600 text-white rounded-full shadow hover:bg-red-700"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-5">
        <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">
          {blog.title}
        </h3>

        <p className="text-sm text-slate-700 dark:text-slate-300 mb-4 line-clamp-2">
          {blog.description || "Honeymoon story"}
        </p>

        <div className="flex justify-between items-center border-t pt-3">
          <button
            onClick={() => onToggleVisibility(blog._id, blog.visibility)}
            className={`flex items-center gap-2 px-3 py-1 text-xs font-bold rounded-full ${
              blog.visibility === "public"
                ? "bg-green-600 text-white"
                : "bg-gray-400 text-white"
            }`}
          >
            {blog.visibility === "public" ? <Eye size={14} /> : <EyeOff size={14} />}
            {blog.visibility.toUpperCase()}
          </button>

          <span className="text-sm font-bold text-blue-700 flex items-center">
            Read Story <ArrowRight size={16} className="ml-1" />
          </span>
        </div>
      </div>
    </div>
  );
};

const HoneymoonBlogList = () => {
  const navigate = useNavigate();
  const { blogs, isLoading, fetchBlogs, deleteBlog } = useBlogStore();

  useEffect(() => {
    fetchBlogs({ category: "honeymoon" });
  }, [fetchBlogs]);

  const handleEdit = (id) => navigate(`/blogs/edit/${id}`);
  const handleDelete = (id) => {
    if (window.confirm("Delete this honeymoon story?")) deleteBlog(id);
  };
  const handleVisibilityToggle = () => {};

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 p-6 space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-xl border-2 border-slate-300 dark:border-slate-700 shadow">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <List size={30} /> Honeymoon Stories
        </h1>

        <button
          onClick={() => navigate("/blogs/create")}
          className="bg-pink-600 hover:bg-pink-700 text-white px-5 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg"
        >
          <PlusCircle size={18} /> Create New Post
        </button>
      </div>

      {/* GRID */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-80 bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      ) : blogs.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 border-2 border-dashed border-slate-400 dark:border-slate-700 rounded-2xl">
          <h3 className="text-2xl font-bold text-slate-800 dark:text-white">
            No Honeymoon Stories Yet
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Create your first honeymoon blog now.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((blog) => (
            <HoneymoonBlogCard
              key={blog._id}
              blog={blog}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleVisibility={handleVisibilityToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HoneymoonBlogList;
