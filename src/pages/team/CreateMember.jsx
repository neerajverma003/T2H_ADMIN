import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { convertImageFileToWebP } from "../../utils/imageConverter";
import {
  UploadCloud, Loader2, User, Briefcase, Linkedin, Instagram, ArrowLeft, X, Replace,
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
    "w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500";

  useEffect(() => {
    if (isEditMode) fetchMemberById(id);
    return () => clearMemberToEdit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

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
        } catch (err) {
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
    } catch (error) {
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 sm:p-10">
      <div className="max-w-3xl mx-auto flex flex-col gap-8">
        <button
          onClick={() => navigate("/team/list")}
          className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors w-fit text-sm font-semibold"
        >
          <ArrowLeft size={16} />
          Back to Team List
        </button>

        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{isEditMode ? "Edit" : "Add"} Team Member</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            {isEditMode ? "Update this member's profile." : "Add a new member to the team directory."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 flex flex-col gap-8 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                <User size={14} /> Full Name
              </label>
              <input
                type="text" value={name} onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Priya Sharma"
                className={inputClasses}
                required
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                <Briefcase size={14} /> Designation
              </label>
              <input
                type="text" value={designation} onChange={(e) => setDesignation(e.target.value)}
                placeholder="e.g., Co-Founder"
                className={inputClasses}
                required
              />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
              Profile Image
            </label>
            <div className="relative w-40">
              <label
                htmlFor="member-avatar-upload"
                className="relative flex flex-col items-center justify-center w-40 h-40 border-2 border-dashed rounded-2xl cursor-pointer bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 overflow-hidden hover:border-indigo-500 transition-colors"
              >
                {imagePreview ? (
                  <div className="relative w-full h-full group">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center transition-all">
                      <Replace size={18} className="text-white opacity-0 group-hover:opacity-100" />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <UploadCloud size={28} />
                    <p className="text-[10px] font-bold uppercase tracking-wide">Upload Image</p>
                  </div>
                )}
                <input id="member-avatar-upload" type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
              </label>
              {imagePreview && (
                <button
                  type="button" onClick={handleRemoveImage}
                  className="absolute -top-2 -right-2 size-7 rounded-full bg-red-500 text-white flex items-center justify-center shadow-md border-2 border-white dark:border-slate-900"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                <Linkedin size={14} /> LinkedIn URL
              </label>
              <input
                type="url" value={linkedin} onChange={(e) => setLinkedin(e.target.value)}
                placeholder="https://linkedin.com/in/..."
                className={inputClasses}
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                <Instagram size={14} /> Instagram URL
              </label>
              <input
                type="url" value={instagram} onChange={(e) => setInstagram(e.target.value)}
                placeholder="https://instagram.com/..."
                className={inputClasses}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2 block">Display Order</label>
              <input
                type="number" value={order} onChange={(e) => setOrder(e.target.value)}
                className={inputClasses}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2 block">Visibility</label>
              <button
                type="button" onClick={() => setStatus((s) => !s)}
                className={`w-full flex items-center justify-between rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors ${status
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

          <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="submit" disabled={isLoading || isSubmitting}
              className="flex items-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-semibold text-sm shadow-lg shadow-indigo-600/20 disabled:opacity-60"
            >
              {(isLoading || isSubmitting) && <Loader2 size={16} className="animate-spin" />}
              {isEditMode ? "Update Member" : "Add to Team"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateMember;