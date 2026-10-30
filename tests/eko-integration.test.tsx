import assert from 'node:assert/strict';
import {test} from 'node:test';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {AppContext,type AppContextType} from '../resources/js/context/AppContext';
import {PatientDashboard} from '../resources/js/components/patient/PatientDashboard';
import {AdminDashboard} from '../resources/js/components/admin/AdminDashboard';
import {PsychologistDashboard} from '../resources/js/components/psychologist/PsychologistDashboard';
import {mapWorkspace,mapPackage,methodToServer,localParts} from '../resources/js/integration/mapping';
import {getPaymentSummary,buildCashInReportRows} from '../resources/js/utils/payments';
import type {Workspace} from '../resources/js/types/practice';
import {resolveInertiaPage,PageLoadFailure} from '../resources/js/integration/resolveInertiaPage';
import {adminNavigation} from '../resources/js/components/admin/navigation';
import {compactPracticeHours,practiceHours,publicPracticeText} from '../resources/js/utils/practiceContact';
import {CardRail} from '../resources/js/components/common/CardRail';
import {cardsPerRailPage,railPagination} from '../resources/js/utils/cardRail';
import {revealWhenVisible} from '../resources/js/utils/revealMotion';
import {createActivityStore,describeRequest,IDLE_ACTIVITY,requestActivity} from '../resources/js/practice/requestActivity';
import {RequestStatus,DashboardSkeleton} from '../resources/js/components/common/DataFeedback';
import {send} from '../resources/js/practice/http';

test('feedback: request paralel tidak saling mematikan indikator dan kegagalan selalu melepaskan status',async()=>{
  const store=createActivityStore();
  let notices=0;
  const unsubscribe=store.subscribe(()=>notices++);
  const finishRead=store.begin({kind:'read',label:'Memuat data…'});
  const finishWrite=store.begin({kind:'write',label:'Menyimpan perubahan…'});
  assert.equal(store.getSnapshot().pending,2);
  assert.equal(store.getSnapshot().label,'Menyimpan perubahan…');
  finishRead();finishRead();
  assert.equal(store.getSnapshot().pending,1);
  assert.equal(store.getSnapshot().writing,1);
  finishWrite();
  assert.strictEqual(store.getSnapshot(),IDLE_ACTIVITY);
  await assert.rejects(store.track({kind:'read',scope:'clinical',label:'Memuat pasien…'},async()=>{
    assert.equal(store.getSnapshot().clinical,1);
    throw new Error('Koneksi gagal');
  }),/Koneksi gagal/);
  assert.strictEqual(store.getSnapshot(),IDLE_ACTIVITY);
  const before=notices;unsubscribe();store.begin({kind:'read',label:'Memuat…'})();
  assert.equal(notices,before);
});

test('feedback: send melacak jaringan nyata tanpa mengganti hasil, header, atau error request',async context=>{
  const previousFetch=Object.getOwnPropertyDescriptor(globalThis,'fetch');
  const previousDocument=Object.getOwnPropertyDescriptor(globalThis,'document');
  context.after(()=>{
    if(previousFetch)Object.defineProperty(globalThis,'fetch',previousFetch);else delete (globalThis as any).fetch;
    if(previousDocument)Object.defineProperty(globalThis,'document',previousDocument);else delete (globalThis as any).document;
  });
  let complete!:(value:Response)=>void;
  const response=new Promise<Response>(resolve=>{complete=resolve;});
  let options:RequestInit|undefined;
  Object.defineProperty(globalThis,'document',{configurable:true,value:{querySelector:()=>({content:'test-csrf'})}});
  Object.defineProperty(globalThis,'fetch',{configurable:true,value:async(_path:string,init:RequestInit)=>{options=init;return response;}});
  const task=send<{value:number}>('/work/data',{},'GET');
  assert.equal(requestActivity.getSnapshot().pending,1);
  assert.equal(requestActivity.getSnapshot().reading,1);
  complete(new Response(JSON.stringify({data:{value:7}}),{headers:{'Content-Type':'application/json'}}));
  assert.deepEqual(await task,{value:7});
  assert.equal((options?.headers as Record<string,string>)['X-CSRF-TOKEN'],'test-csrf');
  assert.ok((options?.headers as Record<string,string>)['Idempotency-Key']);
  assert.strictEqual(requestActivity.getSnapshot(),IDLE_ACTIVITY);
  Object.defineProperty(globalThis,'fetch',{configurable:true,value:async()=>{throw new Error('offline');}});
  await assert.rejects(send('/work/data',{},'GET'),/offline/);
  assert.strictEqual(requestActivity.getSnapshot(),IDLE_ACTIVITY);
});

