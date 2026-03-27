// SkeletonCard — loading placeholder for package grid

import React from 'react';

const SkeletonCard: React.FC = () => (
  <div className="bg-slate-900 rounded-2xl overflow-hidden border border-white/5 animate-pulse">
    <div className="h-52 bg-slate-800" />
    <div className="p-5 space-y-3">
      <div className="h-5 bg-slate-800 rounded-lg w-3/4" />
      <div className="h-4 bg-slate-800 rounded-lg w-full" />
      <div className="h-4 bg-slate-800 rounded-lg w-2/3" />
      <div className="h-10 bg-slate-800 rounded-xl mt-4" />
    </div>
  </div>
);

export const SkeletonGrid: React.FC<{ count?: number }> = ({ count = 6 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: count }).map((_, i) => <SkeletonCard key={i} />)}
  </div>
);

export default SkeletonCard;
