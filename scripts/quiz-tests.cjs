const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(__dirname,'../quiz500');let passed=0;
function test(name,fn){fn();passed++;console.log('PASS',name)}
function env(){const db=new Map();const ctx={URL,URLSearchParams,console,setTimeout,clearTimeout,Date,Map,Set,localStorage:{getItem:k=>db.get(k)||null,setItem:(k,v)=>db.set(k,v)},location:{href:'http://localhost/quiz500/communication-quiz-500/'},document:{currentScript:{src:'http://localhost/quiz500/trust.js'}},confirm:()=>true,fetch:async()=>({ok:true,json:async()=>({overrides:{'comm:test':'verified','comm:broken':'verified'}})})};ctx.QuizJSON={load:async()=>({overrides:{"comm:test":"verified","comm:broken":"verified"}})};ctx.window=ctx;vm.createContext(ctx);return ctx}
const ctx=env();vm.runInContext(fs.readFileSync(path.join(root,'trust.js'),'utf8'),ctx);const T=ctx.QuizTrust;
(async()=>{await T.loadOverrides();
test('default verified filter and explicit approval only',()=>{const q={id:'test',question:'Q',options:['A','B'],answer:0,status:'verified'},other={...q,id:'other'};assert.equal(T.verifiedOnly(),true);assert.equal(T.status(q,'comm'),'verified');assert.equal(T.status(other,'comm'),'auto');assert.equal(T.eligible(other,'comm'),false)});
test('review is withheld even when override exists',()=>{const q={id:'broken',question:'Q',options:['A','B'],answer:null};assert.equal(T.status(q,'comm'),'review');assert.equal(T.gradeable(q,'comm'),false)});
test('math parse failure blocks grading',()=>{ctx.katex={renderToString(){throw Error('invalid TeX')}};const q={id:'math',question:'\\(\\badmacro\\)',options:['A','B'],answer:0};assert.equal(T.validateMath(q),false);assert.equal(T.gradeable(q),false)});
test('CDN unavailable blocks only math',()=>{delete ctx.katex;assert.equal(T.validateMath({question:'plain',options:[]}),true);const q={question:'$x$',options:['a','b'],answer:0};assert.equal(T.validateMath(q),false);assert.equal(T.status(q),'review')});
test('unclosed math delimiters are withheld',()=>{const q={id:'unclosed',question:'\\(x+1',options:['A','B'],answer:0};assert.equal(T.validateMath(q),false);assert.equal(T.gradeable(q),false)});
let n=0;function visit(x){if(Array.isArray(x))x.forEach(visit);else if(x&&typeof x==='object'){if('question'in x&&('options'in x||'answer'in x)){assert.ok(['auto','review'].includes(x.status));n++}Object.values(x).forEach(visit)}}
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(d=>d.isDirectory()?walk(path.join(dir,d.name)):[path.join(dir,d.name)])}
test('every JSON bank has conservative status',()=>{walk(root).filter(f=>f.endsWith('.json')).forEach(f=>visit(JSON.parse(fs.readFileSync(f))));assert.ok(n>4000)});
console.log('Question records checked:',n);
// Further stage tests are appended below by the implementation.
if(fs.existsSync(path.join(__dirname,'quiz-study-tests.cjs')))await require('./quiz-study-tests.cjs')(env,test);
require('./quiz-mock-tests.cjs')(env,test);
console.log('All',passed,'checks passed');
})().catch(e=>{console.error(e);process.exitCode=1});
