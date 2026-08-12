import { useState, useEffect } from "react";
import { FileText, Plus, Trash2, Edit3, Image as ImageIcon, Type, Link as LinkIcon, Eye, Loader2, Save, X, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCampaignStore } from "../../stores/campaignStore";
import { uploadFileToS3 } from "../../utils/s3Uploader";
import { toast } from "react-toastify";

const EmailTemplates = () => {
    const { templates, isLoading, fetchTemplates, createTemplate, deleteTemplate } = useCampaignStore();
    const [view, setView] = useState("editor"); // "list" or "editor" — defaults to editor like Admire Holidays
    const [formData, setFormData] = useState({
        name: "",
        subject: "",
        bannerUrl: "",
        content: "",
        ctaLink: "",
        ctaText: "Grab This Offer",
    });
    const [bannerFile, setBannerFile] = useState(null);
    const [bannerPreview, setBannerPreview] = useState("");
    const [previewMode, setPreviewMode] = useState(false);

    useEffect(() => {
        fetchTemplates();
    }, [view === "list"]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setBannerFile(file);
            setBannerPreview(URL.createObjectURL(file));
        }
    };

    const handleSave = async (e) => {
        if (e && e.preventDefault) e.preventDefault();

        // Required field validation
        if (!formData.name.trim()) { toast.error("Campaign Name is required"); return; }
        if (!formData.subject.trim()) { toast.error("Email Subject is required"); return; }
        if (!formData.content.trim()) { toast.error("Offer Details are required"); return; }

        let bannerUrl = formData.bannerUrl;

        if (bannerFile) {
            const toastId = toast.loading("Uploading banner image...");
            try {
                const result = await uploadFileToS3(bannerFile, {
                    type: "templates",
                    title: formData.name,
                    fileType: "images",
                });
                bannerUrl = result.publicUrl;
                toast.dismiss(toastId);
                toast.success("Banner uploaded!");
            } catch (error) {
                toast.dismiss(toastId);
                toast.warn("Banner upload failed. Saving template without image.");
                bannerUrl = ""; // Save without image rather than blocking entirely
            }
        }

        const success = await createTemplate({ ...formData, bannerUrl });
        if (success) {
            setView("list");
            setFormData({ name: "", subject: "", bannerUrl: "", content: "", ctaLink: "", ctaText: "Grab This Offer" });
            setBannerFile(null);
            setBannerPreview("");
        }
    };


    const TemplatePreview = ({ data }) => (
        <div className="w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 p-4 dark:border-white/5 dark:bg-slate-800/50">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Live Engine Preview</span>
                <button onClick={() => setPreviewMode(false)}>
                    <X
                        size={16}
                        className="text-slate-400"
                    />
                </button>
            </div>
            <div className="p-0">
                <img
                    src={bannerPreview || data.bannerUrl || "https://via.placeholder.com/600x300?text=Banner+Placeholder"}
                    alt="Banner"
                    className="aspect-[2/1] w-full object-cover"
                />
                <div className="space-y-4 p-8 text-center">
                    <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">{data.subject || "Your Dynamic Subject"}</h1>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                        {data.content || "Your narrative content will appear here..."}
                    </p>
                    {data.ctaLink && (
                        <div className="pt-4">
                            <span className="inline-block rounded-lg bg-[#F36F09] px-8 py-3 text-sm font-bold text-white shadow-lg shadow-orange-500/20">
                                {data.ctaText}
                            </span>
                        </div>
                    )}
                </div>
                <div className="border-t border-slate-100 bg-slate-50 p-6 text-center dark:border-white/5 dark:bg-slate-900/50">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">&copy; 2026 Admire Holidays</p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="pb-16 text-slate-100 font-sans">
            <div className="mx-auto max-w-7xl space-y-8">
                {/* HEADER */}
                <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
                    <div className="space-y-2">
                        <div className="flex items-center gap-x-3 text-blue-600">
                            <Sparkles className="size-5 animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Design Laboratory</span>
                        </div>
                        <h1 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white">
                            Email <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Templates</span>
                        </h1>
                        <p className="text-xs font-medium uppercase tracking-widest text-slate-500 opacity-70 dark:text-slate-400">
                            Architect reusable promotional modules for rapid deployment.
                        </p>
                    </div>

                    <button
                        onClick={() => setView(view === "list" ? "editor" : "list")}
                        className="flex items-center gap-3 rounded-2xl bg-blue-600 px-6 py-3 text-[15px] font-bold text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-700 tracking-wide"
                    >
                        {view === "list" ? (
                            <>
                                <Plus size={18} /> Create Template
                            </>
                        ) : (
                            <>
                                <FileText size={18} /> View Templates
                            </>
                        )}
                    </button>
                </div>

                <AnimatePresence mode="wait">
                    {view === "list" ? (
                        <motion.div
                            key="list"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="flex flex-col gap-6"
                        >
                            {templates.map((template) => (
                                <div
                                    key={template._id}
                                    className="group flex flex-col overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl dark:border-white/10 dark:bg-slate-900 md:flex-row"
                                >
                                    <div className="relative aspect-[2/1] w-full shrink-0 md:aspect-auto md:w-80">
                                        <img
                                            src={template.bannerUrl}
                                            alt="Banner"
                                            className="h-full w-full object-cover grayscale-[50%] transition-all duration-700 group-hover:grayscale-0"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent md:from-transparent" />
                                    </div>
                                    <div className="flex flex-1 flex-col justify-between p-8">
                                        <div className="space-y-4">
                                            <div className="flex items-start justify-between">
                                                <div className="space-y-1">
                                                    <h3 className="text-xl font-black tracking-tighter text-slate-900 dark:text-white">
                                                        {template.name}
                                                    </h3>
                                                    <p className="text-[11px] font-black uppercase tracking-widest text-blue-600">
                                                        {template.subject}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => deleteTemplate(template._id)}
                                                    className="rounded-2xl bg-red-500/10 p-3 text-red-500 shadow-sm transition-all hover:bg-red-500 hover:text-white"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                            <p className="line-clamp-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                                                {template.content}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-6 border-t border-slate-100 pt-6 dark:border-white/5">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                    Architected At
                                                </span>
                                                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                                                    {new Date(template.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                    Action Trigger
                                                </span>
                                                <span className="text-xs font-bold uppercase italic text-blue-600">{template.ctaText}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {templates.length === 0 && !isLoading && (
                                <div className="col-span-full flex flex-col items-center justify-center gap-4 rounded-[40px] border-2 border-dashed border-slate-200 bg-slate-50 py-20 opacity-40 dark:border-white/10 dark:bg-white/5">
                                    <FileText size={40} />
                                    <p className="text-xs font-black uppercase tracking-widest">No modules saved in architecture</p>
                                </div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="editor"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="flex flex-col gap-12"
                        >
                            {/* FORM ROW */}
                            <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
                                <div className="space-y-6 lg:col-span-12">
                                    <div className="space-y-8 rounded-[32px] border border-slate-200 bg-white p-6 shadow-xl dark:border-white/10 dark:bg-slate-900 sm:p-10">
                                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                            <div className="space-y-2">
                                                <label className="ml-1 text-[13px] font-black uppercase tracking-widest text-slate-600">
                                                    Campaign Name
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    className="w-full rounded-2xl border border-slate-400 bg-slate-50 px-5 py-3 text-lg  text-slate-900 outline-none transition-all focus:border-blue-600 dark:border-white/10 dark:bg-slate-800/50 dark:text-white"
                                                    placeholder="e.g., Summer Holiday Promo"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="ml-1 text-[13px] font-black uppercase tracking-widest text-slate-600">
                                                    Email Subject
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={formData.subject}
                                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                                    className="w-full rounded-2xl border border-slate-400 bg-slate-50 px-5 py-3 text-lg  text-slate-900 outline-none transition-all focus:border-blue-600 dark:border-white/10 dark:bg-slate-800/50 dark:text-white"
                                                    placeholder="Subject for this template"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <label className="ml-1 text-[13px] font-black uppercase tracking-widest text-slate-600">
                                                        Offer Details
                                                    </label>
                                                    <textarea
                                                        required
                                                        rows="5"
                                                        value={formData.content}
                                                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                                        className="w-full resize-none rounded-2xl border border-slate-400 bg-slate-50 px-5 py-3 text-lg text-slate-900 outline-none transition-all focus:border-blue-600 dark:border-white/10 dark:bg-slate-800/50 dark:text-white"
                                                        placeholder="The main message of your promotion..."
                                                    />
                                                </div>
                                            </div>
                                            <label className="ml-1 text-[13px] font-black uppercase tracking-widest text-slate-600">
                                                Promotional Banner Image
                                            </label>
                                            <div className="grid grid-cols-1 gap-6">
                                                <label className="flex aspect-[2/1] h-full w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-3xl border-2 border-dashed border-slate-600 bg-slate-50 transition-all hover:border-blue-600 dark:border-white/10 dark:bg-white/5">
                                                    {bannerPreview ? (
                                                        <img
                                                            src={bannerPreview}
                                                            alt="Preview"
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex flex-col items-center gap-3 text-slate-400">
                                                            <ImageIcon size={32} />
                                                            <span className="text-[10px] font-black uppercase tracking-widest">
                                                                Select Image Asset
                                                            </span>
                                                        </div>
                                                    )}
                                                    <input
                                                        type="file"
                                                        className="hidden"
                                                        onChange={handleFileChange}
                                                        accept="image/*"
                                                    />
                                                </label>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                            <div className="space-y-2">
                                                <label className="ml-1 text-[13px] font-black uppercase tracking-widest text-slate-600">
                                                    Button Text
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.ctaText}
                                                    onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                                                    className="w-full rounded-2xl border border-slate-400 bg-slate-50 px-5 py-3 text-lg text-slate-900 outline-none transition-all focus:border-blue-600 dark:border-white/10 dark:bg-slate-800/50 dark:text-white"
                                                    placeholder="e.g., Book Now"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="ml-1 text-[13px] font-black uppercase tracking-widest text-slate-600">
                                                    Booking Page URL
                                                </label>
                                                <input
                                                    type="url"
                                                    value={formData.ctaLink}
                                                    onChange={(e) => setFormData({ ...formData, ctaLink: e.target.value })}
                                                    className="w-full rounded-2xl border border-slate-400 bg-slate-50 px-5 py-3 text-lg  text-slate-900 outline-none transition-all focus:border-blue-600 dark:border-white/10 dark:bg-slate-800/50 dark:text-white"
                                                    placeholder="https://..."
                                                />
                                            </div>
                                        </div>

                                        <div className="flex gap-4 pt-4 justify-end">
                                            <button
                                                onClick={handleSave}
                                                disabled={isLoading}
                                                className="flex items-center justify-center gap-3 rounded-2xl bg-blue-600 py-4 text-xs font-black uppercase tracking-widest text-white shadow-lg transition-all hover:bg-blue-700 px-4"
                                            >
                                                {isLoading ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                                                Create Template
                                            </button>
                                            <button
                                                onClick={() => setPreviewMode(!previewMode)}
                                                className="rounded-2xl bg-slate-100 px-10 py-4 text-xs font-black uppercase tracking-widest text-slate-600 transition-all hover:bg-slate-200 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 border border-slate-400"
                                            >
                                                {previewMode ? "Hide Design" : "Show Design"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* PREVIEW ROW (Full Width / Centered) */}
                            <AnimatePresence>
                                {previewMode && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 20 }}
                                        className="flex flex-col items-center gap-6"
                                    >
                                        <div className="w-full max-w-2xl border-t-2 border-dashed border-slate-200 pb-6 pt-12 text-center dark:border-white/10">
                                            <div className="mb-8 inline-flex items-center gap-3 text-slate-400">
                                                <Eye size={20} />
                                                <span className="text-[10px] font-black uppercase tracking-widest">
                                                    Final Rendering Engine Output
                                                </span>
                                            </div>
                                            <TemplatePreview data={formData} />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default EmailTemplates;
