/* Quiz Trust: static-only status + external review overrides. No question is verified automatically. */
(function (g) {
"use strict";
const STORE="quiz_trust_verified_only_v1";
const VALID=new Set(["verified","auto","review"]);
const overrideMap=new Map(),subjects=new Map();
let onlyVerified=true;
const rootURL=new URL(".",document.currentScript?.src||location.href);
try {onlyVerified=StudyStore.getRaw(STORE)!=="false";}catch{}
const fails=new Set();
function needsReview(q){
 const lines=[q.question||"",q.explanation||"",...(Array.isArray(q.options)?q.options:[])].join("\n");
 const noAnswer=!(Number.isInteger(q.answer)&&q.answer>=0&&q.answer<(q.options||[]).length);
 return noAnswer||!String(q.question||"").trim()||!Array.isArray(q.options)||q.options.length<2||
 /[\uE000-\uF8FF]/.test(lines)||q.glyphReview===true||
 /수식.{0,8}(깨짐|누락)|그림.{0,8}(누락|미포함)|원문.{0,8}확인 필요/.test(lines)||
 (q.sourceTag==="BROADCAST"&&q.sourceQuality&&q.sourceQuality!=="텍스트 추출");
}
function rawStatus(q){return q.status==="review"||needsReview(q)?"review":"auto"}
function register(questions,subject){
 if(!Array.isArray(questions))return;
 for(const q of questions){q.status=rawStatus(q);subjects.set(q,subject)}
}
function status(q,subject){
 if(!q)return"review";
 if(fails.has(q))return"review";
 const base=rawStatus(q);
 if(base==="review")return"review";
 const key=(subject||subjects.get(q)||"comm")+":"+q.id;
 const v=overrideMap.get(key);
 return v==="verified"?"verified":base;
}
function gradeable(q,subject){
 return !!q&&status(q,subject)!=="review"&&Number.isInteger(q.answer)&&q.answer>=0&&Array.isArray(q.options)&&q.answer<q.options.length;
}
function label(q,subject){return({verified:"검증됨",auto:"미검증",review:"검토 중"})[status(q,subject)]}
function setVerifiedOnly(v){onlyVerified=!!v;try{StudyStore.setRaw(STORE,String(onlyVerified))}catch{}}
function verifiedOnly(){return onlyVerified}
function eligible(q,subject){return !onlyVerified||status(q,subject)==="verified"}
function verifiedCount(questions,subject){return questions.filter(q=>status(q,subject)==="verified").length}
function markMathFailure(q){fails.add(q);q.status="review"}
function equations(text){
 const value=String(text||"");const all=[], regex=/\\\[([\s\S]*?)\\\]|\\\(([\s\S]*?)\\\)|\$\$([\s\S]*?)\$\$|(?<!\$)\$([^\n$]+)\$(?!\$)/g;
 let m;while((m=regex.exec(value)))all.push(m[1]??m[2]??m[3]??m[4]);
 return all;
}
function brokenMath(text){
 const value=String(text||'');
 for(const [left,right]of [['\\(','\\)'],['\\[','\\]']])if(value.split(left).length!==value.split(right).length)return true;
 const clean=value.replace(/\\\$/g,'');
 const double=(clean.match(/\$\$/g)||[]).length;
 const singles=(clean.replace(/\$\$/g,'').match(/\$/g)||[]).length;
 return double%2!==0||singles%2!==0;
}
function validateMath(q){
 if([q.question,q.explanation,...(q.options||[])].some(brokenMath)){markMathFailure(q);return false}
 const terms=[q.question,q.explanation,...(q.options||[])].flatMap(equations);
 if(!terms.length)return true;
 if(!g.katex||typeof g.katex.renderToString!=="function"){markMathFailure(q);return false}
 try {for(const term of terms)g.katex.renderToString(term,{throwOnError:true,trust:false,strict:"ignore"});return true}
 catch{markMathFailure(q);return false}
}
function renderMath(q,nodes){
 const terms=[q.question,q.explanation,...(q.options||[])].flatMap(equations);
 if(!terms.length)return;
 if(!validateMath(q))return;
 if(typeof g.renderMathInElement!=="function"){markMathFailure(q);return}
 for(const node of nodes){
  if(!node)continue;
  try{g.renderMathInElement(node,{delimiters:[
   {left:"\\[",right:"\\]",display:true},{left:"\\(",right:"\\)",display:false},
   {left:"$$",right:"$$",display:true},{left:"$",right:"$",display:false}
  ],throwOnError:true,strict:"ignore",errorCallback:()=>markMathFailure(q)})}
  catch{markMathFailure(q)}
 }
}
function statusTag(q,subject){
 const span=document.createElement("span");const code=status(q,subject);
 span.className="trust-state trust-"+code;span.textContent=label(q,subject);
 span.setAttribute("aria-label","문항 검증 상태: "+span.textContent);return span;
}
function attach(questions,subject,options={}){
 register(questions,subject);
 const home=document.getElementById("homeView"), bank=document.getElementById("bankView");
 const controls=[];
 for(const section of [home,bank]){
  if(!section)continue;
  const container=document.createElement("div");
  container.className="trust-switch";
  const id="trust-filter-"+subject+"-"+(section===home?"home":"bank");
  const checkbox=document.createElement("input");
  checkbox.type="checkbox";checkbox.id=id;checkbox.checked=verifiedOnly();
  const l=document.createElement("label");l.htmlFor=id;l.append(checkbox,document.createTextNode(" 검증된 문항만 풀기"));
  const help=document.createElement("small");help.textContent="기본 켜짐 · 검증 문항이 0개라면 끄고 미검증 문항을 연습할 수 있습니다.";
  container.append(l,help);
  const panel=section.querySelector("#availableText, #bankCount, .searchbar");
  if(panel)panel.insertAdjacentElement("beforebegin",container);
  else section.insertAdjacentElement("afterbegin",container);
  checkbox.addEventListener("change",()=>{
   setVerifiedOnly(checkbox.checked);
   controls.forEach(x=>x.checked=checkbox.checked);
   if(typeof options.onChange==="function")options.onChange();
  });controls.push(checkbox);
 }
 const script=document.createElement("style");
 script.textContent=".trust-switch{display:flex;gap:7px;flex-wrap:wrap;align-items:center;margin:12px 0;padding:12px 14px;border-radius:12px;background:var(--surface2,#edf4ff);border:1px solid var(--line,#dce5f2)}.trust-switch label{font-size:13px;font-weight:800;cursor:pointer}.trust-switch small{color:var(--muted,#697790);font-size:11px;flex-basis:100%}.trust-state{display:inline-block;font-size:11px;font-weight:800;padding:3px 8px;border-radius:99px;margin:3px 7px 3px 0;border:1px solid var(--line,#ddd)}.trust-auto{color:#7c5c19;background:#fff6df;border-color:#e4d4ad}.trust-review{color:#a34943;background:#fff0ee;border-color:#f0c9c3}.trust-verified{color:#166249;background:#e7f7ed;border-color:#b2e0c5}.trust-report textarea{width:100%;min-height:75px;resize:vertical;border:1px solid var(--line,#ccc);border-radius:8px;background:var(--surface,#fff);color:var(--text,#222);padding:9px}.trust-report .report-reason{max-width:100%}";
 document.head.append(script);
}
function loadOverrides(done){
 return QuizJSON.load(new URL("status-overrides.json",rootURL))
 .then(data=>{
  overrideMap.clear();
  const src=data?.overrides||{};
  for(const [k,v] of Object.entries(src))if(k.indexOf(":")>0&&VALID.has(v)&&v==="verified")overrideMap.set(k,v);
 })
 .catch(()=>{})
 .finally(()=>{if(typeof done==="function")done()});
}
g.QuizTrust={register,status,label,gradeable,eligible,verifiedCount,verifiedOnly,setVerifiedOnly,markMathFailure,validateMath,renderMath,statusTag,attach,loadOverrides,needsReview};
})(window);
