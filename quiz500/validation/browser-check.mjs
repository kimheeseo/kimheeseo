#!/usr/bin/env node
/* Headless browser regression smoke: Node 22 + installed Chrome, no npm dependencies. */
import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { spawn, spawnSync } from "node:child_process";
const root=path.resolve(import.meta.dirname,"../..");
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const mime={".html":"text/html; charset=utf-8",".js":"application/javascript; charset=utf-8",".json":"application/json; charset=utf-8",".css":"text/css; charset=utf-8",".png":"image/png",".svg":"image/svg+xml",".jpg":"image/jpeg",".woff2":"font/woff2",".pdf":"application/pdf"};
const paths=[
 ["홈","/quiz500/","document.querySelector('#home-bank-count')?.textContent.includes('전체')"],
 ["통신공학","/quiz500/communication-quiz-500/","document.querySelectorAll('#topStats .stat').length===4 && !!document.querySelector('#homeView .trust-switch')"],
 ["무선공학","/quiz500/wireless-quiz-500/","document.querySelectorAll('#topStats .stat').length===4 && !!document.querySelector('#homeView .trust-switch')"],
 ["통신공학 기존 kind 링크","/quiz500/communication-quiz-500/?kind=%EC%BD%94%EB%A0%88%EC%9D%BC%20%EA%B8%B0%EC%B6%9C","document.querySelectorAll('#topStats .stat').length===4 && !!document.querySelector('#homeView .trust-switch')"],
 ["통신공학 기존 unit 링크","/quiz500/communication-quiz-500/?unit=0","document.querySelectorAll('#topStats .stat').length===4 && !!document.querySelector('#homeView .trust-switch')"],
 ["무선공학 기존 unit 링크","/quiz500/wireless-quiz-500/?unit=0","document.querySelectorAll('#topStats .stat').length===4 && !!document.querySelector('#homeView .trust-switch')"],
 ["K-water 원본","/quiz500/kwater-exams/?mode=source","document.querySelectorAll('[data-source-report]').length===40"],
 ["K-water 모의","/quiz500/kwater-exams/?round=2","!!document.querySelector('#kwaterVerifiedOnly')"],
 ["검증 모의고사","/quiz500/mock-exam/","!!document.querySelector('#mock-start') && !document.querySelector('#mock-setup').hidden && document.querySelector('#verified-availability').textContent.includes('전체')"],
 ["직렬별 과목표","/quiz500/exam-subjects/","document.querySelector('table')!==null"],
 ["자료 출처","/quiz500/sources/","document.querySelector('main')!==null"],
 ["공무원 합격선","/quiz500/civil-service-exams/cutoff.html","!!document.querySelector('#cutoff-body')"],
 ["변경 일지","/quiz500/changelog/","document.querySelector('main')!==null"]
];
const chromeBinaries=["google-chrome","google-chrome-stable","chromium","chromium-browser"];
const browser=chromeBinaries.find(bin=>spawnSync("which",[bin],{stdio:"ignore"}).status===0);
if(!browser)throw Error("Chrome/Chromium 실행 파일이 없습니다. 브라우저 검사 불가.");
const server=http.createServer(async(req,res)=>{
 try{
  const requested=decodeURIComponent(new URL(req.url,"http://localhost/").pathname);
  const absolute=path.resolve(root,"."+requested);
  if(absolute!==root&&!absolute.startsWith(root+path.sep)){res.writeHead(403);res.end("Forbidden");return}
  let file=absolute,stat=await fs.stat(file);
  if(stat.isDirectory()){file=path.join(file,"index.html");stat=await fs.stat(file)}
  res.setHeader("Content-Type",mime[path.extname(file)]||"application/octet-stream");
  res.setHeader("Cache-Control","no-store");
  res.writeHead(200);res.end(await fs.readFile(file));
 }catch(e){res.writeHead(404);res.end("Not found")}
});
const listen=()=>new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
const close=()=>new Promise(resolve=>server.close(resolve));
await listen();
const local="http://127.0.0.1:"+server.address().port;
const debug="http://127.0.0.1:9223",profile=await fs.mkdtemp(path.join(os.tmpdir(),"quiz500-cdp-"));
const proc=spawn(browser,["--headless=new","--no-sandbox","--disable-dev-shm-usage","--disable-gpu","--no-first-run","--disable-extensions","--remote-debugging-port=9223","--user-data-dir="+profile,"about:blank"],{stdio:"ignore"});
let exitCode=0;
try{
 let ready=false;
 for(let n=0;n<80;n++){
  if(proc.exitCode!==null)throw Error("Chrome가 실행 중 종료됨 (exit "+proc.exitCode+")");
  try{const r=await fetch(debug+"/json/version",{signal:AbortSignal.timeout(1500)});if(r.ok){ready=true;break}}catch{}
  await pause(150);
 }
 if(!ready)throw Error("Chrome 디버그 연결 시간 초과");
 for(const [name,route,expression] of paths){
  const r=await fetch(debug+"/json/new?"+encodeURIComponent(local+route),{method:"PUT"});
  if(!r.ok)throw Error("Chrome 탭 생성 실패: "+name);
  const target=await r.json();
  const ws=new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject});
  let counter=0;const pending=new Map(),errors=[];
  ws.onmessage=event=>{
   let packet;try{packet=JSON.parse(event.data)}catch{return}
   if(packet.id&&pending.has(packet.id)){const p=pending.get(packet.id);pending.delete(packet.id);if(packet.error)p.reject(Error(packet.error.message));else p.resolve(packet.result);return}
   if(packet.method==="Runtime.exceptionThrown")errors.push("Runtime: "+(packet.params.exceptionDetails.exception?.description||packet.params.exceptionDetails.text));
   if(packet.method==="Runtime.consoleAPICalled"&&packet.params.type==="error")errors.push("console.error: "+packet.params.args.map(a=>a.value??a.description??"").join(" "));
   if(packet.method==="Log.entryAdded"&&packet.params.entry?.level==="error")errors.push("Chrome log: "+packet.params.entry.text);
  };
  const send=(method,params={})=>new Promise((resolve,reject)=>{
   const id=++counter;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}));
  });
  try{
   await send("Runtime.enable");await send("Page.enable");await send("Log.enable");
   await send("Emulation.setDeviceMetricsOverride",{width:360,height:800,deviceScaleFactor:1,mobile:true});
   await send("Page.navigate",{url:local+route});
   let loaded=false,last="";
   for(let attempts=0;attempts<100;attempts++){
    await pause(150);
    const out=await send("Runtime.evaluate",{expression:"(function(){return document.readyState==='complete' && ("+expression+");})()",returnByValue:true});
    loaded=!!out.result?.value;
    if(out.exceptionDetails)last=out.exceptionDetails.text;
    if(loaded)break;
   }
   if(!loaded)errors.push("앱 초기화 확인 실패: "+(last||expression));
   if(loaded){
    await pause(600);
    const dim=await send("Runtime.evaluate",{expression:"({width:window.innerWidth,scrollWidth:document.documentElement.scrollWidth})",returnByValue:true});
    const v=dim.result?.value;
    if(v&&v.scrollWidth>v.width+8)errors.push("360px 가로 넘침: "+v.scrollWidth+"/"+v.width);
   }
   if(errors.length){console.error("FAIL "+name+" "+route+"\n"+errors.join("\n"));exitCode=1}
   else console.log("PASS "+name+" "+route);
  }finally{
   ws.close();
   await fetch(debug+"/json/close/"+target.id).catch(()=>{});
  }
 }
}finally{
 if(proc.exitCode===null&&proc.signalCode===null){
  const exited=new Promise(resolve=>proc.once("close",resolve));
  proc.kill("SIGTERM");
  const terminate=setTimeout(()=>proc.kill("SIGKILL"),5000);terminate.unref();
  await exited;clearTimeout(terminate);
 }
 await close();await fs.rm(profile,{recursive:true,force:true,maxRetries:8,retryDelay:200});
}
if(exitCode)process.exitCode=exitCode;
else console.log("Browser smoke: 13 pages, 360px, JS exceptions and console.error = 0.");
