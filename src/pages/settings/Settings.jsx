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
  const [avatarError, setAvatarError] = useState(false);
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
  const role = useAuthStore((state) => state.role);
  const roleLabel = role === 'superadmin' ? 'SUPER ADMIN' : role === 'subadmin' ? 'SUB ADMIN' : 'ADMIN';

  const [profileForm, setProfileForm] = useState({
    username: "",
    firstName: "",
    lastName: "",
    gender: "Male",
    phone: "",
    email: "",
    designation: "",
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
        firstName: profile.firstName || profile.username || "",
        lastName: profile.lastName || "",
        gender: profile.gender || "Male",
        phone: profile.phone || "",
        email: profile.email || "",
        designation: profile.designation || roleLabel,
        avatar: profile.avatar || "",
      });
      setAvatarError(false);
    }
  }, [profile, roleLabel]);

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="relative">
          <div className="w-14 h-14 rounded-2xl border-4 border-blue-500/20 border-t-blue-500 animate-spin" />
          <User className="absolute inset-0 m-auto text-blue-500/60" size={20} />
        </div>
        <p className="mt-4 text-xs font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 animate-pulse">
          Loading Profile Details...
        </p>
      </div>
    );
  }

  const fullName = `${profileForm.firstName} ${profileForm.lastName}`.trim() || "Admin User";

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="max-w-7xl mx-auto space-y-8 pb-24 px-4 sm:px-6 text-left">
      {/* ── HEADER HUB ── */}
      <div className="bg-white dark:bg-[#091126]/95 rounded-3xl py-4 sm:py-5 px-6 sm:px-8 border border-slate-200/90 dark:border-indigo-500/25 shadow-xl dark:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.7),0_0_30px_2px_rgba(99,102,241,0.18)] ring-1 ring-slate-900/5 dark:ring-white/5 backdrop-blur-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Glow Effects */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-blue-500/10 dark:bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-indigo-500/10 dark:bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center gap-3.5">
          <div className="w-11 h-11 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-md shadow-blue-500/30 shrink-0">
            <User size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-500 dark:text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 rounded-full">
                ADMIN PROFILE & SECURITY
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <span className="text-blue-500">Explorer</span> Dashboard
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-semibold mt-0.5 text-xs sm:text-sm">
              Manage your personal administrator credentials, email OTP security & trusted devices safely.
            </p>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-extrabold uppercase tracking-wider">
            <CheckCircle size={15} /> Verified Administrator
          </div>
        </div>
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: AVATAR CARD & TAB NAVIGATION */}
        <div className="lg:col-span-4 space-y-6">
          {/* PROFILE SUMMARY CARD */}
          <div className="bg-white dark:bg-[#091126]/95 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-indigo-500/25 shadow-xl dark:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.7),0_0_30px_2px_rgba(99,102,241,0.18)] ring-1 ring-slate-900/5 dark:ring-white/5 backdrop-blur-xl text-center relative overflow-hidden">
            {/* AVATAR CONTAINER */}
            <div className="relative size-32 mx-auto mb-6">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarFileSelect}
                accept="image/*"
                className="hidden"
              />
              {profileForm.avatar && !avatarError ? (
                <img
                  src={profileForm.avatar}
                  alt={fullName}
                  onError={() => setAvatarError(true)}
                  className="size-32 rounded-full object-cover ring-4 ring-blue-500/30 shadow-xl mx-auto"
                />
              ) : (
                <div className="size-32 rounded-full bg-slate-100 dark:bg-[#050A17] border border-slate-200 dark:border-slate-800 flex items-center justify-center text-blue-500 ring-4 ring-blue-500/30 shadow-xl mx-auto">
                  <span className="text-3xl font-black text-blue-500 uppercase tracking-wider">
                    {profileForm.firstName?.[0] || profileForm.username?.[0] || "A"}
                  </span>
                </div>
              )}
              <button
                type="button"
                disabled={uploadingAvatar}
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-full shadow-lg shadow-blue-500/30 transition-transform hover:scale-110 active:scale-95 cursor-pointer disabled:opacity-50"
                title="Upload Profile Photo"
              >
                {uploadingAvatar ? <RefreshCcw size={16} className="animate-spin" /> : <Camera size={16} />}
              </button>
              {profileForm.avatar && (
                <button
                  type="button"
                  disabled={uploadingAvatar}
                  onClick={handleRemoveAvatar}
                  className="absolute bottom-0 left-0 p-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-full shadow-lg shadow-rose-500/30 transition-transform hover:scale-110 active:scale-95 cursor-pointer disabled:opacity-50"
                  title="Remove Profile Photo"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>

            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">{fullName}</h2>
            <div className="mt-2">
              <span className="text-[11px] font-extrabold text-blue-500 dark:text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full uppercase tracking-wider inline-block">
                VERIFIED MEMBER
              </span>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800/80 text-left">
              <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-[#050A17] rounded-xl border border-slate-200/80 dark:border-slate-800/90 text-xs font-semibold text-slate-600 dark:text-slate-300">
                <Mail size={16} className="text-blue-500 shrink-0" />
                <span className="truncate">{profileForm.email || "No email assigned"}</span>
              </div>
            </div>
          </div>

          {/* NAVIGATION TABS */}
          <div className="bg-white dark:bg-[#091126]/95 rounded-3xl p-3 border border-slate-200/90 dark:border-indigo-500/25 shadow-xl dark:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.7),0_0_30px_2px_rgba(99,102,241,0.18)] ring-1 ring-slate-900/5 dark:ring-white/5 backdrop-blur-xl space-y-2">
            <button
              type="button"
              onClick={() => setActiveTab("personal")}
              className={`flex items-center justify-between w-full p-4 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === "personal"
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/30"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60"
              }`}
            >
              <span className="flex items-center gap-3">
                <User size={18} /> Personal Info
              </span>
              <ArrowRight size={16} />
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("security")}
              className={`flex items-center justify-between w-full p-4 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === "security"
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/30"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60"
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
            <div className="bg-white dark:bg-[#091126]/95 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-indigo-500/25 shadow-xl dark:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.7),0_0_30px_2px_rgba(99,102,241,0.18)] ring-1 ring-slate-900/5 dark:ring-white/5 backdrop-blur-xl space-y-6">
              {/* TAB HEADER */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800/80">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Personal Information</h3>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Manage and update your account details safely.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditing(!isEditing)}
                  className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shrink-0 ${
                    isEditing
                      ? "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500 hover:text-white"
                      : "border-blue-500/40 bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white"
                  }`}
                >
                  <Edit3 size={15} /> {isEditing ? "Cancel Editing" : "Edit Profile"}
                </button>
              </div>

              {/* FORM FIELDS GRID */}
              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* USERNAME (LOGIN ID) */}
                  <div className="sm:col-span-2">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-[11px] font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-wider">USERNAME (LOGIN ID)</label>
                      <button
                        type="button"
                        onClick={() => setActiveTab("security")}
                        className="text-[11px] font-extrabold text-blue-500 hover:text-blue-400 hover:underline uppercase tracking-wider cursor-pointer"
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
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-800/90 bg-slate-100 dark:bg-[#050A17]/80 p-3.5 text-slate-700 dark:text-slate-300 font-bold text-sm outline-none cursor-not-allowed select-none shadow-inner"
                      />
                      <User size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* FIRST NAME */}
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">FIRST NAME</label>
                    <input
                      type="text"
                      name="firstName"
                      value={profileForm.firstName}
                      onChange={handleProfileChange}
                      disabled={!isEditing}
                      placeholder="Enter First Name"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800/90 bg-slate-50 dark:bg-[#050A17] p-3.5 text-slate-900 dark:text-white font-semibold text-sm outline-none focus:border-blue-500 disabled:opacity-70 transition-all shadow-inner"
                      required
                    />
                  </div>

                  {/* LAST NAME */}
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">LAST NAME</label>
                    <input
                      type="text"
                      name="lastName"
                      value={profileForm.lastName}
                      onChange={handleProfileChange}
                      disabled={!isEditing}
                      placeholder="Enter Last Name"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800/90 bg-slate-50 dark:bg-[#050A17] p-3.5 text-slate-900 dark:text-white font-semibold text-sm outline-none focus:border-blue-500 disabled:opacity-70 transition-all shadow-inner"
                    />
                  </div>

                  {/* GENDER */}
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">GENDER</label>
                    <select
                      name="gender"
                      value={profileForm.gender}
                      onChange={handleProfileChange}
                      disabled={!isEditing}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800/90 bg-slate-50 dark:bg-[#050A17] p-3.5 text-slate-900 dark:text-white font-semibold text-sm outline-none focus:border-blue-500 disabled:opacity-70 transition-all cursor-pointer shadow-inner"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* PASSWORD FIELD (MASKED AS ••••••••) */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-[11px] font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-wider">PASSWORD</label>
                      <button
                        type="button"
                        onClick={() => setActiveTab("security")}
                        className="text-[11px] font-extrabold text-blue-500 hover:text-blue-400 hover:underline uppercase tracking-wider cursor-pointer"
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
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-800/90 bg-slate-100 dark:bg-[#050A17]/80 p-3.5 text-slate-700 dark:text-slate-300 font-bold text-sm outline-none cursor-not-allowed select-none tracking-widest shadow-inner"
                      />
                      <Lock size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* EMAIL ADDRESS */}
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">EMAIL ADDRESS</label>
                    <input
                      type="email"
                      name="email"
                      value={profileForm.email}
                      onChange={handleProfileChange}
                      disabled={!isEditing}
                      placeholder="Enter email address"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800/90 bg-slate-50 dark:bg-[#050A17] p-3.5 text-slate-900 dark:text-white font-semibold text-sm outline-none focus:border-blue-500 disabled:opacity-70 transition-all shadow-inner"
                      required
                    />
                  </div>

                  {/* DESIGNATION */}
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">DESIGNATION</label>
                    <input
                      type="text"
                      name="designation"
                      value={profileForm.designation}
                      onChange={handleProfileChange}
                      disabled={!isEditing}
                      placeholder={roleLabel || "Designation"}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800/90 bg-slate-50 dark:bg-[#050A17] p-3.5 text-slate-900 dark:text-white font-semibold text-sm outline-none focus:border-blue-500 disabled:opacity-70 transition-all shadow-inner"
                    />
                  </div>

                  {/* AVATAR URL */}
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">PROFILE IMAGE URL</label>
                    <input
                      type="url"
                      name="avatar"
                      value={profileForm.avatar}
                      onChange={(e) => {
                        handleProfileChange(e);
                        setAvatarError(false);
                      }}
                      disabled={!isEditing}
                      placeholder="https://..."
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800/90 bg-slate-50 dark:bg-[#050A17] p-3.5 text-slate-900 dark:text-white font-semibold text-sm outline-none focus:border-blue-500 disabled:opacity-70 transition-all shadow-inner"
                    />
                  </div>
                </div>

                {isEditing && (
                  <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-800/80">
                    <button
                      type="submit"
                      disabled={savingProfile}
                      className="flex items-center gap-2.5 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-md shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
                    >
                      {savingProfile ? (
                        <>
                          <RefreshCcw className="animate-spin" size={15} /> SAVING CHANGES...
                        </>
                      ) : (
                        <>
                          <Save size={15} /> SAVE PERSONAL INFO
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
              <div className="bg-white dark:bg-[#091126]/95 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-indigo-500/25 shadow-xl dark:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.7),0_0_30px_2px_rgba(99,102,241,0.18)] ring-1 ring-slate-900/5 dark:ring-white/5 backdrop-blur-xl space-y-6">
                <div className="pb-4 border-b border-slate-200 dark:border-slate-800/80">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                    <User size={18} className="text-blue-500" /> Change Username (Login ID)
                  </h3>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">To update your account username, request a 6-digit verification OTP code sent to your email address.</p>
                </div>

                <div className="p-4 sm:p-5 bg-slate-50 dark:bg-[#050A17] rounded-2xl border border-slate-200 dark:border-slate-800/90 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">Request OTP Code</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">Will be sent to: <span className="text-blue-500 font-bold">{profileForm.email || "No email assigned"}</span></p>
                  </div>
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={sendingOtp || otpTimer > 0}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-md shadow-blue-500/25 transition-all cursor-pointer shrink-0 disabled:opacity-50"
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
                      <label className="block text-[11px] font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">6-DIGIT OTP CODE *</label>
                      <input
                        type="text"
                        name="otp"
                        value={usernameForm.otp}
                        onChange={handleUsernameFormChange}
                        placeholder="Enter 6-digit OTP code"
                        maxLength={6}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-800/90 bg-slate-50 dark:bg-[#050A17] p-3.5 text-slate-900 dark:text-white font-mono font-bold text-base tracking-widest outline-none focus:border-blue-500 transition-all placeholder:font-sans placeholder:font-normal placeholder:text-sm placeholder:tracking-normal shadow-inner"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">NEW USERNAME *</label>
                      <input
                        type="text"
                        name="newUsername"
                        value={usernameForm.newUsername}
                        onChange={handleUsernameFormChange}
                        placeholder="Enter new username"
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-800/90 bg-slate-50 dark:bg-[#050A17] p-3.5 text-slate-900 dark:text-white font-semibold text-sm outline-none focus:border-blue-500 transition-all shadow-inner"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={verifyingUsernameOtp}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-md shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
                    >
                      {verifyingUsernameOtp ? (
                        <>
                          <RefreshCcw className="animate-spin" size={15} /> VERIFYING OTP...
                        </>
                      ) : (
                        <>
                          <User size={15} /> VERIFY OTP & UPDATE USERNAME
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* SECTION 2: CHANGE PASSWORD VIA OTP */}
              <div className="bg-white dark:bg-[#091126]/95 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-indigo-500/25 shadow-xl dark:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.7),0_0_30px_2px_rgba(99,102,241,0.18)] ring-1 ring-slate-900/5 dark:ring-white/5 backdrop-blur-xl space-y-6">
                <div className="pb-4 border-b border-slate-200 dark:border-slate-800/80">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                    <Lock size={18} className="text-emerald-500" /> Change Account Password
                  </h3>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">To change your account password safely, verify using a 6-digit email OTP code.</p>
                </div>

                <div className="p-4 sm:p-5 bg-slate-50 dark:bg-[#050A17] rounded-2xl border border-slate-200 dark:border-slate-800/90 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">Request OTP Code</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">Will be sent to: <span className="text-blue-500 font-bold">{profileForm.email || "No email assigned"}</span></p>
                  </div>
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={sendingOtp || otpTimer > 0}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-md shadow-blue-500/25 transition-all cursor-pointer shrink-0 disabled:opacity-50"
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
                    <label className="block text-[11px] font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">6-DIGIT OTP VERIFICATION CODE *</label>
                    <input
                      type="text"
                      name="otp"
                      value={passwordForm.otp}
                      onChange={handlePasswordChange}
                      placeholder="Enter 6-digit OTP code"
                      maxLength={6}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800/90 bg-slate-50 dark:bg-[#050A17] p-3.5 text-slate-900 dark:text-white font-mono font-bold text-base tracking-widest outline-none focus:border-blue-500 transition-all placeholder:font-sans placeholder:font-normal placeholder:text-sm placeholder:tracking-normal shadow-inner"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">NEW PASSWORD *</label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          name="newPassword"
                          value={passwordForm.newPassword}
                          onChange={handlePasswordChange}
                          placeholder="Enter new password"
                          className="w-full rounded-xl border border-slate-200 dark:border-slate-800/90 bg-slate-50 dark:bg-[#050A17] p-3.5 pr-12 text-slate-900 dark:text-white font-semibold text-sm outline-none focus:border-blue-500 transition-all shadow-inner"
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
                      <label className="block text-[11px] font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">CONFIRM NEW PASSWORD *</label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          name="confirmPassword"
                          value={passwordForm.confirmPassword}
                          onChange={handlePasswordChange}
                          placeholder="Re-enter new password"
                          className="w-full rounded-xl border border-slate-200 dark:border-slate-800/90 bg-slate-50 dark:bg-[#050A17] p-3.5 pr-12 text-slate-900 dark:text-white font-semibold text-sm outline-none focus:border-blue-500 transition-all shadow-inner"
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
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-md shadow-emerald-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
                    >
                      {verifyingOtp ? (
                        <>
                          <RefreshCcw className="animate-spin" size={15} /> VERIFYING OTP & UPDATING...
                        </>
                      ) : (
                        <>
                          <Lock size={15} /> VERIFY OTP & UPDATE PASSWORD
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* SECTION 3: TRUSTED DEVICES & 14-DAY IP SESSIONS */}
              <div className="bg-white dark:bg-[#091126]/95 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-indigo-500/25 shadow-xl dark:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.7),0_0_30px_2px_rgba(99,102,241,0.18)] ring-1 ring-slate-900/5 dark:ring-white/5 backdrop-blur-xl space-y-6">
                <div className="pb-4 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                      <ShieldCheck size={18} className="text-indigo-500" /> Trusted Devices & 14-Day IP Sessions
                    </h3>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">IP addresses verified via MFA do not require email OTP for 14 days.</p>
                  </div>
                  <button
                    type="button"
                    onClick={fetchTrustedDevices}
                    className="p-2.5 bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition cursor-pointer"
                    title="Refresh List"
                  >
                    <RefreshCcw size={15} className={loadingDevices ? "animate-spin text-blue-500" : ""} />
                  </button>
                </div>

                {trustedDevices.length === 0 ? (
                  <div className="text-center py-10 bg-slate-50 dark:bg-[#050A17] rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                    <ShieldCheck size={36} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No Active 14-Day Trusted Device IPs</p>
                    <p className="text-[11px] text-slate-400 mt-1">When you log in from a new IP, complete OTP verification to trust it for 14 days.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {trustedDevices.map((device) => {
                      const daysLeft = Math.max(0, Math.ceil((new Date(device.expiresAt) - new Date()) / (1000 * 60 * 60 * 24)));
                      return (
                        <div key={device._id || device.ip} className="p-4 bg-slate-50 dark:bg-[#050A17] rounded-2xl border border-slate-200 dark:border-slate-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-slate-900 dark:text-white px-2.5 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg border border-blue-500/20">
                                IP: {device.ip}
                              </span>
                              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-md">
                                Trusted ({daysLeft} days remaining)
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
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
