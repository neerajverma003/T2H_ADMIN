import React, { useState, useEffect, useRef } from 'react';
import {
  Mail,
  Send,
  Paperclip,
  Bookmark,
  Trash2,
  Settings,
  Users,
  Eye,
  X,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  RemoveFormatting,
  Link as LinkIcon,
  RefreshCw,
  Sparkles,
  Search,
  User,
  CheckCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { apiClient } from '../../stores/authStores';
import useAuthStore from '../../stores/authStores';
import ManageSendersModal from './ManageSendersModal';
import LiveEmailPreviewModal from './LiveEmailPreviewModal';
import ContactsDirectoryModal from './ContactsDirectoryModal';
import DraftsList from './DraftsList';
import SentHistoryList from './SentHistoryList';

export default function DirectMailer() {
  const { username, role } = useAuthStore();

  // Active Tab: 'compose' | 'drafts' | 'history'
  const [activeTab, setActiveTab] = useState('compose');

  // Multi-Senders state
  const [senders, setSenders] = useState([]);
  const [selectedSenderId, setSelectedSenderId] = useState('');
  const [isManageSendersOpen, setIsManageSendersOpen] = useState(false);

  // Form State
  const [currentDraftId, setCurrentDraftId] = useState(null);
  
  // Recipients: Selected whole groups ('customers', 'admins')
  const [selectedGroups, setSelectedGroups] = useState([]);
  
  // Recipients: Individual selected contacts [{ id, name, email, role }]
  const [recipients, setRecipients] = useState([]);
  const [recipientInput, setRecipientInput] = useState('');

  // Typeahead inline search suggestions
  const [suggestions, setSuggestions] = useState([]);
  const [isSearchingSuggestions, setIsSearchingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Structured list expansion
  const [showStructuredDrawer, setShowStructuredDrawer] = useState(false);
  const [drawerSearch, setDrawerSearch] = useState('');

  const [ccList, setCcList] = useState([]);
  const [ccInput, setCcInput] = useState('');
  const [bccList, setBccList] = useState([]);
  const [bccInput, setBccInput] = useState('');
  const [showCcBcc, setShowCcBcc] = useState(false);
  const [subject, setSubject] = useState('');
  const [emailStyle, setEmailStyle] = useState('normal'); // 'normal' | 'template'
  const [attachments, setAttachments] = useState([]);
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);

  // Counts for quick chips
  const [contactCounts, setContactCounts] = useState({ customersCount: 0, adminsCount: 0 });

  // Drafts & History counts
  const [drafts, setDrafts] = useState([]);
  const [sentHistory, setSentHistory] = useState([]);

  // Modals
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isContactsDirectoryOpen, setIsContactsDirectoryOpen] = useState(false);
  const [directoryFilter, setDirectoryFilter] = useState('all'); // 'all' | 'customers' | 'admins'

  // Loading States
  const [isSending, setIsSending] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  // Editor Ref
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const inputContainerRef = useRef(null);

  useEffect(() => {
    fetchSenders();
    fetchContactCounts();
    fetchDrafts();
    fetchHistory();
  }, []);

  // Handle outside click to close typeahead suggestions
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (inputContainerRef.current && !inputContainerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const fetchSenders = async () => {
    try {
      const res = await apiClient.get('/admin/direct-mail/senders');
      if (res.data.success) {
        setSenders(res.data.senders || []);
        const defaultSender = res.data.senders?.find((s) => s.isDefault);
        if (defaultSender) {
          setSelectedSenderId(defaultSender._id);
        } else if (res.data.senders?.length > 0) {
          setSelectedSenderId(res.data.senders[0]._id);
        }
      }
    } catch (err) {
      console.error('Failed to load senders:', err);
    }
  };

  const fetchContactCounts = async () => {
    try {
      const res = await apiClient.get('/admin/direct-mail/contacts?limit=1');
      if (res.data.success && res.data.counts) {
        setContactCounts(res.data.counts);
      }
    } catch (err) {
      console.error('Failed to load contact counts:', err);
    }
  };

  const fetchDrafts = async () => {
    try {
      const res = await apiClient.get('/admin/direct-mail/drafts');
      if (res.data.success) {
        setDrafts(res.data.drafts || []);
      }
    } catch (err) {
      console.error('Failed to fetch drafts:', err);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await apiClient.get('/admin/direct-mail/history');
      if (res.data.success) {
        setSentHistory(res.data.history || []);
      }
    } catch (err) {
      console.error('Failed to fetch history:', err);
    }
  };

  const currentSender = senders.find((s) => s._id === selectedSenderId) || {
    label: username || 'Super Admin',
    email: 'support@trip2honeymoon.com',
  };

  // ----------------------------------------------------
  // REAL-TIME NAME / EMAIL SEARCH TYPEAHEAD
  // ----------------------------------------------------
  const handleRecipientInputChange = (val) => {
    setRecipientInput(val);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!val.trim() || val.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearchingSuggestions(true);
      try {
        const res = await apiClient.get('/admin/direct-mail/contacts', {
          params: { q: val.trim(), limit: 8 },
        });
        if (res.data.success && res.data.contacts) {
          setSuggestions(res.data.contacts);
          setShowSuggestions(true);
        }
      } catch (err) {
        console.error('Suggestion search error:', err);
      } finally {
        setIsSearchingSuggestions(false);
      }
    }, 200);
  };

  const handleSelectSuggestion = (contact) => {
    if (!contact?.email) return;
    const exists = recipients.some((r) => (typeof r === 'string' ? r : r.email).toLowerCase() === contact.email.toLowerCase());
    if (!exists) {
      setRecipients([...recipients, contact]);
    }
    setRecipientInput('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleAddCustomRecipient = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = recipientInput.trim().replace(',', '');
      if (val && val.includes('@')) {
        const exists = recipients.some((r) => (typeof r === 'string' ? r : r.email).toLowerCase() === val.toLowerCase());
        if (!exists) {
          setRecipients([...recipients, { name: val, email: val, role: 'Custom' }]);
        }
        setRecipientInput('');
        setShowSuggestions(false);
      }
    }
  };

  const removeRecipient = (indexToRemove) => {
    setRecipients(recipients.filter((_, idx) => idx !== indexToRemove));
  };

  // Toggle group selection: 'customers' or 'admins'
  const toggleGroup = (group) => {
    if (selectedGroups.includes(group)) {
      setSelectedGroups(selectedGroups.filter((g) => g !== group));
    } else {
      setSelectedGroups([...selectedGroups, group]);
      toast.info(`Selected All ${group === 'customers' ? 'Customers' : 'Admins'}`);
    }
  };

  const handleAddCc = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = ccInput.trim().replace(',', '');
      if (val && val.includes('@') && !ccList.includes(val)) {
        setCcList([...ccList, val]);
        setCcInput('');
      }
    }
  };

  const handleAddBcc = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = bccInput.trim().replace(',', '');
      if (val && val.includes('@') && !bccList.includes(val)) {
        setBccList([...bccList, val]);
        setBccInput('');
      }
    }
  };

  // ----------------------------------------------------
  // RICH TEXT TOOLBAR ACTIONS
  // ----------------------------------------------------
  const executeCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  const handleInsertLink = () => {
    const url = prompt('Enter the destination URL (e.g. https://trip2honeymoon.com):');
    if (url) {
      executeCommand('createLink', url);
    }
  };

  // ----------------------------------------------------
  // ATTACHMENT HANDLING
  // ----------------------------------------------------
  const handleFileAttach = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsUploadingAttachment(true);
    try {
      for (const file of files) {
        const presignedRes = await apiClient.post('/admin/generate-presigned-url', {
          fileName: file.name,
          fileType: file.type || 'application/octet-stream',
          folder: 'outreach/attachments',
        });

        const { uploadUrl, key, publicUrl, viewUrl } = presignedRes.data;

        await fetch(uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': file.type || 'application/octet-stream' },
          body: file,
        });

        setAttachments((prev) => [
          ...prev,
          {
            filename: file.name,
            url: viewUrl || publicUrl,
            key,
            size: file.size,
            contentType: file.type,
          },
        ]);
      }
      toast.success(`${files.length} file(s) attached successfully`);
    } catch (err) {
      console.error('File upload error:', err);
      toast.error('Failed to upload file attachment');
    } finally {
      setIsUploadingAttachment(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (index) => {
    setAttachments(attachments.filter((_, idx) => idx !== index));
  };

  // Calculate total resolved recipients
  const getTotalRecipientsCount = () => {
    let count = recipients.length + ccList.length + bccList.length;
    if (selectedGroups.includes('customers')) count += contactCounts.customersCount;
    if (selectedGroups.includes('admins')) count += contactCounts.adminsCount;
    return count;
  };

  const getEditorStats = () => {
    const text = editorRef.current ? editorRef.current.innerText || '' : '';
    const charCount = text.length;
    const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
    return { charCount, wordCount, totalRecipients: getTotalRecipientsCount() };
  };

  // ----------------------------------------------------
  // DISCARD / CLEAR FORM
  // ----------------------------------------------------
  const handleClear = () => {
    if (window.confirm('Discard current message and reset composer?')) {
      setCurrentDraftId(null);
      setSelectedGroups([]);
      setRecipients([]);
      setRecipientInput('');
      setCcList([]);
      setBccList([]);
      setSubject('');
      setEmailStyle('normal');
      setAttachments([]);
      if (editorRef.current) editorRef.current.innerHTML = '';
      toast.info('Composer reset');
    }
  };

  // ----------------------------------------------------
  // SAVE DRAFT
  // ----------------------------------------------------
  const handleSaveDraft = async () => {
    const bodyHtml = editorRef.current ? editorRef.current.innerHTML : '';
    setIsSavingDraft(true);
    try {
      const recipientEmails = recipients.map((r) => (typeof r === 'string' ? r : r.email));
      const res = await apiClient.post('/admin/direct-mail/drafts/save', {
        draftId: currentDraftId,
        senderId: selectedSenderId || null,
        senderEmail: currentSender.email,
        senderName: currentSender.label,
        to: recipientEmails,
        cc: ccList,
        bcc: bccList,
        recipientGroups: selectedGroups,
        subject,
        emailStyle,
        body: bodyHtml,
        attachments,
      });

      if (res.data.success) {
        setCurrentDraftId(res.data.draft._id);
        toast.success('Draft saved successfully');
        fetchDrafts();
      }
    } catch (err) {
      toast.error('Failed to save draft');
    } finally {
      setIsSavingDraft(false);
    }
  };

  // Resume Draft in Composer
  const handleResumeDraft = (draft) => {
    setCurrentDraftId(draft._id);
    setSelectedSenderId(draft.senderId || selectedSenderId);
    setSelectedGroups(draft.recipientGroups || []);

    const loadedRecips = (draft.to || []).map((e) => ({
      name: e,
      email: e,
      role: 'Contact',
    }));
    setRecipients(loadedRecips);

    setCcList(draft.cc || []);
    setBccList(draft.bcc || []);
    setShowCcBcc((draft.cc?.length || 0) > 0 || (draft.bcc?.length || 0) > 0);
    setSubject(draft.subject || '');
    setEmailStyle(draft.emailStyle || 'normal');
    setAttachments(draft.attachments || []);

    // Switch to compose tab
    setActiveTab('compose');

    // Populate editor innerHTML immediately and on next tick
    const draftHtml = draft.body || '';
    if (editorRef.current) {
      editorRef.current.innerHTML = draftHtml;
    }
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.innerHTML = draftHtml;
      }
    }, 50);

    toast.info('Draft loaded into composer');
  };

  // ----------------------------------------------------
  // SEND MESSAGE
  // ----------------------------------------------------
  const handleSendMessage = async () => {
    const finalEmails = recipients.map((r) => (typeof r === 'string' ? r : r.email));

    if (finalEmails.length === 0 && selectedGroups.length === 0 && bccList.length === 0) {
      toast.warning('Please select at least one recipient or group');
      return;
    }

    if (!subject.trim()) {
      toast.warning('Please enter an email subject');
      return;
    }

    const bodyHtml = editorRef.current ? editorRef.current.innerHTML.trim() : '';
    if (!bodyHtml || bodyHtml === '<br>') {
      toast.warning('Please enter email message content');
      return;
    }

    setIsSending(true);
    try {
      const res = await apiClient.post('/admin/direct-mail/send', {
        senderId: selectedSenderId || null,
        to: finalEmails,
        cc: ccList,
        bcc: bccList,
        recipientGroups: selectedGroups,
        subject: subject.trim(),
        emailStyle,
        body: bodyHtml,
        attachments,
        draftId: currentDraftId,
      });

      if (res.data.success) {
        toast.success(res.data.msg || 'Outreach email dispatched successfully!');
        // Reset composer
        setCurrentDraftId(null);
        setSelectedGroups([]);
        setRecipients([]);
        setCcList([]);
        setBccList([]);
        setSubject('');
        setAttachments([]);
        if (editorRef.current) editorRef.current.innerHTML = '';
        fetchDrafts();
        fetchHistory();
      }
    } catch (err) {
      const msg = err.response?.data?.msg || err.message || 'Failed to dispatch email';
      toast.error(msg);
    } finally {
      setIsSending(false);
    }
  };

  // Contacts filtered for structured drawer search
  const filteredDrawerRecipients = recipients.filter((r) => {
    if (!drawerSearch.trim()) return true;
    const q = drawerSearch.toLowerCase();
    const name = (r.name || '').toLowerCase();
    const email = (r.email || '').toLowerCase();
    return name.includes(q) || email.includes(q);
  });

  const { charCount, wordCount, totalRecipients } = getEditorStats();

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-fade-in">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              Direct Outreach & Partner Mailer
            </h1>
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600"></span>
            </span>
            <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase rounded-full bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400 tracking-wider">
              LIVE
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Direct Gmail-style composer for communicating with Registered Customers, Admins, and Travel Partners.
          </p>
        </div>

        {/* Top Right Tab Nav */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('compose')}
            className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-sm ${
              activeTab === 'compose'
                ? 'bg-red-600 text-white shadow-red-600/20'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <Send size={14} />
            Compose Email
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('drafts')}
            className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-sm ${
              activeTab === 'drafts'
                ? 'bg-red-600 text-white shadow-red-600/20'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <Bookmark size={14} />
            Drafts ({drafts.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-sm ${
              activeTab === 'history'
                ? 'bg-red-600 text-white shadow-red-600/20'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <Mail size={14} />
            Sent History ({sentHistory.length})
          </button>
        </div>
      </div>

      {/* VIEW: DRAFTS */}
      {activeTab === 'drafts' && (
        <DraftsList
          drafts={drafts}
          onResumeDraft={handleResumeDraft}
          onRefreshDrafts={fetchDrafts}
        />
      )}

      {/* VIEW: SENT HISTORY */}
      {activeTab === 'history' && (
        <SentHistoryList
          history={sentHistory}
          onRefreshHistory={fetchHistory}
        />
      )}

      {/* VIEW: COMPOSE EMAIL */}
      <div className={activeTab === 'compose' ? 'block' : 'hidden'}>
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition">
          
          {/* Card Window Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
              </div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-2">
                New Message • Communication & Outreach
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsPreviewOpen(true)}
              className="text-xs font-bold text-red-600 dark:text-red-400 hover:text-red-700 flex items-center gap-1.5 px-3 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition cursor-pointer"
            >
              <Eye size={14} />
              Live Preview
            </button>
          </div>

          <div className="p-6 space-y-4">

            {/* Row 1: From Identity */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 w-32 shrink-0">
                <span className="text-red-500">👤</span> From Identity:
              </span>

              <div className="flex flex-1 items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={currentSender.label || 'Super Admin'}
                  className="px-3 py-2 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 w-44"
                />

                <select
                  value={selectedSenderId}
                  onChange={(e) => setSelectedSenderId(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 font-mono"
                >
                  {senders.length > 0 ? (
                    senders.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.label} ({s.email}) {s.isDefault ? '— [DEFAULT]' : ''}
                      </option>
                    ))
                  ) : (
                    <option value="">-- No sender configured (Click Manage Senders) --</option>
                  )}
                </select>

                <button
                  type="button"
                  onClick={() => setIsManageSendersOpen(true)}
                  className="px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl flex items-center gap-1.5 transition shrink-0"
                >
                  <Settings size={14} />
                  Manage Senders
                </button>
              </div>
            </div>

            {/* Row 2: To (Recipient) */}
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 w-32 shrink-0">
                  <span className="text-red-500">✈️</span> To (Recipient):
                </span>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Select Customers */}
                  <button
                    type="button"
                    onClick={() => {
                      setDirectoryFilter('customers');
                      setIsContactsDirectoryOpen(true);
                    }}
                    className="px-3 py-1 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer border bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/50 hover:bg-amber-100"
                    title="Click to view and pick specific customers"
                  >
                    <span>👥</span> Customers ({contactCounts.customersCount})
                  </button>

                  {/* Select Admins */}
                  <button
                    type="button"
                    onClick={() => {
                      setDirectoryFilter('admins');
                      setIsContactsDirectoryOpen(true);
                    }}
                    className="px-3 py-1 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer border bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-900/50 hover:bg-purple-100"
                    title="Click to view and pick specific administrators"
                  >
                    <span>🛡️</span> Admins ({contactCounts.adminsCount})
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowCcBcc(!showCcBcc)}
                    className="px-2.5 py-1 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 transition"
                  >
                    Cc / Bcc
                  </button>
                </div>
              </div>

              {/* Recipient Input Box with Structured Chips & Typeahead Dropdown */}
              <div ref={inputContainerRef} className="relative">
                <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus-within:ring-2 focus-within:ring-red-500/20 focus-within:border-red-500 min-h-[46px]">
                  
                  {/* Group Badges (Clean single-pill representation instead of 15 raw tags) */}
                  {selectedGroups.includes('customers') && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800/80 shadow-xs">
                      <span>👥</span> All Customers ({contactCounts.customersCount})
                      <button
                        type="button"
                        onClick={() => toggleGroup('customers')}
                        className="hover:text-red-600 ml-1"
                      >
                        <X size={13} />
                      </button>
                    </span>
                  )}

                  {selectedGroups.includes('admins') && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-300 dark:border-purple-800/80 shadow-xs">
                      <span>🛡️</span> All Admins ({contactCounts.adminsCount})
                      <button
                        type="button"
                        onClick={() => toggleGroup('admins')}
                        className="hover:text-red-600 ml-1"
                      >
                        <X size={13} />
                      </button>
                    </span>
                  )}

                  {/* Individual Selected Recipient Chips */}
                  {recipients.map((recip, idx) => {
                    const name = typeof recip === 'object' ? recip.name : recip;
                    const email = typeof recip === 'object' ? recip.email : recip;
                    const isNamed = name && name !== email;

                    return (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/40"
                      >
                        <span className="font-semibold">{name}</span>
                        {isNamed && (
                          <span className="text-[10px] text-blue-500 font-mono">
                            &lt;{email}&gt;
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => removeRecipient(idx)}
                          className="hover:text-red-600 ml-0.5"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    );
                  })}

                  {/* Real-time Name / Email Input Field */}
                  <input
                    type="text"
                    value={recipientInput}
                    onChange={(e) => handleRecipientInputChange(e.target.value)}
                    onKeyDown={handleAddCustomRecipient}
                    placeholder={
                      recipients.length === 0 && selectedGroups.length === 0
                        ? 'Type a customer or admin name (e.g. Neeraj, Mohd), or enter email...'
                        : 'Search more by name or enter email...'
                    }
                    className="flex-1 min-w-[240px] text-xs bg-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none py-1.5"
                  />
                </div>

                {/* Real-time Name Search Floating Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 z-40 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden animate-fade-in max-h-64 overflow-y-auto custom-scrollbar">
                    <div className="p-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                      Matching Contacts (Click to select)
                    </div>
                    {suggestions.map((contact) => (
                      <div
                        key={contact.id || contact.email}
                        onClick={() => handleSelectSuggestion(contact)}
                        className="flex items-center justify-between p-3 hover:bg-blue-50 dark:hover:bg-blue-950/30 cursor-pointer transition border-b border-slate-50 dark:border-slate-800/50 last:border-b-0"
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold ${
                              contact.role === 'Customer'
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                                : 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                            }`}
                          >
                            {contact.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                                {contact.name}
                              </span>
                              <span
                                className={`px-1.5 py-0.2 text-[9px] font-extrabold uppercase rounded ${
                                  contact.role === 'Customer'
                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                                    : 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                                }`}
                              >
                                {contact.role}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-500 font-mono">
                              {contact.email}
                            </span>
                          </div>
                        </div>

                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">
                          + Add
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Links & Structured Drawer Toggle */}
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setDirectoryFilter('all');
                    setIsContactsDirectoryOpen(true);
                  }}
                  className="text-xs font-bold text-red-600 hover:text-red-700 dark:text-red-400 flex items-center gap-1.5 hover:underline"
                >
                  <span>🔍</span> Open Contacts Directory (Search by Name & Multi-Select)
                </button>

                {(recipients.length > 0 || selectedGroups.length > 0) && (
                  <button
                    type="button"
                    onClick={() => setShowStructuredDrawer(!showStructuredDrawer)}
                    className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1"
                  >
                    <span>📋</span>
                    {showStructuredDrawer ? 'Hide Structured List' : `View Recipients List (${totalRecipients})`}
                    {showStructuredDrawer ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                  </button>
                )}
              </div>

              {/* Structured Recipients List Drawer */}
              {showStructuredDrawer && (
                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 mt-2 animate-fade-in">
                  <div className="flex items-center justify-between gap-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Structured Recipients Breakdown ({totalRecipients} Total)
                    </h4>

                    {recipients.length > 5 && (
                      <div className="relative w-48">
                        <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          value={drawerSearch}
                          onChange={(e) => setDrawerSearch(e.target.value)}
                          placeholder="Filter list..."
                          className="w-full pl-7 pr-2 py-1 text-[11px] rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none"
                        />
                      </div>
                    )}
                  </div>

                  {/* Group Badges List */}
                  {selectedGroups.length > 0 && (
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-700">
                      <span className="text-[11px] font-bold text-slate-500">Target Groups:</span>
                      {selectedGroups.includes('customers') && (
                        <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 flex items-center gap-1">
                          👥 All Registered Customers ({contactCounts.customersCount})
                          <button type="button" onClick={() => toggleGroup('customers')} className="hover:text-red-600">
                            <X size={12} />
                          </button>
                        </span>
                      )}
                      {selectedGroups.includes('admins') && (
                        <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 flex items-center gap-1">
                          🛡️ All System Administrators ({contactCounts.adminsCount})
                          <button type="button" onClick={() => toggleGroup('admins')} className="hover:text-red-600">
                            <X size={12} />
                          </button>
                        </span>
                      )}
                    </div>
                  )}

                  {/* Individual Recipients Structured Table */}
                  {filteredDrawerRecipients.length > 0 ? (
                    <div className="max-h-52 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800 custom-scrollbar">
                      {filteredDrawerRecipients.map((r, i) => (
                        <div key={i} className="flex items-center justify-between p-2.5 text-xs">
                          <div className="flex items-center gap-2.5 min-w-0 pr-2">
                            <span className="w-5 h-5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-400 flex items-center justify-center">
                              {i + 1}
                            </span>
                            <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                              {r.name || r.email}
                            </span>
                            {r.role && (
                              <span className="px-1.5 py-0.2 text-[9px] font-extrabold uppercase rounded bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                                {r.role}
                              </span>
                            )}
                            <span className="text-[11px] text-slate-500 font-mono truncate">
                              {r.email}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeRecipient(i)}
                            className="p-1 text-slate-400 hover:text-red-600 transition"
                            title="Remove Recipient"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    recipients.length === 0 && (
                      <p className="text-xs text-slate-500 italic">
                        No individual recipients added. Outreach will deliver to all members of the selected groups above.
                      </p>
                    )
                  )}
                </div>
              )}
            </div>

            {/* Optional CC & BCC Rows */}
            {showCcBcc && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* CC */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Cc (Carbon Copy):
                  </label>
                  <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 min-h-[38px]">
                    {ccList.map((c, i) => (
                      <span key={i} className="px-2 py-0.5 text-xs bg-slate-100 dark:bg-slate-800 rounded-md flex items-center gap-1">
                        {c}
                        <button type="button" onClick={() => setCcList(ccList.filter((_, idx) => idx !== i))}>
                          <X size={11} />
                        </button>
                      </span>
                    ))}
                    <input
                      type="text"
                      value={ccInput}
                      onChange={(e) => setCcInput(e.target.value)}
                      onKeyDown={handleAddCc}
                      placeholder="Add Cc email..."
                      className="flex-1 text-xs bg-transparent focus:outline-none min-w-[120px]"
                    />
                  </div>
                </div>

                {/* BCC */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Bcc (Blind Carbon Copy):
                  </label>
                  <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 min-h-[38px]">
                    {bccList.map((b, i) => (
                      <span key={i} className="px-2 py-0.5 text-xs bg-slate-100 dark:bg-slate-800 rounded-md flex items-center gap-1">
                        {b}
                        <button type="button" onClick={() => setBccList(bccList.filter((_, idx) => idx !== i))}>
                          <X size={11} />
                        </button>
                      </span>
                    ))}
                    <input
                      type="text"
                      value={bccInput}
                      onChange={(e) => setBccInput(e.target.value)}
                      onKeyDown={handleAddBcc}
                      placeholder="Add Bcc email..."
                      className="flex-1 text-xs bg-transparent focus:outline-none min-w-[120px]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Row 3: Subject */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300 w-32 shrink-0">
                Subject:
              </span>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Important Notification & Updates for Trip2Honeymoon Partners"
                className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition"
              />
            </div>

            {/* Row 4: Email Style (Normal Mail vs Template Mail) */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-xs pt-1">
              <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 w-32 shrink-0">
                <span className="text-red-500">✉️</span> Email Style:
              </span>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setEmailStyle('normal')}
                  className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition cursor-pointer ${
                    emailStyle === 'normal'
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  <span>✉️</span> Normal Mail
                </button>

                <button
                  type="button"
                  onClick={() => setEmailStyle('template')}
                  className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition cursor-pointer ${
                    emailStyle === 'template'
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  <Sparkles size={13} /> Template Mail
                </button>

                <span className="text-[11px] text-slate-400 italic">
                  {emailStyle === 'normal'
                    ? 'Standard letter format without banner or logo'
                    : 'Full structured luxury branded layout with logo, banner & official footer'}
                </span>
              </div>
            </div>

            {/* Row 5: Rich Text Editor & Custom Toolbar */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-900 shadow-inner">
              
              {/* Toolbar */}
              <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300">
                <select
                  onChange={(e) => executeCommand('formatBlock', e.target.value)}
                  defaultValue="p"
                  className="px-2 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 focus:outline-none mr-2 font-medium"
                >
                  <option value="p">Normal</option>
                  <option value="h1">Heading 1</option>
                  <option value="h2">Heading 2</option>
                  <option value="h3">Heading 3</option>
                </select>

                <button
                  type="button"
                  onClick={() => executeCommand('bold')}
                  className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition"
                  title="Bold"
                >
                  <Bold size={15} />
                </button>

                <button
                  type="button"
                  onClick={() => executeCommand('italic')}
                  className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition"
                  title="Italic"
                >
                  <Italic size={15} />
                </button>

                <button
                  type="button"
                  onClick={() => executeCommand('underline')}
                  className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition"
                  title="Underline"
                >
                  <Underline size={15} />
                </button>

                <button
                  type="button"
                  onClick={() => executeCommand('strikeThrough')}
                  className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition"
                  title="Strikethrough"
                >
                  <Strikethrough size={15} />
                </button>

                <span className="w-px h-4 bg-slate-300 dark:bg-slate-600 mx-1"></span>

                <button
                  type="button"
                  onClick={() => executeCommand('insertUnorderedList')}
                  className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition"
                  title="Bullet List"
                >
                  <List size={15} />
                </button>

                <button
                  type="button"
                  onClick={() => executeCommand('insertOrderedList')}
                  className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition"
                  title="Numbered List"
                >
                  <ListOrdered size={15} />
                </button>

                <button
                  type="button"
                  onClick={handleInsertLink}
                  className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition"
                  title="Insert Link"
                >
                  <LinkIcon size={15} />
                </button>

                <button
                  type="button"
                  onClick={() => executeCommand('removeFormat')}
                  className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition text-slate-500"
                  title="Clear Formatting"
                >
                  <RemoveFormatting size={15} />
                </button>
              </div>

              {/* Editable Body Canvas */}
              <div
                ref={editorRef}
                contentEditable
                className="p-4 min-h-[220px] max-h-[420px] overflow-y-auto text-sm text-slate-900 dark:text-slate-100 focus:outline-none prose dark:prose-invert max-w-none custom-scrollbar"
                placeholder="Write your email outreach message here..."
              />
            </div>

            {/* Attached Files List (if any) */}
            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {attachments.map((att, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                  >
                    <Paperclip size={13} className="text-slate-500" />
                    <span className="truncate max-w-xs">{att.filename}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      ({Math.round((att.size || 0) / 1024)} KB)
                    </span>
                    <button
                      type="button"
                      onClick={() => removeAttachment(i)}
                      className="text-slate-400 hover:text-red-600 transition ml-1"
                    >
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Row 6: Bottom Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-slate-100 dark:border-slate-800">
              
              {/* Stats */}
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {charCount} characters • {wordCount} words • {totalRecipients} recipients
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                
                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileAttach}
                  multiple
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingAttachment}
                  className="px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Paperclip size={14} className={isUploadingAttachment ? 'animate-spin' : ''} />
                  {isUploadingAttachment ? 'Uploading...' : 'Attach Files'}
                </button>

                <button
                  type="button"
                  onClick={handleSaveDraft}
                  disabled={isSavingDraft}
                  className="px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Bookmark size={14} />
                  {isSavingDraft ? 'Saving...' : 'Save Draft'}
                </button>

                <button
                  type="button"
                  onClick={handleSendMessage}
                  disabled={isSending}
                  className="px-5 py-2 text-xs font-extrabold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:opacity-50 rounded-xl shadow-md shadow-red-600/25 flex items-center gap-2 transition cursor-pointer"
                >
                  {isSending ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      Send Message
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleClear}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition cursor-pointer"
                  title="Discard & Reset"
                >
                  <Trash2 size={16} />
                </button>
              </div>

            </div>

          </div>

        </div>
      </div>

      {/* MODALS */}
      <ManageSendersModal
        isOpen={isManageSendersOpen}
        onClose={() => setIsManageSendersOpen(false)}
        senders={senders}
        onRefreshSenders={fetchSenders}
      />

      <LiveEmailPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        subject={subject}
        senderName={currentSender.label}
        senderEmail={currentSender.email}
        to={
          selectedGroups.length > 0
            ? [
                ...selectedGroups.map((g) => (g === 'customers' ? `All Customers (${contactCounts.customersCount})` : `All Admins (${contactCounts.adminsCount})`)),
                ...recipients.map((r) => (typeof r === 'object' ? `${r.name} <${r.email}>` : r)),
              ]
            : recipients.map((r) => (typeof r === 'object' ? `${r.name} <${r.email}>` : r))
        }
        cc={ccList}
        body={editorRef.current ? editorRef.current.innerHTML : ''}
        attachments={attachments}
        defaultEmailStyle={emailStyle}
      />

      <ContactsDirectoryModal
        isOpen={isContactsDirectoryOpen}
        onClose={() => setIsContactsDirectoryOpen(false)}
        defaultFilter={directoryFilter}
        selectedRecipients={recipients}
        onApplyRecipients={(updated) => setRecipients(updated)}
      />

    </div>
  );
}
