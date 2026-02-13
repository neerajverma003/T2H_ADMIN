// import { useState, useEffect } from "react"
// import { User, Lock, Loader2, Users, Trash2, HeartHandshake } from "lucide-react"
// import useAuthStore from "../../stores/authStores"
// import ConfirmationModel from "../../newComponents/ConfirmationModel"

// const AddUser = () => {
//   const {
//     users,
//     isLoadingUsers,
//     isSubmitting,
//     isDeleting,
//     fetchUsers,
//     addUser,
//     deleteUser,
//   } = useAuthStore()

//   const [formData, setFormData] = useState({
//     username: "",
//     password: "",
//   })

//   const [isModalOpen, setIsModalOpen] = useState(false)
//   const [userToDelete, setUserToDelete] = useState(null)

//   useEffect(() => {
//     fetchUsers()
//   }, [fetchUsers])

//   const handleChange = (e) => {
//     setFormData((prev) => ({
//       ...prev,
//       [e.target.name]: e.target.value,
//     }))
//   }

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     if (!formData.username || !formData.password) return
//     await addUser(formData)
//     setFormData({ username: "", password: "" })
//   }

//   const handleDeleteClick = (user) => {
//     setUserToDelete(user)
//     setIsModalOpen(true)
//   }

//   const handleCloseModal = () => {
//     if (isDeleting) return
//     setUserToDelete(null)
//     setIsModalOpen(false)
//   }

//   const handleConfirmDelete = async () => {
//     if (!userToDelete) return
//     await deleteUser(userToDelete._id, userToDelete.username)
//     handleCloseModal()
//   }

//   return (
//     <>
//       <div className="flex flex-col gap-y-8">

//         {/* PAGE HEADER */}
//         <div>
//           <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
//             💍 Admin Users
//           </h1>
//           <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
//             Manage administrators for Trip to Honeymoon
//           </p>
//         </div>

//         {/* ADD USER */}
//         <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
//           <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
//             Add New Admin User
//           </h2>

//           <form onSubmit={handleSubmit} className="mt-6 space-y-6">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

//               <div className="space-y-2">
//                 <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
//                   Username
//                 </label>
//                 <div className="relative">
//                   <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
//                   <input
//                     type="text"
//                     name="username"
//                     value={formData.username}
//                     onChange={handleChange}
//                     placeholder="Enter admin username"
//                     className="w-full rounded-lg border border-slate-300 bg-transparent py-2 pl-10 pr-3 text-sm
//                       focus:ring-2 focus:ring-pink-500 focus:outline-none
//                       dark:border-slate-700 dark:text-white"
//                   />
//                 </div>
//               </div>

//               <div className="space-y-2">
//                 <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
//                   Password
//                 </label>
//                 <div className="relative">
//                   <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
//                   <input
//                     type="password"
//                     name="password"
//                     value={formData.password}
//                     onChange={handleChange}
//                     placeholder="Create secure password"
//                     className="w-full rounded-lg border border-slate-300 bg-transparent py-2 pl-10 pr-3 text-sm
//                       focus:ring-2 focus:ring-pink-500 focus:outline-none
//                       dark:border-slate-700 dark:text-white"
//                   />
//                 </div>
//               </div>
//             </div>

//             <button
//               type="submit"
//               disabled={isSubmitting}
//               className="inline-flex items-center gap-2 rounded-md bg-pink-600 px-4 py-2.5 text-sm font-semibold text-white
//                 hover:bg-pink-700 transition disabled:opacity-50"
//             >
//               {isSubmitting ? (
//                 <>
//                   <Loader2 className="h-5 w-5 animate-spin" />
//                   Adding...
//                 </>
//               ) : (
//                 <>
//                   <HeartHandshake size={18} />
//                   Add Admin
//                 </>
//               )}
//             </button>
//           </form>
//         </div>

//         {/* USER LIST */}
//         <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
//           <div className="flex items-center gap-2">
//             <Users className="h-6 w-6 text-slate-700 dark:text-slate-300" />
//             <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
//               Admin Users
//             </h2>
//           </div>

