
'use strict';
const BANK=window.__quizBank;delete window.__quizBank;
const QUALITY_COUNTS=QuizQuality.prepareComm(BANK);
const CHAPTERS=[...new Set(BANK.map(q=>q.chapter))];
const BROADCAST_KIND='국회사무처 9급 기출';
const IMAGE_CACHE=new Map();
function updateDynamicCounts(){const n=BANK.length;document.title='통신공학 '+n+' | 암기 퀴즈';const heading=document.querySelector('#homeView .hero h1');if(heading)heading.innerHTML='암기한 통신공학,<br>'+n+'문제로 확인하세요.';const composition=document.querySelector('#compositionPanel h2');if(composition)composition.textContent='단원별 '+n+'문항 구성';const btext=document.querySelector('#bankView .hero p');if(btext)btext.textContent=n+'문항을 검색하고 정답·해설·출처를 확인할 수 있습니다.';}
function sourceText(q){
 if(q.sourceTag==='BROADCAST')return q.sourceLabel+' · '+q.no+'번 · 원문 PDF '+(q.page||'?')+'쪽 · '+q.answerStatus;
 if(q.year&&q.exam)return q.year+'년도 '+q.exam+' 기출 · '+(q.no||'?')+'번';
 if(q.sourceLabel)return q.sourceQuestion?q.sourceLabel+' · 참고/복원 '+q.sourceQuestion+'번 · PDF '+q.sourcePage+'쪽':q.sourceLabel+' · 공개 기출의 전공 범위 참고';
 return 'PDF '+(q.sourcePages?.join(', ')||q.page)+'쪽';
}
function appendSourcePreview(target,q){
 if(q.sourceTag!=='BROADCAST')return;
 const details=el('details','original-preview');
 const caption=el('summary','',q.year+'년도 국회사무처 시험지 '+(q.page||'?')+'쪽 원문 이미지 확인');
 const container=el('div','original-preview-content');
 details.append(caption,container);target.append(details);
 details.addEventListener('toggle',async()=>{
   if(!details.open||details.dataset.loaded)return;
   container.textContent='원문 이미지 불러오는 중…';
   try{
     let doc=IMAGE_CACHE.get(q.year);
     if(!doc){const response=await fetch('../broadcast-telecom/sourcepages/'+q.year+'.json');if(!response.ok)throw new Error('페이지 데이터 접근 실패');doc=await response.json();IMAGE_CACHE.set(q.year,doc)}
     const jpg=doc.pages[q.page-1];if(!jpg)throw new Error('원본 페이지 없음');
     const img=new Image();img.alt=q.year+'년 국회사무처 방송통신공학 '+q.page+'쪽 원본';img.src='data:image/jpeg;base64,'+jpg;
     container.replaceChildren(img);
     details.dataset.loaded='1';
   }catch(err){container.textContent='이미지를 표시하지 못했습니다. 기존 방송통신공학 원본 자료를 확인하세요.';}
 });
}
function populateExtraFilters(chapterId,topicId,yearId){
 const ch=$(chapterId).value,topics=[...new Set(BANK.filter(q=>ch==='all'||q.chapter===ch).map(q=>q.topic).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'ko'));
 const years=[...new Set(BANK.filter(q=>ch==='all'||q.chapter===ch).map(q=>q.year).filter(Number.isInteger))].sort((a,b)=>b-a);
 const topicEl=$(topicId),yearEl=$(yearId),prevTopic=topicEl.value,prevYear=yearEl.value;
 topicEl.replaceChildren(new Option('전체 세부단원','all'));
 topics.forEach(t=>topicEl.add(new Option(t,t)));
 topicEl.value=topics.includes(prevTopic)?prevTopic:'all';
 yearEl.replaceChildren(new Option('전체 연도','all'));
 years.forEach(y=>yearEl.add(new Option(y+'년',String(y))));
 yearEl.value=years.some(y=>String(y)===prevYear)?prevYear:'all';
}
function addMissingKinds(selectId){
 const elSelect=$(selectId),existing=new Set([...elSelect.options].map(x=>x.value));
 for(const kind of [...new Set(BANK.map(q=>q.kind))])if(!existing.has(kind)){elSelect.add(new Option(kind,kind));existing.add(kind)}
}
function matchesExamFilters(q,topicId,yearId){
 return ($(topicId).value==='all'||q.topic===$(topicId).value)&&($(yearId).value==='all'||String(q.year)===$(yearId).value);
}
// Persist learning progress across visits in this browser, including wrong answers.
// Keep the original preference key for a seamless migration from older versions.
const PREF_STORE='comms500_prefs_v2', LEGACY_STORE='comms500_stats_v1';
let prefs={},legacy={};
try{prefs=StudyStore.readLegacy(PREF_STORE)||{}}catch{prefs={}}
try{legacy=StudyStore.readLegacy(LEGACY_STORE)||{}}catch{legacy={}}
const validProgress=v=>v&&typeof v==='object'&&!Array.isArray(v)?v:{};
const currentProgress=validProgress(prefs.progress), legacyProgress=validProgress(legacy.progress);
const data={
 progress:Object.keys(currentProgress).length?currentProgress:legacyProgress,
 bookmarks:Array.isArray(prefs.bookmarks)?prefs.bookmarks:Array.isArray(legacy.bookmarks)?legacy.bookmarks:[],
 history:Array.isArray(prefs.history)?prefs.history:Array.isArray(legacy.history)?legacy.history:[],
 theme:(prefs.theme||legacy.theme)==='dark'?'dark':'light'
};
let session=null,lastSessionIds=[],lastSessionConfig=null,bankPage=0,bankOpened=null,currentView='home';
const $=id=>document.getElementById(id),el=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e};
function save(){StudyStore.writeLegacy(PREF_STORE,{version:3,progress:data.progress,bookmarks:data.bookmarks,history:data.history,theme:data.theme})}
function toast(message){const t=$('toast');t.textContent=message;t.hidden=false;clearTimeout(toast._timer);toast._timer=setTimeout(()=>t.hidden=true,2700)}
function rate(a,b){return b?Math.round(100*a/b):0}
function shuffle(a){a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function view(name){for(const id of ['home','quiz','result','bank','records','kwater','analytics'])$(id+'View').hidden=id!==name;currentView=name;document.querySelectorAll('[data-nav]').forEach(b=>b.classList.toggle('active',b.dataset.nav===name));if(name==='home')renderHome();if(name==='bank')renderBank();if(name==='records')renderRecords();if(name==='analytics')StudyUI.render('comm');window.scrollTo({top:0,behavior:'instant'})}
function chaptersSelect(select,includeAll=true){select.replaceChildren();if(includeAll){const opt=new Option('전체 단원','all');select.add(opt)}CHAPTERS.forEach(ch=>select.add(new Option(ch,ch)))}
function summary(){let count=0,correct=0,graded=0,wrong=0,mastered=0;for(const r of Object.values(data.progress)){count+=r.seen||0;correct+=r.correct||0;graded+=(r.correct||0)+(r.wrong||0);if(r.lastCorrect===false)wrong++;if(r.lastCorrect===true)mastered++}return {count,correct,graded,wrong,mastered}}
function renderStats(target){const s=summary();const items=[['전체 / 검증 완료',String(BANK.length)+' / '+QuizTrust.verifiedCount(BANK,'comm'),'문항'],['풀이 횟수',s.count,'회'],['누적 정답률',rate(s.correct,s.graded),'%'],['복습할 오답',s.wrong,'문항']];$(target).replaceChildren(...items.map(([label,value,suffix])=>{const c=el('div','stat');c.append(el('div','label',label));const v=el('div','value',String(value));v.append(el('span','suffix',suffix));c.append(v);return c}))}
const ORIGINAL_CHAPTER_COUNTS={"신호와 시스템":60,"디지털화와 다중화":57,"아날로그 변조":68,"디지털 전송":71,"확률·랜덤 과정":68,"정보·부호이론":115,"통신 프로토콜":61,"전기·회로 기초 (코레일)":0,"전기·전자 기초 (공무원)":0};
function renderComposition(){const cells=CHAPTERS.map((ch,i)=>{const old=ORIGINAL_CHAPTER_COUNTS[ch]||0;return {ch,old,i}}).map(({ch,old,i})=>{const qs=BANK.filter(q=>q.chapter===ch),n=qs.length,p=100*n/BANK.length,dist=['하','중','상'].map(l=>qs.filter(q=>q.difficulty===l).length);return '<tr><td>'+ch+'</td><td>'+old+'</td><td>+'+(n-old)+'</td><td>'+n+'</td><td>'+dist.join('/')+'</td><td>'+p.toFixed(1)+'%</td><td><button class="composition-start" type="button" data-unit="'+i+'">선택 난이도 풀기</button></td></tr>';}).join('');
 $('compositionRows').innerHTML='<table class="composition-table"><thead><tr><th>단원</th><th>최초</th><th>추가</th><th>최종</th><th>하/중/상</th><th>비율</th><th>학습</th></tr></thead><tbody>'+cells+'<tr class="composition-total"><td>전체</td><td>500</td><td>+'+(BANK.length-500)+'</td><td>'+BANK.length+'</td><td>—</td><td>100%</td><td>—</td></tr></tbody></table><p class="mini">난이도를 선택하고 각 단원의 버튼을 누르면 해당 조건의 문제 전체를 풉니다.</p>';
 document.querySelectorAll('#compositionRows [data-unit]').forEach(b=>b.addEventListener('click',()=>startCompositionUnit(Number(b.dataset.unit))));
}
function startCompositionUnit(index){
 const chapter=CHAPTERS[index];
 if(!chapter)return;
 const ids=BANK.filter(q=>q.chapter===chapter&&($('difficultySelect').value==='all'||q.difficulty===$('difficultySelect').value)).map(q=>q.id);
 if(ids.length)begin('normal',ids);
}
function maybeStartLinkedUnit(){
 const params=new URLSearchParams(window.location.search);const sourceKind=params.get('kind');if(sourceKind&&[...$('kindSelect').options].some(o=>o.value===sourceKind)){$('kindSelect').value=sourceKind;$('bankKind').value=sourceKind;renderHome();}const linkedChapter=params.get('chapter');if(linkedChapter&&CHAPTERS.includes(linkedChapter)){$('chapterSelect').value=linkedChapter;$('bankChapter').value=linkedChapter;populateExtraFilters('chapterSelect','topicSelect','yearSelect');populateExtraFilters('bankChapter','bankTopic','bankYear');}const linkedTopic=params.get('topic');if(linkedTopic&&[...$('topicSelect').options].some(o=>o.value===linkedTopic)){$('topicSelect').value=linkedTopic;$('bankTopic').value=linkedTopic;}const linkedYear=params.get('year');if(linkedYear&&[...$('yearSelect').options].some(o=>o.value===linkedYear)){$('yearSelect').value=linkedYear;$('bankYear').value=linkedYear;}renderHome();const level=params.get('level');if(['하','중','상'].includes(level)){$('difficultySelect').value=level;$('compositionDifficulty').value=level;renderHome();}const raw=params.get('unit');
 if(raw!==null&&/^\d{1,2}$/.test(raw)){
  const n=Number(raw);
  if(n>=0&&n<CHAPTERS.length)startCompositionUnit(n);
 }
}
function renderHome(){StudyUI.refreshHome('comm');renderStats('topStats');const available=BANK.filter(q=>QuizTrust.eligible(q,'comm')&&($('chapterSelect').value==='all'||q.chapter===$('chapterSelect').value)&&($('kindSelect').value==='all'||q.kind===$('kindSelect').value)&&($('difficultySelect').value==='all'||q.difficulty===$('difficultySelect').value)&&matchesExamFilters(q,'topicSelect','yearSelect'));$('availableText').textContent=`현재 조건에 맞는 문제: ${available.length}문항 / 전체 ${BANK.length}문항`;const host=$('chapters');host.replaceChildren();for(const ch of CHAPTERS){const qs=BANK.filter(q=>q.chapter===ch);const attempted=qs.filter(q=>data.progress[q.id]?.seen).length;const b=el('button','chapter');const title=el('strong','',ch);const count=el('small','',`${qs.length}문항 · 학습 ${attempted}문항`);const track=el('span','meter');const progress=el('i');progress.style.width=rate(attempted,qs.length)+'%';track.append(progress);b.append(title,count,track);b.addEventListener('click',()=>{$('chapterSelect').value=ch;window.scrollTo({top:0,behavior:'smooth'});$('startBtn').focus();renderHome()});host.append(b)}}
function begin(type='normal',forcedIds=null){let qs;
 if(forcedIds)qs=forcedIds.map(id=>BANK.find(q=>q.id===id)).filter(Boolean);
 else if(type==='wrong')qs=BANK.filter(q=>data.progress[q.id]?.lastCorrect===false);
 else if(type==='fav')qs=BANK.filter(q=>data.bookmarks.includes(q.id));
 else qs=BANK.filter(q=>($('chapterSelect').value==='all'||q.chapter===$('chapterSelect').value)&&($('kindSelect').value==='all'||q.kind===$('kindSelect').value)&&matchesExamFilters(q,'topicSelect','yearSelect'));
 if(!forcedIds&&$('difficultySelect').value!=='all')qs=qs.filter(q=>q.difficulty===$('difficultySelect').value);
 qs=qs.filter(q=>QuizTrust.eligible(q,'comm'));if(!qs.length){toast(type==='wrong'?'아직 복습할 오답이 없습니다.':type==='fav'?'즐겨찾기 문제를 먼저 지정하세요.':'선택한 조건에 맞는 문제가 없습니다.');return}
 const ordered=($('orderSelect').value==='sequential' && type==='normal' && !forcedIds)?[...qs].sort((a,b)=>a.page-b.page || a.id.localeCompare(b.id)):shuffle(qs);
 const n=$('countSelect').value==='all'?ordered.length:Math.min(parseInt($('countSelect').value,10),ordered.length);
 const actual=forcedIds?ordered:ordered.slice(0,n);lastSessionConfig={type,chapter:$('chapterSelect').value,kind:$('kindSelect').value,count:$('countSelect').value,order:$('orderSelect').value};
 session={ids:actual.map(q=>q.id),index:0,answers:{},correct:0,answered:0,skipped:0,type};view('quiz');renderQuestion()}
function currentQuestion(){return BANK.find(q=>q.id===session.ids[session.index])}
function renderQuestion(){const q=currentQuestion();QuizTrust.validateMath(q);const selected=session.answers[q.id];if(!session.questionStartTimes)session.questionStartTimes={};if(selected===undefined&&!session.questionStartTimes[q.id])session.questionStartTimes[q.id]=Date.now();$('quizPosition').textContent=`${session.index+1} / ${session.ids.length}`;$('quizMeta').textContent=session.type==='wrong'?'오답 복습':session.type==='fav'?'즐겨찾기 복습':q.kind+' 문제';$('quizProgress').style.width=(session.index/session.ids.length*100)+'%';$('qChapter').textContent=q.chapter;$('qMeta').textContent=`${q.id} · ${q.kind} · ${q.difficulty||'기출'} · ${q.topic} · ${sourceText(q)}`;$('qQuestion').textContent=q.question;$('qMeta').append(QuizTrust.statusTag(q,'comm'));window.TelecomCrowdStats?.render('comm',q);$('qualityBox').replaceChildren(QuizQuality.panel(q,'comm'));StudyUI.renderMemo(q,'comm');$('sourcePreview').replaceChildren();if(q.sourceTag==='BROADCAST'){if(q.sourceQuality!=='텍스트 추출'){const w=el('p','review-note','⚠ 이 문제는 원문 수식·보기·그림 대조가 필요합니다. 자동 채점은 보류됩니다.');$('sourcePreview').append(w)}appendSourcePreview($('sourcePreview'),q)}const isFav=data.bookmarks.includes(q.id);$('bookmarkBtn').textContent=isFav?'★ 저장됨':'☆ 즐겨찾기';$('bookmarkBtn').onclick=()=>{if(data.bookmarks.includes(q.id))data.bookmarks=data.bookmarks.filter(id=>id!==q.id);else data.bookmarks.push(q.id);save();StudyStore.setBookmark('comm',q.id,data.bookmarks.includes(q.id));$('bookmarkBtn').textContent=data.bookmarks.includes(q.id)?'★ 저장됨':'☆ 즐겨찾기'};
 $('answers').replaceChildren(...q.options.map((opt,i)=>{const b=el('button','choice');const bubble=el('span','bubble',String(i+1));b.append(bubble,el('span','',opt));b.addEventListener('click',()=>answer(i));if(selected!==undefined){b.disabled=true;if(QuizTrust.gradeable(q,'comm')&&q.answer>=0&&i===q.answer)b.classList.add('correct');else if(i===selected)b.classList.add('wrong')}return b}));
 const feedback=$('feedback');if(selected!==undefined){const hasAnswer=QuizTrust.gradeable(q,'comm')&&q.answer>=0;feedback.hidden=false;feedback.className='explanation'+(hasAnswer&&selected===q.answer?'':' bad');feedback.replaceChildren(el('h3','',!hasAnswer?('채점 보류 · 원문 대조가 필요합니다.'+(q.sourceTag==='BROADCAST'&&q.studyAnswer!==null?' 비공식 자체 풀이상 '+(q.studyAnswer+1)+'번으로 추정됩니다.':'')):(selected===q.answer?(q.sourceTag==='BROADCAST'?'정답입니다. (비공식 학습용 기준)':'정답입니다.'):(q.sourceTag==='BROADCAST'?'오답입니다. 비공식 학습용 답안은 ':'오답입니다. 정답은 ')+(q.answer+1)+'번입니다.')),el('p','',q.explanation));const a=el('span','',sourceText(q));a.style.fontSize='12px';a.style.display='inline-block';a.style.marginTop='10px';feedback.append(a)}else{feedback.hidden=true;feedback.replaceChildren()}
 $('nextBtn').hidden=selected===undefined;$('nextBtn').textContent=session.index===session.ids.length-1?'결과 보기 →':'다음 문제 →';$('skipBtn').hidden=selected!==undefined;QuizTrust.renderMath(q,[$('qQuestion'),$('answers'),$('feedback')]);}
function answer(index){const q=currentQuestion();if(session.answers[q.id]!==undefined)return;session.answers[q.id]=index;session.answered++;const graded=QuizTrust.gradeable(q,'comm')&&q.answer>=0;const correct=graded&&index===q.answer;if(correct)session.correct++;let r=data.progress[q.id]||{seen:0,correct:0,wrong:0};r.seen++;if(correct)r.correct++;else if(graded)r.wrong++;r.lastCorrect=graded?correct:null;r.lastAt=Date.now();data.progress[q.id]=r;save();StudyStore.record('comm',q,{correct,graded,durationMs:Date.now()-(session.questionStartTimes?.[q.id]||Date.now())});StudyUI.refreshHome('comm');window.TelecomCrowdStats?.record('comm',q,correct,graded);renderQuestion()}
function advance(){if(!session)return;if(session.index+1>=session.ids.length){finish();return}session.index++;renderQuestion();window.scrollTo({top:0,behavior:'smooth'})}
function skip(){const q=currentQuestion();if(session.answers[q.id]===undefined)session.skipped++;advance()}
function finish(){if(!session)return;lastSessionIds=[...session.ids];const total=session.ids.length;const wrongIDs=session.ids.filter(id=>{const q=BANK.find(q=>q.id===id);return QuizTrust.gradeable(q,'comm')&&session.answers[id]!==undefined&&session.answers[id]!==q.answer});const correct=session.correct;const answered=session.answered;const gradedCount=session.ids.filter(id=>{const q=BANK.find(q=>q.id===id);return QuizTrust.gradeable(q,'comm')&&session.answers[id]!==undefined}).length;const pending=answered-gradedCount;data.history.unshift({date:new Date().toISOString(),total,answered,correct,chapter:session.type==='normal'?lastSessionConfig.chapter:session.type});data.history=data.history.slice(0,25);save();StudyStore.addSession('comm',{kind:session.type,questionCount:total,answered,gradedCount,correct,skipped:total-answered});const used=session;session=null;view('result');$('bigScore').textContent=rate(correct,gradedCount)+'%';$('resultLabel').textContent=`${gradedCount}문제 채점 중 ${correct}문제 정답 · 정답 검토 ${pending}개 · 건너뛴 문제 ${total-answered}개`;$('resultStats').replaceChildren(...[['정답',correct],['오답',gradedCount-correct],['채점 보류',pending],['미응답',total-answered]].map(([t,n])=>{const d=el('div');d.append(el('b','',String(n)),el('span','mini',t));return d}));$('retryWrong').disabled=wrongIDs.length===0;$('retryWrong').onclick=()=>begin('wrong',wrongIDs);$('resultList').replaceChildren(...used.ids.map((id,i)=>{const q=BANK.find(z=>z.id===id);const a=used.answers[id];const label=a===undefined?'건너뜀':!QuizTrust.gradeable(q,'comm')?'채점 보류':a===q.answer?'정답':'오답';const r=el('div','listrow');const txt=el('div');txt.append(el('b','',`${i+1}. ${q.question.replace(/\n/g,' ').slice(0,84)}`),el('div','mini',`${q.chapter} · ${sourceText(q)}`));const badge=el('span','pill',label);if(label==='오답')badge.style.color='var(--danger)';if(label==='정답')badge.style.color='var(--success)';r.append(txt,badge);return r}))}
function renderBank(){
 const keyword=$('bankSearch').value.trim().toLocaleLowerCase();
 const ch=$('bankChapter').value,kind=$('bankKind').value,difficulty=$('bankDifficulty').value;
 const arr=BANK.filter(q=>QuizTrust.eligible(q,'comm')&&(difficulty==='all'||q.difficulty===difficulty)&&(ch==='all'||q.chapter===ch)&&(kind==='all'||q.kind===kind)&&matchesExamFilters(q,'bankTopic','bankYear')&&(keyword===''||[q.question,q.explanation,q.topic,q.id,sourceText(q),q.year,q.no,...q.options].join(' ').toLocaleLowerCase().includes(keyword)));
 const PAGE_SIZE=25,pages=Math.max(1,Math.ceil(arr.length/PAGE_SIZE));bankPage=Math.max(0,Math.min(bankPage,pages-1));
 $('bankCount').textContent=`검색 결과 ${arr.length}문항 / 전체 ${BANK.length}문항 · 페이지 ${bankPage+1}/${pages}`;
 $('bankList').replaceChildren(...arr.slice(bankPage*PAGE_SIZE,(bankPage+1)*PAGE_SIZE).map(q=>{
  const wrap=el('div'),b=el('button','bankrow');
  b.append(el('div','bmeta',`${q.id} · ${q.chapter} · ${q.topic} · ${q.kind} · ${sourceText(q)}`),el('div','btitle',q.question.replace(/\n/g,' ')));
  wrap.append(b);
  const box=el('div','bankdetail');box.hidden=bankOpened!==q.id;
  box.append(QuizQuality.panel(q,'comm'));
  box.append(el('p','',q.question));
  if(q.sourceTag==='BROADCAST'&&q.sourceQuality!=='텍스트 추출')box.append(el('p','review-note','원문 대조가 필요한 문항입니다. 일부 보기·도표·수식이 불완전하여 자동 채점하지 않습니다.'));
  q.options.forEach((op,i)=>{const finalValid=QuizTrust.gradeable(q,'comm');box.append(el('div','opt'+(finalValid&&i===q.answer?' good':''),`${i+1}. ${op} ${finalValid&&i===q.answer?'✓ 자체 풀이 답안':''}`))});
  if(q.sourceTag==='BROADCAST')box.append(el('p','broad-meta',q.studyAnswer!==null?'비공식 학습용 답안: '+(q.studyAnswer+1)+'번 (공식 정답표 미대조)':'학습용 답안 검토 중'));
  box.append(el('p','',q.explanation));
  if(q.sourceTag==='BROADCAST')appendSourcePreview(box,q);
  b.addEventListener('click',()=>{bankOpened=bankOpened===q.id?null:q.id;box.hidden=bankOpened!==q.id});
  wrap.append(box);return wrap;
 }));
 const pager=$('bankPager');pager.replaceChildren();
 const prev=el('button','btn','← 이전');prev.disabled=bankPage===0;prev.onclick=()=>{bankPage--;renderBank();window.scrollTo(0,0)};
 const next=el('button','btn','다음 →');next.disabled=bankPage===pages-1;next.onclick=()=>{bankPage++;renderBank();window.scrollTo(0,0)};
 pager.append(prev,el('span','mini',`${bankPage+1} / ${pages}`),next);
}
function renderRecords(){renderStats('recordStats');$('chapterRecords').replaceChildren(...CHAPTERS.map(ch=>{const qs=BANK.filter(q=>q.chapter===ch);let seen=0,correct=0;for(const q of qs){const r=data.progress[q.id];if(r){seen+=(r.correct||0)+(r.wrong||0);correct+=r.correct||0}}const d=el('div','listrow');d.append(el('div','',ch),el('div','mini',`${rate(correct,seen)}% · ${seen}회 풀이`));return d}));$('historyList').replaceChildren(...(data.history.length?data.history.slice(0,9).map(h=>{const d=el('div','listrow');d.append(el('span','mini',new Date(h.date).toLocaleString('ko-KR')),el('b','',`${h.correct}/${h.answered} 정답`));return d}):[el('p','muted','아직 학습 기록이 없습니다.')]))}
function safeQuit(){if(session && session.answered>0 && !confirm('현재 학습을 종료하고 홈으로 돌아가시겠습니까? 응답 기록과 오답 목록은 종료 후에도 저장됩니다.'))return false;session=null;view('home');return true}
function init(){StudyUI.mount('comm',{bank:BANK,legacyKey:PREF_STORE,legacyData:()=>({progress:data.progress,bookmarks:data.bookmarks,history:data.history,theme:data.theme}),openAnalytics:()=>view('analytics'),beginDue:ids=>begin('normal',ids)});QuizSource.register(BANK,'comm');QuizTrust.attach(BANK,'comm',{onChange:()=>{renderHome();if(currentView==='bank')renderBank()}});QuizTrust.loadOverrides(()=>{renderHome();if(currentView==='bank')renderBank()});updateDynamicCounts();renderComposition();$('compositionBtn').addEventListener('click',()=>{const p=$('compositionPanel'),b=$('compositionBtn');p.hidden=!p.hidden;b.setAttribute('aria-expanded',String(!p.hidden));b.textContent=p.hidden?'▤ 전체 문제 구성 보기':'▴ 전체 문제 구성 접기';});chaptersSelect($('chapterSelect'));chaptersSelect($('bankChapter'));addMissingKinds('kindSelect');addMissingKinds('bankKind');populateExtraFilters('chapterSelect','topicSelect','yearSelect');populateExtraFilters('bankChapter','bankTopic','bankYear');$('chapterSelect').addEventListener('change',()=>{populateExtraFilters('chapterSelect','topicSelect','yearSelect');renderHome()});$('topicSelect').addEventListener('change',renderHome);$('yearSelect').addEventListener('change',renderHome);$('difficultySelect').addEventListener('change',()=>{$('compositionDifficulty').value=$('difficultySelect').value;renderHome();});$('compositionDifficulty').addEventListener('change',()=>{$('difficultySelect').value=$('compositionDifficulty').value;renderHome();});$('kindSelect').addEventListener('change',renderHome);$('startBtn').addEventListener('click',()=>begin());$('wrongBtn').addEventListener('click',()=>begin('wrong'));$('favBtn').addEventListener('click',()=>begin('fav'));$('quitBtn').addEventListener('click',safeQuit);$('nextBtn').addEventListener('click',advance);$('skipBtn').addEventListener('click',skip);$('resultHome').addEventListener('click',()=>view('home'));$('repeatSession').addEventListener('click',()=>begin('normal',lastSessionIds));document.querySelectorAll('[data-nav]').forEach(b=>b.addEventListener('click',()=>{if(session&&currentView==='quiz'&&!safeQuit())return;view(b.dataset.nav)}));$('bankSearch').addEventListener('input',()=>{bankPage=0;renderBank()});$('bankChapter').addEventListener('change',()=>{populateExtraFilters('bankChapter','bankTopic','bankYear');bankPage=0;renderBank()});$('bankTopic').addEventListener('change',()=>{bankPage=0;renderBank()});$('bankYear').addEventListener('change',()=>{bankPage=0;renderBank()});$('bankKind').addEventListener('change',()=>{bankPage=0;renderBank()});$('bankDifficulty').addEventListener('change',()=>{bankPage=0;renderBank()});$('exportBtn').addEventListener('click',()=>{const blob=new Blob([JSON.stringify({version:1,...data},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='통신공학1000_학습기록_'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)});$('importBtn').addEventListener('click',()=>$('importFile').click());$('importFile').addEventListener('change',async ev=>{const file=ev.target.files[0];if(!file)return;try{const parsed=JSON.parse(await file.text());if(typeof parsed.progress!=='object'||!Array.isArray(parsed.bookmarks)||!Array.isArray(parsed.history))throw Error('형식');if(!confirm('기존 학습 기록을 백업 파일 기록으로 교체할까요?'))return;data.progress=parsed.progress;data.bookmarks=parsed.bookmarks;data.history=parsed.history;save();renderRecords();toast('학습 기록을 복원했습니다.')}catch{toast('올바른 학습 기록 파일이 아닙니다.')}finally{ev.target.value=''}});$('resetBtn').addEventListener('click',()=>{if(!confirm('모든 풀이·오답·즐겨찾기 기록을 초기화할까요?'))return;data.progress={};data.bookmarks=[];data.history=[];save();renderRecords();toast('학습 기록을 초기화했습니다.')});$('themeBtn').addEventListener('click',()=>{data.theme=data.theme==='dark'?'light':'dark';theme();save()});document.addEventListener('keydown',e=>{if(currentView!=='quiz'||!session||e.altKey||e.ctrlKey||e.metaKey)return;if(['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName))return;const a=session.answers[currentQuestion().id];if(a===undefined&&['1','2','3','4','5'].includes(e.key)&&Number(e.key)<=currentQuestion().options.length){answer(parseInt(e.key,10)-1)}else if(a!==undefined&&['Enter','ArrowRight'].includes(e.key)){e.preventDefault();advance()}});theme();renderHome();}
function theme(){document.documentElement.dataset.theme=data.theme;$('themeBtn').textContent=data.theme==='dark'?'☀':'☾'}

init();save();maybeStartLinkedUnit();
