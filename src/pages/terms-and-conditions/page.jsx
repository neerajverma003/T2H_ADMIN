import React, { useState, useEffect } from "react";
import { apiClient } from "../../stores/authStores";
import { usePlaceStore } from "../../stores/usePlaceStore";
import { toast } from "react-toastify";
import {
    FileText,
    Save,
    Edit,
    Loader2,
    Globe,
    MapPin,
    Sparkles,
    ChevronDown,
    Plus,
    Trash2,
    X
} from "lucide-react";
import { motion } from "framer-motion";

const HoneymoonTermsAndCondition = () => {
    const [category, setCategory] = useState("domestic");
    const [selectedDestinationId, setSelectedDestinationId] = useState("");
    const [rules, setRules] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const { destinationList, fetchDestinationList } = usePlaceStore();

    useEffect(() => {
        fetchDestinationList(category);
        setSelectedDestinationId("");
        setRules([]);
    }, [category, fetchDestinationList]);

    useEffect(() => {
        if (!selectedDestinationId) {
            setRules([]);
            return;
        }

        const fetchTnc = async () => {
            try {
                setLoading(true);
                const res = await apiClient.get(`/admin/tnc/${selectedDestinationId}`);
                if (res.data?.success && res.data?.tnc) {
                    const rawText = res.data.tnc.terms_And_condition || "";
                    const parsedRules = rawText.split('\n').map(r => r.trim()).filter(Boolean);
                    setRules(parsedRules);
                }
            } catch (error) {
                toast.error("Failed to load destination terms & conditions.");
            } finally {
                setLoading(false);
            }
        };

        fetchTnc();
        setIsEditing(false);
    }, [selectedDestinationId]);

    const handleRuleChange = (index, value) => {
        const updated = [...rules];
        updated[index] = value;
        setRules(updated);
    };

    const handleAddRule = () => {
        setRules([...rules, ""]);
    };

    const handleDeleteRule = (index) => {
        setRules(rules.filter((_, i) => i !== index));
    };

    const handleSave = async () => {
        if (!selectedDestinationId) {
            toast.error("Please select a target destination first.");
            return;
        }

        setIsSaving(true);
        try {
            const combinedText = rules.map(r => r.trim()).filter(Boolean).join('\n');
            await apiClient.patch("/admin/tnc", {
                destinationId: selectedDestinationId,
                terms_And_condition: combinedText,
            });
            toast.success("Destination terms & conditions updated! ✨");
            setIsEditing(false);
        } catch (error) {
            toast.error("Failed to save terms & conditions.");
        } finally {
            setIsSaving(false);
        }
    };

    const selectedDestName = destinationList.find((d) => d._id === selectedDestinationId)?.destination_name || "";

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8 pb-20 font-sans min-h-screen text-slate-900 dark:text-slate-100 text-left">
            {/* HEADER HUB */}
            <div className="bg-white dark:bg-[#091126] rounded-3xl py-4 sm:py-5 px-6 sm:px-8 border border-slate-200 dark:border-slate-800 shadow-md relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative z-10 flex items-center gap-3">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0">
                        <FileText size={22} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-500 dark:text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full">
                                COMPLIANCE & LEGAL
                            </span>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2 flex-wrap">
                            Destination <span className="text-blue-500">Terms & Conditions</span>
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 font-semibold mt-0.5 text-xs sm:text-sm">
                            Managing administrative protocols and travel regulations per destination.
                        </p>
                    </div>
                </div>

                <div className="relative z-10 flex items-center gap-3">
                    <div className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 text-blue-500 dark:text-blue-400 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm">
                        <Sparkles size={15} /> GOVERNANCE SECURED
                    </div>
                </div>
            </div>

            {/* CATEGORY & TARGET DESTINATION SELECTOR */}
            <div className="bg-white dark:bg-[#091126] rounded-3xl p-6 lg:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">CATEGORY</label>
                        <div className="flex gap-3">
                            {[
                                { id: "domestic", label: "DOMESTIC", icon: MapPin },
                                { id: "international", label: "INTERNATIONAL", icon: Globe }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setCategory(tab.id)}
                                    className={`flex-1 py-2.5 px-4 rounded-xl border text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${category === tab.id
                                            ? "bg-gradient-to-r from-blue-600 to-indigo-600 border-transparent text-white shadow-sm"
                                            : "bg-slate-50 dark:bg-[#050A17] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"
                                        }`}
                                >
                                    <tab.icon size={15} />
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">TARGET DESTINATION</label>
                        <div className="relative">
                            <select
                                value={selectedDestinationId}
                                onChange={(e) => setSelectedDestinationId(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800/90 bg-slate-50 dark:bg-[#050A17] text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-all cursor-pointer appearance-none pr-10 shadow-inner"
                            >
                                <option value="">-- Select Destination --</option>
                                {destinationList.map((dest) => (
                                    <option key={dest._id} value={dest._id}>
                                        {dest.destination_name}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                        </div>
                    </div>
                </div>
            </div>

            {/* ASSOCIATED PROTOCOLS BOX-WISE LIST VIEW / EDITOR */}
            {selectedDestinationId ? (
                <div className="bg-white dark:bg-[#091126] rounded-3xl p-6 lg:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800/80 pb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
                                <FileText size={22} />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                                    Associated Protocols — {selectedDestName}
                                </h2>
                                <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-0.5">
                                    {rules.length} POINTS DETECTED
                                </p>
                            </div>
                        </div>

                        {!isEditing ? (
                            <button
                                onClick={() => setIsEditing(true)}
                                disabled={loading}
                                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                            >
                                <Edit size={14} /> EDIT FRAMEWORK
                            </button>
                        ) : (
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
                                >
                                    CANCEL
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                                >
                                    {isSaving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                                    {isSaving ? "SAVING..." : "SAVE CHANGES"}
                                </button>
                            </div>
                        )}
                    </div>

                    {loading ? (
                        <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-blue-500" size={36} /></div>
                    ) : isEditing ? (
                        <div className="space-y-4">
                            {rules.map((rule, idx) => (
                                <div key={idx} className="flex items-center gap-3 p-3.5 bg-slate-50 dark:bg-[#050A17] border border-slate-200 dark:border-slate-800/90 rounded-2xl shadow-inner group hover:border-blue-500/40 transition-all">
                                    <span className="text-slate-400 font-bold px-2 text-sm">&gt;</span>
                                    <input
                                        type="text"
                                        value={rule}
                                        onChange={(e) => handleRuleChange(idx, e.target.value)}
                                        className="flex-1 bg-transparent text-slate-900 dark:text-white font-medium text-sm outline-none placeholder:text-slate-400"
                                        placeholder="Enter protocol rule..."
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleDeleteRule(idx)}
                                        className="p-2 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}

                            <button
                                type="button"
                                onClick={handleAddRule}
                                className="w-full py-3.5 border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-blue-500/60 rounded-2xl text-slate-500 dark:text-slate-400 hover:text-blue-500 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-300 bg-slate-50/50 dark:bg-[#050A17]/40 hover:bg-blue-500/5 cursor-pointer mt-4"
                            >
                                <Plus size={16} /> APPEND LEGAL PROTOCOL
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {rules.length > 0 ? (
                                rules.map((rule, idx) => (
                                    <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-[#050A17] border border-slate-200 dark:border-slate-800/90 flex items-center justify-between gap-3 shadow-inner hover:border-blue-500/30 transition-all">
                                        <div className="flex items-start gap-3">
                                            <span className="text-blue-500 font-bold text-sm shrink-0 mt-0.5">&gt;</span>
                                            <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed text-left">
                                                {rule}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center text-slate-400 italic bg-slate-50 dark:bg-[#050A17] rounded-2xl border border-slate-200 dark:border-slate-800/80">
                                    No terms & conditions defined for {selectedDestName} yet. Click EDIT FRAMEWORK to add rules.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ) : (
                <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#091126] border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                    <MapPin className="mx-auto text-slate-400 dark:text-slate-600" size={40} />
                    <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No Target Destination Selected</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Select a destination above to configure box-wise terms & conditions.</p>
                </div>
            )}
        </div>
    );
};

export default HoneymoonTermsAndCondition;
