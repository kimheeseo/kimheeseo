(function(root){'use strict';
function shuffle(a,rng=Math.random){a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function create(bank,{subject,count,minutes,now=Date.now(),rng=Math.random,trust}){
 if(!Number.isInteger(count)||count<1||count>200||!Number.isFinite(minutes)||minutes<1||minutes>240)throw Error('문항 수는 1~200개, 시간은 1~240분으로 입력하세요.');
 const eligible=bank.filter(q=>trust.validateMath(q)&&trust.status(q,subject)==='verified'&&trust.gradeable(q,subject));
 if(eligible.length<count)throw Error(`검증 완료 문항은 ${eligible.length}개입니다. ${count}문항 출제에는 문항별 검증 승인이 더 필요합니다.`);
 const ids=shuffle(eligible,rng).slice(0,count).map(q=>q.id);return {id:'mock-'+now+'-'+Math.floor(rng()*1e9),subject,ids,answers:{},durations:{},index:0,startedAt:now,deadline:now+minutes*60000,minutes,openedAt:now,finishedAt:null,target:null};
}
function remaining(s,now=Date.now()){return Math.max(0,Math.ceil((s.deadline-now)/1000))}
function result(session,bank,trust){const lookup=new Map(bank.map(q=>[q.id,q])),rows=session.ids.map(id=>{const q=lookup.get(id);if(q)trust.validateMath(q);const graded=!!q&&trust.status(q,session.subject)==='verified'&&trust.gradeable(q,session.subject);return {id,q,selected:session.answers[id]??null,graded,correct:graded&&session.answers[id]===q.answer}}),graded=rows.filter(r=>r.graded),correct=graded.filter(r=>r.correct).length,units={};for(const r of graded){const k=r.q.chapter||'미분류',u=units[k]||(units[k]={chapter:k,total:0,correct:0});u.total++;if(r.correct)u.correct++}return {rows,correct,gradedCount:graded.length,pending:rows.length-graded.length,score:graded.length?Math.round(correct/graded.length*10000)/100:null,units:Object.values(units)};}
root.MockEngine={create,remaining,result,shuffle};
})(window);
