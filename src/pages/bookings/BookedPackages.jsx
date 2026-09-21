import { useEffect, useState, useMemo } from "react";
import { apiClient } from "../../stores/authStores";
import {
  Mail,
  User,
  Phone,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Search,
  Download,
  DollarSign,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Copy,
  FileText,
  Eye,
  X,
  CreditCard,
  Check,
  Trash2,
  MapPin,
  ShieldCheck,
  Tag,
  Building,
  Plane,
  Receipt,
  Users,
  Ticket,
  Gift,
  ArrowUpDown,
  ChevronDown,
  Filter,
  RotateCcw,
  IndianRupee
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";


// Helper to calculate start date, end date and duration
const getTravelDates = (travelDateStr, itinerary) => {
  if (!travelDateStr) return { start: "N/A", end: "N/A", duration: "N/A" };

  const start = new Date(travelDateStr);

  // Try to parse days count from duration (e.g., "5 Days / 4 Nights" -> 5)
  let daysCount = 1;
  if (itinerary?.duration) {
    const match = itinerary.duration.match(/(\d+)\s*Day/i);
    if (match && match[1]) {
      daysCount = parseInt(match[1], 10);
    } else {
      const numMatch = itinerary.duration.match(/^(\d+)$/);
      if (numMatch && numMatch[1]) {
        daysCount = parseInt(numMatch[1], 10);
      }
    }
  }

  // Fallback to days_information length if daysCount is still 1
  if (daysCount === 1 && itinerary?.days_information?.length) {
    daysCount = itinerary.days_information.length;
  }

  const end = new Date(start);
  if (daysCount > 1) {
    end.setDate(start.getDate() + (daysCount - 1));
  }

  const options = { year: "numeric", month: "short", day: "numeric" };
  return {
    start: start.toLocaleDateString("en-IN", options),
    end: end.toLocaleDateString("en-IN", options),
    duration: itinerary?.duration || `${daysCount} Days`
  };
};

// Payment status badge config
const getPaymentBadge = (status) => {
  switch (status) {
    case 'paid':
      return {
        label: 'Paid',
        bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
        text: 'text-emerald-600 dark:text-emerald-400',
        border: 'border-emerald-500/20',
        dot: 'bg-emerald-500'
      };
    case 'partial_paid':
      return {
        label: 'Token Paid',
        bg: 'bg-amber-500/10 dark:bg-amber-500/15',
        text: 'text-amber-600 dark:text-amber-400',
        border: 'border-amber-500/20',
        dot: 'bg-amber-500'
      };
    case 'failed':
      return {
        label: 'Failed',
        bg: 'bg-rose-500/10 dark:bg-rose-500/15',
        text: 'text-rose-600 dark:text-rose-400',
        border: 'border-rose-500/20',
        dot: 'bg-rose-500'
      };
    default:
      return {
        label: 'Pending',
        bg: 'bg-orange-500/10 dark:bg-orange-500/15',
        text: 'text-orange-600 dark:text-orange-400',
        border: 'border-orange-500/20',
        dot: 'bg-orange-500'
      };
  }
};

// Helper for exact financial calculation based on payment_status
const getBookingFinancials = (b) => {
  const isPaid = b.payment_status === 'paid';
  const isPartial = b.payment_status === 'partial_paid';
  const isToken = b.payment_type === 'token';

  // Paid amount depends strictly on payment_status:
  let paidAmount = 0;
  if (isPaid) {
    paidAmount = b.total_price;
  } else if (isPartial) {
    paidAmount = b.token_amount_paid || 5000;
  } else {
    // pending or failed
    paidAmount = 0;
  }

  // Pending / due balance
  let dueAmount = 0;
  if (isPaid) {
    dueAmount = 0;
  } else if (isPartial) {
    dueAmount = Math.max(0, b.total_price - paidAmount);
  } else {
    // pending or failed
    dueAmount = b.total_price;
  }

  const voucher = b.voucher_amount_used || 0;
  const wallet = b.wallet_amount_used || 0;
  const subtotalInclusive = b.total_price + voucher + wallet;
  const baseVal = subtotalInclusive / 1.18;
  const gstVal = subtotalInclusive - baseVal;

  return {
    isPaid,
    isPartial,
    isToken,
    paidAmount,
    dueAmount,
    voucher,
    wallet,
    baseVal,
    gstVal
  };
};

// Gift Card Helpers
const isGiftCardPaid = (card) => {
  if (!card) return false;
  if (card.status === 'created' || card.status === 'cancelled' || card.status === 'failed') {
    return false;
  }
  if (card.razorpay_payment_id) return true;
  return ['paid', 'active', 'invited', 'accepted', 'verified', 'redeemed', 'expired'].includes(card.status);
};

const getGiftCardPaymentBadge = (card) => {
  const paid = isGiftCardPaid(card);
  if (paid) {
    return {
      label: 'Paid',
      bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
      text: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-500/20',
      dot: 'bg-emerald-500'
    };
  }
  if (card?.status === 'cancelled' || card?.status === 'failed' || card?.status === 'revoked') {
    return {
      label: (card?.status || 'Failed').toUpperCase(),
      bg: 'bg-rose-500/10 dark:bg-rose-500/15',
      text: 'text-rose-600 dark:text-rose-400',
      border: 'border-rose-500/20',
      dot: 'bg-rose-500'
    };
  }
  return {
    label: 'Pending',
    bg: 'bg-amber-500/10 dark:bg-amber-500/15',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-500/20',
    dot: 'bg-amber-500'
  };
};

const getGiftCardLifecycleBadge = (status) => {
  switch (status) {
    case 'active':
      return { label: 'Active', bg: 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30' };
    case 'invited':
      return { label: 'Invited', bg: 'bg-sky-50 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-500/30' };
    case 'redeemed':
      return { label: 'Redeemed', bg: 'bg-purple-50 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-500/30' };
    case 'expired':
      return { label: 'Expired', bg: 'bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-600/30' };
    case 'created':
      return { label: 'Awaiting Payment', bg: 'bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/30' };
    case 'cancelled':
      return { label: 'Cancelled', bg: 'bg-rose-50 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-500/30' };
    default:
      return { label: (status || 'Unknown').toUpperCase(), bg: 'bg-slate-100 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600/30' };
  }
};

const BookedPackages = () => {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest"); // "newest" | "oldest"
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [downloadingId, setDownloadingId] = useState(null);
  const [viewBooking, setViewBooking] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [deleteBookingModal, setDeleteBookingModal] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Activities state
  const [activeCategory, setActiveCategory] = useState("packages"); // "packages" | "activities" | "giftcards"
  const [activityBookings, setActivityBookings] = useState([]);
  const [isLoadingActivities, setIsLoadingActivities] = useState(false);
  const [viewActivityBooking, setViewActivityBooking] = useState(null);

  // Gift Cards state
  const [giftCardBookings, setGiftCardBookings] = useState([]);
  const [isLoadingGiftCards, setIsLoadingGiftCards] = useState(false);
  const [viewGiftCardBooking, setViewGiftCardBooking] = useState(null);

  const fetchBookings = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get("/itinerary-bookings/all");
      if (response.data?.success) {
        setBookings(response.data.bookings || []);
      } else {
        setError("Failed to load booking details.");
      }
    } catch (err) {
      console.error("fetchBookings Error:", err);
      setError("Failed to synchronize booked packages.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchActivityBookings = async () => {
    setIsLoadingActivities(true);
    try {
      const res = await apiClient.get("/activity-bookings/all");
      if (res.data?.success) {
        setActivityBookings(res.data.bookings || []);
      }
    } catch (err) {
      console.error("fetchActivityBookings Error:", err);
    } finally {
      setIsLoadingActivities(false);
    }
  };

  const fetchGiftCardBookings = async () => {
    setIsLoadingGiftCards(true);
    try {
      const res = await apiClient.get("/admin/giftcard/all?limit=1000");
      if (res.data?.success) {
        setGiftCardBookings(res.data.giftCards || []);
      }
    } catch (err) {
      console.error("fetchGiftCardBookings Error:", err);
    } finally {
      setIsLoadingGiftCards(false);
    }
  };

  const handleDeleteActivityBooking = async (id) => {
    if (!window.confirm("Are you sure you want to delete this activity booking?")) return;
    try {
      const res = await apiClient.delete(`/activity-bookings/${id}`);
      if (res.data?.success) {
        toast.success("Activity booking deleted successfully!");
        setActivityBookings(prev => prev.filter(b => b._id !== id));
        if (viewActivityBooking?._id === id) setViewActivityBooking(null);
      } else {
        toast.error(res.data?.msg || "Failed to delete activity booking.");
      }
    } catch (err) {
      toast.error(err.response?.data?.msg || "Error deleting activity booking.");
    }
  };

  const handleDeleteBooking = async () => {
    if (!deleteBookingModal?._id) return;
    try {
      setIsDeleting(true);
      const res = await apiClient.delete(`/itinerary-bookings/${deleteBookingModal._id}`);
      if (res.data?.success) {
        toast.success("Booking deleted successfully!");
        setBookings(prev => prev.filter(b => b._id !== deleteBookingModal._id));
        if (viewBooking?._id === deleteBookingModal._id) {
          setViewBooking(null);
        }
        setDeleteBookingModal(null);
      } else {
        toast.error(res.data?.msg || "Failed to delete booking.");
      }
    } catch (err) {
      console.error("handleDeleteBooking Error:", err);
      toast.error(err.response?.data?.msg || "Error deleting booking.");
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    fetchActivityBookings();
    fetchGiftCardBookings();
  }, []);

  // Filter Bookings by search term and status tab
  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      const custName = `${b.user_id?.firstName || ""} ${b.user_id?.lastName || ""}`.toLowerCase();
      const custEmail = (b.user_id?.email || "").toLowerCase();
      const itineraryTitle = (b.itinerary_id?.title || "").toLowerCase();
      const invoiceNum = `INV-T2H-${b._id?.substring(0, 8).toUpperCase()}`.toLowerCase();
      const search = searchTerm.toLowerCase();

      const matchesSearch = (
        custName.includes(search) ||
        custEmail.includes(search) ||
        itineraryTitle.includes(search) ||
        invoiceNum.includes(search)
      );

      if (!matchesSearch) return false;

      if (statusFilter === "paid") return b.payment_status === "paid";
      if (statusFilter === "pending") return b.payment_status !== "paid";

      return true;
    }).sort((a, b) => {
      const dateA = new Date(a.travel_date || a.createdAt || 0);
      const dateB = new Date(b.travel_date || b.createdAt || 0);
      return sortOrder === "oldest" ? dateA - dateB : dateB - dateA;
    });
  }, [bookings, searchTerm, statusFilter, sortOrder]);

  // Filter Activity Bookings
  const filteredActivityBookings = useMemo(() => {
    return activityBookings.filter(b => {
      const matchSearch =
        !searchTerm ||
        b.booking_reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.lead_guest?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.lead_guest?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.lead_guest?.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.activity_id?.title?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "paid" && b.payment_status === "paid") ||
        (statusFilter === "pending" && b.payment_status !== "paid");

      return matchSearch && matchStatus;
    }).sort((a, b) => {
      const dateA = new Date(a.activity_date || a.createdAt || 0);
      const dateB = new Date(b.activity_date || b.createdAt || 0);
      return sortOrder === "oldest" ? dateA - dateB : dateB - dateA;
    });
  }, [activityBookings, searchTerm, statusFilter, sortOrder]);

  // Filter Gift Card Bookings
  const filteredGiftCardBookings = useMemo(() => {
    return giftCardBookings.filter(card => {
      const search = searchTerm.toLowerCase().trim();
      const senderName = card.sender_user_id
        ? `${card.sender_user_id.firstName || ""} ${card.sender_user_id.lastName || ""}`.toLowerCase()
        : "";
      const senderEmail = (card.sender_user_id?.email || "").toLowerCase();
      const recipientName = (card.recipient_name || card.accepted_by_user_id?.firstName || "").toLowerCase();
      const recipientEmail = (card.recipient_email || card.accepted_by_user_id?.email || "").toLowerCase();
      const code = (card.public_code || "").toLowerCase();
      const paymentId = (card.razorpay_payment_id || "").toLowerCase();
      const orderId = (card.razorpay_order_id || "").toLowerCase();

      const matchesSearch = !search ||
        code.includes(search) ||
        senderName.includes(search) ||
        senderEmail.includes(search) ||
        recipientName.includes(search) ||
        recipientEmail.includes(search) ||
        paymentId.includes(search) ||
        orderId.includes(search);

      if (!matchesSearch) return false;

      const paid = isGiftCardPaid(card);
      if (statusFilter === "paid") return paid;
      if (statusFilter === "pending") return !paid;

      return true;
    }).sort((a, b) => {
      const dateA = new Date(a.created_at || a.createdAt || 0);
      const dateB = new Date(b.created_at || b.createdAt || 0);
      return sortOrder === "oldest" ? dateA - dateB : dateB - dateA;
    });
  }, [giftCardBookings, searchTerm, statusFilter, sortOrder]);

  // Current list count for pagination
  const currentCategoryCount = useMemo(() => {
    if (activeCategory === "packages") return filteredBookings.length;
    if (activeCategory === "activities") return filteredActivityBookings.length;
    return filteredGiftCardBookings.length;
  }, [activeCategory, filteredBookings.length, filteredActivityBookings.length, filteredGiftCardBookings.length]);

  // Dynamic Pagination Logic
  const effectiveItemsPerPage =
    itemsPerPage >= currentCategoryCount && currentCategoryCount > 0 && itemsPerPage > 50
      ? currentCategoryCount
      : itemsPerPage;

  const totalPages = Math.max(1, Math.ceil(currentCategoryCount / effectiveItemsPerPage));

  const paginatedBookings = useMemo(() => {
    const start = (currentPage - 1) * effectiveItemsPerPage;
    return filteredBookings.slice(start, start + effectiveItemsPerPage);
  }, [filteredBookings, currentPage, effectiveItemsPerPage]);

  const paginatedActivityBookings = useMemo(() => {
    const start = (currentPage - 1) * effectiveItemsPerPage;
    return filteredActivityBookings.slice(start, start + effectiveItemsPerPage);
  }, [filteredActivityBookings, currentPage, effectiveItemsPerPage]);

  const paginatedGiftCardBookings = useMemo(() => {
    const start = (currentPage - 1) * effectiveItemsPerPage;
    return filteredGiftCardBookings.slice(start, start + effectiveItemsPerPage);
  }, [filteredGiftCardBookings, currentPage, effectiveItemsPerPage]);

  const handleResetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setSortOrder("newest");
    setItemsPerPage(10);
    setCurrentPage(1);
  };

  // Calculations for Stat Cards
  const stats = useMemo(() => {
    let totalPaid = 0;
    let totalPending = 0;
    let legacyNotesCount = 0;

    bookings.forEach(b => {
      const { paidAmount, dueAmount } = getBookingFinancials(b);
      totalPaid += paidAmount;
      totalPending += dueAmount;

      const isStandardFormat = b.notes ? /Addons:|Requests:|DepCity:/i.test(b.notes) : true;
      if (b.notes && !isStandardFormat) {
        legacyNotesCount++;
      }
    });

    return {
      totalBookingsCount: bookings.length,
      totalRevenue: totalPaid,
      totalPendingRevenue: totalPending,
      legacyNotesCount
    };
  }, [bookings]);

  // Handle Dynamic PDF Download
  const handleDownloadInvoice = async (bookingId) => {
    try {
      setDownloadingId(bookingId);
      toast.info("Preparing PDF Invoice...", { autoClose: 2000 });

      const response = await apiClient.get(`/itinerary-bookings/${bookingId}/invoice/download`, {
        responseType: "blob"
      });

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const shortId = bookingId.substring(0, 8).toUpperCase();
      link.setAttribute("download", `Invoice_INV-T2H-${shortId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Invoice PDF downloaded successfully!");
    } catch (err) {
      console.error("Invoice Download Error:", err);
      toast.error("Failed to generate PDF Invoice. Please try again.");
    } finally {
      setDownloadingId(null);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    toast.success("Copied to clipboard!", { position: "top-right", autoClose: 1500 });
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Helper to render booking notes / legacy fallbacks inside details
  const renderBookingNotes = (notesText) => {
    if (!notesText) return (
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Standard Package (No special add-ons or customized requests).</p>
    );

    const isStandardFormat = /Addons:|Requests:|DepCity:/i.test(notesText);

    if (isStandardFormat) {
      const addonsMatch = notesText.match(/Addons:\s*([^.]*)/i);
      const requestsMatch = notesText.match(/Requests:\s*([^.]*)/i);

      const addonsList = addonsMatch && addonsMatch[1]
        ? addonsMatch[1].split(",").map(s => s.trim()).filter(Boolean)
        : [];
      const requestsList = requestsMatch && requestsMatch[1]
        ? requestsMatch[1].split(",").map(s => s.trim()).filter(Boolean)
        : [];

      const ADDONS_LABELS = {
        'candle_dinner': 'Candle Light Dinner',
        'beach_dinner': 'Private Beach Dinner',
        'couple_spa': 'Couple Spa Therapy',
        'flower_bed': 'Flower Bed Decor',
        'photoshoot': 'Pro Couple Photoshoot'
      };

      if (addonsList.length === 0 && requestsList.length === 0) {
        return (
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Standard Package (No customized add-ons or special requests).</p>
        );
      }

      return (
        <div className="space-y-2">
          {addonsList.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {addonsList.map(addon => (
                <span key={addon} className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold rounded-md border border-indigo-200 dark:border-indigo-800/60">
                  {ADDONS_LABELS[addon] || addon}
                </span>
              ))}
            </div>
          )}
          {requestsList.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {requestsList.map(req => (
                <span key={req} className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold rounded-md border border-emerald-200 dark:border-emerald-800/60">
                  {req}
                </span>
              ))}
            </div>
          )}
        </div>
      );
    } else {
      return (
        <div className="bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl p-3 text-slate-800 dark:text-slate-300">
          <p className="text-xs font-medium leading-relaxed whitespace-pre-wrap">{notesText}</p>
        </div>
      );
    }
  };

  // Close modal on Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        setViewBooking(null);
        setViewActivityBooking(null);
        setViewGiftCardBooking(null);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6 pb-20 font-sans min-h-screen text-slate-900 dark:text-slate-100">

      {/* 1. TITLE & CATEGORY SWITCHER SECTION */}
      <div className="bg-white dark:bg-[#091126]/95 rounded-3xl p-6 sm:p-7 relative border border-slate-200/90 dark:border-indigo-500/25 shadow-xl dark:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.7),0_0_30px_2px_rgba(99,102,241,0.18)] ring-1 ring-slate-900/5 dark:ring-white/5 backdrop-blur-xl">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3.5 mb-2.5">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30 shrink-0">
                {activeCategory === "packages" ? <FileText size={24} /> : activeCategory === "activities" ? <Ticket size={24} /> : <Gift size={24} />}
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2 flex-wrap">
                  {activeCategory === "packages" ? (
                    <>Booked <span className="text-blue-500">Packages</span> Directory</>
                  ) : activeCategory === "activities" ? (
                    <>Booked <span className="text-blue-500">Activities</span> Directory</>
                  ) : (
                    <>Gift Card <span className="text-blue-500">Purchases</span> Directory</>
                  )}
                </h1>
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                  {activeCategory === "packages"
                    ? "Real-time Booking & Invoice Logs"
                    : activeCategory === "activities"
                    ? "Real-time Activity Passes & Ticket Logs"
                    : "Real-time Gift Card Purchases & Ledger"}
                </span>
              </div>
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm max-w-2xl">
              {activeCategory === "packages"
                ? "Inspect traveller profiles, payment gateway receipts, travel departure origins, and financial ledgers."
                : activeCategory === "activities"
                ? "Inspect guest bookings, participant tickets, payment receipts, and activity schedule details."
                : "Inspect buyer profiles, recipient deliveries, Razorpay transaction IDs, and card balances."}
            </p>
          </div>

          {/* Category Switcher Tabs */}
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-[#050A17] p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800/90 flex-wrap shrink-0">
            <button
              type="button"
              onClick={() => { setActiveCategory("packages"); setCurrentPage(1); }}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${activeCategory === "packages"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800/50"
                }`}
            >
              <span>Packages</span>
              <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${activeCategory === "packages" ? "bg-white/20 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"}`}>
                {bookings.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => { setActiveCategory("activities"); setCurrentPage(1); }}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${activeCategory === "activities"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800/50"
                }`}
            >
              <span>Activities</span>
              <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${activeCategory === "activities" ? "bg-white/20 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"}`}>
                {activityBookings.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => { setActiveCategory("giftcards"); setCurrentPage(1); }}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${activeCategory === "giftcards"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800/50"
                }`}
            >
              <span>Gift Cards</span>
              <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${activeCategory === "giftcards" ? "bg-white/20 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"}`}>
                {giftCardBookings.length}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. FINANCIAL LEDGER STATS (KPI) CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Booked / Passes / Cards */}
        <div className="bg-white dark:bg-[#091126]/95 p-5 rounded-3xl border border-slate-200/90 dark:border-indigo-500/25 shadow-xl dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] ring-1 ring-slate-900/5 dark:ring-white/5 backdrop-blur-xl hover:border-blue-500/50 dark:hover:border-indigo-500/50 transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {activeCategory === "packages" ? "Total Booked Trips" : activeCategory === "activities" ? "Total Activity Passes" : "Total Gift Cards"}
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              {activeCategory === "packages" ? <FileText size={18} /> : activeCategory === "activities" ? <Ticket size={18} /> : <Gift size={18} />}
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {activeCategory === "packages" ? stats.totalBookingsCount : activeCategory === "activities" ? activityBookings.length : giftCardBookings.length}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mt-1">
            {activeCategory === "packages" ? "Confirmed & Active Reservations" : activeCategory === "activities" ? "Booked Activity Slots" : "Purchased & Issued Gift Cards"}
          </p>
        </div>

        {/* Total Collection Paid */}
        <div className="bg-white dark:bg-[#091126]/95 p-5 rounded-3xl border border-slate-200/90 dark:border-indigo-500/25 shadow-xl dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] ring-1 ring-slate-900/5 dark:ring-white/5 backdrop-blur-xl hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Collection Paid</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <DollarSign size={18} />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
            ₹{activeCategory === "packages"
              ? stats.totalRevenue.toLocaleString("en-IN")
              : activeCategory === "activities"
              ? activityBookings.filter(b => b.payment_status === "paid").reduce((acc, b) => acc + (b.total_amount || 0), 0).toLocaleString("en-IN")
              : giftCardBookings.filter(isGiftCardPaid).reduce((acc, c) => acc + (c.payable_amount ?? c.amount ?? 0), 0).toLocaleString("en-IN")}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mt-1">Captured via Razorpay Gateway</p>
        </div>

        {/* Total Pending Balances */}
        <div className="bg-white dark:bg-[#091126]/95 p-5 rounded-3xl border border-slate-200/90 dark:border-indigo-500/25 shadow-xl dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] ring-1 ring-slate-900/5 dark:ring-white/5 backdrop-blur-xl hover:border-amber-500/50 dark:hover:border-amber-500/50 transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {activeCategory === "packages" ? "Total Pending Balances" : activeCategory === "activities" ? "Pending Passes" : "Pending Purchases"}
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock size={18} />
            </div>
          </div>
          <div className="text-3xl font-black text-amber-600 dark:text-amber-400">
            {activeCategory === "packages"
              ? `₹${stats.totalPendingRevenue.toLocaleString("en-IN")}`
              : activeCategory === "activities"
              ? `${activityBookings.filter(b => b.payment_status !== "paid").length} Pending`
              : `${giftCardBookings.filter(c => !isGiftCardPaid(c)).length} Pending`}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mt-1">
            {activeCategory === "packages" ? "Due Before Trip Departure" : activeCategory === "activities" ? "Awaiting payment verification" : "Awaiting checkout completion"}
          </p>
        </div>

        {/* Custom Notes / Tickets / Credit */}
        <div className="bg-white dark:bg-[#091126]/95 p-5 rounded-3xl border border-slate-200/90 dark:border-indigo-500/25 shadow-xl dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] ring-1 ring-slate-900/5 dark:ring-white/5 backdrop-blur-xl hover:border-purple-500/50 dark:hover:border-purple-500/50 transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {activeCategory === "packages" ? "Custom Notes / Addons" : activeCategory === "activities" ? "Total Tickets Booked" : "Total Card Credit"}
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              {activeCategory === "packages" ? <AlertTriangle size={18} /> : activeCategory === "activities" ? <Users size={18} /> : <Tag size={18} />}
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {activeCategory === "packages"
              ? stats.legacyNotesCount
              : activeCategory === "activities"
              ? activityBookings.reduce((acc, b) => acc + (b.tickets || 1), 0)
              : `₹${giftCardBookings.filter(isGiftCardPaid).reduce((acc, c) => acc + (c.amount || 0), 0).toLocaleString("en-IN")}`}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mt-1">
            {activeCategory === "packages" ? "Custom Notes Logged" : activeCategory === "activities" ? "Total Persons / Guests" : "Face Value Issued"}
          </p>
        </div>
      </div>

      {/* 3. SEARCH & FILTERS TOOLBAR CARD */}
      <div className="bg-white dark:bg-[#091126]/95 rounded-3xl p-5 md:p-6 border border-slate-200/90 dark:border-indigo-500/25 shadow-xl dark:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.7),0_0_30px_2px_rgba(99,102,241,0.18)] ring-1 ring-slate-900/5 dark:ring-white/5 backdrop-blur-xl space-y-4 relative z-30">
        {/* ROW 1: Search Input & Sort Order */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={
                activeCategory === 'packages'
                  ? "Search by customer name, email, invoice code, itinerary title..."
                  : activeCategory === 'activities'
                  ? "Search by guest name, email, booking ref, activity title..."
                  : "Search by buyer, recipient, gift code (T2H-...), payment ID..."
              }
              className="w-full pl-11 pr-10 py-3.5 bg-slate-50 dark:bg-[#050A17] border border-slate-200 dark:border-slate-800/90 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 rounded-2xl text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none transition-all shadow-inner"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => { setSearchTerm(""); setCurrentPage(1); }}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                title="Clear Search"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Sort Order (Newest First / Oldest First) */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-slate-400 font-bold uppercase tracking-wider text-xs flex items-center gap-1.5 shrink-0">
              <ArrowUpDown size={14} className="text-blue-500" /> Sort:
            </span>
            <div className="relative">
              <select
                value={sortOrder}
                onChange={(e) => {
                  setSortOrder(e.target.value);
                  setCurrentPage(1);
                }}
                className="appearance-none bg-slate-50 dark:bg-[#050A17] hover:bg-white dark:hover:bg-[#080E21] border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 dark:hover:border-indigo-500/50 text-slate-900 dark:text-white text-xs font-bold py-3 pl-4 pr-9 rounded-2xl outline-none focus:ring-1 focus:ring-blue-500/40 focus:border-blue-500 transition-all cursor-pointer shadow-inner min-w-[135px]"
              >
                <option value="newest" className="bg-white dark:bg-[#050A17] text-slate-900 dark:text-white">Newest First</option>
                <option value="oldest" className="bg-white dark:bg-[#050A17] text-slate-900 dark:text-white">Oldest First</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* ROW 2: Filters Below (Status Filter Chips, Per Page, Reset) */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
          {/* Status Filter Chips */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-400 font-bold uppercase tracking-wider text-xs flex items-center gap-1.5 shrink-0 mr-1">
              <Filter size={14} className="text-blue-500" /> Status:
            </span>
            {[
              {
                id: 'all',
                label: 'All',
                count: activeCategory === 'packages'
                  ? bookings.length
                  : activeCategory === 'activities'
                  ? activityBookings.length
                  : giftCardBookings.length
              },
              {
                id: 'paid',
                label: 'Paid',
                count: activeCategory === 'packages'
                  ? bookings.filter(b => b.payment_status === 'paid').length
                  : activeCategory === 'activities'
                  ? activityBookings.filter(b => b.payment_status === 'paid').length
                  : giftCardBookings.filter(isGiftCardPaid).length
              },
              {
                id: 'pending',
                label: 'Pending',
                count: activeCategory === 'packages'
                  ? bookings.filter(b => b.payment_status !== 'paid').length
                  : activeCategory === 'activities'
                  ? activityBookings.filter(b => b.payment_status !== 'paid').length
                  : giftCardBookings.filter(c => !isGiftCardPaid(c)).length
              }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setStatusFilter(tab.id);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 border ${statusFilter === tab.id
                    ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/30'
                    : 'bg-slate-50 dark:bg-[#050A17] text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
              >
                <span>{tab.label}</span>
                <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${statusFilter === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Right side: Per Page & Reset */}
          <div className="flex items-center gap-3 ml-auto">
            {/* Per Page */}
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-xs shrink-0">
                Per Page:
              </span>
              <div className="relative">
                <select
                  value={itemsPerPage >= currentCategoryCount && currentCategoryCount > 0 && itemsPerPage > 50 ? "all" : itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(e.target.value === "all" ? 9999 : Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="appearance-none bg-slate-50 dark:bg-[#050A17] hover:bg-white dark:hover:bg-[#080E21] border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 dark:hover:border-indigo-500/50 text-slate-900 dark:text-white text-xs font-bold py-2.5 pl-3.5 pr-8 rounded-2xl outline-none focus:ring-1 focus:ring-blue-500/40 focus:border-blue-500 transition-all cursor-pointer shadow-inner min-w-[90px]"
                >
                  <option value={10} className="bg-white dark:bg-[#050A17] text-slate-900 dark:text-white">10</option>
                  <option value={25} className="bg-white dark:bg-[#050A17] text-slate-900 dark:text-white">25</option>
                  <option value={50} className="bg-white dark:bg-[#050A17] text-slate-900 dark:text-white">50</option>
                  <option value="all" className="bg-white dark:bg-[#050A17] text-slate-900 dark:text-white">All</option>
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Reset Filters */}
            {(searchTerm !== "" || statusFilter !== "all" || sortOrder !== "newest" || itemsPerPage !== 10) && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer active:scale-95 shrink-0"
                title="Reset all filters"
              >
                <RotateCcw size={13} />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* LOADER & NO RESULTS */}
      {(activeCategory === "packages" ? isLoading : activeCategory === "activities" ? isLoadingActivities : isLoadingGiftCards) ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-[#091126]/95 rounded-3xl border border-slate-200/90 dark:border-indigo-500/25 shadow-xl ring-1 ring-slate-900/5 dark:ring-white/5 backdrop-blur-xl">
          <Loader2 className="animate-spin text-blue-500 mb-4" size={40} />
          <span className="text-base font-bold text-slate-800 dark:text-slate-200">Synchronizing Directory...</span>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Fetching records from database</p>
        </div>
      ) : error && activeCategory === "packages" ? (
        <div className="bg-white dark:bg-[#091126]/95 rounded-3xl border border-slate-200/90 dark:border-indigo-500/25 p-12 text-center shadow-xl ring-1 ring-slate-900/5 dark:ring-white/5 backdrop-blur-xl">
          <p className="text-rose-500 font-bold mb-4">{error}</p>
          <button onClick={fetchBookings} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold uppercase tracking-wider transition shadow-lg shadow-blue-600/30 cursor-pointer active:scale-95">
            Reload Directory
          </button>
        </div>
      ) : (activeCategory === "packages" ? filteredBookings.length : activeCategory === "activities" ? filteredActivityBookings.length : filteredGiftCardBookings.length) === 0 ? (
        <div className="bg-white dark:bg-[#091126]/95 rounded-3xl border border-slate-200/90 dark:border-indigo-500/25 border-dashed p-14 text-center shadow-xl ring-1 ring-slate-900/5 dark:ring-white/5 backdrop-blur-xl">
          <div className="w-20 h-20 bg-slate-50 dark:bg-[#050A17] rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400 border border-slate-200 dark:border-slate-800">
            <Search size={32} />
          </div>
          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">No Matching Bookings Found</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto mb-5 font-medium">
            {searchTerm ? `No results found for "${searchTerm}".` : "There are no bookings under this status category."}
          </p>
          {(searchTerm || statusFilter !== "all" || sortOrder !== "newest") && (
            <button
              onClick={handleResetFilters}
              className="px-5 py-2.5 rounded-2xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20 border border-blue-200 dark:border-blue-500/30 text-xs font-bold uppercase tracking-wider transition cursor-pointer active:scale-95"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <>
          {activeCategory === "packages" ? (
            <>
              {/* HIGH-VISIBILITY TABLE HEADER */}
              <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-4 mb-3 bg-white dark:bg-[#091126]/95 border border-slate-200/90 dark:border-indigo-500/25 rounded-2xl text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider shadow-md dark:shadow-[0_4px_20px_rgba(0,0,0,0.4)] ring-1 ring-slate-900/5 dark:ring-white/5">
                <div className="col-span-3">Customer & Invoice</div>
                <div className="col-span-2">Payment Status</div>
                <div className="col-span-3">Package & Travel Origin</div>
                <div className="col-span-2">Travel Schedule</div>
                <div className="col-span-1 text-right">Amount</div>
                <div className="col-span-1 text-center">Actions</div>
              </div>

              {/* TABLE DATA ROWS */}
              <div className="flex flex-col gap-3">
                {paginatedBookings.map((b, idx) => {
                  const invoiceId = `INV-T2H-${b._id.toString().substring(0, 8).toUpperCase()}`;
                  const custName = `${b.user_id?.firstName || ""} ${b.user_id?.lastName || ""}`.trim() || "Guest User";
                  const custEmail = b.user_id?.email || "No Email";
                  const initials = (custName.split(" ").map(n => n[0]).join("")).substring(0, 2).toUpperCase() || "GU";

                  // Extract departure city
                  let depCity = "";
                  if (b.notes) {
                    const match = b.notes.match(/DepCity:\s*([^.]*)/i);
                    if (match && match[1]?.trim()) {
                      depCity = match[1].trim();
                    }
                  }
                  const travelFrom = depCity || b.user_id?.address?.city || b.user_id?.city || "";

                  const dateInfo = getTravelDates(b.travel_date, b.itinerary_id);
                  const badge = getPaymentBadge(b.payment_status);
                  const { isPaid, isPartial, paidAmount } = getBookingFinancials(b);

                  return (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(idx * 0.03, 0.2) }}
                      key={b._id}
                      className="bg-white dark:bg-[#091126]/95 border border-slate-200/90 dark:border-slate-800/90 hover:border-blue-500/50 dark:hover:border-indigo-500/50 hover:bg-slate-50/50 dark:hover:bg-[#0d1733]/80 shadow-md dark:shadow-[0_8px_30px_rgb(0,0,0,0.35)] rounded-2xl transition-all duration-200 group ring-1 ring-slate-900/5 dark:ring-white/5"
                    >
                      <div className="px-6 py-4.5 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">

                        {/* 1. Customer & Invoice Column */}
                        <div className="col-span-3 flex items-center gap-3.5">
                          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
                            {initials}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white truncate group-hover:text-blue-500 transition-colors">
                              {custName}
                            </h3>
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate" title={custEmail}>
                              {custEmail}
                            </p>
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className="font-mono font-bold text-[11px] text-blue-600 dark:text-blue-400 tracking-wider">
                                {invoiceId}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopy(invoiceId);
                                }}
                                className="p-0.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded transition-colors shrink-0 cursor-pointer"
                                title="Copy Invoice ID"
                              >
                                {copiedId === invoiceId ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* 2. Payment Status Badge */}
                        <div className="col-span-2">
                          <span className={`inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-xl ${badge.bg} ${badge.text} border ${badge.border} shadow-xs`}>
                            <span className={`w-2 h-2 rounded-full ${badge.dot} animate-pulse`}></span>
                            {badge.label}
                          </span>
                        </div>

                        {/* 3. Package & Origin */}
                        <div className="col-span-3">
                          <p className="text-sm font-extrabold text-slate-900 dark:text-slate-100 truncate">
                            {b.itinerary_id?.title || "Custom Tour Package"}
                          </p>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            {travelFrom && (
                              <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold border border-emerald-200 dark:border-emerald-500/20 flex items-center gap-1">
                                <MapPin size={11} /> From: {travelFrom}
                              </span>
                            )}
                            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                              {b.adults} Adults, {b.kids} Kids
                            </span>
                          </div>
                        </div>

                        {/* 4. Travel Schedule */}
                        <div className="col-span-2">
                          <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-800 dark:text-slate-200">
                            <Calendar size={13} className="text-blue-500 dark:text-blue-400 shrink-0" />
                            <span>{dateInfo.start}</span>
                          </div>
                          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5 pl-5">
                            {dateInfo.duration}
                          </p>
                        </div>

                        {/* 5. Amount */}
                        <div className="col-span-1 text-right">
                          <p className="text-base font-black text-slate-900 dark:text-white">
                            ₹{(isPaid || isPartial ? paidAmount : b.total_price).toLocaleString("en-IN")}
                          </p>
                          <p className="text-[10px] font-bold mt-0.5 uppercase tracking-wider">
                            {isPaid ? (
                              <span className="text-emerald-600 dark:text-emerald-400">Paid in Full</span>
                            ) : isPartial ? (
                              <span className="text-amber-600 dark:text-amber-400">Token ₹5k Paid</span>
                            ) : (
                              <span className="text-orange-600 dark:text-orange-400">Pending</span>
                            )}
                          </p>
                        </div>

                        {/* 6. Actions */}
                        <div className="col-span-1 flex items-center justify-center gap-2">
                          <button
                            onClick={() => setViewBooking(b)}
                            className="p-2.5 rounded-xl bg-blue-50 dark:bg-[#050A17] hover:bg-blue-600 text-blue-600 dark:text-blue-400 hover:text-white border border-blue-200 dark:border-slate-700/80 hover:border-blue-600 transition-all duration-200 cursor-pointer shadow-sm active:scale-95"
                            title="View Full Booking & Customer Details"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => setDeleteBookingModal(b)}
                            className="p-2.5 rounded-xl bg-rose-50 dark:bg-[#050A17] hover:bg-rose-600 text-rose-600 dark:text-rose-400 hover:text-white border border-rose-200 dark:border-slate-700/80 hover:border-rose-600 transition-all duration-200 cursor-pointer shadow-sm active:scale-95"
                            title="Delete Booking Record"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </>
          ) : activeCategory === "activities" ? (
            <>
              {/* HIGH-VISIBILITY ACTIVITY TABLE HEADER */}
              <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-4 mb-3 bg-white dark:bg-[#091126]/95 border border-slate-200/90 dark:border-indigo-500/25 rounded-2xl text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider shadow-md dark:shadow-[0_4px_20px_rgba(0,0,0,0.4)] ring-1 ring-slate-900/5 dark:ring-white/5">
                <div className="col-span-3">Customer & Ref</div>
                <div className="col-span-2">Payment Status</div>
                <div className="col-span-3">Activity & Destination</div>
                <div className="col-span-2">Date & Slot</div>
                <div className="col-span-1 text-right">Amount</div>
                <div className="col-span-1 text-center">Actions</div>
              </div>

              <div className="flex flex-col gap-3">
                {paginatedActivityBookings.map((act) => {
                  const custName = act.lead_guest?.name || act.user_id?.firstName || "Customer";
                  const custEmail = act.lead_guest?.email || act.user_id?.email || "N/A";
                  const custPhone = act.lead_guest?.phone || act.user_id?.mobile_number || "N/A";
                  const isPaid = act.payment_status === "paid";

                  return (
                    <motion.div
                      key={act._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white dark:bg-[#091126]/95 border border-slate-200/90 dark:border-slate-800/90 hover:border-blue-500/50 dark:hover:border-indigo-500/50 hover:bg-slate-50/50 dark:hover:bg-[#0d1733]/80 rounded-2xl p-4 sm:p-5 transition-all shadow-md dark:shadow-[0_8px_30px_rgb(0,0,0,0.35)] ring-1 ring-slate-900/5 dark:ring-white/5"
                    >
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                        {/* 1. Customer & Ref */}
                        <div className="lg:col-span-3 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm text-slate-900 dark:text-white">{custName}</span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 font-mono">
                            <Mail size={12} className="text-slate-400 dark:text-slate-500" />
                            <span className="truncate">{custEmail}</span>
                          </p>
                          <p className="text-[11px] font-mono text-blue-600 dark:text-blue-400 flex items-center gap-1">
                            <Tag size={11} /> {act.booking_reference || act._id}
                          </p>
                        </div>

                        {/* 2. Payment Status */}
                        <div className="lg:col-span-2">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider border ${isPaid
                                ? "bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30"
                                : "bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30"
                              }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${isPaid ? "bg-emerald-500" : "bg-amber-500"}`} />
                            <span>{isPaid ? "PAID" : "PENDING"}</span>
                          </span>
                          {act.razorpay_payment_id && (
                            <p className="text-[10px] font-mono text-slate-400 dark:text-slate-500 mt-1 truncate">
                              {act.razorpay_payment_id}
                            </p>
                          )}
                        </div>

                        {/* 3. Activity & Destination */}
                        <div className="lg:col-span-3">
                          <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800/40">
                            {act.activity_id?.selected_destination?.destination_name || "Destination Activity"}
                          </span>
                          <h4 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 mt-1 line-clamp-1">
                            {act.activity_id?.title || "Activity Experience"}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                            <Phone size={11} className="text-slate-400 dark:text-slate-500" /> {custPhone}
                          </p>
                        </div>

                        {/* 4. Date & Tickets */}
                        <div className="lg:col-span-2 space-y-1">
                          <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                            <Calendar size={13} className="text-blue-500 dark:text-blue-400" />
                            <span>
                              {new Date(act.activity_date).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <Users size={12} className="text-slate-400 dark:text-slate-500" />
                            <span>
                              {act.tickets} {act.tickets > 1 ? "Tickets" : "Ticket"}
                            </span>
                          </p>
                        </div>

                        {/* 5. Amount */}
                        <div className="lg:col-span-1 lg:text-right">
                          <span className="text-base font-black text-slate-900 dark:text-white">
                            ₹{Number(act.total_amount || 0).toLocaleString("en-IN")}
                          </span>
                          <p className="text-[10px] text-slate-500 font-medium">
                            (₹{Number(act.ticket_price || 0).toLocaleString()} ea)
                          </p>
                        </div>

                        {/* 6. Actions */}
                        <div className="lg:col-span-1 flex items-center justify-center gap-2">
                          <button
                            onClick={() => setViewActivityBooking(act)}
                            className="p-2.5 rounded-xl bg-blue-50 dark:bg-[#050A17] hover:bg-blue-600 text-blue-600 dark:text-blue-400 hover:text-white border border-blue-200 dark:border-slate-700/80 hover:border-blue-600 transition-all cursor-pointer shadow-sm active:scale-95"
                            title="View Activity Details"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteActivityBooking(act._id)}
                            className="p-2.5 rounded-xl bg-rose-50 dark:bg-[#050A17] hover:bg-rose-600 text-rose-600 dark:text-rose-400 hover:text-white border border-rose-200 dark:border-slate-700/80 hover:border-rose-600 transition-all cursor-pointer shadow-sm active:scale-95"
                            title="Delete Activity Booking"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </>
          ) : (
            <>
              {/* HIGH-VISIBILITY GIFT CARDS TABLE HEADER */}
              <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-4 mb-3 bg-white dark:bg-[#091126]/95 border border-slate-200/90 dark:border-indigo-500/25 rounded-2xl text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider shadow-md dark:shadow-[0_4px_20px_rgba(0,0,0,0.4)] ring-1 ring-slate-900/5 dark:ring-white/5">
                <div className="col-span-3">Purchaser & Card Code</div>
                <div className="col-span-2">Payment Status</div>
                <div className="col-span-3">Recipient & Card Type</div>
                <div className="col-span-2">Purchase & Expiry</div>
                <div className="col-span-1 text-right">Amount</div>
                <div className="col-span-1 text-center">Actions</div>
              </div>

              <div className="flex flex-col gap-3">
                {paginatedGiftCardBookings.map((card, idx) => {
                  const buyerName = card.sender_user_id
                    ? `${card.sender_user_id.firstName || ""} ${card.sender_user_id.lastName || ""}`.trim() || "Guest Purchaser"
                    : "Guest Purchaser";
                  const buyerEmail = card.sender_user_id?.email || "N/A";
                  const buyerInitials = (buyerName.split(" ").map(n => n[0]).join("")).substring(0, 2).toUpperCase() || "GC";

                  const paid = isGiftCardPaid(card);
                  const paymentBadge = getGiftCardPaymentBadge(card);
                  const lifecycleBadge = getGiftCardLifecycleBadge(card.status);
                  const payableAmount = card.payable_amount ?? card.amount ?? 0;
                  const isGift = card.type === "gift";

                  return (
                    <motion.div
                      key={card._id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(idx * 0.03, 0.2) }}
                      className="bg-white dark:bg-[#091126]/95 border border-slate-200/90 dark:border-slate-800/90 hover:border-blue-500/50 dark:hover:border-indigo-500/50 hover:bg-slate-50/50 dark:hover:bg-[#0d1733]/80 shadow-md dark:shadow-[0_8px_30px_rgb(0,0,0,0.35)] rounded-2xl transition-all duration-200 group ring-1 ring-slate-900/5 dark:ring-white/5"
                    >
                      <div className="px-6 py-4.5 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                        {/* 1. Purchaser & Card Code */}
                        <div className="col-span-3 flex items-center gap-3.5">
                          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
                            {buyerInitials}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white truncate group-hover:text-blue-500 transition-colors">
                              {buyerName}
                            </h3>
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate" title={buyerEmail}>
                              {buyerEmail}
                            </p>
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className="font-mono font-bold text-xs text-blue-600 dark:text-blue-400 tracking-wider">
                                {card.public_code}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopy(card.public_code);
                                }}
                                className="p-0.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded transition-colors shrink-0 cursor-pointer"
                                title="Copy Gift Card Code"
                              >
                                {copiedId === card.public_code ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* 2. Payment Status */}
                        <div className="col-span-2">
                          <div className="flex flex-col gap-1 items-start">
                            <span className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-xl ${paymentBadge.bg} ${paymentBadge.text} border ${paymentBadge.border} shadow-xs`}>
                              <span className={`w-2 h-2 rounded-full ${paymentBadge.dot} animate-pulse`}></span>
                              {paymentBadge.label}
                            </span>
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${lifecycleBadge.bg}`}>
                              {lifecycleBadge.label}
                            </span>
                            {card.razorpay_payment_id && (
                              <p className="text-[10px] font-mono text-slate-400 dark:text-slate-500 mt-1 truncate max-w-[140px]" title={card.razorpay_payment_id}>
                                TXN: {card.razorpay_payment_id}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* 3. Recipient & Card Type */}
                        <div className="col-span-3">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${isGift ? "bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/60" : "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/60"}`}>
                              {isGift ? "Gift Voucher" : "Self Purchase"}
                            </span>
                          </div>
                          {isGift ? (
                            <div className="space-y-0.5">
                              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                                To: {card.recipient_name || card.recipient_email || "Recipient"}
                              </p>
                              {card.recipient_email && (
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate flex items-center gap-1">
                                  <Mail size={11} className="text-slate-400 dark:text-slate-500 shrink-0" />
                                  {card.recipient_email}
                                </p>
                              )}
                              {card.accepted_by_user_id && (
                                <span className="inline-block text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                                  Claimed by {card.accepted_by_user_id.firstName || "user"}
                                </span>
                              )}
                            </div>
                          ) : (
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                              Direct voucher credited to buyer account
                            </p>
                          )}
                        </div>

                        {/* 4. Purchase & Expiry */}
                        <div className="col-span-2 space-y-1">
                          <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-800 dark:text-slate-200">
                            <Calendar size={13} className="text-blue-500 dark:text-blue-400 shrink-0" />
                            <span>
                              {new Date(card.created_at || card.createdAt).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric"
                              })}
                            </span>
                          </div>
                          {card.expiry_date && (
                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1 pl-4">
                              <Clock size={11} className="text-slate-400 dark:text-slate-500 shrink-0" />
                              <span>Exp: {new Date(card.expiry_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                            </p>
                          )}
                        </div>

                        {/* 5. Amount */}
                        <div className="col-span-1 text-right">
                          <p className="text-base font-black text-slate-900 dark:text-white">
                            ₹{Number(payableAmount).toLocaleString("en-IN")}
                          </p>
                          {card.discount_amount > 0 ? (
                            <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                              Save ₹{Number(card.discount_amount).toLocaleString("en-IN")}
                            </p>
                          ) : (
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                              Face: ₹{Number(card.amount || 0).toLocaleString("en-IN")}
                            </p>
                          )}
                        </div>

                        {/* 6. Actions */}
                        <div className="col-span-1 flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => setViewGiftCardBooking(card)}
                            className="p-2.5 rounded-xl bg-blue-50 dark:bg-[#050A17] hover:bg-blue-600 text-blue-600 dark:text-blue-400 hover:text-white border border-blue-200 dark:border-slate-700/80 hover:border-blue-600 transition-all duration-200 cursor-pointer shadow-sm active:scale-95"
                            title="View Gift Card Payment & Full Details"
                          >
                            <Eye size={16} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </>
          )}
        </>
      )}

      {/* PAGINATION INTERACTION */}
      {totalPages > 1 && !(activeCategory === "packages" ? isLoading : activeCategory === "activities" ? isLoadingActivities : isLoadingGiftCards) && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 bg-white dark:bg-[#091126]/95 p-4 sm:p-5 rounded-3xl border border-slate-200/90 dark:border-indigo-500/25 shadow-xl dark:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.7),0_0_30px_2px_rgba(99,102,241,0.18)] ring-1 ring-slate-900/5 dark:ring-white/5 backdrop-blur-xl">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
            Showing Page {currentPage} of {totalPages} ({currentCategoryCount} total records)
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setCurrentPage(prev => Math.max(prev - 1, 1));
              }}
              disabled={currentPage === 1}
              className="p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 text-slate-700 dark:text-slate-300 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-700 cursor-pointer transition active:scale-95"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-3.5 py-1.5 bg-slate-100 dark:bg-[#050A17] text-slate-800 dark:text-white font-bold text-xs rounded-xl border border-slate-200 dark:border-slate-800">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => {
                setCurrentPage(prev => Math.min(prev + 1, totalPages));
              }}
              disabled={currentPage === totalPages}
              className="p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 text-slate-700 dark:text-slate-300 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-700 cursor-pointer transition active:scale-95"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* COMPREHENSIVE DARK MODE DETAIL VIEW MODAL */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {viewBooking && (() => {
          const b = viewBooking;
          const invoiceId = `INV-T2H-${b._id.toString().substring(0, 8).toUpperCase()}`;
          const custName = `${b.user_id?.firstName || ""} ${b.user_id?.lastName || ""}`.trim() || "Guest User";
          const custEmail = b.user_id?.email || "N/A";
          const custPhone = b.user_id?.mobile_number || b.user_id?.phone || b.customer_phone || "Not Provided";

          // Extract Departure City (Travel Origin)
          let departureCity = "";
          if (b.notes) {
            const depMatch = b.notes.match(/DepCity:\s*([^.]*)/i);
            if (depMatch && depMatch[1]?.trim()) {
              departureCity = depMatch[1].trim();
            }
          }
          const userCity = b.user_id?.address?.city || b.user_id?.city || "";
          const travelFromCity = departureCity || userCity || "Not Specified";

          // Full user address if available
          let fullAddress = "Not Provided";
          if (b.user_id?.address) {
            if (typeof b.user_id.address === "string") {
              fullAddress = b.user_id.address;
            } else {
              const parts = [
                b.user_id.address.street,
                b.user_id.address.city,
                b.user_id.address.state,
                b.user_id.address.pincode,
                b.user_id.address.country
              ].filter(Boolean);
              if (parts.length > 0) fullAddress = parts.join(", ");
            }
          } else if (userCity) {
            fullAddress = userCity;
          }

          const dateInfo = getTravelDates(b.travel_date, b.itinerary_id);
          const badge = getPaymentBadge(b.payment_status);
          const {
            isPaid,
            isPartial,
            paidAmount,
            dueAmount,
            voucher,
            wallet,
            baseVal,
            gstVal
          } = getBookingFinancials(b);

          const bookedOn = new Date(b.createdAt).toLocaleDateString("en-IN", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
          });

          const authMode = b.user_id?.auth_provider === "google"
            ? "Google Account"
            : (b.user_id?.auth_provider ? b.user_id.auth_provider.toUpperCase() : "Email & Password");

          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-[999] flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md overflow-y-auto"
            >
              {/* Backdrop */}
              <div
                className="fixed inset-0"
                onClick={() => setViewBooking(null)}
              />

              {/* Modal Container */}
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 12 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden text-slate-900 dark:text-slate-100 my-auto max-h-[92vh] flex flex-col"
              >
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between bg-slate-50 dark:bg-slate-900 shrink-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h2 className="font-mono font-bold text-lg text-slate-900 dark:text-white tracking-wider flex items-center gap-2">
                      {invoiceId}
                      <button
                        onClick={() => handleCopy(invoiceId)}
                        className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded transition-colors cursor-pointer"
                        title="Copy Invoice ID"
                      >
                        {copiedId === invoiceId ? <Check size={14} className="text-emerald-500 dark:text-emerald-400" /> : <Copy size={14} />}
                      </button>
                    </h2>
                    <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ${badge.bg} ${badge.text} border ${badge.border}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
                      {badge.label}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
                      {b.status || "confirmed"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden sm:inline">
                      Booked: {bookedOn}
                    </span>
                    <button
                      onClick={() => setViewBooking(null)}
                      className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-200 dark:border-rose-800 transition-colors cursor-pointer"
                      title="Close"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>

                {/* Content Grid with Smooth Scrolling */}
                <div className="p-6 overflow-y-auto space-y-5 text-sm custom-scrollbar">

                  {/* TOP ROW: Traveller Identity & Origin vs Razorpay Gateway */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                    {/* 1. Traveller Details */}
                    <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700/80 flex flex-col justify-between">
                      <div>
                        <div className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-3 flex items-center justify-between">
                          <span className="flex items-center gap-1.5"><User size={13} /> Customer Profile</span>
                          <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400">{authMode}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold">Full Name</span>
                            <span className="font-semibold text-slate-900 dark:text-slate-100 truncate block text-sm">{custName}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold">Email Address</span>
                            <div className="flex items-center gap-1">
                              <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block" title={custEmail}>{custEmail}</span>
                              {custEmail !== "N/A" && (
                                <button onClick={() => handleCopy(custEmail)} className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-0.5 cursor-pointer">
                                  <Copy size={11} />
                                </button>
                              )}
                            </div>
                          </div>
                          <div>
                            <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold">Phone Number</span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">{custPhone}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold">Travel Origin / From</span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400 truncate block">{travelFromCity}</span>
                          </div>
                        </div>
                      </div>

                      {fullAddress !== "Not Provided" && fullAddress !== travelFromCity && (
                        <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-800/80 text-xs">
                          <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold">Billing Address</span>
                          <span className="text-slate-700 dark:text-slate-300 block truncate">{fullAddress}</span>
                        </div>
                      )}
                    </div>

                    {/* 2. Razorpay & Gateway Transaction Details */}
                    <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700/80 flex flex-col justify-between">
                      <div>
                        <div className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-3 flex items-center justify-between">
                          <span className="flex items-center gap-1.5"><ShieldCheck size={14} /> Razorpay Gateway Verification</span>
                          <span className="text-[9px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-500/20">
                            {b.payment_status === "paid" || b.payment_status === "partial_paid" ? "Authorized & Captured" : "Pending Authorization"}
                          </span>
                        </div>

                        <div className="space-y-2.5 text-xs">
                          <div>
                            <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold">Payment Method & Plan</span>
                            <span className="font-bold text-slate-900 dark:text-white text-xs block">
                              {b.payment_type === "token" ? "Token Advance (₹5,000 upfront)" : "Full Payment (100% Online via Razorpay)"}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700/80 font-mono text-[11px]">
                            <div>
                              <span className="text-[9px] text-slate-500 dark:text-slate-400 uppercase font-sans font-bold block">Razorpay Payment ID</span>
                              <div className="flex items-center gap-1 mt-0.5">
                                <span className="text-indigo-600 dark:text-indigo-300 truncate font-semibold">
                                  {b.razorpay_payment_id || "N/A (Pending)"}
                                </span>
                                {b.razorpay_payment_id && (
                                  <button onClick={() => handleCopy(b.razorpay_payment_id)} className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-0.5 cursor-pointer">
                                    <Copy size={11} />
                                  </button>
                                )}
                              </div>
                            </div>

                            <div>
                              <span className="text-[9px] text-slate-500 dark:text-slate-400 uppercase font-sans font-bold block">Razorpay Order ID</span>
                              <div className="flex items-center gap-1 mt-0.5">
                                <span className="text-slate-700 dark:text-slate-300 truncate font-semibold">
                                  {b.razorpay_order_id || "N/A"}
                                </span>
                                {b.razorpay_order_id && (
                                  <button onClick={() => handleCopy(b.razorpay_order_id)} className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-0.5 cursor-pointer">
                                    <Copy size={11} />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* MIDDLE ROW: Itinerary & Travel Schedule vs Preferences & Requests */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                    {/* 3. Itinerary & Schedule */}
                    <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-3">
                      <div className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center justify-between">
                        <span className="flex items-center gap-1.5"><Calendar size={13} /> Itinerary & Travel Schedule</span>
                        <span className="text-[10px] font-bold text-slate-700 dark:text-slate-400 bg-slate-200/80 dark:bg-slate-700/80 px-2 py-0.5 rounded">
                          {b.adults} Adults, {b.kids} Kids
                        </span>
                      </div>

                      <p className="font-bold text-slate-900 dark:text-white text-sm">
                        {b.itinerary_id?.title || "Custom Honeymoon Package"}
                      </p>

                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-700/80">
                          <span className="text-[9px] text-slate-500 dark:text-slate-400 uppercase font-bold block">Start Date</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200 text-[11px] truncate block">{dateInfo.start}</span>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-700/80">
                          <span className="text-[9px] text-slate-500 dark:text-slate-400 uppercase font-bold block">Duration</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200 text-[11px] truncate block">{dateInfo.duration}</span>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-700/80">
                          <span className="text-[9px] text-slate-500 dark:text-slate-400 uppercase font-bold block">Travel Origin</span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400 text-[11px] truncate block">{travelFromCity}</span>
                        </div>
                      </div>
                    </div>

                    {/* 4. Preferences, Add-ons & Requests */}
                    <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-3">
                      <div className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                        <Tag size={13} /> Selected Add-ons & Custom Preferences
                      </div>
                      {renderBookingNotes(b.notes)}
                    </div>

                  </div>

                  {/* BOTTOM ROW: Corporate GST (if claimed) & Financial Ledger */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                    {/* 5. Corporate GST Information (if claimed) */}
                    {b.claim_gst ? (
                      <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-xl border border-indigo-200 dark:border-indigo-900/40 space-y-2.5">
                        <div className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                          <Building size={13} /> Corporate GST Tax Claim
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold">Company Name</span>
                            <span className="font-bold text-slate-900 dark:text-slate-200 block">{b.company_name || "N/A"}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold">GSTIN Number</span>
                            <span className="font-mono font-bold text-indigo-600 dark:text-indigo-300 block">{b.gst_number || "N/A"}</span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold">Registered Address</span>
                            <span className="text-slate-700 dark:text-slate-300 block">{b.company_address || "N/A"}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700/80 flex flex-col justify-center text-xs text-slate-500 dark:text-slate-400">
                        <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1.5">
                          <Receipt size={13} /> Invoice & GST Claim
                        </div>
                        <p>Individual booking (No Corporate GST claimed).</p>
                        <p className="text-slate-500 text-[11px] mt-1">Official Tax Invoice generated for customer tax compliance.</p>
                      </div>
                    )}

                    {/* 6. Complete Financial Ledger */}
                    <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-2.5">
                      <div className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center justify-between">
                        <span className="flex items-center gap-1.5"><CreditCard size={13} /> Financial Ledger & Pricing Breakdown</span>
                      </div>

                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between text-slate-600 dark:text-slate-400">
                          <span>Base Package (Excl. GST):</span>
                          <span className="font-mono font-medium text-slate-800 dark:text-slate-200">₹{Math.round(baseVal).toLocaleString("en-IN")}</span>
                        </div>
                        <div className="flex justify-between text-slate-600 dark:text-slate-400">
                          <span>GST Tax Amount (18%):</span>
                          <span className="font-mono font-medium text-slate-800 dark:text-slate-200">₹{Math.round(gstVal).toLocaleString("en-IN")}</span>
                        </div>

                        {voucher > 0 && (
                          <div className="flex justify-between text-rose-600 dark:text-rose-400 font-medium">
                            <span>Gift Card Voucher ({b.used_gift_card_code || "VOUCHER"}):</span>
                            <span className="font-mono">- ₹{voucher.toLocaleString("en-IN")}</span>
                          </div>
                        )}

                        {wallet > 0 && (
                          <div className="flex justify-between text-rose-600 dark:text-rose-400 font-medium">
                            <span>User Wallet / Referral Discount:</span>
                            <span className="font-mono">- ₹{wallet.toLocaleString("en-IN")}</span>
                          </div>
                        )}

                        <div className="border-t border-slate-200 dark:border-slate-800 pt-2 flex justify-between text-sm font-bold text-slate-900 dark:text-white">
                          <span>Total Net Package Price:</span>
                          <span>₹{b.total_price.toLocaleString("en-IN")}</span>
                        </div>

                        <div className="flex justify-between text-xs font-semibold pt-1">
                          <span className="text-slate-600 dark:text-slate-400">Total Amount Paid (via Razorpay):</span>
                          <span className={`font-mono font-bold text-sm ${paidAmount > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'}`}>
                            ₹{paidAmount.toLocaleString("en-IN")}
                          </span>
                        </div>

                        {dueAmount > 0 && (
                          <div className="flex justify-between text-xs font-bold text-amber-600 dark:text-amber-400 pt-1 border-t border-slate-200 dark:border-slate-800/80">
                            <span>{isPartial ? 'Remaining Balance Due from Guest:' : 'Pending Payment:'}</span>
                            <span className="font-mono text-sm">₹{dueAmount.toLocaleString("en-IN")}</span>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>

                </div>

                {/* Footer Action Bar */}
                <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900 flex items-center justify-between gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => setViewBooking(null)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-200/80 dark:bg-slate-800/80 hover:bg-slate-300 dark:hover:bg-slate-700 transition cursor-pointer"
                  >
                    Close
                  </button>

                  <div className="flex items-center gap-2.5">
                    {isPaid || isPartial ? (
                      <button
                        onClick={() => handleDownloadInvoice(b._id)}
                        disabled={downloadingId === b._id}
                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-indigo-600/20 cursor-pointer flex items-center justify-center gap-2"
                      >
                        {downloadingId === b._id ? (
                          <>
                            <Loader2 className="animate-spin" size={14} />
                            Generating Receipt...
                          </>
                        ) : (
                          <>
                            <Download size={14} />
                            Download Official Tax Invoice
                          </>
                        )}
                      </button>
                    ) : (
                      <div className="px-4 py-2 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 font-semibold text-xs rounded-xl flex items-center gap-1.5">
                        <AlertTriangle size={13} className="shrink-0" />
                        <span>Payment {b.payment_status === 'failed' ? 'Failed' : 'Pending'}</span>
                      </div>
                    )}

                    <button
                      onClick={() => setDeleteBookingModal(b)}
                      className="px-4 py-2.5 bg-rose-50 dark:bg-rose-600/15 hover:bg-rose-600 text-rose-600 dark:text-rose-400 hover:text-white border border-rose-200 dark:border-rose-500/30 hover:border-rose-600 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      title="Delete this booking"
                    >
                      <Trash2 size={14} />
                      <span>Delete Booking</span>
                    </button>
                  </div>
                </div>

              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* DELETE CONFIRMATION MODAL */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {deleteBookingModal && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl relative text-slate-800 dark:text-slate-200"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-500 flex items-center justify-center shrink-0">
                  <Trash2 size={22} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">Delete Booking Record?</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                    INV-T2H-{deleteBookingModal._id.substring(0, 8).toUpperCase()}
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed mb-6 bg-slate-50 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200 dark:border-slate-700/80">
                Are you sure you want to permanently delete this booking for{" "}
                <strong className="text-slate-900 dark:text-white">
                  {deleteBookingModal.user_id?.firstName || "Guest"} ({deleteBookingModal.itinerary_id?.title || "Package"})
                </strong>
                ? This action cannot be undone.
              </p>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteBookingModal(null)}
                  disabled={isDeleting}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteBooking}
                  disabled={isDeleting}
                  className="px-5 py-2.5 rounded-xl text-xs font-black text-white bg-rose-600 hover:bg-rose-700 transition shadow-lg shadow-rose-600/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={14} />
                      Yes, Delete Booking
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
        {/* ACTIVITY DETAIL MODAL (ADMIN) */}
        {viewActivityBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full text-slate-800 dark:text-slate-100 shadow-2xl relative my-8 space-y-6"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold border border-indigo-200 dark:border-transparent">
                    <Ticket size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">Activity Pass Details</h3>
                    <p className="text-xs font-mono text-indigo-600 dark:text-indigo-400">{viewActivityBooking.booking_reference}</p>
                  </div>
                </div>
                <button
                  onClick={() => setViewActivityBooking(null)}
                  className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Activity & Guest Specs */}
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Activity Info</p>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white">{viewActivityBooking.activity_id?.title}</h4>
                  <p className="text-slate-600 dark:text-slate-400">
                    Destination: <span className="text-slate-900 dark:text-slate-200 font-bold">{viewActivityBooking.activity_id?.selected_destination?.destination_name || "N/A"}</span>
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 space-y-1.5">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Lead Guest</p>
                    <p className="font-extrabold text-slate-900 dark:text-white">{viewActivityBooking.lead_guest?.name || "N/A"}</p>
                    <p className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
                      <Mail size={12} /> {viewActivityBooking.lead_guest?.email || "N/A"}
                    </p>
                    <p className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
                      <Phone size={12} /> {viewActivityBooking.lead_guest?.phone || "N/A"}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 space-y-1.5">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Schedule & Tickets</p>
                    <p className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1">
                      <Calendar size={13} className="text-indigo-600 dark:text-indigo-400" />
                      {new Date(viewActivityBooking.activity_date).toLocaleDateString("en-IN", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                    <p className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
                      <Clock size={12} /> {viewActivityBooking.time_slot || "Standard Timings"}
                    </p>
                    <p className="text-indigo-600 dark:text-indigo-400 font-black">
                      {viewActivityBooking.tickets} Tickets × ₹{Number(viewActivityBooking.ticket_price || 0).toLocaleString()}
                    </p>
                  </div>
                </div>

                {viewActivityBooking.lead_guest?.special_requests && (
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Special Requests</p>
                    <p className="text-slate-800 dark:text-slate-300 font-medium">{viewActivityBooking.lead_guest.special_requests}</p>
                  </div>
                )}

                <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/40 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block">Total Amount</span>
                    <span className="text-xl font-black text-slate-900 dark:text-white">₹{Number(viewActivityBooking.total_amount || 0).toLocaleString("en-IN")}</span>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase ${viewActivityBooking.payment_status === "paid"
                        ? "bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/40"
                        : "bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/40"
                      }`}>
                      {viewActivityBooking.payment_status?.toUpperCase() || "PENDING"}
                    </span>
                    {viewActivityBooking.razorpay_payment_id && (
                      <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400 mt-1">
                        TXN: {viewActivityBooking.razorpay_payment_id}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setViewActivityBooking(null)}
                  className="px-6 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold text-xs uppercase tracking-wider cursor-pointer transition"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
        {/* GIFT CARD DETAIL VIEW MODAL (ADMIN) */}
        {viewGiftCardBooking && (() => {
          const card = viewGiftCardBooking;
          const buyerName = card.sender_user_id
            ? `${card.sender_user_id.firstName || ""} ${card.sender_user_id.lastName || ""}`.trim() || "Guest Purchaser"
            : "Guest Purchaser";
          const buyerEmail = card.sender_user_id?.email || "N/A";
          const paid = isGiftCardPaid(card);
          const paymentBadge = getGiftCardPaymentBadge(card);
          const lifecycleBadge = getGiftCardLifecycleBadge(card.status);
          const payableAmount = card.payable_amount ?? card.amount ?? 0;
          const isGift = card.type === "gift";

          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full text-slate-800 dark:text-slate-100 shadow-2xl relative my-8 space-y-6"
              >
                <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-indigo-600 text-white flex items-center justify-center font-bold shadow-lg shadow-indigo-600/20">
                      <Gift size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white">Gift Card Purchase Details</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-mono font-black text-xs text-indigo-600 dark:text-indigo-400 tracking-wider">
                          {card.public_code}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(card.public_code)}
                          className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-white rounded cursor-pointer"
                          title="Copy Gift Card Code"
                        >
                          {copiedId === card.public_code ? <Check size={13} className="text-emerald-500 dark:text-emerald-400" /> : <Copy size={13} />}
                        </button>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setViewGiftCardBooking(null)}
                    className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Financial & Status Highlight Banner */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block">Amount Paid</span>
                    <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">₹{Number(payableAmount).toLocaleString("en-IN")}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block">Face Value</span>
                    <span className="text-lg font-black text-slate-900 dark:text-white">₹{Number(card.amount || 0).toLocaleString("en-IN")}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block">Discount</span>
                    <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">
                      {card.discount_amount > 0 ? `₹${card.discount_amount}` : "₹0"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block">Remaining</span>
                    <span className="text-lg font-black text-amber-600 dark:text-amber-400">₹{Number(card.remaining_balance ?? card.amount ?? 0).toLocaleString("en-IN")}</span>
                  </div>
                </div>

                <div className="space-y-4 text-xs">
                  {/* Purchaser & Recipient Section */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 space-y-1.5">
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Purchaser (Sender)</p>
                      <p className="font-extrabold text-slate-900 dark:text-white text-sm">{buyerName}</p>
                      <p className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                        <Mail size={12} className="text-indigo-600 dark:text-indigo-400" /> {buyerEmail}
                      </p>
                      <p className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                        <Calendar size={12} className="text-indigo-600 dark:text-indigo-400" />
                        <span>
                          {new Date(card.created_at || card.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </span>
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 space-y-1.5">
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        {isGift ? "Recipient Information" : "Voucher Type"}
                      </p>
                      {isGift ? (
                        <>
                          <p className="font-extrabold text-slate-900 dark:text-white text-sm">{card.recipient_name || "Recipient"}</p>
                          <p className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                            <Mail size={12} className="text-indigo-600 dark:text-indigo-400" /> {card.recipient_email || "N/A"}
                          </p>
                          {card.accepted_by_user_id ? (
                            <p className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                              <CheckCircle2 size={12} /> Claimed by {card.accepted_by_user_id.firstName || card.accepted_by_user_id.email}
                            </p>
                          ) : (
                            <p className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                              <Clock size={12} /> Not claimed yet
                            </p>
                          )}
                        </>
                      ) : (
                        <>
                          <p className="font-extrabold text-slate-900 dark:text-white text-sm">Self Purchase</p>
                          <p className="text-slate-600 dark:text-slate-400">
                            Voucher auto-credited to purchaser wallet for personal bookings.
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Personal Message (if any) */}
                  {card.message && (
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80">
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Personal Greeting Message</p>
                      <p className="text-slate-700 dark:text-slate-300 font-medium italic">"{card.message}"</p>
                    </div>
                  )}

                  {/* Payment Gateway Ledger */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Payment Gateway Ledger</p>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${paymentBadge.bg} ${paymentBadge.text} ${paymentBadge.border}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${paymentBadge.dot}`} />
                          <span>{paymentBadge.label}</span>
                        </span>
                        <span className={`px-2.5 py-0.5 rounded text-xs font-bold border ${lifecycleBadge.bg}`}>
                          {lifecycleBadge.label}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-200 dark:border-slate-800/80">
                      <div>
                        <span className="text-slate-500 dark:text-slate-500 text-[10px] block">Razorpay Order ID</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-slate-800 dark:text-slate-200 truncate">
                            {card.razorpay_order_id || "N/A"}
                          </span>
                          {card.razorpay_order_id && (
                            <button
                              type="button"
                              onClick={() => handleCopy(card.razorpay_order_id)}
                              className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-white cursor-pointer"
                              title="Copy Order ID"
                            >
                              <Copy size={11} />
                            </button>
                          )}
                        </div>
                      </div>

                      <div>
                        <span className="text-slate-500 dark:text-slate-500 text-[10px] block">Razorpay Payment ID</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 truncate">
                            {card.razorpay_payment_id || "Pending Payment"}
                          </span>
                          {card.razorpay_payment_id && (
                            <button
                              type="button"
                              onClick={() => handleCopy(card.razorpay_payment_id)}
                              className="p-1 text-slate-400 hover:text-emerald-600 dark:hover:text-white cursor-pointer"
                              title="Copy Payment ID"
                            >
                              <Copy size={11} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {card.expiry_date && (
                      <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
                        <span>Card Expiration Date:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {new Date(card.expiry_date).toLocaleDateString("en-IN", {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                            year: "numeric"
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setViewGiftCardBooking(null)}
                    className="px-6 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold text-xs uppercase tracking-wider cursor-pointer transition"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

    </div>
  );
};

export default BookedPackages;
