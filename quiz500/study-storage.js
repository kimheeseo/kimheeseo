/* Single persistence boundary. Keep schemaVersion=1 and old keys for existing users. */
(function(root){'use strict';
const PREFIX='quiz500_study_v1_',SUBJECTS=['comm','wireless','kwater'],INTERVALS=[1,3,7,14],DAY=86400000;
const LEGACY={comm:'comms500_prefs_v2',wireless:'wireless500_prefs_v2',kwater:'kwater_study_v1'};
const memory=Object.create(null),oldKeys={...LEGACY};
let storageOK=true;
function getRaw(k){try{return root.localStorage.getItem(k)}catch{storageOK=false;return null}}
function setRaw(k,v){try{root.localStorage.setItem(k,v);return true}catch{storageOK=false;root.dispatchEvent?.(new Event('quiz-storage-error'));return false}}
function removeRaw(k){try{root.localStorage.removeItem(k);return true}catch{storageOK=false;return false}}
function readLegacy(k){try{return JSON.parse(getRaw(k)||'null')}catch{return null}}
function writeLegacy(k,v){return setRaw(k,JSON.stringify(v))}
function empty(subject){return {schemaVersion:1,subject,items:{},events:[],sessions:[],migrations:[],createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()}}
function ownObject(x){return !!x&&typeof x==='object'&&!Array.isArray(x)}
function safeID(id){return typeof id==='string'&&id.length>0&&id.length<=200&&!['__proto__','constructor','prototype'].includes(id)}
function count(n){return Number.isSafeInteger(n)&&n>=0&&n<=1e9}
function date(v){return v===null||typeof v==='string'&&Number.isFinite(Date.parse(v))}
function valid(doc,subject){
 if(!ownObject(doc)||doc.schemaVersion!==1||doc.subject!==subject||!ownObject(doc.items)||!Array.isArray(doc.events)||!Array.isArray(doc.sessions))return false;
 if(Object.keys(doc.items).length>100000||doc.events.length>100000||doc.sessions.length>10000)return false;
 for(const [id,p] of Object.entries(doc.items)){
  if(!safeID(id)||!ownObject(p)||p.id!==id||!['attempts','correct','wrong','pending'].every(k=>count(p[k]))||p.correct+p.wrong+p.pending!==p.attempts)return false;
  if(!date(p.lastAt)||!date(p.nextDueAt)||!(p.stage===null||[0,1,2,3].includes(p.stage))||typeof p.bookmark!=='boolean'||typeof p.memo!=='string'||p.memo.length>5000)return false;
  for(const k of ['lastDurationMs','totalDurationMs'])if(p[k]!==null&&(!Number.isSafeInteger(p[k])||p[k]<0))return false;
 }
 return doc.events.every(e=>ownObject(e)&&safeID(e.id)&&typeof e.at==='string'&&date(e.at)&&typeof e.graded==='boolean'&&(e.correct===null||typeof e.correct==='boolean')&&(e.durationMs===null||Number.isFinite(e.durationMs)&&e.durationMs>=0)&&typeof e.chapter==='string')&&doc.sessions.every(s=>ownObject(s)&&typeof s.at==='string'&&date(s.at));
}
function load(subject){if(!SUBJECTS.includes(subject))throw Error('알 수 없는 과목입니다.');if(memory[subject])return memory[subject];const raw=readLegacy(PREFIX+subject);return memory[subject]=valid(raw,subject)?raw:empty(subject)}
function write(subject){const doc=load(subject);doc.updatedAt=new Date().toISOString();return writeLegacy(PREFIX+subject,doc)}
function fresh(id){return {id,attempts:0,correct:0,wrong:0,pending:0,lastAt:null,lastDurationMs:null,totalDurationMs:null,bookmark:false,memo:'',chapter:null,topic:null,stage:null,nextDueAt:null,lastCorrect:null}}
function item(subject,id){if(!safeID(id))throw Error('문항 ID 형식 오류');const d=load(subject);if(!Object.hasOwn(d.items,id))d.items[id]=fresh(id);return d.items[id]}
function legacyTime(v){if(typeof v==='number'&&Number.isFinite(v))return new Date(v).toISOString();return typeof v==='string'&&Number.isFinite(Date.parse(v))?new Date(v).toISOString():null}
function hydrate(subject,legacy={},legacyKey){
 if(legacyKey)oldKeys[subject]=legacyKey;
 const doc=load(subject),migration='legacy-v2:'+(legacyKey||subject);doc.migrations=Array.isArray(doc.migrations)?doc.migrations:[];
 if(subject==='comm'&&!doc.migrations.includes('legacy-mock-sessions-v1')){const old=readLegacy(PREFIX+'mock');if(Array.isArray(old?.sessions)){for(const [i,v]of old.sessions.entries()){if(!ownObject(v)||!date(v.at)||typeof v.at!=='string')continue;const id=v.id||'legacy-mock-'+v.at+'-'+i;if(doc.sessions.some(s=>s.id===id))continue;doc.sessions.push({...v,id,kind:'mock',target:v.target==='seoulmetro'?'metro':v.target,minutes:v.minutes??v.durationMinutes,units:v.units??v.chapterCorrect??[]})}}doc.migrations.push('legacy-mock-sessions-v1');write(subject)}

 if(doc.migrations.includes(migration))return doc;
 const progress=ownObject(legacy.progress)?legacy.progress:{},bookmarks=new Set(Array.isArray(legacy.bookmarks)?legacy.bookmarks.filter(safeID):[]);
 for(const [id,v] of Object.entries(progress)){
  if(!safeID(id)||!ownObject(v))continue;
  const existed=Object.hasOwn(doc.items,id),p=item(subject,id);
  if(!existed){p.correct=Math.max(0,Math.floor(Number(v.correct)||0));p.wrong=Math.max(0,Math.floor(Number(v.wrong)||0));p.attempts=Math.max(p.correct+p.wrong,Math.floor(Number(v.seen)||0));p.pending=p.attempts-p.correct-p.wrong;p.lastCorrect=typeof v.lastCorrect==='boolean'?v.lastCorrect:null;p.bookmark=bookmarks.has(id)}
  if(!p.lastAt)p.lastAt=legacyTime(v.lastAt);
  if(p.lastCorrect===false&&!p.nextDueAt){p.stage=0;p.nextDueAt=new Date((p.lastAt?Date.parse(p.lastAt):Date.now())+DAY).toISOString()}
 }
 for(const id of bookmarks)if(!Object.hasOwn(doc.items,id))item(subject,id).bookmark=true;
 doc.migrations.push(migration);write(subject);return doc;
}
function legacySnapshot(subject,original,record=load(subject)){
 const legacy=ownObject(original)?JSON.parse(JSON.stringify(original)):readLegacy(oldKeys[subject])||{};
 if(subject==='kwater')return legacy;
 legacy.progress={};legacy.bookmarks=[];
 for(const p of Object.values(record.items)){legacy.progress[p.id]={seen:p.attempts,correct:p.correct,wrong:p.wrong,lastAt:p.lastAt?Date.parse(p.lastAt):null,lastCorrect:p.lastCorrect};if(p.bookmark)legacy.bookmarks.push(p.id)}
 if(!Array.isArray(legacy.history))legacy.history=[];return legacy;
}
function record(subject,q,{correct=false,graded=true,durationMs=null,at=Date.now(),syncLegacy=false,attemptId=null}={}){
 if(!q||!safeID(q.id))return;
 const doc=load(subject);if(attemptId&&doc.events.some(e=>e.attemptId===attemptId))return item(subject,q.id);
 const p=item(subject,q.id),ts=Number.isFinite(Number(at))?Number(at):Date.now(),time=durationMs!==null&&Number.isFinite(Number(durationMs))?Math.max(0,Math.min(DAY,Math.floor(Number(durationMs)))):null;
 p.attempts++;p.lastAt=new Date(ts).toISOString();p.chapter=q.chapter||p.chapter;p.topic=q.topic||p.topic;p.lastDurationMs=time;if(time!==null)p.totalDurationMs=(p.totalDurationMs??0)+time;
 if(graded){if(correct){p.correct++;if(p.nextDueAt){p.stage=Math.min(3,(p.stage??0)+1);p.nextDueAt=new Date(ts+INTERVALS[p.stage]*DAY).toISOString()}}else{p.wrong++;p.stage=0;p.nextDueAt=new Date(ts+DAY).toISOString()}p.lastCorrect=!!correct}else{p.pending++;p.lastCorrect=null}
 doc.events.push({id:q.id,subject,chapter:q.chapter||'',topic:q.topic||'',at:new Date(ts).toISOString(),durationMs:time,graded:!!graded,correct:graded?!!correct:null,attemptId});
 write(subject);if(syncLegacy&&subject!=='kwater')writeLegacy(oldKeys[subject],legacySnapshot(subject));return p;
}
function setBookmark(subject,id,v){item(subject,id).bookmark=!!v;write(subject)}
function setMemo(subject,id,v){item(subject,id).memo=String(v??'').slice(0,5000);write(subject)}
function due(subject,now=Date.now()){return Object.values(load(subject).items).filter(p=>p.nextDueAt&&Date.parse(p.nextDueAt)<=now).sort((a,b)=>Date.parse(a.nextDueAt)-Date.parse(b.nextDueAt))}
function stats(subject,bank=[],now=Date.now()){
 const doc=load(subject),days=Array.from({length:7},(_,i)=>{const d=new Date(now);d.setHours(0,0,0,0);d.setDate(d.getDate()-6+i);return {date:[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-'),start:+d,count:0}}),recent=doc.events.filter(e=>e.graded&&Date.parse(e.at)>=days[0].start&&Date.parse(e.at)<=now),groups=new Map(),lookup=new Map(bank.map(q=>[q.id,q]));
 for(const e of recent){for(let i=6;i>=0;i--)if(Date.parse(e.at)>=days[i].start){days[i].count++;break}}
 for(const p of Object.values(doc.items)){const chapter=p.chapter||lookup.get(p.id)?.chapter||'미분류',x=groups.get(chapter)||{chapter,correct:0,wrong:0,attempts:0};x.correct+=p.correct;x.wrong+=p.wrong;x.attempts+=p.correct+p.wrong;if(x.attempts)groups.set(chapter,x)}
 const unitRates=[...groups.values()].map(x=>({...x,rate:Math.round(x.correct/x.attempts*100)})).sort((a,b)=>b.attempts-a.attempts),topWrong=[...unitRates].filter(x=>x.wrong).sort((a,b)=>b.wrong-a.wrong||a.rate-b.rate||a.chapter.localeCompare(b.chapter)).slice(0,3);
 return {due:due(subject,now),recent7:recent.length,days,unitRates,topWrong,attempts:Object.values(doc.items).reduce((n,p)=>n+p.attempts,0),totalSubjects:bank.length};
}
function addSession(subject,session){const d=load(subject);if(session.id&&d.sessions.some(s=>s.id===session.id))return;d.sessions.unshift({...session,at:session.at||new Date().toISOString()});write(subject)}
function backup(subject,legacy){return {format:'quiz500-study-backup',version:1,subject,exportedAt:new Date().toISOString(),record:JSON.parse(JSON.stringify(load(subject))),legacy:legacySnapshot(subject,legacy)}}
function download(data,name){const href=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json;charset=utf-8'})),a=document.createElement('a');a.href=href;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(href),1500)}
function exportFile(subject,legacy){download(backup(subject,legacy),'quiz500_'+subject+'_backup.json')}
function exportAll(){download({format:'quiz500-study-all',version:1,exportedAt:new Date().toISOString(),subjects:SUBJECTS.map(s=>backup(s))},'quiz500_all_backup.json')}
function validateBackup(p,subject){if(p.format!=='quiz500-study-backup'||p.version!==1||p.subject!==subject||!valid(p.record,subject))throw Error('백업 파일의 과목·기록 형식이 올바르지 않습니다.');return p}
function applyBackups(backups){
 const writes=[];for(const p of backups){writes.push([PREFIX+p.subject,JSON.stringify(p.record)]);if(p.legacy&&ownObject(p.legacy))writes.push([oldKeys[p.subject],JSON.stringify(legacySnapshot(p.subject,p.legacy,p.record))])}
 const before=writes.map(([k])=>[k,getRaw(k)]);for(const [k,v] of writes)if(!setRaw(k,v)){for(const [old,value] of before)value===null?removeRaw(old):setRaw(old,value);throw Error('브라우저 저장 공간이 부족하거나 저장이 차단되었습니다. 기존 기록을 복원했습니다.')}
 for(const p of backups)memory[p.subject]=JSON.parse(JSON.stringify(p.record));return true;
}
async function parseFile(file){if(file.size>25*1024*1024)throw Error('25MB 이하의 백업 파일을 선택하세요.');return JSON.parse(await file.text())}
function oldBackup(subject,parsed){
 if(!ownObject(parsed)||parsed.format||!ownObject(parsed.progress)||!Array.isArray(parsed.bookmarks)||!Array.isArray(parsed.history))return parsed;
 const record=empty(subject),bookmarks=new Set(parsed.bookmarks.filter(safeID));
 for(const [id,v]of Object.entries(parsed.progress)){if(!safeID(id)||!ownObject(v))throw Error('이전 기록의 문항 형식이 올바르지 않습니다.');const p=fresh(id),correct=Number(v.correct||0),wrong=Number(v.wrong||0),seen=Number(v.seen||0);if(![correct,wrong,seen].every(count))throw Error('이전 기록의 풀이 횟수가 올바르지 않습니다.');p.correct=correct;p.wrong=wrong;p.attempts=Math.max(seen,correct+wrong);p.pending=p.attempts-correct-wrong;p.bookmark=bookmarks.has(id);p.lastAt=legacyTime(v.lastAt);p.lastCorrect=typeof v.lastCorrect==='boolean'?v.lastCorrect:null;if(p.lastCorrect===false){p.stage=0;p.nextDueAt=new Date((p.lastAt?Date.parse(p.lastAt):Date.now())+DAY).toISOString()}record.items[id]=p}
 for(const id of bookmarks)if(!record.items[id]){record.items[id]=fresh(id);record.items[id].bookmark=true}
 record.migrations=['legacy-v2:'+oldKeys[subject]];return {format:'quiz500-study-backup',version:1,subject,record,legacy:parsed};
}
async function importFile(subject,file){const parsed=await parseFile(file);const p=validateBackup(oldBackup(subject,parsed),subject);if(!root.confirm('현재 과목 기록을 백업으로 교체합니다. 먼저 내보내기를 권장합니다. 계속할까요?'))return false;return applyBackups([p])}
async function importAll(file){const p=await parseFile(file);if(p.format!=='quiz500-study-all'||p.version!==1||!Array.isArray(p.subjects)||p.subjects.length!==3||new Set(p.subjects.map(x=>x.subject)).size!==3)throw Error('전체 과목 백업 파일이 아닙니다.');for(const s of SUBJECTS)validateBackup(p.subjects.find(x=>x.subject===s)||{},s);if(!root.confirm('세 과목의 현재 학습 기록을 백업으로 교체할까요?'))return false;return applyBackups(p.subjects)}
function reset(subject){memory[subject]=empty(subject);memory[subject].migrations=['legacy-v2:'+oldKeys[subject],'legacy-mock-sessions-v1'];write(subject);if(subject!=='kwater')writeLegacy(oldKeys[subject],legacySnapshot(subject));}
root.addEventListener?.('quiz-storage-error',()=>{if(!root.document?.body||document.getElementById('storage-error'))return;const notice=document.createElement('p');notice.id='storage-error';notice.setAttribute('role','alert');notice.style.cssText='padding:16px;background:#fff2da;color:#603600;border:2px solid #825100';notice.textContent='브라우저 저장이 차단되었거나 공간이 부족합니다. 기록 JSON을 내보내 보관하세요. 새로고침하면 저장되지 않은 기록이 사라질 수 있습니다.';document.body.prepend(notice)});
root.StudyStore={getRaw,setRaw,removeRaw,readLegacy,writeLegacy,hydrate,load,item,record,setBookmark,setMemo,due,stats,addSession,backup,exportFile,importFile,exportAll,importAll,legacyKey:s=>oldKeys[s],storageOK:()=>storageOK,reset,validateBackup};
})(window);
