import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createBridge,createJournal,connectBaileys} from './bridge.mjs';
process.umask(0o077);
const directory=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'storage');const journal=createJournal(directory);
let isReady=false;let client;const enabled=process.env.WHATSAPP_ENABLED==='true';
const server=createBridge({secret:process.env.WHATSAPP_BRIDGE_SECRET,journal,ready:()=>enabled&&isReady,status:()=>client?.status()??{ready:false,state:enabled?'CONNECTING':'DISABLED'},pair:()=>{if(!client)throw new Error('Not ready');return client.pair();},send:(phone,text)=>client.send(phone,text)});
server.listen(Number(process.env.WHATSAPP_BRIDGE_PORT??3210),'127.0.0.1',async()=>{
 process.stdout.write('Bridge WhatsApp hanya mendengarkan loopback. '+(enabled?'Menyiapkan koneksi.':'Placeholder aktif; tidak mengirim pesan.')+'\n');
 if(enabled){try{client=await connectBaileys(journal,process.env.WHATSAPP_PAIRING_PHONE,value=>{isReady=value;});}catch{process.stderr.write('Konfigurasi/penautan WhatsApp belum selesai; tidak mengirim pesan.\n');}}
});
for(const signal of ['SIGINT','SIGTERM']){process.on(signal,()=>{isReady=false;client?.stop();server.close(()=>{journal.db.close();process.exit(0);});});}
