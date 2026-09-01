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
          classes: "bg-amber-500/15 text-amber-400 border border-amber-500/30",
          avatarBg: "bg-gradient-to-br from-amber-500 to-amber-600",
        }
      case "subadmin":
        return {
          label: "#SUBADMIN",
          classes: "bg-violet-500/15 text-violet-400 border border-violet-500/30",
          avatarBg: "bg-gradient-to-br from-violet-500 to-indigo-600",
        }
      case "admin":
      default:
        return {
          label: "#ADMIN",
          classes: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
          avatarBg: "bg-gradient-to-br from-amber-600 to-orange-600",
        }
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* TOP HEADER */}
      <div className="bg-[#0b1120] dark:bg-[#070b16] rounded-3xl p-6 md:p-8 border border-slate-800 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="size-14 rounded-2xl bg-blue-600/15 text-blue-400 border border-blue-500/30 flex items-center justify-center shadow-lg shadow-blue-500/10">
              <ShieldCheck size={30} strokeWidth={2.2} />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-wider">
                  Active Staff Directory Access
                </h1>
              </div>
              <p className="text-slate-400 text-sm font-medium mt-1">
                Configure granular section-by-section access permissions for each staff member
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-blue-950/60 border border-blue-600/30 rounded-xl text-blue-400 text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-inner">
              <Users size={16} />
              <span>{users?.length || 0} Staff Accounts</span>
            </div>
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="mt-6 pt-6 border-t border-slate-800/80">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search staff accounts by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-[#0f172a] border border-slate-800 rounded-2xl text-sm font-medium text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>
        </div>
      </div>

      {/* STAFF LIST */}
      {isLoadingUsers ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 bg-[#0b1120] dark:bg-[#070b16] rounded-3xl border border-slate-800">
          <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading Staff Directory...</p>
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
                className="bg-[#0b1120] dark:bg-[#070b16] rounded-3xl border border-slate-800 overflow-hidden shadow-xl transition-all duration-300 hover:border-slate-700"
              >
                {/* ACCORDION HEADER */}
                <div
                  onClick={() => toggleAccordion(user._id)}
                  className="p-6 md:p-7 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-slate-900/40 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {/* User Avatar Initial */}
                    <div
                      className={`size-14 rounded-2xl ${badge.avatarBg} text-white font-black text-xl flex items-center justify-center shadow-lg shadow-black/40 shrink-0`}
                    >
                      {(user.username || "A").charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <h2 className="text-xl font-black text-white tracking-tight">{user.username}</h2>
                        <span
                          className={`px-3 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider ${badge.classes}`}
                        >
                          {badge.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mt-1 text-slate-400 text-xs md:text-sm font-medium flex-wrap">
                        <span>{user.email || "No email assigned"}</span>
                        <span className="text-slate-600">·</span>
                        <span className="text-blue-400 font-bold">
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
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0f172a] hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
                    >
                      <span>{isExpanded ? "Hide Permissions" : "View Permissions"}</span>
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
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
                      className="overflow-hidden border-t border-slate-800/80 bg-[#080d19]"
                    >
                      <div className="p-6 md:p-8 space-y-6">
                        {/* PANEL SUBHEADER */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/60">
                          <div className="flex items-center gap-2.5 text-slate-300 font-bold text-sm">
                            <Lock size={16} className="text-blue-400" />
                            <span>Toggle Section Access Permissions</span>
                          </div>

                          {!isSuperadmin ? (
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleSelectAll(user._id)}
                                className="px-4 py-2 bg-blue-600/15 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
                              >
                                Select All
                              </button>
                              <button
                                type="button"
                                onClick={() => handleClearAll(user._id)}
                                className="px-4 py-2 bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/60 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
                              >
                                Clear All
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20">
                              <AlertCircle size={14} />
                              <span>Superadmin accounts always retain full section access</span>
                            </div>
                          )}
                        </div>

                        {/* 4-COLUMN RESPONSIVE GRID OF 21 SECTIONS */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
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
                                  flex items-center justify-between p-4 rounded-2xl border transition-all duration-200 select-none
                                  ${isSuperadmin ? "cursor-default opacity-85" : "cursor-pointer"}
                                  ${
                                    isChecked
                                      ? "bg-[#101b33] border-blue-500/50 shadow-md shadow-blue-900/10"
                                      : "bg-[#0b1222] border-slate-800 hover:border-slate-700 hover:bg-[#0e1628]"
                                  }
                                `}
                              >
                                <div className="flex items-center gap-3.5 min-w-0 pr-2">
                                  <div
                                    className={`size-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                                      isChecked
                                        ? "bg-blue-600/20 text-blue-400"
                                        : "bg-slate-800/60 text-slate-400"
                                    }`}
                                  >
                                    <Icon size={18} />
                                  </div>
                                  <span
                                    className={`text-sm font-bold truncate ${
                                      isChecked ? "text-white" : "text-slate-400"
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
                                        ? "bg-blue-600 border-blue-500 text-white shadow-sm shadow-blue-500/50"
                                        : "border-slate-700 bg-slate-900"
                                    }
                                  `}
                                >
                                  {isChecked && <Check size={13} strokeWidth={3} />}
                                </div>
                              </div>
                            )
                          })}
                        </div>

                        {/* SAVE ACCESS PERMISSIONS BUTTON */}
                        <div className="flex items-center justify-end pt-4 border-t border-slate-800/60">
                          <button
                            type="button"
                            disabled={isSuperadmin || isSaving}
                            onClick={() => handleSavePermissions(user)}
                            className={`
                              flex items-center gap-2.5 px-7 py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider transition-all shadow-lg
                              ${
                                isSuperadmin
                                  ? "bg-slate-800 text-slate-500 cursor-not-allowed opacity-60"
                                  : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-600/30 hover:shadow-blue-600/50 cursor-pointer active:scale-95"
                              }
                            `}
                          >
                            {isSaving ? (
                              <>
                                <Loader2 className="animate-spin" size={18} />
                                <span>Saving Permissions...</span>
                              </>
                            ) : (
                              <>
                                <Save size={18} />
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
        <div className="flex flex-col items-center justify-center py-24 text-center bg-[#0b1120] dark:bg-[#070b16] rounded-3xl border border-slate-800">
          <div className="size-20 bg-slate-800/50 rounded-full flex items-center justify-center text-slate-400 mb-4">
            <Users size={36} />
          </div>
          <h3 className="text-xl font-black text-white">No Staff Accounts Found</h3>
          <p className="text-slate-400 text-sm mt-1 max-w-sm">No users matched your search criteria.</p>
        </div>
      )}
    </div>
  )
}

export default SectionControls
