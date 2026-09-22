import { Loader2, Gift, Copy } from 'lucide-react';
import { toast } from 'react-toastify';

const GiftCardsTab = ({ tab }) => {
  const { data, loading } = tab;
  const purchased = data?.purchased || [];
  const received = data?.received || [];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <Loader2 className="w-8 h-8 text-blue-600 dark:text-indigo-400 animate-spin" />
        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Loading gift cards...</p>
      </div>
    );
  }

  if (purchased.length === 0 && received.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="size-16 rounded-2xl bg-blue-50 dark:bg-indigo-950/40 border border-blue-200/60 dark:border-indigo-500/30 flex items-center justify-center mb-4 text-blue-600 dark:text-indigo-400">
          <Gift size={24} />
        </div>
        <h4 className="font-bold text-slate-800 dark:text-slate-200 text-base">No gift cards</h4>
        <p className="text-xs text-slate-400 mt-1">This customer hasn't bought or received any gift cards.</p>
      </div>
    );
  }

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success('Code copied to clipboard');
  };

  const Card = ({ card }) => (
    <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-200/80 dark:border-indigo-500/20 bg-slate-50/70 dark:bg-[#070d1e]/80 shadow-sm hover:border-indigo-500/40 transition-all">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <p className="font-mono font-bold text-slate-900 dark:text-white text-sm sm:text-base">{card.public_code}</p>
          <button onClick={() => copyCode(card.public_code)} className="text-slate-400 hover:text-blue-600 dark:hover:text-indigo-400 p-1 rounded-md transition-colors cursor-pointer" title="Copy code">
            <Copy size={13} />
          </button>
          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-blue-50 dark:bg-indigo-950/60 text-blue-600 dark:text-indigo-400 border border-blue-200 dark:border-indigo-500/30">
            {card.status}
          </span>
        </div>
        <p className="text-[11px] text-slate-400 font-semibold">
          Expires {new Date(card.expiry_date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
        </p>
      </div>
      <p className="font-black text-slate-900 dark:text-white text-base">₹{(card.remaining_balance || 0).toLocaleString('en-IN')}</p>
    </div>
  );

  return (
    <div className="space-y-8">
      {purchased.length > 0 && (
        <div>
          <h4 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider mb-3">Gift Cards Purchased</h4>
          <div className="space-y-3">
            {purchased.map((card) => (
              <Card key={card._id} card={card} />
            ))}
          </div>
        </div>
      )}
      {received.length > 0 && (
        <div>
          <h4 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider mb-3">Gift Cards Received</h4>
          <div className="space-y-3">
            {received.map((card) => (
              <Card key={card._id} card={card} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GiftCardsTab;
