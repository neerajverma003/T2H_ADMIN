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
      const presignedRes = await apiClient.post("/admin/generate-presigned-url", {
        fileName: file.name,
        fileType: file.type,
        folder: folder
      });
      const { uploadUrl, key } = presignedRes.data;
      await axios.put(uploadUrl, file, {
        headers: { "Content-Type": file.type }
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
    inputStyle: "w-full rounded-[1.2rem] border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-4 pl-12 text-slate-950 dark:text-slate-100 font-bold focus:border-indigo-700/20 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:text-slate-400 shadow-inner",
    labelStyle: "flex items-center gap-2 text-xs font-black text-slate-950 dark:text-slate-400 uppercase tracking-[0.2em] mb-3",
    cardStyle: "bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-100/50 dark:shadow-none text-left",
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-48 gap-8">
        <RefreshCcw className="size-16 animate-spin text-indigo-700" strokeWidth={1} />
        <p className="text-xs font-black uppercase tracking-[0.4em] text-slate-400">Syncing Editorial Engine...</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-full mx-auto space-y-12 pb-24 px-6 text-left">
      
      {/* 1. HEADER */}
      <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-100/50 dark:shadow-none relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none text-indigo-700"><FiSettings size={200} /></div>
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-10">
          <div>
            <h1 className="text-4xl font-black text-slate-950 dark:text-white tracking-tight flex items-center gap-5">
              <ShieldCheck className="text-indigo-700" size={44} /> ABOUT US CONTROL
            </h1>
            <p className="text-slate-600 dark:text-slate-400 font-bold mt-2 text-xl italic">
              Dynamic page customizer, counters stats, and team roster control hub
            </p>
          </div>
        </div>
      </div>

      {/* 2. TABS SELECTOR */}
      <div className="flex items-center gap-4 bg-slate-100 dark:bg-slate-800/60 p-2 rounded-2xl w-fit">
        <button 
          onClick={() => setActiveTab("story")}
          className={`flex items-center gap-3 px-8 py-3 rounded-xl font-bold uppercase tracking-wider text-xs transition-all ${
            activeTab === "story" 
              ? "bg-white dark:bg-slate-900 text-indigo-700 shadow-md" 
              : "text-slate-600 hover:text-indigo-700"
          }`}
        >
          <FiInfo size={16} /> Story & Settings
        </button>
        <button 
          onClick={() => setActiveTab("team")}
          className={`flex items-center gap-3 px-8 py-3 rounded-xl font-bold uppercase tracking-wider text-xs transition-all ${
            activeTab === "team" 
              ? "bg-white dark:bg-slate-900 text-indigo-700 shadow-md" 
              : "text-slate-600 hover:text-indigo-700"
          }`}
        >
          <FiUsers size={16} /> Team Directory
        </button>
      </div>

      {/* 3. STORY TAB CONTENT */}
      {activeTab === "story" && (
        <form onSubmit={handleSaveStory} className="space-y-12">

          {/* EDITORIAL STORY HUB */}
          <div className={styleProps.cardStyle}>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-8">
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
                  placeholder="At TripToHoneymoon, our journey began..."
                  rows="6"
                  className={`${styleProps.inputStyle} h-40 pt-4 resize-none`}
                  required
                />
              </div>
            </div>
          </div>

          {/* MISSION & VISION */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            
            {/* MISSION CARD */}
            <div className={styleProps.cardStyle}>
              <div className="flex items-center gap-3 mb-6">
                <FiTarget className="text-indigo-700" size={24} />
                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Our Mission</h3>
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
                <FiEye className="text-indigo-700" size={24} />
                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Our Vision</h3>
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
              <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                C. Live Counter Milestones
              </h3>
              <button
                type="button"
                onClick={addStatRow}
                className="flex items-center gap-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 px-4 py-2 font-bold text-xs uppercase tracking-wider hover:bg-indigo-100 transition-colors"
              >
                <FiPlus /> Add Counter Point
              </button>
            </div>

            <div className="space-y-4">
              {storyForm.stats.map((stat, index) => (
                <div key={index} className="flex flex-col md:flex-row items-center gap-4 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div className="flex-1 w-full">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Counter Title</label>
                    <input
                      type="text"
                      value={stat.title}
                      onChange={(e) => updateStatRow(index, "title", e.target.value)}
                      placeholder="e.g. Happy Couples"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-sm font-bold"
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
                    className="mt-6 p-3 rounded-xl bg-red-50 dark:bg-red-950/20 text-red-500 hover:bg-red-100 transition-colors"
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
          <div className="flex justify-end pt-8">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-5 rounded-[2rem] bg-indigo-700 px-16 py-6 text-lg font-black text-white shadow-xl shadow-indigo-500/20 hover:bg-indigo-800 transition-all active:scale-95 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <RefreshCcw className="animate-spin" size={24} /> Syncing Hub...
                </>
              ) : (
                <>
                  <Save size={24} /> Synchronize Story config
                </>
              )}
            </button>
          </div>

        </form>
      )}

      {/* 4. TEAM TAB CONTENT */}
      {activeTab === "team" && (
        <div className="space-y-12">
          
          <div className={styleProps.cardStyle}>
            <div className="flex items-center justify-between mb-10">
              <div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  Team Members Directory
                </h3>
                <p className="text-slate-400 font-bold text-xs mt-1">Manage staff lists and ordering indexes</p>
              </div>
              <button
                onClick={() => openMemberModal()}
                className="flex items-center gap-2 rounded-xl bg-indigo-700 text-white px-6 py-3 font-bold text-xs uppercase tracking-wider hover:bg-indigo-800 transition-colors shadow-md"
              >
                <FiPlus /> Add Team Member
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {teamList.map((member) => (
                <div 
                  key={member._id}
                  className="bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 flex flex-col items-center relative group"
                >
                  <div className="relative w-36 h-36 rounded-full overflow-hidden mb-4 border border-slate-200 dark:border-slate-700 shadow-md">
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
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md ${
                      member.status 
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
                      className="p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 hover:bg-indigo-100 transition-colors"
                    >
                      <FiEdit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteMember(member._id)}
                      className="p-2.5 rounded-lg bg-red-50 dark:bg-red-950/20 text-red-500 hover:bg-red-100 transition-colors"
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
              className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-slate-100 dark:border-slate-800 shadow-2xl max-w-lg w-full"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black text-slate-950 dark:text-white uppercase tracking-tight">
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
                    className="w-full rounded-2xl border-2 border-slate-100 dark:border-slate-800 p-4 font-bold outline-none focus:border-indigo-700/20"
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
                    className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-black text-sm uppercase tracking-wider transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-4 bg-indigo-700 hover:bg-indigo-800 text-white rounded-2xl font-black text-sm uppercase tracking-wider transition-colors shadow-md shadow-indigo-500/20"
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
