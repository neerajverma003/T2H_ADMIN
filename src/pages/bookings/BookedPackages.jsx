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
    Sparkles,
    Search,
    MapPin,
    Download,
    DollarSign,
    CheckCircle2,
    Clock,
    AlertTriangle,
    ChevronDown,
    ChevronUp,
    Copy,
    FileText
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";

const ITEMS_PER_PAGE = 10;

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

const BookedPackages = () => {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [downloadingId, setDownloadingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

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

  useEffect(() => {
    fetchBookings();
  }, []);

  // Filter Bookings by search term
  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      const custName = `${b.user_id?.firstName || ""} ${b.user_id?.lastName || ""}`.toLowerCase();
      const custEmail = (b.user_id?.email || "").toLowerCase();
      const itineraryTitle = (b.itinerary_id?.title || "").toLowerCase();
      const invoiceNum = `INV-T2H-${b._id?.substring(0, 8).toUpperCase()}`.toLowerCase();
      const search = searchTerm.toLowerCase();

      return (
        custName.includes(search) ||
        custEmail.includes(search) ||
        itineraryTitle.includes(search) ||
        invoiceNum.includes(search)
      );
    });
  }, [bookings, searchTerm]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredBookings.length / ITEMS_PER_PAGE);
  const paginatedBookings = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredBookings.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredBookings, currentPage]);

  // Calculations for Stat Cards
  const stats = useMemo(() => {
    let totalPaid = 0;
    let totalPending = 0;
    let legacyNotesCount = 0;

    bookings.forEach(b => {
      const isToken = b.payment_type === "token";
      const paid = isToken ? 5000 : b.total_price;
      const due = isToken ? Math.max(0, b.total_price - 5000) : 0;
      
      totalPaid += paid;
      totalPending += due;

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

  // Helper to render booking notes / legacy fallbacks inside details
  const renderBookingNotes = (notesText) => {
    if (!notesText) return (
      <p className="text-sm font-semibold text-slate-450 italic">No custom requirements specified.</p>
    );

    const isStandardFormat = /Addons:|Requests:|DepCity:/i.test(notesText);

    if (isStandardFormat) {
      const addonsMatch = notesText.match(/Addons:\s*([^.]*)/i);
      const requestsMatch = notesText.match(/Requests:\s*([^.]*)/i);
      const depCityMatch = notesText.match(/DepCity:\s*(.*)/i);

      const addonsList = addonsMatch && addonsMatch[1] 
        ? addonsMatch[1].split(",").map(s => s.trim()).filter(Boolean) 
        : [];
      const requestsList = requestsMatch && requestsMatch[1] 
        ? requestsMatch[1].split(",").map(s => s.trim()).filter(Boolean) 
        : [];
      const depCity = depCityMatch && depCityMatch[1] 
        ? depCityMatch[1].trim() 
        : "";

      const ADDONS_LABELS = {
        'candle_dinner': 'Candle Light Dinner',
        'beach_dinner': 'Private Beach Dinner',
        'couple_spa': 'Couple Spa Therapy',
        'flower_bed': 'Flower Bed Decor',
        'photoshoot': 'Pro Couple Photoshoot'
      };

      return (
        <div className="space-y-5">
          {depCity && (
            <div>
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1.5">Departure City</span>
              <span className="inline-block px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800/80 text-slate-855 dark:text-slate-200 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700">
                {depCity}
              </span>
            </div>
          )}
          {addonsList.length > 0 && (
            <div>
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-2">Selected Add-ons</span>
              <div className="flex flex-wrap gap-2">
                {addonsList.map(addon => (
                  <span key={addon} className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider rounded-lg border border-indigo-100 dark:border-indigo-900/50">
                    {ADDONS_LABELS[addon] || addon}
                  </span>
                ))}
              </div>
            </div>
          )}
          {requestsList.length > 0 && (
            <div>
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-2">Special Requests</span>
              <div className="flex flex-wrap gap-2">
                {requestsList.map(req => (
                  <span key={req} className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider rounded-lg border border-emerald-100 dark:border-emerald-900/50">
                    {req}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    } else {
      // Option A: Legacy raw note alert container
      return (
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-2xl p-5 text-amber-900 dark:text-amber-300">
          <div className="flex items-center gap-1.5 mb-2 font-black text-xs uppercase tracking-widest text-amber-700 dark:text-amber-400">
            <AlertTriangle size={16} />
            <span>⚠️ Legacy / Custom Booking Comment</span>
          </div>
          <p className="text-sm font-semibold leading-relaxed whitespace-pre-wrap">{notesText}</p>
        </div>
      );
    }
  };

  return (
    <div className="p-4 md:p-8 w-full min-h-screen">
      
      {/* HEADER SECTION */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-150 dark:border-slate-800 p-8 mb-8 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2 flex items-center gap-3 font-['Playfair_Display']">
            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
              <Sparkles size={24} />
            </div>
            Booked Packages Directory
          </h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-2xl mb-8">
            Manage honeymoon package bookings, parse customized preferences, and trigger real-time invoice generation.
          </p>

          <div className="relative max-w-3xl">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <Search className="text-indigo-400" size={20} />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
                setExpandedId(null);
              }}
              placeholder="Search by customer name, invoice code, package itinerary..."
              className="w-full pl-14 pr-6 py-4.5 bg-slate-50/50 dark:bg-slate-950/40 border-2 border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-0 focus:border-indigo-600 focus:bg-white text-base outline-none transition-all font-semibold text-slate-800 dark:text-slate-200 placeholder-slate-400"
            />
          </div>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-150 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Total Booked Packages</span>
            <CheckCircle2 size={16} className="text-indigo-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">{stats.totalBookingsCount}</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-150 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Total Collection Paid</span>
            <DollarSign size={16} className="text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-emerald-600">₹{stats.totalRevenue.toLocaleString("en-IN")}</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-150 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Total Pending Balances</span>
            <Clock size={16} className="text-amber-500" />
          </div>
          <div className="text-3xl font-black text-amber-500">₹{stats.totalPendingRevenue.toLocaleString("en-IN")}</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-150 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Legacy Custom Notes</span>
            <AlertTriangle size={16} className="text-rose-500" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">{stats.legacyNotesCount}</div>
        </div>
      </div>

      {/* LOADER & NO RESULTS */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="animate-spin text-indigo-600 mb-4" size={36} />
          <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Synchronizing Booking Logs...</span>
        </div>
      ) : error ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center">
          <p className="text-rose-500 font-bold mb-2">{error}</p>
          <button onClick={fetchBookings} className="text-sm text-indigo-600 font-black hover:underline uppercase tracking-wider">Try Again</button>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 border-dashed p-12 text-center">
          <div className="w-20 h-20 bg-slate-50 dark:bg-slate-950 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
            <Search size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Matching Bookings</h3>
          <p className="text-slate-500 dark:text-slate-400">Double check search criteria or try matching the exact invoice ID.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {paginatedBookings.map((b, idx) => {
            const isExpanded = expandedId === b._id;
            const invoiceId = `INV-T2H-${b._id.toString().substring(0, 8).toUpperCase()}`;
            const custName = `${b.user_id?.firstName || ""} ${b.user_id?.lastName || ""}`.trim();
            const isToken = b.payment_type === "token";
            const paidAmount = isToken ? 5000 : b.total_price;
            const dateInfo = getTravelDates(b.travel_date, b.itinerary_id);
            
            return (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(idx * 0.05, 0.3) }}
                key={b._id}
                className={`bg-white dark:bg-slate-900 border transition-all duration-300 overflow-hidden ${
                  isExpanded 
                    ? 'border-indigo-200 dark:border-indigo-900/60 shadow-xl rounded-3xl' 
                    : 'border-slate-200 dark:border-slate-800/80 shadow-sm rounded-2xl hover:border-indigo-300 dark:hover:border-indigo-850 hover:shadow-md'
                }`}
              >
                {/* Horizontal Compact Header Row */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : b._id)}
                  className="px-6 py-5.5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 cursor-pointer select-none group"
                >
                  <div className="flex items-center gap-5 w-full lg:w-auto">
                    <div className={`w-13 h-13 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                      isToken 
                        ? 'bg-amber-500/10 text-amber-600' 
                        : 'bg-emerald-500/10 text-emerald-600'
                    }`}>
                      <FileText size={24} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2.5 mb-1.5">
                        <h3 className="font-mono font-bold text-lg text-slate-900 dark:text-white tracking-wider flex items-center gap-2">
                          {invoiceId}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigator.clipboard.writeText(invoiceId);
                              toast.success('Invoice ID copied!', { position: 'top-right', autoClose: 1500 });
                            }}
                            className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded transition-colors"
                            title="Copy Invoice Code"
                          >
                            <Copy size={16} />
                          </button>
                        </h3>
                        <span className={`text-[11px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded ${
                          isToken 
                            ? 'bg-amber-55 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 border border-amber-200/50' 
                            : 'bg-emerald-55 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border border-emerald-200/50'
                        }`}>
                          {isToken ? 'Token' : 'Paid'}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-slate-900 dark:text-slate-105">
                        {custName || "Guest User"} &bull; <span className="font-semibold text-slate-500 dark:text-slate-400 text-xs">{b.user_id?.email || "N/A"}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between w-full lg:w-auto gap-10">
                    <div className="text-left lg:text-right">
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-widest mb-1">Itinerary</p>
                      <p className="text-sm font-bold text-slate-805 dark:text-slate-200 max-w-[200px] truncate">{b.itinerary_id?.title || "Custom Package"}</p>
                    </div>
                    <div className="text-left lg:text-right hidden sm:block">
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-widest mb-1">Travel Dates</p>
                      <p className="text-sm font-bold text-slate-750 dark:text-slate-350">
                        {dateInfo.start} - {dateInfo.end}
                      </p>
                    </div>
                    <div className="text-left lg:text-right">
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-widest mb-1">Value Paid</p>
                      <p className="text-base font-black text-slate-955 dark:text-white">₹{paidAmount.toLocaleString("en-IN")}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-850 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 dark:group-hover:bg-slate-800 transition-colors">
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                  </div>
                </div>

                {/* Expanded Detailed Booking Panel */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="border-t border-slate-150 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-955/10"
                    >
                      <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                        
                        {/* Left Side: Traveller Info & Package Config */}
                        <div className="space-y-6">
                          
                          {/* Traveller Credentials */}
                          <div>
                            <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2 mb-3.5">
                              <User size={16} className="text-indigo-500" /> Traveller Profile
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                                <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-widest block mb-1">Full Name</span>
                                <span className="text-sm font-bold text-slate-850 dark:text-slate-205">{custName || "Guest User"}</span>
                              </div>
                              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                                <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-widest block mb-1">Email Address</span>
                                <span className="text-sm font-bold text-slate-850 dark:text-slate-205 truncate block">{b.user_id?.email || "N/A"}</span>
                              </div>
                              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                                <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-widest block mb-1">Contact Number</span>
                                <span className="text-sm font-bold text-slate-850 dark:text-slate-205 block">{b.user_id?.phone || "N/A"}</span>
                              </div>
                              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                                <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-widest block mb-1">City / Region</span>
                                <span className="text-sm font-bold text-slate-850 dark:text-slate-205 block">{b.user_id?.city || "N/A"}</span>
                              </div>
                            </div>
                          </div>

                          {/* Itinerary Details */}
                          <div>
                            <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2 mb-3.5">
                              <Calendar size={16} className="text-indigo-500" /> Itinerary Setup
                            </h4>
                            <div className="bg-white dark:bg-slate-900 p-4.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                              <div>
                                <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-widest block mb-1">Package Title</span>
                                <p className="text-sm font-bold text-slate-900 dark:text-white">{b.itinerary_id?.title || "Custom Honeymoon Package"}</p>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                                <div className="bg-slate-50/50 dark:bg-slate-950/40 p-3 rounded-lg border border-slate-100 dark:border-slate-800/80">
                                  <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-widest block mb-1">Start Date</span>
                                  <span className="text-sm font-bold text-slate-850 dark:text-slate-205">{dateInfo.start}</span>
                                </div>
                                <div className="bg-slate-50/50 dark:bg-slate-950/40 p-3 rounded-lg border border-slate-100 dark:border-slate-800/80">
                                  <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-widest block mb-1">End Date</span>
                                  <span className="text-sm font-bold text-slate-850 dark:text-slate-205">{dateInfo.end}</span>
                                </div>
                                <div className="bg-slate-50/50 dark:bg-slate-950/40 p-3 rounded-lg border border-slate-100 dark:border-slate-800/80">
                                  <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-widest block mb-1">Duration</span>
                                  <span className="text-sm font-bold text-slate-850 dark:text-slate-205">{dateInfo.duration}</span>
                                </div>
                              </div>
                              <div className="pt-1">
                                <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-widest block mb-1">Guests count</span>
                                <span className="text-sm font-bold text-slate-850 dark:text-slate-205">{b.adults} Adults, {b.kids} Kids</span>
                              </div>
                            </div>
                          </div>

                        </div>

                        {/* Right Side: Preferences (Add-ons) & Tax Calculations */}
                        <div className="space-y-6">

                          {/* Preferences & Notes */}
                          <div>
                            <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2 mb-3.5">
                              <Sparkles size={16} className="text-indigo-500" /> Preferences & Add-ons
                            </h4>
                            <div className="bg-white dark:bg-slate-900 p-4.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                              {renderBookingNotes(b.notes)}
                            </div>
                          </div>

                          {/* Billing & Tax Calculations Ledger */}
                          <div>
                            <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2 mb-3.5">
                              <DollarSign size={16} className="text-indigo-500" /> Tax Ledger Calculation
                            </h4>
                            <div className="bg-white dark:bg-slate-900 p-4.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                              {(() => {
                                const voucher = b.voucher_amount_used || 0;
                                const wallet = b.wallet_amount_used || 0;
                                const subtotalInclusive = b.total_price + voucher + wallet;
                                const baseVal = subtotalInclusive / 1.18;
                                const gstVal = subtotalInclusive - baseVal;
                                const dueAmount = isToken ? Math.max(0, b.total_price - 5000) : 0;

                                return (
                                  <>
                                    <div className="flex justify-between text-sm font-semibold text-slate-550 dark:text-slate-400">
                                      <span>Base Price (GST Excl):</span>
                                      <span>₹{Math.round(baseVal).toLocaleString("en-IN")}</span>
                                    </div>
                                    <div className="flex justify-between text-sm font-semibold text-slate-550 dark:text-slate-400 font-mono">
                                      <span>CGST + SGST (18%):</span>
                                      <span>₹{Math.round(gstVal).toLocaleString("en-IN")}</span>
                                    </div>
                                    {(voucher > 0 || wallet > 0) && (
                                      <div className="flex justify-between text-sm font-semibold text-rose-500">
                                        <span>Wallet / Voucher Deduct:</span>
                                        <span>- ₹{(voucher + wallet).toLocaleString("en-IN")}</span>
                                      </div>
                                    )}
                                    <div className="border-t border-slate-150 dark:border-slate-800 my-2 pt-2.5 flex justify-between text-base font-black text-slate-900 dark:text-white">
                                      <span>Package Value:</span>
                                      <span>₹{b.total_price.toLocaleString("en-IN")}</span>
                                    </div>
                                    <div className="flex justify-between text-sm font-semibold text-slate-550 dark:text-slate-400">
                                      <span>Amount Paid Now:</span>
                                      <span className="text-emerald-600 font-bold">₹{paidAmount.toLocaleString("en-IN")}</span>
                                    </div>
                                    {dueAmount > 0 && (
                                      <div className="flex justify-between text-sm font-semibold text-amber-500">
                                        <span>Outstanding Balance Due:</span>
                                        <span className="font-bold">₹{dueAmount.toLocaleString("en-IN")}</span>
                                      </div>
                                    )}
                                  </>
                                );
                              })()}
                            </div>
                          </div>

                        </div>

                      </div>

                      {/* Footer Download Action bar */}
                      <div className="px-6 md:px-8 py-5.5 bg-white dark:bg-slate-900 border-t border-slate-150 dark:border-slate-800/80 flex flex-col sm:flex-row items-center gap-4 justify-end">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mr-auto hidden sm:block">Administrative document retrieval</span>
                        <button
                          onClick={() => handleDownloadInvoice(b._id)}
                          disabled={downloadingId === b._id}
                          className="w-full sm:w-auto px-7 py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-md shadow-indigo-500/10 cursor-pointer flex items-center justify-center gap-2.5"
                        >
                          {downloadingId === b._id ? (
                            <>
                              <Loader2 className="animate-spin" size={16} />
                              Generating Receipt...
                            </>
                          ) : (
                            <>
                              <Download size={16} />
                              Download PDF Invoice
                            </>
                          )}
                        </button>
                      </div>

                    </motion.div>
                  )}
                </AnimatePresence>

              </motion.div>
            );
          })}
        </div>
      )}

      {/* PAGINATION INTERACTION */}
      {totalPages > 1 && !isLoading && (
        <div className="flex items-center justify-between mt-6 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-150 dark:border-slate-850 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Showing Page {currentPage} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setCurrentPage(prev => Math.max(prev - 1, 1));
                setExpandedId(null);
              }}
              disabled={currentPage === 1}
              className="p-2 border border-slate-200 dark:border-slate-850 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-600 dark:text-slate-400 disabled:opacity-40"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => {
                setCurrentPage(prev => Math.min(prev + 1, totalPages));
                setExpandedId(null);
              }}
              disabled={currentPage === totalPages}
              className="p-2 border border-slate-200 dark:border-slate-850 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-600 dark:text-slate-400 disabled:opacity-40"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default BookedPackages;
