import PropTypes from "prop-types"
import {
  Bell,
  Menu,
  Moon,
  Search,
  Sun,
  User,
  LogOut,
  ChevronDown,
  ChevronRight,
  ShoppingBag,
  MapPin,
  Star,
  Mail,
  MessageSquare,
  CheckCheck,
  Trash2,
  Clock,
  ExternalLink,
  Compass,
} from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useTheme } from "../contexts/ThemeProvider"
import useAuthStore, { apiClient } from "../stores/authStores"
import profileImg from "../assets/profile-image.jpg"

const getTimeAgo = (dateString) => {
  if (!dateString) return ''
  const now = new Date()
  const past = new Date(dateString)
  const diffSec = Math.floor((now - past) / 1000)
  if (diffSec < 60) return 'Just now'
  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h ago`
  const diffDay = Math.floor(diffHr / 24)
  if (diffDay < 7) return `${diffDay}d ago`
  return past.toLocaleDateString()
}

const getNotifIcon = (type) => {
  switch (type) {
    case 'booking':
      return <ShoppingBag className="text-emerald-500 shrink-0" size={18} />
    case 'activity':
    case 'activity_booking':
      return <Compass className="text-teal-500 shrink-0" size={18} />
    case 'itinerary_lead':
    case 'trip_plan':
      return <MapPin className="text-blue-500 shrink-0" size={18} />
    case 'review':
      return <Star className="text-amber-500 shrink-0" size={18} />
    case 'contact':
    case 'subscribe':
      return <Mail className="text-indigo-500 shrink-0" size={18} />
    case 'suggestion':
    case 'chatbot':
    default:
      return <MessageSquare className="text-purple-500 shrink-0" size={18} />
  }
}

const getTypeBadgeColor = (type) => {
  switch (type) {
    case 'booking':
      return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200/50'
    case 'activity':
    case 'activity_booking':
      return 'bg-teal-50 text-teal-600 dark:bg-teal-950/40 dark:text-teal-400 border-teal-200/50'
    case 'itinerary_lead':
    case 'trip_plan':
      return 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 border-blue-200/50'
    case 'review':
      return 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200/50'
    case 'contact':
    case 'subscribe':
      return 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 border-indigo-200/50'
    default:
      return 'bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400 border-purple-200/50'
  }
}

const Header = ({ open, setOpen }) => {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const { logout, role, profile, username, fetchAdminProfile } = useAuthStore()

  const roleDisplay =
    role === "superadmin"
      ? "SUPER ADMIN"
      : role === "subadmin"
      ? "SUB ADMIN"
      : "ADMIN"

  const displayName =
    profile?.name && profile.name !== "Admin User" && profile.name !== ""
      ? profile.name
      : username || profile?.firstName || "Admin"

  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showNotifMenu, setShowNotifMenu] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  const notifRef = useRef(null)
  const profileRef = useRef(null)

  const fetchNotifications = async () => {
    try {
      const res = await apiClient.get('/admin/notifications')
      if (res.data?.success) {
        setNotifications(res.data.data || [])
        setUnreadCount(res.data.unreadCount || 0)
      }
    } catch (err) {
      console.error('Error fetching admin notifications:', err)
    }
  }

  useEffect(() => {
    fetchAdminProfile()
    fetchNotifications()

    // Poll notifications every 20 seconds for real-time updates
    const interval = setInterval(() => {
      fetchNotifications()
    }, 20000)

    return () => clearInterval(interval)
  }, [fetchAdminProfile])

  // Handle outside click to close menus
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifMenu(false)
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleMarkAllRead = async () => {
    try {
      await apiClient.put('/admin/notifications/mark-read', { markAll: true })
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err)
    }
  }

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      try {
        await apiClient.put('/admin/notifications/mark-read', {
          notificationIds: [notif._id],
        })
        setNotifications((prev) =>
          prev.map((n) => (n._id === notif._id ? { ...n, isRead: true } : n))
        )
        setUnreadCount((prev) => Math.max(0, prev - 1))
      } catch (err) {
        console.error('Failed to mark notification read:', err)
      }
    }
    setShowNotifMenu(false)
    if (notif.link) {
      navigate(notif.link)
    }
  }

  const handleClearAll = async () => {
    try {
      await apiClient.delete('/admin/notifications/clear-all')
      setNotifications([])
      setUnreadCount(0)
    } catch (err) {
      console.error('Failed to clear notifications:', err)
    }
  }

  return (
    <header
      className="
        sticky top-0 z-20 flex h-20 items-center justify-between
        bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl
        px-4 md:px-8 transition-all duration-500 border-b border-slate-50 dark:border-slate-800/50
      "
    >
      {/* LEFT: Menu Bar Toggle & Search */}
      <div className="flex items-center gap-4 md:gap-6 flex-1">
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden flex items-center justify-center size-10 rounded-xl
          bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30 transition-all cursor-pointer shrink-0"
          aria-label="Toggle mobile menu"
          title="Toggle Menu"
        >
          <Menu size={20} strokeWidth={2.5} />
        </button>

        <div className="hidden md:flex items-center gap-3">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            {roleDisplay}
          </p>
          <ChevronRight size={12} className="text-slate-300" />
          <p className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest">Dashboard</p>
        </div>

        <div className="relative group hidden lg:block max-w-sm w-full ml-6">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search size={16} className="text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
          </div>
          <input
            placeholder="Search metrics, users, or destinations..."
            className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 
            text-slate-900 dark:text-slate-100 text-sm font-medium rounded-2xl outline-none border border-transparent focus:border-indigo-100 dark:focus:border-indigo-900/30
            transition-all placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* RIGHT: Actions & Profile */}
      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="flex items-center justify-center size-10 rounded-xl
          hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-400 transition-all cursor-pointer"
          aria-label="Toggle theme"
        >
          {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        {/* Notifications Bell Button & Pop-Up */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => {
              setShowNotifMenu(!showNotifMenu)
              if (!showNotifMenu) fetchNotifications()
            }}
            className="relative flex items-center justify-center size-10 rounded-xl
            hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-400 transition-all cursor-pointer"
            aria-label="Notifications"
            title="Notifications"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <>
                <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] px-1 items-center justify-center rounded-full bg-pink-600 text-white text-[10px] font-black shadow-md shadow-pink-600/40 border-2 border-white dark:border-slate-950 animate-bounce">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
                <span className="absolute top-2.5 right-2.5 size-2 rounded-full bg-pink-500 border-2 border-white dark:border-slate-950 animate-ping" />
              </>
            )}
          </button>

          {/* Notification Pop-Up Menu */}
          {showNotifMenu && (
            <div className="absolute right-0 mt-4 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-[1.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden py-2 z-50 transition-all duration-300">
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 text-[11px] font-black rounded-full bg-pink-100 dark:bg-pink-950/50 text-pink-600 dark:text-pink-400">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors cursor-pointer"
                    title="Mark all as read"
                  >
                    <CheckCheck size={14} />
                    Mark all read
                  </button>
                )}
              </div>

              {/* Notification List */}
              <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-50 dark:divide-slate-800/50">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                    <div className="size-12 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center text-slate-400 mb-3">
                      <Bell size={24} />
                    </div>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No notifications yet</p>
                    <p className="text-xs text-slate-400 mt-1">User inquiries & booking requests will show up here.</p>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif._id}
                      onClick={() => handleNotificationClick(notif)}
                      className={`
                        flex items-start gap-3 p-4 transition-colors cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-800/40
                        ${!notif.isRead ? 'bg-indigo-50/30 dark:bg-indigo-950/20' : ''}
                      `}
                    >
                      <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0 mt-0.5">
                        {getNotifIcon(notif.type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span
                            className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-md border ${getTypeBadgeColor(
                              notif.type
                            )}`}
                          >
                            {notif.type?.replace('_', ' ')}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1 shrink-0">
                            <Clock size={10} />
                            {getTimeAgo(notif.createdAt || notif.created_at)}
                          </span>
                        </div>

                        <p className={`text-xs font-bold ${!notif.isRead ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'} truncate`}>
                          {notif.title}
                        </p>

                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5 font-medium leading-relaxed">
                          {notif.message}
                        </p>

                        {(notif.userName || notif.userEmail || notif.userPhone) && (
                          <div className="mt-1.5 pt-1.5 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
                            <span className="font-bold text-slate-600 dark:text-slate-300 truncate max-w-[180px]">
                              {notif.userName || notif.userEmail || notif.userPhone}
                            </span>
                            {notif.link && (
                              <span className="text-indigo-600 dark:text-indigo-400 flex items-center gap-0.5 font-bold">
                                View <ExternalLink size={10} />
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {!notif.isRead && (
                        <span className="size-2 rounded-full bg-indigo-600 shrink-0 mt-2" />
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={handleClearAll}
                    className="flex items-center gap-1 text-[11px] font-bold text-red-500 hover:text-red-600 transition-colors cursor-pointer"
                  >
                    <Trash2 size={12} /> Clear all
                  </button>
                  <button
                    onClick={() => setShowNotifMenu(false)}
                    className="text-[11px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="h-8 w-[1px] bg-slate-100 dark:bg-slate-800 mx-2 hidden sm:block" />

        {/* Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-2xl 
            hover:bg-slate-50 dark:hover:bg-slate-900 transition-all group cursor-pointer"
          >
            <div className="relative">
              <img
                src={profile?.avatar || profileImg}
                alt="Admin"
                className="size-10 rounded-xl object-cover ring-2 ring-indigo-50 dark:ring-indigo-900/30 group-hover:ring-indigo-200 transition-all"
              />
              <div className="absolute -bottom-0.5 -right-0.5 size-3 bg-green-500 border-2 border-white dark:border-slate-950 rounded-full" />
            </div>
            <div className="hidden sm:block text-left">
              <div className="flex items-center gap-1">
                <p className="text-xs font-bold text-slate-900 dark:text-white">{displayName}</p>
                <ChevronDown size={14} className="text-slate-400" />
              </div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                {roleDisplay}
              </p>
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-4 w-56 bg-white dark:bg-slate-900 rounded-[1.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden py-3 z-50">
              <button
                onClick={() => {
                  setShowProfileMenu(false)
                  navigate("/settings?edit=true")
                }}
                className="flex items-center gap-3 w-full px-5 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
              >
                <User size={16} /> My Profile
              </button>
              <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />
              <button
                onClick={logout}
                className="flex items-center gap-3 w-full px-5 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer"
              >
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

Header.propTypes = {
  open: PropTypes.bool,
  setOpen: PropTypes.func.isRequired,
}

export default Header