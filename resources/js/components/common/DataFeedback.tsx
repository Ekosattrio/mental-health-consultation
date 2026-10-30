import {useEffect,useRef,useState,useSyncExternalStore,type ReactNode} from 'react';
import {createPortal} from 'react-dom';
import {AlertCircle,CheckCircle2,LoaderCircle,RefreshCw} from 'lucide-react';
import {useApp} from '../../context/AppContextCore';
import {IDLE_ACTIVITY,requestActivity,type ActivitySnapshot} from '../../practice/requestActivity';

export const useRequestActivity=()=>useSyncExternalStore(requestActivity.subscribe,requestActivity.getSnapshot,()=>IDLE_ACTIVITY);

export function BusyMark(){
  return <LoaderCircle aria-hidden="true" className="data-spinner h-4 w-4 shrink-0"/>;
}

export function RequestStatus({activity,slow=false,error=false}:{activity:ActivitySnapshot;slow?:boolean;error?:boolean}){
  const busy=activity.pending>0;
  return <div role="status" aria-live="polite" aria-atomic="true" className={`flex min-w-0 items-start gap-2 text-xs ${error?'text-amber-800':busy?'text-teal-800':'text-slate-500'}`}>
    {busy?<BusyMark/>:error?<AlertCircle aria-hidden="true" className="h-4 w-4 shrink-0"/>:<CheckCircle2 aria-hidden="true" className="h-4 w-4 shrink-0"/>}
    <span className="min-w-0 break-words">{busy?activity.label:error?'Data terbaru belum berhasil dimuat.':'Data siap.'}
      {busy&&slow&&<span className="mt-1 block text-slate-600">Proses masih berjalan. Tunggu sampai selesai sebelum mencoba lagi.</span>}
    </span>
  </div>;
}

/** Tetap terlihat ketika formulir berada di modal, tanpa menutupi atau mengunci input. */
export function WorkspaceActivityNotice(){
  const {server}=useApp();
  const activity=useRequestActivity();
  if(!server||(!activity.writing&&!activity.clinical)||typeof document==='undefined')return null;
  return createPortal(<div aria-hidden="true" className="pointer-events-none fixed inset-x-3 top-20 z-[1000000] mx-auto flex w-fit max-w-[calc(100%_-_1.5rem)] items-center gap-2 rounded-xl border border-teal-200 bg-white px-4 py-3 text-xs font-semibold text-teal-900 shadow-lg print:hidden"><BusyMark/><span className="min-w-0 break-words">{activity.label}</span></div>,document.body);
}

/** Hanya dipakai ketika komponen/data awal memang belum siap, bukan saat refresh. */
export function DashboardSkeleton({label='Menyiapkan halaman…',compact=false}:{label?:string;compact?:boolean}){
  return <div role="status" aria-busy="true" aria-live="polite" className={`mx-auto w-full min-w-0 space-y-4 ${compact?'':'max-w-7xl px-3 py-6 sm:px-6 lg:px-8'}`}>
    <p className="flex items-center gap-2 text-sm font-semibold text-slate-600"><BusyMark/>{label}</p>
    <div aria-hidden="true" className="space-y-4">
      {!compact&&<div className="grid grid-cols-1 gap-3 sm:grid-cols-3">{[0,1,2].map(item=><div key={item} className="data-skeleton h-24 rounded-2xl"/>)}</div>}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <div className="data-skeleton mb-5 h-5 w-2/5 rounded"/>
        {[0,1,2,3].map(item=><div key={item} className="mb-3 flex gap-3"><div className="data-skeleton h-9 w-9 shrink-0 rounded-lg"/><div className="data-skeleton h-9 flex-1 rounded-lg"/></div>)}
      </div>
    </div>
  </div>;
}

export function DashboardPanel({section,children}:{section:string;children:ReactNode}){
  const {server,showToast}=useApp();
  const activity=useRequestActivity();
  const busy=!!server&&activity.pending>0;
  const [slow,setSlow]=useState(false);
  const root=useRef<HTMLDivElement>(null);
  const previous=useRef<{section:string;revision:number}|null>(null);
  const revision=server?.revision??0;
  useEffect(()=>{
    setSlow(false);
    if(!busy||activity.startedAt===null)return;
    const timer=window.setTimeout(()=>setSlow(true),Math.max(0,8000-(Date.now()-activity.startedAt)));
    return()=>window.clearTimeout(timer);
  },[busy,activity.startedAt]);
  useEffect(()=>{
    const element=root.current;
    const old=previous.current;
    previous.current={section,revision};
    if(!element||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    const changedData=old?.section===section&&old.revision!==revision;
    if(changedData&&element.contains(document.activeElement))return;
    const targets=changedData?Array.from(element.querySelectorAll('tbody,[data-live-content]')).slice(0,3):[element];
    const animations=targets.flatMap(target=>typeof target.animate==='function'?[target.animate([{opacity:0.65},{opacity:1}],{duration:240,easing:'cubic-bezier(0.22,0.61,0.36,1)'})]:[]);
    return()=>animations.forEach(animation=>animation.cancel());
  },[section,revision]);
  return <div className="min-w-0 space-y-4">
    {server&&<div className="flex min-h-10 flex-wrap items-center justify-between gap-2 print:hidden">
      <RequestStatus activity={activity} slow={slow} error={!!server.syncError}/>
      <button type="button" disabled={busy} onClick={()=>{void server.refresh().catch(error=>showToast('Data belum dimuat',error instanceof Error?error.message:'Coba muat ulang data.','error'));}}
        className="ui-press inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 disabled:cursor-wait disabled:opacity-50">
        <RefreshCw aria-hidden="true" className={`h-3.5 w-3.5 ${busy?'data-spinner':''}`}/>Perbarui data
      </button>
    </div>}
    <div ref={root} aria-busy={busy} className="min-w-0 space-y-6">{children}</div>
  </div>;
}
