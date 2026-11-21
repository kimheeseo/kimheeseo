/* Quiz500 study dashboard and memo UI for communication and wireless apps. */
(function(root){"use strict";
const instances={};
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function filteredDue(subject){
 const cfg=instances[subject];if(!cfg)return[];
 const all=new Map(cfg.bank.map(q=>[q.id,q]));
 return StudyStore.due(subject).map(p=>all.get(p.id)).filter(q=>q&&(!root.QuizTrust||QuizTrust.eligible(q,subject))&&(!root.QuizTrust||QuizTrust.gradeable(q,subject)));
}
function mount(subject,cfg){
 instances[subject]=cfg;
 StudyStore.hydrate(subject,cfg.legacyData(),cfg.legacyKey);
 const main=document.querySelector("main.layout");if(!main)return;
 const nav=document.querySelector("header .nav");
 if(nav&&!nav.querySelector('[data-nav="analytics"]')){
  const btn=document.createElement("button");btn.type="button";btn.dataset.nav="analytics";btn.textContent="내 학습 현황";
  const theme=nav.querySelector("#themeBtn");nav.insertBefore(btn,theme);
 }
 const section=document.createElement("section");section.id="analyticsView";section.hidden=true;
 section.innerHTML='<div class="hero"><span class="eyebrow">STUDY ANALYTICS · REAL RECORDS</span><h1>내 학습 현황</h1><p>내 브라우저에 실제로 저장된 풀이 기록만 집계합니다. 예측 점수나 AI 추천은 사용하지 않습니다.</p></div>'+
 '<div id="studyOverview" class="stats"></div><div class="two"><section class="panel"><h2>단원별 정답률</h2><div id="studyUnits" class="list"></div></section>'+
 '<section class="panel"><h2>자주 틀리는 단원 TOP 3</h2><div id="studyWeak" class="list"></div><hr class="thin">'+
 '<h2>복습·기록 관리</h2><p class="mini">오답은 1일 → 3일 → 7일 → 14일 순서로 재출제하고, 틀리면 1일 단계로 돌아갑니다.</p>'+
 '<div class="actions"><button class="btn primary" id="studyDueStart" type="button">오늘 복습 시작</button><button class="btn" id="studyExport" type="button">기록 JSON 내보내기</button><button class="btn" id="studyImport" type="button">기록 JSON 가져오기</button></div><input type="file" id="studyImportFile" accept="application/json,.json" hidden><p class="mini">가져오기는 현재 과목의 기록을 백업 데이터로 교체합니다. 다른 과목 파일은 적용하지 않습니다.</p></section></div>';
 main.append(section);
 const home=document.getElementById("homeView"),stats=home?.querySelector("#topStats");
 if(stats){
  const card=document.createElement("section");card.className="panel";card.id="todayDueCard";card.style.margin="17px 0";
  card.innerHTML='<span class="eyebrow">SPACED REPETITION</span><h2 style="margin-top:8px">오늘 복습할 문제 <span id="todayDueNumber">0</span>개</h2><p id="todayDueDetail" class="mini">저장된 오답 기록을 확인합니다.</p><div class="actions"><button class="btn primary" type="button" id="todayDueBegin">복습 시작</button><button class="btn" type="button" id="todayDueAnalytics">내 학습 현황 →</button></div>';
  stats.insertAdjacentElement("afterend",card);
  card.querySelector("#todayDueBegin").onclick=()=>startDue(subject);
  card.querySelector("#todayDueAnalytics").onclick=()=>cfg.openAnalytics();
 }
 section.querySelector("#studyDueStart").onclick=()=>startDue(subject);
 section.querySelector("#studyExport").onclick=()=>StudyStore.exportFile(subject,cfg.legacyData());
 const importBtn=section.querySelector("#studyImport"),fileInput=section.querySelector("#studyImportFile");
 importBtn.onclick=()=>fileInput.click();
 fileInput.onchange=async()=>{
  const f=fileInput.files?.[0];if(!f)return;
  try{const ok=await StudyStore.importFile(subject,f);if(ok){alert("백업 복원 완료. 이전 화면과 통계를 함께 새로고침합니다.");location.reload()}}
  catch(e){alert("복원 실패: "+e.message)}finally{fileInput.value=""}
 };
 const style=document.createElement("style");style.textContent="#todayDueNumber{color:var(--primary)}#studyOverview{margin-bottom:18px}#studyUnits .listrow,#studyWeak .listrow{flex-wrap:wrap}#studyWeak .listrow b{color:var(--primary)}.study-memo{margin-top:14px;border:1px solid var(--line);border-radius:12px;padding:13px;background:var(--surface2)}.study-memo label{display:block;font-size:12px;color:var(--muted);font-weight:850}.study-memo textarea{margin-top:6px;display:block;width:100%;min-height:72px;border:1px solid var(--line);border-radius:9px;padding:10px;background:var(--surface);color:var(--text);font:inherit;font-size:13px;resize:vertical}";document.head.append(style);
 refreshHome(subject);
}
function startDue(subject){
 const cfg=instances[subject],items=filteredDue(subject);
 if(!items.length){alert("현재 학습 설정으로 복습 가능한 문항이 없습니다. 검증된 문항만 풀기 필터 및 복습일을 확인하세요.");return}
 cfg.beginDue(items.map(q=>q.id));
}
function refreshHome(subject){
 const due=StudyStore.due(subject),eligible=filteredDue(subject);
 const count=document.getElementById("todayDueNumber");
 if(count)count.textContent=String(due.length);
 const help=document.getElementById("todayDueDetail");
 if(help)help.textContent="실제 오답에 기초한 복습 대기 "+due.length+"개 · 현재 검증 필터로 학습 가능 "+eligible.length+"개. 1/3/7/14일 간격.";
 if(!document.getElementById("analyticsView")?.hidden)render(subject);
}
function render(subject){
 const cfg=instances[subject];if(!cfg)return;
 const data=StudyStore.stats(subject,cfg.bank),dueAll=data.due.length,dueEligible=filteredDue(subject).length;
 const host=document.getElementById("studyOverview");if(!host)return;
 const values=[["오늘 복습",dueAll,"문항"],["현재 필터 복습",dueEligible,"문항"],["최근 7일 풀이",data.recent7,"회"],["총 누적 풀이",data.attempts,"회"]];
 host.replaceChildren(...values.map(([label,n,suffix])=>{
  const div=document.createElement("div");div.className="stat";
  const l=document.createElement("div");l.className="label";l.textContent=label;
  const value=document.createElement("div");value.className="value";value.textContent=n;
  const unit=document.createElement("span");unit.className="suffix";unit.textContent=suffix;value.append(unit);div.append(l,value);return div;
 }));
 const units=document.getElementById("studyUnits"),wrong=document.getElementById("studyWeak");
 units.replaceChildren();wrong.replaceChildren();
 for(const item of data.unitRates){
  const div=document.createElement("div");div.className="listrow";div.append(document.createTextNode(item.chapter));
  const meta=document.createElement("span");meta.className="mini";meta.textContent=item.correct+"/"+item.attempts+" · "+item.rate+"%";div.append(meta);units.append(div);
 }
 for(const item of data.topWrong){
  const div=document.createElement("div");div.className="listrow";const name=document.createElement("b");name.textContent=item.chapter;
  const stat=document.createElement("span");stat.className="mini";stat.textContent="오답 "+item.wrong+"회 · 정답률 "+item.rate+"%";div.append(name,stat);wrong.append(div);
 }
 if(!data.unitRates.length)units.textContent="아직 풀이 기록이 없습니다.";
 if(!data.topWrong.length)wrong.textContent="아직 오답 기록이 없습니다.";
}
function renderMemo(q,subject){
 const host=document.getElementById("qualityBox");if(!host)return;
 const old=host.querySelector(".study-memo");if(old)old.remove();
 const wrap=document.createElement("div");wrap.className="study-memo";
 const label=document.createElement("label");label.textContent="이 문항 내 메모";label.htmlFor="studyMemoInput";
 const input=document.createElement("textarea");input.id="studyMemoInput";input.maxLength=5000;input.placeholder="개념, 실수, 복습 노트를 기록하세요.";input.value=StudyStore.item(subject,q.id).memo||"";
 input.addEventListener("input",()=>StudyStore.setMemo(subject,q.id,input.value));
 wrap.append(label,input);host.append(wrap);
}
root.StudyUI={mount,render,renderMemo,refreshHome,startDue};
})(window);
