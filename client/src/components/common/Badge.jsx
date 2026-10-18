import React from 'react';

export const SkillBadge = ({ skill }) => {
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100/90 text-slate-700 border border-slate-200/60 hover:bg-brand-50 hover:text-brand-600 hover:border-brand-200 transition-colors">
      {skill}
    </span>
  );
};

export const RoleBadge = ({ role }) => {
  if (role === 'client') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/80">
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span> Client
      </span>
    );
  }
  if (role === 'freelancer') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200/80">
        <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span> Freelancer
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
      Admin
    </span>
  );
};

export const AvailabilityBadge = ({ status }) => {
  const isAvailable = status === 'available';
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
      isAvailable 
        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
        : 'bg-amber-50 text-amber-700 border border-amber-200'
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${isAvailable ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
      {isAvailable ? 'Available for work' : 'Currently Busy'}
    </span>
  );
};
