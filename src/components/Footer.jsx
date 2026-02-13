const Footer = () => {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white px-4 py-4 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        
        {/* LEFT TEXT */}
        <p className="text-sm font-medium text-slate-900 dark:text-slate-50">
          © 2025 Admire Group. All Rights Reserved.
        </p>

        {/* LINKS */}
        <div className="flex gap-3 text-sm">
          <a
            href="#"
            className="text-slate-600 hover:text-blue-600 transition dark:text-slate-400 dark:hover:text-blue-400"
          >
            Privacy Policy
          </a>

          <span className="text-slate-400">|</span>

          <a
            href="#"
            className="text-slate-600 hover:text-blue-600 transition dark:text-slate-400 dark:hover:text-blue-400"
          >
            Terms of Service
          </a>
        </div>

      </div>
    </footer>
  )
}

export default Footer
