/* Dashboard state tests. Uses isolated fixtures, never browser records. */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const source=fs.readFileSync(path.resolve(__dirname,'../quiz500/home.js'),'utf8');
async function run({graded=false,due=false,eligible=true,fail=false,auxFail=false}={}){
 const nodes=new Map();function node(id){if(!nodes.has(id))nodes.set(id,{textContent:'',attrs:{},classList:{remove(){}},setAttribute(k,v){this.attrs[k]=v},removeAttribute(k){delete this.attrs[k]},replaceChildren(){},append(){}});return nodes.get(id)}
 const subjects=['comm','wireless','kwater'];const ctx={console,Date,Map,document:{getElementById:node,querySelectorAll:()=>[],createElement:()=>({})},
 QuizJSON:{load:async p=>{if(auxFail)throw Error('aux failure');return p.includes('changes')?{entries:[]}:{blocks:{}}}},
 QuizTrust:{loadOverrides:async()=>{},verifiedCount:()=>1,eligible:()=>eligible,gradeable:()=>true},
 QuizBank:{load:async()=>{if(fail)throw Error('bank unavailable');return[{id:'fixture'}]}},
 StudyStore:{legacyKey:s=>s,readLegacy:()=>({}),hydrate:()=>{},due:()=>due?[{id:'fixture'}]:[],load:()=>({items:graded?{fixture:{correct:2,wrong:1,nextDueAt:null}}:{}})}};
 await vm.runInNewContext(source,ctx);return node;
}
(async()=>{
 let n=await run();assert.equal(n('today-primary').textContent,'무선공학 1회독 시작');assert.equal(n('appAccuracy').textContent,'—');assert.equal(n('home-due-count').textContent,0);console.log('PASS new visitor empty state');
 n=await run({graded:true,due:true});assert.equal(n('today-primary').href,'./learning.html?mode=review');assert.equal(n('appAccuracy').textContent,'67%');console.log('PASS due review promoted and real accuracy rendered');
 n=await run({graded:true,due:true,eligible:false});assert.equal(n('today-primary').href,'./wireless-first-pass/');assert.equal(n('home-due-count').textContent,3);console.log('PASS withheld review does not promote an empty session');
 n=await run({graded:true});assert.equal(n('today-study-title').textContent,'오늘도 한 걸음 이어가요');console.log('PASS returning visitor without due reviews');
 n=await run({fail:true});assert.equal(n('today-task').attrs['aria-busy'],'false');assert.equal(n('appGraded').textContent,'—');assert.match(n('today-message').textContent,/표시하지 못/);console.log('PASS load failure exits skeleton with recoverable message');
 n=await run({auxFail:true,due:true});assert.equal(n('today-primary').href,'./learning.html?mode=review');console.log('PASS auxiliary data failure does not block dashboard');
})().catch(e=>{console.error(e);process.exitCode=1});
