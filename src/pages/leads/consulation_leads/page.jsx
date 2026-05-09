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
    Navigation,
    CheckCircle2
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
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 lg:p-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none text-indigo-700"><Target size={120} /></div>
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
                <h1 className="text-2xl font-black text-slate-950 dark:text-white tracking-tight flex items-center gap-4">
                    <MessageSquare className="text-indigo-700" size={32} /> CONSULTATION HUB
                </h1>
                <p className="text-slate-600 dark:text-slate-400 font-bold mt-1 text-xs italic text-left">High-intent consultation requests from destination seekers</p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative group w-full sm:w-64">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-700 transition-colors" size={18} />
                    <input 
                        type="text" 
                        placeholder="Filter consultants..." 
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        className="pl-12 pr-6 py-3 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-indigo-600/20 focus:ring-4 focus:ring-indigo-500/10 rounded-xl text-sm font-black w-full outline-none transition-all placeholder:text-slate-400 shadow-sm"
                    />
                </div>
                <div className="px-5 py-2.5 bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-indigo-500/40">
                    <Sparkles size={16} /> {totalLeads} PORTAL LEADS
                </div>
            </div>
        </div>
      </div>

      {/* LEAD GRID */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-6">
            <Loader2 className="animate-spin text-indigo-700" size={48} strokeWidth={1.5} />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Syncing Consultation Archive...</p>
        </div>
      ) : error ? (
        <div className="py-16 text-center bg-red-50 dark:bg-red-950/20 rounded-2xl border-2 border-red-100 dark:border-red-900/30">
            <p className="text-red-700 font-black uppercase tracking-wide text-xs">{error}</p>
        </div>
      ) : paginatedLeads.length > 0 ? (
        <>
        <div className="space-y-10">
            {/* LEAD LIST */}
      <div className="grid grid-cols-1 gap-10">
        <AnimatePresence mode='popLayout'>
            {paginatedLeads.map((lead) => (
            <motion.div 
              layout 
              key={lead._id} 
              initial={{ opacity: 0, x: -20 }} 
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-lg shadow-slate-200/50 dark:shadow-none overflow-hidden transition-all hover:shadow-xl hover:shadow-indigo-500/10"
            >
              <div className="p-6">
                <div className="flex flex-col xl:flex-row xl:items-center gap-8">
                   {/* IDENTITY SECTION */}
                   <div className="flex items-center gap-6 shrink-0">
                      <div className="size-14 bg-indigo-700 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-500/30">
                        {lead.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h2 className="text-xl font-black text-slate-950 dark:text-white tracking-tight">{lead.name}</h2>
                        <div className="flex items-center gap-2 mt-1 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-md text-[8px] font-black uppercase tracking-wide border border-emerald-100 w-fit">
                           <CheckCircle2 size={12} /> VIP Consultation
                        </div>
                      </div>
                   </div>

                   {/* DATA STRIP */}
                   <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 py-6 xl:py-0 border-y xl:border-y-0 xl:border-x border-slate-100 dark:border-slate-800 xl:px-8">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-400 text-xs font-black uppercase tracking-wide">
                           <Mail size={14} className="text-indigo-600" /> CONTACT EMAIL
                        </div>
                        <a href={`mailto:${lead.email}`} className="text-sm font-black text-slate-950 dark:text-slate-300 hover:text-indigo-700 transition-colors block truncate">{lead.email}</a>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-400 text-xs font-black uppercase tracking-wide">
                           <Phone size={14} className="text-indigo-600" /> DIRECT LINE
                        </div>
                        <p className="text-sm font-black text-slate-950 dark:text-slate-300">{lead.phone}</p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-400 text-xs font-black uppercase tracking-wide">
                           <MapPin size={14} className="text-indigo-600" /> DESTINATION TARGET
                        </div>
                        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                           <p className="text-xs font-black text-slate-950 dark:text-slate-200 truncate">{lead.itineraryTitle || 'Custom Itinerary'}</p>
                        </div>
                      </div>
                   </div>

                   {/* ACTION HUB */}
                   <div className="flex flex-row xl:flex-col items-center justify-between xl:justify-center gap-4 shrink-0">
                      <div className="flex xl:flex-col items-center gap-3">
                        <button onClick={() => handleDelete(lead._id)} className="size-10 flex items-center justify-center bg-white dark:bg-slate-800 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-md border border-slate-100 dark:border-slate-700 group/btn">
                           <Trash2 size={18} />
                        </button>
                        <button className="size-10 flex items-center justify-center bg-white dark:bg-slate-800 text-indigo-700 rounded-xl hover:bg-indigo-700 hover:text-white transition-all shadow-md border border-slate-100 dark:border-slate-700">
                           <ArrowUpRight size={18} />
                        </button>
                      </div>
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-tight xl:mt-2">
                        <Calendar size={12} /> {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : 'N/A'}
                      </div>
                   </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>      </div>

            {/* PAGINATION */}
            <div className="flex items-center justify-between px-6 py-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-lg shadow-slate-200/50 dark:shadow-none">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wide">
                    Registry Frame: <span className="text-slate-950 dark:text-white">{currentPage}</span> <span className="mx-2 text-slate-200">/</span> {totalPages}
                </p>
                <div className="flex gap-3">
                    <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-950 dark:text-white border border-transparent hover:border-indigo-700/20 disabled:opacity-30 transition-all">
                        <ChevronLeft size={18} strokeWidth={3} />
                    </button>
                    <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-950 dark:text-white border border-transparent hover:border-indigo-700/20 disabled:opacity-30 transition-all">
                        <ChevronRight size={18} strokeWidth={3} />
                    </button>
                </div>
            </div>
        </>
      ) : (
        <div className="py-32 text-center bg-white dark:bg-slate-900 rounded-3xl border-2 border-dashed border-slate-100 dark:border-slate-800">
            <Inbox className="mx-auto mb-4 text-slate-100 dark:text-slate-800" size={64} strokeWidth={1} />
            <h3 className="text-2xl font-black text-slate-950 dark:text-white uppercase tracking-tight mb-2">The Vault is Sealed</h3>
            <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide text-[10px] italic">No consultation requests detected in the registry</p>
        </div>
      )}
    </motion.div>
  );
};

export default ConsultationLeads;
