import React, { useState, useEffect } from "react";
import {
  FiInfo, FiSave, FiPlus, FiTrash2, FiEdit2, FiUsers,
  FiEye, FiTarget, FiSettings, FiLoader, FiCheck, FiX
} from "react-icons/fi";
import { ShieldCheck, Sparkles, RefreshCcw, Save, Trash, UploadCloud, Loader2 } from "lucide-react";
import { apiClient } from "../../stores/authStores";
import axios from "axios";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { convertImageFileToWebP } from "../../utils/imageConverter";

const AboutSettings = () => {
  const [activeTab, setActiveTab] = useState("story"); // 'story' or 'team'
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [teamList, setTeamList] = useState([]);

  // S3 File Upload states
  const [uploadingHero, setUploadingHero] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Reusable S3 upload orchestrator
  const uploadFileToS3 = async (file, folder) => {
    try {
      let fileToUpload = file;
      if (file?.type?.startsWith("image/")) {
        fileToUpload = await convertImageFileToWebP(file);
      }

      const presignedRes = await apiClient.post("/admin/generate-presigned-url", {
        fileName: fileToUpload.name,
        fileType: fileToUpload.type,
        folder: folder
      });
      const { uploadUrl, key } = presignedRes.data;
      await axios.put(uploadUrl, fileToUpload, {
        headers: { "Content-Type": fileToUpload.type }
      });
      return key; // return clean S3 key 
    } catch (error) {
      console.error("Direct S3 upload failure:", error);
      throw error;
    }
  };

  // Hero Upload handlers
  const handleHeroDrop = async (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    await uploadHeroFile(file);
  };

  const handleHeroFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    await uploadHeroFile(file);
  };

  const uploadHeroFile = async (file) => {
    setUploadingHero(true);
    try {
      const s3Key = await uploadFileToS3(file, "about-story/hero");
      handleNestedChange("hero", "mediaUrl", s3Key);
      toast.success("Hero cinematic media uploaded successfully! 🎥");
    } catch (err) {
      toast.error("Failed to upload hero media to S3 storage.");
    } finally {
      setUploadingHero(false);
    }
  };

  // Team Avatar uploader handlers
  const handleAvatarDrop = async (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    await uploadAvatarFile(file);
  };

  const handleAvatarFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    await uploadAvatarFile(file);
  };

  const uploadAvatarFile = async (file) => {
    setUploadingAvatar(true);
    try {
      const s3Key = await uploadFileToS3(file, "about-story/team");
      setMemberForm(prev => ({ ...prev, image: s3Key }));
      toast.success("Profile avatar uploaded successfully! 👤");
    } catch (err) {
      toast.error("Failed to upload profile picture to S3 storage.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Dynamic Story Form Data
  const [storyForm, setStoryForm] = useState({
    hero: { mediaUrl: "", tagline: "", title: "", subtitle: "" },
    story: { title: "", tagline: "", content: "" },
    mission: { title: "", content: "" },
    vision: { title: "", content: "" },
    stats: []
  });

  // Team Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [memberForm, setMemberForm] = useState({
    name: "",
    designation: "",
    image: "",
    order: 0,
    status: true
  });

  // Fetch current database config
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/about");
      if (res.data.success) {
        // Resolve nested default structure safely
        const data = res.data.storyConfig;
        setStoryForm({
          hero: data.hero || { mediaUrl: "", tagline: "", title: "", subtitle: "" },
          story: data.story || { title: "", tagline: "", content: "" },
          mission: data.mission || { title: "", content: "" },
          vision: data.vision || { title: "", content: "" },
          stats: data.stats || []
        });
        setTeamList(res.data.teamList || []);
      }
    } catch (error) {
      console.error("Error loading About settings:", error);
      toast.error("Failed to sync settings from core database");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Form field changes
  const handleNestedChange = (section, field, value) => {
    setStoryForm(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  // Dynamic Counter operations
  const addStatRow = () => {
    setStoryForm(prev => ({
      ...prev,
      stats: [...prev.stats, { title: "New Stat", value: 0, suffix: "+" }]
    }));
  };

  const removeStatRow = (index) => {
    setStoryForm(prev => ({
      ...prev,
      stats: prev.stats.filter((_, idx) => idx !== index)
    }));
  };

  const updateStatRow = (index, field, value) => {
    setStoryForm(prev => {
      const updatedStats = [...prev.stats];
      updatedStats[index] = {
        ...updatedStats[index],
        [field]: field === "value" ? Number(value) : value
      };
      return { ...prev, stats: updatedStats };
    });
  };

  // Submit Brand Story details
  const handleSaveStory = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiClient.put("/admin/about-settings", storyForm);
      toast.success("Brand story and layout synchronized successfully! ✨");
    } catch (error) {
      console.error("Error updating Brand Story:", error);
      toast.error("Failed to update brand configurations");
    } finally {
      setSaving(false);
    }
  };

  // Modal open helpers
  const openMemberModal = (member = null) => {
    if (member) {
      setEditingMember(member);
      setMemberForm({
        name: member.name,
        designation: member.designation,
        image: member.image,
        order: member.order || 0,
        status: member.status !== undefined ? member.status : true
      });
    } else {
      setEditingMember(null);
      setMemberForm({ name: "", designation: "", image: "", order: teamList.length + 1, status: true });
    }
    setModalOpen(true);
  };

  // Add or Edit dynamic Team Member
  const handleSaveMember = async (e) => {
    e.preventDefault();
    try {
      if (editingMember) {
        // Edit flow
        const res = await apiClient.patch(`/admin/team/${editingMember._id}`, memberForm);
        if (res.data.success) {
          toast.success("Team member details updated! 👥");
        }
      } else {
        // Add flow
        const res = await apiClient.post("/admin/team", memberForm);
        if (res.data.success) {
          toast.success("New team member registered! 🌟");
        }
      }
      setModalOpen(false);
      fetchData(); // reload
    } catch (error) {
      console.error("Error saving team member:", error);
      toast.error("Process failed. Please check parameters.");
    }
  };

  // Delete Member logic
  const handleDeleteMember = async (id) => {
    if (window.confirm("Are you sure you want to permanently remove this team member?")) {
      try {
        await apiClient.delete(`/admin/team/${id}`);
        toast.success("Team member successfully removed.");
        fetchData(); // reload
      } catch (error) {
        console.error("Error deleting team member:", error);
        toast.error("Failed to execute deletion. Authorization required.");
      }
    }
  };

  const styleProps = {
    inputStyle: "w-full rounded-xl border border-slate-200 dark:border-slate-800/90 bg-slate-50 dark:bg-[#050A17] p-4 text-slate-900 dark:text-white font-semibold focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400 shadow-inner text-sm",
    labelStyle: "flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-400 uppercase tracking-wider mb-2",
    cardStyle: "bg-white dark:bg-[#091126]/95 rounded-3xl p-6 lg:p-8 border border-slate-200/90 dark:border-indigo-500/25 shadow-xl dark:shadow-[0_8px_30px_rgba(0,0,0,0.5)] ring-1 ring-slate-900/5 dark:ring-white/5 backdrop-blur-xl text-left",
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="relative">
          <div className="w-14 h-14 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin" />
          <ShieldCheck className="absolute inset-0 m-auto text-blue-500 animate-pulse" size={22} />
        </div>
        <p className="mt-4 text-xs font-bold tracking-widest text-slate-400 uppercase">Syncing Editorial Engine...</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8 pb-20 font-sans min-h-screen text-slate-900 dark:text-slate-100 text-left">

      {/* 1. HEADER */}
      <div className="bg-white dark:bg-[#091126]/95 rounded-3xl py-4 sm:py-5 px-6 sm:px-8 border border-slate-200/90 dark:border-indigo-500/25 shadow-xl dark:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.7),0_0_30px_2px_rgba(99,102,241,0.18)] ring-1 ring-slate-900/5 dark:ring-white/5 backdrop-blur-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-blue-500/10 dark:bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-indigo-500/10 dark:bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-500/30 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-500 dark:text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full">Content Management</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">About Us Control</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Dynamic page customizer, counters stats, and team roster control hub</p>
          </div>
        </div>
      </div>

      {/* 2. TABS SELECTOR */}
      <div className="flex items-center gap-2 bg-slate-100 dark:bg-[#091126]/80 p-1.5 rounded-xl w-fit border border-slate-200/80 dark:border-indigo-500/20">
        <button
          onClick={() => setActiveTab("story")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold uppercase tracking-wider text-xs transition-all cursor-pointer ${activeTab === "story"
              ? "bg-white dark:bg-gradient-to-r dark:from-blue-600 dark:to-indigo-600 text-blue-600 dark:text-white shadow-md"
              : "text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-300"
            }`}
        >
          <FiInfo size={14} /> Story & Settings
        </button>
        <button
          onClick={() => setActiveTab("team")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold uppercase tracking-wider text-xs transition-all cursor-pointer ${activeTab === "team"
              ? "bg-white dark:bg-gradient-to-r dark:from-blue-600 dark:to-indigo-600 text-blue-600 dark:text-white shadow-md"
              : "text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-300"
            }`}
        >
          <FiUsers size={14} /> Team Directory
        </button>
      </div>

      {/* 3. STORY TAB CONTENT */}
      {activeTab === "story" && (
        <form onSubmit={handleSaveStory} className="space-y-8">

          {/* EDITORIAL STORY HUB */}
          <div className={styleProps.cardStyle}>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight mb-6">
              B. Editorial Brand Story
            </h3>
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className={styleProps.labelStyle}>Section Heading</label>
                  <input
                    type="text"
                    value={storyForm.story.title}
                    onChange={(e) => handleNestedChange("story", "title", e.target.value)}
                    placeholder="Our Story"
                    className={styleProps.inputStyle}
                  />
                </div>
                <div>
                  <label className={styleProps.labelStyle}>Story Brand Tagline</label>
                  <input
                    type="text"
                    value={storyForm.story.tagline}
                    onChange={(e) => handleNestedChange("story", "tagline", e.target.value)}
                    placeholder="A SIGNATURE HAUTE EXPERIENCE"
                    className={styleProps.inputStyle}
                  />
                </div>
              </div>
              <div>
                <label className={styleProps.labelStyle}>Story Descriptive Content</label>
                <textarea
                  value={storyForm.story.content}
                  onChange={(e) => handleNestedChange("story", "content", e.target.value)}
                  placeholder="At Trip2Honeymoon, our journey began..."
                  rows="6"
                  className={`${styleProps.inputStyle} h-40 pt-4 resize-none`}
                  required
                />
              </div>
            </div>
          </div>

          {/* MISSION & VISION */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* MISSION CARD */}
            <div className={styleProps.cardStyle}>
              <div className="flex items-center gap-3 mb-6">
                <FiTarget className="text-blue-500" size={20} />
                <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Our Mission</h3>
              </div>
              <div className="space-y-6">
                <input
                  type="text"
                  value={storyForm.mission.title}
                  onChange={(e) => handleNestedChange("mission", "title", e.target.value)}
                  placeholder="Our Mission"
                  className={styleProps.inputStyle}
                />
                <textarea
                  value={storyForm.mission.content}
                  onChange={(e) => handleNestedChange("mission", "content", e.target.value)}
                  placeholder="Design specialized couples romantic tours..."
                  rows="4"
                  className={`${styleProps.inputStyle} h-32 pt-4 resize-none`}
                  required
                />
              </div>
            </div>

            {/* VISION CARD */}
            <div className={styleProps.cardStyle}>
              <div className="flex items-center gap-3 mb-6">
                <FiEye className="text-indigo-500" size={20} />
                <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Our Vision</h3>
              </div>
              <div className="space-y-6">
                <input
                  type="text"
                  value={storyForm.vision.title}
                  onChange={(e) => handleNestedChange("vision", "title", e.target.value)}
                  placeholder="Our Vision"
                  className={styleProps.inputStyle}
                />
                <textarea
                  value={storyForm.vision.content}
                  onChange={(e) => handleNestedChange("vision", "content", e.target.value)}
                  placeholder="Setting global benchmarks for high-end romantic planning..."
                  rows="4"
                  className={`${styleProps.inputStyle} h-32 pt-4 resize-none`}
                  required
                />
              </div>
            </div>

          </div>

          {/* DYNAMIC counters */}
          <div className={styleProps.cardStyle}>
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                C. Live Counter Milestones
              </h3>
              <button
                type="button"
                onClick={addStatRow}
                className="flex items-center gap-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 px-4 py-2 font-bold text-xs uppercase tracking-wider hover:bg-blue-500/20 transition-colors border border-blue-500/20 cursor-pointer"
              >
                <FiPlus /> Add Counter Point
              </button>
            </div>

            <div className="space-y-4">
              {storyForm.stats.map((stat, index) => (
                <div key={index} className="flex flex-col md:flex-row items-center gap-4 bg-slate-50/70 dark:bg-[#050A17]/80 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/90">
                  <div className="flex-1 w-full">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Counter Title</label>
                    <input
                      type="text"
                      value={stat.title}
                      onChange={(e) => updateStatRow(index, "title", e.target.value)}
                      placeholder="e.g. Happy Couples"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800/90 bg-white dark:bg-[#091126] p-3 text-sm font-semibold text-slate-900 dark:text-white shadow-inner focus:outline-none focus:border-blue-500 transition-all"
                    />
                  </div>
                  <div className="w-full md:w-32">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Numerical Value</label>
                    <input
                      type="number"
                      value={stat.value}
                      onChange={(e) => updateStatRow(index, "value", e.target.value)}
                      placeholder="12000"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-sm font-bold"
                    />
                  </div>
                  <div className="w-full md:w-24">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Suffix</label>
                    <input
                      type="text"
                      value={stat.suffix}
                      onChange={(e) => updateStatRow(index, "suffix", e.target.value)}
                      placeholder="+"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-sm font-bold"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeStatRow(index)}
                    className="mt-6 p-3 rounded-xl bg-red-50 dark:bg-red-950/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              ))}

              {storyForm.stats.length === 0 && (
                <div className="text-center py-8 text-slate-400 text-sm font-bold uppercase tracking-wider">
                  No counters configured. Stats display will default to standard values.
                </div>
              )}
            </div>
          </div>

          {/* SUBMIT HERO */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-blue-500/30 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <RefreshCcw className="animate-spin" size={15} /> Syncing Hub...
                </>
              ) : (
                <>
                  <Save size={15} /> Synchronize Story Config
                </>
              )}
            </button>
          </div>

        </form>
      )}

      {/* 4. TEAM TAB CONTENT */}
      {activeTab === "team" && (
        <div className="space-y-8">

          <div className={styleProps.cardStyle}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                  Team Members Directory
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">Manage staff lists and ordering indexes</p>
              </div>
              <button
                onClick={() => openMemberModal()}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-blue-500/30 transition-all cursor-pointer active:scale-95 self-start sm:self-auto"
              >
                <FiPlus size={14} /> Add Team Member
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {teamList.map((member) => (
                <div
                  key={member._id}
                  className="bg-slate-50/70 dark:bg-[#050A17]/80 border border-slate-200/80 dark:border-slate-800/90 rounded-2xl p-5 flex flex-col items-center relative group hover:border-blue-500/30 transition-all"
                >
                  <div className="relative w-28 h-28 rounded-full overflow-hidden mb-4 border-2 border-slate-200 dark:border-slate-700/60 shadow-md">
                    <img
                      src={member.image.startsWith("http") ? member.image : `https://media.trip2honeymoon.com/${member.image}`}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <h4 className="text-base font-black text-slate-900 dark:text-white leading-tight">{member.name}</h4>
                  <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">{member.designation}</p>

                  <div className="flex items-center gap-2 mt-4">
                    <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 bg-slate-200 dark:bg-slate-800 rounded-md text-slate-600 dark:text-slate-400">
                      Sort: {member.order || 0}
                    </span>
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md ${member.status
                        ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600"
                        : "bg-red-50 dark:bg-red-950/20 text-red-500"
                      }`}>
                      {member.status ? "Active" : "Disabled"}
                    </span>
                  </div>

                  {/* Actions overlay panel */}
                  <div className="flex items-center gap-3 mt-6">
                    <button
                      onClick={() => openMemberModal(member)}
                      className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 transition-colors cursor-pointer"
                    >
                      <FiEdit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteMember(member._id)}
                      className="p-2 rounded-lg bg-red-50 dark:bg-red-950/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}

              {teamList.length === 0 && (
                <div className="col-span-full text-center py-16 text-slate-400 text-sm font-bold uppercase tracking-wider">
                  No registered team members found. Falling back to default list on frontend.
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* 5. TEAM CARD POPUP MODAL */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-[#091126] rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-indigo-500/25 shadow-2xl max-w-lg w-full ring-1 ring-slate-900/5 dark:ring-white/5"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                  {editingMember ? "✏️ Edit Team Profile" : "👥 Register Team Profile"}
                </h3>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 transition-colors"
                >
                  <FiX size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveMember} className="space-y-6">
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 block mb-2">Member Name</label>
                  <input
                    type="text"
                    value={memberForm.name}
                    onChange={(e) => setMemberForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Sophia Bennett"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800/90 bg-slate-50 dark:bg-[#050A17] p-3.5 font-semibold text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 block mb-2">Role Designation</label>
                  <input
                    type="text"
                    value={memberForm.designation}
                    onChange={(e) => setMemberForm(prev => ({ ...prev, designation: e.target.value }))}
                    placeholder="CEO & Co-Founder"
                    className="w-full rounded-2xl border-2 border-slate-100 dark:border-slate-800 p-4 font-bold outline-none focus:border-indigo-700/20"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 block mb-2">Media Key or Image URL</label>
                  <input
                    type="text"
                    value={memberForm.image}
                    onChange={(e) => setMemberForm(prev => ({ ...prev, image: e.target.value }))}
                    placeholder="Copy-paste image URL or S3 key"
                    className="w-full rounded-2xl border-2 border-slate-100 dark:border-slate-800 p-4 font-bold outline-none focus:border-indigo-700/20"
                    required
                  />

                  {/* Drag & Drop Team Avatar Zone */}
                  <div className="mt-3">
                    <label
                      className="flex flex-col items-center justify-center gap-3 cursor-pointer rounded-2xl border-2 border-dashed border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/20 p-4 hover:border-indigo-500 transition-all text-center group"
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={handleAvatarDrop}
                    >
                      {uploadingAvatar ? (
                        <div className="flex flex-col items-center gap-2">
                          <Loader2 className="animate-spin text-indigo-700 size-6" />
                          <p className="text-[10px] font-bold text-slate-400">Uploading Avatar...</p>
                        </div>
                      ) : (
                        <>
                          <UploadCloud className="text-slate-400 size-6 group-hover:text-indigo-600 transition-colors" />
                          <div className="text-[11px] text-slate-500">
                            <span className="text-indigo-700 font-bold">Click to upload</span> or drag & drop avatar
                          </div>
                          <input type="file" accept="image/*" onChange={handleAvatarFileSelect} className="hidden" />
                        </>
                      )}
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 block mb-2">Display Order Index</label>
                    <input
                      type="number"
                      value={memberForm.order}
                      onChange={(e) => setMemberForm(prev => ({ ...prev, order: Number(e.target.value) }))}
                      className="w-full rounded-2xl border-2 border-slate-100 dark:border-slate-800 p-4 font-bold outline-none focus:border-indigo-700/20"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 block mb-2">Status Visibility</label>
                    <select
                      value={memberForm.status ? "active" : "disabled"}
                      onChange={(e) => setMemberForm(prev => ({ ...prev, status: e.target.value === "active" }))}
                      className="w-full rounded-2xl border-2 border-slate-100 dark:border-slate-800 p-4 font-bold outline-none focus:border-indigo-700/20"
                    >
                      <option value="active">Active (Visible)</option>
                      <option value="disabled">Disabled (Hidden)</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-blue-500/30 cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
};

export default AboutSettings;
