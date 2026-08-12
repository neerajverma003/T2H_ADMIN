import { useState, useEffect } from "react";
import { 
  Mail, Plus, Send, Users, Link as LinkIcon, FileText,
  Loader2, CheckCircle2, X, ChevronRight, Search, 
  Layers, PlusCircle, History, Sparkles, Trash2, Eye
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

    const [view, setView] = useState("list"); // "list" or "send"
    const [selectedCampaign, setSelectedCampaign] = useState(null);
    const [campaignToDelete, setCampaignToDelete] = useState(null);
    const [targetMode, setTargetMode] = useState("stored"); // "stored" or "custom"
    const [recipientsData, setRecipientsData] = useState({ subscribers: [], users: [] });
    const [selectedRecipients, setSelectedRecipients] = useState([]);
    const [customEmail, setCustomEmail] = useState("");
    const [customRecipients, setCustomRecipients] = useState([]);
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
        if (hasProcessing) {
            interval = setInterval(() => fetchCampaigns(), 3000);
        }
        return () => clearInterval(interval);
    }, [campaigns, fetchCampaigns]);

    const loadRecipients = async () => {
        const data = await getRecipients();
        setRecipientsData(data);
    };

    const toggleRecipient = (email) => {
        setSelectedRecipients(prev => 
            prev.includes(email) ? prev.filter(e => e !== email) : [...prev, email]
        );
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
        setCustomRecipients([...customRecipients, customEmail]);
        setCustomEmail("");
    };

    const removeCustomEmail = (email) => {
        setCustomRecipients(customRecipients.filter(e => e !== email));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.templateId) {
            toast.error("Please select a template.");
            return;
        }
        if (selectedRecipients.length === 0 && customRecipients.length === 0) {
            toast.error("Please select at least one recipient.");
            return;
        }

        const campaignId = await createCampaign({
            ...formData,
            recipients: selectedRecipients,
            customRecipients
        });

        if (campaignId) {
            await sendCampaign(campaignId);
            setView("list");
            setFormData({ title: "", templateId: "" });
            setSelectedRecipients([]);
            setCustomRecipients([]);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Sent': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
            case 'Processing': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
            case 'Failed': return 'text-red-500 bg-red-500/10 border-red-500/20';
            default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
        }
    };

    return (
        <div className="pb-16 text-slate-100 font-sans">
            <div className="max-w-7xl mx-auto space-y-8">
                
                {/* HEADER */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-x-3 text-blue-600">
                            <Send className="size-5 animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Create, manage and track email campaigns</span>
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
                            Dispatch <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Campaign</span>
                        </h1>
                    </div>

                    <button 
                        onClick={() => setView(view === "list" ? "send" : "list")}
                        className="flex items-center gap-3 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-lg shadow-lg shadow-blue-600/20 transition-all"
                    >
                        {view === "list" ? <><PlusCircle size={18} /> Send Template</> : <><History size={18} /> Visit History </>}
                    </button>
                </div>

                <AnimatePresence mode="wait">
                    {view === "list" ? (
                        <motion.div key="list" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-white dark:bg-slate-900/50 rounded-[40px] border border-slate-400 dark:border-white/10 overflow-hidden shadow-xl">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50/50 dark:bg-slate-800/50">
                                        <tr>
                                            <th className="px-8 py-5 text-[14px] font-black text-slate-800 uppercase tracking-widest">Campaign Name</th>
                                            <th className="px-8 py-5 text-[14px] font-black text-slate-800 uppercase tracking-widest">Template Used</th>
                                            <th className="px-8 py-5 text-[14px] font-black text-slate-800 uppercase tracking-widest">Status</th>
                                            <th className="px-8 py-5 text-[14px] font-black text-slate-800 uppercase tracking-widest">Audience</th>
                                            {/* <th className="px-8 py-5 text-[14px] font-black text-slate-800 uppercase tracking-widest">Telemetry</th> */}
                                            <th className="px-8 py-5 text-[14px] font-black text-slate-800 uppercase tracking-widest text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                        {campaigns.map(campaign => (
                                            <tr key={campaign._id} className="group hover:bg-blue-50/30 dark:hover:bg-blue-600/[0.03] transition-all">
                                                <td className="px-8 py-6">
                                                    <span className="text-sm font-black text-slate-900 dark:text-white tracking-tight">{campaign.title}</span>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-2 text-slate-500">
                                                        <Layers size={14}/>
                                                        <span className="text-xs font-bold">{campaign.templateId?.name || "Deleted Template"}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(campaign.status)}`}>
                                                        {campaign.status === 'Processing' && <Loader2 size={10} className="animate-spin" />}
                                                        {campaign.status}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6 text-sm font-bold text-slate-600 dark:text-slate-400">
                                                    {(campaign.recipients?.length || 0) + (campaign.customRecipients?.length || 0)} Total
                                                </td>
                                                {/* <td className="px-8 py-6">
                                                    <div className="space-y-1.5 w-32 font-black uppercase text-[10px]">
                                                        <div className="flex justify-between">
                                                            <span className="text-emerald-500">Success: {campaign.stats?.sent || 0}</span>
                                                        </div>
                                                        <div className="h-1 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                                            <div className="h-full bg-blue-600" style={{ width: `${(campaign.stats?.sent / campaign.stats?.total) * 100}%` }} />
                                                        </div>
                                                    </div>
                                                </td> */}
                                                <td className="px-8 py-6">
                                                    <div className="flex justify-center gap-4">
                                                        <button 
                                                            onClick={() => setSelectedCampaign(campaign)}
                                                            className="p-3 rounded-2xl bg-slate-200 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-blue-600 hover:text-white transition-all shadow-lg hover:shadow-blue-600/20"
                                                            title="View Recipients"
                                                        >
                                                            <Eye size={20} />
                                                        </button>

                                                        {/* {campaign.status === 'Draft' || campaign.status === 'Failed' ? (
                                                            <button onClick={() => sendCampaign(campaign._id)} className="p-3 rounded-2xl bg-emerald-600 text-white shadow-xl shadow-emerald-600/30 hover:scale-105 active:scale-95 transition-all" title="Send Now">
                                                                <Send size={16} />
                                                            </button>
                                                        ) : (
                                                            <div className="p-3 rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-400">
                                                                <CheckCircle2 size={16} />
                                                            </div>
                                                        )} */}

                                                        <button 
                                                            onClick={() => setCampaignToDelete(campaign._id)}
                                                            className="p-3 rounded-2xl bg-red-100 dark:bg-red-500/10 text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-lg hover:shadow-red-600/20"
                                                            title="Delete Campaign"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div key="send" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-10">
                            {/* CONFIGURATION & RECIPIENT SELECTION */}
                            <div className="space-y-6">
                                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-[40px] p-8 sm:p-12 shadow-2xl space-y-10">
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[13px] font-black uppercase tracking-widest text-slate-600 ml-1">Campaign Title</label>
                                            <input 
                                                type="text" required value={formData.title}
                                                onChange={(e) => setFormData({...formData, title: e.target.value})}
                                                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-400 dark:border-white/10 rounded-2xl px-6 py-4 text-lg font-bold text-slate-900 dark:text-white outline-none focus:border-blue-600 transition-all"
                                                placeholder="e.g., Q3 Flash Sale Execution"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[13px] font-black uppercase tracking-widest text-slate-600 ml-1">Select Module (Template)</label>
                                            <select 
                                                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-400 dark:border-white/10 rounded-2xl px-6 py-4 text-lg font-bold text-slate-900 dark:text-white outline-none focus:border-blue-600 transition-all appearance-none cursor-pointer"
                                                value={formData.templateId}
                                                onChange={(e) => setFormData({...formData, templateId: e.target.value})}
                                            >
                                                <option value="">Select a saved template...</option>
                                                {templates.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                                            </select>
                                        </div>

                                        {/* RECIPIENT MODE SWITCHER */}
                                        <div className="pt-6 border-t border-slate-100 dark:border-white/5 space-y-6">
                                            <div className="flex gap-2 justify-center">
                                                <div className="border border-slate-600 p-1 rounded-2xl">
                                                    <button 
                                                    type="button"
                                                    onClick={() => { setTargetMode("stored"); setCustomRecipients([]); }}
                                                    className={`py-3 px-8 rounded-2xl font-black uppercase text-sm tracking-widest transition-all ${targetMode === "stored" ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "bg-slate-100 dark:bg-white/5 text-slate-600"}`}
                                                >
                                                    Admire Users
                                                </button>
                                                <button 
                                                    type="button"
                                                    onClick={() => { setTargetMode("custom"); setSelectedRecipients([]); }}
                                                    className={`py-3 px-8 rounded-2xl font-black uppercase text-sm tracking-widest transition-all ${targetMode === "custom" ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "bg-slate-100 dark:bg-white/5 text-slate-600"}`}
                                                >
                                                    Custom Emails
                                                </button>
                                                </div>
                                            </div>

                                            {targetMode === "custom" ? (
                                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                                    <div className="space-y-2">
                                                        <label className="text-[13px] font-black uppercase tracking-widest text-slate-600 ml-1">Add Custom Recipients Email</label>
                                                        <div className="flex gap-4">
                                                            <input 
                                                                type="email" value={customEmail}
                                                                onChange={(e) => setCustomEmail(e.target.value)}
                                                                className="flex-1 bg-slate-50 dark:bg-slate-800/50 border border-slate-400 dark:border-white/10 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-blue-600 transition-all "
                                                                placeholder="Enter individual email..."
                                                            />
                                                            <button type="button" onClick={addCustomEmail} className="px-8 bg-emerald-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all">Add Email</button>
                                                        </div>
                                                    </div>
                                                    {customRecipients.length > 0 && (
                                                        <div className="flex flex-wrap gap-2 p-6 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-400 dark:border-white/10 max-h-40 overflow-y-auto">
                                                            {customRecipients.map(email => (
                                                                <span key={email} className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-400 dark:border-white/10 rounded-full text-sm font-bold text-slate-600 dark:text-slate-300 flex items-center gap-2 group">
                                                                    {email}
                                                                    <X size={18} className="cursor-pointer text-red-500 opacity-0 group-hover:opacity-100 transition-all" onClick={() => setCustomRecipients(prev => prev.filter(e => e !== email))}/>
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="bg-slate-50 dark:bg-white/5 border border-slate-600 dark:border-white/10 rounded-[32px] overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                                                    <div className="p-6 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-white/5 flex justify-between items-center">
                                                        <div className="flex items-center gap-4">
                                                            <div className="p-3 rounded-2xl bg-blue-600 text-white shadow-lg">
                                                                <Users size={20} />
                                                            </div>
                                                            <div>
                                                                <h3 className="font-black text-slate-900 dark:text-white uppercase text-[10px] tracking-widest opacity-50">Active Pool</h3>
                                                                <p className="text-sm font-black text-blue-600">{selectedRecipients.length} Target Selected</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button type="button" onClick={() => setSelectedRecipients(recipientsData.subscribers.map(s => s.email))} className="px-4 py-2 bg-blue-600/10 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all">All Subs</button>
                                                            <button type="button" onClick={() => setSelectedRecipients(recipientsData.users.map(u => u.email))} className="px-4 py-2 bg-blue-600/10 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all">All Users</button>
                                                            <button type="button" onClick={() => setSelectedRecipients([])} className="px-4 py-2 bg-red-600/10 text-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all">Clear</button>
                                                        </div>
                                                    </div>
                                                    <div className="max-h-[400px] overflow-y-auto p-4 custom-scrollbar space-y-2">
                                                        {recipientsData.subscribers.map((sub, idx) => (
                                                            <label key={`sub-${idx}`} className={`flex items-center gap-4 p-4 rounded-2xl transition-all cursor-pointer group ${selectedRecipients.includes(sub.email) ? 'bg-blue-600/5 border-blue-600/20 border' : 'hover:bg-white dark:hover:bg-slate-800 border border-transparent'}`}>
                                                                <input type="checkbox" checked={selectedRecipients.includes(sub.email)} onChange={() => toggleRecipient(sub.email)} className="size-5 rounded-lg border-2 border-slate-300 dark:border-white/20 text-blue-600 focus:ring-0 transition-all cursor-pointer" />
                                                                <div className="flex-1">
                                                                    <p className="text-sm font-black text-slate-900 dark:text-white tracking-tight leading-none">{sub.name || 'Anonymous'}</p>
                                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{sub.email}</p>
                                                                </div>
                                                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 dark:bg-white/5 px-2 py-1 rounded-md">Subscriber</span>
                                                            </label>
                                                        ))}
                                                        {recipientsData.users.map((user, idx) => (
                                                            <label key={`user-${idx}`} className={`flex items-center gap-4 p-4 rounded-2xl transition-all cursor-pointer group ${selectedRecipients.includes(user.email) ? 'bg-blue-600/5 border-blue-600/20 border' : 'hover:bg-white dark:hover:bg-slate-800 border border-transparent'}`}>
                                                                <input type="checkbox" checked={selectedRecipients.includes(user.email)} onChange={() => toggleRecipient(user.email)} className="size-5 rounded-lg border-2 border-slate-300 dark:border-white/20 text-blue-600 focus:ring-0 transition-all cursor-pointer" />
                                                                <div className="flex-1">
                                                                    <p className="text-sm font-black text-slate-900 dark:text-white tracking-tight leading-none">{user.fName} {user.lName}</p>
                                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{user.email}</p>
                                                                </div>
                                                                <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-100/10 px-2 py-1 rounded-md">User</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <button 
                                            onClick={handleSubmit} disabled={isLoading || isSending || (!formData.templateId) || (targetMode === 'custom' ? customRecipients.length === 0 : selectedRecipients.length === 0)}
                                            className="bg-indigo-600 text-white rounded-2xl px-4 py-4 font-black uppercase text-sm tracking-[0.2em] shadow-2xl shadow-indigo-600/30 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-2 overflow-hidden group justify-self-end mr-2"
                                        >
                                            {isSending ? <Loader2 className="animate-spin" /> : (
                                                <>
                                                    <Sparkles size={20} className="group-hover:rotate-12 transition-transform" />
                                                    Send Campaign
                                                    <Sparkles size={20} className="group-hover:-rotate-12 transition-transform" />
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
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
                                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                            />
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden"
                            >
                                <div className="p-8 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{selectedCampaign.title}</h3>
                                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Recipient Audit Log</p>
                                    </div>
                                    <button onClick={() => setSelectedCampaign(null)} className="p-3 rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-red-500 transition-colors">
                                        <X size={20} />
                                    </button>
                                </div>
                                <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {[...(selectedCampaign.recipients || []), ...(selectedCampaign.customRecipients || [])].map((email, i) => (
                                                <div key={i} className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 group hover:border-blue-600/30 transition-all">
                                                    <div className="size-8 rounded-full bg-blue-600/10 text-blue-600 flex items-center justify-center text-[10px] font-black">
                                                        {i + 1}
                                                    </div>
                                                    <span className="text-sm font-bold text-slate-600 dark:text-slate-300 truncate">{email}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {(!selectedCampaign.recipients?.length && !selectedCampaign.customRecipients?.length) && (
                                            <div className="text-center py-10 text-slate-400 bg-slate-50 dark:bg-white/5 rounded-[32px] border border-dashed border-slate-200">
                                                No recipients recorded for this campaign.
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="p-8 bg-slate-50 dark:bg-slate-800/50 flex justify-end">
                                    <button 
                                        onClick={() => setSelectedCampaign(null)}
                                        className="px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase text-xs tracking-widest hover:scale-105 active:scale-95 transition-all"
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
