import React, { useState, useEffect } from "react";
import { apiClient } from "../../stores/authStores";
import {
    Share2,
    Save,
    Globe,
    MessageCircle,
    Facebook,
    Instagram,
    Linkedin,
    Youtube,
    Twitter,
    Loader2,
    CheckCircle2,
    Phone,
    Mail,
    MapPin,
    Headphones,
    Sparkles,
    ShieldCheck
} from "lucide-react";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

const SocialManagement = () => {
    const [links, setLinks] = useState({
        whatsapp: "",
        facebook: "",
        instagram: "",
        twitter: "",
        linkedin: "",
        youtube: "",
        supportPhone: "",
        supportEmail: "",
        officeAddress: ""
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const fetchLinks = async () => {
        try {
            const res = await apiClient.get("/admin/social-links");
            if (res.data.success && res.data.data) {
                setLinks(prev => ({
                    ...prev,
                    ...res.data.data
                }));
            }
        } catch (err) {
            console.error("Error fetching social links:", err);
            toast.error("Failed to load social & reach out links");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLinks();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setLinks(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await apiClient.patch("/admin/social-links", links);
            if (res.data.success) {
                setLinks(prev => ({
                    ...prev,
                    ...(res.data.data || {})
                }));
                toast.success("Social & Reach Out details updated successfully! 💕");
            }
        } catch (err) {
            console.error("Error updating social links:", err);
            toast.error("Failed to update details");
        } finally {
            setSaving(false);
        }
    };

    const reachOutFields = [
        { name: "supportPhone", label: "Support Phone Number", icon: Phone, color: "text-blue-500", placeholder: "+91 11 4061 2834" },
        { name: "supportEmail", label: "Support Email Address", icon: Mail, color: "text-indigo-500", placeholder: "trip2honeymoon@gmail.com" },
        { name: "officeAddress", label: "Office Address / Location", icon: MapPin, color: "text-rose-500", placeholder: "Dwarka Mor, New Delhi" },
    ];

    const socialFields = [
        { name: "whatsapp", label: "WhatsApp Number/Link", icon: MessageCircle, color: "text-emerald-500", placeholder: "https://wa.me/917290024804" },
        { name: "facebook", label: "Facebook URL", icon: Facebook, color: "text-blue-600", placeholder: "https://facebook.com/your-page" },
        { name: "instagram", label: "Instagram URL", icon: Instagram, color: "text-pink-500", placeholder: "https://instagram.com/holidaysadmire_official/" },
        { name: "twitter", label: "X (Twitter) URL", icon: Twitter, color: "text-slate-800 dark:text-slate-200", placeholder: "https://x.com/your-handle" },
        { name: "linkedin", label: "LinkedIn URL", icon: Linkedin, color: "text-blue-700", placeholder: "https://linkedin.com/company/117154202/" },
        { name: "youtube", label: "YouTube URL", icon: Youtube, color: "text-red-500", placeholder: "https://youtube.com/@your-channel" },
    ];

    if (loading) {
        return (
            <div className="flex h-[60vh] flex-col items-center justify-center gap-3">
                <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
                <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Synchronizing Social Profiles...</p>
            </div>
        );
    }

    return (
        <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8 pb-20 font-sans min-h-screen text-slate-900 dark:text-slate-100"
        >
            {/* 1. HEADER HUB */}
            <div className="bg-white dark:bg-[#091126]/95 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-indigo-500/25 shadow-xl dark:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.7),0_0_30px_2px_rgba(99,102,241,0.18)] ring-1 ring-slate-900/5 dark:ring-white/5 backdrop-blur-xl relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30 shrink-0">
                            <Share2 size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2 flex-wrap">
                                Social &amp; <span className="text-blue-500">Reach Out</span> Hub
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 font-semibold mt-0.5 text-xs sm:text-sm">
                                Control brand contact touchpoints and online presence across all public client surfaces
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5 px-4 py-2 bg-slate-100 dark:bg-[#050A17] text-slate-700 dark:text-slate-300 rounded-2xl text-xs font-extrabold uppercase tracking-wider border border-slate-200 dark:border-slate-800/90 shadow-sm self-start md:self-auto">
                        <ShieldCheck size={16} className="text-emerald-500" />
                        <span>Real-Time Sync Active</span>
                    </div>
                </div>
            </div>

            {/* 2. MAIN FORM CARD */}
            <form onSubmit={handleSubmit} className="bg-white dark:bg-[#091126]/95 rounded-3xl p-6 sm:p-10 border border-slate-200/90 dark:border-indigo-500/25 shadow-xl dark:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.7),0_0_30px_2px_rgba(99,102,241,0.18)] ring-1 ring-slate-900/5 dark:ring-white/5 backdrop-blur-xl space-y-10">
                
                {/* SECTION 1: REACH OUT CONTACT DETAILS */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4">
                        <div className="flex items-center gap-2.5">
                            <Headphones className="text-blue-500 size-5" />
                            <h3 className="text-xs font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                                Reach Out (Footer Contact Info)
                            </h3>
                        </div>
                        <span className="px-3 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 rounded-full text-[11px] font-extrabold uppercase tracking-wider">
                            Direct Inquiries
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {reachOutFields.map((field) => {
                            const Icon = field.icon;
                            return (
                                <div key={field.name} className="space-y-2.5">
                                    <label className="flex items-center gap-2 text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                        <Icon size={15} className={field.color} />
                                        {field.label}
                                    </label>
                                    <div className="relative group/input">
                                        <input
                                            type="text"
                                            name={field.name}
                                            value={links[field.name] || ""}
                                            onChange={handleChange}
                                            placeholder={field.placeholder}
                                            className="w-full px-5 py-4 bg-slate-50 dark:bg-[#050A17] border border-slate-200 dark:border-slate-800/90 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 rounded-2xl text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none transition-all shadow-inner"
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* SECTION 2: SOCIAL MEDIA PLATFORMS */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4">
                        <div className="flex items-center gap-2.5">
                            <Globe className="text-blue-500 size-5" />
                            <h3 className="text-xs font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                                Social Media Platforms
                            </h3>
                        </div>
                        <span className="px-3 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 rounded-full text-[11px] font-extrabold uppercase tracking-wider">
                            Brand Channels
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {socialFields.map((field) => {
                            const Icon = field.icon;
                            return (
                                <div key={field.name} className="space-y-2.5">
                                    <label className="flex items-center gap-2 text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                        <Icon size={16} className={field.color} />
                                        {field.label}
                                    </label>
                                    <div className="relative group/input">
                                        <input
                                            type="text"
                                            name={field.name}
                                            value={links[field.name] || ""}
                                            onChange={handleChange}
                                            placeholder={field.placeholder}
                                            className="w-full px-5 py-4 bg-slate-50 dark:bg-[#050A17] border border-slate-200 dark:border-slate-800/90 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 rounded-2xl text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none transition-all shadow-inner"
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Submit Action Bar */}
                <div className="pt-6 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                            <CheckCircle2 size={20} />
                        </div>
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 leading-snug">
                            Changes synchronize immediately with client portal header, footer, and inquiry buttons.
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full sm:w-auto sm:min-w-[220px] py-4 px-8 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-70 disabled:cursor-wait"
                    >
                        {saving ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Updating...</span>
                            </>
                        ) : (
                            <>
                                <Save size={18} />
                                <span>Save Changes</span>
                            </>
                        )}
                    </button>
                </div>
            </form>

            {/* Help Callout */}
            <div className="bg-white dark:bg-[#091126]/95 border border-slate-200/90 dark:border-indigo-500/25 rounded-3xl p-6 shadow-xl ring-1 ring-slate-900/5 dark:ring-white/5 backdrop-blur-xl flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 mt-0.5">
                    <Globe size={20} />
                </div>
                <div>
                    <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                        Pro Tip: Deep Linking Format
                    </h4>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                        For WhatsApp, use <code className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-[#050A17] text-blue-600 dark:text-blue-400 font-bold">https://wa.me/91XXXXXXXXXX</code>. For Instagram and Facebook, use full canonical URLs to ensure users are redirected correctly on both mobile applications and web browsers.
                    </p>
                </div>
            </div>
        </motion.div>
    );
};

export default SocialManagement;
