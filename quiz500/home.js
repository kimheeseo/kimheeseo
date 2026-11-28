/* Reads the existing banks and StudyStore; does not alter grading or storage rules. */
(async()=>{'use strict';const byId=id=>document.getElementById(id);
const task=byId('today-task'),primary=byId('today-primary');
function finish(){document.querySelectorAll('.skeleton').forEach(e=>e.classList.remove('skeleton'));task.setAttribute('aria-busy','false');byId('study-stats').setAttribute('aria-busy','false');byId('today-message').removeAttribute('aria-hidden');}
// Nonessential update/table data must not block the personal dashboard.
QuizJSON.load('./data/changes.json').then(data=>{const list=byId('updates-summary');list.replaceChildren();for(const entry of data.entries.slice(0,2)){const li=document.createElement('li');li.textContent=entry.date+' · '+entry.title;list.append(li);}}).catch(()=>{});
QuizJSON.load('./data/home-materials.json').then(data=>{for(const[id,markup]of Object.entries(data.blocks)){if(byId(id))byId(id).innerHTML=markup;}}).catch(()=>{for(const id of ['compview','wirelessCompPanel'])byId(id).textContent='단원 구성을 표시할 수 없습니다. 과목별 문제은행에서 확인하세요.';});
try{
 await QuizTrust.loadOverrides();const subjects=['comm','wireless','kwater'];const banks=await Promise.all(subjects.map(s=>QuizBank.load(s)));let total=0,verified=0,due=0,eligibleDue=0,upcoming=[],correct=0,wrong=0;
 for(const[i,subject]of subjects.entries()){
  const key=StudyStore.legacyKey(subject);StudyStore.hydrate(subject,StudyStore.readLegacy(key)||{},key);
  total+=banks[i].length;verified+=QuizTrust.verifiedCount(banks[i],subject);
  const dueItems=StudyStore.due(subject),lookup=new Map(banks[i].map(q=>[q.id,q]));due+=dueItems.length;
  eligibleDue+=dueItems.filter(p=>{const q=lookup.get(p.id);return q&&QuizTrust.eligible(q,subject)&&QuizTrust.gradeable(q,subject);}).length;
  for(const p of Object.values(StudyStore.load(subject).items)){correct+=p.correct;wrong+=p.wrong;const when=Date.parse(p.nextDueAt);if(Number.isFinite(when)&&when>Date.now())upcoming.push(when);}
 }
 const graded=correct+wrong;
 byId('appAccuracy').textContent=graded?Math.round(correct/graded*100)+'%':'—';byId('appGraded').textContent=graded.toLocaleString('ko-KR');
 byId('appAccuracyNote').textContent=graded?'이 브라우저에 저장된 실제 풀이 기록':'아직 풀이 기록이 없어요. 첫 학습부터 함께 쌓아가요.';
 const malformed=banks[0].qualityCounts?.malformed||0;
 byId('home-bank-count').textContent='전체 '+(total+malformed).toLocaleString('ko-KR')+'문항 · 검증 완료 '+verified.toLocaleString('ko-KR')+'문항';
 byId('home-due-count').textContent=due;
 if(eligibleDue>0){byId('today-study-title').textContent='오늘 복습할 문제가 있어요';byId('today-message').textContent='출제 가능한 '+eligibleDue+'문항을 다시 풀며 기억을 다져보세요.';primary.textContent='오늘 복습 시작';primary.href='./learning.html?mode=review';}
 else{byId('today-study-title').textContent=graded?'오늘도 한 걸음 이어가요':'처음이라면, 가볍게 시작해요';byId('today-message').textContent=due?'복습 대기 문항의 검증 상태를 확인하고 있어요. 개념 학습을 이어가세요.':graded?'지금 복습할 문제는 없어요. 새로운 개념을 익혀보세요.':'7일 코스로 무선공학의 흐름부터 익혀보세요.';primary.textContent='무선공학 1회독 시작';primary.href='./wireless-first-pass/';}
 const next=upcoming.length?' 다음 예정일: '+new Date(Math.min(...upcoming)).toLocaleDateString('ko-KR')+'.':'';
 byId('home-due-availability').textContent='복습 대기 '+due+'문항 중 현재 검증 필터에서 출제 가능 '+eligibleDue+'문항.'+next+' 풀이 목록 '+total.toLocaleString('ko-KR')+'문항, 내용 누락 '+malformed+'문항 보류. 검증된 출제 가능 문항이 없으면 일반 모의고사는 시작되지 않습니다.';
}catch(e){
 byId('today-study-title').textContent='학습 자료를 먼저 살펴보세요';byId('today-message').textContent='학습 현황을 표시하지 못했어요. 잠시 후 새로고침해 주세요.';
 byId('appAccuracy').textContent='—';byId('appGraded').textContent='—';byId('home-due-count').textContent='—';
 byId('appAccuracyNote').textContent='기록을 확인할 수 없습니다. 내 학습 현황에서 다시 확인해 주세요.';byId('home-bank-count').textContent='학습 자료 연결을 확인해 주세요.';
}finally{finish();}
})();
