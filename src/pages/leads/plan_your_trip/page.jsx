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
      <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-12 border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none text-indigo-700"><Target size={240} /></div>
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-10">
            <div>
                <h1 className="text-4xl font-black text-slate-950 dark:text-white tracking-tight flex items-center gap-5">
                    <Briefcase className="text-indigo-700" size={44} /> TRIP ARCHIVE
                </h1>
                <p className="text-slate-600 dark:text-slate-400 font-bold mt-2 text-xl italic text-left">High-fidelity journey plans and custom travel requests</p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative group w-full sm:w-80">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-700 transition-colors" size={24} />
                    <input 
                        type="text" 
                        placeholder="Filter journeys..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-16 pr-8 py-5 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-indigo-600/20 focus:ring-4 focus:ring-indigo-500/10 rounded-[1.5rem] text-lg font-black w-full outline-none transition-all placeholder:text-slate-400 shadow-sm"
                    />
                </div>
                <div className="px-8 py-5 bg-indigo-700 text-white rounded-[1.5rem] text-sm font-black uppercase tracking-[0.2em] flex items-center gap-3 shadow-2xl shadow-indigo-500/40">
                    <Sparkles size={20} /> {requests.length} TRIP REQUESTS
                </div>
            </div>
        </div>
      </div>

      {/* JOURNEY GRID */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-48 gap-8">
            <Loader2 className="animate-spin text-indigo-700" size={64} strokeWidth={1.5} />
            <p className="text-xs font-black uppercase tracking-[0.4em] text-slate-400">Syncing Journey Vault...</p>
        </div>
      ) : error ? (
        <div className="py-24 text-center bg-red-50 dark:bg-red-950/20 rounded-[3rem] border-2 border-red-100 dark:border-red-900/30">
            <p className="text-red-700 font-black uppercase tracking-[0.3em] text-sm">{error}</p>
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
                        className="group bg-white dark:bg-slate-900 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden transition-all hover:shadow-2xl hover:shadow-indigo-500/15"
                    >
                        <div className="p-12">
                            <div className="flex flex-col xl:flex-row gap-12 text-left">
                                {/* LEFT: IDENTITY */}
                                <div className="xl:w-1/3 space-y-8">
                                    <div className="flex items-center gap-5">
                                        <div className="size-20 bg-indigo-700 rounded-2xl flex items-center justify-center text-white font-black text-3xl shadow-xl shadow-indigo-500/30">
                                            {req.name?.charAt(0).toUpperCase()}
                                        </div>
                                         <div className="text-left">
                                            <p className="text-xs font-black text-indigo-700 uppercase tracking-[0.3em] mb-2">Lead Identity</p>
                                            <h2 className="text-3xl font-black text-slate-950 dark:text-white tracking-tight">{req.name}</h2>
                                        </div>
                                    </div>
                                     <div className="space-y-5">
                                        <a href={`mailto:${req.email}`} className="flex items-center gap-4 text-slate-950 dark:text-slate-300 hover:text-indigo-700 transition-colors group/link text-left">
                                            <div className="size-12 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover/link:bg-indigo-700 group-hover/link:text-white transition-all border border-slate-100 shadow-sm"><Mail size={20} /></div>
                                            <span className="text-sm font-black uppercase tracking-[0.1em]">{req.email}</span>
                                        </a>
                                        <div className="flex items-center gap-4 text-slate-950 dark:text-slate-300 text-left">
                                            <div className="size-12 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-100 shadow-sm"><Phone size={20} /></div>
                                            <span className="text-sm font-black uppercase tracking-[0.1em]">{req.phone_no}</span>
                                        </div>
                                    </div>
                                     <div className="pt-10 border-t-2 border-slate-100 dark:border-slate-800 text-left">
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-6">Engagement Frame</p>
                                        <div className="flex items-center gap-5 p-6 bg-emerald-50 dark:bg-emerald-900/20 rounded-[2rem] border-2 border-emerald-100 dark:border-emerald-800 shadow-inner">
                                            <div className="size-14 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center text-emerald-700 shadow-sm border border-emerald-50"><CheckCircle2 size={32} /></div>
                                            <div className="text-left">
                                                <p className="text-[10px] font-black text-emerald-700 uppercase tracking-[0.3em]">Lifecycle Status</p>
                                                <p className="text-base font-black text-slate-950 dark:text-white uppercase tracking-widest">{req.consultation ? "Priority Inquiry" : "Active Prospect"}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* CENTER: SPECS */}
                                <div className="xl:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                                    <div className="p-8 bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-800 space-y-6 shadow-inner">
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Route Blueprint</p>
                                            <Navigation size={20} className="text-indigo-700" />
                                        </div>
                                         <div className="space-y-8">
                                            <div className="flex items-center gap-5">
                                                <div className="size-12 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-sm font-black border-4 border-slate-200 dark:border-slate-700 shadow-sm">A</div>
                                                <span className="text-xl font-black text-slate-950 dark:text-white uppercase tracking-[0.1em]">{req.from || "Unspecified Origin"}</span>
                                            </div>
                                            <div className="h-10 w-[4px] bg-slate-200 dark:bg-slate-700 ml-6 border-l-4 border-dashed border-slate-400 dark:border-slate-500" />
                                            <div className="flex items-center gap-5">
                                                <div className="size-12 rounded-full bg-indigo-700 flex items-center justify-center text-sm font-black text-white shadow-xl shadow-indigo-500/30">B</div>
                                                <span className="text-2xl font-black text-indigo-700 dark:text-indigo-400 uppercase tracking-[0.15em]">{req.to || "Dream Destination"}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-8 bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-800 space-y-6 shadow-inner">
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Timing & Metrics</p>
                                            <Clock size={20} className="text-indigo-700" />
                                        </div>
                                         <div className="grid grid-cols-2 gap-8 text-left">
                                            <div className="space-y-3">
                                                <p className="text-[10px] font-black text-indigo-700 uppercase tracking-[0.3em]">Journey Duration</p>
                                                <p className="text-xl font-black text-slate-950 dark:text-white uppercase tracking-widest">{req.NumberodDays} Active Days</p>
                                            </div>
                                            <div className="space-y-3">
                                                <p className="text-[10px] font-black text-indigo-700 uppercase tracking-[0.3em]">Unit Capacity</p>
                                                <p className="text-xl font-black text-slate-950 dark:text-white uppercase tracking-widest">{req.adults} Ad / {req.kids} Ch</p>
                                            </div>
                                            <div className="col-span-2 space-y-3">
                                                <p className="text-[10px] font-black text-indigo-700 uppercase tracking-[0.3em]">Timeline Sequence</p>
                                                <p className="text-xl font-black text-slate-950 dark:text-white uppercase tracking-[0.1em]">{req.fromDate} <span className="text-indigo-700 mx-2">→</span> {req.toDate}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-8 bg-indigo-50 dark:bg-indigo-900/20 rounded-[3rem] border-2 border-indigo-100 dark:border-indigo-800/40 col-span-1 md:col-span-2 flex flex-col md:flex-row items-center justify-between gap-10 shadow-lg">
                                        <div className="flex items-center gap-8 text-left">
                                             <div className="size-24 bg-white dark:bg-slate-800 rounded-[2rem] flex items-center justify-center text-indigo-700 shadow-2xl shadow-indigo-500/20 border-4 border-indigo-50 dark:border-indigo-900/40">
                                                <DollarSign size={48} strokeWidth={2.5} />
                                            </div>
                                            <div className="text-left">
                                                <p className="text-sm font-black text-indigo-700 uppercase tracking-[0.3em] mb-2">Target Budget Valuation</p>
                                                <h3 className="text-6xl font-black text-slate-950 dark:text-white tracking-tighter">₹{req.budget}</h3>
                                            </div>
                                        </div>
                                         <div className="flex gap-5 w-full md:w-auto">
                                            <button onClick={() => handleDelete(req._id)} className="flex-1 md:flex-none p-6 bg-white text-red-600 rounded-[2rem] hover:bg-red-600 hover:text-white transition-all shadow-xl border border-slate-100">
                                                <Trash2 size={28} />
                                            </button>
                                            <button className="flex-[2] md:flex-none px-12 py-6 bg-indigo-700 text-white rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] hover:bg-indigo-800 transition-all shadow-2xl shadow-indigo-500/40 flex items-center justify-center gap-4">
                                                Sync Logic <ArrowUpRight size={24} />
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
        <div className="py-48 text-center bg-white dark:bg-slate-900 rounded-[3.5rem] border-4 border-dashed border-slate-100 dark:border-slate-800">
            <Briefcase className="mx-auto mb-6 text-slate-100 dark:text-slate-800" size={100} strokeWidth={1} />
            <h3 className="text-3xl font-black text-slate-950 dark:text-white uppercase tracking-tight mb-4">No Journeys Detected</h3>
            <p className="text-slate-600 dark:text-slate-400 font-bold uppercase tracking-widest text-sm italic">The trip archive is currently clear of active requests</p>
        </div>
      )}
    </motion.div>
  );
};

export default TripRequests;
