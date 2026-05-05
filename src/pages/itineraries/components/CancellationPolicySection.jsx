import { useEffect } from "react";
import { ShieldX, AlertTriangle } from "lucide-react";
import { apiClient } from "../../../stores/authStores";
import { toast } from "react-toastify";

const CancellationPolicySection = ({ formData, handleInputChange, styles }) => {
    const { cardStyle, labelStyle, inputStyle } = styles;

    useEffect(() => {
        const fetchCancellationPolicy = async () => {
            try {
                const res = await apiClient.get("/admin/cancellation-policy");
                const policy = res?.data?.data?.cancellation_policy || "Standard cancellation terms apply.";
                handleInputChange({ target: { name: "cancellation_policy", value: policy } });
            } catch (error) {
                toast.error("Failed to load Cancellation Policy");
            }
        };

        if (!formData.cancellation_policy) {
            fetchCancellationPolicy();
        }
    }, [formData.cancellation_policy, handleInputChange]);

    return (
        <div className={cardStyle}>
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <ShieldX className="text-red-500" size={20} />
                    CANCELLATION POLICY
                </h2>
                <div className="px-3 py-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full text-[10px] font-black uppercase tracking-widest">
                   Risk Mitigation
                </div>
            </div>

            <div className="space-y-4">
                <label className={labelStyle}>Revocation Terms</label>
                <textarea
                    name="cancellation_policy"
                    value={formData.cancellation_policy || ""}
                    onChange={handleInputChange}
                    className={`${inputStyle} min-h-[150px] leading-relaxed border-red-50 dark:border-red-900/10 focus:ring-red-500/10`}
                    placeholder="Enter the refund and cancellation rules..."
                />
                <div className="flex items-start gap-2 p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20">
                    <AlertTriangle size={14} className="text-amber-600 mt-0.5" />
                    <p className="text-[10px] font-bold text-amber-700 dark:text-amber-500 uppercase tracking-widest leading-relaxed">
                        Note: Be explicit about non-refundable honeymoon deposits to avoid future disputes.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CancellationPolicySection;
