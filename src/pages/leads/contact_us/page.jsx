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
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-full mx-auto space-y-10 pb-20 px-6 text-left">
      {/* HEADER HUB */}
      <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-12 border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none text-indigo-700"><MessageSquare size={240} /></div>
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-10">
            <div>
                <h1 className="text-4xl font-black text-slate-950 dark:text-white tracking-tight flex items-center gap-5">
                    <Inbox className="text-indigo-700" size={44} /> CONTACT ARCHIVE
                </h1>
                <p className="text-slate-600 dark:text-slate-400 font-bold mt-2 text-xl italic text-left">Direct communication leads from potential couples</p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative group w-full sm:w-80">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-700 transition-colors" size={24} />
                    <input 
                        type="text" 
                        placeholder="Filter messages..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-16 pr-8 py-5 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-indigo-600/20 focus:ring-4 focus:ring-indigo-500/10 rounded-[1.5rem] text-lg font-black w-full outline-none transition-all placeholder:text-slate-400 shadow-sm"
                    />
                </div>
                <div className="px-8 py-5 bg-indigo-700 text-white rounded-[1.5rem] text-sm font-black uppercase tracking-[0.2em] flex items-center gap-3 shadow-2xl shadow-indigo-500/40">
                    <CheckCircle2 size={20} /> {totalContacts} TOTAL INQUIRIES
                </div>
            </div>
        </div>
      </div>

      {/* INQUIRY LIST */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-48 gap-8">
            <Loader2 className="animate-spin text-indigo-700" size={64} strokeWidth={1.5} />
            <p className="text-xs font-black uppercase tracking-[0.4em] text-slate-400">Syncing Communication Hub...</p>
        </div>
      ) : error ? (
        <div className="py-24 text-center bg-red-50 dark:bg-red-950/20 rounded-[3rem] border-2 border-red-100 dark:border-red-900/30">
            <p className="text-red-700 font-black uppercase tracking-[0.3em] text-sm">{error}</p>
        </div>
      ) : filtered.length > 0 ? (
        <div className="space-y-8">
            <AnimatePresence mode='popLayout'>
                {filtered.map((contact) => (
                    <motion.div 
                        layout key={contact._id} 
                        initial={{ opacity: 0, x: -30 }} 
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 30 }}
                        className="group bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden transition-all hover:shadow-2xl hover:shadow-indigo-500/15"
                    >
                        <div className="p-10">
                            <div className="flex flex-col lg:flex-row justify-between gap-10">
                                <div className="flex-1 space-y-8 text-left">
                                    <div className="flex items-center gap-5">
                                        <div className="size-16 bg-indigo-700 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-indigo-500/30">
                                            {contact.name?.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="text-left">
                                            <p className="text-[10px] font-black text-indigo-700 uppercase tracking-[0.3em] mb-2">{contact.subject || 'Standard Honeymoon Inquiry'}</p>
                                            <h2 className="text-2xl font-black text-slate-950 dark:text-white tracking-tight">{contact.name}</h2>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-8">
                                        <a href={`mailto:${contact.email}`} className="flex items-center gap-4 text-slate-500 hover:text-indigo-700 transition-colors group/link">
                                            <div className="size-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover/link:bg-indigo-700 group-hover/link:text-white transition-all shadow-sm border border-slate-100"><Mail size={18} /></div>
                                            <span className="text-sm font-black text-slate-950 dark:text-slate-300">{contact.email}</span>
                                        </a>
                                        <div className="flex items-center gap-4 text-slate-500">
                                            <div className="size-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-100"><Phone size={18} /></div>
                                            <span className="text-sm font-black text-slate-950 dark:text-slate-300">{contact.phone_no}</span>
                                        </div>
                                        <div className="flex items-center gap-4 text-slate-400">
                                            <div className="size-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-100"><Calendar size={18} /></div>
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">{new Date(contact.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>

                                    <div className="p-8 bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-800 relative">
                                        <MessageSquare className="absolute top-8 right-8 text-slate-200 dark:text-slate-800" size={60} />
                                        <p className="text-lg font-black text-slate-950 dark:text-slate-200 leading-relaxed relative z-10 whitespace-pre-wrap">
                                            "{contact.message}"
                                        </p>
                                    </div>
                                </div>

                                <div className="flex lg:flex-col justify-end gap-4 shrink-0">
                                    <button onClick={() => handleDelete(contact._id)} className="flex items-center justify-center size-14 bg-white text-red-600 rounded-[1.5rem] hover:bg-red-600 hover:text-white transition-all shadow-xl border border-slate-100">
                                        <Trash2 size={24} />
                                    </button>
                                    <button className="flex items-center justify-center size-14 bg-white text-indigo-700 rounded-[1.5rem] hover:bg-indigo-700 hover:text-white transition-all shadow-xl border border-slate-100">
                                        <CheckCircle2 size={24} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>

            {/* PAGINATION */}
            <div className="flex items-center justify-between px-10 py-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none">
                <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">
                    Archive Segment: <span className="text-slate-950 dark:text-white">{currentPage}</span> <span className="mx-2 text-slate-200">/</span> {totalPages}
                </p>
                <div className="flex gap-4">
                    <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-950 dark:text-white border-2 border-transparent hover:border-indigo-700/20 disabled:opacity-30 transition-all">
                        <ChevronLeft size={24} strokeWidth={3} />
                    </button>
                    <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-950 dark:text-white border-2 border-transparent hover:border-indigo-700/20 disabled:opacity-30 transition-all">
                        <ChevronRight size={24} strokeWidth={3} />
                    </button>
                </div>
            </div>
        </div>
      ) : (
        <div className="py-48 text-center bg-white dark:bg-slate-900 rounded-[3.5rem] border-4 border-dashed border-slate-100 dark:border-slate-800">
            <Inbox className="mx-auto mb-6 text-slate-100 dark:text-slate-800" size={100} strokeWidth={1} />
            <h3 className="text-3xl font-black text-slate-950 dark:text-white uppercase tracking-tight mb-4">No New Inquiries</h3>
            <p className="text-slate-600 dark:text-slate-400 font-bold uppercase tracking-widest text-sm italic">The inquiry archive is currently clean</p>
        </div>
      )}
    </motion.div>
  );
};

export default ContactUs;
