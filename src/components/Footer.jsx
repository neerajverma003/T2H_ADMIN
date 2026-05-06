const Footer = () => {
  return (
    <footer className="mt-auto border-t border-slate-100 bg-white/50 dark:border-slate-900 dark:bg-black px-8 py-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between max-w-full mx-auto">
        
        {/* LEFT TEXT */}
        <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">
          © 2025 T2H ADMIN — POWERED BY ADMIRE GROUP.
        </p>

        {/* LINKS */}
        <div className="flex gap-6 text-[9px] font-black uppercase tracking-[0.2em]">
          <a
            href="#"
            className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Privacy
          </a>
          <a
            href="#"
            className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Terms
          </a>
          <a
            href="#"
            className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Documentation
          </a>
        </div>

      </div>
    </footer>
  )
}

export default Footer
