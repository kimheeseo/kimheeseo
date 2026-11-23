(async()=>{'use strict';
 const doc=await QuizJSON.load('./generated-mock-2.json');
 await QuizTrust.loadOverrides();
 const host=document.getElementById('mock2-questions');
 for(const q of doc.questions){
  QuizSource.register([q],q.subject);QuizTrust.register([q],q.subject);QuizTrust.validateMath(q);
  const article=document.createElement('article');article.className='question';article.id='question-'+q.number;
  const h=document.createElement('h3');h.textContent=q.number+'. '+q.topic;
  const meta=document.createElement('p');meta.className='muted';meta.textContent=(q.subject==='comm'?'통신·전기 기초':'무선·전자기')+' · '+q.difficulty+' · '+q.id;
  const p=document.createElement('p');p.textContent=q.question;
  const choices=document.createElement('ol');for(const text of q.options){const li=document.createElement('li');li.textContent=text;choices.append(li)}
  const details=document.createElement('details');const summary=document.createElement('summary');summary.textContent='잠정 답안·해설 보기';const solution=document.createElement('p');solution.textContent=(q.answer+1)+'번 · '+q.explanation;details.append(summary,solution);
  article.append(h,meta,QuizTrust.statusTag(q,q.subject),p,choices,details,QuizQuality.panel(q,q.subject));host.append(article);QuizTrust.renderMath(q,[p,choices,solution]);
 }
 document.getElementById('set-count').textContent='30문항 · 5지선다 · 통신·전기 기초 20 / 무선·전자기 10';
 document.getElementById('preview-note').textContent='문제지 미리보기에는 풀이 기록이 저장되지 않습니다. 기록·오답 복습은 위의 과목별 학습 버튼을 이용하세요.';
})().catch(e=>{document.getElementById('set-count').textContent='문항을 불러오지 못했습니다. '+e.message});
