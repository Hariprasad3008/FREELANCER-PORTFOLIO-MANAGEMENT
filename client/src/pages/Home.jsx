import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useTalent } from '../hooks/useTalent.js';
import { useProjects } from '../hooks/useProjects.js';
import { FreelancerCard } from '../components/cards/FreelancerCard.jsx';
import { ProjectCard } from '../components/cards/ProjectCard.jsx';
import { CardSkeleton } from '../components/common/LoadingSkeleton.jsx';
import {
  Search,
  ArrowRight,
  Sparkles,
  Code,
  Palette,
  Brain,
  Smartphone,
  Cloud,
  ShieldCheck,
  Zap,
  MessageSquare,
  Users,
  CheckCircle,
  PlusCircle,
  Edit3,
  FolderGit2
} from 'lucide-react';

const CATEGORIES = [
  { name: 'Web Development', icon: Code, count: '120+ Experts', color: 'from-blue-500/10 to-indigo-500/10 text-indigo-600' },
  { name: 'Design & Creative', icon: Palette, count: '85+ Designers', color: 'from-purple-500/10 to-pink-500/10 text-purple-600' },
  { name: 'AI & Machine Learning', icon: Brain, count: '45+ Specialists', color: 'from-emerald-500/10 to-teal-500/10 text-emerald-600' },
  { name: 'Mobile Development', icon: Smartphone, count: '60+ Engineers', color: 'from-amber-500/10 to-orange-500/10 text-amber-600' },
  { name: 'DevOps & Cloud', icon: Cloud, count: '50+ Architects', color: 'from-sky-500/10 to-cyan-500/10 text-sky-600' },
];

