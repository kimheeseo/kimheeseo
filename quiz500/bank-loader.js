(function(root){'use strict';const base=new URL('.',document.currentScript.src),cache={};
async function json(file){return QuizJSON.load(new URL(file,base))}
async function load(subject){if(cache[subject])return cache[subject];let bank;if(subject==='comm'){bank=await json('communication-quiz-500/quiz_bank_1000.json');bank.qualityCounts=QuizQuality.prepareComm(bank)}else if(subject==='wireless'){const [a,b]=await Promise.all([json('wireless-quiz-500/wireless_bank_1000.json'),json('data/wireless-supplement.json')]);bank=[...a,...b]}else if(subject==='kwater'){bank=(await json('kwater-exams/generated-mocks-2-4.json')).rounds.flatMap(r=>r.questions)}else throw Error('알 수 없는 과목입니다.');if(subject==='comm'||subject==='wireless'){const extra=await json('korail-2026/generated-mock-2.json');bank.push(...extra.questions.filter(q=>q.subject===subject))}QuizSource.register(bank,subject);QuizTrust.register(bank,subject);return cache[subject]=bank}
root.QuizBank={load,json};
})(window);
