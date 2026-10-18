import React from 'react';

export const CardSkeleton = () => {
  return (
    <div className="glass-card rounded-2xl p-6 animate-pulse">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-14 h-14 bg-slate-200 rounded-2xl"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-slate-200 rounded w-1/3"></div>
          <div className="h-3 bg-slate-200 rounded w-1/2"></div>
        </div>
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-3 bg-slate-200 rounded w-full"></div>
        <div className="h-3 bg-slate-200 rounded w-4/5"></div>
      </div>
      <div className="flex gap-2 mb-6">
        <div className="h-6 bg-slate-200 rounded-lg w-16"></div>
        <div className="h-6 bg-slate-200 rounded-lg w-20"></div>
        <div className="h-6 bg-slate-200 rounded-lg w-14"></div>
      </div>
      <div className="h-10 bg-slate-200 rounded-xl w-full"></div>
    </div>
  );
};

export const GridSkeleton = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <CardSkeleton key={index} />
      ))}
    </div>
  );
};
