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
        <div className="w-full overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#091126] shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#080f1b] p-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Live Engine Preview</span>
                <button onClick={() => setPreviewMode(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer">
                    <X size={16} />
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
                            <span className="inline-block rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-3 text-sm font-bold text-white shadow-sm">
                                {data.ctaText}
                            </span>
                        </div>
                    )}
                </div>
                <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#080f1b] p-5 text-center">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">&copy; 2026 Trip2Honeymoon</p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8 pb-20 font-sans min-h-screen text-slate-900 dark:text-slate-100 text-left">
            <div className="space-y-8">
                {/* ── HEADER HUB ── */}
                <div className="bg-white dark:bg-[#091126] rounded-3xl py-4 sm:py-5 px-6 sm:px-8 border border-slate-200 dark:border-slate-800 shadow-md relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative z-10 flex items-center gap-3.5">
                        <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0">
                            <FileText size={22} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full">
                                    DESIGN LABORATORY
                                </span>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2 flex-wrap">
                                Email <span className="text-blue-500">Templates</span>
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 font-semibold mt-0.5 text-xs sm:text-sm">
                                Architect reusable promotional modules for rapid deployment.
                            </p>
                        </div>
                    </div>

                    <div className="relative z-10 flex items-center gap-3">
                        <button
                            onClick={() => setView(view === "list" ? "editor" : "list")}
                            className="flex items-center gap-2.5 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-sm cursor-pointer"
                        >
                            {view === "list" ? (
                                <>
                                    <Plus size={16} /> Create Template
                                </>
                            ) : (
                                <>
                                    <FileText size={16} /> View Templates
                                </>
                            )}
                        </button>
                    </div>
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
                                    className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#091126] shadow-sm transition-all duration-300 hover:shadow-md md:flex-row"
                                >
                                    <div className="relative aspect-[2/1] w-full shrink-0 overflow-hidden bg-slate-100 dark:bg-[#050A17] md:aspect-auto md:w-80 flex items-center justify-center">
                                        {template.bannerUrl ? (
                                            <img
                                                src={template.bannerUrl}
                                                alt="Banner"
                                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                onError={(e) => {
                                                    e.currentTarget.style.display = 'none';
                                                }}
                                            />
                                        ) : (
                                            <div className="flex flex-col items-center justify-center gap-2 p-6 text-slate-400 text-center">
                                                <ImageIcon size={32} className="opacity-40" />
                                                <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">No Banner</span>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent md:hidden pointer-events-none" />
                                    </div>
                                    <div className="flex flex-1 flex-col justify-between p-6 sm:p-7">
                                        <div className="space-y-3">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="space-y-1">
                                                    <h3 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                                                        {template.name}
                                                    </h3>
                                                    <p className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                                                        {template.subject}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => deleteTemplate(template._id)}
                                                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#050A17] text-slate-400 hover:text-red-500 hover:border-red-500/40 hover:bg-red-50/50 dark:hover:bg-red-500/10 transition-all shadow-sm cursor-pointer shrink-0"
                                                    title="Delete Template"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                            <p className="line-clamp-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400 font-medium">
                                                {template.content}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-6 border-t border-slate-100 dark:border-slate-800/80 pt-5 mt-4">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                    Architected At
                                                </span>
                                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                                    {new Date(template.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                    Action Trigger
                                                </span>
                                                <span className="text-xs font-bold uppercase text-blue-600 dark:text-blue-400">{template.ctaText}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {templates.length === 0 && !isLoading && (
                                <div className="col-span-full flex flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-[#091126] py-20 text-slate-400">
                                    <FileText size={36} className="text-slate-400" />
                                    <p className="text-xs font-bold uppercase tracking-wider">No modules saved in architecture</p>
                                </div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="editor"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="flex flex-col gap-8"
                        >
                            {/* FORM ROW */}
                            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#091126] p-6 sm:p-8 shadow-sm space-y-6">
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <label className="ml-1 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                            Campaign Name
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#050A17] px-4 py-3 text-sm font-semibold text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all placeholder:text-slate-400 placeholder:font-normal shadow-inner"
                                            placeholder="e.g., Summer Holiday Promo"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="ml-1 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                            Email Subject
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.subject}
                                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                            className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#050A17] px-4 py-3 text-sm font-semibold text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all placeholder:text-slate-400 placeholder:font-normal shadow-inner"
                                            placeholder="Subject for this template"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="ml-1 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                        Offer Details
                                    </label>
                                    <textarea
                                        required
                                        rows="5"
                                        value={formData.content}
                                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                        className="w-full resize-none rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#050A17] px-4 py-3 text-sm font-semibold text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all placeholder:text-slate-400 placeholder:font-normal shadow-inner"
                                        placeholder="The main message of your promotion..."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="ml-1 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                        Promotional Banner Image
                                    </label>
                                    <div className="grid grid-cols-1">
                                        <label className="flex aspect-[2/1] w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#050A17] transition-all hover:border-blue-500/50 dark:hover:border-blue-500/50 shadow-inner">
                                            {bannerPreview ? (
                                                <img
                                                    src={bannerPreview}
                                                    alt="Preview"
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex flex-col items-center gap-2.5 text-slate-400 py-8">
                                                    <ImageIcon size={32} />
                                                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
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
                                        <label className="ml-1 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                            Button Text
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.ctaText}
                                            onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                                            className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#050A17] px-4 py-3 text-sm font-semibold text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all placeholder:text-slate-400 placeholder:font-normal shadow-inner"
                                            placeholder="e.g., Book Now"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="ml-1 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                            Booking Page URL
                                        </label>
                                        <input
                                            type="url"
                                            value={formData.ctaLink}
                                            onChange={(e) => setFormData({ ...formData, ctaLink: e.target.value })}
                                            className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#050A17] px-4 py-3 text-sm font-semibold text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all placeholder:text-slate-400 placeholder:font-normal shadow-inner"
                                            placeholder="https://..."
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-3 pt-2 justify-end">
                                    <button
                                        onClick={() => setPreviewMode(!previewMode)}
                                        className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#050A17] hover:bg-slate-50 dark:hover:bg-[#080E21] px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 transition-all shadow-sm cursor-pointer"
                                    >
                                        {previewMode ? "Hide Design" : "Show Design"}
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={isLoading}
                                        className="flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 px-6 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition-all cursor-pointer disabled:opacity-50"
                                    >
                                        {isLoading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                                        Create Template
                                    </button>
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
                                        <div className="w-full max-w-2xl border-t border-slate-200 dark:border-slate-800 pb-6 pt-8 text-center">
                                            <div className="mb-6 inline-flex items-center gap-2 text-slate-400">
                                                <Eye size={16} />
                                                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
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
