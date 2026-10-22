import React, { useState, useRef, useEffect, useLayoutEffect, useCallback, useId } from 'react';
import { createPortal } from 'react-dom';
import { fitTooltip, TooltipPosition } from '../../utils/tooltipPosition';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: TooltipPosition;
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children, position = 'top', className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState<{ left: number; top: number } | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const id = useId();
  const updatePosition = useCallback(() => {
    if (!triggerRef.current || !tooltipRef.current) return;
    setCoords(fitTooltip(triggerRef.current.getBoundingClientRect(), tooltipRef.current.getBoundingClientRect(),
      { width: document.documentElement.clientWidth, height: window.innerHeight }, position));
  }, [position]);

  useLayoutEffect(() => {
    if (isVisible) updatePosition();
  }, [isVisible, content, updatePosition]);

  useEffect(() => {
    if (!isVisible) return;
    const dismiss = (event: KeyboardEvent) => { if (event.key === 'Escape') setIsVisible(false); };
    window.addEventListener('scroll', updatePosition, { passive: true, capture: true });
    window.addEventListener('resize', updatePosition);
    window.addEventListener('keydown', dismiss);
    return () => {
      window.removeEventListener('scroll', updatePosition, { capture: true });
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('keydown', dismiss);
    };
  }, [isVisible, updatePosition]);

  const hide = () => { setIsVisible(false); setCoords(null); };
  return (
    <div ref={triggerRef} onMouseEnter={() => setIsVisible(true)} onMouseLeave={hide}
      onFocus={() => setIsVisible(true)} onBlur={hide} aria-describedby={isVisible ? id : undefined}
      className={`inline-flex items-center justify-center ${className}`}>
      {children}
      {isVisible && typeof document !== 'undefined' && createPortal(
        <div id={id} ref={tooltipRef} role="tooltip" style={{ position: 'fixed', top: coords?.top ?? 0,
          left: coords?.left ?? 0, visibility: coords ? 'visible' : 'hidden', zIndex: 999999 }}
          className="pointer-events-none w-max max-w-[min(18rem,calc(100vw-1rem))] whitespace-normal break-words rounded-lg border border-slate-700/50 bg-slate-900/95 px-2.5 py-1.5 text-[11px] font-semibold leading-4 text-white shadow-xl">
          {content}
        </div>, document.body
      )}
    </div>
  );
};
