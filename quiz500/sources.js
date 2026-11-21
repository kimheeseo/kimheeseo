/* Structured attribution for questions, with backward compatibility for old source PDF paths. */
(function(root){
"use strict";
const CHECKED="2026-11-21";
const TYPES=new Set(["공식 공개","자체 창작","외부 참고"]);
function typeOf(q,subject){
 if(subject==="kwater"&&q.origin==="독립 창작 예상문항")return"자체 창작";
 if(subject==="kwater")return"외부 참고";
 if(/기출 응용|기출형 응용/.test(String(q.kind||"")))return"자체 창작";
 return"외부 참고";
}
function nameOf(q,subject){
 if(subject==="kwater")return q.origin==="독립 창작 예상문항"?"K-water 준비용 독립 제작 예상문제 (공식 기출 아님)":"빡취쌤 제공 2026 상반기 민간 전공모의고사";
 const x=q.sourceLabel||q.exam||q.sourceExam||q.kind;
 if(x&&/기출|국가직|지방직|코레일|서울교통|무선설비|방송통신|국회/.test(String(x)))return String(x);
 return subject==="wireless"?"기존 무선공학 학습자료 (출처 대조 필요)":"기존 통신공학 학습자료 (출처 대조 필요)";
}
function urlOf(q){
 const u=q.sourceUrl||q.source?.url||null;
 return typeof u==="string"&&/^https?:\/\//i.test(u)?u:null;
}
function normalize(q,subject){
 let existing=q.source;
 if(typeof existing==="string"){q.legacySource=existing;existing=null}
 if(existing&&typeof existing==="object"&&!Array.isArray(existing)){
  q.source={name:String(existing.name||nameOf(q,subject)),url:existing.url||urlOf(q),checkedDate:String(existing.checkedDate||CHECKED),type:TYPES.has(existing.type)?existing.type:typeOf(q,subject)};
 }else{
  q.source={name:nameOf(q,subject),url:urlOf(q),checkedDate:CHECKED,type:typeOf(q,subject)};
 }
 return q.source;
}
function register(questions,subject){if(!Array.isArray(questions))return;for(const q of questions)normalize(q,subject)}
function label(q,subject){const s=q?.source&&typeof q.source==="object"?q.source:normalize(q,subject);return s.name+" · "+s.type+" · 메타 확인 "+s.checkedDate}
function link(q,subject){
 const s=q?.source&&typeof q.source==="object"?q.source:normalize(q,subject);
 if(!s.url)return null;try{const u=new URL(s.url,location.href);return ["https:","http:"].includes(u.protocol)?u.href:null}catch{return null}
}
root.QuizSource={register,normalize,label,link};
})(window);
