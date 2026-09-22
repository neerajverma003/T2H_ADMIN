import React from 'react';
import { Heart, MapPin, Calendar, ExternalLink, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const WishlistTab = ({ data, loading }) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Loading wishlist items...</p>
      </div>
    );
  }

  const wishlistItems = Array.isArray(data) ? data : [];

  if (wishlistItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200/80 dark:border-indigo-500/20 bg-slate-50/50 dark:bg-[#070d1e]/40 py-20 px-6 text-center">
        <div className="size-16 rounded-2xl bg-rose-50 dark:bg-rose-500/10 text-rose-500 border border-rose-200 dark:border-rose-500/20 flex items-center justify-center mb-4">
          <Heart size={28} />
        </div>
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No wishlist items</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-sm">This customer hasn't saved any travel itineraries or honeymoon packages to their wishlist yet.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Heart size={18} className="text-rose-500 fill-rose-500" /> Saved Wishlist
          </h3>
          <p className="text-xs font-medium text-slate-400 mt-0.5">
            {wishlistItems.length} package{wishlistItems.length !== 1 ? 's' : ''} saved by this user
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {wishlistItems.map((item) => {
          const thumbnail =
            item.destination_thumbnails?.[0] ||
            item.destination_images?.[0] ||
            'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?q=80&w=800&auto=format&fit=crop';
          const destinationName = item.selected_destination?.destination_name || 'Global';
          
          let rawPrice = null;
          if (item.pricing && typeof item.pricing === 'object') {
            rawPrice = item.pricing.discounted_price || item.pricing.standard_price;
          }
          const priceText = rawPrice ? `₹${rawPrice.toLocaleString('en-IN')}` : 'On Request';

          return (
            <div
              key={item._id}
              className="bg-slate-50/70 dark:bg-[#070d1e]/80 rounded-2xl border border-slate-200/80 dark:border-indigo-500/20 overflow-hidden shadow-sm hover:shadow-xl hover:border-indigo-500/40 transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-[16/10] overflow-hidden bg-slate-950">
                  <img
                    src={thumbnail}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                  <div className="absolute top-3 right-3 bg-rose-500 text-white p-2 rounded-xl shadow-md">
                    <Heart size={14} className="fill-white" />
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-wider">Starting From</span>
                    <span className="text-sm font-black text-white">{priceText}</span>
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base leading-snug line-clamp-2">
                    {item.title}
                  </h4>
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-bold border-t border-slate-200/60 dark:border-indigo-500/10 pt-3">
                    <span className="flex items-center gap-1">
                      <MapPin size={12} className="text-blue-600 dark:text-indigo-400" /> {destinationName}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={12} className="text-blue-600 dark:text-indigo-400" /> {item.duration || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0">
                <button
                  type="button"
                  onClick={() => navigate(`/itineraries/view/${item._id}`)}
                  className="w-full py-2.5 bg-white dark:bg-[#091126] hover:bg-gradient-to-r hover:from-blue-600 hover:to-indigo-600 hover:text-white text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-indigo-500/25 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                >
                  View Itinerary <ExternalLink size={12} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WishlistTab;
