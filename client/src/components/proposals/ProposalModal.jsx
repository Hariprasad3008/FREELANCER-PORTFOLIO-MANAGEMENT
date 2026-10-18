import React, { useState } from 'react';
import { Modal } from '../common/Modal.jsx';
import { useProposalMutations } from '../../hooks/useProposals.js';
import { DollarSign, Clock, Send, Loader2 } from 'lucide-react';

export const ProposalModal = ({ isOpen, onClose, project }) => {
  const [bidAmount, setBidAmount] = useState('');
  const [estimatedDays, setEstimatedDays] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [error, setError] = useState('');

  const { submitProposal } = useProposalMutations();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!bidAmount || !estimatedDays) {
      setError('Please provide bid amount and estimated days.');
      return;
    }

    try {
      await submitProposal.mutateAsync({
        project_id: project.id,
        bid_amount: bidAmount,
        estimated_days: estimatedDays,
        cover_letter: coverLetter.trim()
      });

      setBidAmount('');
      setEstimatedDays('');
      setCoverLetter('');
      setError('');
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit proposal.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Submit Proposal for "${project?.title}"`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-xs bg-rose-50 text-rose-600 rounded-xl border border-rose-200">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Your Bid Amount ($) *
            </label>
            <div className="relative">
              <input
                type="number"
                step="1"
                className="input-field pl-9"
                placeholder="e.g. 4500"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                required
              />
              <DollarSign size={16} className="absolute left-3 top-3 text-slate-400" />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Client Budget: ${project?.budget_min || '0'} - ${project?.budget_max || '0'}
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Estimated Delivery Time (Days) *
            </label>
            <div className="relative">
              <input
                type="number"
                step="1"
                className="input-field pl-9"
                placeholder="e.g. 14"
                value={estimatedDays}
                onChange={(e) => setEstimatedDays(e.target.value)}
                required
              />
              <Clock size={16} className="absolute left-3 top-3 text-slate-400" />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Cover Letter & Proposed Solution *
          </label>
          <textarea
            className="input-field min-h-[140px] resize-y"
            placeholder="Describe your relevant experience, architecture approach, milestone breakdown, and why you are the best fit for this project..."
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            required
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button type="button" onClick={onClose} className="btn-secondary text-xs">
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitProposal.isPending}
            className="btn-primary text-xs"
          >
            {submitProposal.isPending ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Submitting...
              </>
            ) : (
              <>
                <Send size={14} /> Send Proposal
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
