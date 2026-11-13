/* 학습 데이터의 출처·검토 상태 표시. 원본 데이터는 변경하지 않습니다. */
(function(){
'use strict';
const availablePdfs=new Set(["local-9-communication/2024-local-9-communication.pdf","local-9-communication/2025-local-9-communication.pdf","local-9-communication/2026-local-9-communication.pdf","military-9-communication/2026-military-9-communication.pdf","morningstudy-national-grade-7-2016-subject-048.pdf","morningstudy-national-grade-7-2017-subject-050.pdf","morningstudy-national-grade-7-2018-subject-052.pdf","morningstudy-national-grade-7-2019-subject-051.pdf","morningstudy-national-grade-7-2020-subject-052.pdf","morningstudy-national-grade-7-second-2021-subject-051.pdf","morningstudy-national-grade-7-second-2022-subject-051.pdf","morningstudy-national-grade-7-second-2023-subject-053.pdf","morningstudy-national-grade-7-second-2024-subject-047.pdf","morningstudy-national-grade-7-second-2025-subject-050.pdf","morningstudy-national-grade-7-second-2026-subject-050.pdf","national-7-communication-2007-2015/2007-national-7-communication.pdf","national-7-communication-2007-2015/2008-national-7-communication.pdf","national-7-communication-2007-2015/2009-national-7-communication.pdf","national-7-communication-2007-2015/2010-national-7-communication.pdf","national-7-communication-2007-2015/2011-national-7-communication.pdf","national-7-communication-2007-2015/2012-national-7-communication.pdf","national-7-communication-2007-2015/2013-national-7-communication.pdf","national-7-communication-2007-2015/2014-national-7-communication.pdf","national-7-communication-2007-2015/2015-national-7-communication.pdf"]);
function hasBadGlyph(q){return /[\uE000-\uF8FF]/.test([q.question||'',...(q.options||[])].join(' '))}
function prepareComm(bank){
 const used=new Set(bank.map(q=>q.id)),seen=new Map();let malformed=0,renamed=0,pua=0;
 for(const q of bank){const old=q.id,n=seen.get(old)||0;seen.set(old,n+1);
  if(n){let candidate=old+'__occ'+(n+1),suffix=1;while(used.has(candidate))candidate=old+'__occ'+(n+1)+'_'+suffix++;used.add(candidate);q.legacyId=old;q.id=candidate;renamed++}
  if(hasBadGlyph(q)){q.glyphReview=true;q.originalAnswer=q.answer;q.answer=null;pua++}
 }
 for(let i=bank.length-1;i>=0;i--){let q=bank[i];if(!String(q.question||'').trim()||!Array.isArray(q.options)||!q.options.length){bank.splice(i,1);malformed++}}
 return {malformed,renamed,pua};
}
function classification(q){
 const k=String(q.kind||''),t=String(q.topic||'');
 if(/응용/.test(k))return '기출 응용·학습용';
 if(/복원/.test(k+' '+t))return '복원·학습용';
 if(/서울교통공사 기출|코레일 기출/.test(k))return '기출 유형 표시 · 공식 원문 여부 미확인';
 if(/기출/.test(k))return '기출로 표시된 문항 · 원문 확인 필요';
 return '개념 학습 문항';
}
function originalPdf(q,subject){
 if(subject!=='comm')return null;
 if(q.source&&availablePdfs.has(q.source))return './source-pdfs/'+encodeURIComponent(q.source)+'#page='+Math.max(1,Number(q.page)||1);
 const m=String(q.kind||'').match(/(2024|2025|2026)년도 지방공무원 9급/);
 if(m){const p='local-9-communication/'+m[1]+'-local-9-communication.pdf';if(availablePdfs.has(p))return './source-pdfs/'+p}
 return null;
}
function dedupe(items){const seen=new Set();return items.filter(q=>{const key=JSON.stringify([q.question,q.options,q.answer]);if(seen.has(key))return false;seen.add(key);return true})}
function panel(q,subject){
 const host=document.createElement('section');host.className='quality-panel';host.setAttribute('aria-label','문항 출처와 오류 신고');
 const title=document.createElement('strong');title.textContent=classification(q);host.append(title);
 const src=document.createElement('p');src.textContent='출처 표기: '+(q.sourceLabel||q.exam||q.source||('기존 학습 자료 '+(q.page||'?')+'쪽'))+'.';host.append(src);
 const state=document.createElement('p');state.textContent='검토 상태: 이번 점검은 데이터 형식 자동 점검입니다. 원문·정답·해설의 개별 대조 여부는 이 표시만으로 확인할 수 없습니다.';host.append(state);
 if(q.legacyId){const m=document.createElement('p');m.textContent='중복되던 ID를 구분했습니다. 이전 ID: '+q.legacyId+'. 기존 ID에 저장된 기록은 당시 실제 표시된 첫 문항에 남습니다.';host.append(m)}
 if(q.glyphReview){const w=document.createElement('p');w.className='quality-warning';w.textContent='수식·그림 표시 확인 필요: 일부 문자가 깨져 보일 수 있어 이 문항은 자동 채점을 보류합니다. 아래 원문 자료가 있으면 확인해 주세요.';host.append(w)}
 const pdf=originalPdf(q,subject);if(pdf){const a=document.createElement('a');a.href=pdf;a.target='_blank';a.rel='noopener';a.textContent='해당 시험지 PDF 열기 ↗';host.append(a)}
 else if(q.glyphReview&&q.sourceTag==='BROADCAST'){const p=document.createElement('p');p.textContent='아래의 원문 이미지 확인 메뉴에서 시험지를 열어 보세요.';host.append(p)}
 else if(q.glyphReview){const p=document.createElement('p');p.textContent='연결 가능한 원문 PDF는 현재 확인되지 않았습니다.';host.append(p)}
 const details=document.createElement('details');details.className='quality-report';
 const sum=document.createElement('summary');sum.textContent='이 문항 오류 신고';details.append(sum);
 const label=document.createElement('label');label.textContent='신고 유형 ';const select=document.createElement('select');select.setAttribute('aria-label','오류 신고 유형');['문제 본문 오류','선택지 오류','정답 오류','해설 오류','그림·수식 누락','출처 오류','기타'].forEach(t=>{let o=document.createElement('option');o.value=t;o.textContent=t;select.append(o)});label.append(select);details.append(label);
 const explain=document.createElement('p');explain.textContent='GitHub 공개 이슈 작성 화면이 열립니다. 확인 후 직접 제출해야 하며, 개인정보는 적지 마세요.';details.append(explain);
 const a=document.createElement('a');a.target='_blank';a.rel='noopener';a.className='quality-report-link';a.textContent='신고 내용 작성하기 ↗';
 function update(){const title='[문항 오류] '+subject+' / '+q.id+' / '+select.value;const body=['과목: '+(subject==='comm'?'통신공학':'무선공학'),'문항 ID: '+q.id,'문항 유형: '+(q.kind||'미확인'),'출처 표기: '+(q.sourceLabel||q.exam||q.source||'미확인'),'오류 유형: '+select.value,'페이지: '+location.href.split('?')[0].split('#')[0],'','오류 설명:','- ','','※ 이 이슈는 공개됩니다. 개인정보를 포함하지 마세요.'].join('\n');a.href='https://github.com/kimheeseo/kimheeseo/issues/new?'+new URLSearchParams({title,body}).toString()}
 select.addEventListener('change',update);update();details.append(a);host.append(details);return host;
}
window.QuizQuality={prepareComm,panel,dedupe};
})();