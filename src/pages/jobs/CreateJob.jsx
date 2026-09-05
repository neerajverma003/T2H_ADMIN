import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Briefcase,
  MapPin,
  DollarSign,
  FileText,
  User,
  Mail,
  Phone,
  Building2,
  Sliders,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Check,
  Building,
  Plus,
  X,
  Sparkles,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useJobStore } from '../../stores/jobStore';

const COMMON_SKILLS = [
  'Java',
  'Spring Boot',
  'Node.js',
  'React.js',
  'JavaScript',
  'Python',
  'SQL',
  'MongoDB',
  'Communication Skills',
  'Problem Solving',
  'Git & GitHub',
  'REST APIs',
  'Sales & Marketing',
  'Customer Handling',
];

const EDUCATION_OPTIONS = [
  'BCA',
  'MCA',
  'B.Tech',
  'M.Tech',
  'B.Sc',
  'M.Sc',
  'Any Graduate',
  'Diploma',
];

const LANGUAGE_OPTIONS = [
  'English',
  'Hindi',
  'Tamil',
  'Telugu',
  'Kannada',
  'Malayalam',
  'Marathi',
  'Gujarati',
  'Punjabi',
];

const DEPARTMENT_OPTIONS = [
  'IT',
  'Sales',
  'Marketing',
  'Operations',
  'Customer Support',
  'Human Resources',
  'Design',
  'Product',
  'Finance',
];

const EMPLOYMENT_TYPES = [
  'Full Time',
  'Part Time',
  'Contract',
  'Internship',
  'Freelance',
];

const EXPERIENCE_OPTIONS = [
  'Fresher',
  '0-1 Years',
  '1-3 Years',
  '3-5 Years',
  '5+ Years',
];

const SHIFT_OPTIONS = ['Day Shift', 'Night Shift', 'Flexible', 'Rotational'];

