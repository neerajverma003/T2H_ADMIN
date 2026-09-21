import { useState, useEffect } from "react";
import { apiClient } from "../../stores/authStores";
import {
  Bell,
  Mail,
  User,
  Trash2,
  ChevronDown,
  ChevronUp,
  Plus,
  Loader2,
  Globe,
  Users,
  ShoppingBag,
  MessageSquare,
  BellRing,
  Bot,
  CheckCircle2,
  ShieldCheck,
  Search,
  Check,
  Compass,
  Briefcase,
} from "lucide-react";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

const MODULES = [
  {
    id: "universal",
    categoryKey: "universal",
    badgeLabel: "UNIVERSAL_NOTIFICATION",
    title: "Universal Notification",
    description: "Global receiver: automatically receives notifications from all modules.",
    icon: Globe,
    iconBg: "bg-purple-600/20 text-purple-400 border-purple-500/30",
    isUniversal: true,
  },
  {
    id: "activity",
    categoryKey: ["activity", "activity_booking"],
    addCategoryDefault: "activity",
    badgeLabel: "ACTIVITY_BOOKING",
    title: "Activity Bookings",
    description: "Activity experience reservations, ticket bookings & customer passes.",
    icon: Compass,
    iconBg: "bg-teal-600/20 text-teal-400 border-teal-500/30",
  },
  {
    id: "leads",
    categoryKey: ["itinerary_lead", "trip_plan"],
    addCategoryDefault: "itinerary_lead",
    badgeLabel: "LEADS",
    title: "Leads",
    description: "Plan Trip, Plan Journey & Consultation enquiries.",
    icon: Users,
    iconBg: "bg-blue-600/20 text-blue-400 border-blue-500/30",
  },
  {
    id: "contact",
    categoryKey: "contact",
    badgeLabel: "CONTACT_FORM",
    title: "Contact Form",
    description: "Contact us form submissions.",
    icon: Mail,
    iconBg: "bg-cyan-600/20 text-cyan-400 border-cyan-500/30",
  },
  {
    id: "booking",
    categoryKey: "booking",
    badgeLabel: "BOOKING",
    title: "Booking",
    description: "New trip booking initiated notifications.",
    icon: ShoppingBag,
    iconBg: "bg-emerald-600/20 text-emerald-400 border-emerald-500/30",
  },
  {
    id: "suggestions",
    categoryKey: "suggestion_complaint",
    badgeLabel: "SUGGESTIONS_FEEDBACK",
    title: "Suggestions & Feedback",
    description: "User complaints, recommendations & platform suggestions.",
    icon: MessageSquare,
    iconBg: "bg-amber-600/20 text-amber-400 border-amber-500/30",
  },
  {
    id: "subscription",
    categoryKey: "subscription",
    badgeLabel: "SUBSCRIPTIONS",
    title: "Subscriptions",
    description: "Travel journal & editorial newsletter subscribers.",
    icon: BellRing,
    iconBg: "bg-rose-600/20 text-rose-400 border-rose-500/30",
  },
  {
    id: "chatbot",
    categoryKey: "chatbot",
    badgeLabel: "CHATBOT_ASSISTANT",
    title: "Chatbot Assistant",
    description: "Travel assistant chatbot lead submissions & enquiries.",
    icon: Bot,
    iconBg: "bg-indigo-600/20 text-indigo-400 border-indigo-500/30",
  },
  {
    id: "careers",
    categoryKey: ["job_application", "career"],
    addCategoryDefault: "job_application",
    badgeLabel: "JOB_APPLICATIONS",
    title: "Job Applications",
    description: "Job vacancies, candidate CVs & career applicant notifications.",
    icon: Briefcase,
    iconBg: "bg-blue-600/20 text-blue-400 border-blue-500/30",
  },
];

