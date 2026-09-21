import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ArrowLeft, Save, Loader2, Compass } from "lucide-react";
import { useActivityStore } from "../../stores/useActivityStore";
import {
  ActivityCoreDetailsSection,
  ActivityPricingSection,
  ActivityMediaSection,
  ActivityHighlightsSection,
  ActivityOperatingHoursSection,
  ActivityGuidelinesSection,
  ActivityLocationMapSection,
  ActivityPolicySection,
} from "./components";

const CreateActivity = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const { createActivity, updateActivity, fetchActivityById, isSaving, isLoading } =
    useActivityStore();

  const [formData, setFormData] = useState({
    title: "",
    short_description: "",
    activity_type: "public",
    destination_type: "domestic",
    selected_destination: "",
    city: "",
    duration: "",
    pricing: {
      selling_price: "",
      original_price: "",
      discount_label: "",
      price_unit: "per person",
      currency: "INR",
    },
    highlights: [],
    operating_hours: {
      location_name: "",
      days: ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"],
      timings: "24 Hours",
    },
    know_before_you_go: [],
    location_details: {
      starting_point: "",
      address: "",
      map_link: "",
      map_embed_url: "",
    },
    website_link: "",
    cancellation_policy: [],
    cover_image: "",
    gallery_images: [],
    badges: ["Mobile Tickets", "Best Price Guaranteed", "Travellers Choice"],
    rating: 4.9,
    review_count: 120,
    is_featured: false,
    status: "active",
  });

  const [errors, setErrors] = useState({});

  // Scroll to top
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  // Fetch for Edit
  useEffect(() => {
    if (!id) return;

    const loadActivity = async () => {
      const data = await fetchActivityById(id);
      if (data) {
        setFormData({
          title: data.title || "",
          short_description: data.short_description || data.description || "",
          activity_type: data.activity_type || "public",
          destination_type: data.destination_type || "domestic",
          selected_destination: data.selected_destination?._id || data.selected_destination || "",
          city: data.city?._id || data.city || "",
          duration: data.duration || "",
          pricing: {
            selling_price: data.pricing?.selling_price ?? "",
            original_price: data.pricing?.original_price ?? "",
            discount_label: data.pricing?.discount_label || "",
            price_unit: data.pricing?.price_unit || "per person",
            currency: data.pricing?.currency || "INR",
          },
          highlights: data.highlights || [],
          operating_hours: {
            location_name: data.operating_hours?.location_name || "",
            days: data.operating_hours?.days || ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"],
            timings: data.operating_hours?.timings || "24 Hours",
          },
          know_before_you_go: data.know_before_you_go || [],
          location_details: {
            starting_point: data.location_details?.starting_point || "",
            address: data.location_details?.address || "",
            map_link: data.location_details?.map_link || "",
            map_embed_url: data.location_details?.map_embed_url || "",
          },
          website_link: data.website_link || "",
          cancellation_policy: Array.isArray(data.cancellation_policy)
            ? data.cancellation_policy
            : (typeof data.cancellation_policy === "string" && data.cancellation_policy.trim()
              ? data.cancellation_policy.split("\n").map((s) => s.trim()).filter(Boolean)
              : []),
          cover_image: data.cover_image || "",
          gallery_images: data.gallery_images || [],
          badges: data.badges || ["Mobile Tickets", "Best Price Guaranteed", "Travellers Choice"],
          rating: data.rating ?? 4.9,
          review_count: data.review_count ?? 120,
          is_featured: Boolean(data.is_featured),
          status: data.status || "active",
        });
      }
    };

    loadActivity();
  }, [id, fetchActivityById]);

  // General Input Handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Pricing Handler
  const handlePricingChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      pricing: { ...prev.pricing, [name]: value },
    }));
    if (name === "selling_price" && errors.selling_price) {
      setErrors((prev) => ({ ...prev, selling_price: "" }));
    }
  };

  // Operating Hours Handler
  const handleOperatingHoursChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      operating_hours: { ...prev.operating_hours, [name]: value },
    }));
  };

  const handleDaysToggle = (day) => {
    setFormData((prev) => {
      const currentDays = prev.operating_hours?.days || [];
      const updated = currentDays.includes(day)
        ? currentDays.filter((d) => d !== day)
        : [...currentDays, day];
      return {
        ...prev,
        operating_hours: { ...prev.operating_hours, days: updated },
      };
    });
  };

  // Location Details Handler
  const handleLocationChange = (e) => {
    const { name, value } = e.target;
    let cleanVal = value;
    if (cleanVal && typeof cleanVal === "string" && cleanVal.includes("<iframe")) {
      const match = cleanVal.match(/src=["'](.*?)["']/i);
      if (match && match[1]) {
        cleanVal = match[1];
      }
    }
    setFormData((prev) => ({
      ...prev,
      location_details: { ...prev.location_details, [name]: cleanVal },
    }));
  };

  // Validation
  const validate = () => {
    const errs = {};
    if (!formData.title?.trim()) errs.title = "Activity title is required";
    if (!formData.selected_destination) errs.selected_destination = "Destination is required";
    if (
      formData.pricing?.selling_price === "" ||
      formData.pricing?.selling_price === undefined ||
      Number(formData.pricing?.selling_price) < 0
    ) {
      errs.selling_price = "Valid selling price is required";
    }
    if (!formData.cover_image?.trim()) errs.cover_image = "Cover image is required";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Helper to extract src if iframe is provided
  const extractIframeSrc = (val) => {
    if (!val || typeof val !== "string") return val || "";
    if (val.includes("<iframe")) {
      const match = val.match(/src=["'](.*?)["']/i);
      if (match && match[1]) return match[1];
    }
    return val.trim();
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fill in all required fields marked with *");
      return;
    }

    const payload = {
      ...formData,
      location_details: {
        ...formData.location_details,
        map_embed_url: extractIframeSrc(formData.location_details?.map_embed_url),
        map_link: extractIframeSrc(formData.location_details?.map_link),
      },
      pricing: {
        ...formData.pricing,
        selling_price: Number(formData.pricing.selling_price),
        original_price: Number(formData.pricing.original_price) || 0,
      },
    };

    let res;
    if (isEdit) {
      res = await updateActivity(id, payload);
    } else {
      res = await createActivity(payload);
    }

    if (res?.success) {
      navigate("/activities");
    }
  };

  const styles = {
    cardStyle:
      "bg-white dark:bg-[#091126]/95 rounded-3xl p-6 md:p-8 border border-slate-200/90 dark:border-indigo-500/25 shadow-xl dark:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.7),0_0_30px_2px_rgba(99,102,241,0.18)] ring-1 ring-slate-900/5 dark:ring-white/5 backdrop-blur-xl space-y-6 transition-all",
    labelStyle:
      "flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2 ml-0.5",
    inputStyle:
      "w-full rounded-2xl border border-slate-200 dark:border-slate-800/90 bg-slate-50/90 dark:bg-[#050A17] p-3.5 text-sm font-semibold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-[#050A17] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 placeholder:font-normal shadow-inner hover:border-indigo-500/40 disabled:opacity-60 disabled:cursor-not-allowed",
  };

  if (isLoading && isEdit) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="size-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.25)]">
          <Loader2 className="animate-spin text-indigo-400" size={36} strokeWidth={2} />
        </div>
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400">Loading activity details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8 pb-20 font-sans">
      {/* Top Header Card & Actions */}
      <div className="bg-white dark:bg-[#091126]/95 rounded-3xl py-4 sm:py-5 px-6 sm:px-8 border border-slate-200/90 dark:border-indigo-500/25 shadow-xl dark:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.7),0_0_30px_2px_rgba(99,102,241,0.18)] ring-1 ring-slate-900/5 dark:ring-white/5 backdrop-blur-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <button
              type="button"
              onClick={() => navigate("/activities")}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 uppercase tracking-wider transition-colors mb-1.5 group cursor-pointer"
            >
              <ArrowLeft size={13} className="group-hover:-translate-x-1 transition-transform" />
              Back to Activities
            </button>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-500/30 shrink-0">
                <Compass size={22} />
              </div>
              <span>
                {isEdit ? (
                  <>Edit Destination <span className="text-blue-500">Activity</span></>
                ) : (
                  <>New Destination <span className="text-blue-500">Activity</span></>
                )}
              </span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-semibold mt-1 text-xs sm:text-sm">
              Configure dynamic things to do, ticketing, highlights, map, and schedules.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/activities")}
              className="px-6 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#050A17] hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSaving}
              className="px-8 py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl font-black text-xs shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 hover:scale-[1.02] active:scale-[0.98] uppercase tracking-wider transition-all flex items-center gap-2.5 cursor-pointer disabled:opacity-70 disabled:cursor-wait"
            >
              {isSaving ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>{isEdit ? "Update Activity" : "Publish Activity"}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Form Sections (Modular Components) */}
      <form onSubmit={handleSubmit} className="space-y-8">
        <ActivityCoreDetailsSection
          formData={formData}
          handleInputChange={handleInputChange}
          styles={styles}
          errors={errors}
        />

        <ActivityPricingSection
          formData={formData}
          handlePricingChange={handlePricingChange}
          styles={styles}
          errors={errors}
        />

        <ActivityMediaSection
          formData={formData}
          handleInputChange={handleInputChange}
          styles={styles}
          errors={errors}
        />

        <ActivityHighlightsSection
          formData={formData}
          handleInputChange={handleInputChange}
          styles={styles}
        />

        <ActivityOperatingHoursSection
          formData={formData}
          handleOperatingHoursChange={handleOperatingHoursChange}
          handleDaysToggle={handleDaysToggle}
          styles={styles}
        />

        <ActivityGuidelinesSection
          formData={formData}
          handleInputChange={handleInputChange}
          styles={styles}
        />

        <ActivityLocationMapSection
          formData={formData}
          handleLocationChange={handleLocationChange}
          handleInputChange={handleInputChange}
          styles={styles}
        />

        <ActivityPolicySection
          formData={formData}
          handleInputChange={handleInputChange}
          styles={styles}
        />

        {/* Bottom Save Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-800/80">
          <button
            type="button"
            onClick={() => navigate("/activities")}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl border border-slate-800 bg-[#050A17] hover:bg-slate-800/60 text-slate-400 hover:text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
          >
            Cancel & Return
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="w-full sm:w-auto px-9 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:opacity-95 text-white font-bold text-xs shadow-xl shadow-indigo-600/30 uppercase tracking-wider transition-all flex items-center justify-center gap-2.5 cursor-pointer active:scale-[0.98] disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                <span>Saving Activity...</span>
              </>
            ) : (
              <>
                <Save size={18} />
                <span>{isEdit ? "Update Activity" : "Publish Activity"}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateActivity;
