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
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -10 }}
      className="group bg-white dark:bg-slate-900 rounded-[3.5rem] overflow-hidden border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none transition-all duration-500"
    >
      {/* IMAGE */}
      <div className="relative h-72 overflow-hidden shadow-inner">
        <img
          src={blog.cover_image}
          alt={blog.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-10 backdrop-blur-[2px]">
           <button onClick={() => onEdit(blog._id)} className="bg-white text-slate-950 px-8 py-4 rounded-[1.25rem] text-xs font-black uppercase tracking-[0.2em] flex items-center gap-3 shadow-2xl active:scale-95">
              <Pencil size={16} strokeWidth={2.5} /> Edit Manuscript
           </button>
        </div>

        {/* STATUS BADGE */}
        <div className="absolute top-6 left-6">
           <span className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl backdrop-blur-md border border-white/20 ${
              blog.visibility === "public" ? "bg-emerald-600/90 text-white" : "bg-slate-950/90 text-white"
           }`}>
              {blog.visibility} Mode
           </span>
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-10 text-left">
        <div className="flex items-center gap-4 mb-6">
            <div className="px-5 py-2 bg-indigo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.3em] shadow-xl shadow-indigo-500/20">
               STORY
            </div>
            <div className="flex items-center gap-2.5 text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">
               <Calendar size={18} className="text-indigo-700" strokeWidth={2.5} /> {new Date(blog.createdAt || Date.now()).toLocaleDateString()}
            </div>
        </div>

        <h3 className="text-3xl font-black text-slate-950 dark:text-white mb-5 tracking-tight line-clamp-2 leading-tight">
          {blog.title}
        </h3>

        <p className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-10 line-clamp-2 leading-relaxed italic">
          "{blog.description || "A high-fidelity honeymoon narrative captured for our premium audience."}"
        </p>

        <div className="flex justify-between items-center pt-8 border-t-2 border-slate-50 dark:border-slate-800">
          <div className="flex items-center gap-5">
             <button onClick={() => onDelete(blog._id)} className="text-slate-200 hover:text-red-600 transition-all active:scale-90">
                <Trash2 size={24} strokeWidth={2.5} />
             </button>
             <button onClick={() => onToggleVisibility(blog._id, blog.visibility)} className="text-slate-200 hover:text-indigo-700 transition-all active:scale-90">
                {blog.visibility === 'public' ? <Eye size={24} strokeWidth={2.5} /> : <EyeOff size={24} strokeWidth={2.5} />}
             </button>
          </div>

          <button onClick={() => onEdit(blog._id)} className="text-indigo-700 dark:text-indigo-400 text-xs font-black uppercase tracking-[0.25em] flex items-center gap-3 group-hover:translate-x-2 transition-transform">
            Inspect Story <ArrowRight size={20} strokeWidth={3} />
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
  const handleVisibilityToggle = () => {};

  return (
    <div className="space-y-12 pb-24 px-6 text-left">
      {/* PAGE HEADER */}
      <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] p-12 border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none text-indigo-700 rotate-12"><Target size={240} /></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-10">
          <div>
            <h1 className="text-4xl font-black text-slate-950 dark:text-white tracking-tight flex items-center gap-5">
              <Sparkles className="text-indigo-700" size={44} />
              STORYBOARD
            </h1>
            <p className="text-slate-600 dark:text-slate-400 font-bold mt-2 text-xl italic text-left">Manage your elite narrative assets and strategic drafts</p>
          </div>
          <button
            onClick={() => navigate("/blogs/create")}
            className="bg-indigo-700 text-white px-12 py-6 rounded-[2.5rem] font-black text-sm uppercase tracking-[0.3em] shadow-2xl shadow-indigo-500/40 hover:bg-indigo-800 transition-all flex items-center gap-4 active:scale-95"
          >
            <PlusCircle size={24} /> Forge New Post
          </button>
        </div>
      </div>

      {/* GRID */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-48 gap-8">
           <Loader2 className="h-16 w-16 animate-spin text-indigo-700" strokeWidth={1.5} />
           <p className="text-xs font-black text-slate-400 uppercase tracking-[0.4em]">Compiling Narrative Archive...</p>
        </div>
      ) : blogs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-48 bg-white dark:bg-slate-900 border-4 border-dashed border-slate-100 dark:border-slate-800 rounded-[4rem] text-center px-10 shadow-inner">
          <div className="size-28 bg-slate-50 dark:bg-slate-800 rounded-[2.5rem] flex items-center justify-center text-slate-200 mb-10 shadow-sm">
             <MessageSquare size={60} strokeWidth={1} />
          </div>
          <h3 className="text-4xl font-black text-slate-950 dark:text-white mb-4 uppercase tracking-tight">
            The Storyboard is Vacant
          </h3>
          <p className="text-slate-500 font-bold text-xl max-w-lg mb-12 italic uppercase tracking-widest leading-relaxed">
            "You haven't forged any honeymoon stories yet. Start sharing your strategic adventures today."
          </p>
          <button onClick={() => navigate("/blogs/create")} className="bg-indigo-700 text-white px-12 py-6 rounded-[2rem] font-black text-sm uppercase tracking-[0.3em] shadow-2xl shadow-indigo-500/40 hover:bg-indigo-800 transition-all active:scale-95 flex items-center gap-4">
             <Zap size={24} /> Write First Narrative
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
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
