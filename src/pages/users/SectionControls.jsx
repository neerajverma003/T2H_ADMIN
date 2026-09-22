import { useState, useEffect } from "react"
import {
  ShieldCheck,
  Lock,
  Search,
  Check,
  ChevronDown,
  ChevronUp,
  Save,
  Loader2,
  Users,
  LayoutDashboard,
  UserCheck,
  MapPin,
  PlusCircle,
  Building2,
  CheckSquare,
  Video,
  ImageIcon,
  MessageSquare,
  Sparkles,
  FileText,
  Globe,
  Tag,
  UserPlus,
  Mail,
  BarChart2,
  Settings,
  AlertCircle
} from "lucide-react"
import useAuthStore from "../../stores/authStores"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "react-toastify"

// The 21 actual sections from Trip2Honeymoon's Sidebar
export const APP_SECTIONS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "public_user", label: "Public User", icon: UserCheck },
  { id: "users", label: "Users", icon: Users },
  { id: "destinations", label: "Destinations", icon: MapPin },
  { id: "itineraries", label: "Itineraries", icon: PlusCircle },
  { id: "resorts", label: "Resorts", icon: Building2 },
  { id: "hotels", label: "Hotels", icon: Building2 },
  { id: "bookings", label: "Booking", icon: CheckSquare },
  { id: "banner_management", label: "Banner Management", icon: Video },
  { id: "customer_gallery", label: "Customer Gallery", icon: ImageIcon },
  { id: "social_management", label: "Social", icon: MessageSquare },
  { id: "gift_cards", label: "Gift Management", icon: Sparkles },
  { id: "blog_articles", label: "Blog", icon: FileText },
  { id: "testimonials", label: "Reviews", icon: Sparkles },
  { id: "global_impact", label: "Our Global Impact", icon: Globe },
  { id: "leads", label: "Leads", icon: Tag },
  { id: "compliance", label: "Terms", icon: FileText },
  { id: "our_team", label: "Our Team", icon: UserPlus },
  { id: "marketing", label: "Marketing", icon: Mail },
  { id: "system_audit", label: "Analytics", icon: BarChart2 },
  { id: "settings", label: "Profile Settings", icon: Settings },
]

const ALL_SECTION_IDS = APP_SECTIONS.map((s) => s.id)

