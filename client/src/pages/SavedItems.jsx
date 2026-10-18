import React, { useState } from 'react';
import { useSavedProfiles, useSavedProjects } from '../hooks/useSaved.js';
import { FreelancerCard } from '../components/cards/FreelancerCard.jsx';
import { ProjectCard } from '../components/cards/ProjectCard.jsx';
import { CardSkeleton } from '../components/common/LoadingSkeleton.jsx';
import { EmptyState } from '../components/common/EmptyState.jsx';
import { Bookmark, Users, Briefcase } from 'lucide-react';

export const SavedItems = () => {
  const [activeTab, setActiveTab] = useState('talent');

  const { data: profilesData, isLoading: profilesLoading } = useSavedProfiles();
  const { data: projectsData, isLoading: projectsLoading } = useSavedProjects();

  const savedFreelancers = profilesData?.saved_profiles || [];
  const savedProjects = projectsData?.saved_projects || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <Bookmark size={28} className="text-amber-500 fill-amber-500" /> Bookmarked Items
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Quickly access your shortlisted freelancers and saved project opportunities.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-slate-200 mb-8">
        <button
          onClick={() => setActiveTab('talent')}
          className={`pb-3 text-sm font-bold transition-colors flex items-center gap-2 ${
            activeTab === 'talent'
              ? 'text-brand-600 border-b-2 border-brand-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users size={16} /> Saved Freelancers ({savedFreelancers.length})
        </button>
        <button
          onClick={() => setActiveTab('projects')}
          className={`pb-3 text-sm font-bold transition-colors flex items-center gap-2 ${
            activeTab === 'projects'
              ? 'text-brand-600 border-b-2 border-brand-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Briefcase size={16} /> Saved Gigs ({savedProjects.length})
        </button>
      </div>

      {/* Tab 1: Saved Freelancers */}
      {activeTab === 'talent' && (
        <div>
          {profilesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : savedFreelancers.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No saved freelancers yet"
              description="Browse top rated freelancers and click the bookmark icon on their card to save them here."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedFreelancers.map((freelancer) => (
                <FreelancerCard key={freelancer.id} freelancer={freelancer} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Saved Projects */}
      {activeTab === 'projects' && (
        <div>
          {projectsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : savedProjects.length === 0 ? (
            <EmptyState
              icon={Briefcase}
              title="No saved projects yet"
              description="Explore open gigs and save the ones you are interested in applying to."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
