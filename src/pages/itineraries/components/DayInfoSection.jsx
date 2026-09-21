import { 
    Calendar, 
    MapPin, 
    Image as ImageIcon, 
    Trash2, 
    Plus, 
    UploadCloud, 
    Plane, 
    Camera, 
    Navigation, 
    CloudSun,
    Bold,
    Italic,
    Underline,
    Strikethrough,
    List,
    ListOrdered,
    AlignLeft,
    Link,
    Type
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

const DayInfoSection = ({
    isViewMode = false,
    formData,
    handleArrayChange,
    handleAddItem,
    handleRemoveItem,
    styles,
    errors = {},
}) => {
    const { cardStyle = "bg-white dark:bg-[#091126]/95 rounded-3xl p-7 md:p-9 border border-slate-200/90 dark:border-indigo-500/25 shadow-xl dark:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.7),0_0_30px_2px_rgba(99,102,241,0.18)] ring-1 ring-slate-900/5 dark:ring-white/5 backdrop-blur-xl space-y-7 transition-all" } = styles || {};
    const [activeTabs, setActiveTabs] = useState({});

    const handleTabChange = (index, tab) => {
        setActiveTabs(prev => ({ ...prev, [index]: tab }));
    };

    return (
        <div className={cardStyle}>
            {/* LUXURY CARD HEADER */}
            <div className="flex items-center gap-4 pb-6 border-b border-slate-200 dark:border-slate-800/80">
                <div className="size-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 shrink-0">
                    <Calendar size={22} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Day-Wise Itinerary Roadmap</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Plan transfers, sightseeing, daily schedule, and highlight photos for each day</p>
                </div>
            </div>

            <div className="space-y-8">
                <AnimatePresence mode="popLayout">
                    {formData.days_information.map((item, index) => {
                        const currentTab = activeTabs[index] || "Day Itinerary";
                        
                        return (
                            <motion.div 
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-slate-50/90 dark:bg-[#050A17] rounded-3xl p-6 md:p-8 border border-slate-200/90 dark:border-slate-800/90 space-y-6 shadow-inner relative group"
                            >
                                {/* TOP ROW: DAY BOX + CITY + DELETE */}
                                <div className="flex flex-col md:flex-row items-center gap-5">
                                    <div className="flex-shrink-0 w-20 h-20 bg-gradient-to-br from-indigo-50/80 via-white to-blue-50/80 dark:from-[#0D1630] dark:to-[#0A1024] border border-indigo-200/90 dark:border-indigo-500/30 rounded-2xl flex flex-col items-center justify-center shadow-lg shadow-indigo-500/10 relative overflow-hidden">
                                        <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
                                        <span className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-indigo-600 dark:text-indigo-400">Day</span>
                                        <span className="text-3xl font-black text-slate-900 dark:text-white">{index + 1}</span>
                                    </div>

                                    <div className="relative flex-grow w-full">
                                        <input
                                            disabled={isViewMode}
                                            type="text"
                                            name="locationName"
                                            value={item.locationName}
                                            onChange={(e) => handleArrayChange(e, index, "days_information")}
                                            className="w-full h-14 bg-white dark:bg-[#091126] border border-slate-200 dark:border-slate-800/90 rounded-2xl px-6 pr-12 text-sm md:text-base font-bold text-slate-900 dark:text-white shadow-inner focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 placeholder:text-slate-400 dark:placeholder:text-slate-500 placeholder:font-normal outline-none transition-all"
                                            placeholder="Enter City / Destination / Circuit Name (e.g., Paris Arrival & Eiffel Tower)"
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-indigo-400">
                                            <MapPin size={18} />
                                        </div>
                                    </div>

                                    {!isViewMode && (
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveItem(index, "days_information")}
                                            className="size-11 bg-red-500/10 hover:bg-red-600 text-red-500 dark:text-red-400 hover:text-white rounded-2xl border border-red-500/20 flex items-center justify-center transition-all cursor-pointer shadow-sm shrink-0"
                                            title="Remove Day"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </div>

                                {/* TABS + CONTENT AREA */}
                                <div className="bg-white dark:bg-[#091126] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800/80 shadow-inner">
                                    {/* TABS HEADER */}
                                    <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-[#050A17]/60 overflow-x-auto no-scrollbar">
                                        {[
                                            { id: "Day Itinerary", icon: Plane },
                                            { id: "Sightseeing", icon: Camera },
                                            { id: "Transfer", icon: Navigation },
                                            { id: "Weather", icon: CloudSun },
                                            { id: "Images", icon: ImageIcon }
                                        ].map((tab) => (
                                            <button
                                                type="button"
                                                key={tab.id}
                                                onClick={() => handleTabChange(index, tab.id)}
                                                className={`flex items-center gap-2.5 px-6 py-3.5 text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap border-b-2 cursor-pointer ${
                                                    currentTab === tab.id 
                                                    ? "bg-white dark:bg-[#0D1630] text-indigo-600 dark:text-indigo-400 border-indigo-500 shadow-sm" 
                                                    : "text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-800 dark:hover:text-slate-200 hover:bg-black/[0.02] dark:hover:bg-white/[0.02]"
                                                }`}
                                            >
                                                <tab.icon size={15} className={currentTab === tab.id ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400"} />
                                                {tab.id}
                                            </button>
                                        ))}
                                    </div>

                                    {/* TAB CONTENT */}
                                    <AnimatePresence mode="wait">
                                        {currentTab === "Images" ? (
                                            <motion.div 
                                                key="images"
                                                initial={{ opacity: 0, x: 10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -10 }}
                                                className="p-6 h-[320px] overflow-y-auto no-scrollbar"
                                            >
                                                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4 w-full">
                                                    {/* 1. Uploaded URLs */}
                                                    {(item.day_images || []).map((imgUrl, urlIdx) => (
                                                        <div key={`url-${urlIdx}`} className="aspect-square rounded-2xl overflow-hidden relative border border-indigo-500/30 shadow-md group">
                                                            <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                                                            {!isViewMode && (
                                                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            const updatedUrls = (item.day_images || []).filter((_, idx) => idx !== urlIdx);
                                                                            handleArrayChange({ target: { name: 'day_images', value: updatedUrls } }, index, "days_information");
                                                                        }}
                                                                        className="p-2 bg-red-500/90 text-white rounded-xl hover:bg-red-600 shadow-lg transition-all cursor-pointer"
                                                                    >
                                                                        <Trash2 size={15} />
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}

                                                    {/* 2. New upload previews */}
                                                    {(item.day_images_files || []).map((file, fileIdx) => (
                                                        <div key={`file-${fileIdx}`} className="aspect-square rounded-2xl overflow-hidden relative border border-indigo-500/30 shadow-md group">
                                                            <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                                                            {!isViewMode && (
                                                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            const updatedFiles = (item.day_images_files || []).filter((_, idx) => idx !== fileIdx);
                                                                            handleArrayChange({ target: { name: 'day_images_files', value: updatedFiles } }, index, "days_information");
                                                                        }}
                                                                        className="p-2 bg-red-500/90 text-white rounded-xl hover:bg-red-600 shadow-lg transition-all cursor-pointer"
                                                                    >
                                                                        <Trash2 size={15} />
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}

                                                    {/* 3. Upload Trigger Button (only if total count < 10) */}
                                                    {!isViewMode && ((item.day_images || []).length + (item.day_images_files || []).length) < 10 && (
                                                        <label className="aspect-square rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#050A17] cursor-pointer flex flex-col items-center justify-center text-slate-400 hover:border-indigo-500/60 hover:text-indigo-500 hover:bg-indigo-500/5 transition-all">
                                                            <Plus size={22} />
                                                            <span className="text-[10px] font-bold mt-1.5 uppercase tracking-wider">Add Image</span>
                                                            <input 
                                                                type="file" 
                                                                accept="image/*" 
                                                                multiple
                                                                onChange={(e) => {
                                                                    const files = Array.from(e.target.files);
                                                                    const currentCount = (item.day_images || []).length + (item.day_images_files || []).length;
                                                                    const spaceLeft = 10 - currentCount;
                                                                    if (spaceLeft > 0) {
                                                                        const filesToAdd = files.slice(0, spaceLeft);
                                                                        const updatedFiles = [...(item.day_images_files || []), ...filesToAdd];
                                                                        handleArrayChange({ target: { name: 'day_images_files', value: updatedFiles } }, index, "days_information");
                                                                    }
                                                                }} 
                                                                className="hidden" 
                                                            />
                                                        </label>
                                                    )}

                                                    {/* Empty state message if in view mode and no images */}
                                                    {isViewMode && (item.day_images || []).length === 0 && (
                                                        <div className="col-span-full h-full flex flex-col items-center justify-center gap-3 py-10">
                                                            <ImageIcon size={36} className="text-slate-400 dark:text-slate-600" />
                                                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">No highlight images added</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        ) : (
                                            <motion.div 
                                                key="editor"
                                                initial={{ opacity: 0, x: 10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -10 }}
                                                className="min-h-[260px] flex flex-col"
                                            >
                                                {/* EDITOR TOOLBAR */}
                                                {!isViewMode && (
                                                    <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-800/80 flex flex-wrap items-center gap-1 bg-slate-100/70 dark:bg-[#050A17]/40">
                                                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mr-3 pr-3 border-r border-slate-200 dark:border-slate-800">Body Text</span>
                                                        {[Bold, Italic, Underline, Strikethrough].map((Icon, i) => (
                                                            <button type="button" key={i} className="p-2 text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/60 rounded-lg transition-colors cursor-pointer"><Icon size={15} /></button>
                                                        ))}
                                                        <div className="w-px h-5 bg-slate-200 dark:bg-slate-800 mx-1.5"></div>
                                                        {[List, ListOrdered, AlignLeft].map((Icon, i) => (
                                                            <button type="button" key={i} className="p-2 text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/60 rounded-lg transition-colors cursor-pointer"><Icon size={15} /></button>
                                                        ))}
                                                        <div className="w-px h-5 bg-slate-200 dark:bg-slate-800 mx-1.5"></div>
                                                        {[Link, ImageIcon, Type].map((Icon, i) => (
                                                            <button type="button" key={i} className="p-2 text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/60 rounded-lg transition-colors cursor-pointer"><Icon size={15} /></button>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* EDITOR CONTENT */}
                                                <div className="flex-1 p-5">
                                                    <textarea
                                                        key={currentTab}
                                                        disabled={isViewMode}
                                                        name={
                                                            currentTab === "Day Itinerary" ? "locationDetail" :
                                                            currentTab === "Sightseeing" ? "sightseeing" :
                                                            currentTab === "Transfer" ? "transfer" :
                                                            currentTab === "Weather" ? "weather" : "locationDetail"
                                                        }
                                                        value={
                                                            currentTab === "Day Itinerary" ? item.locationDetail || "" :
                                                            currentTab === "Sightseeing" ? item.sightseeing || "" :
                                                            currentTab === "Transfer" ? item.transfer || "" :
                                                            currentTab === "Weather" ? item.weather || "" : item.locationDetail || ""
                                                        }
                                                        onChange={(e) => handleArrayChange(e, index, "days_information")}
                                                        className="w-full h-44 p-4 border border-slate-200 dark:border-slate-800/90 rounded-2xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 text-slate-900 dark:text-white text-sm leading-relaxed bg-slate-50/80 dark:bg-[#050A17] resize-y placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium outline-none transition-all"
                                                        placeholder={`Enter your ${currentTab.toLowerCase()} details here...`}
                                                    />
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* ADD DAY ACTION */}
            {!isViewMode && (
                <div className="flex justify-center pt-2">
                    <button
                        type="button"
                        onClick={() => handleAddItem("days_information", {
                            day: `${formData.days_information.length + 1}`,
                            locationName: "",
                            locationDetail: "",
                            sightseeing: "",
                            transfer: "",
                            weather: "",
                            date: "",
                            day_image: "",
                            day_image_file: null,
                            day_images: [],
                            day_images_files: []
                        })}
                        className="flex items-center gap-2.5 px-8 py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl font-bold uppercase tracking-wider text-xs hover:opacity-95 shadow-lg shadow-indigo-500/20 transition-all cursor-pointer active:scale-[0.98]"
                    >
                        <Plus size={18} /> Extend Itinerary Roadmap
                    </button>
                </div>
            )}
        </div>
    );
};

export default DayInfoSection;
