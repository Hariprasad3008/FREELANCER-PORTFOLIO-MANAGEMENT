import React, { useState } from 'react';
import { Modal } from '../common/Modal.jsx';
import { useProfileMutations } from '../../hooks/useProfile.js';
import { Image, Link2, Tag, Plus, Loader2 } from 'lucide-react';

export const PortfolioModal = ({ isOpen, onClose }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [projectUrl, setProjectUrl] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState(['React', 'Tailwind CSS']);
  const [error, setError] = useState('');

  const { addPortfolioItem } = useProfileMutations();

  const handleAddTag = (e) => {
    e.preventDefault();
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a project title.');
      return;
    }

    try {
      await addPortfolioItem.mutateAsync({
        title: title.trim(),
        description: description.trim(),
        image_url: imageUrl.trim() || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=80',
        project_url: projectUrl.trim(),
        tags
      });
      // Reset form
      setTitle('');
      setDescription('');
      setImageUrl('');
      setProjectUrl('');
      setTags(['React']);
      setError('');
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add portfolio item.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Portfolio Project">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-xs bg-rose-50 text-rose-600 rounded-xl border border-rose-200">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Project Title *
          </label>
          <input
            type="text"
            className="input-field"
            placeholder="e.g. AI-Powered Workflow Canvas"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Description
          </label>
          <textarea
            className="input-field min-h-[90px] resize-y"
            placeholder="Describe the problem, technologies used, and outcomes achieved..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Image URL (Unsplash / CDN)
            </label>
            <div className="relative">
              <input
                type="url"
                className="input-field pl-9"
                placeholder="https://images.unsplash.com/..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
              <Image size={16} className="absolute left-3 top-3 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Live Demo or GitHub URL
            </label>
            <div className="relative">
              <input
                type="url"
                className="input-field pl-9"
                placeholder="https://github.com/yourname/project"
                value={projectUrl}
                onChange={(e) => setProjectUrl(e.target.value)}
              />
              <Link2 size={16} className="absolute left-3 top-3 text-slate-400" />
            </div>
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Technologies & Tags
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              className="input-field"
              placeholder="e.g. Node.js, WebSockets, Figma"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag(e);
                }
              }}
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="btn-secondary text-xs px-3"
            >
              <Plus size={14} /> Add
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-brand-50 text-brand-700 border border-brand-200"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="text-brand-400 hover:text-brand-700 ml-1"
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button type="button" onClick={onClose} className="btn-secondary text-xs">
            Cancel
          </button>
          <button
            type="submit"
            disabled={addPortfolioItem.isPending}
            className="btn-primary text-xs"
          >
            {addPortfolioItem.isPending ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Saving...
              </>
            ) : (
              'Save Project'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