test('feedback: loading, proses lama, error dan kosong siap dibedakan tanpa persentase kemajuan rekaan',()=>{
  const store=createActivityStore();
  const finish=store.begin(describeRequest('/work/data?patient_id=private-patient','GET'));
  const loading=renderToStaticMarkup(<RequestStatus activity={store.getSnapshot()} slow/>);
  assert.ok(loading.includes('Memuat data pasien'));
  assert.ok(loading.includes('Proses masih berjalan'));
  assert.ok(!loading.includes('private-patient'));
  assert.ok(!loading.includes('Data siap'));
  finish();
  assert.ok(renderToStaticMarkup(<RequestStatus activity={IDLE_ACTIVITY} error/>).includes('belum berhasil dimuat'));
  assert.ok(renderToStaticMarkup(<RequestStatus activity={IDLE_ACTIVITY}/>).includes('Data siap'));
  assert.ok(renderToStaticMarkup(<DashboardSkeleton/>).includes('aria-busy="true"'));
  assert.equal(describeRequest('/admin/calendar/preview','POST').kind,'read');
  assert.equal(describeRequest('/files','POST').label,'Mengunggah berkas…');
});

test('Eko: module dashboard gagal dimuat menghasilkan pemulihan manual tanpa mengulang login',async context=>{
  context.mock.method(console,'error',()=>{});
  let calls=0;
  const pages={'./pages/Eko/Workspace.tsx':async()=>{calls++;throw new TypeError('Failed to fetch dynamically imported module: http://[::1]:5173/resources/js/pages/Eko/Workspace.tsx');}};
  const Recovery=await resolveInertiaPage(pages,'Eko/Workspace');
  assert.equal(Recovery,PageLoadFailure);
  assert.equal(calls,1);
  const html=renderToStaticMarkup(<Recovery/>);
  assert.ok(html.includes('Muat ulang halaman'));
  assert.ok(!html.includes('<form'));
  const Ready=()=>null;
  assert.equal(await resolveInertiaPage({'./pages/Home.tsx':async()=>({default:Ready})},'Home'),Ready);
  await assert.rejects(resolveInertiaPage({},'Missing'),/Halaman Inertia tidak ditemukan/);
});

