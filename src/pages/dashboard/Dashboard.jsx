import {
  Heart,
  Users,
  MapPin,
  DollarSign,
  TrendingUp,
  Star,
  Calendar,
  ArrowRight,
  TrendingDown,
  Activity,
  Zap,
  MousePointer2,
  Package,
  CheckCircle2,
  Clock
} from "lucide-react"
import { motion } from "framer-motion"

const Dashboard = () => {
  const bookings = [
    { name: "John & Emma", place: "Maldives", price: "$4,500", date: "2 mins ago" },
    { name: "Raj & Priya", place: "Bali", price: "$3,200", date: "15 mins ago" },
    { name: "Alex & Sara", place: "Paris", price: "$5,100", date: "1 hour ago" },
  ]

  const packages = [
    { d: "Maldives", p: "$5,200", t: "5 Nights", r: "4.9", status: "Hot" },
    { d: "Bali", p: "$3,800", t: "6 Nights", r: "4.8", status: "Steady" },
    { d: "Paris", p: "$6,000", t: "4 Nights", r: "4.7", status: "Hot" },
  ]

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  }

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-16 pb-24"
    >
      {/* 4 STAT CARDS - MATERIAL STYLE */}
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 pt-6">
        <MaterialStatCard 
          icon={<DollarSign size={24} />} 
          title="Today's Revenue" 
          value="$53,240" 
          trend="+55%" 
          trendText="vs last week"
          isPositive={true}
          color="bg-slate-950"
        />
        <MaterialStatCard 
          icon={<Users size={24} />} 
          title="Active Users" 
          value="2,300" 
          trend="+3.2%" 
          trendText="growth rate"
          isPositive={true}
          color="bg-indigo-700"
        />
        <MaterialStatCard 
          icon={<Activity size={24} />} 
          title="Global Views" 
          value="3.4M" 
          trend="-2.1%" 
          trendText="daily change"
          isPositive={false}
          color="bg-emerald-700"
        />
        <MaterialStatCard 
          icon={<Package size={24} />} 
          title="Total Sales" 
          value="$103,430" 
          trend="+5.4%" 
          trendText="market share"
          isPositive={true}
          color="bg-rose-700"
        />
      </div>

      {/* 3 CHARTS LAYOUT */}
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
        <ChartCard 
            title="Campaign Reach" 
            subtitle="Performance of current marketing blast" 
            footer="Updated 2 hours ago"
            color="bg-emerald-700"
            icon={<MousePointer2 size={20} />}
        />
        <ChartCard 
            title="Sales Velocity" 
            subtitle="Real-time conversion metrics" 
            footer="Syncing now..."
            color="bg-indigo-700"
            icon={<TrendingUp size={20} />}
        />
        <ChartCard 
            title="Fulfillment" 
            subtitle="Operations queue status" 
            footer="All systems clear"
            color="bg-slate-950"
            icon={<CheckCircle2 size={20} />}
        />
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
        {/* PROJECTS / PACKAGES */}
        <motion.div variants={item} className="col-span-1 lg:col-span-8 bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800">
           <div className="mb-10 flex items-center justify-between">
              <div>
                <h3 className="text-3xl font-black text-slate-950 dark:text-white uppercase tracking-tight">Active Packages</h3>
                <p className="text-lg text-slate-600 dark:text-slate-400 font-bold mt-2 flex items-center gap-3 italic">
                  <CheckCircle2 size={20} className="text-indigo-700" /> <span className="font-black text-indigo-700 underline underline-offset-4">30 completions</span> this cycle
                </p>
              </div>
              <div className="size-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-950 dark:text-white border-2 border-slate-100 dark:border-slate-700 shadow-sm">
                 <Package size={32} />
              </div>
           </div>
           
           <div className="overflow-x-auto rounded-3xl border border-slate-100 dark:border-slate-800">
             <table className="w-full">
               <thead className="bg-slate-100 dark:bg-slate-800">
                 <tr>
                   <th className="px-8 py-6 text-left text-xs font-black text-slate-950 dark:text-slate-200 uppercase tracking-[0.3em]">Destination</th>
                   <th className="px-8 py-6 text-left text-xs font-black text-slate-950 dark:text-slate-200 uppercase tracking-[0.3em]">Price Point</th>
                   <th className="px-8 py-6 text-left text-xs font-black text-slate-950 dark:text-slate-200 uppercase tracking-[0.3em]">Status</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                 {packages.map((p, i) => (
                   <tr key={i} className="group hover:bg-indigo-50 dark:hover:bg-indigo-900/5 transition-colors">
                     <td className="px-8 py-8">
                        <div className="flex items-center gap-5">
                           <div className="size-12 rounded-2xl bg-indigo-700 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-indigo-500/30">{p.d.charAt(0)}</div>
                           <span className="font-black text-slate-950 dark:text-white text-lg uppercase tracking-widest">{p.d}</span>
                        </div>
                     </td>
                     <td className="px-8 py-8 text-xl font-black text-indigo-700 dark:text-indigo-400 tracking-tighter">{p.p}</td>
                     <td className="px-8 py-8">
                        <div className="w-48">
                           <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-black text-indigo-700 uppercase tracking-widest">In Progress</span>
                           </div>
                           <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner border border-slate-200 dark:border-slate-700">
                              <div className="h-full bg-indigo-700 rounded-full shadow-lg" style={{ width: '65%' }}></div>
                           </div>
                        </div>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </motion.div>

        {/* ORDERS OVERVIEW */}
        <motion.div variants={item} className="col-span-1 lg:col-span-4 bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800">
           <h3 className="text-3xl font-black text-slate-950 dark:text-white mb-3 uppercase tracking-tight">Activity Log</h3>
           <p className="text-lg text-slate-600 dark:text-slate-400 font-bold mb-12 flex items-center gap-3 italic">
              <TrendingUp size={20} className="text-emerald-700" /> <span className="font-black text-emerald-700 underline underline-offset-4">24% velocity increase</span>
           </p>

           <div className="space-y-10 relative before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-[3px] before:bg-slate-100 dark:before:bg-slate-800">
              <TimelineItem 
                icon={<Bell size={16} className="text-emerald-700" />} 
                title="$2,400 Revenue Sync" 
                date="22 DEC 7:20 PM" 
              />
              <TimelineItem 
                icon={<Zap size={16} className="text-rose-700" />} 
                title="System Update #183" 
                date="21 DEC 11 PM" 
              />
              <TimelineItem 
                icon={<DollarSign size={16} className="text-indigo-700" />} 
                title="Vendor Settlement" 
                date="21 DEC 9:34 PM" 
              />
              <TimelineItem 
                icon={<Heart size={16} className="text-amber-700" />} 
                title="Customer Review #439" 
                date="20 DEC 2:20 AM" 
              />
           </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

const MaterialStatCard = ({ icon, title, value, trend, trendText, isPositive, color }) => (
  <div className="relative bg-white dark:bg-slate-900 rounded-[2rem] p-8 shadow-2xl shadow-slate-300/40 dark:shadow-none border-2 border-slate-50 dark:border-slate-800 hover:scale-[1.02] transition-transform">
    <div className={`absolute -top-8 left-8 size-16 ${color} rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-black/30 border-4 border-white dark:border-slate-900`}>
      {icon}
    </div>
    <div className="text-right">
      <p className="text-lg font-black text-slate-950 dark:text-slate-400 uppercase tracking-[0.2em]">{title}</p>
      <h4 className="text-5xl font-black text-slate-950 dark:text-white mt-4 tracking-tighter leading-none">{value}</h4>
    </div>
    <div className="mt-10 pt-8 border-t-2 border-slate-50 dark:border-slate-800">
      <p className="text-base">
        <span className={`font-black ${isPositive ? 'text-emerald-700' : 'text-rose-700'} text-lg`}>{trend}</span>
        <span className="text-slate-500 font-black ml-3 uppercase text-sm tracking-widest">{trendText}</span>
      </p>
    </div>
  </div>
)

const ChartCard = ({ title, subtitle, footer, color, icon }) => (
  <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800">
    <div className={`-mt-14 mb-10 h-64 rounded-3xl ${color} shadow-2xl flex items-center justify-center p-10 relative overflow-hidden group`}>
        <div className="flex items-end gap-4 h-full w-full justify-around pt-10">
            {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
                <motion.div 
                    key={i} 
                    initial={{ height: 0 }} 
                    animate={{ height: `${h}%` }} 
                    transition={{ delay: i * 0.1, duration: 1 }}
                    className="w-full bg-white/30 rounded-t-xl group-hover:bg-white/50 transition-colors shadow-sm"
                />
            ))}
        </div>
        <div className="absolute top-6 right-6 text-white/30">
            {icon}
        </div>
    </div>
    <div className="px-2 text-center sm:text-left">
        <h4 className="text-3xl font-black text-slate-950 dark:text-white tracking-tight">{title}</h4>
        <p className="text-lg font-bold text-slate-600 dark:text-slate-400 mt-3 italic">{subtitle}</p>
        <div className="mt-10 pt-8 border-t-2 border-slate-50 dark:border-slate-800 flex items-center justify-center sm:justify-start gap-4 text-slate-950 dark:text-slate-400">
            <Clock size={20} className="text-indigo-700" />
            <span className="text-xs font-black uppercase tracking-[0.4em]">{footer}</span>
        </div>
    </div>
  </div>
)

const TimelineItem = ({ icon, title, date }) => (
  <div className="relative pl-12">
    <div className="absolute left-0 top-1 size-8 rounded-xl bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 flex items-center justify-center z-10 shadow-sm shadow-indigo-500/10">
      {icon}
    </div>
    <p className="text-lg font-black text-slate-950 dark:text-white leading-tight mb-2 tracking-tight">{title}</p>
    <p className="text-sm font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">{date}</p>
  </div>
)

const Bell = ({ size, className }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path></svg>

export default Dashboard
