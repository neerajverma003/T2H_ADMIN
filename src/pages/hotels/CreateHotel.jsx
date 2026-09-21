import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiClient } from "../../stores/authStores";
import { toast } from "react-toastify";
import {
  Building2,
  MapPin,
  Star,
  Plus,
  Loader2,
  ShieldCheck,
  Info,
  Link as LinkIcon,
  ArrowLeft,
  Globe,
  Compass,
  Sparkles,
  ChevronDown,
  ExternalLink
} from "lucide-react";
import { motion } from "framer-motion";

const cardStyle = "bg-white dark:bg-[#091126]/95 rounded-3xl p-6 md:p-8 border border-slate-200/90 dark:border-indigo-500/25 shadow-xl dark:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.7),0_0_30px_2px_rgba(99,102,241,0.18)] ring-1 ring-slate-900/5 dark:ring-white/5 backdrop-blur-xl space-y-6 transition-all";
const inputStyle = "w-full rounded-2xl border border-slate-200 dark:border-slate-800/90 bg-slate-50/90 dark:bg-[#050A17] p-3.5 text-sm font-semibold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-[#050A17] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 placeholder:font-normal shadow-inner hover:border-indigo-500/40 disabled:opacity-60 disabled:cursor-not-allowed";
const selectStyle = "w-full rounded-2xl border border-slate-200 dark:border-slate-800/90 bg-slate-50/90 dark:bg-[#050A17] p-3.5 pr-10 text-sm font-semibold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-[#050A17] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 outline-none transition-all appearance-none cursor-pointer shadow-inner hover:border-indigo-500/40 disabled:opacity-60 disabled:cursor-not-allowed";
const labelStyle = "flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2 ml-0.5";

const StarRating = ({ value, onChange }) => (
  <div className="flex items-center gap-2 p-3 rounded-2xl bg-slate-50/90 dark:bg-[#050A17] border border-slate-200 dark:border-slate-800/90 w-fit shadow-inner">
    {[1, 2, 3, 4, 5].map((s) => (
      <button
        key={s}
        type="button"
        onClick={() => onChange(s)}
        className={`p-1 rounded-xl transition-all cursor-pointer ${
          s <= value
            ? "text-amber-400 hover:scale-110 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]"
            : "text-slate-300 dark:text-slate-700 hover:text-slate-400"
        }`}
        title={`${s} Star${s > 1 ? "s" : ""}`}
      >
        <Star size={20} className={s <= value ? "fill-amber-400" : ""} />
      </button>
    ))}
    <span className="ml-2 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20">
      {value} Star{value > 1 ? "s" : ""}
    </span>
  </div>
);

