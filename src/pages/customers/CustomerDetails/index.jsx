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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8 pb-20 font-sans min-h-screen text-slate-900 dark:text-slate-100 text-left">
      <div className="flex flex-col gap-6">
        {/* Navigation bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/customers')}
            className="group flex items-center gap-2.5 px-4 sm:px-5 py-2.5 bg-white dark:bg-[#091126]/95 border border-slate-200/90 dark:border-indigo-500/25 rounded-2xl hover:bg-slate-50 dark:hover:bg-indigo-950/40 hover:border-indigo-500/40 transition-all shadow-sm text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider cursor-pointer"
          >
            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform text-blue-600 dark:text-indigo-400" />
            Back to Registered Users
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="p-2.5 sm:px-4 sm:py-2.5 bg-white dark:bg-[#091126]/95 border border-slate-200/90 dark:border-indigo-500/25 rounded-2xl text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-300 dark:hover:border-rose-500/40 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 transition-all shadow-sm cursor-pointer flex items-center gap-2 text-xs font-bold"
            title="Delete Customer Profile"
          >
            <Trash2 size={16} />
            <span className="hidden sm:inline">Delete Profile</span>
          </button>
        </div>

        {/* TOP HERO PROFILE HEADER */}
        <div className="bg-white dark:bg-[#091126] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md p-6 sm:p-8 relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              {/* Avatar */}
              <div className="relative shrink-0">
                {customer.profilePicture ? (
                  <img
                    src={getCdnUrl(customer.profilePicture)}
                    alt={fullName}
                    className="size-24 sm:size-28 rounded-3xl object-cover border-2 border-blue-500/40 shadow-xl"
                  />
                ) : (
                  <div className="size-24 sm:size-28 rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 text-white flex items-center justify-center font-black text-3xl sm:text-4xl shadow-xl shadow-indigo-500/25 ring-4 ring-white dark:ring-[#070d1e]">
                    {initials}
                  </div>
                )}
                {customer.is_verified && (
                  <div className="absolute -bottom-1.5 -right-1.5 bg-gradient-to-br from-blue-600 to-indigo-600 text-white p-1.5 rounded-xl ring-2 ring-white dark:ring-[#091126] shadow-md">
                    <ShieldCheck size={16} />
                  </div>
                )}
              </div>

              {/* Identity details */}
              <div className="text-center sm:text-left space-y-3">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.18em] bg-blue-50 dark:bg-indigo-950/60 text-blue-600 dark:text-indigo-400 border border-blue-200/80 dark:border-indigo-500/30 mb-2">
                    <Sparkles size={11} />
                    VERIFIED IDENTITY
                  </div>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight uppercase">
                    {fullName}
                  </h1>
                </div>

                {/* Badges row */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 pt-1">
                  <div className="flex items-center gap-2 bg-slate-50 dark:bg-[#070d1e]/90 border border-slate-200/80 dark:border-indigo-500/20 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <Mail size={13} className="text-blue-600 dark:text-indigo-400 shrink-0" />
                    <span>{customer.email || 'No email'}</span>
                  </div>

                  <div className="flex items-center gap-2 bg-slate-50 dark:bg-[#070d1e]/90 border border-slate-200/80 dark:border-indigo-500/20 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <Phone size={13} className="text-blue-600 dark:text-indigo-400 shrink-0" />
                    <span>{customer.mobile_number || customer.phone || 'No phone'}</span>
                  </div>

                  <div className="flex items-center gap-2 bg-slate-50 dark:bg-[#070d1e]/90 border border-slate-200/80 dark:border-indigo-500/20 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <Globe size={13} className="text-blue-600 dark:text-indigo-400 shrink-0" />
                    <span className="uppercase font-bold tracking-wider">GLOBAL</span>
                  </div>
                </div>

                {/* Sub status info */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-6 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-400 block mb-0.5">
                      MEMBER SINCE
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 uppercase">{joinedDateStr}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-400 block mb-0.5">
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
          <div className="flex items-center gap-2.5 overflow-x-auto border-t border-slate-200/80 dark:border-indigo-500/20 pt-6 mt-8 custom-scrollbar">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-indigo-500/25 border border-transparent'
                      : 'bg-slate-50 dark:bg-[#070d1e]/80 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-indigo-500/20 hover:bg-slate-100 dark:hover:bg-[#0e1a3d] hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Icon size={15} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* TAB CONTENT SECTION */}
        <div className="bg-white dark:bg-[#091126] rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm min-h-[350px]">
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
