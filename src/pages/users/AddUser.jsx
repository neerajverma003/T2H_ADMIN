import { useState, useEffect } from "react"
import { User, Lock, Loader2, Users, Trash2, UserPlus, ShieldCheck, Sparkles } from "lucide-react"
import useAuthStore from "../../stores/authStores"
import ConfirmationModel from "../../newComponents/ConfirmationModel"
import { motion } from "framer-motion"

const AddUser = () => {
  const {
    users,
    isLoadingUsers,
    isSubmitting,
    isDeleting,
    fetchUsers,
    addUser,
    deleteUser,
  } = useAuthStore()

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: "admin",
  })

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState(null)

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
      setFormData({ username: "", password: "", role: "admin" })
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full space-y-6 pb-12"
    >
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              <ShieldCheck className="text-indigo-600" />
              STAFF ACCOUNTS
            </h1>
            <p className="text-slate-500 font-medium mt-1">Manage administrators and system access</p>
          </div>
        </div>
      </div>

      {/* HORIZONTAL ADD FORM */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
        <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider mb-8 flex items-center gap-2">
          <UserPlus size={20} className="text-indigo-600" /> Quick Add Account
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row items-end gap-6">
          <div className="flex-1 w-full">
            <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Username</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Admin username"
                className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-base font-medium focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-white transition-all"
              />
            </div>
          </div>

          <div className="flex-1 w-full">
            <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-base font-medium focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-white transition-all"
              />
            </div>
          </div>

          <div className="flex-1 w-full">
            <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Access Level</label>
            <div className="relative">
              <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-base font-medium focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-white transition-all appearance-none cursor-pointer"
              >
                <option value="admin">Admin (Add/Edit only)</option>
                <option value="subadmin">Subadmin (Restricted)</option>
                <option value="superadmin">Superadmin (Full Control)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="h-[60px] px-10 bg-indigo-600 text-white rounded-2xl font-black text-lg shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50 whitespace-nowrap lg:mb-0.5"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={24} /> : <UserPlus size={24} />}
            {isSubmitting ? "Saving..." : "Create Account"}
          </button>
        </form>
      </div>

      {/* FULL WIDTH LIST */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none min-h-[400px]">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-3">
            <Users size={24} className="text-indigo-600" /> Active Staff Directory
          </h2>
          <div className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-indigo-600 text-xs font-black uppercase tracking-widest">
            {users?.length || 0} Total Members
          </div>
        </div>

        {isLoadingUsers ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
            <p className="text-sm font-black text-slate-400 uppercase tracking-widest text-center">Syncing Database...</p>
          </div>
        ) : users?.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-6">
            {users.map((user) => (
              <div key={user._id} className="group flex items-center justify-between p-6 rounded-[2rem] bg-slate-50 dark:bg-slate-800/50 border border-transparent hover:border-indigo-100 dark:hover:border-indigo-900/30 transition-all hover:shadow-lg hover:shadow-indigo-500/5">
                <div className="flex items-center gap-5">
                  <div className="size-16 rounded-[1.25rem] bg-white dark:bg-slate-900 flex items-center justify-center text-indigo-600 font-black text-2xl shadow-sm group-hover:scale-110 transition-transform border border-slate-100 dark:border-slate-800">
                    {(user.username || 'A').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-lg font-black text-slate-900 dark:text-white tracking-tight">{user.username}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className={`size-2 rounded-full ${user.role === 'superadmin' ? 'bg-indigo-500' : user.role === 'admin' ? 'bg-emerald-500' : 'bg-slate-400'}`}></div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">{user.role}</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteClick(user)}
                  className="p-4 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-2xl transition-all"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="size-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-200 mb-8">
              <Sparkles size={48} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3 tracking-tighter">No Other Admins</h3>
            <p className="text-slate-500 font-medium max-w-[300px] text-lg">Other administrative accounts will appear here once created.</p>
          </div>
        )}
      </div>

      <ConfirmationModel isOpen={isModalOpen} onClose={handleCloseModal} onConfirm={handleConfirmDelete} isLoading={isDeleting} title="Delete Admin Account">
        <p className="text-slate-600 dark:text-slate-400 py-4">Are you sure you want to permanently delete <strong>{userToDelete?.username}</strong>?</p>
      </ConfirmationModel>
    </motion.div>
  )
}

export default AddUser
