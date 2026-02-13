

// import { NavLink, useNavigate } from "react-router-dom"
// import {
//   FiHome,
//   FiUsers,
//   FiSettings,
//   FiBarChart2,
//   FiLogOut,
//   FiVideo,
//   FiChevronDown,
//   FiMapPin,
//   FiImage,
//   FiFileText,
// } from "react-icons/fi"
// import { useState } from "react"
// import useAuthStore from "../stores/authStores"

// /* =========================
//    REUSABLE DROPDOWN
// ========================= */
// const Dropdown = ({ title, icon, open, setOpen, children }) => {
//   const Icon = icon

//   return (
//     <>
//       <button
//         onClick={() => setOpen(!open)}
//         className="flex w-full items-center justify-between px-3 py-2 rounded-lg text-sm font-medium
//         text-slate-700 dark:text-slate-300 hover:bg-blue-100 dark:hover:bg-slate-800 transition"
//       >
//         <span className="flex items-center gap-3">
//           {Icon && <Icon size={18} />}
//           {title}
//         </span>
//         <FiChevronDown
//           className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
//         />
//       </button>

//       {open && <div className="ml-8 space-y-1">{children}</div>}
//     </>
//   )
// }

// /* =========================
//    SIDEBAR
// ========================= */
// const Sidebar = ({ open, setOpen }) => {
//   const navigate = useNavigate()
//   const logout = useAuthStore((state) => state.logout)

//   const [userOpen, setUserOpen] = useState(false)
//   const [destinationOpen, setDestinationOpen] = useState(false)
//   const [galleryOpen, setGalleryOpen] = useState(false)
//   const [testimonialOpen, setTestimonialOpen] = useState(false)
//   const [itineraryOpen, setItineraryOpen] = useState(false)
//   const [resortOpen, setResortOpen] = useState(false)
//   const [blogOpen, setBlogOpen] = useState(false)
//   const [termsOpen, setTermsOpen] = useState(false) // ✅ ADDED

//   const handleLogout = () => {
//     logout()
//     setOpen(false)
//     navigate("/login", { replace: true })
//   }

//   const linkClass = ({ isActive }) =>
//     `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all
//      ${
//        isActive
//          ? "bg-blue-600 text-white shadow"
//          : "text-slate-700 dark:text-slate-300 hover:bg-blue-100 dark:hover:bg-slate-800"
//      }`

//   const subLinkClass = ({ isActive }) =>
//     `block rounded-md px-3 py-2 text-sm transition
//      ${
//        isActive
//          ? "bg-blue-500 text-white"
//          : "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
//      }`

//   return (
//     <aside
//       className={`fixed z-30 flex h-full w-64 flex-col overflow-hidden border-r border-slate-200
//       bg-linear-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950
//       transition-transform duration-300
//       ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
//     >
//       {/* LOGO */}
//       <div className="p-4 border-b border-slate-200 dark:border-slate-700
//         text-lg font-bold text-slate-900 dark:text-white bg-white/60 dark:bg-slate-900/60 backdrop-blur">
//         T2H Admin Panel
//       </div>

//       {/* NAV */}
//       <nav className="flex-1 overflow-y-auto p-2 space-y-1">

//         <NavLink to="/" onClick={() => setOpen(false)} className={linkClass}>
//           <FiHome size={18} />
//           Dashboard
//         </NavLink>

//         <Dropdown title="Users" icon={FiUsers} open={userOpen} setOpen={setUserOpen}>
//           <NavLink to="/users/add" onClick={() => setOpen(false)} className={subLinkClass}>
//             Add User
//           </NavLink>
//           <NavLink to="/users/list" onClick={() => setOpen(false)} className={subLinkClass}>
//             User List
//           </NavLink>
//         </Dropdown>

//         <Dropdown title="Destinations" icon={FiMapPin} open={destinationOpen} setOpen={setDestinationOpen}>
//           <NavLink to="/destinations/create" onClick={() => setOpen(false)} className={subLinkClass}>
//             Create Destination
//           </NavLink>
//           <NavLink to="/destinations/city" onClick={() => setOpen(false)} className={subLinkClass}>
//             Create City
//           </NavLink>
//         </Dropdown>

