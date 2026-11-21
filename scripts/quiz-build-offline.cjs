/* JSON is the source of truth; mirrors only preserve existing file:// opening. */
const fs=require('node:fs'),path=require('node:path');const root=path.resolve(__dirname,'../quiz500');
function files(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(d=>d.isDirectory()?files(path.join(dir,d.name)):[path.join(dir,d.name)])}
const list=files(root).filter(f=>f.endsWith('.json')&&!f.endsWith('/data/offline-manifest.json')).map(f=>path.relative(root,f).split(path.sep).join('/')).sort();
fs.writeFileSync(path.join(root,'data/offline-manifest.json'),JSON.stringify({schemaVersion:1,files:list},null,2)+'\n');
for(const rel of [...list,'data/offline-manifest.json']){const data=JSON.parse(fs.readFileSync(path.join(root,rel),'utf8'));fs.writeFileSync(path.join(root,rel+'.js'),'/* Generated from '+rel+'; edit JSON and run scripts/quiz-build-offline.cjs. */\nwindow.QuizJSON.accept(new URL('+JSON.stringify(path.basename(rel))+',document.currentScript.src).href,'+JSON.stringify(data)+');\n')}
for(const [folder,file]of [['communication-quiz-500','quiz_bank_1000.json'],['wireless-quiz-500','wireless_bank_1000.json']]){const data=JSON.parse(fs.readFileSync(path.join(root,folder,file)));fs.writeFileSync(path.join(root,folder,'offline-bank.js'),'/* Legacy static mirror. Canonical source: '+file+' */\nwindow.__quizBank='+JSON.stringify(data)+';\n')}
console.log('Generated',list.length+1,'JSON mirrors and 2 legacy bank mirrors.');
