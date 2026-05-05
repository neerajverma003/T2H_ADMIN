import React, { useEffect } from "react";
import {
  Pencil,
  Trash2,
  PlusCircle,
  Eye,
  EyeOff,
  ArrowRight,
  List,
  Calendar,
  MessageSquare,
  Sparkles,
  Loader2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useBlogStore } from "../../stores/blogStore";
import { motion } from "framer-motion";

const HoneymoonBlogCard = ({ blog, onEdit, onDelete, onToggleVisibility }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -8 }}
      className="group bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none transition-all duration-300"
    >
      {/* IMAGE */}
      <div className="relative h-56 overflow-hidden">
        <img
          src={blog.cover_image}
          alt={blog.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
           <button onClick={() => onEdit(blog._id)} className="bg-white text-slate-900 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2">
              <Pencil size={12} /> Edit Post
           </button>
        </div>

        {/* STATUS BADGE */}
        <div className="absolute top-4 left-4">
           <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg ${
              blog.visibility === "public" ? "bg-green-500 text-white" : "bg-slate-500 text-white"
           }`}>
              {blog.visibility}
           </span>
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-8">
        <div className="flex items-center gap-3 mb-4">
           <div className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-full text-[9px] font-black uppercase tracking-widest">
              Honeymoon Story
           </div>
           <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
              <Calendar size={12} /> {new Date(blog.createdAt || Date.now()).toLocaleDateString()}
           </div>
        </div>

        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3 tracking-tight line-clamp-2">
          {blog.title}
        </h3>

        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 line-clamp-2 leading-relaxed">
          {blog.description || "A beautiful honeymoon story captured in detail for our community."}
        </p>

        <div className="flex justify-between items-center pt-6 border-t border-slate-50 dark:border-slate-800">
          <div className="flex items-center gap-4">
             <button onClick={() => onDelete(blog._id)} className="text-slate-400 hover:text-red-500 transition-colors">
                <Trash2 size={18} />
             </button>
             <button onClick={() => onToggleVisibility(blog._id, blog.visibility)} className="text-slate-400 hover:text-indigo-600 transition-colors">
                {blog.visibility === 'public' ? <Eye size={18} /> : <EyeOff size={18} />}
             </button>
          </div>

          <button onClick={() => onEdit(blog._id)} className="text-indigo-600 dark:text-indigo-400 text-xs font-black uppercase tracking-widest flex items-center gap-2 group-hover:translate-x-1 transition-transform">
            Continue Reading <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </motion.div>
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
    <div className="space-y-8 pb-12">
      {/* PAGE HEADER */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              <Sparkles className="text-indigo-600" />
              HONEYMOON STORIES
            </h1>
            <p className="text-slate-500 font-medium mt-1">Manage all your published articles and drafts</p>
          </div>
          <button
            onClick={() => navigate("/blogs/create")}
            className="bg-indigo-600 text-white px-8 py-3.5 rounded-2xl font-bold shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 transition-all flex items-center gap-2"
          >
            <PlusCircle size={18} /> Create New Post
          </button>
        </div>
      </div>

      {/* GRID */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
           <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Compiling Stories...</p>
        </div>
      ) : blogs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-[2.5rem] text-center px-6">
          <div className="size-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-300 mb-6">
             <MessageSquare size={40} />
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tighter">
            Your Storyboard is Empty
          </h3>
          <p className="text-slate-500 max-w-sm mb-8">
            You haven't written any honeymoon stories yet. Start sharing your adventures today.
          </p>
          <button onClick={() => navigate("/blogs/create")} className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-3.5 rounded-2xl font-bold transition-all">
             Write Your First Story
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
