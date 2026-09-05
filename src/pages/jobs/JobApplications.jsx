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
} from 'lucide-react';
import { useJobStore } from '../../stores/jobStore';

const STATUS_COLORS = {
  Pending: 'bg-amber-950/60 text-amber-400 border-amber-800/40',
  Reviewed: 'bg-blue-950/60 text-blue-400 border-blue-800/40',
  Shortlisted: 'bg-emerald-950/60 text-emerald-400 border-emerald-800/40',
  Rejected: 'bg-rose-950/60 text-rose-400 border-rose-800/40',
  Hired: 'bg-purple-950/60 text-purple-400 border-purple-800/40',
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
    <div className="min-h-screen bg-[#060c18] text-slate-100 p-4 sm:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/jobs/list')}
              className="size-10 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Back to jobs"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-wide">
                Job Applications
              </h1>
              <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
                Review submitted candidate details, download CVs, and update application statuses.
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-[#0b1322] border border-slate-800/80 rounded-2xl p-4 flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by candidate name, email, or phone number..."
              className="w-full bg-[#111a2e] border border-slate-700/60 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            {/* Filter by Job Position */}
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="bg-[#111a2e] border border-slate-700/60 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500 cursor-pointer w-full md:w-auto max-w-xs truncate"
            >
              <option value="">All Job Positions</option>
              {jobs.map((j) => (
                <option key={j._id} value={j._id}>
                  {j.title}
                </option>
              ))}
            </select>

            {/* Filter by Status */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#111a2e] border border-slate-700/60 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500 cursor-pointer w-full md:w-auto"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Reviewed">Reviewed</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Rejected">Rejected</option>
              <option value="Hired">Hired</option>
            </select>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 bg-[#0b1322] border border-slate-800/80 rounded-2xl">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            <p className="text-slate-400 text-sm">Loading applications...</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-[#0b1322] border border-slate-800/80 rounded-2xl text-center px-4">
            <div className="size-16 rounded-2xl bg-slate-900 flex items-center justify-center text-slate-500 mb-4 border border-slate-800">
              <Users size={28} />
            </div>
            <h3 className="text-lg font-bold text-white">No applications found</h3>
            <p className="text-slate-400 text-sm mt-1 max-w-sm">
              {search || selectedJobId || statusFilter !== 'All'
                ? 'No applicant matches the selected filter criteria.'
                : 'Candidates will appear here once they apply from the public website.'}
            </p>
          </div>
        ) : (
          <div className="bg-[#0b1322] border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-[#080f1b]/60">
                    <th className="py-4 px-5">Candidate</th>
                    <th className="py-4 px-5">Applied Position</th>
                    <th className="py-4 px-5">Experience & Salary</th>
                    <th className="py-4 px-5">Resume / CV</th>
                    <th className="py-4 px-5">Status</th>
                    <th className="py-4 px-5">Applied Date</th>
                    <th className="py-4 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-sm">
                  {applications.map((app) => (
                    <tr
                      key={app._id}
                      className="hover:bg-slate-900/40 transition-colors"
                    >
                      {/* Candidate Name & Contact */}
                      <td className="py-4 px-5">
                        <div className="font-semibold text-white">{app.fullName}</div>
                        <div className="flex flex-col gap-0.5 mt-1 text-xs text-slate-400">
                          <a
                            href={`mailto:${app.email}`}
                            className="flex items-center gap-1.5 hover:text-blue-400 transition-colors"
                          >
                            <Mail size={12} className="text-slate-500" />
                            <span>{app.email}</span>
                          </a>
                          <a
                            href={`tel:${app.phone}`}
                            className="flex items-center gap-1.5 hover:text-blue-400 transition-colors"
                          >
                            <Phone size={12} className="text-slate-500" />
                            <span>{app.phone}</span>
                          </a>
                        </div>
                      </td>

                      {/* Applied Position */}
                      <td className="py-4 px-5">
                        <div className="font-medium text-slate-200">
                          {app.jobId?.title || 'Job Opening'}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {app.jobId?.specifications?.department || 'General'}
                        </div>
                      </td>

                      {/* Experience & Salary */}
                      <td className="py-4 px-5 text-xs text-slate-300">
                        <div>
                          Worked Before:{' '}
                          <span
                            className={`font-semibold ${
                              app.haveYouWorkedBefore === 'Yes'
                                ? 'text-emerald-400'
                                : 'text-slate-400'
                            }`}
                          >
                            {app.haveYouWorkedBefore}
                          </span>
                        </div>
                        {app.haveYouWorkedBefore === 'Yes' && app.yearsOfExperience && (
                          <div className="text-slate-400 mt-1">
                            Experience:{' '}
                            <span className="text-white font-medium">
                              {app.yearsOfExperience}
                            </span>
                          </div>
                        )}
                        {app.currentOrLastSalary && (
                          <div className="text-slate-400 mt-1">
                            Salary: <span className="text-white">{app.currentOrLastSalary}</span>
                          </div>
                        )}
                      </td>

                      {/* Resume link */}
                      <td className="py-4 px-5">
                        {app.resume?.url ? (
                          <a
                            href={app.resume.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white border border-blue-500/30 text-xs font-semibold transition-all cursor-pointer shadow-sm"
                            title="Open CV in new tab"
                          >
                            <FileText size={14} />
                            <span>View Resume</span>
                            <ExternalLink size={12} />
                          </a>
                        ) : (
                          <span className="text-xs text-slate-500">No file</span>
                        )}
                      </td>

                      {/* Status Selector */}
                      <td className="py-4 px-5">
                        <select
                          value={app.status}
                          onChange={(e) => handleStatusChange(app._id, e.target.value)}
                          className={`text-xs font-semibold px-2.5 py-1.5 rounded-xl border transition-colors cursor-pointer focus:outline-none ${
                            STATUS_COLORS[app.status] || 'bg-slate-800 text-slate-300 border-slate-700'
                          }`}
                        >
                          <option value="Pending" className="bg-[#0c1424] text-amber-400">
                            Pending
                          </option>
                          <option value="Reviewed" className="bg-[#0c1424] text-blue-400">
                            Reviewed
                          </option>
                          <option value="Shortlisted" className="bg-[#0c1424] text-emerald-400">
                            Shortlisted
                          </option>
                          <option value="Rejected" className="bg-[#0c1424] text-rose-400">
                            Rejected
                          </option>
                          <option value="Hired" className="bg-[#0c1424] text-purple-400">
                            Hired
                          </option>
                        </select>
                      </td>

                      {/* Applied Date */}
                      <td className="py-4 px-5 text-xs text-slate-400">
                        {new Date(app.createdAt).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right">
                        <button
                          onClick={() => setDeleteId(app._id)}
                          className="size-8 rounded-lg bg-slate-800/80 text-rose-400 hover:bg-rose-600 hover:text-white flex items-center justify-center transition-colors cursor-pointer ml-auto"
                          title="Delete Application"
                        >
                          <Trash2 size={14} />
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
            <div className="bg-[#0c1424] border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
              <h3 className="text-lg font-bold text-white">Delete Application?</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Are you sure you want to delete this applicant submission? This action cannot be undone.
              </p>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setDeleteId(null)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteId)}
                  className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-rose-600 hover:bg-rose-500 transition-colors cursor-pointer shadow-lg shadow-rose-600/20"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobApplications;
