import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useProjects, useMyProjects } from '../hooks/useProjects.js';
import { ProjectCard } from '../components/cards/ProjectCard.jsx';
import { CardSkeleton } from '../components/common/LoadingSkeleton.jsx';
import { EmptyState } from '../components/common/EmptyState.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import {
  Search,
  Briefcase,
  SlidersHorizontal,
  RotateCcw,
  PlusCircle,
  Filter,
  Users,
  FolderGit2
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'Web Development',
  'Design & Creative',
  'AI & Machine Learning',
  'Mobile Development',
  'DevOps & Cloud'
];

export const BrowseProjects = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isClient, isAuthenticated } = useAuth();

  const [viewMode, setViewMode] = useState(
    searchParams.get('filter') === 'mine' || searchParams.get('tab') === 'mine' ? 'mine' : 'all'
  );
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [budgetType, setBudgetType] = useState(searchParams.get('budgetType') || 'All');
  const [minBudget, setMinBudget] = useState(searchParams.get('minBudget') || '');
  const [maxBudget, setMaxBudget] = useState(searchParams.get('maxBudget') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // My projects query for logged in clients
  const { data: myProjectsData, isLoading: isMyProjectsLoading } = useMyProjects();
  const myProjects = myProjectsData?.projects || [];
  const totalProposalsReceived = myProjects.reduce((acc, p) => acc + (parseInt(p.proposals_count, 10) || 0), 0);

  useEffect(() => {
    if (searchParams.get('filter') === 'mine' || searchParams.get('tab') === 'mine') {
      setViewMode('mine');
    }
  }, [searchParams]);

  useEffect(() => {
    const params = {};
    if (viewMode === 'mine') params.filter = 'mine';
    if (search) params.search = search;
    if (category !== 'All') params.category = category;
    if (budgetType !== 'All') params.budgetType = budgetType;
    if (minBudget) params.minBudget = minBudget;
    if (maxBudget) params.maxBudget = maxBudget;
    if (sort !== 'newest') params.sort = sort;
    setSearchParams(params);
  }, [viewMode, search, category, budgetType, minBudget, maxBudget, sort, setSearchParams]);

  const { data, isLoading } = useProjects({
    search,
    category,
    budgetType,
    minBudget,
    maxBudget,
    sort,
    status: 'open'
  });

  const handleReset = () => {
    setSearch('');
    setCategory('All');
    setBudgetType('All');
    setMinBudget('');
    setMaxBudget('');
    setSort('newest');
  };

  const allProjects = data?.projects || [];
  const projects = viewMode === 'mine' ? myProjects : allProjects;
  const currentLoading = viewMode === 'mine' ? isMyProjectsLoading : isLoading;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Header with Post Job CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {viewMode === 'mine' ? 'My Posted Jobs & Proposals' : 'Explore Open Gigs & Projects'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {viewMode === 'mine'
              ? `You have ${myProjects.length} posted listings with ${totalProposalsReceived} total candidate proposals received.`
              : `Browse ${allProjects.length} exciting open contracts and fixed-price gigs from verified clients.`}
          </p>
        </div>

        {isClient && (
          <Link to="/post-project" className="btn-primary self-start sm:self-auto text-xs py-2.5">
            <PlusCircle size={16} /> Post a Project
          </Link>
        )}
      </div>

      {/* Role-Based Tabs for Clients */}
      {isClient && (
        <div className="flex items-center gap-3 mb-6 border-b border-slate-200">
          <button
            onClick={() => setViewMode('all')}
            className={`pb-3 text-sm font-bold transition-all flex items-center gap-2 ${
              viewMode === 'all'
                ? 'text-brand-600 border-b-2 border-brand-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Briefcase size={16} /> All Marketplace Gigs
          </button>
          <button
            onClick={() => setViewMode('mine')}
            className={`pb-3 text-sm font-bold transition-all flex items-center gap-2 ${
              viewMode === 'mine'
                ? 'text-brand-600 border-b-2 border-brand-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <FolderGit2 size={16} /> My Posted Jobs ({myProjects.length})
            {totalProposalsReceived > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700">
                {totalProposalsReceived} Proposals
              </span>
            )}
          </button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="glass-card rounded-2xl p-4 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        {/* Search */}
        <div className="relative w-full md:w-96">
          <input
            type="text"
            className="input-field pl-10"
            placeholder="Search projects by title, skill, or keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search size={18} className="absolute left-3.5 top-3 text-slate-400" />
        </div>

        {/* Categories Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full pb-1 md:pb-0 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                category === cat
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Sort & Mobile Filters */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="input-field text-xs py-2 w-auto"
          >
            <option value="newest">Newest First</option>
            <option value="budget_desc">Highest Budget</option>
            <option value="budget_asc">Lowest Budget</option>
            <option value="deadline_soon">Deadline Soon</option>
          </select>

          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="md:hidden btn-secondary text-xs py-2 px-3 flex items-center gap-1"
          >
            <SlidersHorizontal size={14} /> Filters
          </button>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <div className={`lg:block ${showMobileFilters ? 'block' : 'hidden'} lg:col-span-1 space-y-6`}>
          <div className="glass-card rounded-2xl p-5 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Filter size={14} className="text-brand-600" /> Filter Projects
              </span>
              <button
                onClick={handleReset}
                className="text-xs text-brand-600 hover:text-brand-700 flex items-center gap-1 font-medium"
              >
                <RotateCcw size={12} /> Reset
              </button>
            </div>

            {/* Budget Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Budget Type
              </label>
              <div className="space-y-1.5">
                {['All', 'fixed', 'hourly'].map((type) => (
                  <label key={type} className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer capitalize">
                    <input
                      type="radio"
                      name="budgetType"
                      checked={budgetType === type}
                      onChange={() => setBudgetType(type)}
                      className="text-brand-600 focus:ring-brand-500 rounded"
                    />
                    {type === 'All' ? 'All Types' : `${type} Price`}
                  </label>
                ))}
              </div>
            </div>

            {/* Budget Range */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Budget Range (₹)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min ₹"
                  value={minBudget}
                  onChange={(e) => setMinBudget(e.target.value)}
                  className="input-field text-xs py-1.5"
                />
                <span className="text-slate-400 text-xs">-</span>
                <input
                  type="number"
                  placeholder="Max ₹"
                  value={maxBudget}
                  onChange={(e) => setMaxBudget(e.target.value)}
                  className="input-field text-xs py-1.5"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Projects Cards List */}
        <div className="lg:col-span-3">
          {currentLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : projects.length === 0 ? (
            <EmptyState
              icon={Briefcase}
              title={viewMode === 'mine' ? "You haven't posted any jobs yet" : "No open projects match your filters"}
              description={
                viewMode === 'mine'
                  ? "Post your first project listing to receive proposals and hire top freelancers."
                  : "Try adjusting your budget filters or search terms to see more available projects."
              }
              actionLabel={viewMode === 'mine' ? "Post a Project" : "Reset All Filters"}
              onAction={viewMode === 'mine' ? () => window.location.href = '/post-project' : handleReset}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
