import React from 'react';

const LoadingSpinner: React.FC<{ fullPage?: boolean }> = ({ fullPage = true }) => {
  const content = (
    <div className="flex flex-col items-center gap-6">
      <div className="w-16 h-16 border-4 border-brand-yellow border-t-brand-red rounded-full animate-spin" />
      <span className="font-mono text-[10px] font-black tracking-[0.3em] text-brand-yellow uppercase animate-pulse">
        INITIALIZING_SYSTEM...
      </span>
    </div>
  );

  if (fullPage) return <div className="fixed inset-0 bg-void z-200 flex items-center justify-center">{content}</div>;
  return <div className="py-20 flex justify-center">{content}</div>;
};

export default LoadingSpinner;