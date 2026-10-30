export interface RequestActivity {
  kind: 'read' | 'write';
  label: string;
  scope?: 'clinical';
}

export interface ActivitySnapshot {
  pending: number;
  reading: number;
  writing: number;
  clinical: number;
  startedAt: number | null;
  label: string;
}

export const IDLE_ACTIVITY: ActivitySnapshot = Object.freeze({pending:0,reading:0,writing:0,clinical:0,startedAt:null,label:''});

/** Metadata proses saja; tidak menyimpan URL, formulir, identitas, atau respons pasien. */
export function createActivityStore() {
  const active=new Map<symbol,RequestActivity & {startedAt:number}>();
  const listeners=new Set<()=>void>();
  let snapshot=IDLE_ACTIVITY;
  const publish=()=>{
    const entries=[...active.values()];
    const writes=entries.filter(entry=>entry.kind==='write');
    snapshot=entries.length?{
      pending:entries.length,reading:entries.length-writes.length,writing:writes.length,
      clinical:entries.filter(entry=>entry.scope==='clinical').length,
      startedAt:Math.min(...entries.map(entry=>entry.startedAt)),
      label:(writes.at(-1)??entries[0]).label,
    }:IDLE_ACTIVITY;
    listeners.forEach(listener=>listener());
  };
  const begin=(activity:RequestActivity)=>{
    const token=Symbol();
    active.set(token,{...activity,startedAt:Date.now()});
    publish();
    let ended=false;
    return ()=>{if(ended)return;ended=true;active.delete(token);publish();};
  };
  return {
    getSnapshot:()=>snapshot,
    subscribe:(listener:()=>void)=>{listeners.add(listener);return()=>{listeners.delete(listener);};},
    begin,
    async track<T>(activity:RequestActivity,work:()=>Promise<T>):Promise<T>{
      const finish=begin(activity);
      try{return await work();}finally{finish();}
    },
  };
}

export const requestActivity=createActivityStore();

export function describeRequest(path:string,method:string):RequestActivity {
  if(method.toUpperCase()==='GET'){
    if(path.startsWith('/availability'))return {kind:'read',label:'Memuat jadwal tersedia…'};
    if(path.startsWith('/work/data')&&/[?&]patient_id=/.test(path))return {kind:'read',scope:'clinical',label:'Memuat data pasien…'};
    return {kind:'read',label:'Memuat data terbaru…'};
  }
  if(path.endsWith('/preview'))return {kind:'read',label:'Memeriksa perubahan…'};
  if(path==='/files'||path==='/admin/assets')return {kind:'write',label:'Mengunggah berkas…'};
  return {kind:'write',label:'Menyimpan perubahan…'};
}
