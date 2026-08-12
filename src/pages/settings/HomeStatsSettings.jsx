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
      <div className="min-h-screen bg-slate-50 dark:bg-[#070b14] p-6 lg:p-10 flex flex-col items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
          <BarChart3 className="absolute inset-0 m-auto text-indigo-500 animate-pulse" size={24} />
        </div>
        <p className="mt-4 text-xs font-black tracking-widest text-slate-400 uppercase">
          Loading Site Stats Config...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070b14] p-6 lg:p-10 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <div className="max-w-6xl mx-auto space-y-10">

        {/* HEADER BAR */}
        <div className="relative bg-white dark:bg-[#0f172a] rounded-3xl p-6 lg:p-8 border border-slate-200/80 dark:border-slate-800/80 shadow-xl overflow-hidden backdrop-blur-xl">
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-rose-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-black tracking-wider uppercase mb-3">
                <Sparkles size={14} /> SITE-WIDE METRICS MANAGEMENT
              </div>
              <h1 className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                <BarChart3 className="text-indigo-500" size={36} />
                Site Stats Settings
              </h1>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
                Manage the live statistical figures displayed across both the <span className="font-semibold text-indigo-600 dark:text-indigo-400">Homepage</span> and the <span className="font-semibold text-indigo-600 dark:text-indigo-400">About Us Page</span>.
              </p>
            </div>

            <button
              onClick={fetchStatsData}
              type="button"
              className="self-start md:self-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all border border-slate-200 dark:border-slate-700 shadow-sm cursor-pointer active:scale-95"
            >
              <RefreshCcw size={14} className={loading ? "animate-spin" : ""} />
              Reset / Reload
            </button>
          </div>
        </div>

        <form onSubmit={handleSaveStats} className="space-y-10">
          
          {/* SECTION 1: HOMEPAGE STATS */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
              <Sparkles className="text-indigo-500" size={20} />
              <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                1. Homepage Stats ("The Essence of Romance")
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {homeFields.map((field) => {
                const IconComp = field.icon;
                return (
                  <motion.div
                    key={field.key}
                    whileHover={{ y: -3 }}
                    transition={{ duration: 0.2 }}
                    className="bg-white dark:bg-[#0f172a] rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-lg flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className={`p-3.5 rounded-2xl bg-gradient-to-br ${field.color} border shadow-inner flex items-center justify-center`}>
                          <IconComp size={24} />
                        </div>
                        <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase bg-slate-100 dark:bg-slate-800/60 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                          HOMEPAGE METRIC
                        </span>
                      </div>

                      <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
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
                        className="w-full bg-slate-50 dark:bg-[#070b14] border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3.5 text-2xl font-black text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-lg font-black text-indigo-500 select-none">
                        +
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* SECTION 2: ABOUT US PAGE STATS (DEDICATED BOX) */}
          <div className="space-y-6 bg-white dark:bg-[#0f172a] rounded-3xl p-6 lg:p-8 border border-slate-200/80 dark:border-slate-800/80 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <Compass className="text-indigo-500" size={24} />
                <div>
                  <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                    2. About Us Page Stats Bar
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Controls the 4 statistical counter blocks on the top of the <span className="font-semibold text-indigo-500">About Us Page</span>.
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-3 py-1.5 rounded-full border border-indigo-500/20">
                LIVE ABOUT STATS
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {aboutFields.map((field) => {
                const IconComp = field.icon;
                return (
                  <div
                    key={field.key}
                    className="bg-slate-50 dark:bg-[#070b14] rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className={`p-3 w-fit rounded-xl bg-gradient-to-br ${field.color} border shadow-inner flex items-center justify-center mb-3`}>
                        <IconComp size={20} />
                      </div>
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
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
                        className="w-full bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xl font-black text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm font-black text-indigo-500 select-none">
                        {field.suffix}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ABOUT US PREVIEW BAR */}
            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">
                About Us Page Live Preview Bar:
              </p>
              <div className="bg-slate-900 text-white rounded-2xl p-6 grid grid-cols-2 lg:grid-cols-4 gap-6 text-center border border-slate-800">
                <div>
                  <span className="text-2xl lg:text-3xl font-extrabold text-white">{statsData.aboutHappyCouples || 0}+</span>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Happy Couples</span>
                </div>
                <div>
                  <span className="text-2xl lg:text-3xl font-extrabold text-white">{statsData.aboutCountriesCovered || 0}+</span>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Countries Covered</span>
                </div>
                <div>
                  <span className="text-2xl lg:text-3xl font-extrabold text-white">{statsData.aboutTripsDesigned || 0}+</span>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Trips Designed</span>
                </div>
                <div>
                  <span className="text-2xl lg:text-3xl font-extrabold text-white">{statsData.aboutYearsExperience || 0} Yrs</span>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Of Experience</span>
                </div>
              </div>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {saving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save & Publish All Stats
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default HomeStatsSettings;
