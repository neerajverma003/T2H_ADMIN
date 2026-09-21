import { useEffect, useState, useMemo } from "react";
import { apiClient } from "../../../stores/authStores";
import {
  Trash2,
  Mail,
  Phone,
  Calendar,
  User,
  MapPin,
  Loader2,
  Sparkles,
  Search,
  Clock,
  CheckCircle2,
  Filter,
  Package,
  Inbox,
  Eye,
  X,
  Navigation,
  DollarSign
} from "lucide-react";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

const STATUS_OPTIONS = [
  { value: "new", label: "PENDING", bg: "bg-amber-500/10 text-amber-400 border-amber-500/30" },
  { value: "in_progress", label: "IN PROGRESS", bg: "bg-blue-500/10 text-blue-400 border-blue-500/30" },
  { value: "proposal_sent", label: "PROPOSAL SENT", bg: "bg-purple-500/10 text-purple-400 border-purple-500/30" },
  { value: "booked", label: "BOOKED", bg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" }
];

const TripRequests = () => {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState(null);

  const loadRequests = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await apiClient.get("/admin/plan-your-trip");
      if (res.data.Data) setRequests(res.data.Data);
    } catch (err) {
      setError("Failed to load trip requests registry.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Permanently delete this journey request?")) return;
    try {
      await apiClient.delete(`/admin/plan-your-trip/${id}`);
      setRequests((prev) => prev.filter((r) => r._id !== id));
      toast.success("Journey removed");
    } catch {
      toast.error("Removal failed.");
    }
  };

  const handleStatusChange = async (leadId, newStatus) => {
    const previousRequests = [...requests];
    setRequests(requests.map(req =>
      req._id === leadId ? { ...req, status: newStatus } : req
    ));

    try {
      const response = await apiClient.put(`/admin/plan-your-trip/${leadId}/status`, { status: newStatus });
      if (response.data.success) {
        toast.success(`Status updated to ${newStatus.replace('_', ' ').toUpperCase()}`);
      } else {
        throw new Error("Update failed");
      }
    } catch (err) {
      setRequests(previousRequests);
      toast.error(err.response?.data?.message || "Failed to update status");
    }
  };

  const filteredRequests = useMemo(() => {
    return requests.filter(r => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        r.name?.toLowerCase().includes(q) ||
        r.email?.toLowerCase().includes(q) ||
        r.phone_no?.includes(q) ||
        r.to?.toLowerCase().includes(q) ||
        r.from?.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (filterType === "pending") return (r.status === "new" || !r.status);
      if (filterType === "booked") return r.status === "booked";
      return true;
    });
  }, [requests, searchTerm, filterType]);

  const newCount = requests.filter(r => r.status === 'new' || !r.status).length;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8 pb-20 font-sans min-h-screen text-slate-900 dark:text-slate-100 text-left"
    >
      {/* HEADER SECTION */}
      <div className="bg-white dark:bg-[#091126]/95 rounded-3xl py-4 sm:py-5 px-6 sm:px-8 border border-slate-200/90 dark:border-indigo-500/25 shadow-xl dark:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.7),0_0_30px_2px_rgba(99,102,241,0.18)] ring-1 ring-slate-900/5 dark:ring-white/5 backdrop-blur-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-500/30 shrink-0">
            <Sparkles size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-500 dark:text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full">
                BUSINESS INTELLIGENCE
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2 flex-wrap">
              Plan Trip <span className="text-blue-500">Leads</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-semibold mt-0.5 text-xs sm:text-sm">
              Orchestrating high-intent engagement signals and strategic customer acquisition pipelines.
            </p>
          </div>
        </div>

        {/* SEARCH & FILTER CONTROLS */}
        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative group w-full sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-slate-50 dark:bg-[#050A17] border border-slate-200 dark:border-slate-800/90 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 rounded-xl text-xs font-semibold w-full outline-none transition-all placeholder:text-slate-400 dark:placeholder-slate-500 text-slate-900 dark:text-white shadow-inner"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full sm:w-auto px-4 py-2 bg-slate-50 dark:bg-[#050A17] border border-slate-200 dark:border-slate-800/90 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 outline-none focus:border-blue-500 transition-all cursor-pointer shadow-inner"
          >
            <option value="all">All Origins</option>
            <option value="pending">Pending</option>
            <option value="booked">Booked</option>
          </select>
        </div>
      </div>

      {/* 4 TOP METRIC CARDS */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* CARD 1: REQUEST VOLUME */}
        <div className="bg-white dark:bg-[#091126]/95 border border-slate-200/90 dark:border-indigo-500/25 shadow-xl ring-1 ring-slate-900/5 dark:ring-white/5 backdrop-blur-xl rounded-3xl p-6 relative group overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="size-11 rounded-xl bg-blue-100/70 dark:bg-blue-600/20 border border-blue-200 dark:border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm">
              <Sparkles size={20} strokeWidth={2.5} />
            </div>
            <span className="text-[10px] font-black tracking-widest text-slate-500 dark:text-slate-400 uppercase">REQUEST VOLUME</span>
          </div>
          <div className="mt-4">
            <h3 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">{requests.length}</h3>
          </div>
        </div>

        {/* CARD 2: NEW ARRIVAL */}
        <div className="bg-white dark:bg-[#091126]/95 border border-slate-200/90 dark:border-indigo-500/25 shadow-xl ring-1 ring-slate-900/5 dark:ring-white/5 backdrop-blur-xl rounded-3xl p-6 relative group overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="size-11 rounded-xl bg-amber-100/70 dark:bg-amber-500/20 border border-amber-200 dark:border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-sm">
              <Clock size={20} strokeWidth={2.5} />
            </div>
            <span className="text-[10px] font-black tracking-widest text-slate-500 dark:text-slate-400 uppercase">NEW ARRIVAL</span>
          </div>
          <div className="mt-4">
            <h3 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">{newCount}</h3>
          </div>
        </div>

        {/* CARD 3: MATCHED SIGNALS */}
        <div className="bg-white dark:bg-[#091126]/95 border border-slate-200/90 dark:border-indigo-500/25 shadow-xl ring-1 ring-slate-900/5 dark:ring-white/5 backdrop-blur-xl rounded-3xl p-6 relative group overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="size-11 rounded-xl bg-indigo-100/70 dark:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm">
              <Filter size={20} strokeWidth={2.5} />
            </div>
            <span className="text-[10px] font-black tracking-widest text-slate-500 dark:text-slate-400 uppercase">MATCHED SIGNALS</span>
          </div>
          <div className="mt-4">
            <h3 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">{filteredRequests.length}</h3>
          </div>
        </div>

        {/* CARD 4: TOTAL ASSETS */}
        <div className="bg-white dark:bg-[#091126]/95 border border-slate-200/90 dark:border-indigo-500/25 shadow-xl ring-1 ring-slate-900/5 dark:ring-white/5 backdrop-blur-xl rounded-3xl p-6 relative group overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="size-11 rounded-xl bg-emerald-100/70 dark:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm">
              <CheckCircle2 size={20} strokeWidth={2.5} />
            </div>
            <span className="text-[10px] font-black tracking-widest text-slate-500 dark:text-slate-400 uppercase">TOTAL ASSETS</span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Normal</h3>
          </div>
        </div>
      </div>

      {/* TRIP REGISTRY TABLE SECTION */}
      <div className="bg-white dark:bg-[#091126]/95 border border-slate-200/90 dark:border-indigo-500/25 shadow-xl ring-1 ring-slate-900/5 dark:ring-white/5 backdrop-blur-xl rounded-3xl p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-blue-50 dark:bg-blue-600/20 border border-blue-200 dark:border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Package size={20} />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Trip Registry</h3>
          </div>

          <div className="flex items-center gap-3">
            <button className="hidden sm:block px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-600/15 border border-blue-200 dark:border-blue-500/30 text-blue-600 dark:text-blue-400 text-xs font-extrabold uppercase tracking-wider">
              SELECT MULTIPLE
            </button>
            <span className="px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800/80 text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-slate-700 text-xs font-black">
              {filteredRequests.length} RECORDS
            </span>
          </div>
        </div>

        {/* TABLE CONTENT */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="animate-spin text-blue-500" size={48} strokeWidth={2} />
            <p className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Loading Trip Registry...</p>
          </div>
        ) : error ? (
          <div className="py-20 text-center bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 rounded-2xl">
            <p className="text-rose-600 dark:text-rose-400 font-bold uppercase tracking-wide text-xs">{error}</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="py-28 text-center bg-slate-50 dark:bg-slate-950/60 rounded-3xl border border-slate-200 dark:border-slate-800 border-dashed shadow-sm">
            <Inbox className="mx-auto mb-4 text-slate-400 dark:text-slate-600" size={56} strokeWidth={1} />
            <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No Signals Detected</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">No trip requests match your search criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800/80">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800/80 text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  <th className="p-4 pl-6">CLIENT NAME</th>
                  <th className="p-4">CONTACT INFO</th>
                  <th className="p-4">JOURNEY DETAIL</th>
                  <th className="p-4">STATUS</th>
                  <th className="p-4">DATE</th>
                  <th className="p-4 text-right pr-6">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 text-sm">
                {filteredRequests.map((item) => {
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
                            <p className="font-extrabold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors uppercase">
                              {item.name || 'Anonymous Prospect'}
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
                          {(item.phone_no || item.phone) && (
                            <p className="flex items-center gap-2 font-mono text-slate-500 dark:text-slate-400">
                              <Phone size={13} className="text-blue-600 dark:text-blue-400" /> {item.phone_no || item.phone}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* JOURNEY DETAIL / DESTINATION & BUDGET */}
                      <td className="p-4 max-w-xs">
                        <div className="flex flex-col gap-1">
                          <span className="flex items-center gap-2 text-xs font-extrabold text-slate-900 dark:text-white truncate uppercase">
                            <MapPin size={14} className="text-blue-600 dark:text-blue-400 shrink-0" />
                            {item.to || item.destination || 'Destination Unspecified'}
                          </span>
                          <div className="flex items-center gap-2">
                            {item.budget && (
                              <span className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400">
                                ₹{Number(item.budget).toLocaleString('en-IN')}
                              </span>
                            )}
                            <span className="w-fit text-[9px] font-black uppercase tracking-wider bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-500/20">
                              INTEREST
                            </span>
                          </div>
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
                          {item.fromDate ? item.fromDate : item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'AUG 4, 2026'}
                        </div>
                      </td>

                      {/* ACTIONS */}
                      <td className="p-4 text-right pr-6">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedRequest(item)}
                            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-blue-600 hover:text-white text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/60 transition-all cursor-pointer"
                            title="View Trip Specs"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-rose-600 hover:text-white text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/60 transition-all cursor-pointer"
                            title="Delete Request"
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

      {/* EYE BUTTON TRIP SPECS MODAL */}
      <AnimatePresence>
        {selectedRequest && (
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
                    <h3 className="text-xl font-extrabold text-slate-900 dark:text-white uppercase tracking-tight">{selectedRequest.name}</h3>
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-extrabold tracking-widest uppercase mt-0.5">TRIP REQUEST BLUEPRINT</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="size-9 bg-slate-100 dark:bg-slate-800 hover:bg-rose-600 rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-white transition-all cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* ROUTE BLUEPRINT (ORIGIN -> DESTINATION) */}
              <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3">
                <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Navigation size={12} /> ROUTE BLUEPRINT
                </span>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-black text-slate-500 uppercase block">ORIGIN (A)</span>
                    <span className="text-sm font-extrabold text-slate-900 dark:text-white uppercase">{selectedRequest.from || "Unspecified Origin"}</span>
                  </div>
                  <span className="text-blue-600 dark:text-blue-400 font-bold text-lg">→</span>
                  <div className="text-right">
                    <span className="text-[9px] font-black text-slate-500 uppercase block">DESTINATION (B)</span>
                    <span className="text-sm font-extrabold text-blue-600 dark:text-blue-400 uppercase">{selectedRequest.to || "Destination"}</span>
                  </div>
                </div>
              </div>

              {/* TIMING, DURATION & UNIT CAPACITY */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-1">
                  <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Clock size={12} className="text-blue-600 dark:text-blue-400" /> DURATION & CAPACITY
                  </span>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    {selectedRequest.NumberodDays || '6'} Days | {selectedRequest.adults || 2} Adults / {selectedRequest.kids || 0} Children
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-1">
                  <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <DollarSign size={12} className="text-emerald-600 dark:text-emerald-400" /> TARGET BUDGET
                  </span>
                  <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    ₹{Number(selectedRequest.budget || 30000).toLocaleString('en-IN')}
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-1">
                  <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Mail size={12} className="text-blue-600 dark:text-blue-400" /> EMAIL
                  </span>
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{selectedRequest.email || 'N/A'}</p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-1">
                  <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Phone size={12} className="text-blue-600 dark:text-blue-400" /> PHONE
                  </span>
                  <p className="text-xs font-bold text-slate-900 dark:text-white font-mono">{selectedRequest.phone_no || selectedRequest.phone || 'N/A'}</p>
                </div>
              </div>

              {/* TIMELINE DATES */}
              {(selectedRequest.fromDate || selectedRequest.toDate) && (
                <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-1">
                  <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Calendar size={12} className="text-blue-600 dark:text-blue-400" /> TRAVEL DATES
                  </span>
                  <p className="text-xs font-mono text-slate-700 dark:text-slate-300">
                    {selectedRequest.fromDate || 'Start'} → {selectedRequest.toDate || 'End'}
                  </p>
                </div>
              )}

              {/* MODAL FOOTER */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-blue-600/30"
                >
                  Close Blueprint
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default TripRequests;
