import { FileText, Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { apiClient } from "../../../stores/authStores";
import { toast } from "react-toastify";

const TermsSection = ({ formData, handleInputChange, styles }) => {
    const { cardStyle, labelStyle, inputStyle } = styles;

    const [loading, setLoading] = useState(false);
    const [loadError, setLoadError] = useState("");

    const fetchTerms = async (destinationId) => {
        if (!destinationId || formData.terms_and_conditions) return;

        const callDestId = destinationId;
        setLoading(true);

        try {
            const res = await apiClient.get(`/admin/tnc/${callDestId}`);

            if (
                res?.data?.success &&
                res?.data?.tnc &&
                formData.selected_destination_id === callDestId
            ) {
                handleInputChange({
                    target: {
                        name: "terms_and_conditions",
                        value: res.data.tnc.terms_And_condition || "",
                    },
                });
                setLoadError("");
                return;
            }

            const msg = "No Terms & Conditions found for this destination.";
            setLoadError(msg);
            toast.info(msg);
        } catch (err) {
            const message =
                err?.response?.data?.message ||
                err.message ||
                "Failed to load Terms & Conditions";
            setLoadError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTerms(formData.selected_destination_id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData.selected_destination_id]);

    return (
        <div className={cardStyle}>
            <h2 className="text-xl font-semibold mb-4 border-b border-gray-700 pb-2 flex items-center gap-2">
                <Heart className="text-pink-500" size={20} />
                Honeymoon Terms & Conditions
            </h2>

            <label className={labelStyle}>
                <FileText className="inline mr-2" size={16} />
                Booking Terms
            </label>

            <textarea
                name="terms_and_conditions"
                rows={4}
                value={formData.terms_and_conditions || ""}
                onChange={handleInputChange}
                className={inputStyle}
                placeholder={
                    loading
                        ? "Loading honeymoon terms..."
                        : "Terms & conditions for this honeymoon itinerary"
                }
                maxLength={50000}
            />

            {loadError && (
                <div className="mt-2">
                    <p className="text-red-500 text-sm">{loadError}</p>
                    <button
                        type="button"
                        onClick={() =>
                            fetchTerms(formData.selected_destination_id)
                        }
                        className="mt-2 inline-block rounded bg-pink-600 px-3 py-1 text-white text-sm"
                    >
                        Retry
                    </button>
                </div>
            )}
        </div>
    );
};

export default TermsSection;
