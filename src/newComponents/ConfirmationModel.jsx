import { Loader2, X, HeartHandshake } from "lucide-react"

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  title,
  children,
}) => {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900 animate-in fade-in zoom-in-95">

        {/* HEADER */}
        <div className="flex items-center gap-3 border-b pb-3 mb-4 border-slate-200 dark:border-slate-800">
          <div className="rounded-full bg-pink-500/10 p-2 text-pink-600">
            <HeartHandshake size={20} />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
            {title || "Confirm Action"}
          </h3>
        </div>

        {/* CONTENT */}
        <div className="text-sm text-slate-600 dark:text-slate-400 mb-6">
          {children}
        </div>

        {/* ACTIONS */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="rounded-md px-4 py-2 text-sm font-medium text-slate-700 transition
              hover:bg-slate-100 disabled:opacity-50
              dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white
              hover:bg-red-700 transition disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Yes, Delete"
            )}
          </button>
        </div>

        {/* CLOSE ICON */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full p-1 text-slate-400
            hover:bg-slate-100 hover:text-slate-900
            dark:hover:bg-slate-800 dark:hover:text-white"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  )
}

export default ConfirmationModal
