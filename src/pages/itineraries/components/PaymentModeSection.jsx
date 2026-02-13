import { useEffect } from "react";
import { CreditCard, Heart } from "lucide-react";
import { apiClient } from "../../../stores/authStores";
import { toast } from "react-toastify";

const PaymentModeSection = ({ formData, handleInputChange, styles }) => {
    const { cardStyle, labelStyle, inputStyle } = styles;

    useEffect(() => {
        const fetchPaymentMode = async () => {
            // Prevent overwriting manual edits
            if (!formData.travel_type || formData.payment_mode) return;

            try {
                const res = await apiClient.get(
                    `/admin/payment-mode/${formData.travel_type}`
                );
                const payment_mode =
                    res?.data?.destinationPaymentModeData?.payment_mode || "";

                if (payment_mode) {
                    handleInputChange({
                        target: {
                            name: "payment_mode",
                            value: payment_mode,
                        },
                    });
                } else {
                    toast.info(
                        "No predefined payment mode found for honeymoon trips."
                    );
                }
            } catch {
                toast.error("Failed to load Payment Mode");
            }
        };

        fetchPaymentMode();
    }, [formData.travel_type, formData.payment_mode, handleInputChange]);

    return (
        <div className={cardStyle}>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Heart className="text-pink-500" size={20} />
                Honeymoon Payment Mode
            </h2>

            <label className={labelStyle}>
                <CreditCard className="inline mr-2" size={16} />
                Payment Details
            </label>

            <textarea
                name="payment_mode"
                rows={3}
                value={formData.payment_mode || ""}
                onChange={handleInputChange}
                className={inputStyle}
                placeholder="Advance payment, balance before travel, honeymoon booking terms..."
                maxLength={50000}
            />
        </div>
    );
};

export default PaymentModeSection;
