import { useEffect, useState } from "react"
import { Trash2, Users, Loader2, Search, UserPlus, Mail, Calendar, Pencil, X, Save, User, ShieldCheck } from "lucide-react"
import useAuthStore from "../../stores/authStores"
import ConfirmationModel from "../../newComponents/ConfirmationModel"
import { motion, AnimatePresence } from "framer-motion"

const UserList = () => {
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
      className="space-y-6"
    >
      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
        <div>
          <h1 className="text-4xl font-black text-slate-950 dark:text-white tracking-tight">User Directory</h1>
          <p className="text-slate-600 dark:text-slate-400 font-bold mt-2 text-xl italic">Manage administrative access and roles</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Find users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-6 py-3.5 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-600/20 rounded-2xl text-base font-black text-slate-950 dark:text-white placeholder:text-slate-400 focus:ring-4 focus:ring-indigo-500/10 w-full md:w-80 transition-all"
            />
          </div>
          <button className="bg-indigo-700 text-white p-4 rounded-2xl shadow-xl shadow-indigo-500/40 hover:bg-indigo-800 transition-all hover:scale-105 active:scale-95">
            <UserPlus size={24} />
          </button>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
        {isLoadingUsers ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Loading Secure Data...</p>
          </div>
        ) : filteredUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 dark:bg-slate-800">
                <tr>
                  <th className="px-8 py-6 text-left font-black text-slate-950 dark:text-slate-200 uppercase tracking-[0.3em] text-xs">Administrative User</th>
                  <th className="px-8 py-6 text-left font-black text-slate-950 dark:text-slate-200 uppercase tracking-[0.3em] text-xs">Email</th>
                  <th className="px-8 py-6 text-left font-black text-slate-950 dark:text-slate-200 uppercase tracking-[0.3em] text-xs">Access Level</th>
                  <th className="px-8 py-6 text-left font-black text-slate-950 dark:text-slate-200 uppercase tracking-[0.3em] text-xs">Joined On</th>
                  <th className="px-8 py-6 text-right font-black text-slate-950 dark:text-slate-200 uppercase tracking-[0.3em] text-xs">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredUsers.map((user) => (
                  <tr
                    key={user._id}
                    className="group hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-colors"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="size-12 rounded-2xl bg-indigo-700 flex items-center justify-center text-white text-lg font-black shadow-lg shadow-indigo-500/30">
                          {(user.username || "A").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-black text-slate-950 dark:text-white text-lg leading-none mb-1.5">{user.username || "Unknown User"}</p>
                          <p className="text-xs text-indigo-700 font-black uppercase tracking-widest">@{user.role || "admin_user"}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                        <Mail size={16} className="text-indigo-600" />
                        <span className="font-bold text-sm">
                          {user.email || <span className="text-slate-400 italic">Not set</span>}
                        </span>
                      </div>
                    </td>

                    <td className="px-8 py-6">
                      <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-black uppercase tracking-[0.2em] shadow-sm">
                        {user.role === 'superadmin' ? 'Full Control' : user.role === 'admin' ? 'Add/Edit' : 'Restricted'}
                      </span>
                    </td>

                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-slate-950 dark:text-slate-300">
                        <Calendar size={18} className="text-indigo-700" />
                        <span className="font-black text-xs uppercase tracking-widest">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "Recently Joined"}
                        </span>
                      </div>
                    </td>

                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {canEditUser(user) && (
                          <button
                            onClick={() => handleEditClick(user)}
                            className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 rounded-xl transition-all shadow-sm"
                            title="Edit user"
                          >
                            <Pencil size={20} />
                          </button>
                        )}
                        {canDeleteUser(user) && (
                          <button
                            onClick={() => handleDeleteClick(user)}
                            className="p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all shadow-sm"
                            title="Delete user"
                          >
                            <Trash2 size={20} />
                          </button>
                        )}
                        {!canEditUser(user) && !canDeleteUser(user) && (
                          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 italic pr-2">
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
            <div className="size-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-300 mb-6">
              <Users size={40} />
            </div>
            <p className="text-slate-600 font-black uppercase tracking-widest text-sm">No users found matching your search</p>
          </div>
        )}
      </div>

      {/* CONFIRM DELETE MODAL */}
      <ConfirmationModel
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title="Revoke Access"
      >
        <p className="text-slate-950 font-bold text-lg py-6 leading-relaxed">
          Are you sure you want to revoke administrative access for <span className="text-indigo-700 font-black underline underline-offset-4">{selectedUser?.username}</span>? This action is irreversible.
        </p>
      </ConfirmationModel>

      {/* EDIT USER MODAL */}
      <AnimatePresence>
        {isEditOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => !isSubmitting && setIsEditOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 w-full max-w-lg border border-slate-100 dark:border-slate-800 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Pencil size={20} className="text-indigo-600" /> Edit User
                </h3>
                <button
                  onClick={() => !isSubmitting && setIsEditOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-5">
                <div>
                  <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Username</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="text"
                      name="username"
                      value={editData.username}
                      onChange={handleEditChange}
                      placeholder="Admin username"
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-base font-medium focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-white transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="email"
                      name="email"
                      value={editData.email}
                      onChange={handleEditChange}
                      placeholder="admin@example.com"
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-base font-medium focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-white transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Access Level</label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <select
                      name="role"
                      value={editData.role}
                      onChange={handleEditChange}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-base font-medium focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-white transition-all appearance-none cursor-pointer"
                    >
                      {currentRole === 'superadmin' ? (
                        <>
                          <option value="admin">Admin (Add/Edit only)</option>
                          <option value="subadmin">Subadmin (Restricted)</option>
                          <option value="superadmin">Superadmin (Full Control)</option>
                        </>
                      ) : (
                        <option value="subadmin">Subadmin (Restricted Access)</option>
                      )}
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => !isSubmitting && setIsEditOpen(false)}
                    className="flex-1 py-4 px-6 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-black text-base hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-4 px-6 bg-indigo-600 text-white rounded-2xl font-black text-base shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
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
