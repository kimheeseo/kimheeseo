/* Load the user's existing tools only while their dedicated screen is open. */
(()=>{
  'use strict';
  const section=document.getElementById('datacenter');if(!section)return;
  let frame=document.getElementById('dcToolFrame');
  const link=document.getElementById('dcToolOpen');
  const status=document.getElementById('dcToolStatus'),description=document.getElementById('dcToolDescription');
  const buttons=[...section.querySelectorAll('[data-dc-tool]')];
  const tools={
    tour:{name:'데이터센터 3D 투어',url:'https://kimheeseo.github.io/LSCNS/DCI/DataCenter/LS_Datacenter_3D.html?engine=three',
      description:'캠퍼스·전산실·전기실·MMR을 둘러보고 랙 구성, 전력·냉각·광배선과 장애 시나리오를 확인하세요.'},
    bom:{name:'데이터센터 BOM 설계',url:'https://kimheeseo.github.io/LSCNS/DCI/DataCenter/',
      description:'GPU·서버·랙 요구조건을 입력하고 전력·냉각·광배선 수량과 BOM 계산 근거를 확인하세요.'}
  };
  let selected='tour',active=false;
  function replaceFrame(source){
    // A fresh browsing context avoids adding tool switches/about:blank to the
    // parent's Back history and stops the previous renderer immediately.
    const previous=frame;frame=previous.cloneNode(false);frame.removeAttribute('src');
    if(source){frame.setAttribute('aria-busy','true');frame.src=source;}
    else frame.removeAttribute('aria-busy');
    frame.addEventListener('load',event=>{
      if(event.currentTarget!==frame||!active||!frame.getAttribute('src'))return;
      if(frame.contentDocument?.URL==='about:blank')return;
      frame.setAttribute('aria-busy','false');status.textContent='';
    });
    previous.replaceWith(frame);
  }
  function select(key){
    if(!tools[key])return;
    selected=key;const tool=tools[key];
    for(const button of buttons){
      const current=button.dataset.dcTool===selected;
      button.setAttribute('aria-selected',String(current));button.tabIndex=current?0:-1;
    }
    const button=buttons.find(b=>b.dataset.dcTool===selected);
    document.getElementById('dcToolPanel').setAttribute('aria-labelledby',button.id);
    description.textContent=tool.description;frame.title=tool.name;link.href=tool.url;
    link.textContent=tool.name+' 새 탭에서 크게 보기';
    if(active&&frame.getAttribute('src')!==tool.url){
      status.textContent=tool.name+'를 불러오는 중입니다…';replaceFrame(tool.url);
    }
  }
  function activate(page){
    active=page==='datacenter';
    if(active)select(selected);
    else if(frame.hasAttribute('src')){
      // Hidden WebGL/animation frames must not keep running during quiz study.
      replaceFrame(null);status.textContent='데이터센터 도구를 선택해 살펴보세요.';
    }
  }
  for(const button of buttons){
    button.addEventListener('click',()=>select(button.dataset.dcTool));
    button.addEventListener('keydown',event=>{
      const index=buttons.indexOf(button);let next;
      if(event.key==='ArrowRight')next=(index+1)%buttons.length;
      else if(event.key==='ArrowLeft')next=(index-1+buttons.length)%buttons.length;
      else if(event.key==='Home')next=0;
      else if(event.key==='End')next=buttons.length-1;
      else return;
      event.preventDefault();select(buttons[next].dataset.dcTool);buttons[next].focus();
    });
  }
  window.addEventListener('quiz-screen-changed',event=>activate(event.detail.page));
  select(selected);
})();
