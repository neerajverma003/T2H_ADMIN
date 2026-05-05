import { useEffect, useState } from "react"
import { Trash2, Users, Loader2, Search, UserPlus, Mail, Calendar } from "lucide-react"
import  useAuthStore  from "../../stores/authStores"
import ConfirmationModel from "../../newComponents/ConfirmationModel"
import { motion } from "framer-motion"

const UserList = () => {
  const { users, fetchUsers, deleteUser, isLoadingUsers, isDeleting } =
    useAuthStore()

  const [open, setOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")

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

  // 🛡️ Added safety check for user.username to prevent .toLowerCase() crash
  const filteredUsers = (users || []).filter(user => {
    const name = user?.username || ""
    return name.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">User Directory</h1>
          <p className="text-slate-500 font-medium mt-1">Manage administrative access and roles</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Find users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 w-full md:w-64"
              />
           </div>
           <button className="bg-indigo-600 text-white p-3 rounded-xl shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 transition-all">
              <UserPlus size={20} />
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
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th className="px-8 py-5 text-left font-bold text-slate-400 uppercase tracking-widest text-[10px]">Administrative User</th>
                  <th className="px-8 py-5 text-left font-bold text-slate-400 uppercase tracking-widest text-[10px]">Access Level</th>
                  <th className="px-8 py-5 text-left font-bold text-slate-400 uppercase tracking-widest text-[10px]">Joined On</th>
                  <th className="px-8 py-5 text-right font-bold text-slate-400 uppercase tracking-widest text-[10px]">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {filteredUsers.map((user) => (
                  <tr
                    key={user._id}
                    className="group hover:bg-indigo-50/30 dark:hover:bg-indigo-900/5 transition-colors"
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                         <div className="size-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black shadow-lg shadow-indigo-500/20">
                            {(user.username || "A").charAt(0).toUpperCase()}
                         </div>
                         <div>
                            <p className="font-bold text-slate-900 dark:text-white leading-none mb-1">{user.username || "Unknown User"}</p>
                            <p className="text-xs text-slate-400 font-medium">@{user.role || "admin_user"}</p>
                         </div>
                      </div>
                    </td>

                    <td className="px-8 py-5">
                       <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold uppercase tracking-wider">
                          Full Access
                       </span>
                    </td>

                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2 text-slate-500">
                        <Calendar size={14} />
                        <span className="font-medium text-xs">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "Recently Joined"}
                        </span>
                      </div>
                    </td>

                    <td className="px-8 py-5 text-right">
                      <button
                        onClick={() => handleDeleteClick(user)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="size-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-300 mb-4">
              <Users size={32} />
            </div>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No users found matching your search</p>
          </div>
        )}
      </div>

      {/* CONFIRM MODAL */}
      <ConfirmationModel
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title="Revoke Access"
      >
        <p className="text-slate-600 py-4">
          Are you sure you want to revoke administrative access for <strong>{selectedUser?.username}</strong>? This action cannot be undone.
        </p>
      </ConfirmationModel>
    </motion.div>
  )
}

export default UserList
