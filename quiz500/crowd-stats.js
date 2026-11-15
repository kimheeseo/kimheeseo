/* 통신직 문제은행: 수험생 공동 정답률 (익명 옵트인 · 최초 응답만 집계)
   개인 기록은 각 과목 앱의 기존 localStorage에 보존됩니다. */
(function(){
'use strict';
const api=(typeof window.TELECOM_STATS_API_URL==='string'?window.TELECOM_STATS_API_URL:'').trim().replace(/\/+$/,'');
const CONSENT='telecom_crowd_consent_v1',VISITOR='telecom_crowd_visitor_v1';
const SENT='telecom_crowd_sent_v1',QUEUE='telecom_crowd_queue_v1';
const MIN=20;
const qs=id=>document.getElementById(id);
let currentKey='', isFlushing=false, lastRendered=null;
function jsonRead(key,fallback){try{const x=JSON.parse(localStorage.getItem(key)||'null');return x===null?fallback:x}catch{return fallback}}
function safeSet(key,value){try{localStorage.setItem(key,value)}catch{}}
function consent(){try{return localStorage.getItem(CONSENT)==='yes'}catch{return false}}
function keyHash(input){let h=2166136261;for(let i=0;i<input.length;i++){h^=input.charCodeAt(i);h=Math.imul(h,16777619)}return (h>>>0).toString(16).padStart(8,'0')}
function makeKey(question){
  // 정답 수정·문항/선지 변경 시 다른 집계 키로 구분
  const signature=JSON.stringify([question.question||'',question.options||[],question.answer]);
  return keyHash(String(question.id))+'-'+keyHash(signature);
}
function getVisitor(){
  try{const old=localStorage.getItem(VISITOR);if(old&&/^[\da-f-]{36}$/i.test(old))return old}catch{}
  let id;
  if(crypto&&typeof crypto.randomUUID==='function')id=crypto.randomUUID();
  else {
    const a=new Uint8Array(16);crypto.getRandomValues(a);a[6]=(a[6]&15)|64;a[8]=(a[8]&63)|128;
    const s=[...a].map(x=>x.toString(16).padStart(2,'0')).join('');
    id=s.slice(0,8)+'-'+s.slice(8,12)+'-'+s.slice(12,16)+'-'+s.slice(16,20)+'-'+s.slice(20);
  }
  safeSet(VISITOR,id);return id;
}
function make(tag,className,value){const e=document.createElement(tag);if(className)e.className=className;if(value!==undefined)e.textContent=value;return e}
const style=document.createElement('style');
style.textContent='.crowd-box{margin:12px 0 17px;padding:13px 15px;border:1px solid #d5e3fb;border-radius:14px;background:#f4f8ff;color:#1d3557;font-size:13px;line-height:1.65}.crowd-box strong{color:#194bc8}.crowd-box .crowd-note{display:block;color:#67778f;font-size:11px;margin-top:4px}.crowd-box .crowd-opt{display:flex;align-items:center;gap:8px;margin-top:9px;cursor:pointer;font-size:12px;color:#38537b}.crowd-box input{width:16px;height:16px;accent-color:#1456f4}.crowd-box .crowd-meter{height:7px;margin-top:8px;border-radius:10px;background:#dfebff;overflow:hidden}.crowd-box .crowd-meter>i{display:block;height:100%;background:#1555e8;border-radius:10px}';
document.head.append(style);
function paintStatus(element,stats){
  const total=Math.max(0,Number(stats?.responses)||0), right=Math.max(0,Number(stats?.correct)||0);
  element.replaceChildren();
  const header=make('strong','',total?('전체 응답 '+total+'건 · 정답 '+right+'건'):'공동 문항 통계');
  element.append(header);
  if(!total){element.append(make('div','','아직 누적된 채점 결과가 없습니다.'));return}
  const percent=Math.round(100*right/total);
  const enough=total>=MIN, level=percent>=80?'하':percent>=50?'중':'상';
  element.append(make('div','',enough?('실측 정답률 '+percent+'% · 추정 난이도 '+level):('실측 정답률 '+percent+'% · 난이도 판정 대기 ('+(MIN-total)+'건 더 필요)')));
  const meter=make('div','crowd-meter');const fill=make('i');fill.style.width=percent+'%';meter.append(fill);element.append(meter);
}
async function refresh(subject,key,host){
  if(!api)return;
  try{
    const response=await fetch(api+'/v1/stats?subject='+encodeURIComponent(subject)+'&key='+encodeURIComponent(key),{cache:'no-store'});
    if(!response.ok)throw new Error('unavailable');
    const data=await response.json();
    if(currentKey===subject+':'+key && host.isConnected)paintStatus(host,data);
  }catch{
    if(currentKey===subject+':'+key && host.isConnected)host.textContent='공동 통계 서버에 연결할 수 없습니다. 개인 문제풀이 기록은 정상 저장됩니다.';
  }
}
function render(subject,question){
  if(!question||!qs('qQuestion'))return;
  const key=makeKey(question);currentKey=subject+':'+key;lastRendered={subject,key};
  let panel=qs('crowd-stats-panel');
  if(!panel){panel=make('section','crowd-box');panel.id='crowd-stats-panel';panel.setAttribute('aria-label','문항 공동 정답률');qs('qQuestion').after(panel)}
  panel.replaceChildren();
  if(!api){
    panel.append(make('strong','','문항별 공동 난이도'));
    panel.append(make('div','','공동 통계 서버 연결 전 · 개인 학습 기록은 계속 저장됩니다.'));
    return;
  }
  const stat=make('div','', '응답자 통계를 불러오는 중입니다…');panel.append(stat);
  const label=make('label','crowd-opt');
  const input=make('input');input.type='checkbox';input.checked=consent();
  const caption=make('span','', '익명 정답/오답 통계에 참여 (선택)');
  label.append(input,caption);panel.append(label);
  const note=make('span','crowd-note','이름·이메일·문제 본문은 보내지 않습니다. 브라우저별 첫 응답만 집계되며, 참여 해제해도 기존 집계는 보존됩니다.');
  panel.append(note);
  input.addEventListener('change',()=>{safeSet(CONSENT,input.checked?'yes':'no');if(input.checked)flush()});
  refresh(subject,key,stat);
}
function record(subject,question,correct,graded){
  if(!api||!consent()||!graded||!question)return;
  const key=makeKey(question),identity=subject+':'+key;
  const sent=jsonRead(SENT,{}),pending=jsonRead(QUEUE,[]);
  if(!Array.isArray(pending))return;
  if(sent[identity]||pending.some(e=>e.subject===subject&&e.key===key))return;
  pending.push({subject,key,visitor:getVisitor(),correct:correct===true});
  safeSet(QUEUE,JSON.stringify(pending.slice(-600)));
  flush();
}
async function flush(){
  if(isFlushing||!api||!consent())return;
  isFlushing=true;
  try{
    let queue=jsonRead(QUEUE,[]),sent=jsonRead(SENT,{});
    if(!Array.isArray(queue)||!sent||typeof sent!=='object')return;
    while(queue.length){
      const item=queue[0],identity=item.subject+':'+item.key;
      if(sent[identity]){queue.shift();safeSet(QUEUE,JSON.stringify(queue));continue}
      let response;
      try{
        response=await fetch(api+'/v1/attempt',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(item),cache:'no-store'});
      }catch{break}
      if(!response.ok)break;
      sent[identity]=1;
      queue.shift();
      safeSet(SENT,JSON.stringify(sent));
      safeSet(QUEUE,JSON.stringify(queue));
      if(currentKey===identity){const box=qs('crowd-stats-panel');const status=box?.firstElementChild;if(status)refresh(item.subject,item.key,status)}
    }
  }finally{isFlushing=false}
}
window.TelecomCrowdStats={render,record,flush,isConfigured:!!api};
window.addEventListener('online',flush);
if(api&&consent())flush();
})();