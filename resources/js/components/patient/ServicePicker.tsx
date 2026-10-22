import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Check, ChevronLeft, ChevronRight, ClipboardList, Clock, HeartHandshake,
  Info, MapPin, MessageCircle, Search, StickyNote, Video, X
} from 'lucide-react';
import { ConsultationPackage, PackageCategory } from '../../types';
import { calculatePackagePayableAmount } from '../../utils/discounts';
import { Tooltip } from '../common/Tooltip';

const categoryOf = (pkg: ConsultationPackage): PackageCategory => {
  if (pkg.category && ['KONSELING', 'ASESMEN', 'PSIKOTERAPI'].includes(pkg.category)) return pkg.category;
  return pkg.type === 'PSYCHOTHERAPY' ? 'PSIKOTERAPI' : pkg.type === 'BUNDLING_ASSESSMENT' ? 'ASESMEN' : 'KONSELING';
};
const categoryStyles = {
  KONSELING: { label: 'Konseling', icon: MessageCircle, color: 'text-teal-700', surface: 'bg-teal-50', edge: 'border-t-teal-500' },
  ASESMEN: { label: 'Asesmen', icon: ClipboardList, color: 'text-sky-700', surface: 'bg-sky-50', edge: 'border-t-sky-500' },
  PSIKOTERAPI: { label: 'Psikoterapi', icon: HeartHandshake, color: 'text-rose-700', surface: 'bg-rose-50', edge: 'border-t-rose-500' }
};
const categories = [
  { id: 'ALL', label: 'Semua kategori' }, { id: 'KONSELING', label: 'Konseling' },
  { id: 'ASESMEN', label: 'Asesmen' }, { id: 'PSIKOTERAPI', label: 'Psikoterapi' }
];
const PAGE_SIZE = 6;
const money = (amount: number) => `Rp ${amount.toLocaleString('id-ID')}`;

