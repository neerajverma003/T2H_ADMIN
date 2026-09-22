import { Loader2, CalendarDays, Ticket } from 'lucide-react';
import { getCdnUrl } from '../../../../utils/media';

const BookingsTab = ({ tab }) => {
  const { data: bookings, loading } = tab;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <Loader2 className="w-8 h-8 text-blue-600 dark:text-indigo-400 animate-spin" />
        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Loading bookings...</p>
      </div>
    );
  }

  if (!bookings || bookings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="size-16 rounded-2xl bg-blue-50 dark:bg-indigo-950/40 border border-blue-200/60 dark:border-indigo-500/30 flex items-center justify-center mb-4 text-blue-600 dark:text-indigo-400">
          <Ticket size={24} />
        </div>
        <h4 className="font-bold text-slate-800 dark:text-slate-200 text-base">No bookings yet</h4>
        <p className="text-xs text-slate-400 mt-1">This customer hasn't booked any trips.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <div
          key={booking._id}
          className="flex flex-col sm:flex-row gap-4 p-4 rounded-2xl border border-slate-200/80 dark:border-indigo-500/20 bg-slate-50/70 dark:bg-[#070d1e]/80 hover:border-indigo-500/40 transition-all shadow-sm"
        >
          <div className="w-full sm:w-36 h-28 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800 shrink-0">
            {booking.itinerary_id?.destination_thumbnails?.[0] || booking.itinerary_id?.destination_images?.[0] ? (
              <img
                src={getCdnUrl(booking.itinerary_id?.destination_thumbnails?.[0] || booking.itinerary_id?.destination_images?.[0])}
                alt="Destination"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">No Image</div>
            )}
          </div>

          <div className="flex-1 flex flex-col justify-between py-0.5">
            <div>
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-extrabold text-slate-900 dark:text-white text-base">
                  {booking.itinerary_id?.title || 'Honeymoon Package'}
                </h4>
                <span
                  className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${
                    booking.status === 'confirmed'
                      ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'
                      : booking.status === 'payment_pending'
                      ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {booking.status === 'confirmed' ? 'Confirmed' : booking.status === 'payment_pending' ? 'Pending Payment' : booking.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5 mt-2">
                <CalendarDays size={13} className="text-blue-600 dark:text-indigo-400" />
                {booking.travel_date ? new Date(booking.travel_date).toLocaleDateString('en-GB') : '—'} · {booking.adults || 0} Adults
              </p>
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-200/60 dark:border-indigo-500/10">
              <span className="text-base font-black text-blue-600 dark:text-indigo-400">
                ₹{(booking.total_price || 0).toLocaleString('en-IN')}
              </span>
              {booking.payment_type === 'token' && (
                <span className="text-[11px] font-bold text-slate-400">
                  Token paid: ₹{(booking.token_amount_paid || 0).toLocaleString('en-IN')}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BookingsTab;
