import React, { useState, useEffect } from "react";
import {
  PhoneCall,
  Save,
  Trash2,
  ArrowUp,
  ArrowDown,
  Plus,
  Eye,
  Loader2,
  Sparkles,
  MapPin,
  Phone,
  Mail,
  Clock,
  ExternalLink,
  RotateCcw
} from "lucide-react";
import { apiClient } from "../../stores/authStores";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

const DEFAULT_CARDS = [
  {
    key: "address",
    title: "Registered Office Address",
    lines: [
      "34, Sewak Park (1st floor),",
      "Dwarka More Metro, Near Metro Pillar No-772,",
      "New Delhi - 110059"
    ]
  },
  {
    key: "sales_office",
    title: "Sales Office Address",
    lines: [
      "Metro Pillar No. 773, 2nd Floor, Plot No. 18,",
      "Sewak Park, Dwarka Mor,",
      "New Delhi, Delhi 110059 (Bhartiya aviation building)"
    ]
  },
  {
    key: "phone",
    title: "Phone Number",
    lines: ["+91 11 4061 2834", "+91 85859 31901"]
  },
  {
    key: "email",
    title: "Email Address",
    lines: ["trip2honeymoon@gmail.com", "support@triptohoneymoon.in"]
  },
  {
    key: "hours",
    title: "Working Hours",
    lines: ["Mon – Sat: 9:30 AM – 6:30 PM", "Sunday: Closed"]
  }
];

