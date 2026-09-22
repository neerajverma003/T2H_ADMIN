import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Search, Loader2, Mail, Phone, Calendar, Eye, Trash2, ShieldCheck, Filter, Download, Wallet, PlusCircle, MinusCircle, X } from 'lucide-react';
import { useCustomerStore } from '../../stores/customerStore';

const CustomersList = () => {
  const navigate = useNavigate();
  const { customers, isLoadingCustomers, fetchCustomers, deleteCustomer, manageUserWallet } = useCustomerStore();
  const [search, setSearch] = useState('');

  // Wallet Modal State
  const [selectedUserForWallet, setSelectedUserForWallet] = useState(null);
  const [walletForm, setWalletForm] = useState({ type: 'credit', amount: '', description: '' });
  const [isSubmittingWallet, setIsSubmittingWallet] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const filtered = useMemo(() => {
    if (!search.trim()) return customers;
    const q = search.toLowerCase();
    return customers.filter(
      (c) =>
        `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.mobile_number?.includes(q) ||
        c.phone?.includes(q)
    );
  }, [customers, search]);

  const handleDelete = async (e, id, name) => {
    e.stopPropagation();
    if (window.confirm(`Delete customer ${name} permanently?`)) {
      await deleteCustomer(id);
    }
  };

  const handleOpenWalletModal = (e, customer) => {
    e.stopPropagation();
    const fullName = `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'User';
    setSelectedUserForWallet({ id: customer._id, name: fullName, balance: customer.wallet_balance || 0 });
    setWalletForm({ type: 'credit', amount: '', description: '' });
  };

  const handleWalletSubmit = async () => {
    if (!walletForm.amount || isNaN(walletForm.amount) || Number(walletForm.amount) <= 0) {
      alert('Please enter a valid amount greater than 0.');
      return;
    }

    setIsSubmittingWallet(true);
    const success = await manageUserWallet(selectedUserForWallet.id, {
      type: walletForm.type,
      amount: Number(walletForm.amount),
      description: walletForm.description
    });
    setIsSubmittingWallet(false);

    if (success) {
      setSelectedUserForWallet(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8 pb-20 font-sans min-h-screen text-slate-900 dark:text-slate-100 text-left">
      
      {/* ── HEADER HUB ── */}
      <div className="bg-white dark:bg-[#091126] rounded-3xl py-4 sm:py-5 px-6 sm:px-8 border border-slate-200 dark:border-slate-800 shadow-md relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative z-10 flex items-center gap-3.5">
          <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0">
            <Users size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full">
                GROWTH INTELLIGENCE
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2 flex-wrap">
              Registered <span className="text-blue-500">Users</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-semibold mt-0.5 text-xs sm:text-sm">
              OPERATIONAL OVERSIGHT OF ALL VERIFIED USER IDENTITIES AND JOURNEY PARTICIPATIONS.
            </p>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-4">
          <div className="bg-slate-50 dark:bg-[#080f1b] border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-2.5 shadow-sm flex items-center gap-3">
            <div className="size-10 rounded-xl bg-blue-500/10 dark:bg-blue-600/20 border border-blue-500/20 dark:border-blue-500/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div>
              <span className="text-xl font-black text-slate-900 dark:text-white leading-none block">{customers.length}</span>
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">VERIFIED BASE</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── SEARCH & FILTERS BAR ── */}
      <div className="bg-white dark:bg-[#091126] rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full max-w-xl">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={16} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by identity, contact or location..."
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800/90 bg-slate-50 dark:bg-[#050A17] pl-10 pr-4 py-2.5 text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 shadow-inner transition-all"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <button className="flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/80 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer">
            <Filter size={14} /> Filter by Profile
          </button>
          <button className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-blue-500/30 cursor-pointer">
            <Download size={14} /> Export
          </button>
        </div>
      </div>

      {/* ── DATA TABLE SECTION ── */}
      {isLoadingCustomers ? (
        <div className="flex flex-col items-center justify-center py-32 bg-white dark:bg-[#091126]/95 border border-slate-200 dark:border-slate-800 rounded-3xl gap-4 shadow-xl ring-1 ring-slate-900/5 dark:ring-white/5">
          <Loader2 className="animate-spin text-blue-500" size={40} strokeWidth={2} />
          <p className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Loading Verified Identities...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-24 text-center bg-white dark:bg-[#091126] border border-slate-200 dark:border-slate-800 border-dashed rounded-3xl shadow-sm">
          <div className="size-16 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center mx-auto mb-4 text-slate-400 dark:text-slate-500">
            <Users size={28} />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No Matching Customers Found</h3>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-xs max-w-sm mx-auto">No registered users matched your search query.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#091126] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-[#080f1b]/80 border-b border-slate-200 dark:border-slate-800 text-[11px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                  <th className="px-6 py-4">MEMBER IDENTITY</th>
                  <th className="px-6 py-4">COMMUNICATION PATH</th>
                  <th className="px-6 py-4">WALLET BALANCE</th>
                  <th className="px-6 py-4">REGISTRATION DATE</th>
                  <th className="px-6 py-4 text-right">OPERATIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filtered.map((c) => {
                  const initials = `${c.firstName?.[0] || 'U'}${c.lastName?.[0] || ''}`.toUpperCase();
                  const fullName = `${c.firstName || ''} ${c.lastName || ''}`.trim() || 'UNNAMED USER';
                  const joinedDate = c.createdAt
                    ? new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                    : 'No Date';

                  return (
                    <tr
                      key={c._id}
                      onClick={() => navigate(`/customers/${c._id}`)}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 cursor-pointer transition-colors group"
                    >
                      {/* Member Identity */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3.5">
                          <div className="size-11 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-md shadow-blue-500/20 shrink-0">
                            {initials}
                          </div>
                          <div>
                            <p className="font-extrabold text-slate-900 dark:text-white text-sm tracking-wide uppercase group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {fullName}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                                ACTIVE IDENTITY
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Communication Path */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
                          <span className="flex items-center gap-2">
                            <Mail size={13} className="text-blue-600 dark:text-blue-400" /> {c.email || 'N/A'}
                          </span>
                          <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                            <Phone size={13} className="text-blue-600 dark:text-blue-400" /> {c.mobile_number || c.phone || 'N/A'}
                          </span>
                        </div>
                      </td>

                      {/* Wallet Balance */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                            ₹{(c.wallet_balance || 0).toLocaleString('en-IN')}
                          </span>
                        </div>
                        <span className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mt-0.5">
                          CASH WALLET
                        </span>
                      </td>

                      {/* Registration Date */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                          <Calendar size={14} className="text-blue-600 dark:text-blue-400" />
                          <span>{joinedDate}</span>
                        </div>
                        <span className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mt-0.5">
                          VERIFIED DATE
                        </span>
                      </td>

                      {/* Operations */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => handleOpenWalletModal(e, c)}
                            className="px-3 py-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white transition-all border border-emerald-200 dark:border-emerald-500/30 cursor-pointer shadow-xs flex items-center gap-1.5 text-xs font-bold"
                            title="Add / Deduct Wallet Balance"
                          >
                            <Wallet size={14} />
                            <span className="hidden sm:inline">Wallet</span>
                          </button>
                          <button
                            onClick={() => navigate(`/customers/${c._id}`)}
                            className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-blue-600 hover:text-white transition-all border border-slate-200 dark:border-slate-700/80 cursor-pointer shadow-xs"
                            title="View Profile Dossier"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={(e) => handleDelete(e, c._id, fullName)}
                            className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-rose-600 hover:text-white transition-all border border-slate-200 dark:border-slate-700/80 cursor-pointer shadow-xs"
                            title="Delete Customer"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── MANAGE WALLET MODAL ── */}
      {selectedUserForWallet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#091126] border border-slate-200 dark:border-indigo-500/25 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative ring-1 ring-slate-900/5 dark:ring-white/5">
            <button 
              onClick={() => setSelectedUserForWallet(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-white p-2 rounded-xl"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3.5 mb-6">
              <div className="size-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black">
                <Wallet size={24} />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">Manage User Wallet</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{selectedUserForWallet.name}</p>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-[#080f1b] p-4 rounded-2xl mb-6 border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
              <span className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Current Balance</span>
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                ₹{(selectedUserForWallet.balance || 0).toLocaleString('en-IN')}
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">Operation Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setWalletForm(prev => ({ ...prev, type: 'credit' }))}
                    className={`py-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                      walletForm.type === 'credit' 
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-transparent hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    <PlusCircle size={16} /> Credit (+)
                  </button>
                  <button
                    type="button"
                    onClick={() => setWalletForm(prev => ({ ...prev, type: 'debit' }))}
                    className={`py-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                      walletForm.type === 'debit' 
                        ? 'bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-600/20' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-transparent hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    <MinusCircle size={16} /> Debit (-)
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">Amount (₹)</label>
                <input
                  type="number"
                  value={walletForm.amount}
                  onChange={(e) => setWalletForm(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="Enter amount (e.g. 1000)"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#050A17] px-4 py-3 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all shadow-inner"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">Reason / Note (Optional)</label>
                <input
                  type="text"
                  value={walletForm.description}
                  onChange={(e) => setWalletForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="e.g. Promotional credit, Refund, Correction"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#050A17] px-4 py-3 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all shadow-inner"
                />
              </div>

              <button
                onClick={handleWalletSubmit}
                disabled={isSubmittingWallet}
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-blue-500/30 mt-4 disabled:opacity-50 cursor-pointer"
              >
                {isSubmittingWallet ? 'Updating Balance...' : `Confirm ${walletForm.type === 'credit' ? 'Credit' : 'Debit'}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomersList;
