import React, { useState, useEffect } from 'react';
import { Search, Users, X, Check, UserCheck, Shield, Phone, Mail, CheckSquare, Square } from 'lucide-react';
import { apiClient } from '../../stores/authStores';

export default function ContactsDirectoryModal({
  isOpen,
  onClose,
  defaultFilter = 'all', // 'all', 'customers', 'admins'
  selectedRecipients = [],
  onApplyRecipients,
}) {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState(defaultFilter || 'all');
  const [contacts, setContacts] = useState([]);
  const [counts, setCounts] = useState({ customersCount: 0, adminsCount: 0, totalContacts: 0 });
  const [loading, setLoading] = useState(false);

  // Map of selected contacts keyed by email: { email: { id, name, email, role, phone } }
  const [selectedMap, setSelectedMap] = useState({});

  useEffect(() => {
    if (isOpen) {
      const activeType = defaultFilter || 'all';
      setFilterType(activeType);
      setSearch('');

      const initial = {};
      selectedRecipients.forEach((item) => {
        const email = typeof item === 'string' ? item : item.email;
        if (email) {
          initial[email.toLowerCase()] = typeof item === 'object' ? item : { email, name: email, role: 'Contact' };
        }
      });
      setSelectedMap(initial);
      fetchContacts('', activeType);
    }
  }, [isOpen, defaultFilter]);

  const fetchContacts = async (query = search, type = filterType) => {
    setLoading(true);
    try {
      const res = await apiClient.get('/admin/direct-mail/contacts', {
        params: { q: query, type, limit: 300 },
      });
      if (res.data.success) {
        setContacts(res.data.contacts || []);
        if (res.data.counts) {
          setCounts(res.data.counts);
        }
      }
    } catch (err) {
      console.error('Failed to fetch contacts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (val) => {
    setSearch(val);
    fetchContacts(val, filterType);
  };

  const handleFilterChange = (type) => {
    setFilterType(type);
    fetchContacts(search, type);
  };

  const toggleContact = (contact) => {
    if (!contact?.email) return;
    const lower = contact.email.toLowerCase();
    const next = { ...selectedMap };
    if (next[lower]) {
      delete next[lower];
    } else {
      next[lower] = {
        id: contact.id,
        name: contact.name,
        email: contact.email,
        role: contact.role,
        phone: contact.phone,
      };
    }
    setSelectedMap(next);
  };

  const toggleSelectAllFiltered = () => {
    const next = { ...selectedMap };
    const allFilteredSelected = contacts.length > 0 && contacts.every((c) => !!next[c.email.toLowerCase()]);

    if (allFilteredSelected) {
      contacts.forEach((c) => delete next[c.email.toLowerCase()]);
    } else {
      contacts.forEach((c) => {
        next[c.email.toLowerCase()] = {
          id: c.id,
          name: c.name,
          email: c.email,
          role: c.role,
          phone: c.phone,
        };
      });
    }
    setSelectedMap(next);
  };

  const handleClearAll = () => {
    setSelectedMap({});
  };

  const handleApply = () => {
    onApplyRecipients(Object.values(selectedMap));
    onClose();
  };

  if (!isOpen) return null;

  const allFilteredSelected =
    contacts.length > 0 && contacts.every((c) => !!selectedMap[c.email.toLowerCase()]);

  const selectedCount = Object.keys(selectedMap).length;

  // Modal Title and Icon based on filterType
  const getHeaderDetails = () => {
    if (filterType === 'customers') {
      return {
        title: 'Select Customers (First Name Wise)',
        subtitle: 'Browse and select specific customers to send outreach to. Search by first or last name.',
        icon: Users,
        color: 'blue',
      };
    }
    if (filterType === 'admins') {
      return {
        title: 'Select Administrators (First Name Wise)',
        subtitle: 'Browse and select specific system administrators. Search by name or email.',
        icon: Shield,
        color: 'purple',
      };
    }
    return {
      title: 'Contacts Directory & Multi-Select',
      subtitle: 'Browse all registered customers and administrators sorted alphabetically by First Name.',
      icon: Users,
      color: 'blue',
    };
  };

  const header = getHeaderDetails();
  const HeaderIcon = header.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8 flex flex-col max-h-[88vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              header.color === 'purple'
                ? 'bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/40 text-purple-600 dark:text-purple-400'
                : 'bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 text-blue-600 dark:text-blue-400'
            }`}>
              <HeaderIcon size={20} strokeWidth={2.2} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {header.title}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {header.subtitle}
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

        {/* Search & Filter Header Bar */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 space-y-3 shrink-0">
          
          {/* Real-time Name Search Input with Icon */}
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search by first name, last name, email, or mobile..."
              className="w-full pl-10 pr-12 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-sm"
              autoFocus
            />
            {search && (
              <button
                type="button"
                onClick={() => handleSearchChange('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                Clear
              </button>
            )}
          </div>

          {/* Group Filter Tabs & Bulk Selection Buttons */}
          <div className="flex items-center justify-between flex-wrap gap-2 pt-0.5">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleFilterChange('customers')}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition ${
                  filterType === 'customers'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}
              >
                <span>👥</span> Customers ({counts.customersCount})
              </button>

              <button
                type="button"
                onClick={() => handleFilterChange('admins')}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition ${
                  filterType === 'admins'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}
              >
                <span>🛡️</span> Admins ({counts.adminsCount})
              </button>

              <button
                type="button"
                onClick={() => handleFilterChange('all')}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition ${
                  filterType === 'all'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}
              >
                All ({counts.totalContacts})
              </button>
            </div>

            <div className="flex items-center gap-3">
              {selectedCount > 0 && (
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="text-xs font-semibold text-slate-500 hover:text-red-600 transition"
                >
                  Clear Selection
                </button>
              )}

              {contacts.length > 0 && (
                <button
                  type="button"
                  onClick={toggleSelectAllFiltered}
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1.5"
                >
                  {allFilteredSelected ? (
                    <>
                      <CheckSquare size={14} /> Deselect All
                    </>
                  ) : (
                    <>
                      <Square size={14} /> Select All {filterType === 'customers' ? 'Customers' : filterType === 'admins' ? 'Admins' : ''} ({contacts.length})
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Structured List View (First Name Wise) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          {loading ? (
            <div className="py-16 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></span>
              Loading contacts list...
            </div>
          ) : contacts.length > 0 ? (
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
              {contacts.map((c) => {
                const isSelected = !!selectedMap[c.email.toLowerCase()];
                const initials = c.name
                  .split(' ')
                  .map((p) => p[0])
                  .filter(Boolean)
                  .slice(0, 2)
                  .join('')
                  .toUpperCase() || 'U';

                return (
                  <div
                    key={c.id || c.email}
                    onClick={() => toggleContact(c)}
                    className={`flex items-center justify-between p-3.5 cursor-pointer select-none transition-all ${
                      isSelected
                        ? 'bg-blue-50/70 dark:bg-blue-950/30'
                        : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0 pr-2">
                      {/* Checkbox */}
                      <div
                        className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all ${
                          isSelected
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                        }`}
                      >
                        {isSelected && <Check size={13} strokeWidth={3} />}
                      </div>

                      {/* Initials Avatar */}
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                        c.role === 'Customer'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300'
                          : 'bg-purple-100 text-purple-700 dark:bg-purple-950/70 dark:text-purple-300'
                      }`}>
                        {initials}
                      </div>

                      {/* Name & Email Details */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">
                            {c.name}
                          </span>
                          <span
                            className={`px-2 py-0.5 text-[9px] font-extrabold uppercase rounded-md tracking-wider ${
                              c.role === 'Customer'
                                ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50'
                                : 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200 dark:border-purple-900/50'
                            }`}
                          >
                            {c.role}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5 truncate">
                          <span className="flex items-center gap-1">
                            <Mail size={11} className="text-slate-400" /> {c.email}
                          </span>
                          {c.phone && (
                            <span className="flex items-center gap-1">
                              • <Phone size={11} className="text-slate-400" /> {c.phone}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      {isSelected ? (
                        <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2.5 py-1 rounded-md">
                          Selected
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400">
                          Click to select
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-16 text-center text-xs text-slate-400">
              No contacts found matching "{search}".
            </div>
          )}
        </div>

        {/* Sticky Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">
            <span className="font-extrabold text-blue-600 dark:text-blue-400">{selectedCount}</span> contact(s) selected
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-600/20 transition"
            >
              Apply Selected ({selectedCount})
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
