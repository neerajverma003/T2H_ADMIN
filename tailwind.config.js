/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",   // 🔥 THIS MUST BE "class"
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}