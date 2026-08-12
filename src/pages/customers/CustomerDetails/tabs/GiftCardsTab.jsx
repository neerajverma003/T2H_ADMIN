import { Loader2, Gift, Copy } from 'lucide-react';
import { toast } from 'react-toastify';

const GiftCardsTab = ({ tab }) => {
  const { data, loading } = tab;
  const purchased = data?.purchased || [];
  const received = data?.received || [];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <Loader2 className="w-7 h-7 text-indigo-600 animate-spin" />
        <p className="text-xs text-slate-400 font-bold uppercase tracking-wide">Loading gift cards...</p>
      </div>
    );
  }

  if (purchased.length === 0 && received.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="size-16 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-4">
          <Gift size={24} className="text-slate-300 dark:text-slate-600" />
        </div>
        <h4 className="font-bold text-slate-700 dark:text-slate-300">No gift cards</h4>
        <p className="text-sm text-slate-400 mt-1">This customer hasn't bought or received any gift cards.</p>
      </div>
    );
  }

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success('Code copied to clipboard');
  };

  const Card = ({ card }) => (
    <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <p className="font-mono font-bold text-slate-900 dark:text-white text-sm">{card.public_code}</p>
          <button onClick={() => copyCode(card.public_code)} className="text-slate-400 hover:text-indigo-600">
            <Copy size={12} />
          </button>
          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            {card.status}
          </span>
        </div>
        <p className="text-[10px] text-slate-400 font-semibold">
          Expires {new Date(card.expiry_date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
        </p>
      </div>
      <p className="font-black text-slate-900 dark:text-white">₹{(card.remaining_balance || 0).toLocaleString('en-IN')}</p>
    </div>
  );

  return (
    <div className="space-y-8">
      {purchased.length > 0 && (
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Gift Cards Purchased</h4>
          <div className="space-y-3">
            {purchased.map((card) => (
              <Card key={card._id} card={card} />
            ))}
          </div>
        </div>
      )}
      {received.length > 0 && (
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Gift Cards Received</h4>
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
