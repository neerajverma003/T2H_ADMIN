import { useState, useEffect } from "react";
import { 
  Mail, Plus, Send, Users, Link as LinkIcon, FileText,
  Loader2, CheckCircle2, X, ChevronRight, Search, 
  Layers, PlusCircle, History, Sparkles, Trash2, Eye,
  Activity, Clock, AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCampaignStore } from "../../stores/campaignStore";
import { toast } from "react-toastify";
import ConfirmationModal from "../../newComponents/ConfirmationModel";

const CampaignManagement = () => {
    const { 
        campaigns, templates, isLoading, isSending, 
        fetchCampaigns, fetchTemplates, createCampaign, sendCampaign, getRecipients,
        deleteCampaign
    } = useCampaignStore();

    const [view, setView] = useState("send"); // "send" (dispatch) or "list" (history)
    const [selectedCampaign, setSelectedCampaign] = useState(null);
    const [campaignToDelete, setCampaignToDelete] = useState(null);
    const [targetMode, setTargetMode] = useState("subscribers"); // "subscribers", "users", or "custom"
    const [recipientsData, setRecipientsData] = useState({ subscribers: [], users: [] });
    const [selectedRecipients, setSelectedRecipients] = useState([]);
    const [customEmail, setCustomEmail] = useState("");
    const [customRecipients, setCustomRecipients] = useState([]);
    const [activeTrackingId, setActiveTrackingId] = useState(null);
    const [formData, setFormData] = useState({
        title: "",
        templateId: ""
    });

    useEffect(() => {
        fetchCampaigns();
        fetchTemplates();
        loadRecipients();
    }, []);

    // Polling for status updates
    useEffect(() => {
        const hasProcessing = campaigns.some(c => c.status === "Processing");
        let interval;
        if (hasProcessing || activeTrackingId) {
            interval = setInterval(() => fetchCampaigns(), 1000);
        }
        return () => clearInterval(interval);
    }, [campaigns, fetchCampaigns, activeTrackingId]);

    const loadRecipients = async () => {
        const data = await getRecipients();
        setRecipientsData(data);
    };

    const totalSelectedCount = selectedRecipients.length + customRecipients.length;

    const toggleRecipient = (email) => {
        if (selectedRecipients.includes(email)) {
            setSelectedRecipients(prev => prev.filter(e => e !== email));
        } else {
            if (totalSelectedCount >= 10) {
                toast.warn("You can select a maximum of 10 recipients per campaign.");
                return;
            }
            setSelectedRecipients(prev => [...prev, email]);
        }
    };

    const addCustomEmail = () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(customEmail)) {
            toast.error("Invalid email format");
            return;
        }
        if (customRecipients.includes(customEmail)) {
            toast.warn("Already added");
            return;
        }
        if (totalSelectedCount >= 10) {
            toast.warn("You can select a maximum of 10 recipients per campaign.");
            return;
        }
        setCustomRecipients([...customRecipients, customEmail]);
        setCustomEmail("");
    };

    const removeCustomEmail = (email) => {
        setCustomRecipients(customRecipients.filter(e => e !== email));
    };

    const handleSubmit = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        if (!formData.templateId) {
            toast.error("Please select an Email Template first.");
            return;
        }
        if (totalSelectedCount === 0) {
            toast.error("Please select at least one recipient.");
            return;
        }
        if (totalSelectedCount > 10) {
            toast.error("You can send to a maximum of 10 recipients at one time.");
            return;
        }

        const selectedTpl = templates.find(t => t._id === formData.templateId);
        const finalTitle = formData.title.trim() || (selectedTpl ? `${selectedTpl.name} Broadcast` : `Campaign Dispatch ${new Date().toLocaleDateString()}`);

        const campaignId = await createCampaign({
            title: finalTitle,
            templateId: formData.templateId,
            recipients: selectedRecipients,
            customRecipients
        });

        if (campaignId) {
            setActiveTrackingId(campaignId);
            await sendCampaign(campaignId);
            setFormData({ title: "", templateId: "" });
            setSelectedRecipients([]);
            setCustomRecipients([]);
            // Keep on dispatch screen ("send") so live tracker is displayed at the bottom
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Sent': return 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/25';
            case 'Processing': return 'text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/25';
            case 'Failed': return 'text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/25';
            default: return 'text-slate-500 dark:text-slate-400 bg-slate-500/10 border-slate-500/25';
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8 pb-20 font-sans min-h-screen text-slate-900 dark:text-slate-100 text-left">
            <div className="space-y-8">
                
                {/* HEADER HUB */}
                <div className="bg-white dark:bg-[#091126] rounded-3xl py-4 sm:py-5 px-6 sm:px-8 border border-slate-200 dark:border-slate-800 shadow-md relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative z-10 flex items-center gap-3.5">
                        <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0">
                            <Send size={22} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full">
                                    Create, manage and track email campaigns
                                </span>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2 flex-wrap">
                                Dispatch <span className="text-blue-500">Campaign</span>
                            </h1>
                        </div>
                    </div>

                    <div className="relative z-10 flex items-center gap-3">
                        <button 
                            onClick={() => setView(view === "list" ? "send" : "list")}
                            className="flex items-center gap-2.5 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-sm cursor-pointer"
                        >
                            {view === "list" ? <><PlusCircle size={16} /> Send Template</> : <><History size={16} /> Visit History</>}
                        </button>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {view === "list" ? (
                        <motion.div key="list" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-white dark:bg-[#091126] rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-slate-50 dark:bg-[#050A17] border-b border-slate-200 dark:border-slate-800">
                                        <tr>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Campaign Name</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Template Used</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Audience</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                                        {campaigns.map(campaign => (
                                            <tr key={campaign._id} className="group hover:bg-slate-50/80 dark:hover:bg-[#0c1633] transition-colors">
                                                <td className="px-6 py-4">
                                                    <span className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">{campaign.title}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                                        <Layers size={14} className="text-blue-500 shrink-0"/>
                                                        <span className="text-xs font-semibold">{campaign.templateId?.name || "Deleted Template"}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(campaign.status)}`}>
                                                        {campaign.status === 'Processing' && <Loader2 size={10} className="animate-spin" />}
                                                        {campaign.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                    {(campaign.recipients?.length || 0) + (campaign.customRecipients?.length || 0)} Total
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex justify-center gap-2.5">
                                                        <button 
                                                            onClick={() => setSelectedCampaign(campaign)}
                                                            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#050A17] text-slate-500 dark:text-slate-400 hover:text-blue-600 hover:border-blue-500/40 hover:bg-blue-50/50 dark:hover:bg-blue-500/10 transition-all shadow-sm cursor-pointer"
                                                            title="View Recipients"
                                                        >
                                                            <Eye size={16} />
                                                        </button>

                                                        <button 
                                                            onClick={() => setCampaignToDelete(campaign._id)}
                                                            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#050A17] text-slate-400 hover:text-red-500 hover:border-red-500/40 hover:bg-red-50/50 dark:hover:bg-red-500/10 transition-all shadow-sm cursor-pointer"
                                                            title="Delete Campaign"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {campaigns.length === 0 && !isLoading && (
                                            <tr>
                                                <td colSpan={5} className="py-16 text-center text-slate-400">
                                                    <Mail className="size-8 mx-auto mb-2 text-slate-400" />
                                                    <p className="text-xs font-bold uppercase tracking-wider">No campaigns recorded</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div key="send" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-8">
                            {/* CONFIGURATION & RECIPIENT SELECTION */}
                            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#091126] p-6 sm:p-8 shadow-sm space-y-6">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">Campaign Title</label>
                                        <input 
                                            type="text" required value={formData.title}
                                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                                            className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#050A17] px-4 py-3 text-sm font-semibold text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all placeholder:text-slate-400 placeholder:font-normal shadow-inner"
                                            placeholder="e.g., Q3 Flash Sale Execution"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">Select Module (Template)</label>
                                        <select 
                                            className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#050A17] px-4 py-3 text-sm font-semibold text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all appearance-none cursor-pointer shadow-inner"
                                            value={formData.templateId}
                                            onChange={(e) => setFormData({...formData, templateId: e.target.value})}
                                        >
                                            <option value="">Select a saved template...</option>
                                            {templates.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                                        </select>
                                    </div>

                                    {/* RECIPIENT MODE SWITCHER */}
                                    <div className="pt-6 border-t border-slate-100 dark:border-slate-800/80 space-y-6">
                                        <div className="flex justify-center">
                                            <div className="inline-flex p-1 rounded-2xl bg-slate-100 dark:bg-[#050A17] border border-slate-200 dark:border-slate-800 flex-wrap gap-1">
                                                <button 
                                                    type="button"
                                                    onClick={() => { setTargetMode("subscribers"); setCustomRecipients([]); }}
                                                    className={`py-2 px-5 sm:px-6 rounded-xl font-bold uppercase text-xs tracking-wider transition-all cursor-pointer ${
                                                        targetMode === "subscribers" 
                                                            ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm" 
                                                            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                                                    }`}
                                                >
                                                    Subscribers
                                                </button>
                                                <button 
                                                    type="button"
                                                    onClick={() => { setTargetMode("users"); setCustomRecipients([]); }}
                                                    className={`py-2 px-5 sm:px-6 rounded-xl font-bold uppercase text-xs tracking-wider transition-all cursor-pointer ${
                                                        targetMode === "users" 
                                                            ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm" 
                                                            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                                                    }`}
                                                >
                                                    Admire Users
                                                </button>
                                                <button 
                                                    type="button"
                                                    onClick={() => { setTargetMode("custom"); setSelectedRecipients([]); }}
                                                    className={`py-2 px-5 sm:px-6 rounded-xl font-bold uppercase text-xs tracking-wider transition-all cursor-pointer ${
                                                        targetMode === "custom" 
                                                            ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm" 
                                                            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                                                    }`}
                                                >
                                                    Custom Emails
                                                </button>
                                            </div>
                                        </div>

                                        {targetMode === "custom" ? (
                                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">Add Custom Recipients Email</label>
                                                    <div className="flex gap-3">
                                                        <input 
                                                            type="email" value={customEmail}
                                                            onChange={(e) => setCustomEmail(e.target.value)}
                                                            className="flex-1 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#050A17] px-4 py-3 text-sm font-semibold text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all placeholder:text-slate-400 placeholder:font-normal shadow-inner"
                                                            placeholder="Enter individual email..."
                                                        />
                                                        <button 
                                                            type="button" 
                                                            onClick={addCustomEmail} 
                                                            className="px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-sm cursor-pointer shrink-0"
                                                        >
                                                            Add Email
                                                        </button>
                                                    </div>
                                                </div>
                                                {customRecipients.length > 0 && (
                                                    <div className="flex flex-wrap gap-2 p-4 bg-slate-50 dark:bg-[#050A17] rounded-2xl border border-slate-200 dark:border-slate-800 max-h-40 overflow-y-auto shadow-inner">
                                                        {customRecipients.map(email => (
                                                            <span key={email} className="px-3 py-1.5 bg-white dark:bg-[#091126] border border-slate-200 dark:border-slate-800 rounded-full text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2 group shadow-sm">
                                                                {email}
                                                                <X size={14} className="cursor-pointer text-slate-400 hover:text-red-500 transition-colors" onClick={() => removeCustomEmail(email)}/>
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ) : targetMode === "subscribers" ? (
                                            <div className="bg-slate-50 dark:bg-[#050A17] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-inner animate-in fade-in slide-in-from-bottom-2 duration-300">
                                                <div className="p-4 sm:p-5 bg-white dark:bg-[#091126] border-b border-slate-200 dark:border-slate-800 flex justify-between items-center flex-wrap gap-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                                                            <Mail size={18} />
                                                        </div>
                                                        <div>
                                                            <h3 className="font-bold text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-wider">Subscribers Pool</h3>
                                                            <p className="text-xs sm:text-sm font-extrabold text-blue-600 dark:text-blue-400">
                                                                {recipientsData.subscribers.filter(s => selectedRecipients.includes(s.email)).length} Selected <span className="text-slate-400 font-normal text-xs">(Max 10)</span>
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button 
                                                            type="button" 
                                                            onClick={() => {
                                                                const subEmails = recipientsData.subscribers.map(s => s.email).filter(Boolean);
                                                                const allowedLimit = Math.max(0, 10 - customRecipients.length);
                                                                const capped = subEmails.slice(0, allowedLimit);
                                                                setSelectedRecipients(capped);
                                                                if (subEmails.length > allowedLimit) {
                                                                    toast.info(`Selected first ${allowedLimit} subscribers (maximum limit is 10).`);
                                                                }
                                                            }} 
                                                            className="px-3 py-1.5 rounded-lg border border-blue-500/30 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-wider hover:bg-blue-600 hover:text-white transition-all cursor-pointer"
                                                        >
                                                            Select ({Math.min(10, recipientsData.subscribers.length)})
                                                        </button>
                                                        <button 
                                                            type="button" 
                                                            onClick={() => {
                                                                const subEmails = new Set(recipientsData.subscribers.map(s => s.email));
                                                                setSelectedRecipients(prev => prev.filter(email => !subEmails.has(email)));
                                                            }} 
                                                            className="px-3 py-1.5 rounded-lg border border-red-500/30 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-[10px] font-bold uppercase tracking-wider hover:bg-red-600 hover:text-white transition-all cursor-pointer"
                                                        >
                                                            Deselect All
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="max-h-[360px] overflow-y-auto p-3 custom-scrollbar space-y-1.5">
                                                    {recipientsData.subscribers.length === 0 ? (
                                                        <p className="text-center py-6 text-xs text-slate-400">No subscribers found.</p>
                                                    ) : (
                                                        recipientsData.subscribers.map((sub, idx) => (
                                                            <label key={`sub-${sub._id || idx}`} className={`flex items-center gap-3.5 p-3 rounded-xl transition-all cursor-pointer group ${selectedRecipients.includes(sub.email) ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-500/30 border' : 'hover:bg-white dark:hover:bg-[#091126] border border-transparent'}`}>
                                                                <input type="checkbox" checked={selectedRecipients.includes(sub.email)} onChange={() => toggleRecipient(sub.email)} className="size-4 rounded-md border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-0 transition-all cursor-pointer" />
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white tracking-tight truncate">{sub.email}</p>
                                                                </div>
                                                                <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md shrink-0">Subscribed</span>
                                                            </label>
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="bg-slate-50 dark:bg-[#050A17] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-inner animate-in fade-in slide-in-from-bottom-2 duration-300">
                                                <div className="p-4 sm:p-5 bg-white dark:bg-[#091126] border-b border-slate-200 dark:border-slate-800 flex justify-between items-center flex-wrap gap-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                                                            <Users size={18} />
                                                        </div>
                                                        <div>
                                                            <h3 className="font-bold text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-wider">Admire Users Pool</h3>
                                                            <p className="text-xs sm:text-sm font-extrabold text-blue-600 dark:text-blue-400">
                                                                {recipientsData.users.filter(u => selectedRecipients.includes(u.email)).length} Selected <span className="text-slate-400 font-normal text-xs">(Max 10)</span>
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button 
                                                            type="button" 
                                                            onClick={() => {
                                                                const userEmails = recipientsData.users.map(u => u.email).filter(Boolean);
                                                                const allowedLimit = Math.max(0, 10 - customRecipients.length);
                                                                const capped = userEmails.slice(0, allowedLimit);
                                                                setSelectedRecipients(capped);
                                                                if (userEmails.length > allowedLimit) {
                                                                    toast.info(`Selected first ${allowedLimit} users (maximum limit is 10).`);
                                                                }
                                                            }} 
                                                            className="px-3 py-1.5 rounded-lg border border-blue-500/30 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-wider hover:bg-blue-600 hover:text-white transition-all cursor-pointer"
                                                        >
                                                            Select ({Math.min(10, recipientsData.users.length)})
                                                        </button>
                                                        <button 
                                                            type="button" 
                                                            onClick={() => {
                                                                const userEmails = new Set(recipientsData.users.map(u => u.email));
                                                                setSelectedRecipients(prev => prev.filter(email => !userEmails.has(email)));
                                                            }} 
                                                            className="px-3 py-1.5 rounded-lg border border-red-500/30 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-[10px] font-bold uppercase tracking-wider hover:bg-red-600 hover:text-white transition-all cursor-pointer"
                                                        >
                                                            Deselect All
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="max-h-[360px] overflow-y-auto p-3 custom-scrollbar space-y-1.5">
                                                    {recipientsData.users.length === 0 ? (
                                                        <p className="text-center py-6 text-xs text-slate-400">No users found.</p>
                                                    ) : (
                                                        recipientsData.users.map((user, idx) => (
                                                            <label key={`user-${user._id || idx}`} className={`flex items-center gap-3.5 p-3 rounded-xl transition-all cursor-pointer group ${selectedRecipients.includes(user.email) ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-500/30 border' : 'hover:bg-white dark:hover:bg-[#091126] border border-transparent'}`}>
                                                                <input type="checkbox" checked={selectedRecipients.includes(user.email)} onChange={() => toggleRecipient(user.email)} className="size-4 rounded-md border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-0 transition-all cursor-pointer" />
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white tracking-tight truncate">{user.fName} {user.lName}</p>
                                                                    <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                                                                </div>
                                                                <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-500 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md shrink-0">User</span>
                                                            </label>
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="pt-2 flex justify-end">
                                        <button 
                                            type="button"
                                            onClick={handleSubmit} 
                                            disabled={isLoading || isSending}
                                            className="flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition-all cursor-pointer disabled:opacity-50"
                                         >
                                            {isSending ? <Loader2 className="animate-spin" size={16} /> : (
                                                <>
                                                    <Sparkles size={16} />
                                                    Send Campaign
                                                    <Sparkles size={16} />
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* LIVE DISPATCH PROGRESS TRACKER (AT BOTTOM OF DISPATCH VIEW) */}
                            {(() => {
                                const activeCampaign = 
                                    campaigns.find(c => c._id === activeTrackingId) || 
                                    campaigns.find(c => c.status === "Processing") || 
                                    null;

                                const isReady = !activeCampaign;
                                const campaignTitle = activeCampaign ? activeCampaign.title : (formData.title.trim() || "Ready to Dispatch");
                                const campaignStatus = activeCampaign ? activeCampaign.status : "Ready";
                                const total = activeCampaign 
                                    ? (activeCampaign.stats?.total ?? (((activeCampaign.recipients?.length || 0) + (activeCampaign.customRecipients?.length || 0)) || 0)) 
                                    : 0;
                                const sent = activeCampaign?.stats?.sent || 0;
                                const failed = activeCampaign?.stats?.failed || 0;
                                const pending = activeCampaign ? Math.max(0, total - (sent + failed)) : 0;
                                const percent = total > 0 ? Math.min(100, Math.round(((sent + failed) / total) * 100)) : 0;
                                const isDone = activeCampaign ? (activeCampaign.status === "Sent" || activeCampaign.status === "Failed") : false;
                                const isProcessing = activeCampaign?.status === "Processing";

                                return (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 20 }} 
                                        animate={{ opacity: 1, y: 0 }} 
                                        className="bg-white dark:bg-[#091126] rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-sm space-y-6 mt-6"
                                    >
                                        {/* Tracker Header */}
                                        <div className="flex items-center justify-between flex-wrap gap-4 pb-5 border-b border-slate-100 dark:border-slate-800/80">
                                            <div className="flex items-center gap-3.5">
                                                <div className={`size-10 rounded-2xl border flex items-center justify-center shrink-0 ${
                                                    isProcessing 
                                                        ? "bg-amber-500/10 text-amber-500 border-amber-500/20" 
                                                        : isDone 
                                                        ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
                                                        : "bg-blue-500/10 text-blue-500 border-blue-500/20"
                                                }`}>
                                                    <Activity size={20} className={isProcessing ? "animate-pulse" : ""} />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
                                                            Live Dispatch Progress Tracker
                                                        </h2>
                                                        {isProcessing && <span className="size-2 rounded-full bg-amber-500 animate-ping inline-block" />}
                                                        {isDone && <span className="size-2 rounded-full bg-emerald-500 inline-block" />}
                                                        {isReady && <span className="size-2 rounded-full bg-blue-500 inline-block" />}
                                                    </div>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                                        Campaign: <strong className="text-slate-700 dark:text-slate-300">{campaignTitle}</strong>
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <span className={`px-3 py-1.5 rounded-xl text-[10px] font-extrabold uppercase tracking-wider border ${
                                                    isProcessing
                                                        ? "text-amber-500 bg-amber-500/10 border-amber-500/20"
                                                        : campaignStatus === "Sent"
                                                        ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
                                                        : campaignStatus === "Failed"
                                                        ? "text-red-500 bg-red-500/10 border-red-500/20"
                                                        : "text-blue-500 bg-blue-500/10 border-blue-500/20"
                                                }`}>
                                                    STATUS: {campaignStatus.toUpperCase()}
                                                </span>
                                                {isDone && activeTrackingId && (
                                                    <button 
                                                        onClick={() => setActiveTrackingId(null)}
                                                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                                        title="Dismiss Tracker"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Timeline Stepper */}
                                        <div className="py-2">
                                            <div className="flex items-center justify-between relative max-w-2xl mx-auto px-4">
                                                {/* Step 1: Send Initiated */}
                                                <div className="flex flex-col items-center gap-2 z-10">
                                                    <div className={`size-11 rounded-2xl flex items-center justify-center shadow-lg transition-all ${
                                                        isReady 
                                                            ? "bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700" 
                                                            : "bg-blue-600 text-white shadow-blue-500/25"
                                                    }`}>
                                                        <Send size={18} />
                                                    </div>
                                                    <div className="text-center">
                                                        <p className={`text-[11px] font-extrabold uppercase tracking-wider ${isReady ? "text-slate-400" : "text-blue-600 dark:text-blue-400"}`}>Send</p>
                                                        <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest">{isReady ? "Standby" : "Initiated"}</p>
                                                    </div>
                                                </div>

                                                {/* Line 1 */}
                                                <div className={`flex-1 h-1 mx-2 -mt-6 rounded-full transition-all ${
                                                    isReady ? "bg-slate-200 dark:bg-slate-800" : "bg-gradient-to-r from-blue-600 to-indigo-600"
                                                }`} />

                                                {/* Step 2: Processing */}
                                                <div className="flex flex-col items-center gap-2 z-10">
                                                    <div className={`size-11 rounded-2xl flex items-center justify-center shadow-md transition-all ${
                                                        isProcessing 
                                                            ? "bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-amber-500/25 animate-pulse" 
                                                            : isDone 
                                                            ? "bg-indigo-600 text-white" 
                                                            : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                                                    }`}>
                                                        {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <Clock size={18} />}
                                                    </div>
                                                    <div className="text-center">
                                                        <p className={`text-[11px] font-extrabold uppercase tracking-wider ${isProcessing ? "text-amber-500" : isDone ? "text-indigo-500 dark:text-indigo-400" : "text-slate-400"}`}>Processing</p>
                                                        <p className="text-[9px] font-bold text-slate-400">{isReady ? "Waiting" : `${sent} / ${total} Sent`}</p>
                                                    </div>
                                                </div>

                                                {/* Line 2 */}
                                                <div className={`flex-1 h-1 mx-2 -mt-6 rounded-full transition-all ${
                                                    isDone ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-800"
                                                }`} />

                                                {/* Step 3: Sent / Done */}
                                                <div className="flex flex-col items-center gap-2 z-10">
                                                    <div className={`size-11 rounded-2xl flex items-center justify-center shadow-md transition-all ${
                                                        isDone 
                                                            ? "bg-emerald-500 text-white shadow-emerald-500/25" 
                                                            : "bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700"
                                                    }`}>
                                                        <CheckCircle2 size={18} />
                                                    </div>
                                                    <div className="text-center">
                                                        <p className={`text-[11px] font-extrabold uppercase tracking-wider ${isDone ? "text-emerald-500" : "text-slate-400"}`}>Sent</p>
                                                        <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest">{isDone ? "Complete" : "Waiting"}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Stat Counters Row */}
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#050A17] border border-slate-200 dark:border-slate-800 text-center">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total</span>
                                                <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5">{total}</p>
                                            </div>
                                            <div className="p-4 rounded-2xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 text-center">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Sent</span>
                                                <p className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{sent}</p>
                                            </div>
                                            <div className="p-4 rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 text-center">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Pending</span>
                                                <p className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 mt-0.5">{pending}</p>
                                            </div>
                                            <div className="p-4 rounded-2xl bg-red-500/5 dark:bg-red-500/10 border border-red-500/20 text-center">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400">Failed</span>
                                                <p className="text-xl sm:text-2xl font-black text-red-600 dark:text-red-400 mt-0.5">{failed}</p>
                                            </div>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="space-y-2 pt-1">
                                            <div className="flex justify-between items-center text-xs font-bold text-slate-500 dark:text-slate-400">
                                                <span className="flex items-center gap-1.5">
                                                    Dispatch Progress {isProcessing && <Loader2 size={12} className="animate-spin text-amber-500" />}
                                                </span>
                                                <span className="font-extrabold text-blue-600 dark:text-blue-400">{percent}%</span>
                                            </div>
                                            <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden shadow-inner">
                                                <div 
                                                    className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500 transition-all duration-500 rounded-full"
                                                    style={{ width: `${percent}%` }}
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })()}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* RECIPIENTS DETAIL MODAL */}
                <AnimatePresence>
                    {selectedCampaign && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                            <motion.div 
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                onClick={() => setSelectedCampaign(null)}
                                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            />
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                                className="relative w-full max-w-2xl bg-white dark:bg-[#091126] rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden"
                            >
                                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                    <div>
                                        <h3 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">{selectedCampaign.title}</h3>
                                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-0.5">Recipient Audit Log</p>
                                    </div>
                                    <button onClick={() => setSelectedCampaign(null)} className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#050A17] text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer">
                                        <X size={18} />
                                    </button>
                                </div>
                                <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {[...(selectedCampaign.recipients || []), ...(selectedCampaign.customRecipients || [])].map((email, i) => (
                                                <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-[#050A17] rounded-xl border border-slate-200 dark:border-slate-800">
                                                    <div className="size-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center text-[10px] font-extrabold shrink-0">
                                                        {i + 1}
                                                    </div>
                                                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">{email}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {(!selectedCampaign.recipients?.length && !selectedCampaign.customRecipients?.length) && (
                                            <div className="text-center py-10 text-slate-400 bg-slate-50 dark:bg-[#050A17] rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                                                No recipients recorded for this campaign.
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="p-5 bg-slate-50 dark:bg-[#080f1b] border-t border-slate-100 dark:border-slate-800 flex justify-end">
                                    <button 
                                        onClick={() => setSelectedCampaign(null)}
                                        className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#050A17] text-slate-700 dark:text-slate-200 text-xs font-bold uppercase tracking-wider hover:bg-slate-50 dark:hover:bg-[#080E21] transition-all cursor-pointer shadow-sm"
                                    >
                                        Close Log
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* DELETE CONFIRMATION */}
                <ConfirmationModal 
                    isOpen={!!campaignToDelete}
                    onClose={() => setCampaignToDelete(null)}
                    onConfirm={async () => {
                        const success = await deleteCampaign(campaignToDelete);
                        if (success) setCampaignToDelete(null);
                    }}
                    title="Delete Campaign"
                >
                    Are you sure you want to delete this campaign execution record? This action cannot be undone and will remove all associated telemetry data from the database.
                </ConfirmationModal>
            </div>
            <style>{`.custom-scrollbar::-webkit-scrollbar { width: 4px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(59, 130, 246, 0.2); border-radius: 10px; }`}</style>
        </div>
    );
};

export default CampaignManagement;
