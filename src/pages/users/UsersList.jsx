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
                       <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-black uppercase tracking-[0.2em] shadow-sm">
                          Full Access
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
                      <button
                        onClick={() => handleDeleteClick(user)}
                        className="p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all shadow-sm"
                      >
                        <Trash2 size={20} />
                      </button>
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

      {/* CONFIRM MODAL */}
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
    </motion.div>
  )
}

export default UserList
