import { Loader2, MessageSquare, Star, CheckCircle2, Clock } from 'lucide-react';

const ReviewsTab = ({ tab }) => {
  const { data: reviews, loading } = tab;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <Loader2 className="w-8 h-8 text-blue-600 dark:text-indigo-400 animate-spin" />
        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Loading reviews...</p>
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="size-16 rounded-2xl bg-blue-50 dark:bg-indigo-950/40 border border-blue-200/60 dark:border-indigo-500/30 flex items-center justify-center mb-4 text-blue-600 dark:text-indigo-400">
          <MessageSquare size={24} />
        </div>
        <h4 className="font-bold text-slate-800 dark:text-slate-200 text-base">No reviews posted</h4>
        <p className="text-xs text-slate-400 mt-1">This customer hasn't reviewed any itineraries yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((rev) => (
        <div key={rev._id} className="p-5 rounded-2xl border border-slate-200/80 dark:border-indigo-500/20 bg-slate-50/70 dark:bg-[#070d1e]/80 shadow-sm">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h4 className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base">{rev.itineraryTitle}</h4>
            {rev.isApproved ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                <CheckCircle2 size={11} /> Approved
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
                <Clock size={11} /> Pending
              </span>
            )}
          </div>
          <div className="flex gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={13}
                className={star <= rev.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 dark:text-slate-700'}
              />
            ))}
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 italic leading-relaxed">"{rev.message}"</p>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-3 pt-2 border-t border-slate-200/60 dark:border-indigo-500/10">
            {new Date(rev.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
          </p>
        </div>
      ))}
    </div>
  );
};

export default ReviewsTab;
