
// import {
//   Heart,
//   Users,
//   MapPin,
//   DollarSign,
//   TrendingUp,
//   Star,
// } from "lucide-react"
// import { ReactNode } from "react" // can be removed if not needed

// export default function Dashboard() {
//   const bookings = [
//     { name: "John & Emma", place: "Maldives", price: "$4,500" },
//     { name: "Raj & Priya", place: "Bali", price: "$3,200" },
//     { name: "Alex & Sara", place: "Paris", price: "$5,100" },
//   ]

//   const packages = [
//     { d: "Maldives", p: "$5,200", t: "5 Nights", r: "4.9" },
//     { d: "Bali", p: "$3,800", t: "6 Nights", r: "4.8" },
//     { d: "Paris", p: "$6,000", t: "4 Nights", r: "4.7" },
//   ]

//   return (
//     <div className="flex flex-col gap-6 p-4 md:p-6">

//       {/* TITLE */}
//       <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
//         Honeymoon Dashboard 💍
//       </h1>

//       {/* STATS */}
//       <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
//         <StatCard icon={<Heart size={26} />} title="Happy Couples" value="1,245" percent="18%" />
//         <StatCard icon={<Users size={26} />} title="Total Bookings" value="860" percent="12%" />
//         <StatCard icon={<MapPin size={26} />} title="Destinations" value="48" percent="6%" />
//         <StatCard icon={<DollarSign size={26} />} title="Revenue" value="$124,000" percent="22%" />
//       </div>

//       {/* MAIN GRID */}
//       <div className="grid grid-cols-1 gap-4 lg:grid-cols-7">

//         {/* OVERVIEW */}
//         <div className="card col-span-1 lg:col-span-4">
//           <div className="card-header">
//             <p className="card-title">Overview</p>
//           </div>
//           <div className="card-body">
//             <p className="text-slate-600 dark:text-slate-400">
//               This month shows a strong increase in honeymoon bookings with top
//               destinations being Maldives, Bali, and Paris.
//             </p>
//           </div>
//         </div>

//         {/* RECENT BOOKINGS */}
//         <div className="card col-span-1 lg:col-span-3">
//           <div className="card-header">
//             <p className="card-title">Recent Bookings</p>
//           </div>
//           <div className="card-body space-y-4">
//             {bookings.map((b, i) => (
//               <div key={i} className="flex items-center justify-between">
//                 <div>
//                   <p className="font-medium text-slate-900 dark:text-slate-50">
//                     {b.name}
//                   </p>
//                   <p className="text-sm text-slate-500">{b.place}</p>
//                 </div>
//                 <p className="font-medium text-slate-900 dark:text-slate-50">
//                   {b.price}
//                 </p>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* TOP PACKAGES */}
//       <div className="card">
//         <div className="card-header">
//           <p className="card-title">Top Honeymoon Packages</p>
//         </div>
//         <div className="card-body overflow-auto p-0">
//           <table className="w-full text-sm">
//             <thead className="bg-slate-100 dark:bg-slate-800">
//               <tr>
//                 <th className="p-3 text-left">Destination</th>
//                 <th className="p-3 text-left">Price</th>
//                 <th className="p-3 text-left">Duration</th>
//                 <th className="p-3 text-left">Rating</th>
//               </tr>
//             </thead>
//             <tbody>
//               {packages.map((p, i) => (
//                 <tr key={i} className="border-t dark:border-slate-700">
//                   <td className="p-3">{p.d}</td>
//                   <td className="p-3">{p.p}</td>
//                   <td className="p-3">{p.t}</td>
//                   <td className="p-3 flex items-center gap-2">
//                     <Star
//                       size={16}
//                       className="fill-yellow-500 stroke-yellow-500"
//                     />
//                     {p.r}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>

//     </div>
//   )
// }

// /* =========================
//    STAT CARD COMPONENT
// ========================= */

// function StatCard({ icon, title, value, percent }) {
//   return (
//     <div className="rounded-xl bg-white p-5 shadow transition-colors dark:bg-slate-900">
//       <div className="flex items-center justify-between">
//         <div className="rounded-lg bg-pink-500/20 p-2 text-pink-500">
//           {icon}
//         </div>
//         <span className="flex items-center gap-1 text-green-500 text-sm">
//           <TrendingUp size={16} /> {percent}
//         </span>
//       </div>

//       <p className="mt-4 text-sm text-slate-500">{title}</p>
//       <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
//         {value}
//       </p>
//     </div>
//   )
// }



import {
  Heart,
  Users,
  MapPin,
  DollarSign,
  TrendingUp,
  Star,
} from "lucide-react"
import { ReactNode } from "react"

