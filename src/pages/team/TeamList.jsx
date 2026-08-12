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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-6 sm:p-10 font-sans">
      <div className="max-w-6xl mx-auto flex flex-col gap-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Team Management</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              {team.length} member{team.length !== 1 ? "s" : ""} in the directory.
            </p>
          </div>
          <button
            onClick={() => navigate("/team/create")}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-semibold text-sm shadow-lg shadow-indigo-600/20 w-fit cursor-pointer"
          >
            <Plus size={18} /> Add New Member
          </button>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="w-8 h-8 text-indigo-600 dark:text-indigo-400 animate-spin" />
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Loading team...</p>
          </div>
        ) : team.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-24 shadow-sm">
            <Users size={40} className="text-slate-400 dark:text-slate-600 mb-4" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">No team members yet</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Add your first team member to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {team.map((member) => (
                <motion.div
                  key={member._id} layout
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-md dark:shadow-slate-950/50 hover:shadow-xl transition-shadow"
                >
                  <div className="relative aspect-[4/3] bg-slate-100 dark:bg-slate-800">
                    <img
                      src={getCdnUrl(member.image) || "https://via.placeholder.com/400x300?text=No+Image"}
                      alt={member.name}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = "https://via.placeholder.com/400x300?text=No+Image"; }}
                    />
                    <span
                      className={`absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                        member.status ? "bg-emerald-500 text-white" : "bg-slate-500 text-white"
                      }`}
                    >
                      {member.status ? <Eye size={11} /> : <EyeOff size={11} />}
                      {member.status ? "Visible" : "Hidden"}
                    </span>
                    <div className="absolute top-3 right-3 flex gap-2">
                      <button
                        onClick={() => navigate(`/team/edit/${member._id}`)}
                        className="size-8 rounded-full bg-white/90 text-indigo-600 flex items-center justify-center shadow hover:bg-indigo-600 hover:text-white transition-colors cursor-pointer"
                        title="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(member._id)}
                        className="size-8 rounded-full bg-white/90 text-rose-600 flex items-center justify-center shadow hover:bg-rose-600 hover:text-white transition-colors cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="p-5 flex flex-col gap-2">
                    <h3 className="font-bold text-slate-900 dark:text-white">{member.name}</h3>
                    <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">{member.designation}</p>
                    <div className="flex items-center gap-3 pt-2 mt-1 border-t border-slate-100 dark:border-slate-800">
                      {member.socialLinks?.linkedin && (
                        <a href={member.socialLinks.linkedin} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                          <Linkedin size={16} />
                        </a>
                      )}
                      {member.socialLinks?.instagram && (
                        <a href={member.socialLinks.instagram} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                          <Instagram size={16} />
                        </a>
                      )}
                    </div>
                  </div>

                  {deleteConfirmId === member._id && (
                    <div className="p-4 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Remove this member?</p>
                      <div className="flex gap-2">
                        <button onClick={() => setDeleteConfirmId(null)} className="text-xs font-bold px-3 py-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800">
                          Cancel
                        </button>
                        <button onClick={() => handleDelete(member._id)} className="text-xs font-bold px-3 py-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700">
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
    </div>
  );
};

export default TeamList;