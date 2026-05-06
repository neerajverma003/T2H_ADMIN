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
      whileHover={{ y: -8 }}
      className="rounded-[2.5rem] border border-slate-100 bg-white p-10 shadow-xl shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900 group cursor-default text-left"
    >
      <div className="flex items-center justify-between gap-6">
        <div className="text-left">
          <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-4">{title}</p>
          <h3 className="text-4xl font-black text-slate-950 dark:text-slate-50 tracking-tighter">{value}</h3>
          {subtext && <p className="mt-4 text-[10px] font-black text-indigo-700 uppercase tracking-widest italic">{subtext}</p>}
        </div>
        <div className={`size-16 rounded-2xl flex items-center justify-center transition-transform group-hover:rotate-12 shadow-2xl ${color}`}>
          <Icon className="size-8 text-white" />
        </div>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="flex min-h-[600px] flex-col items-center justify-center gap-8">
        <FiLoader className="h-16 w-16 animate-spin text-indigo-700" strokeWidth={1} />
        <p className="text-xs font-black uppercase tracking-[0.4em] text-slate-400">Syncing Intelligence Core...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-y-12 p-6 max-w-full mx-auto pb-24 text-left">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] p-12 border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none text-indigo-700"><Zap size={240} /></div>
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-10">
            <div>
                <h1 className="text-4xl font-black text-slate-950 dark:text-white tracking-tight flex items-center gap-5">
                    <Target className="text-indigo-700" size={44} /> INTELLIGENCE HUB
                </h1>
                <p className="text-slate-600 dark:text-slate-400 font-bold mt-2 text-xl italic text-left">Performance overview and inventory distribution analytics</p>
            </div>
            <div className="flex items-center gap-5">
                <button 
                    onClick={() => alert('Exporting Logic Store...')}
                    className="px-8 py-5 bg-indigo-700 text-white rounded-[1.5rem] text-sm font-black uppercase tracking-[0.2em] flex items-center gap-3 shadow-2xl shadow-indigo-500/40 hover:bg-indigo-800 transition-all active:scale-95"
                >
                    <FiDownload size={20} /> Export Dataset
                </button>
            </div>
        </div>
      </div>

      {/* Leads Statistics */}
      <div className="space-y-10">
        <div className="flex items-center gap-4">
            <div className="h-[2px] w-12 bg-indigo-700" />
            <h2 className="text-xs font-black text-slate-950 dark:text-slate-50 uppercase tracking-[0.4em]">Strategic Conversion Funnel</h2>
        </div>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard 
            title="Total Flux" 
            value={stats?.leads?.total} 
            icon={FiActivity} 
            color="bg-slate-950 shadow-black/20" 
            delay={0}
            subtext="Combined Engine Leads"
          />
          <StatCard 
            title="Advisory" 
            value={stats?.leads?.consultations} 
            icon={FiUsers} 
            color="bg-indigo-700 shadow-indigo-500/20" 
            delay={0.1}
            subtext="Direct Sync Requests"
          />
          <StatCard 
            title="Drafts" 
            value={stats?.leads?.tripRequests} 
            icon={FiCalendar} 
            color="bg-indigo-600 shadow-indigo-500/20" 
            delay={0.2}
            subtext="Customized Blueprints"
          />
          <StatCard 
            title="Inquiries" 
            value={stats?.leads?.contacts} 
            icon={FiMessageSquare} 
            color="bg-slate-800 shadow-black/20" 
            delay={0.3}
            subtext="General Comms"
          />
          <StatCard 
            title="Audience" 
            value={stats?.leads?.subscribers} 
            icon={FiMail} 
            color="bg-indigo-900 shadow-indigo-900/20" 
            delay={0.4}
            subtext="Registry Growth"
          />
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 p-12 shadow-2xl shadow-slate-200/50"
        >
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-5">
                <div className="size-14 bg-indigo-700 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-500/30">
                    <LineIcon size={28} />
                </div>
                <div className="text-left">
                    <h3 className="text-2xl font-black text-slate-950 dark:text-slate-50 uppercase tracking-tight">Generation Trends</h3>
                    <p className="text-xs font-black text-indigo-700 uppercase tracking-widest mt-1 italic">Real-time engagement velocity</p>
                </div>
            </div>
            <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-[0.25em]">
              <div className="flex items-center gap-3"><div className="size-3 rounded-full bg-indigo-700 shadow-lg" /> Leads</div>
              <div className="flex items-center gap-3"><div className="size-3 rounded-full bg-slate-200 shadow-inner" /> Audience</div>
            </div>
          </div>
          
          <div className="h-[450px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.leadTrends || []}>
                <defs>
                  <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4338ca" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#4338ca" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 900, fill: '#64748b', letterSpacing: '0.2em' }} 
                  dy={20}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 900, fill: '#64748b' }} 
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '24px', 
                    border: 'none', 
                    boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)',
                    fontSize: '14px',
                    fontWeight: '900',
                    padding: '20px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em'
                  }} 
                />
                <Area type="monotone" dataKey="leads" stroke="#4338ca" strokeWidth={5} fillOpacity={1} fill="url(#colorLeads)" />
                <Area type="monotone" dataKey="subscribers" stroke="#e2e8f0" strokeWidth={3} fill="transparent" strokeDasharray="10 10" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 p-12 shadow-2xl shadow-slate-200/50 flex flex-col"
        >
          <div className="flex items-center gap-5 mb-12">
            <div className="size-14 bg-indigo-700 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-500/30">
                <PieIcon size={28} />
            </div>
            <div className="text-left">
                <h3 className="text-2xl font-black text-slate-950 dark:text-slate-50 uppercase tracking-tight">Distribution</h3>
                <p className="text-xs font-black text-indigo-700 uppercase tracking-widest mt-1 italic">Asset Segmentation</p>
            </div>
          </div>
          
          <div className="h-[350px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Advisory', value: stats?.leads?.consultations },
                    { name: 'Drafts', value: stats?.leads?.tripRequests },
                    { name: 'Inquiries', value: stats?.leads?.contacts },
                    { name: 'Audience', value: stats?.leads?.subscribers },
                  ]}
                  innerRadius={90}
                  outerRadius={120}
                  paddingAngle={8}
                  dataKey="value"
                >
                  <Cell fill="#4338ca" />
                  <Cell fill="#0f172a" />
                  <Cell fill="#6366f1" />
                  <Cell fill="#94a3b8" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="text-4xl font-black text-slate-950">{stats?.leads?.total}</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Hub</p>
            </div>
          </div>

          <div className="space-y-6 mt-12 text-left">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Consultation Yield</span>
              <span className="text-sm font-black text-slate-950 uppercase tracking-widest">{((stats?.leads?.consultations / stats?.leads?.total) * 100).toFixed(1)}%</span>
            </div>
            <div className="w-full h-4 bg-slate-50 rounded-full overflow-hidden flex shadow-inner border border-slate-100">
               <div style={{ width: `${(stats?.leads?.consultations / stats?.leads?.total) * 100}%` }} className="bg-indigo-700 h-full" />
               <div style={{ width: `${(stats?.leads?.tripRequests / stats?.leads?.total) * 100}%` }} className="bg-slate-950 h-full" />
               <div style={{ width: `${(stats?.leads?.contacts / stats?.leads?.total) * 100}%` }} className="bg-indigo-500 h-full" />
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        {/* Recent Activity Table */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          className="xl:col-span-2 rounded-[3.5rem] border border-slate-100 bg-white shadow-2xl shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900 overflow-hidden"
        >
          <div className="p-10 border-b-2 border-slate-50 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-5">
                <div className="size-14 bg-indigo-700 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-500/30">
                    <FiClock size={28} />
                </div>
                <div className="text-left">
                    <h2 className="text-2xl font-black text-slate-950 dark:text-slate-50 uppercase tracking-tight">Activity Stream</h2>
                    <p className="text-xs font-black text-indigo-700 uppercase tracking-widest mt-1 italic">Real-time sync feed</p>
                </div>
            </div>
            <span className="text-[10px] font-black px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full uppercase tracking-widest animate-pulse border border-indigo-100">Live Relay</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50">
                  <th className="px-10 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Customer Entity</th>
                  <th className="px-10 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Category</th>
                  <th className="px-10 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Timestamp</th>
                  <th className="px-10 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em] text-right">Operation</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-slate-50 dark:divide-slate-800">
                {stats?.recentActivity?.map((activity, idx) => (
                  <tr key={idx} className="hover:bg-indigo-50/30 transition-all duration-300">
                    <td className="px-10 py-8 text-lg font-black text-slate-950 dark:text-slate-100">{activity.name}</td>
                    <td className="px-10 py-8">
                      <span className={`text-[10px] font-black px-4 py-2 rounded-xl uppercase tracking-widest border shadow-sm ${
                        activity.type === 'Contact' ? 'bg-slate-50 border-slate-200 text-slate-600' :
                        activity.type === 'Trip Request' ? 'bg-indigo-700 border-indigo-700 text-white shadow-indigo-500/20' :
                        'bg-slate-950 border-slate-950 text-white shadow-black/20'
                      }`}>
                        {activity.type}
                      </span>
                    </td>
                    <td className="px-10 py-8 text-sm font-black text-slate-400 uppercase tracking-widest">
                      {new Date(activity.date).toLocaleDateString()}
                    </td>
                    <td className="px-10 py-8 text-right">
                      <button className="px-6 py-3 bg-white text-indigo-700 rounded-xl hover:bg-indigo-700 hover:text-white font-black text-xs uppercase tracking-widest flex items-center justify-end gap-2 ml-auto shadow-xl border border-slate-100 transition-all active:scale-95">
                        Inspect <ArrowUpRight size={14} />
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
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          className="rounded-[3.5rem] border border-slate-100 bg-white p-12 shadow-2xl shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900 flex flex-col"
        >
          <div className="flex items-center gap-5 mb-12">
            <div className="size-14 bg-indigo-700 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-500/30">
                <FiGlobe size={28} />
            </div>
            <div className="text-left">
                <h2 className="text-2xl font-black text-slate-950 dark:text-slate-50 uppercase tracking-tight">Inventory Distribution</h2>
                <p className="text-xs font-black text-indigo-700 uppercase tracking-widest mt-1 italic">Global content footprint</p>
            </div>
          </div>
          
          <div className="space-y-10 text-left flex-1">
            <div>
              <div className="flex justify-between text-xs font-black uppercase tracking-[0.2em] mb-4">
                <span className="text-slate-400">Domestic Nodes</span>
                <span className="text-slate-950 dark:text-white">{stats?.content?.domestic} Registry Entries</span>
              </div>
              <div className="h-6 bg-slate-50 rounded-full overflow-hidden shadow-inner border border-slate-100">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(stats?.content?.domestic / stats?.content?.destinations) * 100}%` }}
                  className="h-full bg-indigo-700 rounded-full shadow-lg" 
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-black uppercase tracking-[0.2em] mb-4">
                <span className="text-slate-400">International Nodes</span>
                <span className="text-slate-950 dark:text-white">{stats?.content?.international} Registry Entries</span>
              </div>
              <div className="h-6 bg-slate-50 rounded-full overflow-hidden shadow-inner border border-slate-100">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(stats?.content?.international / stats?.content?.destinations) * 100}%` }}
                  className="h-full bg-slate-950 rounded-full shadow-lg" 
                />
              </div>
            </div>

            <div className="pt-10 border-t-2 border-slate-50 mt-10">
              <h3 className="text-xs font-black text-indigo-700 uppercase tracking-[0.3em] mb-8">Registry Totals</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-slate-50 dark:bg-slate-800 p-8 rounded-[2rem] border-2 border-slate-100 dark:border-slate-800 shadow-sm text-left">
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-2">Honeymoon Resorts</p>
                  <p className="text-4xl font-black text-slate-950 dark:text-slate-50 tracking-tighter">{stats?.content?.resorts}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 p-8 rounded-[2rem] border-2 border-slate-100 dark:border-slate-800 shadow-sm text-left">
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-2">Active Itineraries</p>
                  <p className="text-4xl font-black text-slate-950 dark:text-slate-50 tracking-tighter">{stats?.content?.itineraries}</p>
                </div>
              </div>
            </div>
          </div>
          
          <Link 
            to="/destinations/create" 
            className="w-full mt-12 flex items-center justify-center gap-4 py-6 rounded-[2rem] bg-indigo-700 text-white text-sm font-black uppercase tracking-[0.2em] hover:bg-indigo-800 transition shadow-2xl shadow-indigo-500/40 active:scale-95"
          >
            <Box size={24} /> Sync Logic Vault
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default Reports;
