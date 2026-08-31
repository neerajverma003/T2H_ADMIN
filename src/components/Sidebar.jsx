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
  ChevronsLeft,
  ChevronsRight,
  MessageSquare,
  Sparkles,
  ShieldCheck,
  CheckSquare,
  Building2,
  UserPlus,
  UserCheck,
  Mail,
  Tag,
  PlusCircle,
  Gift,
  Percent,
  BarChart3,
  Globe
} from "lucide-react"
import { useState, useEffect } from "react"
import useAuthStore from "../stores/authStores"
import { motion, AnimatePresence } from "framer-motion"

/* =========================
   REUSABLE DROPDOWN
========================= */
const NavDropdown = ({ title, icon: Icon, isOpen, onClick, children, isActive, isCollapsed, onExpand }) => {
  if (isCollapsed) {
    return (
      <div className="relative group mb-2 flex justify-center">
        <button
          onClick={() => {
            if (onExpand) onExpand();
            if (onClick) onClick();
          }}
          className={`size-11 rounded-2xl flex items-center justify-center transition-all cursor-pointer ${isActive
            ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-white"
            }`}
          title={title}
        >
          <Icon size={20} strokeWidth={2} />
        </button>
        <span className="absolute left-full ml-3.5 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-slate-900 dark:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-2xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 z-50">
          {title}
        </span>
      </div>
    );
  }

  return (
    <div className="mb-1">
      <button
        onClick={onClick}
        className={`
          flex w-full items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 cursor-pointer group
          ${isActive
            ? "bg-blue-50 dark:bg-[#2563eb]/15 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 font-extrabold"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-white"}
        `}
      >
        <span className="flex items-center gap-3.5">
          <Icon size={18} strokeWidth={2} className={isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white"} />
          <span className="tracking-wide">{title}</span>
        </span>
        <ChevronDown
          size={14}
          className={`transition-transform duration-300 ${isOpen ? "rotate-180 text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300"}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="ml-9 mt-1 space-y-1 border-l-2 border-slate-200 dark:border-slate-800/80 pl-3 py-1">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* =========================
   NAV ITEM COMPONENT
========================= */
const NavItem = ({ to, label, icon: Icon, isCollapsed, handleNavClick }) => {
  return (
    <NavLink
      to={to}
      onClick={handleNavClick}
      className={({ isActive }) =>
        isCollapsed
          ? `flex items-center justify-center size-11 mx-auto rounded-2xl transition-all duration-200 mb-2 cursor-pointer relative group ${isActive
            ? "bg-[#2563eb] text-white shadow-lg shadow-blue-600/30"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-white"
          }`
          : `flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 mb-1 cursor-pointer group ${isActive
            ? "bg-[#2563eb] text-white shadow-lg shadow-blue-600/30 font-extrabold"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-white"
          }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon size={20} strokeWidth={2} className={!isCollapsed && isActive ? "text-white" : ""} />
          {!isCollapsed && <span className="tracking-wide">{label}</span>}
          {isCollapsed && (
            <span className="absolute left-full ml-3.5 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-slate-900 dark:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-2xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 z-50">
              {label}
            </span>
          )}
        </>
      )}
    </NavLink>
  )
}

