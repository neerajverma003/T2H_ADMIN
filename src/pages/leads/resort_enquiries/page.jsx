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
  Search,
  CheckCircle2,
  Inbox,
  Clock,
  Filter,
  Eye,
  X,
  Hotel,
  Users,
  DoorOpen,
  FileText,
} from "lucide-react";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

const STATUS_OPTIONS = [
  { value: "new", label: "PENDING", bg: "bg-amber-500/10 text-amber-500 dark:text-amber-400 border-amber-500/30" },
  { value: "in_progress", label: "IN PROGRESS", bg: "bg-blue-500/10 text-blue-500 dark:text-blue-400 border-blue-500/30" },
  { value: "proposal_sent", label: "PROPOSAL SENT", bg: "bg-purple-500/10 text-purple-500 dark:text-purple-400 border-purple-500/30" },
  { value: "booked", label: "BOOKED", bg: "bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border-emerald-500/30" },
];

const formatClientName = (name, email) => {
  if (!name || name === "Guest" || name === "Enquiry Guest") {
    if (email) {
      const local = email.split('@')[0].replace(/[0-9._-]+/g, ' ').trim();
      return local ? local.charAt(0).toUpperCase() + local.slice(1) : "Guest";
    }
    return "Guest";
  }
  if (name.includes('@')) {
    const local = name.split('@')[0].replace(/[0-9._-]+/g, ' ').trim();
    return local ? local.charAt(0).toUpperCase() + local.slice(1) : name;
  }
  return name;
};

