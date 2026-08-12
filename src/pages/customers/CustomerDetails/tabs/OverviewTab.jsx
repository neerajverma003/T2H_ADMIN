import React from 'react';
import { User, ShieldCheck, Mail, Phone, Wallet, Gift, Heart, Calendar, MapPin, Ban, UserCheck } from 'lucide-react';

const OverviewTab = ({ customer }) => {
  const prefs = customer?.preferences || {};
  const mongoId = (customer?._id || '').toUpperCase();
  const dobStr = customer?.dob
    ? new Date(customer.dob).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()
    : 'N/A';

  return (
    <div className="space-y-8 text-slate-900 dark:text-white">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/60 dark:to-indigo-900/40 border border-blue-200 dark:border-blue-500/20 rounded-3xl p-6 relative overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="size-12 rounded-2xl bg-blue-600/10 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 border border-blue-300 dark:border-blue-500/30 flex items-center justify-center shrink-0">
            <UserCheck size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-wider uppercase">
              FULL INDIVIDUAL PROFILE
            </h3>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400 mt-0.5">
              AUTHENTICATED USER DOSSIER • {mongoId}
            </p>
          </div>
        </div>
      </div>

      {/* SECTION ALPHA: CORE IDENTITY */}
      <div className="space-y-4">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-2">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
            SECTION ALPHA: CORE IDENTITY
          </span>
          <p className="text-[9px] font-extrabold uppercase tracking-widest text-slate-500">
            BIOLOGICAL & IDENTIFICATION MARKERS
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 bg-slate-50 dark:bg-slate-950/60 p-6 rounded-3xl border border-slate-200 dark:border-slate-800/80">
          <DataField label="FIRST NAME" value={customer.firstName} />
          <DataField label="MIDDLE NAME" value={customer.middleName || 'N/A'} />
          <DataField label="LAST NAME" value={customer.lastName} />
          <DataField label="SYSTEM IDENTIFIER" value={mongoId} isCode />
          <DataField label="GENDER MARKER" value={customer.gender ? customer.gender.toUpperCase() : 'MALE'} />
          <DataField label="DATE OF BIRTH" value={dobStr} />
        </div>
      </div>

      {/* SECTION BETA: COMMUNICATION & ACCOUNT METRICS */}
      <div className="space-y-4">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-2">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
            SECTION BETA: COMMUNICATION & ACCOUNT METRICS
          </span>
          <p className="text-[9px] font-extrabold uppercase tracking-widest text-slate-500">
            ACCOUNT BALANCES, REFERRALS & CONTACT PATHS
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 bg-slate-50 dark:bg-slate-950/60 p-6 rounded-3xl border border-slate-200 dark:border-slate-800/80">
          <DataField label="PRIMARY EMAIL" value={customer.email} icon={<Mail size={12} className="text-blue-600 dark:text-blue-400" />} />
          <DataField label="MOBILE NUMBER" value={customer.mobile_number || customer.phone} icon={<Phone size={12} className="text-blue-600 dark:text-blue-400" />} />
          <DataField label="WALLET BALANCE" value={`₹${(customer.wallet_balance || 0).toLocaleString('en-IN')}`} icon={<Wallet size={12} className="text-emerald-600 dark:text-emerald-400" />} highlight />
          <DataField label="REFERRAL CODE" value={customer.referral_code || 'N/A'} isCode />
          <DataField label="VERIFIED REFERRALS" value={customer.referralCount ?? 0} />
          <DataField label="REFERRED BY" value={customer.referred_by || 'NONE'} isCode />
        </div>
      </div>

      {/* SECTION GAMMA: HONEYMOON & TRAVEL PREFERENCES */}
      <div className="space-y-4">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-2">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-600 dark:text-rose-400">
            SECTION GAMMA: HONEYMOON PREFERENCES
          </span>
          <p className="text-[9px] font-extrabold uppercase tracking-widest text-slate-500">
            PARTNER & TRIP PERSONALIZATION DETAILS
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 bg-slate-50 dark:bg-slate-950/60 p-6 rounded-3xl border border-slate-200 dark:border-slate-800/80">
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
        <div className="flex items-start gap-3 p-5 rounded-2xl bg-sky-50 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-500/30 text-sky-800 dark:text-sky-300">
          <Ban size={20} className="text-sky-600 dark:text-sky-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-sky-600 dark:text-sky-400">Wallet Is Currently Frozen</p>
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
  <div className="space-y-1">
    <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-500 flex items-center gap-1.5">
      {icon} {label}
    </p>
    <p
      className={`text-xs font-extrabold uppercase tracking-wide truncate ${
        highlight
          ? 'text-emerald-600 dark:text-emerald-400 text-sm font-black'
          : isCode
          ? 'text-blue-600 dark:text-blue-400 font-mono tracking-wider'
          : 'text-slate-900 dark:text-slate-200'
      }`}
    >
      {value || <span className="text-slate-400 dark:text-slate-600 font-normal italic">N/A</span>}
    </p>
  </div>
);

export default OverviewTab;