const NotificationControl = () => {
  const [recipients, setRecipients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedModuleId, setExpandedModuleId] = useState("universal");

  // Inline Add Form state per module
  const [inlineForms, setInlineForms] = useState({});
  const [isAddingMap, setIsAddingMap] = useState({});

  const fetchRecipients = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get("/admin/notification-recipients");
      if (res.data?.success) {
        setRecipients(res.data.data || []);
      }
    } catch (err) {
      toast.error(err.response?.data?.msg || "Failed to load notification recipients.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipients();
  }, []);

  const toggleModuleAccordion = (id) => {
    setExpandedModuleId(prev => (prev === id ? null : id));
  };

  const handleInputChange = (moduleId, field, value) => {
    setInlineForms(prev => ({
      ...prev,
      [moduleId]: {
        ...prev[moduleId],
        [field]: value
      }
    }));
  };

  const handleAddRecipient = async (e, mod) => {
    e.preventDefault();
    const form = inlineForms[mod.id] || {};
    const name = form.name || "";
    const email = form.email || "";

    if (!email.trim()) {
      toast.error("Please enter an Email address.");
      return;
    }

    setIsAddingMap(prev => ({ ...prev, [mod.id]: true }));

    try {
      const cat = mod.isUniversal
        ? "universal"
        : mod.addCategoryDefault || (Array.isArray(mod.categoryKey)
        ? mod.categoryKey[0]
        : mod.categoryKey);

      const payload = {
        name: name.trim() || email.split("@")[0],
        email: email.trim(),
        category: cat,
        isUniversal: Boolean(mod.isUniversal),
        isActive: true,
      };

      const res = await apiClient.post("/admin/notification-recipients", payload);

      if (res.data?.success) {
        toast.success(`Recipient added to ${mod.title}! 🎉`);
        setRecipients(prev => [res.data.data, ...prev]);

        // Reset inline form
        setInlineForms(prev => ({
          ...prev,
          [mod.id]: { name: "", email: "" }
        }));
      }
    } catch (err) {
      toast.error(err.response?.data?.msg || "Failed to add recipient.");
    } finally {
      setIsAddingMap(prev => ({ ...prev, [mod.id]: false }));
    }
  };

  const handleToggleStatus = async (recipient) => {
    try {
      const res = await apiClient.put(`/admin/notification-recipients/${recipient._id}`, {
        isActive: !recipient.isActive,
      });
      if (res.data?.success) {
        toast.success(`Recipient ${!recipient.isActive ? 'activated' : 'deactivated'}! ✨`);
        setRecipients(prev =>
          prev.map(r => (r._id === recipient._id ? res.data.data : r))
        );
      }
    } catch (err) {
      toast.error(err.response?.data?.msg || "Failed to update recipient status.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this notification recipient?")) return;
    try {
      const res = await apiClient.delete(`/admin/notification-recipients/${id}`);
      if (res.data?.success) {
        toast.success("Recipient removed successfully! 🗑️");
        setRecipients(prev => prev.filter(r => r._id !== id));
      }
    } catch (err) {
      toast.error(err.response?.data?.msg || "Failed to delete recipient.");
    }
  };

  // Helper to filter recipients for a specific module card
  const getRecipientsForModule = (mod) => {
    return recipients.filter(r => {
      if (mod.isUniversal) {
        return r.isUniversal || r.category === 'universal';
      }
      if (r.isUniversal || r.category === 'universal') {
        return false; // Universal recipients stay in Universal card
      }
      if (Array.isArray(mod.categoryKey)) {
        return mod.categoryKey.includes(r.category);
      }
      return r.category === mod.categoryKey;
    });
  };

  const activeCount = recipients.filter(r => r.isActive).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto space-y-8 pb-24 px-4 sm:px-6 text-left text-slate-900 dark:text-white font-sans"
    >
      {/* ── HEADER HUB ── */}
      <div className="bg-white dark:bg-[#091126]/95 rounded-3xl py-4 sm:py-5 px-6 sm:px-8 border border-slate-200/90 dark:border-indigo-500/25 shadow-xl dark:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.7),0_0_30px_2px_rgba(99,102,241,0.18)] ring-1 ring-slate-900/5 dark:ring-white/5 backdrop-blur-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Glow Effects */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-blue-500/10 dark:bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-indigo-500/10 dark:bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-500/30 shrink-0">
            <Bell size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-500 dark:text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full">
                COMMUNICATION DISPATCH
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2 flex-wrap">
              Notification <span className="text-blue-500">Control</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-semibold mt-0.5 text-xs sm:text-sm">
              Configure which email addresses receive notifications for each module.
            </p>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <button
            type="button"
            onClick={fetchRecipients}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer active:scale-95"
          >
            <Loader2 className={`size-3.5 ${isLoading ? "animate-spin text-blue-500" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* TOP 3 STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-[#091126]/95 border border-slate-200/90 dark:border-indigo-500/25 shadow-xl ring-1 ring-slate-900/5 dark:ring-white/5 backdrop-blur-xl rounded-3xl p-6 text-center">
          <h3 className="text-3xl font-black text-slate-900 dark:text-white">{recipients.length}</h3>
          <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1">Total Recipients</p>
        </div>

        <div className="bg-white dark:bg-[#091126]/95 border border-slate-200/90 dark:border-indigo-500/25 shadow-xl ring-1 ring-slate-900/5 dark:ring-white/5 backdrop-blur-xl rounded-3xl p-6 text-center">
          <h3 className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{activeCount}</h3>
          <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1">Active</p>
        </div>

        <div className="bg-white dark:bg-[#091126]/95 border border-slate-200/90 dark:border-indigo-500/25 shadow-xl ring-1 ring-slate-900/5 dark:ring-white/5 backdrop-blur-xl rounded-3xl p-6 text-center">
          <h3 className="text-3xl font-black text-indigo-600 dark:text-indigo-400">{MODULES.length}</h3>
          <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1">Modules</p>
        </div>
      </div>

      {/* MODULE ACCORDION CARDS LIST */}
      <div className="space-y-4">
        {MODULES.map((mod) => {
          const isExpanded = expandedModuleId === mod.id;
          const modRecipients = getRecipientsForModule(mod);
          const activeModRecipients = modRecipients.filter(r => r.isActive).length;
          const IconComp = mod.icon;
          const isAdding = isAddingMap[mod.id] || false;
          const formValues = inlineForms[mod.id] || { name: "", email: "" };

          return (
            <div
              key={mod.id}
              className="bg-white dark:bg-[#091126]/95 border border-slate-200/90 dark:border-indigo-500/25 shadow-xl ring-1 ring-slate-900/5 dark:ring-white/5 backdrop-blur-xl rounded-3xl overflow-hidden transition-all"
            >
              {/* CARD HEADER / TOGGLE BAR */}
              <div
                onClick={() => toggleModuleAccordion(mod.id)}
                className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors select-none"
              >
                <div className="flex items-center gap-4">
                  <div className={`size-11 rounded-xl flex items-center justify-center border ${mod.iconBg}`}>
                    <IconComp size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">{mod.title}</h3>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">{mod.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-[#050A17] rounded-xl text-xs font-extrabold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800">
                    <span className="text-blue-600 dark:text-blue-400 font-bold">{modRecipients.length} recipient{modRecipients.length !== 1 ? 's' : ''}</span>
                    {activeModRecipients > 0 && (
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">({activeModRecipients} active)</span>
                    )}
                  </div>

                  <button className="p-2 rounded-xl bg-slate-100 dark:bg-[#050A17] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors border border-slate-200 dark:border-slate-800 cursor-pointer">
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                </div>
              </div>

              {/* CARD BODY (EXPANDABLE) */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/40 dark:bg-[#050A17]/50 p-6 space-y-6"
                  >
                    {/* INLINE ADD RECIPIENT BOX */}
                    <div className="bg-white dark:bg-[#091126] border border-slate-200 dark:border-slate-800/90 rounded-2xl p-5 space-y-3 shadow-inner">
                      <h4 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                        ADD RECIPIENT
                      </h4>

                      <form
                        onSubmit={(e) => handleAddRecipient(e, mod)}
                        className="flex flex-col sm:flex-row items-center gap-3"
                      >
                        <input
                          type="text"
                          value={formValues.name}
                          onChange={(e) => handleInputChange(mod.id, "name", e.target.value)}
                          placeholder="Name (optional)"
                          className="w-full sm:flex-1 px-4 py-3 bg-slate-50 dark:bg-[#050A17] border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-blue-500 transition-all shadow-inner"
                        />
                        <input
                          type="email"
                          required
                          value={formValues.email}
                          onChange={(e) => handleInputChange(mod.id, "email", e.target.value)}
                          placeholder="Email address *"
                          className="w-full sm:flex-1 px-4 py-3 bg-slate-50 dark:bg-[#050A17] border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-blue-500 transition-all shadow-inner"
                        />
                        <button
                          type="submit"
                          disabled={isAdding}
                          className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-blue-500/30 transition-all cursor-pointer disabled:opacity-50 shrink-0"
                        >
                          {isAdding ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} Add
                        </button>
                      </form>
                    </div>

                    {/* RECIPIENT DIRECTORY TABLE FOR THIS MODULE */}
                    {isLoading ? (
                      <div className="flex items-center justify-center py-8 gap-2 text-slate-500 dark:text-slate-400 text-xs font-bold">
                        <Loader2 size={16} className="animate-spin text-indigo-500" /> Loading recipients...
                      </div>
                    ) : modRecipients.length === 0 ? (
                      <div className="text-center py-8 bg-slate-100/40 dark:bg-slate-900/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs font-bold">
                        No recipients added for this module yet. Use the form above to add one.
                      </div>
                    ) : (
                      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-100/90 dark:bg-slate-900/90 text-slate-600 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-200 dark:border-slate-800">
                              <th className="py-3.5 px-5">NAME</th>
                              <th className="py-3.5 px-5">EMAIL</th>
                              <th className="py-3.5 px-5">MODULES</th>
                              <th className="py-3.5 px-5">ACTIVE</th>
                              <th className="py-3.5 px-5 text-right">REMOVE</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 text-xs font-bold text-slate-700 dark:text-slate-300">
                            {modRecipients.map((r) => (
                              <tr key={r._id} className="hover:bg-slate-100/60 dark:hover:bg-slate-900/50 transition-colors">
                                <td className="py-4 px-5">
                                  <div className="flex items-center gap-3">
                                    <div className="size-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-extrabold text-xs uppercase">
                                      {r.name ? r.name.charAt(0) : "U"}
                                    </div>
                                    <span className="text-slate-900 dark:text-white font-extrabold">{r.name}</span>
                                  </div>
                                </td>

                                <td className="py-4 px-5 font-mono text-slate-600 dark:text-slate-300">
                                  {r.email}
                                </td>

                                <td className="py-4 px-5">
                                  <span className="inline-block px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-purple-600 dark:text-purple-400 border border-slate-200 dark:border-slate-700">
                                    {mod.badgeLabel}
                                  </span>
                                </td>

                                <td className="py-4 px-5">
                                  <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={r.isActive}
                                      onChange={() => handleToggleStatus(r)}
                                      className="sr-only peer"
                                    />
                                    <div className="w-9 h-5 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                                  </label>
                                </td>

                                <td className="py-4 px-5 text-right">
                                  <button
                                    onClick={() => handleDelete(r._id)}
                                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors cursor-pointer"
                                    title="Remove Recipient"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default NotificationControl;
