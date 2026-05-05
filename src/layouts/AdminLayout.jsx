import { useState } from "react"
import { Outlet } from "react-router-dom"

import Sidebar from "../components/Sidebar"
import Header from "../components/Header"
import Footer from "../components/Footer"

const AdminLayout = () => {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex h-screen bg-[#f0f2f5] dark:bg-slate-950 overflow-hidden font-sans antialiased text-slate-900 dark:text-slate-100 transition-colors duration-500">

      <Sidebar open={open} setOpen={setOpen} />

      <div className="flex flex-1 flex-col overflow-hidden md:ml-[260px]">

        <Header setOpen={setOpen} />

        <main className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">
          <div className="max-w-[1600px] mx-auto">
            <Outlet />
          </div>
        </main>

        <Footer />
      </div>
    </div>
  )
}
export default AdminLayout