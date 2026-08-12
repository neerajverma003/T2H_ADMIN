import { useState, useEffect } from 'react';
import { apiClient } from '../../stores/authStores';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Gift, User, Mail, ShieldAlert, CheckCircle2, AlertTriangle, XCircle, Clock, ChevronDown, ChevronUp, Maximize2, Copy, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'react-toastify';

const VerifyGiftCard = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [giftCards, setGiftCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchAllCards(page, searchQuery);
    }, 500); // 500ms debounce for search

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, page]);

  const fetchAllCards = async (currentPage, search) => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/admin/giftcard/all?page=${currentPage}&limit=${limit}&search=${encodeURIComponent(search)}`);
      if (response.data.success) {
        setGiftCards(response.data.giftCards);
        setTotalPages(response.data.pagination.totalPages);
        
        // Auto-expand logic if 1 result or exact match
        const cards = response.data.giftCards;
        const lowerQuery = search.toLowerCase();
        if (search && cards.length === 1) {
          setExpandedId(cards[0]._id);
        } else if (search) {
          const exactMatch = cards.find(c => c.public_code?.toLowerCase() === lowerQuery);
          if (exactMatch) {
            setExpandedId(exactMatch._id);
          } else {
            setExpandedId(null);
          }
        } else {
            setExpandedId(null);
        }
      } else {
        toast.error(response.data.msg || 'Failed to fetch gift cards.');
      }
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Error fetching gift cards.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setPage(1); // Reset to first page on new search
  };

  const handleStatusUpdate = async (id, currentStatus, newStatus) => {
    if (['expired', 'revoked', 'cancelled'].includes(currentStatus)) {
      toast.warning(`Card is already ${currentStatus}.`);
      return;
    }

    const confirmMsg = `Are you sure you want to mark this gift card as ${newStatus.toUpperCase()}? This action cannot be undone.`;
    if (!window.confirm(confirmMsg)) return;

    setActionLoading(true);
    try {
      const response = await apiClient.put(`/admin/giftcard/update-status/${id}`, { status: newStatus });
      if (response.data.success) {
        toast.success(`Successfully updated status to ${newStatus.toUpperCase()}.`);
        fetchAllCards(); 
      } else {
        toast.error(response.data.msg || 'Failed to update status.');
      }
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Error updating gift card status.');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    const config = {
      active: { bg: 'bg-emerald-950/80', text: 'text-emerald-400 border border-emerald-800/80', icon: <CheckCircle2 size={16} />, label: 'ACTIVE' },
      invited: { bg: 'bg-amber-950/80', text: 'text-amber-400 border border-amber-800/80', icon: <Clock size={16} />, label: 'INVITED' },
      created: { bg: 'bg-blue-950/80', text: 'text-blue-400 border border-blue-800/80', icon: <Gift size={16} />, label: 'CREATED' },
      expired: { bg: 'bg-orange-950/80', text: 'text-orange-400 border border-orange-800/80', icon: <AlertTriangle size={16} />, label: 'EXPIRED' },
      revoked: { bg: 'bg-red-950/80', text: 'text-red-400 border border-red-800/80', icon: <XCircle size={16} />, label: 'REVOKED' },
      cancelled: { bg: 'bg-red-950/80', text: 'text-red-400 border border-red-800/80', icon: <XCircle size={16} />, label: 'CANCELLED' }
    };
    return config[status] || { bg: 'bg-slate-900', text: 'text-slate-300 border border-slate-700', icon: null, label: status?.toUpperCase() };
  };

  return (
    <div className="p-4 md:p-8 w-full min-h-screen text-slate-900 dark:text-slate-100 transition-colors">
      
      {/* Search & Header Section */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 dark:bg-[#0d162b] dark:shadow-xl dark:border-[#1b2a47] p-8 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
        <div className="relative z-10">
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2 flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
                <Search size={24} />
                </div>
                Verify & Manage Gift Cards
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-2xl text-sm font-semibold">Enter an exact Gift Card Code to securely verify and manage it, or search by email to find associated cards.</p>

            <div className="relative max-w-3xl">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <Maximize2 className="text-blue-500 dark:text-blue-400" size={22} />
                </div>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearch}
                    placeholder="ENTER CARD CODE (E.G. T2H-XXXXXX) TO VIEW FULL DETAILS..."
                    className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 dark:bg-[#15233e] dark:border-[#233558] dark:text-white dark:placeholder-slate-500 rounded-2xl focus:ring-0 focus:border-blue-600 dark:focus:border-[#2563EB] dark:focus:bg-[#182745] text-lg outline-none transition-all shadow-inner font-mono font-bold uppercase tracking-wide"
                />
            </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-10 h-10 border-4 border-blue-600 dark:border-[#2563EB] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : giftCards.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 border-dashed dark:bg-[#0d162b] dark:border-[#1b2a47] p-12 text-center">
          <div className="w-20 h-20 bg-slate-100 dark:bg-[#15233e] rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
            <Search size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Matches Found</h3>
          <p className="text-slate-500 dark:text-slate-400">Double-check the code or email you entered.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {giftCards.map((card, idx) => {
            const statusConfig = getStatusConfig(card.status);
            const isExpanded = expandedId === card._id;
            
            return (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(idx * 0.05, 0.3) }}
                key={card._id}
                className={`bg-white border transition-all duration-300 overflow-hidden dark:bg-[#0d162b] ${isExpanded ? 'border-blue-500/60 shadow-xl dark:border-[#2563EB]/60 rounded-3xl' : 'border-slate-200 shadow-sm dark:border-[#1b2a47] dark:shadow-md rounded-2xl hover:border-blue-500/40 hover:shadow-lg'}`}
              >
                {/* Horizontal Compact Row */}
                <div 
                  onClick={() => setExpandedId(isExpanded ? null : card._id)}
                  className="px-6 py-4 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 cursor-pointer select-none group"
                >
                  <div className="flex items-center gap-5 w-full lg:w-auto">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${statusConfig.bg} ${statusConfig.text}`}>
                        {statusConfig.icon}
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-mono font-bold text-lg text-slate-900 dark:text-white tracking-wider flex items-center gap-2">
                              {card.public_code}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigator.clipboard.writeText(card.public_code);
                                  toast.success('Code copied to clipboard!', { position: 'top-end', autoClose: 2000, hideProgressBar: true });
                                }}
                                className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-[#15233e] rounded-lg transition-colors"
                                title="Copy Code"
                              >
                                <Copy size={16} />
                              </button>
                            </h3>
                            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest bg-blue-50 border border-blue-200 dark:bg-[#15233e] dark:border-[#233558] px-2 py-0.5 rounded">
                                {card.type}
                            </span>
                        </div>
                        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                            {card.sender_user_id ? card.sender_user_id.firstName : 'Trip to Honeymoon'} → {card.accepted_by_user_id ? card.accepted_by_user_id.firstName : (card.recipient_name || card.recipient_email || 'Unclaimed')}
                        </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between w-full lg:w-auto gap-8">
                     <div className="text-left lg:text-right">
                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-0.5">Value</p>
                        <p className="font-black text-slate-900 dark:text-white text-lg">₹{card.amount.toLocaleString('en-IN')}</p>
                     </div>
                     <div className="text-left lg:text-right hidden sm:block">
                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-0.5">Status</p>
                        <span className={`inline-block px-2.5 py-1 rounded text-xs font-bold ${statusConfig.text}`}>{statusConfig.label}</span>
                     </div>
                     <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-[#15233e] flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 dark:group-hover:bg-[#2563EB]/20 dark:group-hover:text-blue-400 transition-colors">
                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                     </div>
                  </div>
                </div>

                {/* Expanded Detailed View */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t border-slate-100 bg-slate-50/50 dark:border-[#1b2a47] dark:bg-[#0b1426]"
                    >
                        <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                            
                            {/* Financial Data */}
                            <div className="space-y-6">
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2 mb-4">
                                    <Gift size={16} className="text-blue-500 dark:text-blue-400" /> Financial Details
                                </h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white p-4 rounded-2xl border border-slate-200/80 dark:bg-[#0d162b] dark:border-[#1b2a47]">
                                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Original Value</p>
                                        <p className="text-2xl font-black text-slate-900 dark:text-white">₹{card.amount.toLocaleString('en-IN')}</p>
                                    </div>
                                    <div className="bg-white p-4 rounded-2xl border border-blue-200 dark:bg-[#0d162b] dark:border-blue-900/50">
                                        <p className="text-[10px] text-blue-600 dark:text-blue-400 uppercase font-black tracking-widest mb-1">Remaining Balance</p>
                                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">₹{card.remaining_balance.toLocaleString('en-IN')}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white p-4 rounded-2xl border border-slate-200/80 dark:bg-[#0d162b] dark:border-[#1b2a47]">
                                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Issued On</p>
                                        <p className="font-semibold text-slate-700 dark:text-slate-200 text-sm">
                                            {new Date(card.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </p>
                                    </div>
                                    <div className="bg-white p-4 rounded-2xl border border-slate-200/80 dark:bg-[#0d162b] dark:border-[#1b2a47]">
                                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Valid Until</p>
                                        <p className="font-semibold text-slate-700 dark:text-slate-200 text-sm">
                                            {new Date(card.expiry_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Entity Data */}
                            <div className="space-y-6">
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2 mb-4">
                                    <User size={16} className="text-blue-500 dark:text-blue-400" /> Entities Involved
                                </h4>
                                
                                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 dark:bg-[#0d162b] dark:border-[#1b2a47] relative">
                                    <div className="absolute top-5 right-5 text-slate-300 dark:text-slate-700"><User size={24} /></div>
                                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Purchaser / Sender</p>
                                    {card.sender_user_id ? (
                                        <div>
                                            <p className="font-bold text-slate-900 dark:text-white">{card.sender_user_id.firstName} {card.sender_user_id.lastName}</p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">{card.sender_user_id.email}</p>
                                        </div>
                                    ) : (
                                        <p className="font-bold text-slate-900 dark:text-white">Trip to Honeymoon</p>
                                    )}
                                </div>

                                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 dark:bg-[#0d162b] dark:border-[#1b2a47] relative">
                                    <div className="absolute top-5 right-5 text-slate-300 dark:text-slate-700"><Mail size={24} /></div>
                                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Recipient / Owner</p>
                                    {card.accepted_by_user_id ? (
                                        <div>
                                            <p className="font-bold text-slate-900 dark:text-white">{card.accepted_by_user_id.firstName} {card.accepted_by_user_id.lastName}</p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">{card.accepted_by_user_id.email}</p>
                                            <span className={`inline-block mt-2 px-2 py-0.5 text-[10px] font-bold uppercase rounded border ${
                                              card.status === 'redeemed' ? 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700' :
                                              card.status === 'partially_redeemed' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800' :
                                              'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800'
                                            }`}>
                                                {card.status === 'redeemed' ? 'Fully Redeemed' : 
                                                 card.status === 'partially_redeemed' ? 'Partially Redeemed' : 
                                                 'Claimed & Active'}
                                            </span>
                                        </div>
                                    ) : card.recipient_email ? (
                                        <div>
                                            <p className="font-bold text-slate-900 dark:text-white">{card.recipient_name || 'N/A'}</p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">{card.recipient_email}</p>
                                            <span className={`inline-block mt-2 px-2 py-0.5 text-[10px] font-bold uppercase rounded border ${
                                              card.status === 'redeemed' ? 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700' :
                                              card.status === 'partially_redeemed' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800' :
                                              'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800'
                                            }`}>
                                                {card.status === 'redeemed' ? 'Fully Redeemed' : 
                                                 card.status === 'partially_redeemed' ? 'Partially Redeemed' : 
                                                 'Pending Acceptance'}
                                            </span>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-slate-400 italic">Unclaimed (Self Purchase)</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Administrative Actions */}
                        {!['expired', 'revoked', 'cancelled'].includes(card.status) && (
                        <div className="px-6 md:px-8 py-5 bg-white border-t border-slate-100 dark:bg-[#0d162b] dark:border-[#1b2a47] flex flex-col sm:flex-row items-center gap-4 justify-end">
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest mr-auto hidden sm:block">Admin Controls</span>
                            <button
                                onClick={() => handleStatusUpdate(card._id, card.status, 'revoked')}
                                disabled={actionLoading}
                                className="w-full sm:w-auto px-6 py-3 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white dark:bg-red-950/40 dark:text-red-400 dark:hover:bg-red-600 dark:hover:text-white text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 border border-red-200 dark:border-red-800/80 hover:border-red-600"
                            >
                                <ShieldAlert size={18} /> Revoke Access
                            </button>
                            <button
                                onClick={() => handleStatusUpdate(card._id, card.status, 'expired')}
                                disabled={actionLoading}
                                className="w-full sm:w-auto px-6 py-3 bg-amber-50 hover:bg-amber-600 text-amber-600 hover:text-white dark:bg-amber-950/40 dark:text-amber-400 dark:hover:bg-amber-600 dark:hover:text-white text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 border border-amber-200 dark:border-amber-800/80 hover:border-amber-600"
                            >
                                <AlertTriangle size={18} /> Force Expire
                            </button>
                        </div>
                        )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-6">
              <button
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1}
                className={`px-4 py-2 rounded-xl font-bold text-sm transition-colors ${
                  page === 1
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200 dark:bg-[#15233e] dark:text-slate-600 dark:border-[#233558]'
                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
                }`}
              >
                Previous
              </button>
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={page === totalPages}
                className={`px-4 py-2 rounded-xl font-bold text-sm transition-colors ${
                  page === totalPages
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200 dark:bg-[#15233e] dark:text-slate-600 dark:border-[#233558]'
                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
                }`}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VerifyGiftCard;
