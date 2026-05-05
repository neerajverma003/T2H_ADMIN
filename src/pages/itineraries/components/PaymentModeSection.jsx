import { useEffect } from "react";
import { CreditCard, Heart, Wallet } from "lucide-react";
import { apiClient } from "../../../stores/authStores";
import { toast } from "react-toastify";

const PaymentModeSection = ({ formData, handleInputChange, styles }) => {
    const { cardStyle, labelStyle, inputStyle } = styles;

    useEffect(() => {
        const fetchPaymentMode = async () => {
            if (!formData.travel_type || formData.payment_mode) return;
            try {
                const res = await apiClient.get(`/admin/payment-mode/${formData.travel_type}`);
                const payment_mode = res?.data?.destinationPaymentModeData?.payment_mode || "";
                if (payment_mode) {
                    handleInputChange({ target: { name: "payment_mode", value: payment_mode } });
                }
            } catch {
                toast.error("Failed to load Payment Mode");
            }
        };
        fetchPaymentMode();
    }, [formData.travel_type, formData.payment_mode, handleInputChange]);

    return (
        <div className={cardStyle}>
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <Wallet className="text-indigo-600" size={20} />
                    PAYMENT MODE
                </h2>
                <div className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-widest">
                   Financial Flow
                </div>
            </div>

            <div className="space-y-4">
                <label className={labelStyle}>Payment Collection Details</label>
                <textarea
                    name="payment_mode"
                    value={formData.payment_mode || ""}
                    onChange={handleInputChange}
                    className={`${inputStyle} min-h-[120px] leading-relaxed`}
                    placeholder="e.g. 25% booking amount, balance 15 days before travel..."
                />
            </div>
        </div>
    );
};

export default PaymentModeSection;
