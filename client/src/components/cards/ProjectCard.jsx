import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SkillBadge } from '../common/Badge.jsx';
import { Clock, IndianRupee, Bookmark, ArrowRight, Building2, MapPin, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useSavedMutations, useSavedIds } from '../../hooks/useSaved.js';

export const ProjectCard = ({ project }) => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { data: savedData } = useSavedIds();
  const { toggleSavedProject } = useSavedMutations();

  const isSaved = savedData?.savedProjectIds?.includes(project.id);
  const isOwner = user && (
    String(user.id) === String(project.client_user_id) ||
    String(user.id) === String(project.client_id)
  );

  const handleBookmark = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    toggleSavedProject.mutate(project.id);
  };

  const formatBudget = () => {
    if (project.budget_type === 'hourly') {
      return `₹${project.budget_min || '0'} - ₹${project.budget_max || '0'} / hr`;
    }
    if (project.budget_min && project.budget_max) {
      return `₹${project.budget_min.toLocaleString()} - ₹${project.budget_max.toLocaleString()}`;
    }
    if (project.budget_max) {
      return `Up to ₹${project.budget_max.toLocaleString()}`;
    }
    return project.budget_min ? `₹${project.budget_min.toLocaleString()}` : 'Negotiable';
  };

  const formatDeadline = (dateStr) => {
    if (!dateStr) return 'Flexible deadline';
    const date = new Date(dateStr);
    const diffDays = Math.ceil((date - new Date()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return 'Expired';
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    return `${diffDays} days left`;
  };

  return (
    <div className="glass-card-hover rounded-2xl p-6 flex flex-col justify-between relative group">
      <div>
        {/* Top meta */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200">
              {project.category}
            </span>
            <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-600 capitalize">
              {project.budget_type} Budget
            </span>
            <span className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-600">
              <Users size={12} className="text-slate-400" />
              {project.proposals_count || 0} proposals
            </span>
          </div>

          <button
            type="button"
            onClick={handleBookmark}
            title={isSaved ? 'Remove Bookmark' : 'Save Gig'}
            className={`p-2 rounded-xl transition-all ${
              isSaved
                ? 'bg-amber-50 text-amber-500 border border-amber-200'
                : 'bg-slate-100 text-slate-400 hover:text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Bookmark size={18} className={isSaved ? 'fill-amber-500' : ''} />
          </button>
        </div>

        {/* Title */}
        <Link to={`/projects/${project.id}`}>
          <h3 className="text-lg font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-2 mb-2">
            {project.title}
          </h3>
        </Link>

        {/* Description */}
        <p className="text-xs text-slate-600 line-clamp-3 mb-4 leading-relaxed">
          {project.description}
        </p>

        {/* Required Skills */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {project.required_skills?.slice(0, 4).map((skill, i) => (
            <SkillBadge key={i} skill={skill} />
          ))}
          {project.required_skills?.length > 4 && (
            <span className="text-xs text-slate-400 self-center font-medium">
              +{project.required_skills.length - 4}
            </span>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Budget</span>
            <span className="text-base font-bold text-emerald-600">{formatBudget()}</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Timeline</span>
            <span className="text-xs font-medium text-slate-600 flex items-center gap-1">
              <Clock size={12} className="text-brand-500" /> {formatDeadline(project.deadline)}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <img
              src={project.client_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(project.client_name || 'Client')}&background=6366f1&color=fff`}
              alt={project.client_name}
              className="w-6 h-6 rounded-full object-cover"
            />
            <span className="text-xs text-slate-600 font-medium">{project.client_name}</span>
          </div>

          <div className="flex items-center gap-2">
            {isOwner ? (
              <Link
                to={`/projects/${project.id}?tab=proposals`}
                className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg border border-indigo-200 transition-colors"
              >
                <Users size={13} /> Review Proposals ({project.proposals_count || 0})
              </Link>
            ) : (
              <Link
                to={`/projects/${project.id}`}
                className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors"
              >
                Details <ArrowRight size={14} />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
