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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-full mx-auto space-y-8 pb-20 px-6 text-left">
            {/* HEADER HUB */}
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 lg:p-8 border border-slate-100 dark:border-slate-800 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none text-indigo-700"><FileText size={160} /></div>
                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600 dark:text-indigo-400 mb-1">
                            Compliance & Legal
                        </p>
                        <h1 className="text-2xl font-black text-slate-950 dark:text-white tracking-tight flex items-center gap-3">
                            Destination <span className="text-indigo-600">Terms & Conditions</span>
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400 font-bold mt-1 text-xs italic text-left">
                            Managing administrative protocols and travel regulations per destination.
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="px-5 py-2.5 bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2 shadow-lg shadow-indigo-500/40">
                            <Sparkles size={16} /> GOVERNANCE SECURED
                        </div>
                    </div>
                </div>
            </div>

            {/* CATEGORY & TARGET DESTINATION SELECTOR */}
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 lg:p-8 border border-slate-100 dark:border-slate-800 shadow-xl space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">CATEGORY</label>
                        <div className="flex gap-3">
                            {[
                                { id: "domestic", label: "DOMESTIC", icon: MapPin },
                                { id: "international", label: "INTERNATIONAL", icon: Globe }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setCategory(tab.id)}
                                    className={`flex-1 py-3 px-5 rounded-xl border-2 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${category === tab.id
                                            ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/30"
                                            : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                                        }`}
                                >
                                    <tab.icon size={16} />
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">TARGET DESTINATION</label>
                        <div className="relative">
                            <select
                                value={selectedDestinationId}
                                onChange={(e) => setSelectedDestinationId(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-bold text-slate-900 dark:text-white focus:outline-none cursor-pointer appearance-none pr-10"
                            >
                                <option value="">-- Select Destination --</option>
                                {destinationList.map((dest) => (
                                    <option key={dest._id} value={dest._id}>
                                        {dest.destination_name}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                        </div>
                    </div>
                </div>
            </div>

            {/* ASSOCIATED PROTOCOLS BOX-WISE LIST VIEW / EDITOR */}
            {selectedDestinationId ? (
                <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 lg:p-8 border border-slate-100 dark:border-slate-800 shadow-xl space-y-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
                        <div className="flex items-center gap-4">
                            <div className="size-12 bg-indigo-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-indigo-600">
                                <FileText size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-slate-950 dark:text-white tracking-tight">
                                    Associated Protocols — {selectedDestName}
                                </h2>
                                <p className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mt-0.5">
                                    {rules.length} POINTS DETECTED
                                </p>
                            </div>
                        </div>

                        {!isEditing ? (
                            <button
                                onClick={() => setIsEditing(true)}
                                disabled={loading}
                                className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-[0.2em] hover:bg-indigo-700 transition-all shadow-md flex items-center gap-2"
                            >
                                <Edit size={14} /> EDIT FRAMEWORK
                            </button>
                        ) : (
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="px-4 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-slate-300 transition-all"
                                >
                                    CANCEL
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-[0.2em] hover:bg-indigo-700 transition-all shadow-md flex items-center gap-2"
                                >
                                    {isSaving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                                    {isSaving ? "SAVING..." : "SAVE CHANGES"}
                                </button>
                            </div>
                        )}
                    </div>

                    {loading ? (
                        <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-indigo-600" size={36} /></div>
                    ) : isEditing ? (
                        <div className="space-y-4">
                            {rules.map((rule, idx) => (
                                <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-sm group">
                                    <span className="text-slate-400 font-black px-2 text-sm">&gt;</span>
                                    <input
                                        type="text"
                                        value={rule}
                                        onChange={(e) => handleRuleChange(idx, e.target.value)}
                                        className="flex-1 bg-transparent text-slate-900 dark:text-white font-semibold text-sm outline-none placeholder:text-slate-400"
                                        placeholder="Enter protocol rule..."
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleDeleteRule(idx)}
                                        className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}

                            <button
                                type="button"
                                onClick={handleAddRule}
                                className="w-full py-4 border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-indigo-600/50 rounded-2xl text-slate-500 dark:text-slate-400 hover:text-indigo-600 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all mt-4"
                            >
                                <Plus size={16} /> APPEND LEGAL PROTOCOL
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {rules.length > 0 ? (
                                rules.map((rule, idx) => (
                                    <div key={idx} className="p-4.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-3 shadow-xs hover:border-indigo-500/30 transition-all">
                                        <div className="flex items-start gap-3">
                                            <span className="text-slate-400 font-black text-sm shrink-0 mt-0.5">&gt;</span>
                                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-relaxed text-left">
                                                {rule}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center text-slate-400 italic bg-slate-50 dark:bg-slate-800/30 rounded-2xl">
                                    No terms & conditions defined for {selectedDestName} yet. Click EDIT FRAMEWORK to add rules.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ) : (
                <div className="p-12 text-center rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl space-y-3">
                    <MapPin className="mx-auto text-slate-300 dark:text-slate-700" size={40} />
                    <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">No Target Destination Selected</h3>
                    <p className="text-xs text-slate-400">Select a destination above to configure box-wise terms & conditions.</p>
                </div>
            )}
        </motion.div>
    );
};

export default HoneymoonTermsAndCondition;
