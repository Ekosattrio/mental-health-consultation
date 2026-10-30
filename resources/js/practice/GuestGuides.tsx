import {useId, useState} from 'react';
import {BookOpen, CheckCircle2, ChevronDown} from 'lucide-react';
import {softClass} from './components';

export function GuestGuides({items}: {items: {id: string; version: number; title: string; steps: string[]; video_url: string | null}[]}) {
  const id = useId();
  const [open, setOpen] = useState<string | null>(null);
  const [read, setRead] = useState<Record<string, boolean>>(() => Object.fromEntries(items.map(item => {
    try { return [item.id, localStorage.getItem(`guest-guide:${item.id}:${item.version}`) === 'read']; }
    catch { return [item.id, false]; }
  })));

  if (!items.length) return null;
  return <section className="mx-auto max-w-4xl space-y-3 px-4 py-10 sm:px-6" aria-labelledby={`${id}-title`}>
    <div className="mb-5 flex items-center gap-3">
      <BookOpen className="h-6 w-6 shrink-0 text-teal-700" />
      <div><h2 id={`${id}-title`} className="text-lg font-bold text-slate-900">Panduan penggunaan</h2><p className="text-xs text-slate-500">Pilih panduan untuk membaca langkahnya.</p></div>
    </div>
    {items.map((item, index) => {
      const expanded = open === item.id;
      return <div key={item.id} className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white [overflow-wrap:anywhere]">
        <h3><button type="button" aria-expanded={expanded} aria-controls={`${id}-${index}`} onClick={() => setOpen(expanded ? null : item.id)}
          className="flex min-h-14 w-full items-center justify-between gap-3 p-4 text-left hover:bg-slate-50">
          <span className="min-w-0"><span className="block text-sm font-bold text-slate-800">{item.title}</span><span className="mt-1 block text-xs font-normal text-slate-500">{item.steps.length} langkah{read[item.id] ? ' · Sudah dibaca' : ''}</span></span>
          {read[item.id] && <CheckCircle2 className="ml-auto h-4 w-4 shrink-0 text-teal-600" />}
          <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </button></h3>
        <div id={`${id}-${index}`} hidden={!expanded} className="border-t border-slate-100 p-4 sm:p-5">
          <ol className="list-decimal space-y-3 pl-5 text-sm leading-relaxed text-slate-600">{item.steps.map((step, stepIndex) => <li key={stepIndex}>{step}</li>)}</ol>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            {item.video_url && <a className="inline-flex min-h-11 items-center text-sm text-teal-800 underline" href={item.video_url} target="_blank" rel="noopener noreferrer">Video panduan</a>}
            <button type="button" className={softClass + ' min-h-11'} onClick={() => {
              try { localStorage.setItem(`guest-guide:${item.id}:${item.version}`, 'read'); } catch { /* Progres anonim opsional. */ }
              setRead(value => ({...value, [item.id]: true}));
            }}>{read[item.id] ? 'Sudah dibaca' : 'Tandai sudah dibaca'}</button>
          </div>
        </div>
      </div>;
    })}
  </section>;
}
