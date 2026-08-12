import { useState, useEffect } from "react"
import { Outlet } from "react-router-dom"

import Sidebar from "../components/Sidebar"
import Header from "../components/Header"
import Footer from "../components/Footer"

const AdminLayout = () => {
  const [open, setOpen] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth >= 768
    }
    return true
  })

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setOpen(false)
      } else {
        setOpen(true)
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <div className="flex h-screen bg-[#f0f2f5] dark:bg-slate-950 overflow-hidden font-sans antialiased text-slate-900 dark:text-slate-100 transition-colors duration-500">

      <Sidebar open={open} setOpen={setOpen} />

      <div className={`flex flex-1 flex-col overflow-hidden transition-all duration-500 ease-in-out ${open ? "md:ml-[270px]" : "md:ml-[80px]"}`}>

        <Header open={open} setOpen={setOpen} />

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