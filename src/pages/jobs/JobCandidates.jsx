import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  ArrowLeft,
  Briefcase,
  Mail,
  Phone,
  Calendar,
  ExternalLink,
  Download,
  X,
  Loader2,
  Trash2,
  CheckCircle2,
  Filter,
  FileText,
  Building,
  MapPin,
} from 'lucide-react';
import { apiClient } from '../../stores/authStores';
import { toast } from 'react-toastify';

const EXPERIENCE_TABS = [
  { id: 'all', label: 'All Applicants' },
  { id: 'freshers', label: 'Freshers (0 yrs)' },
  { id: '1-3', label: '1 - 3 Years' },
  { id: '3-5', label: '3 - 5 Years' },
  { id: '5+', label: '5+ Years' },
];

const STATUS_OPTIONS = ['Pending', 'Reviewed', 'Shortlisted', 'Rejected', 'Hired'];

const STATUS_COLORS = {
  Pending: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  Reviewed: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  Shortlisted: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  Rejected: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  Hired: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
};

const getExperienceCategory = (app) => {
  if (app.haveYouWorkedBefore === 'No') return 'freshers';
  const expStr = (app.yearsOfExperience || '').toLowerCase().trim();
  if (!expStr || expStr.includes('fresher') || expStr === '0' || expStr.startsWith('0')) {
    return 'freshers';
  }
  const match = expStr.match(/(\d+(\.\d+)?)/);
  if (!match) return 'freshers';
  const years = parseFloat(match[1]);
  if (years < 1) return 'freshers';
  if (years >= 1 && years <= 3) return '1-3';
  if (years > 3 && years <= 5) return '3-5';
  if (years > 5) return '5+';
  return 'freshers';
};

const formatExperienceBadge = (app) => {
  if (app.haveYouWorkedBefore === 'No') return 'Fresher';
  const exp = (app.yearsOfExperience || '').trim();
  if (!exp || exp.toLowerCase().includes('fresher') || exp === '0') return 'Fresher';
  const match = exp.match(/(\d+(\.\d+)?)/);
  if (match) {
    return `${match[1]} Yrs`;
  }
  return exp;
};

