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
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-full mx-auto space-y-10 pb-20 px-6 text-left">
      {/* HEADER HUB */}
      <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-12 border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none text-indigo-700"><Target size={240} /></div>
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-10">
            <div>
                <h1 className="text-4xl font-black text-slate-950 dark:text-white tracking-tight flex items-center gap-5">
                    <MessageSquare className="text-indigo-700" size={44} /> CONSULTATION HUB
                </h1>
                <p className="text-slate-600 dark:text-slate-400 font-bold mt-2 text-xl italic text-left">High-intent consultation requests from destination seekers</p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative group w-full sm:w-80">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-700 transition-colors" size={24} />
                    <input 
                        type="text" 
                        placeholder="Filter consultants..." 
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        className="pl-16 pr-8 py-5 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-indigo-600/20 focus:ring-4 focus:ring-indigo-500/10 rounded-[1.5rem] text-lg font-black w-full outline-none transition-all placeholder:text-slate-400 shadow-sm"
                    />
                </div>
                <div className="px-8 py-5 bg-indigo-700 text-white rounded-[1.5rem] text-sm font-black uppercase tracking-[0.2em] flex items-center gap-3 shadow-2xl shadow-indigo-500/40">
                    <Sparkles size={20} /> {totalLeads} PORTAL LEADS
                </div>
            </div>
        </div>
      </div>

      {/* LEAD GRID */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-48 gap-8">
            <Loader2 className="animate-spin text-indigo-700" size={64} strokeWidth={1.5} />
            <p className="text-xs font-black uppercase tracking-[0.4em] text-slate-400">Syncing Consultation Archive...</p>
        </div>
      ) : error ? (
        <div className="py-24 text-center bg-red-50 dark:bg-red-950/20 rounded-[3rem] border-2 border-red-100 dark:border-red-900/30">
            <p className="text-red-700 font-black uppercase tracking-[0.3em] text-sm">{error}</p>
        </div>
      ) : paginatedLeads.length > 0 ? (
        <div className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                <AnimatePresence mode='popLayout'>
                    {paginatedLeads.map((lead) => (
                        <motion.div 
                            layout key={lead._id} 
                            initial={{ opacity: 0, scale: 0.95 }} 
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="group bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden transition-all hover:shadow-2xl hover:shadow-indigo-500/15"
                        >
                            <div className="p-10 space-y-8">
                                <div className="flex items-center justify-between">
                                    <div className="size-16 bg-indigo-700 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-indigo-500/30">
                                        {lead.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="px-5 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] border border-indigo-100">
                                        Priority Inquiry
                                    </div>
                                </div>

                                <div>
                                    <h2 className="text-2xl font-black text-slate-950 dark:text-white tracking-tight">{lead.name}</h2>
                                    <div className="flex flex-col gap-4 mt-6">
                                        <a href={`mailto:${lead.email}`} className="flex items-center gap-4 text-slate-500 hover:text-indigo-700 transition-colors group/link">
                                            <div className="size-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover/link:bg-indigo-700 group-hover/link:text-white transition-all shadow-sm border border-slate-100"><Mail size={18} /></div>
                                            <span className="text-sm font-black text-slate-950 dark:text-slate-300">{lead.email}</span>
                                        </a>
                                        <div className="flex items-center gap-4 text-slate-500">
                                            <div className="size-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-100"><Phone size={18} /></div>
                                            <span className="text-sm font-black text-slate-950 dark:text-slate-300">{lead.phone}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-8 border-t-2 border-slate-50 dark:border-slate-800">
                                    <div className="flex items-center gap-3 mb-4">
                                        <MapPin className="text-indigo-700" size={18} />
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Request Blueprint</p>
                                    </div>
                                    <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border-2 border-slate-100 dark:border-slate-800 space-y-3">
                                        <p className="text-[10px] font-black text-indigo-700 uppercase tracking-[0.3em]">Selected Itinerary</p>
                                        <p className="text-lg font-black text-slate-950 dark:text-slate-200 leading-tight italic">
                                            "{lead.itineraryTitle || 'Custom Honeymoon Sequence'}"
                                        </p>
                                        <div className="pt-3 flex items-center gap-2 text-slate-500">
                                            <Navigation size={14} className="text-indigo-700" />
                                            <span className="text-xs font-black uppercase tracking-[0.2em]">{lead.city}, {lead.state}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-6">
                                    <div className="flex items-center gap-3 text-slate-400">
                                        <Calendar size={18} />
                                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">{formatDate(lead.createdAt)}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => handleDelete(lead._id)} className="p-4 bg-white text-red-600 rounded-2xl hover:bg-red-600 hover:text-white transition-all shadow-xl border border-slate-100 group/btn">
                                            <Trash2 size={20} />
                                        </button>
                                        <button className="p-4 bg-white text-indigo-700 rounded-2xl hover:bg-indigo-700 hover:text-white transition-all shadow-xl border border-slate-100">
                                            <ArrowUpRight size={20} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* PAGINATION */}
            <div className="flex items-center justify-between px-10 py-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none">
                <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">
                    Registry Frame: <span className="text-slate-950 dark:text-white">{currentPage}</span> <span className="mx-2 text-slate-200">/</span> {totalPages}
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
            <h3 className="text-3xl font-black text-slate-950 dark:text-white uppercase tracking-tight mb-4">The Vault is Sealed</h3>
            <p className="text-slate-600 dark:text-slate-400 font-bold uppercase tracking-widest text-sm italic">No consultation requests detected in the registry</p>
        </div>
      )}
    </motion.div>
  );
};

export default ConsultationLeads;
