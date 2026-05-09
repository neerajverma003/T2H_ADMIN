

// import { create } from "zustand"
// import { persist } from "zustand/middleware"
// import axios from "axios"
// import { ENV } from "../constants/api" // ✅ FIXED PATH
// import { toast } from "react-toastify"

// // Axios instance
// export const apiClient = axios.create({
//   baseURL: ENV.API_BASE_URL,
//   withCredentials: false,
// })

// const useAuthStore = create(
//   persist(
//     (set, get) => ({
//       isLoggedIn: false,
//       role: null,
//       username: null,
//       token: null,
//       loading: false,
//       authChecked: false,
//       error: null,

//       // 🔐 LOGIN
//       login: async (data) => {
//         set({ loading: true, error: null })
//         try {
//           const response = await apiClient.post("/admin/admin-login", data)
//           const { role, username, token, msg } = response.data

//           set({
//             isLoggedIn: true,
//             role,
//             username,
//             token,
//             loading: false,
//             error: null,
//             authChecked: true,
//           })

//           toast.success(msg || "Login successful")
//           return true
//         } catch (error) {
//           const errMsg =
//             error.response?.data?.message ||
//             error.response?.data?.msg ||
//             "Login failed"

//           set({ error: errMsg, loading: false, authChecked: true })
//           toast.error(errMsg)
//           return false
//         }
//       },

//       // 🚪 LOGOUT (FIXED)
//       logout: () => {
//         sessionStorage.removeItem("auth-storage")

//         set({
//           isLoggedIn: false,
//           role: null,
//           username: null,
//           token: null,
//           loading: false,
//           error: null,
//           authChecked: true,
//         })

//         toast.success("Logged out successfully")
//       },

//       // ✅ CHECK AUTH ON LOAD
//       checkAuthOnLoad: async () => {
//         const token = get().token
//         if (!token) {
//           set({ authChecked: true })
//           return
//         }

//         set({ loading: true })
//         try {
//           const response = await apiClient.get("/admin/me")
//           const { role, userId } = response.data

//           set({
//             isLoggedIn: true,
//             role,
//             username: userId,
//             loading: false,
//             authChecked: true,
//           })
//         } catch (err) {
//           get().logout()
//         }
//       },
//     }),
//     {
//       name: "auth-storage",
//       storage: {
//         getItem: (key) => {
//           const value = sessionStorage.getItem(key)
//           return value ? JSON.parse(value) : null
//         },
//         setItem: (key, value) => {
//           sessionStorage.setItem(key, JSON.stringify(value))
//         },
//         removeItem: (key) => {
//           sessionStorage.removeItem(key)
//         },
//       },
//       partialize: (state) => ({
//         token: state.token,
//         role: state.role,
//         username: state.username,
//         isLoggedIn: state.isLoggedIn,
//       }),
//     }
//   )
// )

// // Axios interceptor
// apiClient.interceptors.request.use(
//   (config) => {
//     const token = useAuthStore.getState().token
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`
//     }
//     return config
//   },
//   (error) => Promise.reject(error)
// )

// export default useAuthStore

import { create } from "zustand"
import { persist } from "zustand/middleware"
import axios from "axios"
import { ENV } from "../constants/api"
import { toast } from "react-toastify"

// Axios instance
export const apiClient = axios.create({
  baseURL: ENV.API_BASE_URL,
  withCredentials: true, // ✅ IMPORTANT
  // Don't set a global Content-Type header — when sending FormData (file uploads)
  // the browser/axios will set the correct multipart/form-data header with boundary.
})

const useAuthStore = create(
  persist(
    (set, get) => ({
      isLoggedIn: false,
      role: null,
      username: null,
      token: null,
      loading: false,
      authChecked: false,
      error: null,

      // Users management
      users: [],
      isLoadingUsers: false,
      isSubmitting: false,
      isDeleting: false,

      // ==========================
      // LOGIN
      // ==========================
      login: async (data) => {
        set({ loading: true, error: null })

        try {
          const payload = {
            username: data.username.trim(),
            password: data.password,
          }

          const res = await apiClient.post("/admin/admin-login", payload)
          //console.log(res.data);
          
          const { role, username, token, msg } = res.data
          localStorage.setItem("token", token);
          set({
            isLoggedIn: true,
            role,
            username,
            token,
            loading: false,
            authChecked: true,
          })

          toast.success(msg || "Login successful")
          return true
        } catch (err) {
          const msg =
            err.response?.data?.msg ||
            err.response?.data?.message ||
            "Login failed"

          set({ loading: false, error: msg, authChecked: true })
          toast.error(msg)
          return false
        }
      },

      // ==========================
      // LOGOUT
      // ==========================
      logout: () => {
        localStorage.removeItem("token")

        set({
          isLoggedIn: false,
          role: null,
          username: null,
          token: null,
          authChecked: true,
        })

        toast.success("Logged out")
      },

      // ==========================
      // CHECK AUTH
      // ==========================
      checkAuthOnLoad: async () => {
        const token = localStorage.getItem("token")
        if (!token) return set({ authChecked: true })

        try {
          const res = await apiClient.get("/admin/me")

          set({
            isLoggedIn: true,
            role: res.data.role,
            username: res.data.userId,
            authChecked: true,
          })
        } catch {
          get().logout()
        }
      },

      // ==========================
      // USERS (list / add / delete)
      // ==========================
      fetchUsers: async () => {
        set({ isLoadingUsers: true })
        try {
          // This endpoint exists in controller as `userExistedInAdmin` (server may expose it as `/admin/userExistedInAdmin`)
          // const res = await apiClient.get('/admin/userExistedInAdmin')
          const res = await apiClient.get('/admin/get-admin-user')
          set({ users: res.data.adminUser || [], isLoadingUsers: false })
        } catch (err) {
          set({ users: [], isLoadingUsers: false })
          const msg = err.response?.data?.msg || 'Failed to fetch users'
          toast.error(msg)
        }
      },

      addUser: async (payload) => {
        set({ isSubmitting: true })
        try {
          const res = await apiClient.post('/admin/adminRegister', payload)
          toast.success(res.data?.msg || 'User added')
          // refresh list
          get().fetchUsers()
          return true
        } catch (err) {
          const msg = err.response?.data?.msg || 'Failed to add user'
          toast.error(msg)
          return false
        } finally {
          set({ isSubmitting: false })
        }
      },

      deleteUser: async (userId, username) => {
        set({ isDeleting: true })
        try {
          // Correct route: DELETE /admin/delete-user/:userId (defined in admin.route.js L102)
          const res = await apiClient.delete(`/admin/delete-user/${userId}`)
          toast.success(res.data?.msg || `${username} deleted successfully`)
          // Optimistically remove the user from local state without a full refetch
          set({ users: get().users.filter((u) => u._id !== userId), isDeleting: false })
          return true
        } catch (err) {
          console.error('[deleteUser] Failed:', err?.response?.data || err?.message)
          const msg = err.response?.data?.msg || 'Failed to delete user'
          toast.error(msg)
          set({ isDeleting: false })
          return false
        }
      },
    }),
    {
      name: "auth-storage",
      storage: {
        getItem: (k) => {
          const v = sessionStorage.getItem(k)
          return v ? JSON.parse(v) : null
        },
        setItem: (k, v) => sessionStorage.setItem(k, JSON.stringify(v)),
        removeItem: (k) => sessionStorage.removeItem(k),
      },
      partialize: (s) => ({
        token: s.token,
        role: s.role,
        username: s.username,
        isLoggedIn: s.isLoggedIn,
      }),
    }
  )
)

// Inject token
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default useAuthStore
