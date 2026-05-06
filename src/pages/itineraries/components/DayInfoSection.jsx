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
                                        className={inputStyle}
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

                                 <div className="space-y-10">
                                    <div>
                                        <label className={labelStyle}><ImageIcon size={18} className="text-indigo-600" /> Day Specific Narrative Media</label>
                                        <label className="group relative block w-full aspect-[21/6] rounded-[2.5rem] border-4 border-dashed border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 cursor-pointer overflow-hidden transition-all hover:border-indigo-700 shadow-inner flex flex-col items-center justify-center text-slate-400">
                                           <div className="size-20 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform mb-4">
                                              <ImageIcon size={32} strokeWidth={1.5} className="text-indigo-600" />
                                           </div>
                                           <div className="text-center">
                                              <p className="text-sm font-black uppercase tracking-[0.3em] text-slate-950 dark:text-white mb-1">{item.day_image_file ? 'Modify Narrative Visual' : 'Acquire Day Highlight'}</p>
                                              <p className="text-[10px] font-black text-indigo-700 uppercase tracking-widest italic opacity-60">High-Fidelity Frame Processing</p>
                                           </div>
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
                                        <div className="relative aspect-[21/9] rounded-[3rem] overflow-hidden border-8 border-white dark:border-slate-900 shadow-2xl group/img">
                                            <img 
                                                src={item.day_image_file ? URL.createObjectURL(item.day_image_file) : item.day_image} 
                                                alt="" 
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" 
                                            />
                                            <div className={`absolute top-8 left-8 px-6 py-2 rounded-xl text-xs font-black uppercase tracking-[0.2em] shadow-2xl backdrop-blur-md ${item.day_image_file ? 'bg-indigo-600/90 text-white' : 'bg-emerald-600/90 text-white'}`}>
                                                {item.day_image_file ? 'New Acquisition' : 'Registry Asset'}
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