const ResortEnquiries = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);

  const loadEnquiries = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await apiClient.get("/admin/resort-enquiries");
      if (res.data.Data) {
        setEnquiries(res.data.Data);
      }
    } catch (err) {
      console.error("Error loading resort enquiries:", err);
      setError("Failed to load resort enquiries.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEnquiries();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Permanently delete this resort booking enquiry?")) return;
    try {
      const response = await apiClient.delete(`/admin/resort-enquiries/${id}`);
      if (response.data.success) {
        setEnquiries((current) => current.filter((e) => e._id !== id));
        toast.success("Resort enquiry deleted successfully");
        if (selectedEnquiry?._id === id) setSelectedEnquiry(null);
      }
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Failed to delete enquiry.");
    }
  };

  const handleStatusChange = async (enquiryId, newStatus) => {
    const previousEnquiries = [...enquiries];
    setEnquiries(
      enquiries.map((e) =>
        e._id === enquiryId ? { ...e, status: newStatus } : e
      )
    );

    try {
      const response = await apiClient.put(
        `/admin/resort-enquiries/${enquiryId}/status`,
        { status: newStatus }
      );
      if (response.data.success) {
        toast.success(`Status updated to ${newStatus.replace("_", " ").toUpperCase()}`);
      } else {
        throw new Error("Update failed");
      }
    } catch (err) {
      setEnquiries(previousEnquiries);
      toast.error(err.response?.data?.message || "Failed to update status");
    }
  };

  const filteredEnquiries = useMemo(() => {
    return enquiries.filter((item) => {
      const q = searchTerm.toLowerCase();
      const clientName = formatClientName(item.travelerName, item.email).toLowerCase();
      const matchesSearch =
        clientName.includes(q) ||
        item.email?.toLowerCase().includes(q) ||
        item.phone?.includes(q) ||
        item.resortTitle?.toLowerCase().includes(q) ||
        item.destination?.toLowerCase().includes(q) ||
        item.specialRequests?.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (filterType === "pending") return item.status === "new" || !item.status;
      if (filterType === "in_progress") return item.status === "in_progress";
      if (filterType === "proposal_sent") return item.status === "proposal_sent";
      if (filterType === "booked") return item.status === "booked";
      return true;
    });
  }, [enquiries, searchTerm, filterType]);

  const newCount = enquiries.filter((e) => e.status === "new" || !e.status).length;
  const inProgressCount = enquiries.filter((e) => e.status === "in_progress").length;
  const bookedCount = enquiries.filter((e) => e.status === "booked").length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8 pb-20 font-sans min-h-screen text-slate-900 dark:text-slate-100 text-left">
      {/* HEADER SECTION */}
      <div className="bg-white dark:bg-[#091126] rounded-3xl py-4 sm:py-5 px-6 sm:px-8 border border-slate-200 dark:border-slate-800 shadow-md relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0">
            <Hotel size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-500 dark:text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full">
                RESORT LEADS REGISTRY
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2 flex-wrap">
              Resort <span className="text-blue-500">Enquiries</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-semibold mt-0.5 text-xs sm:text-sm">
              Dedicated management for resort stay bookings, suite inquiries, and retreat guests.
            </p>
          </div>
        </div>

        {/* SEARCH & FILTER CONTROLS */}
        <div className="flex flex-col sm:flex-row items-center gap-3 relative z-10 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={15} />
            <input
              type="text"
              placeholder="Search by name, resort, phone..."
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
            <option value="all">All Enquiries</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="proposal_sent">Proposal Sent</option>
            <option value="booked">Booked</option>
          </select>
        </div>
      </div>

      {/* 4 TOP METRIC CARDS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* CARD 1: TOTAL ENQUIRIES */}
        <div className="bg-white dark:bg-[#091126] border border-slate-200 dark:border-slate-800 shadow-sm rounded-3xl p-6 relative group overflow-hidden transition-all duration-300 hover:scale-[1.01]">
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
              <Hotel size={20} />
            </div>
            <span className="text-[10px] font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase">
              TOTAL ENQUIRIES
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {enquiries.length}
            </h3>
          </div>
        </div>

        {/* CARD 2: PENDING / NEW */}
        <div className="bg-white dark:bg-[#091126] border border-slate-200 dark:border-slate-800 shadow-sm rounded-3xl p-6 relative group overflow-hidden transition-all duration-300 hover:scale-[1.01]">
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
              <Clock size={20} />
            </div>
            <span className="text-[10px] font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase">
              PENDING
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {newCount}
            </h3>
          </div>
        </div>

        {/* CARD 3: IN PROGRESS */}
        <div className="bg-white dark:bg-[#091126] border border-slate-200 dark:border-slate-800 shadow-sm rounded-3xl p-6 relative group overflow-hidden transition-all duration-300 hover:scale-[1.01]">
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500">
              <Filter size={20} />
            </div>
            <span className="text-[10px] font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase">
              IN PROGRESS
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {inProgressCount}
            </h3>
          </div>
        </div>

        {/* CARD 4: CONVERTED / BOOKED */}
        <div className="bg-white dark:bg-[#091126] border border-slate-200 dark:border-slate-800 shadow-sm rounded-3xl p-6 relative group overflow-hidden transition-all duration-300 hover:scale-[1.01]">
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
              <CheckCircle2 size={20} />
            </div>
            <span className="text-[10px] font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase">
              CONFIRMED BOOKINGS
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {bookedCount}
            </h3>
          </div>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white dark:bg-[#091126] border border-slate-200 dark:border-slate-800 shadow-sm rounded-3xl p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
              <Hotel size={20} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Resort Enquiries Registry
            </h3>
          </div>

          <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 text-blue-500 border border-slate-200 dark:border-slate-700/60 text-xs font-bold">
            {filteredEnquiries.length} RECORDS
          </span>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="animate-spin text-blue-500" size={48} strokeWidth={2} />
            <p className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
              Loading Resort Enquiries...
            </p>
          </div>
        ) : error ? (
          <div className="py-20 text-center bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 rounded-2xl">
            <p className="text-rose-600 dark:text-rose-400 font-bold uppercase tracking-wide text-xs">
              {error}
            </p>
          </div>
        ) : filteredEnquiries.length === 0 ? (
          <div className="py-28 text-center bg-slate-50 dark:bg-slate-950/60 rounded-3xl border border-slate-200 dark:border-slate-800 border-dashed shadow-sm">
            <Inbox className="mx-auto mb-4 text-slate-400 dark:text-slate-600" size={56} strokeWidth={1} />
            <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              No Resort Enquiries Found
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {searchTerm ? "No results match your search criteria." : "Enquiries submitted on resort pages will appear exclusively in this section."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800/80">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800/80 text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  <th className="p-4 pl-6">CLIENT NAME</th>
                  <th className="p-4">CONTACT INFO</th>
                  <th className="p-4">RESORT & LOCATION</th>
                  <th className="p-4">STAY DETAILS</th>
                  <th className="p-4">STATUS</th>
                  <th className="p-4">RECEIVED</th>
                  <th className="p-4 text-right pr-6">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 text-sm">
                {filteredEnquiries.map((item) => {
                  const currentStatus = item.status || "new";
                  const activeOpt =
                    STATUS_OPTIONS.find((o) => o.value === currentStatus) || STATUS_OPTIONS[0];
                  const clientName = formatClientName(item.travelerName, item.email);

                  return (
                    <tr
                      key={item._id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* CLIENT NAME WITH BLUE EDGE BAR */}
                      <td className="p-4 pl-6 border-l-4 border-blue-500">
                        <div className="flex items-center gap-3">
                          <div className="size-9 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 flex items-center justify-center font-black text-xs shrink-0">
                            <User size={16} />
                          </div>
                          <div>
                            <p className="font-extrabold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {clientName}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* CONTACT INFO */}
                      <td className="p-4">
                        <div className="flex flex-col gap-1 text-xs">
                          {item.email ? (
                            <a
                              href={`mailto:${item.email}`}
                              className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            >
                              <Mail size={13} className="text-blue-600 dark:text-blue-400" /> {item.email}
                            </a>
                          ) : (
                            <span className="text-slate-400 text-xs">No email</span>
                          )}
                          {item.phone && (
                            <p className="flex items-center gap-2 font-mono text-slate-500 dark:text-slate-400">
                              <Phone size={13} className="text-blue-600 dark:text-blue-400" /> {item.phone}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* RESORT & DESTINATION */}
                      <td className="p-4 max-w-xs">
                        <div className="flex flex-col gap-1">
                          <span className="font-extrabold text-xs text-slate-900 dark:text-white line-clamp-1">
                            {item.resortTitle || "Luxury Resort"}
                          </span>
                          <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                            <MapPin size={12} className="text-blue-600 dark:text-blue-400 shrink-0" />
                            {item.destination || "General"}
                          </span>
                        </div>
                      </td>

                      {/* STAY DETAILS (DATES, GUESTS, ROOMS) */}
                      <td className="p-4">
                        <div className="flex flex-col gap-0.5 text-xs">
                          <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                            <Calendar size={12} className="text-slate-400" />
                            {item.travelDate || "Flexible"} {item.returnDate ? `→ ${item.returnDate}` : ""}
                          </span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
                            <span>{item.guests || "2 Guests"}</span>
                            <span>•</span>
                            <span>{item.rooms || "1 Room"}</span>
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
                            <option
                              key={opt.value}
                              value={opt.value}
                              className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                            >
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* DATE */}
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400">
                          <Calendar size={13} />
                          {item.createdAt
                            ? new Date(item.createdAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })
                            : "N/A"}
                        </div>
                      </td>

                      {/* ACTIONS */}
                      <td className="p-4 text-right pr-6">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedEnquiry(item)}
                            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-blue-600 hover:text-white text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/60 transition-all cursor-pointer"
                            title="View Enquiry Dossier"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-rose-600 hover:text-white text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/60 transition-all cursor-pointer"
                            title="Delete Resort Enquiry"
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

      {/* DETAILS DOSSIER MODAL */}
      <AnimatePresence>
        {selectedEnquiry && (
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
                    <Hotel size={22} />
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                      {formatClientName(selectedEnquiry.travelerName, selectedEnquiry.email)}
                    </h3>
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-extrabold tracking-widest uppercase mt-0.5">
                      RESORT BOOKING ENQUIRY DOSSIER
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedEnquiry(null)}
                  className="size-9 bg-slate-100 dark:bg-slate-800 hover:bg-rose-600 rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-white transition-all cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* GRID INFO */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-1">
                  <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Mail size={12} className="text-blue-600 dark:text-blue-400" /> EMAIL
                  </span>
                  <p className="text-sm font-extrabold text-slate-900 dark:text-white break-all">
                    {selectedEnquiry.email || "Not Provided"}
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-1">
                  <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Phone size={12} className="text-blue-600 dark:text-blue-400" /> PHONE
                  </span>
                  <p className="text-sm font-extrabold font-mono text-slate-900 dark:text-white">
                    {selectedEnquiry.phone || "Not Provided"}
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-1 sm:col-span-2">
                  <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Hotel size={12} className="text-blue-600 dark:text-blue-400" /> TARGET RESORT & DESTINATION
                  </span>
                  <p className="text-base font-black text-slate-900 dark:text-white">
                    {selectedEnquiry.resortTitle}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-bold flex items-center gap-1 mt-0.5">
                    <MapPin size={11} className="text-blue-600 dark:text-blue-400" /> {selectedEnquiry.destination}
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-1">
                  <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Calendar size={12} className="text-blue-600 dark:text-blue-400" /> CHECK-IN / TRAVEL DATE
                  </span>
                  <p className="text-sm font-extrabold text-slate-900 dark:text-white">
                    {selectedEnquiry.travelDate || "Flexible"}
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-1">
                  <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Calendar size={12} className="text-blue-600 dark:text-blue-400" /> CHECK-OUT / RETURN DATE
                  </span>
                  <p className="text-sm font-extrabold text-slate-900 dark:text-white">
                    {selectedEnquiry.returnDate || "Flexible"}
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-1">
                  <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Users size={12} className="text-blue-600 dark:text-blue-400" /> GUESTS
                  </span>
                  <p className="text-sm font-extrabold text-slate-900 dark:text-white">
                    {selectedEnquiry.guests || "2 Guests"}
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-1">
                  <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <DoorOpen size={12} className="text-blue-600 dark:text-blue-400" /> ROOMS
                  </span>
                  <p className="text-sm font-extrabold text-slate-900 dark:text-white">
                    {selectedEnquiry.rooms || "1 Room"}
                  </p>
                </div>
              </div>

              {/* SPECIAL REQUESTS */}
              <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-2">
                <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <FileText size={12} className="text-blue-600 dark:text-blue-400" /> SPECIAL REQUESTS & NOTES
                </span>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic bg-white dark:bg-slate-900/50 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800/60">
                  {selectedEnquiry.specialRequests ? `"${selectedEnquiry.specialRequests}"` : "No special requests mentioned by client."}
                </p>
              </div>

              {/* FOOTER ACTIONS */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase text-slate-400">STATUS:</span>
                  <select
                    value={selectedEnquiry.status || "new"}
                    onChange={(e) => {
                      handleStatusChange(selectedEnquiry._id, e.target.value);
                      setSelectedEnquiry({ ...selectedEnquiry, status: e.target.value });
                    }}
                    className="px-3 py-1 rounded-full text-xs font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none cursor-pointer"
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleDelete(selectedEnquiry._id)}
                    className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500 text-rose-600 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Delete Enquiry
                  </button>
                  <button
                    onClick={() => setSelectedEnquiry(null)}
                    className="px-5 py-2 bg-blue-600 text-white rounded-xl text-xs font-extrabold hover:bg-blue-700 transition-all cursor-pointer shadow-md"
                  >
                    Done
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ResortEnquiries;
