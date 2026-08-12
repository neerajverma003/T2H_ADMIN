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
    <div className="min-h-screen text-slate-900 dark:text-slate-100 font-sans transition-colors">
      <div className="max-w-[1600px] mx-auto flex flex-col gap-8">
        
        {/* PAGE HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-2">
              <Users size={16} strokeWidth={2.5} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">GROWTH INTELLIGENCE</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Registered <span className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">Users</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-xs tracking-wider mt-1 max-w-2xl">
              OPERATIONAL OVERSIGHT OF ALL VERIFIED USER IDENTITIES AND JOURNEY PARTICIPATIONS.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-4 shadow-xl flex items-center gap-4 px-6 backdrop-blur-xl">
              <div className="size-11 rounded-2xl bg-blue-50 dark:bg-blue-600/20 border border-blue-200 dark:border-blue-500/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <ShieldCheck size={22} />
              </div>
              <div>
                <span className="text-2xl font-black text-slate-900 dark:text-white leading-none block">{customers.length}</span>
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">VERIFIED BASE</span>
              </div>
            </div>
          </div>
        </div>

        {/* SEARCH & FILTERS BAR */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 w-full max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={16} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by identity, contact or location..."
              className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 pl-11 pr-4 py-3 text-sm font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button className="flex items-center justify-center gap-2 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 px-5 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm">
              <Filter size={14} /> Filter by Profile
            </button>
            <button className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-blue-500/25 border border-blue-400/30">
              <Download size={14} /> Export
            </button>
          </div>
        </div>

        {/* DATA TABLE SECTION */}
        {isLoadingCustomers ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
            <Loader2 className="animate-spin text-blue-500" size={48} strokeWidth={2} />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Loading Verified Identities</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-32 text-center bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-[3rem] backdrop-blur-xl shadow-lg">
            <Users className="mx-auto mb-4 text-slate-400 dark:text-slate-600" size={64} />
            <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-xs">No registered users matching search query</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800/80 rounded-3xl shadow-xl overflow-hidden backdrop-blur-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800/80 text-[10px] font-black uppercase text-slate-600 dark:text-slate-400 tracking-[0.2em]">
                    <th className="px-8 py-5">MEMBER IDENTITY</th>
                    <th className="px-8 py-5">COMMUNICATION PATH</th>
                    <th className="px-8 py-5">WALLET BALANCE</th>
                    <th className="px-8 py-5">REGISTRATION DATE</th>
                    <th className="px-8 py-5 text-right">OPERATIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
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
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors group"
                      >
                        {/* Member Identity */}
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div className="size-11 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-md border border-blue-400/30 shrink-0">
                              {initials}
                            </div>
                            <div>
                              <p className="font-extrabold text-slate-900 dark:text-white text-sm tracking-wide uppercase group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {fullName}
                              </p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="size-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                                <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                                  ACTIVE IDENTITY
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Communication Path */}
                        <td className="px-8 py-5">
                          <div className="flex flex-col gap-1 text-xs font-semibold text-slate-700 dark:text-slate-200">
                            <span className="flex items-center gap-2">
                              <Mail size={13} className="text-blue-600 dark:text-blue-400" /> {c.email || 'N/A'}
                            </span>
                            <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                              <Phone size={13} className="text-blue-600 dark:text-blue-400" /> {c.mobile_number || c.phone || 'N/A'}
                            </span>
                          </div>
                        </td>

                        {/* Wallet Balance */}
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                              ₹{(c.wallet_balance || 0).toLocaleString('en-IN')}
                            </span>
                          </div>
                          <span className="text-[9px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest block mt-0.5">
                            CASH WALLET
                          </span>
                        </td>

                        {/* Registration Date */}
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200">
                            <Calendar size={14} className="text-blue-600 dark:text-blue-400" />
                            <span>{joinedDate}</span>
                          </div>
                          <span className="text-[9px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest block mt-0.5">
                            VERIFIED DATE
                          </span>
                        </td>

                        {/* Operations */}
                        <td className="px-8 py-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={(e) => handleOpenWalletModal(e, c)}
                              className="p-2.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white transition-all border border-emerald-200 dark:border-emerald-500/30 cursor-pointer shadow-xs flex items-center gap-1.5 text-xs font-bold"
                              title="Add / Deduct Wallet Balance"
                            >
                              <Wallet size={15} />
                              <span className="hidden sm:inline">Wallet</span>
                            </button>
                            <button
                              onClick={() => navigate(`/customers/${c._id}`)}
                              className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-blue-600 hover:text-white transition-all border border-slate-200 dark:border-slate-700/80 cursor-pointer shadow-xs"
                              title="View Profile Dossier"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={(e) => handleDelete(e, c._id, fullName)}
                              className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-rose-600 hover:text-white transition-all border border-slate-200 dark:border-slate-700/80 cursor-pointer shadow-xs"
                              title="Delete Customer"
                            >
                              <Trash2 size={16} />
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

        {/* MANAGE WALLET MODAL */}
        {selectedUserForWallet && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative">
              <button 
                onClick={() => setSelectedUserForWallet(null)}
                className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-white p-2 rounded-xl"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="size-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black">
                  <Wallet size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">Manage User Wallet</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{selectedUserForWallet.name}</p>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl mb-6 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Current Balance</span>
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
                      className={`py-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 border transition-all ${
                        walletForm.type === 'credit' 
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-transparent'
                      }`}
                    >
                      <PlusCircle size={16} /> Credit (+)
                    </button>
                    <button
                      type="button"
                      onClick={() => setWalletForm(prev => ({ ...prev, type: 'debit' }))}
                      className={`py-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 border transition-all ${
                        walletForm.type === 'debit' 
                          ? 'bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-600/20' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-transparent'
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
                    className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 text-sm font-semibold text-slate-900 dark:text-white outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">Reason / Note (Optional)</label>
                  <input
                    type="text"
                    value={walletForm.description}
                    onChange={(e) => setWalletForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="e.g. Promotional credit, Refund, Correction"
                    className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 text-sm font-semibold text-slate-900 dark:text-white outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  onClick={handleWalletSubmit}
                  disabled={isSubmittingWallet}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-extrabold text-sm uppercase tracking-wider transition-all shadow-lg shadow-blue-600/25 mt-4 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmittingWallet ? 'Updating Balance...' : `Confirm ${walletForm.type === 'credit' ? 'Credit' : 'Debit'}`}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomersList;
