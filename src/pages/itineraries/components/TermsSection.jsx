import { FileText, Heart, ShieldCheck, RefreshCw } from "lucide-react";
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
            if (res?.data?.success && res?.data?.tnc && formData.selected_destination_id === callDestId) {
                handleInputChange({ target: { name: "terms_and_conditions", value: res.data.tnc.terms_And_condition || "" } });
                setLoadError("");
                return;
            }
            setLoadError("No pre-defined Terms & Conditions found for this location.");
        } catch (err) {
            setLoadError("Failed to auto-load Terms & Conditions");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTerms(formData.selected_destination_id);
    }, [formData.selected_destination_id]);

    return (
        <div className={cardStyle}>
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <ShieldCheck className="text-indigo-600" size={20} />
                    TERMS & CONDITIONS
                </h2>
                <div className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-widest">
                   Legal Framework
                </div>
            </div>

            <div className="space-y-4">
                <label className={labelStyle}>Booking & Travel Terms</label>

                <textarea
                    name="terms_and_conditions"
                    value={formData.terms_and_conditions || ""}
                    onChange={handleInputChange}
                    className={`${inputStyle} min-h-[150px] leading-relaxed`}
                    placeholder={loading ? "Synchronizing with destination database..." : "Enter the specific terms for this honeymoon package..."}
                />

                {loadError && (
                    <div className="mt-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{loadError}</p>
                        <button
                            type="button"
                            onClick={() => fetchTerms(formData.selected_destination_id)}
                            className="flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:text-indigo-700 transition-colors"
                        >
                            <RefreshCw size={12} /> Retry Fetch
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TermsSection;
