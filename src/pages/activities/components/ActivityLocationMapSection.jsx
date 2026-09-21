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
      <div className="flex items-center justify-between pb-5 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-3.5">
          <div className="size-11 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-white shadow-lg shadow-rose-500/25 shrink-0">
            <MapPin size={20} />
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Maps, Location & Website Link
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
              Meeting point coordinates, live Google Maps routing, and official web links
            </p>
          </div>
        </div>
        <div className="px-3.5 py-1.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl text-[10px] font-black uppercase tracking-wider">
          Navigation & Coordinates
        </div>
      </div>

      <div className="space-y-6 pt-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Starting / Meeting Point */}
          <div>
            <label htmlFor="starting_point" className={labelStyle}>
              <Navigation size={14} className="text-rose-400" />
              <span>Starting Point / Meeting Spot</span>
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
              <Globe size={14} className="text-blue-400" />
              <span>Official Website / Direct URL</span>
            </label>
            <div className="relative">
              <input
                type="url"
                id="website_link"
                name="website_link"
                value={formData.website_link || ""}
                onChange={handleInputChange}
                placeholder="https://www.sentosa.com.sg/en/things-to-do/attractions"
                className={`${inputStyle} pr-12`}
              />
              {formData.website_link && (
                <a
                  href={formData.website_link}
                  target="_blank"
                  rel="noreferrer"
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-all cursor-pointer"
                  title="Open external link"
                >
                  <ExternalLink size={15} />
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Google Map Link */}
          <div>
            <label htmlFor="map_link" className={labelStyle}>
              <MapPin size={14} className="text-rose-400" />
              <span>Google Maps Link (For "View Map" Button)</span>
            </label>
            <div className="relative">
              <input
                type="text"
                id="map_link"
                name="map_link"
                value={loc.map_link || ""}
                onChange={handleLocationChange}
                placeholder="https://maps.app.goo.gl/... or https://www.google.com/maps/place/..."
                className={`${inputStyle} pr-12`}
              />
              {loc.map_link && (
                <a
                  href={loc.map_link}
                  target="_blank"
                  rel="noreferrer"
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-all cursor-pointer"
                  title="Test map link"
                >
                  <ExternalLink size={15} />
                </a>
              )}
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5 ml-1">
              Launches Google Maps directly when travelers click the View Map action.
            </p>
          </div>

          {/* Google Map Embed Iframe URL */}
          <div>
            <label htmlFor="map_embed_url" className={labelStyle}>
              <MapPin size={14} className="text-rose-400" />
              <span>Map Embed URL (Optional for Interactive Map)</span>
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
                placeholder="Paste embed URL or entire <iframe> snippet from Google Maps"
                className={`${inputStyle} pr-12`}
              />
              {loc.map_embed_url && (
                <a
                  href={loc.map_embed_url}
                  target="_blank"
                  rel="noreferrer"
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-all cursor-pointer"
                  title="Test embed link"
                >
                  <ExternalLink size={15} />
                </a>
              )}
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5 ml-1">
              You can paste the entire Google Maps <code className="text-rose-400">&lt;iframe&gt;</code> code; src is extracted automatically.
            </p>
          </div>
        </div>

        {/* Optional Live Embed Preview if provided */}
        {loc.map_embed_url && (
          <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#050A17] h-56 relative shadow-inner">
            <iframe
              src={loc.map_embed_url}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Location Map Preview"
              className="w-full h-full opacity-90 hover:opacity-100 transition-opacity"
            />
          </div>
        )}
      </div>
    </div>
  );
};
export default ActivityLocationMapSection;

