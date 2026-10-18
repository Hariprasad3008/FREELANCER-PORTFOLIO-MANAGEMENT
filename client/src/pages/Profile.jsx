import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useProfile, useProfileMutations } from '../hooks/useProfile.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useMessageMutations } from '../hooks/useMessages.js';
import { useSavedMutations, useSavedIds } from '../hooks/useSaved.js';
import { SkillBadge, RoleBadge, AvailabilityBadge } from '../components/common/Badge.jsx';
import { StarRating } from '../components/common/StarRating.jsx';
import { ReviewCard } from '../components/cards/ReviewCard.jsx';
import { PortfolioGrid } from '../components/portfolio/PortfolioGrid.jsx';
import { Modal } from '../components/common/Modal.jsx';
import { ProjectCard } from '../components/cards/ProjectCard.jsx';
import {
  MapPin,
  Mail,
  Calendar,
  DollarSign,
  Briefcase,
  CheckCircle,
  MessageSquare,
  Bookmark,
  Edit,
  Star,
  Award,
  Plus,
  Loader2
} from 'lucide-react';

export const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, onlineUsers, isClient } = useAuth();

  const { data, isLoading, error } = useProfile(id);
  const { createConversation } = useMessageMutations();
  const { data: savedData } = useSavedIds();
  const { toggleSavedProfile } = useSavedMutations();
  const { addReview } = useProfileMutations();

  const [activeTab, setActiveTab] = useState('portfolio');
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewError, setReviewError] = useState('');

  const profile = data?.profile;
  const isOwner = user?.id === profile?.id;
  const isOnline = onlineUsers?.includes(profile?.id);
  const isSaved = savedData?.savedProfileIds?.includes(profile?.id);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-2xl mx-auto my-16 p-8 glass-card rounded-2xl text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Profile Not Found</h2>
        <p className="text-slate-500 text-sm mb-6">The requested user profile does not exist or has been removed.</p>
        <Link to="/talent" className="btn-primary">
          Back to Talent Directory
        </Link>
      </div>
    );
  }

  const handleStartChat = async () => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    try {
      const res = await createConversation.mutateAsync(profile.id);
      if (res.conversation_id) {
        navigate(`/messages?conv=${res.conversation_id}`);
      }
    } catch (err) {
      console.error('Failed to create conversation:', err);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) {
      setReviewError('Please provide a review comment.');
      return;
    }
    try {
      await addReview.mutateAsync({
        freelancer_id: profile.id,
        rating: reviewRating,
        comment: reviewComment.trim()
      });
      setIsReviewOpen(false);
      setReviewComment('');
      setReviewRating(5);
      setReviewError('');
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to submit review.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* 1. Profile Hero Banner */}
      <div className="glass-card rounded-3xl overflow-hidden mb-8 shadow-sm border border-slate-200/80">
        {/* Cover gradient */}
        <div className="h-36 sm:h-48 bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-700 relative"></div>

        {/* Profile Info Row */}
        <div className="px-6 sm:px-10 pb-8 relative -mt-16 sm:-mt-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            {/* Avatar & Main Info */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left">
              <div className="relative">
                <img
                  src={profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name)}&background=6366f1&color=fff`}
                  alt={profile.full_name}
                  className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover border-4 border-white shadow-lg bg-white"
                />
                {isOnline && (
                  <span
                    title="Online Now"
                    className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full animate-pulse"
                  />
                )}
              </div>

              <div>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                    {profile.full_name}
                  </h1>
                  <CheckCircle size={20} className="text-brand-500 shrink-0" />
                  <RoleBadge role={profile.role} />
                </div>

                <p className="text-sm font-semibold text-brand-600 mb-1">
                  {profile.title || (profile.role === 'freelancer' ? 'Professional Freelancer' : 'Hiring Client')}
                </p>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-500">
                  {profile.location && (
                    <span className="flex items-center gap-1">
                      <MapPin size={13} className="text-slate-400" /> {profile.location}
                    </span>
                  )}
                  {profile.role === 'freelancer' && (
                    <AvailabilityBadge status={profile.availability_status} />
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center sm:justify-end gap-3 pt-4 sm:pt-0">
              {isOwner ? (
                <Link to="/edit-profile" className="btn-secondary text-xs">
                  <Edit size={14} /> Edit Profile
                </Link>
              ) : (
                <>
                  {profile.role === 'freelancer' && (
                    <button
                      onClick={() => toggleSavedProfile.mutate(profile.id)}
                      className={`p-2.5 rounded-xl border transition-colors ${
                        isSaved
                          ? 'bg-amber-50 text-amber-500 border-amber-200'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                      title={isSaved ? 'Remove Bookmark' : 'Save Freelancer'}
                    >
                      <Bookmark size={18} className={isSaved ? 'fill-amber-500' : ''} />
                    </button>
                  )}

                  <button onClick={handleStartChat} className="btn-primary text-xs py-2.5 px-4">
                    <MessageSquare size={16} /> Send Message
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Key Metrics Strip (Freelancers) */}
          {profile.role === 'freelancer' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-100 text-center">
              <div className="p-3 rounded-2xl bg-slate-50">
                <span className="text-xs text-slate-400 font-semibold uppercase block">Hourly Rate</span>
                <span className="text-xl font-bold text-slate-900">${profile.hourly_rate} / hr</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50">
                <span className="text-xs text-slate-400 font-semibold uppercase block">Client Rating</span>
                <div className="flex items-center justify-center gap-1.5 mt-0.5">
                  <StarRating rating={profile.rating} size={14} />
                  <span className="text-xs text-slate-400">({profile.reviews?.length || 0})</span>
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50">
                <span className="text-xs text-slate-400 font-semibold uppercase block">Jobs Completed</span>
                <span className="text-xl font-bold text-slate-900">{profile.projects_completed}</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50">
                <span className="text-xs text-slate-400 font-semibold uppercase block">Success Rate</span>
                <span className="text-xl font-bold text-emerald-600">{profile.success_rate}%</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Main Profile Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col: Bio & Skills */}
        <div className="lg:col-span-1 space-y-6">
          {/* Bio */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-base font-bold text-slate-900 mb-3">About</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {profile.bio || 'No biography provided yet.'}
            </p>
          </div>

          {/* Skills */}
          {profile.skills && profile.skills.length > 0 && (
            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-base font-bold text-slate-900 mb-3">Skills & Expertise</h3>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill, index) => (
                  <SkillBadge key={index} skill={skill} />
                ))}
              </div>
            </div>
          )}

          {/* Category & Experience Details */}
          <div className="glass-card rounded-2xl p-6 space-y-3">
            <h3 className="text-base font-bold text-slate-900 mb-3">Professional Overview</h3>
            <div className="flex justify-between text-xs py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Primary Domain</span>
              <span className="font-semibold text-slate-800">{profile.category || 'General'}</span>
            </div>
            <div className="flex justify-between text-xs py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Experience Level</span>
              <span className="font-semibold text-slate-800">{profile.experience_level || 'Intermediate'}</span>
            </div>
            <div className="flex justify-between text-xs py-1.5">
              <span className="text-slate-500">Member Since</span>
              <span className="font-semibold text-slate-800">
                {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>

        {/* Right Col: Tabbed Content (Portfolio / Reviews / Projects) */}
        <div className="lg:col-span-2">
          {profile.role === 'freelancer' ? (
            <div>
              {/* Tabs */}
              <div className="flex items-center gap-4 border-b border-slate-200 mb-6">
                <button
                  onClick={() => setActiveTab('portfolio')}
                  className={`pb-3 text-sm font-bold transition-colors relative ${
                    activeTab === 'portfolio'
                      ? 'text-brand-600 border-b-2 border-brand-600'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Portfolio Projects ({profile.portfolio?.length || 0})
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`pb-3 text-sm font-bold transition-colors relative ${
                    activeTab === 'reviews'
                      ? 'text-brand-600 border-b-2 border-brand-600'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Verified Reviews ({profile.reviews?.length || 0})
                </button>
              </div>

              {/* Tab 1: Portfolio */}
              {activeTab === 'portfolio' && (
                <PortfolioGrid items={profile.portfolio} isOwner={isOwner} />
              )}

              {/* Tab 2: Reviews */}
              {activeTab === 'reviews' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-slate-900">
                      Client Reviews ({profile.reviews?.length || 0})
                    </h3>
                    {isAuthenticated && !isOwner && isClient && (
                      <button
                        onClick={() => setIsReviewOpen(true)}
                        className="btn-primary text-xs py-2 px-3"
                      >
                        <Star size={14} /> Write a Review
                      </button>
                    )}
                  </div>

                  {profile.reviews?.length === 0 ? (
                    <div className="text-center py-12 px-4 glass-card rounded-2xl">
                      <p className="text-sm text-slate-500 mb-4">No client reviews yet.</p>
                      {isAuthenticated && !isOwner && isClient && (
                        <button onClick={() => setIsReviewOpen(true)} className="btn-outline-brand text-xs">
                          Be the first to review {profile.full_name}
                        </button>
                      )}
                    </div>
                  ) : (
                    profile.reviews.map((rev) => (
                      <ReviewCard key={rev.id} review={rev} />
                    ))
                  )}
                </div>
              )}
            </div>
          ) : (
            // Client Posted Projects
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-6">
                Projects Posted by {profile.full_name} ({profile.projects?.length || 0})
              </h3>
              {profile.projects?.length === 0 ? (
                <div className="text-center py-12 px-4 glass-card rounded-2xl">
                  <p className="text-sm text-slate-500">No active projects currently listed.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {profile.projects.map((proj) => (
                    <ProjectCard
                      key={proj.id}
                      project={{
                        ...proj,
                        client_name: profile.full_name,
                        client_avatar: profile.avatar_url,
                        client_rating: profile.rating
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      <Modal isOpen={isReviewOpen} onClose={() => setIsReviewOpen(false)} title={`Review ${profile.full_name}`}>
        <form onSubmit={handleReviewSubmit} className="space-y-4">
          {reviewError && (
            <div className="p-3 text-xs bg-rose-50 text-rose-600 rounded-xl border border-rose-200">
              {reviewError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Overall Rating
            </label>
            <StarRating
              rating={reviewRating}
              interactive={true}
              size={24}
              onChange={(newRating) => setReviewRating(newRating)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Your Feedback & Experience *
            </label>
            <textarea
              className="input-field min-h-[120px]"
              placeholder="Detail the freelancer's communication, timeliness, and quality of work..."
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={() => setIsReviewOpen(false)} className="btn-secondary text-xs">
              Cancel
            </button>
            <button type="submit" disabled={addReview.isPending} className="btn-primary text-xs">
              {addReview.isPending ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Submitting...
                </>
              ) : (
                'Submit Verified Review'
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
