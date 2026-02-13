import { useState } from "react"
import { Outlet } from "react-router-dom"

import Sidebar from "../components/Sidebar"
import Header from "../components/Header"
import Footer from "../components/Footer"

const AdminLayout = () => {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-slate-950 overflow-hidden">

      <Sidebar open={open} setOpen={setOpen} />

      <div className="flex flex-1 flex-col overflow-hidden md:ml-[260px]">

        <Header setOpen={setOpen} />

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>

        <Footer />
      </div>
    </div>
  )
}
export default AdminLayout