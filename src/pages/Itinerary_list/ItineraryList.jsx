import React, { useState, useEffect, useMemo } from "react";
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
    Layers,
    ListFilter,
    ArrowRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import useAuthStore, { apiClient } from "../../stores/authStores";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

const ClassificationPill = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${
            isActive
                ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                : "bg-slate-50 text-slate-500 hover:bg-slate-100"
        }`}
    >
        {label}
    </button>
);

const TagPill = ({ label, colorClass }) => (
    <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-wider ${colorClass}`}>
        {label}
    </span>
);

const ItineraryCard = ({ itinerary, onDelete, role }) => {
    const { title, duration, selected_destination, destination_thumbnails, itinerary_visibility, _id } = itinerary;
    const navigate = useNavigate();
    const destinationName = selected_destination?.destination_name || "N/A";
    const thumbnail = destination_thumbnails?.[0] || itinerary.destination_images?.[0] || "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?q=80&w=800&auto=format&fit=crop";
    const isPublic = itinerary_visibility === "public";
    
    // Generate a short ID (first 6 chars of mongo ID)
    const shortId = _id.substring(0, 6).toUpperCase();

    // Get price from backend (pricing can be an object with standard_price/discounted_price, or a string like "As per best quote")
    let rawPrice = null;
    if (itinerary.pricing && typeof itinerary.pricing === 'object') {
        rawPrice = itinerary.pricing.discounted_price || itinerary.pricing.standard_price;
    }
    const priceText = rawPrice ? `₹${rawPrice.toLocaleString()}` : "On Request";
    
    // Mock tags for UI representation
    const tags = [
        { label: itinerary.itinerary_type || 'FLEXIBLE', color: 'bg-blue-50 text-blue-600' },
        { label: 'TRENDING', color: 'bg-emerald-50 text-emerald-600' }
    ];

    return (
        <motion.div 
            layout 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="group relative bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden transition-all hover:shadow-2xl hover:shadow-indigo-500/10 flex flex-col h-full"
        >
            {/* Image Section */}
            <div className="relative aspect-[4/2.5] overflow-hidden">
                <img src={thumbnail} alt={title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/10" />

                {/* Top Badges & Actions */}
                <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
                    <div className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-lg ${isPublic ? 'bg-emerald-600/90 text-white backdrop-blur-md' : 'bg-amber-600/90 text-white backdrop-blur-md'}`}>
                        <span className={`size-1.5 rounded-full ${isPublic ? 'bg-emerald-200' : 'bg-amber-200'}`}></span>
                        {isPublic ? 'PUBLISHED' : 'PRIVATE'}
                    </div>
                    
                    {/* Hover Actions (Edit/Delete) */}
                    <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0 duration-300">
                        <button onClick={() => navigate(`/itineraries/edit/${_id}`)} className="p-2.5 bg-white/20 backdrop-blur-md text-white rounded-xl hover:bg-white hover:text-indigo-600 shadow-xl transition-all border border-white/20" title="Edit">
                            <Pencil size={14} />
                        </button>
                        {role === 'superadmin' && (
                            <button onClick={() => onDelete(_id)} className="p-2.5 bg-white/20 backdrop-blur-md text-white rounded-xl hover:bg-red-500 shadow-xl transition-all border border-white/20" title="Delete">
                                <Trash2 size={14} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Bottom Overlay (Price & Link) */}
                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                    <div>
                        <p className="text-white/60 text-[9px] font-black uppercase tracking-widest mb-0.5">
                            STARTING PRICE
                        </p>
                        <h3 className="text-white text-[15px] font-bold leading-tight">{priceText}</h3>
                    </div>
                    <button 
                        onClick={() => navigate(`/itineraries/view/${_id}`)} 
                        className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-lg transition-all"
                    >
                        <ArrowUpRight size={18} strokeWidth={2.5} />
                    </button>
                </div>
            </div>

            {/* Body Section */}
            <div className="p-5 flex flex-col flex-1">
                {/* Tags & ID */}
                <div className="flex items-center flex-wrap gap-2 mb-3">
                    {tags.map((t, i) => (
                        <TagPill key={i} label={t.label} colorClass={t.color} />
                    ))}
                    <span className="text-[10px] font-bold text-slate-400 ml-auto flex items-center gap-1">
                        <span className="text-slate-300">•</span> ID: {shortId}
                    </span>
                </div>

                {/* Title */}
                <h3 className="text-[17px] font-extrabold text-slate-800 leading-snug mb-5 line-clamp-2">
                    {title}
                </h3>

                {/* Footer Info (Dest & Duration) */}
                <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4 mb-4">
                    <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                            <MapPin size={10} /> DESTINATION
                        </p>
                        <p className="text-xs font-bold text-slate-700 truncate max-w-[120px]">{destinationName}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center justify-end gap-1">
                            <Calendar size={10} /> DURATION
                        </p>
                        <p className="text-xs font-bold text-slate-700">{duration}</p>
                    </div>
                </div>

                {/* View Details Button */}
                <button 
                    onClick={() => navigate(`/itineraries/view/${_id}`)} 
                    className="w-full py-3.5 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-700 rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-colors"
                >
                    VIEW DETAILS <ArrowRight size={14} />
                </button>
            </div>
        </motion.div>
    );
};

const ItinerariesListPage = () => {
    const navigate = useNavigate();
    const [itineraries, setItineraries] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const role = useAuthStore((s) => s.role);
    
    // Filters state
    const [filters, setFilters] = useState({ 
        type: "all", 
        status: "all", 
        region: "all", 
        subRegion: "all" 
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
            // Classification mocking (since it's a UI redesign based on screenshots)
            .filter((it) => activeClassification === "All" ? true : true); // Mock logic for now
    }, [searchQuery, filters, activeClassification, itineraries]);

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this itinerary permanently?")) return;
        try {
            await apiClient.delete(`/admin/itinerary/${id}`);
            setItineraries((prev) => prev.filter((it) => it._id !== id));
            toast.success("Itinerary removed");
        } catch {
            toast.error("Failed to delete.");
        }
    };

    const inputStyle = "w-full rounded-full border border-slate-200 bg-white px-5 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all";
    const selectStyle = "w-full rounded-full border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all appearance-none cursor-pointer";

    return (
        <div className="max-w-[1600px] mx-auto pb-20 px-4 sm:px-6 lg:px-8 bg-[#F8FAFC] min-h-screen pt-6">
            
            {/* TOP HEADER */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                <div>
                    <div className="flex items-center gap-2 text-blue-600 mb-2">
                        <Layers size={16} strokeWidth={2.5} />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Manage Itineraries</span>
                    </div>
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                        All <span className="text-blue-600">Itineraries</span>
                    </h1>
                    <p className="text-slate-500 font-medium mt-2 text-sm">Access and manage your travel itineraries and pricing plans.</p>
                </div>
                
                <div className="flex items-center gap-6">
                    <div className="text-right">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Found</p>
                        <p className="text-2xl font-black text-slate-800 leading-none">{filteredItineraries.length}</p>
                    </div>
                    <button 
                        onClick={() => navigate("/itineraries/create")} 
                        className="flex items-center gap-2 bg-[#4338CA] hover:bg-[#3730A3] text-white px-8 py-4 rounded-2xl font-bold text-sm shadow-xl shadow-indigo-500/20 transition-all transform hover:scale-105 active:scale-95"
                    >
                        <Plus size={18} strokeWidth={3} /> CREATE NEW
                    </button>
                </div>
            </div>

            {/* FILTERS BAR */}
            <div className="bg-white rounded-[2rem] p-4 shadow-sm border border-slate-100 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search by name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={`${inputStyle} pl-10`}
                        />
                    </div>
                    <select value={filters.type} onChange={(e) => setFilters(p => ({ ...p, type: e.target.value }))} className={selectStyle}>
                        <option value="all">-- Type --</option>
                        <option value="flexible">Flexible</option>
                        <option value="fixed">Fixed</option>
                    </select>
                    <select value={filters.status} onChange={(e) => setFilters(p => ({ ...p, status: e.target.value }))} className={selectStyle}>
                        <option value="all">-- Status --</option>
                        <option value="published">Published</option>
                        <option value="private">Private</option>
                    </select>
                    <select value={filters.region} onChange={(e) => setFilters(p => ({ ...p, region: e.target.value }))} className={selectStyle}>
                        <option value="all">-- Region --</option>
                        <option value="domestic">Domestic</option>
                        <option value="international">International</option>
                    </select>
                    <select value={filters.subRegion} onChange={(e) => setFilters(p => ({ ...p, subRegion: e.target.value }))} className={selectStyle} disabled={filters.region === 'all'}>
                        <option value="all">-- Choose Region First --</option>
                        {/* Sub regions would populate based on region */}
                    </select>
                </div>
            </div>

            {/* CLASSIFICATIONS */}
            <div className="bg-white rounded-[2rem] p-5 shadow-sm border border-slate-100 mb-8 flex flex-col md:flex-row md:items-center gap-6">
                <div className="flex items-center gap-2 text-slate-400 shrink-0">
                    <ListFilter size={16} strokeWidth={2.5} />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Classifications</span>
                </div>
                <div className="flex items-center gap-3 overflow-x-auto pb-1 md:pb-0 custom-scrollbar">
                    {["All", "Trending", "Exclusive", "Weekend", "Top Selling"].map(cls => (
                        <ClassificationPill 
                            key={cls} 
                            label={cls} 
                            isActive={activeClassification === cls}
                            onClick={() => setActiveClassification(cls)} 
                        />
                    ))}
                </div>
            </div>

            {/* GRID */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-40 gap-4">
                    <Loader2 className="animate-spin text-blue-600" size={48} strokeWidth={2} />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Loading Itineraries</p>
                </div>
            ) : filteredItineraries.length === 0 ? (
                <div className="py-40 text-center bg-white rounded-[3rem] border border-slate-100 border-dashed">
                    <Heart className="mx-auto mb-4 text-slate-200" size={64} />
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No matching itineraries found</p>
                </div>
            ) : (
                <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
                    <AnimatePresence mode='popLayout'>
                        {filteredItineraries.map((it) => (
                            <ItineraryCard key={it._id} itinerary={it} onDelete={handleDelete} role={role} />
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};

export default ItinerariesListPage;
