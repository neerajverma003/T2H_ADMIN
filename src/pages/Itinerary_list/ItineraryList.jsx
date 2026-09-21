import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
    MapPin,
    Calendar,
    Plus,
    Pencil,
    Trash2,
    Heart,
    Search,
    Loader2,
    ArrowUpRight,
    Navigation,
    ListFilter,
    ArrowRight,
    ChevronsLeft,
    ChevronLeft,
    ChevronRight,
    ChevronsRight,
    ChevronDown,
    ArrowUpDown,
    Clock,
    Sparkles,
    Eye,
    Check,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import useAuthStore, { apiClient } from "../../stores/authStores";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { getCdnUrl } from "../../utils/media";



const TagPill = ({ label, colorClass }) => (
    <span className={`px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider border ${colorClass}`}>
        {label}
    </span>
);

const ItineraryCard = ({ itinerary, onDelete, role }) => {
    const { title, duration, selected_destination, destination_thumbnails, itinerary_visibility, _id } = itinerary;
    const navigate = useNavigate();
    const destinationName = selected_destination?.destination_name || "N/A";
    
    const getBestImage = (it) => {
        const candidates = [
            ...(Array.isArray(it?.destination_thumbnails) ? it.destination_thumbnails : []),
            ...(Array.isArray(it?.destination_images) ? it.destination_images : []),
        ].filter(img => img && typeof img === 'string' && img.trim());

        const realKey = candidates.find(img => !img.startsWith('data:'));
        if (realKey) return realKey;

        return candidates[0] || "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?q=80&w=800&auto=format&fit=crop";
    };

    const thumbnail = getCdnUrl(getBestImage(itinerary));
    const isPublic = itinerary_visibility === "public";

    // Generate a short ID (first 6 chars of mongo ID)
    const shortId = _id ? _id.substring(0, 6).toUpperCase() : "";

    // Get price from backend
    let rawPrice = null;
    if (itinerary.pricing && typeof itinerary.pricing === 'object') {
        const p = itinerary.pricing;
        const parsePos = (val) => {
            const n = Number(val);
            return !isNaN(n) && n > 0 ? n : null;
        };

        rawPrice = parsePos(p.discounted_price) || parsePos(p.standard_price);

        if (!rawPrice && p.categories) {
            for (const catKey of ["standard", "deluxe", "super_deluxe", "luxury"]) {
                const c = p.categories[catKey];
                if (c) {
                    const found = parsePos(c.discounted_price) || parsePos(c.hotel_price);
                    if (found) {
                        rawPrice = found;
                        break;
                    }
                }
            }
        }
    }
    const priceText = rawPrice ? `₹${rawPrice.toLocaleString('en-IN')}` : "On Request";

    const tags = [
        { label: itinerary.itinerary_type || 'FLEXIBLE', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/25' },
    ];

    if (itinerary.classification && itinerary.classification[0]) {
        tags.push({ label: itinerary.classification[0], color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25' });
    }

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="group relative bg-white dark:bg-[#091126]/95 rounded-3xl border border-slate-200/90 dark:border-indigo-500/25 shadow-xl dark:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.7),0_0_30px_2px_rgba(99,102,241,0.18)] hover:border-blue-400/60 dark:hover:border-indigo-500/60 ring-1 ring-slate-900/5 dark:ring-white/5 transition-all overflow-hidden flex flex-col h-full"
        >
            {/* Image Section */}
            <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-[#050A17]">
                <img
                    src={thumbnail}
                    alt={title}
                    onError={(e) => {
                        const altImg = itinerary.destination_images?.find(img => img && typeof img === 'string' && !img.startsWith('data:'));
                        if (altImg && e.target.src !== getCdnUrl(altImg)) {
                            e.target.src = getCdnUrl(altImg);
                        } else {
                            e.target.src = "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?q=80&w=800&auto=format&fit=crop";
                        }
                    }}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

                {/* Top Badges & Actions */}
                <div className="absolute top-3.5 left-3.5 right-3.5 flex items-start justify-between z-10">
                    <div className={`px-3 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 shadow-lg backdrop-blur-md border ${
                        isPublic 
                            ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' 
                            : 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                    }`}>
                        <span className={`size-1.5 rounded-full ${isPublic ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                        {isPublic ? 'PUBLISHED' : 'PRIVATE'}
                    </div>

                    {/* Action buttons: Edit beside Delete */}
                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button 
                            type="button"
                            onClick={(e) => { e.stopPropagation(); navigate(`/itineraries/edit/${_id}`); }} 
                            className="p-2 bg-[#050A17]/90 hover:bg-indigo-600 text-slate-300 hover:text-white rounded-xl backdrop-blur-md border border-slate-700/80 shadow-lg transition-all cursor-pointer" 
                            title="Edit Itinerary"
                        >
                            <Pencil size={13} />
                        </button>
                        {role === 'superadmin' && (
                            <button 
                                type="button"
                                onClick={(e) => { e.stopPropagation(); onDelete(_id); }} 
                                className="p-2 bg-[#050A17]/90 hover:bg-red-600 text-slate-300 hover:text-white rounded-xl backdrop-blur-md border border-slate-700/80 shadow-lg transition-all cursor-pointer" 
                                title="Delete Itinerary"
                            >
                                <Trash2 size={13} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Bottom Overlay (Price & Link) */}
                <div className="absolute bottom-3.5 left-4 right-4 flex items-end justify-between z-10">
                    <div>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">
                            STARTING PRICE
                        </p>
                        <h3 className="text-white text-base font-extrabold leading-tight tracking-tight">{priceText}</h3>
                    </div>
                    <button
                        type="button"
                        onClick={() => navigate(`/itineraries/view/${_id}`)}
                        className="size-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center hover:opacity-95 shadow-md shadow-indigo-500/25 transition-all cursor-pointer"
                        title="View Itinerary"
                    >
                        <ArrowUpRight size={17} strokeWidth={2.5} />
                    </button>
                </div>
            </div>

            {/* Body Section */}
            <div className="p-6 flex flex-col flex-1 space-y-4">
                {/* Tags & ID */}
                <div className="flex items-center flex-wrap gap-2">
                    {tags.map((t, i) => (
                        <TagPill key={i} label={t.label} colorClass={t.color} />
                    ))}
                    <span className="text-[10px] font-bold text-slate-500 ml-auto flex items-center gap-1">
                        ID: <span className="text-indigo-400 font-mono">{shortId}</span>
                    </span>
                </div>

                {/* Title */}
                <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-indigo-300 transition-colors">
                    {title}
                </h3>

                {/* Footer Info (Dest & Duration) */}
                <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                            <MapPin size={11} className="text-indigo-400" /> Destination
                        </p>
                        <p className="font-bold text-slate-900 dark:text-white truncate max-w-[130px]">{destinationName}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-end gap-1.5">
                            <Clock size={11} className="text-indigo-400" /> Duration
                        </p>
                        <p className="font-bold text-slate-900 dark:text-white">{duration || "N/A"}</p>
                    </div>
                </div>

                {/* View Details Button */}
                <button
                    type="button"
                    onClick={() => navigate(`/itineraries/view/${_id}`)}
                    className="w-full py-3 bg-slate-50 dark:bg-[#050A17] hover:bg-blue-600 dark:hover:bg-gradient-to-r dark:hover:from-indigo-500 dark:hover:to-purple-600 text-slate-500 dark:text-slate-300 hover:text-white rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-800 hover:border-transparent transition-all shadow-sm cursor-pointer active:scale-[0.98]"
                >
                    <Eye size={14} /> View Details <ArrowRight size={14} />
                </button>
            </div>
        </motion.div>
    );
};

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;
    return (
        <div className="flex items-center justify-center gap-2 mt-12">
            <button
                type="button"
                onClick={() => onPageChange(1)}
                disabled={currentPage === 1}
                className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#050A17] text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-blue-500/50 dark:hover:border-indigo-500/50 hover:bg-blue-50 dark:hover:bg-indigo-500/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer shadow-inner"
                title="First Page"
            >
                <ChevronsLeft size={16} />
            </button>
            <button
                type="button"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#050A17] text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-blue-500/50 dark:hover:border-indigo-500/50 hover:bg-blue-50 dark:hover:bg-indigo-500/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer shadow-inner"
                title="Previous Page"
            >
                <ChevronLeft size={16} />
            </button>

            <div className="px-5 py-2.5 rounded-2xl border border-blue-500/30 dark:border-indigo-500/30 bg-blue-50 dark:bg-indigo-500/10 text-blue-600 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider min-w-[140px] text-center shadow-inner">
                Page <span className="text-slate-900 dark:text-white font-extrabold">{currentPage}</span> of {totalPages}
            </div>

            <button
                type="button"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#050A17] text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-blue-500/50 dark:hover:border-indigo-500/50 hover:bg-blue-50 dark:hover:bg-indigo-500/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer shadow-inner"
                title="Next Page"
            >
                <ChevronRight size={16} />
            </button>
            <button
                type="button"
                onClick={() => onPageChange(totalPages)}
                disabled={currentPage === totalPages}
                className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#050A17] text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-blue-500/50 dark:hover:border-indigo-500/50 hover:bg-blue-50 dark:hover:bg-indigo-500/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer shadow-inner"
                title="Last Page"
            >
                <ChevronsRight size={16} />
            </button>
        </div>
    );
};

const THEME_OPTIONS = [
    { value: "All", label: "All Themes / Categories" },
    { value: "Honeymoon", label: "Honeymoon" },
    { value: "Romantic", label: "Romantic" },
    { value: "Trending", label: "Trending" },
    { value: "Exclusive", label: "Exclusive" },
    { value: "Top Selling", label: "Top Selling" },
    { value: "Weekend", label: "Weekend" },
    { value: "Adventures", label: "Adventures" },
    { value: "Solo", label: "Solo" },
    { value: "Wildlife", label: "Wildlife" },
    { value: "Beach", label: "Beach" },
    { value: "Hill Station", label: "Hill Station" },
    { value: "Heritage Tour", label: "Heritage Tour" },
    { value: "Luxury Tour", label: "Luxury Tour" },
    { value: "Budget Tour", label: "Budget Tour" },
    { value: "Family", label: "Family" },
    { value: "Cultural Tour", label: "Cultural Tour" },
    { value: "Ayurveda Tour", label: "Ayurveda Tour" },
    { value: "Pilgrimage", label: "Pilgrimage" },
    { value: "Bachelor Tour", label: "Bachelor Tour" },
    { value: "Women Group", label: "Women Group" },
    { value: "Special Interest", label: "Special Interest" },
];

const CategoryDropdown = ({ value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedOption = THEME_OPTIONS.find((o) => o.value === value) || THEME_OPTIONS[0];

    return (
        <div className="relative z-30" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between gap-3 bg-slate-50 dark:bg-[#050A17] hover:bg-white dark:hover:bg-[#080E21] border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 dark:hover:border-indigo-500/50 text-slate-900 dark:text-white text-sm font-bold py-3 px-4 rounded-2xl outline-none focus:ring-1 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all cursor-pointer shadow-inner min-w-[230px]"
            >
                <span className="truncate">{selectedOption.label}</span>
                <ChevronDown
                    size={16}
                    className={`text-slate-400 transition-transform duration-200 shrink-0 ${
                        isOpen ? "rotate-180 text-indigo-500" : ""
                    }`}
                />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -4, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -4, scale: 0.98 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-0 top-full mt-2 w-full min-w-[260px] max-h-80 overflow-y-auto no-scrollbar bg-white dark:bg-[#091126] border border-slate-200/90 dark:border-indigo-500/30 rounded-2xl shadow-2xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.85)] p-1.5 z-50 ring-1 ring-slate-900/10 dark:ring-white/10"
                    >
                        {THEME_OPTIONS.map((opt) => {
                            const isSelected = opt.value === value;
                            return (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => {
                                        onChange(opt.value);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-bold rounded-xl transition-all text-left cursor-pointer ${
                                        isSelected
                                            ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400"
                                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#050A17] hover:text-slate-900 dark:hover:text-white"
                                    }`}
                                >
                                    <span>{opt.label}</span>
                                    {isSelected && <Check size={14} className="text-indigo-600 dark:text-indigo-400 shrink-0" />}
                                </button>
                            );
                        })}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const ItinerariesListPage = () => {
    const navigate = useNavigate();
    const [itineraries, setItineraries] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(9);
    const [sortOrder, setSortOrder] = useState("newest");
    const role = useAuthStore((s) => s.role);

    // Filters state
    const [filters, setFilters] = useState({
        type: "all",
        status: "all",
        region: "all",
    });
    const [activeClassification, setActiveClassification] = useState("All");

    useEffect(() => {
        const fetchItineraries = async () => {
            try {
                const resp = await apiClient.get("/admin/itinerary");
                setItineraries(resp.data?.data || []);
            } catch {
                toast.error("Failed to load itineraries.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchItineraries();
    }, []);

    const filteredItineraries = useMemo(() => {
        return itineraries
            .filter((it) => {
                const q = searchQuery.toLowerCase();
                return it.title?.toLowerCase().includes(q) || it.selected_destination?.destination_name?.toLowerCase().includes(q);
            })
            .filter((it) => filters.type === "all" ? true : it.itinerary_type === filters.type)
            .filter((it) => filters.status === "all" ? true : filters.status === "published" ? it.itinerary_visibility === "public" : it.itinerary_visibility === "private")
            .filter((it) => {
                if (filters.region === "all") return true;
                const destType = (it.destination_type || it.selected_destination?.domestic_or_international || "").toLowerCase();
                return destType === filters.region;
            })
            .filter((it) => {
                if (activeClassification === "All") return true;
                const cls = Array.isArray(it.classification) ? it.classification : [];
                const themes = Array.isArray(it.itinerary_theme) ? it.itinerary_theme : [];
                const allTags = [...cls, ...themes].map(t => String(t).toLowerCase());
                return allTags.includes(activeClassification.toLowerCase());
            })
            .sort((a, b) => {
                if (sortOrder === "oldest") {
                    return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
                }
                // default: newest
                return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
            });
    }, [searchQuery, filters, activeClassification, itineraries, sortOrder]);

    // Reset to page 1 whenever filters/search/perPage change
    useEffect(() => { 
        setCurrentPage(1); 
    }, [searchQuery, filters, activeClassification, itemsPerPage, sortOrder]);

    const effectiveItemsPerPage = itemsPerPage >= filteredItineraries.length && filteredItineraries.length > 0 && itemsPerPage > 27 
        ? filteredItineraries.length 
        : itemsPerPage;

    const totalPages = Math.max(1, Math.ceil(filteredItineraries.length / effectiveItemsPerPage));
    const paginatedItineraries = useMemo(() => {
        const start = (currentPage - 1) * effectiveItemsPerPage;
        return filteredItineraries.slice(start, start + effectiveItemsPerPage);
    }, [filteredItineraries, currentPage, effectiveItemsPerPage]);

    const handlePageChange = useCallback((page) => {
        setCurrentPage(page);
        const mainEl = document.querySelector('main');
        if (mainEl) {
            mainEl.scrollTo({ top: 0, behavior: "smooth" });
        } else {
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this itinerary permanently?")) return;
        try {
            await apiClient.delete(`/admin/itinerary/${id}`);
            setItineraries((prev) => prev.filter((it) => it._id !== id));
            toast.success("Itinerary removed");
        } catch (err) {
            const errorMsg =
                err.response?.data?.msg ||
                (err.response?.status === 403
                    ? "Permission Denied: Only Super Admin is authorized to delete itineraries."
                    : "Failed to delete itinerary.");
            toast.error(errorMsg);
        }
    };

    const inputStyle = "w-full rounded-2xl border border-slate-200 dark:border-slate-800/90 bg-slate-50/90 dark:bg-[#050A17] p-3.5 text-sm font-semibold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-[#050A17] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 placeholder:font-normal shadow-inner";
    const selectStyle = "w-full rounded-2xl border border-slate-200 dark:border-slate-800/90 bg-slate-50/90 dark:bg-[#050A17] p-3.5 pr-10 text-sm font-semibold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-[#050A17] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 outline-none transition-all appearance-none cursor-pointer shadow-inner";

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8 pb-16 font-sans">
            {/* TOP HEADER HUB */}
            <div className="bg-white dark:bg-[#091126]/95 rounded-3xl py-4 sm:py-5 px-6 sm:px-8 border border-slate-200/90 dark:border-indigo-500/25 shadow-xl dark:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.7),0_0_30px_2px_rgba(99,102,241,0.18)] ring-1 ring-slate-900/5 dark:ring-white/5 backdrop-blur-xl relative overflow-hidden">
                {/* Glow Effects */}
                <div className="absolute -top-24 -right-24 w-60 h-60 bg-blue-500/10 dark:bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-indigo-500/10 dark:bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-500/30 shrink-0">
                            <Navigation size={22} />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2 flex-wrap">
                                All <span className="text-blue-500">Itineraries</span>
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 font-semibold mt-0.5 text-xs sm:text-sm">
                                Access and manage your travel itineraries and pricing plans.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="bg-white dark:bg-[#091126]/95 border border-slate-200 dark:border-slate-800/90 hover:border-blue-500/30 dark:hover:border-indigo-500/30 rounded-2xl px-6 py-2.5 flex flex-col items-center justify-center min-w-[125px] shadow-inner ring-1 ring-slate-900/5 dark:ring-white/5 transition-all">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Found</span>
                            <span className="text-2xl font-black text-slate-900 dark:text-white leading-tight mt-0.5">{filteredItineraries.length}</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => navigate("/itineraries/create")}
                            className="flex items-center gap-2.5 px-7 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-xs shadow-xl shadow-blue-600/30 uppercase tracking-wider transition-all cursor-pointer active:scale-[0.98]"
                        >
                            <Plus size={16} strokeWidth={2.5} /> Create New
                        </button>
                    </div>
                </div>
            </div>

            {/* FILTERS & TOOLBAR CARD */}
            <div className="bg-white dark:bg-[#091126]/95 rounded-3xl p-6 md:p-8 border border-slate-200/90 dark:border-indigo-500/25 shadow-xl dark:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.7),0_0_30px_2px_rgba(99,102,241,0.18)] ring-1 ring-slate-900/5 dark:ring-white/5 backdrop-blur-xl space-y-6 relative z-30">
                {/* 1. FILTER INPUTS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                        <input
                            type="text"
                            placeholder="Search by name or destination..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={`${inputStyle} pl-11`}
                        />
                    </div>

                    {/* Type */}
                    <div className="relative">
                        <select 
                            value={filters.type} 
                            onChange={(e) => setFilters(p => ({ ...p, type: e.target.value }))} 
                            className={selectStyle}
                        >
                            <option value="all" className="bg-white dark:bg-[#050A17] text-slate-900 dark:text-white">-- Type: All --</option>
                            <option value="flexible" className="bg-white dark:bg-[#050A17] text-slate-900 dark:text-white">Flexible</option>
                            <option value="fixed" className="bg-white dark:bg-[#050A17] text-slate-900 dark:text-white">Fixed</option>
                        </select>
                        <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                    </div>

                    {/* Status */}
                    <div className="relative">
                        <select 
                            value={filters.status} 
                            onChange={(e) => setFilters(p => ({ ...p, status: e.target.value }))} 
                            className={selectStyle}
                        >
                            <option value="all" className="bg-white dark:bg-[#050A17] text-slate-900 dark:text-white">-- Status: All --</option>
                            <option value="published" className="bg-white dark:bg-[#050A17] text-slate-900 dark:text-white">Published</option>
                            <option value="private" className="bg-white dark:bg-[#050A17] text-slate-900 dark:text-white">Private</option>
                        </select>
                        <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                    </div>

                    {/* Region */}
                    <div className="relative">
                        <select 
                            value={filters.region} 
                            onChange={(e) => setFilters(p => ({ ...p, region: e.target.value }))} 
                            className={selectStyle}
                        >
                            <option value="all" className="bg-white dark:bg-[#050A17] text-slate-900 dark:text-white">-- Region: All --</option>
                            <option value="domestic" className="bg-white dark:bg-[#050A17] text-slate-900 dark:text-white">Domestic</option>
                            <option value="international" className="bg-white dark:bg-[#050A17] text-slate-900 dark:text-white">International</option>
                        </select>
                        <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                    </div>
                </div>

                {/* 2. CLASSIFICATIONS & SORT / PER-PAGE CONTROLS */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-30">
                    {/* Filter / Theme Dropdown */}
                    <div className="flex items-center gap-3">
                        <span className="text-slate-400 font-bold uppercase tracking-wider text-xs flex items-center gap-2 shrink-0">
                            <ListFilter size={16} className="text-indigo-400" /> Filter:
                        </span>
                        <CategoryDropdown value={activeClassification} onChange={setActiveClassification} />
                    </div>

                    {/* Sort & Per-Page */}
                    <div className="flex flex-wrap items-center gap-5 shrink-0">
                        {/* Sort Dropdown */}
                        <div className="flex items-center gap-2.5">
                            <span className="text-slate-400 font-bold uppercase tracking-wider text-xs flex items-center gap-1.5">
                                <ArrowUpDown size={15} className="text-indigo-400" /> Sort:
                            </span>
                            <div className="relative">
                                <select
                                    value={sortOrder}
                                    onChange={(e) => setSortOrder(e.target.value)}
                                    className="appearance-none bg-slate-50 dark:bg-[#050A17] hover:bg-white dark:hover:bg-[#080E21] border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 dark:hover:border-indigo-500/50 text-slate-900 dark:text-white text-sm font-bold py-3 pl-4 pr-10 rounded-2xl outline-none focus:ring-1 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all cursor-pointer shadow-inner min-w-[155px]"
                                >
                                    <option value="newest" className="bg-white dark:bg-[#050A17] text-slate-900 dark:text-white">New Itinerary</option>
                                    <option value="oldest" className="bg-white dark:bg-[#050A17] text-slate-900 dark:text-white">Old Itinerary</option>
                                </select>
                                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>
                        </div>

                        {/* Per-Page Dropdown */}
                        <div className="flex items-center gap-2.5">
                            <span className="text-slate-400 font-bold uppercase tracking-wider text-xs">
                                Per Page:
                            </span>
                            <div className="relative">
                                <select
                                    value={itemsPerPage >= filteredItineraries.length && filteredItineraries.length > 0 && itemsPerPage > 27 ? "all" : itemsPerPage}
                                    onChange={(e) => {
                                        if (e.target.value === "all") {
                                            setItemsPerPage(filteredItineraries.length > 0 ? filteredItineraries.length : 1000);
                                        } else {
                                            setItemsPerPage(Number(e.target.value));
                                        }
                                    }}
                                    className="appearance-none bg-slate-50 dark:bg-[#050A17] hover:bg-white dark:hover:bg-[#080E21] border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 dark:hover:border-indigo-500/50 text-slate-900 dark:text-white text-sm font-bold py-3 pl-4 pr-10 rounded-2xl outline-none focus:ring-1 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all cursor-pointer shadow-inner min-w-[130px]"
                                >
                                    <option value={9} className="bg-white dark:bg-[#050A17] text-slate-900 dark:text-white">9 / page</option>
                                    <option value={18} className="bg-white dark:bg-[#050A17] text-slate-900 dark:text-white">18 / page</option>
                                    <option value={27} className="bg-white dark:bg-[#050A17] text-slate-900 dark:text-white">27 / page</option>
                                    <option value="all" className="bg-white dark:bg-[#050A17] text-slate-900 dark:text-white">All Itineraries</option>
                                </select>
                                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* GRID */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-40 gap-4">
                    <Loader2 className="animate-spin text-indigo-500" size={44} strokeWidth={2} />
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Loading Itineraries...</p>
                </div>
            ) : filteredItineraries.length === 0 ? (
                <div className="py-32 text-center bg-white dark:bg-[#091126]/95 rounded-3xl border border-slate-200/90 dark:border-indigo-500/20 border-dashed shadow-xl p-8">
                    <Heart className="mx-auto mb-4 text-slate-400 dark:text-slate-600" size={54} />
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No Matching Itineraries Found</h3>
                    <p className="text-slate-500 dark:text-slate-400 font-medium text-xs max-w-md mx-auto">
                        Try modifying your search keywords or adjusting the classification and region filters.
                    </p>
                </div>
            ) : (
                <>
                    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 relative z-0">
                        <AnimatePresence mode="popLayout">
                            {paginatedItineraries.map((it) => (
                                <ItineraryCard key={it._id} itinerary={it} onDelete={handleDelete} role={role} />
                            ))}
                        </AnimatePresence>
                    </div>

                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                </>
            )}
        </div>
    );
};

export default ItinerariesListPage;
