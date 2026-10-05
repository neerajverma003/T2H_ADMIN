import React, { useState, useMemo } from 'react';
import {
  Send,
  CheckCircle2,
  AlertCircle,
  Paperclip,
  Clock,
  User,
  Eye,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  FileText,
  ExternalLink,
  Sparkles,
  Mail,
  Users,
  Filter,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { apiClient } from '../../stores/authStores';

export default function SentHistoryList({ history = [], onRefreshHistory }) {
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'sent' | 'failed'
  const [styleFilter, setStyleFilter] = useState('all'); // 'all' | 'template' | 'normal'

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // View Modal state
  const [viewMail, setViewMail] = useState(null);

  // Delete loading state
  const [isDeletingId, setIsDeletingId] = useState(null);

  // Filtered dataset
  const filteredHistory = useMemo(() => {
    return (history || []).filter((item) => {
      // Status filter
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;

      // Style filter
      if (styleFilter !== 'all' && item.emailStyle !== styleFilter) return false;

      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const subject = (item.subject || '').toLowerCase();
        const senderName = (item.senderName || '').toLowerCase();
        const senderEmail = (item.senderEmail || '').toLowerCase();
        const toRecips = (item.to || []).join(' ').toLowerCase();
        const ccRecips = (item.cc || []).join(' ').toLowerCase();
        const bccRecips = (item.bcc || []).join(' ').toLowerCase();

        return (
          subject.includes(query) ||
          senderName.includes(query) ||
          senderEmail.includes(query) ||
          toRecips.includes(query) ||
          ccRecips.includes(query) ||
          bccRecips.includes(query)
        );
      }

      return true;
    });
  }, [history, searchTerm, statusFilter, styleFilter]);

  // Reset to page 1 when filters change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleStyleFilterChange = (style) => {
    setStyleFilter(style);
    setCurrentPage(1);
  };

  // Pagination calculations
  const totalItems = filteredHistory.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedItems = filteredHistory.slice(startIndex, endIndex);

  // Handle Delete
  const handleDeleteSentMail = async (e, mail) => {
    e.stopPropagation();
    const mailId = mail._id;
    const mailSubject = mail.subject || 'this outreach mail';

    if (
      !window.confirm(
        `Are you sure you want to delete the record for "${mailSubject}" from Sent History?\nThis action cannot be undone.`
      )
    ) {
      return;
    }

    setIsDeletingId(mailId);
    try {
      const res = await apiClient.delete(`/admin/direct-mail/history/${mailId}`);
      if (res.data.success) {
        toast.success(res.data.msg || 'Outreach record deleted from history');
        if (viewMail && viewMail._id === mailId) {
          setViewMail(null);
        }
        if (onRefreshHistory) {
          onRefreshHistory();
        }
      } else {
        toast.error(res.data.msg || 'Failed to delete record');
      }
    } catch (err) {
      console.error('Delete sent mail error:', err);
      toast.error(err.response?.data?.msg || err.message || 'Failed to delete history record');
    } finally {
      setIsDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* ── SEARCH & FILTER CONTROLS BAR ── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 w-full max-w-md">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
            size={16}
          />
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search by subject, sender, or recipient..."
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 pl-10 pr-4 py-2 text-xs font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/20 transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm('');
                setCurrentPage(1);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filters & Items Per Page */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-950/50 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => handleStatusFilterChange('all')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              All ({history.length})
            </button>
            <button
              type="button"
              onClick={() => handleStatusFilterChange('sent')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                statusFilter === 'sent'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Sent
            </button>
            <button
              type="button"
              onClick={() => handleStatusFilterChange('failed')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                statusFilter === 'failed'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Failed
            </button>
          </div>

          {/* Email Style Filter */}
          <select
            value={styleFilter}
            onChange={(e) => handleStyleFilterChange(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:border-red-500 cursor-pointer"
          >
            <option value="all">All Styles</option>
            <option value="template">Template Mail</option>
            <option value="normal">Normal Mail</option>
          </select>

          {/* Per Page Selector */}
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:border-red-500 cursor-pointer"
          >
            <option value={5}>5 / page</option>
            <option value={10}>10 / page</option>
            <option value={20}>20 / page</option>
            <option value={50}>50 / page</option>
          </select>
        </div>
      </div>

      {/* ── TABLE VIEW ── */}
      {filteredHistory.length === 0 ? (
        <div className="py-20 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-3">
            <Send size={22} />
          </div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            {searchTerm || statusFilter !== 'all' || styleFilter !== 'all'
              ? 'No Matching Outreach Records'
              : 'No Outbound Outreach History'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            {searchTerm || statusFilter !== 'all' || styleFilter !== 'all'
              ? 'Try adjusting your search criteria or resetting filters.'
              : 'Outreach messages sent from the composer will be recorded here with delivery receipts.'}
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                  <th className="px-5 py-3.5 w-12 text-center">#</th>
                  <th className="px-5 py-3.5">Subject & Outreach Style</th>
                  <th className="px-5 py-3.5">Sender Identity</th>
                  <th className="px-5 py-3.5">Recipients</th>
                  <th className="px-5 py-3.5">Delivery Status</th>
                  <th className="px-5 py-3.5">Dispatched At</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                {paginatedItems.map((item, index) => {
                  const itemNumber = startIndex + index + 1;
                  const isSuccess = item.status === 'sent';
                  const totalRecips =
                    (item.to?.length || 0) + (item.cc?.length || 0) + (item.bcc?.length || 0);
                  const isTemplate = item.emailStyle === 'template';

                  return (
                    <tr
                      key={item._id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* Row Index */}
                      <td className="px-5 py-3.5 text-center text-slate-400 dark:text-slate-500 font-mono text-[11px]">
                        {itemNumber}
                      </td>

                      {/* Subject & Style */}
                      <td className="px-5 py-3.5 max-w-xs md:max-w-sm">
                        <div className="flex flex-col gap-1">
                          <span
                            onClick={() => setViewMail(item)}
                            className="font-bold text-slate-900 dark:text-slate-100 truncate hover:text-red-600 dark:hover:text-red-400 cursor-pointer transition-colors"
                            title={item.subject || '(No Subject)'}
                          >
                            {item.subject || '(No Subject)'}
                          </span>

                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              className={`px-2 py-0.5 text-[10px] font-extrabold rounded-md flex items-center gap-1 ${
                                isTemplate
                                  ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/60'
                              }`}
                            >
                              {isTemplate ? <Sparkles size={10} /> : <FileText size={10} />}
                              {isTemplate ? 'Template Mail' : 'Normal Mail'}
                            </span>

                            {item.attachments?.length > 0 && (
                              <span
                                className="px-1.5 py-0.5 text-[10px] font-semibold rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/40 flex items-center gap-1"
                                title={`${item.attachments.length} attached file(s)`}
                              >
                                <Paperclip size={10} />
                                {item.attachments.length}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Sender Identity */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center font-bold text-xs shrink-0">
                            <User size={13} />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                              {item.senderName || 'Super Admin'}
                            </span>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                              {item.senderEmail || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Recipients */}
                      <td className="px-5 py-3.5">
                        <div className="flex flex-col gap-0.5">
                          <span className="inline-flex items-center gap-1 font-bold text-slate-800 dark:text-slate-200">
                            <Users size={12} className="text-red-500" />
                            {totalRecips} recipient{totalRecips !== 1 ? 's' : ''}
                          </span>
                          <span
                            className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[180px] font-mono"
                            title={item.to?.join(', ')}
                          >
                            {item.to?.length > 0 ? item.to[0] : 'None'}
                            {item.to?.length > 1 && ` +${item.to.length - 1} more`}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-lg tracking-wider inline-flex items-center gap-1.5 border shadow-2xs ${
                            isSuccess
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                          }`}
                        >
                          {isSuccess ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                          {item.status.toUpperCase()}
                        </span>
                      </td>

                      {/* Dispatched Date */}
                      <td className="px-5 py-3.5 whitespace-nowrap text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-1.5 text-xs font-medium">
                          <Clock size={12} className="text-slate-400" />
                          <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                          <span className="text-slate-400 text-[10px]">
                            {new Date(item.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </td>

                      {/* Operations */}
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View Button */}
                          <button
                            type="button"
                            onClick={() => setViewMail(item)}
                            className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-red-600 hover:text-white dark:hover:bg-red-600 dark:hover:text-white rounded-xl transition-all border border-slate-200 dark:border-slate-700/80 cursor-pointer shadow-xs flex items-center gap-1.5 text-xs font-bold"
                            title="View Mail Details"
                          >
                            <Eye size={13} />
                            <span>View</span>
                          </button>

                          {/* Delete Button */}
                          <button
                            type="button"
                            disabled={isDeletingId === item._id}
                            onClick={(e) => handleDeleteSentMail(e, item)}
                            className="p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-all border border-slate-200 dark:border-slate-700/80 cursor-pointer shadow-xs disabled:opacity-40"
                            title="Delete Record"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ── PAGINATION BAR ── */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">
              Showing <span className="font-bold text-slate-800 dark:text-slate-200">{startIndex + 1}</span> to{' '}
              <span className="font-bold text-slate-800 dark:text-slate-200">{endIndex}</span> of{' '}
              <span className="font-bold text-slate-800 dark:text-slate-200">{totalItems}</span> entries
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition shadow-xs"
                title="Previous Page"
              >
                <ChevronLeft size={16} />
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                  .map((p, idx, arr) => {
                    const prev = arr[idx - 1];
                    return (
                      <React.Fragment key={p}>
                        {prev && p - prev > 1 && (
                          <span className="px-1 text-slate-400 dark:text-slate-600">...</span>
                        )}
                        <button
                          type="button"
                          onClick={() => setCurrentPage(p)}
                          className={`w-7 h-7 rounded-lg text-xs font-bold transition cursor-pointer shadow-xs ${
                            currentPage === p
                              ? 'bg-red-600 text-white'
                              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                          }`}
                        >
                          {p}
                        </button>
                      </React.Fragment>
                    );
                  })}
              </div>

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition shadow-xs"
                title="Next Page"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SENT MAIL DOSSIER / VIEW MODAL ── */}
      {viewMail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#091126] border border-slate-200 dark:border-slate-800 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden ring-1 ring-slate-900/5 dark:ring-white/5">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-[#080f1b]/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center font-black shrink-0">
                  <Mail size={20} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight">
                    Outreach Dispatch Dossier
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span
                      className={`px-2 py-0.5 text-[9px] font-black uppercase rounded-md tracking-wider flex items-center gap-1 ${
                        viewMail.status === 'sent'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {viewMail.status === 'sent' ? (
                        <CheckCircle2 size={10} />
                      ) : (
                        <AlertCircle size={10} />
                      )}
                      {viewMail.status.toUpperCase()}
                    </span>

                    <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
                      <Clock size={11} /> {new Date(viewMail.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setViewMail(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Content Scrollable Area */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs flex-1">
              {/* Subject */}
              <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider block mb-1">
                  Subject Line
                </span>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {viewMail.subject || '(No Subject)'}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span
                    className={`px-2.5 py-0.5 text-[10px] font-extrabold rounded-md inline-flex items-center gap-1 ${
                      viewMail.emailStyle === 'template'
                        ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {viewMail.emailStyle === 'template' ? <Sparkles size={10} /> : <FileText size={10} />}
                    {viewMail.emailStyle === 'template' ? 'Template Mail Layout' : 'Normal Mail Layout'}
                  </span>
                </div>
              </div>

              {/* Sender & Recipient Metadata Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Sender */}
                <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider block mb-1">
                    Sender Identity
                  </span>
                  <p className="font-bold text-slate-800 dark:text-slate-200">
                    {viewMail.senderName || 'Super Admin'}
                  </p>
                  <p className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                    {viewMail.senderEmail || 'N/A'}
                  </p>
                </div>

                {/* To Recipients */}
                <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider block mb-1">
                    To Recipients ({viewMail.to?.length || 0})
                  </span>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                    {viewMail.to?.length > 0 ? (
                      viewMail.to.map((email, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[10px] text-slate-700 dark:text-slate-300"
                        >
                          {email}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-400 italic">None specified</span>
                    )}
                  </div>
                </div>
              </div>

              {/* CC / BCC / Groups if present */}
              {((viewMail.cc && viewMail.cc.length > 0) ||
                (viewMail.bcc && viewMail.bcc.length > 0) ||
                (viewMail.recipientGroups && viewMail.recipientGroups.length > 0)) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {viewMail.cc && viewMail.cc.length > 0 && (
                    <div className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-800">
                      <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">
                        CC Recipients ({viewMail.cc.length})
                      </span>
                      <p className="font-mono text-[10px] text-slate-600 dark:text-slate-300 truncate">
                        {viewMail.cc.join(', ')}
                      </p>
                    </div>
                  )}

                  {viewMail.bcc && viewMail.bcc.length > 0 && (
                    <div className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-800">
                      <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">
                        BCC Recipients ({viewMail.bcc.length})
                      </span>
                      <p className="font-mono text-[10px] text-slate-600 dark:text-slate-300 truncate">
                        {viewMail.bcc.join(', ')}
                      </p>
                    </div>
                  )}

                  {viewMail.recipientGroups && viewMail.recipientGroups.length > 0 && (
                    <div className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-800">
                      <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">
                        Broadcast Groups
                      </span>
                      <p className="font-bold text-[10px] text-red-500 uppercase">
                        {viewMail.recipientGroups.join(', ')}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Attachments Section */}
              {viewMail.attachments && viewMail.attachments.length > 0 && (
                <div>
                  <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider block mb-2">
                    Attached Files ({viewMail.attachments.length})
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {viewMail.attachments.map((att, idx) => (
                      <a
                        key={idx}
                        href={att.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 transition-colors group cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 pr-2">
                          <Paperclip size={14} className="text-blue-500 shrink-0" />
                          <div className="truncate">
                            <p className="font-bold text-slate-800 dark:text-slate-200 text-xs truncate group-hover:text-blue-500 transition">
                              {att.filename}
                            </p>
                            {att.size && (
                              <p className="text-[10px] text-slate-400 font-mono">
                                {(att.size / 1024).toFixed(1)} KB
                              </p>
                            )}
                          </div>
                        </div>
                        <ExternalLink size={13} className="text-slate-400 group-hover:text-blue-500 shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Email Content */}
              <div>
                <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider block mb-2">
                  Message Content Body
                </span>
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-h-80 overflow-y-auto">
                  <div
                    className="prose dark:prose-invert max-w-none text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-sans"
                    dangerouslySetInnerHTML={{ __html: viewMail.body || '<p>(Empty message body)</p>' }}
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-[#080f1b]/60 flex items-center justify-between">
              <button
                type="button"
                onClick={(e) => handleDeleteSentMail(e, viewMail)}
                className="px-4 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 size={14} />
                Delete Record
              </button>

              <button
                type="button"
                onClick={() => setViewMail(null)}
                className="px-5 py-2 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-xl transition cursor-pointer shadow-sm"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
