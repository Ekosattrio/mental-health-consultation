import {useState} from 'react';
import {Card,softClass} from './components';
export function GuestGuides({items}:{items:{id:string;version:number;title:string;steps:string[];video_url:string|null}[]}){
 const[read,setRead]=useState<Record<string,boolean>>(()=>Object.fromEntries(items.map(t=>{try{return[t.id,localStorage.getItem(`guest-guide:${t.id}:${t.version}`)==='read'];}catch{return[t.id,false];}})));
 if(!items.length)return null;return <div className="max-w-4xl mx-auto p-5 space-y-4">{items.map(t=><Card key={t.id} title={t.title}><ol className="list-decimal pl-5 text-sm space-y-3">{t.steps.map((s,i)=><li key={i}>{s}</li>)}</ol>{t.video_url&&<a className="inline-block mt-3 text-teal-800 underline" href={t.video_url} target="_blank" rel="noopener noreferrer">Video panduan</a>}<button className={softClass+' mt-4'} onClick={()=>{try{localStorage.setItem(`guest-guide:${t.id}:${t.version}`,'read');}catch{/* Optional anonymous progress only. */}setRead(v=>({...v,[t.id]:true}));}}>{read[t.id]?'Sudah dibaca':'Tandai sudah dibaca'}</button></Card>)}</div>;
}
