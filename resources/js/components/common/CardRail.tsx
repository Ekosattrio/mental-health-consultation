import {Children, useCallback, useEffect, useId, useRef, useState, type CSSProperties, type ReactNode} from 'react';
import {ChevronLeft, ChevronRight, Pause, Play} from 'lucide-react';
import {cardsPerRailPage,railPagination} from '../../utils/cardRail';
import {revealWhenVisible} from '../../utils/revealMotion';

interface CardRailProps {
  label: string;
  children: ReactNode;
  autoPlaySeconds?: number;
}

/** Satu baris kartu dengan scroll native: swipe, trackpad, tombol dan keyboard. */
export function CardRail({label, children, autoPlaySeconds}: CardRailProps) {
  const id = useId();
  const trackRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const previousWidth = useRef(0);
  const [perPage, setPerPage] = useState(1);
  const [page, setPage] = useState(0);
  const [paused, setPaused] = useState(false);
  const items = Children.toArray(children);
  const count = items.length;
  const pagination = railPagination(count, perPage, page);
  const pageCount = pagination.pages;
  const activePage = pagination.page;

  const measure = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    setPage(Math.max(0, Math.min(pageCount - 1, Math.round(track.scrollLeft / Math.max(1, track.clientWidth)))));
  }, [pageCount]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const resize = () => {
      const width=track.clientWidth;
      if(previousWidth.current && width!==previousWidth.current && cardsPerRailPage(width)===cardsPerRailPage(previousWidth.current)){
        track.scrollLeft=Math.round(track.scrollLeft/previousWidth.current)*width;
      }
      previousWidth.current=width;
      setPerPage(cardsPerRailPage(width));
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(track);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (trackRef.current) trackRef.current.scrollLeft = 0;
    setPage(0);
  }, [count, perPage]);

  useEffect(()=>{
    const track=trackRef.current;
    if(!track)return;
    // Reveal hanya saat rail masuk layar. Pergantian halaman memakai scroll native
    // tanpa memulai fade/gerakan vertikal baru di tengah pergeseran horizontal.
    return revealWhenVisible(track,{
      targets:()=>{
        const visiblePage=Math.round(track.scrollLeft/Math.max(1,track.clientWidth));
        return Array.from(track.children[visiblePage]?.children??[]);
      },
      stagger:45,duration:560,offset:12,threshold:0,
    });
  },[perPage]);

  const move = useCallback((direction: number, automatic = false) => {
    const track = trackRef.current;
    if (!track) return;
    const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
    const current = Math.round(track.scrollLeft / Math.max(1, track.clientWidth));
    const target = automatic && current >= pageCount - 1 ? 0 : Math.max(0, Math.min(pageCount - 1, current + direction));
    track.scrollTo({left: target * track.clientWidth, behavior});
  }, [pageCount]);

  useEffect(() => {
    if (!autoPlaySeconds || paused || pageCount < 2) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const timer = window.setInterval(() => {
      const root = rootRef.current;
      if (!root || motion.matches || document.hidden || root.matches(':hover') || root.contains(document.activeElement)) return;
      const bounds = root.getBoundingClientRect();
      if (bounds.top < window.innerHeight && bounds.bottom > 0) move(1, true);
    }, Math.max(2, autoPlaySeconds) * 1000);
    return () => window.clearInterval(timer);
  }, [autoPlaySeconds, pageCount, move, paused]);

  return <div ref={rootRef} className="flex min-w-0 max-w-full flex-col gap-3" role="region" aria-roledescription="carousel" aria-label={label}>
    <div id={id} ref={trackRef} tabIndex={0} aria-label={`${label}. Gunakan panah kiri atau kanan untuk menggeser.`}
      onScroll={measure} onKeyDown={event => {
        if (event.target !== event.currentTarget) return;
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
          event.preventDefault(); move(event.key === 'ArrowRight' ? 1 : -1);
        } else if (event.key === 'Home' || event.key === 'End') {
          event.preventDefault(); trackRef.current?.scrollTo({left: event.key === 'Home' ? 0 : trackRef.current.scrollWidth});
        }
      }} style={{'--rail-columns': perPage} as CSSProperties} className="card-rail custom-scrollbar order-2 rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600">
      {Array.from({length: pageCount}, (_, index) => <div key={index} className="card-rail__page" role="group" aria-label={`Halaman ${index + 1} dari ${pageCount}`} aria-hidden={index !== activePage} inert={index !== activePage}>
        {items.slice(index * perPage, (index + 1) * perPage)}
      </div>)}
    </div>
    <div className="order-1 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
      <div className="min-w-0 space-y-0.5">
        <p className="font-semibold text-slate-700">{count ? `Menampilkan ${pagination.first}–${pagination.last} dari ${count}` : 'Belum ada item'}</p>
        <p>Halaman {activePage + 1} / {pageCount}</p>
        {count > 1 && <p>Geser kartu atau gunakan tombol panah.</p>}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {!!autoPlaySeconds && pageCount > 1 && <button type="button" onClick={() => setPaused(value => !value)} aria-label={`${paused ? 'Putar' : 'Jeda'} pergeseran otomatis ${label}`} aria-pressed={paused}
          className="ui-press flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50">
          {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
        </button>}
        {pageCount > 1 && <>
          <button type="button" onClick={() => move(-1)} disabled={activePage === 0} aria-controls={id} aria-label={`${label} sebelumnya`}
            className="ui-press flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-35"><ChevronLeft className="h-5 w-5" /></button>
          <button type="button" onClick={() => move(1)} disabled={activePage === pageCount - 1} aria-controls={id} aria-label={`${label} berikutnya`}
            className="ui-press flex h-11 w-11 items-center justify-center rounded-xl bg-teal-700 text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-35"><ChevronRight className="h-5 w-5" /></button>
        </>}
      </div>
    </div>
  </div>;
}
