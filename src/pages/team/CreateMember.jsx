import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { convertImageFileToWebP } from "../../utils/imageConverter";
import {
  UploadCloud, Loader2, User, Briefcase, Linkedin, Instagram, ArrowLeft, X, Replace, UserPlus,
} from "lucide-react";
import { toast } from "react-toastify";
import { useTeamStore } from "../../stores/teamStore";
import { ENV } from "../../constants/api";
import { getCdnUrl } from "../../utils/media";

const CreateMember = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const {
    isLoading, isFetchingDetails, memberToEdit,
    fetchMemberById, addTeamMember, updateTeamMember, clearMemberToEdit,
  } = useTeamStore();

  const [name, setName] = useState("");
  const [designation, setDesignation] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [instagram, setInstagram] = useState("");
  const [status, setStatus] = useState(true);
  const [order, setOrder] = useState(0);

  const [imageFile, setImageFile] = useState(null);
  const [imageKey, setImageKey] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const inputClasses =
    "w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all";

  useEffect(() => {
    if (isEditMode) fetchMemberById(id);
    return () => clearMemberToEdit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (isEditMode && memberToEdit) {
      setName(memberToEdit.name || "");
      setDesignation(memberToEdit.designation || "");
      setLinkedin(memberToEdit.socialLinks?.linkedin || "");
      setInstagram(memberToEdit.socialLinks?.instagram || "");
      setStatus(memberToEdit.status ?? true);
      setOrder(memberToEdit.order ?? 0);
      setImageKey(memberToEdit.image || "");
      setImagePreview(getCdnUrl(memberToEdit.image));
    }
  }, [memberToEdit, isEditMode]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImageKey("");
    setImagePreview("");
    const input = document.getElementById("member-avatar-upload");
    if (input) input.value = "";
  };

  const uploadImageIfNeeded = async () => {
    if (!imageFile) return imageKey || "";
    const folder = `team/${name.replace(/\s+/g, "_") || "member"}`;
    const presignedRes = await fetch(`${ENV.API_BASE_URL}/admin/generate-presigned-url`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ fileName: imageFile.name, fileType: imageFile.type, folder }),
    });
    if (!presignedRes.ok) throw new Error("Failed to get upload URL");
    const imageToUpload = await convertImageFileToWebP(imageFile);
    const { uploadUrl, key } = await presignedRes.json();
    await fetch(uploadUrl, { method: "PUT", body: imageToUpload, headers: { "Content-Type": imageToUpload.type } });
    return key;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !designation.trim()) {
      toast.error("Name and Designation are required.");
      return;
    }
    if (!isEditMode && !imageFile) {
      toast.error("Please upload a profile image.");
      return;
    }

    setIsSubmitting(true);
    try {
      let finalImageKey = imageKey;
      if (imageFile) {
        const toastId = toast.loading("Uploading image...");
        try {
          finalImageKey = await uploadImageIfNeeded();
          toast.dismiss(toastId);
          toast.success("Image uploaded!");
        } catch {
          toast.dismiss(toastId);
          toast.error("Image upload failed!");
          setIsSubmitting(false);
          return;
        }
      }

      const payload = {
        name: name.trim(),
        designation: designation.trim(),
        image: finalImageKey,
        socialLinks: { linkedin: linkedin.trim(), instagram: instagram.trim() },
        status,
        order: Number(order) || 0,
      };

      const result = isEditMode
        ? await updateTeamMember(id, payload)
        : await addTeamMember(payload);

      if (result.success) {
        toast.success(result.message || (isEditMode ? "Team member updated." : "Team member added."));
        navigate("/team/list");
      } else {
        toast.error(result.message || "Something went wrong.");
      }
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isEditMode && isFetchingDetails) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        <p className="text-sm font-semibold text-slate-400">Loading member details...</p>
      </div>
    );
  }

  return (
    <div className="w-full text-slate-900 dark:text-slate-100 p-6 sm:p-10 font-sans">
      <div className="max-w-6xl mx-auto flex flex-col gap-8">
        {/* Header bar */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <UserPlus className="text-indigo-600 dark:text-indigo-400" size={28} />
              {isEditMode ? "Edit" : "Add"} Team Member
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              {isEditMode ? "Update this member's profile and credentials." : "Add a new member to the team directory."}
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/team/list")}
            className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-600 text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-full font-semibold text-sm shadow-sm transition-all w-fit cursor-pointer"
          >
            <ArrowLeft size={18} /> Back to Team List
          </button>
        </div>

        {/* Form Card */}
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Photo & Publishing Settings */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              <div>
                <label className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
                  Profile Image {!isEditMode && <span className="text-rose-500">*</span>}
                </label>
                <div className="relative w-full max-w-[220px] aspect-square">
                  <label
                    htmlFor="member-avatar-upload"
                    className="relative flex flex-col items-center justify-center w-full h-full border-2 border-dashed rounded-2xl cursor-pointer bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 overflow-hidden hover:border-indigo-500 transition-colors group"
                  >
                    {imagePreview ? (
                      <div className="relative w-full h-full">
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all">
                          <Replace size={20} className="text-white mb-1" />
                          <span className="text-xs font-bold text-white uppercase tracking-wider">Change Photo</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-slate-400 p-4 text-center">
                        <UploadCloud size={32} className="text-indigo-500 dark:text-indigo-400" />
                        <p className="text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">Upload Photo</p>
                        <p className="text-[11px] text-slate-400">PNG, JPG, or WebP</p>
                      </div>
                    )}
                    <input id="member-avatar-upload" type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                  </label>
                  {imagePreview && (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute -top-2 -right-2 size-7 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-md border-2 border-white dark:border-slate-900 hover:bg-rose-600 transition-colors cursor-pointer"
                      title="Remove image"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2 block">
                  Display Order
                </label>
                <input
                  type="number"
                  value={order}
                  onChange={(e) => setOrder(e.target.value)}
                  className={inputClasses}
                  placeholder="0"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2 block">
                  Visibility
                </label>
                <button
                  type="button"
                  onClick={() => setStatus((s) => !s)}
                  className={`w-full flex items-center justify-between rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors cursor-pointer ${
                    status
                      ? "border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400"
                      : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                  }`}
                >
                  <span>{status ? "Visible on website" : "Hidden"}</span>
                  <span className={`w-9 h-5 rounded-full relative transition-colors ${status ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600"}`}>
                    <span className={`absolute top-0.5 size-4 rounded-full bg-white transition-all ${status ? "left-4" : "left-0.5"}`} />
                  </span>
                </button>
              </div>
            </div>

            {/* Right Column: Member Details & Actions */}
            <div className="lg:col-span-8 flex flex-col justify-between gap-6">
              <div className="flex flex-col gap-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                      <User size={14} className="text-indigo-600 dark:text-indigo-400" /> Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g., Priya Sharma"
                      className={inputClasses}
                      required
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                      <Briefcase size={14} className="text-indigo-600 dark:text-indigo-400" /> Designation <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      placeholder="e.g., Co-Founder"
                      className={inputClasses}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                      <Linkedin size={14} className="text-sky-600" /> LinkedIn URL
                    </label>
                    <input
                      type="url"
                      value={linkedin}
                      onChange={(e) => setLinkedin(e.target.value)}
                      placeholder="https://linkedin.com/in/..."
                      className={inputClasses}
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                      <Instagram size={14} className="text-pink-500" /> Instagram URL
                    </label>
                    <input
                      type="url"
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value)}
                      placeholder="https://instagram.com/..."
                      className={inputClasses}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800 mt-6 lg:mt-auto">
                <button
                  type="button"
                  onClick={() => navigate("/team/list")}
                  className="px-6 py-2.5 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-sm transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || isSubmitting}
                  className="flex items-center gap-2 px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-semibold text-sm shadow-lg shadow-indigo-600/20 disabled:opacity-60 transition-all cursor-pointer"
                >
                  {(isLoading || isSubmitting) && <Loader2 size={16} className="animate-spin" />}
                  {isEditMode ? "Update Member" : "Add to Team"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateMember;