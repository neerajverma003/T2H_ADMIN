import { Hotel, Heart, Building, CheckCircle2 } from "lucide-react";

const HotelDetailsSection = ({
    formData,
    handleInputChange,
    styles,
}) => {
    const { cardStyle, labelStyle } = styles;
    const isChecked = formData.hotel_as_per_category === "As per category";

    return (
        <div className={cardStyle}>
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <Building className="text-indigo-600" size={20} />
                    ACCOMMODATION
                </h2>
                <div className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-widest">
                   Stay Details
                </div>
            </div>

            <div className="space-y-6">
                <label className={`flex items-center gap-4 p-6 rounded-3xl border-2 transition-all cursor-pointer ${isChecked ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800' : 'border-transparent bg-slate-50 dark:bg-slate-800/50'}`}>
                    <input 
                        type="checkbox" 
                        id="hotel_as_per_category"
                        checked={isChecked} 
                        onChange={(e) => handleInputChange({ target: { name: "hotel_as_per_category", value: e.target.checked ? "As per category" : "" } })}
                        className="accent-indigo-600 size-5 rounded" 
                    />
                    <div className="flex-1">
                       <p className={`text-sm font-black uppercase tracking-widest ${isChecked ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`}>Standardize by Package Category</p>
                       <p className="text-[10px] text-slate-400 font-medium mt-0.5 tracking-wide flex items-center gap-1">
                          <Hotel size={10} /> Hotels will be matched to the selected tier (3★ / 4★ / 5★ or Luxury Resorts)
                       </p>
                    </div>
                </label>

                <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 flex items-start gap-4 border border-slate-100 dark:border-slate-800">
                    <div className="bg-white dark:bg-slate-700 p-2 rounded-xl shadow-sm"><Heart size={16} className="text-pink-500" /></div>
                    <p className="text-[11px] font-medium text-slate-500 leading-relaxed">
                        By enabling this, the system will automatically present couples with our hand-picked romantic properties that align with their chosen luxury tier, ensuring consistency across their honeymoon experience.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default HotelDetailsSection;
