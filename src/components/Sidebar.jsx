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
  Globe,
  Info,
  Compass,
  Briefcase,
  SearchX,
  LayoutList
} from "lucide-react"
import { useState, useEffect, useMemo } from "react"
import PropTypes from "prop-types"
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
            if (onExpand) onExpand()
            if (onClick) onClick()
          }}
          className={`size-11 rounded-2xl flex items-center justify-center transition-all cursor-pointer ${isActive
            ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
            : "text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/60 dark:hover:text-white"
            }`}
          title={title}
        >
          <Icon size={20} strokeWidth={2} />
        </button>
        <span className="absolute left-full ml-3.5 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-slate-900 dark:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-2xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 z-50">
          {title}
        </span>
      </div>
    )
  }

  const isHighlighted = isActive || isOpen

  return (
    <div className="mb-1">
      <button
        onClick={onClick}
        className={`
          flex w-full items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-150 cursor-pointer group
          ${isHighlighted
            ? "text-blue-600 dark:text-blue-400 font-extrabold"
            : "text-slate-800 hover:text-slate-950 dark:text-slate-200 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/50"}
        `}
      >
        <span className="flex items-center gap-3">
          <Icon
            size={18}
            strokeWidth={2.2}
            className={isHighlighted ? "text-blue-600 dark:text-blue-400" : "text-slate-700 dark:text-slate-300 group-hover:text-slate-950 dark:group-hover:text-white"}
          />
          <span className="tracking-wider">{title}</span>
        </span>
        <ChevronDown
          size={16}
          strokeWidth={2.5}
          className={`transition-transform duration-200 ${isOpen ? "rotate-180 text-blue-600 dark:text-blue-400" : "text-slate-600 dark:text-slate-400 group-hover:text-slate-950 dark:group-hover:text-white"}`}
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
            <div className="ml-5 mt-1 space-y-1.5 border-l-2 border-slate-200 dark:border-slate-800/80 pl-3 py-1">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

NavDropdown.propTypes = {
  title: PropTypes.string.isRequired,
  icon: PropTypes.elementType.isRequired,
  isOpen: PropTypes.bool,
  onClick: PropTypes.func,
  children: PropTypes.node,
  isActive: PropTypes.bool,
  isCollapsed: PropTypes.bool,
  onExpand: PropTypes.func
}

/* =========================
   SIDEBAR
========================= */
const Sidebar = ({ open, setOpen, search = "", setSearch }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const logout = useAuthStore((state) => state.logout)
  const role = useAuthStore((state) => state.role)
  const allowedSections = useAuthStore((state) => state.allowedSections)

  const hasPermission = (sectionKey) => {
    if (role === 'superadmin') return true
    if (Array.isArray(allowedSections)) {
      return allowedSections.includes(sectionKey)
    }
    return true
  }

  const [openMenus, setOpenMenus] = useState({})

  // Auto-expand sidebar on search input
  useEffect(() => {
    if (search.trim() && !open) {
      setOpen(true)
    }
  }, [search, open, setOpen])

  useEffect(() => {
    if (window.innerWidth < 768) {
      setOpen(false)
    }

    const path = location.pathname
    if (path === '/') toggleMenu('dashboard', true)
    if (path.includes('/customers')) toggleMenu('public_user', true)
    if (path.includes('/users')) toggleMenu('users', true)
    if (path.includes('/destinations')) toggleMenu('destinations', true)
    if (path.includes('/itineraries')) toggleMenu('itineraries', true)
    if (path.includes('/activities')) toggleMenu('activities', true)
    if (path.includes('/resorts')) toggleMenu('resorts', true)
    if (path.includes('/hotels')) toggleMenu('hotels', true)
    if (path.includes('/bookings')) toggleMenu('bookings', true)
    if (path.includes('/hero')) toggleMenu('hero', true)
    if (path.includes('/gallery')) toggleMenu('gallery', true)
    if (path.includes('/social-management')) toggleMenu('social_management', true)
    if (path.includes('/testimonials')) toggleMenu('testimonials', true)
    if (path.includes('/blogs')) toggleMenu('blogs', true)
    if (path.includes('/articles')) toggleMenu('articles', true)
    if (path.includes('/giftcards')) toggleMenu('giftcards', true)
    if (path.includes('/global-impact')) toggleMenu('global_impact', true)
    if (path.includes('/leads')) toggleMenu('leads', true)
    if (path.includes('/team')) toggleMenu('team', true)
    if (path.includes('/jobs')) toggleMenu('jobs', true)
    if (path.includes('/terms') || path.includes('/policy') || path.includes('/payment')) toggleMenu('terms', true)
    if (path.includes('/reports') || path.includes('/audit-logs')) toggleMenu('analytics', true)
    if (path.includes('/settings/notifications')) toggleMenu('notifications', true)
    if (path.includes('/settings/referral')) toggleMenu('referral', true)
    if (path.includes('/settings/gst')) toggleMenu('gst', true)
    if (path.includes('/settings/stats')) toggleMenu('stats', true)
    if (path.includes('/about-settings')) toggleMenu('about_settings', true)
    if (path.includes('/settings/chatbot')) toggleMenu('chatbot', true)
    if (path === '/settings') toggleMenu('settings', true)
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


  const isCollapsed = !open

  // All 29 organized sidebar sections
  const menuSections = useMemo(() => [
    {
      key: 'dashboard',
      title: 'Dashboard',
      icon: LayoutDashboard,
      show: hasPermission('dashboard'),
      isActive: location.pathname === '/',
      sublinks: [
        { to: '/', label: 'Dashboard', end: true }
      ],
      keywords: ['dashboard', 'home', 'overview', 'metrics', 'stats']
    },
    {
      key: 'public_user',
      title: 'Public User',
      icon: UserCheck,
      show: hasPermission('public_user'),
      isActive: location.pathname.includes('/customers'),
      sublinks: [
        { to: '/customers', label: 'Registered Users' }
      ],
      keywords: ['public user', 'customers', 'registered users', 'clients']
    },
    {
      key: 'users',
      title: 'Admin Users',
      icon: Users,
      show: role === 'superadmin' || hasPermission('users'),
      isActive: location.pathname.includes('/users'),
      sublinks: [
        (role === 'superadmin' || role === 'admin') && { to: '/users/add', label: 'Add User' },
        role === 'superadmin' && { to: '/users/section-controls', label: 'Section Controls' },
        { to: '/users/list', label: 'Users List' },
        { to: '/users/referrals', label: 'Referral Audit' }
      ].filter(Boolean),
      keywords: ['admin users', 'team', 'staff', 'roles', 'permissions', 'add user', 'users list', 'referral audit']
    },
    {
      key: 'destinations',
      title: 'Destinations',
      icon: MapPin,
      show: hasPermission('destinations'),
      isActive: location.pathname.includes('/destinations'),
      sublinks: [
        { to: '/destinations/create', label: 'Create Destination' },
        { to: '/destinations/city', label: 'Create City' }
      ],
      keywords: ['destinations', 'city', 'location', 'places', 'create destination', 'create city']
    },
    {
      key: 'itineraries',
      title: 'Itineraries',
      icon: PlusCircle,
      show: hasPermission('itineraries'),
      isActive: location.pathname.includes('/itineraries'),
      sublinks: [
        { to: '/itineraries/create', label: 'Create Itinerary' },
        { to: '/itineraries/list', label: 'Itinerary List' }
      ],
      keywords: ['itineraries', 'packages', 'trips', 'tours', 'plans', 'create itinerary', 'itinerary list']
    },
    {
      key: 'activities',
      title: 'Activities',
      icon: Compass,
      show: hasPermission('itineraries') || hasPermission('destinations'),
      isActive: location.pathname.includes('/activities'),
      sublinks: [
        { to: '/activities/create', label: 'Add Activity' },
        { to: '/activities', label: 'All Activities', end: true }
      ],
      keywords: ['activities', 'adventures', 'sports', 'things to do', 'add activity', 'all activities']
    },
    {
      key: 'resorts',
      title: 'Resorts',
      icon: Building2,
      show: hasPermission('resorts'),
      isActive: location.pathname.includes('/resorts'),
      sublinks: [
        { to: '/resorts/create', label: 'Create Resort' },
        { to: '/resorts/list', label: 'Resort Directory' }
      ],
      keywords: ['resorts', 'villas', 'stays', 'create resort', 'resort directory']
    },
    {
      key: 'hotels',
      title: 'Hotels',
      icon: Building2,
      show: hasPermission('hotels'),
      isActive: location.pathname.includes('/hotels'),
      sublinks: [
        { to: '/hotels/create', label: 'Create Hotel' },
        { to: '/hotels/list', label: 'Hotel List' }
      ],
      keywords: ['hotels', 'rooms', 'accommodations', 'create hotel', 'hotel list']
    },
    {
      key: 'bookings',
      title: 'Booked Packages',
      icon: CheckSquare,
      show: hasPermission('bookings'),
      isActive: location.pathname.includes('/bookings'),
      sublinks: [
        { to: '/bookings', label: 'Booked Packages' }
      ],
      keywords: ['booked packages', 'bookings', 'orders', 'purchases', 'reservations']
    },
    {
      key: 'hero',
      title: 'Hero & Banners',
      icon: Video,
      show: hasPermission('banner_management'),
      isActive: location.pathname.includes('hero'),
      sublinks: [
        { to: '/hero-content', label: 'Hero Content' },
        { to: '/hero-media', label: 'Hero Media' }
      ],
      keywords: ['hero', 'banners', 'media', 'slider', 'homepage content', 'hero content', 'hero media']
    },
    {
      key: 'gallery',
      title: 'Gallery',
      icon: ImageIcon,
      show: hasPermission('customer_gallery'),
      isActive: location.pathname.includes('/gallery'),
      sublinks: [
        { to: '/gallery/images', label: 'Customer Gallery' }
      ],
      keywords: ['gallery', 'images', 'photos', 'customer gallery', 'pictures']
    },
    {
      key: 'social_management',
      title: 'Social Management',
      icon: MessageSquare,
      show: hasPermission('social_management'),
      isActive: location.pathname.includes('/social-management'),
      sublinks: [
        { to: '/social-management', label: 'Social Management' }
      ],
      keywords: ['social management', 'social', 'instagram', 'facebook', 'media links']
    },
    {
      key: 'giftcards',
      title: 'Gift Cards',
      icon: Sparkles,
      show: hasPermission('gift_cards'),
      isActive: location.pathname.includes('/giftcards'),
      sublinks: [
        { to: '/giftcards/verify', label: 'Verify & Manage' },
        { to: '/giftcards/bulk', label: 'Bulk Issue' },
        { to: '/giftcards/discount', label: 'Gift Discount' }
      ],
      keywords: ['gift cards', 'vouchers', 'coupons', 'discounts', 'bulk issue', 'verify & manage', 'gift discount']
    },
    {
      key: 'blogs',
      title: 'Blog & Articles',
      icon: FileText,
      show: hasPermission('blog_articles'),
      isActive: location.pathname.includes('/blogs') || location.pathname.includes('/articles'),
      sublinks: [
        { to: '/blogs/create', label: 'Write Blog' },
        { to: '/blogs/list', label: 'Blog List' },
        { to: '/articles/create', label: 'Write Article' },
        { to: '/articles/list', label: 'Article List' }
      ],
      keywords: ['blogs', 'articles', 'write blog', 'posts', 'news', 'content', 'blog list', 'write article', 'article list']
    },
    {
      key: 'testimonials',
      title: 'Testimonials & Reviews',
      icon: Sparkles,
      show: hasPermission('testimonials'),
      isActive: location.pathname.includes('/testimonials'),
      sublinks: [
        { to: '/testimonials/video', label: 'Upload Video Story' },
        { to: '/testimonials/video-list', label: 'Video Storyboard' },
        { to: '/testimonials/written', label: 'Compose Review' },
        { to: '/testimonials/written-list', label: 'General Reviews' }
      ],
      keywords: ['testimonials', 'reviews', 'ratings', 'feedback', 'video story', 'upload video story', 'video storyboard', 'compose review', 'general reviews']
    },
    {
      key: 'global_impact',
      title: 'Impact Overview',
      icon: Globe,
      show: hasPermission('global_impact'),
      isActive: location.pathname.includes('/global-impact'),
      sublinks: [
        { to: '/global-impact', label: 'Impact Overview' }
      ],
      keywords: ['impact overview', 'global impact', 'social cause', 'sustainability']
    },
    {
      key: 'leads',
      title: 'Customer Leads',
      icon: Tag,
      show: hasPermission('leads'),
      isActive: location.pathname.includes('/leads'),
      sublinks: [
        { to: '/leads/consultation', label: 'Consultations' },
        { to: '/leads/honeymoon-requests', label: 'Trip Requests' },
        { to: '/leads/itinerary-leads', label: 'Itinerary Leads' },
        { to: '/leads/plan-journey', label: 'Journey Plans' },
        { to: '/leads/contacts', label: 'Contact Leads' },
        { to: '/leads/suggestions', label: 'Suggestions' },
        { to: '/leads/subscribe', label: 'Newsletter' }
      ],
      keywords: ['customer leads', 'leads', 'inquiries', 'consultation', 'trip requests', 'newsletter', 'contacts', 'honeymoon requests', 'itinerary leads', 'journey plans', 'suggestions']
    },
    {
      key: 'terms',
      title: 'Compliance',
      icon: FileText,
      show: hasPermission('compliance'),
      isActive: location.pathname.includes('/terms') || location.pathname.includes('/global-terms') || location.pathname.includes('/user-agreement') || location.pathname.includes('/policy'),
      sublinks: [
        { to: '/global-terms', label: 'Global Terms' },
        { to: '/user-agreement', label: 'User Agreement' },
        { to: '/terms-and-conditions', label: 'Destination T&C' },
        { to: '/payment-mode-terms', label: 'Payment Terms' },
        { to: '/cancellation-policy', label: 'Cancellation Policy' }
      ],
      keywords: ['compliance', 'terms', 'privacy policy', 'cancellation', 'agreements', 'user agreement', 'legal', 'global terms', 'destination t&c', 'payment terms', 'cancellation policy']
    },
    {
      key: 'team',
      title: 'Our Team',
      icon: UserPlus,
      show: hasPermission('our_team'),
      isActive: location.pathname.includes('/team'),
      sublinks: [
        { to: '/team/create', label: 'Add Member' },
        { to: '/team/list', label: 'Manage Team' }
      ],
      keywords: ['our team', 'team', 'members', 'staff', 'employees', 'add member', 'manage team']
    },
    {
      key: 'jobs',
      title: 'Job Management',
      icon: Briefcase,
      show: true,
      isActive: location.pathname.includes('/jobs'),
      sublinks: [
        { to: '/jobs/create', label: 'Create Job' },
        { to: '/jobs/list', label: 'All Job List' },
        { to: '/jobs/applications', label: 'Applications' }
      ],
      keywords: ['job management', 'jobs', 'careers', 'vacancies', 'applications', 'create job', 'all job list']
    },
    {
      key: 'marketing',
      title: 'Marketing',
      icon: Mail,
      show: hasPermission('marketing'),
      isActive: location.pathname.includes('/email-templates') || location.pathname.includes('/email-campaigns'),
      sublinks: [
        { to: '/email-templates', label: 'Email Templates' },
        { to: '/email-campaigns', label: 'Campaign Management' }
      ],
      keywords: ['marketing', 'campaigns', 'email templates', 'newsletter templates', 'campaign management']
    },
    {
      key: 'analytics',
      title: 'Analytics',
      icon: BarChart2,
      show: role === 'superadmin' || hasPermission('system_audit'),
      isActive: location.pathname.includes('/reports') || location.pathname.includes('/audit-logs'),
      sublinks: [
        { to: '/reports', label: 'Analytics' },
        { to: '/audit-logs', label: 'Security Audit' }
      ],
      keywords: ['analytics', 'reports', 'audit', 'security audit', 'logs', 'audit logs']
    },
    {
      key: 'notifications',
      title: 'Notification',
      icon: Mail,
      show: hasPermission('settings'),
      isActive: location.pathname.includes('/settings/notifications'),
      sublinks: [
        { to: '/settings/notifications', label: 'Notification Emails' }
      ],
      keywords: ['notification', 'emails', 'notification emails', 'alerts']
    },
    {
      key: 'referral',
      title: 'Referral Rewards',
      icon: Gift,
      show: hasPermission('settings'),
      isActive: location.pathname.includes('/settings/referral'),
      sublinks: [
        { to: '/settings/referral', label: 'Referral Rewards' }
      ],
      keywords: ['referral rewards', 'referral', 'bonuses', 'rewards']
    },
    {
      key: 'gst',
      title: 'GST',
      icon: Percent,
      show: hasPermission('settings'),
      isActive: location.pathname.includes('/settings/gst'),
      sublinks: [
        { to: '/settings/gst', label: 'GST & Business Settings' }
      ],
      keywords: ['gst', 'tax', 'business settings', 'taxes', 'invoice', 'gst & business settings']
    },
    {
      key: 'stats',
      title: 'Home Stats Settings',
      icon: BarChart3,
      show: hasPermission('settings'),
      isActive: location.pathname.includes('/settings/stats'),
      sublinks: [
        { to: '/settings/stats', label: 'Home Stats Settings' }
      ],
      keywords: ['home stats settings', 'stats', 'counters', 'numbers']
    },
    {
      key: 'about_settings',
      title: 'About Us Settings',
      icon: Info,
      show: hasPermission('settings'),
      isActive: location.pathname.includes('/about-settings'),
      sublinks: [
        { to: '/about-settings', label: 'About Us Settings' }
      ],
      keywords: ['about us settings', 'about us', 'company details', 'brand']
    },
    {
      key: 'chatbot',
      title: 'Travel Assistant',
      icon: MessageSquare,
      show: hasPermission('settings'),
      isActive: location.pathname.includes('/settings/chatbot'),
      sublinks: [
        { to: '/settings/chatbot', label: 'Travel Assistant' }
      ],
      keywords: ['travel assistant', 'chatbot', 'ai bot', 'assistant']
    },
    {
      key: 'settings',
      title: 'Setting',
      icon: Settings,
      show: hasPermission('settings'),
      isActive: location.pathname === '/settings',
      sublinks: [
        { to: '/settings', label: 'Settings', end: true }
      ],
      keywords: ['setting', 'settings', 'configuration', 'preferences']
    }
  ], [hasPermission, location.pathname, role])

  // Filter sections based on search query
  const cleanSearch = search.trim().toLowerCase()

  const filteredSections = useMemo(() => {
    return menuSections.filter(section => {
      if (!section.show) return false
      if (!cleanSearch) return true

      const matchesTitle = section.title.toLowerCase().includes(cleanSearch)
      const matchesSublinks = section.sublinks.some(sub =>
        sub.label.toLowerCase().includes(cleanSearch) || sub.to.toLowerCase().includes(cleanSearch)
      )
      const matchesKeywords = section.keywords && section.keywords.some(kw =>
        kw.toLowerCase().includes(cleanSearch)
      )

      return matchesTitle || matchesSublinks || matchesKeywords
    })
  }, [menuSections, cleanSearch])

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

        {/* SEARCH MATCH COUNT BADGE WHEN SEARCHING */}
        {cleanSearch && open && (
          <div className="mx-4 mb-2 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/40 flex items-center justify-between">
            <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">
              {filteredSections.length} {filteredSections.length === 1 ? 'section' : 'sections'} found
            </span>
            <button
              onClick={() => setSearch?.("")}
              className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 hover:text-blue-600 dark:hover:text-blue-300 transition-colors cursor-pointer"
            >
              Clear
            </button>
          </div>
        )}

        {/* NAVIGATION LINKS */}
        <nav className="flex-1 overflow-y-auto px-3 pb-6 space-y-1 scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {filteredSections.map(section => {
            const isSectionOpen = cleanSearch ? true : !!openMenus[section.key]

            return (
              <NavDropdown
                key={section.key}
                title={section.title}
                icon={section.icon}
                isOpen={isSectionOpen}
                onClick={() => toggleMenu(section.key)}
                isActive={section.isActive}
                isCollapsed={isCollapsed}
                onExpand={() => setOpen(true)}
              >
                {section.sublinks.map((sublink) => {
                  const isCreate = /create|add|write|upload|compose|register|new/i.test(sublink.label)
                  const IconComp = sublink.icon || (isCreate ? PlusCircle : LayoutList)

                  return (
                    <NavLink
                      key={sublink.to}
                      to={sublink.to}
                      end={sublink.end}
                      onClick={handleNavClick}
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all duration-150 cursor-pointer group ${
                          isActive
                            ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                            : "text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100/90 dark:hover:bg-slate-800/60"
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <IconComp
                            size={16}
                            strokeWidth={isActive ? 2.5 : 2}
                            className={`shrink-0 transition-colors ${
                              isActive
                                ? "text-white"
                                : "text-slate-500 dark:text-slate-400 group-hover:text-slate-950 dark:group-hover:text-white"
                            }`}
                          />
                          <span className="truncate">{sublink.label}</span>
                        </>
                      )}
                    </NavLink>
                  )
                })}
              </NavDropdown>
            )
          })}

          {/* EMPTY SEARCH STATE */}
          {cleanSearch && filteredSections.length === 0 && (
            <div className="py-8 px-4 text-center">
              <div className="size-10 rounded-2xl bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center mx-auto mb-2 text-slate-400">
                <SearchX size={20} />
              </div>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No matching sections</p>
              <p className="text-[11px] text-slate-400 mt-0.5 truncate max-w-[180px] mx-auto">
                No menu items match &quot;{search}&quot;
              </p>
              <button
                onClick={() => setSearch?.("")}
                className="mt-3 px-3 py-1 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer"
              >
                Clear Filter
              </button>
            </div>
          )}
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

Sidebar.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired,
  search: PropTypes.string,
  setSearch: PropTypes.func
}

export default Sidebar
