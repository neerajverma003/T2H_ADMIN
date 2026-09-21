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
    Inbox,
    Clock,
    Filter,
    Package,
    Eye,
    X
} from "lucide-react";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

const STATUS_OPTIONS = [
  { value: "new", label: "PENDING", bg: "bg-amber-500/10 text-amber-400 border-amber-500/30" },
  { value: "in_progress", label: "CONTACTED", bg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" },
  { value: "proposal_sent", label: "PROPOSAL SENT", bg: "bg-blue-500/10 text-blue-400 border-blue-500/30" },
  { value: "booked", label: "BOOKED", bg: "bg-purple-500/10 text-purple-400 border-purple-500/30" }
];

const ConsultationLeads = () => {
  const [leads, setLeads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [timeFilter, setTimeFilter] = useState("all");
  const [selectedLead, setSelectedLead] = useState(null);

  useEffect(() => {
    const loadLeads = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiClient.get("/admin/consultation-leads");
        if (response.data.Data) {
          setLeads(response.data.Data);
        }
      } catch (err) {
        setError("Failed to load consultation leads registry.");
      } finally {
        setIsLoading(false);
      }
    };
    loadLeads();
  }, []);

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const q = searchTerm.toLowerCase();
      const matchesSearch = 
        lead.name?.toLowerCase().includes(q) ||
        lead.email?.toLowerCase().includes(q) ||
        lead.phone?.includes(q) ||
        lead.city?.toLowerCase().includes(q) ||
        lead.to?.toLowerCase().includes(q) ||
        lead.itineraryTitle?.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (timeFilter === "today") {
        const today = new Date().toDateString();
        return new Date(lead.createdAt).toDateString() === today;
      }
      return true;
    });
  }, [leads, searchTerm, timeFilter]);

  const handleDelete = async (leadId) => {
    if (!window.confirm("Permanently delete this consultation request?")) return;
    try {
      const response = await apiClient.delete(`/admin/consultation-leads/${leadId}`);
      if (response.data.success) {
        setLeads((prev) => prev.filter((lead) => lead._id !== leadId));
        toast.success("Lead removed");
      }
    } catch {
      toast.error("Removal failed");
    }
  };

  const handleStatusChange = async (leadId, newStatus) => {
    const previousLeads = [...leads];
    setLeads(leads.map(lead => 
      lead._id === leadId ? { ...lead, status: newStatus } : lead
    ));

    try {
      const response = await apiClient.put(`/admin/plan-your-trip/${leadId}/status`, { status: newStatus });
      if (response.data.success) {
        toast.success(`Status updated to ${newStatus.replace('_', ' ').toUpperCase()}`);
      } else {
        throw new Error("Update failed");
      }
    } catch (err) {
      setLeads(previousLeads);
      toast.error(err.response?.data?.message || "Failed to update status");
    }
  };

  const newLeadsCount = leads.filter(l => l.status === 'new' || !l.status).length;
  const inProgressCount = leads.filter(l => l.status === 'in_progress' || l.status === 'proposal_sent').length;

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
            <MessageSquare size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-500 dark:text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full">
                BUSINESS INTELLIGENCE
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2 flex-wrap">
              Consultation <span className="text-blue-500">Leads</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-semibold mt-0.5 text-xs sm:text-sm">
              Orchestrating high-intent engagement signals and strategic customer acquisition pipelines.
            </p>
          </div>
        </div>

        {/* SEARCH & TIME FILTER */}
        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative group w-full sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Search leads..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-slate-50 dark:bg-[#050A17] border border-slate-200 dark:border-slate-800/90 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 rounded-xl text-xs font-semibold w-full outline-none transition-all placeholder:text-slate-400 dark:placeholder-slate-500 text-slate-900 dark:text-white shadow-inner"
            />
          </div>

          <select 
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="w-full sm:w-auto px-4 py-2 bg-slate-50 dark:bg-[#050A17] border border-slate-200 dark:border-slate-800/90 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 outline-none focus:border-blue-500 transition-all cursor-pointer shadow-inner"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
          </select>
        </div>
      </div>

      {/* 4 TOP METRIC CARDS */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* CARD 1: REGISTRY VOLUME */}
        <div className="bg-white dark:bg-[#091126]/95 border border-slate-200/90 dark:border-indigo-500/25 shadow-xl ring-1 ring-slate-900/5 dark:ring-white/5 backdrop-blur-xl rounded-3xl p-6 relative group overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="size-11 rounded-xl bg-blue-100/70 dark:bg-blue-600/20 border border-blue-200 dark:border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm">
              <MessageSquare size={20} strokeWidth={2.5} />
            </div>
            <span className="text-[10px] font-black tracking-widest text-slate-500 dark:text-slate-400 uppercase">REGISTRY VOLUME</span>
          </div>
          <div className="mt-4">
            <h3 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">{leads.length}</h3>
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
            <h3 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">{newLeadsCount}</h3>
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
            <h3 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">{inProgressCount}</h3>
          </div>
        </div>

        {/* CARD 4: TOTAL REACH */}
        <div className="bg-white dark:bg-[#091126]/95 border border-slate-200/90 dark:border-indigo-500/25 shadow-xl ring-1 ring-slate-900/5 dark:ring-white/5 backdrop-blur-xl rounded-3xl p-6 relative group overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="size-11 rounded-xl bg-emerald-100/70 dark:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm">
              <MapPin size={20} strokeWidth={2.5} />
            </div>
            <span className="text-[10px] font-black tracking-widest text-slate-500 dark:text-slate-400 uppercase">TOTAL REACH</span>
          </div>
          <div className="mt-4">
            <h3 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">{leads.length}</h3>
          </div>
        </div>
      </div>

      {/* LEAD REGISTRY TABLE SECTION */}
      <div className="bg-white dark:bg-[#091126]/95 border border-slate-200/90 dark:border-indigo-500/25 shadow-xl ring-1 ring-slate-900/5 dark:ring-white/5 backdrop-blur-xl rounded-3xl p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-blue-50 dark:bg-blue-600/20 border border-blue-200 dark:border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <MessageSquare size={20} />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Lead Registry</h3>
          </div>

          <div className="flex items-center gap-3">
            <button className="hidden sm:block px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-600/15 border border-blue-200 dark:border-blue-500/30 text-blue-600 dark:text-blue-400 text-xs font-extrabold uppercase tracking-wider">
              SELECT MULTIPLE
            </button>
            <span className="px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800/80 text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-slate-700 text-xs font-black">
              {filteredLeads.length} RECORDS
            </span>
          </div>
        </div>

        {/* TABLE CONTENT */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="animate-spin text-blue-500" size={48} strokeWidth={2} />
            <p className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Loading Lead Registry...</p>
          </div>
        ) : error ? (
          <div className="py-20 text-center bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 rounded-2xl">
            <p className="text-rose-600 dark:text-rose-400 font-bold uppercase tracking-wide text-xs">{error}</p>
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="py-28 text-center bg-slate-50 dark:bg-slate-950/60 rounded-3xl border border-slate-200 dark:border-slate-800 border-dashed shadow-sm">
            <Inbox className="mx-auto mb-4 text-slate-400 dark:text-slate-600" size={56} strokeWidth={1} />
            <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No Leads Found</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">No consultation requests match your search criteria.</p>
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
                {filteredLeads.map((lead) => {
                  const currentStatus = lead.status || 'new';
                  const activeOpt = STATUS_OPTIONS.find(o => o.value === currentStatus) || STATUS_OPTIONS[0];

                  return (
                    <tr key={lead._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group">
                      {/* CLIENT NAME WITH TEAL EDGE BAR */}
                      <td className="p-4 pl-6 border-l-4 border-emerald-500">
                        <div className="flex items-center gap-3">
                          <div className="size-9 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 flex items-center justify-center font-black text-xs shrink-0">
                            <User size={16} />
                          </div>
                          <div>
                            <p className="font-extrabold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {lead.name || 'Unnamed Client'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* CONTACT INFO */}
                      <td className="p-4">
                        <div className="flex flex-col gap-1 text-xs">
                          {lead.email && (
                            <a href={`mailto:${lead.email}`} className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                              <Mail size={13} className="text-blue-600 dark:text-blue-400" /> {lead.email}
                            </a>
                          )}
                          {(lead.phone || lead.phone_no) && (
                            <p className="flex items-center gap-2 font-mono text-slate-500 dark:text-slate-400">
                              <Phone size={13} className="text-blue-600 dark:text-blue-400" /> {lead.phone || lead.phone_no}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* ENGAGEMENT DETAIL */}
                      <td className="p-4">
                        <div className="flex flex-col gap-1">
                          <span className="flex items-center gap-2 text-xs font-extrabold text-slate-900 dark:text-white">
                            <Package size={14} className="text-blue-600 dark:text-blue-400" />
                            {lead.itineraryTitle || lead.to || lead.city || 'General Consultation'}
                          </span>
                          <span className="w-fit text-[9px] font-black uppercase tracking-wider bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-500/20">
                            {lead.itineraryTitle ? 'PACKAGE' : (lead.to || lead.city ? 'DESTINATION' : 'ADVISORY')}
                          </span>
                        </div>
                      </td>

                      {/* STATUS DROPDOWN SELECT */}
                      <td className="p-4">
                        <select
                          value={currentStatus}
                          onChange={(e) => handleStatusChange(lead._id, e.target.value)}
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
                          {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'MAR 21, 2026'}
                        </div>
                      </td>

                      {/* ACTIONS */}
                      <td className="p-4 text-right pr-6">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedLead(lead)}
                            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-blue-600 hover:text-white text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/60 transition-all cursor-pointer"
                            title="View Lead Details"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(lead._id)}
                            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-rose-600 hover:text-white text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/60 transition-all cursor-pointer"
                            title="Delete Lead"
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
        {selectedLead && (
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
                    <h3 className="text-xl font-extrabold text-slate-900 dark:text-white uppercase tracking-tight">{selectedLead.name}</h3>
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-extrabold tracking-widest uppercase mt-0.5">CONSULTATION DOSSIER</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedLead(null)}
                  className="size-9 bg-slate-100 dark:bg-slate-800 hover:bg-rose-600 rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-white transition-all cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* CONTACT METRICS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-1">
                  <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Mail size={12} className="text-blue-600 dark:text-blue-400" /> CONTACT EMAIL
                  </span>
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{selectedLead.email || 'N/A'}</p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-1">
                  <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Phone size={12} className="text-blue-600 dark:text-blue-400" /> DIRECT PHONE
                  </span>
                  <p className="text-xs font-bold text-slate-900 dark:text-white font-mono">{selectedLead.phone || selectedLead.phone_no || 'N/A'}</p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-1">
                  <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <MapPin size={12} className="text-blue-600 dark:text-blue-400" /> DESTINATION / CITY
                  </span>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{selectedLead.city || selectedLead.to || selectedLead.itineraryTitle || 'N/A'}</p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-1">
                  <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Calendar size={12} className="text-blue-600 dark:text-blue-400" /> CREATED AT
                  </span>
                  <p className="text-xs font-bold text-slate-900 dark:text-white font-mono">
                    {selectedLead.createdAt ? new Date(selectedLead.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                  </p>
                </div>
              </div>

              {/* SPECIAL MESSAGE / NOTE */}
              {selectedLead.message && (
                <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-2">
                  <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest flex items-center gap-1.5">
                    <MessageSquare size={12} /> SPECIAL INQUIRY NOTE
                  </span>
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-relaxed italic">
                    "{selectedLead.message}"
                  </p>
                </div>
              )}

              {/* MODAL FOOTER */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setSelectedLead(null)}
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

export default ConsultationLeads;

