import React, { useState } from 'react';
import { Shield, ShieldCheck, X, Eye, EyeOff, ExternalLink, Trash2, CheckCircle2, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';
import { apiClient } from '../../stores/authStores';

export default function ManageSendersModal({ isOpen, onClose, senders, onRefreshSenders }) {
  const [email, setEmail] = useState('');
  const [label, setLabel] = useState('');
  const [appPassword, setAppPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isDefault, setIsDefault] = useState(false);
  const [loading, setLoading] = useState(false);
  const [testingId, setTestingId] = useState(null);

  if (!isOpen) return null;

  const handleVerifyAndSave = async (e) => {
    e.preventDefault();
    if (!email.trim() || !label.trim() || !appPassword.trim()) {
      toast.warning('Please fill in email, account label, and 16-character App Password');
      return;
    }

    setLoading(true);
    try {
      const res = await apiClient.post('/admin/direct-mail/senders/verify-add', {
        email: email.trim(),
        label: label.trim(),
        appPassword: appPassword.trim(),
        isDefault,
      });

      if (res.data.success) {
        toast.success(res.data.msg || 'Sender authenticated successfully!');
        setEmail('');
        setLabel('');
        setAppPassword('');
        setIsDefault(false);
        onRefreshSenders();
      }
    } catch (err) {
      const msg = err.response?.data?.msg || err.message || 'Verification failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (id) => {
    try {
      const res = await apiClient.patch(`/admin/direct-mail/senders/${id}/default`);
      if (res.data.success) {
        toast.success('Default sender updated');
        onRefreshSenders();
      }
    } catch (err) {
      toast.error('Failed to update default sender');
    }
  };

  const handleTestConnection = async (id) => {
    setTestingId(id);
    try {
      const res = await apiClient.post(`/admin/direct-mail/senders/${id}/test`);
      if (res.data.success) {
        toast.success(res.data.msg || 'SMTP connection tested successfully!');
        onRefreshSenders();
      }
    } catch (err) {
      const msg = err.response?.data?.msg || err.message || 'Test failed';
      toast.error(msg);
    } finally {
      setTestingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this sender account?')) return;
    try {
      const res = await apiClient.delete(`/admin/direct-mail/senders/${id}`);
      if (res.data.success) {
        toast.success('Sender account removed');
        onRefreshSenders();
      }
    } catch (err) {
      toast.error('Failed to delete sender');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8">
        
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/40 flex items-center justify-center text-red-600 dark:text-red-400">
              <Shield size={20} strokeWidth={2.2} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Multi-Sender Email Accounts
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Manage your authenticated outgoing Gmail SMTP addresses
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">

          {/* Existing Senders Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Configured SMTP Senders ({senders?.length || 0})
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              Passwords are encrypted with AES-256 and authenticated directly with Gmail/SMTP servers.
            </p>

            {senders?.length > 0 ? (
              <div className="space-y-2.5">
                {senders.map((s) => (
                  <div
                    key={s._id}
                    className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                      s.isDefault
                        ? 'bg-blue-50/60 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/50'
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-slate-800 dark:text-slate-200 truncate">
                          {s.label}
                        </span>
                        {s.isDefault && (
                          <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-md bg-blue-600 text-white shadow-sm">
                            Default
                          </span>
                        )}
                        <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
                          Active
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5 font-mono">
                        {s.email}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {!s.isDefault && (
                        <button
                          onClick={() => handleSetDefault(s._id)}
                          className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 rounded-lg hover:bg-white dark:hover:bg-slate-700/60 transition"
                          title="Set as Default Sender"
                        >
                          Make Default
                        </button>
                      )}
                      <button
                        onClick={() => handleTestConnection(s._id)}
                        disabled={testingId === s._id}
                        className="p-1.5 text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-lg hover:bg-white dark:hover:bg-slate-700/60 transition"
                        title="Test Connection"
                      >
                        <RefreshCw size={15} className={testingId === s._id ? 'animate-spin text-emerald-600' : ''} />
                      </button>
                      <button
                        onClick={() => handleDelete(s._id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-white dark:hover:bg-slate-700/60 transition"
                        title="Remove Account"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-800/20">
                No sender email accounts added yet. Use the form below to connect your Gmail account with a 16-character Google App Password.
              </div>
            )}
          </div>

          {/* Add & Verify Email Account Form */}
          <div className="p-5 rounded-2xl border border-red-100 dark:border-slate-800 bg-red-50/20 dark:bg-slate-800/30">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-red-600"></span>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Add & Verify Email Account
              </h4>
            </div>

            <form onSubmit={handleVerifyAndSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. support@trip2honeymoon.com"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Account Label / Display Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder="e.g. Trip2Honeymoon Support"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Gmail 16-Character App Password <span className="text-red-500">*</span>
                  </label>
                  <a
                    href="https://myaccount.google.com/apppasswords"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-semibold text-red-600 hover:text-red-700 dark:text-red-400 flex items-center gap-1 hover:underline"
                  >
                    Generate App Password <ExternalLink size={11} />
                  </a>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={appPassword}
                    onChange={(e) => setAppPassword(e.target.value)}
                    placeholder="abcd efgh ijkl mnop"
                    className="w-full px-3.5 py-2 pr-10 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition tracking-wider"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
                  Stored in MongoDB as an AES-256 encrypted string with secret key.
                </p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isDefault}
                    onChange={(e) => setIsDefault(e.target.checked)}
                    className="w-4 h-4 rounded text-red-600 focus:ring-red-500 border-slate-300 dark:border-slate-600 cursor-pointer"
                  />
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Set as Default Sender
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:opacity-50 rounded-xl shadow-md shadow-red-600/20 flex items-center gap-2 transition"
                >
                  {loading ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      Authenticating SMTP...
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={15} />
                      Verify & Save Account
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-xl transition shadow-sm"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
