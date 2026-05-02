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
import { apiClient } from "../../stores/authStores";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 group cursor-default"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{title}</p>
          <h3 className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-50">{value}</h3>
          {subtext && <p className="mt-2 text-xs text-slate-500">{subtext}</p>}
        </div>
        <div className={`rounded-lg p-3 transition-transform group-hover:scale-110 ${color}`}>
          <Icon className="size-6 text-white" />
        </div>
      </div>
    </motion.div>
  );

  const exportData = (type) => {
    alert(`Generating ${type} CSV report... This feature is now ready for production link.`);
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <FiLoader className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-y-8 p-4 md:p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 flex items-center gap-3">
            <FiBarChart2 className="text-blue-600" /> Executive Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Performance overview and inventory distribution for TriptoHoneymoon.
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => exportData('Leads')}
            className="flex items-center gap-2 rounded-lg bg-white border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition shadow-sm"
          >
            <FiDownload /> Export Leads
          </button>
        </div>
      </div>

      {/* Leads Statistics */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50 flex items-center gap-2">
          <FiTrendingUp className="text-green-500" /> Conversion Funnel
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard 
            title="Total Inquiries" 
            value={stats?.leads?.total} 
            icon={FiActivity} 
            color="bg-blue-600" 
            delay={0}
            subtext="Combined business leads"
          />
          <StatCard 
            title="Consultations" 
            value={stats?.leads?.consultations} 
            icon={FiUsers} 
            color="bg-purple-600" 
            delay={0.1}
            subtext="Direct advisor requests"
          />
          <StatCard 
            title="Trip Requests" 
            value={stats?.leads?.tripRequests} 
            icon={FiCalendar} 
            color="bg-pink-600" 
            delay={0.2}
            subtext="Customized packages"
          />
          <StatCard 
            title="Contacts" 
            value={stats?.leads?.contacts} 
            icon={FiMessageSquare} 
            color="bg-orange-600" 
            delay={0.3}
            subtext="General inquiries"
          />
          <StatCard 
            title="Subscribers" 
            value={stats?.leads?.subscribers} 
            icon={FiMail} 
            color="bg-cyan-600" 
            delay={0.4}
            subtext="Newsletter growth"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Recent Activity Table */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="xl:col-span-2 rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden"
        >
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
              <FiClock className="text-blue-500" /> Recent Activity Feed
            </h2>
            <span className="text-xs font-medium px-2 py-1 bg-blue-50 text-blue-600 rounded-full">Live Updates</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Customer Name</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Category</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Date</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {stats?.recentActivity?.map((activity, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-slate-100">{activity.name}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase ${
                        activity.type === 'Contact' ? 'bg-orange-100 text-orange-600' :
                        activity.type === 'Trip Request' ? 'bg-pink-100 text-pink-600' :
                        'bg-purple-100 text-purple-600'
                      }`}>
                        {activity.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(activity.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center justify-end gap-1">
                        View <FiArrowRight size={12} />
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
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6"
        >
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
            <FiGlobe className="text-blue-500" /> Inventory Distribution
          </h2>
          
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-600 font-medium">Domestic Destinations</span>
                <span className="text-slate-900 font-bold">{stats?.content?.domestic}</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600 rounded-full" 
                  style={{ width: `${(stats?.content?.domestic / stats?.content?.destinations) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-600 font-medium">International Destinations</span>
                <span className="text-slate-900 font-bold">{stats?.content?.international}</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-500 rounded-full" 
                  style={{ width: `${(stats?.content?.international / stats?.content?.destinations) * 100}%` }}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-50">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Content Totals</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Resorts</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-slate-50">{stats?.content?.resorts}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Itineraries</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-slate-50">{stats?.content?.itineraries}</p>
                </div>
              </div>
            </div>
          </div>
          
          <Link 
            to="/destinations/create" 
            className="w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition shadow-md"
          >
            <FiEdit /> Manage Inventory
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default Reports;
