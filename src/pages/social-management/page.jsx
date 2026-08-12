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
    Headphones
} from "lucide-react";
import { toast } from "react-toastify";

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
                toast.success("Social & Reach Out details updated successfully!");
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
        { name: "supportEmail", label: "Support Email Address", icon: Mail, color: "text-indigo-500", placeholder: "info@gmail.com" },
        { name: "officeAddress", label: "Office Address / Location", icon: MapPin, color: "text-rose-500", placeholder: "New Delhi, India" },
    ];

    const socialFields = [
        { name: "whatsapp", label: "WhatsApp Number/Link", icon: MessageCircle, color: "text-green-500", placeholder: "e.g. https://wa.me/91XXXXXXXXXX" },
        { name: "facebook", label: "Facebook URL", icon: Facebook, color: "text-blue-600", placeholder: "https://facebook.com/your-page" },
        { name: "instagram", label: "Instagram URL", icon: Instagram, color: "text-pink-500", placeholder: "https://instagram.com/your-profile" },
        { name: "twitter", label: "X (Twitter) URL", icon: Twitter, color: "text-slate-900 dark:text-white", placeholder: "https://x.com/your-handle" },
        { name: "linkedin", label: "LinkedIn URL", icon: Linkedin, color: "text-blue-700", placeholder: "https://linkedin.com/company/your-company" },
        { name: "youtube", label: "YouTube URL", icon: Youtube, color: "text-red-600", placeholder: "https://youtube.com/@your-channel" },
    ];

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-5xl space-y-8 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                        <Share2 size={24} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase px-1">
                            Social &amp; <span className="text-blue-600">Reach Out</span> Management
                        </h2>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mt-1 px-1">Control your brand&apos;s contact details and online presence across all platforms</p>
                    </div>
                </div>
            </div>

            {/* Main Form Card */}
            <div className="relative group p-1">
                <div className="absolute -inset-1 rounded-[40px] bg-gradient-to-br from-blue-500/20 to-purple-500/20 blur opacity-30 transition duration-1000 group-hover:opacity-50"></div>

                <form onSubmit={handleSubmit} className="relative bg-white dark:bg-slate-900 rounded-[28px] md:rounded-[40px] border border-slate-200 dark:border-white/5 shadow-2xl overflow-hidden p-5 sm:p-8 md:p-12 space-y-10">
                    
                    {/* SECTION 1: REACH OUT CONTACT DETAILS */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-white/5 pb-3">
                            <Headphones className="text-blue-600 size-5" />
                            <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider">Reach Out (Footer Contact Info)</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {reachOutFields.map((field) => {
                                const Icon = field.icon;
                                return (
                                    <div key={field.name} className="space-y-2">
                                        <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
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
                                                className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50/50 px-4 py-3.5 text-sm font-bold text-slate-900 transition-all placeholder:text-slate-300 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/5 dark:border-white/5 dark:bg-slate-800/90 dark:text-white dark:placeholder:text-slate-400 dark:focus:border-blue-600 dark:focus:bg-slate-800"
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* SECTION 2: SOCIAL MEDIA LINKS */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-white/5 pb-3">
                            <Globe className="text-blue-600 size-5" />
                            <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider">Social Media Platforms</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {socialFields.map((field) => {
                                const Icon = field.icon;
                                return (
                                    <div key={field.name} className="space-y-3">
                                        <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
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
                                                className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50/50 px-5 py-4 text-sm font-bold text-slate-900 transition-all placeholder:text-slate-300 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/5 dark:border-white/5 dark:bg-slate-800/90 dark:text-white dark:placeholder:text-slate-400 dark:focus:border-blue-600 dark:focus:bg-slate-800"
                                            />
                                            <div className="absolute right-5 top-1/2 -translate-y-1/2 opacity-0 transition-opacity group-focus-within/input:opacity-100">
                                                <Globe size={18} className="text-blue-500 animate-pulse" />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Submit Button Area */}
                    <div className="mt-12 pt-8 border-t border-slate-100 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-green-50 dark:bg-green-500/10 flex items-center justify-center text-green-600">
                                <CheckCircle2 size={20} />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 max-w-[200px]">Changes reflect instantly on the public website</p>
                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            className="group flex items-center gap-4 bg-slate-900 dark:bg-blue-600 text-white px-10 py-5 rounded-[24px] font-black uppercase text-xs tracking-[0.2em] shadow-xl hover:scale-[1.03] active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                <>
                                    <Save size={18} />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Help Tip */}
            <div className="bg-blue-50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/10 rounded-3xl p-6 flex items-start gap-4">
                <div className="size-10 bg-white dark:bg-slate-800 rounded-xl shadow-sm flex items-center justify-center text-blue-500 shrink-0">
                    <Globe size={20} />
                </div>
                <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight">Pro Tip: Deep Linking</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">For WhatsApp, use <strong>https://wa.me/91XXXXXXXXXX</strong>. For Instagram and Facebook, use the full URLs to ensure users are redirected correctly on both mobile and desktop.</p>
                </div>
            </div>
        </div>
    );
};

export default SocialManagement;
