import { useState, useEffect } from "react";
import { FiSettings, FiSave, FiMail, FiPhone, FiMapPin, FiFacebook, FiInstagram, FiTwitter, FiLoader } from "react-icons/fi";
import { apiClient } from "../../stores/authStores";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    supportEmail: "",
    supportPhone: "",
    officeAddress: "",
    facebookUrl: "",
    instagramUrl: "",
    twitterUrl: "",
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await apiClient.get("/admin/global-settings");
        if (res.data.success && res.data.data) {
          setFormData(res.data.data);
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
        toast.error("Failed to load settings");
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiClient.put("/admin/global-settings", formData);
      toast.success("Settings updated successfully! ✨");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <FiLoader className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-y-8 p-4 md:p-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 flex items-center gap-3">
          <FiSettings className="text-slate-700" /> Global Site Settings
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Manage your contact information and social media links across the entire platform.
        </p>
      </div>

      <form onSubmit={handleSave} className="max-w-4xl space-y-8">
        {/* Contact Info Section */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
        >
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50 mb-6 flex items-center gap-2">
            <FiMail className="text-blue-500" /> Contact Information
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Support Email
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  name="supportEmail"
                  value={formData.supportEmail}
                  onChange={handleChange}
                  placeholder="info@example.com"
                  className="w-full rounded-lg border border-slate-300 bg-transparent py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-slate-700 dark:text-slate-50"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Support Phone
              </label>
              <div className="relative">
                <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  name="supportPhone"
                  value={formData.supportPhone}
                  onChange={handleChange}
                  placeholder="+91 0000 000 000"
                  className="w-full rounded-lg border border-slate-300 bg-transparent py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-slate-700 dark:text-slate-50"
                  required
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Office Address
              </label>
              <div className="relative">
                <FiMapPin className="absolute left-3 top-3 text-slate-400" />
                <textarea
                  name="officeAddress"
                  value={formData.officeAddress}
                  onChange={handleChange}
                  placeholder="Enter full office address..."
                  rows="3"
                  className="w-full rounded-lg border border-slate-300 bg-transparent py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-slate-700 dark:text-slate-50"
                  required
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Social Links Section */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
        >
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50 mb-6 flex items-center gap-2">
            <FiFacebook className="text-blue-600" /> Social Media Links
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Facebook URL
              </label>
              <div className="relative">
                <FiFacebook className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="url"
                  name="facebookUrl"
                  value={formData.facebookUrl}
                  onChange={handleChange}
                  placeholder="https://facebook.com/your-page"
                  className="w-full rounded-lg border border-slate-300 bg-transparent py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-slate-700 dark:text-slate-50"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Instagram URL
              </label>
              <div className="relative">
                <FiInstagram className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="url"
                  name="instagramUrl"
                  value={formData.instagramUrl}
                  onChange={handleChange}
                  placeholder="https://instagram.com/your-handle"
                  className="w-full rounded-lg border border-slate-300 bg-transparent py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-slate-700 dark:text-slate-50"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Twitter URL
              </label>
              <div className="relative">
                <FiTwitter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="url"
                  name="twitterUrl"
                  value={formData.twitterUrl}
                  onChange={handleChange}
                  placeholder="https://twitter.com/your-handle"
                  className="w-full rounded-lg border border-slate-300 bg-transparent py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-slate-700 dark:text-slate-50"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-8 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-blue-700 hover:shadow-xl active:scale-95 disabled:opacity-50"
          >
            {saving ? (
              <>
                <FiLoader className="animate-spin" /> Saving Changes...
              </>
            ) : (
              <>
                <FiSave /> Save All Settings
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