const account={id:'account-patient',name:'Pasien Server',email:'pasien@example.test',phone:'+628111111111',row_version:1};
function fixture(role:Workspace['role']='PATIENT'):Workspace {
  return {role,account:role==='PATIENT'?account:{...account,id:role==='ADMIN'?'account-admin':'owner',name:role},patients:[{id:'profile-1',row_version:1,full_name:'Pasien Server',phone:'+628111111111',birth_date:'1990-01-01',birth_place:null,gender:'Laki-laki',address:'Jakarta',city:'Jakarta',occupation:'Karyawan',emergency_contact:{name:'Keluarga',phone:'+628222222222'}}],appointments:[],pagination:{page:1,last_page:1,total:0},bills:[],packages:[{id:'package-1',row_version:2,version_id:'version-1',service_code:'PSYCHOTHERAPY',category:'PSYCHOTHERAPY',is_active:true,name:'Psikoterapi Server',description:'Empat pertemuan, harga per sesi.',duration_minutes:60,normal_price:500000,promo_price:null,promo_starts_at:null,promo_ends_at:null,delivery_mode:'OFFLINE',additional_time_price_basis:null,benefits:['Sesi privat'],is_bookable:true}],reschedules:[],plans:[],cases:[],consent:{id:'consent-doc',version:1,payload:{body:'Persetujuan layanan'}},template:{id:'template-1',template_key:'profiling',version:1,questions:[]},pretests:[],notifications:[],tutorials:[],reviews:[],setup_ready:true,integrations:{google_sso:'NEEDS_CLIENT_ID',whatsapp:'placeholder'},presentation:{owner:{id:'owner',name:'Psikolog Server',email:'owner@example.test',phone:'+628333333333'},practice:{clinic_name:'Praktik Server',address:'Jakarta'},cms:{}},calendar:{id:'calendar-1',version:1,weekly:Array.from({length:7},(_,i)=>({day_of_week:i+1,daily_limit:i===6?0:5,intervals:i===6?[]:[['09:00','12:00'],['13:00','17:00']]})),overrides:[]},cms:[]};
}
function setupLocation(tab='overview') {
  const location={origin:'http://localhost',pathname:'/pasien/dashboard',search:'?tab='+tab,href:'http://localhost/pasien/dashboard?tab='+tab};
  Object.defineProperty(globalThis,'location',{value:location,configurable:true});
  Object.defineProperty(globalThis,'window',{value:{location,innerWidth:1024},configurable:true});
  Object.defineProperty(globalThis,'localStorage',{value:{getItem:()=>null,setItem:()=>{throw new Error('Server UI must not write LocalStorage');},removeItem:()=>{throw new Error('Server UI must not clear LocalStorage');}},configurable:true});
}
function render(role:Workspace['role'],tab:string){
  setupLocation(tab);const workspace=fixture(role);
  const value={...mapWorkspace(workspace),server:{workspace,revision:0},isSidebarCollapsed:false,activePatientTab:tab,activeAdminTab:tab,activePsychologistTab:tab,schedules:[],slotHolds:[],paymentReconciliations:[],currentPatientModel:null,currentPsychologistModel:null,currentAdminModel:null,toast:null} as unknown as AppContextType;
  return renderToStaticMarkup(<AppContext.Provider value={value}>{role==='PATIENT'?<PatientDashboard/>:role==='ADMIN'?<AdminDashboard/>:<PsychologistDashboard/>}</AppContext.Provider>);
}

test('Eko: seluruh tab role merender komponen FE asli dengan data server',()=>{
  const tabs:Record<Workspace['role'],string[]>={PATIENT:['overview','faq','booking','history'],ADMIN:['reservations','requests','users','reviews'],PSYCHOLOGIST:['overview','finance','schedule','packages','treatmentPlans','patients','cms','history','profile']};
  for(const [role,items] of Object.entries(tabs))for(const tab of items){const html=render(role as Workspace['role'],tab);assert.ok(html.length>500,role+' '+tab);assert.ok(!html.includes('Rian Pratama'),role+' '+tab+' must not load fake patient');}
});

test('Eko: metode pembayaran berakhiran DP/FULL tetap memakai kanal yang benar',()=>{
  assert.equal(methodToServer('CASH_DP'),'CASH');assert.equal(methodToServer('QRIS_FULL'),'QR');assert.equal(methodToServer('EDC_DP'),'EDC');assert.equal(methodToServer('BANK_TRANSFER_DP'),'TRANSFER');
  assert.deepEqual(localParts('2026-10-27T04:00:00Z'),{date:'2026-10-27',time:'11:00'});
});

test('Eko: Admin memiliki empat menu dan tab CMS lama kembali ke booking',()=>{
  assert.deepEqual(adminNavigation.map(tab=>tab.id),['reservations','requests','users','reviews']);
  const html=render('ADMIN','cms');
  assert.ok(!html.includes('Konten Publik'));
  assert.ok(!html.includes('Layanan &amp; Harga'));
  assert.ok(html.includes('Booking'));
});