//         <Dropdown title="Itineraries" icon={FiMapPin} open={itineraryOpen} setOpen={setItineraryOpen}>
//           <NavLink to="/itineraries/create" onClick={() => setOpen(false)} className={subLinkClass}>
//             Create Itinerary
//           </NavLink>
//           <NavLink to="/itineraries/list" onClick={() => setOpen(false)} className={subLinkClass}>
//             Itinerary List
//           </NavLink>
//         </Dropdown>

//         <Dropdown title="Resorts" icon={FiMapPin} open={resortOpen} setOpen={setResortOpen}>
//           <NavLink to="/resorts/create" onClick={() => setOpen(false)} className={subLinkClass}>
//             Create Resort
//           </NavLink>
//           <NavLink to="/resorts/list" onClick={() => setOpen(false)} className={subLinkClass}>
//             Resort List
//           </NavLink>
//         </Dropdown>

//         <Dropdown title="Customer Gallery" icon={FiImage} open={galleryOpen} setOpen={setGalleryOpen}>
//           <NavLink to="/gallery/images" onClick={() => setOpen(false)} className={subLinkClass}>
//             Images
//           </NavLink>
//         </Dropdown>

//         <Dropdown
//           title="Testimonials"
//           icon={FiVideo}
//           open={testimonialOpen}
//           setOpen={setTestimonialOpen}
//         >
//           <NavLink to="/testimonials/video" onClick={() => setOpen(false)} className={subLinkClass}>
//             Testimonial Video
//           </NavLink>
//           <NavLink to="/testimonials/list" onClick={() => setOpen(false)} className={subLinkClass}>
//             Testimonial List
//           </NavLink>
//         </Dropdown>

//         <NavLink to="/hero-video" onClick={() => setOpen(false)} className={linkClass}>
//           <FiVideo size={18} />
//           Hero Video
//         </NavLink>

//         <Dropdown title="Blog" icon={FiImage} open={blogOpen} setOpen={setBlogOpen}>
//           <NavLink to="/blogs/create" onClick={() => setOpen(false)} className={subLinkClass}>
//             Create Blog
//           </NavLink>
//           <NavLink to="/blogs/list" onClick={() => setOpen(false)} className={subLinkClass}>
//             Blogs List
//           </NavLink>
//         </Dropdown>

//         {/* ✅ TERMS DROPDOWN (ADDED) */}
//         <Dropdown title="Terms" icon={FiFileText} open={termsOpen} setOpen={setTermsOpen}>
//           <NavLink
//             to="/terms-and-conditions"
//             onClick={() => setOpen(false)}
//             className={subLinkClass}
//           >
//             Terms & Conditions
//           </NavLink>
//           <NavLink
//             to="/payment-mode-terms"
//             onClick={() => setOpen(false)}
//             className={subLinkClass}
//           >
//             Payment Mode 
//           </NavLink>
//           <NavLink
//             to="/cancellation-policy"
//             onClick={() => setOpen(false)}
//             className={subLinkClass}
//           >
//             Cancellation Policy
//           </NavLink>
//         </Dropdown>

//         <NavLink to="/reports" onClick={() => setOpen(false)} className={linkClass}>
//           <FiBarChart2 size={18} />
//           Reports
//         </NavLink>

//         <NavLink to="/settings" onClick={() => setOpen(false)} className={linkClass}>
//           <FiSettings size={18} />
//           Settings
//         </NavLink>
//       </nav>

//       <div className="border-t border-slate-200 dark:border-slate-700 p-3">
//         <button
//           onClick={handleLogout}
//           className="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-600
//           hover:bg-red-100 dark:hover:bg-red-900/40 transition"
//         >
//           <FiLogOut size={18} />
//           Logout
//         </button>
//       </div>

//       <button
//         onClick={() => setOpen(false)}
//         className="md:hidden m-4 p-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
//       >
//         Close
//       </button>
//     </aside>
//   )
// }

// export default Sidebar


