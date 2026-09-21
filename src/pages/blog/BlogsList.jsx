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
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
      className="group bg-white dark:bg-[#091126]/95 rounded-3xl overflow-hidden border border-slate-200/90 dark:border-indigo-500/25 shadow-md dark:shadow-[0_8px_30px_rgba(0,0,0,0.5)] ring-1 ring-slate-900/5 dark:ring-white/5 hover:border-blue-500/50 hover:shadow-2xl transition-all duration-300"
    >
      {/* IMAGE CONTAINER */}
      <div className="relative aspect-video overflow-hidden bg-slate-100 dark:bg-[#050A17]">
        <img
          src={blog.cover_image}
          alt={blog.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-[2px] flex items-center justify-center p-6 text-center">
          <button onClick={() => onEdit(blog._id)} className="bg-white text-slate-900 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-2xl active:scale-95 flex items-center gap-2 cursor-pointer">
            <Pencil size={13} /> INSPECT MANUSCRIPT
          </button>
        </div>

        {/* STATUS BADGE */}
        <div className="absolute top-3 left-3">
          <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-xl backdrop-blur-md border border-white/10 ${
            blog.visibility === "public" ? "bg-emerald-600/90 text-white" : "bg-slate-900/90 text-white"
          }`}>
            {blog.visibility}
          </span>
        </div>
      </div>

      {/* CONTENT BODY */}
      <div className="p-6 text-left space-y-4">
        <div className="flex items-center justify-between">
          <span className="px-3 py-1 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 text-blue-600 dark:text-blue-400 rounded-lg text-[9px] font-black uppercase tracking-widest">
            {blog.category || 'GENERAL'}
          </span>
          <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold">
            <Calendar size={13} className="text-blue-500" /> {new Date(blog.createdAt).toLocaleDateString()}
          </div>
        </div>

        <h3 className="text-lg font-black text-slate-900 dark:text-white line-clamp-2 leading-tight tracking-tight min-h-[2.75rem]">
          {blog.title}
        </h3>

        <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => onDelete(blog._id)} 
              className="p-2.5 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white dark:bg-red-950/40 dark:text-red-400 dark:hover:bg-red-600 dark:hover:text-white rounded-xl transition-all border border-red-200 dark:border-red-800/60 cursor-pointer shadow-sm"
              title="Delete Story"
            >
              <Trash2 size={15} />
            </button>
            <button 
              onClick={() => onToggleVisibility(blog._id, blog.visibility)} 
              className="p-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-[#050A17] dark:hover:bg-[#15233e] text-slate-500 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 transition-all rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer"
              title="Toggle Visibility"
            >
              {blog.visibility === 'public' ? <Eye size={15} /> : <EyeOff size={15} />}
            </button>
          </div>

          <button onClick={() => onEdit(blog._id)} className="text-blue-600 dark:text-blue-400 hover:text-blue-500 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 group-hover:translate-x-0.5 transition-transform cursor-pointer">
            VIEW DETAILS <ArrowRight size={14} strokeWidth={3} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const HoneymoonBlogList = ({ postType = 'blog' }) => {
  const navigate = useNavigate();
  const { blogs, isLoading, fetchBlogs, deleteBlog } = useBlogStore();

  useEffect(() => {
    fetchBlogs(postType);
  }, [fetchBlogs, postType]);

  const handleEdit = (id) => navigate(postType === 'article' ? `/articles/edit/${id}` : `/blogs/edit/${id}`);
  const handleDelete = (id) => {
    if (window.confirm("Permanently archive this honeymoon story?")) deleteBlog(id);
  };
  const handleVisibilityToggle = () => { };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8 pb-20 font-sans min-h-screen text-slate-900 dark:text-slate-100 text-left"
    >
      {/* PAGE HEADER */}
      <div className="bg-white dark:bg-[#091126]/95 rounded-3xl py-4 sm:py-5 px-6 sm:px-8 border border-slate-200/90 dark:border-indigo-500/25 shadow-xl dark:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.7),0_0_30px_2px_rgba(99,102,241,0.18)] ring-1 ring-slate-900/5 dark:ring-white/5 backdrop-blur-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-500/30 shrink-0">
            <Sparkles size={22} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2 flex-wrap">
              {postType === 'article' ? <>Spotlight & <span className="text-blue-500">Trending</span> Articles</> : <>Story<span className="text-blue-500">board</span></>}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-semibold mt-0.5 text-xs sm:text-sm">
              {postType === 'article'
                ? "Manage active narratives displayed in the Editorial Spotlight & Trending This Month sections"
                : "Manage your elite narrative assets and strategic drafts"}
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate(postType === 'article' ? "/articles/create" : "/blogs/create")}
          className="relative z-10 px-6 py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-lg shadow-blue-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer shrink-0"
        >
          <PlusCircle size={16} /> {postType === 'article' ? "WRITE NEW ARTICLE" : "FORGE NEW POST"}
        </button>
      </div>

      {/* GRID */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-40 gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-blue-500" strokeWidth={2} />
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Compiling Narrative Archive...</p>
        </div>
      ) : blogs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 bg-white dark:bg-[#091126]/95 border border-dashed border-slate-200 dark:border-indigo-500/20 rounded-3xl text-center px-8 shadow-xl">
          <div className="size-16 bg-slate-100 dark:bg-[#050A17] rounded-2xl flex items-center justify-center text-slate-400 mb-6 border border-slate-200 dark:border-slate-800">
            <MessageSquare size={32} strokeWidth={1.5} />
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">
            {postType === 'article' ? "Spotlight & Trending Archive is Vacant" : "Storyboard is Vacant"}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm max-w-md mb-8 leading-relaxed">
            {postType === 'article'
              ? "You haven't written any spotlight or trending articles yet. Start curating your first feature story today."
              : "You haven't forged any stories yet. Start sharing your strategic adventures today."}
          </p>
          <button 
            onClick={() => navigate(postType === 'article' ? "/articles/create" : "/blogs/create")} 
            className="px-6 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-blue-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer"
          >
            <Zap size={16} /> {postType === 'article' ? "WRITE FIRST SPOTLIGHT/TRENDING ARTICLE" : "WRITE FIRST NARRATIVE"}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
    </motion.div>
  );
};

export default HoneymoonBlogList;
