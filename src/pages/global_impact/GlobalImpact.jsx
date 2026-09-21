import React, { useState, useEffect } from 'react';
import { apiClient } from '../../stores/authStores';
import { uploadFileToS3 } from '../../utils/s3Uploader';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe,
  Sparkles,
  Edit,
  Trash2,
  Eye,
  Plus,
  Building2,
  Users,
  Building,
  ShieldCheck,
  Heart,
  Award,
  MapPin,
  CheckCircle2,
  AlertCircle,
  X,
  Upload,
  ExternalLink,
  Image as ImageIcon,
  Layers,
  Save
} from 'lucide-react';
import { toast } from 'react-toastify';

// Available icons mapping for metrics
const ICON_MAP = {
  Users: Users,
  Globe: Globe,
  Building: Building,
  Building2: Building2,
  ShieldCheck: ShieldCheck,
  Heart: Heart,
  Award: Award,
  MapPin: MapPin,
  Sparkles: Sparkles
};

const AVAILABLE_ICONS = ['Users', 'Globe', 'Building', 'ShieldCheck', 'Heart', 'Award', 'MapPin', 'Sparkles'];

const GlobalImpact = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  // Modals state
  const [headerModalOpen, setHeaderModalOpen] = useState(false);
  const [partnerHeaderModalOpen, setPartnerHeaderModalOpen] = useState(false);
  const [metricModalOpen, setMetricModalOpen] = useState(false);
  const [logoModalOpen, setLogoModalOpen] = useState(false);
  const [viewModalData, setViewModalData] = useState(null); // { type: 'metric' | 'logo', data: object }

  // Editing items
  const [editingMetric, setEditingMetric] = useState(null); // null = add, object = edit
  const [editingLogo, setEditingLogo] = useState(null); // null = add, object = edit

  // Form states
  const [headerForm, setHeaderForm] = useState({ badge: '', title: '', subtitle: '' });
  const [partnerHeaderForm, setPartnerHeaderForm] = useState({ badge: '', title: '', subtitle: '' });
  const [metricForm, setMetricForm] = useState({ title: '', value: '', icon: 'Users', order: 1, is_active: true });
  const [logoForm, setLogoForm] = useState({ name: '', logo_url: '', logo_key: '', website_url: '', order: 1, is_active: true });

  // Logo file upload state
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoPreview, setLogoPreview] = useState('');

  // Saving states
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchGlobalImpact();
  }, []);

  const fetchGlobalImpact = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/admin/global-impact');
      if (res.data?.success && res.data?.data) {
        setData(res.data.data);
      } else {
        toast.error(res.data?.msg || 'Failed to load Global Impact settings.');
      }
    } catch (err) {
      console.error('fetchGlobalImpact Error:', err);
      toast.error(err.response?.data?.msg || 'Error loading Global Impact data.');
    } finally {
      setLoading(false);
    }
  };

  // Toggle whole section active
  const handleToggleStatus = async () => {
    try {
      const res = await apiClient.put('/admin/global-impact/status', { is_active: !data?.is_active });
      if (res.data?.success) {
        setData(res.data.data);
        toast.success(res.data.msg);
      }
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to toggle status.');
    }
  };

  // Open Header Modal
  const handleOpenHeaderModal = () => {
    setHeaderForm({
      badge: data?.header?.badge || 'Our Global Footprint & Impact',
      title: data?.header?.title || 'Creating Timeless Memories',
      subtitle: data?.header?.subtitle || ''
    });
    setHeaderModalOpen(true);
  };

  // Save Header
  const handleSaveHeader = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await apiClient.put('/admin/global-impact/header', headerForm);
      if (res.data?.success) {
        setData(res.data.data);
        toast.success('Header configuration updated!');
        setHeaderModalOpen(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to update header.');
    } finally {
      setSubmitting(false);
    }
  };

  // Open Partner Header Modal
  const handleOpenPartnerHeaderModal = () => {
    setPartnerHeaderForm({
      badge: data?.partner_section?.badge || 'Hospitality & Resort Partners',
      title: data?.partner_section?.title || 'Elite Hotel & Resort Partners',
      subtitle: data?.partner_section?.subtitle || ''
    });
    setPartnerHeaderModalOpen(true);
  };

  // Save Partner Header
  const handleSavePartnerHeader = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await apiClient.put('/admin/global-impact/partner-header', partnerHeaderForm);
      if (res.data?.success) {
        setData(res.data.data);
        toast.success('Partner section updated!');
        setPartnerHeaderModalOpen(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to update partner header.');
    } finally {
      setSubmitting(false);
    }
  };

  // Open Metric Modal (Add or Edit)
  const handleOpenMetricModal = (metric = null) => {
    if (metric) {
      setEditingMetric(metric);
      setMetricForm({
        title: metric.title,
        value: metric.value,
        icon: metric.icon || 'Users',
        order: metric.order || 1,
        is_active: metric.is_active !== false
      });
    } else {
      setEditingMetric(null);
      setMetricForm({
        title: '',
        value: '',
        icon: 'Users',
        order: (data?.impact_metrics?.length || 0) + 1,
        is_active: true
      });
    }
    setMetricModalOpen(true);
  };

  // Save Metric
  const handleSaveMetric = async (e) => {
    e.preventDefault();
    if (!metricForm.title.trim() || !metricForm.value.trim()) {
      toast.error('Metric title and value are required.');
      return;
    }
    setSubmitting(true);
    try {
      let res;
      if (editingMetric) {
        res = await apiClient.put(`/admin/global-impact/metrics/${editingMetric._id}`, metricForm);
      } else {
        res = await apiClient.post('/admin/global-impact/metrics', metricForm);
      }
      if (res.data?.success) {
        setData(res.data.data);
        toast.success(editingMetric ? 'Metric updated!' : 'New metric box added!');
        setMetricModalOpen(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Error saving metric.');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Metric
  const handleDeleteMetric = async (metricId) => {
    if (!window.confirm('Are you sure you want to delete this metric box?')) return;
    try {
      const res = await apiClient.delete(`/admin/global-impact/metrics/${metricId}`);
      if (res.data?.success) {
        setData(res.data.data);
        toast.success('Metric deleted successfully.');
      }
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to delete metric.');
    }
  };

  // Open Logo Modal (Add or Edit)
  const handleOpenLogoModal = (logo = null) => {
    if (logo) {
      setEditingLogo(logo);
      setLogoForm({
        name: logo.name,
        logo_url: logo.logo_url,
        logo_key: logo.logo_key || '',
        website_url: logo.website_url || '',
        order: logo.order || 1,
        is_active: logo.is_active !== false
      });
      setLogoPreview(logo.logo_url);
    } else {
      setEditingLogo(null);
      setLogoForm({
        name: '',
        logo_url: '',
        logo_key: '',
        website_url: '',
        order: (data?.partner_logos?.length || 0) + 1,
        is_active: true
      });
      setLogoPreview('');
    }
    setLogoModalOpen(true);
  };

  // Handle Logo File Upload (S3 WebP)
  const handleLogoFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      // Automatic WebP conversion and S3 upload under folder structure global_impact/hotel_logos
      const result = await uploadFileToS3(file, {
        type: 'global_impact',
        fileType: 'hotel_logos',
        title: logoForm.name || 'hotel_logo'
      });

      setLogoForm((prev) => ({
        ...prev,
        logo_url: result.publicUrl,
        logo_key: result.s3Key
      }));
      setLogoPreview(result.publicUrl);
      toast.success('Hotel logo converted to WebP & uploaded to S3!');
    } catch (err) {
      console.error('Logo upload error:', err);
      toast.error('Failed to upload logo image.');
    } finally {
      setUploadingLogo(false);
    }
  };

  // Save Logo
  const handleSaveLogo = async (e) => {
    e.preventDefault();
    if (!logoForm.name.trim()) {
      toast.error('Hotel or Brand name is required.');
      return;
    }
    if (!logoForm.logo_url) {
      toast.error('Please provide a logo image by uploading a file or entering an image URL.');
      return;
    }
    setSubmitting(true);
    try {
      let res;
      if (editingLogo) {
        res = await apiClient.put(`/admin/global-impact/logos/${editingLogo._id}`, logoForm);
      } else {
        res = await apiClient.post('/admin/global-impact/logos', logoForm);
      }
      if (res.data?.success) {
        setData(res.data.data);
        toast.success(editingLogo ? 'Partner logo updated!' : 'New hotel logo added!');
        setLogoModalOpen(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Error saving partner logo.');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Logo
  const handleDeleteLogo = async (logoId) => {
    if (!window.confirm('Are you sure you want to delete this partner logo?')) return;
    try {
      const res = await apiClient.delete(`/admin/global-impact/logos/${logoId}`);
      if (res.data?.success) {
        setData(res.data.data);
        toast.success('Partner logo deleted successfully.');
      }
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to delete logo.');
    }
  };

  const renderIcon = (iconName, size = 20) => {
    const Component = ICON_MAP[iconName] || Users;
    return <Component size={size} />;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8 pb-20 font-sans min-h-screen text-slate-900 dark:text-slate-100 text-left">
      
      {/* Top Banner Card */}
      <div className="bg-white dark:bg-[#091126]/95 rounded-3xl py-4 sm:py-5 px-6 sm:px-8 border border-slate-200/90 dark:border-indigo-500/25 shadow-xl dark:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.7),0_0_30px_2px_rgba(99,102,241,0.18)] ring-1 ring-slate-900/5 dark:ring-white/5 backdrop-blur-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30 shrink-0">
            <Globe className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2 flex-wrap">
              Our Global Impact & <span className="text-blue-500">Hospitality Partners</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium mt-1 text-xs sm:text-sm md:text-base">
              Manage dynamic homepage impact metrics, milestone counters, and elite hotel & resort partner logos.
            </p>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="px-4 py-2 bg-slate-50 dark:bg-[#050A17] text-slate-700 dark:text-slate-300 rounded-2xl text-xs font-extrabold uppercase tracking-wider border border-slate-200 dark:border-slate-800/90 shadow-sm flex items-center gap-2">
            <span className="text-[10px] text-slate-400 font-black">PORTAL STATUS:</span>
            <button
              onClick={handleToggleStatus}
              className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                data?.is_active
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
              }`}
            >
              {data?.is_active ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
              {data?.is_active ? 'Active' : 'Disabled'}
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-24">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {/* SECTION 1: HEADER & PLATFORM SUBTITLE CARDS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Primary Header Box */}
            <div className="bg-white dark:bg-[#091126]/95 border border-slate-200/90 dark:border-indigo-500/25 rounded-3xl p-6 sm:p-8 shadow-xl ring-1 ring-slate-900/5 dark:ring-white/5 backdrop-blur-xl relative group hover:border-blue-500/40 transition-all">
              <div className="flex items-start justify-between gap-4 mb-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200 dark:border-blue-800/80">
                  <Sparkles size={12} />
                  {data?.header?.badge || 'Our Global Footprint & Impact'}
                </span>

                <button
                  onClick={handleOpenHeaderModal}
                  className="size-8 rounded-lg bg-slate-100 dark:bg-[#050A17] hover:bg-blue-50 dark:hover:bg-blue-900/40 text-slate-600 dark:text-slate-300 hover:text-blue-500 flex items-center justify-center transition-all cursor-pointer border border-slate-200 dark:border-slate-800"
                  title="Edit Primary Header"
                >
                  <Edit size={14} />
                </button>
              </div>

              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
                {data?.header?.title || 'Creating Timeless Memories'}
              </h3>

              <div className="text-[11px] font-extrabold uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                Primary Header Box
              </div>
            </div>

            {/* Platform Overview & Subtitle Box */}
            <div className="bg-white dark:bg-[#091126]/95 border border-slate-200/90 dark:border-indigo-500/25 rounded-3xl p-6 sm:p-8 shadow-xl ring-1 ring-slate-900/5 dark:ring-white/5 backdrop-blur-xl relative group hover:border-blue-500/40 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <span className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Globe size={14} className="text-blue-500" />
                    PLATFORM OVERVIEW & SUBTITLE
                  </span>

                  <button
                    onClick={handleOpenHeaderModal}
                    className="size-8 rounded-lg bg-slate-100 dark:bg-[#050A17] hover:bg-blue-50 dark:hover:bg-blue-900/40 text-slate-600 dark:text-slate-300 hover:text-blue-500 flex items-center justify-center transition-all cursor-pointer border border-slate-200 dark:border-slate-800"
                    title="Edit Subtitle"
                  >
                    <Edit size={14} />
                  </button>
                </div>

                <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                  {data?.header?.subtitle || "We don't just sell tours, we build relationships. Our numbers reflect the dedication we bring to every single package we craft."}
                </p>
              </div>

              <div className="flex justify-between items-center text-[11px] font-extrabold uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                <span>Subtitle & Mission Description Box</span>
                <span className="text-amber-500 dark:text-amber-400">Editable</span>
              </div>
            </div>

          </div>

          {/* SECTION 2: GLOBAL IMPACT STATISTICS & METRICS CARDS */}
          <div className="bg-white dark:bg-[#091126]/95 border border-slate-200/90 dark:border-indigo-500/25 rounded-3xl p-6 sm:p-8 shadow-xl ring-1 ring-slate-900/5 dark:ring-white/5 backdrop-blur-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800/80 mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles size={20} className="text-blue-500" />
                  Global Impact Statistics & Metrics Cards ({data?.impact_metrics?.length || 0})
                </h2>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                  Each statistic is rendered in an individual box. Click View, Edit, or Delete to manage.
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleOpenMetricModal(null)}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-blue-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer"
              >
                <Plus size={16} />
                 Add New Impact Box
              </button>
            </div>

            {/* Metrics Grid */}
            {!data?.impact_metrics || data.impact_metrics.length === 0 ? (
              <div className="p-12 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                <p className="text-sm font-bold text-slate-400">No impact metrics created yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {data.impact_metrics.map((metric) => (
                  <div
                    key={metric._id}
                    className="bg-slate-50 dark:bg-[#050A17] border border-slate-200 dark:border-slate-800/90 rounded-2xl p-6 flex flex-col justify-between hover:border-blue-500/50 transition-all shadow-inner group"
                  >
                    <div>
                      {/* Metric Icon */}
                      <div className="size-11 rounded-xl bg-blue-100/70 dark:bg-blue-600/20 border border-blue-200 dark:border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4 shadow-sm">
                        {renderIcon(metric.icon, 22)}
                      </div>

                      <p className="text-[11px] font-extrabold uppercase text-slate-500 dark:text-slate-400 tracking-wider mb-1 line-clamp-1">
                        {metric.title}
                      </p>

                      <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
                        {metric.value}
                      </p>
                    </div>

                    {/* Actions Row */}
                    <div className="pt-4 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between text-xs font-bold">
                      <button
                        onClick={() => setViewModalData({ type: 'metric', data: metric })}
                        className="text-slate-500 hover:text-blue-500 dark:text-slate-400 dark:hover:text-blue-400 flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Eye size={14} /> View
                      </button>

                      <button
                        onClick={() => handleOpenMetricModal(metric)}
                        className="text-slate-500 hover:text-emerald-500 dark:text-slate-400 dark:hover:text-emerald-400 flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Edit size={14} /> Edit
                      </button>

                      <button
                        onClick={() => handleDeleteMetric(metric._id)}
                        className="text-slate-400 hover:text-rose-500 flex items-center gap-1 cursor-pointer transition-colors"
                        title="Delete Metric"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SECTION 3: HOSPITALITY & RESORT PARTNERS HEADERS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Partner Title Box */}
            <div className="bg-white dark:bg-[#091126]/95 border border-slate-200/90 dark:border-indigo-500/25 rounded-3xl p-6 sm:p-8 shadow-xl ring-1 ring-slate-900/5 dark:ring-white/5 backdrop-blur-xl relative group hover:border-blue-500/40 transition-all">
              <div className="flex items-start justify-between gap-4 mb-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200 dark:border-blue-800/80">
                  <Building2 size={12} />
                  {data?.partner_section?.badge || 'Hospitality & Resort Partners'}
                </span>

                <button
                  onClick={handleOpenPartnerHeaderModal}
                  className="size-8 rounded-lg bg-slate-100 dark:bg-[#050A17] hover:bg-blue-50 dark:hover:bg-blue-900/40 text-slate-600 dark:text-slate-300 hover:text-blue-500 flex items-center justify-center transition-all cursor-pointer border border-slate-200 dark:border-slate-800"
                  title="Edit Partner Title"
                >
                  <Edit size={14} />
                </button>
              </div>

              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
                {data?.partner_section?.title || 'Elite Hotel & Resort Partners'}
              </h3>

              <div className="text-[11px] font-extrabold uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                Partner Title Box
              </div>
            </div>

            {/* Partnership Vision & Mission Box */}
            <div className="bg-white dark:bg-[#091126]/95 border border-slate-200/90 dark:border-indigo-500/25 rounded-3xl p-6 sm:p-8 shadow-xl ring-1 ring-slate-900/5 dark:ring-white/5 backdrop-blur-xl relative group hover:border-blue-500/40 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <span className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Building2 size={14} className="text-blue-500" />
                    PARTNERSHIP VISION & MISSION
                  </span>

                  <button
                    onClick={handleOpenPartnerHeaderModal}
                    className="size-8 rounded-lg bg-slate-100 dark:bg-[#050A17] hover:bg-blue-50 dark:hover:bg-blue-900/40 text-slate-600 dark:text-slate-300 hover:text-blue-500 flex items-center justify-center transition-all cursor-pointer border border-slate-200 dark:border-slate-800"
                    title="Edit Partner Mission"
                  >
                    <Edit size={14} />
                  </button>
                </div>

                <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                  {data?.partner_section?.subtitle || 'We collaborate exclusively with the world\'s most prestigious hospitality brands to ensure your stay is as extraordinary as your journey.'}
                </p>
              </div>

              <div className="flex justify-between items-center text-[11px] font-extrabold uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                <span>Partner Description Box</span>
                <span className="text-amber-500 dark:text-amber-400">Editable</span>
              </div>
            </div>

          </div>

          {/* SECTION 4: PARTNER HOTEL LOGOS & BRAND GALLERY */}
          <div className="bg-white dark:bg-[#091126]/95 border border-slate-200/90 dark:border-indigo-500/25 rounded-3xl p-6 sm:p-8 shadow-xl ring-1 ring-slate-900/5 dark:ring-white/5 backdrop-blur-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800/80 mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Building2 size={20} className="text-blue-500" />
                  Partner Hotel Logos & Brand Gallery ({data?.partner_logos?.length || 0})
                </h2>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                  Upload and manage luxury hotel & resort brand logo images displayed on the global impact portal.
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleOpenLogoModal(null)}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-blue-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer"
              >
                <Upload size={16} />
                 Upload New Logo
              </button>
            </div>

            {/* Hotel Logos Grid */}
            {!data?.partner_logos || data.partner_logos.length === 0 ? (
              <div className="p-16 text-center border border-dashed border-slate-800 rounded-2xl">
                <div className="size-16 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-4">
                  <ImageIcon size={28} />
                </div>
                <h3 className="text-base font-bold text-white mb-1">No Hotel Logos Uploaded</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Click "+ Upload New Logo" above to add your first hotel or resort partner logo.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {data.partner_logos.map((logo) => (
                  <div
                    key={logo._id}
                    className="bg-[#0e1627] border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between hover:border-amber-500/50 transition-all shadow-md group relative"
                  >
                    {/* Active Status Indicator */}
                    <div className="absolute top-3.5 right-3.5 size-2.5 rounded-full bg-amber-400 shadow-sm" title="Active"></div>

                    {/* Logo Image Area with Clean White Container */}
                    <div className="w-full h-36 bg-white rounded-xl border border-slate-200/50 p-4 flex items-center justify-center overflow-hidden mb-3 shadow-inner">
                      {logo.logo_url ? (
                        <img
                          src={logo.logo_url}
                          alt={logo.name}
                          className="max-h-full max-w-full object-contain filter hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      ) : (
                        <ImageIcon size={32} className="text-slate-300" />
                      )}
                    </div>

                    {/* Hotel Name */}
                    <p className="text-center font-bold text-sm text-slate-200 mb-3 line-clamp-1">
                      {logo.name}
                    </p>

                    {/* Actions Row */}
                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold">
                      <button
                        onClick={() => setViewModalData({ type: 'logo', data: logo })}
                        className="text-slate-400 hover:text-blue-400 flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Eye size={14} /> View
                      </button>

                      <button
                        onClick={() => handleOpenLogoModal(logo)}
                        className="text-slate-400 hover:text-amber-400 flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Edit size={14} /> Edit
                      </button>

                      <button
                        onClick={() => handleDeleteLogo(logo._id)}
                        className="text-slate-500 hover:text-rose-500 flex items-center gap-1 cursor-pointer transition-colors"
                        title="Delete Logo"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* MODAL 1: EDIT PRIMARY HEADER */}
      <AnimatePresence>
        {headerModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#0d162b] border border-slate-200 dark:border-[#233558] rounded-3xl p-6 md:p-8 w-full max-w-xl shadow-2xl relative"
            >
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Edit size={18} className="text-blue-600" /> Edit Primary Header & Subtitle
                </h3>
                <button
                  onClick={() => setHeaderModalOpen(false)}
                  className="size-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveHeader} className="space-y-4">
                <div>
                  <label className="block text-xs font-extrabold uppercase text-slate-400 mb-1">Badge Tag</label>
                  <input
                    type="text"
                    value={headerForm.badge}
                    onChange={(e) => setHeaderForm({ ...headerForm, badge: e.target.value })}
                    placeholder="e.g. Our Global Footprint & Impact"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-[#15233e] border border-slate-200 dark:border-[#233558] rounded-xl font-bold text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase text-slate-400 mb-1">Main Heading</label>
                  <input
                    type="text"
                    value={headerForm.title}
                    onChange={(e) => setHeaderForm({ ...headerForm, title: e.target.value })}
                    placeholder="e.g. Creating Timeless Memories"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-[#15233e] border border-slate-200 dark:border-[#233558] rounded-xl font-bold text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/30"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase text-slate-400 mb-1">Platform Subtitle / Description</label>
                  <textarea
                    rows={4}
                    value={headerForm.subtitle}
                    onChange={(e) => setHeaderForm({ ...headerForm, subtitle: e.target.value })}
                    placeholder="Enter platform subtitle or mission description..."
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-[#15233e] border border-slate-200 dark:border-[#233558] rounded-xl font-semibold text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/30 resize-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setHeaderModalOpen(false)}
                    className="px-5 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/20 cursor-pointer disabled:opacity-60"
                  >
                    {submitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: EDIT PARTNER SECTION HEADERS */}
      <AnimatePresence>
        {partnerHeaderModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#0d162b] border border-slate-200 dark:border-[#233558] rounded-3xl p-6 md:p-8 w-full max-w-xl shadow-2xl relative"
            >
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Edit size={18} className="text-amber-500" /> Edit Hospitality & Resort Partner Headers
                </h3>
                <button
                  onClick={() => setPartnerHeaderModalOpen(false)}
                  className="size-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSavePartnerHeader} className="space-y-4">
                <div>
                  <label className="block text-xs font-extrabold uppercase text-slate-400 mb-1">Badge Tag</label>
                  <input
                    type="text"
                    value={partnerHeaderForm.badge}
                    onChange={(e) => setPartnerHeaderForm({ ...partnerHeaderForm, badge: e.target.value })}
                    placeholder="e.g. Hospitality & Resort Partners"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-[#15233e] border border-slate-200 dark:border-[#233558] rounded-xl font-bold text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase text-slate-400 mb-1">Partner Heading</label>
                  <input
                    type="text"
                    value={partnerHeaderForm.title}
                    onChange={(e) => setPartnerHeaderForm({ ...partnerHeaderForm, title: e.target.value })}
                    placeholder="e.g. Elite Hotel & Resort Partners"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-[#15233e] border border-slate-200 dark:border-[#233558] rounded-xl font-bold text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500/30"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase text-slate-400 mb-1">Partnership Mission & Vision Text</label>
                  <textarea
                    rows={4}
                    value={partnerHeaderForm.subtitle}
                    onChange={(e) => setPartnerHeaderForm({ ...partnerHeaderForm, subtitle: e.target.value })}
                    placeholder="Enter partnership description..."
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-[#15233e] border border-slate-200 dark:border-[#233558] rounded-xl font-semibold text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500/30 resize-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setPartnerHeaderModalOpen(false)}
                    className="px-5 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-sm rounded-xl shadow-lg shadow-amber-500/20 cursor-pointer disabled:opacity-60"
                  >
                    {submitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 3: ADD / EDIT METRIC BOX */}
      <AnimatePresence>
        {metricModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#0d162b] border border-slate-200 dark:border-[#233558] rounded-3xl p-6 md:p-8 w-full max-w-lg shadow-2xl relative"
            >
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles size={18} className="text-blue-600" />
                  {editingMetric ? 'Edit Impact Metric Box' : 'Add New Impact Metric Box'}
                </h3>
                <button
                  onClick={() => setMetricModalOpen(false)}
                  className="size-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveMetric} className="space-y-4">
                <div>
                  <label className="block text-xs font-extrabold uppercase text-slate-400 mb-1">Metric Title / Label</label>
                  <input
                    type="text"
                    value={metricForm.title}
                    onChange={(e) => setMetricForm({ ...metricForm, title: e.target.value })}
                    placeholder="e.g. GLOBAL TRAVELERS SERVED"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-[#15233e] border border-slate-200 dark:border-[#233558] rounded-xl font-bold text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/30"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase text-slate-400 mb-1">Metric Value</label>
                  <input
                    type="text"
                    value={metricForm.value}
                    onChange={(e) => setMetricForm({ ...metricForm, value: e.target.value })}
                    placeholder="e.g. 50k+, 200+, 1,250+, 100%"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-[#15233e] border border-slate-200 dark:border-[#233558] rounded-xl font-extrabold text-base text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/30"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase text-slate-400 mb-2">Select Icon</label>
                  <div className="grid grid-cols-4 gap-2">
                    {AVAILABLE_ICONS.map((iconName) => (
                      <button
                        key={iconName}
                        type="button"
                        onClick={() => setMetricForm({ ...metricForm, icon: iconName })}
                        className={`p-3 rounded-xl border flex flex-col items-center gap-1 text-xs font-bold transition-all cursor-pointer ${
                          metricForm.icon === iconName
                            ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/30'
                            : 'bg-slate-50 dark:bg-[#15233e] border-slate-200 dark:border-[#233558] text-slate-600 dark:text-slate-300 hover:border-blue-400'
                        }`}
                      >
                        {renderIcon(iconName, 20)}
                        <span className="text-[10px]">{iconName}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-extrabold uppercase text-slate-400 mb-1">Display Order</label>
                    <input
                      type="number"
                      min="1"
                      value={metricForm.order}
                      onChange={(e) => setMetricForm({ ...metricForm, order: Number(e.target.value) })}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-[#15233e] border border-slate-200 dark:border-[#233558] rounded-xl font-bold text-sm text-slate-900 dark:text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold uppercase text-slate-400 mb-1">Status</label>
                    <select
                      value={metricForm.is_active ? 'active' : 'inactive'}
                      onChange={(e) => setMetricForm({ ...metricForm, is_active: e.target.value === 'active' })}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-[#15233e] border border-slate-200 dark:border-[#233558] rounded-xl font-bold text-sm text-slate-900 dark:text-white outline-none"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setMetricModalOpen(false)}
                    className="px-5 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/20 cursor-pointer disabled:opacity-60"
                  >
                    {submitting ? 'Saving...' : editingMetric ? 'Update Metric' : 'Add Metric'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 4: UPLOAD / EDIT PARTNER HOTEL LOGO (CLEAN & SHORT LIKE ADMIRE HOLIDAYS) */}
      <AnimatePresence>
        {logoModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0e1627] border border-slate-800/90 rounded-2xl p-6 md:p-7 w-full max-w-lg shadow-2xl relative text-white"
            >
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-800/80">
                <h3 className="text-base md:text-lg font-bold text-white flex items-center gap-2">
                  <Upload size={18} className="text-amber-500" />
                  {editingLogo ? 'Edit Partner Logo' : 'Upload Partner Hotel Logo to AWS S3'}
                </h3>
                <button
                  onClick={() => setLogoModalOpen(false)}
                  className="size-7 rounded-lg bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer transition-colors"
                >
                  <X size={15} />
                </button>
              </div>

              <form onSubmit={handleSaveLogo} className="space-y-4">
                {/* Field 1: Hotel Name */}
                <div>
                  <label className="block text-[11px] font-black uppercase text-slate-400 mb-1.5 tracking-wider">
                    Partner Hotel / Resort Name *
                  </label>
                  <input
                    type="text"
                    value={logoForm.name}
                    onChange={(e) => setLogoForm({ ...logoForm, name: e.target.value })}
                    placeholder="e.g. Periyar Nest Resort"
                    className="w-full px-4 py-2.5 bg-[#131d33] border border-slate-700/80 rounded-xl font-medium text-sm text-white placeholder:text-slate-500 outline-none focus:ring-1 focus:ring-amber-500/50"
                    required
                  />
                </div>

                {/* Field 2: S3 File Upload Box */}
                <div>
                  <label className="block text-[11px] font-black uppercase text-slate-400 mb-1.5 tracking-wider">
                    Choose Image File (Direct S3 Upload)
                  </label>
                  <label className="border border-dashed border-amber-500/50 rounded-xl p-5 flex flex-col items-center justify-center bg-[#131d33]/60 hover:bg-[#131d33] cursor-pointer transition-all group">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoFileChange}
                      disabled={uploadingLogo}
                      className="hidden"
                    />
                    {uploadingLogo ? (
                      <div className="flex flex-col items-center py-1">
                        <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-1.5" />
                        <span className="text-xs font-bold text-amber-500">Uploading to S3...</span>
                      </div>
                    ) : (
                      <>
                        <div className="size-9 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                          <Upload size={18} />
                        </div>
                        <span className="text-xs font-bold text-slate-200">
                          {logoPreview && !logoForm.logo_url?.startsWith('http') ? 'Logo Selected (Click to change)' : 'Click to Browse or Drag Logo Image'}
                        </span>
                        <span className="text-[10px] text-slate-400 mt-0.5">
                          PNG, WEBP, JPG supported
                        </span>
                      </>
                    )}
                  </label>
                </div>

                {/* Field 3: External Image URL Link */}
                <div>
                  <label className="block text-[11px] font-black uppercase text-slate-400 mb-1.5 tracking-wider">
                    Or Paste External Image URL Link
                  </label>
                  <input
                    type="url"
                    value={logoForm.logo_url}
                    onChange={(e) => {
                      const url = e.target.value;
                      setLogoForm((prev) => ({
                        ...prev,
                        logo_url: url,
                        logo_key: ''
                      }));
                      setLogoPreview(url);
                    }}
                    placeholder="https://example.com/logo.png"
                    className="w-full px-4 py-2.5 bg-[#131d33] border border-slate-700/80 rounded-xl font-medium text-xs text-white placeholder:text-slate-500 outline-none focus:ring-1 focus:ring-amber-500/50 font-mono"
                  />
                </div>

                {/* Footer Buttons */}
                <div className="flex justify-end items-center gap-3 pt-3 border-t border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => setLogoModalOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || uploadingLogo}
                    className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs rounded-xl shadow-md shadow-amber-500/20 cursor-pointer disabled:opacity-60 transition-all uppercase tracking-wider"
                  >
                    {submitting ? 'Saving...' : editingLogo ? 'Save Changes' : 'Upload Logo'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 5: DETAIL VIEW MODAL */}
      <AnimatePresence>
        {viewModalData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#0d162b] border border-slate-200 dark:border-[#233558] rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl relative text-center"
            >
              <button
                onClick={() => setViewModalData(null)}
                className="absolute top-6 right-6 size-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={16} />
              </button>

              {viewModalData.type === 'metric' ? (
                <div>
                  <div className="size-16 rounded-2xl bg-blue-50 dark:bg-blue-600/20 text-blue-600 mx-auto flex items-center justify-center mb-4 border border-blue-200 dark:border-blue-500/30">
                    {renderIcon(viewModalData.data.icon, 32)}
                  </div>
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-1">
                    {viewModalData.data.value}
                  </h3>
                  <p className="text-xs font-extrabold uppercase text-slate-400 tracking-wider mb-6">
                    {viewModalData.data.title}
                  </p>
                  <div className="bg-slate-50 dark:bg-[#15233e] p-4 rounded-xl text-xs space-y-2 text-left font-semibold text-slate-600 dark:text-slate-300">
                    <div className="flex justify-between">
                      <span>Order:</span>
                      <span className="font-bold">{viewModalData.data.order}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span className="font-bold text-emerald-500">{viewModalData.data.is_active !== false ? 'Active' : 'Inactive'}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="h-32 bg-white rounded-2xl border border-slate-200 p-4 flex items-center justify-center mb-4">
                    <img src={viewModalData.data.logo_url} alt={viewModalData.data.name} className="max-h-full max-w-full object-contain" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                    {viewModalData.data.name}
                  </h3>
                  {viewModalData.data.website_url && (
                    <a
                      href={viewModalData.data.website_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline mb-4"
                    >
                      Visit Hotel Website <ExternalLink size={12} />
                    </a>
                  )}
                  <div className="bg-slate-50 dark:bg-[#15233e] p-4 rounded-xl text-xs space-y-2 text-left font-semibold text-slate-600 dark:text-slate-300">
                    <div className="flex justify-between">
                      <span>Order:</span>
                      <span className="font-bold">{viewModalData.data.order}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span className="font-bold text-emerald-500">{viewModalData.data.is_active !== false ? 'Active' : 'Inactive'}</span>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={() => setViewModalData(null)}
                className="w-full mt-6 py-2.5 bg-slate-900 dark:bg-slate-800 text-white rounded-xl font-bold text-xs cursor-pointer"
              >
                Close Preview
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default GlobalImpact;
