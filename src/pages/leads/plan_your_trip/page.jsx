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
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-[1400px] mx-auto space-y-10 pb-20 px-6">
      {/* HEADER HUB */}
      <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-12 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none text-indigo-600"><Target size={200} /></div>
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div>
                <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-4">
                    <Briefcase className="text-indigo-600" size={36} /> TRIP ARCHIVE
                </h1>
                <p className="text-slate-500 font-medium mt-2 text-lg italic">High-fidelity journey plans and custom travel requests</p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                    <input 
                        type="text" 
                        placeholder="Filter journeys..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-transparent focus:border-indigo-100 dark:focus:border-indigo-900/30 rounded-2xl text-sm font-bold w-full sm:w-64 outline-none transition-all shadow-sm"
                    />
                </div>
                <div className="px-6 py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-2xl shadow-indigo-500/30">
                    <Sparkles size={16} /> {requests.length} Requests
                </div>
            </div>
        </div>
      </div>

      {/* JOURNEY GRID */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-40 gap-4">
            <Loader2 className="animate-spin text-indigo-600" size={48} strokeWidth={1} />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Syncing Journey Vault</p>
        </div>
      ) : error ? (
        <div className="py-20 text-center bg-red-50 dark:bg-red-950/20 rounded-[3rem] border border-red-100 dark:border-red-900/30 text-red-500 font-bold uppercase tracking-widest text-xs">
            {error}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-8">
            <AnimatePresence mode='popLayout'>
                {filtered.map((req) => (
                    <motion.div 
                        layout key={req._id} 
                        initial={{ opacity: 0, scale: 0.98 }} 
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        className="group bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden transition-all hover:shadow-2xl"
                    >
                        <div className="p-10">
                            <div className="flex flex-col xl:flex-row gap-10">
                                {/* LEFT: IDENTITY */}
                                <div className="xl:w-1/3 space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="size-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-indigo-500/20">
                                            {req.name?.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] mb-1">Travel Prospect</p>
                                            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{req.name}</h2>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <a href={`mailto:${req.email}`} className="flex items-center gap-3 text-slate-500 hover:text-indigo-600 transition-colors group/link">
                                            <div className="size-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover/link:bg-indigo-600 group-hover/link:text-white transition-all"><Mail size={14} /></div>
                                            <span className="text-xs font-bold">{req.email}</span>
                                        </a>
                                        <div className="flex items-center gap-3 text-slate-500">
                                            <div className="size-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center"><Phone size={14} /></div>
                                            <span className="text-xs font-bold">{req.phone_no}</span>
                                        </div>
                                    </div>
                                    <div className="pt-6 border-t border-slate-50 dark:border-slate-800">
                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-4">Engagement Metrics</p>
                                        <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-800/30">
                                            <div className="size-10 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center text-emerald-600 shadow-sm"><CheckCircle2 size={20} /></div>
                                            <div>
                                                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Consultation Status</p>
                                                <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{req.consultation ? "Priority Request" : "Standard Archive"}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* CENTER: SPECS */}
                                <div className="xl:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border border-slate-100 dark:border-slate-800 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Route Analysis</p>
                                            <Navigation size={16} className="text-indigo-600" />
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="size-8 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-[10px] font-black border border-slate-100 dark:border-slate-700 shadow-sm">A</div>
                                                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{req.from || "Unspecified Origin"}</span>
                                            </div>
                                            <div className="h-6 w-[2px] bg-slate-100 dark:bg-slate-700 ml-4 border-l border-dashed border-slate-300 dark:border-slate-500" />
                                            <div className="flex items-center gap-3">
                                                <div className="size-8 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-black text-white shadow-lg shadow-indigo-500/20">B</div>
                                                <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{req.to || "Dream Destination"}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border border-slate-100 dark:border-slate-800 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Timing & Capacity</p>
                                            <Clock size={16} className="text-indigo-600" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Duration</p>
                                                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{req.NumberodDays} Days</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Travelers</p>
                                                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{req.adults} Adults / {req.kids} Kids</p>
                                            </div>
                                            <div className="col-span-2 space-y-1">
                                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Timeline</p>
                                                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{req.fromDate} → {req.toDate}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-[2rem] border border-indigo-100 dark:border-indigo-800/40 col-span-1 md:col-span-2 flex flex-col md:flex-row items-center justify-between gap-6">
                                        <div className="flex items-center gap-6">
                                            <div className="size-16 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-indigo-600 shadow-xl shadow-indigo-500/10 border border-indigo-50 dark:border-indigo-900/40">
                                                <DollarSign size={32} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Target Budget Valuation</p>
                                                <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">₹{req.budget}</h3>
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <button onClick={() => handleDelete(req._id)} className="p-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm">
                                                <Trash2 size={24} />
                                            </button>
                                            <button className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20 flex items-center gap-2">
                                                Process <ArrowUpRight size={16} />
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
        <div className="py-40 text-center bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 border-dashed">
            <Briefcase className="mx-auto mb-4 text-slate-100" size={80} strokeWidth={1} />
            <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-xs">The trip archive is currently clear</p>
        </div>
      )}
    </motion.div>
  );
};

export default TripRequests;
