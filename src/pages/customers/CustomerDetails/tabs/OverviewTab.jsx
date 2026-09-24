import React from 'react';
import { User, ShieldCheck, Mail, Phone, Wallet, Gift, Heart, Calendar, MapPin, Ban, UserCheck, Sparkles, Fingerprint } from 'lucide-react';

const OverviewTab = ({ customer }) => {
  const prefs = customer?.preferences || {};
  const mongoId = (customer?._id || '').toUpperCase();
  const dobStr = customer?.dob
    ? new Date(customer.dob).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()
    : 'N/A';

  return (
    <div className="space-y-8 text-slate-900 dark:text-white">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50/50 to-slate-50 dark:from-[#0d1838] dark:via-[#0b142e] dark:to-[#070d1e] border border-blue-200/80 dark:border-indigo-500/30 rounded-2xl p-5 sm:p-6 relative overflow-hidden shadow-sm">
        <div className="flex items-center gap-4 relative z-10">
          <div className="size-12 rounded-2xl bg-blue-600/10 dark:bg-indigo-500/20 text-blue-600 dark:text-indigo-400 border border-blue-200 dark:border-indigo-500/30 flex items-center justify-center shrink-0 shadow-sm">
            <UserCheck size={22} />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-wider uppercase">
              FULL INDIVIDUAL PROFILE
            </h3>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-blue-600 dark:text-indigo-400 mt-0.5 flex items-center gap-1.5 font-mono">
              <span>AUTHENTICATED USER DOSSIER</span>
              <span className="opacity-40">•</span>
              <span className="text-slate-600 dark:text-slate-300 font-semibold">{mongoId}</span>
            </p>
          </div>
        </div>
      </div>

      {/* SECTION ALPHA: CORE IDENTITY */}
      <div className="space-y-3">
        <div className="border-b border-slate-200/80 dark:border-indigo-500/20 pb-2.5 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-black uppercase tracking-[0.18em] text-blue-600 dark:text-indigo-400 block">
              SECTION ALPHA: CORE IDENTITY
            </span>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 mt-0.5">
              BIOLOGICAL & IDENTIFICATION MARKERS
            </p>
          </div>
          <Fingerprint size={18} className="text-blue-600/60 dark:text-indigo-400/60" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-5 rounded-2xl bg-slate-50/70 dark:bg-[#070d1e]/80 border border-slate-200/80 dark:border-indigo-500/20">
          <DataField label="FIRST NAME" value={customer.firstName} />
          <DataField label="MIDDLE NAME" value={customer.middleName || 'N/A'} />
          <DataField label="LAST NAME" value={customer.lastName} />
          <DataField label="SYSTEM IDENTIFIER" value={mongoId} isCode />
          <DataField label="GENDER MARKER" value={customer.gender ? customer.gender.toUpperCase() : 'N/A'} />
          <DataField label="DATE OF BIRTH" value={dobStr} />
        </div>
      </div>

      {/* SECTION BETA: COMMUNICATION & ACCOUNT METRICS */}
      <div className="space-y-3">
        <div className="border-b border-slate-200/80 dark:border-indigo-500/20 pb-2.5 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-black uppercase tracking-[0.18em] text-blue-600 dark:text-indigo-400 block">
              SECTION BETA: COMMUNICATION & ACCOUNT METRICS
            </span>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 mt-0.5">
              ACCOUNT BALANCES, REFERRALS & CONTACT PATHS
            </p>
          </div>
          <Wallet size={18} className="text-blue-600/60 dark:text-indigo-400/60" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-5 rounded-2xl bg-slate-50/70 dark:bg-[#070d1e]/80 border border-slate-200/80 dark:border-indigo-500/20">
          <DataField label="PRIMARY EMAIL" value={customer.email} icon={<Mail size={12} className="text-blue-600 dark:text-indigo-400" />} />
          <DataField label="MOBILE NUMBER" value={customer.mobile_number || customer.phone} icon={<Phone size={12} className="text-blue-600 dark:text-indigo-400" />} />
          <DataField label="WALLET BALANCE" value={`₹${(customer.wallet_balance || 0).toLocaleString('en-IN')}`} icon={<Wallet size={12} className="text-emerald-600 dark:text-emerald-400" />} highlight />
          <DataField label="REFERRAL CODE" value={customer.referral_code || 'N/A'} isCode />
          <DataField label="VERIFIED REFERRALS" value={customer.referralCount ?? 0} />
          <DataField label="REFERRED BY" value={customer.referred_by || 'NONE'} isCode />
        </div>
      </div>

      {/* SECTION GAMMA: HONEYMOON & TRAVEL PREFERENCES */}
      <div className="space-y-3">
        <div className="border-b border-slate-200/80 dark:border-indigo-500/20 pb-2.5 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-black uppercase tracking-[0.18em] text-rose-600 dark:text-rose-400 block">
              SECTION GAMMA: HONEYMOON PREFERENCES
            </span>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 mt-0.5">
              PARTNER & TRIP PERSONALIZATION DETAILS
            </p>
          </div>
          <Heart size={18} className="text-rose-600/60 dark:text-rose-400/60" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-5 rounded-2xl bg-slate-50/70 dark:bg-[#070d1e]/80 border border-slate-200/80 dark:border-indigo-500/20">
          <DataField label="PARTNER'S NAME" value={customer.partnerName} icon={<Heart size={12} className="text-rose-600 dark:text-rose-400" />} />
          <DataField
            label="WEDDING / ANNIVERSARY"
            value={
              customer.weddingDate
                ? new Date(customer.weddingDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()
                : null
            }
          />
          <DataField label="HONEYMOON VIBE" value={customer.preferences?.honeymoonVibe} />
          <DataField label="DIETARY PREFERENCE" value={customer.preferences?.dietaryPreference} />
          <DataField label="PREFERRED DEPARTURE CITY" value={customer.preferences?.departureCity} />
        </div>
      </div>

      {/* Wallet Frozen Notice if applicable */}
      {customer.is_wallet_frozen && (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-500/30 text-amber-800 dark:text-amber-300">
          <Ban size={20} className="text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-amber-700 dark:text-amber-400">Wallet Is Currently Frozen</p>
            {customer.wallet_frozen_reason && (
              <p className="text-xs text-slate-700 dark:text-slate-300 mt-1">{customer.wallet_frozen_reason}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const DataField = ({ label, value, isCode, highlight, icon }) => (
  <div className="space-y-1 p-2 rounded-xl hover:bg-white/60 dark:hover:bg-indigo-950/20 transition-colors">
    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
      {icon} {label}
    </p>
    <p
      className={`text-xs font-extrabold uppercase tracking-wide truncate ${
        highlight
          ? 'text-emerald-600 dark:text-emerald-400 text-sm font-black'
          : isCode
          ? 'text-blue-600 dark:text-indigo-400 font-mono tracking-wider'
          : 'text-slate-800 dark:text-slate-200'
      }`}
    >
      {value || <span className="text-slate-400 dark:text-slate-600 font-normal italic">N/A</span>}
    </p>
  </div>
);

export default OverviewTab;
