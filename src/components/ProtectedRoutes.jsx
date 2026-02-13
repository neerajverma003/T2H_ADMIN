
// import { Navigate } from "react-router-dom"
// import { useAuthStore } from "../stores/authStores";


// const ProtectedRoute = ({ children }) => {
//   const token = useAuthStore((s) => s.token)
//   return token ? children : <Navigate to="/login" />
// }

// export default ProtectedRoute


// src/components/ProtectedRoute.jsx

import { Navigate, Outlet } from "react-router-dom"
import  useAuthStore  from "../stores/authStores";

const LoadingScreen = () => (
  <div className="flex h-screen items-center justify-center bg-white dark:bg-slate-950">
    <span className="text-lg font-semibold">Checking authentication...</span>
  </div>
)

const ProtectedRoute = ({ allowedRoles }) => {
  const { isLoggedIn, role, authChecked } = useAuthStore()

  // 1️⃣ WAIT for auth check (MOST IMPORTANT)
  if (!authChecked) {
    return <LoadingScreen />
  }

  // 2️⃣ NOT logged in → redirect
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />
  }

  // 3️⃣ Role-based protection
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />
  }

  // 4️⃣ Everything ok → render page
  return <Outlet />
}

export default ProtectedRoute

