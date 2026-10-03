import React, { useState } from 'react';
import { Mail, X, Paperclip, FileText, Sparkles, Send, ShieldCheck, ExternalLink } from 'lucide-react';

const LOGO_URL = '/TripLogo.png';

export default function LiveEmailPreviewModal({
  isOpen,
  onClose,
  subject,
  senderName,
  senderEmail,
  to,
  cc,
  body,
  attachments = [],
  defaultEmailStyle = 'normal',
}) {
  const [styleMode, setStyleMode] = useState(defaultEmailStyle);

  if (!isOpen) return null;

  const recipientsDisplay = Array.isArray(to) && to.length > 0 ? to.join(', ') : 'No recipient selected';
  const ccDisplay = Array.isArray(cc) && cc.length > 0 ? cc.join(', ') : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-hidden animate-fade-in">
      <div className="relative w-full max-w-5xl bg-white dark:bg-[#091126] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col h-[94vh] overflow-hidden ring-1 ring-slate-900/5 dark:ring-white/5">
        
        {/* ── MODAL HEADER ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-[#080f1b]/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center font-black shrink-0">
              <Mail size={20} strokeWidth={2.2} />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight">
                Live Email Client Preview
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Authentic preview of how recipients see this email in Gmail, Apple Mail, and Outlook
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Style Mode Switcher */}
            <div className="flex items-center p-1 bg-slate-200/80 dark:bg-slate-800 rounded-2xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setStyleMode('normal')}
                className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  styleMode === 'normal'
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <FileText size={13} />
                <span>Normal Mail</span>
              </button>
              <button
                type="button"
                onClick={() => setStyleMode('template')}
                className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  styleMode === 'template'
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Sparkles size={13} />
                <span>Template Mail</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              title="Close Preview"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ── ENVELOPE METADATA SUMMARY ── */}
        <div className="px-6 py-3.5 bg-slate-50/50 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-800 text-xs space-y-1.5 shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-500 dark:text-slate-400 w-16 shrink-0 text-[11px] uppercase tracking-wider">
              Subject:
            </span>
            <span className="font-extrabold text-slate-900 dark:text-slate-100 text-xs sm:text-sm truncate">
              {subject || '(No Subject)'}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-6">
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-bold text-slate-500 dark:text-slate-400 w-16 shrink-0 text-[11px] uppercase tracking-wider">
                From:
              </span>
              <span className="text-slate-700 dark:text-slate-300 font-mono text-[11px] truncate">
                <span className="font-bold text-slate-900 dark:text-white">{senderName || 'Super Admin'}</span> &lt;{senderEmail || 'support@trip2honeymoon.com'}&gt;
              </span>
            </div>

            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className="font-bold text-slate-500 dark:text-slate-400 sm:w-8 shrink-0 text-[11px] uppercase tracking-wider">
                To:
              </span>
              <span className="text-slate-700 dark:text-slate-300 font-mono text-[11px] truncate" title={recipientsDisplay}>
                {recipientsDisplay}
              </span>
            </div>
          </div>

          {ccDisplay && (
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-500 dark:text-slate-400 w-16 shrink-0 text-[11px] uppercase tracking-wider">
                Cc:
              </span>
              <span className="text-slate-700 dark:text-slate-300 font-mono text-[11px] truncate">
                {ccDisplay}
              </span>
            </div>
          )}

          {attachments && attachments.length > 0 && (
            <div className="flex items-center gap-2 pt-0.5">
              <span className="font-bold text-slate-500 dark:text-slate-400 w-16 shrink-0 text-[11px] uppercase tracking-wider flex items-center gap-1">
                <Paperclip size={11} className="text-blue-500" /> Files:
              </span>
              <span className="text-blue-600 dark:text-blue-400 font-medium text-[11px]">
                {attachments.length} attached document{attachments.length > 1 ? 's' : ''} ({attachments.map((a) => a.filename).join(', ')})
              </span>
            </div>
          )}
        </div>

        {/* ── SIMULATED EMAIL CANVAS (FULL AREA & STRUCTURED) ── */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100 dark:bg-[#050A17] flex justify-center custom-scrollbar">
          
          {styleMode === 'normal' ? (
            /* ════ NORMAL MAIL PREVIEW ════ */
            <div className="w-full max-w-3xl min-h-full flex flex-col justify-between bg-white text-slate-800 rounded-2xl border border-slate-200/90 shadow-xl overflow-hidden">
              
              {/* Message Header Strip */}
              <div className="px-8 pt-8 pb-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                    {subject || '(No Subject)'}
                  </h1>
                  <p className="text-xs text-slate-400 mt-1 font-mono">
                    From: {senderName || 'Super Admin'} &lt;{senderEmail || 'support@trip2honeymoon.com'}&gt;
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider">
                  Plain Outreach Letter
                </span>
              </div>

              {/* Message Body (Expands to cover area) */}
              <div className="flex-1 p-8 sm:p-10">
                <div
                  className="prose max-w-none text-sm sm:text-base leading-relaxed text-slate-800 font-sans space-y-4"
                  dangerouslySetInnerHTML={{
                    __html:
                      body && body !== '<br>'
                        ? body
                        : '<p class="text-slate-400 italic">No message content entered yet...</p>',
                  }}
                />

                {/* Attachments Section in Letter */}
                {attachments && attachments.length > 0 && (
                  <div className="mt-10 pt-6 border-t border-slate-200/80">
                    <div className="flex items-center gap-2 mb-3">
                      <Paperclip size={14} className="text-slate-500" />
                      <span className="text-xs font-extrabold uppercase tracking-wider text-slate-600">
                        Attached Documents ({attachments.length})
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {attachments.map((att, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 text-xs text-slate-700 shadow-xs transition"
                        >
                          <div className="flex items-center gap-2.5 min-w-0 pr-2">
                            <div className="w-7 h-7 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                              <FileText size={15} />
                            </div>
                            <div className="truncate">
                              <p className="font-bold text-slate-800 truncate">{att.filename}</p>
                              {att.size && (
                                <p className="text-[10px] text-slate-400 font-mono">
                                  {(att.size / 1024).toFixed(1)} KB
                                </p>
                              )}
                            </div>
                          </div>
                          {att.url && (
                            <a
                              href={att.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-600 hover:text-blue-700 p-1"
                              title="Download / View"
                            >
                              <ExternalLink size={14} />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sign-off / Official Letter Footer (Always pinned to bottom) */}
              <div className="px-8 sm:px-10 py-6 border-t border-slate-100 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="font-extrabold text-sm text-slate-900 m-0">
                    {senderName || 'Super Admin'}
                  </p>
                  <p className="text-xs text-slate-500 m-0 mt-0.5">
                    Trip2Honeymoon Management
                  </p>
                </div>
                <div className="text-left sm:text-right text-[11px] text-slate-400 font-mono">
                  <span>{senderEmail || 'support@trip2honeymoon.com'}</span>
                  <span className="hidden sm:inline"> • </span>
                  <span className="block sm:inline">trip2honeymoon.com</span>
                </div>
              </div>
            </div>
          ) : (
            /* ════ TEMPLATE MAIL LUXURY PREVIEW ════ */
            <div className="w-full max-w-3xl min-h-full flex flex-col justify-between bg-white text-slate-800 rounded-2xl border border-slate-200/90 shadow-2xl overflow-hidden">
              
              {/* Top Accent Gradient Bar */}
              <div className="h-1.5 bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 w-full" />

              {/* Brand Top Header */}
              <div className="bg-white py-8 px-6 text-center border-b border-slate-100 flex flex-col items-center justify-center">
                <img
                  src={LOGO_URL}
                  alt="Trip2Honeymoon"
                  className="h-12 sm:h-14 w-auto max-w-[320px] object-contain mx-auto transition-transform hover:scale-102"
                />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2">
                  Official Luxury Outreach
                </span>
              </div>

              {/* Main Body Canvas (Expands to fill vertical area) */}
              <div className="flex-1 p-8 sm:p-12">
                
                {/* Subject Header */}
                {subject && (
                  <div className="mb-6 pb-4 border-b border-slate-100">
                    <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                      {subject}
                    </h2>
                  </div>
                )}

                {/* Email Body HTML Content */}
                <div
                  className="prose max-w-none text-sm sm:text-base leading-relaxed text-slate-800 font-sans space-y-4"
                  dangerouslySetInnerHTML={{
                    __html:
                      body && body !== '<br>'
                        ? body
                        : '<p class="text-slate-400 italic">No message content entered yet...</p>',
                  }}
                />

                {/* Attachments Section in Luxury Template */}
                {attachments && attachments.length > 0 && (
                  <div className="mt-10 pt-6 border-t border-slate-200/80">
                    <div className="flex items-center gap-2 mb-3">
                      <Paperclip size={14} className="text-red-500" />
                      <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                        Attached Documents ({attachments.length})
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {attachments.map((att, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100/90 rounded-2xl border border-slate-200 text-xs text-slate-700 shadow-xs transition"
                        >
                          <div className="flex items-center gap-3 min-w-0 pr-2">
                            <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 shadow-xs">
                              <FileText size={16} />
                            </div>
                            <div className="truncate">
                              <p className="font-extrabold text-slate-900 truncate">{att.filename}</p>
                              {att.size && (
                                <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                                  {(att.size / 1024).toFixed(1)} KB • Included
                                </p>
                              )}
                            </div>
                          </div>
                          {att.url && (
                            <a
                              href={att.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-red-600 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50"
                              title="Open Document"
                            >
                              <ExternalLink size={14} />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Official Branded Luxury Footer (Always pinned to bottom) */}
              <div className="bg-slate-50/90 border-t border-slate-100 p-8 text-center text-xs text-slate-500 space-y-2">
                <div className="flex items-center justify-center gap-2 font-bold text-slate-800 text-xs">
                  <ShieldCheck size={14} className="text-emerald-500" />
                  <span>Trip2Honeymoon Official Partner & Direct Outreach</span>
                </div>
                <p className="text-[11px] text-slate-400 max-w-md mx-auto">
                  Curating bespoke luxury honeymoons, private romantic escapes, and travel experiences worldwide.
                </p>
                <div className="pt-2 text-[10px] text-slate-400 flex items-center justify-center gap-3 font-mono">
                  <span>support@trip2honeymoon.com</span>
                  <span>•</span>
                  <span>trip2honeymoon.com</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* ── MODAL FOOTER ── */}
        <div className="px-6 py-4 bg-white dark:bg-[#091126] border-t border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <span>Active Format:</span>
            <span className="font-extrabold text-slate-900 dark:text-slate-100 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">
              {styleMode === 'normal' ? 'Normal Mail (Plain Letter)' : 'Template Mail (Branded Luxury Layout)'}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition cursor-pointer shadow-md"
          >
            Close Preview
          </button>
        </div>

      </div>
    </div>
  );
}
