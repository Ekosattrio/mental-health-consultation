import type {Workspace, Package as ServerPackage, Appointment as ServerAppointment, Bill, Payment} from '../types/practice';
import type {Appointment, ConsultationPackage, User, PsychologistProfile, IntakeForm, Review, AnalyticsSummary} from '../types';
import {INITIAL_LANDING_CMS, INITIAL_PATIENT_CMS, INITIAL_PSYCHOLOGIST_CMS} from '../data/cmsDefaults';
import type {PracticeScheduleSettings} from '../data/scheduleConfig';
import {practiceHours,publicPracticeText} from '../utils/practiceContact';

export type CatalogRow = ServerPackage & {presentation?:{badge?:string;notes?:string;discount_type?:'NONE'|'FIXED'|'PERCENT';discount_value?:number;discount_label?:string}};
export type BookingRow = ServerAppointment & {package_id?:string;psychologist_id?:string;created_at?:string};
export type BillingRow = Bill & {initial_minimum_due?:number;source_bill_id?:string;agreement?:{session_amount:number;session_subtotal:number;session_discount:number;duration_minutes:number;agreed_at:string}|null};
export type PaymentRow = Payment & {created_at?:string;recorded_by_name?:string;channel_detail?:string;proof:(NonNullable<Payment['proof']>&{mime_type?:string})|null};

export function localParts(value:string) {
  const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Jakarta',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date(value));
  const get=(key:string)=>parts.find(p=>p.type===key)?.value??'';
  return {date:`${get('year')}-${get('month')}-${get('day')}`,time:`${get('hour')}:${get('minute')}`};
}
export const wibInstant=(date:string,time:string)=>`${date}T${time}:00+07:00`;
export const methodToServer=(method?:string)=>method?.startsWith('CASH')?'CASH':method?.startsWith('QRIS')?'QR':method?.startsWith('EDC')?'EDC':method?.startsWith('OTHER')?'OTHER':'TRANSFER';
export const methodToView=(method:string):NonNullable<Appointment['paymentMethod']>=>method==='TRANSFER'?'BANK_TRANSFER':method==='QR'?'QRIS':method==='CASH'?'CASH':method==='EDC'?'EDC':'OTHER';
export const statusToView=(status:string):Appointment['status']=>({WAITING_PAYMENT:'PENDING',WAITING_VERIFICATION:'PENDING',CONFIRMED:'CONFIRMED',CONFIRMED_AUTO_SLA:'PENDING',CHECKED_IN:'CONFIRMED',IN_CONSULTATION:'IN_PROGRESS',COMPLETED:'COMPLETED',NO_SHOW:'NO_SHOW',CANCELLED:'CANCELLED',EXPIRED:'CANCELLED'} as const)[status]??'PENDING';

export function mapPackage(row:CatalogRow, now=Date.now()):ConsultationPackage {
  const promo=!!row.promo_price&&(!row.promo_starts_at||Date.parse(row.promo_starts_at)<=now)&&(!row.promo_ends_at||Date.parse(row.promo_ends_at)>now);
  const saved=row.presentation;
  return {id:row.id,serverVersion:row.row_version,name:row.name,category:row.category==='ASSESSMENT'?'ASESMEN':row.category==='PSYCHOTHERAPY'?'PSIKOTERAPI':'KONSELING',
    type:row.category==='PSYCHOTHERAPY'?'PSYCHOTHERAPY':row.category==='ASSESSMENT'?'BUNDLING_ASSESSMENT':row.delivery_mode==='TELE_SERVICE'?'ONLINE_TELE':'OFFLINE_CLINIC',
    durationMinutes:row.duration_minutes??0,price:row.normal_price,
    discountType:promo?(saved?.discount_type??'FIXED'):'NONE',discountValue:promo?(saved?.discount_value??row.normal_price-(row.promo_price??row.normal_price)):0,
    discountLabel:promo?(saved?.discount_label??'Promo layanan'):undefined,badge:saved?.badge,notes:saved?.notes,
    description:row.description,benefits:row.benefits,isActive:row.is_active,iconName:row.delivery_mode==='TELE_SERVICE'?'Video':'Building2',
    isContinuousCare:row.category==='PSYCHOTHERAPY',sessionCount:row.category==='PSYCHOTHERAPY'?4:1};
}

