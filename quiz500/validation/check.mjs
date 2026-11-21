#!/usr/bin/env node
/* Zero-dependency static regression checks; live browser console is a separate manual gate. */
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import assert from "node:assert/strict";
const base=path.resolve(import.meta.dirname,"..");
const read=p=>fs.readFileSync(path.join(base,p),"utf8");
const json=p=>JSON.parse(read(p));
let checks=0;
function test(label,fn){fn();checks++;console.log("PASS",label)}
const pages=[
 "index.html","communication-quiz-500/index.html","wireless-quiz-500/index.html",
 "kwater-exams/index.html","mock-exam/index.html","exam-subjects/index.html",
 "civil-service-exams/index.html","civil-service-exams/cutoff.html",
 "interview/korail.html","interview/kwater.html","interview/seoul-metro.html",
 "interview/index.html","sources/index.html","changelog/index.html"
];
for(const page of pages)test("SEO & inline JS: "+page,()=>{
 const c=read(page);
 assert.match(c,/<link rel="canonical"/);
 assert.match(c,/<meta property="og:image"/);
 assert.match(c,/<meta name=["']description["']/);
 assert.match(c,/og-study\.png/);
 for(const m of c.matchAll(/<script(?:\s+[^>]*)?>([\s\S]*?)<\/script>/g))if(m[1].trim())new vm.Script(m[1],{filename:page});
});
for(const file of ["trust.js","sources.js","quality.js","study-storage.js","study-ui.js","communication-quiz-500/app.js","wireless-quiz-500/app.js"])
 test("JavaScript syntax: "+file,()=>new vm.Script(read(file),{filename:file}));
test("OG PNG exists and valid",()=>{
 const buf=fs.readFileSync(path.join(base,"assets/og-study.png"));
 assert.equal(buf.subarray(0,8).toString("hex"),"89504e470d0a1a0a");
 assert.ok(buf.length>1000);
});
test("external data split and legacy parameters",()=>{
 for(const subject of ["communication-quiz-500","wireless-quiz-500"]){
  assert.doesNotMatch(read(subject+"/index.html"),/const BANK=\[/);
  assert.match(read(subject+"/app.js"),/params\.get\('unit'\)/);
  assert.match(read(subject+"/app.js"),/params\.get\('kind'\)/);
 }
 assert.match(read("communication-quiz-500/app.js"),/params\.get\('chapter'\)/);
});
test("status and attribution in all source questions",()=>{
 const arrays=[json("communication-quiz-500/quiz_bank_1000.json"),json("wireless-quiz-500/wireless_bank_1000.json"),
  json("kwater-exams/generated-mocks-2-4.json").rounds.flatMap(x=>x.questions),json("kwater-exams/source-index-2026s.json").questions];
 assert.deepEqual(arrays.map(a=>a.length),[1762,1074,120,40]);
 for(const q of arrays.flat()){
  assert.ok(["auto","review","verified"].includes(q.status));
  assert.equal(typeof q.source.name,"string");
  assert.ok(["공식 공개","자체 창작","외부 참고"].includes(q.source.type));
  assert.match(q.source.checkedDate,/^\d{4}-\d\d-\d\d$/);
 }
 assert.equal(Object.keys(json("status-overrides.json").overrides).length,0);
});
test("offline mirror equals canonical JSON",()=>{
 for(const subject of ["communication-quiz-500","wireless-quiz-500"]){
  const canonical=json(subject+"/"+(subject==="communication-quiz-500"?"quiz_bank_1000.json":"wireless_bank_1000.json"));
  const offline=read(subject+"/offline-bank.js");
  assert.match(offline,/window\.__quizBank=/);
  const start=offline.indexOf("window.__quizBank=")+"window.__quizBank=".length;
  const arr=JSON.parse(offline.slice(start).trim().replace(/;\s*$/,""));
  assert.equal(JSON.stringify(arr),JSON.stringify(canonical));
  assert.match(read(subject+"/index.html"),/offline-bank\.js/);
 }
});
test("K-water 3x40 and 12 units",()=>{
 const rounds=json("kwater-exams/generated-mocks-2-4.json").rounds;
 assert.deepEqual(rounds.map(r=>r.questions.length),[40,40,40]);
 for(const round of rounds)assert.equal(new Set(round.questions.map(q=>q.chapter)).size,12);
});
test("agency and cutoff sources",()=>{
 const agencies=json("exam-subjects/catalog.json").agencies;
 assert.equal(agencies.length,5);
 for(const a of agencies){assert.ok(a.source.checkedDate);assert.ok(a.reliability);if(a.questionCount!==null)assert.ok(a.questionCount>0)}
 const d=json("civil-service-exams/cutoff-data.json");
 assert.equal(d.nine.length+d.seven.length,78);
 assert.ok([...d.nine,...d.seven].every(x=>x.checkedDate&&x.reliability&&x.historyReliability));
});
test("homepage updates shortened, priority cards",()=>{
 const c=read("index.html");
 const i=c.indexOf('<h2 id="recent-updates"'),u=c.indexOf("<ul",i),end=c.indexOf("</ul>",u);
 assert.ok(i>0&&u>i&&end>u);
 assert.equal((c.slice(u,end).match(/<li>/g)||[]).length,3);
 assert.match(c,/stage5-priorities/);
 assert.match(c,/오늘 복습/);
 assert.match(c,/\.\/mock-exam\//);
});
console.log("Static smoke passed: "+checks+" checks. Live browser console errors require Playwright or manual test.");
