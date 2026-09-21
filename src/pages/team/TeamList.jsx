import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Pencil, Trash2, Plus, Users, Loader2, Linkedin, Instagram, Eye, EyeOff } from "lucide-react";
import { useTeamStore } from "../../stores/teamStore";
import { getCdnUrl } from "../../utils/media";

const TeamList = () => {
  const navigate = useNavigate();
  const { team, isLoading, fetchTeam, deleteTeamMember } = useTeamStore();
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  useEffect(() => { fetchTeam(); }, [fetchTeam]);

  const handleDelete = async (id) => {
    await deleteTeamMember(id);
    setDeleteConfirmId(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8 pb-20 font-sans min-h-screen text-slate-900 dark:text-slate-100 text-left">
      {/* HEADER HUB */}
      <div className="bg-white dark:bg-[#091126]/95 rounded-3xl py-4 sm:py-5 px-6 sm:px-8 border border-slate-200/90 dark:border-indigo-500/25 shadow-xl dark:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.7),0_0_30px_2px_rgba(99,102,241,0.18)] ring-1 ring-slate-900/5 dark:ring-white/5 backdrop-blur-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Glow Effects */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-blue-500/10 dark:bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-indigo-500/10 dark:bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-500/30 shrink-0">
            <Users size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-500 dark:text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full">
                DIRECTORY
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2 flex-wrap">
              Team <span className="text-blue-500">Management</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-semibold mt-0.5 text-xs sm:text-sm">
              {team.length} verified member{team.length !== 1 ? "s" : ""} active in the directory.
            </p>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <button
            onClick={() => navigate("/team/create")}
            className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-blue-500/30 flex items-center gap-2 cursor-pointer"
          >
            <Plus size={15} /> ADD NEW MEMBER
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 bg-white dark:bg-[#091126]/95 rounded-3xl border border-slate-200/90 dark:border-indigo-500/25 shadow-xl">
          <Loader2 className="w-9 h-9 text-blue-500 animate-spin" />
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Loading team members...</p>
        </div>
      ) : team.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-[#091126]/95 py-20 px-4 text-center shadow-xl">
          <Users size={40} className="text-slate-400 dark:text-slate-600 mb-3" />
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">No team members yet</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Add your first team member to populate the public directory.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {team.map((member) => (
              <motion.div
                key={member._id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-[#091126]/95 rounded-3xl border border-slate-200/90 dark:border-indigo-500/25 overflow-hidden shadow-xl ring-1 ring-slate-900/5 dark:ring-white/5 backdrop-blur-xl hover:shadow-2xl transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-[4/3] bg-slate-100 dark:bg-[#050A17] overflow-hidden">
                    <img
                      src={getCdnUrl(member.image) || "https://via.placeholder.com/400x300?text=No+Image"}
                      alt={member.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => { e.target.src = "https://via.placeholder.com/400x300?text=No+Image"; }}
                    />
                    <span
                      className={`absolute top-3.5 left-3.5 flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider backdrop-blur-md ${
                        member.status
                          ? "bg-emerald-500/90 text-white shadow-md shadow-emerald-500/30"
                          : "bg-slate-700/90 text-slate-200"
                      }`}
                    >
                      {member.status ? <Eye size={11} /> : <EyeOff size={11} />}
                      {member.status ? "Visible" : "Hidden"}
                    </span>
                    <div className="absolute top-3.5 right-3.5 flex gap-2">
                      <button
                        onClick={() => navigate(`/team/edit/${member._id}`)}
                        className="size-8 rounded-xl bg-white/90 dark:bg-[#091126]/90 backdrop-blur-md text-blue-500 hover:bg-blue-600 hover:text-white flex items-center justify-center shadow-md transition-all cursor-pointer border border-slate-200/60 dark:border-slate-700/60"
                        title="Edit"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(member._id)}
                        className="size-8 rounded-xl bg-white/90 dark:bg-[#091126]/90 backdrop-blur-md text-rose-500 hover:bg-rose-600 hover:text-white flex items-center justify-center shadow-md transition-all cursor-pointer border border-slate-200/60 dark:border-slate-700/60"
                        title="Delete"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  <div className="p-6 flex flex-col gap-2">
                    <h3 className="font-bold text-base text-slate-900 dark:text-white tracking-tight">{member.name}</h3>
                    <p className="text-xs font-bold text-blue-500 dark:text-blue-400 uppercase tracking-wider">{member.designation}</p>
                    <div className="flex items-center gap-3 pt-3 mt-1 border-t border-slate-100 dark:border-slate-800/80">
                      {member.socialLinks?.linkedin && (
                        <a
                          href={member.socialLinks.linkedin}
                          target="_blank"
                          rel="noreferrer"
                          className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-500 hover:bg-blue-500 hover:text-white flex items-center justify-center transition-all"
                        >
                          <Linkedin size={14} />
                        </a>
                      )}
                      {member.socialLinks?.instagram && (
                        <a
                          href={member.socialLinks.instagram}
                          target="_blank"
                          rel="noreferrer"
                          className="w-8 h-8 rounded-lg bg-pink-500/10 border border-pink-500/20 text-pink-500 hover:bg-pink-500 hover:text-white flex items-center justify-center transition-all"
                        >
                          <Instagram size={14} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {deleteConfirmId === member._id && (
                  <div className="p-4 bg-rose-500/10 border-t border-rose-500/20 flex items-center justify-between gap-3">
                    <p className="text-xs font-bold text-rose-500 dark:text-rose-400">Remove this member?</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleDelete(member._id)}
                        className="text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700 shadow-md shadow-rose-600/30 transition-all cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default TeamList;