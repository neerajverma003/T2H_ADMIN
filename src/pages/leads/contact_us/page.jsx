import { useEffect, useState, useMemo } from "react";
import { apiClient } from "../../../stores/authStores";
import {
  Mail,
  MessageSquare,
  Trash2,
  User,
  Phone,
  Calendar,
  Loader2,
  Sparkles,
  Search,
  Inbox,
  Clock,
  Filter,
  CheckCircle2,
  Eye,
  X
} from "lucide-react";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

const STATUS_OPTIONS = [
  { value: "pending", label: "UNREAD", bg: "bg-rose-500/10 text-rose-400 border-rose-500/30" },
  { value: "in_progress", label: "DISCUSSION", bg: "bg-amber-500/10 text-amber-400 border-amber-500/30" },
  { value: "resolved", label: "RESOLVED", bg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" }
];

const ContactUs = () => {
  const [contacts, setContacts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedContact, setSelectedContact] = useState(null);

  const fetchContacts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get("/admin/get-contact");
      const data = response.data.Data || [];
      setContacts(data);
    } catch (err) {
      setError("Failed to load inquiries registry.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleDelete = async (_id) => {
    if (!window.confirm("Permanently remove this inquiry from the archive?")) return;
    try {
      const response = await apiClient.delete(`/admin/get-contact/${_id}`);
      if (response.data.success) {
        toast.success("Inquiry removed");
        setContacts((prev) => prev.filter((c) => c._id !== _id));
      }
    } catch {
      toast.error("Removal failed.");
    }
  };

  const handleStatusChange = async (leadId, newStatus) => {
    const previousContacts = [...contacts];
    setContacts(contacts.map(c =>
      c._id === leadId ? { ...c, status: newStatus } : c
    ));

    try {
      const response = await apiClient.put(`/admin/get-contact/${leadId}/status`, { status: newStatus });
      if (response.data.success) {
        toast.success(`Status updated to ${newStatus.replace('_', ' ').toUpperCase()}`);
      } else {
        throw new Error("Update failed");
      }
    } catch (err) {
      setContacts(previousContacts);
      toast.error(err.response?.data?.message || "Failed to update status");
    }
  };

  const filteredContacts = useMemo(() => {
    return contacts.filter(c => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        c.name?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.phone_no?.includes(q) ||
        c.subject?.toLowerCase().includes(q) ||
        c.message?.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (statusFilter === "unread") return (c.status === "pending" || !c.status);
      if (statusFilter === "resolved") return c.status === "resolved";
      return true;
    });
  }, [contacts, searchTerm, statusFilter]);

  const unreadCount = contacts.filter(c => c.status === 'pending' || !c.status).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8 pb-20 font-sans min-h-screen text-slate-900 dark:text-slate-100 text-left">
      {/* HEADER SECTION */}
      <div className="bg-white dark:bg-[#091126] rounded-3xl py-4 sm:py-5 px-6 sm:px-8 border border-slate-200 dark:border-slate-800 shadow-md relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0">
            <Mail size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-500 dark:text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full">
                COMMUNICATION VAULT
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2 flex-wrap">
              Contact <span className="text-blue-500">Inquiries</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-semibold mt-0.5 text-xs sm:text-sm">
              Centralizing incoming support requests and direct client communications.
            </p>
          </div>
        </div>

        {/* SEARCH & FILTER CONTROLS */}
        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative group w-full sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
            <input
              type="text"
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-slate-50 dark:bg-[#050A17] border border-slate-200 dark:border-slate-800/90 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 rounded-xl text-xs font-semibold w-full outline-none transition-all placeholder:text-slate-400 dark:placeholder-slate-500 text-slate-900 dark:text-white shadow-inner"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto px-4 py-2 bg-slate-50 dark:bg-[#050A17] border border-slate-200 dark:border-slate-800/90 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 outline-none focus:border-blue-500 transition-all cursor-pointer shadow-inner"
          >
            <option value="all">All Messages</option>
            <option value="unread">Unread</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* 4 TOP METRIC CARDS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white dark:bg-[#091126] border border-slate-200 dark:border-slate-800 shadow-sm rounded-3xl p-6 relative group overflow-hidden transition-all duration-300 hover:scale-[1.01]">
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
              <Mail size={20} />
            </div>
            <span className="text-[10px] font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase">INBOX VOLUME</span>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{contacts.length}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-[#091126] border border-slate-200 dark:border-slate-800 shadow-sm rounded-3xl p-6 relative group overflow-hidden transition-all duration-300 hover:scale-[1.01]">
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
              <Clock size={20} />
            </div>
            <span className="text-[10px] font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase">RECENT MESSAGES</span>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{unreadCount}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-[#091126] border border-slate-200 dark:border-slate-800 shadow-sm rounded-3xl p-6 relative group overflow-hidden transition-all duration-300 hover:scale-[1.01]">
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500">
              <Filter size={20} />
            </div>
            <span className="text-[10px] font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase">SEARCH RESULTS</span>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{filteredContacts.length}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-[#091126] border border-slate-200 dark:border-slate-800 shadow-sm rounded-3xl p-6 relative group overflow-hidden transition-all duration-300 hover:scale-[1.01]">
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
              <CheckCircle2 size={20} />
            </div>
            <span className="text-[10px] font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase">INBOX STATUS</span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {unreadCount === 0 ? "Clear" : `${unreadCount} Pending`}
            </h3>
          </div>
        </div>
      </div>

      {/* TABLE CONTENT */}
      <div className="bg-white dark:bg-[#091126] border border-slate-200 dark:border-slate-800 shadow-sm rounded-3xl p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
              <Mail size={20} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Inquiry Registry</h3>
          </div>
          <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 text-blue-500 border border-slate-200 dark:border-slate-700/60 text-xs font-bold">
            {filteredContacts.length} RECORDS
          </span>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800/80">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-[#050A17] border-b border-slate-200 dark:border-slate-800/80 text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                <th className="p-4 pl-6">CLIENT NAME</th>
                <th className="p-4">CONTACT INFO</th>
                <th className="p-4">STATUS</th>
                <th className="p-4">DATE</th>
                <th className="p-4 text-right pr-6">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 text-sm">
              {filteredContacts.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-500 dark:text-slate-400 text-xs font-semibold">
                    No inquiries match your criteria.
                  </td>
                </tr>
              ) : (
                filteredContacts.map((contact) => (
                  <tr key={contact._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="p-4 pl-6 font-bold text-slate-900 dark:text-white">{contact.name}</td>
                    <td className="p-4 text-xs font-mono text-slate-600 dark:text-slate-400">{contact.email}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
                        contact.status === 'resolved'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}>
                        {contact.status || 'pending'}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-slate-500 dark:text-slate-400 font-mono">
                      {contact.createdAt ? new Date(contact.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="p-4 text-right pr-6">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setSelectedContact(contact)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-blue-600 hover:text-white text-slate-600 dark:text-slate-400 transition-colors border border-slate-200 dark:border-slate-700/60 cursor-pointer">
                          <Eye size={15} />
                        </button>
                        <button onClick={() => handleDelete(contact._id)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-rose-600 hover:text-white text-slate-600 dark:text-slate-400 transition-colors border border-slate-200 dark:border-slate-700/60 cursor-pointer">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* INQUIRY DETAILS MODAL */}
      <AnimatePresence>
        {selectedContact && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-xl bg-white dark:bg-[#091126] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 space-y-4 text-slate-900 dark:text-white shadow-2xl">
              <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                    <Mail size={16} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{selectedContact.name}</h3>
                </div>
                <button onClick={() => setSelectedContact(null)} className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors cursor-pointer"><X size={18} /></button>
              </div>
              <div className="text-sm text-slate-700 dark:text-slate-300 space-y-3">
                <p><strong className="text-slate-900 dark:text-white">Email:</strong> {selectedContact.email}</p>
                <div className="bg-slate-50 dark:bg-[#050A17] p-4 rounded-2xl border border-slate-200 dark:border-slate-800/90">
                  <strong className="text-slate-900 dark:text-white block mb-1 text-xs uppercase tracking-wider text-slate-400">Message Content</strong>
                  <p className="text-sm leading-relaxed">{selectedContact.message}</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ContactUs;
