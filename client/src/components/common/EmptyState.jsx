import React from 'react';
import { Search } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = Search,
  title = 'No items found',
  description = 'Try adjusting your search query or filter parameters to find what you are looking for.',
  actionLabel,
  onAction,
}) => {
  return (
    <div className="text-center py-16 px-6 glass-card rounded-2xl max-w-lg mx-auto my-8">
      <div className="w-16 h-16 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-brand-100">
        <Icon size={28} />
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 mb-6 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <button onClick={onAction} className="btn-primary">
          {actionLabel}
        </button>
      )}
    </div>
  );
};
