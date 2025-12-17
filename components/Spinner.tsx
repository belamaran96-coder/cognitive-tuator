import React from 'react';

export const Spinner = ({ label }: { label?: string }) => (
  <div className="flex flex-col items-center justify-center space-y-4">
    <div className="relative w-16 h-16">
      <div className="absolute top-0 left-0 w-full h-full border-4 border-brand-900 rounded-full opacity-30"></div>
      <div className="absolute top-0 left-0 w-full h-full border-4 border-brand-500 rounded-full border-t-transparent animate-spin"></div>
    </div>
    {label && <p className="text-brand-100 font-mono animate-pulse">{label}</p>}
  </div>
);