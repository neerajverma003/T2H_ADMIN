import {
  Landmark,
  ListPlus,
  Ban,
  FileText,
  CreditCard,
  ShieldX,
} from "lucide-react";
import { useEffect, useState } from "react";
import { apiClient } from "../../../stores/authStore";
import { toast } from "react-toastify";

const DescriptionsSection = ({
  formData,
  handleInputChange,
  styles,
  setFormData,
}) => {
  const { cardStyle, labelStyle, inputStyle } = styles;
  const [termsLoading, setTermsLoading] = useState(false);

  // 🔹 Logic unchanged (fetch terms, payment, cancellation)
  const fetchTermsContent = async () => {
    const destinationId = formData.selected_destination_id;
    if (!destinationId) return;

    try {
      setTermsLoading(true);
      const res = await apiClient.get(`/admin/tnc/${destinationId}`);

      if (res.data?.tnc?.terms_And_condition) {
        setFormData((prev) => ({
          ...prev,
          terms_and_conditions: res.data.tnc.terms_And_condition,
        }));
      } else {
        setFormData((prev) => ({ ...prev, terms_and_conditions: "" }));
        toast.warning("No Terms & Conditions found for this destination.");
      }
    } catch {
      toast.error("Failed to load Terms & Conditions");
    } finally {
      setTermsLoading(false);
    }
  };

  const fetchPaymentMode = async (travelType) => {
    if (!travelType) return;
    try {
      setTermsLoading(true);
      const res = await apiClient.get(`/admin/payment-mode/${travelType}`);
      if (res?.data?.destinationPaymentModeData?.payment_mode) {
        setFormData((prev) => ({
          ...prev,
          payment_mode:
            res?.data?.destinationPaymentModeData?.payment_mode,
        }));
      } else {
        toast.warning("No Payment Mode found for this destination.");
      }
    } catch {
      toast.error("Failed to load Payment Mode");
    } finally {
      setTermsLoading(false);
    }
  };

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await apiClient.get("/admin/cancellation-policy");
        if (res?.data?.data?.cancellation_policy) {
          setFormData((prev) => ({
            ...prev,
            cancellation_policy:
              res?.data?.data?.cancellation_policy,
          }));
        }
      } catch {
        toast.error("Failed to load cancellation policy.");
      }
    };
    fetchContent();
  }, []);

  useEffect(() => {
    if (formData.selected_destination_id) {
      fetchTermsContent();
    } else {
      setFormData((prev) => ({ ...prev, terms_and_conditions: "" }));
    }
  }, [formData.selected_destination_id]);

  useEffect(() => {
    if (formData.travel_type) {
      fetchPaymentMode(formData.travel_type);
    }
  }, [formData.travel_type]);

  return (
    <div
      className={`${cardStyle} space-y-5 border-pink-200 dark:border-pink-900`}
    >
      <h2 className="mb-4 border-b border-pink-200 pb-2 text-xl font-bold text-pink-600 dark:border-pink-900">
        Honeymoon Descriptions 💕
      </h2>

      {/* Destination Detail */}
      <div>
        <label className={labelStyle}>
          <Landmark className="mr-2 inline text-pink-500" size={16} />
          Destination Overview
        </label>
        <textarea
          name="destination_detail"
          rows="4"
          value={formData.destination_detail || ""}
          onChange={handleInputChange}
          className={`${inputStyle} focus:ring-pink-300`}
          placeholder="Romantic highlights, scenic beauty, special honeymoon experiences…"
        />
      </div>

      {/* Inclusions */}
      <div>
        <label className={labelStyle}>
          <ListPlus className="mr-2 inline text-pink-500" size={16} />
          Honeymoon Inclusions
          <span className="ml-1 text-xs text-muted-foreground">
            (comma separated)
          </span>
        </label>
        <textarea
          name="inclusion"
          rows="4"
          value={formData.inclusion || ""}
          onChange={handleInputChange}
          className={`${inputStyle} focus:ring-pink-300`}
          placeholder="Candlelight dinner, flower bed decoration, private transfers…"
        />
      </div>

      {/* Exclusions */}
      <div>
        <label className={labelStyle}>
          <Ban className="mr-2 inline text-pink-500" size={16} />
          Exclusions
          <span className="ml-1 text-xs text-muted-foreground">
            (comma separated)
          </span>
        </label>
        <textarea
          name="exclusion"
          rows="4"
          value={formData.exclusion || ""}
          onChange={handleInputChange}
          className={`${inputStyle} focus:ring-pink-300`}
          placeholder="Personal expenses, tips, optional activities…"
        />
      </div>

      {/* Terms & Conditions */}
      <div>
        <label className={labelStyle}>
          <FileText className="mr-2 inline text-pink-500" size={16} />
          Terms & Conditions
        </label>
        <textarea
          name="terms_and_conditions"
          rows="4"
          value={formData.terms_and_conditions || ""}
          className={inputStyle}
          readOnly
          placeholder={
            termsLoading
              ? "Loading honeymoon terms…"
              : "Terms will be auto-filled based on destination."
          }
        />
      </div>

      {/* Payment Mode */}
      <div>
        <label className={labelStyle}>
          <CreditCard className="mr-2 inline text-pink-500" size={16} />
          Payment Mode
        </label>
        <textarea
          name="payment_mode"
          rows="3"
          value={formData.payment_mode || ""}
          className={inputStyle}
          readOnly
          placeholder="Payment details will be auto-filled."
        />
      </div>

      {/* Cancellation Policy */}
      <div>
        <label className={labelStyle}>
          <ShieldX className="mr-2 inline text-pink-500" size={16} />
          Cancellation Policy
        </label>
        <textarea
          name="cancellation_policy"
          rows="4"
          value={
            formData.cancellation_policy ||
            "No available cancellation policy."
          }
          className={inputStyle}
          readOnly
          placeholder="Auto-filled cancellation policy."
        />
      </div>
    </div>
  );
};

export default DescriptionsSection;
