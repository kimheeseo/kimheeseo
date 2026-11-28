/* Home presentation only: navigation never changes study data. */
(()=>{'use strict';
const menu=document.getElementById('more-menu'),toggles=[...document.querySelectorAll('.more-toggle')];let opener;
function close(){menu.hidden=true;toggles.forEach(b=>b.setAttribute('aria-expanded','false'));}
toggles.forEach(b=>b.addEventListener('click',()=>{const open=menu.hidden;close();menu.hidden=!open;if(open){opener=b;b.setAttribute('aria-expanded','true');menu.querySelector('a').focus();}}));
document.getElementById('close-more').addEventListener('click',()=>{close();opener?.focus();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!menu.hidden){close();opener?.focus();}});
document.addEventListener('click',e=>{if(!menu.contains(e.target)&&!e.target.closest('.more-toggle'))close();});
menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',close));
const links=[...document.querySelectorAll('[data-section]')];
function select(id){links.forEach(a=>{if(a.dataset.section===id)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});toggles.forEach(b=>b.classList.toggle('active',['practice','tools','recent-updates'].includes(id)));}
const sections=[...document.querySelectorAll('main>section[id]')];let scheduled=false;
function spy(){scheduled=false;const line=window.innerWidth<=700?90:115;const past=sections.filter(s=>s.getBoundingClientRect().top<=line);select((past.at(-1)||sections[0]).id);}
window.addEventListener('scroll',()=>{if(!scheduled){scheduled=true;requestAnimationFrame(spy);}},{passive:true});window.addEventListener('resize',spy);
const aliases={home:'today',bank:'written',organizations:'organizations',practice:'practice',datacenter:'tools',updates:'recent-updates'};
function legacy(){const id=aliases[location.hash.replace('#screen=','')]||(location.hash==='#datacenter'?'tools':null);if(id){history.replaceState(null,'','#'+id);document.getElementById(id)?.scrollIntoView();}spy();}
window.addEventListener('hashchange',legacy);legacy();
})();
