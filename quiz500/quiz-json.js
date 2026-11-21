/* Static JSON transport. Canonical JSON on HTTP; generated script mirrors on file://. */
(function(root){'use strict';const cached=new Map(),pending=new Map();
function key(file){const u=new URL(file,location.href);u.search='';u.hash='';return u.href}
function accept(file,data){const k=key(file);cached.set(k,data);pending.get(k)?.resolve(data);pending.delete(k)}
async function load(file){const k=key(file);if(cached.has(k))return structuredClone(cached.get(k));if(location.protocol!=='file:'){const r=await fetch(k,{cache:'no-cache'});if(!r.ok)throw Error('자료 요청 실패: '+new URL(k).pathname);const data=await r.json();cached.set(k,data);return structuredClone(data)}if(!pending.has(k)){let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b});pending.set(k,{promise,resolve,reject});const script=document.createElement('script');script.src=k+'.js';script.onload=()=>{if(!cached.has(k)){pending.delete(k);reject(Error('오프라인 자료를 확인할 수 없습니다.'))}script.remove()};script.onerror=()=>{pending.delete(k);script.remove();reject(Error('오프라인 자료가 없습니다. GitHub Pages 또는 HTTP 미리보기에서 여세요.'))};document.head.append(script)}return structuredClone(await pending.get(k).promise)}
root.QuizJSON={load,accept};
})(window);
