import { Heart, CalendarDays, MapPin, Image as ImageIcon, Trash2, Plus, CheckCircle2, Sparkles } from "lucide-react";

const DayInfoSection = ({
    formData,
    handleArrayChange,
    handleAddItem,
    handleRemoveItem,
    styles,
    errors = {},
}) => {
    const { cardStyle, labelStyle, inputStyle, buttonStyle, removeButtonStyle } = styles;

    return (
        <div className={cardStyle}>
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="text-indigo-600" size={20} />
                    DAILY TIMELINE
                </h2>
                <div className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-widest">
                   {formData.days_information.length} Days Planned
                </div>
            </div>

            {errors.days_information && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 rounded-2xl border border-red-100 dark:border-red-900/30">
                    <p className="text-red-500 text-[10px] font-black uppercase tracking-widest leading-relaxed">
                        {errors.days_information}
                    </p>
                </div>
            )}

            <div className="space-y-12 relative before:absolute before:left-6 before:top-2 before:bottom-2 before:w-px before:bg-slate-100 dark:before:bg-slate-800">
                {formData.days_information.map((item, index) => (
                    <div key={index} className="relative pl-12 group">
                        {/* Timeline Marker */}
                        <div className="absolute left-0 top-2 size-12 rounded-2xl bg-white dark:bg-slate-900 border-2 border-indigo-500 flex items-center justify-center text-indigo-600 font-black shadow-lg shadow-indigo-500/10 z-10 group-hover:scale-110 transition-transform">
                            {index + 1}
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] p-8 border border-transparent hover:border-indigo-100 dark:hover:border-indigo-900/30 transition-all">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                                    <CalendarDays size={16} className="text-indigo-500" />
                                    DAY {index + 1} OVERVIEW
                                </h3>
                                {formData.days_information.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveItem(index, "days_information")}
                                        className={removeButtonStyle}
                                    >
                                        Revoke Day
                                    </button>
                                )}
                            </div>

                            <div className="space-y-8">
                                <div>
                                    <label className={labelStyle}><MapPin size={14} /> Day Title / Highlight</label>
                                    <input
                                        type="text"
                                        name="locationName"
                                        value={item.locationName}
                                        onChange={(e) => handleArrayChange(e, index, "days_information")}
                                        className={`${inputStyle} text-lg font-bold`}
                                        placeholder="e.g. Arrival & Candlelight Dinner"
                                    />
                                </div>

                                <div>
                                    <label className={labelStyle}>Activity Details</label>
                                    <textarea
                                        name="locationDetail"
                                        value={item.locationDetail}
                                        onChange={(e) => {
                                            handleArrayChange(e, index, "days_information");
                                            e.target.style.height = "auto";
                                            e.target.style.height = e.target.scrollHeight + "px";
                                        }}
                                        className={`${inputStyle} min-h-[120px] resize-none leading-relaxed`}
                                        placeholder="Describe the romantic activities for this day..."
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                                    <div>
                                        <label className={labelStyle}><ImageIcon size={14} /> Day Specific Media</label>
                                        <label className="group relative block w-full h-32 rounded-[1.5rem] border-2 border-dashed border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 cursor-pointer overflow-hidden transition-all hover:border-indigo-500 flex flex-col items-center justify-center text-slate-400">
                                           <ImageIcon size={24} strokeWidth={1.5} />
                                           <p className="mt-2 text-[9px] font-black uppercase tracking-widest">{item.day_image_file ? 'Change Photo' : 'Upload Day Highlight'}</p>
                                           <input 
                                                type="file" 
                                                name="day_image_file" 
                                                accept="image/*" 
                                                onChange={(e) => {
                                                    const file = e.target.files[0];
                                                    if (file) handleArrayChange({ target: { name: 'day_image_file', value: file } }, index, "days_information");
                                                }} 
                                                hidden 
                                            />
                                        </label>
                                    </div>

                                    {/* Previews */}
                                    {(item.day_image_file || item.day_image) && (
                                        <div className="relative aspect-video rounded-3xl overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl group/img">
                                            <img 
                                                src={item.day_image_file ? URL.createObjectURL(item.day_image_file) : item.day_image} 
                                                alt="" 
                                                className="w-full h-full object-cover" 
                                            />
                                            <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg ${item.day_image_file ? 'bg-indigo-600 text-white' : 'bg-emerald-600 text-white'}`}>
                                                {item.day_image_file ? 'Unsaved' : 'Existing'}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex justify-center mt-12 pt-8 border-t border-slate-50 dark:border-slate-800">
                <button
                    type="button"
                    onClick={() => handleAddItem("days_information", {
                        day: `${formData.days_information.length + 1}`,
                        locationName: "",
                        locationDetail: "",
                        day_image: "",
                        day_image_file: null,
                    })}
                    className="flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20"
                >
                    <Plus size={20} /> Extend Itinerary Flow
                </button>
            </div>
        </div>
    );
};

export default DayInfoSection;
