import { useState, useEffect } from "react";
import { 
  FiBarChart2, 
  FiUsers, 
  FiMapPin, 
  FiCalendar, 
  FiHome, 
  FiEdit, 
  FiMessageSquare, 
  FiMail,
  FiTrendingUp,
  FiActivity,
  FiDownload,
  FiClock,
  FiArrowRight,
  FiGlobe,
  FiLoader
} from "react-icons/fi";
import { 
  ShieldCheck, 
  Sparkles, 
  Target, 
  ArrowUpRight, 
  Zap, 
  Box,
  PieChart as PieIcon,
  LineChart as LineIcon
} from "lucide-react";
import { apiClient } from "../../stores/authStores";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell 
} from "recharts";

const Reports = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await apiClient.get("/admin/reports/stats");
        setStats(res.data.data);
      } catch (error) {
        console.error("Error fetching report stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const StatCard = ({ title, value, icon: Icon, color, delay, subtext }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      whileHover={{ y: -4 }}
      className="bg-white dark:bg-[#091126] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm group cursor-default text-left flex flex-col justify-between"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</p>
          <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">{value ?? 0}</h3>
          {subtext && <p className="mt-2 text-[10px] font-bold text-blue-500 dark:text-blue-400 uppercase tracking-wider">{subtext}</p>}
        </div>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm ${color}`}>
          <Icon className="size-6 text-white" />
        </div>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="flex min-h-[600px] flex-col items-center justify-center gap-6">
        <FiLoader className="h-10 w-10 animate-spin text-blue-500" strokeWidth={2} />
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Syncing Intelligence Core...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8 pb-20 font-sans min-h-screen text-slate-900 dark:text-slate-100 text-left">
      {/* ── HEADER HUB ── */}
      <div className="bg-white dark:bg-[#091126] rounded-3xl py-4 sm:py-5 px-6 sm:px-8 border border-slate-200 dark:border-slate-800 shadow-md relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0">
            <Target size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-500 dark:text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full">
                ANALYTICS & INTELLIGENCE
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2 flex-wrap">
              Intelligence <span className="text-blue-500">Hub</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-semibold mt-0.5 text-xs sm:text-sm">
              Performance overview and inventory distribution analytics
            </p>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <button 
            onClick={() => alert('Exporting Logic Store...')}
            className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all cursor-pointer active:scale-95"
          >
            <FiDownload size={15} /> Export Dataset
          </button>
        </div>
      </div>

      {/* Leads Statistics */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-4 w-1 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full" />
          <h2 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">Strategic Conversion Funnel</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard 
            title="Total Flux" 
            value={stats?.leads?.total} 
            icon={FiActivity} 
            color="bg-gradient-to-br from-blue-600 to-indigo-600" 
            delay={0}
            subtext="Combined Engine Leads"
          />
          <StatCard 
            title="Advisory" 
            value={stats?.leads?.consultations} 
            icon={FiUsers} 
            color="bg-gradient-to-br from-indigo-500 to-purple-600" 
            delay={0.1}
            subtext="Direct Sync Requests"
          />
          <StatCard 
            title="Drafts" 
            value={stats?.leads?.tripRequests} 
            icon={FiCalendar} 
            color="bg-gradient-to-br from-purple-500 to-pink-600" 
            delay={0.2}
            subtext="Customized Blueprints"
          />
          <StatCard 
            title="Inquiries" 
            value={stats?.leads?.contacts} 
            icon={FiMessageSquare} 
            color="bg-gradient-to-br from-sky-500 to-blue-600" 
            delay={0.3}
            subtext="General Comms"
          />
          <StatCard 
            title="Audience" 
            value={stats?.leads?.subscribers} 
            icon={FiMail} 
            color="bg-gradient-to-br from-emerald-500 to-teal-600" 
            delay={0.4}
            subtext="Registry Growth"
          />
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-8 bg-white dark:bg-[#091126] rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0">
                <LineIcon size={20} />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Generation Trends</h3>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">Real-time engagement velocity</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2"><div className="size-2.5 rounded-full bg-indigo-600 shadow-sm" /> Leads</div>
              <div className="flex items-center gap-2"><div className="size-2.5 rounded-full bg-slate-300 dark:bg-slate-700 shadow-inner" /> Audience</div>
            </div>
          </div>
          
          <div className="h-[380px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.leadTrends || []}>
                <defs>
                  <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4338ca" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#4338ca" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="rgba(148, 163, 184, 0.15)" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }} 
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '16px', 
                    backgroundColor: '#091126',
                    borderColor: 'rgba(99, 102, 241, 0.3)',
                    color: '#fff',
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.5)',
                    fontSize: '12px',
                    fontWeight: '700',
                    padding: '12px 16px'
                  }} 
                />
                <Area type="monotone" dataKey="leads" stroke="#4f46e5" strokeWidth={3.5} fillOpacity={1} fill="url(#colorLeads)" />
                <Area type="monotone" dataKey="subscribers" stroke="#94a3b8" strokeWidth={2} fill="transparent" strokeDasharray="6 6" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-4 bg-white dark:bg-[#091126] rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center gap-3.5 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0">
              <PieIcon size={20} />
            </div>
            <div className="text-left">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Distribution</h3>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">Asset Segmentation</p>
            </div>
          </div>
          
          <div className="h-[260px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Advisory', value: stats?.leads?.consultations },
                    { name: 'Drafts', value: stats?.leads?.tripRequests },
                    { name: 'Inquiries', value: stats?.leads?.contacts },
                    { name: 'Audience', value: stats?.leads?.subscribers },
                  ]}
                  innerRadius={75}
                  outerRadius={100}
                  paddingAngle={6}
                  dataKey="value"
                >
                  <Cell fill="#3b82f6" />
                  <Cell fill="#6366f1" />
                  <Cell fill="#a855f7" />
                  <Cell fill="#14b8a6" />
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '16px', 
                    backgroundColor: '#091126',
                    borderColor: 'rgba(99, 102, 241, 0.3)',
                    color: '#fff',
                    fontSize: '12px',
                    fontWeight: '700'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-3xl font-black text-slate-900 dark:text-white">{stats?.leads?.total ?? 0}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Hub</p>
            </div>
          </div>

          <div className="space-y-4 mt-6 text-left">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <span>Consultation Yield</span>
              <span className="text-slate-900 dark:text-white font-extrabold">{((stats?.leads?.consultations / (stats?.leads?.total || 1)) * 100).toFixed(1)}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
               <div style={{ width: `${(stats?.leads?.consultations / (stats?.leads?.total || 1)) * 100}%` }} className="bg-blue-500 h-full" />
               <div style={{ width: `${(stats?.leads?.tripRequests / (stats?.leads?.total || 1)) * 100}%` }} className="bg-indigo-500 h-full" />
               <div style={{ width: `${(stats?.leads?.contacts / (stats?.leads?.total || 1)) * 100}%` }} className="bg-purple-500 h-full" />
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Recent Activity Table */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="xl:col-span-2 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#091126] shadow-sm overflow-hidden"
        >
          <div className="p-6 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-sm">
                <FiClock size={18} />
              </div>
              <div className="text-left">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Activity Stream</h2>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">Real-time sync feed</p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-3 py-1 bg-blue-500/10 text-blue-500 dark:text-blue-400 rounded-full uppercase tracking-wider border border-blue-500/20 animate-pulse">Live Relay</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 dark:bg-[#050A17]/60 border-b border-slate-200 dark:border-slate-800/80">
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Customer Entity</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Timestamp</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Operation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {stats?.recentActivity?.map((activity, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-slate-100">{activity.name}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-3 py-1 rounded-lg uppercase tracking-wider border ${
                        activity.type === 'Contact' ? 'bg-sky-500/10 border-sky-500/20 text-sky-600 dark:text-sky-400' :
                        activity.type === 'Trip Request' ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-600 dark:text-indigo-400' :
                        'bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400'
                      }`}>
                        {activity.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {new Date(activity.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800/80 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs uppercase tracking-wider inline-flex items-center gap-1.5 border border-slate-200 dark:border-slate-700/60 transition-all cursor-pointer">
                        Inspect <ArrowUpRight size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Content Distribution */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#091126] p-6 sm:p-8 shadow-sm flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center gap-3.5 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0">
                <FiGlobe size={18} />
              </div>
              <div className="text-left">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Inventory Distribution</h2>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">Global content footprint</p>
              </div>
            </div>
            
            <div className="space-y-6 text-left">
              <div>
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-2">
                  <span className="text-slate-500 dark:text-slate-400">Domestic Nodes</span>
                  <span className="text-slate-900 dark:text-white font-extrabold">{stats?.content?.domestic ?? 0} Entries</span>
                </div>
                <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(stats?.content?.domestic / (stats?.content?.destinations || 1)) * 100}%` }}
                    className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full shadow-sm" 
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-2">
                  <span className="text-slate-500 dark:text-slate-400">International Nodes</span>
                  <span className="text-slate-900 dark:text-white font-extrabold">{stats?.content?.international ?? 0} Entries</span>
                </div>
                <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(stats?.content?.international / (stats?.content?.destinations || 1)) * 100}%` }}
                    className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full shadow-sm" 
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-slate-200 dark:border-slate-800/80">
                <h3 className="text-[11px] font-bold text-blue-500 dark:text-blue-400 uppercase tracking-wider mb-4">Registry Totals</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 dark:bg-[#050A17] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner text-left">
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider mb-1">Resorts</p>
                    <p className="text-2xl font-black text-slate-900 dark:text-white">{stats?.content?.resorts ?? 0}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-[#050A17] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner text-left">
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider mb-1">Itineraries</p>
                    <p className="text-2xl font-black text-slate-900 dark:text-white">{stats?.content?.itineraries ?? 0}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <Link 
            to="/destinations/create" 
            className="w-full mt-8 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold uppercase tracking-wider shadow-sm active:scale-95 transition-all"
          >
            <Box size={16} /> Sync Logic Vault
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default Reports;
