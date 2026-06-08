import { useState, useEffect } from 'react';
import { apiClient } from '../../stores/authStores';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Gift, User, Mail, ShieldAlert, CheckCircle2, AlertTriangle, XCircle, Clock, ChevronDown, ChevronUp, Maximize2, Copy } from 'lucide-react';
import { toast } from 'react-toastify';

const VerifyGiftCard = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [giftCards, setGiftCards] = useState([]);
  const [filteredCards, setFilteredCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetchAllCards();
  }, []);

  const fetchAllCards = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/admin/giftcard/all`);
      if (response.data.success) {
        setGiftCards(response.data.giftCards);
        setFilteredCards(response.data.giftCards);
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
    const query = e.target.value;
    setSearchQuery(query);
    
    if (!query) {
      setFilteredCards(giftCards);
      setExpandedId(null);
      return;
    }
    
    const lowerQuery = query.toLowerCase();
    const filtered = giftCards.filter(card => 
      card.public_code?.toLowerCase().includes(lowerQuery) ||
      card.sender_user_id?.email?.toLowerCase().includes(lowerQuery) ||
      card.recipient_email?.toLowerCase().includes(lowerQuery)
    );
    
    setFilteredCards(filtered);

    // Auto-expand if exact code match or only 1 result
    if (filtered.length === 1) {
      setExpandedId(filtered[0]._id);
    } else {
      const exactMatch = filtered.find(c => c.public_code?.toLowerCase() === lowerQuery);
      if (exactMatch) {
        setExpandedId(exactMatch._id);
      } else {
        setExpandedId(null);
      }
    }
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
      active: { bg: 'bg-emerald-500/10', text: 'text-emerald-700', icon: <CheckCircle2 size={16} />, label: 'ACTIVE' },
      invited: { bg: 'bg-amber-500/10', text: 'text-amber-700', icon: <Clock size={16} />, label: 'INVITED' },
      created: { bg: 'bg-blue-500/10', text: 'text-blue-700', icon: <Gift size={16} />, label: 'CREATED' },
      expired: { bg: 'bg-orange-500/10', text: 'text-orange-700', icon: <AlertTriangle size={16} />, label: 'EXPIRED' },
      revoked: { bg: 'bg-red-500/10', text: 'text-red-700', icon: <XCircle size={16} />, label: 'REVOKED' },
      cancelled: { bg: 'bg-red-500/10', text: 'text-red-700', icon: <XCircle size={16} />, label: 'CANCELLED' }
    };
    return config[status] || { bg: 'bg-gray-100', text: 'text-gray-700', icon: null, label: status?.toUpperCase() };
  };

  return (
    <div className="p-4 md:p-8 w-full min-h-screen">
      
      {/* Search & Header Section */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
        <div className="relative z-10">
            <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2 flex items-center gap-3">
                <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
                <Search size={24} />
                </div>
                Verify & Manage Gift Cards
            </h1>
            <p className="text-gray-500 mb-8 max-w-2xl">Enter an exact Gift Card Code to securely verify and manage it, or search by email to find associated cards.</p>

            <div className="relative max-w-3xl">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <Maximize2 className="text-indigo-400" size={22} />
                </div>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearch}
                    placeholder="Enter Card Code (e.g. T2H-XXXXXX) to view full details..."
                    className="w-full pl-14 pr-6 py-5 bg-gray-50/50 border-2 border-gray-200 rounded-2xl focus:ring-0 focus:border-indigo-600 focus:bg-white text-lg outline-none transition-all shadow-inner font-mono font-bold text-gray-800 placeholder-gray-400 uppercase"
                />
            </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredCards.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-200 border-dashed p-12 text-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
            <Search size={32} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Matches Found</h3>
          <p className="text-gray-500">Double-check the code or email you entered.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredCards.map((card, idx) => {
            const statusConfig = getStatusConfig(card.status);
            const isExpanded = expandedId === card._id;
            
            return (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(idx * 0.05, 0.3) }}
                key={card._id}
                className={`bg-white border transition-all duration-300 overflow-hidden ${isExpanded ? 'border-indigo-200 shadow-xl rounded-3xl' : 'border-gray-200 shadow-sm rounded-2xl hover:border-indigo-300 hover:shadow-md'}`}
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
                            <h3 className="font-mono font-bold text-lg text-gray-900 tracking-wider flex items-center gap-2">
                              {card.public_code}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigator.clipboard.writeText(card.public_code);
                                  toast.success('Code copied to clipboard!', { position: 'top-end', autoClose: 2000, hideProgressBar: true });
                                }}
                                className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                title="Copy Code"
                              >
                                <Copy size={16} />
                              </button>
                            </h3>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-100 px-2 py-0.5 rounded">
                                {card.type}
                            </span>
                        </div>
                        <p className="text-sm font-semibold text-gray-500">
                            {card.sender_user_id ? card.sender_user_id.firstName : 'Trip to Honeymoon'} → {card.accepted_by_user_id ? card.accepted_by_user_id.firstName : (card.recipient_name || 'Unclaimed')}
                        </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between w-full lg:w-auto gap-8">
                     <div className="text-left lg:text-right">
                        <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-0.5">Value</p>
                        <p className="font-black text-gray-900">₹{card.amount.toLocaleString('en-IN')}</p>
                     </div>
                     <div className="text-left lg:text-right hidden sm:block">
                        <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-0.5">Status</p>
                        <p className={`text-sm font-bold ${statusConfig.text}`}>{statusConfig.label}</p>
                     </div>
                     <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
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
                      className="border-t border-gray-100 bg-gray-50/30"
                    >
                        <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                            
                            {/* Financial Data */}
                            <div className="space-y-6">
                                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-widest flex items-center gap-2 mb-4">
                                    <Gift size={16} className="text-indigo-500" /> Financial Details
                                </h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
                                        <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1">Original Value</p>
                                        <p className="text-2xl font-black text-gray-900">₹{card.amount.toLocaleString('en-IN')}</p>
                                    </div>
                                    <div className="bg-white p-4 rounded-2xl border border-indigo-100 shadow-sm shadow-indigo-50">
                                        <p className="text-[10px] text-indigo-400 uppercase font-black tracking-widest mb-1">Remaining Balance</p>
                                        <p className="text-2xl font-bold text-indigo-700">₹{card.remaining_balance.toLocaleString('en-IN')}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
                                        <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1">Issued On</p>
                                        <p className="font-semibold text-gray-700 text-sm">
                                            {new Date(card.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </p>
                                    </div>
                                    <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
                                        <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1">Valid Until</p>
                                        <p className="font-semibold text-gray-700 text-sm">
                                            {new Date(card.expiry_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Entity Data */}
                            <div className="space-y-6">
                                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-widest flex items-center gap-2 mb-4">
                                    <User size={16} className="text-indigo-500" /> Entities Involved
                                </h4>
                                
                                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm relative">
                                    <div className="absolute top-5 right-5 text-gray-200"><User size={24} /></div>
                                    <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1">Purchaser / Sender</p>
                                    {card.sender_user_id ? (
                                        <div>
                                            <p className="font-bold text-gray-900">{card.sender_user_id.firstName} {card.sender_user_id.lastName}</p>
                                            <p className="text-sm text-gray-500">{card.sender_user_id.email}</p>
                                        </div>
                                    ) : (
                                        <p className="font-bold text-gray-900">Trip to Honeymoon</p>
                                    )}
                                </div>

                                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm relative">
                                    <div className="absolute top-5 right-5 text-gray-200"><Mail size={24} /></div>
                                    <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1">Recipient / Owner</p>
                                    {card.accepted_by_user_id ? (
                                        <div>
                                            <p className="font-bold text-gray-900">{card.accepted_by_user_id.firstName} {card.accepted_by_user_id.lastName}</p>
                                            <p className="text-sm text-gray-500">{card.accepted_by_user_id.email}</p>
                                            <span className="inline-block mt-2 px-2 py-0.5 bg-green-50 text-green-700 text-[10px] font-bold uppercase rounded border border-green-200">Claimed & Active</span>
                                        </div>
                                    ) : card.recipient_email ? (
                                        <div>
                                            <p className="font-bold text-gray-900">{card.recipient_name || 'N/A'}</p>
                                            <p className="text-sm text-gray-500">{card.recipient_email}</p>
                                            <span className="inline-block mt-2 px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-bold uppercase rounded border border-amber-200">Pending Acceptance</span>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-400 italic">Unclaimed (Self Purchase)</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Administrative Actions */}
                        {!['expired', 'revoked', 'cancelled'].includes(card.status) && (
                        <div className="px-6 md:px-8 py-5 bg-white border-t border-gray-100 flex flex-col sm:flex-row items-center gap-4 justify-end">
                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest mr-auto hidden sm:block">Admin Controls</span>
                            <button
                                onClick={() => handleStatusUpdate(card._id, card.status, 'revoked')}
                                disabled={actionLoading}
                                className="w-full sm:w-auto px-6 py-3 bg-red-50 hover:bg-red-600 hover:text-white text-red-600 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 border border-red-200 hover:border-red-600"
                            >
                                <ShieldAlert size={18} /> Revoke Access
                            </button>
                            <button
                                onClick={() => handleStatusUpdate(card._id, card.status, 'expired')}
                                disabled={actionLoading}
                                className="w-full sm:w-auto px-6 py-3 bg-orange-50 hover:bg-orange-500 hover:text-white text-orange-600 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 border border-orange-200 hover:border-orange-500"
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
        </div>
      )}
    </div>
  );
};

export default VerifyGiftCard;