import { NavLink, useNavigate } from "react-router-dom"
import {
  FiHome,
  FiUsers,
  FiSettings,
  FiBarChart2,
  FiLogOut,
  FiVideo,
  FiChevronDown,
  FiMapPin,
  FiImage,
  FiFileText,
  FiMessageSquare,
  FiPhone,
  FiSend,
  FiMail,
} from "react-icons/fi"
import { useState } from "react"
import useAuthStore from "../stores/authStores"

/* =========================
   REUSABLE DROPDOWN
========================= */
const Dropdown = ({ title, icon, open, setOpen, children }) => {
  const Icon = icon

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-3 py-2 rounded-lg text-sm font-medium
        text-slate-700 dark:text-slate-300 hover:bg-blue-100 dark:hover:bg-slate-800 transition"
      >
        <span className="flex items-center gap-3">
          {Icon && <Icon size={18} />}
          {title}
        </span>
        <FiChevronDown
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && <div className="ml-8 space-y-1">{children}</div>}
    </>
  )
}

/* =========================
   SIDEBAR
========================= */
const Sidebar = ({ open, setOpen }) => {
  const navigate = useNavigate()
  const logout = useAuthStore((state) => state.logout)

  const [userOpen, setUserOpen] = useState(false)
  const [destinationOpen, setDestinationOpen] = useState(false)
  const [galleryOpen, setGalleryOpen] = useState(false)
  const [testimonialOpen, setTestimonialOpen] = useState(false)
  const [itineraryOpen, setItineraryOpen] = useState(false)
  const [resortOpen, setResortOpen] = useState(false)
  const [blogOpen, setBlogOpen] = useState(false)
  const [termsOpen, setTermsOpen] = useState(false)
  const [leadsOpen, setLeadsOpen] = useState(false) // ✅ ADDED

  const handleLogout = () => {
    logout()
    setOpen(false)
    navigate("/login", { replace: true })
  }

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all
     ${
       isActive
         ? "bg-blue-600 text-white shadow"
         : "text-slate-700 dark:text-slate-300 hover:bg-blue-100 dark:hover:bg-slate-800"
     }`

  const subLinkClass = ({ isActive }) =>
    `block rounded-md px-3 py-2 text-sm transition
     ${
       isActive
         ? "bg-blue-500 text-white"
         : "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
     }`

  return (
    <aside
      className={`fixed z-30 flex h-full w-64 flex-col overflow-hidden border-r border-slate-200
      bg-linear-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950
      transition-transform duration-300
      ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
    >
      {/* LOGO */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700
        text-lg font-bold text-slate-900 dark:text-white bg-white/60 dark:bg-slate-900/60 backdrop-blur">
        T2H Admin Panel
      </div>

      {/* NAV */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-1">

        <NavLink to="/" onClick={() => setOpen(false)} className={linkClass}>
          <FiHome size={18} />
          Dashboard
        </NavLink>

        <Dropdown title="Users" icon={FiUsers} open={userOpen} setOpen={setUserOpen}>
          <NavLink to="/users/add" onClick={() => setOpen(false)} className={subLinkClass}>
            Add User
          </NavLink>
          <NavLink to="/users/list" onClick={() => setOpen(false)} className={subLinkClass}>
            User List
          </NavLink>
        </Dropdown>

        <Dropdown title="Destinations" icon={FiMapPin} open={destinationOpen} setOpen={setDestinationOpen}>
          <NavLink to="/destinations/create" onClick={() => setOpen(false)} className={subLinkClass}>
            Create Destination
          </NavLink>
          <NavLink to="/destinations/city" onClick={() => setOpen(false)} className={subLinkClass}>
            Create City
          </NavLink>
        </Dropdown>

        <Dropdown title="Itineraries" icon={FiMapPin} open={itineraryOpen} setOpen={setItineraryOpen}>
          <NavLink to="/itineraries/create" onClick={() => setOpen(false)} className={subLinkClass}>
            Create Itinerary
          </NavLink>
          <NavLink to="/itineraries/list" onClick={() => setOpen(false)} className={subLinkClass}>
            Itinerary List
          </NavLink>
        </Dropdown>

        <Dropdown title="Resorts" icon={FiMapPin} open={resortOpen} setOpen={setResortOpen}>
          <NavLink to="/resorts/create" onClick={() => setOpen(false)} className={subLinkClass}>
            Create Resort
          </NavLink>
          <NavLink to="/resorts/list" onClick={() => setOpen(false)} className={subLinkClass}>
            Resort List
          </NavLink>
        </Dropdown>

        <Dropdown title="Customer Gallery" icon={FiImage} open={galleryOpen} setOpen={setGalleryOpen}>
          <NavLink to="/gallery/images" onClick={() => setOpen(false)} className={subLinkClass}>
            Images
          </NavLink>
        </Dropdown>

        <Dropdown title="Testimonials" icon={FiVideo} open={testimonialOpen} setOpen={setTestimonialOpen}>
          <NavLink to="/testimonials/video" onClick={() => setOpen(false)} className={subLinkClass}>
            Testimonial Video
          </NavLink>
          <NavLink to="/testimonials/list" onClick={() => setOpen(false)} className={subLinkClass}>
            Testimonial List
          </NavLink>
        </Dropdown>

        <NavLink to="/hero-video" onClick={() => setOpen(false)} className={linkClass}>
          <FiVideo size={18} />
          Hero Video
        </NavLink>

        <Dropdown title="Blog" icon={FiImage} open={blogOpen} setOpen={setBlogOpen}>
          <NavLink to="/blogs/create" onClick={() => setOpen(false)} className={subLinkClass}>
            Create Blog
          </NavLink>
          <NavLink to="/blogs/list" onClick={() => setOpen(false)} className={subLinkClass}>
            Blogs List
          </NavLink>
        </Dropdown>

        {/* ✅ LEADS DROPDOWN */}
        <Dropdown title="Leads" icon={FiMessageSquare} open={leadsOpen} setOpen={setLeadsOpen}>
          <NavLink to="/leads/consultation" onClick={() => setOpen(false)} className={subLinkClass}>
            Consultation Requests
          </NavLink>
          <NavLink to="/leads/plan-journey" onClick={() => setOpen(false)} className={subLinkClass}>
            Plan Journey List
          </NavLink>
          <NavLink to="/leads/contacts" onClick={() => setOpen(false)} className={subLinkClass}>
            Contacts List
          </NavLink>
          <NavLink to="/leads/suggestions" onClick={() => setOpen(false)} className={subLinkClass}>
            Suggestions
          </NavLink>
          <NavLink to="/leads/subscribe" onClick={() => setOpen(false)} className={subLinkClass}>
            Subscribe
          </NavLink>
        </Dropdown>

        <Dropdown title="Terms" icon={FiFileText} open={termsOpen} setOpen={setTermsOpen}>
          <NavLink to="/terms-and-conditions" onClick={() => setOpen(false)} className={subLinkClass}>
            Terms & Conditions
          </NavLink>
          <NavLink to="/payment-mode-terms" onClick={() => setOpen(false)} className={subLinkClass}>
            Payment Mode
          </NavLink>
          <NavLink to="/cancellation-policy" onClick={() => setOpen(false)} className={subLinkClass}>
            Cancellation Policy
          </NavLink>
        </Dropdown>

        <NavLink to="/reports" onClick={() => setOpen(false)} className={linkClass}>
          <FiBarChart2 size={18} />
          Reports
        </NavLink>

        <NavLink to="/settings" onClick={() => setOpen(false)} className={linkClass}>
          <FiSettings size={18} />
          Settings
        </NavLink>
      </nav>

      <div className="border-t border-slate-200 dark:border-slate-700 p-3">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-600
          hover:bg-red-100 dark:hover:bg-red-900/40 transition"
        >
          <FiLogOut size={18} />
          Logout
        </button>
      </div>

      <button
        onClick={() => setOpen(false)}
        className="md:hidden m-4 p-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
      >
        Close
      </button>
    </aside>
  )
}

export default Sidebar
