import React from "react";
import { Clock, Calendar, MapPin } from "lucide-react";

const ALL_DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

export const ActivityOperatingHoursSection = ({
  formData,
  handleOperatingHoursChange,
  handleDaysToggle,
  styles,
}) => {
  const { cardStyle, labelStyle, inputStyle } = styles;
  const opHours = formData.operating_hours || {};
  const activeDays = opHours.days || ALL_DAYS;

  return (
    <div className={cardStyle}>
      <div className="flex items-center justify-between pb-5 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-3.5">
          <div className="size-11 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/25 shrink-0">
            <Clock size={20} />
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Operating Hours & Schedules
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
              Operational base, active days of the week, and daily opening slots
            </p>
          </div>
        </div>
        <div className="px-3.5 py-1.5 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded-xl text-[10px] font-black uppercase tracking-wider">
          {activeDays.length} Days Active
        </div>
      </div>

      <div className="space-y-6 pt-2">
        {/* Location / Station Name */}
        <div>
          <label htmlFor="location_name" className={labelStyle}>
            <MapPin size={14} className="text-cyan-400" />
            <span>Operational Hub / Area Base</span>
          </label>
          <input
            type="text"
            id="location_name"
            name="location_name"
            value={opHours.location_name || ""}
            onChange={handleOperatingHoursChange}
            placeholder="e.g. Sentosa Island Station, North Goa Beach Base"
            className={inputStyle}
          />
        </div>

        {/* Operating Days Selector Pills */}
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#050A17] border border-slate-200 dark:border-slate-800/90 shadow-inner">
          <label className={labelStyle}>
            <Calendar size={14} className="text-cyan-400" />
            <span>Operating Days of the Week</span>
          </label>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Click to toggle which days of the week this activity is open and bookable:
          </p>

          <div className="flex flex-wrap gap-2.5">
            {ALL_DAYS.map((day) => {
              const isSelected = activeDays.includes(day);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleDaysToggle(day)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer border ${
                    isSelected
                      ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-cyan-400/50 shadow-lg shadow-cyan-500/25"
                      : "bg-white dark:bg-[#091126] text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-700 dark:hover:text-slate-200"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>

        {/* Timings */}
        <div>
          <label htmlFor="timings" className={labelStyle}>
            <Clock size={14} className="text-cyan-400" />
            <span>Timings & Batch Slots</span>
          </label>
          <input
            type="text"
            id="timings"
            name="timings"
            value={opHours.timings || ""}
            onChange={handleOperatingHoursChange}
            placeholder="e.g. 24 Hours, 10:00 AM - 07:00 PM, 06:00 AM - 11:00 AM (Morning Batches)"
            className={inputStyle}
          />
        </div>
      </div>
    </div>
  );
};
export default ActivityOperatingHoursSection;

