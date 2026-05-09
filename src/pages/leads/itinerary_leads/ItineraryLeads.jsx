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
    Inbox,
    MapPin,
    Filter
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ITEMS_PER_PAGE = 10;

const ItineraryLeads = () => {
  const [leads, setLeads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItinerary, setSelectedItinerary] = useState("all");

  const fetchLeads = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get("/itinerary-leads/all");
      setLeads(response.data.data || []);
    } catch (err) {
      setError("Failed to synchronize itinerary leads.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleDelete = async (_id) => {
    if (!window.confirm("Permanently remove this booking request?")) return;
    try {
      await apiClient.delete(`/itinerary-leads/${_id}`);
      fetchLeads();
    } catch (err) {
      alert("Removal failed.");
    }
  };

  const uniqueItineraries = useMemo(() => {
    const titles = leads.map(l => l.itineraryTitle);
    return ["all", ...new Set(titles)];
  }, [leads]);

  const filteredLeads = useMemo(() => {
    return leads.filter(l => {
      const matchesSearch = 
        l.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        l.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.phone?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesItinerary = selectedItinerary === "all" || l.itineraryTitle === selectedItinerary;
      
      return matchesSearch && matchesItinerary;
    });
  }, [leads, searchTerm, selectedItinerary]);

  const totalPages = Math.ceil(filteredLeads.length / ITEMS_PER_PAGE);
  const currentLeads = filteredLeads.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-full mx-auto space-y-10 pb-20 px-6 text-left">
      {/* HEADER HUB */}
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 lg:p-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none text-indigo-700"><MessageSquare size={120} /></div>
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
                <h1 className="text-2xl font-black text-slate-950 dark:text-white tracking-tight flex items-center gap-4">
                    <Sparkles className="text-indigo-700" size={32} /> ITINERARY LEADS
                </h1>
                <p className="text-slate-600 dark:text-slate-400 font-bold mt-1 text-xs italic text-left">Leads generated from specific trip itineraries</p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative group w-full sm:w-64">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-700 transition-colors" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search leads..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-12 pr-6 py-3 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-indigo-600/20 focus:ring-4 focus:ring-indigo-500/10 rounded-xl text-sm font-black w-full outline-none transition-all placeholder:text-slate-400 shadow-sm"
                    />
                </div>
                <div className="relative w-full sm:w-64">
                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <select 
                        value={selectedItinerary}
                        onChange={(e) => setSelectedItinerary(e.target.value)}
                        className="pl-12 pr-6 py-3 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-indigo-600/20 rounded-xl text-sm font-black w-full outline-none transition-all shadow-sm appearance-none cursor-pointer"
                    >
                        {uniqueItineraries.map(title => (
                            <option key={title} value={title}>
                                {title === "all" ? "All Itineraries" : title}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="px-5 py-2.5 bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-indigo-500/40">
                    <CheckCircle2 size={16} /> {filteredLeads.length} LEADS
                </div>
            </div>
        </div>
      </div>

      {/* LEADS LIST */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-6">
            <Loader2 className="animate-spin text-indigo-700" size={48} strokeWidth={1.5} />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Syncing Itinerary Leads...</p>
        </div>
      ) : error ? (
        <div className="py-16 text-center bg-red-50 dark:bg-red-950/20 rounded-2xl border-2 border-red-100 dark:border-red-900/30">
            <p className="text-red-700 font-black uppercase tracking-wide text-xs">{error}</p>
        </div>
      ) : currentLeads.length > 0 ? (
        <div className="space-y-8">
            <AnimatePresence mode='popLayout'>
                {currentLeads.map((lead) => (
                    <motion.div 
                        layout key={lead._id} 
                        initial={{ opacity: 0, x: -20 }} 
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-lg shadow-slate-200/50 dark:shadow-none overflow-hidden transition-all hover:shadow-xl hover:shadow-indigo-500/10"
                    >
                        <div className="p-6">
                            <div className="flex flex-col lg:flex-row justify-between gap-8">
                                <div className="flex-1 space-y-6 text-left">
                                    <div className="flex items-center gap-4">
                                        <div className="size-12 bg-indigo-700 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-500/30">
                                            {lead.name?.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="text-left">
                                            <p className="text-[10px] font-black text-indigo-700 uppercase tracking-wide mb-0.5">Booking Inquiry</p>
                                            <h2 className="text-xl font-black text-slate-950 dark:text-white tracking-tight">{lead.name}</h2>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-6 py-4 border-y border-slate-50 dark:border-slate-800">
                                        <a href={`mailto:${lead.email}`} className="flex items-center gap-3 text-slate-600 hover:text-indigo-700 transition-colors group/link">
                                            <div className="size-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover/link:bg-indigo-700 group-hover/link:text-white transition-all shadow-sm border border-slate-100"><Mail size={14} /></div>
                                            <span className="text-xs font-black uppercase tracking-wide text-slate-950 dark:text-slate-300">{lead.email}</span>
                                        </a>
                                        <div className="flex items-center gap-3 text-slate-600">
                                            <div className="size-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-100 shadow-sm"><Phone size={14} /></div>
                                            <span className="text-xs font-black uppercase tracking-wide text-slate-950 dark:text-slate-300">{lead.phone}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-slate-500">
                                            <div className="size-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-100"><Calendar size={14} /></div>
                                            <span className="text-[10px] font-black uppercase tracking-tight">{new Date(lead.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-indigo-700">
                                            <div className="size-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center border border-indigo-100 shadow-sm"><MapPin size={14} /></div>
                                            <span className="text-xs font-black uppercase tracking-wide">{lead.city}, {lead.state}</span>
                                        </div>
                                    </div>

                                    <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 relative shadow-inner">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Sparkles size={14} className="text-indigo-700" />
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Requested Itinerary</span>
                                        </div>
                                        <p className="text-lg font-black text-slate-900 dark:text-slate-200 tracking-tight">
                                            {lead.itineraryTitle}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex lg:flex-col justify-end gap-3 shrink-0">
                                    <button onClick={() => handleDelete(lead._id)} className="flex items-center justify-center size-10 bg-white dark:bg-slate-800 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-md border border-slate-100 dark:border-slate-700">
                                        <Trash2 size={18} />
                                    </button>
                                    <button className="flex items-center justify-center size-10 bg-white dark:bg-slate-800 text-indigo-700 rounded-xl hover:bg-indigo-700 hover:text-white transition-all shadow-md border border-slate-100 dark:border-slate-700">
                                        <CheckCircle2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>

            {/* PAGINATION */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-lg shadow-slate-200/50 dark:shadow-none">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wide">
                        Archive Segment: <span className="text-slate-950 dark:text-white">{currentPage}</span> <span className="mx-2 text-slate-200">/</span> {totalPages}
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
            )}
        </div>
      ) : (
        <div className="py-32 text-center bg-white dark:bg-slate-900 rounded-3xl border-2 border-dashed border-slate-100 dark:border-slate-800">
            <Inbox className="mx-auto mb-4 text-slate-100 dark:text-slate-800" size={64} strokeWidth={1} />
            <h3 className="text-2xl font-black text-slate-950 dark:text-white uppercase tracking-tight mb-2">No New Leads</h3>
            <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide text-[10px] italic">The itinerary lead archive is currently clean</p>
        </div>
      )}
    </motion.div>
  );
};

export default ItineraryLeads;
