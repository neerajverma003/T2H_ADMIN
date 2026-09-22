import { useEffect, useState, useMemo } from "react";
import { apiClient } from "../../../stores/authStores";
import {
  Trash2,
  Mail,
  Calendar,
  MessageSquare,
  Lightbulb,
  User,
  Phone,
  Loader2,
  Sparkles,
  CheckCircle2,
  Search,
  Inbox,
  Clock,
  Filter,
  Package,
  Eye,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";

const STATUS_OPTIONS = [
  { value: "pending", label: "PENDING", bg: "bg-amber-500/10 text-amber-400 border-amber-500/30" },
  { value: "in_progress", label: "ACKNOWLEDGED", bg: "bg-blue-500/10 text-blue-400 border-blue-500/30" },
  { value: "resolved", label: "RESOLVED", bg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" }
];

const Suggestions = () => {
  const [allSuggestions, setAllSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);

  const loadSuggestions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get("/admin/get-suggestions");
      setAllSuggestions(response?.data?.Data || []);
    } catch (err) {
      setError("Failed to load suggestions registry.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSuggestions();
  }, []);

  const handleDelete = async (suggestionId) => {
    if (!window.confirm("Permanently delete this feedback entry?")) return;
    try {
      await apiClient.delete(`/admin/get-suggestions/${suggestionId}`);
      toast.success("Feedback deleted");
      setAllSuggestions((prev) => prev.filter((s) => s._id !== suggestionId));
    } catch {
      toast.error("Delete failed");
    }
  };

  const handleStatusChange = async (leadId, newStatus) => {
    const previousSuggestions = [...allSuggestions];
    setAllSuggestions(allSuggestions.map(s =>
      s._id === leadId ? { ...s, status: newStatus } : s
    ));

    try {
      const response = await apiClient.put(`/admin/get-suggestions/${leadId}/status`, { status: newStatus });
      if (response.data.success) {
        toast.success(`Status updated to ${newStatus.replace('_', ' ').toUpperCase()}`);
      } else {
        throw new Error("Update failed");
      }
    } catch (err) {
      setAllSuggestions(previousSuggestions);
      toast.error(err.response?.data?.message || "Failed to update status");
    }
  };

  const filteredSuggestions = useMemo(() => {
    return allSuggestions.filter(s => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        s.name?.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q) ||
        s.phone?.includes(q) ||
        s.message?.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (categoryFilter !== "all") {
        return s.message?.toLowerCase().includes(categoryFilter);
      }
      return true;
    });
  }, [allSuggestions, searchTerm, categoryFilter]);

  const pendingCount = allSuggestions.filter(s => s.status === 'pending' || !s.status).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8 pb-20 font-sans min-h-screen text-slate-900 dark:text-slate-100 text-left">
      {/* HEADER SECTION */}
      <div className="bg-white dark:bg-[#091126] rounded-3xl py-4 sm:py-5 px-6 sm:px-8 border border-slate-200 dark:border-slate-800 shadow-md relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0">
            <Lightbulb size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-500 dark:text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full">
                PRODUCT FEEDBACK
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2 flex-wrap">
              Client <span className="text-blue-500">Suggestions</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-semibold mt-0.5 text-xs sm:text-sm">
              Synthesizing user recommendations and optimizing service delivery pipelines.
            </p>
          </div>
        </div>

        {/* SEARCH & FILTER CONTROLS */}
        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative group w-full sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
            <input
              type="text"
              placeholder="Search feedback..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-slate-50 dark:bg-[#050A17] border border-slate-200 dark:border-slate-800/90 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 rounded-xl text-xs font-semibold w-full outline-none transition-all placeholder:text-slate-400 dark:placeholder-slate-500 text-slate-900 dark:text-white shadow-inner"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full sm:w-auto px-4 py-2 bg-slate-50 dark:bg-[#050A17] border border-slate-200 dark:border-slate-800/90 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 outline-none focus:border-blue-500 transition-all cursor-pointer shadow-inner"
          >
            <option value="all">All Feedback</option>
            <option value="idea">Idea</option>
            <option value="complaint">Complaint</option>
            <option value="praise">Praise</option>
          </select>
        </div>
      </div>

      {/* 4 TOP METRIC CARDS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* CARD 1: TOTAL FEEDBACK */}
        <div className="bg-white dark:bg-[#091126] border border-slate-200 dark:border-slate-800 shadow-sm rounded-3xl p-6 relative group overflow-hidden transition-all duration-300 hover:scale-[1.01]">
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
              <Lightbulb size={20} />
            </div>
            <span className="text-[10px] font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase">TOTAL FEEDBACK</span>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{allSuggestions.length}</h3>
          </div>
        </div>

        {/* CARD 2: RECENT SUGGESTIONS */}
        <div className="bg-white dark:bg-[#091126] border border-slate-200 dark:border-slate-800 shadow-sm rounded-3xl p-6 relative group overflow-hidden transition-all duration-300 hover:scale-[1.01]">
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
              <Clock size={20} />
            </div>
            <span className="text-[10px] font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase">RECENT SUGGESTIONS</span>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{pendingCount}</h3>
          </div>
        </div>

        {/* CARD 3: SEARCH RESULTS */}
        <div className="bg-white dark:bg-[#091126] border border-slate-200 dark:border-slate-800 shadow-sm rounded-3xl p-6 relative group overflow-hidden transition-all duration-300 hover:scale-[1.01]">
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500">
              <Filter size={20} />
            </div>
            <span className="text-[10px] font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase">SEARCH RESULTS</span>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{filteredSuggestions.length}</h3>
          </div>
        </div>

        {/* CARD 4: REGISTRY STATUS */}
        <div className="bg-white dark:bg-[#091126] border border-slate-200 dark:border-slate-800 shadow-sm rounded-3xl p-6 relative group overflow-hidden transition-all duration-300 hover:scale-[1.01]">
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
              <CheckCircle2 size={20} />
            </div>
            <span className="text-[10px] font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase">REGISTRY STATUS</span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {pendingCount === 0 ? "Clear" : `${pendingCount} Pending`}
            </h3>
          </div>
        </div>
      </div>

      {/* FEEDBACK REGISTRY TABLE SECTION */}
      <div className="bg-white dark:bg-[#091126] border border-slate-200 dark:border-slate-800 shadow-sm rounded-3xl p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
              <Lightbulb size={20} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Feedback Registry</h3>
          </div>

          <div className="flex items-center gap-3">
            <button className="hidden sm:block px-3.5 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-500 text-xs font-bold uppercase tracking-wider hover:bg-blue-500/20 transition-all">
              SELECT MULTIPLE
            </button>
            <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 text-blue-500 border border-slate-200 dark:border-slate-700/60 text-xs font-bold">
              {filteredSuggestions.length} RECORDS
            </span>
          </div>
        </div>

        {/* TABLE CONTENT */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="animate-spin text-blue-500" size={48} strokeWidth={2} />
            <p className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Loading Feedback Registry...</p>
          </div>
        ) : error ? (
          <div className="py-20 text-center bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 rounded-2xl">
            <p className="text-rose-600 dark:text-rose-400 font-bold uppercase tracking-wide text-xs">{error}</p>
          </div>
        ) : filteredSuggestions.length === 0 ? (
          <div className="py-28 text-center bg-slate-50 dark:bg-slate-950/60 rounded-3xl border border-slate-200 dark:border-slate-800 border-dashed shadow-sm">
            <Inbox className="mx-auto mb-4 text-slate-400 dark:text-slate-600" size={56} strokeWidth={1} />
            <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No Signals Detected</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">No suggestions match your search criteria.</p>
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
                {filteredSuggestions.map((item) => {
                  const currentStatus = item.status || 'pending';
                  const activeOpt = STATUS_OPTIONS.find(o => o.value === currentStatus) || STATUS_OPTIONS[0];

                  return (
                    <tr key={item._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group">
                      {/* CLIENT NAME WITH TEAL EDGE BAR */}
                      <td className="p-4 pl-6 border-l-4 border-emerald-500">
                        <div className="flex items-center gap-3">
                          <div className="size-9 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 flex items-center justify-center font-black text-xs shrink-0">
                            <User size={16} />
                          </div>
                          <div>
                            <p className="font-extrabold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {item.name || 'Anonymous User'}
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

                      {/* ENGAGEMENT DETAIL / IDEA */}
                      <td className="p-4 max-w-xs">
                        <div className="flex flex-col gap-1">
                          <span className="flex items-center gap-2 text-xs font-extrabold text-slate-900 dark:text-white truncate">
                            <Lightbulb size={14} className="text-amber-600 dark:text-amber-400 shrink-0" />
                            {item.message || 'Product Improvement Suggestion'}
                          </span>
                          <span className="w-fit text-[9px] font-black uppercase tracking-wider bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-500/20">
                            IDEA
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
                          {item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'MAR 21, 2026'}
                        </div>
                      </td>

                      {/* ACTIONS */}
                      <td className="p-4 text-right pr-6">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedSuggestion(item)}
                            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-blue-600 hover:text-white text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/60 transition-all cursor-pointer"
                            title="View Feedback Details"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-rose-600 hover:text-white text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/60 transition-all cursor-pointer"
                            title="Delete Suggestion"
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
        {selectedSuggestion && (
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
                  <div className="size-11 rounded-2xl bg-amber-50 dark:bg-amber-500/20 border border-amber-200 dark:border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                    <Lightbulb size={22} />
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-900 dark:text-white uppercase tracking-tight">{selectedSuggestion.name || 'Anonymous User'}</h3>
                    <p className="text-xs text-amber-600 dark:text-amber-400 font-extrabold tracking-widest uppercase mt-0.5">FEEDBACK & SUGGESTION DOSSIER</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedSuggestion(null)}
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
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{selectedSuggestion.email || 'N/A'}</p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-1">
                  <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Phone size={12} className="text-blue-600 dark:text-blue-400" /> PHONE
                  </span>
                  <p className="text-xs font-bold text-slate-900 dark:text-white font-mono">{selectedSuggestion.phone || 'N/A'}</p>
                </div>
              </div>

              {/* FEEDBACK MESSAGE */}
              <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-2">
                <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Lightbulb size={12} /> SUGGESTION & IDEA DETAILS
                </span>
                <p className="text-xs font-medium text-slate-700 dark:text-slate-200 leading-relaxed italic whitespace-pre-wrap">
                  "{selectedSuggestion.message || 'No additional message text.'}"
                </p>
              </div>

              {/* MODAL FOOTER */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setSelectedSuggestion(null)}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer shadow-sm"
                >
                  Close Dossier
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Suggestions;
