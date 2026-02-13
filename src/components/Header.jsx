
// import PropTypes from "prop-types"
// import { Bell, ChevronsLeft, Moon, Search, Sun } from "lucide-react"
// import profileImg from "../assets/profile-image.jpg"
// import { useTheme } from "../hooks/useTheme"

// const Header = ({ collapsed, setCollapsed }) => {
//   const { theme, setTheme } = // useTheme()

//   return (
////      <header className="sticky top-0 z-20 flex h-16 // iteconst toggleTheme = () => {
//   setTheme(prev => (prev === "light" ? "dark" : "light"))
// }
// k:bg-slate-900">
      
      {/* LEFT */}
//       <div className="flex items-center gap-3">
//         <button
//           onClick={() => setCollapsed(!collapsed)}
//           className="flex items-center justify-center size-10 rounded-md transition hover:bg-slate-100 dark:hover:bg-slate-800"
//         >
//           <ChevronsLeft
//             size={22}
//             className={`transition-transform ${collapsed ? "rotate-180" : ""}`}
//           />
//         </button>

//         <div className="hidden md:flex items-center gap-2 rounded-md border px-3 py-2 bg-slate-50 dark:bg-slate-800">
//           <Search size={18} className="text-slate-400" />
//           <input
//             placeholder="Search..."
//             className="bg-transparent outline-none text-sm w-56 text-slate-900 dark:text-slate-50"
//           />
//         </div>
//       </div>

//       {/* RIGHT */}
//       <div className="flex items-center gap-3">
//         <button
//           onClick={() => setTheme(theme === "light" ? "dark" : "light")}
//           className="flex items-center justify-center size-10 rounded-md transition hover:bg-slate-100 dark:hover:bg-slate-800"
//         >
//           {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
//         </button>

//         <button className="flex items-center justify-center size-10 rounded-md transition hover:bg-slate-100 dark:hover:bg-slate-800">
//           <Bell size={20} />
//         </button>

//         <img
//           src={profileImg}
//           alt="profile"
//           className="size-9 rounded-full object-cover cursor-pointer border"
//         />
//       </div>
//     </header>
//   )
// }

// Header.propTypes = {
//   collapsed: PropTypes.bool.isRequired,
//   setCollapsed: PropTypes.func.isRequired,
// }

// export default Header


// import PropTypes from "prop-types"
// import { Bell, ChevronsLeft, Moon, Search, Sun } from "lucide-react"
// import profileImg from "../assets/profile-image.jpg"
// import { useTheme } from "../hooks/useTheme"

// const Header = ({ collapsed, setCollapsed }) => {
//   const { theme, setTheme } = useTheme()

//   return (
//     <header
//       className="
//         sticky top-0 z-20 flex h-16 items-center justify-between
//         border-b border-slate-200 dark:border-slate-800
//         bg-white/70 dark:bg-slate-900/70 backdrop-blur
//         px-4
//       "
//     >
      
//       {/* LEFT */}
//       <div className="flex items-center gap-3">
//         <button
//           onClick={() => setCollapsed(!collapsed)}
//           className="flex items-center justify-center size-10 rounded-lg
//           transition hover:bg-slate-100 dark:hover:bg-slate-800"
//         >
//           <ChevronsLeft
//             size={22}
//             className={`transition-transform duration-300 ${
//               collapsed ? "rotate-180" : ""
//             }`}
//           />
//         </button>

//         <div className="hidden md:flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-800 px-3 py-2 bg-slate-50 dark:bg-slate-800">
//           <Search size={18} className="text-slate-400" />
//           <input
//             placeholder="Search..."
//             className="bg-transparent outline-none text-sm w-56 text-slate-900 dark:text-slate-50"
//           />
//         </div>
//       </div>

//       {/* RIGHT */}
//       <div className="flex items-center gap-2">
//         <button
//           onClick={() => setTheme(theme === "light" ? "dark" : "light")}
//           className="flex items-center justify-center size-10 rounded-lg
//           transition hover:bg-slate-100 dark:hover:bg-slate-800"
//         >
//           {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
//         </button>

//         <button
//           className="flex items-center justify-center size-10 rounded-lg
//           transition hover:bg-slate-100 dark:hover:bg-slate-800 relative"
//         >
//           <Bell size={20} />
//           <span className="absolute top-2 right-2 size-2 rounded-full bg-red-500" />
//         </button>

//         <img
//           src={profileImg}
//           alt="profile"
//           className="size-9 rounded-full object-cover cursor-pointer border border-slate-200 dark:border-slate-700"
//         />
//       </div>
//     </header>
//   )
// }

// Header.propTypes = {
//   collapsed: PropTypes.bool.isRequired,
//   setCollapsed: PropTypes.func.isRequired,
// }

// export default Header

import PropTypes from "prop-types"
import { Bell, ChevronsLeft, Moon, Search, Sun } from "lucide-react"
import profileImg from "../assets/profile-image.jpg"
import { useTheme } from "../hooks/useTheme"

const Header = ({ collapsed, setCollapsed }) => {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light")
  }

  return (
    <header
      className="
        sticky top-0 z-20 flex h-16 items-center justify-between
        border-b border-slate-200 dark:border-slate-800
        bg-white/70 dark:bg-slate-900/70 backdrop-blur
        px-4
      "
    >
      {/* LEFT */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center size-10 rounded-lg
          transition hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Toggle sidebar"
        >
          <ChevronsLeft
            size={22}
            className={`transition-transform duration-300 ${
              collapsed ? "rotate-180" : ""
            }`}
          />
        </button>

        <div className="hidden md:flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-800 px-3 py-2 bg-slate-50 dark:bg-slate-800">
          <Search size={18} className="text-slate-400" />
          <input
            placeholder="Search..."
            className="bg-transparent outline-none text-sm w-56 text-slate-900 dark:text-slate-50 placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-2">
        <button
          onClick={toggleTheme}
          className="flex items-center justify-center size-10 rounded-lg
          transition hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        <button
          className="flex items-center justify-center size-10 rounded-lg
          transition hover:bg-slate-100 dark:hover:bg-slate-800 relative"
          aria-label="Notifications"
        >
          <Bell size={20} />
          <span className="absolute top-2 right-2 size-2 rounded-full bg-red-500" />
        </button>

        <img
          src={profileImg}
          alt="profile"
          className="size-9 rounded-full object-cover cursor-pointer border border-slate-200 dark:border-slate-700"
        />
      </div>
    </header>
  )
}

Header.propTypes = {
  collapsed: PropTypes.bool.isRequired,
  setCollapsed: PropTypes.func.isRequired,
}

export default Header