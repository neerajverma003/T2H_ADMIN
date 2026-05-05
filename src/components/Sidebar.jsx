import { NavLink, useNavigate, useLocation } from "react-router-dom"
import {
  LayoutDashboard,
  Users,
  MapPin,
  Image as ImageIcon,
  Video,
  FileText,
  BarChart2,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  MessageSquare,
  Sparkles,
  ShieldCheck
} from "lucide-react"
import { useState, useEffect } from "react"
import useAuthStore from "../stores/authStores"
import { motion, AnimatePresence } from "framer-motion"

/* =========================
   REUSABLE DROPDOWN
========================= */
const NavDropdown = ({ title, icon: Icon, isOpen, onClick, children, isActive }) => {
  return (
    <div className="mb-1">
      <button
        onClick={onClick}
        className={`
          flex w-full items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200
          ${isActive 
            ? "bg-indigo-50 text-indigo-600" 
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50"}
        `}
      >
        <span className="flex items-center gap-3">
          <div className={`p-1.5 rounded-lg ${isActive ? "bg-indigo-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-400"}`}>
            <Icon size={16} strokeWidth={2.5} />
          </div>
          {title}
        </span>
        <ChevronDown
          size={14}
          className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="ml-10 mt-1 space-y-1 border-l-2 border-slate-100 dark:border-slate-800 pl-4 py-1">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* =========================
   SIDEBAR
========================= */
const Sidebar = ({ open, setOpen }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const logout = useAuthStore((state) => state.logout)

  const [openMenus, setOpenMenus] = useState({})

  useEffect(() => {
    const path = location.pathname
    if (path.includes('/users')) toggleMenu('users', true)
    if (path.includes('/destinations')) toggleMenu('destinations', true)
    if (path.includes('/itineraries')) toggleMenu('itineraries', true)
    if (path.includes('/resorts')) toggleMenu('resorts', true)
    if (path.includes('/testimonials')) toggleMenu('testimonials', true)
    if (path.includes('/blogs')) toggleMenu('blogs', true)
    if (path.includes('/leads')) toggleMenu('leads', true)
    if (path.includes('/terms') || path.includes('/policy') || path.includes('/payment')) toggleMenu('terms', true)
  }, [location])

  const toggleMenu = (menu, force) => {
    setOpenMenus(prev => ({
      ...prev,
      [menu]: force !== undefined ? force : !prev[menu]
    }))
  }

  const handleLogout = () => {
    logout()
    setOpen(false)
    navigate("/login", { replace: true })
  }

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 mb-1
     ${
       isActive
         ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
         : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50"
     }`

  const subLinkClass = ({ isActive }) =>
    `flex items-center gap-2 rounded-lg px-4 py-2 text-[13px] font-medium transition-all duration-200
     ${
       isActive
         ? "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20"
         : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/30"
     }`

  return (
    <aside
      className={`fixed z-40 flex h-full w-[270px] flex-col overflow-hidden border-r border-slate-100 dark:border-slate-800/40
      bg-white dark:bg-slate-900/95 backdrop-blur-xl transition-all duration-500 ease-in-out
      ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
    >
      {/* LOGO AREA */}
      <div className="p-6 mb-2">
        <div className="flex items-center gap-3">
          <div className="size-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
             <Sparkles className="text-white" size={20} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight leading-none">T2H ADMIN</h1>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-1">Honeymoon Portal</p>
          </div>
        </div>
      </div>

      {/* NAV LINKS */}
      <nav className="flex-1 overflow-y-auto px-4 pb-6 custom-scrollbar">
        <div className="space-y-1">
          <p className="px-4 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Main Hub</p>
          
          <NavLink to="/" onClick={() => setOpen(false)} className={navLinkClass}>
             <LayoutDashboard size={18} strokeWidth={2} />
             Dashboard
          </NavLink>

          <NavDropdown 
            title="Users" 
            icon={Users} 
            isOpen={openMenus.users} 
            onClick={() => toggleMenu('users')}
            isActive={location.pathname.includes('/users')}
          >
            <NavLink to="/users/add" onClick={() => setOpen(false)} className={subLinkClass}>Add New User</NavLink>
            <NavLink to="/users/list" onClick={() => setOpen(false)} className={subLinkClass}>User Directory</NavLink>
          </NavDropdown>

          <NavDropdown 
            title="Destinations" 
            icon={MapPin} 
            isOpen={openMenus.destinations} 
            onClick={() => toggleMenu('destinations')}
            isActive={location.pathname.includes('/destinations')}
          >
            <NavLink to="/destinations/create" onClick={() => setOpen(false)} className={subLinkClass}>Create Destination</NavLink>
            <NavLink to="/destinations/city" onClick={() => setOpen(false)} className={subLinkClass}>City Manager</NavLink>
          </NavDropdown>

          <NavDropdown 
            title="Itineraries" 
            icon={MapPin} 
            isOpen={openMenus.itineraries} 
            onClick={() => toggleMenu('itineraries')}
            isActive={location.pathname.includes('/itineraries')}
          >
            <NavLink to="/itineraries/create" onClick={() => setOpen(false)} className={subLinkClass}>Create Itinerary</NavLink>
            <NavLink to="/itineraries/list" onClick={() => setOpen(false)} className={subLinkClass}>Itinerary List</NavLink>
          </NavDropdown>

          <NavDropdown 
            title="Resorts" 
            icon={MapPin} 
            isOpen={openMenus.resorts} 
            onClick={() => toggleMenu('resorts')}
            isActive={location.pathname.includes('/resorts')}
          >
            <NavLink to="/resorts/create" onClick={() => setOpen(false)} className={subLinkClass}>Create Resort</NavLink>
            <NavLink to="/resorts/list" onClick={() => setOpen(false)} className={subLinkClass}>Resort Directory</NavLink>
          </NavDropdown>

          <p className="px-4 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Content</p>

          <NavLink to="/gallery/images" onClick={() => setOpen(false)} className={navLinkClass}>
             <ImageIcon size={18} strokeWidth={2} />
             Customer Gallery
          </NavLink>

          <NavDropdown 
            title="Testimonials" 
            icon={Video} 
            isOpen={openMenus.testimonials} 
            onClick={() => toggleMenu('testimonials')}
            isActive={location.pathname.includes('/testimonials')}
          >
            <NavLink to="/testimonials/video" onClick={() => setOpen(false)} className={subLinkClass}>Video Reviews</NavLink>
            <NavLink to="/testimonials/list" onClick={() => setOpen(false)} className={subLinkClass}>Written Reviews</NavLink>
          </NavDropdown>

          <NavLink to="/hero-video" onClick={() => setOpen(false)} className={navLinkClass}>
             <Video size={18} strokeWidth={2} />
             Hero Media
          </NavLink>

          <NavDropdown 
            title="Blog" 
            icon={ImageIcon} 
            isOpen={openMenus.blogs} 
            onClick={() => toggleMenu('blogs')}
            isActive={location.pathname.includes('/blogs')}
          >
            <NavLink to="/blogs/create" onClick={() => setOpen(false)} className={subLinkClass}>Write Blog</NavLink>
            <NavLink to="/blogs/list" onClick={() => setOpen(false)} className={subLinkClass}>Blog Articles</NavLink>
          </NavDropdown>

          <p className="px-4 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Leads & Policy</p>

          <NavDropdown 
            title="Leads" 
            icon={MessageSquare} 
            isOpen={openMenus.leads} 
            onClick={() => toggleMenu('leads')}
            isActive={location.pathname.includes('/leads')}
          >
            <NavLink to="/leads/consultation" onClick={() => setOpen(false)} className={subLinkClass}>Consultations</NavLink>
            <NavLink to="/leads/honeymoon-requests" onClick={() => setOpen(false)} className={subLinkClass}>Trip Requests</NavLink>
            <NavLink to="/leads/plan-journey" onClick={() => setOpen(false)} className={subLinkClass}>Journey Plans</NavLink>
            <NavLink to="/leads/contacts" onClick={() => setOpen(false)} className={subLinkClass}>Contact Leads</NavLink>
          </NavDropdown>

          <NavDropdown 
            title="Compliance" 
            icon={FileText} 
            isOpen={openMenus.terms} 
            onClick={() => toggleMenu('terms')}
            isActive={location.pathname.includes('/terms') || location.pathname.includes('/policy')}
          >
            <NavLink to="/terms-and-conditions" onClick={() => setOpen(false)} className={subLinkClass}>Terms & Conditions</NavLink>
            <NavLink to="/payment-mode-terms" onClick={() => setOpen(false)} className={subLinkClass}>Payment Terms</NavLink>
            <NavLink to="/cancellation-policy" onClick={() => setOpen(false)} className={subLinkClass}>Cancellation Policy</NavLink>
          </NavDropdown>

          <NavLink to="/reports" onClick={() => setOpen(false)} className={navLinkClass}>
             <BarChart2 size={18} strokeWidth={2} />
             Analytics
          </NavLink>
          
          <NavLink to="/audit-logs" onClick={() => setOpen(false)} className={navLinkClass}>
             <ShieldCheck size={18} strokeWidth={2} />
             Security Audit
          </NavLink>

          <NavLink to="/settings" onClick={() => setOpen(false)} className={navLinkClass}>
             <Settings size={18} strokeWidth={2} />
             Settings
          </NavLink>
        </div>
      </nav>

      {/* LOGOUT AREA */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800/50">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-500
          hover:bg-red-50 transition-all duration-300"
        >
          <LogOut size={18} strokeWidth={2} />
          Sign Out
        </button>
      </div>

      {/* MOBILE CLOSE */}
      <button
        onClick={() => setOpen(false)}
        className="md:hidden absolute top-6 right-6 p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-xl"
      >
        <ChevronRight size={20} className="rotate-180" />
      </button>
    </aside>
  )
}

export default Sidebar