/* =========================
   SIDEBAR
========================= */
const Sidebar = ({ open, setOpen }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const logout = useAuthStore((state) => state.logout)
  const role = useAuthStore((state) => state.role)

  const [openMenus, setOpenMenus] = useState({})

  useEffect(() => {
    if (window.innerWidth < 768) {
      setOpen(false)
    }

    const path = location.pathname
    if (path.includes('/users')) toggleMenu('users', true)
    if (path.includes('/destinations')) toggleMenu('destinations', true)
    if (path.includes('/itineraries')) toggleMenu('itineraries', true)
    if (path.includes('/resorts')) toggleMenu('resorts', true)
    if (path.includes('/hotels')) toggleMenu('hotels', true)
    if (path.includes('/testimonials')) toggleMenu('testimonials', true)
    if (path.includes('/blogs')) toggleMenu('blogs', true)
    if (path.includes('/articles')) toggleMenu('articles', true)
    if (path.includes('/giftcards')) toggleMenu('giftcards', true)
    if (path.includes('/leads')) toggleMenu('leads', true)
    if (path.includes('/hero')) toggleMenu('hero', true)
    if (path.includes('/team')) toggleMenu('team', true)
    if (path.includes('/terms') || path.includes('/policy') || path.includes('/payment')) toggleMenu('terms', true)
  }, [location, setOpen])

  const toggleMenu = (menu, force) => {
    setOpenMenus(prev => ({
      ...prev,
      [menu]: force !== undefined ? force : !prev[menu]
    }))
  }

  const handleNavClick = () => {
    if (window.innerWidth < 768) {
      setOpen(false)
    }
  }

  const handleLogout = () => {
    logout()
    if (window.innerWidth < 768) setOpen(false)
    navigate("/login", { replace: true })
  }

  const subLinkClass = ({ isActive }) =>
    `flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-[13px] font-semibold transition-all duration-200 cursor-pointer
     ${isActive
      ? "text-blue-600 dark:text-blue-400 font-extrabold bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20"
      : "text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/50"
    }`

  const isCollapsed = !open;

  return (
    <>
      {/* MOBILE BACKDROP OVERLAY */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          aria-label="Close menu overlay"
          className="fixed inset-0 z-30 bg-slate-950/80 backdrop-blur-md md:hidden transition-opacity duration-300 cursor-pointer"
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-40 flex h-full flex-col overflow-hidden border-r border-slate-200 dark:border-slate-800/80
        bg-white dark:bg-[#070b16] transition-all duration-300 ease-in-out shadow-2xl
        ${open ? "w-[270px] translate-x-0" : "w-[270px] -translate-x-full md:translate-x-0 md:w-[80px]"}`}
      >
        {/* TRIP2HONEYMOON LOGO HEADER */}
        {open ? (
          <div className="p-4 pb-2 flex items-center justify-between gap-2">
            <div className="flex items-center justify-start max-w-[230px] w-full py-1">
              <img
                src="/TripLogo-light.png"
                alt="Trip2Honeymoon"
                className="h-18 md:h-20 w-full object-contain dark:hidden"
              />
              <img
                src="/TripLogo-dark.png"
                alt="Trip2Honeymoon"
                className="h-18 md:h-20 w-full object-contain hidden dark:block"
              />
            </div>

            <button
              onClick={() => setOpen(false)}
              className="text-slate-400 hover:text-slate-800 dark:hover:text-white p-2 transition-colors cursor-pointer"
              title="Collapse Sidebar"
              aria-label="Collapse sidebar"
            >
              <ChevronsLeft size={20} />
            </button>
          </div>
        ) : (
          <div className="p-4 pb-2 flex items-center justify-center">
            <button
              onClick={() => setOpen(true)}
              className="size-11 rounded-2xl bg-blue-50 dark:bg-blue-600/15 border border-blue-200 dark:border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400 hover:scale-105 transition-all cursor-pointer relative group"
              title="Expand Sidebar"
            >
              <ChevronsRight size={20} />
              <span className="absolute left-full ml-3.5 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-slate-900 dark:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-2xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 z-50">
                Expand Sidebar
              </span>
            </button>
          </div>
        )}

        {/* NAVIGATION LINKS */}
        <nav className="flex-1 overflow-y-auto px-3 pb-6 custom-scrollbar space-y-1">
          {/* DASHBOARD SECTION */}
          {open ? (
            <p className="px-4 pt-4 pb-2 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
              DASHBOARD
            </p>
          ) : (
            <div className="my-2 border-t border-slate-100 dark:border-slate-800/60" />
          )}

          <NavItem to="/" label="Dashboard" icon={LayoutDashboard} isCollapsed={isCollapsed} handleNavClick={handleNavClick} />

          {/* PUBLIC USER SECTION */}
          {open ? (
            <p className="px-4 pt-4 pb-2 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
              PUBLIC USER
            </p>
          ) : (
            <div className="my-2 border-t border-slate-100 dark:border-slate-800/60" />
          )}

          <NavItem to="/customers" label="Registered Users" icon={UserCheck} isCollapsed={isCollapsed} handleNavClick={handleNavClick} />

          {/* USERS SECTION */}
          {role === 'superadmin' && (
            <>
              {open ? (
                <p className="px-4 pt-4 pb-2 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                  USERS
                </p>
              ) : (
                <div className="my-2 border-t border-slate-100 dark:border-slate-800/60" />
              )}

              <NavItem to="/users/add" label="Add User" icon={UserPlus} isCollapsed={isCollapsed} handleNavClick={handleNavClick} />
              <NavItem to="/users/list" label="Users List" icon={Users} isCollapsed={isCollapsed} handleNavClick={handleNavClick} />
              <NavItem to="/users/referrals" label="Referral Audit" icon={ShieldCheck} isCollapsed={isCollapsed} handleNavClick={handleNavClick} />
            </>
          )}

          {/* DESTINATIONS SECTION */}
          {open ? (
            <p className="px-4 pt-4 pb-2 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
              DESTINATIONS
            </p>
          ) : (
            <div className="my-2 border-t border-slate-100 dark:border-slate-800/60" />
          )}

          <NavItem to="/destinations/create" label="Create Destination" icon={MapPin} isCollapsed={isCollapsed} handleNavClick={handleNavClick} />
          <NavItem to="/destinations/city" label="Create City" icon={Building2} isCollapsed={isCollapsed} handleNavClick={handleNavClick} />

          {/* ITINERARIES SECTION */}
          {open ? (
            <p className="px-4 pt-4 pb-2 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
              ITINERARIES
            </p>
          ) : (
            <div className="my-2 border-t border-slate-100 dark:border-slate-800/60" />
          )}

          <NavItem to="/itineraries/create" label="Create Itinerary" icon={PlusCircle} isCollapsed={isCollapsed} handleNavClick={handleNavClick} />
          <NavItem to="/itineraries/list" label="Itinerary List" icon={FileText} isCollapsed={isCollapsed} handleNavClick={handleNavClick} />

          {/* HOTELS & RESORTS SECTION */}
          {open ? (
            <p className="px-4 pt-4 pb-2 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
              HOTELS & RESORTS
            </p>
          ) : (
            <div className="my-2 border-t border-slate-100 dark:border-slate-800/60" />
          )}

          <NavDropdown
            title="Resorts"
            icon={Building2}
            isOpen={openMenus.resorts}
            onClick={() => toggleMenu('resorts')}
            isActive={location.pathname.includes('/resorts')}
            isCollapsed={isCollapsed}
            onExpand={() => setOpen(true)}
          >
            <NavLink to="/resorts/create" onClick={handleNavClick} className={subLinkClass}>Create Resort</NavLink>
            <NavLink to="/resorts/list" onClick={handleNavClick} className={subLinkClass}>Resort Directory</NavLink>
          </NavDropdown>

          <NavDropdown
            title="Hotels"
            icon={Building2}
            isOpen={openMenus.hotels}
            onClick={() => toggleMenu('hotels')}
            isActive={location.pathname.includes('/hotels')}
            isCollapsed={isCollapsed}
            onExpand={() => setOpen(true)}
          >
            <NavLink to="/hotels/create" onClick={handleNavClick} className={subLinkClass}>Create Hotel</NavLink>
            <NavLink to="/hotels/list" onClick={handleNavClick} className={subLinkClass}>Hotel List</NavLink>
          </NavDropdown>

          <NavItem to="/bookings" label="Booked Packages" icon={CheckSquare} isCollapsed={isCollapsed} handleNavClick={handleNavClick} />

          {/* BANNER MANAGEMENT & CONTENT */}
          {open ? (
            <p className="px-4 pt-4 pb-2 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
              BANNER MANAGEMENT & MEDIA
            </p>
          ) : (
            <div className="my-2 border-t border-slate-100 dark:border-slate-800/60" />
          )}

          <NavDropdown
            title="Hero & Banners"
            icon={Video}
            isOpen={openMenus.hero}
            onClick={() => toggleMenu('hero')}
            isActive={location.pathname.includes("hero")}
            isCollapsed={isCollapsed}
            onExpand={() => setOpen(true)}
          >
            <NavLink to="/hero-content" onClick={handleNavClick} className={subLinkClass}>Hero Content</NavLink>
            <NavLink to="/hero-media" onClick={handleNavClick} className={subLinkClass}>Hero Media</NavLink>
          </NavDropdown>

          <NavItem to="/gallery/images" label="Customer Gallery" icon={ImageIcon} isCollapsed={isCollapsed} handleNavClick={handleNavClick} />
          <NavItem to="/social-management" label="Social Management" icon={MessageSquare} isCollapsed={isCollapsed} handleNavClick={handleNavClick} />

          <NavDropdown
            title="Gift Cards"
            icon={Sparkles}
            isOpen={openMenus.giftcards}
            onClick={() => toggleMenu('giftcards')}
            isActive={location.pathname.includes('/giftcards')}
            isCollapsed={isCollapsed}
            onExpand={() => setOpen(true)}
          >
            <NavLink to="/giftcards/verify" onClick={handleNavClick} className={subLinkClass}>Verify & Manage</NavLink>
            <NavLink to="/giftcards/bulk" onClick={handleNavClick} className={subLinkClass}>Bulk Issue</NavLink>
            <NavLink to="/giftcards/discount" onClick={handleNavClick} className={subLinkClass}>Gift Discount</NavLink>
          </NavDropdown>

          <NavDropdown
            title="Blog & Articles"
            icon={FileText}
            isOpen={openMenus.blogs || openMenus.articles}
            onClick={() => toggleMenu('blogs')}
            isActive={location.pathname.includes('/blogs') || location.pathname.includes('/articles')}
            isCollapsed={isCollapsed}
            onExpand={() => setOpen(true)}
          >
            <NavLink to="/blogs/create" onClick={handleNavClick} className={subLinkClass}>Write Blog</NavLink>
            <NavLink to="/blogs/list" onClick={handleNavClick} className={subLinkClass}>Blog List</NavLink>
            <NavLink to="/articles/create" onClick={handleNavClick} className={subLinkClass}>Write Article</NavLink>
            <NavLink to="/articles/list" onClick={handleNavClick} className={subLinkClass}>Article List</NavLink>
          </NavDropdown>

          <NavDropdown
            title="Testimonials & Reviews"
            icon={Sparkles}
            isOpen={openMenus.testimonials}
            onClick={() => toggleMenu('testimonials')}
            isActive={location.pathname.includes('/testimonials')}
            isCollapsed={isCollapsed}
            onExpand={() => setOpen(true)}
          >
            <NavLink to="/testimonials/video" onClick={handleNavClick} className={subLinkClass}>Upload Video Story</NavLink>
            <NavLink to="/testimonials/video-list" onClick={handleNavClick} className={subLinkClass}>Video Storyboard</NavLink>
            <NavLink to="/testimonials/written" onClick={handleNavClick} className={subLinkClass}>Compose Review</NavLink>
            <NavLink to="/testimonials/written-list" onClick={handleNavClick} className={subLinkClass}>General Reviews</NavLink>
          </NavDropdown>

          {/* OUR GLOBAL IMPACT SECTION */}
          {open ? (
            <p className="px-4 pt-4 pb-2 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
              OUR GLOBAL IMPACT
            </p>
          ) : (
            <div className="my-2 border-t border-slate-100 dark:border-slate-800/60" />
          )}

          <NavItem to="/global-impact" label="Impact Overview" icon={Globe} isCollapsed={isCollapsed} handleNavClick={handleNavClick} />

          {/* LEADS & COMPLIANCE SECTION */}
          {open ? (
            <p className="px-4 pt-4 pb-2 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
              LEADS & COMPLIANCE
            </p>
          ) : (
            <div className="my-2 border-t border-slate-100 dark:border-slate-800/60" />
          )}

          <NavDropdown
            title="Customer Leads"
            icon={Tag}
            isOpen={openMenus.leads}
            onClick={() => toggleMenu('leads')}
            isActive={location.pathname.includes('/leads')}
            isCollapsed={isCollapsed}
            onExpand={() => setOpen(true)}
          >
            <NavLink to="/leads/consultation" onClick={handleNavClick} className={subLinkClass}>Consultations</NavLink>
            <NavLink to="/leads/honeymoon-requests" onClick={handleNavClick} className={subLinkClass}>Trip Requests</NavLink>
            <NavLink to="/leads/itinerary-leads" onClick={handleNavClick} className={subLinkClass}>Itinerary Leads</NavLink>
            <NavLink to="/leads/plan-journey" onClick={handleNavClick} className={subLinkClass}>Journey Plans</NavLink>
            <NavLink to="/leads/contacts" onClick={handleNavClick} className={subLinkClass}>Contact Leads</NavLink>
            <NavLink to="/leads/suggestions" onClick={handleNavClick} className={subLinkClass}>Suggestions</NavLink>
            <NavLink to="/leads/subscribe" onClick={handleNavClick} className={subLinkClass}>Newsletter</NavLink>
          </NavDropdown>

          <NavDropdown
            title="Compliance"
            icon={FileText}
            isOpen={openMenus.terms}
            onClick={() => toggleMenu('terms')}
            isActive={location.pathname.includes('/terms') || location.pathname.includes('/global-terms') || location.pathname.includes('/user-agreement') || location.pathname.includes('/policy')}
            isCollapsed={isCollapsed}
            onExpand={() => setOpen(true)}
          >
            <NavLink to="/global-terms" onClick={handleNavClick} className={subLinkClass}>Global Terms</NavLink>
            <NavLink to="/user-agreement" onClick={handleNavClick} className={subLinkClass}>User Agreement</NavLink>
            <NavLink to="/terms-and-conditions" onClick={handleNavClick} className={subLinkClass}>Destination T&C</NavLink>
            <NavLink to="/payment-mode-terms" onClick={handleNavClick} className={subLinkClass}>Payment Terms</NavLink>
            <NavLink to="/cancellation-policy" onClick={handleNavClick} className={subLinkClass}>Cancellation Policy</NavLink>
          </NavDropdown>

          <NavDropdown
            title="Our Team"
            icon={UserPlus}
            isOpen={openMenus.team}
            onClick={() => toggleMenu('team')}
            isActive={location.pathname.includes('/team')}
            isCollapsed={isCollapsed}
            onExpand={() => setOpen(true)}
          >
            <NavLink to="/team/create" onClick={handleNavClick} className={subLinkClass}>Add Member</NavLink>
            <NavLink to="/team/list" onClick={handleNavClick} className={subLinkClass}>Manage Team</NavLink>
          </NavDropdown>

          {/* SETTINGS & AUDIT */}
          {role === 'superadmin' && (
            <>
              {open ? (
                <p className="px-4 pt-4 pb-2 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                  SYSTEM AUDIT
                </p>
              ) : (
                <div className="my-2 border-t border-slate-100 dark:border-slate-800/60" />
              )}

              <NavItem to="/reports" label="Analytics" icon={BarChart2} isCollapsed={isCollapsed} handleNavClick={handleNavClick} />
              <NavItem to="/audit-logs" label="Security Audit" icon={ShieldCheck} isCollapsed={isCollapsed} handleNavClick={handleNavClick} />
            </>
          )}

          {open ? (
            <p className="px-4 pt-4 pb-2 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
              SETTINGS
            </p>
          ) : (
            <div className="my-2 border-t border-slate-100 dark:border-slate-800/60" />
          )}

          <NavItem to="/settings/notifications" label="Notification Emails" icon={Mail} isCollapsed={isCollapsed} handleNavClick={handleNavClick} />
          <NavItem to="/settings/referral" label="Referral Rewards" icon={Gift} isCollapsed={isCollapsed} handleNavClick={handleNavClick} />
          <NavItem to="/settings/gst" label="GST & Business Settings" icon={Percent} isCollapsed={isCollapsed} handleNavClick={handleNavClick} />
          <NavItem to="/settings/stats" label="Home Stats Settings" icon={BarChart3} isCollapsed={isCollapsed} handleNavClick={handleNavClick} />
          <NavItem to="/settings/chatbot" label="Travel Assistant" icon={MessageSquare} isCollapsed={isCollapsed} handleNavClick={handleNavClick} />
          <NavItem to="/settings" label="Settings" icon={Settings} isCollapsed={isCollapsed} handleNavClick={handleNavClick} />
        </nav>

        {/* LOGOUT BOX CONTAINER - MATCHING ADMIRE HOLIDAYS */}
        {open ? (
          <div className="p-4 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-[#070b16]">
            <button
              onClick={handleLogout}
              className="w-full bg-white dark:bg-[#0f172a] hover:bg-rose-50 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 flex items-center justify-between transition-all cursor-pointer group shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-xl bg-rose-500/15 text-rose-500 flex items-center justify-center border border-rose-500/30 group-hover:scale-105 transition-transform shrink-0">
                  <LogOut size={16} strokeWidth={2.5} />
                </div>
                <div className="text-left">
                  <p className="text-xs font-extrabold text-rose-500 leading-tight">Sign Out</p>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-0.5">END SESSION</p>
                </div>
              </div>
            </button>
          </div>
        ) : (
          <div className="p-4 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-[#070b16] flex justify-center">
            <button
              onClick={handleLogout}
              className="size-11 rounded-2xl bg-rose-500/15 text-rose-500 flex items-center justify-center border border-rose-500/30 hover:scale-105 transition-all cursor-pointer relative group"
              title="Sign Out"
            >
              <LogOut size={18} strokeWidth={2.5} />
              <span className="absolute left-full ml-3.5 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-slate-900 dark:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-2xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 z-50">
                Sign Out
              </span>
            </button>
          </div>
        )}
      </aside>
    </>
  )
}

export default Sidebar
