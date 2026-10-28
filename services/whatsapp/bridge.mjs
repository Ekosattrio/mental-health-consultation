import http from 'node:http';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {DatabaseSync} from 'node:sqlite';

export function createJournal(directory){
 fs.mkdirSync(directory,{recursive:true,mode:0o700});const db=new DatabaseSync(path.join(directory,'state.sqlite'));db.exec('PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000; CREATE TABLE IF NOT EXISTS outbound(id TEXT PRIMARY KEY,hash TEXT NOT NULL,state TEXT NOT NULL,result TEXT); CREATE TABLE IF NOT EXISTS auth(k TEXT PRIMARY KEY,v TEXT NOT NULL)');
 return {db,get:id=>db.prepare('SELECT * FROM outbound WHERE id=?').get(id),start:(id,hash)=>db.prepare('INSERT INTO outbound(id,hash,state) VALUES(?,?,?)').run(id,hash,'PENDING'),finish:(id,result)=>db.prepare('UPDATE outbound SET state=?,result=? WHERE id=?').run('SENT',JSON.stringify(result),id)};
}

export function createBridge({secret,journal,send,ready=()=>true,status=()=>({ready:ready()}),pair=async()=>({error:'PAIRING_UNAVAILABLE'})}){
 const inFlight=new Map();
 const respond=(res,status,body)=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(body));};
 return http.createServer(async(req,res)=>{
  if(req.method==='GET'&&req.url==='/health'){respond(res,200,{ready:ready()&&Boolean(secret&&secret.length>=32)});return;}
  if(req.method!=='POST'||!['/messages','/status','/pairing'].includes(req.url)){respond(res,404,{error:'NOT_FOUND'});return;}
  if(!secret||secret.length<32){respond(res,503,{error:'NOT_CONFIGURED_OR_DISCONNECTED'});return;}
  const timestamp=String(req.headers['x-jiwa-timestamp']??'');const signature=String(req.headers['x-jiwa-signature']??'');
  if(!/^\d{10}$/.test(timestamp)||Math.abs(Date.now()/1000-Number(timestamp))>60||!/^[a-f0-9]{64}$/.test(signature)){respond(res,401,{error:'UNAUTHORIZED'});return;}
  let raw='';try{for await(const chunk of req){raw+=chunk;if(Buffer.byteLength(raw)>16384){respond(res,413,{error:'TOO_LARGE'});return;}}}catch{respond(res,400,{error:'INVALID_REQUEST'});return;}
  const expected=crypto.createHmac('sha256',secret).update(timestamp+'.'+raw).digest();if(!crypto.timingSafeEqual(expected,Buffer.from(signature,'hex'))){respond(res,401,{error:'UNAUTHORIZED'});return;}
  if(req.url==='/status'){respond(res,200,status());return;}
  if(req.url==='/pairing'){try{respond(res,200,await pair());}catch{respond(res,503,{error:'PAIRING_UNAVAILABLE'});}return;}
  if(!ready()){respond(res,503,{error:'NOT_CONFIGURED_OR_DISCONNECTED'});return;}
  let input;try{input=JSON.parse(raw);}catch{respond(res,400,{error:'INVALID_JSON'});return;}
  if(typeof input.id!=='string'||!/^[a-f0-9-]{36}$/i.test(input.id)||typeof input.phone!=='string'||!/^\+[1-9]\d{7,14}$/.test(input.phone)||typeof input.text!=='string'||input.text.length<1||input.text.length>5000){respond(res,422,{error:'INVALID_PAYLOAD'});return;}
  const hash=crypto.createHash('sha256').update(raw).digest('hex');const existing=journal.get(input.id);
  if(existing){if(existing.hash!==hash){respond(res,409,{error:'IDEMPOTENCY_MISMATCH'});return;}if(existing.state==='SENT'){respond(res,200,JSON.parse(existing.result));return;}if(inFlight.has(input.id)){try{respond(res,200,await inFlight.get(input.id));}catch{respond(res,503,{error:'DELIVERY_UNCERTAIN'});}return;}respond(res,409,{error:'DELIVERY_UNCERTAIN_CHECK_WHATSAPP_BEFORE_RESEND'});return;}
  journal.start(input.id,hash);
  const promise=(async()=>{const result=await send(input.phone,input.text);if(typeof result?.id!=='string'||!result.id){throw new Error('Missing acknowledgement');}const receipt={id:result.id};journal.finish(input.id,receipt);return receipt;})();inFlight.set(input.id,promise);
  try{respond(res,200,await promise);}catch{respond(res,503,{error:'DELIVERY_UNCERTAIN'});}finally{inFlight.delete(input.id);}
 });
}

