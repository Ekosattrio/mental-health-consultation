const pending = new Map<string,string>();
const digest=async(value:string)=>crypto.subtle?[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)))].map(b=>b.toString(16).padStart(2,'0')).join(''):value;
const newKey=()=>{if(crypto.randomUUID){return crypto.randomUUID();}const bytes=crypto.getRandomValues(new Uint8Array(16));bytes[6]=(bytes[6]&15)|64;bytes[8]=(bytes[8]&63)|128;const hex=[...bytes].map(b=>b.toString(16).padStart(2,'0')).join('');return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;};
export class ActionError extends Error {constructor(message:string,public errors:Record<string,string[]>={},public status=422){super(message);}}
export async function send<T=Record<string,unknown>>(path:string,values:Record<string,unknown>|FormData={},method='POST'):Promise<T>{
 const fingerprint=await digest(path+JSON.stringify(values instanceof FormData?[...values.entries()].map(([key,value])=>[key,value instanceof File?`${value.name}:${value.size}:${value.lastModified}`:value]):values));
 const cacheKey='jiwasehat-request-'+fingerprint;
 let key=pending.get(fingerprint);if(!key&&crypto.subtle){try{key=sessionStorage.getItem(cacheKey)??undefined;}catch{/* Request remains safe through DB locks when storage is disabled. */}}
 key??=newKey();pending.set(fingerprint,key);if(crypto.subtle){try{sessionStorage.setItem(cacheKey,key);}catch{/* No sensitive form data is stored. */}}
 const csrf=document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content??'';
 const headers:Record<string,string>={'Accept':'application/json','X-Requested-With':'XMLHttpRequest','X-CSRF-TOKEN':csrf,'Idempotency-Key':key};if(!(values instanceof FormData)){headers['Content-Type']='application/json';}
 const response=await fetch(path,{method,credentials:'same-origin',headers,...(method!=='GET'?{body:values instanceof FormData?values:JSON.stringify(values)}:{})});
 const replacement=response.headers.get('X-CSRF-Token');if(replacement){const meta=document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]');if(meta){meta.content=replacement;}}
 const data=await response.json().catch(()=>({message:'Respons tidak dapat dibaca. Muat ulang halaman.'}));
 if(response.ok||response.status>=400&&response.status<500){pending.delete(fingerprint);try{sessionStorage.removeItem(cacheKey);}catch{/* optional storage */}}
 if(!response.ok){throw new ActionError(data.message??'Perubahan gagal.',data.errors??{},response.status);}
 return data.data as T;
}
export const money=(value:number)=>new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(value);
export const when=(value:string)=>new Intl.DateTimeFormat('id-ID',{dateStyle:'medium',timeStyle:'short',timeZone:'Asia/Jakarta'}).format(new Date(value))+' WIB';
export const label=(value:string)=>({WAITING_PAYMENT:'Menunggu pembayaran',WAITING_VERIFICATION:'Menunggu verifikasi',CONFIRMED:'Terkonfirmasi',CONFIRMED_AUTO_SLA:'Terkonfirmasi — perlu pencocokan uang',CHECKED_IN:'Sudah check-in',IN_CONSULTATION:'Sedang dilayani',COMPLETED:'Selesai',NO_SHOW:'Tidak hadir',CANCELLED:'Dibatalkan',EXPIRED:'Berakhir',AWAITING_SETTLEMENT:'Menunggu penyelesaian pembayaran',ACTIVE:'Aktif',DISCONTINUED:'Dihentikan',NOT_REQUIRED:'Tanpa biaya',INCLUDED:'Termasuk tagihan asal',REQUIRED:'Berbayar',PENDING_VERIFICATION:'Menunggu pemeriksaan',PENDING_RECONCILIATION:'Perlu pencocokan',VERIFIED:'Terverifikasi',REJECTED:'Ditolak',REQUESTED:'Diajukan',APPROVED:'Disetujui',SLOT_SELECTION_REQUIRED:'Pilih jadwal kembali',APPLIED:'Sudah diterapkan',CLOSED:'Ditutup',OPEN:'Berjalan',READY:'Siap',QUEUED:'Dalam antrean',FAILED:'Gagal',SENT:'Terkirim',PENDING_MODERATION:'Menunggu moderasi'} as Record<string,string>)[value]??value.replaceAll('_',' ');
