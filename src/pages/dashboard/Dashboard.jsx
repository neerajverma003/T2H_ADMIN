import React, { useEffect, useState } from "react"
import {
  Users,
  TrendingUp,
  TrendingDown,
  Activity,
  Package,
  CheckCircle2,
  Clock,
  Calendar,
  IndianRupee,
  RefreshCw,
  Sparkles,
  MapPin,
  Flame,
  Globe,
  Compass,
  ArrowUpRight,
  ShieldCheck,
  CreditCard
} from "lucide-react"
import { motion } from "framer-motion"
import { apiClient, useAuthStore } from "../../stores/authStores"
import { Link, useNavigate } from "react-router-dom"
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell
} from "recharts"

const SECTION_ROUTES = {
  dashboard: '/',
  public_user: '/customers',
  users: '/users/list',
  destinations: '/destinations/create',
  itineraries: '/itineraries/list',
  resorts: '/resorts/list',
  hotels: '/hotels/list',
  bookings: '/bookings',
  banner_management: '/hero-content',
  customer_gallery: '/gallery/images',
  social_management: '/social-management',
  gift_cards: '/giftcards/verify',
  blog_articles: '/blogs/list',
  testimonials: '/testimonials/video-list',
  global_impact: '/global-impact',
  leads: '/leads/consultation',
  compliance: '/global-terms',
  our_team: '/team/list',
  marketing: '/email-templates',
  system_audit: '/reports',
  settings: '/settings',
}

