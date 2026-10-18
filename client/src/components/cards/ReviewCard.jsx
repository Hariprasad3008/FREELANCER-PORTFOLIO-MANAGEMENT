import React from 'react';
import { StarRating } from '../common/StarRating.jsx';
import { CheckCircle, Calendar } from 'lucide-react';

export const ReviewCard = ({ review }) => {
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="glass-card rounded-2xl p-5 mb-4">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-3">
          <img
            src={review.client_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.client_name || 'Client')}&background=6366f1&color=fff`}
            alt={review.client_name}
            className="w-10 h-10 rounded-xl object-cover"
          />
          <div>
            <div className="flex items-center gap-1">
              <h5 className="font-semibold text-sm text-slate-900">{review.client_name}</h5>
              <CheckCircle size={14} className="text-emerald-500" title="Verified Client" />
            </div>
            {review.project_title && (
              <p className="text-xs text-brand-600 font-medium line-clamp-1">
                Project: {review.project_title}
              </p>
            )}
          </div>
        </div>

        <div className="text-right">
          <StarRating rating={review.rating} size={14} />
          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 justify-end">
            <Calendar size={11} /> {formatDate(review.created_at)}
          </p>
        </div>
      </div>

      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed italic">
        "{review.comment}"
      </p>
    </div>
  );
};