const ContactUsManagement = () => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState("cards"); // 'cards' (Admire style) or 'website' (Front style)

  // Fetch cards on mount
  const fetchCards = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/admin/contact-settings");
      if (res?.data?.success && res.data.data?.cards?.length > 0) {
        setCards(res.data.data.cards);
      } else {
        setCards(DEFAULT_CARDS);
      }
    } catch (err) {
      console.error("Error fetching contact settings:", err);
      toast.error("Failed to load contact cards. Loaded defaults.");
      setCards(DEFAULT_CARDS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  // Update a specific card
  const handleUpdateCard = (index, field, value) => {
    setCards((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  // Update card details from multiline textarea
  const handleDetailsChange = (index, text) => {
    const lines = text.split("\n");
    handleUpdateCard(index, "lines", lines);
  };

  // Add a new card
  const handleAddCard = () => {
    const newIndex = cards.length + 1;
    const newCard = {
      key: `card_${Date.now()}`,
      title: `Card #${newIndex} Title`,
      lines: ["Enter details line 1", "Enter details line 2"]
    };
    setCards((prev) => [...prev, newCard]);
  };

  // Delete a card
  const handleDeleteCard = (index) => {
    if (cards.length <= 1) {
      toast.warning("You must have at least one contact card.");
      return;
    }
    const cardTitle = cards[index]?.title || `Card #${index + 1}`;
    if (window.confirm(`Are you sure you want to delete "${cardTitle}"?`)) {
      setCards((prev) => prev.filter((_, i) => i !== index));
      toast.info(`Deleted ${cardTitle}`);
    }
  };

  // Move card up
  const handleMoveUp = (index) => {
    if (index === 0) return;
    setCards((prev) => {
      const next = [...prev];
      const temp = next[index - 1];
      next[index - 1] = next[index];
      next[index] = temp;
      return next;
    });
  };

  // Move card down
  const handleMoveDown = (index) => {
    if (index === cards.length - 1) return;
    setCards((prev) => {
      const next = [...prev];
      const temp = next[index + 1];
      next[index + 1] = next[index];
      next[index] = temp;
      return next;
    });
  };

  // Save all cards to server
  const handleSave = async () => {
    try {
      setSaving(true);
      // Validate
      const cleaned = cards.map((c, idx) => ({
        key: c.key || `card_${idx + 1}`,
        title: (c.title || "").trim() || `Card #${idx + 1}`,
        lines: (c.lines || []).map((l) => String(l).trim()).filter(Boolean)
      }));

      const res = await apiClient.put("/admin/contact-settings", { cards: cleaned });
      if (res?.data?.success) {
        toast.success("Contact cards successfully updated! 🎉");
        if (res.data.data?.cards) {
          setCards(res.data.data.cards);
        }
      } else {
        toast.error(res?.data?.message || "Failed to update contact cards.");
      }
    } catch (err) {
      console.error("Error saving contact cards:", err);
      toast.error("Failed to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Helper for card icons based on title/key
  const getCardIcon = (card) => {
    const t = (card.title + " " + (card.key || "")).toLowerCase();
    if (t.includes("address") || t.includes("office") || t.includes("location")) {
      return MapPin;
    }
    if (t.includes("phone") || t.includes("call") || t.includes("mobile")) {
      return Phone;
    }
    if (t.includes("email") || t.includes("mail")) {
      return Mail;
    }
    if (t.includes("hour") || t.includes("timing") || t.includes("time")) {
      return Clock;
    }
    return PhoneCall;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="relative">
          <div className="w-14 h-14 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin" />
          <PhoneCall className="absolute inset-0 m-auto text-blue-500 animate-pulse" size={22} />
        </div>
        <p className="mt-4 text-xs font-bold tracking-widest text-slate-400 uppercase">
          Loading Contact Settings...
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6 pb-20 font-sans min-h-screen text-slate-900 dark:text-slate-100 text-left"
    >
      {/* ── HEADER BAR ── */}
      <div className="bg-white dark:bg-[#091126] rounded-3xl py-4 sm:py-5 px-6 sm:px-8 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0">
            <PhoneCall className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-500 dark:text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full">
                Content Management
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Contact Us Management
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Customize dynamic contact cards, offices, phone numbers, and live preview
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <button
            onClick={() => setCards(DEFAULT_CARDS)}
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer"
            title="Reset to default cards"
          >
            <RotateCcw size={14} />
            <span>Reset Defaults</span>
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            type="button"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold shadow-md shadow-blue-600/30 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer disabled:opacity-50"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            <span>{saving ? "Saving..." : "Save Changes"}</span>
          </button>
        </div>
      </div>

      {/* ── TWO COLUMN LAYOUT: FORM (LEFT) & LIVE PREVIEW (RIGHT) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ── LEFT COLUMN: CARDS EDITOR (7 COLS) ── */}
        <div className="lg:col-span-7 space-y-4">
          <AnimatePresence>
            {cards.map((card, idx) => {
              const Icon = getCardIcon(card);
              return (
                <motion.div
                  key={card.key || idx}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white dark:bg-[#070d1e] rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800/90 shadow-sm space-y-4 relative group"
                >
                  {/* Card Header matching Screenshot 2 */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/60">
                    <div className="flex items-center gap-3">
                      <div className="size-7 rounded-lg bg-blue-600 text-white text-xs font-extrabold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </div>
                      <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wide text-slate-800 dark:text-slate-200">
                        CARD #{idx + 1}: {card.title || "UNTITLED CARD"}
                      </span>
                    </div>

                    {/* Action Controls: Up, Down, Delete */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleMoveUp(idx)}
                        disabled={idx === 0}
                        title="Move Up"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors"
                      >
                        <ArrowUp size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveDown(idx)}
                        disabled={idx === cards.length - 1}
                        title="Move Down"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors"
                      >
                        <ArrowDown size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteCard(idx)}
                        title="Delete Card"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 cursor-pointer transition-colors ml-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Card Title Input */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                      Card Title
                    </label>
                    <input
                      type="text"
                      value={card.title || ""}
                      onChange={(e) => handleUpdateCard(idx, "title", e.target.value)}
                      placeholder="e.g. Sales Office Address"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#040814] px-4 py-3 text-slate-900 dark:text-white font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-500 text-sm"
                    />
                  </div>

                  {/* Card Details Textarea */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                      Card Details (Enter each line on a new row)
                    </label>
                    <textarea
                      rows={3}
                      value={(card.lines || []).join("\n")}
                      onChange={(e) => handleDetailsChange(idx, e.target.value)}
                      placeholder="Line 1&#10;Line 2&#10;Line 3"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#040814] px-4 py-3 text-slate-900 dark:text-white font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-500 text-sm leading-relaxed"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      Tip: Hit Enter to create a new row. Each row will be displayed as a clean line on the card.
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Add New Card Button */}
          <button
            type="button"
            onClick={handleAddCard}
            className="w-full py-4 rounded-2xl border-2 border-dashed border-blue-400/40 dark:border-blue-500/30 hover:border-blue-500 bg-blue-50/50 dark:bg-blue-600/5 hover:bg-blue-50 dark:hover:bg-blue-600/10 text-blue-600 dark:text-blue-400 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer group shadow-xs"
          >
            <Plus size={18} className="group-hover:scale-125 transition-transform" />
            <span>Add New Contact Card</span>
          </button>
        </div>

        {/* ── RIGHT COLUMN: LIVE WEBSITE PREVIEW (5 COLS - STICKY) ── */}
        <div className="lg:col-span-5 sticky top-24 space-y-4">
          <div className="bg-white dark:bg-[#070d1e] rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800/90 shadow-md space-y-5">
            {/* Header matching Screenshot 2 */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/60">
              <div className="flex items-center gap-2.5">
                <div className="size-7 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                  <Eye size={15} />
                </div>
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Live Website Preview
                </span>
              </div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                REAL-TIME
              </span>
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-[#03060f] p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold">
              <button
                type="button"
                onClick={() => setPreviewMode("cards")}
                className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                  previewMode === "cards"
                    ? "bg-white dark:bg-blue-600 text-blue-600 dark:text-white shadow-xs"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Dashboard View
              </button>
              <button
                type="button"
                onClick={() => setPreviewMode("website")}
                className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                  previewMode === "website"
                    ? "bg-white dark:bg-blue-600 text-blue-600 dark:text-white shadow-xs"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Website Card View
              </button>
            </div>

            {/* Title & Subtitle */}
            <div className="text-center pt-1">
              <h3 className="text-sm font-extrabold tracking-wide uppercase text-slate-900 dark:text-white">
                Contact Cards Preview
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Real-time preview of contact information cards on the website
              </p>
            </div>

            {/* PREVIEW MODE 1: ADMIRE DASHBOARD STYLE (Exactly as Screenshot 2) */}
            {previewMode === "cards" && (
              <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
                {cards.map((card, idx) => (
                  <div
                    key={card.key || idx}
                    className="flex items-start gap-3.5 p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-[#0c1429] border border-slate-200 dark:border-slate-800/80 transition-all hover:border-blue-500/40"
                  >
                    <div className="size-7 rounded-xl bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <div className="min-w-0 flex-1 text-left">
                      <h4 className="text-xs font-extrabold uppercase tracking-wide text-slate-900 dark:text-white truncate">
                        {card.title || "UNTITLED CARD"}
                      </h4>
                      <div className="mt-1 space-y-0.5 text-[11px] text-slate-600 dark:text-slate-300">
                        {(card.lines || []).filter(Boolean).map((line, lIdx) => (
                          <p key={lIdx} className="leading-snug break-words">
                            {line}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* PREVIEW MODE 2: WEBSITE LIVE CARDS (As in Screenshot 1) */}
            {previewMode === "website" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[580px] overflow-y-auto pr-1">
                {cards.map((card, idx) => {
                  const Icon = getCardIcon(card);
                  return (
                    <div
                      key={card.key || idx}
                      className="bg-white rounded-2xl p-4 text-center border border-slate-200 shadow-sm flex flex-col items-center justify-between text-slate-800"
                    >
                      <div className="size-10 rounded-xl bg-gradient-to-br from-rose-50 to-blue-50 border border-blue-100 text-[#0F3AB2] flex items-center justify-center mb-2.5">
                        <Icon size={16} />
                      </div>
                      <h4 className="text-xs font-bold bg-gradient-to-r from-[#E31A22] to-[#0F3AB2] bg-clip-text text-transparent mb-1.5 line-clamp-1">
                        {card.title}
                      </h4>
                      <div className="space-y-0.5 text-[10px] text-slate-600 mb-3 min-h-[32px]">
                        {(card.lines || []).filter(Boolean).map((line, lIdx) => (
                          <p key={lIdx} className="line-clamp-2">
                            {line}
                          </p>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ContactUsManagement;