const SectionControls = () => {
  const { users, fetchUsers, updateUserPermissions, isLoadingUsers } = useAuthStore()

  const [expandedUser, setExpandedUser] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  // Map of userId -> Set of allowed section IDs
  const [userPermissions, setUserPermissions] = useState({})
  const [savingUserId, setSavingUserId] = useState(null)

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  // Initialize local permissions map whenever users list changes
  useEffect(() => {
    if (users && users.length > 0) {
      const initialMap = {}
      users.forEach((user) => {
        // If superadmin, has all sections. If user has allowedSections set, use them. Otherwise default to all
        if (user.role === "superadmin") {
          initialMap[user._id] = new Set(ALL_SECTION_IDS)
        } else if (Array.isArray(user.allowedSections) && user.allowedSections.length > 0) {
          initialMap[user._id] = new Set(user.allowedSections)
        } else {
          // Backward-compatible fallback: if not yet configured, defaults to empty or all
          initialMap[user._id] = new Set(user.allowedSections || [])
        }
      })
      setUserPermissions(initialMap)
    }
  }, [users])

  const toggleAccordion = (userId) => {
    setExpandedUser((prev) => (prev === userId ? null : userId))
  }

  const handleToggleSection = (userId, sectionId) => {
    setUserPermissions((prev) => {
      const currentSet = new Set(prev[userId] || [])
      if (currentSet.has(sectionId)) {
        currentSet.delete(sectionId)
      } else {
        currentSet.add(sectionId)
      }
      return {
        ...prev,
        [userId]: currentSet,
      }
    })
  }

  const handleSelectAll = (userId) => {
    setUserPermissions((prev) => ({
      ...prev,
      [userId]: new Set(ALL_SECTION_IDS),
    }))
  }

  const handleClearAll = (userId) => {
    setUserPermissions((prev) => ({
      ...prev,
      [userId]: new Set(),
    }))
  }

  const handleSavePermissions = async (user) => {
    if (user.role === "superadmin") {
      toast.info("Superadmin accounts automatically retain full access to all sections.")
      return
    }

    setSavingUserId(user._id)
    const selectedSections = Array.from(userPermissions[user._id] || [])
    await updateUserPermissions(user._id, selectedSections)
    setSavingUserId(null)
  }

  const filteredUsers = (users || []).filter((user) => {
    const name = user?.username || ""
    const email = user?.email || ""
    const term = searchTerm.toLowerCase()
    return name.toLowerCase().includes(term) || email.toLowerCase().includes(term)
  })

  // Role tag styling helper
  const getRoleBadge = (role) => {
    switch (role) {
      case "superadmin":
        return {
          label: "#SUPERADMIN",
          classes: "bg-amber-500/10 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30",
          avatarBg: "bg-gradient-to-br from-amber-500 to-amber-600",
        }
      case "subadmin":
        return {
          label: "#SUBADMIN",
          classes: "bg-violet-500/10 dark:bg-violet-500/15 text-violet-600 dark:text-violet-400 border border-violet-500/30",
          avatarBg: "bg-gradient-to-br from-violet-500 to-indigo-600",
        }
      case "admin":
      default:
        return {
          label: "#ADMIN",
          classes: "bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30",
          avatarBg: "bg-gradient-to-br from-blue-600 to-indigo-600",
        }
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8 pb-20 font-sans min-h-screen text-slate-900 dark:text-slate-100 text-left">
      {/* ── HEADER HUB ── */}
      <div className="bg-white dark:bg-[#091126] rounded-3xl py-4 sm:py-5 px-6 sm:px-8 border border-slate-200 dark:border-slate-800 shadow-md relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative z-10 flex items-center gap-3.5">
          <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0">
            <ShieldCheck size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full">
                SECURITY & ACCESS
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2 flex-wrap">
              Section <span className="text-blue-500">Controls</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-semibold mt-0.5 text-xs sm:text-sm">
              Configure granular section-by-section access permissions for each staff member.
            </p>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="px-4 py-2 bg-blue-500/10 dark:bg-blue-600/20 border border-blue-500/20 dark:border-blue-500/30 rounded-xl text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-xs">
            <Users size={16} />
            <span>{users?.length || 0} Staff Accounts</span>
          </div>
        </div>
      </div>

      {/* ── SEARCH BAR ── */}
      <div className="bg-white dark:bg-[#091126] rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={16} />
          <input
            type="text"
            placeholder="Search staff accounts by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800/90 bg-slate-50 dark:bg-[#050A17] text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all shadow-inner"
          />
        </div>
      </div>

      {/* ── STAFF LIST ── */}
      {isLoadingUsers ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 bg-white dark:bg-[#091126] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
          <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-xs">Loading Staff Directory...</p>
        </div>
      ) : filteredUsers.length > 0 ? (
        <div className="space-y-4">
          {filteredUsers.map((user) => {
            const isExpanded = expandedUser === user._id
            const isSuperadmin = user.role === "superadmin"
            const userSections = userPermissions[user._id] || new Set()
            const allowedCount = isSuperadmin ? APP_SECTIONS.length : userSections.size
            const badge = getRoleBadge(user.role)
            const isSaving = savingUserId === user._id

            return (
              <div
                key={user._id}
                className="bg-white dark:bg-[#091126] rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm transition-all duration-300 hover:border-blue-400 dark:hover:border-slate-700"
              >
                {/* ACCORDION HEADER */}
                <div
                  onClick={() => toggleAccordion(user._id)}
                  className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/70 dark:hover:bg-slate-900/40 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {/* User Avatar Initial */}
                    <div
                      className={`size-12 sm:size-14 rounded-2xl ${badge.avatarBg} text-white font-black text-lg sm:text-xl flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0`}
                    >
                      {(user.username || "A").charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">{user.username}</h2>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${badge.classes}`}
                        >
                          {badge.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mt-1 text-slate-500 dark:text-slate-400 text-xs font-medium flex-wrap">
                        <span>{user.email || "No email assigned"}</span>
                        <span className="text-slate-300 dark:text-slate-600">·</span>
                        <span className="text-blue-600 dark:text-blue-400 font-bold">
                          {isSuperadmin
                            ? "All 21 Sections Allowed (Full Access)"
                            : `${allowedCount} / ${APP_SECTIONS.length} Sections Allowed`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Toggle Button */}
                  <div className="flex items-center gap-3 self-end md:self-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleAccordion(user._id)
                      }}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/80 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                    >
                      <span>{isExpanded ? "Hide Permissions" : "View Permissions"}</span>
                      {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    </button>
                  </div>
                </div>

                {/* ACCORDION EXPANDED BODY */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-[#080d19]/80"
                    >
                      <div className="p-6 md:p-8 space-y-6">
                        {/* PANEL SUBHEADER */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800/60">
                          <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300 font-bold text-xs uppercase tracking-wider">
                            <Lock size={15} className="text-blue-500" />
                            <span>Toggle Section Access Permissions</span>
                          </div>

                          {!isSuperadmin ? (
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleSelectAll(user._id)}
                                className="px-3.5 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                              >
                                Select All
                              </button>
                              <button
                                type="button"
                                onClick={() => handleClearAll(user._id)}
                                className="px-3.5 py-1.5 bg-slate-200/70 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                              >
                                Clear All
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-xs font-bold bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20">
                              <AlertCircle size={14} />
                              <span>Superadmin accounts always retain full section access</span>
                            </div>
                          )}
                        </div>

                        {/* 4-COLUMN RESPONSIVE GRID OF 21 SECTIONS */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                          {APP_SECTIONS.map((section) => {
                            const Icon = section.icon
                            const isChecked = isSuperadmin ? true : userSections.has(section.id)

                            return (
                              <div
                                key={section.id}
                                onClick={() => {
                                  if (!isSuperadmin) {
                                    handleToggleSection(user._id, section.id)
                                  }
                                }}
                                className={`
                                  flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-200 select-none
                                  ${isSuperadmin ? "cursor-default opacity-85" : "cursor-pointer"}
                                  ${
                                    isChecked
                                      ? "bg-blue-50/80 dark:bg-[#101b33] border-blue-400/60 dark:border-blue-500/50 shadow-sm"
                                      : "bg-white dark:bg-[#0b1222] border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                                  }
                                `}
                              >
                                <div className="flex items-center gap-3 min-w-0 pr-2">
                                  <div
                                    className={`size-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                                      isChecked
                                        ? "bg-blue-600 text-white shadow-xs"
                                        : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500"
                                    }`}
                                  >
                                    <Icon size={16} />
                                  </div>
                                  <span
                                    className={`text-xs font-bold truncate ${
                                      isChecked ? "text-blue-700 dark:text-white" : "text-slate-600 dark:text-slate-400"
                                    }`}
                                  >
                                    {section.label}
                                  </span>
                                </div>

                                {/* Rounded Checkbox Toggle */}
                                <div
                                  className={`
                                    size-5 rounded-lg flex items-center justify-center border transition-all shrink-0
                                    ${
                                      isChecked
                                        ? "bg-blue-600 border-blue-500 text-white shadow-xs"
                                        : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                                    }
                                  `}
                                >
                                  {isChecked && <Check size={12} strokeWidth={3} />}
                                </div>
                              </div>
                            )
                          })}
                        </div>

                        {/* SAVE ACCESS PERMISSIONS BUTTON */}
                        <div className="flex items-center justify-end pt-4 border-t border-slate-200 dark:border-slate-800/60">
                          <button
                            type="button"
                            disabled={isSuperadmin || isSaving}
                            onClick={() => handleSavePermissions(user)}
                            className={`
                              flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md
                              ${
                                isSuperadmin
                                  ? "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed opacity-60"
                                  : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-500/25 cursor-pointer active:scale-95"
                              }
                            `}
                          >
                            {isSaving ? (
                              <>
                                <Loader2 className="animate-spin" size={15} />
                                <span>Saving Permissions...</span>
                              </>
                            ) : (
                              <>
                                <Save size={15} />
                                <span>Save Access Permissions</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center bg-white dark:bg-[#091126]/95 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl ring-1 ring-slate-900/5 dark:ring-white/5">
          <div className="size-16 bg-slate-100 dark:bg-slate-800/50 rounded-2xl flex items-center justify-center text-slate-400 mb-3">
            <Users size={30} />
          </div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1">No Staff Accounts Found</h3>
          <p className="text-slate-500 dark:text-slate-400 text-xs max-w-sm">No users matched your search criteria.</p>
        </div>
      )}
    </div>
  )
}

export default SectionControls
