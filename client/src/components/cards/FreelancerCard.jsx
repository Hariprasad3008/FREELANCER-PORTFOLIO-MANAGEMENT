import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { StarRating } from '../common/StarRating.jsx';
import { SkillBadge, AvailabilityBadge } from '../common/Badge.jsx';
import { MapPin, Briefcase, Bookmark, MessageSquare, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useSavedMutations, useSavedIds } from '../../hooks/useSaved.js';
import { useMessageMutations } from '../../hooks/useMessages.js';

export const FreelancerCard = ({ freelancer }) => {
  const navigate = useNavigate();
  const { user, isAuthenticated, onlineUsers } = useAuth();
  const { data: savedData } = useSavedIds();
  const { toggleSavedProfile } = useSavedMutations();
  const { createConversation } = useMessageMutations();

  const isSaved = savedData?.savedProfileIds?.includes(freelancer.id);
  const isOnline = onlineUsers?.includes(freelancer.id);

  const handleBookmark = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    toggleSavedProfile.mutate(freelancer.id);
  };

  const handleStartChat = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    try {
      const res = await createConversation.mutateAsync(freelancer.id);
      if (res.conversation_id) {
        navigate(`/messages?conv=${res.conversation_id}`);
      }
    } catch (err) {
      console.error('Failed to create conversation:', err);
    }
  };

  return (
    <div className="glass-card-hover rounded-2xl p-6 flex flex-col justify-between relative group">
      {/* Header Info */}
      <div>
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <img
                src={freelancer.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(freelancer.full_name)}&background=6366f1&color=fff`}
                alt={freelancer.full_name}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-sm"
              />
              {isOnline && (
                <span
                  title="Online Now"
                  className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"
                />
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                  {freelancer.full_name}
                </h4>
                <CheckCircle2 size={16} className="text-brand-500 shrink-0" />
              </div>
              <p className="text-xs text-slate-500 font-medium line-clamp-1">{freelancer.title}</p>
              {freelancer.location && (
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                  <MapPin size={12} /> {freelancer.location}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handleBookmark}
            title={isSaved ? 'Remove Bookmark' : 'Save Freelancer'}
            className={`p-2 rounded-xl transition-all ${
              isSaved
                ? 'bg-amber-50 text-amber-500 border border-amber-200'
                : 'bg-slate-100 text-slate-400 hover:text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Bookmark size={18} className={isSaved ? 'fill-amber-500' : ''} />
          </button>
        </div>

        {/* Bio Snippet */}
        <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
          {freelancer.bio || 'Experienced freelancer specializing in delivering high-quality client solutions.'}
        </p>

        {/* Key Metrics */}
        <div className="grid grid-cols-3 gap-2 py-3 px-3 bg-slate-50/80 rounded-xl mb-4 border border-slate-100 text-center">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Rate</span>
            <span className="text-sm font-bold text-slate-900">₹{freelancer.hourly_rate}/hr</span>
          </div>
          <div className="border-x border-slate-200/60">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Rating</span>
            <div className="flex items-center justify-center gap-1 mt-0.5">
              <StarRating rating={freelancer.rating} size={12} />
            </div>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Jobs</span>
            <span className="text-sm font-bold text-slate-900">{freelancer.projects_completed}</span>
          </div>
        </div>

        {/* Skills Tags */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {freelancer.skills?.slice(0, 4).map((skill, i) => (
            <SkillBadge key={i} skill={skill} />
          ))}
          {freelancer.skills?.length > 4 && (
            <span className="text-xs text-slate-400 self-center font-medium">
              +{freelancer.skills.length - 4}
            </span>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
        {user?.id !== freelancer.id && (
          <button
            onClick={handleStartChat}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-brand-600 hover:bg-brand-50 hover:border-brand-200 transition-colors"
            title="Send Message"
          >
            <MessageSquare size={16} />
          </button>
        )}
        <Link
          to={`/profile/${freelancer.id}`}
          className="flex-1 btn-secondary text-xs py-2 justify-center group-hover:btn-primary transition-all"
        >
          View Profile <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
};
