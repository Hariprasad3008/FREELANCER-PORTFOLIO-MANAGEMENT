import React from 'react';
import { Link } from 'react-router-dom';
import { useProjectProposals, useProposalMutations } from '../../hooks/useProposals.js';
import { StarRating } from '../common/StarRating.jsx';
import { CheckCircle2, Clock, DollarSign, Check, Loader2, MessageSquare } from 'lucide-react';

export const ProposalsList = ({ projectId }) => {
  const { data, isLoading, isError, error } = useProjectProposals(projectId);
  const { acceptProposal } = useProposalMutations();

  const proposals = data?.proposals || [];

  if (isLoading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center gap-2">
        <Loader2 size={24} className="text-brand-500 animate-spin" />
        <p className="text-xs font-medium text-slate-500">Loading received proposals...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-8 px-4 bg-rose-50 rounded-2xl border border-rose-200">
        <p className="text-xs font-semibold text-rose-700">
          {error?.response?.data?.message || 'Failed to load proposals for this project.'}
        </p>
      </div>
    );
  }

  if (proposals.length === 0) {
    return (
      <div className="text-center py-10 px-4 bg-slate-50 rounded-2xl border border-slate-100">
        <p className="text-sm font-semibold text-slate-700">No proposals received yet</p>
        <p className="text-xs text-slate-400 mt-1">Freelancer bids submitted for this project will appear here.</p>
      </div>
    );
  }

  const handleAccept = async (proposalId) => {
    if (window.confirm('Accept this proposal and hire the freelancer? This will initialize the project contract.')) {
      await acceptProposal.mutateAsync({ proposalId, projectId });
    }
  };

  return (
    <div className="space-y-4">
      {proposals.map((prop) => (
        <div
          key={prop.id}
          className={`p-5 rounded-2xl border transition-all ${
            prop.status === 'ACCEPTED'
              ? 'bg-emerald-50/60 border-emerald-300'
              : 'glass-card'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-3">
            <div className="flex items-center gap-3">
              <img
                src={prop.freelancer_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(prop.freelancer_name)}&background=6366f1&color=fff`}
                alt={prop.freelancer_name}
                className="w-12 h-12 rounded-2xl object-cover border border-white shadow-sm"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <Link
                    to={`/profile/${prop.freelancer_user_id}`}
                    className="font-bold text-sm text-slate-900 hover:text-brand-600 transition-colors"
                  >
                    {prop.freelancer_name}
                  </Link>
                  <CheckCircle2 size={15} className="text-brand-500 shrink-0" />
                </div>
                <p className="text-xs text-slate-500 line-clamp-1">{prop.freelancer_title}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <StarRating rating={prop.freelancer_rating} size={12} />
                  <span className="text-[11px] text-slate-400">({prop.projects_completed} jobs)</span>
                </div>
              </div>
            </div>

            <div className="flex sm:flex-col items-end justify-between sm:justify-start gap-1">
              <span className="text-base font-extrabold text-slate-900">
                ${parseFloat(prop.bid_amount).toLocaleString()}
              </span>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Clock size={12} /> in {prop.estimated_days} days
              </span>
            </div>
          </div>

          {/* Cover Letter */}
          <p className="text-xs text-slate-700 leading-relaxed bg-slate-50/80 p-3 rounded-xl mb-4 whitespace-pre-line">
            "{prop.cover_letter}"
          </p>

          {/* Action Row */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
              prop.status === 'ACCEPTED'
                ? 'bg-emerald-100 text-emerald-800'
                : prop.status === 'REJECTED'
                ? 'bg-slate-100 text-slate-500'
                : 'bg-amber-50 text-amber-700'
            }`}>
              Status: {prop.status}
            </span>

            <div className="flex items-center gap-2">
              <Link
                to={`/messages?with=${prop.freelancer_user_id || prop.freelancer_id}`}
                className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1"
              >
                <MessageSquare size={13} /> Chat with Freelancer
              </Link>

              {prop.status === 'PENDING' && (
                <button
                  onClick={() => handleAccept(prop.id)}
                  disabled={acceptProposal.isPending}
                  className="btn-primary text-xs py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700"
                >
                  {acceptProposal.isPending ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <>
                      <Check size={13} /> Accept & Hire
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
