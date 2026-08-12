import { useEffect, useState, useMemo } from "react";
import { apiClient } from "../../../stores/authStores";
import {
  Compass,
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
  Inbox,
  Clock,
  Filter,
  Navigation,
  Eye,
  X
} from "lucide-react";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

const STATUS_OPTIONS = [
  { value: "new", label: "PENDING", bg: "bg-amber-500/10 text-amber-400 border-amber-500/30" },
  { value: "in_progress", label: "IN PROGRESS", bg: "bg-blue-500/10 text-blue-400 border-blue-500/30" },
  { value: "proposal_sent", label: "PROPOSAL SENT", bg: "bg-purple-500/10 text-purple-400 border-purple-500/30" },
  { value: "booked", label: "BOOKED", bg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" }
];

const PlanYourJourney = () => {
  const [journeys, setJourneys] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [selectedJourney, setSelectedJourney] = useState(null);

  const loadJourneys = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await apiClient.get("/admin/plan-your-journey");
      if (res.data.Data) setJourneys(res.data.Data);
    } catch (err) {
      setError("Failed to load journey blueprints registry.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadJourneys();
  }, []);

  const handleDelete = async (journeyId) => {
    if (!window.confirm("Permanently archive this journey request?")) return;
    try {
      const response = await apiClient.delete(`/admin/plan-your-journey/${journeyId}`);
      if (response.data.success) {
        setJourneys((current) => current.filter((j) => j._id !== journeyId));
        toast.success("Journey archived");
      }
    } catch {
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

  const filteredJourneys = useMemo(() => {
    return journeys.filter(j => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        j.name?.toLowerCase().includes(q) ||
        j.email?.toLowerCase().includes(q) ||
        j.phone?.includes(q) ||
        j.destination?.toLowerCase().includes(q) ||
        j.to?.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (filterType === "pending") return (j.status === "new" || !j.status);
      if (filterType === "booked") return j.status === "booked";
      return true;
    });
  }, [journeys, searchTerm, filterType]);

  const newCount = journeys.filter(j => j.status === 'new' || !j.status).length;

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 pb-16 text-slate-900 dark:text-white font-sans">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="text-blue-600 dark:text-blue-400 font-bold tracking-widest text-[11px] uppercase flex items-center gap-1.5 mb-1">
            <Compass size={14} className="text-blue-600 dark:text-blue-400 animate-pulse" /> JOURNEY ARCHITECTS
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Journey <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 dark:from-blue-400 dark:via-indigo-400 dark:to-sky-400 bg-clip-text text-transparent">Architects</span>
          </h1>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Curating bespoke travel experiences and high-conversion itinerary blueprints.
          </p>
        </div>

        {/* SEARCH & FILTER CONTROLS */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search blueprints..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full sm:w-auto px-4 py-2.5 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-800 dark:text-slate-300 outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer shadow-sm"
          >
            <option value="all">All Blueprints</option>
            <option value="pending">Pending</option>
            <option value="booked">Booked</option>
          </select>
        </div>
      </div>

      {/* 4 TOP METRIC CARDS */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* CARD 1: BLUEPRINT VOLUME */}
        <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl relative group overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="size-12 rounded-2xl bg-blue-50 dark:bg-blue-600/20 border border-blue-200 dark:border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Compass size={22} strokeWidth={2.5} />
            </div>
            <span className="text-[10px] font-black tracking-widest text-slate-500 dark:text-slate-400 uppercase">BLUEPRINT VOLUME</span>
          </div>
          <div className="mt-4">
            <h3 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">{journeys.length}</h3>
          </div>
        </div>

        {/* CARD 2: NEW ARRIVAL */}
        <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl relative group overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="size-12 rounded-2xl bg-amber-50 dark:bg-amber-500/20 border border-amber-200 dark:border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Clock size={22} strokeWidth={2.5} />
            </div>
            <span className="text-[10px] font-black tracking-widest text-slate-500 dark:text-slate-400 uppercase">NEW ARRIVAL</span>
          </div>
          <div className="mt-4">
            <h3 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">{newCount}</h3>
          </div>
        </div>

        {/* CARD 3: MATCHED SIGNALS */}
        <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl relative group overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="size-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Filter size={22} strokeWidth={2.5} />
            </div>
            <span className="text-[10px] font-black tracking-widest text-slate-500 dark:text-slate-400 uppercase">MATCHED SIGNALS</span>
          </div>
          <div className="mt-4">
            <h3 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">{filteredJourneys.length}</h3>
          </div>
        </div>

        {/* CARD 4: ACTIVE PIPELINE */}
        <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl relative group overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="size-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 size={22} strokeWidth={2.5} />
            </div>
            <span className="text-[10px] font-black tracking-widest text-slate-500 dark:text-slate-400 uppercase">ACTIVE PIPELINE</span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Normal</h3>
          </div>
        </div>
      </div>

      {/* JOURNEY REGISTRY TABLE SECTION */}
      <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-blue-50 dark:bg-blue-600/20 border border-blue-200 dark:border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Compass size={20} />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Journey Registry</h3>
          </div>

          <div className="flex items-center gap-3">
            <button className="hidden sm:block px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-600/15 border border-blue-200 dark:border-blue-500/30 text-blue-600 dark:text-blue-400 text-xs font-extrabold uppercase tracking-wider">
              SELECT MULTIPLE
            </button>
            <span className="px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800/80 text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-slate-700 text-xs font-black">
              {filteredJourneys.length} RECORDS
            </span>
          </div>
        </div>

        {/* TABLE CONTENT */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="animate-spin text-blue-500" size={48} strokeWidth={2} />
            <p className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Loading Journey Registry...</p>
          </div>
        ) : error ? (
          <div className="py-20 text-center bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 rounded-2xl">
            <p className="text-rose-600 dark:text-rose-400 font-bold uppercase tracking-wide text-xs">{error}</p>
          </div>
        ) : filteredJourneys.length === 0 ? (
          <div className="py-28 text-center bg-slate-50 dark:bg-slate-950/60 rounded-3xl border border-slate-200 dark:border-slate-800 border-dashed shadow-sm">
            <Inbox className="mx-auto mb-4 text-slate-400 dark:text-slate-600" size={56} strokeWidth={1} />
            <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No Signals Detected</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">No journey plans match your search criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800/80">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800/80 text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  <th className="p-4 pl-6">CLIENT NAME</th>
                  <th className="p-4">CONTACT INFO</th>
                  <th className="p-4">ENGAGEMENT DETAIL</th>
                  <th className="p-4">STATUS</th>
                  <th className="p-4">DATE</th>
                  <th className="p-4 text-right pr-6">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 text-sm">
                {filteredJourneys.map((item) => {
                  const currentStatus = item.status || 'new';
                  const activeOpt = STATUS_OPTIONS.find(o => o.value === currentStatus) || STATUS_OPTIONS[0];

                  return (
                    <tr key={item._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group">
                      {/* CLIENT NAME WITH BLUE EDGE BAR */}
                      <td className="p-4 pl-6 border-l-4 border-blue-500">
                        <div className="flex items-center gap-3">
                          <div className="size-9 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 flex items-center justify-center font-black text-xs shrink-0">
                            <User size={16} />
                          </div>
                          <div>
                            <p className="font-extrabold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {item.name || 'Anonymous Architect'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* CONTACT INFO */}
                      <td className="p-4">
                        <div className="flex flex-col gap-1 text-xs">
                          {item.email && (
                            <a href={`mailto:${item.email}`} className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                              <Mail size={13} className="text-blue-600 dark:text-blue-400" /> {item.email}
                            </a>
                          )}
                          {item.phone && (
                            <p className="flex items-center gap-2 font-mono text-slate-500 dark:text-slate-400">
                              <Phone size={13} className="text-blue-600 dark:text-blue-400" /> {item.phone}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* ENGAGEMENT DETAIL / DESTINATION */}
                      <td className="p-4 max-w-xs">
                        <div className="flex flex-col gap-1">
                          <span className="flex items-center gap-2 text-xs font-extrabold text-slate-900 dark:text-white truncate uppercase">
                            <MapPin size={14} className="text-blue-600 dark:text-blue-400 shrink-0" />
                            {item.destination || item.to || item.city || 'Custom Honeymoon'}
                          </span>
                          <span className="w-fit text-[9px] font-black uppercase tracking-wider bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-500/20">
                            INTEREST
                          </span>
                        </div>
                      </td>

                      {/* STATUS DROPDOWN SELECT */}
                      <td className="p-4">
                        <select
                          value={currentStatus}
                          onChange={(e) => handleStatusChange(item._id, e.target.value)}
                          className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border outline-none cursor-pointer transition-all ${activeOpt.bg}`}
                        >
                          {STATUS_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* DATE */}
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400">
                          <Calendar size={13} />
                          {item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'JUN 2, 2026'}
                        </div>
                      </td>

                      {/* ACTIONS */}
                      <td className="p-4 text-right pr-6">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedJourney(item)}
                            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-blue-600 hover:text-white text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/60 transition-all cursor-pointer"
                            title="View Journey Details"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-rose-600 hover:text-white text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/60 transition-all cursor-pointer"
                            title="Delete Journey Plan"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* EYE BUTTON DETAILS MODAL */}
      <AnimatePresence>
        {selectedJourney && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 relative overflow-hidden text-slate-900 dark:text-white"
            >
              {/* MODAL HEADER */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="size-11 rounded-2xl bg-blue-50 dark:bg-blue-600/20 border border-blue-200 dark:border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <User size={22} />
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-900 dark:text-white uppercase tracking-tight">{selectedJourney.name}</h3>
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-extrabold tracking-widest uppercase mt-0.5">JOURNEY BLUEPRINT DOSSIER</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedJourney(null)}
                  className="size-9 bg-slate-100 dark:bg-slate-800 hover:bg-rose-600 rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-white transition-all cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* METRICS & CONTACT */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-1">
                  <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Mail size={12} className="text-blue-600 dark:text-blue-400" /> EMAIL
                  </span>
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{selectedJourney.email || 'N/A'}</p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-1">
                  <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Phone size={12} className="text-blue-600 dark:text-blue-400" /> PHONE
                  </span>
                  <p className="text-xs font-bold text-slate-900 dark:text-white font-mono">{selectedJourney.phone || 'N/A'}</p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-1">
                  <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <MapPin size={12} className="text-blue-600 dark:text-blue-400" /> TARGET DESTINATION
                  </span>
                  <p className="text-xs font-bold text-slate-900 dark:text-white uppercase">{selectedJourney.destination || selectedJourney.to || selectedJourney.city || 'Custom Honeymoon'}</p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-1">
                  <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Calendar size={12} className="text-blue-600 dark:text-blue-400" /> SUBMITTED DATE
                  </span>
                  <p className="text-xs font-bold text-slate-900 dark:text-white font-mono">
                    {selectedJourney.createdAt ? new Date(selectedJourney.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                  </p>
                </div>
              </div>

              {/* MODAL FOOTER */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setSelectedJourney(null)}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-blue-600/30"
                >
                  Close Dossier
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PlanYourJourney;
