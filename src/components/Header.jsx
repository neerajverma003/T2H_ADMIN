import PropTypes from "prop-types"
import { Bell, Menu, Moon, Search, Sun, User, Settings, LogOut, ChevronDown, ChevronRight } from "lucide-react"
import { useState } from "react"
import { useTheme } from "../contexts/ThemeProvider"
import useAuthStore from "../stores/authStores"
import profileImg from "../assets/profile-image.jpg"

const Header = ({ setOpen }) => {
  const { theme, toggleTheme } = useTheme()
  const { logout } = useAuthStore()
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  return (
    <header
      className="
        sticky top-0 z-20 flex h-20 items-center justify-between
        bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl
        px-8 transition-all duration-500 border-b border-slate-50 dark:border-slate-800/50
      "
    >
      {/* LEFT: Mobile Menu & Search */}
      <div className="flex items-center gap-6 flex-1">
        <button
          onClick={() => setOpen(true)}
          className="md:hidden flex items-center justify-center size-10 rounded-xl
          bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
          aria-label="Open sidebar"
        >
          <Menu size={20} strokeWidth={2.5} />
        </button>

        <div className="hidden md:flex items-center gap-3">
           <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Admin</p>
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
          onClick={toggleTheme} // 👈 Call centralized toggle
          className="flex items-center justify-center size-10 rounded-xl
          hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-400 transition-all"
          aria-label="Toggle theme"
        >
          {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        {/* Notifications */}
        <button
          className="relative flex items-center justify-center size-10 rounded-xl
          hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-400 transition-all"
          aria-label="Notifications"
        >
          <Bell size={20} />
          <span className="absolute top-2.5 right-2.5 size-2 rounded-full bg-pink-500 border-2 border-white dark:border-slate-950" />
        </button>

        <div className="h-8 w-[1px] bg-slate-100 dark:bg-slate-800 mx-2 hidden sm:block" />

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-2xl 
            hover:bg-slate-50 dark:hover:bg-slate-900 transition-all group"
          >
            <div className="relative">
              <img
                src={profileImg}
                alt="Admin"
                className="size-10 rounded-xl object-cover ring-2 ring-indigo-50 dark:ring-indigo-900/30 group-hover:ring-indigo-200 transition-all"
              />
              <div className="absolute -bottom-0.5 -right-0.5 size-3 bg-green-500 border-2 border-white dark:border-slate-950 rounded-full" />
            </div>
            <div className="hidden sm:block text-left">
              <div className="flex items-center gap-1">
                <p className="text-xs font-bold text-slate-900 dark:text-white">Admin User</p>
                <ChevronDown size={14} className="text-slate-400" />
              </div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Super Admin</p>
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-4 w-56 bg-white dark:bg-slate-900 rounded-[1.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden py-3 z-50">
               <button 
                  onClick={logout}
                  className="flex items-center gap-3 w-full px-5 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
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
  setOpen: PropTypes.func.isRequired,
}

export default Header