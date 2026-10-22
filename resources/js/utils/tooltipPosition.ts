export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

export const fitTooltip = (
  anchor: { top: number; left: number; right: number; bottom: number; width: number; height: number },
  size: { width: number; height: number },
  viewport: { width: number; height: number },
  preferred: TooltipPosition
) => {
  const gap = 8;
  const positions = {
    top: { left: anchor.left + (anchor.width - size.width) / 2, top: anchor.top - size.height - gap },
    bottom: { left: anchor.left + (anchor.width - size.width) / 2, top: anchor.bottom + gap },
    left: { left: anchor.left - size.width - gap, top: anchor.top + (anchor.height - size.height) / 2 },
    right: { left: anchor.right + gap, top: anchor.top + (anchor.height - size.height) / 2 }
  };
  const opposite: Record<TooltipPosition, TooltipPosition> = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' };
  const fits = (point: { left: number; top: number }) => point.left >= gap && point.top >= gap &&
    point.left + size.width <= viewport.width - gap && point.top + size.height <= viewport.height - gap;
  const position = fits(positions[preferred]) ? preferred : fits(positions[opposite[preferred]]) ? opposite[preferred] : preferred;
  return {
    left: Math.max(gap, Math.min(positions[position].left, viewport.width - size.width - gap)),
    top: Math.max(gap, Math.min(positions[position].top, viewport.height - size.height - gap))
  };
};
