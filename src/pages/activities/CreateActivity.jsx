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
      "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-xs",
    labelStyle:
      "block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2",
    inputStyle:
      "w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm transition-all",
  };

  if (isLoading && isEdit) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="animate-spin text-blue-600" size={36} />
        <p className="text-sm font-bold text-slate-500">Loading activity details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate("/activities")}
            className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            title="Go back"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
              <Compass className="text-blue-600" size={24} />
              {isEdit ? "Edit Destination Activity" : "Create New Destination Activity"}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Configure dynamic things to do, ticketing, highlights, map, and schedules
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/activities")}
            className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs uppercase tracking-wider hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-blue-600/25 transition-all cursor-pointer disabled:opacity-50"
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
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="submit"
            disabled={isSaving}
            className="px-8 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm uppercase tracking-wider flex items-center gap-2 shadow-xl shadow-blue-600/30 transition-all cursor-pointer disabled:opacity-50"
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