test('Eko: footer memakai profil terkini, jam kalender dan tidak membocorkan placeholder atau Instagram demo',()=>{
  const source=fixture('PSYCHOLOGIST');
  source.presentation!.practice={address:'Alamat profil baru',phone:'+6281234',clinic_name:'Praktik Server'};
  source.presentation!.cms.landing={clinicAddress:'Alamat CMS lama'};
  const data=mapWorkspace(source);
  assert.equal(data.landingCms.clinicAddress,'Alamat profil baru');
  assert.ok(data.landingCms.clinicHours.includes('Sen 09:00'));
  assert.equal(data.landingCms.instagramUrl,'');
  assert.equal(publicPracticeText('[ALAMAT_PRAKTIK]'),'');
  assert.equal(practiceHours({...source.calendar!,weekly:source.calendar!.weekly.map(day=>({...day,intervals:[]}))}),'Praktik sedang libur');
});

test('Eko: rail layanan dan ulasan menyimpan seluruh kartu serta membatasi akses ke halaman aktif',()=>{
  for(const label of ['Katalog layanan psikologi','Ulasan pasien']){
    const html=renderToStaticMarkup(<CardRail label={label}>{Array.from({length:15},(_,index)=><article key={index}>Kartu {index+1}</article>)}</CardRail>);
    assert.equal((html.match(/<article/g)||[]).length,15);
    assert.equal((html.match(/role="group"[^>]*aria-hidden="true"/g)||[]).length,14);
    assert.ok(html.includes('Menampilkan 1–1 dari 15'));
    assert.ok(html.includes('Halaman 1 / 15'));
  }
});

test('Eko: pagination rail menghitung kartu utuh untuk HP, tablet, desktop dan halaman terakhir',()=>{
  assert.deepEqual([320,390,599,600,959,960,1280].map(cardsPerRailPage),[1,1,1,2,2,3,3]);
  assert.deepEqual(railPagination(15,3,0),{pages:5,page:0,first:1,last:3});
  assert.deepEqual(railPagination(15,3,4),{pages:5,page:4,first:13,last:15});
  assert.deepEqual(railPagination(16,3,99),{pages:6,page:5,first:16,last:16});
  assert.deepEqual(railPagination(1,3,2),{pages:1,page:0,first:1,last:1});
  assert.deepEqual(railPagination(0,1,0),{pages:1,page:0,first:0,last:0});
});

test('Eko: jam footer ringkas tanpa menggabungkan rentang hari yang berbeda',()=>{
  assert.equal(compactPracticeHours('Sen 08:00–12:00, 13:00–16:00; Sel 08:00–12:00, 13:00–16:00 WIB'),'08:00 - 16:00 WIB');
  assert.equal(compactPracticeHours('Sen 08:00–16:00; Sab 09:00–12:00 WIB'),'08:00 - 16:00 / 09:00 - 12:00 WIB');
  assert.equal(compactPracticeHours('Praktik sedang libur'),'Praktik sedang libur');
  assert.equal(compactPracticeHours('Sesuai janji temu'),'Sesuai janji temu');
  assert.equal(compactPracticeHours(''),'');
});

test('Eko: reveal menunggu kartu terlihat, berjalan sekali dan membatalkan animasi saat dilepas',context=>{
  const previousObserver=Object.getOwnPropertyDescriptor(globalThis,'IntersectionObserver');
  const previousWindow=Object.getOwnPropertyDescriptor(globalThis,'window');
  context.after(()=>{if(previousObserver)Object.defineProperty(globalThis,'IntersectionObserver',previousObserver);else delete (globalThis as any).IntersectionObserver;if(previousWindow)Object.defineProperty(globalThis,'window',previousWindow);else delete (globalThis as any).window;});
  let notify:(entries:any[])=>void=()=>{};
  let disconnected=0,cancelled=0;
  const calls:any[]=[];
  const animations:any[]=[];
  Object.defineProperty(globalThis,'window',{configurable:true,value:{matchMedia:()=>({matches:false})}});
  Object.defineProperty(globalThis,'IntersectionObserver',{configurable:true,value:class{constructor(callback:any){notify=callback;}observe(){}unobserve(){}disconnect(){disconnected++;}}});
  const element={children:Array.from({length:3},()=>({animate(_frames:any,options:any){calls.push(options);const animation={cancel(){cancelled++;},onfinish:null};animations.push(animation);return animation;}}))} as unknown as Element;
  const cleanup=revealWhenVisible(element,{targets:()=>Array.from(element.children),stagger:75});
  assert.equal(calls.length,0);
  notify([{target:element,isIntersecting:false}]);
  assert.equal(calls.length,0);
  notify([{target:element,isIntersecting:true}]);
  assert.equal(calls.length,3);
  assert.ok(calls[1].delay>calls[0].delay);
  notify([{target:element,isIntersecting:true}]);
  assert.equal(calls.length,3);
  animations[0].onfinish();
  cleanup();
  assert.equal(disconnected,1);
  assert.equal(cancelled,2);
});

