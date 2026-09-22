import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  MapPin,
  Briefcase,
  Users,
  Pencil,
  Trash2,
  CheckCircle,
  XCircle,
  Loader2,
  Eye,
  Building,
  Calendar,
} from 'lucide-react';
import { useJobStore } from '../../stores/jobStore';

const AVATAR_COLORS = [
  'bg-blue-600',
  'bg-indigo-600',
  'bg-emerald-600',
  'bg-rose-500',
  'bg-amber-500',
  'bg-purple-600',
  'bg-cyan-600',
  'bg-teal-600',
];

const getJobInitials = (title = '') => {
  const words = title.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return 'JB';
  if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
};

const getJobAvatarColor = (title = '') => {
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

const formatPostedDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  const day = d.getDate();
  const month = d.toLocaleString('en-US', { month: 'short' });
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
};

const JobList = () => {
  const navigate = useNavigate();
  const { jobs, isLoading, fetchJobs, toggleJobStatus, deleteJob } = useJobStore();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  useEffect(() => {
    fetchJobs({
      search: search || undefined,
      status: statusFilter !== 'All' ? statusFilter : undefined,
      department: departmentFilter !== 'All' ? departmentFilter : undefined,
    });
  }, [search, statusFilter, departmentFilter, fetchJobs]);

  const handleDelete = async (id) => {
    await deleteJob(id);
    setDeleteConfirmId(null);
  };

  const formatSalary = (salary) => {
    if (!salary || salary.salaryNotDisclosed) return 'Not Disclosed';
    if (salary.fixedSalary) return `₹${salary.fixedSalary}`;
    if (salary.minSalary && salary.maxSalary) {
      return `₹${salary.minSalary} - ₹${salary.maxSalary}`;
    }
    if (salary.minSalary) return `From ₹${salary.minSalary}`;
    return 'Not Disclosed';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8 pb-20 font-sans min-h-screen text-slate-900 dark:text-slate-100 text-left">
      {/* ── HEADER HUB (Inspired by Team Management) ── */}
      <div className="bg-white dark:bg-[#091126]/95 rounded-3xl py-4 sm:py-5 px-6 sm:px-8 border border-slate-200/90 dark:border-indigo-500/25 shadow-xl dark:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.7),0_0_30px_2px_rgba(99,102,241,0.18)] ring-1 ring-slate-900/5 dark:ring-white/5 backdrop-blur-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Glow Effects */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-blue-500/10 dark:bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-indigo-500/10 dark:bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-500/30 shrink-0">
            <Briefcase size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-500 dark:text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full">
                JOB MANAGEMENT
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2 flex-wrap">
              Job <span className="text-blue-500">Positions</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-semibold mt-0.5 text-xs sm:text-sm">
              Manage all career openings, view candidate applications, and control public visibility.
            </p>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <button
            onClick={() => navigate('/jobs/applications')}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer"
          >
            <Users size={15} /> ALL APPLICATIONS
          </button>
          <button
            onClick={() => navigate('/jobs/create')}
            className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-blue-500/30 flex items-center gap-2 cursor-pointer"
          >
            <Plus size={15} /> POST NEW JOB
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-[#091126]/95 rounded-2xl p-4 border border-slate-200/90 dark:border-indigo-500/25 shadow-xl ring-1 ring-slate-900/5 dark:ring-white/5 flex flex-col md:flex-row items-center gap-3">
        {/* Search input */}
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by job title, location, or department..."
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800/90 bg-slate-50 dark:bg-[#050A17] pl-10 pr-4 py-2.5 text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 shadow-inner transition-all"
          />
        </div>

        {/* Status & Department Filters */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-slate-800/90 bg-slate-50 dark:bg-[#050A17] px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 cursor-pointer shadow-inner transition-all w-full md:w-auto"
          >
            <option value="All" className="bg-white dark:bg-[#050A17] text-slate-900 dark:text-white">All Status</option>
            <option value="Active" className="bg-white dark:bg-[#050A17] text-slate-900 dark:text-white">Active Only</option>
            <option value="Closed" className="bg-white dark:bg-[#050A17] text-slate-900 dark:text-white">Closed Only</option>
          </select>

          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-slate-800/90 bg-slate-50 dark:bg-[#050A17] px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 cursor-pointer shadow-inner transition-all w-full md:w-auto"
          >
            <option value="All" className="bg-white dark:bg-[#050A17] text-slate-900 dark:text-white">All Departments</option>
            <option value="IT" className="bg-white dark:bg-[#050A17] text-slate-900 dark:text-white">IT</option>
            <option value="Sales" className="bg-white dark:bg-[#050A17] text-slate-900 dark:text-white">Sales</option>
            <option value="Marketing" className="bg-white dark:bg-[#050A17] text-slate-900 dark:text-white">Marketing</option>
            <option value="Operations" className="bg-white dark:bg-[#050A17] text-slate-900 dark:text-white">Operations</option>
            <option value="Customer Support" className="bg-white dark:bg-[#050A17] text-slate-900 dark:text-white">Customer Support</option>
            <option value="Human Resources" className="bg-white dark:bg-[#050A17] text-slate-900 dark:text-white">Human Resources</option>
            <option value="Design" className="bg-white dark:bg-[#050A17] text-slate-900 dark:text-white">Design</option>
            <option value="Finance" className="bg-white dark:bg-[#050A17] text-slate-900 dark:text-white">Finance</option>
          </select>
        </div>
      </div>

      {/* Content Table / Cards */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 bg-white dark:bg-[#091126]/95 rounded-3xl border border-slate-200/90 dark:border-indigo-500/25 shadow-xl">
          <Loader2 className="w-9 h-9 text-blue-500 animate-spin" />
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Loading job positions...</p>
        </div>
      ) : jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-[#091126]/95 py-20 px-4 text-center shadow-xl">
          <div className="size-16 rounded-2xl bg-slate-100 dark:bg-[#050A17] flex items-center justify-center text-slate-400 dark:text-slate-500 mb-4 border border-slate-200 dark:border-slate-800">
            <Briefcase size={28} />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">No job openings found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
            {search || statusFilter !== 'All'
              ? 'Try adjusting your search criteria or clear your filters.'
              : 'Get started by creating your first job opening position.'}
          </p>
          {!search && statusFilter === 'All' && (
            <button
              onClick={() => navigate('/jobs/create')}
              className="mt-5 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-blue-500/30 cursor-pointer"
            >
              Post New Job
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-[#091126]/95 rounded-3xl border border-slate-200/90 dark:border-indigo-500/25 shadow-xl ring-1 ring-slate-900/5 dark:ring-white/5 backdrop-blur-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 dark:border-slate-800/80 text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-50/70 dark:bg-[#050A17]/60">
                  <th className="py-4 px-6">Job Details</th>
                  <th className="py-4 px-6">Location</th>
                  <th className="py-4 px-6">Salary</th>
                  <th className="py-4 px-6">Applicants</th>
                  <th className="py-4 px-6">Posted Date</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm">
                {jobs.map((job) => {
                  const initials = getJobInitials(job.title);
                  const avatarBg = getJobAvatarColor(job.title);
                  const isActive = job.status === 'Active';

                  return (
                    <tr
                      key={job._id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* Job Avatar & Title with Vacancy status */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3.5">
                          <div
                            onClick={() => navigate(`/jobs/${job._id}/candidates`)}
                            className={`size-11 rounded-2xl ${avatarBg} text-white font-black text-sm flex items-center justify-center shrink-0 shadow-md cursor-pointer hover:scale-105 transition-transform`}
                            title="View candidates for this role"
                          >
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <button
                              onClick={() => navigate(`/jobs/${job._id}/candidates`)}
                              className="font-bold text-slate-900 dark:text-white uppercase text-sm tracking-wide group-hover:text-blue-500 transition-colors text-left truncate block cursor-pointer"
                              title="View candidates for this role"
                            >
                              {job.title}
                            </button>
                            <div className="flex items-center gap-2 mt-1">
                              {isActive ? (
                                <span className="flex items-center gap-1.5 text-[10px] font-bold text-sky-500 dark:text-sky-400 uppercase tracking-wider">
                                  <span className="size-1.5 rounded-full bg-sky-400 animate-pulse" />
                                  ACTIVE VACANCY
                                </span>
                              ) : (
                                <span className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                                  <span className="size-1.5 rounded-full bg-slate-400" />
                                  CLOSED VACANCY
                                </span>
                              )}
                              {job.specifications?.department && (
                                <>
                                  <span className="text-slate-400 dark:text-slate-600">•</span>
                                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                                    {job.specifications.department}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Location & Location Type */}
                      <td className="py-4 px-6">
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                          <MapPin size={13} className="text-slate-400 dark:text-slate-500 shrink-0" />
                          <span>{job.location || 'Location Not Specified'}</span>
                        </div>
                        <div className="mt-1">
                          <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#050A17] border border-slate-200 dark:border-slate-800/90 text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                            {job.locationType || 'ON SITE'}
                          </span>
                        </div>
                      </td>

                      {/* Salary */}
                      <td className="py-4 px-6 text-xs font-bold text-slate-700 dark:text-slate-300">
                        {formatSalary(job.salary)}
                      </td>

                      {/* Applicants - Clicking navigates to /jobs/:id/candidates */}
                      <td className="py-4 px-6">
                        <button
                          onClick={() => navigate(`/jobs/${job._id}/candidates`)}
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#050A17] hover:bg-blue-500/10 dark:hover:bg-blue-500/20 text-slate-700 dark:text-slate-300 hover:text-blue-500 dark:hover:text-blue-400 border border-slate-200 dark:border-slate-800/90 hover:border-blue-500/40 text-xs font-bold transition-all cursor-pointer shadow-sm group/btn"
                          title="View candidate applications"
                        >
                          <Users size={14} className="text-slate-400 group-hover/btn:text-blue-500" />
                          <span>{job.applicantCount || 0}</span>
                        </button>
                      </td>

                      {/* Posted Date */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                          <Calendar size={13} className="text-slate-400 dark:text-slate-500 shrink-0" />
                          <span>{formatPostedDate(job.createdAt)}</span>
                        </div>
                        <span className="text-[9px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase block mt-0.5">
                          POSTED DATE
                        </span>
                      </td>

                      {/* Status Toggle */}
                      <td className="py-4 px-6">
                        <button
                          onClick={() => toggleJobStatus(job._id)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                            isActive
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/20'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                          }`}
                          title="Click to toggle status"
                        >
                          <span
                            className={`size-1.5 rounded-full ${
                              isActive ? 'bg-emerald-500' : 'bg-slate-400'
                            }`}
                          />
                          <span>{isActive ? 'ACTIVE' : 'CLOSED'}</span>
                        </button>
                      </td>

                      {/* Actions: Eye (candidates), Pencil (edit), Trash (delete) */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => navigate(`/jobs/${job._id}/candidates`)}
                            className="size-8 rounded-xl bg-slate-100 dark:bg-[#050A17] text-slate-500 dark:text-slate-400 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-slate-200 dark:border-slate-800/90 shadow-sm"
                            title="View Candidate Applications"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => navigate(`/jobs/edit/${job._id}`)}
                            className="size-8 rounded-xl bg-slate-100 dark:bg-[#050A17] text-blue-500 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-slate-200 dark:border-slate-800/90 shadow-sm"
                            title="Edit Job Position"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(job._id)}
                            className="size-8 rounded-xl bg-slate-100 dark:bg-[#050A17] text-rose-500 hover:bg-rose-600 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-slate-200 dark:border-slate-800/90 shadow-sm"
                            title="Delete Job Position"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#091126] border border-slate-200 dark:border-indigo-500/25 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-4 ring-1 ring-slate-900/5 dark:ring-white/5">
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">Delete Job Opening?</h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold leading-relaxed">
              Are you sure you want to delete this job position? All candidate applications submitted for this job will also be removed.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700/80 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-rose-600 hover:bg-rose-500 transition-colors shadow-lg shadow-rose-600/20 cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobList;
