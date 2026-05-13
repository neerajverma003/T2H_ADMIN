import React from "react";
import { Star, User, MessageSquare, Trash2, Plus, Sparkles, Image as ImageIcon, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CDN_URL = "https://media.trip2honeymoon.com";

const getCdnUrl = (s3KeyOrUrl) => {
    if (!s3KeyOrUrl) return null;
    if (typeof s3KeyOrUrl !== 'string') return s3KeyOrUrl;
    if (s3KeyOrUrl.startsWith("http") || s3KeyOrUrl.startsWith("blob:") || s3KeyOrUrl.startsWith("data:")) return s3KeyOrUrl;
    return `${CDN_URL}/${s3KeyOrUrl}`;
};

const ReviewSection = ({
    formData,
    handleArrayChange,
    handleAddItem,
    handleRemoveItem,
    styles
}) => {
    return (
        <div className={styles.cardStyle}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm border border-indigo-100 dark:border-indigo-500/20">
                        <MessageSquare size={28} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight italic">Traveler Stories</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1 flex items-center gap-2">
                            <Sparkles size={12} className="text-indigo-500" /> Premium Testimonials
                        </p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => handleAddItem("reviews", { name: "", message: "", rating: 5, profileImage: "", profileImage_file: null })}
                    className="flex items-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20 active:scale-95 group"
                >
                    <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                    New Story
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <AnimatePresence mode="popLayout">
                    {(formData.reviews || []).map((review, index) => (
                        <motion.div 
                            key={index}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                            className="relative group bg-slate-50/50 dark:bg-slate-800/30 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-all duration-500"
                        >
                            <button
                                type="button"
                                onClick={() => handleRemoveItem(index, "reviews")}
                                className="absolute -top-3 -right-3 size-10 bg-white dark:bg-slate-900 text-red-500 rounded-xl shadow-lg border border-slate-100 dark:border-slate-800 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all z-10"
                            >
                                <Trash2 size={18} />
                            </button>

                            <div className="flex items-start gap-6">
                                {/* Profile Image Upload */}
                                <div className="flex-shrink-0">
                                    <label className="relative block w-24 h-24 rounded-[2rem] bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-700 overflow-hidden cursor-pointer hover:border-indigo-500 transition-all group/p shadow-inner">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => {
                                                const file = e.target.files[0];
                                                if (file) handleArrayChange({ target: { name: 'profileImage_file', value: file } }, index, "reviews");
                                            }}
                                        />
                                        {review.profileImage_file || review.profileImage ? (
                                            <img 
                                                src={review.profileImage_file ? URL.createObjectURL(review.profileImage_file) : getCdnUrl(review.profileImage)} 
                                                alt="Profile" 
                                                className="w-full h-full object-cover group-hover/p:scale-110 transition-transform duration-500" 
                                            />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 group-hover/p:text-indigo-500 transition-colors">
                                                <ImageIcon size={24} />
                                                <span className="text-[10px] font-black uppercase mt-1 tracking-tighter">Photo</span>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-indigo-600/60 flex items-center justify-center opacity-0 group-hover/p:opacity-100 transition-opacity">
                                            <Plus size={24} className="text-white" />
                                        </div>
                                    </label>
                                </div>

                                <div className="flex-1 space-y-4">
                                    <div>
                                        <label className={styles.labelStyle}>Reviewer Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={review.name}
                                            onChange={(e) => handleArrayChange(e, index, "reviews")}
                                            className={styles.inputStyle}
                                            placeholder="e.g. Satish Sharma"
                                        />
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <span className={styles.labelStyle}>Rating</span>
                                        <div className="flex gap-1 bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() => handleArrayChange({ target: { name: 'rating', value: star } }, index, "reviews")}
                                                    className={`transition-all duration-300 ${star <= review.rating ? "text-amber-400 scale-110" : "text-slate-200 dark:text-slate-700 hover:text-amber-200"}`}
                                                >
                                                    <Star size={18} fill={star <= review.rating ? "currentColor" : "none"} />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6">
                                <label className={styles.labelStyle}>Their Story</label>
                                <textarea
                                    name="message"
                                    value={review.message}
                                    onChange={(e) => handleArrayChange(e, index, "reviews")}
                                    className={`${styles.inputStyle} h-32 resize-none leading-relaxed placeholder:italic`}
                                    placeholder="Describe their honeymoon experience..."
                                />
                            </div>
                            
                            {/* Decorative Badge */}
                            <div className="mt-4 flex justify-end">
                                <div className="px-4 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-[10px] font-black uppercase text-indigo-500 tracking-widest flex items-center gap-2">
                                    <Heart size={10} fill="currentColor" /> Verified Traveler
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {(!formData.reviews || formData.reviews.length === 0) && (
                <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }}
                    className="text-center py-20 bg-slate-50/50 dark:bg-slate-800/30 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800"
                >
                    <div className="w-20 h-20 bg-white dark:bg-slate-900 rounded-[2rem] shadow-xl flex items-center justify-center mx-auto mb-6 text-slate-300 dark:text-slate-700">
                        <MessageSquare size={40} />
                    </div>
                    <h3 className="text-xl font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest italic">No Stories Shared</h3>
                    <p className="text-slate-500 mt-2 font-medium">Click "New Story" to showcase traveler experiences.</p>
                </motion.div>
            )}
        </div>
    );
};

export default ReviewSection;
