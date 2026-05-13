import { 
    Calendar, 
    MapPin, 
    Image as ImageIcon, 
    Trash2, 
    Plus, 
    X, 
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
    formData,
    handleArrayChange,
    handleAddItem,
    handleRemoveItem,
    styles,
    errors = {},
}) => {
    const { cardStyle, inputStyle } = styles;
    const [activeTabs, setActiveTabs] = useState({});

    const handleTabChange = (index, tab) => {
        setActiveTabs(prev => ({ ...prev, [index]: tab }));
    };

    return (
        <div className="space-y-12">
            {/* GLOBAL HEADER */}
            <div className="flex items-center gap-4 px-2">
                <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-500/20">
                    <Navigation size={24} className="rotate-45" />
                </div>
                <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Day-wise Itinerary:</h2>
                    <p className="text-sm font-medium text-slate-600 uppercase tracking-widest">Plan each day of your trip</p>
                </div>
            </div>

            <div className="space-y-10">
                <AnimatePresence mode="popLayout">
                    {formData.days_information.map((item, index) => {
                        const currentTab = activeTabs[index] || "Day Itinerary";
                        
                        return (
                            <motion.div 
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-slate-50 dark:bg-slate-900/50 rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm relative group"
                            >
                                {/* TOP ROW: DAY BOX + CITY + DATE */}
                                <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
                                    <div className="flex-shrink-0 w-24 h-24 bg-[#1e2b58] rounded-2xl flex flex-col items-center justify-center text-white shadow-2xl relative overflow-hidden">
                                        <div className="absolute top-0 inset-x-0 h-1 bg-blue-500/30"></div>
                                        <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-70 mb-1">Day</span>
                                        <span className="text-4xl font-black tracking-tighter">{index + 1}</span>
                                    </div>

                                    <div className="flex-grow w-full">
                                        <div className="relative group/input">
                                            <input
                                                type="text"
                                                name="locationName"
                                                value={item.locationName}
                                                onChange={(e) => handleArrayChange(e, index, "days_information")}
                                                className="w-full h-16 bg-white dark:bg-slate-800 border-none rounded-2xl px-8 text-lg font-bold text-slate-900 dark:text-white shadow-sm focus:ring-4 focus:ring-blue-500/10 placeholder:text-slate-500 transition-all"
                                                placeholder="Enter City/Circuit Name"
                                            />
                                            <div className="absolute right-6 top-1/2 -translate-y-1/2 p-2 bg-slate-50 dark:bg-slate-700 rounded-xl text-slate-400">
                                                <MapPin size={18} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex-shrink-0 flex items-center gap-3">
                                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl">
                                            <Calendar size={20} />
                                        </div>
                                        <div className="relative group/date">
                                            <input
                                                type="date"
                                                name="date"
                                                value={item.date || ""}
                                                onChange={(e) => handleArrayChange(e, index, "days_information")}
                                                className="bg-white dark:bg-slate-800 px-6 py-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 text-sm font-black text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => handleRemoveItem(index, "days_information")}
                                        className="md:absolute -right-4 -top-4 size-10 bg-white dark:bg-slate-800 text-red-500 rounded-full shadow-xl border border-slate-100 dark:border-slate-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>

                                {/* TABS + CONTENT AREA */}
                                <div className="bg-white dark:bg-slate-800 rounded-[2rem] overflow-hidden border border-slate-100 dark:border-slate-700 shadow-xl">
                                    {/* TABS HEADER */}
                                    <div className="flex border-b border-slate-50 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 overflow-x-auto no-scrollbar">
                                        {[
                                            { id: "Day Itinerary", icon: Plane },
                                            { id: "Sightseeing", icon: Camera },
                                            { id: "Transfer", icon: Navigation },
                                            { id: "Weather", icon: CloudSun },
                                            { id: "Images", icon: ImageIcon }
                                        ].map((tab) => (
                                            <button
                                                key={tab.id}
                                                onClick={() => handleTabChange(index, tab.id)}
                                                className={`flex items-center gap-3 px-8 py-5 text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap border-b-2 ${
                                                    currentTab === tab.id 
                                                    ? "bg-white dark:bg-slate-800 text-blue-600 border-blue-600" 
                                                    : "text-slate-400 border-transparent hover:text-slate-600"
                                                }`}
                                            >
                                                <tab.icon size={16} className={currentTab === tab.id ? "text-blue-600" : "text-slate-400"} />
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
                                                className="p-8 h-[360px] flex items-center justify-center"
                                            >
                                                <label className="group relative block w-full h-full rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 cursor-pointer overflow-hidden transition-all hover:border-blue-500 hover:bg-white dark:hover:bg-slate-800">
                                                    {item.day_image_file || item.day_image ? (
                                                        <div className="relative h-full w-full">
                                                            <img 
                                                                src={item.day_image_file ? URL.createObjectURL(item.day_image_file) : item.day_image} 
                                                                alt="" 
                                                                className="w-full h-full object-cover" 
                                                            />
                                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                                                <div className="px-6 py-3 bg-white text-blue-600 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl flex items-center gap-3">
                                                                    <UploadCloud size={16} /> Change Daily Highlight
                                                                </div>
                                                                <button 
                                                                    type="button"
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        handleArrayChange({ target: { name: 'day_image_file', value: null, day_image: '' } }, index, "days_information");
                                                                    }}
                                                                    className="p-4 bg-red-600 text-white rounded-2xl hover:bg-red-700 shadow-xl"
                                                                >
                                                                    <X size={20} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="h-full flex flex-col items-center justify-center gap-4">
                                                            <div className="size-16 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                                                <ImageIcon size={28} className="text-blue-600" />
                                                            </div>
                                                            <div className="text-center">
                                                                <p className="text-sm font-black text-slate-950 dark:text-white uppercase tracking-tight">Day Highlight Image</p>
                                                                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mt-1">1700x600 Cinema Mode</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                    <input 
                                                        type="file" 
                                                        accept="image/*" 
                                                        onChange={(e) => {
                                                            const file = e.target.files[0];
                                                            if (file) handleArrayChange({ target: { name: 'day_image_file', value: file } }, index, "days_information");
                                                        }} 
                                                        className="hidden" 
                                                    />
                                                </label>
                                            </motion.div>
                                        ) : (
                                            <motion.div 
                                                key="editor"
                                                initial={{ opacity: 0, x: 10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -10 }}
                                                className="h-[360px] flex flex-col"
                                            >
                                                {/* EDITOR TOOLBAR */}
                                                <div className="px-6 py-4 border-b border-slate-50 dark:border-slate-700 flex flex-wrap items-center gap-1 bg-white/50 dark:bg-slate-800/50">
                                                    <div className="flex items-center gap-4 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg cursor-pointer mr-4 border-r border-slate-100 dark:border-slate-600">
                                                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Normal</span>
                                                        <div className="flex flex-col gap-0.5">
                                                            <div className="w-2 h-0.5 bg-slate-400"></div>
                                                            <div className="w-2 h-0.5 bg-slate-400"></div>
                                                        </div>
                                                    </div>
                                                    
                                                    {[Bold, Italic, Underline, Strikethrough].map((Icon, i) => (
                                                        <button key={i} className="p-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors"><Icon size={18} /></button>
                                                    ))}
                                                    <div className="w-px h-6 bg-slate-100 dark:bg-slate-700 mx-2"></div>
                                                    {[List, ListOrdered, AlignLeft].map((Icon, i) => (
                                                        <button key={i} className="p-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors"><Icon size={18} /></button>
                                                    ))}
                                                    <div className="w-px h-6 bg-slate-100 dark:bg-slate-700 mx-2"></div>
                                                    {[Link, ImageIcon, Type].map((Icon, i) => (
                                                        <button key={i} className="p-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors"><Icon size={18} /></button>
                                                    ))}
                                                </div>

                                                {/* EDITOR CONTENT - BORDERED AS PER IMAGE */}
                                                <div className="flex-1 p-6">
                                                    <div className="w-full h-full border border-slate-900 dark:border-slate-200/20 rounded-xl overflow-hidden relative group">
                                                        <textarea
                                                            name={
                                                                currentTab === "Day Itinerary" ? "locationDetail" :
                                                                currentTab === "Sightseeing" ? "sightseeing" :
                                                                currentTab === "Transfer" ? "transfer" :
                                                                currentTab === "Weather" ? "weather" : "locationDetail"
                                                            }
                                                            value={
                                                                currentTab === "Day Itinerary" ? item.locationDetail :
                                                                currentTab === "Sightseeing" ? item.sightseeing :
                                                                currentTab === "Transfer" ? item.transfer :
                                                                currentTab === "Weather" ? item.weather : item.locationDetail
                                                            }
                                                            onChange={(e) => handleArrayChange(e, index, "days_information")}
                                                            className="w-full h-full p-6 border-none focus:ring-0 text-slate-700 dark:text-slate-300 text-lg leading-relaxed bg-transparent resize-none placeholder:text-slate-500 transition-all font-medium"
                                                            placeholder={`Enter your ${currentTab.toLowerCase()} details here...`}
                                                        />
                                                    </div>
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
            <div className="flex justify-center">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
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
                    })}
                    className="flex items-center gap-4 px-12 py-6 bg-blue-600 text-white rounded-3xl font-black uppercase tracking-widest text-sm hover:bg-blue-700 transition-all shadow-2xl shadow-blue-500/40"
                >
                    <Plus size={20} /> Extend Itinerary Roadmap
                </motion.button>
            </div>
        </div>
    );
};

export default DayInfoSection;

