import {test} from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {createBridge} from './bridge.mjs';

test('pairing and private status require a valid HMAC even while disconnected',async()=>{
 const secret='b'.repeat(64);let paired=0;const server=createBridge({secret,journal:{},ready:()=>false,status:()=>({ready:false,state:'NEEDS_PAIRING'}),pair:async()=>{paired++;return{code:'TESTCODE',expires_at:Date.now()+60000};}});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const call=async(path,signed)=>{const body='[]',timestamp=String(Math.floor(Date.now()/1000));return fetch('http://127.0.0.1:'+server.address().port+path,{method:'POST',headers:signed?{'X-Jiwa-Timestamp':timestamp,'X-Jiwa-Signature':crypto.createHmac('sha256',secret).update(timestamp+'.'+body).digest('hex')}:{},body});};
 try{assert.equal((await call('/pairing',false)).status,401);assert.equal(paired,0);assert.equal((await call('/status',true)).status,200);assert.equal((await(await call('/pairing',true)).json()).code,'TESTCODE');assert.equal(paired,1);const publicStatus=await(await fetch('http://127.0.0.1:'+server.address().port+'/health')).json();assert.deepEqual(publicStatus,{ready:false});}finally{await new Promise(resolve=>server.close(resolve));}
});

test('missing provider acknowledgement remains uncertain on retry',async()=>{
 const items=new Map(),secret='c'.repeat(64);let calls=0;const journal={get:id=>items.get(id),start:(id,hash)=>items.set(id,{hash,state:'PENDING'}),finish:()=>assert.fail('Cannot record SENT without ack')};const server=createBridge({secret,journal,send:async()=>{calls++;return{};}});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const body=JSON.stringify({id:crypto.randomUUID(),phone:'+628111111111',text:'Tes'});const post=()=>{const timestamp=String(Math.floor(Date.now()/1000));return fetch('http://127.0.0.1:'+server.address().port+'/messages',{method:'POST',headers:{'X-Jiwa-Timestamp':timestamp,'X-Jiwa-Signature':crypto.createHmac('sha256',secret).update(timestamp+'.'+body).digest('hex')},body});};try{assert.equal((await post()).status,503);assert.equal((await post()).status,409);assert.equal(calls,1);}finally{await new Promise(resolve=>server.close(resolve));}
});

test('signature, idempotency and uncertainty never claim an unacknowledged message sent',async()=>{
 const items=new Map();let calls=0;const secret='a'.repeat(64);const journal={get:id=>items.get(id),start:(id,hash)=>items.set(id,{hash,state:'PENDING'}),finish:(id,result)=>items.set(id,{...items.get(id),state:'SENT',result:JSON.stringify(result)})};
 const server=createBridge({secret,journal,send:async()=>{calls++;return{id:'provider-ack'};}});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const base='http://127.0.0.1:'+server.address().port;
 const post=async(payload,valid=true)=>{const body=JSON.stringify(payload),timestamp=String(Math.floor(Date.now()/1000));return fetch(base+'/messages',{method:'POST',headers:{'X-Jiwa-Timestamp':timestamp,'X-Jiwa-Signature':valid?crypto.createHmac('sha256',secret).update(timestamp+'.'+body).digest('hex'):'0'.repeat(64)},body});};
 try{const payload={id:crypto.randomUUID(),phone:'+628111111111',text:'Jadwal pengujian'};assert.equal((await post(payload,false)).status,401);assert.equal(calls,0);assert.equal((await post(payload)).status,200);assert.equal((await post(payload)).status,200);assert.equal(calls,1);assert.equal((await post({...payload,text:'Isi berbeda'})).status,409);const uncertain={...payload,id:crypto.randomUUID()};journal.start(uncertain.id,crypto.createHash('sha256').update(JSON.stringify(uncertain)).digest('hex'));assert.equal((await post(uncertain)).status,409);assert.equal(calls,1);}finally{await new Promise(resolve=>server.close(resolve));}
});
test('placeholder bridge does not call provider',async()=>{let sent=false;const server=createBridge({secret:'',journal:{},ready:()=>false,send:async()=>{sent=true;}});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));try{const response=await fetch('http://127.0.0.1:'+server.address().port+'/messages',{method:'POST',body:'{}'});assert.equal(response.status,503);assert.equal(sent,false);}finally{await new Promise(resolve=>server.close(resolve));}});
