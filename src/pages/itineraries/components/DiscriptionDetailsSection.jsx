import {
    Landmark,
    FileText,
    CreditCard,
    ShieldX,
    Heart,
    Sparkles
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

    const fetchTerms = async (destinationId) => {
        if (!destinationId || formData.terms_and_conditions) return;
        try {
            setLoading((p) => ({ ...p, terms: true }));
            const res = await apiClient.get(`/admin/tnc/${destinationId}`);
            const tnc = res?.data?.tnc?.terms_And_condition || "";
            setFormData((prev) => ({ ...prev, terms_and_conditions: tnc }));
        } catch {
            toast.error("Failed to load Terms & Conditions");
        } finally {
            setLoading((p) => ({ ...p, terms: false }));
        }
    };

    const fetchPaymentMode = async (travelType) => {
        if (!travelType || formData.payment_mode) return;
        try {
            setLoading((p) => ({ ...p, payment: true }));
            const res = await apiClient.get(`/admin/payment-mode/${travelType}`);
            const payment_mode = res?.data?.destinationPaymentModeData?.payment_mode || "";
            setFormData((prev) => ({ ...prev, payment_mode }));
        } catch {
            toast.error("Failed to load Payment Mode");
        } finally {
            setLoading((p) => ({ ...p, payment: false }));
        }
    };

    const fetchCancellationPolicy = async () => {
        if (formData.cancellation_policy) return;
        try {
            setLoading((p) => ({ ...p, cancellation: true }));
            const res = await apiClient.get("/admin/cancellation-policy");
            const policy = res?.data?.data?.cancellation_policy || "Standard honeymoon cancellation policy applies.";
            setFormData((prev) => ({ ...prev, cancellation_policy: policy }));
        } catch {
            toast.error("Failed to load Cancellation Policy");
        } finally {
            setLoading((p) => ({ ...p, cancellation: false }));
        }
    };

    useEffect(() => {
        fetchCancellationPolicy();
    }, []);

    useEffect(() => {
        fetchTerms(formData.selected_destination_id);
    }, [formData.selected_destination_id]);

    useEffect(() => {
        fetchPaymentMode(formData.travel_type);
    }, [formData.travel_type]);

    return (
        <div className={cardStyle}>
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="text-indigo-600" size={20} />
                    DESTINATION NARRATIVE
                </h2>
                <div className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-widest">
                   The Experience
                </div>
            </div>

            <div className="space-y-10">
                {/* Destination Detail */}
                <div>
                    <label htmlFor="destination_detail" className={labelStyle}><Landmark size={14} /> Destination Overview</label>
                    <textarea
                        id="destination_detail"
                        name="destination_detail"
                        value={formData.destination_detail}
                        onChange={handleInputChange}
                        className={`${inputStyle} min-h-[180px] text-lg leading-relaxed ${errors.destination_detail ? "ring-2 ring-red-500" : ""}`}
                        placeholder="Craft a romantic story about this destination..."
                    />
                    {errors.destination_detail && <p className="mt-2 text-[10px] font-bold text-red-500 uppercase tracking-widest">{errors.destination_detail}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-slate-50 dark:border-slate-800">
                    {/* Terms & Conditions */}
                    <div>
                        <label htmlFor="terms_and_conditions" className={labelStyle}><FileText size={14} /> Quick Terms</label>
                        <textarea
                            id="terms_and_conditions"
                            name="terms_and_conditions"
                            value={formData.terms_and_conditions || ""}
                            onChange={handleInputChange}
                            className={`${inputStyle} min-h-[100px] text-xs`}
                            placeholder={loading.terms ? "Syncing..." : "Booking terms..."}
                        />
                    </div>

                    {/* Payment Mode */}
                    <div>
                        <label htmlFor="payment_mode" className={labelStyle}><CreditCard size={14} /> Payment Overview</label>
                        <textarea
                            id="payment_mode"
                            name="payment_mode"
                            value={formData.payment_mode || ""}
                            onChange={handleInputChange}
                            className={`${inputStyle} min-h-[100px] text-xs`}
                            placeholder={loading.payment ? "Syncing..." : "Collection terms..."}
                        />
                    </div>
                </div>

                {/* Cancellation Policy */}
                <div>
                    <label htmlFor="cancellation_policy" className={labelStyle}><ShieldX size={14} /> Cancellation Summary</label>
                    <textarea
                        id="cancellation_policy"
                        name="cancellation_policy"
                        value={formData.cancellation_policy || ""}
                        onChange={handleInputChange}
                        className={`${inputStyle} min-h-[100px] text-xs`}
                        placeholder={loading.cancellation ? "Syncing..." : "Cancellation rules..."}
                    />
                </div>
            </div>
        </div>
    );
};

export default DescriptionsSection;
