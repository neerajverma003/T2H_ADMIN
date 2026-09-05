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
    <div className="min-h-screen bg-[#060c18] text-slate-100 p-4 sm:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-wide">
              Job Positions
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              Manage all career openings, view candidate applications, and control public visibility.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/jobs/applications')}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-semibold text-xs sm:text-sm border border-slate-700 transition-colors cursor-pointer"
            >
              <Users size={16} /> All Applications
            </button>
            <button
              onClick={() => navigate('/jobs/create')}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-xs sm:text-sm shadow-lg shadow-blue-600/25 transition-all cursor-pointer hover:scale-[1.02]"
            >
              <Plus size={16} /> Post New Job
            </button>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="bg-[#0b1322] border border-slate-800/80 rounded-2xl p-4 flex flex-col md:flex-row items-center gap-3">
          {/* Search input */}
          <div className="relative flex-1 w-full">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by job title, location, or department..."
              className="w-full bg-[#111a2e] border border-slate-700/60 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#111a2e] border border-slate-700/60 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500 cursor-pointer w-full md:w-auto"
            >
              <option value="All">All Status</option>
              <option value="Active">Active Only</option>
              <option value="Closed">Closed Only</option>
            </select>

            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="bg-[#111a2e] border border-slate-700/60 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500 cursor-pointer w-full md:w-auto"
            >
              <option value="All">All Departments</option>
              <option value="IT">IT</option>
              <option value="Sales">Sales</option>
              <option value="Marketing">Marketing</option>
              <option value="Operations">Operations</option>
              <option value="Customer Support">Customer Support</option>
              <option value="Human Resources">Human Resources</option>
              <option value="Design">Design</option>
              <option value="Finance">Finance</option>
            </select>
          </div>
        </div>

        {/* Content Table / Cards */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 bg-[#0b1322] border border-slate-800/80 rounded-2xl">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            <p className="text-slate-400 text-sm">Loading job positions...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-[#0b1322] border border-slate-800/80 rounded-2xl text-center px-4">
            <div className="size-16 rounded-2xl bg-slate-900 flex items-center justify-center text-slate-500 mb-4 border border-slate-800">
              <Briefcase size={28} />
            </div>
            <h3 className="text-lg font-bold text-white">No job openings found</h3>
            <p className="text-slate-400 text-sm mt-1 max-w-sm">
              {search || statusFilter !== 'All'
                ? 'Try adjusting your search criteria or clear your filters.'
                : 'Get started by creating your first job opening position.'}
            </p>
            {!search && statusFilter === 'All' && (
              <button
                onClick={() => navigate('/jobs/create')}
                className="mt-5 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-blue-600/20 cursor-pointer"
              >
                Post New Job
              </button>
            )}
          </div>
        ) : (
          <div className="bg-[#0b1322] border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-[#080f1b]/60">
                    <th className="py-4 px-5">Job Details</th>
                    <th className="py-4 px-5">Location</th>
                    <th className="py-4 px-5">Salary</th>
                    <th className="py-4 px-5">Applicants</th>
                    <th className="py-4 px-5">Posted Date</th>
                    <th className="py-4 px-5">Status</th>
                    <th className="py-4 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-sm">
                  {jobs.map((job) => {
                    const initials = getJobInitials(job.title);
                    const avatarBg = getJobAvatarColor(job.title);
                    const isActive = job.status === 'Active';

                    return (
                      <tr
                        key={job._id}
                        className="hover:bg-slate-900/50 transition-colors group"
                      >
                        {/* Job Avatar & Title with Vacancy status */}
                        <td className="py-4 px-5">
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
                                className="font-bold text-white uppercase text-sm tracking-wide group-hover:text-blue-400 transition-colors text-left truncate block cursor-pointer"
                                title="View candidates for this role"
                              >
                                {job.title}
                              </button>
                              <div className="flex items-center gap-2 mt-1">
                                {isActive ? (
                                  <span className="flex items-center gap-1.5 text-[11px] font-bold text-sky-400 uppercase tracking-wider">
                                    <span className="size-1.5 rounded-full bg-sky-400 animate-pulse" />
                                    ACTIVE VACANCY
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                    <span className="size-1.5 rounded-full bg-slate-400" />
                                    CLOSED VACANCY
                                  </span>
                                )}
                                {job.specifications?.department && (
                                  <>
                                    <span className="text-slate-600">•</span>
                                    <span className="text-[11px] text-slate-400 font-medium">
                                      {job.specifications.department}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Location & Location Type */}
                        <td className="py-4 px-5">
                          <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                            <MapPin size={13} className="text-slate-500 shrink-0" />
                            <span>{job.location || 'Location Not Specified'}</span>
                          </div>
                          <div className="mt-1">
                            <span className="inline-block px-2 py-0.5 rounded-md bg-[#121c2e] border border-slate-700/60 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              {job.locationType || 'ON SITE'}
                            </span>
                          </div>
                        </td>

                        {/* Salary */}
                        <td className="py-4 px-5 text-xs font-medium text-slate-300">
                          {formatSalary(job.salary)}
                        </td>

                        {/* Applicants - Clicking navigates to /jobs/:id/candidates */}
                        <td className="py-4 px-5">
                          <button
                            onClick={() => navigate(`/jobs/${job._id}/candidates`)}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-blue-900/40 text-slate-300 hover:text-blue-300 border border-slate-700/60 hover:border-blue-600/50 text-xs font-bold transition-all cursor-pointer shadow-sm group/btn"
                            title="View candidate applications"
                          >
                            <Users size={14} className="text-slate-400 group-hover/btn:text-blue-400" />
                            <span>{job.applicantCount || 0}</span>
                          </button>
                        </td>

                        {/* Posted Date */}
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
                            <Calendar size={13} className="text-slate-500 shrink-0" />
                            <span>{formatPostedDate(job.createdAt)}</span>
                          </div>
                          <span className="text-[9px] font-bold tracking-wider text-slate-500 uppercase block mt-0.5">
                            POSTED DATE
                          </span>
                        </td>

                        {/* Status Toggle */}
                        <td className="py-4 px-5">
                          <button
                            onClick={() => toggleJobStatus(job._id)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                              isActive
                                ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-800/40 hover:bg-emerald-900/40'
                                : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
                            }`}
                            title="Click to toggle status"
                          >
                            <span
                              className={`size-1.5 rounded-full ${
                                isActive ? 'bg-emerald-400' : 'bg-slate-400'
                              }`}
                            />
                            <span>{isActive ? 'ACTIVE' : 'CLOSED'}</span>
                          </button>
                        </td>

                        {/* Actions: Eye (candidates), Pencil (edit), Trash (delete) */}
                        <td className="py-4 px-5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => navigate(`/jobs/${job._id}/candidates`)}
                              className="size-8 rounded-lg bg-slate-800/80 text-slate-400 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-slate-700/40"
                              title="View Candidate Applications"
                            >
                              <Eye size={15} />
                            </button>
                            <button
                              onClick={() => navigate(`/jobs/edit/${job._id}`)}
                              className="size-8 rounded-lg bg-slate-800/80 text-blue-400 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-slate-700/40"
                              title="Edit Job Position"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(job._id)}
                              className="size-8 rounded-lg bg-slate-800/80 text-rose-400 hover:bg-rose-600 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-slate-700/40"
                              title="Delete Job Position"
                            >
                              <Trash2 size={14} />
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
            <div className="bg-[#0c1424] border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
              <h3 className="text-lg font-bold text-white">Delete Job Opening?</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Are you sure you want to delete this job position? All candidate applications submitted for this job will also be removed.
              </p>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirmId)}
                  className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-rose-600 hover:bg-rose-500 transition-colors shadow-lg shadow-rose-600/20 cursor-pointer"
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

export default JobList;