export async function connectBaileys(journal,phone,onReady){
 const sdk=await import('@whiskeysockets/baileys');const logger={level:'silent',trace(){},debug(){},info(){},warn(){},error(){},fatal(){},child(){return this;}};
 const read=key=>{const row=journal.db.prepare('SELECT v FROM auth WHERE k=?').get(key);return row?JSON.parse(row.v,sdk.BufferJSON.reviver):null;};
 const write=(key,value)=>{if(value===null||value===undefined){journal.db.prepare('DELETE FROM auth WHERE k=?').run(key);}else{journal.db.prepare('INSERT INTO auth(k,v) VALUES(?,?) ON CONFLICT(k) DO UPDATE SET v=excluded.v').run(key,JSON.stringify(value,sdk.BufferJSON.replacer));}};
 const creds=read('creds')??sdk.initAuthCreds();
 const keys={get:async(type,ids)=>Object.fromEntries(ids.map(id=>{let value=read(type+'-'+id);if(type==='app-state-sync-key'&&value){value=sdk.proto.Message.AppStateSyncKeyData.fromObject(value);}return[id,value];})),set:async(data)=>{journal.db.exec('BEGIN');try{for(const[type,items]of Object.entries(data)){for(const[id,value]of Object.entries(items)){write(type+'-'+id,value);}}journal.db.exec('COMMIT');}catch(e){journal.db.exec('ROLLBACK');throw e;}}};
 let socket;let stopped=false;let canPair=false;let pairing=null;let pairingTask=null;let isReady=false;let state='CONNECTING';
 const connect=async()=>{
  canPair=false;state='CONNECTING';
  socket=sdk.default({auth:{creds,keys},logger,markOnlineOnConnect:false,syncFullHistory:false,browser:sdk.Browsers.macOS('Chrome'),getMessage:async()=>undefined});
  socket.ev.on('creds.update',()=>write('creds',creds));
  socket.ev.on('connection.update',update=>{if(update.qr){canPair=true;state='NEEDS_PAIRING';}if(update.connection==='open'){isReady=true;state='CONNECTED';pairing=null;onReady(true);process.stdout.write('WhatsApp terhubung.\n');}if(update.connection==='close'){isReady=false;canPair=false;pairing=null;onReady(false);if(update.lastDisconnect?.error?.output?.statusCode===sdk.DisconnectReason.loggedOut){stopped=true;state='LOGGED_OUT';process.stderr.write('Sesi WhatsApp keluar. Pulihkan melalui operator.\n');}else if(!stopped){state='RECONNECTING';setTimeout(()=>connect().catch(()=>{state='CONNECTION_FAILED';onReady(false);}),5000).unref();}}});
  if(!creds.registered&&!/^\+[1-9]\d{7,14}$/.test(phone??'')){throw new Error('Isi WHATSAPP_PAIRING_PHONE sebelum mengaktifkan bridge.');}
 };
 await connect();return {status:()=>({ready:isReady,state,sender_phone:phone,registered:Boolean(creds.registered)}),pair:async()=>{if(creds.registered||isReady)return {ready:isReady,state:'ALREADY_REGISTERED'};if(!canPair||stopped)throw new Error('Connection not ready');if(pairing&&pairing.expires_at>Date.now())return pairing;if(pairingTask)return pairingTask;pairingTask=(async()=>{const code=await socket.requestPairingCode(phone.slice(1));pairing={code,expires_at:Date.now()+60000};return pairing;})();try{return await pairingTask;}finally{pairingTask=null;}},send:async(phone,text)=>{if(!isReady)throw new Error('Disconnected');const sent=await socket.sendMessage(phone.slice(1)+'@s.whatsapp.net',{text});return{id:sent?.key?.id};},stop:()=>{stopped=true;socket?.end();}};
}
