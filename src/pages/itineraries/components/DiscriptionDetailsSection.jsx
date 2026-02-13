import {
    Landmark,
    FileText,
    CreditCard,
    ShieldX,
    Heart,
} from "lucide-react";
import { useEffect, useState } from "react";
import { apiClient } from "../../../stores/authStores";
import { toast } from "react-toastify";

const DescriptionsSection = ({
    formData,
    handleInputChange,
    styles,
    setFormData,
    errors = {},
}) => {
    const { cardStyle, labelStyle, inputStyle } = styles;

    const [loading, setLoading] = useState({
        terms: false,
        payment: false,
        cancellation: false,
    });

    // =====================
    // Fetch Terms
    // =====================
    const fetchTerms = async (destinationId) => {
        if (!destinationId || formData.terms_and_conditions) return;

        try {
            setLoading((p) => ({ ...p, terms: true }));
            const res = await apiClient.get(`/admin/tnc/${destinationId}`);
            const tnc = res?.data?.tnc?.terms_And_condition || "";

            setFormData((prev) => ({
                ...prev,
                terms_and_conditions: tnc,
            }));

            if (!tnc) toast.info("No destination-specific terms found.");
        } catch {
            toast.error("Failed to load Terms & Conditions");
        } finally {
            setLoading((p) => ({ ...p, terms: false }));
        }
    };

    // =====================
    // Fetch Payment Mode
    // =====================
    const fetchPaymentMode = async (travelType) => {
        if (!travelType || formData.payment_mode) return;

        try {
            setLoading((p) => ({ ...p, payment: true }));
            const res = await apiClient.get(`/admin/payment-mode/${travelType}`);
            const payment_mode =
                res?.data?.destinationPaymentModeData?.payment_mode || "";

            setFormData((prev) => ({ ...prev, payment_mode }));

            if (!payment_mode)
                toast.info("No payment mode configured for honeymoon trips.");
        } catch {
            toast.error("Failed to load Payment Mode");
        } finally {
            setLoading((p) => ({ ...p, payment: false }));
        }
    };

    // =====================
    // Fetch Cancellation Policy
    // =====================
    const fetchCancellationPolicy = async () => {
        if (formData.cancellation_policy) return;

        try {
            setLoading((p) => ({ ...p, cancellation: true }));
            const res = await apiClient.get("/admin/cancellation-policy");
            const policy =
                res?.data?.data?.cancellation_policy ||
                "Standard honeymoon cancellation policy applies.";

            setFormData((prev) => ({
                ...prev,
                cancellation_policy: policy,
            }));
        } catch {
            toast.error("Failed to load Cancellation Policy");
        } finally {
            setLoading((p) => ({ ...p, cancellation: false }));
        }
    };

    // =====================
    // Effects
    // =====================
    useEffect(() => {
        fetchCancellationPolicy();
    }, []);

    useEffect(() => {
        fetchTerms(formData.selected_destination_id);
    }, [formData.selected_destination_id]);

    useEffect(() => {
        fetchPaymentMode(formData.travel_type);
    }, [formData.travel_type]);

    // =====================
    // Render
    // =====================
    return (
        <div className={`${cardStyle} space-y-6`}>
            <h2 className="text-xl font-semibold border-b border-gray-700 pb-2 flex items-center gap-2">
                <Heart className="text-pink-500" size={20} />
                Honeymoon Destination Details
            </h2>

            {/* Destination Detail */}
            <div>
                <label
                    htmlFor="destination_detail"
                    className={labelStyle}
                >
                    <Landmark className="inline mr-2" size={16} />
                    Destination Overview
                </label>
                <textarea
                    id="destination_detail"
                    name="destination_detail"
                    rows={4}
                    value={formData.destination_detail}
                    onChange={handleInputChange}
                    className={`${inputStyle} ${
                        errors.destination_detail
                            ? "border-red-500"
                            : ""
                    }`}
                    placeholder="Describe why this destination is perfect for a romantic honeymoon..."
                    maxLength={50000}
                />
                {errors.destination_detail && (
                    <p className="text-red-500 text-sm mt-1">
                        {errors.destination_detail}
                    </p>
                )}
            </div>

            {/* Terms & Conditions */}
            <div>
                <label
                    htmlFor="terms_and_conditions"
                    className={labelStyle}
                >
                    <FileText className="inline mr-2" size={16} />
                    Terms & Conditions
                </label>
                <textarea
                    id="terms_and_conditions"
                    name="terms_and_conditions"
                    rows={4}
                    value={formData.terms_and_conditions || ""}
                    onChange={handleInputChange}
                    className={inputStyle}
                    placeholder={
                        loading.terms
                            ? "Loading honeymoon terms..."
                            : "Terms & conditions for this honeymoon itinerary"
                    }
                />
            </div>

            {/* Payment Mode */}
            <div>
                <label htmlFor="payment_mode" className={labelStyle}>
                    <CreditCard className="inline mr-2" size={16} />
                    Payment Mode
                </label>
                <textarea
                    id="payment_mode"
                    name="payment_mode"
                    rows={2}
                    value={formData.payment_mode || ""}
                    onChange={handleInputChange}
                    className={inputStyle}
                    placeholder={
                        loading.payment
                            ? "Loading payment mode..."
                            : "Payment terms for honeymoon booking"
                    }
                />
            </div>

            {/* Cancellation Policy */}
            <div>
                <label
                    htmlFor="cancellation_policy"
                    className={labelStyle}
                >
                    <ShieldX className="inline mr-2" size={16} />
                    Cancellation Policy
                </label>
                <textarea
                    id="cancellation_policy"
                    name="cancellation_policy"
                    rows={3}
                    value={formData.cancellation_policy || ""}
                    onChange={handleInputChange}
                    className={inputStyle}
                    placeholder={
                        loading.cancellation
                            ? "Loading cancellation policy..."
                            : "Cancellation rules for honeymoon itinerary"
                    }
                />
            </div>
        </div>
    );
};

export default DescriptionsSection;
