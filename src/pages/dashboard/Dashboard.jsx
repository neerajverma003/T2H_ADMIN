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
      className="space-y-12 pb-20"
    >
      {/* 4 STAT CARDS - MATERIAL STYLE */}
      <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4 pt-4">
        <MaterialStatCard 
          icon={<DollarSign size={20} />} 
          title="Today's Money" 
          value="$53k" 
          trend="+55%" 
          trendText="than last week"
          isPositive={true}
          color="bg-slate-800"
        />
        <MaterialStatCard 
          icon={<Users size={20} />} 
          title="Today's Users" 
          value="2,300" 
          trend="+3%" 
          trendText="than last month"
          isPositive={true}
          color="bg-indigo-600"
        />
        <MaterialStatCard 
          icon={<Activity size={20} />} 
          title="Ads Views" 
          value="3,462" 
          trend="-2%" 
          trendText="than yesterday"
          isPositive={false}
          color="bg-emerald-500"
        />
        <MaterialStatCard 
          icon={<Package size={20} />} 
          title="Sales" 
          value="$103,430" 
          trend="+5%" 
          trendText="than yesterday"
          isPositive={true}
          color="bg-rose-500"
        />
      </div>

      {/* 3 CHARTS LAYOUT */}
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
        <ChartCard 
            title="Website Views" 
            subtitle="Last Campaign Performance" 
            footer="campaign sent 2 days ago"
            color="bg-emerald-500"
            icon={<MousePointer2 size={16} />}
        />
        <ChartCard 
            title="Daily Sales" 
            subtitle="(+15%) increase in today sales" 
            footer="updated 4 min ago"
            color="bg-indigo-600"
            icon={<TrendingUp size={16} />}
        />
        <ChartCard 
            title="Completed Tasks" 
            subtitle="Last Campaign Performance" 
            footer="just updated"
            color="bg-slate-800"
            icon={<CheckCircle2 size={16} />}
        />
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
        {/* PROJECTS / PACKAGES */}
        <motion.div variants={item} className="col-span-1 lg:col-span-8 bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800">
           <div className="mb-8">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Active Packages</h3>
              <p className="text-sm text-slate-500 font-medium mt-1 flex items-center gap-2">
                <CheckCircle2 size={16} className="text-indigo-600" /> <span className="font-bold text-indigo-600">30 done</span> this month
              </p>
           </div>
           
           <div className="overflow-x-auto">
             <table className="w-full">
               <thead>
                 <tr className="border-b border-slate-50 dark:border-slate-800">
                   <th className="px-4 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Destination</th>
                   <th className="px-4 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Price</th>
                   <th className="px-4 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Completion</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                 {packages.map((p, i) => (
                   <tr key={i} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                     <td className="px-4 py-6">
                        <div className="flex items-center gap-3">
                           <div className="size-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 font-bold text-xs uppercase">{p.d.charAt(0)}</div>
                           <span className="font-bold text-slate-900 dark:text-white text-sm">{p.d}</span>
                        </div>
                     </td>
                     <td className="px-4 py-6 text-sm font-bold text-slate-600 dark:text-slate-400">{p.p}</td>
                     <td className="px-4 py-6">
                        <div className="w-32">
                           <div className="flex items-center justify-between mb-1.5">
                              <span className="text-[10px] font-black text-indigo-600 uppercase">60%</span>
                           </div>
                           <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full bg-indigo-600 rounded-full" style={{ width: '60%' }}></div>
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
        <motion.div variants={item} className="col-span-1 lg:col-span-4 bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800">
           <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Orders overview</h3>
           <p className="text-sm text-slate-500 font-medium mb-8 flex items-center gap-2">
              <TrendingUp size={16} className="text-emerald-500" /> <span className="font-bold text-emerald-500">24% this month</span>
           </p>

           <div className="space-y-8 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100 dark:before:bg-slate-800">
              <TimelineItem 
                icon={<Bell size={14} className="text-emerald-500" />} 
                title="$2400, Design changes" 
                date="22 DEC 7:20 PM" 
              />
              <TimelineItem 
                icon={<Zap size={14} className="text-rose-500" />} 
                title="New order #1832412" 
                date="21 DEC 11 PM" 
              />
              <TimelineItem 
                icon={<DollarSign size={14} className="text-indigo-500" />} 
                title="Server payments for April" 
                date="21 DEC 9:34 PM" 
              />
              <TimelineItem 
                icon={<Heart size={14} className="text-amber-500" />} 
                title="New card added for order #4395133" 
                date="20 DEC 2:20 AM" 
              />
           </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

const MaterialStatCard = ({ icon, title, value, trend, trendText, isPositive, color }) => (
  <div className="relative bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-2xl shadow-slate-300/50 dark:shadow-none border border-slate-50 dark:border-slate-800">
    <div className={`absolute -top-6 left-6 size-14 ${color} rounded-xl flex items-center justify-center text-white shadow-xl shadow-black/20`}>
      {icon}
    </div>
    <div className="text-right">
      <p className="text-base font-bold text-slate-400 uppercase tracking-widest">{title}</p>
      <h4 className="text-4xl font-black text-slate-900 dark:text-white mt-2">{value}</h4>
    </div>
    <div className="mt-8 pt-6 border-t border-slate-50 dark:border-slate-800">
      <p className="text-base">
        <span className={`font-black ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>{trend}</span>
        <span className="text-slate-400 font-medium ml-2">{trendText}</span>
      </p>
    </div>
  </div>
)

const ChartCard = ({ title, subtitle, footer, color, icon }) => (
  <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800">
    <div className={`-mt-12 mb-8 h-56 rounded-2xl ${color} shadow-lg flex items-center justify-center p-8 relative overflow-hidden group`}>
        {/* Stylized CSS Chart Placeholder */}
        <div className="flex items-end gap-3 h-full w-full justify-around pt-8">
            {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
                <motion.div 
                    key={i} 
                    initial={{ height: 0 }} 
                    animate={{ height: `${h}%` }} 
                    transition={{ delay: i * 0.1, duration: 1 }}
                    className="w-full bg-white/20 rounded-t-lg group-hover:bg-white/40 transition-colors"
                />
            ))}
        </div>
        <div className="absolute top-4 right-4 text-white/20">
            {icon}
        </div>
    </div>
    <div className="px-2">
        <h4 className="text-xl font-black text-slate-900 dark:text-white">{title}</h4>
        <p className="text-sm font-medium text-slate-500 mt-2">{subtitle}</p>
        <div className="mt-8 pt-6 border-t border-slate-50 dark:border-slate-800 flex items-center gap-2 text-slate-400">
            <Clock size={14} />
            <span className="text-xs font-bold uppercase tracking-widest">{footer}</span>
        </div>
    </div>
  </div>
)

const TimelineItem = ({ icon, title, date }) => (
  <div className="relative pl-10">
    <div className="absolute left-0 top-1.5 size-6 rounded-full bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 flex items-center justify-center z-10">
      {icon}
    </div>
    <p className="text-sm font-bold text-slate-900 dark:text-white leading-none mb-1">{title}</p>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{date}</p>
  </div>
)

const Bell = ({ size, className }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path></svg>

export default Dashboard
