import { useEffect, useState, useMemo } from "react";
import { apiClient } from "../../../stores/authStores";
import { 
    Mail, 
    MessageSquare, 
    Trash2, 
    User, 
    Phone, 
    Calendar, 
    ChevronLeft, 
    ChevronRight, 
    Loader2, 
    Sparkles,
    CheckCircle2,
    Search,
    Inbox
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ITEMS_PER_PAGE = 10;

const ContactUs = () => {
  const [contacts, setContacts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalContacts, setTotalContacts] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const totalPages = useMemo(() => Math.ceil(totalContacts / ITEMS_PER_PAGE), [totalContacts]);

  const fetchContacts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get("/admin/get-contact");
      const data = response.data.Data || [];
      setTotalContacts(data.length);
      const start = (currentPage - 1) * ITEMS_PER_PAGE;
      setContacts(data.slice(start, start + ITEMS_PER_PAGE));
    } catch (err) {
      setError("Failed to synchronize inquiries.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [currentPage]);

  const handleDelete = async (_id) => {
    if (!window.confirm("Permanently remove this inquiry from the archive?")) return;
    try {
      await apiClient.delete(`/admin/get-contact/${_id}`);
      fetchContacts();
    } catch (err) {
      alert("Removal failed.");
    }
  };

  const filtered = contacts.filter(c => 
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.subject?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-[1400px] mx-auto space-y-10 pb-20 px-6">
      {/* HEADER HUB */}
      <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-12 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none text-indigo-600"><MessageSquare size={200} /></div>
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div>
                <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-4">
                    <Inbox className="text-indigo-600" size={36} /> CONTACT ARCHIVE
                </h1>
                <p className="text-slate-500 font-medium mt-2 text-lg italic">Direct communication leads from potential couples</p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                    <input 
                        type="text" 
                        placeholder="Filter messages..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-transparent focus:border-indigo-100 dark:focus:border-indigo-900/30 rounded-2xl text-sm font-bold w-full sm:w-64 outline-none transition-all shadow-sm"
                    />
                </div>
                <div className="px-6 py-4 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                    <CheckCircle2 size={16} /> {totalContacts} TOTAL
                </div>
            </div>
        </div>
      </div>

      {/* INQUIRY LIST */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-40 gap-4">
            <Loader2 className="animate-spin text-indigo-600" size={48} strokeWidth={1} />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Syncing Communication Hub</p>
        </div>
      ) : error ? (
        <div className="py-20 text-center bg-red-50 dark:bg-red-950/20 rounded-[3rem] border border-red-100 dark:border-red-900/30">
            <p className="text-red-500 font-bold uppercase tracking-widest text-xs">{error}</p>
        </div>
      ) : filtered.length > 0 ? (
        <div className="space-y-6">
            <AnimatePresence mode='popLayout'>
                {filtered.map((contact) => (
                    <motion.div 
                        layout key={contact._id} 
                        initial={{ opacity: 0, x: -20 }} 
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="group bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden transition-all hover:shadow-2xl"
                    >
                        <div className="p-8">
                            <div className="flex flex-col lg:flex-row justify-between gap-8">
                                <div className="flex-1 space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="size-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-500/20">
                                            {contact.name?.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] mb-1">{contact.subject || 'Honeymoon Inquiry'}</p>
                                            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{contact.name}</h2>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-6">
                                        <a href={`mailto:${contact.email}`} className="flex items-center gap-3 text-slate-500 hover:text-indigo-600 transition-colors group/link">
                                            <div className="size-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover/link:bg-indigo-600 group-hover/link:text-white transition-all"><Mail size={14} /></div>
                                            <span className="text-xs font-bold">{contact.email}</span>
                                        </a>
                                        <div className="flex items-center gap-3 text-slate-500">
                                            <div className="size-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center"><Phone size={14} /></div>
                                            <span className="text-xs font-bold">{contact.phone_no}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-slate-300">
                                            <Calendar size={14} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">{new Date(contact.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>

                                    <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border border-slate-100 dark:border-slate-800 relative">
                                        <MessageSquare className="absolute top-6 right-6 text-slate-100 dark:text-slate-800" size={40} />
                                        <p className="text-sm font-bold text-slate-600 dark:text-slate-300 leading-relaxed relative z-10 whitespace-pre-wrap">
                                            {contact.message}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex lg:flex-col justify-end gap-3 shrink-0">
                                    <button onClick={() => handleDelete(contact._id)} className="flex items-center justify-center size-12 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm">
                                        <Trash2 size={20} />
                                    </button>
                                    <button className="flex items-center justify-center size-12 bg-indigo-50 text-indigo-600 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                                        <CheckCircle2 size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>

            {/* PAGINATION */}
            <div className="flex items-center justify-between px-8 py-6 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Entry {currentPage} <span className="mx-2 text-slate-200">/</span> {totalPages}
                </p>
                <div className="flex gap-3">
                    <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 disabled:opacity-30 hover:bg-slate-50 transition-all text-slate-600">
                        <ChevronLeft size={20} />
                    </button>
                    <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 disabled:opacity-30 hover:bg-slate-50 transition-all text-slate-600">
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>
        </div>
      ) : (
        <div className="py-40 text-center bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 border-dashed">
            <Inbox className="mx-auto mb-4 text-slate-100" size={80} strokeWidth={1} />
            <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-xs">The inquiry archive is empty</p>
        </div>
      )}
    </motion.div>
  );
};

export default ContactUs;