export default function Dashboard() {
  const bookings = [
    { name: "John & Emma", place: "Maldives", price: "$4,500" },
    { name: "Raj & Priya", place: "Bali", price: "$3,200" },
    { name: "Alex & Sara", place: "Paris", price: "$5,100" },
  ]

  const packages = [
    { d: "Maldives", p: "$5,200", t: "5 Nights", r: "4.9" },
    { d: "Bali", p: "$3,800", t: "6 Nights", r: "4.8" },
    { d: "Paris", p: "$6,000", t: "4 Nights", r: "4.7" },
  ]

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">

      {/* TITLE */}
      <h1 className="text-3xl font-extrabold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
        Honeymoon Dashboard 💍
      </h1>

      {/* STATS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<Heart size={26} />} title="Happy Couples" value="1,245" percent="18%" />
        <StatCard icon={<Users size={26} />} title="Total Bookings" value="860" percent="12%" />
        <StatCard icon={<MapPin size={26} />} title="Destinations" value="48" percent="6%" />
        <StatCard icon={<DollarSign size={26} />} title="Revenue" value="$124,000" percent="22%" />
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-7">

        {/* OVERVIEW */}
        <div className="col-span-1 lg:col-span-4 rounded-2xl backdrop-blur-lg bg-white/70 dark:bg-slate-900/70 shadow-lg border border-white/40 dark:border-slate-700">
          <div className="p-5 border-b border-slate-200 dark:border-slate-700">
            <p className="font-semibold text-lg text-slate-800 dark:text-slate-100">
              Overview
            </p>
          </div>
          <div className="p-5">
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              This month shows a strong increase in honeymoon bookings with top
              destinations being Maldives, Bali, and Paris.
            </p>
          </div>
        </div>

        {/* RECENT BOOKINGS */}
        <div className="col-span-1 lg:col-span-3 rounded-2xl backdrop-blur-lg bg-white/70 dark:bg-slate-900/70 shadow-lg border border-white/40 dark:border-slate-700">
          <div className="p-5 border-b border-slate-200 dark:border-slate-700">
            <p className="font-semibold text-lg text-slate-800 dark:text-slate-100">
              Recent Bookings
            </p>
          </div>
          <div className="p-5 space-y-4">
            {bookings.map((b, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-pink-50 dark:hover:bg-slate-800 transition"
              >
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-50">
                    {b.name}
                  </p>
                  <p className="text-sm text-pink-500">{b.place}</p>
                </div>
                <p className="font-semibold text-slate-900 dark:text-slate-50">
                  {b.price}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TOP PACKAGES */}
      <div className="rounded-2xl backdrop-blur-lg bg-white/70 dark:bg-slate-900/70 shadow-lg border border-white/40 dark:border-slate-700">
        <div className="p-5 border-b border-slate-200 dark:border-slate-700">
          <p className="font-semibold text-lg text-slate-800 dark:text-slate-100">
            Top Honeymoon Packages
          </p>
        </div>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-gradient-to-r from-pink-100 to-purple-100 dark:from-slate-800 dark:to-slate-700">
              <tr>
                <th className="p-4 text-left font-semibold">Destination</th>
                <th className="p-4 text-left font-semibold">Price</th>
                <th className="p-4 text-left font-semibold">Duration</th>
                <th className="p-4 text-left font-semibold">Rating</th>
              </tr>
            </thead>
            <tbody>
              {packages.map((p, i) => (
                <tr
                  key={i}
                  className="border-t dark:border-slate-700 hover:bg-pink-50 dark:hover:bg-slate-800 transition"
                >
                  <td className="p-4 font-medium">{p.d}</td>
                  <td className="p-4 text-purple-600 dark:text-purple-400 font-semibold">{p.p}</td>
                  <td className="p-4">{p.t}</td>
                  <td className="p-4 flex items-center gap-2 font-medium">
                    <Star
                      size={16}
                      className="fill-yellow-400 stroke-yellow-400"
                    />
                    {p.r}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}

/* =========================
   STAT CARD COMPONENT
========================= */

function StatCard({ icon, title, value, percent }) {
  return (
    <div className="rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg p-5 shadow-lg border border-white/40 dark:border-slate-700 hover:shadow-xl transition duration-300">
      <div className="flex items-center justify-between">
        <div className="rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 p-3 text-white shadow-md">
          {icon}
        </div>
        <span className="flex items-center gap-1 text-green-500 text-sm font-semibold">
          <TrendingUp size={16} /> {percent}
        </span>
      </div>

      <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">{title}</p>
      <p className="text-2xl font-bold text-slate-900 dark:text-white">
        {value}
      </p>
    </div>
  )
}
