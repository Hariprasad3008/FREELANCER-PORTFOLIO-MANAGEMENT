import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useProjectDetails, useProjectMutations } from '../hooks/useProjects.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useMessageMutations } from '../hooks/useMessages.js';
import { useSavedMutations, useSavedIds } from '../hooks/useSaved.js';
import { SkillBadge } from '../components/common/Badge.jsx';
import { StarRating } from '../components/common/StarRating.jsx';
import { ProposalModal } from '../components/proposals/ProposalModal.jsx';
import { ProposalsList } from '../components/proposals/ProposalsList.jsx';
import {
  Clock,
  IndianRupee,
  Bookmark,
  MessageSquare,
  Building2,
  Calendar,
  CheckCircle,
  ArrowLeft,
  Trash2,
  Send,
  FileText,
  Users
} from 'lucide-react';

export const ProjectDetails = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isFreelancer } = useAuth();

  const { data, isLoading, error } = useProjectDetails(id);
  const { deleteProject } = useProjectMutations();
  const { createConversation } = useMessageMutations();
  const { data: savedData } = useSavedIds();
  const { toggleSavedProject } = useSavedMutations();

  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') === 'proposals' ? 'proposals' : 'details');

  useEffect(() => {
    if (searchParams.get('tab') === 'proposals') {
      setActiveTab('proposals');
    }
  }, [searchParams]);

  const project = data?.project;
  const isOwner = user && project && (
    String(user.id) === String(project.client_user_id) || 
    String(user.id) === String(project.client_id) ||
    user.role?.toLowerCase() === 'admin'
  );
  const isSaved = savedData?.savedProjectIds?.includes(project?.id);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-500">Loading project details...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="max-w-2xl mx-auto my-16 p-8 glass-card rounded-2xl text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Project Not Found</h2>
        <p className="text-slate-500 text-sm mb-6">This project listing might have expired or been removed.</p>
        <Link to="/projects" className="btn-primary">
          Back to Projects
        </Link>
      </div>
    );
  }

  const handleStartChat = async () => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    try {
      const res = await createConversation.mutateAsync(project.client_user_id || project.client_id);
      if (res.conversation_id) {
        navigate(`/messages?conv=${res.conversation_id}`);
      }
    } catch (err) {
      console.error('Failed to start chat:', err);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this project listing?')) {
      await deleteProject.mutateAsync(project.id);
      navigate('/projects');
    }
  };

  const formatBudget = () => {
    if (project.budget_type?.toUpperCase() === 'HOURLY') {
      return `₹${project.budget_min || '0'} - ₹${project.budget_max || '0'} / hr`;
    }
    if (project.budget_min && project.budget_max) {
      return `₹${parseFloat(project.budget_min).toLocaleString()} - ₹${parseFloat(project.budget_max).toLocaleString()}`;
    }
    return `₹${parseFloat(project.budget_max || project.budget_min || 0).toLocaleString()}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-6 transition-colors"
      >
        <ArrowLeft size={14} /> Back to Projects
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card rounded-3xl p-6 sm:p-8">
            {/* Top Badges */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-xl text-xs font-bold bg-brand-50 text-brand-700 border border-brand-200">
                  {project.category}
                </span>
                <span className="px-3 py-1 rounded-xl text-xs font-medium bg-slate-100 text-slate-700 capitalize">
                  {project.budget_type} Budget
                </span>
                <span className={`px-2.5 py-1 rounded-xl text-xs font-semibold ${
                  project.status?.toUpperCase() === 'OPEN' 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700'
                } uppercase`}>
                  {project.status}
                </span>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleSavedProject.mutate(project.id)}
                  className={`p-2.5 rounded-xl border transition-colors ${
                    isSaved
                      ? 'bg-amber-50 text-amber-500 border-amber-200'
                      : 'bg-white text-slate-500 hover:bg-slate-50 border-slate-200'
                  }`}
                  title={isSaved ? 'Remove Bookmark' : 'Save Project'}
                >
                  <Bookmark size={18} className={isSaved ? 'fill-amber-500' : ''} />
                </button>

                {isOwner && (
                  <button
                    onClick={handleDelete}
                    className="p-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete Project"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-4">
              {project.title}
            </h1>

            {/* Meta bar */}
            <div className="flex flex-wrap items-center gap-6 text-xs text-slate-500 pb-6 mb-6 border-b border-slate-100">
              <span className="flex items-center gap-1.5 font-medium">
                <Calendar size={14} className="text-brand-500" /> Posted on {new Date(project.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              {project.deadline && (
                <span className="flex items-center gap-1.5 font-medium">
                  <Clock size={14} className="text-brand-500" /> Deadline: {new Date(project.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              )}
            </div>

            {/* If Client is Owner: Tabs for Overview vs Proposals */}
            {isOwner && (
              <div className="flex items-center gap-4 border-b border-slate-200 mb-6">
                <button
                  onClick={() => setActiveTab('details')}
                  className={`pb-3 text-sm font-bold transition-colors ${
                    activeTab === 'details'
                      ? 'text-brand-600 border-b-2 border-brand-600'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Project Details
                </button>
                <button
                  onClick={() => setActiveTab('proposals')}
                  className={`pb-3 text-sm font-bold transition-colors flex items-center gap-1.5 ${
                    activeTab === 'proposals'
                      ? 'text-brand-600 border-b-2 border-brand-600'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Users size={16} /> Received Proposals ({project.proposals_count || 0})
                </button>
              </div>
            )}

            {/* Tab: Project Details */}
            {activeTab === 'details' ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900 mb-3">Project Description</h3>
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                    {project.description}
                  </p>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 mb-3">Required Skills & Capabilities</h3>
                  <div className="flex flex-wrap gap-2">
                    {project.required_skills?.map((skill, i) => (
                      <SkillBadge key={i} skill={skill} />
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Tab: Proposals List for Client */
              <ProposalsList projectId={project.id} />
            )}
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="lg:col-span-1 space-y-6">
          {/* Budget & Proposal Card */}
          <div className="glass-card rounded-3xl p-6 border border-slate-200/80">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Project Budget
            </span>
            <div className="text-3xl font-black text-emerald-600 mb-5">
              {formatBudget()}
            </div>

            {!isOwner && (
              <div className="space-y-2.5">
                {isFreelancer ? (
                  <button
                    onClick={() => {
                      if (!isAuthenticated) {
                        navigate('/auth');
                      } else {
                        setIsProposalModalOpen(true);
                      }
                    }}
                    className="w-full btn-primary text-sm py-3"
                  >
                    <FileText size={16} /> Submit Proposal / Bid
                  </button>
                ) : null}

                <button
                  onClick={handleStartChat}
                  className="w-full btn-secondary text-sm py-2.5"
                >
                  <MessageSquare size={16} /> Message Client
                </button>
              </div>
            )}

            <p className="text-[11px] text-slate-400 text-center leading-normal mt-4">
              Secure contracts & milestones backed by PostgreSQL transactions.
            </p>
          </div>

          {/* Client Card */}
          <div className="glass-card rounded-3xl p-6">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Building2 size={14} className="text-brand-600" /> About the Client
            </h3>

            <div className="flex items-center gap-3.5 mb-4">
              <img
                src={project.client_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(project.client_name || 'Client')}&background=6366f1&color=fff`}
                alt={project.client_name}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-sm"
              />
              <div>
                <div className="flex items-center gap-1">
                  <h4 className="font-bold text-slate-900">{project.client_name}</h4>
                  <CheckCircle size={15} className="text-brand-500 shrink-0" />
                </div>
                {project.company_name && (
                  <p className="text-xs text-brand-600 font-medium">{project.company_name}</p>
                )}
                {project.client_location && (
                  <p className="text-xs text-slate-400 mt-0.5">{project.client_location}</p>
                )}
              </div>
            </div>

            {project.client_bio && (
              <p className="text-xs text-slate-600 leading-relaxed line-clamp-4 mb-4">
                {project.client_bio}
              </p>
            )}

            <Link
              to={`/profile/${project.client_user_id || project.client_id}`}
              className="w-full btn-secondary text-xs py-2 justify-center"
            >
              View Client Profile
            </Link>
          </div>
        </div>
      </div>

      {/* Freelancer Proposal Submission Modal */}
      {isProposalModalOpen && (
        <ProposalModal
          isOpen={isProposalModalOpen}
          onClose={() => setIsProposalModalOpen(false)}
          project={project}
        />
      )}
    </div>
  );
};