export const ServicePicker: React.FC<{
  packages: ConsultationPackage[];
  selectedId: string;
  onSelect: (id: string) => void;
  disabled?: boolean;
}> = ({ packages, selectedId, onSelect, disabled }) => {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('ALL');
  const [sort, setSort] = useState('name');
  const [page, setPage] = useState(1);
  const [detailId, setDetailId] = useState<string>();
  const [scrollState, setScrollState] = useState({ previous: false, next: false });
  const trackRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const detailTriggerRef = useRef<HTMLButtonElement | null>(null);
  const selected = packages.find(pkg => pkg.id === selectedId);
  const detail = packages.find(pkg => pkg.id === detailId);

  useEffect(() => { setPage(1); }, [query, category, sort]);
  const filtered = useMemo(() => {
    const search = query.trim().toLocaleLowerCase('id');
    return packages.filter(pkg => (category === 'ALL' || categoryOf(pkg) === category) &&
      (!search || `${pkg.name} ${pkg.description} ${pkg.notes || ''}`.toLocaleLowerCase('id').includes(search)))
      .sort((a, b) => sort === 'price'
        ? calculatePackagePayableAmount(a).unitPayableAmount - calculatePackagePayableAmount(b).unitPayableAmount || a.name.localeCompare(b.name, 'id')
        : a.name.localeCompare(b.name, 'id'));
  }, [packages, query, category, sort]);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const activePage = Math.min(page, pages);
  const start = (activePage - 1) * PAGE_SIZE;
  const visiblePackages = filtered.slice(start, start + PAGE_SIZE);
  const visibleIds = visiblePackages.map(pkg => pkg.id).join('|');

  const updateScrollState = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const previous = track.scrollLeft > 2;
    const next = track.scrollLeft + track.clientWidth < track.scrollWidth - 2;
    setScrollState(current => current.previous === previous && current.next === next ? current : { previous, next });
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollLeft = 0;
    updateScrollState();
    const observer = new ResizeObserver(updateScrollState);
    observer.observe(track);
    return () => observer.disconnect();
  }, [activePage, query, category, sort, visibleIds, updateScrollState]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!detail || !dialog) return;
    dialog.showModal();
    return () => {
      dialog.close();
      if (detailTriggerRef.current?.isConnected) detailTriggerRef.current.focus({ preventScroll: true });
    };
  }, [detail?.id]);

  const scrollServices = (direction: number) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: direction * Math.max(track.clientWidth * 0.8, 260),
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  };

  return (
    <section className="min-w-0 max-w-full space-y-4" aria-labelledby="service-picker-title">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
            <HeartHandshake className="h-5 w-5" />
          </div>
          <div>
            <h4 id="service-picker-title" className="text-base font-bold text-slate-900">Pilih Layanan</h4>
            <span className="text-xs text-slate-500">{packages.length} layanan tersedia</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5" aria-label="Navigasi pilihan layanan">
          <Tooltip content="Geser ke layanan sebelumnya">
            <button type="button" disabled={!scrollState.previous} onClick={() => scrollServices(-1)} aria-label="Geser ke layanan sebelumnya" className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-35">
              <ChevronLeft className="h-4 w-4" />
            </button>
          </Tooltip>
          <Tooltip content="Geser ke layanan berikutnya">
            <button type="button" disabled={!scrollState.next} onClick={() => scrollServices(1)} aria-label="Geser ke layanan berikutnya" className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-35">
              <ChevronRight className="h-4 w-4" />
            </button>
          </Tooltip>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_180px_170px]">
        <label className="relative min-w-0 sm:col-span-2 lg:col-span-1">
          <span className="sr-only">Cari layanan</span>
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Cari nama layanan atau catatan..." className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/70 pl-9 pr-9 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500" />
          {query && <button type="button" onClick={() => setQuery('')} title="Hapus pencarian" aria-label="Hapus pencarian" className="absolute right-1 top-1 flex h-8 w-8 items-center justify-center text-slate-500"><X className="h-4 w-4" /></button>}
        </label>
        <select aria-label="Kategori layanan" value={category} onChange={event => setCategory(event.target.value)} className="h-10 w-full min-w-0 rounded-lg border border-slate-200 bg-white px-2 text-xs">
          {categories.map(item => <option key={item.id} value={item.id}>{item.label} ({item.id === 'ALL' ? packages.length : packages.filter(pkg => categoryOf(pkg) === item.id).length})</option>)}
        </select>
        <select aria-label="Urutkan layanan" value={sort} onChange={event => setSort(event.target.value)} className="h-10 w-full min-w-0 rounded-lg border border-slate-200 bg-white px-2 text-xs">
          <option value="name">Nama A-Z</option><option value="price">Harga terendah</option>
        </select>
      </div>

      <div ref={trackRef} role="radiogroup" aria-label="Layanan konsultasi" onScroll={updateScrollState}
        className="custom-scrollbar grid max-w-full grid-flow-col gap-4 overflow-x-auto overscroll-x-contain snap-x snap-mandatory p-1 pb-3"
        style={{ gridAutoColumns: 'minmax(min(100%, 280px), calc((100% - 2rem) / 3))' }}>
        {visiblePackages.map(pkg => {
          const pricing = calculatePackagePayableAmount(pkg);
          const isSelected = pkg.id === selectedId;
          const categoryStyle = categoryStyles[categoryOf(pkg)];
          const CategoryIcon = categoryStyle.icon;
          const online = pkg.type === 'ONLINE_TELE';
          const LocationIcon = online ? Video : MapPin;
          const notes = pkg.notes?.trim();
          return (
            <article key={pkg.id} className={`flex min-w-0 snap-start flex-col overflow-hidden rounded-lg border border-t-[3px] bg-white transition-[border-color,box-shadow] focus-within:ring-2 focus-within:ring-teal-500 ${categoryStyle.edge} ${isSelected ? 'border-teal-600 ring-1 ring-teal-600 shadow-sm' : 'border-slate-200 hover:shadow-sm'} ${disabled ? 'opacity-60' : ''}`}>
              <label className={`flex flex-1 flex-col p-4 ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                <input type="radio" name="consultation-service" aria-label={pkg.name} className="sr-only" checked={isSelected} disabled={disabled} onChange={() => onSelect(pkg.id)}
                  onFocus={event => event.currentTarget.closest('article')?.scrollIntoView({ block: 'nearest', inline: 'nearest' })} />
                <div className="flex items-start justify-between gap-3">
                  <div className={`flex items-center gap-2 text-xs font-semibold ${categoryStyle.color}`}>
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${categoryStyle.surface}`}><CategoryIcon className="h-4 w-4" /></span>
                    {categoryStyle.label}
                  </div>
                  <span aria-hidden="true" className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${isSelected ? 'border-teal-600 bg-teal-600 text-white' : 'border-slate-300 bg-white'}`}>{isSelected && <Check className="h-3 w-3" />}</span>
                </div>
                <h5 className="mt-3 min-h-12 break-words text-base font-bold leading-6 text-slate-900">{pkg.name}</h5>
                <div className="mt-2 flex min-h-6 flex-wrap items-center gap-1.5">
                  {(pricing.discount?.label || pkg.badge) && <span className="max-w-full break-words rounded px-2 py-1 text-[10px] font-semibold bg-slate-100 text-slate-700">{pricing.discount?.label || pkg.badge}</span>}
                  {pkg.type === 'PSYCHOTHERAPY' && <span className="text-[11px] font-medium text-rose-700">Rencana awal 4 sesi</span>}
                </div>
                <div className="mt-3 border-y border-slate-100 py-3">
                  {pricing.discount && <span className="mb-1 block text-xs text-slate-400 line-through">{money(pkg.price)}</span>}
                  <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-1">
                    <strong className="break-words text-xl font-bold text-slate-900">{money(pricing.unitPayableAmount)}</strong>
                    <span className="text-xs text-slate-500">/ {pkg.type === 'PSYCHOTHERAPY' ? 'sesi' : 'layanan'}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1.5 text-[11px] text-slate-600">
                    <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5 shrink-0" />{pkg.durationMinutes} menit</span>
                    <span className="inline-flex items-center gap-1"><LocationIcon className="h-3.5 w-3.5 shrink-0" />{online ? 'Telelayanan' : 'Tatap muka'}</span>
                  </div>
                </div>
                <p className="mt-3 line-clamp-3 min-h-12 break-words text-xs leading-5 text-slate-600">{pkg.description || 'Konsultasi terjadwal bersama psikolog.'}</p>
                {!!pkg.benefits?.length && <ul className="mt-3 space-y-1.5 text-[11px] leading-4 text-slate-600">
                  {pkg.benefits.slice(0, 2).map((benefit, index) => <li key={index} className="flex items-start gap-1.5"><Check className="mt-0.5 h-3 w-3 shrink-0 text-teal-600" /><span className="break-words">{benefit}</span></li>)}
                </ul>}
                <div className={`mt-4 border-t pt-3 text-xs leading-5 ${notes ? 'border-amber-200/70 text-amber-950' : 'border-slate-100 text-slate-500'}`}>
                  <span className={`mb-1 flex items-center gap-1.5 text-[11px] font-bold ${notes ? 'text-amber-800' : 'text-slate-500'}`}><StickyNote className="h-3.5 w-3.5 shrink-0" />Catatan layanan</span>
                  <p className="whitespace-pre-line break-words">{notes || 'Tidak ada catatan tambahan.'}</p>
                </div>
              </label>
              <div className={`flex items-center justify-between gap-2 border-t px-4 py-2 ${isSelected ? 'border-teal-100 bg-teal-50' : 'border-slate-100 bg-slate-50/70'}`}>
                <span className={`flex items-center gap-1.5 text-xs font-semibold ${isSelected ? 'text-teal-800' : 'text-slate-500'}`}>{isSelected && <Check className="h-3.5 w-3.5" />}{isSelected ? 'Layanan dipilih' : 'Belum dipilih'}</span>
                <Tooltip content="Rincian layanan">
                  <button type="button" aria-label={`Rincian ${pkg.name}`} aria-haspopup="dialog" onClick={event => { detailTriggerRef.current = event.currentTarget; setDetailId(pkg.id); }} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-600 hover:bg-white"><Info className="h-4 w-4" /></button>
                </Tooltip>
              </div>
            </article>
          );
        })}
      </div>

      {filtered.length === 0 && <div className="border-y border-dashed border-slate-200 py-8 text-center"><Search className="mx-auto mb-2 h-5 w-5 text-slate-400" /><p className="text-sm text-slate-500">Layanan tidak ditemukan.</p></div>}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
        <span aria-live="polite">{filtered.length > 0 ? `${start + 1}-${Math.min(start + PAGE_SIZE, filtered.length)} dari ${filtered.length} layanan` : '0 layanan'}</span>
        {pages > 1 && <div className="flex items-center gap-2">
          <Tooltip content="Halaman layanan sebelumnya"><button type="button" disabled={activePage === 1} onClick={() => setPage(activePage - 1)} aria-label="Halaman layanan sebelumnya" className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 disabled:opacity-40"><ChevronLeft className="h-4 w-4" /></button></Tooltip>
          <span className="min-w-12 text-center">{activePage} / {pages}</span>
          <Tooltip content="Halaman layanan berikutnya"><button type="button" disabled={activePage === pages} onClick={() => setPage(activePage + 1)} aria-label="Halaman layanan berikutnya" className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 disabled:opacity-40"><ChevronRight className="h-4 w-4" /></button></Tooltip>
        </div>}
      </div>
      {selected && <div className="flex items-start gap-2 border-t border-slate-200 pt-3 text-xs leading-5 text-slate-600"><Check className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" /><p className="min-w-0 break-words">Dipilih: <strong className="text-teal-800">{selected.name}</strong></p></div>}

      {detail && typeof document !== 'undefined' && createPortal(
        <dialog ref={dialogRef} aria-labelledby="service-detail-title" onCancel={() => setDetailId(undefined)} onClose={() => setDetailId(undefined)} onClick={event => { if (event.target === event.currentTarget) setDetailId(undefined); }}
          className="m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-lg border border-slate-200 bg-white p-0 text-slate-900 shadow-xl backdrop:bg-slate-950/55">
          <div>
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 p-5">
              <div className="min-w-0"><span className={`text-xs font-semibold ${categoryStyles[categoryOf(detail)].color}`}>{categoryStyles[categoryOf(detail)].label}</span><h3 id="service-detail-title" className="mt-1 break-words text-lg font-bold">{detail.name}</h3></div>
              <button type="button" autoFocus onClick={() => setDetailId(undefined)} aria-label="Tutup rincian layanan" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-4 p-5 text-sm leading-6">
              <div className="flex flex-wrap items-baseline gap-2"><strong className="text-xl">{money(calculatePackagePayableAmount(detail).unitPayableAmount)}</strong><span className="text-xs text-slate-500">/ {detail.type === 'PSYCHOTHERAPY' ? 'sesi' : 'layanan'}</span><span className="text-xs text-slate-500">{detail.durationMinutes} menit</span></div>
              <p className="whitespace-pre-line break-words text-slate-600">{detail.description}</p>
              {!!detail.benefits?.length && <ul className="space-y-2 text-xs leading-5 text-slate-600">{detail.benefits.map((benefit, index) => <li key={index} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" /><span className="break-words">{benefit}</span></li>)}</ul>}
              <div className="border-t border-slate-200 pt-3 text-xs text-slate-700"><h4 className="mb-1 flex items-center gap-1.5 font-bold"><StickyNote className="h-4 w-4" />Catatan layanan</h4><p className="whitespace-pre-line break-words">{detail.notes?.trim() || 'Tidak ada catatan tambahan.'}</p></div>
            </div>
            <div className="flex justify-end border-t border-slate-100 p-4">
              <button type="button" disabled={disabled} onClick={() => { onSelect(detail.id); setDetailId(undefined); }} className="flex min-h-10 items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50"><Check className="h-4 w-4" />{detail.id === selectedId ? 'Tetap Gunakan Layanan Ini' : 'Pilih Layanan Ini'}</button>
            </div>
          </div>
        </dialog>, document.body
      )}
    </section>
  );
};
