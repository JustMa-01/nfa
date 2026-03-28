import React from 'react';

const SkeletonCard: React.FC = () => (
  <div className="h-137.5 border-4 border-brand-yellow/20 bg-void/50 animate-pulse relative p-8 flex flex-col justify-end">
    <div className="h-4 bg-brand-yellow/10 w-24 mb-4" />
    <div className="h-10 bg-brand-yellow/10 w-full mb-2" />
    <div className="h-10 bg-brand-yellow/10 w-3/4" />
  </div>
);

export const SkeletonGrid: React.FC<{ count?: number }> = ({ count = 6 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
    {Array.from({ length: count }).map((_, i) => <SkeletonCard key={i} />)}
  </div>
);

export default SkeletonCard;