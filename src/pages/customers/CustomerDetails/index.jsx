import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  User,
  Ticket,
  MessageSquare,
  Gift,
  Loader2,
  Mail,
  Phone,
  ShieldCheck,
  Trash2,
  UserCircle2,
  HelpCircle,
  Snowflake,
  Heart,
  Globe,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { useCustomerStore } from '../../../stores/customerStore';
import { getCdnUrl } from '../../../utils/media';
import ConfirmationModal from '../../../newComponents/ConfirmationModel';
import OverviewTab from './tabs/OverviewTab';
import BookingsTab from './tabs/BookingTab';
import WishlistTab from './tabs/WishlistTab';
import ReviewsTab from './tabs/ReviewsTab';
import GiftCardsTab from './tabs/GiftCardsTab';
import EnquiriesTab from './tabs/EnquiriesTab';

const TABS = [
  { id: 'overview', label: 'OVERVIEW', icon: UserCircle2 },
  { id: 'bookings', label: 'BOOKINGS', icon: Ticket },
  { id: 'wishlist', label: 'WISHLIST', icon: Heart },
  { id: 'reviews', label: 'REVIEWS', icon: MessageSquare },
  { id: 'giftcards', label: 'GIFT CARDS', icon: Gift },
  { id: 'enquiries', label: 'ENQUIRIES', icon: HelpCircle },
];

const CustomerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const {
    customer,
    isLoadingCustomer,
    fetchCustomerById,
    fetchTabData,
    tabData,
    resetTabData,
    deleteCustomer,
    isDeleting,
  } = useCustomerStore();

  useEffect(() => {
    fetchCustomerById(id);
    resetTabData();
  }, [id]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    if (tabId !== 'overview') {
      fetchTabData(id, tabId);
    }
  };

  const handleDelete = async () => {
    const ok = await deleteCustomer(id);
    if (ok) {
      setShowDeleteModal(false);
      navigate('/customers');
    }
  };

  if (isLoadingCustomer) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] gap-4">
        <Loader2 className="size-10 animate-spin text-blue-500" />
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Loading user profile...</p>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] text-center p-6">
        <div className="size-20 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mb-6">
          <User className="size-10 text-slate-600" />
        </div>
        <h3 className="text-xl font-bold text-white">Customer not found</h3>
        <button
          onClick={() => navigate('/customers')}
          className="mt-6 text-xs font-black text-blue-400 uppercase tracking-widest hover:underline cursor-pointer"
        >
          Back to Registry
        </button>
      </div>
    );
  }

  const fullName = `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'UNNAMED USER';
  const initials = `${customer.firstName?.[0] || 'U'}${customer.lastName?.[0] || ''}`.toUpperCase();
  const joinedDateStr = customer.createdAt
    ? new Date(customer.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'N/A';

  return (
    <div className="text-slate-900 dark:text-white pb-16 font-sans">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        {/* Navigation bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/customers')}
            className="group flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shadow-sm text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide cursor-pointer"
          >
            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to Registered Users
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 dark:text-slate-400 hover:text-rose-600 hover:border-rose-300 dark:hover:border-rose-900/50 transition-colors shadow-sm cursor-pointer"
            title="Delete Customer Profile"
          >
            <Trash2 size={18} />
          </button>
        </div>

        {/* TOP HERO PROFILE HEADER */}
        <div className="bg-white dark:bg-slate-900/90 rounded-[2.5rem] border border-slate-200 dark:border-slate-800/80 shadow-xl p-8 relative overflow-hidden">
          {/* Subtle gradient glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl -z-0 pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              {/* Avatar circle */}
              <div className="relative">
                {customer.profilePicture ? (
                  <img
                    src={getCdnUrl(customer.profilePicture)}
                    alt={fullName}
                    className="size-28 rounded-3xl object-cover border-2 border-blue-500/40 shadow-xl"
                  />
                ) : (
                  <div className="size-28 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-black text-3xl shadow-2xl border border-blue-400/30">
                    {initials}
                  </div>
                )}
                {customer.is_verified && (
                  <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-1.5 rounded-xl border border-white dark:border-slate-900 shadow-md">
                    <ShieldCheck size={16} />
                  </div>
                )}
              </div>

              {/* Identity details */}
              <div className="text-center sm:text-left space-y-3">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400 block mb-1">
                    VERIFIED IDENTITY
                  </span>
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight uppercase">
                    {fullName}
                  </h1>
                </div>

                {/* Badges row */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 pt-1">
                  <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <Mail size={13} className="text-blue-600 dark:text-blue-400" />
                    <span>{customer.email || 'No email'}</span>
                  </div>

                  <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <Phone size={13} className="text-blue-600 dark:text-blue-400" />
                    <span>{customer.mobile_number || customer.phone || 'No phone'}</span>
                  </div>

                  <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <Globe size={13} className="text-blue-600 dark:text-blue-400" />
                    <span className="uppercase font-bold tracking-wider">GLOBAL</span>
                  </div>
                </div>

                {/* Sub status info */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-6 text-xs text-slate-500 dark:text-slate-400 pt-2">
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 block mb-0.5">
                      MEMBER SINCE
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 uppercase">{joinedDateStr}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 block mb-0.5">
                      STATUS
                    </span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 uppercase">
                      <span className="size-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                      AUTHENTICATED
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* TABS NAVIGATION HEADER */}
          <div className="flex items-center gap-3 overflow-x-auto border-t border-slate-200 dark:border-slate-800/80 pt-6 mt-8 custom-scrollbar">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black tracking-widest uppercase transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-blue-600 text-white dark:bg-blue-600/20 dark:text-blue-400 border border-blue-600 dark:border-blue-500/50 shadow-md'
                      : 'bg-slate-100 dark:bg-slate-950/60 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* TAB CONTENT SECTION */}
        <div className="bg-white dark:bg-slate-900/90 rounded-[2.5rem] border border-slate-200 dark:border-slate-800/80 p-8 shadow-xl min-h-[350px]">
          {activeTab === 'overview' && <OverviewTab customer={customer} />}
          {activeTab === 'bookings' && <BookingsTab tab={tabData.bookings} />}
          {activeTab === 'wishlist' && <WishlistTab data={tabData.wishlist?.data} loading={tabData.wishlist?.loading} />}
          {activeTab === 'reviews' && <ReviewsTab tab={tabData.reviews} />}
          {activeTab === 'giftcards' && <GiftCardsTab tab={tabData.giftcards} />}
          {activeTab === 'enquiries' && <EnquiriesTab tab={tabData.enquiries} />}
        </div>
      </div>

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Delete customer account?"
      >
        This will permanently remove <strong>{fullName}</strong>'s account. This action cannot be undone.
      </ConfirmationModal>
    </div>
  );
};

export default CustomerDetails;
