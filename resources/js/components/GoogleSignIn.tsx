import {useEffect,useRef,useState} from 'react';
import {usePage} from '@inertiajs/react';
import type {WebPageProps} from '../types/web';
import {send} from '../practice/http';

interface GoogleId {
 initialize:(options:Record<string,unknown>)=>void;
 renderButton:(element:HTMLElement,options:Record<string,unknown>)=>void;
 prompt:()=>void;cancel:()=>void;disableAutoSelect:()=>void;
}
declare global {interface Window {google?:{accounts:{id:GoogleId}}}}
let loading:Promise<void>|undefined;
function loadGoogle(){
 if(window.google?.accounts.id)return Promise.resolve();
 if(!loading){loading=new Promise<void>((resolve,reject)=>{const script=document.createElement('script');script.src='https://accounts.google.com/gsi/client';script.async=true;script.onload=()=>resolve();script.onerror=()=>{loading=undefined;reject(new Error('Google tidak dapat dimuat. Gunakan login email atau coba kembali.'));};document.head.appendChild(script);});}
 return loading;
}
export function disableGoogleAutoSelect(){window.google?.accounts.id.disableAutoSelect();}
export default function GoogleSignIn({oneTapOnly=false}:{oneTapOnly?:boolean}){
 const {google_signin:config,auth}=usePage<WebPageProps>().props;const element=useRef<HTMLDivElement>(null);const[error,setError]=useState('');
 useEffect(()=>{
  if(!config?.enabled||!config.client_id||!config.nonce||auth.user)return;
  let active=true;let submitting=false;
  void loadGoogle().then(()=>{if(!active)return;const id=window.google!.accounts.id;
   id.initialize({client_id:config.client_id,nonce:config.nonce,auto_select:config.auto_select,use_fedcm_for_prompt:true,callback:async(response:{credential:string})=>{if(submitting)return;submitting=true;try{const result=await send<{redirect:string}>('/auth/google/credential',{credential:response.credential});window.location.assign(result.redirect);}catch(e){submitting=false;setError(e instanceof Error?e.message:'Login Google gagal. Muat ulang halaman untuk mencoba kembali.');}}});
   if(element.current&&!oneTapOnly){id.renderButton(element.current,{type:'standard',theme:'outline',size:'large',text:'continue_with',locale:'id',width:280});}
   if(config.auto_select)id.prompt();
  }).catch(e=>{if(active)setError(String(e.message));});
  return()=>{active=false;window.google?.accounts.id.cancel();};
 },[config?.enabled,config?.client_id,config?.nonce,config?.auto_select,auth.user,oneTapOnly]);
 if(auth.user||!config?.enabled)return oneTapOnly?null:<p className="text-xs text-slate-500">Login Google menunggu konfigurasi Client ID. Login email tetap tersedia.</p>;
 return <div className={oneTapOnly?'':'space-y-2'}>{!oneTapOnly&&<div ref={element}/>} {error&&<p role="alert" className="text-sm text-rose-700">{error}</p>}</div>;
}
