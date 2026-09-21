import React, { useState, useEffect } from "react";
import { apiClient } from "../../stores/authStores";
import {
  BarChart3,
  Route,
  Globe,
  Tent,
  Users,
  Save,
  RefreshCcw,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  Compass,
  Award,
  Heart,
  Plane,
} from "lucide-react";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

const HomeStatsSettings = () => {
  const [statsData, setStatsData] = useState({
    // Homepage Stats
    tripsAndTours: 150,
    destinationsCount: 42,
    activitiesCount: 50,
    happyCouplesCount: 100,
    // About Us Page Stats
    aboutHappyCouples: 150,
    aboutCountriesCovered: 42,
    aboutTripsDesigned: 1000,
    aboutYearsExperience: 10,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchStatsData = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/admin/global-settings");
      if (res.data.success && res.data.data) {
        setStatsData({
          tripsAndTours: res.data.data.tripsAndTours !== undefined ? Number(res.data.data.tripsAndTours) : 150,
          destinationsCount: res.data.data.destinationsCount !== undefined ? Number(res.data.data.destinationsCount) : 42,
          activitiesCount: res.data.data.activitiesCount !== undefined ? Number(res.data.data.activitiesCount) : 50,
          happyCouplesCount: res.data.data.happyCouplesCount !== undefined ? Number(res.data.data.happyCouplesCount) : 100,
          aboutHappyCouples: res.data.data.aboutHappyCouples !== undefined ? Number(res.data.data.aboutHappyCouples) : 150,
          aboutCountriesCovered: res.data.data.aboutCountriesCovered !== undefined ? Number(res.data.data.aboutCountriesCovered) : 42,
          aboutTripsDesigned: res.data.data.aboutTripsDesigned !== undefined ? Number(res.data.data.aboutTripsDesigned) : 1000,
          aboutYearsExperience: res.data.data.aboutYearsExperience !== undefined ? Number(res.data.data.aboutYearsExperience) : 10,
        });
      }
    } catch (err) {
      console.error("fetchStatsData error:", err);
      toast.error("Failed to load Stats settings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatsData();
  }, []);

  const handleSaveStats = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await apiClient.put("/admin/global-settings", {
        tripsAndTours: Number(statsData.tripsAndTours),
        destinationsCount: Number(statsData.destinationsCount),
        activitiesCount: Number(statsData.activitiesCount),
        happyCouplesCount: Number(statsData.happyCouplesCount),
        aboutHappyCouples: Number(statsData.aboutHappyCouples),
        aboutCountriesCovered: Number(statsData.aboutCountriesCovered),
        aboutTripsDesigned: Number(statsData.aboutTripsDesigned),
        aboutYearsExperience: Number(statsData.aboutYearsExperience),
      });

      if (res.data.success) {
        toast.success("Site Stats updated & published to website successfully! ✨");
      }
    } catch (err) {
      console.error("handleSaveStats error:", err);
      toast.error(err.response?.data?.msg || err.response?.data?.message || "Failed to update Stats settings.");
    } finally {
      setSaving(false);
    }
  };

  const homeFields = [
    {
      key: "tripsAndTours",
      label: "TRIPS AND TOURS",
      description: "Total count of curated travel packages & itineraries",
      icon: Route,
      color: "from-blue-500/20 to-indigo-500/20 text-blue-500 border-blue-500/30",
    },
    {
      key: "destinationsCount",
      label: "DESTINATIONS",
      description: "Exotic and romantic honeymoon locations covered",
      icon: Globe,
      color: "from-emerald-500/20 to-teal-500/20 text-emerald-500 border-emerald-500/30",
    },
    {
      key: "activitiesCount",
      label: "ACTIVITIES",
      description: "Available experiences, tours, and couples activities",
      icon: Tent,
      color: "from-amber-500/20 to-orange-500/20 text-amber-500 border-amber-500/30",
    },
    {
      key: "happyCouplesCount",
      label: "HAPPY COUPLES",
      description: "Number of couples delighted by your trip services",
      icon: Users,
      color: "from-rose-500/20 to-pink-500/20 text-rose-500 border-rose-500/30",
    },
  ];

  const aboutFields = [
    {
      key: "aboutHappyCouples",
      label: "HAPPY COUPLES",
      description: "Displayed on the About Us page stats bar",
      icon: Heart,
      color: "from-pink-500/20 to-rose-500/20 text-pink-500 border-pink-500/30",
      suffix: "+",
    },
    {
      key: "aboutCountriesCovered",
      label: "COUNTRIES COVERED",
      description: "Total countries covered by your travel services",
      icon: Globe,
      color: "from-cyan-500/20 to-blue-500/20 text-cyan-500 border-cyan-500/30",
      suffix: "+",
    },
    {
      key: "aboutTripsDesigned",
      label: "TRIPS DESIGNED",
      description: "Total custom trip itineraries designed & executed",
      icon: Plane,
      color: "from-violet-500/20 to-purple-500/20 text-violet-500 border-violet-500/30",
      suffix: "+",
    },
    {
      key: "aboutYearsExperience",
      label: "YEARS OF EXPERIENCE",
      description: "Total years of industry experience & expertise",
      icon: Award,
      color: "from-amber-500/20 to-yellow-500/20 text-amber-500 border-amber-500/30",
      suffix: " Yrs",
    },
  ];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="relative">
          <div className="w-14 h-14 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin" />
          <BarChart3 className="absolute inset-0 m-auto text-blue-500 animate-pulse" size={22} />
        </div>
        <p className="mt-4 text-xs font-bold tracking-widest text-slate-400 uppercase">
          Loading Site Stats Config...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8 pb-20 font-sans min-h-screen text-slate-900 dark:text-slate-100 text-left">
      
      {/* HEADER BAR */}
      <div className="bg-white dark:bg-[#091126]/95 rounded-3xl py-4 sm:py-5 px-6 sm:px-8 border border-slate-200/90 dark:border-indigo-500/25 shadow-xl dark:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.7),0_0_30px_2px_rgba(99,102,241,0.18)] ring-1 ring-slate-900/5 dark:ring-white/5 backdrop-blur-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-blue-500/10 dark:bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-indigo-500/10 dark:bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-4 relative z-10">
          <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-500/30 shrink-0">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-500 dark:text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full">
                Site-Wide Metrics Management
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Site Stats Settings
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Manage the live statistical figures displayed across both the <span className="font-semibold text-blue-500 dark:text-blue-400">Homepage</span> and the <span className="font-semibold text-blue-500 dark:text-blue-400">About Us Page</span>.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 relative z-10 self-start md:self-auto">
          <button
            onClick={fetchStatsData}
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 font-medium text-xs border border-slate-200 dark:border-slate-700/70 transition-colors shadow-sm cursor-pointer active:scale-95"
          >
            <RefreshCcw size={13} className={loading ? "animate-spin" : ""} />
            Reset / Reload
          </button>
        </div>
      </div>

      <form onSubmit={handleSaveStats} className="space-y-8">
        
        {/* SECTION 1: HOMEPAGE STATS */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center">
                <Sparkles size={16} />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                  1. Homepage Stats ("The Essence of Romance")
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Highlights shown on the main landing page hero & metrics strip
                </p>
              </div>
            </div>
            <span className="text-[11px] font-bold text-blue-500 dark:text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full uppercase tracking-wider hidden sm:inline-block">
              Homepage Showcase
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {homeFields.map((field) => {
              const IconComp = field.icon;
              return (
                <motion.div
                  key={field.key}
                  whileHover={{ y: -3 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white dark:bg-[#091126]/95 rounded-3xl p-6 border border-slate-200/90 dark:border-indigo-500/25 shadow-xl dark:shadow-[0_8px_30px_rgba(0,0,0,0.5)] ring-1 ring-slate-900/5 dark:ring-white/5 backdrop-blur-xl flex flex-col justify-between transition-all hover:border-blue-500/40"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${field.color} border shadow-inner flex items-center justify-center`}>
                        <IconComp size={22} />
                      </div>
                      <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase bg-slate-100 dark:bg-slate-800/60 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700/60">
                        HOMEPAGE METRIC
                      </span>
                    </div>

                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                      {field.label}
                    </label>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">
                      {field.description}
                    </p>
                  </div>

                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      step="1"
                      required
                      value={statsData[field.key]}
                      onChange={(e) =>
                        setStatsData({
                          ...statsData,
                          [field.key]: e.target.value === "" ? "" : Math.max(0, parseInt(e.target.value) || 0),
                        })
                      }
                      className="w-full bg-slate-50 dark:bg-[#050A17] border border-slate-200 dark:border-slate-800/90 rounded-2xl px-4 py-3 text-2xl font-black text-slate-900 dark:text-white shadow-inner focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-lg font-bold text-blue-500 select-none">
                      +
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* SECTION 2: ABOUT US PAGE STATS (DEDICATED BOX) */}
        <div className="bg-white dark:bg-[#091126]/95 rounded-3xl p-6 lg:p-8 border border-slate-200/90 dark:border-indigo-500/25 shadow-xl dark:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.7),0_0_30px_2px_rgba(99,102,241,0.15)] ring-1 ring-slate-900/5 dark:ring-white/5 backdrop-blur-xl space-y-6 relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-60 h-60 bg-blue-500/10 dark:bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-200/80 dark:border-slate-800/80 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
                <Compass size={20} />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                  2. About Us Page Stats Bar
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Controls the 4 statistical counter blocks on the top of the <span className="font-semibold text-blue-500 dark:text-blue-400">About Us Page</span>.
                </p>
              </div>
            </div>
            <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full uppercase tracking-wider self-start sm:self-auto">
              Live About Stats
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 relative z-10">
            {aboutFields.map((field) => {
              const IconComp = field.icon;
              return (
                <div
                  key={field.key}
                  className="bg-slate-50/70 dark:bg-[#050A17]/80 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800/90 flex flex-col justify-between space-y-4 hover:border-indigo-500/30 transition-all"
                >
                  <div>
                    <div className={`p-2.5 w-fit rounded-xl bg-gradient-to-br ${field.color} border shadow-inner flex items-center justify-center mb-3`}>
                      <IconComp size={18} />
                    </div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                      {field.label}
                    </label>
                    <p className="text-[11px] text-slate-400 leading-tight">
                      {field.description}
                    </p>
                  </div>

                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      step="1"
                      required
                      value={statsData[field.key]}
                      onChange={(e) =>
                        setStatsData({
                          ...statsData,
                          [field.key]: e.target.value === "" ? "" : Math.max(0, parseInt(e.target.value) || 0),
                        })
                      }
                      className="w-full bg-white dark:bg-[#091126] border border-slate-200 dark:border-slate-800/90 rounded-xl px-3 py-2 text-xl font-bold text-slate-900 dark:text-white shadow-inner focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-indigo-500 dark:text-indigo-400 select-none">
                      {field.suffix}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ABOUT US PREVIEW BAR */}
          <div className="pt-6 border-t border-slate-200/80 dark:border-slate-800/80 relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
                About Us Page Live Preview Bar:
              </span>
            </div>
            <div className="bg-gradient-to-r from-slate-900 via-[#0B132B] to-slate-900 text-white rounded-2xl p-5 sm:p-6 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 text-center border border-slate-800/80 shadow-inner">
              <div className="p-2">
                <span className="text-2xl lg:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-300">{statsData.aboutHappyCouples || 0}+</span>
                <span className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider mt-1">Happy Couples</span>
              </div>
              <div className="p-2 border-l border-slate-800/60">
                <span className="text-2xl lg:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-300">{statsData.aboutCountriesCovered || 0}+</span>
                <span className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider mt-1">Countries Covered</span>
              </div>
              <div className="p-2 border-l-0 sm:border-l border-slate-800/60">
                <span className="text-2xl lg:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-300">{statsData.aboutTripsDesigned || 0}+</span>
                <span className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider mt-1">Trips Designed</span>
              </div>
              <div className="p-2 border-l border-slate-800/60">
                <span className="text-2xl lg:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-300">{statsData.aboutYearsExperience || 0} Yrs</span>
                <span className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider mt-1">Of Experience</span>
              </div>
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-blue-500/30 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving Changes...
              </>
            ) : (
              <>
                <Save size={15} />
                Save & Publish All Stats
              </>
            )}
          </button>
        </div>

      </form>

    </div>
  );
};

export default HomeStatsSettings;
