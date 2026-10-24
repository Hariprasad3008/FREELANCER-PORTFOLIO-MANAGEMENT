import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjectMutations } from '../hooks/useProjects.js';
import { Briefcase, IndianRupee, Calendar, Plus, X, ArrowLeft, Loader2 } from 'lucide-react';

const CATEGORIES = [
  'Web Development',
  'Design & Creative',
  'AI & Machine Learning',
  'Mobile Development',
  'DevOps & Cloud',
  'Data Science',
  'Writing & Translation'
];

export const NewProject = () => {
  const navigate = useNavigate();
  const { createProject } = useProjectMutations();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Web Development');
  const [budgetType, setBudgetType] = useState('fixed');
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [deadline, setDeadline] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState(['React', 'Node.js']);
  const [error, setError] = useState('');

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skill) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError('Please provide a project title and detailed description.');
      return;
    }

    try {
      const res = await createProject.mutateAsync({
        title: title.trim(),
        description: description.trim(),
        category,
        budget_type: budgetType,
        budget_min: budgetMin || null,
        budget_max: budgetMax || null,
        required_skills: skills,
        deadline: deadline || null
      });

      if (res.project?.id) {
        navigate(`/projects/${res.project.id}`);
      } else {
        navigate('/projects');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post project.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-2 transition-colors"
        >
          <ArrowLeft size={14} /> Back
        </button>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Post a New Project or Gig
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Reach thousands of top-rated verified freelance specialists ready to start.
        </p>
      </div>

      <div className="glass-card rounded-3xl p-6 sm:p-8">
        {error && (
          <div className="p-4 mb-6 text-sm bg-rose-50 text-rose-600 rounded-2xl border border-rose-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Project Title *
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. Build an AI-Powered Document Search Portal in React & Python"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category *
              </label>
              <select
                className="input-field"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Budget Type
              </label>
              <select
                className="input-field"
                value={budgetType}
                onChange={(e) => setBudgetType(e.target.value)}
              >
                <option value="fixed">Fixed Price</option>
                <option value="hourly">Hourly Rate</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Min Budget (₹)
              </label>
              <input
                type="number"
                className="input-field"
                placeholder={budgetType === 'hourly' ? 'e.g. 500' : 'e.g. 15000'}
                value={budgetMin}
                onChange={(e) => setBudgetMin(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Max Budget (₹)
              </label>
              <input
                type="number"
                className="input-field"
                placeholder={budgetType === 'hourly' ? 'e.g. 1500' : 'e.g. 50000'}
                value={budgetMax}
                onChange={(e) => setBudgetMax(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target Deadline
              </label>
              <input
                type="date"
                className="input-field"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>
          </div>

          {/* Required Skills */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Required Skills & Technologies
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                className="input-field"
                placeholder="Type a required skill (e.g. TypeScript, GraphQL, Docker)..."
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill(e);
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="btn-secondary text-xs px-4"
              >
                <Plus size={14} /> Add
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {skills.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="text-brand-400 hover:text-brand-800"
                  >
                    <X size={13} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Detailed Description *
            </label>
            <textarea
              className="input-field min-h-[160px] resize-y"
              placeholder="Outline project objectives, key deliverable milestones, communication expectations, and required tech stack in detail..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn-secondary text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createProject.isPending}
              className="btn-primary text-xs py-2.5 px-6"
            >
              {createProject.isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Publishing Gig...
                </>
              ) : (
                'Publish Project'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
