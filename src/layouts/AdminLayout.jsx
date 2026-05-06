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

      <div className="flex flex-1 flex-col overflow-hidden md:ml-[270px]">

        <Header setOpen={setOpen} />

        <main className="flex-1 overflow-y-auto px-2 md:px-4 py-4 md:py-8 custom-scrollbar">
          <div className="w-full">
            <Outlet />
          </div>
        </main>

        <Footer />
      </div>
    </div>
  )
}
export default AdminLayout