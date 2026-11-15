import http from 'node:http';
import {readFileSync} from 'node:fs';
import {execFile} from 'node:child_process';

const host='127.0.0.1';
const port=Number(process.env.MRL_REMOTE_PORT||8765);
const target=process.env.MRL_ADB_TARGET||'192.168.77.4:5555';
const adb=process.env.ADB_BIN||'adb';
const page=readFileSync(new URL('./index.html',import.meta.url),'utf8');
const keys=Object.freeze({home:3,back:4,up:19,down:20,left:21,right:22,ok:23,volumeUp:24,volumeDown:25,mute:164,playPause:85,menu:82});
let resolution={w:1280,h:720};

function run(args,timeout=10000){
  return new Promise((resolve,reject)=>execFile(adb,args,{encoding:'utf8',timeout,maxBuffer:256*1024},(err,stdout,stderr)=>{
    if(err)reject(new Error((stderr||err.message||'Erro ADB').trim().slice(0,250)));
    else resolve(stdout.trim());
  }));
}
function shell(...args){return run(['-s',target,'shell',...args]);}
const clamp=n=>Math.max(0,Math.min(1,Number(n)||0));
function json(res,status,value){
  res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
  res.end(JSON.stringify(value));
}
async function action(route,p){
  if(route==='command'){
    if(typeof p.action==='string' && Object.hasOwn(keys,p.action))
      return shell('input','keyevent',String(keys[p.action]));
    if(p.action==='settings')return shell('am','start','-a','android.settings.SETTINGS');
    throw Error('Comando não permitido');
  }
  if(route==='type'){
    const text=String(p.text||'');
    if(!text||text.length>200)throw Error('Máximo: 200 caracteres');
    if(!/^[\x20-\x7e]+$/.test(text))throw Error('Acentos e Unicode exigem IME no projetor; neste MVP use texto sem acentos');
    return shell('input','text',text.replace(/ /g,'%s'));
  }
  if(route==='gesture'){
    const x=Math.round(clamp(p.x)*resolution.w);
    const y=Math.round(clamp(p.y)*resolution.h);
    if(p.kind==='tap')return shell('input','tap',String(x),String(y));
    if(p.kind==='swipe'){
      const x2=Math.round(clamp(Number(p.x)+Number(p.dx))*resolution.w);
      const y2=Math.round(clamp(Number(p.y)+Number(p.dy))*resolution.h);
      return shell('input','swipe',String(x),String(y),String(x2),String(y2),'180');
    }
    throw Error('Gesto não permitido');
  }
  throw Error('Rota não permitida');
}
http.createServer(async(req,res)=>{
  if(req.method==='GET'&&(req.url==='/'||req.url==='/index.html')){
    res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','X-Frame-Options':'DENY','Cache-Control':'no-store'});res.end(page);return;
  }
  if(req.method==='GET'&&req.url==='/api/status'){
    try{
      const state=await run(['-s',target,'get-state'],2500);
      if(state!=='device')throw Error('Não autorizado');
      const size=await shell('wm','size');
      const match=size.match(/(\d+)x(\d+)/);
      if(match)resolution={w:Number(match[1]),h:Number(match[2])};
      json(res,200,{connected:true,resolution});
    }catch{json(res,200,{connected:false})}
    return;
  }
  if(req.method!=='POST'||!['/api/command','/api/type','/api/gesture'].includes(req.url)){json(res,404,{error:'Não encontrado'});return;}
  const origin=req.headers.origin;
  if(origin && origin!==('http://'+host+':'+port)){json(res,403,{error:'Origem inválida'});return;}
  let data='';
  req.on('data',chunk=>{data+=chunk;if(data.length>4096)req.destroy()});
  req.on('end',async()=>{
    try{await action(req.url.slice(5),JSON.parse(data));json(res,200,{ok:true})}
    catch(err){json(res,400,{error:String(err.message||err).slice(0,160)})}
  });
}).listen(port,host,()=>{
  console.log('Motion Laucher Remoto em http://'+host+':'+port);
  run(['connect',target],4000).catch(()=>{});
});
