import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Trash2, Users, Loader2, Search, UserPlus, Mail, Calendar, Pencil, X, Save, User, ShieldCheck } from "lucide-react"
import useAuthStore from "../../stores/authStores"
import ConfirmationModel from "../../newComponents/ConfirmationModel"
import { motion, AnimatePresence } from "framer-motion"

const UserList = () => {
  const navigate = useNavigate()
  const {
    users,
    fetchUsers,
    deleteUser,
    updateUser,
    isLoadingUsers,
    isDeleting,
    isSubmitting,
    role: currentRole,
  } = useAuthStore()

  const [open, setOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")

  // Edit modal state
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editData, setEditData] = useState({
    _id: "",
    username: "",
    email: "",
    role: "admin",
  })

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleDeleteClick = (user) => {
    setSelectedUser(user)
    setOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!selectedUser) return
    await deleteUser(selectedUser._id, selectedUser.username)
    setOpen(false)
    setSelectedUser(null)
  }

  // Permission helpers for user actions:
  // - Superadmin can edit all, can delete admin & subadmin (cannot delete superadmin)
  // - Admin can ONLY edit & delete subadmin accounts (cannot edit/delete superadmin or other admins)
  // - Subadmin cannot edit or delete anyone
  const canEditUser = (targetUser) => {
    if (currentRole === 'superadmin') return true
    if (currentRole === 'admin') return targetUser.role === 'subadmin'
    return false
  }

  const canDeleteUser = (targetUser) => {
    if (currentRole === 'superadmin') return targetUser.role !== 'superadmin'
    if (currentRole === 'admin') return targetUser.role === 'subadmin'
    return false
  }

  // Edit handlers
  const handleEditClick = (user) => {
    if (!canEditUser(user)) return
    setEditData({
      _id: user._id,
      username: user.username || "",
      email: user.email || "",
      role: user.role || "admin",
    })
    setIsEditOpen(true)
  }

  const handleEditChange = (e) => {
    setEditData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    if (!editData.username) return

    const success = await updateUser(editData._id, {
      username: editData.username,
      email: editData.email,
      role: editData.role,
    })
    if (success) {
      setIsEditOpen(false)
      setEditData({ _id: "", username: "", email: "", role: "admin" })
    }
  }

  const filteredUsers = (users || []).filter(user => {
    const name = user?.username || ""
    const email = user?.email || ""
    const term = searchTerm.toLowerCase()
    return name.toLowerCase().includes(term) || email.toLowerCase().includes(term)
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8 pb-20 font-sans min-h-screen text-slate-900 dark:text-slate-100 text-left"
    >
      {/* ── HEADER HUB ── */}
      <div className="bg-white dark:bg-[#091126] rounded-3xl py-4 sm:py-5 px-6 sm:px-8 border border-slate-200 dark:border-slate-800 shadow-md relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative z-10 flex items-center gap-3.5">
          <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0">
            <Users size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full">
                STAFF DIRECTORY
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2 flex-wrap">
              User <span className="text-blue-500">Directory</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-semibold mt-0.5 text-xs sm:text-sm">
              Manage administrative access, system credentials, and account roles.
            </p>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={16} />
            <input
              type="text"
              placeholder="Find users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-[#050A17] border border-slate-200 dark:border-slate-800/90 rounded-xl text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 w-full sm:w-64 transition-all shadow-inner"
            />
          </div>
          <button 
            onClick={() => navigate('/users/add')}
            className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-sm flex items-center gap-2 cursor-pointer shrink-0"
            title="Add Staff User"
          >
            <UserPlus size={15} />
            <span className="hidden sm:inline">Add User</span>
          </button>
        </div>
      </div>

      {/* ── TABLE SECTION ── */}
      <div className="bg-white dark:bg-[#091126] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {isLoadingUsers ? (
          <div className="flex flex-col items-center justify-center py-28 gap-3">
            <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
            <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-xs">Loading Secure Data...</p>
          </div>
        ) : filteredUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50/80 dark:bg-[#080f1b]/80 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4 font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px]">Administrative User</th>
                  <th className="px-6 py-4 font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px]">Email</th>
                  <th className="px-6 py-4 font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px]">Access Level</th>
                  <th className="px-6 py-4 font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px]">Joined On</th>
                  <th className="px-6 py-4 text-right font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px]">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredUsers.map((user) => (
                  <tr
                    key={user._id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3.5">
                        <div className="size-11 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-base font-black shadow-md shadow-blue-500/20 shrink-0">
                          {(user.username || "A").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-900 dark:text-white text-sm leading-none mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {user.username || "Unknown User"}
                          </p>
                          <p className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider">@{user.role || "admin_user"}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                        <Mail size={14} className="text-blue-500" />
                        <span className="font-semibold text-xs">
                          {user.email || <span className="text-slate-400 italic">Not set</span>}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                        user.role === 'superadmin' 
                          ? 'bg-amber-500/10 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30' 
                          : user.role === 'admin' 
                          ? 'bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' 
                          : 'bg-violet-500/10 dark:bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/30'
                      }`}>
                        {user.role === 'superadmin' ? 'Full Control' : user.role === 'admin' ? 'Add/Edit' : 'Restricted'}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                        <Calendar size={14} className="text-blue-500" />
                        <span className="font-semibold text-xs">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "Recently Joined"}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {canEditUser(user) && (
                          <button
                            onClick={() => handleEditClick(user)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
                            title="Edit user"
                          >
                            <Pencil size={15} />
                          </button>
                        )}
                        {canDeleteUser(user) && (
                          <button
                            onClick={() => handleDeleteClick(user)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all cursor-pointer"
                            title="Delete user"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                        {!canEditUser(user) && !canDeleteUser(user) && (
                          <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 italic pr-2">
                            Restricted
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="size-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-300 dark:text-slate-600 mb-4">
              <Users size={32} />
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1">No Users Found</h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs">No administrative users matched your search criteria.</p>
          </div>
        )}
      </div>

      {/* ── CONFIRM DELETE MODAL ── */}
      <ConfirmationModel
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title="Revoke Access"
      >
        <p className="text-slate-600 dark:text-slate-400 font-medium text-sm py-4 leading-relaxed">
          Are you sure you want to revoke administrative access for <strong className="text-slate-900 dark:text-white underline underline-offset-4">{selectedUser?.username}</strong>? This action is irreversible.
        </p>
      </ConfirmationModel>

      {/* ── EDIT USER MODAL ── */}
      <AnimatePresence>
        {isEditOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
            onClick={() => !isSubmitting && setIsEditOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white dark:bg-[#091126] rounded-3xl p-6 sm:p-8 w-full max-w-lg border border-slate-200 dark:border-indigo-500/25 shadow-2xl ring-1 ring-slate-900/5 dark:ring-white/5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Pencil size={18} className="text-blue-500" /> Edit User
                </h3>
                <button
                  onClick={() => !isSubmitting && setIsEditOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Username</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={16} />
                    <input
                      type="text"
                      name="username"
                      value={editData.username}
                      onChange={handleEditChange}
                      placeholder="Admin username"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#050A17] text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all shadow-inner"
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={16} />
                    <input
                      type="email"
                      name="email"
                      value={editData.email}
                      onChange={handleEditChange}
                      placeholder="admin@example.com"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#050A17] text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all shadow-inner"
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Access Level</label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={16} />
                    <select
                      name="role"
                      value={editData.role}
                      onChange={handleEditChange}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#050A17] text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all appearance-none cursor-pointer shadow-inner"
                    >
                      {currentRole === 'superadmin' ? (
                        <>
                          <option value="admin" className="bg-white dark:bg-[#091126] text-slate-900 dark:text-white">Admin (Add/Edit only)</option>
                          <option value="subadmin" className="bg-white dark:bg-[#091126] text-slate-900 dark:text-white">Subadmin (Restricted)</option>
                          <option value="superadmin" className="bg-white dark:bg-[#091126] text-slate-900 dark:text-white">Superadmin (Full Control)</option>
                        </>
                      ) : (
                        <option value="subadmin" className="bg-white dark:bg-[#091126] text-slate-900 dark:text-white">Subadmin (Restricted Access)</option>
                      )}
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => !isSubmitting && setIsEditOpen(false)}
                    className="flex-1 py-3 px-5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-3 px-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-md shadow-blue-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                    {isSubmitting ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default UserList
