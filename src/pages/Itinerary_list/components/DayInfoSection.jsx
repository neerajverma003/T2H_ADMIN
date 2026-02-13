import React from "react";

const DayInfoSection = ({
  formData,
  handleArrayChange,
  handleAddItem,
  handleRemoveItem,
  styles,
}) => {
  return (
    <div className={`${styles.cardStyle} border-pink-200 dark:border-pink-900`}>
      <h2 className="mb-4 border-b border-pink-200 pb-2 text-xl font-bold text-pink-600 dark:border-pink-900">
        Day-wise Honeymoon Plan 💕
      </h2>

      {formData.days_information.map((item, index) => (
        <div
          key={index}
          className="mb-5 rounded-xl border border-pink-100 bg-pink-50 p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
        >
          <div className="mb-3 text-sm font-semibold text-pink-500">
            💖 Day {item.day || index + 1}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Day */}
            <div>
              <label className={styles.labelStyle}>Day</label>
              <input
                type="text"
                name="day"
                value={item.day}
                onChange={(e) =>
                  handleArrayChange(e, index, "days_information")
                }
                className={`${styles.inputStyle} focus:ring-pink-300`}
                placeholder="e.g. 1"
              />
            </div>

            {/* Location Name */}
            <div>
              <label className={styles.labelStyle}>Location Name</label>
              <input
                type="text"
                name="locationName"
                value={item.locationName}
                onChange={(e) =>
                  handleArrayChange(e, index, "days_information")
                }
                className={`${styles.inputStyle} focus:ring-pink-300`}
                placeholder="Romantic beach / hill resort"
              />
            </div>

            {/* Location Detail */}
            <div>
              <label className={styles.labelStyle}>Location Detail</label>
              <textarea
                name="locationDetail"
                value={item.locationDetail}
                onChange={(e) =>
                  handleArrayChange(e, index, "days_information")
                }
                className={`${styles.inputStyle} focus:ring-pink-300`}
                placeholder="Candlelight dinner, sunset views, private sightseeing…"
                rows={2}
              />
            </div>
          </div>

          {/* Remove button */}
          {formData.days_information.length > 1 && (
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() =>
                  handleRemoveItem(index, "days_information")
                }
                className={styles.removeButtonStyle}
              >
                Remove Day
              </button>
            </div>
          )}
        </div>
      ))}

      {/* Add Day button */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() =>
            handleAddItem("days_information", {
              day: `${formData.days_information.length + 1}`,
              locationName: "",
              locationDetail: "",
            })
          }
          className={`${styles.buttonStyle} bg-pink-600 hover:bg-pink-700`}
        >
          + Add Honeymoon Day 💍
        </button>
      </div>
    </div>
  );
};

export default DayInfoSection;
