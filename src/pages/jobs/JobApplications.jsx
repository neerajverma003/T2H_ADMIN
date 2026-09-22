import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  FileText,
  ExternalLink,
  Trash2,
  CheckCircle,
  Clock,
  Briefcase,
  Phone,
  Mail,
  ArrowLeft,
  Loader2,
  Calendar,
  Plus,
} from 'lucide-react';
import { useJobStore } from '../../stores/jobStore';

const STATUS_COLORS = {
  Pending: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
  Reviewed: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30',
  Shortlisted: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
  Rejected: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30',
  Hired: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30',
};

const JobApplications = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialJobId = searchParams.get('jobId') || '';

  const {
    applications,
    isLoading,
    fetchApplications,
    updateApplicationStatus,
    deleteApplication,
    jobs,
    fetchJobs,
  } = useJobStore();

  const [selectedJobId, setSelectedJobId] = useState(initialJobId);
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  useEffect(() => {
    fetchApplications({
      jobId: selectedJobId || undefined,
      status: statusFilter !== 'All' ? statusFilter : undefined,
      search: search || undefined,
    });
  }, [selectedJobId, statusFilter, search, fetchApplications]);

  const handleStatusChange = async (appId, newStatus) => {
    await updateApplicationStatus(appId, newStatus);
  };

  const handleDelete = async (appId) => {
    await deleteApplication(appId);
    setDeleteId(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8 pb-20 font-sans min-h-screen text-slate-900 dark:text-slate-100 text-left">
      {/* ── HEADER HUB (Inspired by Team Management) ── */}
      <div className="bg-white dark:bg-[#091126] rounded-3xl py-4 sm:py-5 px-6 sm:px-8 border border-slate-200 dark:border-slate-800 shadow-md relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0">
            <Users size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-500 dark:text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full">
                JOB MANAGEMENT
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2 flex-wrap">
              Job <span className="text-blue-500">Applications</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-semibold mt-0.5 text-xs sm:text-sm">
              Review submitted candidate details, download CVs, and update application statuses.
            </p>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <button
            onClick={() => navigate('/jobs/list')}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer"
          >
            <ArrowLeft size={16} /> BACK TO JOB LIST
          </button>
          <button
            onClick={() => navigate('/jobs/create')}
            className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <Plus size={15} /> POST NEW JOB
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-[#091126] rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by candidate name, email, or phone number..."
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800/90 bg-slate-50 dark:bg-[#050A17] pl-10 pr-4 py-2.5 text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 shadow-inner transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* Filter by Job Position */}
          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-slate-800/90 bg-slate-50 dark:bg-[#050A17] px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 cursor-pointer shadow-inner transition-all w-full md:w-auto max-w-xs truncate"
          >
            <option value="" className="bg-white dark:bg-[#050A17] text-slate-900 dark:text-white">All Job Positions</option>
            {jobs.map((j) => (
              <option key={j._id} value={j._id} className="bg-white dark:bg-[#050A17] text-slate-900 dark:text-white">
                {j.title}
              </option>
            ))}
          </select>

          {/* Filter by Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-slate-800/90 bg-slate-50 dark:bg-[#050A17] px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 cursor-pointer shadow-inner transition-all w-full md:w-auto"
          >
            <option value="All" className="bg-white dark:bg-[#050A17] text-slate-900 dark:text-white">All Statuses</option>
            <option value="Pending" className="bg-white dark:bg-[#050A17] text-slate-900 dark:text-white">Pending</option>
            <option value="Reviewed" className="bg-white dark:bg-[#050A17] text-slate-900 dark:text-white">Reviewed</option>
            <option value="Shortlisted" className="bg-white dark:bg-[#050A17] text-slate-900 dark:text-white">Shortlisted</option>
            <option value="Rejected" className="bg-white dark:bg-[#050A17] text-slate-900 dark:text-white">Rejected</option>
            <option value="Hired" className="bg-white dark:bg-[#050A17] text-slate-900 dark:text-white">Hired</option>
          </select>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 bg-white dark:bg-[#091126] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <Loader2 className="w-9 h-9 text-blue-500 animate-spin" />
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Loading applications...</p>
        </div>
      ) : applications.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-[#091126] py-20 px-4 text-center shadow-sm">
          <div className="size-16 rounded-2xl bg-slate-100 dark:bg-[#050A17] flex items-center justify-center text-slate-400 dark:text-slate-500 mb-4 border border-slate-200 dark:border-slate-800">
            <Users size={28} />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">No applications found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
            {search || selectedJobId || statusFilter !== 'All'
              ? 'No applicant matches the selected filter criteria.'
              : 'Candidates will appear here once they apply from the public website.'}
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#091126] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 dark:border-slate-800/80 text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-50/70 dark:bg-[#050A17]/60">
                  <th className="py-4 px-6">Candidate</th>
                  <th className="py-4 px-6">Applied Position</th>
                  <th className="py-4 px-6">Experience & Salary</th>
                  <th className="py-4 px-6">Resume / CV</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Applied Date</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm">
                {applications.map((app) => (
                  <tr
                    key={app._id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors group"
                  >
                    {/* Candidate Name & Contact */}
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900 dark:text-white">{app.fullName}</div>
                      <div className="flex flex-col gap-0.5 mt-1 text-xs text-slate-500 dark:text-slate-400">
                        <a
                          href={`mailto:${app.email}`}
                          className="flex items-center gap-1.5 hover:text-blue-500 transition-colors"
                        >
                          <Mail size={12} className="text-slate-400 dark:text-slate-500" />
                          <span>{app.email}</span>
                        </a>
                        <a
                          href={`tel:${app.phone}`}
                          className="flex items-center gap-1.5 hover:text-blue-500 transition-colors"
                        >
                          <Phone size={12} className="text-slate-400 dark:text-slate-500" />
                          <span>{app.phone}</span>
                        </a>
                      </div>
                    </td>

                    {/* Applied Position */}
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-800 dark:text-slate-200">
                        {app.jobId?.title || 'Job Opening'}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                        {app.jobId?.specifications?.department || 'General'}
                      </div>
                    </td>

                    {/* Experience & Salary */}
                    <td className="py-4 px-6 text-xs text-slate-700 dark:text-slate-300">
                      <div>
                        Worked Before:{' '}
                        <span
                          className={`font-bold ${
                            app.haveYouWorkedBefore === 'Yes'
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          {app.haveYouWorkedBefore}
                        </span>
                      </div>
                      {app.haveYouWorkedBefore === 'Yes' && app.yearsOfExperience && (
                        <div className="text-slate-500 dark:text-slate-400 mt-1">
                          Experience:{' '}
                          <span className="text-slate-800 dark:text-white font-bold">
                            {app.yearsOfExperience}
                          </span>
                        </div>
                      )}
                      {app.currentOrLastSalary && (
                        <div className="text-slate-500 dark:text-slate-400 mt-1">
                          Salary: <span className="text-slate-800 dark:text-white font-bold">{app.currentOrLastSalary}</span>
                        </div>
                      )}
                    </td>

                    {/* Resume link */}
                    <td className="py-4 px-6">
                      {app.resume?.url ? (
                        <a
                          href={app.resume.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white border border-blue-500/25 text-xs font-bold transition-all cursor-pointer shadow-sm"
                          title="Open CV in new tab"
                        >
                          <FileText size={14} />
                          <span>View Resume</span>
                          <ExternalLink size={12} />
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400 dark:text-slate-500">No file</span>
                      )}
                    </td>

                    {/* Status Selector */}
                    <td className="py-4 px-6">
                      <select
                        value={app.status}
                        onChange={(e) => handleStatusChange(app._id, e.target.value)}
                        className={`text-xs font-bold px-2.5 py-1.5 rounded-xl border transition-colors cursor-pointer focus:outline-none ${
                          STATUS_COLORS[app.status] || 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <option value="Pending" className="bg-white dark:bg-[#050A17] text-amber-600 dark:text-amber-400">
                          Pending
                        </option>
                        <option value="Reviewed" className="bg-white dark:bg-[#050A17] text-blue-600 dark:text-blue-400">
                          Reviewed
                        </option>
                        <option value="Shortlisted" className="bg-white dark:bg-[#050A17] text-emerald-600 dark:text-emerald-400">
                          Shortlisted
                        </option>
                        <option value="Rejected" className="bg-white dark:bg-[#050A17] text-rose-600 dark:text-rose-400">
                          Rejected
                        </option>
                        <option value="Hired" className="bg-white dark:bg-[#050A17] text-purple-600 dark:text-purple-400">
                          Hired
                        </option>
                      </select>
                    </td>

                    {/* Applied Date */}
                    <td className="py-4 px-6 text-xs font-bold text-slate-700 dark:text-slate-300">
                      {new Date(app.createdAt).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => setDeleteId(app._id)}
                        className="size-8 rounded-xl bg-slate-100 dark:bg-[#050A17] text-rose-500 hover:bg-rose-600 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-slate-200 dark:border-slate-800/90 shadow-sm ml-auto"
                        title="Delete Application"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#091126] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">Delete Application?</h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold leading-relaxed">
              Are you sure you want to delete this applicant submission? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteId(null)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700/80 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
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

export default JobApplications;