test('Eko: data profil tidak disamakan dengan ID akun dan tidak memakai pasien demo',()=>{
  setupLocation();const data=mapWorkspace(fixture());assert.equal(data.currentUser.id,'profile-1');assert.equal(data.currentUser.email,account.email);assert.equal(data.currentUser.isProfileComplete,true);assert.equal(data.users.filter(u=>u.role==='PATIENT').length,1);assert.equal(data.packages[0].price,500000);
});

test('Eko: promo, notes, dan kategori bertahan pada adapter katalog',()=>{
  const row={...fixture().packages[0],promo_price:400000,presentation:{discount_type:'PERCENT' as const,discount_value:20,discount_label:'Promo psikolog',notes:'Catatan layanan'}};
  const pkg=mapPackage(row);assert.equal(pkg.category,'PSIKOTERAPI');assert.equal(pkg.discountType,'PERCENT');assert.equal(pkg.discountValue,20);assert.equal(pkg.notes,'Catatan layanan');assert.equal(pkg.sessionCount,4);
});

test('Eko: prabayar rangkaian dihitung sekali dan koreksi kas ikut laporan',()=>{
  setupLocation();const data=fixture();
  const payment:any={id:'receipt-1',row_version:1,status:'VERIFIED',entry_type:'RECEIPT',method:'CASH',amount:2000000,received_at:'2026-10-26T05:00:00Z',reason:null,proof:null};
  data.plans=[{id:'plan-1',patient_id:'profile-1',row_version:1,status:'ACTIVE',planned_sessions:4}];
  for(let n=1;n<=2;n++){
    data.appointments.push({id:'appointment-'+n,row_version:1,booking_code:'JS-'+n,patient_id:'profile-1',patient_name:'Pasien Server',package_version_id:'version-1',package_name:'Psikoterapi Server',category:'PSYCHOTHERAPY',delivery_mode:'OFFLINE',appointment_kind:'STANDARD_SERVICE',payment_requirement:'REQUIRED',profiling_mode:'DIGITAL',start_at:`2026-10-${26+n}T04:00:00Z`,end_at:`2026-10-${26+n}T05:00:00Z`,status:n===1?'COMPLETED':'CONFIRMED',attempt_number:1,requires_reschedule:false,billing_account_id:'bill-'+n,initial_requirement_met:true,treatment_plan_id:'plan-1',assessment_case_id:null,session_number:n,assessment_role:null,hold_expires_at:null,correction_deadline_at:null,additional_time:{revision:0,total_minutes:0},meeting:null,history:[]});
    data.bills.push({id:'bill-'+n,row_version:1,patient_id:'profile-1',collection_status:'OPEN',total_due:500000,initial_requirement_met:true,verified_received:500000,remaining_amount:0,payments:[payment],lines:[],invoices:[]});
  }
  const appointments=mapWorkspace(data).appointments;const summary=getPaymentSummary(appointments[0],appointments);
  assert.equal(summary.cashReceived,2000000);assert.equal(summary.totalAmount,1000000);assert.equal(summary.prepaidAmount,1000000);assert.equal(summary.remainingByFinal,0);
  assert.equal(buildCashInReportRows(appointments).length,1);
  data.bills[0].payments.push({...payment,id:'reversal-1',entry_type:'REVERSAL',amount:100000});
  const rows=buildCashInReportRows(mapWorkspace(data).appointments);assert.equal(rows.reduce((sum,row)=>sum+row.cashInAmount,0),1900000);
});
