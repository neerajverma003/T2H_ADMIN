import {
    Landmark,
    FileText,
    CreditCard,
    ShieldX,
    Info,
    ChevronDown,
    Bold,
    Italic,
    Underline,
    Strikethrough,
    AlignLeft,
    List,
    Link2,
    Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";
import { apiClient } from "../../../stores/authStores";
import { toast } from "react-toastify";

// Helper Toolbar for the rich text editor aesthetic
const EditorToolbar = () => {
    return (
        <div className="flex items-center gap-3 px-4 py-2.5 bg-slate-100 dark:bg-[#081226] border-b border-slate-200 dark:border-slate-700/60 text-slate-500 dark:text-slate-400 select-none overflow-x-auto text-xs">
            <button
                type="button"
                className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold cursor-default"
                tabIndex="-1"
            >
                <span>Normal</span>
                <ChevronDown size={12} className="text-slate-400" />
            </button>
            <div className="h-4 w-px bg-slate-200 dark:bg-slate-700/60 shrink-0" />
            <div className="flex items-center gap-1">
                <button
                    type="button"
                    title="Bold"
                    className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold cursor-default"
                    tabIndex="-1"
                >
                    <Bold size={13} />
                </button>
                <button
                    type="button"
                    title="Italic"
                    className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 italic cursor-default"
                    tabIndex="-1"
                >
                    <Italic size={13} />
                </button>
                <button
                    type="button"
                    title="Underline"
                    className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 underline cursor-default"
                    tabIndex="-1"
                >
                    <Underline size={13} />
                </button>
                <button
                    type="button"
                    title="Strikethrough"
                    className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 line-through cursor-default"
                    tabIndex="-1"
                >
                    <Strikethrough size={13} />
                </button>
            </div>
            <div className="h-4 w-px bg-slate-200 dark:bg-slate-700/60 shrink-0" />
            <div className="flex items-center gap-1">
                <button
                    type="button"
                    title="Align Left"
                    className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-default"
                    tabIndex="-1"
                >
                    <AlignLeft size={13} />
                </button>
                <button
                    type="button"
                    title="Bullet List"
                    className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-default"
                    tabIndex="-1"
                >
                    <List size={13} />
                </button>
            </div>
            <div className="h-4 w-px bg-slate-200 dark:bg-slate-700/60 shrink-0" />
            <div className="flex items-center gap-1">
                <button
                    type="button"
                    title="Link"
                    className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-default"
                    tabIndex="-1"
                >
                    <Link2 size={13} />
                </button>
                <button
                    type="button"
                    title="Clear Format"
                    className="px-1.5 py-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[11px] font-bold cursor-default"
                    tabIndex="-1"
                >
                    Tx
                </button>
            </div>
        </div>
    );
};

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

    const fetchPaymentMode = async (targetType) => {
        const destType = formData.destination_type || targetType || 'domestic';
        if (formData.payment_mode && formData.payment_mode.trim()) return;
        try {
            setLoading((p) => ({ ...p, payment: true }));
            const res = await apiClient.get(`/admin/payment-mode/${destType}`);
            const payment_mode = res?.data?.destinationPaymentModeData?.payment_mode || 
                                 res?.data?.destinationPaymentModeData?.honeymoon_payment_mode || "";
            if (payment_mode) {
                setFormData((prev) => ({ ...prev, payment_mode }));
            }
        } catch {
            console.warn("Failed to load Payment Mode");
        } finally {
            setLoading((p) => ({ ...p, payment: false }));
        }
    };

    const fetchCancellationPolicy = async () => {
        const destType = formData.destination_type || 'domestic';
        if (formData.cancellation_policy && formData.cancellation_policy.trim() && formData.cancellation_policy !== "Standard honeymoon cancellation policy applies.") return;
        try {
            setLoading((p) => ({ ...p, cancellation: true }));
            const res = await apiClient.get(`/admin/honeymoon-cancellation-policy?type=${destType}`);
            const policy = res?.data?.data?.cancellation_policy || 
                           res?.data?.data?.honeymoon_cancellation_policy || "";
            if (policy) {
                setFormData((prev) => ({ ...prev, cancellation_policy: policy }));
            }
        } catch {
            console.warn("Failed to load Cancellation Policy");
        } finally {
            setLoading((p) => ({ ...p, cancellation: false }));
        }
    };

    useEffect(() => {
        fetchCancellationPolicy();
    }, [formData.destination_type]);

    useEffect(() => {
        fetchTerms(formData.selected_destination_id);
    }, [formData.selected_destination_id]);

    useEffect(() => {
        fetchPaymentMode(formData.destination_type || formData.travel_type);
    }, [formData.destination_type, formData.travel_type]);

    return (
        <div className="flex flex-col gap-10 md:gap-12">
            {/* 1. DESTINATION OVERVIEW CARD */}
            <div className={cardStyle}>
                <div className="flex items-center gap-3.5 pb-5 border-b border-slate-200 dark:border-slate-800/80">
                    <div className="size-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 shrink-0">
                        <Landmark size={22} />
                    </div>
                    <div>
                        <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                            Destination Overview
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                            Captivating overview and highlights about the destination
                        </p>
                    </div>
                </div>

                <div className={`rounded-2xl border bg-slate-50/90 dark:bg-[#050A17] overflow-hidden transition-all focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500/30 ${
                    errors.destination_detail ? "border-red-500 ring-1 ring-red-500/40" : "border-slate-200 dark:border-slate-800/90"
                }`}>
                    <EditorToolbar />
                    <textarea
                        id="destination_detail"
                        name="destination_detail"
                        value={formData.destination_detail}
                        onChange={handleInputChange}
                        placeholder="Write a captivating description about the destination..."
                        className="w-full bg-transparent p-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none resize-none no-scrollbar min-h-[140px] leading-relaxed font-semibold"
                    />
                </div>
                {errors.destination_detail && (
                    <p className="text-xs font-bold text-red-400 mt-1">{errors.destination_detail}</p>
                )}
            </div>

            {/* 2. ABOUT THE TOUR CARD */}
            <div className={cardStyle}>
                <div className="flex items-center gap-3.5 pb-5 border-b border-slate-200 dark:border-slate-800/80">
                    <div className="size-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 shrink-0">
                        <FileText size={22} />
                    </div>
                    <div>
                        <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                            About The Tour
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                            Detailed narrative, atmosphere, and what to expect on this tour
                        </p>
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200 dark:border-slate-800/90 bg-slate-50/90 dark:bg-[#050A17] overflow-hidden transition-all focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500/30">
                    <EditorToolbar />
                    <textarea
                        id="about_the_tour"
                        name="about_the_tour"
                        value={formData.about_the_tour || ""}
                        onChange={handleInputChange}
                        placeholder="Write a detailed description about the tour..."
                        className="w-full bg-transparent p-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none resize-none no-scrollbar min-h-[140px] leading-relaxed font-semibold"
                    />
                </div>
            </div>

            {/* 3. COMMERCIAL POLICIES CARD */}
            <div className={cardStyle}>
                <div className="flex items-center gap-3.5 pb-5 border-b border-slate-200 dark:border-slate-800/80">
                    <div className="size-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 shrink-0">
                        <CreditCard size={22} />
                    </div>
                    <div>
                        <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                            Commercial Policies
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                            Auto-synced booking terms, payment rules, and cancellation policies
                        </p>
                    </div>
                </div>

                <div className="flex flex-col gap-6">
                    {/* Terms & Conditions */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label htmlFor="terms_and_conditions" className={labelStyle}>
                                <FileText size={14} className="text-indigo-400" /> Terms & Conditions
                            </label>
                            {loading.terms && <span className="text-[10px] text-indigo-400 font-bold animate-pulse">Syncing...</span>}
                        </div>
                        <textarea
                            id="terms_and_conditions"
                            name="terms_and_conditions"
                            value={formData.terms_and_conditions || ""}
                            onChange={handleInputChange}
                            rows={4}
                            className={`${inputStyle} min-h-[110px] resize-y font-semibold text-xs leading-relaxed`}
                            placeholder={loading.terms ? "Syncing..." : "Booking terms..."}
                        />
                    </div>

                    {/* Payment Mode */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label htmlFor="payment_mode" className={labelStyle}>
                                <CreditCard size={14} className="text-indigo-400" /> Payment Policy
                            </label>
                            {loading.payment && <span className="text-[10px] text-indigo-400 font-bold animate-pulse">Syncing...</span>}
                        </div>
                        <textarea
                            id="payment_mode"
                            name="payment_mode"
                            value={formData.payment_mode || ""}
                            onChange={handleInputChange}
                            rows={4}
                            className={`${inputStyle} min-h-[110px] resize-y font-semibold text-xs leading-relaxed`}
                            placeholder={loading.payment ? "Syncing..." : "Collection terms..."}
                        />
                    </div>

                    {/* Cancellation Policy */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label htmlFor="cancellation_policy" className={labelStyle}>
                                <ShieldX size={14} className="text-indigo-400" /> Cancellation Policy
                            </label>
                            {loading.cancellation && <span className="text-[10px] text-indigo-400 font-bold animate-pulse">Syncing...</span>}
                        </div>
                        <textarea
                            id="cancellation_policy"
                            name="cancellation_policy"
                            value={formData.cancellation_policy || ""}
                            onChange={handleInputChange}
                            rows={4}
                            className={`${inputStyle} min-h-[110px] resize-y font-semibold text-xs leading-relaxed`}
                            placeholder={loading.cancellation ? "Syncing..." : "Cancellation rules..."}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DescriptionsSection;
