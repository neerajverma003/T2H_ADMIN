import { useState, useEffect, useRef } from "react";
import { apiClient, useAuthStore } from "../../stores/authStores";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiShield, 
  FiUser, 
  FiActivity, 
  FiTrash2,
  FiXCircle,
  FiSliders,
  FiLayers,
  FiCpu,
  FiCopy,
  FiCheck,
  FiEye,
  FiX,
  FiGlobe,
  FiCalendar,
  FiAlertCircle,
  FiChevronDown
} from "react-icons/fi";
import { 
  ShieldCheck, 
  RefreshCcw, 
  Search, 
  Crown, 
  ShieldAlert, 
  PlusCircle, 
  Edit3, 
  Trash2, 
  LogIn, 
  LogOut,
  Key, 
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Download,
  Database,
  Calendar as CalendarIcon,
  Sparkles,
  Users,
  MapPin,
  Compass,
  FileText,
  CreditCard,
  Settings as SettingsIcon
} from "lucide-react";
import { toast } from "react-toastify";

// Module configurations with display labels and category icons
const MODULE_OPTIONS = [
  { value: "ALL", label: "All Modules", icon: Database },
  { value: "SECURITY", label: "Security & Auth", icon: Key },
  { value: "ADMIN_MANAGEMENT", label: "Admin & Team", icon: ShieldCheck },
  { value: "DESTINATIONS", label: "Destinations", icon: MapPin },
  { value: "ITINERARIES", label: "Itineraries", icon: Compass },
  { value: "RESORTS", label: "Resorts & Hotels", icon: Compass },
  { value: "CITIES", label: "Cities & Places", icon: MapPin },
  { value: "CUSTOMERS", label: "Registered Users", icon: Users },
  { value: "LEADS", label: "Leads & Contacts", icon: FileText },
  { value: "BLOGS", label: "Blogs & Stories", icon: FileText },
  { value: "GALLERY", label: "Media Gallery", icon: Database },
  { value: "TESTIMONIALS", label: "Testimonials", icon: Sparkles },
  { value: "HERO_SECTION", label: "Hero Section", icon: Sparkles },
  { value: "SETTINGS", label: "System Settings", icon: SettingsIcon },
  { value: "GIFT_CARDS", label: "Gift Cards", icon: CreditCard },
  { value: "WALLET", label: "Wallet & Points", icon: CreditCard },
];

const ACTION_OPTIONS = [
  { value: "ALL", label: "All Operations", icon: FiActivity },
  { value: "CREATE", label: "Create Resource", icon: PlusCircle },
  { value: "UPDATE", label: "Modify / Edit", icon: Edit3 },
  { value: "DELETE", label: "Delete / Purge", icon: Trash2 },
  { value: "STATUS_CHANGE", label: "Status Toggle", icon: SlidersHorizontal },
  { value: "SETTINGS_CHANGE", label: "Config Update", icon: SettingsIcon },
  { value: "BULK_ACTION", label: "Bulk Action", icon: Database },
  { value: "SECURITY", label: "Security Event", icon: ShieldAlert },
];

const ROLE_OPTIONS = [
  { value: "ALL", label: "All Operator Roles" },
  { value: "superadmin", label: "Super Admin" },
  { value: "admin", label: "Admin" },
  { value: "subadmin", label: "Sub Admin" },
  { value: "system", label: "System Service" },
];

