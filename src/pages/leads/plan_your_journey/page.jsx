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
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

const STATUS_STYLES = {
  new: 'bg-indigo-600 text-white border-transparent hover:bg-indigo-700 shadow-lg shadow-indigo-500/30',
  in_progress: 'bg-amber-500 text-white border-transparent hover:bg-amber-600 shadow-lg shadow-amber-500/30',
  proposal_sent: 'bg-purple-600 text-white border-transparent hover:bg-purple-700 shadow-lg shadow-purple-500/30',
  booked: 'bg-emerald-500 text-white border-transparent hover:bg-emerald-600 shadow-lg shadow-emerald-500/30'
};

const PlanYourJourney = () => {
  const [journeys, setJourneys] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [openDropdownId, setOpenDropdownId] = useState(null);

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
      const response = await apiClient.delete(`/admin/plan-your-journey/${journeyId}`);
      if (response.data.success) {
        setJourneys((current) => current.filter((j) => j._id !== journeyId));
        toast.success("Journey archived");
      }
    } catch (err) {
      toast.error("Archive failed.");
    }
  };

  const handleStatusChange = async (leadId, newStatus) => {
    const previousJourneys = [...journeys];
    setJourneys(journeys.map(j => 
      j._id === leadId ? { ...j, status: newStatus } : j
    ));

    try {
      const response = await apiClient.put(`/admin/plan-your-journey/${leadId}/status`, { status: newStatus });
      if (response.data.success) {
        toast.success(`Status updated to ${newStatus.replace('_', ' ').toUpperCase()}`);
      } else {
        throw new Error("Update failed");
      }
    } catch (err) {
      setJourneys(previousJourneys);
      toast.error(err.response?.data?.message || "Failed to update status");
    }
  };

  const filtered = journeys.filter(j => 
    j.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    j.destination?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-full mx-auto space-y-10 pb-20 px-6 text-left">
      {/* HEADER HUB */}
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 lg:p-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none text-indigo-700"><Navigation size={120} /></div>
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
                <h1 className="text-2xl font-black text-slate-950 dark:text-white tracking-tight flex items-center gap-4">
                    <Navigation className="text-indigo-700" size={32} /> JOURNEY REQUESTS
                </h1>
                <p className="text-slate-600 dark:text-slate-400 font-bold mt-1 text-xs italic text-left">Strategic planning leads for custom honeymoons</p>
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
                    <Sparkles size={16} /> {journeys.length} ACTIVE LEADS
                </div>
            </div>
        </div>
      </div>

      {/* LEAD GRID */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-6">
            <Loader2 className="animate-spin text-indigo-700" size={48} strokeWidth={1.5} />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Syncing Journey Archive...</p>
        </div>
      ) : error ? (
        <div className="py-16 text-center bg-red-50 dark:bg-red-950/20 rounded-2xl border-2 border-red-100 dark:border-red-900/30">
            <XCircle className="mx-auto mb-4 text-red-700" size={48} strokeWidth={1} />
            <p className="text-red-700 font-black uppercase tracking-wide text-xs">{error}</p>
        </div>
      ) : filtered.length > 0 ? (
        <>
        {/* LEAD LIST */}
        <div className="grid grid-cols-1 gap-10">
        <AnimatePresence mode='popLayout'>
          {filtered.map((journey) => (
            <motion.div 
              layout 
              key={journey._id} 
              initial={{ opacity: 0, x: -20 }} 
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className={`group relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-lg shadow-slate-200/50 dark:shadow-none transition-all hover:shadow-xl hover:shadow-indigo-500/10 ${openDropdownId === journey._id ? 'z-50' : 'z-10'}`}
            >
              <div className="p-6">
                <div className="flex flex-col xl:flex-row xl:items-center gap-8">
                   {/* IDENTITY SECTION */}
                   <div className="flex items-center gap-6 shrink-0">
                      <div className="size-14 bg-indigo-700 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-500/30">
                        {journey.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h2 className="text-xl font-black text-slate-950 dark:text-white tracking-tight">{journey.name}</h2>
                        <div className="flex items-center gap-2 mt-1 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-md text-[8px] font-black uppercase tracking-wide border border-emerald-100 w-fit">
                           <CheckCircle2 size={12} /> Qualified Journey Lead
                        </div>
                      </div>
                   </div>

                   {/* DATA STRIP */}
                   <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 py-6 xl:py-0 border-y xl:border-y-0 xl:border-x border-slate-100 dark:border-slate-800 xl:px-8">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-400 text-xs font-black uppercase tracking-wide">
                           <Mail size={14} className="text-indigo-600" /> CONTACT EMAIL
                        </div>
                        <a href={`mailto:${journey.email}`} className="text-sm font-black text-slate-950 dark:text-slate-300 hover:text-indigo-700 transition-colors block truncate">{journey.email}</a>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-400 text-xs font-black uppercase tracking-wide">
                           <Phone size={14} className="text-indigo-600" /> DIRECT LINE
                        </div>
                        <p className="text-sm font-black text-slate-950 dark:text-slate-300">{journey.phone}</p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-400 text-xs font-black uppercase tracking-wide">
                           <MapPin size={14} className="text-indigo-600" /> DREAM DESTINATION
                        </div>
                        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                           <p className="text-xs font-black text-slate-950 dark:text-slate-200 truncate">{journey.destination}</p>
                        </div>
                      </div>
                   </div>

                   {/* ACTION HUB */}
                   <div className="flex flex-col xl:flex-col items-center justify-center gap-4 shrink-0 min-w-[150px]">
                      <div className="relative w-full">
                          <button 
                              onClick={() => setOpenDropdownId(openDropdownId === journey._id ? null : journey._id)}
                              className={`flex items-center justify-between w-full font-black text-[10px] uppercase tracking-widest px-4 py-3 rounded-xl border-2 transition-all shadow-sm text-center ${STATUS_STYLES[journey.status || 'new']}`}
                          >
                              <span className="mx-auto flex items-center gap-2">
                                  {(journey.status === 'new' || !journey.status) && "🆕 NEW"}
                                  {journey.status === 'in_progress' && "⏳ IN PROGRESS"}
                                  {journey.status === 'proposal_sent' && "📨 PROPOSAL"}
                                  {journey.status === 'booked' && "✅ BOOKED"}
                              </span>
                          </button>

                          <AnimatePresence>
                              {openDropdownId === journey._id && (
                                  <>
                                      <div 
                                          className="fixed inset-0 z-40" 
                                          onClick={() => setOpenDropdownId(null)}
                                      />
                                      <motion.div 
                                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                          animate={{ opacity: 1, y: 0, scale: 1 }}
                                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                          transition={{ duration: 0.15 }}
                                          className="absolute top-full right-0 mt-2 w-[180px] bg-white dark:bg-slate-900 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] border border-slate-200 dark:border-slate-800 z-50 overflow-hidden py-2"
                                      >
                                          {['new', 'in_progress', 'proposal_sent', 'booked'].map((status) => (
                                              <button
                                                  key={status}
                                                  onClick={() => {
                                                      handleStatusChange(journey._id, status);
                                                      setOpenDropdownId(null);
                                                  }}
                                                  className={`w-full text-left px-5 py-3 text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 ${(journey.status || 'new') === status ? 'bg-slate-50 dark:bg-slate-800/50 text-indigo-700 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-300'}`}
                                              >
                                                  {status === 'new' && "🆕 NEW"}
                                                  {status === 'in_progress' && "⏳ IN PROGRESS"}
                                                  {status === 'proposal_sent' && "📨 PROPOSAL"}
                                                  {status === 'booked' && "✅ BOOKED"}
                                              </button>
                                          ))}
                                      </motion.div>
                                  </>
                              )}
                          </AnimatePresence>
                      </div>

                      <div className="flex w-full gap-2">
                        <button onClick={() => handleDelete(journey._id)} className="flex-1 flex items-center justify-center bg-white dark:bg-slate-800 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-md border border-slate-100 dark:border-slate-700 py-2.5">
                           <Trash2 size={16} />
                        </button>
                        <button className="flex-1 flex items-center justify-center bg-white dark:bg-slate-800 text-indigo-700 rounded-xl hover:bg-indigo-700 hover:text-white transition-all shadow-md border border-slate-100 dark:border-slate-700 py-2.5">
                           <ArrowUpRight size={16} />
                        </button>
                      </div>
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-tight xl:mt-2">
                        <Calendar size={12} /> {journey.createdAt ? new Date(journey.createdAt).toLocaleDateString() : 'N/A'}
                      </div>
                   </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
        </>
      ) : (
        <div className="py-32 text-center bg-white dark:bg-slate-900 rounded-3xl border-2 border-dashed border-slate-100 dark:border-slate-800">
            <Sparkles className="mx-auto mb-4 text-slate-100 dark:text-slate-800" size={64} strokeWidth={1} />
            <h3 className="text-2xl font-black text-slate-950 dark:text-white uppercase tracking-tight mb-2">The Journey Board is Empty</h3>
            <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide text-[10px] italic">No custom requests detected in the registry</p>
        </div>
      )}
    </motion.div>
  );
};

export default PlanYourJourney;
