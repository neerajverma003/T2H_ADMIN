import React, { useState, useEffect, useMemo } from "react";
import {
    MapPin,
    Calendar,
    Plus,
    List,
    ArrowRight,
    Pencil,
    Trash2,
    Heart,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../../stores/authStores";
import { toast } from "react-toastify";


/* ===============================
   Itinerary Card
================================ */
const ItineraryCard = ({ itinerary, onDelete }) => {
    const {
        title,
        duration,
        selected_destination,
        destination_thumbnails,
        itinerary_visibility,
    } = itinerary;

    const navigate = useNavigate();
    const destinationName =
        selected_destination?.destination_name || "N/A";
    const thumbnail =
        destination_thumbnails?.[0] ||
        "https://via.placeholder.com/400x300";

    const status =
        itinerary_visibility === "public" ? "Published" : "Private";

    return (
        <div className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md dark:border-gray-600 dark:bg-gray-800">
            <div className="relative">
                <div className="absolute right-3 top-3 z-10 flex gap-2">
                    <button
                        onClick={() =>
                            navigate(
                                `itinerary_details/${itinerary._id}`
                            )
                        }
                        className="rounded-full bg-white/90 p-2 text-blue-600 hover:bg-white shadow-sm dark:bg-gray-700 dark:text-blue-400"
                    >
                        <Pencil size={16} />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(itinerary._id);
                        }}
                        className="rounded-full bg-white/90 p-2 text-red-600 hover:bg-white shadow-sm dark:bg-gray-700 dark:text-red-400"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>

                <img
                    src={thumbnail}
                    alt={title}
                    className="h-48 w-full object-cover transition-transform group-hover:scale-105"
                />
            </div>

            <div className="p-4">
                <h3 className="mb-2 truncate text-lg font-bold text-black dark:text-white">
                    {title}
                </h3>

                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    <p className="flex items-center">
                        <MapPin size={14} className="mr-2 text-gray-500 dark:text-gray-400" />
                        {destinationName}
                    </p>
                    <p className="flex items-center">
                        <Calendar size={14} className="mr-2 text-gray-500 dark:text-gray-400" />
                        {duration}
                    </p>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-3 dark:border-gray-600">
                    <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            status === "Published"
                                ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200"
                                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200"
                        }`}
                    >
                        {status}
                    </span>

                    <button
                        onClick={() =>
                            navigate(
                                `itinerary_details/${itinerary._id}`
                            )
                        }
                        className="inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                        View Details
                        <ArrowRight
                            size={14}
                            className="ml-1 transition-transform group-hover:translate-x-1"
                        />
                    </button>
                </div>
            </div>
        </div>
    );
};


/* ===============================
   Honeymoon Itineraries List
================================ */
const ItinerariesListPage = () => {
    const navigate = useNavigate();
    const [itineraries, setItineraries] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filters, setFilters] = useState({
        type: "all",
        status: "all",
        destination: "all",
    });

    useEffect(() => {
        const fetchItineraries = async () => {
            try {
                const resp = await apiClient.get("/admin/itinerary");
                setItineraries(resp.data?.data || []);
            } catch {
                toast.error("Failed to load honeymoon itineraries.");
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
                return (
                    it.title?.toLowerCase().includes(q) ||
                    it.selected_destination?.destination_name
                        ?.toLowerCase()
                        .includes(q)
                );
            })
            .filter((it) =>
                filters.type === "all"
                    ? true
                    : it.itinerary_type === filters.type
            )
            .filter((it) =>
                filters.status === "all"
                    ? true
                    : filters.status === "published"
                    ? it.itinerary_visibility === "public"
                    : it.itinerary_visibility === "private"
            )
            .filter((it) =>
                filters.destination === "all"
                    ? true
                    : it.selected_destination?.destination_name
                            ?.toLowerCase() ===
                        filters.destination.toLowerCase()
            );
    }, [searchQuery, filters, itineraries]);

    const handleDelete = async (id) => {
        try {
            await apiClient.delete(`/admin/itinerary/${id}`);
            setItineraries((prev) =>
                prev.filter((it) => it._id !== id)
            );
            toast.success("Honeymoon itinerary deleted 💔");
        } catch {
            toast.error("Failed to delete itinerary.");
        }
    };

    const inputStyle =
        "mt-4 block w-full rounded-md border border-gray-300 p-2 bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white text-black";

    return (
        <div className="min-h-screen p-6 bg-gray-100 dark:bg-gray-900">
            <div className="mx-auto max-w-7xl">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="flex items-center text-3xl font-bold text-black dark:text-white">
                            <Heart className="mr-2 h-8 w-8 text-red-500" />
                            Honeymoon Itineraries
                        </h1>
                        <p className="text-gray-600 dark:text-gray-300">
                            Manage romantic travel experiences
                        </p>
                    </div>

                    <button
                        onClick={() => navigate("/itineraries/create")}
                        className="flex items-center rounded-lg bg-blue-600 px-5 py-2.5 text-white shadow hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
                    >
                        <Plus size={16} className="mr-1" />
                        Create New
                    </button>
                </div>

                {/* Filters */}
                <div className="mb-8 rounded-xl bg-white p-6 shadow dark:bg-gray-800">
                    <input
                        type="search"
                        placeholder="Search honeymoon trips..."
                        value={searchQuery}
                        onChange={(e) =>
                            setSearchQuery(e.target.value)
                        }
                        className="mb-4 w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white md:mb-0 md:w-1/3"
                    />

                    <div className="flex flex-wrap gap-4 mt-4">
                        <select
                            name="type"
                            value={filters.type}
                            onChange={(e) =>
                                setFilters((p) => ({
                                    ...p,
                                    type: e.target.value,
                                }))
                            }
                            className={inputStyle}
                        >
                            <option value="all">All Types</option>
                            <option value="flexible">Flexible</option>
                            <option value="fixed">Fixed</option>
                        </select>

                        <select
                            name="status"
                            value={filters.status}
                            onChange={(e) =>
                                setFilters((p) => ({
                                    ...p,
                                    status: e.target.value,
                                }))
                            }
                            className={inputStyle}
                        >
                            <option value="all">All Status</option>
                            <option value="published">Published</option>
                            <option value="private">Private</option>
                        </select>

                        <select
                            name="destination"
                            value={filters.destination}
                            onChange={(e) =>
                                setFilters((p) => ({
                                    ...p,
                                    destination: e.target.value,
                                }))
                            }
                            className={inputStyle}
                        >
                            <option value="all">All Destinations</option>
                            {Array.from(
                                new Set(
                                    itineraries.map(
                                        (it) =>
                                            it.selected_destination
                                                ?.destination_name
                                    )
                                )
                            )
                                .filter(Boolean)
                                .map((d) => (
                                    <option key={d} value={d.toLowerCase()}>
                                        {d}
                                    </option>
                                ))}
                        </select>
                    </div>
                </div>

                {/* Grid */}
                {isLoading ? (
                    <p className="text-center text-gray-600 dark:text-gray-300">
                        Loading honeymoon itineraries…
                    </p>
                ) : filteredItineraries.length === 0 ? (
                    <p className="text-center text-gray-500 dark:text-gray-400">
                        No honeymoon itineraries found 💔
                    </p>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {filteredItineraries.map((it) => (
                            <ItineraryCard
                                key={it._id}
                                itinerary={it}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ItinerariesListPage;
