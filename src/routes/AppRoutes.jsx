import { Routes, Route } from "react-router-dom"
import AdminLayout from "../layouts/AdminLayout"
import ProtectedRoutes from "../components/ProtectedRoutes"
import Login from "../pages/auth/Login.jsx"
import Dashboard from "../pages/dashboard/Dashboard"
import SocialManagement from "../pages/social-management/page.jsx"

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={
          <ProtectedRoutes>
            <AdminLayout />
          </ProtectedRoutes>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="social-management" element={<SocialManagement />} />
      </Route>
    </Routes>
  )
}
