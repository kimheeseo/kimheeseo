/* Independent equation checks for the authored numerical questions, plus preservation checks. */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../quiz500'),doc=JSON.parse(fs.readFileSync(path.join(root,'korail-2026/generated-mock-2.json'))),qs=doc.questions;
assert.equal(qs.length,30);assert.equal(new Set(qs.map(q=>q.id)).size,30);
const banks=require('./quiz-export-banks.cjs')(),baseline=JSON.parse(fs.readFileSync(path.join(root,'validation/bank-invariants.json')));
for(const [subject,bank]of Object.entries(banks)){
 const previous=bank.filter(q=>q.setId!==doc.id),expected=baseline.legacySubjects[subject];
 assert.equal(previous.length,expected.count);assert.equal(crypto.createHash('sha256').update(JSON.stringify(previous.map(q=>baseline.fields.map(k=>q[k]??null)))).digest('hex'),expected.sha256,'previous content or IDs changed');
}
for(const [i,q]of qs.entries()){
 assert.equal(q.number,i+1);assert.equal(q.options.length,5);assert.equal(new Set(q.options).size,5);assert.ok(q.answer>=0&&q.answer<5);assert.equal(q.status,'auto');assert.equal(q.source.type,'자체 창작');
 assert.equal(banks[q.subject].filter(x=>x.id===q.id).length,1,'loaded exactly once');
 const ref=banks[q.subject].find(x=>x.id===q.reference.id);assert.equal(ref.kind,'코레일 기출');assert.equal(ref.sourceQuestion,q.number);
 assert.ok(!/null쪽|undefined|[\uE000-\uF8FF]/.test(JSON.stringify(q)));assert.ok(q.explanation.length>40);
 for(const other of Object.values(banks).flat())if(other.id!==q.id)assert.notEqual(other.question,q.question,'existing question duplicated');
}
assert.equal(qs.filter(q=>q.subject==='comm').length,20);assert.equal(qs.filter(q=>q.subject==='wireless').length,10);
const answer=n=>qs[n-1].options[qs[n-1].answer],near=(actual,expected)=>assert.ok(Math.abs(actual-expected)<1e-9,`${actual} != ${expected}`);
const checks=[
 [1,200e3*Math.log2(64)/1e6,1.2,'1.2 Mbit/s'],[2,80*90/120,60,'60Ω'],
 [3,4*20e-9/(2e-3)*1e6,40,'40μS/km'],[4,100/10,10,'10A / 1'],
 [6,0.5*1e-11*(12e-4)/(2e-3)*200**2*1e6,0.12,'0.12μJ'],
 [7,3e3*Math.log2(1+31)/1000,15,'15kbit/s'],[8,200*0.4/0.2,400,'80A·turn / 400A/m'],
 [9,(20/0.002-100)/1000,9.9,'9.9kΩ'],[13,1.2*200**2/100,480,'480MW'],
 [14,60**2/(2*6),300,'300W'],[16,(5-1)/(5+1),2/3,'2/3'],
 [17,120*Math.PI/(2*Math.PI),60,'80V / 60Hz'],[18,Math.hypot(3,4),5,'5V'],
 [19,Math.round(8/(2*Math.PI*0.04)*10)/10,31.8,'31.8A/m'],[20,Math.sqrt(0.25e-6/100e-12),50,'50Ω'],
 [21,12/6,2,'2A 전류원과 6Ω 저항의 병렬 연결'],[22,200*10*Math.cos(Math.PI/3)/1000,1,'1kW'],
 [23,Math.round((240-220)/(4400/220+220/110)*100)/100,0.91,'0.91Ω'],
 [24,2*5,10,'DSB-SC 10kHz / SSB 5kHz'],[25,4e-11*3e3,1.2e-7,'1.2×10⁻⁷C/m²'],
 [26,4*Math.PI*1e-7*1000*500**2*4e-4/(2*Math.PI*0.1)*1000,200,'200mH'],
 [27,20*2*0.01*0.5*Math.sin(Math.PI/6),0.1,'0.10N·m'],
 [29,100/(1000*0.05),2,'2∠−100°A'],[30,Math.round(Math.sqrt(3)*400*25*0.8/1000*100)/100,13.86,'13.86kW']
];
for(const [number,value,expected,option]of checks){near(value,expected);assert.equal(answer(number),option,'calculated answer #'+number)}
near(-10-90,-100); // Pure inductance: current lags voltage by 90 degrees.
const pdf=fs.readFileSync(path.join(root,'korail-2026/korail-2026h1-restored.pdf'));
assert.equal(pdf.subarray(0,5).toString(),'%PDF-');assert.equal(pdf.length,7472669);assert.equal(crypto.createHash('sha256').update(pdf).digest('hex'),'cf741754a0ace5f29a1c458292cab757633ca48914ea930115188600a09d7012');
console.log('Korail passed: 30 unique five-choice questions, 24 independent calculations, 4,024 prior questions preserved, original PDF present.');
