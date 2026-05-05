import { useEffect, useState, useMemo } from "react";
import { apiClient } from "../../../stores/authStores";
import { 
    Trash2, 
    MessageSquare, 
    Phone, 
    Mail, 
    MapPin, 
    Calendar, 
    User, 
    Loader2, 
    Sparkles, 
    Search, 
    ChevronLeft, 
    ChevronRight,
    ArrowUpRight,
    Inbox,
    Target,
    Navigation
} from "lucide-react";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

const ITEMS_PER_PAGE = 10;

const ConsultationLeads = () => {
  const [leads, setLeads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalLeads, setTotalLeads] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const totalPages = useMemo(() => Math.ceil(totalLeads / ITEMS_PER_PAGE), [totalLeads]);

  useEffect(() => {
    const loadLeads = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiClient.get("/admin/consultation-leads");
        if (response.data.Data) {
          setLeads(response.data.Data);
          setTotalLeads(response.data.Data.length);
        }
      } catch (err) {
        setError("Failed to synchronize consultation vault.");
      } finally {
        setIsLoading(false);
      }
    };
    loadLeads();
  }, []);

  const filteredLeads = useMemo(() => {
    return leads.filter(lead =>
      lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone?.includes(searchTerm) ||
      lead.city?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [leads, searchTerm]);

  const paginatedLeads = useMemo(() => {
    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredLeads.slice(startIdx, startIdx + ITEMS_PER_PAGE);
  }, [filteredLeads, currentPage]);

  const handleDelete = async (leadId) => {
    if (!window.confirm("Permanently remove this consultation request?")) return;
    try {
      const response = await apiClient.delete(`/admin/consultation-leads/${leadId}`);
      if (response.data.success) {
        setLeads((prev) => prev.filter((lead) => lead._id !== leadId));
        setTotalLeads((prev) => prev - 1);
        toast.success("Consultation archived");
      }
    } catch (err) {
      toast.error("Removal failed");
    }
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
    });

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-[1400px] mx-auto space-y-10 pb-20 px-6">
      {/* HEADER HUB */}
      <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-12 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none text-indigo-600"><Target size={200} /></div>
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div>
                <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-4">
                    <MessageSquare className="text-indigo-600" size={36} /> CONSULTATION HUB
                </h1>
                <p className="text-slate-500 font-medium mt-2 text-lg italic">High-intent consultation requests from destination seekers</p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                    <input 
                        type="text" 
                        placeholder="Filter consultants..." 
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        className="pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-transparent focus:border-indigo-100 dark:focus:border-indigo-900/30 rounded-2xl text-sm font-bold w-full sm:w-64 outline-none transition-all shadow-sm"
                    />
                </div>
                <div className="px-6 py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-2xl shadow-indigo-500/30">
                    <Sparkles size={16} /> {totalLeads} PORTAL LEADS
                </div>
            </div>
        </div>
      </div>

      {/* LEAD GRID */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-40 gap-4">
            <Loader2 className="animate-spin text-indigo-600" size={48} strokeWidth={1} />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Syncing Consultation Archive</p>
        </div>
      ) : error ? (
        <div className="py-20 text-center bg-red-50 dark:bg-red-950/20 rounded-[3rem] border border-red-100 dark:border-red-900/30 text-red-500 font-bold uppercase tracking-widest text-xs">
            {error}
        </div>
      ) : paginatedLeads.length > 0 ? (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <AnimatePresence mode='popLayout'>
                    {paginatedLeads.map((lead) => (
                        <motion.div 
                            layout key={lead._id} 
                            initial={{ opacity: 0, scale: 0.95 }} 
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="group bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden transition-all hover:shadow-2xl"
                        >
                            <div className="p-8 space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="size-14 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-xl">
                                        {lead.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                        Active Inquiry
                                    </div>
                                </div>

                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{lead.name}</h2>
                                    <div className="flex flex-col gap-3 mt-4">
                                        <a href={`mailto:${lead.email}`} className="flex items-center gap-3 text-slate-500 hover:text-indigo-600 transition-colors group/link">
                                            <div className="size-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover/link:bg-indigo-600 group-hover/link:text-white transition-all"><Mail size={14} /></div>
                                            <span className="text-xs font-bold">{lead.email}</span>
                                        </a>
                                        <div className="flex items-center gap-3 text-slate-500">
                                            <div className="size-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center"><Phone size={14} /></div>
                                            <span className="text-xs font-bold">{lead.phone}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-slate-50 dark:border-slate-800">
                                    <div className="flex items-center gap-2 mb-3">
                                        <MapPin className="text-indigo-600" size={14} />
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Request Context</p>
                                    </div>
                                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
                                        <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Selected Itinerary</p>
                                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200 leading-relaxed italic">
                                            "{lead.itineraryTitle || 'Custom Honeymoon Sequence'}"
                                        </p>
                                        <div className="pt-2 flex items-center gap-2 text-slate-400">
                                            <Navigation size={12} />
                                            <span className="text-[10px] font-bold uppercase">{lead.city}, {lead.state}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4">
                                    <div className="flex items-center gap-2 text-slate-300">
                                        <Calendar size={14} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">{formatDate(lead.createdAt)}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => handleDelete(lead._id)} className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm">
                                            <Trash2 size={16} />
                                        </button>
                                        <button className="p-3 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                                            <ArrowUpRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* PAGINATION */}
            <div className="flex items-center justify-between px-8 py-6 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Showing Page {currentPage} <span className="mx-2 text-slate-200">/</span> {totalPages}
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
            <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-xs">The consultation hub is empty</p>
        </div>
      )}
    </motion.div>
  );
};

export default ConsultationLeads;
