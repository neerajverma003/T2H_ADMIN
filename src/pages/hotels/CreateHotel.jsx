import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiClient } from "../../stores/authStores";
import { toast } from "react-toastify";
import {
  Building2, MapPin, Star,
  Plus, Loader2, ShieldCheck,
  Info, Link,
} from "lucide-react";
import { motion } from "framer-motion";

const inputStyle = "w-full rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-4 text-base font-medium focus:ring-2 focus:ring-indigo-500/20 focus:outline-none text-slate-900 dark:text-white transition-all placeholder:text-slate-400 disabled:opacity-100 disabled:cursor-default";
const labelStyle = "flex items-center gap-2 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.18em] mb-2 ml-1";
const cardStyle = "bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none";

const StarRating = ({ value, onChange }) => (
  <div className="flex gap-2 mt-1">
    {[1, 2, 3, 4, 5].map((s) => (
      <button
        key={s} type="button"
        onClick={() => onChange(s)}
        className={`text-2xl transition-transform hover:scale-110 ${s <= value ? "text-amber-400" : "text-slate-200 dark:text-slate-700"}`}
      >★</button>
    ))}
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
  const [customCity, setCustomCity] = useState(false);
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
  }, [form.category]);

  useEffect(() => {
    if (form.destination) {
      fetchCities(form.destination);
    } else {
      setCities([]);
    }
  }, [form.destination]);

  const fetchDestinations = async (category = "domestic") => {
    try {
      const res = await apiClient.get(`/admin/destination/${category}`);
      setDestinations(res.data.places || []);
    } catch (e) { console.error(e); }
  };

  const fetchCities = async (destinationId) => {
    setCitiesLoading(true);
    setCities([]);
    try {
      const res = await apiClient.get(`/admin/state/${destinationId}`);
      const fetched = res.data.citiesData || [];
      setCities(fetched);
      setCustomCity(fetched.length === 0);
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
        destination: h.destination || "",
        category: h.category || "domestic",
        hotel_tier: h.hotel_tier || "Standard",
        city_name: h.city_name || "",
        star_rating: h.star_rating || 3,
        hotel_website_link: h.hotel_website_link || "",
      });
    } catch (e) {
      console.error(e);
      if (e.response?.status === 401) navigate("/login");
    } finally { setPageLoading(false); }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name: form.name,
        destination: form.destination,
        category: form.category,
        hotel_tier: form.hotel_tier,
        city_name: form.city_name,
        star_rating: Number(form.star_rating),
        hotel_website_link: form.hotel_website_link,
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
    } finally { setLoading(false); }
  };

  if (pageLoading) return (
    <div className="flex flex-col items-center justify-center py-40 gap-6">
      <Loader2 className="animate-spin text-indigo-600" size={56} strokeWidth={1.5} />
      <p className="text-xs font-black uppercase tracking-[0.4em] text-slate-400">Loading Hotel Data...</p>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-full mx-auto space-y-6 pb-24">
      {/* HEADER */}
      <div className={cardStyle}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              <Building2 className="text-indigo-600" size={28} />
              {isEdit ? "Edit Hotel" : "Create Hotel"}
            </h1>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => navigate("/hotels/list")}
              className="px-6 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black text-sm hover:bg-slate-200 transition-all">
              ← Back
            </button>
            <button type="button" onClick={handleSubmit} disabled={loading}
              className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 transition-all disabled:opacity-50">
              {loading ? <Loader2 className="animate-spin" size={18} /> : (isEdit ? <ShieldCheck size={18} /> : <Plus size={18} />)}
              {loading ? "Saving..." : isEdit ? "Update Hotel" : "Create Hotel"}
            </button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* HOTEL IDENTIFICATION */}
        <div className={cardStyle}>
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-500/30"><Info size={20} /></div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Hotel Asset Identification</h2>
          </div>

          {/* Hotel Type */}
          <div className="mb-6">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Linked Destination</p>
            <div className="flex gap-6">
              {["domestic", "international"].map((cat) => (
                <label key={cat} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="category" value={cat} checked={form.category === cat} onChange={handleChange}
                    className="w-4 h-4 accent-indigo-600" />
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 capitalize">{cat}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Destination */}
            <div>
              <label className={labelStyle}>Select Destination</label>
              <select name="destination" value={form.destination} onChange={handleChange} className={inputStyle} required>
                <option value="">— Select a Destination —</option>
                {destinations.map((d) => (
                  <option key={d._id} value={d._id}>{d.destination_name}</option>
                ))}
              </select>
            </div>

            {/* City with CUSTOM? toggle */}
            <div>
              <div className="flex items-center justify-between mb-2 ml-1">
                <label className={`${labelStyle} mb-0`}>City</label>
                <button
                  type="button"
                  onClick={() => { setCustomCity((p) => !p); setForm((pr) => ({ ...pr, city_name: "" })); }}
                  className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-indigo-500 hover:text-indigo-700 transition-colors"
                >
                  <MapPin size={11} /> {customCity ? "Use List" : "Custom?"}
                </button>
              </div>
              {customCity ? (
                <div className="relative">
                  <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    name="city_name" value={form.city_name} onChange={handleChange}
                    className={`${inputStyle} pl-10`} placeholder="Type city name..." required
                  />
                </div>
              ) : (
                <div className="relative">
                  <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10" />
                  <select
                    name="city_name" value={form.city_name} onChange={handleChange}
                    className={`${inputStyle} pl-10`}
                    disabled={!form.destination || citiesLoading}
                  >
                    <option value="">{citiesLoading ? "Loading..." : "Select City"}</option>
                    {cities.map((c) => (
                      <option key={c._id} value={c.city_name}>{c.city_name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Hotel Tier */}
          <div className="mb-6">
            <label className={labelStyle}>Hotel Category</label>
            <div className="flex flex-wrap gap-3">
              {["Standard", "Deluxe", "Super Deluxe", "Luxury"].map((tier) => (
                <button key={tier} type="button" onClick={() => setForm((p) => ({ ...p, hotel_tier: tier }))}
                  className={`px-5 py-2.5 rounded-xl font-black text-sm transition-all ${form.hotel_tier === tier ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"}`}>
                  {tier}
                </button>
              ))}
            </div>
          </div>

          {/* Star Rating */}
          <div className="mb-6">
            <label className={labelStyle}><Star size={14} className="text-amber-400" /> Official Star Rating</label>
            <StarRating value={form.star_rating} onChange={(v) => setForm((p) => ({ ...p, star_rating: v }))} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelStyle}>Hotel Name</label>
              <input name="name" value={form.name} onChange={handleChange} className={inputStyle} placeholder="e.g. Grand Plaza Hotel" required />
            </div>
            <div>
              <label className={labelStyle}><Link size={14} className="text-indigo-500" /> Hotel Website Link</label>
              <input name="hotel_website_link" value={form.hotel_website_link} onChange={handleChange} className={inputStyle} placeholder="https://www.hotelwebsite.com" />
            </div>
          </div>
        </div>

        {/* SUBMIT */}
        <div className="flex justify-end pt-4">
          <button type="submit" disabled={loading}
            className="group flex items-center gap-3 bg-indigo-600 text-white px-12 py-5 rounded-[1.5rem] font-black text-lg shadow-2xl shadow-indigo-500/40 hover:bg-indigo-700 transition-all disabled:opacity-50">
            {loading ? <Loader2 className="animate-spin" size={24} /> : (isEdit ? <ShieldCheck size={24} /> : <Plus size={24} />)}
            {loading ? "Saving..." : isEdit ? "Update Hotel" : "Create Hotel"}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default CreateHotel;
