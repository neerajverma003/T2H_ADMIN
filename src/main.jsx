
// import { createRoot } from "react-dom/client"
// import { useEffect } from "react"
// import App from "./App"
// import "./index.css"
// import useAuthStore from "./stores/authStores"

// const Root = () => {
//   const checkAuthOnLoad = useAuthStore((s) => s.checkAuthOnLoad)

//   useEffect(() => {
//     checkAuthOnLoad()
//   }, [checkAuthOnLoad])

//   return <App />
// }

// createRoot(document.getElementById("root")).render(
//   <Root />
// )


import { createRoot } from "react-dom/client"
import { useEffect } from "react"
import App from "./App"
import "./index.css"
import useAuthStore from "./stores/authStores"
import { ThemeProvider } from "./contexts/ThemeProvider" // 👈 ADD THIS

const Root = () => {
  const checkAuthOnLoad = useAuthStore((s) => s.checkAuthOnLoad)

  useEffect(() => {
    checkAuthOnLoad()
  }, [checkAuthOnLoad])

  return <App />
}

createRoot(document.getElementById("root")).render(
  <ThemeProvider>   {/* 👈 WRAP HERE */}
    <Root />
  </ThemeProvider>
)
