import {useCallback,useEffect,useMemo,useRef,useState,type ReactNode} from 'react';
import {router,usePage} from '@inertiajs/react';
import {AppContext,type AppContextType} from '../context/AppContextCore';
import type {Workspace} from '../types/practice';
import type {WebPageProps,PublicLandingData} from '../types/web';
import type {Appointment,ConsultationPackage,IntakeForm,ToastNotification,User} from '../types';
import {ActionError,send} from '../practice/http';
import {requestActivity} from '../practice/requestActivity';
import {mapWorkspace,mapPackage,wibInstant,methodToServer,calendarToView,type CatalogRow,type BookingRow} from './mapping';
import type {PracticeScheduleSettings} from '../data/scheduleConfig';
import {calculatePackagePayableAmount} from '../utils/discounts';
import {getMinimumBookingDate,getPracticeDate} from '../utils/bookingPolicy';
import {adminNavigation} from '../components/admin/navigation';
import type {BookingHold} from '../utils/workflowStore';

const blankWorkspace=(publicLanding?:PublicLandingData):Workspace=>({role:'PATIENT',account:{id:'',name:'',email:'',phone:null,row_version:1},patients:[],appointments:[],pagination:{page:1,last_page:1,total:0},bills:[],packages:[],reschedules:[],plans:[],cases:[],consent:null,template:null,pretests:[],notifications:[],tutorials:[],reviews:[],setup_ready:false,integrations:{google_sso:'',whatsapp:''},presentation:{owner:null,practice:publicLanding?{name:publicLanding.practice.name,title:publicLanding.practice.title,clinic_name:publicLanding.practice.clinic_name,address:publicLanding.practice.clinic_address,phone:publicLanding.practice.clinic_phone,whatsapp:publicLanding.practice.clinic_whatsapp,email:publicLanding.practice.clinic_email,bio:publicLanding.practice.bio,str_number:publicLanding.practice.str_number,sip_number:publicLanding.practice.sip_number}:{},cms:{landing:publicLanding?{...publicLanding.cms,clinicHours:publicLanding.practice.clinic_hours}:{}}}});

