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
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 pb-16 text-slate-900 dark:text-white font-sans">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="text-blue-600 dark:text-blue-400 font-bold tracking-widest text-[11px] uppercase flex items-center gap-1.5 mb-1">
            <Sparkles size={14} className="text-blue-600 dark:text-blue-400 animate-pulse" /> COMMUNICATION VAULT
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Contact <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 dark:from-blue-400 dark:via-indigo-400 dark:to-sky-400 bg-clip-text text-transparent">Inquiries</span>
          </h1>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Centralizing incoming support requests and direct client communications.
          </p>
        </div>

        {/* SEARCH & FILTER CONTROLS */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto px-4 py-2.5 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-800 dark:text-slate-300 outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer shadow-sm"
          >
            <option value="all">All Messages</option>
            <option value="unread">Unread</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* 4 TOP METRIC CARDS */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl relative group overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="size-12 rounded-2xl bg-blue-50 dark:bg-blue-600/20 border border-blue-200 dark:border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Mail size={22} strokeWidth={2.5} />
            </div>
            <span className="text-[10px] font-black tracking-widest text-slate-500 dark:text-slate-400 uppercase">INBOX VOLUME</span>
          </div>
          <div className="mt-4">
            <h3 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">{contacts.length}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl relative group overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="size-12 rounded-2xl bg-amber-50 dark:bg-amber-500/20 border border-amber-200 dark:border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Clock size={22} strokeWidth={2.5} />
            </div>
            <span className="text-[10px] font-black tracking-widest text-slate-500 dark:text-slate-400 uppercase">RECENT MESSAGES</span>
          </div>
          <div className="mt-4">
            <h3 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">{unreadCount}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl relative group overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="size-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Filter size={22} strokeWidth={2.5} />
            </div>
            <span className="text-[10px] font-black tracking-widest text-slate-500 dark:text-slate-400 uppercase">SEARCH RESULTS</span>
          </div>
          <div className="mt-4">
            <h3 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">{filteredContacts.length}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl relative group overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="size-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 size={22} strokeWidth={2.5} />
            </div>
            <span className="text-[10px] font-black tracking-widest text-slate-500 dark:text-slate-400 uppercase">INBOX STATUS</span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {unreadCount === 0 ? "Clear" : `${unreadCount} Pending`}
            </h3>
          </div>
        </div>
      </div>

      {/* TABLE CONTENT */}
      <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-xl">
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800/80">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800/80 text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                <th className="p-4 pl-6">CLIENT NAME</th>
                <th className="p-4">CONTACT INFO</th>
                <th className="p-4">STATUS</th>
                <th className="p-4">DATE</th>
                <th className="p-4 text-right pr-6">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 text-sm">
              {filteredContacts.map((contact) => (
                <tr key={contact._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="p-4 pl-6 font-bold text-slate-900 dark:text-white">{contact.name}</td>
                  <td className="p-4 text-xs font-mono text-slate-600 dark:text-slate-400">{contact.email}</td>
                  <td className="p-4 text-[10px] font-bold text-slate-700 dark:text-slate-300">{contact.status || 'pending'}</td>
                  <td className="p-4 text-xs text-slate-500 dark:text-slate-400">
                    {contact.createdAt ? new Date(contact.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="p-4 text-right pr-6">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => setSelectedContact(contact)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-blue-600 hover:text-white text-slate-600 dark:text-slate-400 transition-colors border border-slate-200 dark:border-slate-700/60">
                        <Eye size={15} />
                      </button>
                      <button onClick={() => handleDelete(contact._id)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-rose-600 hover:text-white text-slate-600 dark:text-slate-400 transition-colors border border-slate-200 dark:border-slate-700/60">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* INQUIRY DETAILS MODAL */}
      <AnimatePresence>
        {selectedContact && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 text-slate-900 dark:text-white shadow-2xl">
              <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{selectedContact.name}</h3>
                <button onClick={() => setSelectedContact(null)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400"><X size={20} /></button>
              </div>
              <div className="text-sm text-slate-700 dark:text-slate-300 space-y-3">
                <p><strong className="text-slate-900 dark:text-white">Email:</strong> {selectedContact.email}</p>
                <p className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800"><strong className="text-slate-900 dark:text-white block mb-1">Message:</strong> {selectedContact.message}</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ContactUs;
