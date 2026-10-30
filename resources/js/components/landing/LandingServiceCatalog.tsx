import {useDeferredValue, useMemo, useState} from 'react';
import {ArrowRight, CheckCircle2, ClipboardCheck, Clock, Lock, Search, Sparkles, StickyNote, Users, X} from 'lucide-react';
import {CardRail} from '../common/CardRail';
import type {LandingViewData} from './LandingPageView';

const categories = [
  {id: 'ALL', label: 'Semua layanan'},
  {id: 'KONSELING', label: 'Konseling'},
  {id: 'ASESMEN', label: 'Asesmen'},
  {id: 'PSIKOTERAPI', label: 'Psikoterapi'},
] as const;
const styles = {
  KONSELING: {icon: Users, color: 'bg-teal-50 text-teal-700', edge: 'border-t-teal-500'},
  ASESMEN: {icon: ClipboardCheck, color: 'bg-sky-50 text-sky-700', edge: 'border-t-sky-500'},
  PSIKOTERAPI: {icon: Sparkles, color: 'bg-violet-50 text-violet-700', edge: 'border-t-violet-500'},
};

export function LandingServiceCatalog({packages, currentUser, currentRole, onBook}: Pick<LandingViewData, 'packages' | 'currentUser' | 'currentRole'> & {onBook: (id: string) => void}) {
  const [category, setCategory] = useState<string>('ALL');
  const [query, setQuery] = useState('');
  const active = useMemo(() => packages.filter(pkg => pkg.isActive !== false), [packages]);
  const search = useDeferredValue(query.trim().toLocaleLowerCase('id'));
  const indexed = useMemo(()=>active.map(pkg=>({pkg,searchText:`${pkg.name} ${pkg.description} ${pkg.notes || ''}`.toLocaleLowerCase('id')})),[active]);
  const counts = useMemo(()=>active.reduce<Record<string,number>>((result,pkg)=>{if(pkg.category)result[pkg.category]=(result[pkg.category]||0)+1;return result;},{}),[active]);
  const displayed = useMemo(()=>indexed.filter(row=>(category==='ALL'||row.pkg.category===category)&&(!search||row.searchText.includes(search))).map(row=>row.pkg),[indexed,category,search]);

  return <div className="min-w-0 space-y-5" aria-busy={query.trim().toLocaleLowerCase('id')!==search}>
    <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="min-w-0 overflow-x-auto pb-1 custom-scrollbar" role="group" aria-label="Kategori layanan publik">
        <div className="flex w-max gap-2">
          {categories.map(item => <button key={item.id} type="button" aria-pressed={category === item.id} onClick={() => setCategory(item.id)}
            className={`ui-press min-h-11 shrink-0 rounded-xl border px-4 py-2 text-xs font-bold transition-colors ${category === item.id ? 'border-teal-700 bg-teal-700 text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-teal-300'}`}>
            {item.label} <span className="ml-1 opacity-75">{item.id === 'ALL' ? active.length : counts[item.id] || 0}</span>
          </button>)}
        </div>
      </div>
      <label className="relative block w-full shrink-0 lg:w-64">
        <span className="sr-only">Cari layanan publik</span>
        <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
        <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Cari layanan atau catatan..."
          className="h-11 w-full min-w-0 rounded-xl border border-slate-200 bg-white pl-9 pr-10 text-xs outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20" />
        {query && <button type="button" onClick={() => setQuery('')} aria-label="Hapus pencarian layanan publik" className="absolute right-1 top-1 flex h-9 w-9 items-center justify-center rounded-lg text-slate-500"><X className="h-4 w-4" /></button>}
      </label>
    </div>

    {!displayed.length ? <div role="status" className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
      <h3 className="text-sm font-bold text-slate-800">{active.length ? 'Layanan tidak ditemukan' : 'Layanan sedang disiapkan'}</h3>
      <p className="mt-1 text-xs text-slate-500">{active.length ? 'Coba kata kunci atau kategori lain.' : 'Informasi layanan akan tampil setelah diterbitkan pengelola.'}</p>
      {!!active.length && <button type="button" onClick={() => {setCategory('ALL'); setQuery('');}} className="mt-4 min-h-11 rounded-xl bg-teal-50 px-4 text-xs font-bold text-teal-800">Tampilkan semua layanan</button>}
    </div> : <CardRail key={`${category}:${search}`} label="Katalog layanan psikologi">
      {displayed.map(pkg => {
        const style = styles[pkg.category as keyof typeof styles] ?? styles.KONSELING;
        const Icon = style.icon;
        return <article key={pkg.id} className={`service-card flex min-w-0 flex-col rounded-2xl border border-t-[3px] border-slate-200 ${style.edge} bg-white p-5 shadow-xs [overflow-wrap:anywhere]`}>
          <div className="mb-4 flex items-start gap-3">
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${style.color}`}><Icon className="h-5 w-5" /></span>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{pkg.category || 'Layanan'}</p>
              <h3 className="mt-1 text-base font-bold leading-snug text-slate-900">{pkg.name}</h3>
            </div>
          </div>
          <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5 shrink-0" />{pkg.durationMinutes > 0 ? `${pkg.durationMinutes} menit` : 'Durasi sesuai layanan'}</span>
            {pkg.badge && <span className={`max-w-full rounded-lg px-2 py-1 text-[10px] font-bold ${style.color}`}>{pkg.badge}</span>}
          </div>
          <p className="mb-4 whitespace-pre-line text-xs leading-relaxed text-slate-600">{pkg.description}</p>
          <div className="mb-4 rounded-xl border border-slate-100 bg-slate-50 p-3">
            {currentUser && typeof pkg.price === 'number' ? <>
              {typeof pkg.normalPrice === 'number' && pkg.normalPrice > pkg.price && <del className="block text-xs text-slate-500">Rp {pkg.normalPrice.toLocaleString('id-ID')}</del>}
              <p className="flex flex-wrap items-baseline gap-x-1"><strong className="text-xl font-extrabold text-slate-900">Rp {pkg.price.toLocaleString('id-ID')}</strong><span className="text-xs text-slate-500">/ {pkg.type === 'PSYCHOTHERAPY' ? 'sesi' : 'layanan'}</span></p>
            </> : <>
              <p className="flex items-center gap-1.5 text-xs font-bold text-slate-700"><Lock className="h-3.5 w-3.5 shrink-0 text-teal-700" />Tarif & jadwal melalui akun pasien</p>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-500">Masuk untuk melihat rincian dan memilih jadwal.</p>
            </>}
          </div>
          {!!pkg.benefits.length && <div className="mb-4 space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Fasilitas layanan</p>
            <ul className="space-y-2">{pkg.benefits.map((benefit, index) => <li key={index} className="flex items-start gap-2 text-xs leading-snug text-slate-600"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-600" /><span className="min-w-0">{benefit}</span></li>)}</ul>
          </div>}
          {pkg.notes?.trim() && <div className="mb-4 rounded-xl border border-amber-100 bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">
            <p className="mb-1 flex items-center gap-1.5 font-bold"><StickyNote className="h-3.5 w-3.5 shrink-0" />Catatan layanan</p>
            <p className="whitespace-pre-line">{pkg.notes}</p>
          </div>}
          <button type="button" onClick={() => onBook(pkg.id)} className="ui-press mt-auto flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-3 py-3 text-xs font-bold text-white hover:bg-teal-800">
            <span>{currentUser && currentRole === 'PATIENT' ? 'Pilih layanan ini' : 'Masuk untuk reservasi'}</span><ArrowRight className="h-4 w-4 shrink-0" />
          </button>
        </article>;
      })}
    </CardRail>}
  </div>;
}