const CreateJob = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const { createJob, updateJob, fetchJobById, isSaving, isFetchingSingle } = useJobStore();

  const [formData, setFormData] = useState({
    title: '',
    locationType: 'Remote',
    location: '',
    salary: {
      salaryNotDisclosed: false,
      minSalary: '',
      maxSalary: '',
      fixedSalary: '',
      currency: 'INR',
    },
    description: '',
    recruiter: {
      name: '',
      designation: '',
      email: '',
      contactNumber: '',
    },
    company: {
      name: 'Trip 2 Honeymoon',
      location: 'Dwarka Mor, New Delhi',
      description: '',
    },
    specifications: {
      department: 'IT',
      employmentType: 'Full Time',
      experienceRequired: 'Fresher',
      shift: 'Day Shift',
      educationQualifications: [],
      preferredLanguages: ['English', 'Hindi'],
      skills: [],
    },
    status: 'Active',
  });

  const [customSkillInput, setCustomSkillInput] = useState('');

  const isSalaryNotDisclosed = Boolean(formData.salary.salaryNotDisclosed);
  const hasRangeSalary = Boolean(
    formData.salary.minSalary?.toString().trim() ||
    formData.salary.maxSalary?.toString().trim()
  );
  const hasFixedSalary = Boolean(formData.salary.fixedSalary?.toString().trim());

  const isMinMaxDisabled = isSalaryNotDisclosed || hasFixedSalary;
  const isFixedDisabled = isSalaryNotDisclosed || hasRangeSalary;

  useEffect(() => {
    if (isEdit) {
      fetchJobById(id).then((job) => {
        if (job) {
          setFormData({
            title: job.title || '',
            locationType: job.locationType || 'Remote',
            location: job.location || '',
            salary: {
              salaryNotDisclosed: Boolean(job.salary?.salaryNotDisclosed),
              minSalary: job.salary?.minSalary || '',
              maxSalary: job.salary?.maxSalary || '',
              fixedSalary: job.salary?.fixedSalary || '',
              currency: job.salary?.currency || 'INR',
            },
            description: job.description || '',
            recruiter: {
              name: job.recruiter?.name || '',
              designation: job.recruiter?.designation || '',
              email: job.recruiter?.email || '',
              contactNumber: job.recruiter?.contactNumber || '',
            },
            company: {
              name: job.company?.name || 'Trip 2 Honeymoon',
              location: job.company?.location || '',
              description: job.company?.description || '',
            },
            specifications: {
              department: job.specifications?.department || 'IT',
              employmentType: job.specifications?.employmentType || 'Full Time',
              experienceRequired: job.specifications?.experienceRequired || 'Fresher',
              shift: job.specifications?.shift || 'Day Shift',
              educationQualifications: job.specifications?.educationQualifications || [],
              preferredLanguages: job.specifications?.preferredLanguages || [],
              skills: job.specifications?.skills || [],
            },
            status: job.status || 'Active',
          });
        }
      });
    }
  }, [id, isEdit, fetchJobById]);

  // Handle custom skill addition
  const handleAddCustomSkill = (e) => {
    e?.preventDefault();
    const trimmed = customSkillInput.trim();
    if (!trimmed) return;
    const currentSkills = formData.specifications.skills || [];
    if (!currentSkills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      setFormData((prev) => ({
        ...prev,
        specifications: {
          ...prev.specifications,
          skills: [...currentSkills, trimmed],
        },
      }));
    }
    setCustomSkillInput('');
  };

  // Remove specific skill
  const handleRemoveSkill = (skillToRemove) => {
    setFormData((prev) => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        skills: (prev.specifications.skills || []).filter((s) => s !== skillToRemove),
      },
    }));
  };

  // Handle simple input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle nested object changes
  const handleNestedChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  // Toggle items in array (pills)
  const toggleArrayItem = (section, field, item) => {
    setFormData((prev) => {
      const currentList = prev[section][field] || [];
      const updated = currentList.includes(item)
        ? currentList.filter((x) => x !== item)
        : [...currentList, item];
      return {
        ...prev,
        [section]: {
          ...prev[section],
          [field]: updated,
        },
      };
    });
  };

  // Handle salary inputs with mutual exclusivity between Range and Fixed
  const handleSalaryChange = (field, value) => {
    setFormData((prev) => {
      const updatedSalary = { ...prev.salary };

      if (field === 'salaryNotDisclosed') {
        const isDisclosed = Boolean(value);
        updatedSalary.salaryNotDisclosed = isDisclosed;
        if (isDisclosed) {
          updatedSalary.minSalary = '';
          updatedSalary.maxSalary = '';
          updatedSalary.fixedSalary = '';
        }
      } else if (field === 'minSalary' || field === 'maxSalary') {
        updatedSalary[field] = value;
        // If min or max is defined, fixedSalary cannot be defined
        if (value.trim() !== '') {
          updatedSalary.fixedSalary = '';
        }
      } else if (field === 'fixedSalary') {
        updatedSalary.fixedSalary = value;
        // If fixed is defined, min and max cannot be defined
        if (value.trim() !== '') {
          updatedSalary.minSalary = '';
          updatedSalary.maxSalary = '';
        }
      }

      return {
        ...prev,
        salary: updatedSalary,
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Job Title is required');
      return;
    }
    if (!formData.location.trim()) {
      toast.error('Job Location is required');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('Job Description is required');
      return;
    }
    if (!formData.recruiter.name.trim()) {
      toast.error('Recruiter Name is required');
      return;
    }

    const sanitizedSalary = {
      ...formData.salary,
      salaryNotDisclosed: isSalaryNotDisclosed,
      minSalary: isSalaryNotDisclosed || hasFixedSalary ? '' : (formData.salary.minSalary || '').toString().trim(),
      maxSalary: isSalaryNotDisclosed || hasFixedSalary ? '' : (formData.salary.maxSalary || '').toString().trim(),
      fixedSalary: isSalaryNotDisclosed || hasRangeSalary ? '' : (formData.salary.fixedSalary || '').toString().trim(),
    };

    const payload = {
      ...formData,
      salary: sanitizedSalary,
    };

    let result;
    if (isEdit) {
      result = await updateJob(id, payload);
    } else {
      result = await createJob(payload);
    }

    if (result?.success) {
      navigate('/jobs/list');
    }
  };

  if (isFetchingSingle) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        <p className="text-slate-400 text-sm">Loading job position details...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060c18] text-slate-100 p-4 sm:p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/jobs/list')}
              className="size-10 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Back to jobs"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-wide">
                {isEdit ? 'Edit Job Position' : 'Create Job Position'}
              </h1>
              <p className="text-slate-400 text-xs mt-0.5">
                {isEdit ? 'Update job opening details and specifications' : 'Post a new job vacancy for public website display'}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ========================================================= */}
          {/* SECTION 1: BASIC JOB INFORMATION                          */}
          {/* ========================================================= */}
          <div className="bg-[#0b1322] border border-slate-800/80 rounded-2xl p-6 sm:p-7 shadow-xl">
            <div className="flex items-center gap-2.5 pb-5 mb-5 border-b border-slate-800/60 text-blue-400 font-bold text-sm tracking-wider uppercase">
              <Briefcase size={18} className="text-blue-500" />
              <span>Basic Job Information</span>
            </div>

            <div className="space-y-5">
              {/* Job Title */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Job Title <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Briefcase size={16} />
                  </div>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g. Senior MERN Stack Developer"
                    required
                    className="w-full bg-[#111a2e] border border-slate-700/60 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              {/* Location Type & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Job Location Type <span className="text-rose-500">*</span>
                  </label>
                  <select
                    name="locationType"
                    value={formData.locationType}
                    onChange={handleChange}
                    className="w-full bg-[#111a2e] border border-slate-700/60 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                  >
                    <option value="Remote">Remote</option>
                    <option value="On Site">On Site</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Job Location <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <MapPin size={16} />
                    </div>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="e.g. Noida, Delhi, Remote"
                      required
                      className="w-full bg-[#111a2e] border border-slate-700/60 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Salary Structure */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Salary Structure
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.salary.salaryNotDisclosed}
                      onChange={(e) =>
                        handleSalaryChange('salaryNotDisclosed', e.target.checked)
                      }
                      className="size-4 rounded border-slate-700 bg-[#111a2e] text-blue-600 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                    />
                    <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
                      Salary Not Disclosed
                    </span>
                  </label>
                </div>

                <div
                  className={`grid grid-cols-1 sm:grid-cols-3 gap-4 transition-opacity duration-200 ${
                    isSalaryNotDisclosed ? 'opacity-40 pointer-events-none' : ''
                  }`}
                >
                  <div className="relative">
                    <div
                      className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-sm font-semibold ${
                        isMinMaxDisabled ? 'text-slate-600' : 'text-slate-500'
                      }`}
                    >
                      ₹
                    </div>
                    <input
                      type="text"
                      placeholder="Min Salary"
                      value={formData.salary.minSalary}
                      onChange={(e) => handleSalaryChange('minSalary', e.target.value)}
                      disabled={isMinMaxDisabled}
                      title={
                        hasFixedSalary
                          ? 'Min Salary is disabled because Fixed Salary is defined'
                          : undefined
                      }
                      className={`w-full rounded-xl pl-9 pr-4 py-3 text-sm transition-colors ${
                        isMinMaxDisabled
                          ? 'bg-slate-900/40 border border-slate-800/40 text-slate-500 cursor-not-allowed placeholder-slate-600'
                          : 'bg-[#111a2e] border border-slate-700/60 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500'
                      }`}
                    />
                  </div>

                  <div className="relative">
                    <div
                      className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-sm font-semibold ${
                        isMinMaxDisabled ? 'text-slate-600' : 'text-slate-500'
                      }`}
                    >
                      ₹
                    </div>
                    <input
                      type="text"
                      placeholder="Max Salary"
                      value={formData.salary.maxSalary}
                      onChange={(e) => handleSalaryChange('maxSalary', e.target.value)}
                      disabled={isMinMaxDisabled}
                      title={
                        hasFixedSalary
                          ? 'Max Salary is disabled because Fixed Salary is defined'
                          : undefined
                      }
                      className={`w-full rounded-xl pl-9 pr-4 py-3 text-sm transition-colors ${
                        isMinMaxDisabled
                          ? 'bg-slate-900/40 border border-slate-800/40 text-slate-500 cursor-not-allowed placeholder-slate-600'
                          : 'bg-[#111a2e] border border-slate-700/60 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500'
                      }`}
                    />
                  </div>

                  <div className="relative">
                    <div
                      className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-sm font-semibold ${
                        isFixedDisabled ? 'text-slate-600' : 'text-slate-500'
                      }`}
                    >
                      ₹
                    </div>
                    <input
                      type="text"
                      placeholder="Fixed Salary"
                      value={formData.salary.fixedSalary}
                      onChange={(e) => handleSalaryChange('fixedSalary', e.target.value)}
                      disabled={isFixedDisabled}
                      title={
                        hasRangeSalary
                          ? 'Fixed Salary is disabled because Min/Max Salary is defined'
                          : undefined
                      }
                      className={`w-full rounded-xl pl-9 pr-4 py-3 text-sm transition-colors ${
                        isFixedDisabled
                          ? 'bg-slate-900/40 border border-slate-800/40 text-slate-500 cursor-not-allowed placeholder-slate-600'
                          : 'bg-[#111a2e] border border-slate-700/60 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500'
                      }`}
                    />
                  </div>
                </div>

                {!isSalaryNotDisclosed && hasRangeSalary && (
                  <p className="text-[11px] text-amber-400/90 mt-2 font-medium">
                    💡 Fixed salary is locked because a salary range (Min/Max) is defined.
                  </p>
                )}
                {!isSalaryNotDisclosed && hasFixedSalary && (
                  <p className="text-[11px] text-amber-400/90 mt-2 font-medium">
                    💡 Min and Max salary are locked because a fixed salary is defined.
                  </p>
                )}
              </div>

              {/* Job Description */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Job Description <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <textarea
                    rows={4}
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Job description details..."
                    required
                    className="w-full bg-[#111a2e] border border-slate-700/60 rounded-xl p-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors leading-relaxed"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* SECTION 2: ABOUT RECRUITER                                */}
          {/* ========================================================= */}
          <div className="bg-[#0b1322] border border-slate-800/80 rounded-2xl p-6 sm:p-7 shadow-xl">
            <div className="flex items-center gap-2.5 pb-5 mb-5 border-b border-slate-800/60 text-blue-400 font-bold text-sm tracking-wider uppercase">
              <User size={18} className="text-blue-500" />
              <span>About Recruiter</span>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Recruiter Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <User size={16} />
                    </div>
                    <input
                      type="text"
                      value={formData.recruiter.name}
                      onChange={(e) => handleNestedChange('recruiter', 'name', e.target.value)}
                      placeholder="e.g. John Smith"
                      required
                      className="w-full bg-[#111a2e] border border-slate-700/60 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Recruiter Designation
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Briefcase size={16} />
                    </div>
                    <input
                      type="text"
                      value={formData.recruiter.designation}
                      onChange={(e) =>
                        handleNestedChange('recruiter', 'designation', e.target.value)
                      }
                      placeholder="e.g. HR Manager"
                      className="w-full bg-[#111a2e] border border-slate-700/60 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Recruiter Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Mail size={16} />
                    </div>
                    <input
                      type="email"
                      value={formData.recruiter.email}
                      onChange={(e) => handleNestedChange('recruiter', 'email', e.target.value)}
                      placeholder="e.g. hr@company.com"
                      className="w-full bg-[#111a2e] border border-slate-700/60 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Recruiter Contact Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Phone size={16} />
                    </div>
                    <input
                      type="text"
                      value={formData.recruiter.contactNumber}
                      onChange={(e) =>
                        handleNestedChange('recruiter', 'contactNumber', e.target.value)
                      }
                      placeholder="Contact phone number"
                      className="w-full bg-[#111a2e] border border-slate-700/60 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* SECTION 3: COMPANY INFORMATION                            */}
          {/* ========================================================= */}
          <div className="bg-[#0b1322] border border-slate-800/80 rounded-2xl p-6 sm:p-7 shadow-xl">
            <div className="flex items-center gap-2.5 pb-5 mb-5 border-b border-slate-800/60 text-blue-400 font-bold text-sm tracking-wider uppercase">
              <Building2 size={18} className="text-blue-500" />
              <span>Company Information</span>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Company Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Building2 size={16} />
                    </div>
                    <input
                      type="text"
                      value={formData.company.name}
                      onChange={(e) => handleNestedChange('company', 'name', e.target.value)}
                      placeholder="e.g. Admire Holidays / Trip 2 Honeymoon"
                      required
                      className="w-full bg-[#111a2e] border border-slate-700/60 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Company Location
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <MapPin size={16} />
                    </div>
                    <input
                      type="text"
                      value={formData.company.location}
                      onChange={(e) => handleNestedChange('company', 'location', e.target.value)}
                      placeholder="e.g. Bangalore, Karnataka"
                      className="w-full bg-[#111a2e] border border-slate-700/60 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Company Description
                </label>
                <textarea
                  rows={3}
                  value={formData.company.description}
                  onChange={(e) => handleNestedChange('company', 'description', e.target.value)}
                  placeholder="About the company details..."
                  className="w-full bg-[#111a2e] border border-slate-700/60 rounded-xl p-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* SECTION 4: JOB SPECIFICATIONS                             */}
          {/* ========================================================= */}
          <div className="bg-[#0b1322] border border-slate-800/80 rounded-2xl p-6 sm:p-7 shadow-xl">
            <div className="flex items-center gap-2.5 pb-5 mb-5 border-b border-slate-800/60 text-blue-400 font-bold text-sm tracking-wider uppercase">
              <Sliders size={18} className="text-blue-500" />
              <span>Job Specifications</span>
            </div>

            <div className="space-y-6">
              {/* Department & Employment Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Department <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.specifications.department}
                    onChange={(e) =>
                      handleNestedChange('specifications', 'department', e.target.value)
                    }
                    className="w-full bg-[#111a2e] border border-slate-700/60 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                  >
                    {DEPARTMENT_OPTIONS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Employment Type <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.specifications.employmentType}
                    onChange={(e) =>
                      handleNestedChange('specifications', 'employmentType', e.target.value)
                    }
                    className="w-full bg-[#111a2e] border border-slate-700/60 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                  >
                    {EMPLOYMENT_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Experience Required & Shift */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Experience Required <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.specifications.experienceRequired}
                    onChange={(e) =>
                      handleNestedChange('specifications', 'experienceRequired', e.target.value)
                    }
                    className="w-full bg-[#111a2e] border border-slate-700/60 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                  >
                    {EXPERIENCE_OPTIONS.map((exp) => (
                      <option key={exp} value={exp}>
                        {exp}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Shift
                  </label>
                  <select
                    value={formData.specifications.shift}
                    onChange={(e) =>
                      handleNestedChange('specifications', 'shift', e.target.value)
                    }
                    className="w-full bg-[#111a2e] border border-slate-700/60 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                  >
                    {SHIFT_OPTIONS.map((shift) => (
                      <option key={shift} value={shift}>
                        {shift}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Education Qualifications Multi-select Pills */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Education Qualifications
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {EDUCATION_OPTIONS.map((edu) => {
                    const isSelected =
                      formData.specifications.educationQualifications?.includes(edu);
                    return (
                      <button
                        type="button"
                        key={edu}
                        onClick={() =>
                          toggleArrayItem('specifications', 'educationQualifications', edu)
                        }
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 border border-blue-500'
                            : 'bg-[#111a2e] text-slate-400 border border-slate-700/60 hover:text-white hover:border-slate-600'
                        }`}
                      >
                        {isSelected && <Check size={13} className="stroke-[3]" />}
                        {edu}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Preferred Languages Multi-select Pills */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Preferred Languages
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {LANGUAGE_OPTIONS.map((lang) => {
                    const isSelected =
                      formData.specifications.preferredLanguages?.includes(lang);
                    return (
                      <button
                        type="button"
                        key={lang}
                        onClick={() =>
                          toggleArrayItem('specifications', 'preferredLanguages', lang)
                        }
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 border border-blue-500'
                            : 'bg-[#111a2e] text-slate-400 border border-slate-700/60 hover:text-white hover:border-slate-600'
                        }`}
                      >
                        {isSelected && <Check size={13} className="stroke-[3]" />}
                        {lang}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Skills Required Section */}
              <div className="pt-2 border-t border-slate-800/80">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Skills Required <span className="text-slate-500 font-normal normal-case">(Programming, tools, soft skills)</span>
                  </label>
                  {formData.specifications.skills?.length > 0 && (
                    <span className="text-xs font-semibold text-blue-400">
                      {formData.specifications.skills.length} Selected
                    </span>
                  )}
                </div>

                {/* Custom Skill Input */}
                <div className="flex gap-2 mb-3">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={customSkillInput}
                      onChange={(e) => setCustomSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCustomSkill();
                        }
                      }}
                      placeholder="Type a skill (e.g. Java, Spring Boot, Node.js, Communication) and press Enter or Add"
                      className="w-full bg-[#111a2e] border border-slate-700/60 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddCustomSkill}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                  >
                    <Plus size={15} />
                    <span>Add Skill</span>
                  </button>
                </div>

                {/* Selected Skills Tags */}
                {formData.specifications.skills?.length > 0 && (
                  <div className="mb-4 p-3 bg-[#111a2e]/60 border border-slate-800 rounded-xl">
                    <div className="flex flex-wrap gap-2">
                      {formData.specifications.skills.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-600/20 text-blue-300 border border-blue-500/40 rounded-lg text-xs font-medium"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(skill)}
                            className="hover:text-white transition-colors cursor-pointer"
                            title={`Remove ${skill}`}
                          >
                            <X size={13} />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggested Common Skills */}
                <div>
                  <div className="text-[11px] font-medium text-slate-400 mb-2 flex items-center gap-1.5">
                    <Sparkles size={12} className="text-blue-400" />
                    <span>Suggested Skills (click to toggle):</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {COMMON_SKILLS.map((skill) => {
                      const isSelected = formData.specifications.skills?.includes(skill);
                      return (
                        <button
                          type="button"
                          key={skill}
                          onClick={() => toggleArrayItem('specifications', 'skills', skill)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium tracking-wide transition-all cursor-pointer flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30 border border-blue-500'
                              : 'bg-[#111a2e] text-slate-400 border border-slate-700/60 hover:text-white hover:border-slate-600'
                          }`}
                        >
                          {isSelected && <Check size={12} className="stroke-[3]" />}
                          {skill}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Submit Action */}
          <div className="flex justify-end pt-2 pb-12">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2.5 px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm shadow-xl shadow-blue-600/25 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <span>{isEdit ? 'Update Job Position' : 'Create Job Position'}</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateJob;