const getAvatarColor = (name = '') => {
  const colors = [
    'bg-blue-600',
    'bg-indigo-600',
    'bg-purple-600',
    'bg-sky-600',
    'bg-emerald-600',
    'bg-pink-600',
    'bg-violet-600',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const JobCandidates = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeExpFilter, setActiveExpFilter] = useState('all');
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);
  const [deleteConfirmCandidate, setDeleteConfirmCandidate] = useState(null);

  // Fetch job details and applications
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [jobRes, appsRes] = await Promise.all([
          apiClient.get(`/admin/jobs/${jobId}`),
          apiClient.get('/admin/jobs/applications/all', { params: { jobId } }),
        ]);

        if (jobRes.data?.success) {
          setJob(jobRes.data.data);
        }
        if (appsRes.data?.success) {
          const apps = appsRes.data.data || [];
          setCandidates(apps);
        }
      } catch (err) {
        console.error('Error loading job candidates:', err);
        toast.error('Failed to load job candidates');
      } finally {
        setIsLoading(false);
      }
    };

    if (jobId) {
      fetchData();
    }
  }, [jobId]);

  // Handle status update
  const handleStatusUpdate = async (candidateId, newStatus) => {
    setUpdatingStatusId(candidateId);
    try {
      const res = await apiClient.patch(`/admin/jobs/applications/${candidateId}/status`, {
        status: newStatus,
      });
      if (res.data?.success) {
        toast.success(`Candidate marked as ${newStatus}`);
        setCandidates((prev) =>
          prev.map((c) => (c._id === candidateId ? { ...c, status: newStatus } : c))
        );
        if (selectedCandidate?._id === candidateId) {
          setSelectedCandidate((prev) => (prev ? { ...prev, status: newStatus } : null));
        }
      }
    } catch (err) {
      console.error('Error updating status:', err);
      toast.error('Failed to update candidate status');
    } finally {
      setUpdatingStatusId(null);
    }
  };

  // Handle candidate delete
  const handleDeleteCandidate = async (candidateId) => {
    try {
      const res = await apiClient.delete(`/admin/jobs/applications/${candidateId}`);
      if (res.data?.success) {
        toast.success('Candidate application removed');
        setCandidates((prev) => prev.filter((c) => c._id !== candidateId));
        if (selectedCandidate?._id === candidateId) {
          setSelectedCandidate(null);
        }
        setDeleteConfirmCandidate(null);
      }
    } catch (err) {
      console.error('Error deleting candidate:', err);
      toast.error('Failed to delete candidate application');
    }
  };

  // Filter candidates by search and experience filter
  const filteredCandidates = useMemo(() => {
    return candidates.filter((c) => {
      // Search filter
      const search = searchQuery.toLowerCase().trim();
      const matchSearch =
        !search ||
        (c.fullName && c.fullName.toLowerCase().includes(search)) ||
        (c.email && c.email.toLowerCase().includes(search)) ||
        (c.phone && c.phone.includes(search));

      if (!matchSearch) return false;

      // Experience filter
      if (activeExpFilter === 'all') return true;
      const category = getExperienceCategory(c);
      return category === activeExpFilter;
    });
  }, [candidates, searchQuery, activeExpFilter]);

  // Counts by experience tab
  const countsByTab = useMemo(() => {
    const counts = { all: candidates.length, freshers: 0, '1-3': 0, '3-5': 0, '5+': 0 };
    candidates.forEach((c) => {
      const cat = getExperienceCategory(c);
      if (counts[cat] !== undefined) {
        counts[cat]++;
      }
    });
    return counts;
  }, [candidates]);

  return (
    <div className="min-h-screen bg-[#060c18] text-slate-100 p-4 sm:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Top Header & Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/jobs/list')}
              className="size-10 rounded-xl bg-[#0b1322] border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-700 transition-all cursor-pointer shadow-md"
              title="Back to All Job Positions"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide uppercase">
                  {job?.title || 'Job Opening'}
                </h1>
                {job?.status && (
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      job.status === 'Active'
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    ● {job.status}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                <span>{job?.specifications?.department || 'Department'}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin size={11} className="text-slate-500" />
                  {job?.location || 'Location'} ({job?.locationType || 'On Site'})
                </span>
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate(`/jobs/edit/${jobId}`)}
            className="self-start sm:self-auto px-4 py-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Edit Job Role
          </button>
        </div>

        {/* Top Section: Stat Card & Search Bar (Matches Reference Screenshot 2) */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Total Applicants Stat Card */}
          <div className="bg-[#0b1322] border border-slate-800/90 rounded-2xl p-4 sm:p-5 flex items-center gap-4 min-w-[220px] shadow-lg">
            <div className="size-12 rounded-xl bg-blue-600/15 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0">
              <Users size={22} />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                TOTAL APPLICANTS
              </span>
              <span className="text-2xl sm:text-3xl font-black text-white">
                {candidates.length}
              </span>
            </div>
          </div>

          {/* Search Candidate Bar with Button */}
          <div className="flex items-center gap-2 flex-1 max-w-xl">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={17} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search candidate email or name..."
                className="w-full pl-11 pr-4 py-3 bg-[#0b1322] border border-slate-800 focus:border-blue-500 rounded-2xl text-xs sm:text-sm text-white placeholder:text-slate-500 outline-none transition-all shadow-inner"
              />
            </div>
            <button
              type="button"
              className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-blue-600/25 cursor-pointer shrink-0"
            >
              Search
            </button>
          </div>
        </div>

        {/* Experience Filter Bar (Matches Reference Screenshot 2) */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mr-2">
            <Filter size={13} className="text-slate-500" /> EXPERIENCE FILTER:
          </span>

          {EXPERIENCE_TABS.map((tab) => {
            const isActive = activeExpFilter === tab.id;
            const count = countsByTab[tab.id] || 0;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveExpFilter(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 border ${
                  isActive
                    ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/30'
                    : 'bg-[#0b1322] text-slate-400 hover:text-white border-slate-800 hover:border-slate-700'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-md text-[10px] font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Main Content: Split-View (List + Resume Preview) or Full Table */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-28 bg-[#0b1322] border border-slate-800 rounded-3xl gap-3">
            <Loader2 className="w-9 h-9 text-blue-500 animate-spin" />
            <span className="text-sm font-bold text-slate-300">Loading candidate records...</span>
          </div>
        ) : filteredCandidates.length === 0 ? (
          <div className="bg-[#0b1322] border border-slate-800 border-dashed rounded-3xl p-16 text-center">
            <div className="size-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto mb-4 text-slate-500">
              <Users size={28} />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">No Matching Candidates Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {searchQuery || activeExpFilter !== 'all'
                ? 'No applicants match your current search query or experience filter.'
                : 'No candidates have submitted an application for this opening yet.'}
            </p>
            {(searchQuery || activeExpFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveExpFilter('all');
                }}
                className="mt-4 px-4 py-2 rounded-xl bg-slate-800 text-blue-400 hover:text-white text-xs font-bold transition cursor-pointer"
              >
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          <div className={`grid grid-cols-1 ${selectedCandidate ? 'lg:grid-cols-12' : ''} gap-6 items-start`}>

            {/* Left Column: Candidates List (Col-span-5 when preview active, full-width otherwise) */}
            <div className={`${selectedCandidate ? 'lg:col-span-5' : 'w-full'} space-y-3`}>
              <div className="bg-[#0b1322] border border-slate-800/90 rounded-2xl overflow-hidden shadow-xl">
                {/* List Header */}
                <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between text-[11px] font-black uppercase tracking-widest text-slate-400 bg-[#080f1b]/80">
                  <span>CANDIDATE</span>
                  <span>EXPERIENCE</span>
                </div>

                {/* Candidate Rows */}
                <div className="divide-y divide-slate-800/60 max-h-[calc(100vh-280px)] overflow-y-auto">
                  {filteredCandidates.map((c) => {
                    const isSelected = selectedCandidate?._id === c._id;
                    const initial = c.fullName?.trim()?.charAt(0)?.toUpperCase() || 'C';
                    const expLabel = formatExperienceBadge(c);
                    const avatarBg = getAvatarColor(c.fullName || '');

                    return (
                      <div
                        key={c._id}
                        onClick={() => setSelectedCandidate(c)}
                        className={`p-4 flex items-center justify-between gap-3 cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-blue-950/40 border-l-4 border-l-blue-500 pl-3.5'
                            : 'hover:bg-slate-900/50'
                        }`}
                      >
                        {/* Candidate info */}
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div
                            className={`size-10 rounded-xl ${avatarBg} text-white font-black text-sm flex items-center justify-center shrink-0 shadow-md`}
                          >
                            {initial}
                          </div>
                          <div className="min-w-0">
                            <h4
                              className={`font-black text-sm truncate uppercase tracking-tight ${
                                isSelected ? 'text-blue-400' : 'text-white'
                              }`}
                            >
                              {c.fullName}
                            </h4>
                            <p className="text-xs text-slate-400 truncate mt-0.5">{c.email}</p>
                            {isSelected && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-blue-400 mt-1 animate-pulse">
                                ● VIEWING RESUME
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Experience badge */}
                        <div className="shrink-0 flex items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs font-semibold shadow-xs">
                            <Briefcase size={12} className="text-slate-500" />
                            <span>{expLabel}</span>
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Column: Split-Screen Resume Preview Panel (Matches Reference Screenshot 3) */}
            {selectedCandidate && (
              <div className="lg:col-span-7 bg-[#0b1322] border border-slate-800/90 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5 sticky top-6">

                {/* Preview Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-800">
                  <div className="flex items-start gap-3.5">
                    <div className="size-11 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/30 shrink-0">
                      <FileText size={22} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                          RESUME PREVIEW
                        </span>
                        <span className="px-2 py-0.5 rounded bg-blue-950/80 border border-blue-800/50 text-[10px] font-bold text-blue-300">
                          {formatExperienceBadge(selectedCandidate)} Exp
                        </span>
                      </div>
                      <h3 className="text-xl font-black text-white mt-1 uppercase tracking-tight">
                        {selectedCandidate.fullName}
                      </h3>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400 flex-wrap">
                        <a
                          href={`mailto:${selectedCandidate.email}`}
                          className="flex items-center gap-1 text-slate-300 hover:text-blue-400 transition-colors"
                        >
                          <Mail size={12} className="text-slate-500" /> {selectedCandidate.email}
                        </a>
                        <span>•</span>
                        <a
                          href={`tel:${selectedCandidate.phone}`}
                          className="flex items-center gap-1 text-slate-300 hover:text-blue-400 transition-colors"
                        >
                          <Phone size={12} className="text-slate-500" /> {selectedCandidate.phone}
                        </a>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-slate-400">
                          <Calendar size={12} className="text-slate-500" />
                          {new Date(selectedCandidate.createdAt).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Top-Right Action Controls (New Tab, Download, Close) */}
                  <div className="flex items-center gap-2 shrink-0">
                    {selectedCandidate.resume?.url && (
                      <>
                        <a
                          href={selectedCandidate.resume.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-bold transition-all cursor-pointer shadow-sm"
                          title="Open Resume in New Tab"
                        >
                          <ExternalLink size={13} />
                          <span>New Tab</span>
                        </a>
                        <a
                          href={selectedCandidate.resume.url}
                          download
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/20 cursor-pointer"
                          title="Download Resume Document"
                        >
                          <Download size={13} />
                          <span>Download</span>
                        </a>
                      </>
                    )}
                    <button
                      type="button"
                      onClick={() => setSelectedCandidate(null)}
                      className="size-9 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                      title="Close Preview"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>

                {/* Candidate Info Summary Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-2xl bg-[#080f1b] border border-slate-800/80 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-black tracking-wider block">Worked Before</span>
                    <span className={`font-bold ${selectedCandidate.haveYouWorkedBefore === 'Yes' ? 'text-emerald-400' : 'text-slate-400'}`}>
                      {selectedCandidate.haveYouWorkedBefore || 'No'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-black tracking-wider block">Experience</span>
                    <span className="font-bold text-slate-200">
                      {selectedCandidate.yearsOfExperience || 'Fresher'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-black tracking-wider block">Current / Last Salary</span>
                    <span className="font-bold text-slate-200">
                      {selectedCandidate.currentOrLastSalary || 'Not Disclosed'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-black tracking-wider block">Status</span>
                    <select
                      value={selectedCandidate.status}
                      disabled={updatingStatusId === selectedCandidate._id}
                      onChange={(e) => handleStatusUpdate(selectedCandidate._id, e.target.value)}
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-lg border focus:outline-none transition-colors cursor-pointer mt-0.5 ${
                        STATUS_COLORS[selectedCandidate.status] || 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={opt} value={opt} className="bg-[#0b1322] text-white">
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Resume Document Viewer */}
                <div className="rounded-2xl overflow-hidden border border-slate-800 bg-white shadow-inner min-h-[550px] relative">
                  {selectedCandidate.resume?.url ? (
                    <iframe
                      src={`${selectedCandidate.resume.url}#toolbar=0&navpanes=0`}
                      title={`Resume of ${selectedCandidate.fullName}`}
                      className="w-full h-[65vh] min-h-[550px] border-0"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center py-28 text-slate-600 gap-2">
                      <FileText size={36} className="text-slate-400" />
                      <p className="font-bold text-sm text-slate-700">No digital resume file attached</p>
                    </div>
                  )}
                </div>

                {/* Footer Controls: Delete option */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-500 font-mono">
                    ID: {selectedCandidate._id}
                  </span>
                  <button
                    type="button"
                    onClick={() => setDeleteConfirmCandidate(selectedCandidate)}
                    className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/30 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Trash2 size={13} />
                    <span>Delete Candidate Record</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirmCandidate && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#0b1322] border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
              <h3 className="text-lg font-bold text-white">Delete Candidate Application?</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Are you sure you want to permanently delete the application submitted by{' '}
                <strong className="text-white">{deleteConfirmCandidate.fullName}</strong>? This action cannot be undone.
              </p>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setDeleteConfirmCandidate(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteCandidate(deleteConfirmCandidate._id)}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition shadow-lg shadow-rose-600/20 cursor-pointer"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default JobCandidates;
