import { Loader2, HelpCircle } from 'lucide-react';

const EnquiriesTab = ({ tab }) => {
  const { data: enquiries, loading } = tab;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <Loader2 className="w-7 h-7 text-indigo-600 animate-spin" />
        <p className="text-xs text-slate-400 font-bold uppercase tracking-wide">Loading enquiries...</p>
      </div>
    );
  }

  if (!enquiries || enquiries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="size-16 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-4">
          <HelpCircle size={24} className="text-slate-300 dark:text-slate-600" />
        </div>
        <h4 className="font-bold text-slate-700 dark:text-slate-300">No enquiries submitted</h4>
        <p className="text-sm text-slate-400 mt-1">This customer hasn't submitted any enquiry forms yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {enquiries.map((enq) => (
        <div key={enq._id} className="p-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">
              {enq.itineraryTitle || enq.subject || enq.type}
            </h4>
            <span className="shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              {enq.type}
            </span>
          </div>
          {enq.message || enq.additionalDetails ? (
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{enq.message || enq.additionalDetails}</p>
          ) : null}
          <div className="flex flex-wrap gap-3 text-[11px] text-slate-500 dark:text-slate-400 font-semibold mt-2">
            {enq.phone && <span>📞 +91 {enq.phone}</span>}
            {enq.email && <span>✉️ {enq.email}</span>}
            {enq.status && <span>Status: {enq.status.replace('_', ' ')}</span>}
          </div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide mt-3">
            {new Date(enq.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
          </p>
        </div>
      ))}
    </div>
  );
};

export default EnquiriesTab;
