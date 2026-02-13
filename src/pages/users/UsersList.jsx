import { useEffect, useState } from "react"
import { Trash2, Users, Loader2 } from "lucide-react"
import  useAuthStore  from "../../stores/authStores"
import ConfirmationModel from "../../newComponents/ConfirmationModel"

const UserList = () => {
  const { users, fetchUsers, deleteUser, isLoadingUsers, isDeleting } =
    useAuthStore()

  const [open, setOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)

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

  return (
    <>
      <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200 dark:bg-slate-900 dark:border-slate-800">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              User List
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {users.length} users
          </p>
        </div>

        {/* TABLE */}
        {isLoadingUsers ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : users.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Username
                  </th>
                  <th className="py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Created At
                  </th>
                  <th className="py-3 text-right"></th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr
                    key={user._id}
                    className="border-b last:border-none hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
                  >
                    <td className="py-4 text-sm font-medium text-slate-900 dark:text-white">
                      {user.username}
                    </td>

                    <td className="py-4 text-sm text-slate-600 dark:text-slate-400">
                      {new Date(user.createdAt).toLocaleString()}
                    </td>

                    <td className="py-4 text-right">
                      <button
                        onClick={() => handleDeleteClick(user)}
                        className="text-red-500 hover:text-red-700 transition"
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
          <p className="text-center py-10 text-slate-500">
            No users found.
          </p>
        )}
      </div>

      {/* CONFIRM MODAL */}
      <ConfirmationModel
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title="Delete User"
      >
        Are you sure you want to delete{" "}
        <strong>{selectedUser?.username}</strong>?
      </ConfirmationModel>
    </>
  )
}

export default UserList
