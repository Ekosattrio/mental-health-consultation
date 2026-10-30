import {useContext,useEffect,useState} from 'react';
import {AppContext} from '../context/AppContextCore';
import {send} from '../practice/http';
import {localParts} from './mapping';
import {getMinimumBookingDate} from '../utils/bookingPolicy';
import type {ServerSlot} from './types';

export function useServerAvailability(date:string,duration:number,psychologistId:string,excludeId?:string,enabled=true){
  const server=useContext(AppContext)?.server;
  const key=`${date}:${duration}:${psychologistId}:${excludeId??''}:${enabled}:${server?.revision??0}`;
  const [state,setState]=useState<{key:string;slots:ServerSlot[];limit:number;booked:number;closed:boolean;error:string}|null>(null);
  useEffect(()=>{
    if(!server||!date||!duration||!enabled)return;
    let active=true;
    if(date<getMinimumBookingDate()){setState({key,slots:[],limit:0,booked:0,closed:false,error:'Booking dan reschedule minimal besok (H+1).'});return;}
    const query=new URLSearchParams({date,duration_minutes:String(duration),summary:'1',...(excludeId?{exclude_id:excludeId}:{})});
    void send<{slots:ServerSlot[];limit:number;booked:number;closed:boolean}>('/availability?'+query,{},'GET').then(result=>{if(active)setState({key,...result,error:''});}).catch(e=>{if(active)setState({key,slots:[],limit:0,booked:0,closed:false,error:e.message??'Slot gagal dimuat. Pilih kembali tanggal.'});});
    return()=>{active=false;};
  },[!!server,key]);
  if(!server)return null;
  const current=state?.key===key?state:null;
  const slots=(current?.slots??[]).map(slot=>{const start=localParts(slot.start_at),end=localParts(slot.end_at);const hour=Number(start.time.slice(0,2));return {id:`server-${date}-${start.time}`,psychologistId,date,startTime:start.time,endTime:end.time,durationMinutes:duration,isAvailable:true,isBooked:false,isPast:false,label:hour<12?'Pagi':hour<15?'Siang':'Sore'};});
  return {slots,maxPatients:current?.limit??0,bookedCount:current?.booked??0,remainingQuota:Math.max(0,(current?.limit??0)-(current?.booked??0)),isHoliday:current?.closed??false,isQuotaFull:!!current&&current.limit>0&&current.booked>=current.limit,isCustomDate:false,customNote:'',loading:enabled&&!current,reason:current?.error||(current?.closed?'Praktik tutup pada tanggal ini.':current&&!slots.length?'Tidak ada slot tersedia. Pilih tanggal lain.':!current?'Memuat ketersediaan terbaru dari server…':null)};
}
