import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClients } from '../hooks/useTalent.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useMessageMutations } from '../hooks/useMessages.js';
import { CardSkeleton } from '../components/common/LoadingSkeleton.jsx';
import { EmptyState } from '../components/common/EmptyState.jsx';
import { StarRating } from '../components/common/StarRating.jsx';
import { Building2, MapPin, Briefcase, MessageSquare, Search, CheckCircle2 } from 'lucide-react';

export const BrowseClients = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { data, isLoading } = useClients();
  const { createConversation } = useMessageMutations();

  const [search, setSearch] = useState('');

  const clients = data?.clients?.filter((c) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      c.full_name?.toLowerCase().includes(term) ||
      c.title?.toLowerCase().includes(term) ||
      c.bio?.toLowerCase().includes(term) ||
      c.category?.toLowerCase().includes(term)
    );
  }) || [];

  const handleStartChat = async (clientId) => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    try {
      const res = await createConversation.mutateAsync(clientId);
      if (res.conversation_id) {
        navigate(`/messages?conv=${res.conversation_id}`);
      }
    } catch (err) {
      console.error('Failed to start chat with client:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Browse Verified Clients & Companies
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Discover top clients hiring freelancers for ongoing and milestone projects.
        </p>
      </div>

      {/* Search */}
      <div className="glass-card rounded-2xl p-4 mb-8 max-w-md">
        <div className="relative">
          <input
            type="text"
            className="input-field pl-10"
            placeholder="Search clients by name, industry, or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search size={18} className="absolute left-3.5 top-3 text-slate-400" />
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : clients.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No clients found"
          description="Try modifying your search criteria to discover clients."
          actionLabel="Clear Search"
          onAction={() => setSearch('')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients.map((client) => (
            <div key={client.id} className="glass-card-hover rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3.5 mb-4">
                  <img
                    src={client.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(client.full_name)}&background=6366f1&color=fff`}
                    alt={client.full_name}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-sm"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-slate-900">{client.full_name}</h4>
                      <CheckCircle2 size={16} className="text-brand-500 shrink-0" />
                    </div>
                    <p className="text-xs text-slate-500 font-medium line-clamp-1">{client.title}</p>
                    {client.location && (
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin size={12} /> {client.location}
                      </p>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-600 line-clamp-3 mb-5 leading-relaxed">
                  {client.bio || 'Active employer hiring talent across technology, creative, and business disciplines.'}
                </p>

                <div className="grid grid-cols-2 gap-2 py-3 px-3 bg-slate-50 rounded-xl mb-4 border border-slate-100 text-center">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Jobs Posted</span>
                    <span className="text-sm font-bold text-brand-600 flex items-center justify-center gap-1">
                      <Briefcase size={13} /> {client.total_projects_posted}
                    </span>
                  </div>
                  <div className="border-l border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Client Rating</span>
                    <div className="flex items-center justify-center gap-1 mt-0.5">
                      <StarRating rating={client.rating} size={12} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                {user?.id !== client.id && (
                  <button
                    onClick={() => handleStartChat(client.id)}
                    className="w-full btn-primary text-xs py-2"
                  >
                    <MessageSquare size={14} /> Message Client
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