//           <div className="mt-6 overflow-x-auto">
//             {isLoadingUsers ? (
//               <div className="flex justify-center py-10">
//                 <Loader2 className="h-8 w-8 animate-spin text-pink-600" />
//               </div>
//             ) : users?.length ? (
//               <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
//                 <thead>
//                   <tr>
//                     <th className="px-4 py-3 text-left text-sm font-semibold">
//                       Username
//                     </th>
//                     <th className="px-4 py-3 text-right text-sm font-semibold">
//                       Actions
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {users?.map((user) => (
//                     <tr key={user._id} className="border-t">
//                       <td className="px-4 py-3 text-sm">{user.username}</td>
//                       <td className="px-4 py-3 text-right">
//                         <button
//                           onClick={() => handleDeleteClick(user)}
//                           className="text-red-600 hover:text-red-700"
//                         >
//                           <Trash2 size={18} />
//                         </button>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             ) : (
//               <p className="text-center py-10 text-slate-500">
//                 No admin users found.
//               </p>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* CONFIRMATION MODAL */}
//       <ConfirmationModel
//         isOpen={isModalOpen}
//         onClose={handleCloseModal}
//         onConfirm={handleConfirmDelete}
//         isLoading={isDeleting}
//         title="Delete Admin User"
//       >
//         <p className="text-sm">
//           Are you sure you want to permanently delete{" "}
//           <strong>{userToDelete?.username}</strong>?  
//           This action cannot be undone.
//         </p>
//       </ConfirmationModel>
//     </>
//   )
// }

// export default AddUser


import { useState, useEffect } from "react"
import { User, Lock, Loader2, Users, Trash2, HeartHandshake } from "lucide-react"
import useAuthStore from "../../stores/authStores"
import ConfirmationModel from "../../newComponents/ConfirmationModel"

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
    await addUser(formData)
    setFormData({ username: "", password: "" })
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
    <>
      <div className="flex flex-col gap-y-10">

        {/* PAGE HEADER */}
        <div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            💍 Admin Users
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Manage administrators for Trip to Honeymoon
          </p>
        </div>

        {/* ADD USER */}
        <div className="rounded-3xl border border-blue-200/60 dark:border-blue-800/50 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-8 shadow-2xl">
          <h2 className="text-xl font-bold text-blue-700 dark:text-blue-300">
            Add New Admin User
          </h2>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Username */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-400" />
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Enter admin username"
                    className="w-full rounded-xl border border-blue-300/60 bg-white/80 dark:bg-slate-800 py-3 pl-10 pr-3 text-sm
                      focus:ring-2 focus:ring-blue-400 focus:outline-none
                      dark:border-blue-700 dark:text-white transition"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-400" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create secure password"
                    className="w-full rounded-xl border border-blue-300/60 bg-white/80 dark:bg-slate-800 py-3 pl-10 pr-3 text-sm
                      focus:ring-2 focus:ring-blue-400 focus:outline-none
                      dark:border-blue-700 dark:text-white transition"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white
                hover:opacity-90 shadow-lg transition-all duration-300 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <HeartHandshake size={18} />
                  Add Admin
                </>
              )}
            </button>
          </form>
        </div>

        {/* USER LIST */}
        <div className="rounded-3xl border border-blue-200/60 dark:border-blue-800/50 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-8 shadow-2xl">
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-bold text-blue-700 dark:text-blue-300">
              Admin Users
            </h2>
          </div>

          <div className="mt-8 overflow-x-auto">
            {isLoadingUsers ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              </div>
            ) : users?.length ? (
              <table className="min-w-full divide-y divide-blue-200/50 dark:divide-blue-800/40">
                <thead>
                  <tr className="text-blue-700 dark:text-blue-300">
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      Username
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users?.map((user) => (
                    <tr
                      key={user._id}
                      className="border-t border-blue-200/40 dark:border-blue-800/40 hover:bg-blue-50/50 dark:hover:bg-slate-800 transition"
                    >
                      <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
                        {user.username}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDeleteClick(user)}
                          className="text-red-500 hover:text-red-600 transition"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-center py-12 text-slate-500 dark:text-slate-400">
                No admin users found.
              </p>
            )}
          </div>
        </div>
      </div>

      <ConfirmationModel
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title="Delete Admin User"
      >
        <p className="text-sm text-slate-700 dark:text-slate-300">
          Are you sure you want to permanently delete{" "}
          <strong>{userToDelete?.username}</strong>?  
          This action cannot be undone.
        </p>
      </ConfirmationModel>
    </>
  )
}

export default AddUser
