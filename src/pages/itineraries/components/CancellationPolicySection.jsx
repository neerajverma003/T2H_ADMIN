import { useEffect } from "react";
import { ShieldX } from "lucide-react";
import { apiClient } from "../../../stores/authStores";
import { toast } from "react-toastify";

const CancellationPolicySection = ({ formData, handleInputChange, styles }) => {
    const { cardStyle, labelStyle, inputStyle } = styles;

    useEffect(() => {
        const fetchCancellationPolicy = async () => {
            try {
                const res = await apiClient.get("/admin/cancellation-policy");
                const policy =
                    res?.data?.data?.cancellation_policy ||
                    "No available cancellation policy.";

                // ✅ SAFE state update (no fake event)
                handleInputChange({
                    target: {
                        name: "cancellation_policy",
                        value: policy,
                    },
                });
            } catch (error) {
                toast.error("Failed to load Cancellation Policy");
            }
        };

        // Only fetch if empty (prevents overwriting user edits)
        if (!formData.cancellation_policy) {
            fetchCancellationPolicy();
        }
    }, [formData.cancellation_policy, handleInputChange]);

    return (
        <div className={cardStyle}>
            <h2 className="text-xl font-semibold mb-4">
                Cancellation Policy
            </h2>

            <label className={labelStyle}>
                <ShieldX className="inline mr-2" size={16} />
                Cancellation Policy
            </label>

            <textarea
                name="cancellation_policy"
                rows={4}
                value={formData.cancellation_policy || ""}
                onChange={handleInputChange}
                className={inputStyle}
                placeholder="Auto-filled from policy settings, editable for honeymoon itinerary..."
                maxLength={50000}
            />
        </div>
    );
};

export default CancellationPolicySection;
