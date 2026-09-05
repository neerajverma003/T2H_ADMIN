import React from "react";
import { MapPin, Navigation, Globe, ExternalLink } from "lucide-react";

export const ActivityLocationMapSection = ({
  formData,
  handleLocationChange,
  handleInputChange,
  styles,
}) => {
  const { cardStyle, labelStyle, inputStyle } = styles;
  const loc = formData.location_details || {};

  return (
    <div className={cardStyle}>
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
        <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <MapPin className="text-rose-600 dark:text-rose-400" size={22} />
          Maps, Location & Website Link
        </h2>
        <div className="px-3 py-1 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-full text-[11px] font-black uppercase tracking-widest">
          Coordinates & Direct URLs
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Starting / Meeting Point */}
          <div>
            <label htmlFor="starting_point" className={labelStyle}>
              <span className="flex items-center gap-1.5">
                <Navigation size={15} className="text-rose-600" /> Starting Point / Meeting Spot
              </span>
            </label>
            <input
              type="text"
              id="starting_point"
              name="starting_point"
              value={loc.starting_point || ""}
              onChange={handleLocationChange}
              placeholder="e.g. Sentosa Cable Car Station, Colva Beach Shack #4"
              className={inputStyle}
            />
          </div>

          {/* Official Website Link */}
          <div>
            <label htmlFor="website_link" className={labelStyle}>
              <span className="flex items-center gap-1.5">
                <Globe size={15} className="text-blue-600" /> Official Website / Booking URL
              </span>
            </label>
            <div className="relative">
              <input
                type="url"
                id="website_link"
                name="website_link"
                value={formData.website_link || ""}
                onChange={handleInputChange}
                placeholder="https://www.sentosa.com.sg/en/things-to-do/attractions"
                className={`${inputStyle} pr-10`}
              />
              {formData.website_link && (
                <a
                  href={formData.website_link}
                  target="_blank"
                  rel="noreferrer"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-800 transition-colors"
                  title="Open external link"
                >
                  <ExternalLink size={16} />
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Google Map Link */}
          <div>
            <label htmlFor="map_link" className={labelStyle}>
              Google Maps Web Link (for "View Map" Button)
            </label>
            <div className="relative">
              <input
                type="text"
                id="map_link"
                name="map_link"
                value={loc.map_link || ""}
                onChange={handleLocationChange}
                placeholder="https://maps.app.goo.gl/... or https://www.google.com/maps/place/..."
                className={`${inputStyle} pr-10`}
              />
              {loc.map_link && (
                <a
                  href={loc.map_link}
                  target="_blank"
                  rel="noreferrer"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-800 transition-colors"
                  title="Test link"
                >
                  <ExternalLink size={16} />
                </a>
              )}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Opens in Google Maps when customer clicks "View Map".
            </p>
          </div>

          {/* Google Map Embed Iframe URL */}
          <div>
            <label htmlFor="map_embed_url" className={labelStyle}>
              Map Embed URL (Optional for Interactive Map)
            </label>
            <div className="relative">
              <input
                type="text"
                id="map_embed_url"
                name="map_embed_url"
                value={loc.map_embed_url || ""}
                onPaste={(e) => {
                  const text = e.clipboardData.getData("text");
                  if (text && text.includes("<iframe")) {
                    e.preventDefault();
                    const match = text.match(/src=["'](.*?)["']/i);
                    const clean = match && match[1] ? match[1] : text;
                    handleLocationChange({
                      target: { name: "map_embed_url", value: clean },
                    });
                  }
                }}
                onChange={(e) => {
                  let val = e.target.value;
                  if (val && val.includes("<iframe")) {
                    const match = val.match(/src=["'](.*?)["']/i);
                    if (match && match[1]) val = match[1];
                  }
                  handleLocationChange({
                    target: { name: "map_embed_url", value: val },
                  });
                }}
                placeholder="Paste embed URL or entire <iframe> code from Google Maps"
                className={`${inputStyle} pr-10`}
              />
              {loc.map_embed_url && (
                <a
                  href={loc.map_embed_url}
                  target="_blank"
                  rel="noreferrer"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-rose-600 hover:text-rose-800 transition-colors"
                  title="Test embed link"
                >
                  <ExternalLink size={16} />
                </a>
              )}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              You can paste the entire Google Maps <code>&lt;iframe&gt;</code> code; the URL will be extracted automatically.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ActivityLocationMapSection;
