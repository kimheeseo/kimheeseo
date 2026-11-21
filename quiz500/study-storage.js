/* Quiz500 StudyStore v1: localStorage adapter, legacy preservation, spaced repetition and portable backup. */
(function(root){
"use strict";
const PREFIX="quiz500_study_v1_",INTERVALS=[1,3,7,14],DAY=86400000,DAY7=7*DAY;
const memory={},oldKeys={};
function readLegacy(key){try{return JSON.parse(localStorage.getItem(key)||"null")}catch{return null}}
function writeLegacy(key,data){try{localStorage.setItem(key,JSON.stringify(data));return true}catch{return false}}
function key(subject){return PREFIX+subject}
function empty(subject){return {schemaVersion:1,subject,items:{},events:[],sessions:[],createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()}}
function valid(x,subject){return !!x&&typeof x==="object"&&!Array.isArray(x)&&x.subject===subject&&x.items&&typeof x.items==="object"&&!Array.isArray(x.items)&&Array.isArray(x.events)&&Array.isArray(x.sessions)}
function load(subject){
 if(memory[subject])return memory[subject];
 const raw=readLegacy(key(subject));
 return memory[subject]=valid(raw,subject)?raw:empty(subject);
}
function write(subject){
 const doc=load(subject);doc.updatedAt=new Date().toISOString();
 return writeLegacy(key(subject),doc);
}
function hydrate(subject,legacy={},legacyKey){
 if(legacyKey)oldKeys[subject]=legacyKey;
 const doc=load(subject);
 // Only fill absent items. This never inflates existing counters on repeat visits.
 const progress=legacy.progress&&typeof legacy.progress==="object"?legacy.progress:{};
 const bookmarks=new Set(Array.isArray(legacy.bookmarks)?legacy.bookmarks:[]);
 for(const [id,v] of Object.entries(progress)){
  if(doc.items[id]||!v||typeof v!=="object")continue;
  const seen=Math.max(0,Math.floor(Number(v.seen||0)));
  const correct=Math.max(0,Math.floor(Number(v.correct||0)));
  const wrong=Math.max(0,Math.floor(Number(v.wrong||0)));
  doc.items[id]={id,attempts:seen,correct,wrong,pending:Math.max(0,seen-correct-wrong),
   lastAt:v.lastAt&&Number.isFinite(Date.parse(v.lastAt))?new Date(v.lastAt).toISOString():null,
   lastDurationMs:null,totalDurationMs:null,bookmark:bookmarks.has(id),memo:"",
   chapter:null,topic:null,stage:null,nextDueAt:null,lastCorrect:typeof v.lastCorrect==="boolean"?v.lastCorrect:null};
 }
 for(const id of bookmarks){
  if(doc.items[id])doc.items[id].bookmark=true;
  else doc.items[id]={id,attempts:0,correct:0,wrong:0,pending:0,lastAt:null,lastDurationMs:null,totalDurationMs:null,bookmark:true,memo:"",chapter:null,topic:null,stage:null,nextDueAt:null,lastCorrect:null};
 }
 write(subject);return doc;
}
function item(subject,id){
 const doc=load(subject);
 if(!doc.items[id])doc.items[id]={id,attempts:0,correct:0,wrong:0,pending:0,lastAt:null,lastDurationMs:null,totalDurationMs:null,bookmark:false,memo:"",chapter:null,topic:null,stage:null,nextDueAt:null,lastCorrect:null};
 return doc.items[id];
}
function record(subject,q,{correct=false,graded=true,durationMs=null,at=Date.now()}={}){
 if(!q||!q.id)return;
 const doc=load(subject),p=item(subject,q.id),ts=Number.isFinite(Number(at))?Number(at):Date.now();
 const time=Number.isFinite(Number(durationMs))&&durationMs!==null?Math.max(0,Math.min(86400000,Math.floor(durationMs))):null;
 p.attempts++;p.lastAt=new Date(ts).toISOString();p.chapter=q.chapter||p.chapter;p.topic=q.topic||p.topic;
 p.lastDurationMs=time;if(time!==null)p.totalDurationMs=(p.totalDurationMs??0)+time;
 if(graded){
  if(correct){p.correct++;if(p.nextDueAt){p.stage=Math.min(3,(p.stage??0)+1);p.nextDueAt=new Date(ts+INTERVALS[p.stage]*DAY).toISOString();}}
  else {p.wrong++;p.stage=0;p.nextDueAt=new Date(ts+INTERVALS[0]*DAY).toISOString();}
  p.lastCorrect=!!correct;
 }else{p.pending++;p.lastCorrect=null;}
 doc.events.push({id:q.id,subject,chapter:q.chapter||"",topic:q.topic||"",at:new Date(ts).toISOString(),durationMs:time,graded:!!graded,correct:graded?!!correct:null});
 if(doc.events.length>10000)doc.events.splice(0,doc.events.length-10000);
 write(subject);return p;
}
function setBookmark(subject,id,value){const p=item(subject,id);p.bookmark=!!value;write(subject)}
function setMemo(subject,id,value){const p=item(subject,id);p.memo=String(value??"").slice(0,5000);write(subject)}
function due(subject,now=Date.now()){
 return Object.values(load(subject).items).filter(p=>p.nextDueAt&&Number.isFinite(Date.parse(p.nextDueAt))&&Date.parse(p.nextDueAt)<=now).sort((a,b)=>Date.parse(a.nextDueAt)-Date.parse(b.nextDueAt));
}
function stats(subject,bank=[]){
 const doc=load(subject),now=Date.now(),since=now-DAY7;
 const recent=doc.events.filter(e=>Date.parse(e.at)>=since&&Date.parse(e.at)<=now);
 const chapters=new Map(),lookup=new Map((bank||[]).map(q=>[q.id,q]));
 for(const p of Object.values(doc.items)){
  const ch=p.chapter||lookup.get(p.id)?.chapter||"미분류";
  const x=chapters.get(ch)||{chapter:ch,correct:0,wrong:0,attempts:0};
  x.correct+=p.correct||0;x.wrong+=p.wrong||0;x.attempts+=(p.correct||0)+(p.wrong||0);chapters.set(ch,x);
 }
 const unitRates=[...chapters.values()].map(x=>({...x,rate:x.attempts?Math.round(x.correct/x.attempts*100):0})).sort((a,b)=>b.attempts-a.attempts);
 const topWrong=[...unitRates].filter(x=>x.wrong>0).sort((a,b)=>b.wrong-a.wrong||a.rate-b.rate||a.chapter.localeCompare(b.chapter)).slice(0,3);
 return {due:due(subject),recent7:recent.length,unitRates,topWrong,attempts:Object.values(doc.items).reduce((n,p)=>n+(p.attempts||0),0),totalSubjects:bank.length};
}
function addSession(subject,session){const d=load(subject);d.sessions.unshift({...session,at:new Date().toISOString()});d.sessions=d.sessions.slice(0,300);write(subject)}
function backup(subject,legacy){
 return {format:"quiz500-study-backup",version:1,subject,exportedAt:new Date().toISOString(),record:JSON.parse(JSON.stringify(load(subject))),legacy:legacy||null}
}
function exportFile(subject,legacy){
 const payload=JSON.stringify(backup(subject,legacy),null,2),blob=new Blob([payload],{type:"application/json;charset=utf-8"});
 const href=URL.createObjectURL(blob),a=document.createElement("a");a.href=href;
 a.download="quiz500_"+subject+"_backup_"+new Date().toISOString().slice(0,10)+".json";a.click();
 setTimeout(()=>URL.revokeObjectURL(href),1500);
}
async function importFile(subject,file){
 const parsed=JSON.parse(await file.text());
 if(parsed.format!=="quiz500-study-backup"||parsed.version!==1||parsed.subject!==subject||!valid(parsed.record,subject))throw Error("다른 과목이거나 올바르지 않은 백업 파일입니다.");
 // Limit unexpectedly huge or hostile files. Import does not execute any file content.
 if(file.size>25*1024*1024||Object.keys(parsed.record.items).length>100000||parsed.record.events.length>10000)throw Error("백업 파일 크기가 허용 범위를 초과했습니다.");
 if(!confirm("현재 브라우저의 "+subject+" 학습 기록을 백업 파일의 기록으로 교체할까요?"))return false;
 memory[subject]=parsed.record;if(!write(subject))throw Error("브라우저 저장 공간이 부족합니다.");
 if(parsed.legacy&&oldKeys[subject])writeLegacy(oldKeys[subject],parsed.legacy);
 return true;
}
function legacyKey(subject){return oldKeys[subject]||null}
root.StudyStore={readLegacy,writeLegacy,hydrate,load,item,record,setBookmark,setMemo,due,stats,addSession,backup,exportFile,importFile,legacyKey};
})(window);
