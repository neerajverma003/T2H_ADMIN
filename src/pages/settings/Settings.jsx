import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { 
  ShieldCheck, RefreshCcw, Save, Mail, Phone, User, Lock, Edit3, Camera, CheckCircle, Key, KeyRound, ArrowRight, Upload, Trash2, Eye, EyeOff, Percent, Globe, Building
} from "lucide-react";
import useAuthStore, { apiClient } from "../../stores/authStores";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

const Settings = () => {
  const [searchParams] = useSearchParams();
  const { profile, fetchAdminProfile, updateAdminProfile, sendPasswordOtp, verifyPasswordOtp, verifyUsernameOtp } = useAuthStore();

  const [activeTab, setActiveTab] = useState("personal"); // "personal" | "security"
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);

  // Password Visibility States
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // OTP Password State
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [verifyingUsernameOtp, setVerifyingUsernameOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [passwordForm, setPasswordForm] = useState({
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [usernameForm, setUsernameForm] = useState({
    otp: "",
    newUsername: "",
  });

  // Trusted Devices State
  const [trustedDevices, setTrustedDevices] = useState([]);
  const [loadingDevices, setLoadingDevices] = useState(false);

  const fetchTrustedDevices = async () => {
    setLoadingDevices(true);
    try {
      const res = await apiClient.get("/admin/profile/trusted-devices");
      if (res.data.success) {
        setTrustedDevices(res.data.trustedDevices || []);
      }
    } catch (err) {
      console.error("fetchTrustedDevices error:", err);
    } finally {
      setLoadingDevices(false);
    }
  };

  const handleRevokeDevice = async (deviceId) => {
    try {
      const res = await apiClient.delete(`/admin/profile/trusted-devices/${deviceId}`);
      if (res.data.success) {
        toast.success(res.data.msg || "Trusted device revoked!");
        setTrustedDevices(res.data.trustedDevices || []);
      }
    } catch (err) {
      toast.error("Failed to revoke trusted device.");
    }
  };

  useEffect(() => {
    if (activeTab === "security") {
      fetchTrustedDevices();
    }
  }, [activeTab]);

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    username: "",
    firstName: "Admin",
    lastName: "",
    gender: "Male",
    phone: "",
    email: "",
    designation: "SUPER ADMIN",
    avatar: "",
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        await fetchAdminProfile();
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [fetchAdminProfile]);

  useEffect(() => {
    if (profile) {
      setProfileForm({
        username: profile.username || "",
        firstName: profile.firstName || "Admin",
        lastName: profile.lastName || "",
        gender: profile.gender || "Male",
        phone: profile.phone || "",
        email: profile.email || "",
        designation: profile.designation || "SUPER ADMIN",
        avatar: profile.avatar || "",
      });
    }
  }, [profile]);

  useEffect(() => {
    if (searchParams.get("edit") === "true") {
      setIsEditing(true);
    }
  }, [searchParams]);

  // OTP Countdown timer
  useEffect(() => {
    let timerInterval = null;
    if (otpTimer > 0) {
      timerInterval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timerInterval);
  }, [otpTimer]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUsernameFormChange = (e) => {
    const { name, value } = e.target;
    setUsernameForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleVerifyOtpUsername = async (e) => {
    e.preventDefault();

    if (!usernameForm.otp.trim()) {
      return toast.error("Please enter the 6-digit OTP code sent to your email.");
    }
    if (!usernameForm.newUsername.trim()) {
      return toast.error("Please enter your new username.");
    }

    setVerifyingUsernameOtp(true);
    try {
      const success = await verifyUsernameOtp(usernameForm.otp.trim(), usernameForm.newUsername.trim());
      if (success) {
        setUsernameForm({ otp: "", newUsername: "" });
        setProfileForm((prev) => ({ ...prev, username: usernameForm.newUsername.trim() }));
        setOtpSent(false);
      }
    } finally {
      setVerifyingUsernameOtp(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const success = await updateAdminProfile(profileForm);
      if (success) {
        setIsEditing(false);
      }
    } finally {
      setSavingProfile(false);
    }
  };

  const convertToWebP = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0);

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                return reject(new Error("Canvas to WebP conversion failed"));
              }
              const webpFileName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
              const webpFile = new File([blob], webpFileName, { type: "image/webp" });
              resolve(webpFile);
            },
            "image/webp",
            0.85
          );
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handleAvatarFileSelect = async (e) => {
    const originalFile = e.target.files?.[0];
    if (!originalFile) return;

    if (!originalFile.type.startsWith("image/")) {
      return toast.error("Please select a valid image file.");
    }

    setUploadingAvatar(true);
    try {
      // 1. Convert any image to WebP
      const webpFile = await convertToWebP(originalFile);

      // 2. Request presigned S3 URL for WebP
      const presignedRes = await apiClient.post("/admin/generate-presigned-url", {
        fileName: webpFile.name,
        fileType: "image/webp",
        folder: "admin-avatars",
      });

      const { uploadUrl, publicUrl } = presignedRes.data;

      // 3. Upload WebP file to S3
      await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": "image/webp" },
        body: webpFile,
      });

      // 4. Update profile avatar state & save
      const updatedForm = { ...profileForm, avatar: publicUrl };
      setProfileForm(updatedForm);
      await updateAdminProfile(updatedForm);
      toast.success("Profile photo converted to WebP and saved successfully! ✨");
    } catch (err) {
      console.error("Avatar upload error:", err);
      toast.error("Failed to upload image. Please try again.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!profileForm.avatar) return;

    setUploadingAvatar(true);
    try {
      const updatedForm = { ...profileForm, avatar: "" };
      setProfileForm(updatedForm);
      await updateAdminProfile(updatedForm);
      toast.success("Profile photo removed successfully! ✨");
    } catch (err) {
      console.error("Remove avatar error:", err);
      toast.error("Failed to remove profile photo.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSendOtp = async () => {
    if (!profileForm.email) {
      return toast.error("Please add and save a valid email address first.");
    }
    setSendingOtp(true);
    try {
      const success = await sendPasswordOtp();
      if (success) {
        setOtpSent(true);
        setOtpTimer(60);
      }
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtpPassword = async (e) => {
    e.preventDefault();

    if (!passwordForm.otp.trim()) {
      return toast.error("Please enter the 6-digit OTP code sent to your email.");
    }
    if (!passwordForm.newPassword) {
      return toast.error("Please enter your new password.");
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return toast.error("New password and confirm password do not match.");
    }

    setVerifyingOtp(true);
    try {
      const success = await verifyPasswordOtp(passwordForm.otp.trim(), passwordForm.newPassword);
      if (success) {
        setPasswordForm({ otp: "", newPassword: "", confirmPassword: "" });
        setOtpSent(false);
      }
    } finally {
      setVerifyingOtp(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-48 gap-8">
        <RefreshCcw className="size-16 animate-spin text-indigo-600" strokeWidth={1} />
        <p className="text-xs font-black uppercase tracking-[0.4em] text-slate-400">Loading Profile Details...</p>
      </div>
    );
  }

  const fullName = `${profileForm.firstName} ${profileForm.lastName}`.trim() || "Admin User";

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto space-y-8 pb-24 px-4 sm:px-6 text-left">
      {/* PAGE HEADER */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
            <span className="text-amber-500">EXPLORER</span> DASHBOARD
          </h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Manage your account and security details safely</p>
        </div>
        <div className="hidden sm:flex items-center gap-3 px-5 py-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-2xl text-xs font-black uppercase tracking-wider border border-emerald-100 dark:border-emerald-900/40">
          <CheckCircle size={16} /> Verified Administrator
        </div>
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: AVATAR CARD & TAB NAVIGATION */}
        <div className="lg:col-span-4 space-y-6">
          {/* PROFILE SUMMARY CARD */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none text-center relative overflow-hidden">
            {/* AVATAR CONTAINER */}
            <div className="relative size-32 mx-auto mb-6">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarFileSelect}
                accept="image/*"
                className="hidden"
              />
              {profileForm.avatar ? (
                <img
                  src={profileForm.avatar}
                  alt={fullName}
                  className="size-32 rounded-full object-cover ring-4 ring-amber-100 dark:ring-amber-900/30 shadow-lg mx-auto"
                />
              ) : (
                <div className="size-32 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 ring-4 ring-amber-100 dark:ring-amber-900/30 shadow-lg mx-auto">
                  <User size={56} strokeWidth={1.5} />
                </div>
              )}
              <button
                type="button"
                disabled={uploadingAvatar}
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-full shadow-lg transition-transform hover:scale-110 cursor-pointer disabled:opacity-50"
                title="Upload Profile Photo"
              >
                {uploadingAvatar ? <RefreshCcw size={16} className="animate-spin" /> : <Camera size={16} />}
              </button>
              {profileForm.avatar && (
                <button
                  type="button"
                  disabled={uploadingAvatar}
                  onClick={handleRemoveAvatar}
                  className="absolute bottom-0 left-0 p-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-full shadow-lg transition-transform hover:scale-110 cursor-pointer disabled:opacity-50"
                  title="Remove Profile Photo"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>

            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{fullName}</h2>
            <p className="text-[11px] font-black text-amber-500 uppercase tracking-widest mt-1">VERIFIED MEMBER</p>

            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800/80 text-left">
              <div className="flex items-center gap-3 text-xs font-bold text-slate-600 dark:text-slate-400">
                <Mail size={16} className="text-amber-500 shrink-0" />
                <span className="truncate">{profileForm.email || "No email assigned"}</span>
              </div>
            </div>
          </div>

          {/* NAVIGATION TABS */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none space-y-2">
            <button
              onClick={() => setActiveTab("personal")}
              className={`flex items-center justify-between w-full p-4 rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === "personal"
                  ? "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
              }`}
            >
              <span className="flex items-center gap-3">
                <User size={18} /> Personal Info
              </span>
              <ArrowRight size={16} />
            </button>

            <button
              onClick={() => setActiveTab("security")}
              className={`flex items-center justify-between w-full p-4 rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === "security"
                  ? "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
              }`}
            >
              <span className="flex items-center gap-3">
                <KeyRound size={18} /> Security & Password (OTP)
              </span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: TAB VIEW CONTENT */}
        <div className="lg:col-span-8">
          {activeTab === "personal" ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-10 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none space-y-8">
              {/* TAB HEADER */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Personal Information</h3>
                  <p className="text-xs font-medium text-slate-400 mt-1">Manage and update your account details safely.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl border-2 border-amber-500 text-amber-600 hover:bg-amber-500 hover:text-white font-black text-xs uppercase tracking-widest transition-all cursor-pointer shrink-0"
                >
                  <Edit3 size={16} /> {isEditing ? "Cancel Editing" : "Edit Profile"}
                </button>
              </div>

              {/* FORM FIELDS GRID */}
              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* USERNAME (LOGIN ID) */}
                  <div className="sm:col-span-2">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">USERNAME (LOGIN ID)</label>
                      <button
                        type="button"
                        onClick={() => setActiveTab("security")}
                        className="text-[10px] font-black text-amber-500 hover:underline uppercase tracking-wider cursor-pointer"
                      >
                        Change via OTP
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        value={profileForm.username || "super_admin"}
                        disabled
                        readOnly
                        className="w-full rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 p-4 text-slate-900 dark:text-slate-100 font-extrabold text-sm outline-none disabled:opacity-80 transition-all cursor-not-allowed select-none"
                      />
                      <User size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* FIRST NAME */}
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">FIRST NAME</label>
                    <input
                      type="text"
                      name="firstName"
                      value={profileForm.firstName}
                      onChange={handleProfileChange}
                      disabled={!isEditing}
                      placeholder="Enter First Name"
                      className="w-full rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 p-4 text-slate-900 dark:text-slate-100 font-bold text-sm outline-none focus:border-amber-500 disabled:opacity-80 transition-all"
                      required
                    />
                  </div>

                  {/* LAST NAME */}
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">LAST NAME</label>
                    <input
                      type="text"
                      name="lastName"
                      value={profileForm.lastName}
                      onChange={handleProfileChange}
                      disabled={!isEditing}
                      placeholder="Enter Last Name"
                      className="w-full rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 p-4 text-slate-900 dark:text-slate-100 font-bold text-sm outline-none focus:border-amber-500 disabled:opacity-80 transition-all"
                    />
                  </div>

                  {/* GENDER */}
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">GENDER</label>
                    <select
                      name="gender"
                      value={profileForm.gender}
                      onChange={handleProfileChange}
                      disabled={!isEditing}
                      className="w-full rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 p-4 text-slate-900 dark:text-slate-100 font-bold text-sm outline-none focus:border-amber-500 disabled:opacity-80 transition-all cursor-pointer"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* PASSWORD FIELD (MASKED AS ••••••••) */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">PASSWORD</label>
                      <button
                        type="button"
                        onClick={() => setActiveTab("security")}
                        className="text-[10px] font-black text-amber-500 hover:underline uppercase tracking-wider"
                      >
                        Change via OTP
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type="password"
                        value="••••••••••••"
                        disabled
                        readOnly
                        className="w-full rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 p-4 text-slate-900 dark:text-slate-100 font-extrabold text-sm outline-none disabled:opacity-80 transition-all tracking-widest cursor-not-allowed select-none"
                      />
                      <Lock size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* EMAIL ADDRESS */}
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">EMAIL ADDRESS</label>
                    <input
                      type="email"
                      name="email"
                      value={profileForm.email}
                      onChange={handleProfileChange}
                      disabled={!isEditing}
                      placeholder="Enter email address"
                      className="w-full rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 p-4 text-slate-900 dark:text-slate-100 font-bold text-sm outline-none focus:border-amber-500 disabled:opacity-80 transition-all"
                      required
                    />
                  </div>

                  {/* DESIGNATION */}
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">DESIGNATION</label>
                    <input
                      type="text"
                      name="designation"
                      value={profileForm.designation}
                      onChange={handleProfileChange}
                      disabled={!isEditing}
                      placeholder="SUPER ADMIN"
                      className="w-full rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 p-4 text-slate-900 dark:text-slate-100 font-bold text-sm outline-none focus:border-amber-500 disabled:opacity-80 transition-all"
                    />
                  </div>

                  {/* AVATAR URL */}
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">PROFILE IMAGE URL</label>
                    <input
                      type="url"
                      name="avatar"
                      value={profileForm.avatar}
                      onChange={handleProfileChange}
                      disabled={!isEditing}
                      placeholder="https://..."
                      className="w-full rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 p-4 text-slate-900 dark:text-slate-100 font-bold text-sm outline-none focus:border-amber-500 disabled:opacity-80 transition-all"
                    />
                  </div>
                </div>

                {isEditing && (
                  <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="submit"
                      disabled={savingProfile}
                      className="flex items-center gap-3 px-8 py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {savingProfile ? (
                        <>
                          <RefreshCcw className="animate-spin" size={16} /> SAVING CHANGES...
                        </>
                      ) : (
                        <>
                          <Save size={16} /> SAVE PERSONAL INFO
                        </>
                      )}
                    </button>
                  </div>
                )}
              </form>
            </div>
          ) : activeTab === "security" ? (
            /* SECURITY & OTP TAB */
            <div className="space-y-8">
              {/* SECTION 1: CHANGE USERNAME VIA OTP */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-10 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none space-y-6">
                <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                    <User size={20} className="text-amber-500" /> Change Username (Login ID)
                  </h3>
                  <p className="text-xs font-medium text-slate-400 mt-1">To update your account username, request a 6-digit verification OTP code sent to your email address.</p>
                </div>

                <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Request OTP Code</h4>
                    <p className="text-[11px] text-slate-400 font-bold mt-0.5">Will be sent to: <span className="text-amber-500">{profileForm.email || "No email assigned"}</span></p>
                  </div>
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={sendingOtp || otpTimer > 0}
                    className="flex items-center gap-2 px-5 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-md transition-all cursor-pointer shrink-0 disabled:opacity-50"
                  >
                    {sendingOtp ? (
                      <>
                        <RefreshCcw className="animate-spin" size={14} /> SENDING...
                      </>
                    ) : otpTimer > 0 ? (
                      `Resend OTP in ${otpTimer}s`
                    ) : (
                      "Send Email OTP"
                    )}
                  </button>
                </div>

                <form onSubmit={handleVerifyOtpUsername} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">6-DIGIT OTP CODE *</label>
                      <input
                        type="text"
                        name="otp"
                        value={usernameForm.otp}
                        onChange={handleUsernameFormChange}
                        placeholder="Enter 6-digit OTP code"
                        maxLength={6}
                        className="w-full rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 p-4 text-slate-900 dark:text-slate-100 font-black text-base tracking-widest outline-none focus:border-amber-500 transition-all placeholder:font-normal placeholder:text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">NEW USERNAME *</label>
                      <input
                        type="text"
                        name="newUsername"
                        value={usernameForm.newUsername}
                        onChange={handleUsernameFormChange}
                        placeholder="Enter new username"
                        className="w-full rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 p-4 text-slate-900 dark:text-slate-100 font-bold text-sm outline-none focus:border-amber-500 transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={verifyingUsernameOtp}
                      className="flex items-center gap-3 px-7 py-3.5 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {verifyingUsernameOtp ? (
                        <>
                          <RefreshCcw className="animate-spin" size={16} /> VERIFYING OTP...
                        </>
                      ) : (
                        <>
                          <User size={16} /> VERIFY OTP & UPDATE USERNAME
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* SECTION 2: CHANGE PASSWORD VIA OTP */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-10 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none space-y-6">
                <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                    <Lock size={20} className="text-emerald-500" /> Change Account Password
                  </h3>
                  <p className="text-xs font-medium text-slate-400 mt-1">To change your account password safely, verify using a 6-digit email OTP code.</p>
                </div>

                <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Request OTP Code</h4>
                    <p className="text-[11px] text-slate-400 font-bold mt-0.5">Will be sent to: <span className="text-amber-500">{profileForm.email || "No email assigned"}</span></p>
                  </div>
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={sendingOtp || otpTimer > 0}
                    className="flex items-center gap-2 px-5 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-md transition-all cursor-pointer shrink-0 disabled:opacity-50"
                  >
                    {sendingOtp ? (
                      <>
                        <RefreshCcw className="animate-spin" size={14} /> SENDING...
                      </>
                    ) : otpTimer > 0 ? (
                      `Resend OTP in ${otpTimer}s`
                    ) : (
                      "Send Email OTP"
                    )}
                  </button>
                </div>

                <form onSubmit={handleVerifyOtpPassword} className="space-y-5">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">6-DIGIT OTP VERIFICATION CODE *</label>
                    <input
                      type="text"
                      name="otp"
                      value={passwordForm.otp}
                      onChange={handlePasswordChange}
                      placeholder="Enter 6-digit OTP code"
                      maxLength={6}
                      className="w-full rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 p-4 text-slate-900 dark:text-slate-100 font-black text-base tracking-widest outline-none focus:border-amber-500 transition-all placeholder:font-normal placeholder:text-sm"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">NEW PASSWORD *</label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          name="newPassword"
                          value={passwordForm.newPassword}
                          onChange={handlePasswordChange}
                          placeholder="Enter new password"
                          className="w-full rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 p-4 pr-12 text-slate-900 dark:text-slate-100 font-bold text-sm outline-none focus:border-amber-500 transition-all"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
                          tabIndex={-1}
                          title={showNewPassword ? "Hide password" : "Show password"}
                        >
                          {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">CONFIRM NEW PASSWORD *</label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          name="confirmPassword"
                          value={passwordForm.confirmPassword}
                          onChange={handlePasswordChange}
                          placeholder="Re-enter new password"
                          className="w-full rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 p-4 pr-12 text-slate-900 dark:text-slate-100 font-bold text-sm outline-none focus:border-amber-500 transition-all"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
                          tabIndex={-1}
                          title={showConfirmPassword ? "Hide password" : "Show password"}
                        >
                          {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={verifyingOtp}
                      className="flex items-center gap-3 px-7 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {verifyingOtp ? (
                        <>
                          <RefreshCcw className="animate-spin" size={16} /> VERIFYING OTP & UPDATING...
                        </>
                      ) : (
                        <>
                          <Lock size={16} /> VERIFY OTP & UPDATE PASSWORD
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* SECTION 3: TRUSTED DEVICES & 14-DAY IP SESSIONS */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-10 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none space-y-6">
                <div className="pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                      <ShieldCheck size={20} className="text-indigo-500" /> Trusted Devices & 14-Day IP Sessions
                    </h3>
                    <p className="text-xs font-medium text-slate-400 mt-1">IP addresses verified via MFA do not require email OTP for 14 days.</p>
                  </div>
                  <button
                    type="button"
                    onClick={fetchTrustedDevices}
                    className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 rounded-xl transition cursor-pointer"
                    title="Refresh List"
                  >
                    <RefreshCcw size={16} className={loadingDevices ? "animate-spin" : ""} />
                  </button>
                </div>

                {trustedDevices.length === 0 ? (
                  <div className="text-center py-8 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                    <ShieldCheck size={36} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No Active 14-Day Trusted Device IPs</p>
                    <p className="text-[11px] text-slate-400 mt-1">When you log in from a new IP, complete OTP verification to trust it for 14 days.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {trustedDevices.map((device) => {
                      const daysLeft = Math.max(0, Math.ceil((new Date(device.expiresAt) - new Date()) / (1000 * 60 * 60 * 24)));
                      return (
                        <div key={device._id || device.ip} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-black text-slate-900 dark:text-white px-2.5 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg border border-amber-500/20">
                                IP: {device.ip}
                              </span>
                              <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-md">
                                Trusted ({daysLeft} days remaining)
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 font-medium">
                              Last login: {new Date(device.lastLoginAt).toLocaleString()}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRevokeDevice(device._id || device.ip)}
                            className="flex items-center gap-1.5 px-4 py-2 bg-rose-500/10 hover:bg-rose-500 text-rose-600 hover:text-white rounded-xl text-xs font-bold transition cursor-pointer shrink-0"
                          >
                            <Trash2 size={14} /> Revoke Trust
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </motion.div>
  );
};

export default Settings;