export const Home = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isClient } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: talentData, isLoading: talentLoading } = useTalent({ sort: 'rating_desc' });
  const { data: projectData, isLoading: projectLoading } = useProjects({ sort: 'newest' });

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/talent?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const topFreelancers = talentData?.freelancers?.slice(0, 3) || [];
  const recentProjects = projectData?.projects?.slice(0, 3) || [];

  const companyDisplayName = user?.company_name || user?.full_name || user?.name || 'Company';
  const freelancerDisplayName = user?.full_name || user?.name || 'Freelancer';

  return (
    <div className="space-y-20 pb-16">
      {/* 1. Small Glass Welcome Bar (Role-Based, Visible When Logged In) */}
      {isAuthenticated && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          {isClient ? (
            /* Client Small Glass Welcome */
            <div className="glass-card rounded-2xl p-3.5 sm:p-4 border border-indigo-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/90 backdrop-blur-md animate-fadeIn">
              <div className="flex items-center gap-3">
                <img
                  src={user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(companyDisplayName)}&background=4f46e5&color=fff`}
                  alt={companyDisplayName}
                  className="w-10 h-10 rounded-xl object-cover border border-indigo-300 shadow-sm shrink-0"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm sm:text-base font-extrabold text-slate-900">
                      Welcome back, {companyDisplayName}!
                    </h2>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      Client Portal
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {user?.location || 'San Francisco, CA'} &bull; Hiring & Project Workspace
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0 self-start sm:self-auto">
                <Link to="/post-project" className="btn-primary text-xs py-1.5 px-3.5">
                  <PlusCircle size={13} /> Post a Job
                </Link>
                <Link to="/projects?filter=mine" className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5">
                  <FolderGit2 size={13} className="text-indigo-600" /> My Jobs & Proposals
                </Link>
                <Link to="/talent" className="btn-secondary text-xs py-1.5 px-3">
                  <Users size={13} /> Find Talent
                </Link>
              </div>
            </div>
          ) : (
            /* Freelancer Small Glass Welcome */
            <div className="glass-card rounded-2xl p-3.5 sm:p-4 border border-purple-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/90 backdrop-blur-md animate-fadeIn">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(freelancerDisplayName)}&background=8b5cf6&color=fff`}
                    alt={freelancerDisplayName}
                    className="w-10 h-10 rounded-xl object-cover border border-purple-300 shadow-sm shrink-0"
                  />
                  <span
                    className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white"
                    title="Available for Work"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm sm:text-base font-extrabold text-slate-900">
                      Welcome back, {freelancerDisplayName}!
                    </h2>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                      Freelancer
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {user?.title || 'Professional Specialist'} &bull; <span className="font-semibold text-slate-700">${user?.hourly_rate || 0}/hr</span> &bull; {user?.location || 'Remote'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                <Link to="/projects" className="btn-primary text-xs py-1.5 px-3.5">
                  <Search size={13} /> Find Gigs
                </Link>
                <Link to="/edit-profile" className="btn-secondary text-xs py-1.5 px-3">
                  <Edit3 size={13} /> Edit Profile
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. Hero Section */}
      <section className="relative pt-6 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Decorative background glows */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-brand-300/20 via-purple-200/20 to-emerald-200/20 blur-3xl -z-10 rounded-full pointer-events-none"></div>

        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 border border-brand-200 shadow-sm mb-6 animate-fade-in">
            <Sparkles size={14} className="text-brand-600 animate-pulse" />
            <span className="text-xs font-semibold bg-gradient-to-r from-brand-700 to-indigo-700 bg-clip-text text-transparent">
              Connecting Top 1% Global Talent with Visionary Clients
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15] mb-6">
            Hire verified experts or find your next <span className="bg-gradient-to-r from-brand-600 to-indigo-600 bg-clip-text text-transparent">dream project</span>.
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            A production-ready marketplace powered by real-time Socket.IO chat, Supabase database persistence, portfolio showcases, and verified client ratings.
          </p>

          {/* Hero Search Box */}
          <form
            onSubmit={handleSearchSubmit}
            className="max-w-3xl mx-auto glass-panel p-2 rounded-2xl flex flex-col sm:flex-row gap-2 shadow-xl border border-slate-200/80 mb-6"
          >
            <div className="flex-1 flex items-center gap-3 px-4 py-2.5">
              <Search size={20} className="text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Search skills (e.g. React, UI/UX, Python, AWS, Mobile)..."
                className="w-full bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-primary text-sm py-3 px-6">
              Search Talent
            </button>
          </form>

          {/* Popular Search Tags */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500">
            <span className="font-semibold text-slate-700">Popular:</span>
            {['React', 'Figma', 'Python LLMs', 'Tailwind', 'DevOps', 'Mobile'].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => navigate(`/talent?search=${encodeURIComponent(tag)}`)}
                className="px-2.5 py-1 rounded-lg bg-white/70 hover:bg-white border border-slate-200/80 text-slate-600 transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto mt-16 pt-8 border-t border-slate-200/60">
            <div>
              <span className="text-3xl font-extrabold text-slate-900 block">500+</span>
              <span className="text-xs text-slate-500 font-medium">Verified Freelancers</span>
            </div>
            <div>
              <span className="text-3xl font-extrabold text-brand-600 block">99.4%</span>
              <span className="text-xs text-slate-500 font-medium">Project Success Rate</span>
            </div>
            <div>
              <span className="text-3xl font-extrabold text-slate-900 block">$2.5M+</span>
              <span className="text-xs text-slate-500 font-medium">Earned by Talent</span>
            </div>
            <div>
              <span className="text-3xl font-extrabold text-emerald-600 block">&lt; 15 min</span>
              <span className="text-xs text-slate-500 font-medium">Average Match Time</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">Explore Disciplines</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">Browse by Category</h2>
          </div>
          <Link
            to="/talent"
            className="text-xs sm:text-sm font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            View all categories <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.name}
                onClick={() => navigate(`/talent?category=${encodeURIComponent(cat.name)}`)}
                className="glass-card-hover p-6 rounded-2xl cursor-pointer flex flex-col justify-between group"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${cat.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon size={22} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 group-hover:text-brand-600 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">{cat.count}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Featured Freelancers */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">Top Rated</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">Featured Elite Talent</h2>
          </div>
          <Link
            to="/talent"
            className="btn-secondary text-xs py-2 px-3.5"
          >
            Browse All Talent <ArrowRight size={14} />
          </Link>
        </div>

        {talentLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {topFreelancers.map((freelancer) => (
              <FreelancerCard key={freelancer.id} freelancer={freelancer} />
            ))}
          </div>
        )}
      </section>

      {/* 5. Recent Client Projects */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">Opportunities</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">Latest Open Gigs & Projects</h2>
          </div>
          <Link
            to="/projects"
            className="btn-secondary text-xs py-2 px-3.5"
          >
            Explore All Projects <ArrowRight size={14} />
          </Link>
        </div>

        {projectLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </section>

      {/* 6. Features / Trust Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-card rounded-3xl p-8 sm:p-12 border border-slate-200/80">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">Why Choose Us</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
              Engineered for seamless collaboration
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-white/60 border border-slate-100 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <MessageSquare size={22} />
              </div>
              <h3 className="font-bold text-slate-900 text-lg">Real-Time Messaging</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Connect instantly with online presence tracking, typing indicators, and isolated rooms powered by Socket.IO.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/60 border border-slate-100 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <ShieldCheck size={22} />
              </div>
              <h3 className="font-bold text-slate-900 text-lg">Verified Reviews</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Authentic, verified client feedback and rating algorithms ensure you only work with proven professionals.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/60 border border-slate-100 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Zap size={22} />
              </div>
              <h3 className="font-bold text-slate-900 text-lg">Supabase PostgreSQL</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Enterprise-grade data security with connection pooling, transactional integrity, and sub-millisecond query latency.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Bottom CTA Banner (Shown ONLY Before Login) */}
      {!isAuthenticated && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-brand-950 to-indigo-950 text-white p-8 sm:p-14 relative overflow-hidden shadow-2xl">
            <div className="relative z-10 max-w-2xl">
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
                Ready to supercharge your project or career?
              </h2>
              <p className="text-slate-300 text-sm sm:text-base mb-8 leading-relaxed">
                Join hundreds of high-growth companies and elite independent freelancers building the future on TalentVerse.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <Link to="/auth?mode=register&role=client" className="btn-primary">
                  Hire Talent Now
                </Link>
                <Link to="/auth?mode=register&role=freelancer" className="btn-secondary">
                  Apply as Freelancer
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
