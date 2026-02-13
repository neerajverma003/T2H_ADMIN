


// import { User, Lock } from "lucide-react"
// import { useState } from "react"
// import useAuthStore from "../../stores/authStores"
// import { useNavigate } from "react-router-dom"

// const LoginPage = () => {
//   const navigate = useNavigate()
//   const { login, loading } = useAuthStore()

//   const [data, setData] = useState({
//     username: "",
//     password: "",
//   })

//   const handleChange = (e) => {
//     setData({
//       ...data,
//       [e.target.name]: e.target.value,
//     })
//   }

//   const handleSubmit = async (e) => {
//     e.preventDefault()

//     if (!data.username || !data.password) {
//       alert("Username and password required")
//       return
//     }

//     const success = await login(data);
//     console.log(success);
    
//     if (success) navigate("/")
//   }

//   return (
//     <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 dark:bg-blue-950">
//       <div className="w-full max-w-md">
//         <div className="rounded-xl border bg-white p-6 shadow dark:bg-slate-900">

//           <h1 className="text-center text-2xl font-bold mb-1">
//             Welcome Back
//           </h1>
//           <p className="text-center text-sm text-slate-500 mb-4">
//             Sign in to continue
//           </p>

//           <form className="space-y-4" onSubmit={handleSubmit}>
//             <div>
//               <label className="text-sm font-medium">Username</label>
//               <div className="relative">
//                 <User className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
//                 <input
//                   name="username"
//                   value={data.username}
//                   onChange={handleChange}
//                   className="w-full pl-10 py-2 border rounded-md"
//                   placeholder="admin"
//                   disabled={loading}
//                 />
//               </div>
//             </div>

//             <div>
//               <label className="text-sm font-medium">Password</label>
//               <div className="relative">
//                 <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
//                 <input
//                   type="password"
//                   name="password"
//                   value={data.password}
//                   onChange={handleChange}
//                   className="w-full pl-10 py-2 border rounded-md"
//                   placeholder="••••••••"
//                   disabled={loading}
//                 />
//               </div>
//             </div>

//             <button
//               disabled={loading}
//               className="w-full bg-blue-600 text-white py-2 rounded-md"
//             >
//               {loading ? "Logging in..." : "Login"}
//             </button>
//           </form>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default LoginPage


import { User, Lock } from "lucide-react"
import { useState } from "react"
import useAuthStore from "../../stores/authStores"
import { useNavigate } from "react-router-dom"

const LoginPage = () => {
  const navigate = useNavigate()
  const { login, loading } = useAuthStore()

  const [data, setData] = useState({
    username: "",
    password: "",
  })

  const handleChange = (e) => {
    setData({
      ...data,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!data.username || !data.password) {
      alert("Username and password required")
      return
    }

    const success = await login(data)
    console.log(success)

    if (success) navigate("/")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-sky-100 to-indigo-200 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950 p-4">
      <div className="w-full max-w-md">

        <div className="rounded-3xl border border-blue-200/50 dark:border-blue-800/50 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-8 shadow-2xl">

          <h1 className="text-center text-3xl font-extrabold mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Welcome Back
          </h1>

          <p className="text-center text-sm text-slate-600 dark:text-slate-400 mb-6">
            Sign in to continue
          </p>

          <form className="space-y-5" onSubmit={handleSubmit}>
            
            {/* Username */}
            <div>
              <label className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                Username
              </label>

              <div className="relative mt-1">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-blue-400" />

                <input
                  name="username"
                  value={data.username}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="admin"
                  className="w-full pl-10 py-2.5 rounded-xl border border-blue-300/60 dark:border-blue-700 bg-white/70 dark:bg-slate-800 text-slate-800 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-400 outline-none transition"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                Password
              </label>

              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-blue-400" />

                <input
                  type="password"
                  name="password"
                  value={data.password}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="••••••••"
                  className="w-full pl-10 py-2.5 rounded-xl border border-blue-300/60 dark:border-blue-700 bg-white/70 dark:bg-slate-800 text-slate-800 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-400 outline-none transition"
                />
              </div>
            </div>

            {/* Button */}
            <button
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 hover:opacity-90 text-white py-2.5 rounded-xl font-semibold shadow-lg transition-all duration-300 disabled:opacity-60"
            >
              {loading ? "Logging in..." : "Login"}
            </button>

          </form>
        </div>

      </div>
    </div>
  )
}

export default LoginPage
