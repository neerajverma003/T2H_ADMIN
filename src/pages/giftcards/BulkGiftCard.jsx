/**
 * @file BulkGiftCard.jsx
 * @description Premium Admin UI for issuing bulk gift cards and tracking campaigns in real-time.
 * Supports targeting all registered users or pasting a custom list of email addresses.
 * Includes live percentage progress bar widgets, polling, and failure audits.
 * Fully integrates Generation History dispatch logs with ALL/REGISTERED/CUSTOM filters.
 */

import { useState, useEffect, useRef, Fragment } from 'react';
import { apiClient } from '../../stores/authStores';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Gift, Users, Mail, Play, AlertCircle, CheckCircle2,
  Clock, RefreshCw, ChevronRight, Copy, Info, AlertTriangle, List,
  Eye, Check, Trash, User, Send, X
} from 'lucide-react';
import { toast } from 'react-toastify';
import GiftCardBg from '../../assets/GiftCard2.png';

const BulkGiftCard = () => {
  // --- Form States ---
  const [campaignName, setCampaignName] = useState('');
  const [recipientType, setRecipientType] = useState('registered'); // 'registered' | 'custom' | 'manage'
  const [giftAmount, setGiftAmount] = useState('500');
  const [customMessage, setCustomMessage] = useState('Congratulations! Here is a special travel voucher from Trip to Honeymoon.');
  const [expiryDays, setExpiryDays] = useState('365');
  const [rawEmails, setRawEmails] = useState('');

  // --- Validation / Parser States ---
  const [parsedEmails, setParsedEmails] = useState([]);
  const [registeredUserCount, setRegisteredUserCount] = useState(null);
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [selectedUserEmails, setSelectedUserEmails] = useState([]);

  // --- Campaign History & Live Polling ---
  const [campaigns, setCampaigns] = useState([]);
  const [activeBatchId, setActiveBatchId] = useState(null);
  const [activeBatch, setActiveBatch] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // --- Verify & Manage States ---
  const [searchQuery, setSearchQuery] = useState('');
  const [giftCards, setGiftCards] = useState([]);
  const [filteredCards, setFilteredCards] = useState([]);
  const [verifyLoading, setVerifyLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [selectedDetailCard, setSelectedDetailCard] = useState(null);

  // --- Pill Filters for Generation History ---
  const [dispatchFilter, setDispatchFilter] = useState('ALL'); // 'ALL' | 'REGISTERED' | 'CUSTOM'

  const pollingIntervalRef = useRef(null);

  // Load history and registered user stats on mount
  useEffect(() => {
    fetchHistory();
    fetchRegisteredUserStats();
    fetchAllCards(); // Preload all gift cards so they are ready immediately
    return () => stopPolling();
  }, []);

  // Poll active batch progress if activeBatchId changes
  useEffect(() => {
    if (activeBatchId) {
      startPolling(activeBatchId);
    } else {
      stopPolling();
    }
  }, [activeBatchId]);

  // Parse emails dynamically as the admin types
  useEffect(() => {
    if (recipientType === 'custom') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const splitList = rawEmails.split(/[\s,\n]+/);
      const uniqueValid = new Set();

      for (const item of splitList) {
        const clean = item.trim().toLowerCase();
        if (emailRegex.test(clean)) {
          uniqueValid.add(clean);
        }
      }
      setParsedEmails(Array.from(uniqueValid));
    } else {
      setParsedEmails([]);
    }
  }, [rawEmails, recipientType]);

  // Load verify cards when manage tab is selected
  useEffect(() => {
    if (recipientType === 'manage') {
      fetchAllCards();
    }
  }, [recipientType]);

  // --- API Calls ---

  const fetchRegisteredUserStats = async () => {
    try {
      const response = await apiClient.get('/admin/giftcard/users-count');
      if (response.data && response.data.success) {
        setRegisteredUserCount(response.data.count);
        setRegisteredUsers(response.data.users || []);
        // By default, select all registered users
        setSelectedUserEmails((response.data.users || []).map(u => u.email));
      }
    } catch (err) {
      console.error('Failed to fetch precise user counts:', err);
      const errMsg = err.response?.data?.msg || err.response?.data?.message || err.message;
      toast.error(`User Count Error: ${errMsg}`);
      setRegisteredUserCount(0);
      setRegisteredUsers([]);
    }
  };

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const response = await apiClient.get('/admin/giftcard/batch/all');
      if (response.data.success) {
        setCampaigns(response.data.campaigns);

        // Auto-select first in-progress batch for dynamic UX polling
        const runningBatch = response.data.campaigns.find(
          c => c.status === 'processing' || c.status === 'pending'
        );
        if (runningBatch) {
          setActiveBatchId(runningBatch._id);
        }
      }
    } catch (err) {
      toast.error('Failed to load campaign logs.');
    } finally {
      setLoadingHistory(false);
    }
  };

  const fetchAllCards = async () => {
    setVerifyLoading(true);
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
      setVerifyLoading(false);
    }
  };

  const startPolling = (batchId) => {
    stopPolling();
    fetchBatchProgress(batchId);

    pollingIntervalRef.current = setInterval(() => {
      fetchBatchProgress(batchId);
    }, 2000);
  };

  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

  const fetchBatchProgress = async (batchId) => {
    try {
      const response = await apiClient.get(`/admin/giftcard/batch/${batchId}`);
      if (response.data.success) {
        const batch = response.data.batch;
        setActiveBatch(batch);
        setCampaigns(prev => prev.map(c => c._id === batch._id ? batch : c));

        if (batch.status === 'completed' || batch.status === 'failed') {
          stopPolling();
          toast.success(`Campaign "${batch.campaign_name}" completed!`);
          fetchHistory();
          fetchAllCards(); // Refresh lists to show final cards!
        }
      }
    } catch (err) {
      stopPolling();
      console.error('Progress polling failure:', err);
    }
  };

  const handleSubmit = async (e) => {
    console.log("Submit");
    if (e && e.preventDefault) e.preventDefault();
    console.log("befire");
    // if (!campaignName.trim()) {
    //   console.log("inside")
    //   return toast.warning('Please enter a Campaign Name');
    // }

    const isRegisteredMode = recipientType === 'registered';
    const targetEmails = isRegisteredMode ? selectedUserEmails : parsedEmails;

    if (targetEmails.length === 0) {
      return toast.warning(isRegisteredMode
        ? 'Please select at least one registered user from the directory'
        : 'Please enter at least one valid recipient email'
      );
    }

    const confirmMsg = `Are you sure you want to issue a ₹${giftAmount} voucher to ${targetEmails.length} recipients?`;
    if (!window.confirm(confirmMsg)) return;

    setSubmitting(true);
    try {
      const payload = {
        campaign_name: campaignName.trim() || `Bulk_${isRegisteredMode ? 'Reg' : 'Custom'}_${new Date().getTime().toString().slice(-6)}`,
        recipient_type: isRegisteredMode ? 'registered' : 'custom',
        gift_card_amount: Number(giftAmount),
        message: customMessage,
        expiry_days: Number(expiryDays),
        emails: targetEmails
      };

      const response = await apiClient.post('/admin/giftcard/bulk-issue', payload);
      console.log("after");
      if (response.data.success) {
        toast.success(response.data.msg);
        
        // Explicit popup for confirmation as requested
        window.alert(`✅ Success! Gift cards have been queued and are being sent to ${targetEmails.length} recipients.\n\nCampaign Name: ${payload.campaign_name}`);

        // Reset inputs completely
        setCampaignName('');
        setRawEmails('');
        setParsedEmails([]);
        setSelectedUserEmails([]); // Important: Clear the selected registered users!

        // Focus polling on new batch
        const newBatchId = response.data.batch._id;
        setActiveBatchId(newBatchId);
        fetchHistory();
      }
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Error launching campaign.');
    } finally {
      setSubmitting(false);
    }
  };

  // --- Verify & Manage Event Handlers ---

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
      card.recipient_email?.toLowerCase().includes(lowerQuery) ||
      card.sender_user_id?.name?.toLowerCase().includes(lowerQuery) ||
      card.accepted_by_user_id?.name?.toLowerCase().includes(lowerQuery)
    );

    setFilteredCards(filtered);

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
        if (selectedDetailCard && selectedDetailCard._id === id) {
          setSelectedDetailCard(prev => ({ ...prev, status: newStatus }));
        }
      } else {
        toast.error(response.data.msg || 'Failed to update status.');
      }
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Error updating gift card status.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCard = async (id) => {
    if (!window.confirm("Are you sure you want to delete this dispatch record from dashboard logs?")) return;
    try {
      // Soft-delete from local UI state for clean list management
      setGiftCards(prev => prev.filter(c => c._id !== id));
      setFilteredCards(prev => prev.filter(c => c._id !== id));
      toast.success("Dispatch record removed from logs successfully.");
    } catch (e) {
      toast.error("Failed to delete record.");
    }
  };

  const getStatusConfig = (status) => {
    const config = {
      active: { bg: 'bg-emerald-500/10', text: 'text-emerald-700 border-emerald-250', icon: <CheckCircle2 size={18} />, label: 'ACTIVE' },
      invited: { bg: 'bg-amber-500/10', text: 'text-amber-700 border-amber-200', icon: <Clock size={18} />, label: 'INVITED' },
      created: { bg: 'bg-blue-500/10', text: 'text-blue-700 border-blue-200', icon: <Gift size={18} />, label: 'CREATED' },
      expired: { bg: 'bg-orange-500/10', text: 'text-orange-700 border-orange-200', icon: <AlertTriangle size={18} />, label: 'EXPIRED' },
      revoked: { bg: 'bg-red-500/10', text: 'text-red-700 border-red-200', icon: <AlertCircle size={18} />, label: 'REVOKED' },
      cancelled: { bg: 'bg-red-500/10', text: 'text-red-700 border-red-200', icon: <AlertCircle size={18} />, label: 'CANCELLED' }
    };
    return config[status] || { bg: 'bg-gray-100', text: 'text-gray-700 border-gray-200', icon: null, label: status?.toUpperCase() };
  };

  // --- Dynamic Selection Helpers ---
  const handleSelectAllUsers = () => {
    if (selectedUserEmails.length === registeredUsers.length) {
      setSelectedUserEmails([]);
    } else {
      setSelectedUserEmails(registeredUsers.map(u => u.email));
    }
  };

  const handleToggleUserEmail = (email) => {
    setSelectedUserEmails(prev =>
      prev.includes(email)
        ? prev.filter(e => e !== email)
        : [...prev, email]
    );
  };

  // --- UX Helpers ---
  const getProgressPercentage = (batch) => {
    if (!batch || batch.total_records === 0) return 0;
    return Math.min(
      Math.round((batch.processed_records / batch.total_records) * 100),
      100
    );
  };

  const getBatchStatusBadge = (status) => {
    const config = {
      completed: 'bg-emerald-500/10 text-emerald-700 border-emerald-250',
      processing: 'bg-indigo-500/10 text-indigo-700 border-indigo-200 animate-pulse',
      pending: 'bg-amber-500/10 text-amber-700 border-amber-200',
      failed: 'bg-red-500/10 text-red-700 border-red-200'
    };
    return config[status] || 'bg-gray-100 text-gray-700';
  };

  // Safe username resolver
  const resolveUserName = (user) => {
    if (!user) return 'System';
    return user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Community Member';
  };

  // Dynamic card type resolver based on parent campaign's method
  const resolveCardType = (card) => {
    if (!card) return 'custom';

    const cardEmail = (card.recipient_email || '').toLowerCase();

    // Find campaigns that targeted this email
    const matchingCampaigns = campaigns.filter(batch =>
      (batch.emails_list || []).some(e => (e || '').toLowerCase() === cardEmail)
    );

    if (matchingCampaigns.length > 0) {
      // Find the closest campaign in time to the card's creation to be fully accurate
      const cardTimeStr = card.created_at || card.createdAt;
      if (cardTimeStr) {
        const cardTime = new Date(cardTimeStr).getTime();
        const closestCampaign = matchingCampaigns.reduce((closest, current) => {
          const closestTime = new Date(closest.created_at || closest.createdAt).getTime();
          const currentTime = new Date(current.created_at || current.createdAt).getTime();
          return Math.abs(currentTime - cardTime) < Math.abs(closestTime - cardTime) ? current : closest;
        });

        if (closestCampaign && closestCampaign.recipient_type) {
           return closestCampaign.recipient_type.toLowerCase();
        }
      } else {
         // If no date on card, just use the first matched campaign
         if (matchingCampaigns[0].recipient_type) {
            return matchingCampaigns[0].recipient_type.toLowerCase();
         }
      }
    }

    // Fallback if no campaign matched (edge case)
    const isRegistered = registeredUsers.some(
      u => (u.email || '').toLowerCase() === cardEmail
    );
    return isRegistered ? 'registered' : 'custom';
  };

  // Helper to resolve card code for a campaign recipient
  const getCardForEmail = (campaign, email) => {
    if (!campaign || !email) return null;
    const campaignTime = new Date(campaign.created_at || campaign.createdAt).getTime();
    
    // Find all gift cards matching the recipient email
    const matches = giftCards.filter(c => 
      c.recipient_email?.toLowerCase() === email.toLowerCase() &&
      c.type === 'gift'
    );
    
    if (matches.length === 0) return null;
    
    // Return the card created closest to the campaign timestamp
    return matches.reduce((closest, current) => {
      const closestTime = new Date(closest.created_at || closest.createdAt).getTime();
      const currentTime = new Date(current.created_at || current.createdAt).getTime();
      const closestDiff = Math.abs(closestTime - campaignTime);
      const currentDiff = Math.abs(currentTime - campaignTime);
      return currentDiff < closestDiff ? current : closest;
    });
  };

  // Filter dynamic dispatch list
  const filteredDispatchCards = giftCards.filter(card => {
    if (card.type === 'self') return false; // Exclude user self-purchases from bulk campaign list

    // Strictly filter: recipient_email must be targeted in at least one bulk campaign batch
    const isBulkCard = campaigns.some(batch =>
      batch.emails_list?.some(e => e.toLowerCase() === card.recipient_email?.toLowerCase())
    );
    if (!isBulkCard) return false;

    const cardType = resolveCardType(card);
    if (dispatchFilter === 'ALL') return true;
    if (dispatchFilter === 'REGISTERED') return cardType === 'registered';
    if (dispatchFilter === 'CUSTOM') return cardType === 'custom';
    return true;
  });

  return (
    <div className="p-4 md:p-8 w-full min-h-screen text-slate-800 dark:text-slate-100">

      {/* Dynamic Header Panel */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 mb-8 relative overflow-hidden flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
        <div className="relative z-10">
          <span className="text-xs font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1.5 rounded-md">PREMIUM REWARDS</span>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mt-2 mb-2">
            Bulk <span className="text-indigo-600">Gift</span> Generation
          </h1>
          <p className="text-slate-500 max-w-2xl text-sm font-semibold">
            Select multiple users to reward them with travel experience vouchers. Vouchers will be queued and sent via email with individual gift codes.
          </p>
        </div>

        {recipientType !== 'manage' && (
          <div className="relative z-10 shrink-0 flex items-center gap-4 bg-slate-50 border border-slate-100 p-4 rounded-2xl">
            <div className="text-center px-4">
              <span className="block text-3xl font-black text-slate-950">
                {recipientType === 'registered' ? selectedUserEmails.length : parsedEmails.length}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Recipients</span>
            </div>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-6 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm rounded-xl shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play size={16} className="fill-current" />
              {submitting ? 'Sending...' : 'Send Gift Cards'}
            </button>
          </div>
        )}

        {recipientType === 'manage' && (
          <div className="relative z-10 shrink-0 flex items-center gap-4 bg-slate-50 border border-slate-100 p-4 rounded-2xl">
            <div className="text-center px-4">
              <span className="block text-3xl font-black text-slate-950">
                {giftCards.length}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Cards</span>
            </div>
          </div>
        )}
      </div>

      {/* Premium Toggle Hub */}
      <div className="flex justify-center mb-8">
        <div className="bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/50 flex gap-1 shadow-sm">
          <button
            onClick={() => {
              setRecipientType('registered');
              setSearchQuery('');
            }}
            className={`px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${recipientType === 'registered'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
          >
            <Users size={16} />
            Registered Users
          </button>

          <button
            onClick={() => {
              setRecipientType('custom');
              setSearchQuery('');
            }}
            className={`px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${recipientType === 'custom'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
          >
            <Mail size={16} />
            Custom Email List
          </button>

          <button
            onClick={() => {
              setRecipientType('manage');
              setSearchQuery('');
            }}
            className={`px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${recipientType === 'manage'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
          >
            <List size={16} />
            Verify & Manage
          </button>
        </div>
      </div>

      {/* Active Panel Layout */}
      <div className="grid grid-cols-1 gap-8">

        {recipientType !== 'manage' && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
            {/* LEFT COLUMN: Gift Settings */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                  <Gift className="text-indigo-600" size={20} /> Gift Settings
                </h3>
                <div className="space-y-6">
                  {/* Campaign Name */}
                  <div className="space-y-2">
                    <label className="block text-xs font-extrabold text-slate-400 uppercase tracking-widest">Campaign Name</label>
                    <input
                      type="text"
                      required
                      value={campaignName}
                      onChange={(e) => setCampaignName(e.target.value)}
                      placeholder="e.g. Summer Promo 2026"
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200/70 rounded-2xl focus:border-indigo-600 focus:bg-white outline-none transition-all font-bold text-slate-900 text-base shadow-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Amount */}
                    <div className="space-y-2">
                      <label className="block text-xs font-extrabold text-slate-400 uppercase tracking-widest">Amount (₹)</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-4 flex items-center font-bold text-slate-450 text-base">₹</span>
                        <input
                          type="number"
                          required
                          min={100}
                          value={giftAmount}
                          onChange={(e) => setGiftAmount(e.target.value)}
                          className="w-full pl-8 pr-5 py-3.5 bg-slate-50 border border-slate-200/70 rounded-2xl focus:border-indigo-600 focus:bg-white outline-none transition-all font-bold text-slate-900 text-base shadow-sm"
                        />
                      </div>
                    </div>

                    {/* Expiry Date/Days */}
                    <div className="space-y-2">
                      <label className="block text-xs font-extrabold text-slate-400 uppercase tracking-widest">Validity Duration (Days)</label>
                      <input
                        type="number"
                        required
                        min={1}
                        value={expiryDays}
                        onChange={(e) => setExpiryDays(e.target.value)}
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200/70 rounded-2xl focus:border-indigo-600 focus:bg-white outline-none transition-all font-bold text-slate-900 text-base shadow-sm"
                      />
                    </div>
                  </div>

                  {/* Personal Message */}
                  <div className="space-y-2">
                    <label className="block text-xs font-extrabold text-slate-400 uppercase tracking-widest">Personal Message</label>
                    <textarea
                      rows={3}
                      required
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      className="w-full p-5 bg-slate-50 border border-slate-200/70 rounded-2xl focus:border-indigo-600 focus:bg-white outline-none transition-all font-semibold text-slate-700 text-sm md:text-base shadow-sm"
                    ></textarea>
                  </div>

                  {/* Preset Chips */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {['250', '500', '1000', '2500', '5000'].map(preset => (
                      <button
                        type="button"
                        key={preset}
                        onClick={() => setGiftAmount(preset)}
                        className={`px-4 py-2 text-xs font-black rounded-xl border transition-all ${giftAmount === preset
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow'
                          : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                          }`}
                      >
                        ₹{Number(preset).toLocaleString('en-IN')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {recipientType === 'custom' && (
                <div className="space-y-3 pt-6 border-t border-slate-100 mt-6">
                  <label className="block text-xs font-extrabold text-slate-400 uppercase tracking-widest">Pasted Recipients</label>
                  <textarea
                    rows={3}
                    value={rawEmails}
                    onChange={(e) => setRawEmails(e.target.value)}
                    placeholder="Enter emails comma-separated or one per line (e.g. user@gmail.com, hello@domain.com)"
                    className="w-full p-5 bg-slate-50 border border-slate-200/70 rounded-2xl focus:border-indigo-600 focus:bg-white outline-none transition-all font-mono text-sm font-semibold shadow-sm"
                  ></textarea>
                  <div className="flex justify-between items-center text-xs md:text-sm font-bold px-2">
                    <span className="text-slate-400">Unique valid emails extracted:</span>
                    <span className={`px-2.5 py-0.5 rounded font-black ${parsedEmails.length > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                      {parsedEmails.length} Valid Recipient{parsedEmails.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: Voucher Visual Preview */}
            <div className="bg-slate-50/50 rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8 flex flex-col justify-start relative overflow-hidden sticky top-24">
              <div className="relative z-10 w-full">
                <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                  <List className="text-indigo-600" size={20} /> Voucher Visual Preview (Email Format)
                </h3>

                {/* Exact CSS Replica of the Backend Canvas Generation */}
                <div className="w-full flex justify-center items-center py-4">
                  <div className="relative w-full max-w-[600px] aspect-[1672/941] rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(111,17,35,0.15)] border border-slate-200/60 ring-4 ring-white" style={{ containerType: 'inline-size' }}>
                    <img src={GiftCardBg} className="absolute inset-0 w-full h-full object-cover" alt="Gift Card Template" />
                    
                    {/* Amount */}
                    <div 
                      className="absolute top-[46.7%] left-[50%] -translate-x-1/2 -translate-y-1/2 text-[#6F1123] font-bold tracking-tight drop-shadow-sm" 
                      style={{ fontSize: '10.5cqi', fontFamily: 'Georgia, "Times New Roman", serif' }}
                    >
                      ₹{Number(giftAmount).toLocaleString('en-IN')}
                    </div>

                    {/* Voucher Code */}
                    <div 
                      className="absolute top-[93%] left-[13.4%] -translate-y-1/2 text-white font-bold tracking-[0.15em] drop-shadow-sm" 
                      style={{ fontSize: '2.2cqi', fontFamily: 'Arial, sans-serif' }}
                    >
                      T2H-XXXXXX
                    </div>

                    {/* Valid Till */}
                    <div 
                      className="absolute top-[93%] left-[57%] -translate-y-1/2 text-white font-bold uppercase tracking-[0.05em] drop-shadow-sm" 
                      style={{ fontSize: '2.2cqi', fontFamily: 'Arial, sans-serif' }}
                    >
                      {new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase().replace(/,/g, '')}
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-slate-400 text-xs font-semibold text-center mt-8">
                * Dynamic values overlay on the official Trip to Honeymoon travel voucher.
              </div>
            </div>
          </div>
        )}

        {/* BOTTOM FULL-WIDTH SECTIONS DEPENDING ON TOGGLES */}

        {recipientType === 'registered' && (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <Users className="text-indigo-600" size={20} /> Customer Registry Selection
                </h3>
                <p className="text-slate-400 text-sm font-semibold mt-1">Search, select and manage individual registered users from active database records.</p>
              </div>
              <div className="relative w-full md:w-80">
                <input
                  type="text"
                  placeholder="Search registered users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-5 pr-5 py-3 bg-slate-50 border border-slate-200/70 rounded-2xl text-sm font-semibold focus:border-indigo-600 focus:bg-white outline-none transition-all shadow-sm"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-xs font-black text-slate-400 uppercase tracking-widest">
                    <th className="py-4 px-4 w-12">
                      <input
                        type="checkbox"
                        checked={selectedUserEmails.length === registeredUsers.length && registeredUsers.length > 0}
                        onChange={handleSelectAllUsers}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-5 h-5 cursor-pointer"
                      />
                    </th>
                    <th className="py-4 px-4">User Details</th>
                    <th className="py-4 px-4">Email Address</th>
                    <th className="py-4 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {registeredUsers
                    .filter(u => {
                      const query = searchQuery.toLowerCase();
                      const uName = resolveUserName(u).toLowerCase();
                      const uEmail = (u.email || '').toLowerCase();
                      return uName.includes(query) || uEmail.includes(query);
                    })
                    .map((u, i) => {
                      const isSelected = selectedUserEmails.includes(u.email);
                      const dynamicName = resolveUserName(u);
                      return (
                        <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 px-4">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleUserEmail(u.email)}
                              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-5 h-5 cursor-pointer"
                            />
                          </td>
                          <td className="py-4 px-4 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm shrink-0 shadow-sm border border-indigo-100">
                              {(dynamicName || 'U')[0].toUpperCase()}
                            </div>
                            <div>
                              <span className="block font-black text-sm md:text-base text-slate-900">{dynamicName}</span>
                              <span className="block text-[10px] text-slate-400 font-extrabold uppercase tracking-widest mt-0.5">Member ID: #{(u.email || 'A').slice(0, 5).toUpperCase()}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-xs md:text-sm font-semibold text-slate-600 select-all">{u.email}</span>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <span className="inline-block px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-100">
                              VERIFIED CUSTOMER
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {recipientType === 'custom' && (
          <div className="space-y-8">
            {/* Campaign History Log list */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8">
              <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                    <Clock className="text-indigo-600" size={20} /> Generation History
                  </h3>
                  <p className="text-slate-400 text-sm font-semibold mt-1">Recent bulk campaign distribution logs, delivery batches, and dispatch status metrics.</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-xs font-black text-slate-400 uppercase tracking-widest">
                      <th className="py-4 px-4">Campaign Name</th>
                      <th className="py-4 px-4">Type</th>
                      <th className="py-4 px-4">Amount</th>
                      <th className="py-4 px-4">Status</th>
                      <th className="py-4 px-4">Date</th>
                      <th className="py-4 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaigns.filter(c => c.recipient_type === 'custom').map((camp, i) => {
                      const isTracked = activeBatchId === camp._id;
                      const displayCamp = isTracked && activeBatch && activeBatch._id === camp._id ? activeBatch : camp;
                      return (
                        <Fragment key={camp._id || i}>
                          <tr
                            onClick={() => {
                              if (isTracked) {
                                setActiveBatchId(null);
                                setActiveBatch(null);
                              } else {
                                setActiveBatchId(camp._id);
                                setActiveBatch(camp);
                              }
                            }}
                            className={`border-b border-slate-50 hover:bg-slate-50/50 transition-colors cursor-pointer ${isTracked ? 'bg-indigo-50/10' : ''}`}
                          >
                            <td className="py-4 px-4">
                              <div>
                                <span className="block font-black text-sm text-slate-900">{camp.campaign_name}</span>
                                <span className="block text-[10px] text-slate-400 font-extrabold uppercase tracking-widest mt-0.5">Batch ID: #{camp._id.slice(-6).toUpperCase()}</span>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <span className="inline-block px-3 py-1 rounded text-xs font-extrabold bg-slate-100 text-slate-500 border border-slate-200 uppercase">
                                {camp.recipient_type || 'custom'}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <span className="font-extrabold text-sm text-slate-900">₹{Number(camp.gift_card_amount).toLocaleString('en-IN')}</span>
                            </td>
                            <td className="py-4 px-4">
                              <span className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold uppercase border ${getBatchStatusBadge(camp.status)}`}>
                                {camp.status}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <span className="text-xs md:text-sm font-semibold text-slate-500">
                                {new Date(camp.created_at || camp.createdAt).toLocaleString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-right">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (isTracked) {
                                    setActiveBatchId(null);
                                    setActiveBatch(null);
                                  } else {
                                    setActiveBatchId(camp._id);
                                    setActiveBatch(camp);
                                  }
                                }}
                                className="w-8 h-8 rounded-full bg-slate-50 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 flex items-center justify-center transition-colors ml-auto border border-slate-100"
                              >
                                <ChevronRight size={16} className={`transition-transform duration-300 ${isTracked ? 'rotate-90 text-indigo-600' : ''}`} />
                              </button>
                            </td>
                          </tr>

                          {/* Expansion Dropdown Panel */}
                          {isTracked && (
                            <tr className="bg-slate-50/30">
                              <td colSpan="6" className="p-0 border-b border-slate-150">
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.25 }}
                                  className="overflow-hidden"
                                >
                                  <div className="p-6 md:p-8 space-y-6">
                                    
                                    {/* Metrics Grid */}
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-center">
                                        <span className="block text-[10px] font-bold text-slate-450 uppercase tracking-widest mb-1">Total Recipients</span>
                                        <span className="text-xl md:text-2xl font-black text-slate-900">{displayCamp.total_records || 0}</span>
                                      </div>
                                      <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-sm flex flex-col justify-center">
                                        <span className="block text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-1">Successfully Dispatched</span>
                                        <span className="text-xl md:text-2xl font-black text-emerald-600">
                                          {(displayCamp.total_records || 0) - (displayCamp.failed_records?.length || 0)}
                                        </span>
                                      </div>
                                      <div className="bg-white p-5 rounded-2xl border border-red-100 shadow-sm flex flex-col justify-center">
                                        <span className="block text-[10px] font-bold text-red-500 uppercase tracking-widest mb-1">Failed Records</span>
                                        <span className="text-xl md:text-2xl font-black text-red-600">{displayCamp.failed_records?.length || 0}</span>
                                      </div>
                                      <div className="bg-white p-5 rounded-2xl border border-indigo-100 shadow-sm flex flex-col justify-center">
                                        <span className="block text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-1">Voucher Amount</span>
                                        <span className="text-xl md:text-2xl font-black text-indigo-600">₹{Number(displayCamp.gift_card_amount).toLocaleString('en-IN')}</span>
                                      </div>
                                    </div>

                                    {/* Progress Bar for Active Polling */}
                                    {displayCamp.status === 'processing' && (
                                      <div className="bg-white p-5 rounded-2xl border border-indigo-50 shadow-sm space-y-2">
                                        <div className="flex justify-between items-center text-xs font-black">
                                          <span className="text-indigo-600 uppercase tracking-wider animate-pulse">Campaign Dispatching in Progress...</span>
                                          <span className="text-indigo-600">{getProgressPercentage(displayCamp)}%</span>
                                        </div>
                                        <div className="relative w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                          <div
                                            style={{ width: `${getProgressPercentage(displayCamp)}%` }}
                                            className="absolute inset-y-0 left-0 bg-indigo-600 rounded-full transition-all duration-300"
                                          ></div>
                                        </div>
                                      </div>
                                    )}

                                    {/* Recipients Table List */}
                                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                                      <div className="px-5 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                                        <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                                          <Users size={14} className="text-indigo-550" /> Recipient Breakdown ({displayCamp.emails_list?.length || 0})
                                        </h4>
                                      </div>

                                      <div className="max-h-72 overflow-y-auto custom-scrollbar">
                                        <table className="w-full text-left border-collapse text-xs">
                                          <thead>
                                            <tr className="border-b border-slate-100 text-[10px] font-black text-slate-450 uppercase tracking-widest bg-slate-50/50">
                                              <th className="py-3 px-5">Recipient Email</th>
                                              <th className="py-3 px-5">Gift Card Code</th>
                                              <th className="py-3 px-5">Status</th>
                                              <th className="py-3 px-5 text-right">Copy Code</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {displayCamp.emails_list?.map((email, idx) => {
                                              const matchingCard = getCardForEmail(displayCamp, email);
                                              const isFailed = (displayCamp.failed_records || []).some(f => f.email?.toLowerCase() === email?.toLowerCase());
                                              const failureInfo = (displayCamp.failed_records || []).find(f => f.email?.toLowerCase() === email?.toLowerCase());
                                              
                                              const emailStatus = isFailed 
                                                ? 'failed' 
                                                : matchingCard?.status || (displayCamp.status === 'completed' ? 'active' : 'pending');

                                              return (
                                                <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                                  <td className="py-3 px-5 font-bold text-slate-700 select-all">
                                                    {email}
                                                  </td>
                                                  <td className="py-3 px-5 font-mono font-bold text-indigo-600 text-sm">
                                                    {matchingCard?.public_code || 'N/A'}
                                                  </td>
                                                  <td className="py-3 px-5">
                                                    <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-black uppercase border ${
                                                      ['failed', 'expired', 'revoked', 'cancelled'].includes(emailStatus)
                                                        ? 'bg-red-50 text-red-700 border-red-200'
                                                        : ['active', 'claimed', 'accepted'].includes(emailStatus)
                                                          ? 'bg-emerald-50 text-emerald-700 border-emerald-250'
                                                        : emailStatus === 'redeemed'
                                                          ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                                          : 'bg-amber-50 text-amber-700 border-amber-200'
                                                    }`}>
                                                      {['failed'].includes(emailStatus)
                                                        ? `Failed: ${failureInfo?.reason || 'SMTP Rejection'}` 
                                                        : ['active', 'claimed'].includes(emailStatus)
                                                          ? 'ACCEPTED' 
                                                          : emailStatus.toUpperCase()}
                                                    </span>
                                                  </td>
                                                  <td className="py-3 px-5 text-right">
                                                    {matchingCard?.public_code ? (
                                                      <button
                                                        onClick={(e) => {
                                                          e.stopPropagation();
                                                          navigator.clipboard.writeText(matchingCard.public_code);
                                                          toast.success('Voucher code copied!', {
                                                            position: 'top-right',
                                                            autoClose: 1500,
                                                            hideProgressBar: true
                                                          });
                                                        }}
                                                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-all inline-flex"
                                                        title="Copy Voucher Code"
                                                      >
                                                        <Copy size={14} />
                                                      </button>
                                                    ) : (
                                                      <span className="text-slate-350 text-[10px] font-semibold italic pr-1">Not Available</span>
                                                    )}
                                                  </td>
                                                </tr>
                                              );
                                            })}
                                          </tbody>
                                        </table>
                                      </div>
                                    </div>
                                    
                                  </div>
                                </motion.div>
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* VERIFY & MANAGE COMPONENT */}
        {recipientType === 'manage' && (
          <div className="space-y-8">
            {/* Search HUD Box */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
              <div className="relative z-10">
                <h3 className="text-xl font-black text-slate-900 mb-2 flex items-center gap-2">
                  <Play className="text-indigo-600" size={20} /> Verify & Manage Gift Cards
                </h3>
                <p className="text-slate-400 text-sm font-semibold mb-6">Enter an exact Gift Card Code to securely verify and manage it, or search by email to find associated cards.</p>

                <div className="relative max-w-3xl">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <Info className="text-indigo-400 animate-pulse" size={24} />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearch}
                    placeholder="ENTER CARD CODE (E.G. T2H-XXXXXX) TO VIEW FULL DETAILS..."
                    className="w-full pl-14 pr-6 py-4.5 bg-slate-50 border-2 border-slate-200/70 rounded-2xl focus:border-indigo-600 focus:bg-white text-base md:text-lg outline-none transition-all font-mono font-bold text-slate-800 placeholder-slate-400 uppercase shadow-inner"
                  />
                </div>
              </div>
            </div>

            {/* Live Search List */}
            {searchQuery.trim() === '' ? (
              <div className="bg-white rounded-3xl border border-slate-200 border-dashed p-16 text-center text-slate-400">
                <Gift className="mx-auto mb-4 text-indigo-550 animate-pulse" size={40} />
                <h3 className="text-lg font-black text-slate-900 mb-1">Gift Card Search Center</h3>
                <p className="text-xs md:text-sm text-slate-505 max-w-md mx-auto font-semibold">
                  Enter a voucher code (e.g. T2H-XXXXXX) or customer email in the search bar above to securely view full financials and apply overrides.
                </p>
              </div>
            ) : verifyLoading ? (
              <div className="flex justify-center items-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : filteredCards.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 border-dashed p-12 text-center text-slate-400">
                <Info className="mx-auto mb-3" size={36} />
                <h3 className="text-base font-bold text-slate-900 mb-1">No Matches Found</h3>
                <p className="text-xs md:text-sm text-slate-500">Double-check the code or email you entered.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {filteredCards.map((card, idx) => {
                  const statusConfig = getStatusConfig(card.status);
                  const isExpanded = expandedId === card._id;
                  const dynamicSenderName = resolveUserName(card.sender_user_id);
                  const dynamicRecipientName = card.accepted_by_user_id
                    ? resolveUserName(card.accepted_by_user_id)
                    : (card.recipient_name || card.recipient_email || 'Unclaimed');

                  return (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(idx * 0.02, 0.2) }}
                      key={card._id}
                      className={`bg-white border transition-all duration-300 overflow-hidden ${isExpanded
                        ? 'border-indigo-200 shadow-xl rounded-3xl'
                        : 'border-slate-200 shadow-sm rounded-2xl hover:border-indigo-300 hover:shadow-md'
                        }`}
                    >
                      {/* Row Header */}
                      <div
                        onClick={() => setExpandedId(isExpanded ? null : card._id)}
                        className="px-6 py-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 cursor-pointer select-none group"
                      >
                        <div className="flex items-center gap-4 w-full lg:w-auto">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${statusConfig.bg} ${statusConfig.text} border`}>
                            {statusConfig.icon}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-0.5">
                              <h3 className="font-mono font-bold text-base md:text-lg text-slate-900 tracking-wider flex items-center gap-2 text-indigo-600">
                                {card.public_code}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigator.clipboard.writeText(card.public_code);
                                    toast.success('Code copied!', { position: 'top-right', autoClose: 1500, hideProgressBar: true });
                                  }}
                                  className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                  title="Copy Code"
                                >
                                  <Copy size={14} />
                                </button>
                              </h3>
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded">
                                {card.type}
                              </span>
                            </div>
                            <p className="text-xs md:text-sm font-semibold text-slate-400">
                              {dynamicSenderName} → {dynamicRecipientName}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between w-full lg:w-auto gap-8">
                          <div className="text-left lg:text-right">
                            <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Value</p>
                            <p className="font-extrabold text-sm md:text-base text-slate-900">₹{card.amount.toLocaleString('en-IN')}</p>
                          </div>
                          <div className="text-left lg:text-right">
                            <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Status</p>
                            <p className={`text-xs md:text-sm font-bold uppercase ${statusConfig.text}`}>{statusConfig.label}</p>
                          </div>
                          <div className="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                            {isExpanded ? <ChevronRight size={18} className="rotate-90 transition-transform" /> : <ChevronRight size={18} />}
                          </div>
                        </div>
                      </div>

                      {/* Card Expander */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="border-t border-slate-100 bg-slate-50/30"
                          >
                            <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-6">

                              {/* Financial block */}
                              <div className="space-y-4">
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                  <Gift size={16} className="text-indigo-500" /> Financial Segment
                                </h4>
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                                    <span className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Original Value</span>
                                    <span className="text-xl md:text-2xl font-black text-slate-950">₹{card.amount.toLocaleString('en-IN')}</span>
                                  </div>
                                  <div className="bg-white p-5 rounded-2xl border border-indigo-50 shadow-sm">
                                    <span className="block text-[10px] font-bold text-indigo-400 uppercase mb-0.5">Remaining Balance</span>
                                    <span className="text-xl md:text-2xl font-black text-indigo-600">₹{card.remaining_balance.toLocaleString('en-IN')}</span>
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                                    <span className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Issued Date</span>
                                    <span className="text-xs md:text-sm font-bold text-slate-700">{new Date(card.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                  </div>
                                  <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                                    <span className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Validity Date</span>
                                    <span className="text-xs md:text-sm font-bold text-slate-700">{new Date(card.expiry_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Entities block */}
                              <div className="space-y-4">
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                  <Users size={16} className="text-indigo-500" /> Entities Involved
                                </h4>
                                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                                  <span className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Purchaser / Sender</span>
                                  {card.sender_user_id ? (
                                    <div>
                                      <p className="font-black text-sm md:text-base text-slate-900">{resolveUserName(card.sender_user_id)}</p>
                                      <p className="text-xs text-slate-500">{card.sender_user_id.email}</p>
                                    </div>
                                  ) : (
                                    <p className="font-black text-sm md:text-base text-slate-900">Trip to Honeymoon</p>
                                  )}
                                </div>
                                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                                  <span className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Recipient / Owner</span>
                                  {card.accepted_by_user_id ? (
                                    <div>
                                      <p className="font-black text-sm md:text-base text-slate-900">{resolveUserName(card.accepted_by_user_id)}</p>
                                      <p className="text-xs text-slate-500">{card.accepted_by_user_id.email}</p>
                                      <span className="inline-block mt-2 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase rounded border border-emerald-100">Claimed & Active</span>
                                    </div>
                                  ) : card.recipient_email ? (
                                    <div>
                                      <p className="font-black text-sm md:text-base text-slate-900">{card.recipient_name || 'N/A'}</p>
                                      <p className="text-xs text-slate-500">{card.recipient_email}</p>
                                      <span className="inline-block mt-2 px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-black uppercase rounded border border-amber-200">Pending Acceptance</span>
                                    </div>
                                  ) : (
                                    <p className="text-xs text-slate-405 italic">Unclaimed (Self Purchase)</p>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Admin quick actions */}
                            {!['expired', 'revoked', 'cancelled'].includes(card.status) && (
                              <div className="px-6 md:px-8 py-5 bg-white border-t border-slate-100 flex items-center justify-end gap-3">
                                <span className="text-xs font-black text-slate-400 uppercase tracking-widest mr-auto">Admin Controls</span>
                                <button
                                  onClick={() => handleStatusUpdate(card._id, card.status, 'revoked')}
                                  disabled={actionLoading}
                                  className="px-5 py-2.5 bg-red-50 hover:bg-red-600 hover:text-white text-red-600 text-xs md:text-sm font-bold rounded-xl transition-all border border-red-200"
                                >
                                  Revoke Access
                                </button>
                                <button
                                  onClick={() => handleStatusUpdate(card._id, card.status, 'expired')}
                                  disabled={actionLoading}
                                  className="px-5 py-2.5 bg-orange-50 hover:bg-orange-500 hover:text-white text-orange-600 text-xs md:text-sm font-bold rounded-xl transition-all border border-orange-200"
                                >
                                  Force Expire
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

            {/* GORGEOUS GENERATION HISTORY LIST (RECENT BULK DISPATCH TASKS) */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8 mt-12">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                    <Clock className="text-indigo-600" size={20} /> Generation History
                  </h3>
                  <p className="text-slate-400 text-xs md:text-sm font-semibold mt-1">RECENT BULK DISPATCH TASKS</p>
                </div>

                {/* Pills filters selector */}
                <div className="bg-slate-100 p-1 rounded-xl flex gap-1 self-start sm:self-center shadow-inner">
                  {['ALL', 'REGISTERED', 'CUSTOM'].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setDispatchFilter(filter)}
                      className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${dispatchFilter === filter
                        ? 'bg-indigo-650 text-white shadow'
                        : 'text-slate-500 hover:text-slate-900'
                        }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] font-black text-slate-450 uppercase tracking-widest">
                      <th className="py-4 px-4">Recipient</th>
                      <th className="py-4 px-4">Type</th>
                      <th className="py-4 px-4">Amount</th>
                      <th className="py-4 px-4">Status</th>
                      <th className="py-4 px-4">Date</th>
                      <th className="py-4 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDispatchCards.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="py-12 text-center text-slate-400 font-semibold text-sm">
                          No dispatch records found matching this type.
                        </td>
                      </tr>
                    ) : (
                      filteredDispatchCards.map((card, i) => {
                        const cardType = resolveCardType(card);
                        const isCustom = cardType === 'custom';
                        const dynamicRecipient = card.recipient_email || card.recipient_name || resolveUserName(card.accepted_by_user_id) || 'N/A';

                        const isFailed = ['revoked', 'expired', 'cancelled', 'failed'].includes(card.status);
                        const statusLabel = isFailed ? 'FAILED' : 'COMPLETED';

                        return (
                          <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${isCustom
                                  ? 'bg-purple-50 text-purple-600 border-purple-100'
                                  : 'bg-blue-50 text-blue-600 border-blue-100'
                                  }`}>
                                  {isCustom ? <Send size={14} /> : <User size={14} />}
                                </div>
                                <div>
                                  <span className="block font-black text-sm md:text-base text-slate-900 truncate max-w-xs md:max-w-md">{dynamicRecipient}</span>
                                  <span className="block text-[10px] text-slate-400 font-extrabold uppercase tracking-widest mt-0.5">#{card.public_code || card._id.slice(-6).toUpperCase()}</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <span className={`inline-block px-3 py-1 rounded text-xs font-black uppercase border ${isCustom
                                ? 'bg-purple-50 text-purple-700 border-purple-200'
                                : 'bg-blue-50 text-blue-700 border-blue-200'
                                }`}>
                                {cardType}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <span className="font-extrabold text-sm md:text-base text-slate-900">₹{Number(card.amount).toLocaleString('en-IN')}</span>
                            </td>
                            <td className="py-4 px-4">
                              <span className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase border ${isFailed
                                ? 'bg-red-50 text-red-700 border-red-200'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                }`}>
                                {statusLabel}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <div>
                                <span className="block text-xs md:text-sm font-semibold text-slate-600">
                                  {new Date(card.created_at).toLocaleDateString('en-IN')}
                                </span>
                                <span className="block text-[10px] text-slate-400 font-semibold mt-0.5">
                                  {new Date(card.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-right">
                              <div className="inline-flex items-center gap-2">
                                <button
                                  onClick={() => setSelectedDetailCard(card)}
                                  className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                  title="View Details"
                                >
                                  <Eye size={16} />
                                </button>
                                <button
                                  onClick={() => toast.success(`Card ${card.public_code} verified & active!`)}
                                  className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                  title="Verify card status"
                                >
                                  <CheckCircle2 size={16} />
                                </button>
                                <button
                                  disabled={actionLoading}
                                  onClick={() => handleStatusUpdate(card._id, card.status, 'revoked')}
                                  className="p-2 text-slate-400 hover:text-red-650 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                  title="Revoke / Block Card"
                                >
                                  <AlertCircle size={16} />
                                </button>
                                <button
                                  onClick={() => handleDeleteCard(card._id)}
                                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                  title="Delete log entry"
                                >
                                  <Trash size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* GORGEOUS GLASSMORPHIC DETAILS OVERLAY MODAL */}
      <AnimatePresence>
        {selectedDetailCard && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop blur overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDetailCard(null)}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
            ></motion.div>

            {/* Modal Container */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-2xl w-full p-6 md:p-8 relative z-10 overflow-hidden flex flex-col gap-6"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl -translate-y-12 translate-x-12"></div>

              {/* Header row */}
              <div className="flex justify-between items-center relative z-10">
                <div>
                  <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2.5 py-1 rounded">DISPATCH RECORD OVERVIEW</span>
                  <h3 className="text-xl font-black text-slate-900 mt-2 font-mono tracking-wider flex items-center gap-2">
                    {selectedDetailCard.public_code}
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(selectedDetailCard.public_code);
                        toast.success('Code copied!');
                      }}
                      className="p-1 text-slate-400 hover:text-indigo-650 hover:bg-slate-50 rounded transition-all"
                      title="Copy code"
                    >
                      <Copy size={14} />
                    </button>
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedDetailCard(null)}
                  className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Financial statement block */}
              <div className="space-y-3 relative z-10">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Gift size={16} className="text-indigo-500" /> Financial Details
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50/60 p-4.5 rounded-2xl border border-slate-100">
                    <span className="block text-[10px] font-bold text-slate-450 uppercase mb-0.5">Voucher Value</span>
                    <span className="text-2xl font-black text-slate-950">₹{selectedDetailCard.amount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="bg-indigo-50/30 p-4.5 rounded-2xl border border-indigo-100/30">
                    <span className="block text-[10px] font-bold text-indigo-400 uppercase mb-0.5">Remaining Balance</span>
                    <span className="text-2xl font-black text-indigo-600">₹{selectedDetailCard.remaining_balance.toLocaleString('en-IN')}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50/60 p-4.5 rounded-2xl border border-slate-100">
                    <span className="block text-[10px] font-bold text-slate-455 uppercase mb-0.5">Issued At</span>
                    <span className="text-sm font-black text-slate-800">{new Date(selectedDetailCard.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                  </div>
                  <div className="bg-slate-50/60 p-4.5 rounded-2xl border border-slate-100">
                    <span className="block text-[10px] font-bold text-slate-455 uppercase mb-0.5">Expiry Date</span>
                    <span className="text-sm font-black text-slate-800">{new Date(selectedDetailCard.expiry_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                  </div>
                </div>
              </div>

              {/* Entities block */}
              <div className="space-y-3 relative z-10">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Users size={16} className="text-indigo-500" /> Stakeholders Involved
                </h4>
                <div className="bg-slate-50/60 p-4.5 rounded-2xl border border-slate-100 space-y-3">
                  <div>
                    <span className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Purchaser / Sender</span>
                    {selectedDetailCard.sender_user_id ? (
                      <div>
                        <p className="font-black text-sm text-slate-900">{resolveUserName(selectedDetailCard.sender_user_id)}</p>
                        <p className="text-xs text-slate-500">{selectedDetailCard.sender_user_id.email}</p>
                      </div>
                    ) : (
                      <p className="font-black text-sm text-slate-900">Trip to Honeymoon</p>
                    )}
                  </div>
                  <hr className="border-slate-100" />
                  <div>
                    <span className="block text-[10px] font-bold text-slate-455 uppercase mb-1">Recipient / Owner</span>
                    {selectedDetailCard.accepted_by_user_id ? (
                      <div>
                        <p className="font-black text-sm text-slate-900">{resolveUserName(selectedDetailCard.accepted_by_user_id)}</p>
                        <p className="text-xs text-slate-500">{selectedDetailCard.accepted_by_user_id.email}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase rounded border border-emerald-100">Claimed & Active</span>
                      </div>
                    ) : selectedDetailCard.recipient_email ? (
                      <div>
                        <p className="font-black text-sm text-slate-900">{selectedDetailCard.recipient_name || 'N/A'}</p>
                        <p className="text-xs text-slate-500">{selectedDetailCard.recipient_email}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-black uppercase rounded border border-amber-200">Pending Claim</span>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-405 italic">Self-purchased voucher</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Controls segment */}
              {!['expired', 'revoked', 'cancelled'].includes(selectedDetailCard.status) && (
                <div className="bg-slate-50 p-4 rounded-2xl flex justify-between items-center border border-slate-100 mt-2 relative z-10">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Admin Overrides</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStatusUpdate(selectedDetailCard._id, selectedDetailCard.status, 'revoked')}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-red-50 hover:bg-red-600 hover:text-white text-red-600 text-xs font-black rounded-xl transition-all border border-red-200"
                    >
                      Revoke Access
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(selectedDetailCard._id, selectedDetailCard.status, 'expired')}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-orange-50 hover:bg-orange-500 hover:text-white text-orange-600 text-xs font-black rounded-xl transition-all border border-orange-200"
                    >
                      Force Expire
                    </button>
                  </div>
                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default BulkGiftCard;
