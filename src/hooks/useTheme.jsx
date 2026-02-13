// import { useEffect, useState } from "react"

// export const useTheme = () => {
//   const [theme, setTheme] = useState(localStorage.getItem("theme") || "light")

//   useEffect(() => {
//     document.documentElement.classList.toggle("dark", theme === "dark")
//     localStorage.setItem("theme", theme)
//   }, [theme])

//   return { theme, setTheme }
// }

import { useEffect, useState } from "react"

export const useTheme = () => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "light"
  })

  useEffect(() => {
    const root = document.documentElement

    root.classList.remove("light", "dark") // 🔥 important
    root.classList.add(theme)

    localStorage.setItem("theme", theme)
  }, [theme])

  return { theme, setTheme }
}

