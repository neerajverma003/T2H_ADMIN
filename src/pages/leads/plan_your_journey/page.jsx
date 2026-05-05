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
    Search,
    Sparkles,
    CheckCircle2,
    XCircle,
    ArrowUpRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const PlanYourJourney = () => {
  const [journeys, setJourneys] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const loadJourneys = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get("/admin/plan-your-journey");
      if (res.data.Data) setJourneys(res.data.Data);
    } catch (err) {
      setError("Failed to synchronize lead data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadJourneys();
  }, []);

  const handleDelete = async (journeyId) => {
    if (!window.confirm("Permanently archive this honeymoon request?")) return;
    try {
      await apiClient.delete(`/admin/plan-your-journey/${journeyId}`);
      setJourneys((current) => current.filter((j) => j._id !== journeyId));
    } catch (err) {
      alert("Archive failed.");
    }
  };

  const filtered = journeys.filter(j => 
    j.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    j.destination?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-[1400px] mx-auto space-y-10 pb-20 px-6">
      {/* HEADER HUB */}
      <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-12 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none text-indigo-600"><Navigation size={200} /></div>
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div>
                <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-4">
                    <Navigation className="text-indigo-600" size={36} /> JOURNEY REQUESTS
                </h1>
                <p className="text-slate-500 font-medium mt-2 text-lg italic">Strategic planning leads for custom honeymoons</p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                    <input 
                        type="text" 
                        placeholder="Find requests..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-transparent focus:border-indigo-100 dark:focus:border-indigo-900/30 rounded-2xl text-sm font-bold w-full sm:w-64 outline-none transition-all shadow-sm"
                    />
                </div>
                <div className="px-6 py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-indigo-500/30 flex items-center gap-2">
                    <Sparkles size={16} /> {journeys.length} Active Leads
                </div>
            </div>
        </div>
      </div>

      {/* LEAD GRID */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-40 gap-4">
            <Loader2 className="animate-spin text-indigo-600" size={48} strokeWidth={1} />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Synchronizing Lead Vault</p>
        </div>
      ) : error ? (
        <div className="py-20 text-center bg-red-50 dark:bg-red-950/20 rounded-[3rem] border border-red-100 dark:border-red-900/30">
            <XCircle className="mx-auto mb-4 text-red-500" size={48} />
            <p className="text-red-500 font-bold uppercase tracking-widest text-xs">{error}</p>
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode='popLayout'>
                {filtered.map((journey) => (
                    <motion.div 
                        layout key={journey._id} 
                        initial={{ opacity: 0, scale: 0.95 }} 
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="group bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden transition-all hover:shadow-2xl hover:shadow-indigo-500/10"
                    >
                        <div className="p-8 space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="size-14 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-xl shadow-sm">
                                    {journey.name?.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                    <CheckCircle2 size={12} /> New Lead
                                </div>
                            </div>

                            <div>
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{journey.name}</h2>
                                <div className="flex flex-col gap-2 mt-4">
                                    <a href={`mailto:${journey.email}`} className="flex items-center gap-3 text-slate-500 hover:text-indigo-600 transition-colors group/link">
                                        <div className="size-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover/link:bg-indigo-600 group-hover/link:text-white transition-all"><Mail size={14} /></div>
                                        <span className="text-xs font-bold">{journey.email}</span>
                                    </a>
                                    <div className="flex items-center gap-3 text-slate-500">
                                        <div className="size-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center"><Phone size={14} /></div>
                                        <span className="text-xs font-bold">{journey.phone}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-50 dark:border-slate-800">
                                <div className="flex items-center gap-2 mb-3">
                                    <MapPin className="text-indigo-600" size={14} />
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">DREAM DESTINATION</p>
                                </div>
                                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200 leading-relaxed italic">
                                        "{journey.destination}"
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4">
                                <div className="flex items-center gap-2 text-slate-300">
                                    <Calendar size={14} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">
                                        {journey.createdAt ? new Date(journey.createdAt).toLocaleDateString() : 'Pending'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => handleDelete(journey._id)} className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm group/btn">
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
      ) : (
        <div className="py-40 text-center bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 border-dashed">
            <Sparkles className="mx-auto mb-4 text-slate-100" size={80} strokeWidth={1} />
            <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-xs">No active journey requests in vault</p>
        </div>
      )}
    </motion.div>
  );
};

export default PlanYourJourney;