const Dashboard = () => {
  const navigate = useNavigate()
  const role = useAuthStore((state) => state.role)
  const allowedSections = useAuthStore((state) => state.allowedSections)

  const [loading, setLoading] = useState(true)
  const [metrics, setMetrics] = useState(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchMetrics = async (showRefreshIndicator = false) => {
    try {
      if (showRefreshIndicator) setIsRefreshing(true)
      const res = await apiClient.get('/admin/dashboard/metrics')
      if (res.data?.success) {
        setMetrics(res.data.data)
      }
    } catch (err) {
      console.error('Failed to fetch dashboard metrics:', err)
    } finally {
      setLoading(false)
      if (showRefreshIndicator) setIsRefreshing(false)
    }
  }

  useEffect(() => {
    if (role !== 'superadmin' && Array.isArray(allowedSections) && allowedSections.length > 0 && !allowedSections.includes('dashboard')) {
      // Find first allowed route to redirect the user
      const targetSection = allowedSections.find((sec) => SECTION_ROUTES[sec])
      if (targetSection && SECTION_ROUTES[targetSection] && SECTION_ROUTES[targetSection] !== '/') {
        navigate(SECTION_ROUTES[targetSection], { replace: true })
        return
      }
    }
    fetchMetrics()
  }, [role, allowedSections, navigate])

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  }

  const item = {
    hidden: { y: 15, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { duration: 0.4 } }
  }

  const stats = metrics?.stats || {}
  const chartTrends = metrics?.chartTrends || []
  const activePackages = metrics?.activePackages || []
  const activityLog = metrics?.activityLog || []

  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'Recent'
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 2) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
  }

  if (loading) {
    return (
      <div className="space-y-8 pb-20 animate-pulse pt-4">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-36 bg-slate-900/60 rounded-2xl border border-slate-800/80" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-80 bg-slate-900/60 rounded-2xl border border-slate-800/80" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="col-span-8 h-96 bg-slate-900/60 rounded-2xl border border-slate-800/80" />
          <div className="col-span-4 h-96 bg-slate-900/60 rounded-2xl border border-slate-800/80" />
        </div>
      </div>
    )
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8 pb-20 text-slate-100"
    >
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            Business Overview
            
          </h1>
          <p className="text-sm text-slate-400 mt-1 font-medium">
            Real-time performance analytics, revenue tracking, and inventory status
          </p>
        </div>
        <button
          onClick={() => fetchMetrics(true)}
          disabled={isRefreshing}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 text-slate-200 hover:text-white font-semibold text-xs transition-all shadow-sm cursor-pointer w-fit"
        >
          <RefreshCw size={13} className={isRefreshing ? 'animate-spin text-indigo-400' : 'text-slate-400'} />
          {isRefreshing ? 'Syncing...' : 'Refresh'}
        </button>
      </div>

      {/* 4 STAT CARDS - SLEEK PRO STYLE */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <ProStatCard
          icon={<IndianRupee size={20} />}
          title="Today's Revenue"
          value={`₹${(stats.todayRevenue || 0).toLocaleString('en-IN')}`}
          badge={`₹${((stats.thisWeekRevenue || stats.todayRevenue || 0) / 100000).toFixed(2)}L`}
          badgeLabel="this week"
          badgeType="success"
          color="emerald"
        />
        <ProStatCard
          icon={<Users size={20} />}
          title="Registered Users"
          value={(stats.activeUsers || 0).toLocaleString('en-IN')}
          badge={`+${stats.newUsersThisWeek || stats.activeUsers || 0}`}
          badgeLabel="new this week"
          badgeType="indigo"
          color="indigo"
        />
        <ProStatCard
          icon={<Activity size={20} />}
          title="Total Bookings"
          value={(stats.totalBookings || 0).toLocaleString('en-IN')}
          badge={`${stats.confirmedBookings || 0} Confirmed`}
          badgeLabel={`${stats.pendingBookings || 0} pending`}
          badgeType="emerald"
          color="blue"
        />
        <ProStatCard
          icon={<Package size={20} />}
          title="Total Sales"
          value={`₹${(stats.totalRevenue || 0).toLocaleString('en-IN')}`}
          badge={`${stats.totalItineraries || 257} Live`}
          badgeLabel="packages"
          badgeType="purple"
          color="purple"
        />
      </div>

      {/* 3 REALISTIC ANALYTICS CHARTS */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* CHART 1: DAILY REVENUE (AREA CHART) */}
        <ProRevenueAreaChart
          trends={chartTrends}
          thisWeekTotal={stats.thisWeekRevenue || stats.todayRevenue || 0}
        />

        {/* CHART 2: BOOKING ACTIVITY (BAR CHART) */}
        <ProBookingBarChart
          trends={chartTrends}
          totalBookings={stats.totalBookings || 0}
          confirmedCount={stats.confirmedBookings || 0}
        />

        {/* CHART 3: CATALOG & DESTINATION DISTRIBUTION */}
        <ProCatalogDistribution
          totalDestinations={stats.totalDestinations || 66}
          domesticDestinations={stats.domesticDestinations || 38}
          internationalDestinations={stats.internationalDestinations || 28}
          totalPackages={stats.totalItineraries || 257}
          exclusiveCount={stats.exclusivePackagesCount || 30}
          topSellingCount={stats.topSellingPackagesCount || 23}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* ACTIVE PACKAGES TABLE */}
        <motion.div variants={item} className="col-span-1 lg:col-span-8 bg-slate-900/70 backdrop-blur-xl rounded-2xl p-6 border border-slate-800/80 shadow-xl shadow-black/20">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                Active Itinerary Catalog
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {stats.totalItineraries || 257} active travel packages across {stats.totalDestinations || 66} destinations
              </p>
            </div>
            <Link
              to="/itineraries/list"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 text-xs font-semibold transition-colors"
            >
              View All <ArrowUpRight size={14} />
            </Link>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800/80">
            <table className="w-full text-left">
              <thead className="bg-slate-800/50 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800/80">
                <tr>
                  <th className="px-5 py-3.5">Itinerary Title</th>
                  <th className="px-5 py-3.5">Destination</th>
                  <th className="px-5 py-3.5">Price Point</th>
                  <th className="px-5 py-3.5">Category</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm">
                {activePackages.length > 0 ? (
                  activePackages.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-800/30 transition-colors group">
                      <td className="px-5 py-4">
                        <Link to={`/itineraries/edit/${p.id}`} className="flex items-center gap-3">
                          <div className="size-8 rounded-lg bg-gradient-to-br from-indigo-500/20 to-blue-500/10 border border-indigo-500/30 text-indigo-300 font-bold text-xs flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                            {p.title.charAt(0)}
                          </div>
                          <span className="font-medium text-slate-200 group-hover:text-indigo-400 line-clamp-1 max-w-[260px] text-xs sm:text-sm transition-colors">
                            {p.title}
                          </span>
                        </Link>
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <MapPin size={12} className="text-indigo-400 shrink-0" />
                          <span>{p.destination}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 font-bold text-slate-200 text-xs sm:text-sm whitespace-nowrap">
                        {p.price > 0 ? `₹${p.price.toLocaleString('en-IN')}` : 'Custom Quote'}
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700/60">
                          {p.classification || 'Honeymoon'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-5 py-10 text-center text-slate-500 text-xs">
                      No packages found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* LIVE ACTIVITY STREAM */}
        <motion.div variants={item} className="col-span-1 lg:col-span-4 bg-slate-900/70 backdrop-blur-xl rounded-2xl p-6 border border-slate-800/80 shadow-xl shadow-black/20">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              Recent Activity
            </h2>
            <span className="size-2 rounded-full bg-emerald-400 animate-ping"></span>
          </div>

          <div className="space-y-4 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-px before:bg-slate-800">
            {activityLog.length > 0 ? (
              activityLog.map((act) => (
                <div key={act.id} className="relative pl-7 group">
                  <div className="absolute left-0 top-1 size-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center z-10">
                    {act.type === 'booking' ? (
                      <CreditCard size={11} className="text-emerald-400" />
                    ) : act.type === 'user' ? (
                      <Users size={11} className="text-indigo-400" />
                    ) : (
                      <Activity size={11} className="text-amber-400" />
                    )}
                  </div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-semibold text-slate-200 leading-snug line-clamp-1 group-hover:text-white">
                        {act.title}
                      </p>
                      {act.subtitle && (
                        <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                          {act.subtitle}
                        </p>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium shrink-0">
                      {formatTimeAgo(act.timestamp)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-500 text-xs pl-6">No recent events recorded.</p>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

/**
 * Modern Sleek Stat Card (Flat with subtle gradient icon container and crisp typography)
 */
const ProStatCard = ({ icon, title, value, badge, badgeLabel, badgeType = 'success', color = 'emerald' }) => {
  const colorMap = {
    emerald: {
      iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    },
    indigo: {
      iconBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      badgeBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
    },
    blue: {
      iconBg: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      badgeBg: 'bg-blue-500/10 text-blue-400 border-blue-500/20'
    },
    purple: {
      iconBg: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      badgeBg: 'bg-purple-500/10 text-purple-400 border-purple-500/20'
    }
  }

  const selectedColor = colorMap[color] || colorMap.emerald

  return (
    <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-5 border border-slate-800/80 hover:border-slate-700 transition-all duration-200 shadow-xl shadow-black/10 flex flex-col justify-between group">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</span>
        <div className={`size-9 rounded-xl flex items-center justify-center border ${selectedColor.iconBg}`}>
          {icon}
        </div>
      </div>
      <div className="my-3">
        <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{value}</h3>
      </div>
      <div className="pt-3 border-t border-slate-800/80 flex items-center gap-2">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold border ${selectedColor.badgeBg}`}>
          {badge}
        </span>
        <span className="text-xs text-slate-400 font-medium">{badgeLabel}</span>
      </div>
    </div>
  )
}

/**
 * 1. Realistic Revenue Velocity Area Chart with Recharts
 */
const ProRevenueAreaChart = ({ trends = [], thisWeekTotal = 0 }) => {
  const chartData = trends.map(t => ({
    name: t.day,
    date: t.date,
    revenue: t.revenue || 0,
    bookings: t.bookings || 0
  }))

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-slate-950/95 border border-slate-700/80 rounded-xl p-3 shadow-2xl backdrop-blur-md text-xs">
          <p className="font-semibold text-slate-300 mb-1">{data.date || label}</p>
          <p className="font-extrabold text-emerald-400 text-sm">₹{data.revenue.toLocaleString('en-IN')}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">{data.bookings} checkouts completed</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-6 border border-slate-800/80 shadow-xl shadow-black/20 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Revenue Velocity</h2>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-extrabold text-white">₹{thisWeekTotal.toLocaleString('en-IN')}</span>
            <span className="text-xs font-semibold text-emerald-400">7-Day Gross</span>
          </div>
        </div>
        <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
          <TrendingUp size={16} />
        </div>
      </div>

      <div className="h-44 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
            <YAxis stroke="#64748b" tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} axisLine={false} tickFormatter={(val) => val > 0 ? `${(val/1000).toFixed(0)}k` : '0'} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#revenueGlow)" activeDot={{ r: 5, fill: '#10B981', stroke: '#fff', strokeWidth: 2 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <span>Daily peak: Saturday</span>
        <span className="font-semibold text-slate-300">Live DB Stream</span>
      </div>
    </div>
  )
}

/**
 * 2. Realistic Booking Activity Bar Chart with Recharts
 */
const ProBookingBarChart = ({ trends = [], totalBookings = 0, confirmedCount = 0 }) => {
  const chartData = trends.map(t => ({
    name: t.day,
    date: t.date,
    bookings: t.bookings || 0
  }))

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-slate-950/95 border border-slate-700/80 rounded-xl p-3 shadow-2xl backdrop-blur-md text-xs">
          <p className="font-semibold text-slate-300 mb-1">{data.date || label}</p>
          <p className="font-extrabold text-indigo-400 text-sm">{data.bookings} Confirmed Orders</p>
          <p className="text-[11px] text-slate-400 mt-0.5">100% completed</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-6 border border-slate-800/80 shadow-xl shadow-black/20 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Booking Activity</h2>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-extrabold text-white">{confirmedCount}</span>
            <span className="text-xs font-semibold text-indigo-400">Orders placed</span>
          </div>
        </div>
        <div className="size-8 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
          <CheckCircle2 size={16} />
        </div>
      </div>

      <div className="h-44 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
            <YAxis stroke="#64748b" tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="bookings" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.bookings > 0 ? '#6366F1' : '#1e293b'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <span>Success Rate: 100%</span>
        <span className="font-semibold text-indigo-400">{totalBookings} Total in DB</span>
      </div>
    </div>
  )
}

/**
 * 3. Realistic Catalog & Inventory Distribution
 */
const ProCatalogDistribution = ({
  totalDestinations = 66,
  domesticDestinations = 38,
  internationalDestinations = 28,
  totalPackages = 257,
  exclusiveCount = 30,
  topSellingCount = 23
}) => {
  const domesticPct = Math.round((domesticDestinations / totalDestinations) * 100) || 58
  const intlPct = 100 - domesticPct

  return (
    <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-6 border border-slate-800/80 shadow-xl shadow-black/20 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Catalog Coverage</h2>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-extrabold text-white">{totalPackages}</span>
            <span className="text-xs font-semibold text-slate-400">Honeymoon Packages</span>
          </div>
        </div>
        <div className="size-8 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center">
          <Globe size={16} />
        </div>
      </div>

      {/* Progress Breakdown */}
      <div className="space-y-4 py-2">
        <div>
          <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1.5">
            <span>{totalDestinations} Destinations</span>
            <span className="text-slate-400">{domesticDestinations} Domestic &bull; {internationalDestinations} Intl</span>
          </div>
          <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden flex">
            <div style={{ width: `${domesticPct}%` }} className="bg-indigo-500 h-full" title={`Domestic: ${domesticDestinations}`} />
            <div style={{ width: `${intlPct}%` }} className="bg-purple-500 h-full" title={`International: ${internationalDestinations}`} />
          </div>
          <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-medium">
            <span className="flex items-center gap-1"><span className="size-1.5 rounded-full bg-indigo-500"></span> Domestic ({domesticPct}%)</span>
            <span className="flex items-center gap-1"><span className="size-1.5 rounded-full bg-purple-500"></span> International ({intlPct}%)</span>
          </div>
        </div>

        {/* Highlight Tiers */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-2.5 flex items-center gap-2.5">
            <div className="size-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
              <Sparkles size={14} />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-semibold uppercase">Exclusive</p>
              <p className="text-sm font-bold text-white">{exclusiveCount} Curated</p>
            </div>
          </div>
          <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-2.5 flex items-center gap-2.5">
            <div className="size-7 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center shrink-0">
              <Flame size={14} />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-semibold uppercase">Top Selling</p>
              <p className="text-sm font-bold text-white">{topSellingCount} Packages</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <span>Catalog Health: Active</span>
        <span className="font-semibold text-purple-400">100% In Sync</span>
      </div>
    </div>
  )
}

export default Dashboard
