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
  Eye, Check, Trash, User, Send, X, ShieldAlert, Bell, Wallet, DollarSign, FileText, UploadCloud
} from 'lucide-react';
import { toast } from 'react-toastify';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
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
  
  // --- CSV / XLSX Uploader States ---
  const [isUploadMode, setIsUploadMode] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [uploadStats, setUploadStats] = useState({ valid: 0, invalid: 0 });
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
  const [verifyModalCard, setVerifyModalCard] = useState(null);
  const [remindMessage, setRemindMessage] = useState('Your Trip to Honeymoon travel voucher is waiting! Claim it before it expires.');

  // Manual Redeem State
  const [redeemModalCard, setRedeemModalCard] = useState(null);
  const [redeemAmount, setRedeemAmount] = useState('');
  const [redeemReference, setRedeemReference] = useState('');
  const [redeemNotes, setRedeemNotes] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);

  // --- Pill Filters for Generation History ---
  const [dispatchFilter, setDispatchFilter] = useState('ALL'); // 'ALL' | 'REGISTERED' | 'CUSTOM'
  const [historyPage, setHistoryPage] = useState(1);
  const HISTORY_PAGE_SIZE = 10;

  // --- Bulk Reminder States ---
  const [bulkReminderModalOpen, setBulkReminderModalOpen] = useState(false);
  const [bulkReminderMessage, setBulkReminderMessage] = useState('Friendly reminder! You have a Trip to Honeymoon travel voucher waiting for you.');
  const [selectedTableCardIds, setSelectedTableCardIds] = useState([]);
  const [bulkReminderSubmitting, setBulkReminderSubmitting] = useState(false);

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
      // const uniqueValid = new Set();

      // for (const item of splitList) {
      //   const clean = item.trim().toLowerCase();
      //   if (emailRegex.test(clean)) {
      //     uniqueValid.add(clean);
      //   }
      // }
      // setParsedEmails(Array.from(uniqueValid));
      const validArray = [];
      for (const item of splitList) {
        const clean = item.trim().toLowerCase();
        if (emailRegex.test(clean)) {
          validArray.push(clean);
        }
      }
      setParsedEmails(validArray);

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

  const processUploadedFile = async (file) => {
    setUploadedFileName(file.name);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    const extractFromData = (dataArray) => {
      const columns = dataArray.length > 0 ? Object.keys(dataArray[0]) : [];
      const emailCol = columns.find(col => col.toLowerCase().includes('email') || col.toLowerCase().includes('e-mail'));
      
      let valid = 0, invalid = 0;
      const validArray = [];
      dataArray.forEach(row => {
        let emailVal = emailCol ? row[emailCol] : Object.values(row).find(v => typeof v === 'string' && v.includes('@'));
        if (emailVal && typeof emailVal === 'string') {
          const clean = emailVal.trim().toLowerCase();
          if (emailRegex.test(clean)) {
            validArray.push(clean);
            valid++;
          } else { invalid++; }
        } else { invalid++; }
      });
      
      setParsedEmails(validArray);
      setUploadStats({ valid, invalid });
      setRawEmails(validArray.join('\n'));
    };

    try {
      if (file.name.toLowerCase().endsWith('.csv')) {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => extractFromData(results.data)
        });
      } else if (file.name.toLowerCase().endsWith('.xlsx') || file.name.toLowerCase().endsWith('.xls')) {
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);
        extractFromData(data);
      } else {
        toast.error('Unsupported file format. Please upload .csv or .xlsx');
      }
    } catch (error) {
      toast.error('Failed to parse file. Please check the format.');
    }
  };

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processUploadedFile(e.dataTransfer.files[0]);
    }
  };
  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processUploadedFile(e.target.files[0]);
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

  const handleToggleTableCard = (cardId) => {
    setSelectedTableCardIds(prev =>
      prev.includes(cardId) ? prev.filter(id => id !== cardId) : [...prev, cardId]
    );
  };

  const handleToggleAllTableCards = (cardIds) => {
    // If all currently visible eligible cards are selected, deselect them
    const allSelected = cardIds.every(id => selectedTableCardIds.includes(id));
    if (allSelected) {
      setSelectedTableCardIds(prev => prev.filter(id => !cardIds.includes(id)));
    } else {
      // Add any missing visible ids
      setSelectedTableCardIds(prev => {
        const newSet = new Set([...prev, ...cardIds]);
        return Array.from(newSet);
      });
    }
  };

  const handleSendBulkReminders = async () => {
    if (selectedTableCardIds.length === 0) {
      return toast.warn('Please select at least one recipient from the list.');
    }

    setBulkReminderSubmitting(true);
    try {
      const response = await apiClient.post(`/admin/giftcard/remind-multiple`, {
        customMessage: bulkReminderMessage,
        cardIds: selectedTableCardIds
      });

      if (response.data.success || response.status === 202) {
        toast.success(response.data.msg || 'Bulk reminders started!');
        setBulkReminderModalOpen(false);
        setSelectedTableCardIds([]);
      }
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to dispatch bulk reminders.');
    } finally {
      setBulkReminderSubmitting(false);
    }
  };

  // --- Verify & Manage Event Handlers ---
  const handleManualRedeem = async () => {
    if (!redeemAmount || Number(redeemAmount) <= 0) {
      toast.error("Please enter a valid amount to redeem.");
      return;
    }
    if (Number(redeemAmount) > redeemModalCard.remaining_balance) {
      toast.error(`Cannot redeem more than ₹${redeemModalCard.remaining_balance}.`);
      return;
    }

    setIsRedeeming(true);
    try {
      const response = await apiClient.post(`/admin/giftcard/manual-redeem`, {
        id: redeemModalCard._id,
        amount: Number(redeemAmount),
        reference: redeemReference,
        notes: redeemNotes
      });

      if (response.data.success) {
        toast.success(response.data.msg);
        setRedeemModalCard(null);
        setRedeemAmount('');
        setRedeemReference('');
        setRedeemNotes('');
        await fetchAllCards();
        await fetchHistory();
      } else {
        toast.error(response.data.msg || 'Failed to redeem gift card.');
      }
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Error performing manual redemption.');
    } finally {
      setIsRedeeming(false);
    }
  };

  const handleCloseRedeemModal = () => {
    setRedeemModalCard(null);
    setRedeemAmount('');
    setRedeemReference('');
    setRedeemNotes('');
  };

  const handleSendReminder = async (id) => {
    if (!remindMessage.trim()) return toast.warning('Please enter a message.');
    setActionLoading(true);
    try {
      const res = await apiClient.post(`/admin/giftcard/remind/${id}`, { message: remindMessage });
      if (res.data.success) {
        toast.success(res.data.msg || 'Reminder sent successfully!');
        setVerifyModalCard(null); // close modal on success
      }
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Error sending reminder email.');
    } finally {
      setActionLoading(false);
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

  const totalHistoryPages = Math.ceil(filteredDispatchCards.length / HISTORY_PAGE_SIZE);
  const paginatedDispatchCards = filteredDispatchCards.slice(
    (historyPage - 1) * HISTORY_PAGE_SIZE,
    historyPage * HISTORY_PAGE_SIZE
  );

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
                <div className="space-y-4 pt-6 border-t border-slate-100 mt-6">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-extrabold text-slate-400 uppercase tracking-widest">Provide Recipients</label>
                    <div className="flex bg-slate-100 p-1 rounded-lg">
                      <button type="button" onClick={() => setIsUploadMode(false)} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${!isUploadMode ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}>Paste Text</button>
                      <button type="button" onClick={() => setIsUploadMode(true)} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${isUploadMode ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}>Upload CSV/XLSX</button>
                    </div>
                  </div>

                  {!isUploadMode ? (
                    <textarea
                      rows={3}
                      value={rawEmails}
                      onChange={(e) => setRawEmails(e.target.value)}
                      placeholder="Enter emails comma-separated or one per line (e.g. user@gmail.com, hello@domain.com)"
                      className="w-full p-5 bg-slate-50 border border-slate-200/70 rounded-2xl focus:border-indigo-600 focus:bg-white outline-none transition-all font-mono text-sm font-semibold shadow-sm"
                    ></textarea>
                  ) : (
                    <div 
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all ${isDragging ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'}`}
                    >
                      <input type="file" accept=".csv,.xlsx,.xls" onChange={handleFileSelect} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <div className={`p-3 rounded-full ${isDragging ? 'bg-indigo-100 text-indigo-600' : 'bg-white text-slate-400 shadow-sm'}`}>
                          <UploadCloud size={24} />
                        </div>
                        <h4 className="font-bold text-slate-700 text-sm">{uploadedFileName || 'Drag and drop your file here'}</h4>
                        <p className="text-xs font-medium text-slate-500">Supports .csv and .xlsx formats</p>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-xs md:text-sm font-bold px-2">
                    <span className="text-slate-400">Unique valid emails extracted:</span>
                    <div className="flex items-center gap-2">
                      {isUploadMode && uploadedFileName && uploadStats.invalid > 0 && (
                        <span className="px-2.5 py-0.5 rounded font-black bg-red-100 text-red-700 text-xs">
                          {uploadStats.invalid} Invalid
                        </span>
                      )}
                      <span className={`px-2.5 py-0.5 rounded font-black ${parsedEmails.length > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                        {parsedEmails.length} Valid Recipient{parsedEmails.length !== 1 ? 's' : ''}
                      </span>
                    </div>
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
                                      <div className={`bg-white p-5 rounded-2xl border shadow-sm flex flex-col justify-center transition-all ${displayCamp.status === 'processing' ? 'border-emerald-300 animate-pulse bg-emerald-50/30' : 'border-emerald-100'}`}>
                                        <span className="block text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-1">Successfully Dispatched</span>
                                        <span className="text-xl md:text-2xl font-black text-emerald-600">
                                          {displayCamp.issued_cards?.length || 0}
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
                                            {(() => {
                                              const consumedIssued = {}; // Track duplicate assignments
                                              return displayCamp.emails_list?.map((email, idx) => {
                                                let matchingCode = 'N/A';
                                                let emailStatus = displayCamp.status === 'completed' ? 'active' : 'pending';
                                                let failureInfo = null;

                                                const isFailed = (displayCamp.failed_records || []).some(f => f.email?.toLowerCase() === email?.toLowerCase());
                                                
                                                if (isFailed) {
                                                  emailStatus = 'failed';
                                                  failureInfo = (displayCamp.failed_records || []).find(f => f.email?.toLowerCase() === email?.toLowerCase());
                                                } else if (displayCamp.issued_cards && displayCamp.issued_cards.length > 0) {
                                                  // New strict logic: map duplicate emails to unique issued cards precisely
                                                  const lowerEmail = email.toLowerCase();
                                                  consumedIssued[lowerEmail] = consumedIssued[lowerEmail] || 0;
                                                  
                                                  const availableCards = displayCamp.issued_cards.filter(c => c.email?.toLowerCase() === lowerEmail);
                                                  const exactCard = availableCards[consumedIssued[lowerEmail]];
                                                  
                                                  if (exactCard) {
                                                    matchingCode = exactCard.public_code;
                                                    
                                                    // Fetch the REAL live status from the Redux/State giftCards array
                                                    const liveCard = giftCards?.find(c => c.public_code === exactCard.public_code);
                                                    if (liveCard) {
                                                      emailStatus = liveCard.status; // e.g. 'invited', 'accepted', 'redeemed'
                                                    } else {
                                                      emailStatus = 'invited'; // Default fallback if card not yet synced to client
                                                    }
                                                    
                                                    consumedIssued[lowerEmail]++;
                                                  }
                                                } else {
                                                  // Old fallback logic for backward compatibility
                                                  const matchingCard = getCardForEmail(displayCamp, email);
                                                  if (matchingCard) {
                                                    matchingCode = matchingCard.public_code;
                                                    emailStatus = matchingCard.status;
                                                  }
                                                }

                                                return (
                                                  <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                                    <td className="py-3 px-5 font-bold text-slate-700 select-all">
                                                      {email}
                                                    </td>
                                                    <td className="py-3 px-5 font-mono font-bold text-indigo-600 text-sm">
                                                      {matchingCode}
                                                    </td>
                                                    <td className="py-3 px-5">
                                                      <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-black uppercase border ${['failed', 'expired', 'revoked', 'cancelled'].includes(emailStatus)
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
                                                      {matchingCode !== 'N/A' ? (
                                                        <button
                                                          onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigator.clipboard.writeText(matchingCode);
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
                                            });
                                            })()}
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
                                      <span className={`inline-block mt-2 px-2 py-0.5 text-[10px] font-black uppercase rounded border ${card.status === 'redeemed' ? 'bg-slate-50 text-slate-500 border-slate-200' :
                                          card.status === 'partially_redeemed' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                                            'bg-emerald-50 text-emerald-700 border-emerald-100'
                                        }`}>
                                        {card.status === 'redeemed' ? 'Fully Redeemed' :
                                          card.status === 'partially_redeemed' ? 'Partially Redeemed' :
                                            'Claimed & Active'}
                                      </span>
                                    </div>
                                  ) : card.recipient_email ? (
                                    <div>
                                      <p className="font-black text-sm md:text-base text-slate-900">{card.recipient_name || 'N/A'}</p>
                                      <p className="text-xs text-slate-500">{card.recipient_email}</p>
                                      <span className={`inline-block mt-2 px-2 py-0.5 text-[10px] font-black uppercase rounded border ${card.status === 'redeemed' ? 'bg-slate-50 text-slate-500 border-slate-200' :
                                          card.status === 'partially_redeemed' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                                            'bg-amber-50 text-amber-700 border-amber-200'
                                        }`}>
                                        {card.status === 'redeemed' ? 'Fully Redeemed' :
                                          card.status === 'partially_redeemed' ? 'Partially Redeemed' :
                                            'Pending Acceptance'}
                                      </span>
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

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  {/* Bulk Reminder Trigger Button */}
                  <button
                    onClick={() => setBulkReminderModalOpen(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 rounded-xl font-bold text-sm shadow-sm transition-all"
                  >
                    <Bell size={16} className="animate-pulse" /> Send Bulk Reminders
                  </button>

                  {/* Pills filters selector */}
                  <div className="bg-slate-100 p-1 rounded-xl flex gap-1 shadow-inner">
                    {['ALL', 'REGISTERED', 'CUSTOM'].map((filter) => (
                      <button
                        key={filter}
                        onClick={() => {
                          setDispatchFilter(filter);
                          setHistoryPage(1);
                          setSelectedTableCardIds([]); // clear selection on filter change
                        }}
                        className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${dispatchFilter === filter
                          ? 'bg-indigo-600 text-white shadow'
                          : 'text-slate-500 hover:text-slate-900'
                          }`}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] font-black text-slate-450 uppercase tracking-widest">
                      <th className="py-4 px-4 w-12">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-slate-300 cursor-pointer"
                          checked={
                            paginatedDispatchCards.length > 0 &&
                            paginatedDispatchCards.filter(c => !['revoked', 'expired', 'cancelled', 'failed', 'redeemed'].includes(c.status)).every(c => selectedTableCardIds.includes(c._id))
                          }
                          onChange={() => handleToggleAllTableCards(
                            paginatedDispatchCards.filter(c => !['revoked', 'expired', 'cancelled', 'failed', 'redeemed'].includes(c.status)).map(c => c._id)
                          )}
                        />
                      </th>
                      <th className="py-4 px-4">Recipient</th>
                      <th className="py-4 px-4">Type</th>
                      <th className="py-4 px-4">Amount</th>
                      <th className="py-4 px-4">Status</th>
                      <th className="py-4 px-4">Date</th>
                      <th className="py-4 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedDispatchCards.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="py-12 text-center text-slate-400 font-semibold text-sm">
                          No dispatch records found matching this type.
                        </td>
                      </tr>
                    ) : (
                      paginatedDispatchCards.map((card, i) => {
                        const cardType = resolveCardType(card);
                        const isCustom = cardType === 'custom';
                        const dynamicRecipient = card.recipient_email || card.recipient_name || resolveUserName(card.accepted_by_user_id) || 'N/A';

                        const getStatusPillProps = (status) => {
                          switch (status) {
                            case 'invited':
                            case 'pending_signup_or_login':
                            case 'created':
                            case 'paid':
                              return { label: 'UNCLAIMED', color: 'bg-amber-50 text-amber-700 border-amber-200' };
                            case 'verified':
                            case 'accepted':
                            case 'active':
                              return { label: 'ACTIVE', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
                            case 'redeemed':
                              return { label: 'REDEEMED', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
                            case 'expired':
                              return { label: 'EXPIRED', color: 'bg-rose-50 text-rose-700 border-rose-200' };
                            case 'revoked':
                            case 'cancelled':
                            case 'failed':
                              return { label: 'REVOKED', color: 'bg-red-50 text-red-700 border-red-200' };
                            default:
                              return { label: (status || 'UNKNOWN').toUpperCase(), color: 'bg-slate-50 text-slate-700 border-slate-200' };
                          }
                        };
                        const statusPill = getStatusPillProps(card.status);

                        const isEligible = !['revoked', 'expired', 'cancelled', 'failed', 'redeemed'].includes(card.status);

                        return (
                          <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                            <td className="py-4 px-4">
                              {isEligible ? (
                                <input
                                  type="checkbox"
                                  className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-slate-300 cursor-pointer"
                                  checked={selectedTableCardIds.includes(card._id)}
                                  onChange={() => handleToggleTableCard(card._id)}
                                />
                              ) : (
                                <input type="checkbox" disabled className="w-4 h-4 rounded border-slate-200 cursor-not-allowed opacity-40" title="Not eligible for reminder" />
                              )}
                            </td>
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
                              <span className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase border ${statusPill.color}`}>
                                {statusPill.label}
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
                                  onClick={() => setVerifyModalCard(card)}
                                  className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                  title="Verify & Remind"
                                >
                                  <Bell size={16} />
                                </button>
                                {card.remaining_balance > 0 && !['expired', 'revoked', 'cancelled'].includes(card.status) && (
                                  <button
                                    onClick={() => setRedeemModalCard(card)}
                                    className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                    title="Manual Override / Redeem"
                                  >
                                    <Wallet size={16} />
                                  </button>
                                )}
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

              {/* Pagination UI */}
              {totalHistoryPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-100 px-6 py-4 bg-slate-50 rounded-b-3xl mt-4 gap-4">
                  <p className="text-xs font-bold text-slate-400">
                    Showing <span className="text-slate-700">{(historyPage - 1) * HISTORY_PAGE_SIZE + 1}</span> to <span className="text-slate-700">{Math.min(historyPage * HISTORY_PAGE_SIZE, filteredDispatchCards.length)}</span> of <span className="text-slate-700">{filteredDispatchCards.length}</span> records
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setHistoryPage(p => Math.max(1, p - 1))}
                      disabled={historyPage === 1}
                      className="px-4 py-2 text-xs font-black text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-indigo-600 disabled:opacity-50 transition-colors shadow-sm"
                    >
                      PREV
                    </button>
                    <div className="px-4 py-2 text-xs font-black text-slate-700 bg-white border border-slate-200 rounded-lg shadow-sm">
                      {historyPage} / {totalHistoryPages}
                    </div>
                    <button
                      onClick={() => setHistoryPage(p => Math.min(totalHistoryPages, p + 1))}
                      disabled={historyPage === totalHistoryPages}
                      className="px-4 py-2 text-xs font-black text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-indigo-600 disabled:opacity-50 transition-colors shadow-sm"
                    >
                      NEXT
                    </button>
                  </div>
                </div>
              )}

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
              className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-4xl w-full p-8 md:p-10 relative z-10 overflow-hidden flex flex-col gap-8"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -translate-y-16 translate-x-16"></div>

              {/* Header row */}
              <div className="flex justify-between items-center relative z-10">
                <div>
                  <span className="text-xs font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1.5 rounded">DISPATCH RECORD OVERVIEW</span>
                  <h3 className="text-3xl font-black text-slate-900 mt-3 font-mono tracking-wider flex items-center gap-3">
                    {selectedDetailCard.public_code}
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(selectedDetailCard.public_code);
                        toast.success('Code copied!');
                      }}
                      className="p-1.5 text-slate-400 hover:text-indigo-650 hover:bg-slate-50 rounded-lg transition-all"
                      title="Copy code"
                    >
                      <Copy size={18} />
                    </button>
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedDetailCard(null)}
                  className="w-10 h-10 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Scrollable Modal Content */}
              <div className="overflow-y-auto max-h-[55vh] pr-3 custom-scrollbar">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10 items-stretch">

                  {/* Left Column */}
                  <div className="flex flex-col gap-8">
                    {/* Financial statement block */}
                    <div className="space-y-4 relative z-10">
                      <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Gift size={18} className="text-indigo-500" /> Financial Details
                      </h4>
                      <div className="grid grid-cols-2 gap-5">
                        <div className="bg-slate-50/60 p-6 rounded-2xl border border-slate-100 flex flex-col justify-center">
                          <span className="block text-xs font-bold text-slate-450 uppercase mb-1">Voucher Value</span>
                          <span className="text-3xl font-black text-slate-950">₹{selectedDetailCard.amount.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="bg-indigo-50/30 p-6 rounded-2xl border border-indigo-100/30 flex flex-col justify-center">
                          <span className="block text-xs font-bold text-indigo-400 uppercase mb-1">Remaining Balance</span>
                          <span className="text-3xl font-black text-indigo-600">₹{selectedDetailCard.remaining_balance.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-5">
                        <div className="bg-slate-50/60 p-6 rounded-2xl border border-slate-100">
                          <span className="block text-xs font-bold text-slate-455 uppercase mb-1">Issued At</span>
                          <span className="text-base font-black text-slate-800">{new Date(selectedDetailCard.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                        </div>
                        <div className="bg-slate-50/60 p-6 rounded-2xl border border-slate-100">
                          <span className="block text-xs font-bold text-slate-455 uppercase mb-1">Expiry Date</span>
                          <span className="text-base font-black text-slate-800">{new Date(selectedDetailCard.expiry_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                        </div>
                      </div>
                    </div>

                    {/* Entities block */}
                    <div className="space-y-4 relative z-10 flex-grow">
                      <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Users size={18} className="text-indigo-500" /> Stakeholders Involved
                      </h4>
                      <div className="bg-slate-50/60 p-6 rounded-2xl border border-slate-100 space-y-4 h-full">
                        <div>
                          <span className="block text-xs font-bold text-slate-450 uppercase mb-1.5">Purchaser / Sender</span>
                          {selectedDetailCard.sender_user_id ? (
                            <div>
                              <p className="font-black text-lg text-slate-900">{resolveUserName(selectedDetailCard.sender_user_id)}</p>
                              <p className="text-sm text-slate-500">{selectedDetailCard.sender_user_id.email}</p>
                            </div>
                          ) : (
                            <p className="font-black text-lg text-slate-900">Trip to Honeymoon</p>
                          )}
                        </div>
                        <hr className="border-slate-100 my-2" />
                        <div>
                          <span className="block text-xs font-bold text-slate-455 uppercase mb-1.5">Recipient / Owner</span>
                          {selectedDetailCard.accepted_by_user_id ? (
                            <div>
                              <p className="font-black text-lg text-slate-900">{resolveUserName(selectedDetailCard.accepted_by_user_id)}</p>
                              <p className="text-sm text-slate-500">{selectedDetailCard.accepted_by_user_id.email}</p>
                              <span className={`inline-block mt-2 px-3 py-1 text-xs font-black uppercase rounded border ${selectedDetailCard.status === 'redeemed' ? 'bg-slate-50 text-slate-500 border-slate-200' :
                                  selectedDetailCard.status === 'partially_redeemed' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                                    'bg-emerald-50 text-emerald-700 border-emerald-100'
                                }`}>
                                {selectedDetailCard.status === 'redeemed' ? 'Fully Redeemed' :
                                  selectedDetailCard.status === 'partially_redeemed' ? 'Partially Redeemed' :
                                    'Claimed & Active'}
                              </span>
                            </div>
                          ) : selectedDetailCard.recipient_email ? (
                            <div>
                              <p className="font-black text-lg text-slate-900">{selectedDetailCard.recipient_name || 'N/A'}</p>
                              <p className="text-sm text-slate-500">{selectedDetailCard.recipient_email}</p>
                              <span className={`inline-block mt-2 px-3 py-1 text-xs font-black uppercase rounded border ${selectedDetailCard.status === 'redeemed' ? 'bg-slate-50 text-slate-500 border-slate-200' :
                                  selectedDetailCard.status === 'partially_redeemed' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                                    'bg-amber-50 text-amber-700 border-amber-200'
                                }`}>
                                {selectedDetailCard.status === 'redeemed' ? 'Fully Redeemed' :
                                  selectedDetailCard.status === 'partially_redeemed' ? 'Partially Redeemed' :
                                    'Pending Claim'}
                              </span>
                            </div>
                          ) : (
                            <p className="text-sm text-slate-405 italic">Self-purchased voucher</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="flex flex-col h-full">
                    {/* Security & Audit Log block */}
                    <div className="space-y-4 relative z-10 mb-2 flex-grow flex flex-col">
                      <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <ShieldAlert size={18} className="text-indigo-500" /> Security & Audit Log
                      </h4>
                      <div className="bg-slate-50/60 p-6 rounded-2xl border border-slate-100 space-y-8 relative overflow-hidden flex-grow flex flex-col justify-center">
                        {/* Left vertical timeline line */}
                        <div className="absolute left-[37px] top-[40px] bottom-[40px] w-0.5 bg-slate-200 z-0"></div>

                        {/* Step 1: Generation */}
                        <div className="flex items-start gap-5 relative z-10">
                          <div className="w-7 h-7 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center shrink-0 mt-0.5 text-indigo-600">
                            <Check size={14} strokeWidth={4} />
                          </div>
                          <div>
                            <p className="text-base font-black text-slate-900">Voucher Generated</p>
                            <p className="text-xs text-slate-500 font-semibold mt-1">By: {selectedDetailCard.sender_user_id ? resolveUserName(selectedDetailCard.sender_user_id) : 'System Admin (Trip to Honeymoon)'}</p>
                            <p className="text-xs text-slate-400 font-semibold mt-0.5">{new Date(selectedDetailCard.created_at).toLocaleString('en-IN')}</p>
                          </div>
                        </div>

                        {/* Step 2: Email Delivery */}
                        <div className="flex items-start gap-5 relative z-10">
                          <div className="w-7 h-7 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center shrink-0 mt-0.5 text-indigo-600">
                            <Check size={14} strokeWidth={4} />
                          </div>
                          <div>
                            <p className="text-base font-black text-slate-900">Email Dispatched</p>
                            <p className="text-xs text-slate-500 font-semibold mt-1">To: {selectedDetailCard.recipient_email || 'System Default'}</p>
                            <p className="text-xs text-slate-400 font-semibold mt-0.5">{new Date(selectedDetailCard.created_at).toLocaleString('en-IN')}</p>
                          </div>
                        </div>

                        {/* Step 3: Claim Status */}
                        <div className="flex items-start gap-5 relative z-10">
                          <div className={`w-7 h-7 rounded-full border-2 border-white flex items-center justify-center shrink-0 mt-0.5 ${selectedDetailCard.accepted_by_user_id ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                            {selectedDetailCard.accepted_by_user_id ? <Check size={14} strokeWidth={4} /> : <Clock size={14} strokeWidth={4} />}
                          </div>
                          <div>
                            <p className="text-base font-black text-slate-900">{selectedDetailCard.accepted_by_user_id ? 'Claimed & Activated' : 'Pending Acceptance'}</p>
                            <p className="text-xs text-slate-500 font-semibold mt-1">
                              {selectedDetailCard.accepted_by_user_id
                                ? `By: ${resolveUserName(selectedDetailCard.accepted_by_user_id)}`
                                : 'Awaiting user action'}
                            </p>
                            {selectedDetailCard.accepted_by_user_id && (
                              <p className="text-xs text-slate-400 font-semibold mt-0.5">{new Date(selectedDetailCard.updated_at || selectedDetailCard.created_at).toLocaleString('en-IN')}</p>
                            )}
                          </div>
                        </div>

                        {/* Step 4: Usage Status */}
                        <div className="flex items-start gap-5 relative z-10">
                          <div className={`w-7 h-7 rounded-full border-2 border-white flex items-center justify-center shrink-0 mt-0.5 ${selectedDetailCard.remaining_balance === 0
                              ? 'bg-indigo-600 text-white'
                              : selectedDetailCard.remaining_balance < selectedDetailCard.amount
                                ? 'bg-indigo-100 text-indigo-600'
                                : 'bg-slate-100 text-slate-400'
                            }`}>
                            {selectedDetailCard.remaining_balance === 0 ? <Check size={14} strokeWidth={4} /> : <Clock size={14} strokeWidth={4} />}
                          </div>
                          <div>
                            <p className="text-base font-black text-slate-900">
                              {selectedDetailCard.remaining_balance === 0
                                ? 'Fully Redeemed'
                                : selectedDetailCard.remaining_balance < selectedDetailCard.amount
                                  ? 'Partially Redeemed'
                                  : 'No Redemptions Yet'}
                            </p>
                            <p className="text-xs text-slate-500 font-semibold mt-1">
                              {selectedDetailCard.remaining_balance < selectedDetailCard.amount
                                ? `Amount used: ₹${(selectedDetailCard.amount - selectedDetailCard.remaining_balance).toLocaleString('en-IN')}`
                                : 'Ready to be used for booking'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Controls segment */}
              {!['expired', 'revoked', 'cancelled'].includes(selectedDetailCard.status) && (
                <div className="bg-slate-50 p-5 rounded-2xl flex justify-between items-center border border-slate-100 mt-2 relative z-10">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Admin Overrides</span>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleStatusUpdate(selectedDetailCard._id, selectedDetailCard.status, 'revoked')}
                      disabled={actionLoading}
                      className="px-5 py-2.5 bg-red-50 hover:bg-red-600 hover:text-white text-red-600 text-sm font-black rounded-xl transition-all border border-red-200"
                    >
                      Revoke Access
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(selectedDetailCard._id, selectedDetailCard.status, 'expired')}
                      disabled={actionLoading}
                      className="px-5 py-2.5 bg-orange-50 hover:bg-orange-500 hover:text-white text-orange-600 text-sm font-black rounded-xl transition-all border border-orange-200"
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

      {/* VERIFY & REMIND MODAL */}
      <AnimatePresence>
        {verifyModalCard && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setVerifyModalCard(null)}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
            ></motion.div>

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-xl w-full p-10 relative z-10 overflow-hidden flex flex-col gap-8"
            >
              <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/5 rounded-full blur-3xl -translate-y-16 translate-x-16 z-0"></div>

              {/* Header */}
              <div className="flex justify-between items-center relative z-10">
                <div>
                  <span className="text-xs font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded">REMINDER EMAIL</span>
                  <h3 className="text-3xl font-black text-slate-900 mt-4 font-mono tracking-wider">
                    {verifyModalCard.public_code}
                  </h3>
                </div>
                <button
                  onClick={() => setVerifyModalCard(null)}
                  className="w-12 h-12 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Action: Custom Reminder */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-8 relative z-10 shadow-inner mt-2">
                <div className="flex items-start gap-5 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200">
                    <Mail size={24} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-slate-900">Custom Email Reminder</h4>
                    <p className="text-sm font-semibold text-slate-500 mt-1 leading-relaxed">
                      Dispatch a personalized push to encourage the recipient to claim or utilize their voucher.
                    </p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="relative group">
                    <textarea
                      rows="5"
                      className="w-full bg-white border border-slate-200 rounded-xl p-5 text-sm md:text-base text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all custom-scrollbar placeholder:text-slate-400 resize-none shadow-sm group-hover:border-slate-300"
                      value={remindMessage}
                      onChange={(e) => setRemindMessage(e.target.value)}
                      placeholder="Type a friendly, engaging reminder message here..."
                    ></textarea>
                    <div className="absolute bottom-4 right-4 pointer-events-none">
                      <span className="bg-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded">Rich Text</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSendReminder(verifyModalCard._id)}
                    disabled={actionLoading}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-black rounded-xl transition-all shadow-[0_8px_20px_-6px_rgba(5,150,105,0.4)] flex items-center justify-center gap-2 transform hover:-translate-y-0.5 active:translate-y-0"
                  >
                    {actionLoading ? <RefreshCw size={18} className="animate-spin" /> : <Send size={18} />}
                    {actionLoading ? 'Dispatching...' : 'Dispatch Reminder Now'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* BULK REMINDER MODAL */}
      <AnimatePresence>
        {bulkReminderModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-100 my-8"
            >
              <div className="bg-amber-50 p-6 md:p-8 flex items-center justify-between border-b border-amber-100">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white rounded-2xl shadow-sm text-amber-600 border border-amber-100">
                    <Bell size={28} className="animate-pulse" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-amber-900">Send Bulk Reminders</h2>
                    <p className="text-amber-700 font-medium mt-1">Dispatching to {selectedTableCardIds.length} selected recipients.</p>
                  </div>
                </div>
                <button onClick={() => setBulkReminderModalOpen(false)} className="p-2 text-amber-500 hover:bg-amber-100 rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 md:p-8 space-y-6">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Custom Reminder Message</label>
                  <textarea
                    value={bulkReminderMessage}
                    onChange={(e) => setBulkReminderMessage(e.target.value)}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none text-slate-700 font-medium h-32 resize-none"
                  />
                  <p className="text-xs text-slate-400 mt-2 italic">* This message will be beautifully formatted inside a premium email template.</p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex items-start gap-3">
                  <ShieldAlert className="text-indigo-500 shrink-0 mt-0.5" size={20} />
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Smart Spam Protection Active</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      The system will automatically filter out recipients who have fully redeemed their cards, or who have received a reminder within the last 48 hours.
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-6 md:p-8 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-4">
                <button
                  onClick={() => setBulkReminderModalOpen(false)}
                  className="px-6 py-3 font-bold text-slate-500 hover:text-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendBulkReminders}
                  disabled={bulkReminderSubmitting || selectedTableCardIds.length === 0}
                  className="px-8 py-3 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black rounded-xl shadow-lg shadow-amber-600/20 flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95"
                >
                  {bulkReminderSubmitting ? (
                    <><RefreshCw size={18} className="animate-spin" /> Dispatching...</>
                  ) : (
                    <><Send size={18} /> Send {selectedTableCardIds.length} Reminders</>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* GORGEOUS MANUAL REDEEM MODAL (SALES OVERRIDE) */}
      <AnimatePresence>
        {redeemModalCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-lg w-full overflow-hidden"
            >
              {/* Header */}
              <div className="bg-indigo-600 p-6 md:p-8 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-black flex items-center gap-2">
                      <Wallet size={24} className="text-amber-300" />
                      Sales Manual Override
                    </h3>
                    <p className="text-indigo-200 text-sm mt-1 font-semibold">Instantly redeem voucher over a call.</p>
                  </div>
                  <button
                    onClick={handleCloseRedeemModal}
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 md:p-8 space-y-6">
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex justify-between items-center">
                  <div>
                    <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Card Reference</span>
                    <span className="font-mono font-bold text-indigo-600 text-lg">{redeemModalCard.public_code}</span>
                  </div>
                  <div className="text-right">
                    <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Max Available</span>
                    <span className="font-black text-slate-900 text-lg">₹{redeemModalCard.remaining_balance.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1 flex items-center gap-1.5">
                      <DollarSign size={14} className="text-emerald-500" /> Amount to Deduct <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <span className="text-slate-400 font-bold">₹</span>
                      </div>
                      <input
                        type="number"
                        value={redeemAmount}
                        onChange={(e) => setRedeemAmount(e.target.value)}
                        placeholder={`e.g. ${redeemModalCard.remaining_balance}`}
                        className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:bg-white text-base font-bold text-slate-800 transition-all outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1 flex items-center gap-1.5">
                      <FileText size={14} className="text-indigo-500" /> Booking ID / Lead Ref
                    </label>
                    <input
                      type="text"
                      value={redeemReference}
                      onChange={(e) => setRedeemReference(e.target.value)}
                      placeholder="e.g. BKG-98213 (Highly Recommended)"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:bg-white text-sm font-semibold text-slate-800 transition-all outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1 flex items-center gap-1.5">
                      <Info size={14} className="text-amber-500" /> Admin Note
                    </label>
                    <textarea
                      value={redeemNotes}
                      onChange={(e) => setRedeemNotes(e.target.value)}
                      placeholder="e.g. Redeemed over phone call with customer..."
                      rows="2"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:bg-white text-sm text-slate-800 transition-all outline-none resize-none"
                    ></textarea>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                  <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800 font-semibold leading-relaxed">
                    This is a financial override. The deducted amount will be permanently recorded in the ledger against your admin account.
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                <button
                  onClick={handleCloseRedeemModal}
                  className="px-5 py-2.5 font-bold text-slate-500 hover:text-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleManualRedeem}
                  disabled={isRedeeming || !redeemAmount}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-black rounded-xl shadow-lg shadow-indigo-600/20 flex items-center gap-2 transition-all"
                >
                  {isRedeeming ? (
                    <><RefreshCw size={16} className="animate-spin" /> Processing...</>
                  ) : (
                    <><Check size={16} /> Confirm Deduction</>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default BulkGiftCard;
