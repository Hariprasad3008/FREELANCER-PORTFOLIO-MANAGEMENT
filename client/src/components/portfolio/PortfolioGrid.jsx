import React, { useState } from 'react';
import { ExternalLink, Trash2, Tag, Plus, Eye } from 'lucide-react';
import { useProfileMutations } from '../../hooks/useProfile.js';
import { PortfolioModal } from './PortfolioModal.jsx';

export const PortfolioGrid = ({ items = [], isOwner = false }) => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState(null);
  const { deletePortfolioItem } = useProfileMutations();

  const handleDelete = (e, id) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this portfolio project?')) {
      deletePortfolioItem.mutate(id);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-slate-900">Featured Portfolio ({items.length})</h3>
        {isOwner && (
          <button
            onClick={() => setIsAddOpen(true)}
            className="btn-primary text-xs py-2 px-3"
          >
            <Plus size={14} /> Add Project
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12 px-4 glass-card rounded-2xl">
          <p className="text-sm text-slate-500 mb-4">No portfolio items uploaded yet.</p>
          {isOwner && (
            <button
              onClick={() => setIsAddOpen(true)}
              className="btn-outline-brand text-xs"
            >
              <Plus size={14} /> Add your first project
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              onClick={() => setPreviewItem(item)}
              className="glass-card-hover rounded-2xl overflow-hidden flex flex-col justify-between group cursor-pointer"
            >
              <div>
                <div className="relative h-48 bg-slate-100 overflow-hidden">
                  <img
                    src={item.image_url || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=80'}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <span className="text-white text-xs font-semibold flex items-center gap-1">
                      <Eye size={14} /> Quick View
                    </span>
                  </div>
                  {isOwner && (
                    <button
                      onClick={(e) => handleDelete(e, item.id)}
                      className="absolute top-3 right-3 p-2 bg-white/90 text-rose-600 hover:bg-rose-50 rounded-xl shadow-md transition-colors"
                      title="Delete Item"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                <div className="p-5">
                  <h4 className="font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-1 mb-1.5">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
                    {item.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5">
                    {item.tags?.map((tag, i) => (
                      <span key={i} className="text-[11px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {item.project_url && (
                <div className="px-5 pb-4 pt-1 flex justify-end">
                  <a
                    href={item.project_url}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                  >
                    Live Project <ExternalLink size={12} />
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Portfolio Modal */}
      {isOwner && (
        <PortfolioModal
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
        />
      )}

      {/* View Portfolio Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setPreviewItem(null)} />
          <div className="relative w-full max-w-2xl glass-card rounded-2xl overflow-hidden z-10 shadow-2xl animate-slide-up">
            <img
              src={previewItem.image_url}
              alt={previewItem.title}
              className="w-full h-64 object-cover"
            />
            <div className="p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-2">{previewItem.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">{previewItem.description}</p>
              <div className="flex flex-wrap gap-1.5 mb-6">
                {previewItem.tags?.map((tag, i) => (
                  <span key={i} className="text-xs font-medium bg-brand-50 text-brand-700 px-2.5 py-1 rounded-lg">
                    #{tag}
                  </span>
                ))}
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button onClick={() => setPreviewItem(null)} className="btn-secondary text-xs">
                  Close
                </button>
                {previewItem.project_url && (
                  <a
                    href={previewItem.project_url}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-primary text-xs"
                  >
                    Visit Live Demo <ExternalLink size={14} />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
