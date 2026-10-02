import React from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  className = ''
}) => {
  const positionClasses = {
    top: 'bottom-full mb-2 left-1/2 -translate-x-1/2',
    bottom: 'top-full mt-2 left-1/2 -translate-x-1/2',
    left: 'right-full mr-2 top-1/2 -translate-y-1/2',
    right: 'left-full ml-2 top-1/2 -translate-y-1/2'
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-x-4 border-x-transparent border-t-4 border-t-slate-900/95 border-b-0',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-x-4 border-x-transparent border-b-4 border-b-slate-900/95 border-t-0',
    left: 'left-full top-1/2 -translate-y-1/2 border-y-4 border-y-transparent border-l-4 border-l-slate-900/95 border-r-0',
    right: 'right-full top-1/2 -translate-y-1/2 border-y-4 border-y-transparent border-r-4 border-r-slate-900/95 border-l-0'
  };

  return (
    <div className={`relative inline-flex items-center justify-center group ${className}`}>
      {children}
      <div
        role="tooltip"
        className={`absolute z-[100] pointer-events-none whitespace-nowrap px-2.5 py-1 text-[11px] font-semibold text-white bg-slate-900/95 backdrop-blur-xs rounded-lg shadow-xl border border-slate-700/40 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-all duration-150 scale-95 group-hover:scale-100 ${positionClasses[position]}`}
      >
        {content}
        <div className={`absolute w-0 h-0 ${arrowClasses[position]}`} />
      </div>
    </div>
  );
};