export function ServerAppProvider({workspace,publicLanding,children}:{workspace?:Workspace;publicLanding?:PublicLandingData;children:ReactNode}) {
  const page=usePage<WebPageProps>();
  const [data,setData]=useState<Workspace>(()=>{if(workspace)return workspace;const blank=blankWorkspace(publicLanding);if(!publicLanding)blank.presentation!.cms.landing={logoUrl:page.props.app.logo_url??'',footerText:page.props.app.footer_text??'',clinicName:page.props.app.name};return blank;});
  const dataRef=useRef(data);dataRef.current=data;
  const clinicalPatient=useRef<string|undefined>(undefined);
  const assistedBookings=useRef(new Map<string,string>());
  const uploadedProofs=useRef(new Map<string,Promise<string>>());
  const [revision,setRevision]=useState(0);
  const [toast,setToast]=useState<ToastNotification|null>(null);
  const [isSidebarCollapsed,setIsSidebarCollapsed]=useState(false);
  const requestedTab=new URLSearchParams(location.search).get('tab');
  const [activePatientTab,setActivePatientTab]=useState<AppContextType['activePatientTab']>(['overview','faq','booking','history','profile'].includes(requestedTab??'')?requestedTab as AppContextType['activePatientTab']:new URLSearchParams(location.search).has('package')?'booking':'overview');
  const [activePsychologistTab,setActivePsychologistTab]=useState<AppContextType['activePsychologistTab']>(['overview','schedule','packages','treatmentPlans','patients','finance','cms','history','profile'].includes(requestedTab??'')?requestedTab as AppContextType['activePsychologistTab']:'overview');
  const [activeAdminTab,setActiveAdminTab]=useState<AppContextType['activeAdminTab']>(adminNavigation.some(tab=>tab.id===requestedTab)?requestedTab as AppContextType['activeAdminTab']:'reservations');
  const [selectedBookingPackageId,setSelectedBookingPackageId]=useState<string>();
  const [selectedBookingPsychologistId,setSelectedBookingPsychologistId]=useState<string>();
  const [isLoginModalOpen,setIsLoginModalOpen]=useState(location.pathname==='/login');
  const [authModalTab,setAuthModalTab]=useState<'LOGIN'|'REGISTER'>('LOGIN');
  const [holds,setHolds]=useState<BookingHold[]>([]);
  const pretestRef=useRef<IntakeForm|null>(null),consentAccepted=useRef(false);
  const activeMutation=useRef(new Set<string>());
  const [syncError,setSyncError]=useState('');
  const refreshSequence=useRef(0);
  const showToast:AppContextType['showToast']=useCallback((title,message,type='success')=>setToast({id:crypto.randomUUID(),title,message,type}),[]);
  const refresh=useCallback(async()=>{
    const sequence=++refreshSequence.current;
    try{
    const first=await send<Workspace>('/work/data',{},'GET');
    let appointments=first.appointments,bills=first.bills;
    // Tampilan Eko memiliki pencarian/paginasi sendiri. Ambil seluruh halaman server,
    // jangan menyebut 25 baris pertama sebagai seluruh rangkaian/riwayat.
    for(let page=2;page<=first.pagination.last_page;page++) {
      const next=await send<Workspace>(`/work/data?page=${page}`,{},'GET');
      appointments=[...appointments,...next.appointments];bills=[...bills,...next.bills];
    }
    const clinical=clinicalPatient.current?await send<Workspace>('/work/data?patient_id='+clinicalPatient.current,{},'GET'):null;
    const next={...first,...(clinical?{pretests:clinical.pretests}:{}),appointments:[...new Map(appointments.map(a=>[a.id,a])).values()],bills:[...new Map(bills.map(b=>[b.id,b])).values()]};
    if(sequence===refreshSequence.current){dataRef.current=next;setData(next);setRevision(v=>v+1);setSyncError('');}return next;
    }catch(error){if(sequence===refreshSequence.current)setSyncError(error instanceof Error?error.message:'Data terbaru belum berhasil dimuat.');throw error;}
  },[]);
  useEffect(()=>{if(!workspace&&!page.props.auth.user)return;if(workspace){dataRef.current=workspace;setData(workspace);}void refresh().catch(e=>setSyncError(e.message));},[workspace,page.props.auth.user?.id,refresh]);
  useEffect(()=>{if(!workspace)return;const sync=()=>{if(document.visibilityState==='visible'&&activeMutation.current.size===0)void refresh().catch(e=>setSyncError(e.message));};window.addEventListener('focus',sync);const timer=window.setInterval(sync,30000);return()=>{clearInterval(timer);window.removeEventListener('focus',sync);};},[!!workspace,refresh]);
  const mapped=useMemo(()=>mapWorkspace(data),[data]);
  useEffect(()=>{const code=new URLSearchParams(location.search).get('package');if(code)setSelectedBookingPackageId(data.packages.find(p=>p.service_code===code)?.id);},[data.packages]);
  const action=async(key:string,work:()=>Promise<void>,success?:string)=>{
    if(!dataRef.current.account.id){showToast('Data sedang dimuat','Tunggu data akun selesai dimuat sebelum menyimpan perubahan.','info');return false;}
    if(activeMutation.current.has(key))return false;activeMutation.current.add(key);
    const finishActivity=requestActivity.begin({kind:'write',label:'Memproses perubahan…'});
    try{await work();try{await refresh();}catch{setSyncError('Perubahan tersimpan, tetapi data terbaru belum berhasil dimuat. Muat ulang sebelum mengulang aksi.');}if(success)showToast('Berhasil',success);return true;}
    catch(error){const message=error instanceof ActionError?Object.values(error.errors).flat().join(' ')||error.message:error instanceof Error?error.message:'Perubahan gagal.';showToast('Belum berhasil',message,'error');return false;}
    finally{activeMutation.current.delete(key);finishActivity();}
  };
  const apt=(id:string)=>{const found=dataRef.current.appointments.find(a=>a.id===id);if(!found)throw new Error('Booking tidak ditemukan. Muat ulang data.');return found;};
  const uploadProof=async(url:string,name='bukti-pembayaran.jpg')=>{
    if(!url.startsWith('data:'))throw new Error('Pilih berkas bukti pembayaran.');
    const cached=uploadedProofs.current.get(url);if(cached)return cached;
    const pending=(async()=>{const response=await fetch(url);const blob=await response.blob();const form=new FormData();form.append('purpose','PAYMENT_PROOF');form.append('file',new File([blob],name,{type:blob.type,lastModified:0}));return (await send<{id:string}>('/files',form)).id;})();
    uploadedProofs.current.set(url,pending);
    try{return await pending;}catch(error){uploadedProofs.current.delete(url);throw error;}
  };
  const consent=async(patient:string,name:string)=>{
    if(!consentAccepted.current)throw new Error('Baca dan setujui persetujuan layanan sebelum reservasi.');
    if(!dataRef.current.consent)throw new Error('Dokumen persetujuan belum diterbitkan oleh psikolog.');
    return (await send<{id:string}>('/consents',{patient_id:patient,cms_content_id:dataRef.current.consent.id,accepted:true,accepted_by_name:name})).id;
  };
  const saveProfile=async(id:string,values:Record<string,unknown>)=>action('profile',async()=>{
    const p=dataRef.current.patients.find(p=>p.id===id);
    const emergency=String(values.emergencyContact??'');const split=emergency.match(/^(.*?)\s*\(([^()]*)\)\s*$/);
    await send(p?`/patients/${p.id}`:'/patients',{full_name:values.name??p?.full_name??data.account.name,phone:values.phone??p?.phone,birth_date:values.birthDate??p?.birth_date,gender:values.gender??p?.gender,city:values.city??p?.city,occupation:values.occupation??p?.occupation,address:p?.address??'',...(values.emergencyContact!==undefined?{emergency_contact:{name:split?.[1]?.trim()??emergency,phone:split?.[2]?.trim()??'',relationship:p?.emergency_contact?.relationship??''}}:{}),...(p?{expected_version:p.row_version}:{})});
  },'Data pasien tersimpan.');
  const saveCalendar=async(settings:PracticeScheduleSettings)=>action('calendar',async()=>{
    const previous=dataRef.current.calendar;if(!previous)throw new Error('Kalender praktik belum tersedia.');
    const splitIntervals=(start:string,end:string):[string,string][]=>start<'12:00'&&end>'13:00'?[[start,'12:00'],['13:00',end]]:[[start,end]];
    const weekly=settings.weeklyDays.map(d=>{const original=previous.weekly.find(w=>w.day_of_week===(d.dayIndex||7));const unchanged=original?.intervals[0]?.[0]===d.startTime&&original?.intervals.at(-1)?.[1]===d.endTime;return {day_of_week:d.dayIndex||7,daily_limit:d.isOpen?d.maxPatients:0,intervals:d.isOpen?(unchanged?original!.intervals:splitIntervals(d.startTime,d.endTime)):[]};});
    const overrides=[...settings.holidays.map(date=>({local_date:date,mode:'CLOSED',daily_limit:0,intervals:[],reason:'Hari libur praktik'})),...settings.customDateOverrides.map(o=>({local_date:o.date,mode:o.isOpen?'OPEN':'CLOSED',daily_limit:o.isOpen?o.maxPatients:0,intervals:o.isOpen?splitIntervals(o.startTime??'09:00',o.endTime??'17:00'):[],reason:o.note||'Pengaturan tanggal khusus'}))].filter(o=>o.local_date>=getPracticeDate());
    const payload={calendar_version_id:previous.id,weekly,overrides:[...new Map(overrides.map(o=>[o.local_date,o])).values()],reason:'Pengaturan jadwal dari halaman praktik'};
    const preview=await send<{preview_token:string;affected:{id:string}[]}>('/admin/calendar/preview',payload);
    if(preview.affected.length>0)throw new Error(`Ada ${preview.affected.length} booking terdampak. Jadwalkan ulang booking tersebut sebelum menyimpan perubahan kalender.`);
    await send('/admin/calendar/apply',{...payload,preview_token:preview.preview_token});
  },'Jadwal praktik tersimpan ke server.');
  const submitIntakeForm:AppContextType['submitIntakeForm']=async form=>{
    let saved:IntakeForm|null=null;
    const ok=await action('pretest',async()=>{
      const template=dataRef.current.template;if(!template)throw new Error('Formulir pre-test belum tersedia.');
      const answers:Record<string,unknown>={complaint:form.concernDescription,goals:form.goals,previous_therapy:form.previousTherapy??null,medication:form.currentMedications??null,eko_profile:JSON.stringify(form)};
      const allowed={...Object.fromEntries(template.questions.map(q=>[q.key,answers[q.key]??(q.type==='boolean'?null:'')])),eko_profile:JSON.stringify(form)};
      const result=await send<{id:string}>('/pretests',{patient_id:form.patientId,template_id:template.id,answers:allowed,submit:true});
      saved={...form,id:result.id,completedAt:new Date().toISOString()};pretestRef.current=saved;
    });return ok?saved:null;
  };
  const reserveBookingSlot:AppContextType['reserveBookingSlot']=async selection=>{
    let hold:BookingHold|null=null;
    const ok=await action('reserve',async()=>{
      const pretest=pretestRef.current;if(!pretest)throw new Error('Isi pre-test baru untuk booking ini.');
      const pkg=dataRef.current.packages.find(p=>p.id===selection.packageId&&p.is_active&&p.is_bookable);if(!pkg)throw new Error('Layanan belum tersedia untuk booking.');
      const start_at=wibInstant(selection.date,selection.startTime);
      const quote=await send<{quote_token:string;final_price:number;minimum:number}>('/appointments/preview',{patient_id:pretest.patientId,package_version_id:pkg.version_id,start_at});
      const consentId=await consent(pretest.patientId,mapped.currentUser.name);
      const phone=dataRef.current.patients.find(p=>p.id===pretest.patientId)?.phone??'';
      const booked=await send<{id:string}>('/appointments',{patient_id:pretest.patientId,package_version_id:pkg.version_id,start_at,quote_token:quote.quote_token,pretest_submission_id:pretest.id,consent_id:consentId,profiling_mode:'DIGITAL',reminder_recipient_phone:phone,reminder_wa_accepted:consentAccepted.current,...(pkg.delivery_mode==='TELE_SERVICE'?{tele_service_recipient_phone:phone,wa_delivery_accepted:consentAccepted.current}:{})});
      const fresh=await refresh();const row=fresh.appointments.find(a=>a.id===booked.id);if(!row)throw new Error('Reservasi tersimpan. Buka Jadwal & Riwayat untuk melanjutkan pembayaran.');
      hold={id:booked.id,appointmentId:booked.id,patientId:pretest.patientId,psychologistId:selection.psychologistId,packageId:pkg.id,packageSnapshot:mapPackage(pkg),date:selection.date,startTime:selection.startTime,endTime:selection.endTime,totalAmount:quote.final_price,expiresAt:row.hold_expires_at??new Date(Date.now()+86400000).toISOString(),status:'HELD',paymentChannelDetail:fresh.payment_instructions,accountHolder:mapped.landingCms.bankAccountHolder};
      setHolds(old=>[...old.filter(h=>h.id!==booked.id),hold!]);
    });return ok?hold:null;
  };
  const bookAppointment:AppContextType['bookAppointment']=async values=>{
    let id=values.slotHoldId;
    const ok=await action('booking-payment',async()=>{
      if(!id){
        if(dataRef.current.role==='PATIENT')throw new Error('Reservasi belum tersedia. Pilih jadwal dan isi pre-test terlebih dahulu.');
        const assistedKey=JSON.stringify([values.patientName,values.patientPhone,values.packageId,values.date,values.startTime]);
        const prior=assistedBookings.current.get(assistedKey);
        if(prior){id=prior;if(values.initialPaymentAmount&&!apt(id).initial_requirement_met)await send(`/admin/appointments/${id}/payments`,{amount:values.initialPaymentAmount,received_at:receivedAt(values.initialPaymentReceivedDate),method:methodToServer(values.paymentMethod),purpose:'DP',reference:values.paymentChannelDetail??null,reason:'Penerimaan awal saat pendaftaran'});return;}
        const existing=dataRef.current.patients.find(p=>p.id===values.patientId);
        const patient=existing??{id:(await send<{id:string}>('/patients',{full_name:values.patientName,phone:values.patientPhone??null})).id};
        const pkg=dataRef.current.packages.find(p=>p.id===values.packageId);if(!pkg)throw new Error('Layanan tidak tersedia.');
        const start_at=wibInstant(values.date,values.startTime??'');const quote=await send<{quote_token:string}>('/appointments/preview',{patient_id:patient.id,package_version_id:pkg.version_id,start_at});
        consentAccepted.current=!!values.consentGiven;
        const consentId=await consent(patient.id,values.patientName);
        const result=await send<{id:string}>('/appointments',{patient_id:patient.id,package_version_id:pkg.version_id,start_at,quote_token:quote.quote_token,consent_id:consentId,profiling_mode:'PAPER',...(pkg.delivery_mode==='TELE_SERVICE'?{tele_service_recipient_phone:values.patientPhone??existing?.phone,wa_delivery_accepted:true}:{})});id=result.id;assistedBookings.current.set(assistedKey,id);
        // Bila pencatatan uang gagal, booking tetap dapat ditemukan di riwayat. Jangan membuat ulang.
        await refresh();
        if(values.initialPaymentAmount){await send(`/admin/appointments/${id}/payments`,{amount:values.initialPaymentAmount,received_at:receivedAt(values.initialPaymentReceivedDate),method:methodToServer(values.paymentMethod),purpose:'DP',reference:values.paymentChannelDetail??null,reason:'Penerimaan awal saat pendaftaran'});}
      }else{
        apt(id);
        const file=await uploadProof(values.paymentProofUrl??'',values.paymentProofName);
        const view=mapWorkspace(dataRef.current).appointments.find(a=>a.id===id)!;
        const amount=values.initialPaymentAmount??(values.paymentMethod?.includes('FULL')?(values.initialPaymentScope==='PLAN'?view.totalAmount*4:view.totalAmount):view.dpAmount??100000);
        await send(`/appointments/${id}/payment-submissions`,{claimed_amount:amount,file_id:file,method:'TRANSFER',sender_name:values.transferSenderName});
        setHolds(old=>old.filter(h=>h.id!==id));
      }
    },'Booking dan pembayaran tersimpan untuk pemeriksaan Admin.');
    const appointment=id?mapWorkspace(dataRef.current).appointments.find(a=>a.id===id):undefined;
    return {success:ok,appointment,message:ok?'Booking tersimpan.':'Periksa pesan kesalahan. Jika booking sudah terbentuk, lanjutkan melalui Jadwal & Riwayat.'};
  };
  const rescheduleAppointment:AppContextType['rescheduleAppointment']=async(id,date,start,_end,reason='Perubahan jadwal',version,options)=>action('reschedule-'+id,async()=>{
    const row=apt(id);if(version!==undefined&&version!==row.row_version)throw new Error('Jadwal berubah. Muat ulang dan periksa jadwal terbaru.');
    let request=dataRef.current.reschedules.find(r=>r.appointment_id===id&&['REQUESTED','APPROVED','SLOT_SELECTION_REQUIRED'].includes(r.status));
    if(options?.requestId&&request?.id!==options.requestId)throw new Error('Pengajuan berubah. Buka kembali formulir.');
    if(request&&options?.requestRevision!==undefined&&request.row_version!==options.requestRevision)throw new Error('Pengajuan telah diperbarui. Muat ulang.');
    if(!request){const created=await send<{id:string}>(`/appointments/${id}/reschedule-requests`,{expected_version:version??row.row_version,reason,start_at:wibInstant(date,start),origin:options?.origin??(data.role==='PATIENT'?'PATIENT':'OWNER')});await refresh();request=dataRef.current.reschedules.find(r=>r.id===created.id);}
    else{await send(`/reschedule-requests/${request.id}/selection`,{expected_version:request.row_version,reason,start_at:wibInstant(date,start)});await refresh();request=dataRef.current.reschedules.find(r=>r.id===request!.id);}
    if(data.role!=='PATIENT'&&request){await send(`/reschedule-requests/${request.id}/approve`,{expected_version:request.row_version,reason});await refresh();request=dataRef.current.reschedules.find(r=>r.id===request!.id);await send(`/reschedule-requests/${request!.id}/apply`,{expected_version:request!.row_version,reason});const fresh=await refresh();if(fresh.reschedules.find(r=>r.id===request!.id)?.status!=='APPLIED')throw new Error('Slot tujuan sudah berubah. Jadwal lama tetap berlaku; pilih slot kembali.');}
  },data.role==='PATIENT'?'Pengajuan dikirim. Jadwal lama tetap berlaku sampai disetujui.':'Jadwal diperbarui tanpa DP tambahan.');
  const reviewPatientReschedule:AppContextType['reviewPatientReschedule']=async(id,requestId,approve,reason='Keputusan pengajuan',expectedRevision)=>action('review-'+requestId,async()=>{
    apt(id);let request=dataRef.current.reschedules.find(r=>r.id===requestId&&r.appointment_id===id);if(!request)throw new Error('Pengajuan tidak ditemukan.');
    if(expectedRevision!==undefined&&request.row_version!==expectedRevision)throw new Error('Pengajuan berubah. Muat ulang.');
    await send(`/reschedule-requests/${requestId}/${approve?'approve':'reject'}`,{expected_version:request.row_version,reason:reason||'Keputusan pengajuan reschedule'});
    if(approve){await refresh();request=dataRef.current.reschedules.find(r=>r.id===requestId);if(request?.status==='APPROVED'){await send(`/reschedule-requests/${requestId}/apply`,{expected_version:request.row_version,reason:reason||'Jadwal pengajuan diterapkan'});const fresh=await refresh();if(fresh.reschedules.find(r=>r.id===requestId)?.status!=='APPLIED')throw new Error('Slot tujuan tidak tersedia lagi. Pasien perlu memilih kembali; jadwal lama tetap berlaku.');}}
  },'Pengajuan diperbarui.');
  const recordFinalPayment:AppContextType['recordFinalPayment']=async(id,payment)=>action('payment-'+id,async()=>{await send(`/admin/appointments/${id}/payments`,{amount:payment.amount,received_at:receivedAt(payment.receivedDate),method:methodToServer(payment.method),purpose:'SETTLEMENT',reference:payment.channelDetail??null,reason:payment.purpose==='CANCELLATION_SETTLEMENT'?'Pelunasan sebelum pembatalan':'Cicilan / pelunasan layanan'});},'Pembayaran dicatat.');
  const verifyPaymentAndConfirmBooking:AppContextType['verifyPaymentAndConfirmBooking']=async(id,note,date,expectedProofVersion,amount)=>action('verify-'+id,async()=>{
    const row=apt(id),bill=dataRef.current.bills.find(b=>b.id===row.billing_account_id);const payment=bill?.payments.find(p=>['PENDING_VERIFICATION','PENDING_RECONCILIATION'].includes(p.status));if(!payment)throw new Error('Tidak ada pembayaran yang menunggu verifikasi.');
    if(expectedProofVersion!==undefined&&payment.proof?.version!==expectedProofVersion)throw new Error('Bukti telah berubah. Periksa bukti terbaru.');
    await send(`/payments/${payment.id}/verify`,{expected_version:payment.row_version,actual_amount:amount,received_at:receivedAt(date),reason:note||'Bukti diperiksa Admin'});
  },'Pembayaran diverifikasi.');
  const updateAppointmentStatus:AppContextType['updateAppointmentStatus']=async(id,status,reason)=>action('status-'+id,async()=>{
    let row=apt(id);
    if(data.role!=='PSYCHOLOGIST')throw new Error('Penyelesaian, no-show, dan pembatalan hanya oleh psikolog.');
    if(status==='COMPLETED'){
      if(row.status!=='IN_CONSULTATION'){
        if(row.status!=='CHECKED_IN'){await send(`/admin/appointments/${id}/check-in`,{expected_version:row.row_version,identity_checked:true});await refresh();row=apt(id);}
        await send(`/admin/appointments/${id}/start`,{expected_version:row.row_version});await refresh();row=apt(id);
      }
      await send(`/admin/appointments/${id}/complete`,{expected_version:row.row_version,reason:reason??'Sesi selesai, dikonfirmasi psikolog'});
    }else if(status==='CANCELLED'||status==='NO_SHOW')await send(`/admin/appointments/${id}/${status==='CANCELLED'?'cancel':'no-show'}`,{expected_version:row.row_version,reason});
    else throw new Error('Perubahan status ini tidak tersedia.');
  },'Status sesi diperbarui.');
  const scheduleNextContinuousSession:AppContextType['scheduleNextContinuousSession']=async(id,date,start,end)=>action('next-'+id,async()=>{const row=apt(id);await send(`/admin/appointments/${id}/next`,{expected_version:row.row_version,start_at:wibInstant(date,start),duration_minutes:minutes(end)-minutes(start),...(row.assessment_case_id?{assessment_role:'EVALUATION'}:{})});},'Sesi berikutnya terjadwal. Tidak ada DP baru.');
  const savePackage:AppContextType['savePackage']=async pkg=>{
    return action('package-'+pkg.id,async()=>{
      const existing=dataRef.current.packages.find(p=>p.id===pkg.id);const pricing=calculatePackagePayableAmount(pkg);
      if(pricing.totalAmount<=0)throw new Error('Harga akhir layanan harus lebih dari nol.');
      await send('/admin/packages',{...(existing?{package_id:existing.id,expected_version:pkg.serverVersion}:{service_code:'EKO_'+crypto.randomUUID().replaceAll('-','').toUpperCase(),category:pkg.category==='ASESMEN'?'ASSESSMENT':pkg.category==='PSIKOTERAPI'?'PSYCHOTHERAPY':'COUNSELING'}),name:pkg.name,description:pkg.description,delivery_mode:pkg.type==='ONLINE_TELE'?'TELE_SERVICE':'OFFLINE',duration_minutes:pkg.durationMinutes,normal_price:pkg.price,promo_price:pricing.discountAmount>0?pricing.totalAmount:null,benefits:pkg.benefits,is_bookable:pkg.durationMinutes>0,additional_time_price_basis:(existing as CatalogRow|undefined)?.additional_time_price_basis??'FINAL_PRICE',presentation:{badge:pkg.badge??'',notes:pkg.notes??'',discount_type:pkg.discountType??'NONE',discount_value:pkg.discountValue??0,discount_label:pkg.discountLabel??''},reason:'Pembaruan layanan melalui formulir Eko'});
    },'Layanan tersimpan.');
  };
  const saveCms=async(section:string,values:Record<string,unknown>)=>action('cms-'+section,async()=>{
    const current=dataRef.current.cms?.find(c=>c.section_key===section&&c.status==='PUBLISHED');
    const payload={...current?.payload,...values};
    for(const field of ['heroImageUrl','aboutImageUrl','logoUrl','qrisImageUrl','clinicKopLogoUrl'])if(typeof payload[field]==='string'&&(payload[field] as string).startsWith('data:')){
      const blob=await (await fetch(payload[field] as string)).blob();const form=new FormData();form.append('file',new File([blob],'cms.png',{type:blob.type}));payload[field]=(await send<{url:string}>('/admin/assets',form)).url;
    }
    await send('/admin/cms',{section_key:section,payload,publish:true,expected_published_id:current?.id??null});
  },'Konten diterbitkan.');
  const unsupported=()=>showToast('Aksi tidak tersedia','Gunakan pengaturan layanan atau kalender. Data server tidak dihapus dari browser.','warning');
  const savePracticeProfile:AppContextType['updatePsychologistProfile']=async profile=>action('practice-profile',async()=>{
    const settings=dataRef.current.settings;if(!settings)throw new Error('Pengaturan praktik tidak tersedia.');
    const fields:Record<string,string>={title:'title',bio:'bio',clinicAddress:'address',strNumber:'str_number',sipNumber:'sip_number',practicePolicy:'practice_policy',avatarUrl:'avatar_url',sipExpiry:'sip_expiry',strExpiry:'str_expiry',experienceYears:'experience_years',clinicalHours:'clinical_hours',education:'education',specialties:'specialties',therapyApproaches:'therapy_approaches',languages:'languages',isAvailableToday:'is_available_today'};
    const identity={...settings.practice_identity};
    for(const [field,key] of Object.entries(fields)){const value=profile[field as keyof typeof profile];if(value!==undefined)identity[key]=Array.isArray(value)?value.join('\n'):String(value);}
    if(identity.avatar_url?.startsWith('data:')){const blob=await(await fetch(identity.avatar_url)).blob();const form=new FormData();form.append('file',new File([blob],'profil.png',{type:blob.type}));identity.avatar_url=(await send<{url:string}>('/admin/assets',form)).url;}
    await send('/superadmin/settings',{...settings,expected_version:settings.row_version,practice_identity:identity,initial_payment_mode:'FIXED',initial_payment_fixed_amount:100000,reason:'Pembaruan profil praktik'});
  },'Profil praktik tersimpan.');
  const value:AppContextType={...mapped,currentUser:workspace||data.account.id?mapped.currentUser:page.props.auth.user?{...page.props.auth.user,avatar:'',status:'ACTIVE',isVerified:true,createdAt:''}:null,currentRole:workspace||data.account.id?data.role:page.props.auth.user?.role??'GUEST',
    currentUserModel:null,currentPatientModel:null,currentPsychologistModel:null,currentAdminModel:null,authController:null,patientController:null,psychologistController:null,adminController:null,
    server:{workspace:data,refresh,revision,syncError,saveCalendar,acceptConsent:accepted=>{consentAccepted.current=accepted;},saveProfile,loadClinicalPatient:async id=>{try{clinicalPatient.current=id;const detail=await send<Workspace>(`/work/data?patient_id=${id}`,{},'GET');setData(current=>({...current,pretests:detail.pretests}));}catch(e){showToast('Pre-test belum dimuat',e instanceof Error?e.message:'Muat ulang data.','error');}},uploadPayment:async(id,proof,amount)=>action('proof-upload-'+id,async()=>{const file=await uploadProof(proof.url,proof.name);await send(`/appointments/${id}/payment-submissions`,{claimed_amount:amount,file_id:file,method:'TRANSFER',sender_name:proof.senderName});},'Bukti tersimpan untuk diperiksa Admin.')},
    schedules:[],slotHolds:holds,paymentReconciliations:[],toast,showToast,dismissToast:()=>setToast(null),isSidebarCollapsed,setIsSidebarCollapsed,toggleSidebar:()=>setIsSidebarCollapsed(v=>!v),activePatientTab,setActivePatientTab:tab=>workspace?setActivePatientTab(tab):router.visit('/dashboard?tab='+tab),activePsychologistTab,setActivePsychologistTab:tab=>workspace?setActivePsychologistTab(tab):router.visit('/dashboard?tab='+tab),activeAdminTab,setActiveAdminTab:tab=>workspace?setActiveAdminTab(tab):router.visit('/dashboard?tab='+tab),selectedBookingPackageId,setSelectedBookingPackageId,selectedBookingPsychologistId,setSelectedBookingPsychologistId,
    startBookingFlow:(_psychologist,packageId)=>{if(!workspace){const pkg=publicLanding?.packages.find(p=>p.service_code===packageId);router.visit('/login'+(pkg?'?package='+encodeURIComponent(pkg.service_code):''));return;}setSelectedBookingPackageId(packageId);setActivePatientTab('booking');},startTestFlow:()=>setActivePatientTab('booking'),
    isLoginModalOpen,setIsLoginModalOpen,authModalTab,setAuthModalTab,openAuthModal:tab=>{if(tab==='REGISTER')router.visit('/register');else setIsLoginModalOpen(true);},logout:()=>router.post('/logout'),loginAs:()=>router.visit('/login'),loginWithEmail:()=>{throw new Error('Gunakan login Laravel.');},registerUser:async()=>({success:false,message:'Daftar melalui formulir pendaftaran.'}),switchRole:()=>router.visit('/login'),switchPatientUser:unsupported,
    reserveBookingSlot,bookAppointment,submitIntakeForm,updateUserProfile:(id,fields)=>{void saveProfile(id,fields);},saveAccountProfile:async fields=>action('account',async()=>{const profile=dataRef.current.patients.find(p=>p.id===mapped.currentUser.id);const emergency=fields.emergencyContact?.match(/^(.*?)\s*\(([^()]*)\)\s*$/);await send('/account',{name:fields.name,phone:fields.phone,email:dataRef.current.account.email,expected_version:dataRef.current.account.row_version,...(data.role==='PATIENT'&&profile?{patient_profile:{id:profile.id,expected_version:profile.row_version,emergency_contact:{name:emergency?.[1]?.trim()??fields.emergencyContact??'',phone:emergency?.[2]?.trim()??'',relationship:profile.emergency_contact?.relationship??''}}}:{})});},'Profil akun tersimpan.'),
    submitReview:async review=>action('review',async()=>{const row=apt(review.appointmentId);await send(`/billing-accounts/${row.billing_account_id}/review`,{rating:review.rating,comment:review.comment,is_anonymous:review.isAnonymous});},'Ulasan dikirim untuk moderasi.'),
    approveReview:id=>{void moderateReview(id,true);},rejectReview:id=>{void moderateReview(id,false);},
    updateLandingCms:values=>saveCms('landing',values),updatePatientCms:values=>saveCms('patient',values),updatePsychologistCms:values=>saveCms('psychologist',values),
    updatePsychologistProfile:savePracticeProfile,
    toggleSlotAvailability:unsupported,addScheduleSlot:async()=>{unsupported();return false;},deleteScheduleSlot:unsupported,savePackage,deletePackage:id=>{void togglePackage(id,false);},togglePackageStatus:id=>{const p=data.packages.find(p=>p.id===id);if(p)void togglePackage(id,!p.is_active);},updateAppointmentStatus,rescheduleAppointment,reviewPatientReschedule,
    confirmRescheduledBooking:async()=>{showToast('Jadwal sudah tersimpan','Reschedule memakai pembayaran asal dan tidak memerlukan konfirmasi DP baru.','info');return false;},
    reopenPatientReschedule:async(_id,requestId,reason,version)=>action('reopen-'+requestId,async()=>{await send(`/reschedule-requests/${requestId}/reopen`,{expected_version:version,reason});}),
    verifyPaymentAndConfirmBooking,rejectPaymentProof:async(id,reason,version)=>action('reject-'+id,async()=>{const v=mapWorkspace(dataRef.current).appointments.find(a=>a.id===id);if(!v?.serverInfo?.paymentId||v.paymentProofVersion!==version)throw new Error('Bukti berubah. Muat ulang.');await send(`/payments/${v.serverInfo.paymentId}/reject`,{expected_version:v.serverInfo.paymentVersion,reason});}),
    correctPaymentProof:async(id,proof,version)=>action('proof-'+id,async()=>{const v=mapWorkspace(dataRef.current).appointments.find(a=>a.id===id);if(!v?.serverInfo?.paymentId)throw new Error('Pembayaran tidak ditemukan.');const file=await uploadProof(proof.url??'',proof.name);await send(`/payments/${v.serverInfo.paymentId}/proof`,{expected_version:v.serverInfo.paymentVersion,expected_proof_version:version,file_id:file});}),
    recordFinalPayment,scheduleNextContinuousSession,discontinueTreatmentPlan:async(id,reason)=>action('discontinue-'+id,async()=>{const row=apt(id);if(row.treatment_plan_id){const plan=dataRef.current.plans.find(p=>p.id===row.treatment_plan_id);await send(`/superadmin/treatment-plans/${row.treatment_plan_id}/discontinue`,{expected_version:plan?.row_version,reason});}else if(row.assessment_case_id&&row.status==='COMPLETED'){const clinicalCase=dataRef.current.cases.find(c=>c.id===row.assessment_case_id);await send(`/superadmin/assessment-cases/${row.assessment_case_id}/close`,{expected_version:clinicalCase?.row_version,reason});}else await send(`/admin/appointments/${id}/cancel`,{expected_version:row.row_version,reason});},'Layanan dihentikan setelah pelunasan.'),resetAllToDefault:async()=>{throw new Error('Reset data praktik tidak tersedia.');}};
  async function moderateReview(id:string,approve:boolean){return action('moderate-'+id,async()=>{const row=dataRef.current.reviews.find(r=>r.id===id);if(!row)throw new Error('Ulasan tidak ditemukan.');await send(`/admin/reviews/${id}/moderate`,{expected_version:row.row_version,decision:approve?'APPROVED':'REJECTED',reason:approve?'Ulasan disetujui':'Ulasan tidak sesuai kebijakan'});},'Moderasi tersimpan.');}
  async function togglePackage(id:string,active:boolean){return action('package-toggle-'+id,async()=>{const row=dataRef.current.packages.find(p=>p.id===id);if(!row)throw new Error('Layanan tidak ditemukan.');await send(`/admin/packages/${id}/active`,{expected_version:row.row_version,is_active:active,reason:active?'Aktifkan layanan':'Nonaktifkan layanan, pertahankan riwayat'});},'Status layanan diperbarui.');}
  return <AppContext.Provider value={value}>{syncError&&<div role="alert" className="mx-auto max-w-7xl rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">{syncError}<button type="button" className="ml-3 font-bold underline" onClick={()=>void refresh().catch(e=>setSyncError(e.message))}>Muat ulang data</button></div>}{children}</AppContext.Provider>;
}
const minutes=(value:string)=>Number(value.slice(0,2))*60+Number(value.slice(3));
const receivedAt=(date?:string)=>wibInstant(date??getPracticeDate(),'00:00');
