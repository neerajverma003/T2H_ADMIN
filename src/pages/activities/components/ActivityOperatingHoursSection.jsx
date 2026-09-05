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
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
        <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <Clock className="text-blue-600 dark:text-blue-400" size={22} />
          Operating Hours & Schedules
        </h2>
        <div className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-[11px] font-black uppercase tracking-widest">
          {activeDays.length} Days Active
        </div>
      </div>

      <div className="space-y-6">
        {/* Location / Station Name */}
        <div>
          <label htmlFor="location_name" className={labelStyle}>
            <span className="flex items-center gap-1.5">
              <MapPin size={15} className="text-blue-600 dark:text-blue-400" /> Operational Hub / Area Name
            </span>
          </label>
          <input
            type="text"
            id="location_name"
            name="location_name"
            value={opHours.location_name || ""}
            onChange={handleOperatingHoursChange}
            placeholder="e.g. Sentosa Island, North Goa Beach Base"
            className={inputStyle}
          />
        </div>

        {/* Operating Days Selector Pills */}
        <div>
          <label className={labelStyle}>
            <span className="flex items-center gap-1.5">
              <Calendar size={15} className="text-blue-600 dark:text-blue-400" /> Operating Days
            </span>
          </label>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
            Click to toggle which days of the week this activity operates:
          </p>

          <div className="flex flex-wrap gap-2.5">
            {ALL_DAYS.map((day) => {
              const isSelected = activeDays.includes(day);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleDaysToggle(day)}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer border ${
                    isSelected
                      ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20"
                      : "bg-slate-50 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300"
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
            Timings & Schedule Details
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
