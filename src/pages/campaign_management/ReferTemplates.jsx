import { useState, useEffect } from "react";
import { 
  Share2, Plus, Edit3, Trash2, ArrowLeft, Send, Sparkles, 
  Gift, User, ExternalLink, Check, Copy, RefreshCw, Image,
  Eye, AlertCircle, Link2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useCampaignStore } from "../../stores/campaignStore";
import { useRegistrationLinkStore } from "../../stores/registrationLinkStore";
import ConfirmationModal from "../../newComponents/ConfirmationModel";
import logo from "../../assets/admire-logo.png";

const ReferTemplates = () => {
  const navigate = useNavigate();
  const { 
    referTemplates, 
    isLoadingRefer, 
    fetchReferTemplates, 
    createReferTemplate, 
    updateReferTemplate, 
    deleteReferTemplate 
  } = useCampaignStore();

  const { links, fetchLinks } = useRegistrationLinkStore();

  // Mode: "list" or "builder"
  const [view, setView] = useState("list");
  const [editingTemplateId, setEditingTemplateId] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [activeTab, setActiveTab] = useState("all");

  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    body_content: "",
    banner_image: "",
    target_link: "",
    cta_button_text: "Claim Welcome Cash 🎁",
  });

  useEffect(() => {
    fetchReferTemplates();
    fetchLinks();
  }, [fetchReferTemplates, fetchLinks]);

  // Open builder in create mode
  const handleOpenCreate = () => {
    setEditingTemplateId(null);
    const activeLink = links.find((l) => l.status === "active")?.full_url || "";
    setFormData({
      name: "",
      subject: "Give ₹1,000, Get ₹1,000 - Trip2Honeymoon Refer & Earn 🎁",
      body_content:
        "Invite your friends to register on Trip2Honeymoon! When your friend completes sign-up using your exclusive referral link, they instantly get a Welcome Cash Bonus, and you earn reward cash directly in your wallet!",
      banner_image: "",
      target_link: activeLink,
      cta_button_text: "Claim ₹1,000 Welcome Cash 🎁",
    });
    setView("builder");
  };

  // Open builder in edit mode
  const handleOpenEdit = (template) => {
    setEditingTemplateId(template._id);
    setFormData({
      name: template.name || "",
      subject: template.subject || "",
      body_content: template.body_content || "",
      banner_image: template.banner_image || "",
      target_link: template.target_link || "",
      cta_button_text: template.cta_button_text || "Claim Welcome Cash 🎁",
    });
    setView("builder");
  };

  // Auto-fill active registration link
  const handleAutofillLink = () => {
    const activeLink = links.find((l) => l.status === "active");
    if (activeLink?.full_url) {
      setFormData((prev) => ({ ...prev, target_link: activeLink.full_url }));
      toast.success("Active registration link auto-filled!");
    } else {
      toast.info("No active registration link found. Generate one in Registration Link Generator!");
    }
  };

  // Save template
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.subject.trim() || !formData.body_content.trim()) {
      toast.error("Please fill in all mandatory fields.");
      return;
    }

    let success = false;
    if (editingTemplateId) {
      success = await updateReferTemplate(editingTemplateId, formData);
    } else {
      success = await createReferTemplate(formData);
    }

    if (success) {
      setView("list");
      setEditingTemplateId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#070B14] text-slate-100 p-4 sm:p-6 lg:p-8 space-y-8">
      {/* ─── Top Header ─────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-lg shadow-blue-500/5">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              Refer <span className="text-blue-500">Templates</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Design promotional Refer & Earn email campaign layouts for Users.
            </p>
          </div>
        </div>

        {/* Right Header Stats & Action */}
        <div className="flex items-center gap-3 self-start md:self-auto">
          <div className="bg-[#0E1526] border border-slate-800 px-4 py-2 rounded-xl text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Total Found
            </span>
            <span className="text-base sm:text-lg font-extrabold text-white">
              {referTemplates.length}
            </span>
          </div>

          {view === "list" ? (
            <button
              onClick={handleOpenCreate}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm transition-all shadow-md shadow-blue-600/25"
            >
              <Plus className="w-4 h-4" />
              CREATE USER TEMPLATE
            </button>
          ) : (
            <button
              onClick={() => setView("list")}
              className="flex items-center gap-2 bg-[#121A2E] hover:bg-[#18233C] text-slate-300 border border-slate-700/80 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              BACK TO TEMPLATES LIST
            </button>
          )}
        </div>
      </div>

      {/* ─── View 1: Templates List View ──────────────────────── */}
      {view === "list" && (
        <div className="space-y-6">
          {/* Filter Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "all"
                  ? "bg-slate-800 text-white border border-slate-700 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              All Templates ({referTemplates.length})
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
              User Templates ({referTemplates.length})
            </button>
          </div>

          {/* Cards Grid */}
          {isLoadingRefer && referTemplates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500">
              <RefreshCw className="w-8 h-8 animate-spin mb-3 text-blue-500" />
              <p className="text-sm">Loading refer templates...</p>
            </div>
          ) : referTemplates.length === 0 ? (
            <div className="bg-[#0B101D] border border-dashed border-slate-800 rounded-2xl py-16 px-4 text-center">
              <Share2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-white font-medium text-base">No Refer Templates Created Yet</h3>
              <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-md mx-auto">
                Create your first promotional Refer & Earn email template to dispatch via Email Campaigns.
              </p>
              <button
                onClick={handleOpenCreate}
                className="mt-5 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs sm:text-sm shadow-md shadow-blue-600/25"
              >
                <Plus className="w-4 h-4" />
                CREATE USER TEMPLATE
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {referTemplates.map((template) => (
                <motion.div
                  key={template._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#0B101D] border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 sm:p-6 transition-all shadow-md flex flex-col justify-between space-y-5"
                >
                  <div className="space-y-3">
                    {/* Top Badge & Gift Icon */}
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wider uppercase bg-blue-600/15 text-blue-400 border border-blue-500/30">
                        <User className="w-3 h-3" />
                        USER TEMPLATE
                      </span>
                      <Gift className="w-4 h-4 text-blue-400" />
                    </div>

                    {/* Template Title & Subject */}
                    <div>
                      <h3 className="text-white font-bold text-sm sm:text-base tracking-wide uppercase line-clamp-1">
                        {template.name}
                      </h3>
                      <h4 className="text-blue-400 font-semibold text-xs sm:text-[13px] mt-1 line-clamp-1">
                        {template.subject}
                      </h4>
                    </div>

                    {/* Body Narrative Preview */}
                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                      {template.body_content}
                    </p>
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleOpenEdit(template)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-lg bg-[#121A2E] hover:bg-[#18233C] border border-slate-700/70 transition-all"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                      Edit Template
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate('/email-campaigns')}
                        className="flex items-center gap-1.5 text-xs font-bold text-blue-300 hover:text-blue-200 px-3 py-1.5 rounded-lg bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 transition-all"
                      >
                        <Send className="w-3.5 h-3.5" />
                        LAUNCH REFER
                      </button>

                      <button
                        onClick={() => setDeleteTargetId(template._id)}
                        className="w-8 h-8 rounded-lg bg-[#121A2E] hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-700/70 hover:border-rose-800/60 flex items-center justify-center transition-all"
                        title="Delete template"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── View 2: Template Builder / Editor View ─────────────── */}
      {view === "builder" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Form Controls (7 cols) */}
          <div className="lg:col-span-7 bg-[#0B101D] border border-slate-800/90 rounded-2xl p-5 sm:p-7 shadow-xl space-y-6">
            <div className="border-b border-slate-800/80 pb-4">
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-blue-400" />
                {editingTemplateId ? "Edit Refer Template" : "Create New Refer Template"}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Customize your promotional email copy, welcome cash incentive, and target registration link.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Target Audience (Locked to User) */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Template Target Audience Type *
                </label>
                <div className="inline-flex items-center gap-2 bg-blue-600/15 border border-blue-500/40 text-blue-400 px-4 py-2 rounded-xl text-xs font-bold">
                  <User className="w-4 h-4" />
                  USER / CONSUMER REFERRAL
                </div>
              </div>

              {/* Template Title / Name */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Template Title / Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Festival Refer & Earn ₹1,000 Bonus"
                  className="w-full bg-[#070B14] border border-slate-700/90 rounded-xl px-4 py-2.5 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Email Subject Line */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Email Subject Line *
                </label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData((prev) => ({ ...prev, subject: e.target.value }))}
                  placeholder="e.g. Give ₹1,000, Get ₹1,000 - Trip2Honeymoon Refer & Earn 🎁"
                  className="w-full bg-[#070B14] border border-slate-700/90 rounded-xl px-4 py-2.5 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Official Body Narrative Content */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Official Body Narrative Content *
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.body_content}
                  onChange={(e) => setFormData((prev) => ({ ...prev, body_content: e.target.value }))}
                  placeholder="Describe the referral incentive, signup bonus steps, and reward instructions..."
                  className="w-full bg-[#070B14] border border-slate-700/90 rounded-xl p-4 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500 transition-colors leading-relaxed"
                />
              </div>

              {/* Promotional Banner Image URL */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Promotional Banner Image URL (Optional)
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={formData.banner_image}
                    onChange={(e) => setFormData((prev) => ({ ...prev, banner_image: e.target.value }))}
                    placeholder="https://example.com/banner.jpg"
                    className="w-full bg-[#070B14] border border-slate-700/90 rounded-xl px-4 py-2.5 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  <Image className="w-4 h-4 text-slate-500 absolute right-3.5 top-3" />
                </div>
              </div>

              {/* User Registration Target Link with Auto-fill Button */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    User Registration Target Link
                  </label>
                  <button
                    type="button"
                    onClick={handleAutofillLink}
                    className="flex items-center gap-1.5 text-[11px] font-bold text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 px-2.5 py-1 rounded-md transition-colors"
                  >
                    <Link2 className="w-3 h-3" />
                    + Auto-fill Active User Link
                  </button>
                </div>
                <input
                  type="url"
                  value={formData.target_link}
                  onChange={(e) => setFormData((prev) => ({ ...prev, target_link: e.target.value }))}
                  placeholder="http://localhost:5174/register?ref=..."
                  className="w-full bg-[#070B14] border border-slate-700/90 rounded-xl px-4 py-2.5 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500 transition-colors font-mono"
                />
              </div>

              {/* CTA Button Label Text */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  CTA Button Label Text
                </label>
                <input
                  type="text"
                  value={formData.cta_button_text}
                  onChange={(e) => setFormData((prev) => ({ ...prev, cta_button_text: e.target.value }))}
                  placeholder="e.g. Claim ₹1,000 Welcome Cash 🎁"
                  className="w-full bg-[#070B14] border border-slate-700/90 rounded-xl px-4 py-2.5 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setView("list")}
                  className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoadingRefer}
                  className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white transition-colors flex items-center gap-2 shadow-md shadow-blue-600/25 disabled:opacity-50"
                >
                  {isLoadingRefer ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      {editingTemplateId ? "UPDATE TEMPLATE" : "SAVE NEW TEMPLATE"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Live Email Preview Box (5 cols) */}
          <div className="lg:col-span-5 bg-[#0B101D] border border-slate-800/90 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4 sticky top-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <span className="text-[11px] font-bold text-blue-400 uppercase tracking-widest flex items-center gap-1.5">
                <Eye className="w-4 h-4" />
                User Refer Email Live Preview
              </span>
              <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">
                Interactive
              </span>
            </div>

            {/* Email Canvas */}
            <div className="bg-[#050811] border border-slate-800 rounded-xl p-5 sm:p-6 space-y-5 shadow-2xl text-center">
              {/* Email Brand Header */}
              <div className="flex items-center justify-center gap-2">
                <img src={logo} alt="Trip2Honeymoon" className="h-7 w-auto object-contain" />
              </div>

              {/* User Referral Badge */}
              <div>
                <span className="inline-block bg-blue-600/15 border border-blue-500/30 text-blue-400 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  User Referral Template
                </span>
              </div>

              {/* Subject / Headline */}
              <h3 className="text-white font-extrabold text-base sm:text-lg leading-snug">
                {formData.subject || "Give ₹1,000, Get ₹1,000 - Trip2Honeymoon Refer & Earn 🎁"}
              </h3>

              {/* Optional Banner Image */}
              {formData.banner_image && (
                <div className="rounded-lg overflow-hidden border border-slate-800 max-h-48">
                  <img
                    src={formData.banner_image}
                    alt="Promotional Banner"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                </div>
              )}

              {/* Body Narrative */}
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed whitespace-pre-line text-left bg-[#0A0F1E] border border-slate-800/70 p-4 rounded-xl">
                {formData.body_content || "Invite your friends to register on Trip2Honeymoon! When your friend completes sign-up using your exclusive referral link, they instantly get a Welcome Cash Bonus, and you earn reward cash directly in your wallet!"}
              </p>

              {/* CTA Button */}
              <div className="pt-2">
                <a
                  href={formData.target_link || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block w-full py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider transition-all shadow-lg shadow-blue-600/25"
                >
                  {formData.cta_button_text || "Claim Welcome Cash 🎁"}
                </a>
              </div>

              {/* Footer Disclaimers */}
              <div className="pt-4 border-t border-slate-800/60 text-[10px] text-slate-500 space-y-1">
                <p>© Trip2Honeymoon - Official Refer & Earn Template Engine</p>
                <p>Terms and conditions apply. Cash bonus automatically credited upon registration.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Delete Confirmation Modal ─────────────────────────── */}
      <ConfirmationModal
        isOpen={Boolean(deleteTargetId)}
        title="Delete Refer Template"
        message="Are you sure you want to delete this refer template? This action cannot be undone."
        onConfirm={async () => {
          if (deleteTargetId) {
            await deleteReferTemplate(deleteTargetId);
            setDeleteTargetId(null);
          }
        }}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
};

export default ReferTemplates;
