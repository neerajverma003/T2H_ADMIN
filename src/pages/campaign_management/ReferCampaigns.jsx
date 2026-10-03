import { useState, useEffect } from "react";
import { 
  Send, Plus, Trash2, Eye, RefreshCw, CheckCircle2, Clock, 
  AlertCircle, History, User, Mail, Sparkles, Check, ArrowLeft,
  Users, ChevronRight, X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { useCampaignStore } from "../../stores/campaignStore";
import ConfirmationModal from "../../newComponents/ConfirmationModel";

const ReferCampaigns = () => {
  const {
    referCampaigns,
    referTemplates,
    isLoadingReferCampaign,
    isSendingReferCampaign,
    fetchReferCampaigns,
    fetchReferTemplates,
    createReferCampaign,
    sendReferCampaign,
    deleteReferCampaign,
    getReferRecipients,
  } = useCampaignStore();

  // "history" (table) or "create" (form)
  const [view, setView] = useState("history");
  const [activeTab, setActiveTab] = useState("all");
  const [recipientTab, setRecipientTab] = useState("registered"); // "registered" or "custom"
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [selectedDetailsCampaign, setSelectedDetailsCampaign] = useState(null);

  // Active tracking campaign
  const [activeTrackingCampaign, setActiveTrackingCampaign] = useState(null);

  // Form State
  const [registeredRecipients, setRegisteredRecipients] = useState([]);
  const [selectedRecipients, setSelectedRecipients] = useState([]);
  const [customEmails, setCustomEmails] = useState([]);
  const [customEmailInput, setCustomEmailInput] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    templateId: "",
  });

  useEffect(() => {
    fetchReferCampaigns();
    fetchReferTemplates();
    loadRecipients();
  }, [fetchReferCampaigns, fetchReferTemplates]);

  // Polling for live status updates if a campaign is processing
  useEffect(() => {
    const hasProcessing = referCampaigns.some((c) => c.status === "Processing");
    let interval;
    if (hasProcessing || activeTrackingCampaign?.status === "Processing") {
      interval = setInterval(() => {
        fetchReferCampaigns();
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [referCampaigns, activeTrackingCampaign, fetchReferCampaigns]);

  // Keep active tracking campaign updated
  useEffect(() => {
    if (activeTrackingCampaign?._id) {
      const updated = referCampaigns.find((c) => c._id === activeTrackingCampaign._id);
      if (updated) {
        setActiveTrackingCampaign(updated);
      }
    }
  }, [referCampaigns, activeTrackingCampaign?._id]);

  const loadRecipients = async () => {
    const users = await getReferRecipients();
    setRegisteredRecipients(users || []);
  };

  const selectedTemplate = referTemplates.find((t) => t._id === formData.templateId);

  // Toggle single registered recipient
  const toggleRecipient = (email) => {
    if (selectedRecipients.includes(email)) {
      setSelectedRecipients((prev) => prev.filter((e) => e !== email));
    } else {
      setSelectedRecipients((prev) => [...prev, email]);
    }
  };

  // Select all or deselect all
  const handleSelectAll = () => {
    if (selectedRecipients.length === registeredRecipients.length) {
      setSelectedRecipients([]);
    } else {
      setSelectedRecipients([...registeredRecipients]);
    }
  };

  // Add custom email
  const handleAddCustomEmail = (e) => {
    e.preventDefault();
    const email = customEmailInput.trim().toLowerCase();
    if (!email) return;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    if (customEmails.includes(email)) {
      toast.info("This email is already in the recipient list.");
      return;
    }
    setCustomEmails((prev) => [...prev, email]);
    setCustomEmailInput("");
  };

  const removeCustomEmail = (email) => {
    setCustomEmails((prev) => prev.filter((e) => e !== email));
  };

  // Total selected recipients count
  const totalCount = selectedRecipients.length + customEmails.length;

  // Handle Create & Launch Campaign
  const handleLaunch = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error("Please enter a campaign title.");
      return;
    }
    if (!formData.templateId) {
      toast.error("Please select a saved User Refer Template.");
      return;
    }
    if (totalCount === 0) {
      toast.error("Please select at least one recipient email.");
      return;
    }

    const newCampaign = await createReferCampaign({
      title: formData.title,
      templateId: formData.templateId,
      recipients: selectedRecipients,
      customRecipients: customEmails,
    });

    if (newCampaign?._id) {
      setActiveTrackingCampaign(newCampaign);
      // Dispatch immediately
      await sendReferCampaign(newCampaign._id);
      // Reset form
      setFormData({ title: "", templateId: "" });
      setSelectedRecipients([]);
      setCustomEmails([]);
    }
  };

  return (
    <div className="min-h-screen bg-[#070B14] text-slate-100 p-4 sm:p-6 lg:p-8 space-y-8">
      {/* ─── Top Header ─────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <span className="text-[11px] font-bold text-blue-400 uppercase tracking-widest block">
            CREATE, DISPATCH AND TRACK USER REFER CAMPAIGNS
          </span>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
            Refer <span className="text-blue-500">Campaigns</span>
          </h1>
        </div>

        {/* View Switcher Button */}
        <div>
          {view === "history" ? (
            <button
              onClick={() => {
                setView("create");
                if (referTemplates.length > 0 && !formData.templateId) {
                  setFormData((prev) => ({ ...prev, templateId: referTemplates[0]._id }));
                }
              }}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs sm:text-sm transition-all shadow-md shadow-blue-600/25"
            >
              <Plus className="w-4 h-4" />
              + USER CAMPAIGN
            </button>
          ) : (
            <button
              onClick={() => setView("history")}
              className="flex items-center gap-2 bg-[#121A2E] hover:bg-[#18233C] text-slate-300 border border-slate-700/80 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all"
            >
              <History className="w-4 h-4" />
              Visit History
            </button>
          )}
        </div>
      </div>

      {/* ─── View 1: History / Table View ──────────────────────── */}
      {view === "history" && (
        <div className="space-y-6">
          {/* Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "all"
                  ? "bg-slate-800 text-white border border-slate-700 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              All Campaigns ({referCampaigns.length})
            </button>
            <button
              onClick={() => setActiveTab("user")}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === "user"
                  ? "bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <User className="w-3.5 h-3.5" />
              User Campaigns ({referCampaigns.length})
            </button>
          </div>

          {/* Table Container */}
          <div className="bg-[#0B101D] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            {isLoadingReferCampaign && referCampaigns.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                <RefreshCw className="w-8 h-8 animate-spin mb-3 text-blue-500" />
                <p className="text-sm">Loading campaigns...</p>
              </div>
            ) : referCampaigns.length === 0 ? (
              <div className="py-16 text-center text-slate-400">
                <Send className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h3 className="text-white font-medium text-base">No Refer Campaigns Dispatched Yet</h3>
                <p className="text-xs sm:text-sm mt-1 max-w-sm mx-auto">
                  Click &ldquo;+ USER CAMPAIGN&rdquo; above to select your refer template and broadcast to customers.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-[#0E1526] text-slate-400 font-bold uppercase text-[10px] sm:text-[11px] tracking-wider border-b border-slate-800">
                      <th className="py-4 px-6">Refer Campaign Name</th>
                      <th className="py-4 px-6">Target Type</th>
                      <th className="py-4 px-6">Template Used</th>
                      <th className="py-4 px-6">Status</th>
                      <th className="py-4 px-6">Audience</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium">
                    {referCampaigns.map((item) => {
                      const totalRec = (item.recipients?.length || 0) + (item.customRecipients?.length || 0);
                      const isProcessing = item.status === "Processing";

                      return (
                        <tr key={item._id} className="hover:bg-slate-800/20 transition-colors">
                          <td className="py-4 px-6 text-white font-semibold flex items-center gap-2">
                            <span>{item.title}</span>
                          </td>
                          <td className="py-4 px-6">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-blue-600/15 text-blue-400 border border-blue-500/30">
                              <User className="w-3 h-3" />
                              USER CAMPAIGN
                            </span>
                          </td>
                          <td className="py-4 px-6 text-slate-300">
                            {item.templateId?.name || "Refer Template"}
                          </td>
                          <td className="py-4 px-6">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase ${
                                item.status === "Sent"
                                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                  : isProcessing
                                  ? "bg-blue-500/15 text-blue-400 border border-blue-500/30 animate-pulse"
                                  : "bg-slate-700/30 text-slate-400 border border-slate-700"
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  item.status === "Sent"
                                    ? "bg-emerald-400"
                                    : isProcessing
                                    ? "bg-blue-400"
                                    : "bg-slate-400"
                                }`}
                              />
                              {item.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-slate-400">
                            {totalRec} Recipients
                          </td>
                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setSelectedDetailsCampaign(item)}
                                className="w-8 h-8 rounded-lg bg-[#121A2E] hover:bg-[#1C2742] text-slate-300 hover:text-white border border-slate-700/70 flex items-center justify-center transition-all"
                                title="View details"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setDeleteTargetId(item._id)}
                                className="w-8 h-8 rounded-lg bg-[#121A2E] hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-700/70 hover:border-rose-800/60 flex items-center justify-center transition-all"
                                title="Delete campaign"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── View 2: Create & Dispatch View ─────────────────────── */}
      {view === "create" && (
        <div className="space-y-8">
          <div className="bg-[#0B101D] border border-slate-800/90 rounded-2xl p-5 sm:p-7 shadow-xl space-y-6">
            <form onSubmit={handleLaunch} className="space-y-6">
              {/* Campaign Target Audience */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Campaign Target Audience Type *
                </label>
                <div className="inline-flex items-center gap-2 bg-blue-600/15 border border-blue-500/40 text-blue-400 px-4 py-2.5 rounded-xl text-xs font-bold">
                  <User className="w-4 h-4" />
                  USER (TRAVELER) REFERRAL CAMPAIGN
                </div>
              </div>

              {/* Refer Campaign Title */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Refer Campaign Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Summer Traveler Refer & Earn ₹1000 Cash Campaign"
                  className="w-full bg-[#070B14] border border-slate-700/90 rounded-xl px-4 py-2.5 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Select User Email Template */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Select User Email Template *
                </label>
                <select
                  required
                  value={formData.templateId}
                  onChange={(e) => setFormData((prev) => ({ ...prev, templateId: e.target.value }))}
                  className="w-full bg-[#070B14] border border-slate-700/90 rounded-xl px-4 py-2.5 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                >
                  <option value="" disabled>
                    Select a saved User template...
                  </option>
                  {referTemplates.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.name} — ({t.subject})
                    </option>
                  ))}
                </select>
              </div>

              {/* Embedded User Registration Link Preview */}
              {selectedTemplate && (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    Embedded User Registration Link
                  </label>
                  <div className="bg-[#0A1224] border border-blue-500/40 rounded-xl p-3 font-mono text-blue-300 text-xs break-all select-all shadow-inner">
                    {selectedTemplate.target_link || "No link embedded in selected template."}
                  </div>
                </div>
              )}

              {/* Audience Selection Tabs */}
              <div className="pt-3">
                <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                  <button
                    type="button"
                    onClick={() => setRecipientTab("registered")}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      recipientTab === "registered"
                        ? "bg-blue-600 text-white shadow-md shadow-blue-600/25"
                        : "bg-[#0E1526] text-slate-400 hover:text-white"
                    }`}
                  >
                    REGISTERED USERS ({registeredRecipients.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setRecipientTab("custom")}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      recipientTab === "custom"
                        ? "bg-blue-600 text-white shadow-md shadow-blue-600/25"
                        : "bg-[#0E1526] text-slate-400 hover:text-white"
                    }`}
                  >
                    CUSTOM EMAILS ({customEmails.length})
                  </button>
                </div>

                {/* Pool Status & Select All */}
                {recipientTab === "registered" && (
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between bg-[#0E1526] border border-slate-800 px-4 py-2.5 rounded-xl">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                          <Users className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-slate-300">
                          Active Pool:{" "}
                          <span className="text-blue-400">{selectedRecipients.length} Target Selected</span>
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleSelectAll}
                        className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-wider"
                      >
                        {selectedRecipients.length === registeredRecipients.length ? "DESELECT ALL" : "SELECT ALL POOL"}
                      </button>
                    </div>

                    {/* Scrollable Recipient Checklist */}
                    <div className="max-h-60 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                      {registeredRecipients.map((email) => {
                        const isChecked = selectedRecipients.includes(email);
                        return (
                          <div
                            key={email}
                            onClick={() => toggleRecipient(email)}
                            className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                              isChecked
                                ? "bg-blue-500/10 border-blue-500/40 text-white"
                                : "bg-[#070B14] border-slate-800/80 text-slate-400 hover:border-slate-700"
                            }`}
                          >
                            <span className="text-xs font-mono">{email}</span>
                            <div
                              className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                                isChecked
                                  ? "bg-blue-600 border-blue-500 text-white"
                                  : "border-slate-700"
                              }`}
                            >
                              {isChecked && <Check className="w-3.5 h-3.5" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Custom Emails Entry */}
                {recipientTab === "custom" && (
                  <div className="mt-4 space-y-4">
                    <div className="flex gap-2">
                      <input
                        type="email"
                        value={customEmailInput}
                        onChange={(e) => setCustomEmailInput(e.target.value)}
                        placeholder="Enter email recipient address..."
                        className="flex-1 bg-[#070B14] border border-slate-700/90 rounded-xl px-4 py-2 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomEmail}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs"
                      >
                        + Add Email
                      </button>
                    </div>

                    {customEmails.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {customEmails.map((email) => (
                          <span
                            key={email}
                            className="bg-[#0E1526] border border-slate-700 text-slate-300 text-xs px-3 py-1.5 rounded-lg flex items-center gap-2"
                          >
                            <span>{email}</span>
                            <X
                              className="w-3.5 h-3.5 text-slate-400 hover:text-rose-400 cursor-pointer"
                              onClick={() => removeCustomEmail(email)}
                            />
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Submit Launch Button */}
              <div className="pt-4 border-t border-slate-800">
                <button
                  type="submit"
                  disabled={isSendingReferCampaign || totalCount === 0}
                  className="w-full py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSendingReferCampaign ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Dispatching Campaign...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Launch User Refer Campaign
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* ─── Dispatch Progress Card ────────────────────────────── */}
          {activeTrackingCampaign && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#0B101D] border border-slate-800/90 rounded-2xl p-5 sm:p-6 shadow-xl space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                    REFER CAMPAIGN DISPATCH PROGRESS
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Campaign: <span className="text-blue-400 font-semibold">{activeTrackingCampaign.title}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase ${
                      activeTrackingCampaign.status === "Sent"
                        ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                        : "bg-blue-500/15 text-blue-400 border border-blue-500/30 animate-pulse"
                    }`}
                  >
                    STATUS: {activeTrackingCampaign.status.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* 3 Step Milestone Bar */}
              <div className="grid grid-cols-3 gap-2 text-center pt-2">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-blue-600/30">
                    <Send className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-bold text-white uppercase mt-2">Send</span>
                  <span className="text-[10px] text-slate-500">Initiated</span>
                </div>

                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                    activeTrackingCampaign.status === "Processing" || activeTrackingCampaign.status === "Sent"
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                      : "bg-slate-800 text-slate-500"
                  }`}>
                    <Clock className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-bold text-white uppercase mt-2">Processing</span>
                  <span className="text-[10px] text-slate-500">
                    {activeTrackingCampaign.stats?.sent || 0} / {activeTrackingCampaign.stats?.total || 1} Sent
                  </span>
                </div>

                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                    activeTrackingCampaign.status === "Sent"
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                      : "bg-slate-800 text-slate-500"
                  }`}>
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-bold text-white uppercase mt-2">Sent</span>
                  <span className="text-[10px] text-slate-500">Completed</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5 pt-2">
                <div className="flex items-center justify-between text-xs text-slate-400 font-bold">
                  <span>Dispatch Progress</span>
                  <span className="text-emerald-400 font-mono">
                    {activeTrackingCampaign.status === "Sent"
                      ? "100%"
                      : activeTrackingCampaign.stats?.total
                      ? `${Math.round(((activeTrackingCampaign.stats.sent || 0) / activeTrackingCampaign.stats.total) * 100)}%`
                      : "0%"}
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 transition-all duration-500 rounded-full"
                    style={{
                      width:
                        activeTrackingCampaign.status === "Sent"
                          ? "100%"
                          : activeTrackingCampaign.stats?.total
                          ? `${Math.round(((activeTrackingCampaign.stats.sent || 0) / activeTrackingCampaign.stats.total) * 100)}%`
                          : "10%",
                    }}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* ─── Details Modal ─────────────────────────────────────── */}
      <AnimatePresence>
        {selectedDetailsCampaign && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0B101D] border border-slate-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl relative space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white">Campaign Details</h3>
                <X
                  className="w-5 h-5 text-slate-400 hover:text-white cursor-pointer"
                  onClick={() => setSelectedDetailsCampaign(null)}
                />
              </div>

              <div className="space-y-3 text-xs sm:text-sm">
                <div>
                  <span className="text-slate-400 block text-[11px] uppercase font-bold">Campaign Title</span>
                  <span className="text-white font-semibold">{selectedDetailsCampaign.title}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px] uppercase font-bold">Subject Snapshot</span>
                  <span className="text-blue-300 font-semibold">{selectedDetailsCampaign.subjectSnapshot}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px] uppercase font-bold">Target Link</span>
                  <span className="text-blue-300 font-mono text-xs break-all block bg-[#070B14] p-2 rounded-lg mt-1 border border-slate-800">
                    {selectedDetailsCampaign.targetLinkSnapshot || "None"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px] uppercase font-bold">Recipients ({selectedDetailsCampaign.stats?.total || 0})</span>
                  <div className="max-h-32 overflow-y-auto bg-[#070B14] p-2 rounded-lg mt-1 border border-slate-800 space-y-1">
                    {[...(selectedDetailsCampaign.recipients || []), ...(selectedDetailsCampaign.customRecipients || [])].map((email) => (
                      <div key={email} className="text-xs font-mono text-slate-300">
                        • {email}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedDetailsCampaign(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── Delete Confirmation Modal ─────────────────────────── */}
      <ConfirmationModal
        isOpen={Boolean(deleteTargetId)}
        title="Delete Refer Campaign"
        message="Are you sure you want to delete this refer campaign record?"
        onConfirm={async () => {
          if (deleteTargetId) {
            await deleteReferCampaign(deleteTargetId);
            setDeleteTargetId(null);
          }
        }}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
};

export default ReferCampaigns;