// Custom Sleek Dropdown Component
const CustomDropdown = ({ options, value, onChange, placeholder = "Select...", icon: Icon }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/70 hover:bg-slate-100 dark:hover:bg-slate-800 border rounded-xl text-xs font-bold transition-all text-left ${
          isOpen
            ? "border-indigo-500 ring-2 ring-indigo-500/20 text-indigo-600 dark:text-indigo-400"
            : value !== "ALL"
            ? "border-indigo-400/50 bg-indigo-50/30 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-300 font-extrabold"
            : "border-slate-200 dark:border-slate-700/80 text-slate-800 dark:text-slate-200"
        }`}
      >
        <div className="flex items-center gap-2 truncate">
          {Icon && <Icon className="size-3.5 shrink-0 text-slate-400 dark:text-slate-500" />}
          <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        </div>
        <FiChevronDown
          className={`size-3.5 shrink-0 text-slate-400 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-indigo-500" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 left-0 right-0 mt-1.5 max-h-60 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl py-1.5 focus:outline-none"
          >
            {options.map((option) => {
              const isSelected = option.value === value;
              const OptIcon = option.icon;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2 text-xs font-semibold text-left transition-colors ${
                    isSelected
                      ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    {OptIcon && (
                      <OptIcon
                        className={`size-3.5 shrink-0 ${
                          isSelected ? "text-indigo-500" : "text-slate-400"
                        }`}
                      />
                    )}
                    <span className="truncate">{option.label}</span>
                  </div>
                  {isSelected && <FiCheck className="size-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const AuditLogs = () => {
  const currentAdminRole = useAuthStore((state) => state.role);
  const isSuperAdmin = currentAdminRole === "superadmin";

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    overallTotal: 0,
    creates: 0,
    updates: 0,
    deletes: 0,
    configUpdates: 0,
    last24h: 0
  });

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedModule, setSelectedModule] = useState("ALL");
  const [selectedAction, setSelectedAction] = useState("ALL");
  const [selectedRole, setSelectedRole] = useState("ALL");
  
  // Date Calendar Filters
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Auto Refresh
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshCountdown, setRefreshCountdown] = useState(15);

  // Inspect Dossier Modal
  const [inspectLog, setInspectLog] = useState(null);
  const [copiedJson, setCopiedJson] = useState(false);
  const [copiedLogId, setCopiedLogId] = useState(false);

  // Clear Logs Modal
  const [showClearModal, setShowClearModal] = useState(false);
  const [clearDays, setClearDays] = useState(90);
  const [isClearing, setIsClearing] = useState(false);

  // Export State
  const [isExporting, setIsExporting] = useState(false);

  // Fetch Audit Logs from Backend
  const fetchLogs = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: limit,
      };

      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (selectedModule !== "ALL") params.module = selectedModule;
      if (selectedAction !== "ALL") params.action = selectedAction;
      if (selectedRole !== "ALL") params.role = selectedRole;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await apiClient.get("/admin/audit-logs", { params });
      if (res.data && res.data.success) {
        setLogs(Array.isArray(res.data.data) ? res.data.data : []);
        if (res.data.stats && typeof res.data.stats === "object") {
          setStats({
            total: res.data.stats.total || 0,
            overallTotal: res.data.stats.overallTotal || res.data.stats.total || 0,
            creates: res.data.stats.creates || 0,
            updates: res.data.stats.updates || 0,
            deletes: res.data.stats.deletes || 0,
            configUpdates: res.data.stats.configUpdates || 0,
            last24h: res.data.stats.last24h || 0,
          });
        }
        if (res.data.pagination) {
          setTotalPages(res.data.pagination.totalPages || 1);
          setTotalRecords(res.data.pagination.totalRecords || 0);
        }
      }
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      if (!isBackground) {
        toast.error("Failed to load audit logs from registry");
      }
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  // Trigger fetch whenever filters, search, page or limit change
  useEffect(() => {
    fetchLogs();
  }, [currentPage, limit, selectedModule, selectedAction, selectedRole, startDate, endDate]);

  // Debounced search trigger
  useEffect(() => {
    const handler = setTimeout(() => {
      setCurrentPage(1);
      fetchLogs();
    }, 350);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Auto Refresh Interval
  useEffect(() => {
    let timer;
    if (autoRefresh) {
      timer = setInterval(() => {
        setRefreshCountdown((prev) => {
          if (prev <= 1) {
            fetchLogs(true);
            return 15;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setRefreshCountdown(15);
    }
    return () => clearInterval(timer);
  }, [autoRefresh, currentPage, limit, selectedModule, selectedAction, selectedRole, startDate, endDate, searchTerm]);

  // Quick Calendar Presets
  const setQuickDate = (type) => {
    const now = new Date();
    const formatDate = (d) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    if (type === "today") {
      const todayStr = formatDate(now);
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (type === "yesterday") {
      const y = new Date(now);
      y.setDate(y.getDate() - 1);
      const yStr = formatDate(y);
      setStartDate(yStr);
      setEndDate(yStr);
    } else if (type === "7days") {
      const past = new Date(now);
      past.setDate(past.getDate() - 7);
      setStartDate(formatDate(past));
      setEndDate(formatDate(now));
    } else if (type === "30days") {
      const past = new Date(now);
      past.setDate(past.getDate() - 30);
      setStartDate(formatDate(past));
      setEndDate(formatDate(now));
    } else if (type === "clear") {
      setStartDate("");
      setEndDate("");
    }
    setCurrentPage(1);
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedModule("ALL");
    setSelectedAction("ALL");
    setSelectedRole("ALL");
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
  };

  // Handle Export CSV
  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const params = {};
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (selectedModule !== "ALL") params.module = selectedModule;
      if (selectedAction !== "ALL") params.action = selectedAction;
      if (selectedRole !== "ALL") params.role = selectedRole;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await apiClient.get("/admin/audit-logs/export", {
        params,
        responseType: "blob"
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      const filename = `security-audit-logs-${startDate || 'all'}-to-${endDate || 'now'}.csv`;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Audit log archive exported successfully!");
    } catch (error) {
      console.error("Export CSV Error:", error);
      toast.error("Failed to export audit logs CSV");
    } finally {
      setIsExporting(false);
    }
  };

  // Handle Clear Logs
  const handleClearLogs = async () => {
    setIsClearing(true);
    try {
      const res = await apiClient.post("/admin/audit-logs/clear", {
        days: clearDays === "all" ? 0 : Number(clearDays)
      });
      if (res.data && res.data.success) {
        toast.success(res.data.message || "Audit logs purged successfully");
        setShowClearModal(false);
        fetchLogs();
      }
    } catch (error) {
      console.error("Clear logs error:", error);
      toast.error(error.response?.data?.message || "Failed to purge audit logs");
    } finally {
      setIsClearing(false);
    }
  };

  // Copy JSON metadata to clipboard
  const handleCopyJson = (data) => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopiedJson(true);
    toast.info("Event parameters copied to clipboard");
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const handleCopyId = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedLogId(true);
    toast.info("Log ID copied");
    setTimeout(() => setCopiedLogId(false), 2000);
  };

  // Helper formatting for time relative string
  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return "Just now";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "N/A";
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    if (seconds < 60) return `${Math.max(1, seconds)}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  // Action badge style mapper
  const getActionBadge = (action) => {
    const act = (action || "").toUpperCase();
    switch (act) {
      case "CREATE":
        return {
          bg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
          icon: <PlusCircle className="size-3.5" />,
          label: "CREATE"
        };
      case "UPDATE":
        return {
          bg: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30",
          icon: <Edit3 className="size-3.5" />,
          label: "UPDATE"
        };
      case "DELETE":
        return {
          bg: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30",
          icon: <Trash2 className="size-3.5" />,
          label: "DELETE"
        };
      case "STATUS_CHANGE":
        return {
          bg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
          icon: <SlidersHorizontal className="size-3.5" />,
          label: "STATUS"
        };
      case "SETTINGS_CHANGE":
        return {
          bg: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30",
          icon: <FiSliders className="size-3.5" />,
          label: "CONFIG"
        };
      case "BULK_ACTION":
        return {
          bg: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30",
          icon: <Database className="size-3.5" />,
          label: "BULK"
        };
      case "LOGIN":
        return {
          bg: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/30",
          icon: <LogIn className="size-3.5" />,
          label: "LOGIN"
        };
      case "LOGOUT":
        return {
          bg: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30",
          icon: <LogOut className="size-3.5" />,
          label: "LOGOUT"
        };
      case "SECURITY":
      case "AUTH_FAILURE":
        return {
          bg: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/30",
          icon: <Key className="size-3.5" />,
          label: "SECURITY"
        };
      default:
        return {
          bg: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30",
          icon: <FiActivity className="size-3.5" />,
          label: act || "EVENT"
        };
    }
  };

  // Role badge style mapper
  const getRoleBadge = (role) => {
    const r = (role || "").toLowerCase();
    if (r === "superadmin") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
          <Crown className="size-3 text-amber-500" /> Super Admin
        </span>
      );
    }
    if (r === "admin") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30">
          <ShieldCheck className="size-3 text-indigo-500" /> Admin
        </span>
      );
    }
    if (r === "subadmin") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30">
          <FiUser className="size-3 text-cyan-500" /> Sub Admin
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/30">
        <FiCpu className="size-3 text-slate-400" /> System
      </span>
    );
  };

  // IP address normalization helper
  const formatClientIp = (ip) => {
    if (!ip) return "127.0.0.1";
    if (ip === "::1" || ip === "::ffff:127.0.0.1" || ip === "fe80::1") return "127.0.0.1";
    if (ip.startsWith("::ffff:")) return ip.replace("::ffff:", "");
    return ip;
  };

  // Helper to check if any filters are currently active
  const hasActiveFilters =
    searchTerm.trim() !== "" ||
    selectedModule !== "ALL" ||
    selectedAction !== "ALL" ||
    selectedRole !== "ALL" ||
    startDate !== "" ||
    endDate !== "";

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-8 max-w-full mx-auto pb-16 text-left transition-colors duration-300">
      
      {/* 1. ENTERPRISE HEADER BANNER */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white rounded-3xl p-6 sm:p-8 border border-indigo-900/50 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none text-indigo-300">
          <ShieldCheck size={280} />
        </div>
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold tracking-widest uppercase">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live Security Surveillance Relay
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <FiShield className="text-indigo-400 shrink-0" size={32} />
              Security Audit & Activity Logs
            </h1>
            <p className="text-slate-300 font-medium text-xs sm:text-sm max-w-2xl">
              Comprehensive immutable ledger tracking administrative mutations, security authentications, configuration updates, and multi-tier operator activities.
            </p>
          </div>

          {/* Quick Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2.5 pt-2 lg:pt-0">
            {/* Auto-Refresh Toggle */}
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 border transition-all ${
                autoRefresh
                  ? "bg-emerald-500/20 border-emerald-400/40 text-emerald-300 shadow-lg shadow-emerald-500/10"
                  : "bg-white/10 border-white/10 text-slate-300 hover:bg-white/20"
              }`}
              title={autoRefresh ? "Auto-refresh active (15s)" : "Enable live polling"}
            >
              <RefreshCcw className={`size-3.5 ${autoRefresh ? "animate-spin text-emerald-400" : ""}`} />
              {autoRefresh ? `Live (${refreshCountdown}s)` : "Live Sync"}
            </button>

            {/* Manual Refresh Button */}
            <button
              onClick={() => fetchLogs()}
              disabled={loading}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 border border-white/15 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            >
              <RefreshCcw className={`size-3.5 ${loading ? "animate-spin text-indigo-400" : ""}`} />
              Refresh
            </button>

            {/* CSV Export Button */}
            <button
              onClick={handleExportCSV}
              disabled={isExporting}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-400/40 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all active:scale-95 disabled:opacity-50"
            >
              <Download className="size-3.5" />
              {isExporting ? "Exporting..." : "Export CSV"}
            </button>

            {/* Purge / Clear History (Superadmin Only) */}
            {isSuperAdmin && (
              <button
                onClick={() => setShowClearModal(true)}
                className="px-3.5 py-2 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all active:scale-95"
              >
                <Trash2 className="size-3.5" />
                Purge
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. INTERACTIVE KPI ANALYTICS CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Card 1: Total Events */}
        <button
          onClick={() => {
            setSelectedAction("ALL");
            setSelectedModule("ALL");
            setCurrentPage(1);
          }}
          className={`p-4 rounded-2xl border text-left transition-all group relative overflow-hidden ${
            selectedAction === "ALL" && selectedModule === "ALL"
              ? "bg-indigo-50/50 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-700 ring-2 ring-indigo-500/20"
              : "bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-800"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Registry</span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <FiLayers className="size-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {(stats?.total ?? 0).toLocaleString()}
            </div>
            <div className="text-[10px] font-semibold text-slate-500 mt-0.5">
              <span className="text-indigo-600 dark:text-indigo-400 font-bold">+{stats?.last24h ?? 0}</span> in last 24h
            </div>
          </div>
        </button>

        {/* Card 2: Creates */}
        <button
          onClick={() => {
            setSelectedAction(selectedAction === "CREATE" ? "ALL" : "CREATE");
            setCurrentPage(1);
          }}
          className={`p-4 rounded-2xl border text-left transition-all group relative overflow-hidden ${
            selectedAction === "CREATE"
              ? "bg-emerald-50/50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 ring-2 ring-emerald-500/20"
              : "bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-800"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Creations</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <PlusCircle className="size-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {(stats?.creates ?? 0).toLocaleString()}
            </div>
            <div className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">New resources added</div>
          </div>
        </button>

        {/* Card 3: Updates */}
        <button
          onClick={() => {
            setSelectedAction(selectedAction === "UPDATE" ? "ALL" : "UPDATE");
            setCurrentPage(1);
          }}
          className={`p-4 rounded-2xl border text-left transition-all group relative overflow-hidden ${
            selectedAction === "UPDATE"
              ? "bg-blue-50/50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700 ring-2 ring-blue-500/20"
              : "bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-800"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Modifications</span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Edit3 className="size-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {(stats?.updates ?? 0).toLocaleString()}
            </div>
            <div className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 mt-0.5">Edits & config tweaks</div>
          </div>
        </button>

        {/* Card 4: Deletes */}
        <button
          onClick={() => {
            setSelectedAction(selectedAction === "DELETE" ? "ALL" : "DELETE");
            setCurrentPage(1);
          }}
          className={`p-4 rounded-2xl border text-left transition-all group relative overflow-hidden ${
            selectedAction === "DELETE"
              ? "bg-rose-50/50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-700 ring-2 ring-rose-500/20"
              : "bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-rose-300 dark:hover:border-rose-800"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Removals</span>
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
              <Trash2 className="size-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {(stats?.deletes ?? 0).toLocaleString()}
            </div>
            <div className="text-[10px] font-semibold text-rose-600 dark:text-rose-400 mt-0.5">Deleted items</div>
          </div>
        </button>

        {/* Card 5: Config & Status Changes */}
        <button
          onClick={() => {
            setSelectedAction(selectedAction === "SETTINGS_CHANGE" ? "ALL" : "SETTINGS_CHANGE");
            setCurrentPage(1);
          }}
          className={`p-4 rounded-2xl border text-left transition-all group relative overflow-hidden col-span-2 sm:col-span-1 ${
            selectedAction === "SETTINGS_CHANGE"
              ? "bg-purple-50/50 dark:bg-purple-950/40 border-purple-300 dark:border-purple-700 ring-2 ring-purple-500/20"
              : "bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-800"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Config & Status</span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <SlidersHorizontal className="size-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {(stats?.configUpdates ?? 0).toLocaleString()}
            </div>
            <div className="text-[10px] font-semibold text-purple-600 dark:text-purple-400 mt-0.5">Settings & toggles</div>
          </div>
        </button>
      </div>

      {/* 3. MULTI-DIMENSION FILTER SUITE */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        
        {/* Main Controls Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          
          {/* Search bar */}
          <div className="relative col-span-1 sm:col-span-2 lg:col-span-2">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
            <input
              type="text"
              placeholder="Search by operator, module, target, or details..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-8 py-2.5 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <FiX className="size-4" />
              </button>
            )}
          </div>

          {/* Module Selector */}
          <div>
            <CustomDropdown
              options={MODULE_OPTIONS}
              value={selectedModule}
              onChange={(val) => {
                setSelectedModule(val);
                setCurrentPage(1);
              }}
              icon={Database}
            />
          </div>

          {/* Action Selector */}
          <div>
            <CustomDropdown
              options={ACTION_OPTIONS}
              value={selectedAction}
              onChange={(val) => {
                setSelectedAction(val);
                setCurrentPage(1);
              }}
              icon={FiActivity}
            />
          </div>

          {/* Role Selector */}
          <div>
            <CustomDropdown
              options={ROLE_OPTIONS}
              value={selectedRole}
              onChange={(val) => {
                setSelectedRole(val);
                setCurrentPage(1);
              }}
              icon={FiUser}
            />
          </div>
        </div>

        {/* CALENDAR DATE SELECTION & QUICK PRESETS */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mr-1">
              <CalendarIcon className="size-3.5 text-indigo-500" /> Date Filter:
            </span>

            {/* Start Date / From Input */}
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700/80">
              <span className="text-[10px] font-bold uppercase text-slate-400">From:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none cursor-pointer"
              />
            </div>

            {/* End Date / To Input */}
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700/80">
              <span className="text-[10px] font-bold uppercase text-slate-400">To:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none cursor-pointer"
              />
            </div>

            {/* Clear Date Helper Button */}
            {(startDate || endDate) && (
              <div className="flex items-center ml-1">
                <button
                  type="button"
                  onClick={() => setQuickDate("clear")}
                  className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 transition-all flex items-center gap-1"
                >
                  <FiX className="size-3" /> Clear Date
                </button>
              </div>
            )}
          </div>

          {/* Reset All Active Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="text-xs font-bold text-rose-500 hover:text-rose-600 dark:text-rose-400 flex items-center gap-1.5 transition-colors py-1"
            >
              <FiXCircle className="size-4" /> Reset All Filters
            </button>
          )}
        </div>

        {/* ACTIVE FILTER BADGES ROW */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Filters:</span>

            {searchTerm && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                Search: <strong className="text-indigo-900 dark:text-indigo-100">{searchTerm}</strong>
                <button onClick={() => setSearchTerm("")} className="hover:text-rose-500">
                  <FiX size={12} />
                </button>
              </span>
            )}

            {selectedModule !== "ALL" && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                Module: <strong className="text-indigo-900 dark:text-indigo-100">{selectedModule}</strong>
                <button onClick={() => setSelectedModule("ALL")} className="hover:text-rose-500">
                  <FiX size={12} />
                </button>
              </span>
            )}

            {selectedAction !== "ALL" && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                Action: <strong className="text-indigo-900 dark:text-indigo-100">{selectedAction}</strong>
                <button onClick={() => setSelectedAction("ALL")} className="hover:text-rose-500">
                  <FiX size={12} />
                </button>
              </span>
            )}

            {selectedRole !== "ALL" && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                Role: <strong className="text-indigo-900 dark:text-indigo-100">{selectedRole}</strong>
                <button onClick={() => setSelectedRole("ALL")} className="hover:text-rose-500">
                  <FiX size={12} />
                </button>
              </span>
            )}

            {(startDate || endDate) && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                Date: <strong className="text-indigo-900 dark:text-indigo-100">{startDate || "Start"} &rarr; {endDate || "Now"}</strong>
                <button onClick={() => setQuickDate("clear")} className="hover:text-rose-500">
                  <FiX size={12} />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* 4. AUDIT LOGS TABLE */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="px-5 py-3.5">Timestamp</th>
                <th className="px-5 py-3.5">Operator Identity</th>
                <th className="px-5 py-3.5">Module & Scope</th>
                <th className="px-5 py-3.5">Operation</th>
                <th className="px-5 py-3.5">Execution Summary</th>
                <th className="px-5 py-3.5">Client / IP</th>
                <th className="px-5 py-3.5 text-right">Dossier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-20 text-center">
                    <RefreshCcw className="size-8 animate-spin mx-auto text-indigo-600 opacity-50" />
                    <p className="mt-3 text-xs font-bold uppercase tracking-widest text-slate-400">
                      Syncing Surveillance Stream...
                    </p>
                  </td>
                </tr>
              ) : logs && logs.length > 0 ? (
                logs.map((log) => {
                  const badge = getActionBadge(log.action);
                  const createdAtDate = log.createdAt ? new Date(log.createdAt) : null;
                  const isValidDate = createdAtDate && !isNaN(createdAtDate.getTime());
                  return (
                    <tr 
                      key={log._id || Math.random()}
                      className="group hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* 1. Timestamp */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {isValidDate ? createdAtDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : "N/A"}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {isValidDate ? createdAtDate.toLocaleDateString() : ""} &bull; {formatTimeAgo(log.createdAt)}
                          </span>
                        </div>
                      </td>

                      {/* 2. Operator Identity */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="size-8 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white font-black text-xs flex items-center justify-center shadow-sm shrink-0">
                            {(log.adminName || "A").charAt(0).toUpperCase()}
                          </div>
                          <div className="flex flex-col min-w-[110px]">
                            <span className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[130px]" title={log.adminName}>
                              {log.adminName || "System / Unspecified"}
                            </span>
                            <div className="mt-0.5">
                              {getRoleBadge(log.adminRole)}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 3. Module & Target */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex flex-col items-start gap-1">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            {log.module || "SYSTEM"}
                          </span>
                          {log.targetName && (
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold truncate max-w-[130px]" title={log.targetName}>
                              {log.targetName}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 4. Action */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border shadow-sm ${badge.bg}`}>
                          {badge.icon}
                          {badge.label}
                        </span>
                      </td>

                      {/* 5. Execution Summary */}
                      <td className="px-5 py-3.5">
                        <p className="text-xs font-medium text-slate-700 dark:text-slate-300 line-clamp-2 max-w-md">
                          {log.details || "No details provided"}
                        </p>
                      </td>

                      {/* 6. Client IP & Browser */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex flex-col items-start gap-0.5">
                          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-600 dark:text-slate-400 font-medium">
                            <FiGlobe className="size-3 text-slate-400" />
                            {formatClientIp(log.ipAddress)}
                          </span>
                          {log.userAgent && (
                            <span className="text-[10px] text-slate-400 truncate max-w-[110px]" title={log.userAgent}>
                              {log.userAgent.includes("Chrome") ? "Chrome" : log.userAgent.includes("Safari") ? "Safari" : log.userAgent.includes("Firefox") ? "Firefox" : "Browser"}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 7. Action Button */}
                      <td className="px-5 py-3.5 whitespace-nowrap text-right">
                        <button
                          onClick={() => setInspectLog(log)}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700 text-xs font-bold inline-flex items-center gap-1.5 transition-colors"
                        >
                          <FiEye className="size-3.5" /> Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-16 text-center">
                    <div className="max-w-sm mx-auto space-y-3">
                      <FiAlertCircle className="size-10 mx-auto text-slate-300 dark:text-slate-600" />
                      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        No Audit Records Found
                      </h3>
                      <p className="text-xs text-slate-500">
                        No security activity matches your current search criteria or date filter.
                      </p>
                      {hasActiveFilters && (
                        <button
                          onClick={handleResetFilters}
                          className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1"
                        >
                          <FiXCircle size={12} /> Clear Filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION & FOOTER CONTROLS */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 sm:px-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
            <span>
              Showing <strong className="text-slate-800 dark:text-white">{logs?.length || 0}</strong> of <strong className="text-slate-800 dark:text-white">{totalRecords || 0}</strong> events
            </span>
            <span>&bull;</span>
            <div className="flex items-center gap-1.5">
              <span>Per page:</span>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-xs font-bold text-slate-700 dark:text-slate-300 outline-none"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1 || loading}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="size-4" />
            </button>

            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 px-3">
              Page {currentPage} of {Math.max(1, totalPages || 1)}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages || 1, p + 1))}
              disabled={currentPage >= (totalPages || 1) || loading}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 5. AUDIT EVENT DOSSIER MODAL */}
      <AnimatePresence>
        {inspectLog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                    <FiShield size={20} />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                      Audit Event Dossier
                      <button
                        onClick={() => handleCopyId(inspectLog._id)}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 flex items-center gap-1"
                        title="Click to copy ID"
                      >
                        {copiedLogId ? <FiCheck className="size-3 text-emerald-500" /> : <FiCopy className="size-3" />}
                        {inspectLog._id}
                      </button>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Recorded at {inspectLog.createdAt ? new Date(inspectLog.createdAt).toLocaleString() : "N/A"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setInspectLog(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
                >
                  <FiX size={20} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs">
                {/* Key Attributes Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Operator</span>
                    <span className="font-bold text-slate-900 dark:text-white text-xs block">{inspectLog.adminName || "N/A"}</span>
                    <span className="text-[10px] text-slate-400 block truncate" title={inspectLog.adminEmail}>{inspectLog.adminEmail || "No email"}</span>
                    <div className="mt-1.5">{getRoleBadge(inspectLog.adminRole)}</div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Scope & Action</span>
                    <span className="font-bold text-slate-900 dark:text-white text-xs block">{inspectLog.module || "SYSTEM"}</span>
                    <div className="mt-1.5">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getActionBadge(inspectLog.action).bg}`}>
                        {inspectLog.action}
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 col-span-2 sm:col-span-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Network Client</span>
                    <span className="font-mono text-slate-900 dark:text-white text-xs block">{formatClientIp(inspectLog.ipAddress)}</span>
                    <span className="text-[10px] text-slate-400 block truncate mt-1" title={inspectLog.userAgent}>
                      {inspectLog.userAgent || "Desktop Client"}
                    </span>
                  </div>
                </div>

                {/* Target Information */}
                {(inspectLog.targetName || inspectLog.targetId) && (
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Affected Resource</span>
                      <span className="font-bold text-slate-900 dark:text-white text-xs">{inspectLog.targetName || "Unnamed Entity"}</span>
                    </div>
                    {inspectLog.targetId && (
                      <span className="text-[10px] font-mono px-2.5 py-1 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-500">
                        ID: {inspectLog.targetId}
                      </span>
                    )}
                  </div>
                )}

                {/* Description Narrative */}
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                    Execution Details
                  </label>
                  <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-mono text-xs leading-relaxed">
                    {inspectLog.details || "No details available"}
                  </div>
                </div>

                {/* Metadata Details Table (No JSON view) */}
                {inspectLog.metadata && Object.keys(inspectLog.metadata).length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <FiLayers className="size-3.5" /> Event Parameters & Context
                      </label>
                      <button
                        onClick={() => handleCopyJson(inspectLog.metadata)}
                        className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                      >
                        {copiedJson ? <FiCheck className="size-3 text-emerald-500" /> : <FiCopy className="size-3" />}
                        {copiedJson ? "Copied" : "Copy Data"}
                      </button>
                    </div>
                    <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 overflow-hidden">
                      {Object.entries(inspectLog.metadata).map(([key, value], idx) => {
                        const isObject = value !== null && typeof value === "object" && !Array.isArray(value);
                        const isArray = Array.isArray(value);
                        const formatKey = (k) => k.replace(/([A-Z])/g, " $1").replace(/[_-]/g, " ").replace(/^\w/, (c) => c.toUpperCase()).trim();

                        return (
                          <div
                            key={key}
                            className={`flex flex-col sm:flex-row ${idx !== 0 ? "border-t border-slate-100 dark:border-slate-800" : ""}`}
                          >
                            <div className="sm:w-[170px] shrink-0 px-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 flex items-start">
                              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                {formatKey(key)}
                              </span>
                            </div>
                            <div className="flex-1 px-4 py-2.5">
                              {isObject ? (
                                <div className="space-y-1.5">
                                  {Object.entries(value).map(([subKey, subVal]) => (
                                    <div key={subKey} className="flex items-start gap-2">
                                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 min-w-[70px] shrink-0 pt-0.5">
                                        {formatKey(subKey)}
                                      </span>
                                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 break-all">
                                        {typeof subVal === "object" ? JSON.stringify(subVal) : String(subVal ?? "—")}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              ) : isArray ? (
                                <div className="flex flex-wrap gap-1.5">
                                  {value.map((item, i) => (
                                    <span
                                      key={i}
                                      className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                                    >
                                      {typeof item === "object" ? JSON.stringify(item) : String(item)}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 break-all">
                                  {String(value ?? "—")}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex justify-end">
                <button
                  onClick={() => setInspectLog(null)}
                  className="px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity"
                >
                  Close Dossier
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 6. CLEAR LOGS MODAL (SUPERADMIN ONLY) */}
      <AnimatePresence>
        {showClearModal && isSuperAdmin && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-md overflow-hidden p-6 space-y-5"
            >
              <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
                <div className="size-10 rounded-xl bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center">
                  <ShieldAlert size={22} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">Purge Audit Log History</h3>
                  <p className="text-xs text-slate-500">Super Administrator Authorization Required</p>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Purging removes older security audit entries permanently from the database. Select the retention threshold for logs to purge:
              </p>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
                  Retention Policy
                </label>
                <select
                  value={clearDays}
                  onChange={(e) => setClearDays(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 outline-none"
                >
                  <option value={30}>Purge logs older than 30 days</option>
                  <option value={60}>Purge logs older than 60 days</option>
                  <option value={90}>Purge logs older than 90 days (Recommended)</option>
                  <option value={180}>Purge logs older than 180 days</option>
                  <option value="all">Purge ALL logs (Complete Flush)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowClearModal(false)}
                  disabled={isClearing}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearLogs}
                  disabled={isClearing}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-rose-600/30 transition-all disabled:opacity-50"
                >
                  {isClearing ? <RefreshCcw className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
                  {isClearing ? "Purging..." : "Confirm Purge"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AuditLogs;
