interface RevealOptions {
  targets?: (element: Element) => Element[];
  duration?: number;
  stagger?: number;
  offset?: number;
  threshold?: number;
}

/** Mulai sekali saat terlihat, bukan saat komponen masih berada di luar layar. */
export function revealWhenVisible(elements: Element | Element[], options: RevealOptions = {}): () => void {
  if (typeof IntersectionObserver === 'undefined') return () => {};
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (motion.matches) return () => {};
  const animations = new Set<Animation>();
  let disposed = false;
  const pending = new Set(Array.isArray(elements) ? elements : [elements]);
  const observer = new IntersectionObserver(entries => {
    if (disposed) return;
    for (const entry of entries) {
      if (!entry.isIntersecting || !pending.has(entry.target)) continue;
      pending.delete(entry.target);
      observer.unobserve(entry.target);
      if (motion.matches) continue;
      const targets = options.targets?.(entry.target) ?? [entry.target];
      targets.forEach((target, index) => {
        if (typeof target.animate !== 'function') return;
        const animation = target.animate([
          {opacity: 0.4, transform: `translateY(${options.offset ?? 16}px)`},
          {opacity: 1, transform: 'translateY(0)'},
        ], {
          duration: options.duration ?? 600,
          delay: index * (options.stagger ?? 0),
          easing: 'cubic-bezier(0.22,0.61,0.36,1)',
          fill: 'backwards',
        });
        animations.add(animation);
        animation.onfinish = () => animations.delete(animation);
      });
    }
  }, {threshold: options.threshold ?? 0.12});
  pending.forEach(element => observer.observe(element));
  return () => {
    disposed = true;
    observer.disconnect();
    animations.forEach(animation => animation.cancel());
    animations.clear();
  };
}
