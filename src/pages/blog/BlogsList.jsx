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
  Loader2,
  Zap,
  Target
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useBlogStore } from "../../stores/blogStore";
import { motion } from "framer-motion";

const HoneymoonBlogCard = ({ blog, onEdit, onDelete, onToggleVisibility }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      className="group bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none transition-all duration-500"
    >
      {/* IMAGE CONTAINER */}
      <div className="relative aspect-video overflow-hidden">
        <img
          src={blog.cover_image}
          alt={blog.title}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-all duration-500 backdrop-blur-[2px] flex items-center justify-center p-6 text-center">
          <button onClick={() => onEdit(blog._id)} className="bg-white text-slate-950 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-2xl active:scale-95 flex items-center gap-2">
            <Pencil size={14} /> INSPECT MANUSCRIPT
          </button>
        </div>

        {/* STATUS BADGE */}
        <div className="absolute top-4 left-4">
          <span className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] shadow-2xl backdrop-blur-md border border-white/10 ${blog.visibility === "public" ? "bg-emerald-600/90 text-white" : "bg-slate-900/90 text-white"
            }`}>
            {blog.visibility}
          </span>
        </div>
      </div>

      {/* CONTENT BODY */}
      <div className="p-8 text-left space-y-4">
        <div className="flex items-center justify-between">
          <span className="px-4 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-lg text-[9px] font-black uppercase tracking-[0.2em]">
            {blog.category || 'GENERAL'}
          </span>
          <div className="flex items-center gap-2 text-slate-400 text-[9px] font-black uppercase tracking-[0.2em]">
            <Calendar size={14} className="text-indigo-600" /> {new Date(blog.createdAt).toLocaleDateString()}
          </div>
        </div>

        <h3 className="text-xl font-black text-slate-900 dark:text-white line-clamp-2 leading-tight tracking-tight min-h-[3rem]">
          {blog.title}
        </h3>

        <div className="flex justify-between items-center pt-6 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <button onClick={() => onDelete(blog._id)} className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm">
              <Trash2 size={18} />
            </button>
            <button onClick={() => onToggleVisibility(blog._id, blog.visibility)} className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-indigo-600 transition-all rounded-xl">
              {blog.visibility === 'public' ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          </div>

          <button onClick={() => onEdit(blog._id)} className="text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 group-hover:translate-x-1 transition-transform">
            VIEW DETAILS <ArrowRight size={16} strokeWidth={3} />
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
    if (window.confirm("Permanently archive this honeymoon story?")) deleteBlog(id);
  };
  const handleVisibilityToggle = () => { };

  return (
    <div className="space-y-10 pb-24 px-6 text-left">
      {/* PAGE HEADER */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none text-indigo-600 rotate-12"><Target size={240} /></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-4">
              <Sparkles className="text-indigo-600" size={32} />
              STORYBOARD
            </h1>
            <p className="text-slate-500 font-medium mt-1">Manage your elite narrative assets and strategic drafts</p>
          </div>
          <button
            onClick={() => navigate("/blogs/create")}
            className="bg-indigo-600 text-white px-10 py-5 rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-indigo-500/40 hover:bg-indigo-700 transition-all flex items-center gap-3 active:scale-95"
          >
            <PlusCircle size={24} /> FORGE NEW POST
          </button>
        </div>
      </div>

      {/* GRID */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-48 gap-8">
          <Loader2 className="h-16 w-16 animate-spin text-indigo-600" strokeWidth={1.5} />
          <p className="text-xs font-black text-slate-400 uppercase tracking-[0.4em]">Compiling Narrative Archive...</p>
        </div>
      ) : blogs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-48 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[3rem] text-center px-10 shadow-xl shadow-slate-200/30">
          <div className="size-24 bg-slate-50 dark:bg-slate-800 rounded-[2rem] flex items-center justify-center text-slate-200 mb-8 shadow-inner">
            <MessageSquare size={48} strokeWidth={1} />
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3 uppercase tracking-tight">
            Storyboard is Vacant
          </h3>
          <p className="text-slate-500 font-medium text-lg max-w-lg mb-10 leading-relaxed italic">
            You haven't forged any stories yet. Start sharing your strategic adventures today.
          </p>
          <button onClick={() => navigate("/blogs/create")} className="bg-indigo-600 text-white px-10 py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-indigo-500/40 hover:bg-indigo-700 transition-all active:scale-95 flex items-center gap-3">
            <Zap size={20} /> WRITE FIRST NARRATIVE
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
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
