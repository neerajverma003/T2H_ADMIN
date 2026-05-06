import { useState, useEffect } from "react";
import { apiClient } from "../../stores/authStores";
import { motion } from "framer-motion";
import { 
  FiShield, 
  FiClock, 
  FiUser, 
  FiActivity, 
  FiSearch,
  FiFilter,
  FiRefreshCw,
  FiAlertCircle
} from "react-icons/fi";
import { ShieldCheck, Zap, Sparkles, RefreshCcw, Search, Filter } from "lucide-react";

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/admin/audit-logs");
      if (res.data.success) {
        setLogs(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching audit logs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => 
    log.adminName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.module.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.details.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getActionColor = (action) => {
    switch (action) {
      case 'CREATE': return 'bg-emerald-50 border-emerald-100 text-emerald-700 shadow-emerald-500/10';
      case 'UPDATE': return 'bg-indigo-50 border-indigo-100 text-indigo-700 shadow-indigo-500/10';
      case 'DELETE': return 'bg-rose-50 border-rose-100 text-rose-700 shadow-rose-500/10';
      default: return 'bg-slate-50 border-slate-100 text-slate-700 shadow-slate-500/10';
    }
  };

  return (
    <div className="flex flex-col gap-y-10 p-6 max-w-full mx-auto pb-24 text-left">
      {/* Header Hub */}
      <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-12 border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden text-left">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none text-indigo-700"><ShieldCheck size={240} /></div>
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-10">
            <div>
                <h1 className="text-4xl font-black text-slate-950 dark:text-white tracking-tight flex items-center gap-5">
                    <FiShield className="text-indigo-700" size={44} /> SECURITY AUDIT
                </h1>
                <p className="text-slate-600 dark:text-slate-400 font-bold mt-2 text-xl italic text-left">Authorized administrative surveillance and sync relay</p>
            </div>
            <button 
                onClick={fetchLogs}
                className="px-8 py-5 bg-indigo-700 text-white rounded-[1.5rem] text-sm font-black uppercase tracking-[0.2em] flex items-center gap-3 shadow-2xl shadow-indigo-500/40 hover:bg-indigo-800 transition-all active:scale-95"
            >
                <RefreshCcw className={loading ? "animate-spin" : ""} size={20} /> SYNC REGISTRY
            </button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="relative flex-1 group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-700 transition-colors" size={24} />
          <input 
            type="text"
            placeholder="Surveil admin activity, modules, or actions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-16 pr-8 py-5 bg-white dark:bg-slate-900 border-2 border-transparent focus:border-indigo-700/10 rounded-[1.5rem] outline-none shadow-xl shadow-slate-200/40 focus:ring-4 focus:ring-indigo-500/10 transition-all text-lg font-black text-slate-950 dark:text-white placeholder:text-slate-400"
          />
        </div>
        <button className="flex items-center gap-3 px-10 py-5 rounded-[1.5rem] bg-white dark:bg-slate-900 border-2 border-slate-50 text-slate-950 dark:text-white text-sm font-black uppercase tracking-[0.2em] shadow-xl hover:bg-slate-50 transition-all">
          <Filter size={20} /> SEGMENT
        </button>
      </div>

      {/* Logs Table */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 dark:bg-slate-800/30 border-b-2 border-slate-50 dark:border-slate-800">
              <tr>
                <th className="px-10 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Temporal Frame</th>
                <th className="px-10 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Admin Identity</th>
                <th className="px-10 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Logic Hub</th>
                <th className="px-10 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Operation</th>
                <th className="px-10 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Execution Details</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-slate-50 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-10 py-32 text-center">
                    <RefreshCcw className="size-16 animate-spin mx-auto text-indigo-700 opacity-20" />
                    <p className="mt-6 text-xs font-black uppercase tracking-[0.4em] text-slate-400">Syncing Surveillance Stream...</p>
                  </td>
                </tr>
              ) : filteredLogs.length > 0 ? (
                filteredLogs.map((log, idx) => (
                  <tr key={idx} className="group hover:bg-indigo-50/30 transition-all duration-300">
                    <td className="px-10 py-8 whitespace-nowrap">
                      <div className="flex items-center gap-3 text-slate-400 font-black uppercase tracking-widest text-[10px]">
                        <FiClock size={16} className="text-indigo-700" />
                        <span>{new Date(log.createdAt).toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-4">
                        <div className="size-12 rounded-xl bg-indigo-700 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                          <FiUser size={20} />
                        </div>
                        <span className="text-lg font-black text-slate-950 dark:text-white uppercase tracking-tight">{log.adminName}</span>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <span className="text-[10px] font-black text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-4 py-2 rounded-xl border-2 border-indigo-100 dark:border-indigo-900/50 uppercase tracking-widest shadow-sm">
                        {log.module}
                      </span>
                    </td>
                    <td className="px-10 py-8">
                      <span className={`text-[10px] font-black px-4 py-2 rounded-xl border-2 uppercase tracking-widest shadow-sm ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-10 py-8">
                      <p className="text-base font-black text-slate-600 dark:text-slate-400 group-hover:text-slate-950 dark:group-hover:text-white transition-colors italic leading-relaxed">
                        "{log.details}"
                      </p>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-10 py-32 text-center">
                    <div className="max-w-md mx-auto space-y-6">
                       <FiAlertCircle className="size-20 mx-auto text-slate-200" strokeWidth={1} />
                       <h3 className="text-2xl font-black text-slate-950 uppercase tracking-tight">Zero Activity Detected</h3>
                       <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No surveillance matches found in the current frame</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default AuditLogs;
