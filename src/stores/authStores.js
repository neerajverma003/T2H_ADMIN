

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

          if (res.data.mfaRequired) {
            set({ loading: false })
            toast.info(res.data.msg || "MFA Required: 6-digit OTP code sent to your email.")
            return { mfaRequired: true, adminId: res.data.adminId, email: res.data.email }
          }

          const { role, username, token, msg, name, email, designation } = res.data
          localStorage.setItem("token", token);
          set({
            isLoggedIn: true,
            role,
            username,
            token,
            profile: {
              name: name || 'Admin User',
              email: email || '',
              designation: designation || (role === 'superadmin' ? 'SUPER ADMIN' : 'ADMINISTRATOR')
            },
            loading: false,
            authChecked: true,
          })

          toast.success(msg || "Login successful")
          return { mfaRequired: false }
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

      verifyLoginOtp: async (adminId, otp, rememberDevice = false) => {
        set({ loading: true, error: null })
        try {
          const res = await apiClient.post("/admin/verify-login-otp", { adminId, otp, rememberDevice })
          const { role, username, token, msg, name, email, designation } = res.data
          localStorage.setItem("token", token);
          set({
            isLoggedIn: true,
            role,
            username,
            token,
            profile: {
              name: name || 'Admin User',
              email: email || '',
              designation: designation || (role === 'superadmin' ? 'SUPER ADMIN' : 'ADMINISTRATOR')
            },
            loading: false,
            authChecked: true,
          })
          toast.success(msg || "MFA Verification successful! Welcome back.")
          return true
        } catch (err) {
          const msg = err.response?.data?.msg || err.response?.data?.message || "Invalid OTP code"
          set({ loading: false, error: msg })
          toast.error(msg)
          return false
        }
      },

      resendLoginOtp: async (adminId) => {
        try {
          const res = await apiClient.post("/admin/resend-login-otp", { adminId })
          toast.success(res.data.msg || "New OTP code sent to your email!")
          return true
        } catch (err) {
          const msg = err.response?.data?.msg || "Failed to resend OTP"
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
          profile: { name: 'Admin User', email: '', designation: 'SUPER ADMIN' },
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
            profile: {
              name: res.data.name || 'Admin User',
              email: res.data.email || '',
              designation: res.data.designation || (res.data.role === 'superadmin' ? 'SUPER ADMIN' : 'ADMINISTRATOR')
            },
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

      // Profile management
      profile: { firstName: 'Admin', lastName: '', name: 'Admin User', gender: 'Male', email: '', phone: '', designation: 'SUPER ADMIN', avatar: '' },
      isLoadingProfile: false,

      fetchAdminProfile: async () => {
        set({ isLoadingProfile: true })
        try {
          const res = await apiClient.get('/admin/profile')
          if (res.data.success && res.data.profile) {
            set({ profile: res.data.profile, isLoadingProfile: false })
            return res.data.profile
          }
        } catch (err) {
          console.error('[fetchAdminProfile] error:', err)
          set({ isLoadingProfile: false })
        }
      },

      updateAdminProfile: async (data) => {
        set({ isLoadingProfile: true })
        try {
          const res = await apiClient.put('/admin/profile/update', data)
          if (res.data.success && res.data.profile) {
            set({ profile: res.data.profile, isLoadingProfile: false })
            toast.success(res.data.msg || 'Profile details updated successfully!')
            return true
          }
        } catch (err) {
          const msg = err.response?.data?.msg || err.response?.data?.message || 'Failed to update profile'
          toast.error(msg)
          set({ isLoadingProfile: false })
          return false
        }
      },

      sendPasswordOtp: async () => {
        try {
          const res = await apiClient.post('/admin/profile/send-otp')
          toast.success(res.data.msg || 'Verification OTP sent to your email!')
          return true
        } catch (err) {
          const msg = err.response?.data?.msg || err.response?.data?.message || 'Failed to send OTP code'
          toast.error(msg)
          return false
        }
      },

      verifyPasswordOtp: async (otp, newPassword) => {
        try {
          const res = await apiClient.post('/admin/profile/verify-otp-password', { otp, newPassword })
          toast.success(res.data.msg || 'Password updated successfully!')
          return true
        } catch (err) {
          const msg = err.response?.data?.msg || err.response?.data?.message || 'Invalid or expired OTP'
          toast.error(msg)
          return false
        }
      },

      verifyUsernameOtp: async (otp, newUsername) => {
        try {
          const res = await apiClient.post('/admin/profile/verify-otp-username', { otp, newUsername })
          if (res.data.success) {
            set((state) => ({
              username: res.data.username,
              profile: { ...state.profile, username: res.data.username },
            }))
            toast.success(res.data.msg || 'Username updated successfully!')
            return true
          }
        } catch (err) {
          const msg = err.response?.data?.msg || err.response?.data?.message || 'Invalid or expired OTP'
          toast.error(msg)
          return false
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
