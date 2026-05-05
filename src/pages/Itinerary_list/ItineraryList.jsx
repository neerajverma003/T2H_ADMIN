import React, { useState, useEffect, useMemo } from "react";
import {
    MapPin,
    Calendar,
    Plus,
    ArrowRight,
    Pencil,
    Trash2,
    Heart,
    Search,
    Filter,
    Navigation,
    Loader2,
    Eye,
    Sparkles
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../../stores/authStores";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

const ItineraryCard = ({ itinerary, onDelete }) => {
    const { title, duration, selected_destination, destination_thumbnails, itinerary_visibility } = itinerary;
    const navigate = useNavigate();
    const destinationName = selected_destination?.destination_name || "N/A";
    const thumbnail = destination_thumbnails?.[0] || itinerary.destination_images?.[0] || "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?q=80&w=800&auto=format&fit=crop";
    const isPublic = itinerary_visibility === "public";

    return (
        <motion.div layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="group relative bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden transition-all hover:shadow-2xl hover:shadow-indigo-500/10">
            <div className="relative aspect-[4/3] overflow-hidden">
                <img src={thumbnail} alt={title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                <div className="absolute top-6 left-6 right-6 flex items-center justify-between">
                    <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md shadow-lg ${isPublic ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}>
                        {isPublic ? 'Live' : 'Draft'}
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
                        <button onClick={() => navigate(`/itineraries/edit/${itinerary._id}`)} className="p-3 bg-white/20 backdrop-blur-md text-white rounded-2xl hover:bg-white hover:text-indigo-600 shadow-xl transition-all border border-white/10">
                            <Pencil size={18} />
                        </button>
                        <button onClick={() => onDelete(itinerary._id)} className="p-3 bg-white/20 backdrop-blur-md text-white rounded-2xl hover:bg-red-500 shadow-xl transition-all border border-white/10">
                            <Trash2 size={18} />
                        </button>
                    </div>
                </div>

                <div className="absolute bottom-6 left-6 right-6">
                    <p className="text-white/60 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 mb-2">
                        <MapPin size={12} className="text-indigo-400" /> {destinationName}
                    </p>
                    <h3 className="text-white text-lg font-black leading-tight truncate">{title}</h3>
                </div>
            </div>

            <div className="p-8 space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-indigo-600 dark:text-indigo-400">
                            <Calendar size={18} />
                        </div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{duration}</p>
                    </div>
                    <button onClick={() => navigate(`itinerary_details/${itinerary._id}`)} className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400 hover:text-indigo-600 transition-colors">
                        <ArrowRight size={20} />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

const ItinerariesListPage = () => {
    const navigate = useNavigate();
    const [itineraries, setItineraries] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filters, setFilters] = useState({ type: "all", status: "all", destination: "all" });

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
            .filter((it) => filters.destination === "all" ? true : it.selected_destination?.destination_name?.toLowerCase() === filters.destination.toLowerCase());
    }, [searchQuery, filters, itineraries]);

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

    const selectStyle = "w-full rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-3.5 text-slate-900 dark:text-slate-100 text-xs font-bold uppercase tracking-widest focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all";

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-[1400px] mx-auto space-y-10 pb-20 px-6">
            {/* HEADER */}
            <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-12 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none"><Sparkles size={200} /></div>
                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-4">
                            <Navigation className="text-indigo-600" size={36} /> ITINERARY HUB
                        </h1>
                        <p className="text-slate-500 font-medium mt-2 text-lg">Orchestrating unforgettable honeymoon experiences</p>
                    </div>
                    <button onClick={() => navigate("/itineraries/create")} className="flex items-center gap-3 bg-indigo-600 text-white px-8 py-5 rounded-[2rem] font-black shadow-2xl shadow-indigo-500/40 hover:bg-indigo-700 transition-all transform hover:scale-105 active:scale-95">
                        <Plus size={20} /> CRAFT NEW EXPERIENCE
                    </button>
                </div>
            </div>

            {/* CONTROLS */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none flex flex-col lg:flex-row gap-6">
                <div className="relative flex-1">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="search"
                        placeholder="Search experiences, destinations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 pl-14 pr-6 py-4 text-slate-900 dark:text-slate-100 font-medium outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-slate-400"
                    />
                </div>
                <div className="flex flex-wrap md:flex-nowrap gap-4 items-center">
                    <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-indigo-600 dark:text-indigo-400">
                        <Filter size={16} /> <span className="text-[10px] font-black uppercase tracking-widest">Filters</span>
                    </div>
                    <select value={filters.type} onChange={(e) => setFilters(p => ({ ...p, type: e.target.value }))} className={selectStyle}>
                        <option value="all">Types</option>
                        <option value="flexible">Flexible</option>
                        <option value="fixed">Fixed</option>
                    </select>
                    <select value={filters.status} onChange={(e) => setFilters(p => ({ ...p, status: e.target.value }))} className={selectStyle}>
                        <option value="all">Status</option>
                        <option value="published">Live</option>
                        <option value="private">Draft</option>
                    </select>
                    <select value={filters.destination} onChange={(e) => setFilters(p => ({ ...p, destination: e.target.value }))} className={selectStyle}>
                        <option value="all">Destinations</option>
                        {Array.from(new Set(itineraries.map(it => it.selected_destination?.destination_name))).filter(Boolean).map(d => (
                            <option key={d} value={d}>{d}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* GRID */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-40 gap-4">
                    <Loader2 className="animate-spin text-indigo-600" size={48} strokeWidth={1} />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Synchronizing Itineraries</p>
                </div>
            ) : filteredItineraries.length === 0 ? (
                <div className="py-40 text-center bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 border-dashed">
                    <Heart className="mx-auto mb-4 text-slate-200 dark:text-slate-800" size={64} strokeWidth={1} />
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No matching honeymoon experiences found</p>
                </div>
            ) : (
                <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    <AnimatePresence mode='popLayout'>
                        {filteredItineraries.map((it) => (
                            <ItineraryCard key={it._id} itinerary={it} onDelete={handleDelete} />
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </motion.div>
    );
};

export default ItinerariesListPage;