const CreateHotel = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(isEdit);
  const [destinations, setDestinations] = useState([]);
  const [cities, setCities] = useState([]);
  const [citiesLoading, setCitiesLoading] = useState(false);
  const [customCity, setCustomCity] = useState(true);
  const isFirstRender = useRef(true);

  const [form, setForm] = useState({
    name: "",
    destination: "",
    category: "domestic",
    hotel_tier: "Standard",
    city_name: "",
    star_rating: 3,
    hotel_website_link: "",
  });

  useEffect(() => {
    if (isEdit) fetchHotel();
  }, [id]);

  useEffect(() => {
    fetchDestinations(form.category);
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setForm((p) => ({ ...p, destination: "", city_name: "" }));
    setCities([]);
    setCustomCity(true);
  }, [form.category]);

  useEffect(() => {
    if (form.destination) {
      fetchCities(form.destination);
    } else {
      setCities([]);
      setCustomCity(true);
    }
  }, [form.destination]);

  const fetchDestinations = async (category = "domestic") => {
    try {
      const res = await apiClient.get(`/admin/destination/${category}`);
      setDestinations(res.data.places || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchCities = async (destinationId) => {
    setCitiesLoading(true);
    setCities([]);
    try {
      const res = await apiClient.get(`/admin/state/${destinationId}`);
      const fetched = res.data?.citiesData || [];
      setCities(fetched);
      // If destination has preset cities, allow choosing from list, else default to custom text
      if (fetched.length > 0) {
        setCustomCity(false);
      } else {
        setCustomCity(true);
      }
    } catch (e) {
      console.error("fetchCities error:", e);
      setCustomCity(true);
    } finally {
      setCitiesLoading(false);
    }
  };

  const fetchHotel = async () => {
    try {
      const res = await apiClient.get(`/admin/hotel/${id}`);
      const h = res.data.data || res.data;
      setForm({
        name: h.name || "",
        destination: h.destination?._id || h.destination || "",
        category: h.category || "domestic",
        hotel_tier: h.hotel_tier || "Standard",
        city_name: h.city_name || "",
        star_rating: h.star_rating || 3,
        hotel_website_link: h.hotel_website_link || "",
      });
      setCustomCity(true);
    } catch (e) {
      console.error(e);
      if (e.response?.status === 401) navigate("/login");
    } finally {
      setPageLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Please enter a hotel name.");
      return;
    }
    if (!form.destination) {
      toast.error("Please select a destination.");
      return;
    }
    if (!form.city_name.trim()) {
      toast.error("Please enter or select a city.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        destination: form.destination,
        category: form.category,
        hotel_tier: form.hotel_tier,
        city_name: form.city_name.trim(),
        star_rating: Number(form.star_rating),
        hotel_website_link: form.hotel_website_link.trim(),
      };

      if (isEdit) {
        await apiClient.patch(`/admin/hotel/${id}`, payload);
        toast.success("Hotel updated successfully!");
      } else {
        await apiClient.post("/admin/hotel/create", payload);
        toast.success("Hotel created successfully!");
      }
      navigate("/hotels/list");
    } catch (err) {
      console.error("[CreateHotel] Submit error:", err?.response?.data || err);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.msg ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to save hotel";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-6">
        <div className="size-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shadow-lg shadow-blue-500/10">
          <Loader2 className="animate-spin text-blue-500" size={36} strokeWidth={2} />
        </div>
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400">
          Loading Hotel Details...
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8 pb-20 font-sans"
    >
      {/* 1. TOP HEADER HUB */}
      <div className="bg-white dark:bg-[#091126]/95 rounded-3xl py-4 sm:py-5 px-6 sm:px-8 border border-slate-200/90 dark:border-indigo-500/25 shadow-xl dark:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.7),0_0_30px_2px_rgba(99,102,241,0.18)] ring-1 ring-slate-900/5 dark:ring-white/5 backdrop-blur-xl relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-blue-500/10 dark:bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-indigo-500/10 dark:bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <button
              type="button"
              onClick={() => navigate("/hotels/list")}
              className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white uppercase tracking-wider transition-colors mb-2.5 group cursor-pointer"
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
              Back to Hotels
            </button>
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-500/30 shrink-0">
                <Building2 size={22} />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2 flex-wrap">
                  {isEdit ? (
                    <>Edit <span className="text-blue-500">Hotel</span></>
                  ) : (
                    <>New <span className="text-blue-500">Hotel</span></>
                  )}
                </h1>
                <p className="text-slate-500 dark:text-slate-400 font-semibold mt-0.5 text-xs sm:text-sm">
                  Configure luxury hotel properties, linked destinations, and hospitality tiers.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/hotels/list")}
              className="px-6 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#050A17] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold text-xs uppercase tracking-wider hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all cursor-pointer shadow-sm"
            >
              Cancel & Return
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-xs shadow-xl shadow-blue-600/30 uppercase tracking-wider transition-all cursor-pointer active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  Saving...
                </>
              ) : isEdit ? (
                <>
                  <ShieldCheck size={16} />
                  Update Hotel
                </>
              ) : (
                <>
                  <Plus size={16} strokeWidth={2.5} />
                  Create Hotel
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 2. HOTEL ASSET IDENTIFICATION CARD */}
        <div className={cardStyle}>
          {/* Card Section Header */}
          <div className="flex items-center gap-3.5 pb-5 border-b border-slate-100 dark:border-slate-800/80">
            <div className="size-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 shrink-0">
              <Building2 size={20} />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                Hotel Asset Identification
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                Specify destination tier, geographic scope, and property credentials
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Linked Destination Scope (Pill Tabs) */}
            <div>
              <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2.5 ml-0.5">
                Linked Destination Scope
              </p>
              <div className="flex items-center gap-3">
                {[
                  { id: "domestic", label: "Domestic", icon: Compass },
                  { id: "international", label: "International", icon: Globe },
                ].map(({ id: catId, label, icon: Icon }) => {
                  const isSelected = form.category === catId;
                  return (
                    <button
                      key={catId}
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, category: catId }))}
                      className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                        isSelected
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 ring-2 ring-blue-500/40"
                          : "bg-slate-50 dark:bg-[#050A17] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 shadow-inner"
                      }`}
                    >
                      <Icon size={14} /> {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Destination & City Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Select Destination */}
              <div>
                <label className={labelStyle}>
                  <MapPin size={13} className="text-indigo-400" /> Select Destination *
                </label>
                <div className="relative">
                  <select
                    name="destination"
                    value={form.destination}
                    onChange={handleChange}
                    className={selectStyle}
                    required
                  >
                    <option value="" className="bg-white dark:bg-[#050A17] text-slate-900 dark:text-white">
                      — Select a Destination —
                    </option>
                    {destinations.map((d) => (
                      <option
                        key={d._id}
                        value={d._id}
                        className="bg-white dark:bg-[#050A17] text-slate-900 dark:text-white"
                      >
                        {d.destination_name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={15}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  />
                </div>
              </div>

              {/* City (Hybrid Input + Preset List Toggle) */}
              <div>
                <div className="flex items-center justify-between mb-2 ml-0.5">
                  <label className={`${labelStyle} mb-0`}>
                    <MapPin size={13} className="text-indigo-400" /> City / Region *
                  </label>
                  {cities.length > 0 && (
                    <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setCustomCity(false)}
                        className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                          !customCity
                            ? "bg-blue-600 text-white shadow-sm"
                            : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                        }`}
                      >
                        List ({cities.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setCustomCity(true)}
                        className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                          customCity
                            ? "bg-blue-600 text-white shadow-sm"
                            : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                        }`}
                      >
                        Custom City
                      </button>
                    </div>
                  )}
                </div>

                {cities.length > 0 && !customCity ? (
                  <div className="relative">
                    <select
                      name="city_name"
                      value={form.city_name}
                      onChange={handleChange}
                      className={selectStyle}
                      required
                    >
                      <option value="" className="bg-white dark:bg-[#050A17] text-slate-900 dark:text-white">
                        {citiesLoading ? "Loading cities..." : "— Select Destination City —"}
                      </option>
                      {cities.map((c) => (
                        <option
                          key={c._id}
                          value={c.city_name}
                          className="bg-white dark:bg-[#050A17] text-slate-900 dark:text-white"
                        >
                          {c.city_name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={15}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="relative">
                      <input
                        name="city_name"
                        value={form.city_name}
                        onChange={handleChange}
                        className={inputStyle}
                        placeholder={
                          form.destination
                            ? "Type city name (e.g. Bangkok, Munnar, Ubud...)"
                            : "Type city name..."
                        }
                        required
                      />
                    </div>
                    {cities.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Preset Cities:
                        </span>
                        {cities.map((c) => (
                          <button
                            key={c._id}
                            type="button"
                            onClick={() => setForm((p) => ({ ...p, city_name: c.city_name }))}
                            className={`text-xs px-2.5 py-1 rounded-lg border font-semibold transition-all cursor-pointer ${
                              form.city_name?.toLowerCase() === c.city_name?.toLowerCase()
                                ? "bg-blue-600 text-white border-blue-500 shadow-sm"
                                : "bg-slate-50 dark:bg-[#050A17] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-blue-400"
                            }`}
                          >
                            {c.city_name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Hotel Category / Tier Cards */}
            <div>
              <label className={labelStyle}>
                <Sparkles size={13} className="text-indigo-400" /> Hotel Category
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                {[
                  { id: "Standard", label: "Standard", desc: "Essential comfort & value" },
                  { id: "Deluxe", label: "Deluxe", desc: "Upgraded suites & style" },
                  { id: "Super Deluxe", label: "Super Deluxe", desc: "Premium romantic luxury" },
                  { id: "Luxury", label: "Luxury", desc: "5-Star signature luxury" },
                ].map((tier) => {
                  const isSelected = form.hotel_tier === tier.id;
                  return (
                    <button
                      key={tier.id}
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, hotel_tier: tier.id }))}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative ${
                        isSelected
                          ? "bg-blue-50/80 dark:bg-blue-600/15 border-blue-500 text-slate-900 dark:text-white shadow-lg shadow-blue-500/10 ring-2 ring-blue-500/30"
                          : "bg-slate-50 dark:bg-[#050A17] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800/40 shadow-inner"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white">
                          {tier.label}
                        </span>
                        {isSelected && (
                          <span className="size-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)] animate-pulse" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                        {tier.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Star Rating */}
            <div>
              <label className={labelStyle}>
                <Star size={13} className="text-amber-400" /> Official Star Rating
              </label>
              <StarRating
                value={form.star_rating}
                onChange={(v) => setForm((p) => ({ ...p, star_rating: v }))}
              />
            </div>

            {/* Hotel Name & Website */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelStyle}>
                  <Building2 size={13} className="text-indigo-400" /> Hotel Name *
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className={inputStyle}
                  placeholder="e.g. Grand Plaza Resort & Spa"
                  required
                />
              </div>

              <div>
                <label className={labelStyle}>
                  <LinkIcon size={13} className="text-indigo-400" /> Hotel Website Link
                </label>
                <div className="relative">
                  <input
                    type="url"
                    name="hotel_website_link"
                    value={form.hotel_website_link}
                    onChange={handleChange}
                    className={`${inputStyle} pr-11`}
                    placeholder="https://www.hotelwebsite.com"
                  />
                  {form.hotel_website_link && (
                    <a
                      href={form.hotel_website_link.startsWith("http") ? form.hotel_website_link : `https://${form.hotel_website_link}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500 transition-colors p-1"
                      title="Open external website"
                    >
                      <ExternalLink size={15} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. BOTTOM ACTION BAR */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-slate-800/80">
          <button
            type="button"
            onClick={() => navigate("/hotels/list")}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#050A17] hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm"
          >
            Cancel & Return
          </button>

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-9 py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:opacity-95 text-white rounded-2xl font-bold text-xs shadow-xl shadow-blue-600/30 uppercase tracking-wider transition-all flex items-center justify-center gap-2.5 cursor-pointer active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                Saving Hotel...
              </>
            ) : isEdit ? (
              <>
                <ShieldCheck size={16} />
                Update Hotel
              </>
            ) : (
              <>
                <Plus size={16} strokeWidth={2.5} />
                Create Hotel
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default CreateHotel;
