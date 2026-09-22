import { useState, useEffect } from "react"
import { User, Lock, Loader2, Users, Trash2, UserPlus, ShieldCheck, Sparkles, Mail, Pencil, X, Save } from "lucide-react"
import useAuthStore from "../../stores/authStores"
import ConfirmationModel from "../../newComponents/ConfirmationModel"
import { motion, AnimatePresence } from "framer-motion"

const AddUser = () => {
  const {
    users,
    isLoadingUsers,
    isSubmitting,
    isDeleting,
    fetchUsers,
    addUser,
    deleteUser,
    updateUser,
    role: currentRole,
  } = useAuthStore()

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    role: currentRole === "admin" ? "subadmin" : "admin",
  })

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState(null)

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

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.username || !formData.password) return

    const success = await addUser(formData)
    if (success) {
      setFormData({ username: "", password: "", email: "", role: "admin" })
    }
  }

  const handleDeleteClick = (user) => {
    setUserToDelete(user)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    if (isDeleting) return
    setUserToDelete(null)
    setIsModalOpen(false)
  }

  const handleConfirmDelete = async () => {
    if (!userToDelete) return
    await deleteUser(userToDelete._id, userToDelete.username)
    handleCloseModal()
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
            <ShieldCheck size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full">
                STAFF MANAGEMENT
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2 flex-wrap">
              Staff <span className="text-blue-500">Accounts</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-semibold mt-0.5 text-xs sm:text-sm">
              Manage administrators, subadmins, and system access credentials.
            </p>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="px-4 py-2 bg-blue-500/10 dark:bg-blue-600/20 border border-blue-500/20 dark:border-blue-500/30 rounded-xl text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-xs">
            <Users size={16} />
            <span>{users?.length || 0} Total Staff</span>
          </div>
        </div>
      </div>

      {/* ── HORIZONTAL ADD FORM CARD ── */}
      {(currentRole === 'superadmin' || currentRole === 'admin') && (
        <div className="bg-white dark:bg-[#091126] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="size-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <UserPlus size={16} />
            </div>
            <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Quick Add Account
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row items-end gap-5 flex-wrap">
            <div className="flex-1 w-full min-w-[200px]">
              <label className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Username</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={16} />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Admin username"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#050A17] text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all shadow-inner"
                />
              </div>
            </div>

            <div className="flex-1 w-full min-w-[200px]">
              <label className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={16} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="admin@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#050A17] text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all shadow-inner"
                />
              </div>
            </div>

            <div className="flex-1 w-full min-w-[200px]">
              <label className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={16} />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#050A17] text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all shadow-inner"
                />
              </div>
            </div>

            <div className="flex-1 w-full min-w-[200px]">
              <label className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Access Level</label>
              <div className="relative">
                <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={16} />
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#050A17] text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all cursor-pointer shadow-inner"
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

            <button
              type="submit"
              disabled={isSubmitting}
              className="h-[46px] px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-sm transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 whitespace-nowrap cursor-pointer"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <UserPlus size={18} />}
              {isSubmitting ? "Saving..." : "Create Account"}
            </button>
          </form>
        </div>
      )}

      {/* ── FULL WIDTH ACTIVE STAFF DIRECTORY ── */}
      <div className="bg-white dark:bg-[#091126] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm min-h-[350px]">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2.5">
            <Users size={18} className="text-blue-500" /> Active Staff Directory
          </h2>
          <div className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-700 dark:text-slate-300 text-xs font-bold uppercase tracking-wider">
            {users?.length || 0} Total Members
          </div>
        </div>

        {isLoadingUsers ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest text-center">Syncing Database...</p>
          </div>
        ) : users?.length ? (
          <div className="flex flex-col gap-3.5">
            {users.map((user) => (
              <div key={user._id} className="group flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-slate-50/80 dark:bg-[#080f1b] border border-slate-200 dark:border-slate-800/80 hover:border-blue-300 dark:hover:border-indigo-500/40 transition-all hover:shadow-md">
                <div className="flex items-center gap-4">
                  <div className="size-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-base shadow-md shadow-blue-500/20 shrink-0">
                    {(user.username || 'A').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-base font-black text-slate-900 dark:text-white tracking-tight">{user.username}</p>
                    {user.email && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                        <Mail size={12} /> {user.email}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <div className={`size-2 rounded-full ${user.role === 'superadmin' ? 'bg-amber-500' : user.role === 'admin' ? 'bg-emerald-500' : 'bg-slate-400'}`}></div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">{user.role}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {canEditUser(user) && (
                    <button
                      onClick={() => handleEditClick(user)}
                      className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
                      title="Edit user"
                    >
                      <Pencil size={17} />
                    </button>
                  )}
                  {canDeleteUser(user) && (
                    <button
                      onClick={() => handleDeleteClick(user)}
                      className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all cursor-pointer"
                      title="Delete user"
                    >
                      <Trash2 size={17} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="size-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-300 dark:text-slate-600 mb-4">
              <Sparkles size={36} />
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1">No Other Admins</h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs max-w-sm">Other administrative accounts will appear here once created.</p>
          </div>
        )}
      </div>

      {/* ── DELETE CONFIRMATION MODAL ── */}
      <ConfirmationModel isOpen={isModalOpen} onClose={handleCloseModal} onConfirm={handleConfirmDelete} isLoading={isDeleting} title="Delete Admin Account">
        <p className="text-slate-600 dark:text-slate-400 py-4 text-sm">Are you sure you want to permanently delete <strong>{userToDelete?.username}</strong>?</p>
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

export default AddUser
