import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

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
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();

    let top = 0;
    let left = 0;
    const offset = 8;

    switch (position) {
      case 'top':
        top = rect.top - offset;
        left = rect.left + rect.width / 2;
        break;
      case 'bottom':
        top = rect.bottom + offset;
        left = rect.left + rect.width / 2;
        break;
      case 'left':
        top = rect.top + rect.height / 2;
        left = rect.left - offset;
        break;
      case 'right':
        top = rect.top + rect.height / 2;
        left = rect.right + offset;
        break;
    }

    setCoords({ top, left });
  }, [position]);

  const showTooltip = () => {
    updatePosition();
    setIsVisible(true);
  };

  const hideTooltip = () => {
    setIsVisible(false);
  };

  useEffect(() => {
    if (isVisible) {
      const handleScrollOrResize = () => {
        updatePosition();
      };
      window.addEventListener('scroll', handleScrollOrResize, { passive: true, capture: true });
      window.addEventListener('resize', handleScrollOrResize, { passive: true });
      return () => {
        window.removeEventListener('scroll', handleScrollOrResize, { capture: true });
        window.removeEventListener('resize', handleScrollOrResize);
      };
    }
  }, [isVisible, updatePosition]);

  const getTransform = () => {
    switch (position) {
      case 'top':
        return 'translate(-50%, -100%)';
      case 'bottom':
        return 'translate(-50%, 0)';
      case 'left':
        return 'translate(-100%, -50%)';
      case 'right':
        return 'translate(0, -50%)';
    }
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-x-4 border-x-transparent border-t-4 border-t-slate-900 border-b-0',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-x-4 border-x-transparent border-b-4 border-b-slate-900 border-t-0',
    left: 'left-full top-1/2 -translate-y-1/2 border-y-4 border-y-transparent border-l-4 border-l-slate-900 border-r-0',
    right: 'right-full top-1/2 -translate-y-1/2 border-y-4 border-y-transparent border-r-4 border-r-slate-900 border-l-0'
  };

  return (
    <div
      ref={triggerRef}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
      className={`inline-flex items-center justify-center ${className}`}
    >
      {children}
      {isVisible && typeof document !== 'undefined' && createPortal(
        <div
          role="tooltip"
          style={{
            position: 'fixed',
            top: `${coords.top}px`,
            left: `${coords.left}px`,
            transform: getTransform(),
            zIndex: 999999
          }}
          className="pointer-events-none whitespace-nowrap px-2.5 py-1 text-[11px] font-semibold text-white bg-slate-900/95 backdrop-blur-xs rounded-lg shadow-xl border border-slate-700/50 animate-in fade-in zoom-in-95 duration-100"
        >
          {content}
          <div className={`absolute w-0 h-0 ${arrowClasses[position]}`} />
        </div>,
        document.body
      )}
    </div>
  );
};
