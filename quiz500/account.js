/* Shared Supabase login + study statistics for both quiz apps and the portal.
   The existing localStorage study record and anonymous crowd-stat adapter remain intact. */
(function () {
  'use strict';
  const cfg = window.TELECOM_ACCOUNT_CONFIG || {};
  const configured = /^https:\/\/[a-z0-9.-]+\.supabase\.co\/?$/.test(String(cfg.url || '')) &&
    /^[A-Za-z0-9._-]{20,}$/.test(String(cfg.publishableKey || ''));
  const MIN = 20;
  const consentKey = 'telecom_study_sync_consent_v1';
  const hasConsent = () => { try { return localStorage.getItem(consentKey) === 'yes'; } catch { return false; } };
  const setConsent = enabled => { try { localStorage.setItem(consentKey, enabled ? 'yes' : 'no'); } catch {} };
  const storagePrefix = 'telecom_account_pending_v1_';
  let client = null, member = null, clientPromise = null, busy = false;
  let dialog, navButton, feedback, content, lastQuestion = null, questionNonce = 0;
  function make(tag, cls, value) {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (value !== undefined) node.textContent = value;
    return node;
  }
  function safeRead(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback; } catch { return fallback; }
  }
  function safeWrite(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; }
  }
  function fmt(rate) { return rate === null || rate === undefined ? '—' : Number(rate).toFixed(1).replace(/\.0$/, '') + '%'; }
  const css = make('style');
  css.textContent = '.ta-launch{border:1px solid #b8c9ed;background:#f0f5ff;color:#1851b6;border-radius:10px;padding:8px 12px;font:700 13px system-ui;cursor:pointer}.ta-launch:hover{background:#e3edff}.ta-overlay{position:fixed;inset:0;background:#10233b9c;display:grid;place-items:center;padding:14px;z-index:3000}.ta-overlay[hidden]{display:none}.ta-dialog{width:min(100%,670px);max-height:92dvh;overflow:auto;position:relative;background:#fff;color:#192b43;border-radius:22px;padding:25px;box-shadow:0 24px 80px #07132688;font-family:system-ui,"Malgun Gothic",sans-serif}.ta-head{display:flex;align-items:start;justify-content:space-between;gap:12px}.ta-head h2{font-size:21px;margin:0}.ta-close{border:0;background:#eef2fa;border-radius:9px;padding:6px 10px;cursor:pointer;font-size:20px}.ta-muted{color:#66768d;font-size:13px;line-height:1.6}.ta-dialog button{cursor:pointer}.ta-dialog input,.ta-dialog select{padding:11px;border:1px solid #c9d5e7;border-radius:10px;min-width:0;width:100%;font:inherit}.ta-dialog .ta-primary{padding:11px 15px;background:#1456e9;border:0;color:#fff;font-weight:800;border-radius:10px}.ta-dialog .ta-secondary{padding:9px 12px;background:#eef3fd;color:#2555ad;border:1px solid #cbd9f6;border-radius:10px;font-weight:700}.ta-dialog .ta-danger{padding:9px 12px;border:1px solid #e6a8a8;background:#fff5f5;color:#ad3444;border-radius:10px;font-weight:700}.ta-actions{display:flex;gap:9px;flex-wrap:wrap;align-items:center;margin:14px 0}.ta-login-form{display:flex;gap:9px;flex-wrap:wrap}.ta-login-form input{flex:1 1 230px}.ta-status{font-size:13px;color:#245785;min-height:19px}.ta-summary{display:grid;grid-template-columns:repeat(3,1fr);gap:9px;margin:13px 0}.ta-stat{border:1px solid #e0e8f4;background:#f7f9fd;padding:12px;border-radius:12px}.ta-stat strong{display:block;font-size:22px;color:#194fb5}.ta-stat span{font-size:11px;color:#63728c}.ta-row{border-bottom:1px solid #e7edf5;padding:10px 0}.ta-row strong{font-size:13px}.ta-row .ta-detail{font-size:12px;color:#697a91;margin:4px 0}.ta-meter{height:7px;background:#edf1f7;border-radius:12px;overflow:hidden}.ta-meter i{display:block;height:100%;background:#215de5;border-radius:12px}.ta-meter.alt i{background:#97a6c0}.ta-question{margin:9px 0 12px;padding:12px 14px;border:1px solid #cbdcf6;border-radius:12px;background:#f6f9ff;color:#2c4566;font-size:12px;line-height:1.6}.ta-question button{border:0;background:none;text-decoration:underline;color:#1f55cc;cursor:pointer;font-weight:800;padding:0}.ta-dialog label{font-weight:700;font-size:13px}.ta-warn{background:#fff5eb;border-radius:10px;padding:10px 12px;font-size:12px;color:#90551e}@media(max-width:520px){.ta-dialog{padding:17px}.ta-summary{grid-template-columns:repeat(2,1fr)}}';
  document.head.append(css);
  function status(text) { if (feedback) feedback.textContent = text || ''; }
  function updateButton() {
    if (navButton) navButton.textContent = member ? '▤ 내 학습 분석' : (configured ? '♙ 로그인' : '♙ 로그인 준비 중');
    if (lastQuestion) renderQuestion(lastQuestion.subject, lastQuestion.question, lastQuestion.key);
  }
  function show() {
    dialog.hidden = false;
    document.body.style.overflow = 'hidden';
    draw();
    dialog.querySelector('.ta-close').focus();
  }
  function hide() {
    dialog.hidden = true;
    document.body.style.overflow = '';
    navButton?.focus();
  }
  function wrapButton(label, callback, cls='ta-secondary') {
    const b=make('button',cls,label); b.type='button'; b.addEventListener('click',callback);return b;
  }
  function draw() {
    if (!content) return;
    content.replaceChildren();
    if (!configured) {
      content.append(make('p','ta-muted','Google 로그인 연결 전입니다. 운영자가 Supabase 공개 주소·키, Google OAuth 설정, SQL 구성을 등록하면 로그인과 실측 통계가 활성화됩니다.'));
      content.append(make('p','ta-warn','현재 문제은행과 브라우저 학습 기록은 정상 사용 가능합니다. 실제 전체 수험생 데이터는 아직 누적되지 않습니다.'));
      return;
    }
    if (!member) {
      content.append(make('p','ta-muted','별도 회원가입이나 비밀번호 없이 Google 계정으로 로그인합니다. Google Drive 파일 접근 권한은 요청하지 않습니다.'));
      const form=make('form','ta-login-form');
      const consentLabel=make('label','ta-consent');
      consentLabel.style.cssText='display:flex;align-items:flex-start;gap:9px;width:100%;font-size:12px;line-height:1.6;';
      const consentInput=make('input');consentInput.type='checkbox';consentInput.required=true;consentInput.checked=hasConsent();
      consentInput.style.cssText='width:18px;flex:0 0 18px;margin:2px 0;';
      consentLabel.append(consentInput,make('span','','Google 계정을 통한 로그인과 문제별 정오답·단원·난이도·풀이 시각의 계정별 서버 저장에 동의합니다. 다른 수험생에게 개인 기록은 공개되지 않습니다.'));
      const submit=make('button','ta-primary','Google 계정으로 계속하기');submit.type='submit';
      submit.style.cssText='width:100%;min-height:47px;display:flex;justify-content:center;align-items:center;gap:8px;';
      form.append(consentLabel,submit);
      form.addEventListener('submit',async e=>{
        e.preventDefault();
        if(!consentInput.checked){status('기록 저장에 동의해야 로그인 기능을 이용할 수 있습니다.');return}
        submit.disabled=true;status('Google 계정 선택 화면으로 이동하는 중입니다.');
        try {
          const c=await getClient();
          const redirectTo=new URL('/kimheeseo/quiz500/',location.origin).href;
          setConsent(true);
          const {error}=await c.auth.signInWithOAuth({provider:'google',options:{redirectTo}});
          if(error){setConsent(false);throw error}
        } catch(err) {
          status('Google 로그인 요청 실패: '+(err?.message||'네트워크 또는 OAuth 설정을 확인하세요.'));
          submit.disabled=false;
        }
      });
      content.append(form);
      content.append(make('p','ta-muted','Google 프로필의 이메일 주소는 계정 식별에만 사용합니다. Google Drive·Gmail 파일이나 콘텐츠는 읽지 않습니다.'));
      return;
    }
    const email=member.email||'로그인 계정';
    content.append(make('p','ta-muted',email+' 계정으로 로그인했습니다.'));
    const consentLabel=make('label','ta-consent');
    consentLabel.style.cssText='display:flex;align-items:flex-start;gap:9px;font-size:13px;margin:14px 0;';
    const syncInput=make('input');syncInput.type='checkbox';syncInput.checked=hasConsent();
    syncInput.style.cssText='width:18px;flex:0 0 18px;margin:2px 0;';
    syncInput.addEventListener('change',()=>{setConsent(syncInput.checked);status(syncInput.checked?'새로운 채점 기록의 서버 저장이 활성화되었습니다.':'새로운 채점 기록의 서버 저장을 중지했습니다. 이미 저장된 기록은 아래에서 직접 삭제할 수 있습니다.');});
    consentLabel.append(syncInput,make('span','','내 채점 결과를 서버에 누적하여 취약점과 전체 수험생 통계에 반영합니다.'));
    content.append(consentLabel);
    const actions=make('div','ta-actions');
    actions.append(wrapButton('통계 새로고침',loadInsights),wrapButton('로그아웃',async()=>{
      const {error}=await client.auth.signOut();
      if(error){status(error.message);return}member=null;updateButton();draw();status('로그아웃했습니다.');
    }));
    content.append(actions);
    const picker=make('select');picker.id='ta-subject';
    for(const [value,label] of [['all','통신공학 + 무선공학'],['comm','통신공학'],['wireless','무선공학']]){const op=make('option','',label);op.value=value;picker.append(op)}
    picker.addEventListener('change',()=>renderInsights());content.append(picker);
    const board=make('section');board.id='ta-insights';board.append(make('p','ta-muted','학습 통계를 불러오는 중입니다.'));content.append(board);
    const controls=make('div','ta-actions');
    controls.append(wrapButton('서버 학습 기록 삭제',async()=>{
      if(!confirm('서버에 저장된 내 채점 기록을 모두 삭제할까요? 기존 브라우저 기록은 그대로 남습니다.'))return;
      try{const {data,error}=await client.rpc('telecom_delete_my_attempts');if(error)throw error;status('서버 기록 '+Number(data||0)+'건을 삭제했습니다.');loadInsights()}
      catch(err){status('삭제 실패: '+(err?.message||'서버 확인 필요'))}
    },'ta-danger'));
    content.append(controls);
    content.append(make('p','ta-muted','기록 저장 동의를 해제해도 기존 기록은 삭제되지 않습니다. 아래 삭제 버튼으로 서버의 내 기록을 삭제할 수 있습니다.'));
    content.append(make('p','ta-muted','※ 공동 오답률은 사용자당 해당 문제의 최초 채점 결과 1건만 반영합니다. 전체 표본은 단원별 서로 다른 로그인 사용자 20명 이상일 때 표시합니다. 채점 결과의 악의적 조작은 로그인만으로 완전히 방지할 수 없습니다.'));
    loadInsights();
  }
  function statCard(name,value) {
    const box=make('div','ta-stat');box.append(make('span','',name),make('strong','',value));return box;
  }
  function pctBar(rate,secondary=false) {
    const base=make('div',secondary?'ta-meter alt':'ta-meter');
    const fill=make('i');fill.style.width=Math.max(0,Math.min(100,Number(rate)||0))+'%';base.append(fill);return base;
  }
  let mine=[],cohort=[],globalStats={},insightsReady=false;
  async function loadInsights() {
    if(!member||!client)return;
    const target=content?.querySelector('#ta-insights');if(!target)return;
    target.replaceChildren(make('p','ta-muted','로그인 기록과 공동 통계를 조회 중입니다.'));
    try{
      const [own,others,all,comm,wireless]=await Promise.all([
        client.rpc('telecom_my_stats'),
        client.rpc('telecom_cohort_topics',{p_subject:null}),
        client.rpc('telecom_global_summary',{p_subject:null}),
        client.rpc('telecom_global_summary',{p_subject:'comm'}),
        client.rpc('telecom_global_summary',{p_subject:'wireless'})
      ]);
      for(const result of [own,others,all,comm,wireless])if(result.error)throw result.error;
      mine=Array.isArray(own.data)?own.data:[];cohort=Array.isArray(others.data)?others.data:[];
      globalStats={all:all.data,comm:comm.data,wireless:wireless.data};
      insightsReady=true;renderInsights();
    }catch(err){target.replaceChildren(make('p','ta-warn','통계 조회에 실패했습니다. Supabase SQL 설치·접근권한·네트워크를 확인하세요: '+(err?.message||'')))}
  }
  function renderInsights() {
    const target=content?.querySelector('#ta-insights');if(!target||!member)return;
    target.replaceChildren();
    if(!insightsReady)return;
    const selected=content.querySelector('#ta-subject')?.value||'all';
    const filtered=mine.filter(x=>selected==='all'||x.subject===selected);
    const everyone=cohort.filter(x=>selected==='all'||x.subject===selected);
    const attempts=filtered.reduce((n,x)=>n+Number(x.attempts||0),0);
    const correct=filtered.reduce((n,x)=>n+Number(x.correct||0),0);
    const summary=make('div','ta-summary');
    summary.append(statCard('서버 누적 풀이',attempts+'건'),statCard('나의 정답률',attempts?fmt(100*correct/attempts):'—'),statCard('나의 오답',attempts-correct+'건'));
    const publicSummary=globalStats[selected];
    summary.append(statCard('전체 회원 평균',publicSummary?.rate===null||publicSummary?.rate===undefined?'표본 대기':fmt(publicSummary.rate)));
    target.append(summary);
    if(!filtered.length){target.append(make('p','ta-muted','이 계정으로 누적된 풀이가 없습니다. 서버 저장 동의를 켜고 통신공학 또는 무선공학 문제를 풀어 주세요.'));return}
    target.append(make('h3','','난이도별 나의 취약점'));
    for(const level of ['하','중','상','미분류']){
      const group=filtered.filter(x=>x.difficulty===level);
      const count=group.reduce((n,x)=>n+Number(x.attempts||0),0);
      if(!count)continue;
      const right=group.reduce((n,x)=>n+Number(x.correct||0),0);
      const pct=100*right/count;
      const row=make('div','ta-row');
      row.append(make('strong','',(level==='미분류'?'난이도 미분류':level+' 난이도')+' · 정답률 '+fmt(pct)));
      row.append(make('div','ta-detail','풀이 '+count+'건 · 오답 '+(count-right)+'건'));
      row.append(pctBar(pct));
      target.append(row);
    }
    const map=new Map();
    filtered.forEach(x=>{const key=x.subject+':'+x.chapter;const before=map.get(key)||{subject:x.subject,chapter:x.chapter,attempts:0,correct:0,levels:{}};before.attempts+=Number(x.attempts||0);before.correct+=Number(x.correct||0);const lv=x.difficulty||'미분류';before.levels[lv]=(before.levels[lv]||0)+Number(x.attempts||0);map.set(key,before)});
    const sorted=[...map.values()].sort((a,b)=>(a.correct/a.attempts)-(b.correct/b.attempts));
    target.append(make('h3','','내 취약 단원 · 정답률이 낮은 순'));
    for(const x of sorted){
      const other=everyone.find(o=>o.subject===x.subject&&o.chapter===x.chapter);
      const pct=100*x.correct/x.attempts;
      const row=make('div','ta-row');
      row.append(make('strong','',(x.subject==='comm'?'통신':'무선')+' · '+x.chapter+' — 내 정답률 '+fmt(pct)));
      row.append(make('div','ta-detail','내 풀이 '+x.attempts+'건 / 오답 '+(x.attempts-x.correct)+'건 · '+Object.entries(x.levels).map(([l,n])=>l+' '+n+'건').join(' · ')));
      row.append(pctBar(pct));
      if(other){row.append(make('div','ta-detail','전체 최초 응답 '+other.responses+'건 · 서로 다른 학습자 '+other.participants+'명 · 전체 정답률 '+fmt(other.rate)));row.append(pctBar(other.rate,true))}
      else row.append(make('div','ta-detail','전체 수험생 비교: 단원별 표본 20명 미만이거나 아직 누적되지 않았습니다.'));
      target.append(row);
    }
    target.append(make('p','ta-muted','가장 위의 단원부터 오답 복습을 권장합니다. 전체 통계는 반복 풀이를 제외하며, 내 통계는 복습을 포함한 모든 채점 횟수를 사용합니다.'));
  }
  function queueKey(){return storagePrefix+member.id}
  async function flush() {
    if(busy||!client||!member||!navigator.onLine)return;
    busy=true;
    const id=member.id,key=queueKey();
    try {
      let items=safeRead(key,[]);
      if(!Array.isArray(items))items=[];
      while(member?.id===id&&items.length){
        const item=items[0],{error}=await client.rpc('telecom_record_attempt',item);
        if(error){console.warn('Study sync:',error.message);break}
        items.shift();safeWrite(key,items);
      }
    } finally {busy=false}
  }
  function record(subject,question,correct,key) {
    if(!configured||!member||!client||!hasConsent()||!question||!key)return;
    const payload={
      p_event_id:crypto.randomUUID(),p_subject:subject,p_key:key,
      p_question_id:String(question.id||'').slice(0,100),
      p_chapter:String(question.chapter||question.unit||'미분류').slice(0,120),
      p_topic:String(question.topic||question.chapter||'미분류').slice(0,120),
      p_difficulty:['상','중','하'].includes(question.difficulty)?question.difficulty:'미분류',
      p_correct:correct===true
    };
    const keyName=queueKey(),list=safeRead(keyName,[]);
    if(!Array.isArray(list))return;
    if(list.length>=5000){console.warn('Study queue full; answer not uploaded');return}
    list.push(payload);
    if(safeWrite(keyName,list))flush();
  }
  async function renderQuestion(subject,question,key) {
    lastQuestion={subject,question,key};
    const counter=++questionNonce;
    const qNode=document.getElementById('qQuestion');
    if(!qNode)return;
    let panel=document.getElementById('ta-question');
    if(!panel){panel=make('div','ta-question');panel.id='ta-question';(document.getElementById('crowd-stats-panel')||qNode).after(panel)}
    panel.replaceChildren();
    if(!configured){panel.textContent='계정별 문항 오답률 · 로그인 서버 연결 전';return}
    if(!member){panel.append(make('span','','로그인하면 문항별 전체 오답률과 개인 취약 단원을 볼 수 있습니다. '),wrapButton('로그인',show));return}
    panel.textContent='로그인 회원의 문항 정답률을 불러오는 중입니다.';
    try{
      const c=await getClient();const {data,error}=await c.rpc('telecom_question_stats',{p_subject:subject,p_key:key});
      if(error)throw error;
      if(counter!==questionNonce||!panel.isConnected)return;
      const n=Number(data?.responses||0);
      if(n<MIN)panel.textContent='회원 최초 응답 '+n+'건 · 난이도 산정 대기 ('+(MIN-n)+'건 더 필요)';
      else panel.textContent='회원 최초 응답 '+n+'건 · 정답률 '+fmt(data.rate)+' · 오답률 '+fmt(100-Number(data.rate))+' · 실측 난이도 '+data.difficulty;
    }catch(err){if(counter===questionNonce)panel.textContent='회원 통계 조회 불가 · 네트워크 또는 DB 설정을 확인하세요.'}
  }
  async function getClient() {
    if(client)return client;
    if(!configured)throw new Error('로그인 서버가 설정되지 않았습니다.');
    if(clientPromise)return clientPromise;
    clientPromise=new Promise((resolve,reject)=>{
      if(window.supabase?.createClient){resolve(window.supabase);return}
      const script=document.createElement('script');
      script.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
      script.crossOrigin='anonymous';
      script.onload=()=>window.supabase?.createClient?resolve(window.supabase):reject(new Error('인증 모듈을 불러오지 못했습니다.'));
      script.onerror=()=>reject(new Error('인증 모듈 CDN 접속에 실패했습니다.'));
      document.head.append(script);
    }).then(api=>{
      client=api.createClient(cfg.url.replace(/\/+$/,''),cfg.publishableKey,{
        auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,storageKey:'telecom-study-auth-v1'}
      });
      client.auth.onAuthStateChange((_event,session)=>{
        const next=session?.user||null;
        if(next?.id===member?.id)return;
        member=next;updateButton();
        if(dialog&&!dialog.hidden)draw();
        if(member)queueMicrotask(flush);
      });
      return client;
    }).catch(err=>{clientPromise=null;throw err});
    return clientPromise;
  }
  async function init() {
    if(!configured)return;
    try{
      const c=await getClient();const {data,error}=await c.auth.getSession();
      if(error)throw error;member=data?.session?.user||null;
      updateButton();if(member)flush();
    }catch(err){console.warn('Account initialization:',err?.message||err)}
  }
  function mount() {
    const nav=document.querySelector('.site-top .topnav')||document.querySelector('header .nav')||document.querySelector('.site-top')||document.querySelector('header');
    if(nav){navButton=wrapButton('♙ 로그인',show,'ta-launch');navButton.setAttribute('aria-label','회원 로그인 및 학습 통계');nav.append(navButton)}
    dialog=make('div','ta-overlay');dialog.hidden=true;
    const card=make('section','ta-dialog');card.setAttribute('role','dialog');card.setAttribute('aria-modal','true');card.setAttribute('aria-label','회원 로그인 및 학습 분석');
    const heading=make('div','ta-head');heading.append(make('h2','','학습 계정 · 누적 통계'));
    heading.append(wrapButton('×',hide,'ta-close'));card.append(heading);
    feedback=make('div','ta-status');feedback.setAttribute('role','status');feedback.setAttribute('aria-live','polite');
    content=make('div');card.append(feedback,content);dialog.append(card);document.body.append(dialog);
    dialog.addEventListener('click',e=>{if(e.target===dialog)hide()});
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!dialog.hidden)hide()});
    window.addEventListener('online',flush);
    init();
  }
  window.TelecomAccount={record,renderQuestion,open:show,isConfigured:configured};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
