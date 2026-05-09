import { useEffect, useState } from "react";
import { apiClient } from "../../../stores/authStores";
import { 
    Navigation, 
    Trash2, 
    Mail, 
    Phone, 
    Calendar, 
    User, 
    MapPin, 
    Loader2, 
    Sparkles, 
    Search, 
    ArrowUpRight,
    Target,
    Users,
    Briefcase,
    DollarSign,
    Clock,
    CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const TripRequests = () => {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const loadRequests = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get("/admin/plan-your-trip");
      if (res.data.Data) setRequests(res.data.Data);
    } catch (err) {
      setError("Failed to synchronize journey vault.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Permanently archive this journey request?")) return;
    try {
      await apiClient.delete(`/admin/plan-your-trip/${id}`);
      setRequests(requests.filter((r) => r._id !== id));
    } catch (err) {
      alert("Removal failed.");
    }
  };

  const filtered = requests.filter(r => 
    r.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.to?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-full mx-auto space-y-10 pb-20 px-6 text-left">
      {/* HEADER HUB */}
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 lg:p-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none text-indigo-700"><Target size={120} /></div>
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
                <h1 className="text-2xl font-black text-slate-950 dark:text-white tracking-tight flex items-center gap-4">
                    <Briefcase className="text-indigo-700" size={32} /> TRIP ARCHIVE
                </h1>
                <p className="text-slate-600 dark:text-slate-400 font-bold mt-1 text-xs italic text-left">High-fidelity journey plans and custom travel requests</p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative group w-full sm:w-64">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-700 transition-colors" size={18} />
                    <input 
                        type="text" 
                        placeholder="Filter journeys..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-12 pr-6 py-3 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-indigo-600/20 focus:ring-4 focus:ring-indigo-500/10 rounded-xl text-sm font-black w-full outline-none transition-all placeholder:text-slate-400 shadow-sm"
                    />
                </div>
                <div className="px-5 py-2.5 bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-indigo-500/40">
                    <Sparkles size={16} /> {requests.length} TRIP REQUESTS
                </div>
            </div>
        </div>
      </div>

      {/* JOURNEY GRID */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-6">
            <Loader2 className="animate-spin text-indigo-700" size={48} strokeWidth={1.5} />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Syncing Journey Vault...</p>
        </div>
      ) : error ? (
        <div className="py-16 text-center bg-red-50 dark:bg-red-950/20 rounded-2xl border-2 border-red-100 dark:border-red-900/30">
            <p className="text-red-700 font-black uppercase tracking-wide text-xs">{error}</p>
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-10">
            <AnimatePresence mode='popLayout'>
                {filtered.map((req) => (
                    <motion.div 
                        layout key={req._id} 
                        initial={{ opacity: 0, scale: 0.98 }} 
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-lg shadow-slate-200/50 dark:shadow-none overflow-hidden transition-all hover:shadow-xl hover:shadow-indigo-500/10"
                    >
                        <div className="p-8">
                            <div className="flex flex-col xl:flex-row gap-8 text-left">
                                {/* LEFT: IDENTITY */}
                                <div className="xl:w-1/3 space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="size-14 bg-indigo-700 rounded-xl flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-indigo-500/30">
                                            {req.name?.charAt(0).toUpperCase()}
                                        </div>
                                         <div className="text-left">
                                            <p className="text-[10px] font-black text-indigo-700 uppercase tracking-wide mb-1">Lead Identity</p>
                                            <h2 className="text-xl font-black text-slate-950 dark:text-white tracking-tight">{req.name}</h2>
                                        </div>
                                    </div>
                                     <div className="space-y-4">
                                        <a href={`mailto:${req.email}`} className="flex items-center gap-3 text-slate-600 hover:text-indigo-700 transition-colors group/link text-left">
                                            <div className="size-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover/link:bg-indigo-700 group-hover/link:text-white transition-all border border-slate-100 shadow-sm"><Mail size={14} /></div>
                                            <span className="text-xs font-black uppercase tracking-wide text-slate-950 dark:text-slate-300">{req.email}</span>
                                        </a>
                                        <div className="flex items-center gap-3 text-slate-600 text-left">
                                            <div className="size-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-100 shadow-sm"><Phone size={14} /></div>
                                            <span className="text-xs font-black uppercase tracking-wide text-slate-950 dark:text-slate-300">{req.phone_no}</span>
                                        </div>
                                    </div>
                                     <div className="pt-6 border-t border-slate-100 dark:border-slate-800 text-left">
                                        <p className="text-[10px] font-black text-slate-700 dark:text-slate-400 uppercase tracking-wide mb-4">Engagement Frame</p>
                                        <div className="flex items-center gap-4 p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-800 shadow-inner">
                                            <div className="size-10 bg-white dark:bg-slate-800 rounded-lg flex items-center justify-center text-emerald-700 shadow-sm border border-emerald-50"><CheckCircle2 size={20} /></div>
                                            <div className="text-left">
                                                <p className="text-[8px] font-black text-emerald-700 uppercase tracking-wide">Lifecycle Status</p>
                                                <p className="text-sm font-black text-slate-950 dark:text-white uppercase tracking-wider">{req.consultation ? "Priority Inquiry" : "Active Prospect"}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* CENTER: SPECS */}
                                <div className="xl:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                                    <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4 shadow-inner">
                                        <div className="flex items-center justify-between">
                                            <p className="text-[10px] font-black text-slate-700 dark:text-slate-400 uppercase tracking-wide">Route Blueprint</p>
                                            <Navigation size={16} className="text-indigo-700" />
                                        </div>
                                         <div className="space-y-4">
                                            <div className="flex items-center gap-4">
                                                <div className="size-8 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-[10px] font-black border-2 border-slate-200 dark:border-slate-700 shadow-sm">A</div>
                                                <span className="text-sm font-black text-slate-950 dark:text-white uppercase tracking-wide">{req.from || "Unspecified Origin"}</span>
                                            </div>
                                            <div className="h-6 w-[2px] bg-slate-200 dark:bg-slate-700 ml-4 border-l-2 border-dashed border-slate-400 dark:border-slate-500" />
                                            <div className="flex items-center gap-4">
                                                <div className="size-8 rounded-full bg-indigo-700 flex items-center justify-center text-[10px] font-black text-white shadow-lg shadow-indigo-500/30">B</div>
                                                <span className="text-base font-black text-indigo-700 dark:text-indigo-400 uppercase tracking-wide">{req.to || "Dream Destination"}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4 shadow-inner">
                                        <div className="flex items-center justify-between">
                                            <p className="text-[10px] font-black text-slate-700 dark:text-slate-400 uppercase tracking-wide">Timing & Metrics</p>
                                            <Clock size={16} className="text-indigo-700" />
                                        </div>
                                         <div className="grid grid-cols-2 gap-4 text-left">
                                            <div className="space-y-1">
                                                <p className="text-[8px] font-black text-indigo-700 uppercase tracking-wide">Journey Duration</p>
                                                <p className="text-sm font-black text-slate-950 dark:text-white uppercase tracking-wider">{req.NumberodDays} Active Days</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[8px] font-black text-indigo-700 uppercase tracking-wide">Unit Capacity</p>
                                                <p className="text-sm font-black text-slate-950 dark:text-white uppercase tracking-wider">{req.adults} Ad / {req.kids} Ch</p>
                                            </div>
                                            <div className="col-span-2 space-y-1">
                                                <p className="text-[8px] font-black text-indigo-700 uppercase tracking-wide">Timeline Sequence</p>
                                                <p className="text-sm font-black text-slate-950 dark:text-white uppercase tracking-wide">{req.fromDate} <span className="text-indigo-700 mx-2">→</span> {req.toDate}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6 bg-indigo-50 dark:bg-indigo-900/10 rounded-[2rem] border border-indigo-100 dark:border-indigo-800/40 col-span-1 md:col-span-2 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
                                        <div className="flex items-center gap-6 text-left">
                                             <div className="size-16 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-indigo-700 shadow-xl shadow-indigo-500/10 border-2 border-indigo-50 dark:border-indigo-900/40">
                                                <DollarSign size={28} strokeWidth={2.5} />
                                            </div>
                                            <div className="text-left">
                                                <p className="text-[10px] font-black text-indigo-700 uppercase tracking-wide mb-1">Target Budget Valuation</p>
                                                <h3 className="text-4xl font-black text-slate-950 dark:text-white tracking-tighter">₹{req.budget}</h3>
                                            </div>
                                        </div>
                                         <div className="flex gap-4 w-full md:w-auto">
                                            <button onClick={() => handleDelete(req._id)} className="flex-1 md:flex-none p-3.5 bg-white text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-md border border-slate-100">
                                                <Trash2 size={18} />
                                            </button>
                                            <button className="flex-[2] md:flex-none px-6 py-3 bg-indigo-700 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-800 transition-all shadow-lg shadow-indigo-500/40 flex items-center justify-center gap-3">
                                                Sync Logic <ArrowUpRight size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
      ) : (
        <div className="py-32 text-center bg-white dark:bg-slate-900 rounded-3xl border-2 border-dashed border-slate-100 dark:border-slate-800">
            <Briefcase className="mx-auto mb-4 text-slate-100 dark:text-slate-800" size={64} strokeWidth={1} />
            <h3 className="text-2xl font-black text-slate-950 dark:text-white uppercase tracking-tight mb-2">No Journeys Detected</h3>
            <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide text-[10px] italic">The trip archive is currently clear of active requests</p>
        </div>
      )}
    </motion.div>
  );
};

export default TripRequests;
