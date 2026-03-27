// LoadingSpinner — full-page and inline spinner component

import React from 'react';

interface Props {
  fullPage?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = { sm: 'h-5 w-5', md: 'h-8 w-8', lg: 'h-12 w-12' };

const LoadingSpinner: React.FC<Props> = ({ fullPage = true, size = 'lg' }) => {
  const spinner = (
    <div
      className={`${sizeMap[size]} animate-spin rounded-full border-4 border-amber-200 border-t-amber-500`}
    />
  );

  if (fullPage) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        {spinner}
      </div>
    );
  }

  return <div className="flex items-center justify-center py-12">{spinner}</div>;
};

export default LoadingSpinner;