export function mapWorkspace(data:Workspace) {
  const identity=data.presentation?.practice??{};
  const text=(key:string)=>typeof identity[key]==='string'?identity[key] as string:'';
  const owner=data.presentation?.owner;
  const ownerId=owner?.id??(data.role==='PSYCHOLOGIST'?data.account.id:'');
  const patientUsers:User[]=data.patients.map(p=>({id:p.id,name:p.full_name,email:'',role:'PATIENT',avatar:'',phone:p.phone??'',status:'ACTIVE',isVerified:true,createdAt:'',
    birthDate:p.birth_date??'',gender:p.gender==='Perempuan'||p.gender==='FEMALE'?'Perempuan':p.gender==='Laki-laki'||p.gender==='MALE'?'Laki-laki':undefined,
    occupation:p.occupation??'',city:p.city??'',emergencyContact:p.emergency_contact?.name?`${p.emergency_contact.name} (${p.emergency_contact.phone??''})`:'',
    isProfileComplete:!!(p.birth_date&&p.gender&&p.phone&&p.city&&p.occupation&&p.emergency_contact?.name&&p.emergency_contact?.phone)}));
  const account:User={id:data.account.id,name:data.account.name,email:data.account.email,phone:data.account.phone??'',role:data.role,avatar:'',status:'ACTIVE',isVerified:true,createdAt:''};
  const currentUser:User=data.role==='PATIENT'&&patientUsers[0]?{...patientUsers[0],email:account.email}:account;
  const staffUsers:User[]=(data.users??[]).filter(u=>u.role!=='PATIENT').map(u=>({id:u.id,name:u.name,email:u.email,role:u.role as User['role'],status:u.status==='BLOCKED'?'BLOCKED':'ACTIVE',avatar:'',createdAt:'',isVerified:true}));
  if(owner&&!staffUsers.some(u=>u.id===owner.id))staffUsers.push({...account,id:owner.id,name:owner.name,email:owner.email,phone:owner.phone??'',role:'PSYCHOLOGIST'});
  if(data.role!=='PATIENT'&&!staffUsers.some(u=>u.id===account.id))staffUsers.push(account);
  const users=[...patientUsers.map(u=>u.id===currentUser.id?currentUser:u),...staffUsers];
  if(!users.some(u=>u.id===currentUser.id))users.push(currentUser);
  const array=(key:string)=>Array.isArray(identity[key])?identity[key] as string[]:typeof identity[key]==='string'?(identity[key] as string).split('\n').filter(Boolean):[];
  const psychologist:PsychologistProfile={userId:ownerId,title:text('title'),strNumber:text('str_number'),sipNumber:text('sip_number'),experienceYears:Number(identity.experience_years??0),bio:text('bio'),specialties:array('specialties'),therapyApproaches:array('therapy_approaches'),languages:array('languages'),education:array('education'),rating:0,reviewCount:0,clinicAddress:text('address'),avatarUrl:text('avatar_url'),isAvailableToday:true,practicePolicy:text('practice_policy')};
  psychologist.clinicalHours=Number(identity.clinical_hours??0);psychologist.sipExpiry=text('sip_expiry');psychologist.strExpiry=text('str_expiry');psychologist.isAvailableToday=String(identity.is_available_today??'true')!=='false';
  const landingCms={...INITIAL_LANDING_CMS,heroBadge:'Konseling, Asesmen dan Psikoterapi',clinicName:text('clinic_name')||'JiwaSehat',clinicAddress:text('address'),clinicPhone:text('phone'),clinicWhatsapp:text('whatsapp'),clinicEmail:text('email'),clinicHours:'',bankName:'',bankAccountNumber:'',bankAccountHolder:'',...data.presentation?.cms.landing};
  landingCms.instagramUrl=publicPracticeText(data.presentation?.cms.landing?.instagramUrl);
  landingCms.sliderTitle=publicPracticeText(data.presentation?.cms.landing?.sliderTitle)||'Pengalaman Pasien';
  landingCms.sliderSubtitle=publicPracticeText(data.presentation?.cms.landing?.sliderSubtitle)||'Ulasan pasien mengenai pengalaman layanan JiwaSehat.';
  for(const [field,key] of Object.entries({clinicAddress:'address',clinicPhone:'phone',clinicWhatsapp:'whatsapp',clinicEmail:'email'})){
    landingCms[field as 'clinicAddress'|'clinicPhone'|'clinicWhatsapp'|'clinicEmail']=publicPracticeText(Object.hasOwn(identity,key)?identity[key]:data.presentation?.cms.landing?.[field]);
  }
  landingCms.clinicHours=publicPracticeText(data.presentation?.cms.landing?.clinicHours)||practiceHours(data.calendar);
  const patientCms={...INITIAL_PATIENT_CMS,welcomeBannerSubtitle:'Kelola booking, pre-test, pembayaran, dan perubahan jadwal konsultasi Anda.',crisisHotlineTitle:'Bantuan segera',crisisHotlineNumber:'',crisisWhatsapp:'',crisisNotice:'Hubungi fasilitas kesehatan terdekat bila membutuhkan pertolongan segera.',...data.presentation?.cms.patient};
  const psychologistCms={...INITIAL_PSYCHOLOGIST_CMS,guidelinesContent:'Tinjau pre-test pasien sebelum pertemuan dan perbarui status sesi sesuai pelaksanaan layanan.',remunerationPolicy:'Pembayaran awal Rp100.000 mengurangi biaya layanan. Tidak ada DP baru untuk reschedule dan sesi lanjutan.',clinicalSupervisorContact:'',letterheadClinicName:text('clinic_name')||'JiwaSehat',letterheadDoctorName:owner?.name??'',letterheadSipNumber:text('sip_number'),letterheadStrNumber:text('str_number'),letterheadAddress:text('address'),letterheadPhone:text('phone'),letterheadEmail:text('email'),letterheadWebsite:'',letterheadCity:'',...data.presentation?.cms.psychologist};
  const intakeForms:Record<string,IntakeForm>={};
  for(const pretest of data.pretests){
    if(!pretest.answers)continue;
    const a=pretest.answers;const profile=data.patients.find(p=>p.id===pretest.patient_id);
    const detail=typeof a.eko_profile==='string'?safeJson(a.eko_profile):{};
    const form:IntakeForm={id:pretest.id,patientId:pretest.patient_id,appointmentId:pretest.appointment_id??undefined,formVersion:'server',completedAt:pretest.submitted_at??'',birthDate:profile?.birth_date??'',gender:profile?.gender==='Perempuan'?'Perempuan':'Laki-laki',occupation:profile?.occupation??'',emergencyContact:{name:'',relationship:'',phone:''},primaryConcerns:[],concernDescription:typeof a.complaint==='string'?a.complaint:'',currentStressLevel:0,sleepQuality:'Cukup',goals:typeof a.goals==='string'?a.goals:'',...detail};
    if(!intakeForms[pretest.patient_id])intakeForms[pretest.patient_id]=form;
    intakeForms[pretest.id]=form;
  }
  const appointments:Appointment[]=(data.appointments as BookingRow[]).map(row=>{
    const bill=data.bills.find(b=>b.id===row.billing_account_id) as BillingRow|undefined;
    const payments=(bill?.payments??[]) as PaymentRow[];
    const pending=payments.find(p=>['PENDING_VERIFICATION','PENDING_RECONCILIATION'].includes(p.status));
    const latest=pending??payments.find(p=>p.proof)??payments[0];
    const verified=payments.filter(p=>p.status==='VERIFIED');
    const received=verified.reduce((n,p)=>n+(p.entry_type==='REVERSAL'?-1:1)*(p.amount??0),0);
    const start=localParts(row.start_at),end=localParts(row.end_at);
    const plan=data.plans.find(p=>p.id===row.treatment_plan_id);
    const initial=verified.filter(p=>p.entry_type==='RECEIPT').at(-1);
    const request=data.reschedules.find(r=>r.appointment_id===row.id&&['REQUESTED','APPROVED','SLOT_SELECTION_REQUIRED','EXPIRED'].includes(r.status));
    const target=request?.start_at?localParts(request.start_at):null;
    const total=bill?.total_due??0,allocated=bill?.verified_received??0,remaining=bill?.remaining_amount??0;
    const paid=(bill as BillingRow&{payment_status?:string})?.payment_status==='PAID'||remaining===0&&!!bill&&data.role!=='ADMIN';
    const created=row.created_at??row.history[0]?.created_at??'';
    const rescheduled=row.history.filter(h=>h.event_type==='RESCHEDULED');
    const lastMove=rescheduled.at(-1);
    return {id:row.id,bookingCode:row.booking_code,patientId:row.patient_id,patientName:row.patient_name,patientEmail:users.find(u=>u.id===row.patient_id)?.email??'',psychologistId:row.psychologist_id??ownerId,psychologistName:owner?.name??'',packageId:row.package_id??'',packageName:row.package_name,packageType:row.category==='PSYCHOTHERAPY'?'PSYCHOTHERAPY':row.category==='ASSESSMENT'?'BUNDLING_ASSESSMENT':row.delivery_mode==='TELE_SERVICE'?'ONLINE_TELE':'OFFLINE_CLINIC',
      date:start.date,startTime:start.time,endTime:end.time,status:statusToView(row.status),paymentStatus:pending?'DP_PENDING_VERIFICATION':paid?'PAID':row.initial_requirement_met?'DP_PAID':'PENDING',
      totalAmount:total,subtotalAmount:total,dpAmount:bill?.initial_minimum_due??0,remainingAmount:remaining,billingMode:'PER_SESSION',initialRequirementMet:row.initial_requirement_met,paymentMethod:latest?methodToView(latest.method):undefined,
      paymentChannelDetail:latest?.channel_detail,transferSenderName:latest?.sender_name,paymentProofName:latest?.proof?'Bukti pembayaran':undefined,paymentProofUrl:latest?.proof?`${window.location.origin}/files/${latest.proof.file_id}/download?inline=1`:undefined,paymentProofMimeType:latest?.proof?.mime_type,paymentProofVersion:latest?.proof?.version,paymentProofState:latest?.proof?.decision==='REJECTED'?'REJECTED':latest?.status==='VERIFIED'?'VERIFIED':latest?.proof?'SUBMITTED':undefined,paymentProofRejectionReason:latest?.reason??undefined,
      paymentVerifiedAt:initial?.received_at??undefined,paymentVerifiedByName:initial?.recorded_by_name,
      initialPaymentRecord:initial&&data.role!=='ADMIN'?{id:initial.id,amount:initial.amount??0,kind:(initial.amount??0)>=total?'FULL':'DP',method:methodToView(initial.method),channelDetail:initial.channel_detail,receivedAt:initial.received_at??initial.created_at??created,verifiedAt:initial.received_at??created,recordedByName:initial.recorded_by_name}:undefined,
      scheduleVersion:row.row_version,rescheduledAt:lastMove?.created_at,
      rescheduleRequest:request?{id:request.id,requestedAt:request.requested_at,expectedScheduleVersion:row.row_version,date:target?.date??'',startTime:target?.time??'',endTime:target?localParts(new Date(Date.parse(request.start_at!)+(Date.parse(row.end_at)-Date.parse(row.start_at))).toISOString()).time:'',reason:request.reason,status:request.status==='REQUESTED'?'REQUESTED':'SLOT_SELECTION_REQUIRED',revision:request.row_version}:undefined,
      rescheduleHistory:rescheduled.map(h=>{const e=h as typeof h&{old_value?:{start_at?:string;end_at?:string};end_at?:string;actor_id?:string;actor_name?:string;actor_role?:User['role'];reason?:string};const from=e.old_value?.start_at?localParts(e.old_value.start_at):start;const to=e.start_at?localParts(e.start_at):start;return {fromDate:from.date,fromStartTime:from.time,fromEndTime:e.old_value?.end_at?localParts(e.old_value.end_at).time:end.time,toDate:to.date,toStartTime:to.time,toEndTime:e.end_at?localParts(e.end_at).time:end.time,at:e.created_at,actorId:e.actor_id??'',actorName:e.actor_name??'Petugas',actorRole:e.actor_role??'PSYCHOLOGIST',reason:e.reason??''};}),
      treatmentPlanId:row.treatment_plan_id??row.assessment_case_id??undefined,treatmentPlanStatus:plan?.status==='DISCONTINUED'?'DISCONTINUED':plan?.status==='COMPLETED'?'COMPLETED':'ACTIVE',continuousSessionNumber:row.session_number??(row.assessment_case_id?data.appointments.filter(a=>a.assessment_case_id===row.assessment_case_id&&a.start_at<=row.start_at).length:1),continuousSessionTotal:plan?.planned_sessions??(row.assessment_case_id?Math.max(2,data.appointments.filter(a=>a.assessment_case_id===row.assessment_case_id).length+1):1),
      meetingLocation:row.delivery_mode==='TELE_SERVICE'?row.meeting?.url??'Link pertemuan akan diinformasikan admin':text('address'),hasIntakeForm:row.profiling_mode==='PAPER'||data.pretests.some(p=>p.appointment_id===row.id),createdAt:created,preTestSnapshot:Object.values(intakeForms).find(f=>f.appointmentId===row.id),
      serverInfo:{rawStatus:row.status,billingId:bill?.id,paymentId:latest?.id,paymentVersion:latest?.row_version,totalDue:total,allocated,cashReceived:received,remaining,initialDue:bill?.initial_minimum_due??0,cashVisible:data.role!=='ADMIN',sourceBillId:bill?.source_bill_id,invoiceIds:bill?.invoices.map(i=>i.id)??[],receiptIds:payments.flatMap(p=>p.receipt_id?[p.receipt_id]:[]),payments:verified.map(p=>({id:p.id,amount:p.amount??0,at:p.received_at??p.created_at??'',method:p.method,actor:p.recorded_by_name??'',reversal:p.entry_type==='REVERSAL'}))}};
  });
  const reviews:Review[]=data.reviews.map(r=>{const apt=appointments.find(a=>a.serverInfo?.billingId===r.billing_account_id);return {id:r.id,appointmentId:apt?.id??'',patientId:apt?.patientId??'',patientName:apt?.patientName??'Pasien',psychologistId:ownerId,psychologistName:owner?.name??'',isAnonymous:r.is_anonymous,rating:r.rating,comment:r.comment??'',isApproved:r.status==='APPROVED',createdAt:apt?.createdAt??''};});
  psychologist.rating=reviews.length?reviews.reduce((n,r)=>n+r.rating,0)/reviews.length:0;psychologist.reviewCount=reviews.length;
  const uniquePayments=new Map(appointments.flatMap(a=>a.serverInfo?.payments??[]).map(p=>[p.id,p]));
  const analytics:AnalyticsSummary={totalAppointments:data.pagination.total,completedSessions:appointments.filter(a=>a.status==='COMPLETED').length,totalRevenue:[...uniquePayments.values()].reduce((n,p)=>n+(p.reversal?-p.amount:p.amount),0),activePatients:new Set(appointments.map(a=>a.patientId)).size,averageRating:psychologist.rating,psychologistCount:owner?1:0,pendingReviews:data.reviews.filter(r=>r.status==='PENDING_MODERATION').length,topConcerns:[]};
  return {currentUser,currentRole:data.role,users,psychologists:ownerId?[psychologist]:[],currentPsychologistProfile:data.role==='PSYCHOLOGIST'?psychologist:null,packages:(data.packages as CatalogRow[]).map(p=>mapPackage(p)),appointments,reviews,intakeForms,analytics,landingCms,patientCms,psychologistCms};
}
function safeJson(value:string):Partial<IntakeForm>{try{const parsed=JSON.parse(value);return Object.fromEntries(Object.entries(parsed).filter(([key])=>['occupation','emergencyContact','primaryConcerns','concernDescription','previousTherapy','previousDiagnosis','currentMedications','currentStressLevel','sleepQuality','goals'].includes(key)));}catch{return {};}}

export function calendarToView(calendar:Workspace['calendar']):PracticeScheduleSettings {
  const days=['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
  return {weeklyDays:(calendar?.weekly??[]).map(d=>({dayName:days[d.day_of_week%7],dayIndex:d.day_of_week%7,isOpen:d.intervals.length>0,startTime:d.intervals[0]?.[0]??'09:00',endTime:d.intervals.at(-1)?.[1]??'17:00',maxPatients:d.daily_limit})),holidays:(calendar?.overrides??[]).filter(o=>o.mode==='CLOSED').map(o=>o.local_date),customDateOverrides:(calendar?.overrides??[]).filter(o=>o.mode==='OPEN').map(o=>({date:o.local_date,isOpen:true,maxPatients:o.daily_limit,startTime:o.intervals[0]?.[0],endTime:o.intervals.at(-1)?.[1],note:o.reason}))};
}
