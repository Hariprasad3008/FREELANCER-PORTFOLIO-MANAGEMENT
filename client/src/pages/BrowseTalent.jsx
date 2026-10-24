import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTalent } from '../hooks/useTalent.js';
import { FreelancerCard } from '../components/cards/FreelancerCard.jsx';
import { CardSkeleton } from '../components/common/LoadingSkeleton.jsx';
import { EmptyState } from '../components/common/EmptyState.jsx';
import {
  Search,
  SlidersHorizontal,
  RotateCcw,
  Users,
  Filter,
  IndianRupee,
  Award,
  Clock
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'Web Development',
  'Design & Creative',
  'AI & Machine Learning',
  'Mobile Development',
  'DevOps & Cloud'
];

export const BrowseTalent = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [experience, setExperience] = useState(searchParams.get('experience') || 'All');
  const [availability, setAvailability] = useState(searchParams.get('availability') || 'All');
  const [minRate, setMinRate] = useState(searchParams.get('minRate') || '');
  const [maxRate, setMaxRate] = useState(searchParams.get('maxRate') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'rating_desc');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Sync state with URL params
  useEffect(() => {
    const params = {};
    if (search) params.search = search;
    if (category !== 'All') params.category = category;
    if (experience !== 'All') params.experience = experience;
    if (availability !== 'All') params.availability = availability;
    if (minRate) params.minRate = minRate;
    if (maxRate) params.maxRate = maxRate;
    if (sort !== 'rating_desc') params.sort = sort;
    setSearchParams(params);
  }, [search, category, experience, availability, minRate, maxRate, sort, setSearchParams]);

  const { data, isLoading } = useTalent({
    search,
    category,
    experience,
    availability,
    minRate,
    maxRate,
    sort
  });

  const handleResetFilters = () => {
    setSearch('');
    setCategory('All');
    setExperience('All');
    setAvailability('All');
    setMinRate('');
    setMaxRate('');
    setSort('rating_desc');
  };

  const freelancers = data?.freelancers || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Browse Verified Freelancers
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Explore {freelancers.length} expert developers, designers, and AI engineers available for hire.
        </p>
      </div>

      {/* Top Search & Filter Bar */}
      <div className="glass-card rounded-2xl p-4 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        {/* Search */}
        <div className="relative w-full md:w-96">
          <input
            type="text"
            className="input-field pl-10"
            placeholder="Search by name, skill, or keyword..."
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

        {/* Sort & Mobile Filter toggle */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="input-field text-xs py-2 w-auto"
          >
            <option value="rating_desc">Highest Rated</option>
            <option value="rate_asc">Rate: Low to High</option>
            <option value="rate_desc">Rate: High to Low</option>
            <option value="projects_desc">Most Projects</option>
          </select>

          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="md:hidden btn-secondary text-xs py-2 px-3 flex items-center gap-1"
          >
            <SlidersHorizontal size={14} /> Filters
          </button>
        </div>
      </div>

      {/* Main Content Layout (Sidebar + Results) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <div className={`lg:block ${showMobileFilters ? 'block' : 'hidden'} lg:col-span-1 space-y-6`}>
          <div className="glass-card rounded-2xl p-5 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Filter size={14} className="text-brand-600" /> Filter Talent
              </span>
              <button
                onClick={handleResetFilters}
                className="text-xs text-brand-600 hover:text-brand-700 flex items-center gap-1 font-medium"
              >
                <RotateCcw size={12} /> Reset
              </button>
            </div>

            {/* Experience Level */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Experience Level
              </label>
              <div className="space-y-1.5">
                {['All', 'Beginner', 'Intermediate', 'Expert'].map((exp) => (
                  <label key={exp} className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                    <input
                      type="radio"
                      name="experience"
                      checked={experience === exp}
                      onChange={() => setExperience(exp)}
                      className="text-brand-600 focus:ring-brand-500 rounded"
                    />
                    {exp}
                  </label>
                ))}
              </div>
            </div>

            {/* Availability */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Availability
              </label>
              <div className="space-y-1.5">
                {['All', 'available', 'busy'].map((status) => (
                  <label key={status} className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer capitalize">
                    <input
                      type="radio"
                      name="availability"
                      checked={availability === status}
                      onChange={() => setAvailability(status)}
                      className="text-brand-600 focus:ring-brand-500 rounded"
                    />
                    {status === 'All' ? 'All Statuses' : status === 'available' ? 'Available now' : 'Currently Busy'}
                  </label>
                ))}
              </div>
            </div>

            {/* Hourly Rate Range */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Hourly Rate (₹/hr)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min ₹"
                  value={minRate}
                  onChange={(e) => setMinRate(e.target.value)}
                  className="input-field text-xs py-1.5"
                />
                <span className="text-slate-400 text-xs">-</span>
                <input
                  type="number"
                  placeholder="Max ₹"
                  value={maxRate}
                  onChange={(e) => setMaxRate(e.target.value)}
                  className="input-field text-xs py-1.5"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Results Grid */}
        <div className="lg:col-span-3">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : freelancers.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No freelancers match your criteria"
              description="Try adjusting your filter settings or search terms to explore more profiles."
              actionLabel="Reset All Filters"
              onAction={handleResetFilters}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {freelancers.map((freelancer) => (
                <FreelancerCard key={freelancer.id} freelancer={freelancer} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
