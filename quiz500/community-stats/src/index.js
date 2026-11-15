/* Cloudflare Worker + D1
  Sends only first-answer correctness + random per-browser ID; no PII fields.
  Stats cannot be forged-proof without accounts/Turnstile. */
const ALLOWED_ORIGIN='https://kimheeseo.github.io';
function reply(data,status=200,origin=''){
  const headers={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
  if(origin===ALLOWED_ORIGIN){headers['Access-Control-Allow-Origin']=origin;headers['Vary']='Origin';headers['Access-Control-Allow-Methods']='GET,POST,OPTIONS';headers['Access-Control-Allow-Headers']='Content-Type'}
  return new Response(JSON.stringify(data),{status,headers});
}
function subjectOK(s){return s==='comm'||s==='wireless'}
function keyOK(k){return typeof k==='string'&&/^[a-f0-9]{8}-[a-f0-9]{8}$/i.test(k)}
function visitorOK(v){return typeof v==='string'&&/^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i.test(v)}
function shaped(row){const responses=Number(row?.responses)||0,correct=Number(row?.correct)||0,rate=responses?Math.round(correct*100/responses):null;return {responses,correct,rate,difficulty:responses<20?null:rate>=80?'하':rate>=50?'중':'상',minimumSample:20}}
export default {
  async fetch(request,env){
    const url=new URL(request.url),origin=request.headers.get('Origin')||'';
    if(origin&&origin!==ALLOWED_ORIGIN)return reply({error:'origin_not_allowed'},403);
    if(request.method==='OPTIONS')return origin===ALLOWED_ORIGIN?new Response(null,{status:204,headers:{'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Methods':'GET,POST,OPTIONS','Access-Control-Allow-Headers':'Content-Type','Access-Control-Max-Age':'86400','Vary':'Origin'}}):reply({error:'origin_not_allowed'},403);
    if(!env.DB)return reply({error:'database_not_configured'},503,origin);
    try{
      if(url.pathname==='/v1/health'&&request.method==='GET')return reply({ok:true,service:'telecom-crowd-stats'},200,origin);
      if(url.pathname==='/v1/stats'&&request.method==='GET'){
        const subject=url.searchParams.get('subject'),key=url.searchParams.get('key');
        if(!subjectOK(subject)||!keyOK(key))return reply({error:'invalid_question'},400,origin);
        const row=await env.DB.prepare('SELECT responses, correct FROM question_totals WHERE subject=? AND question_key=?').bind(subject,key).first();
        return reply(shaped(row),200,origin);
      }
      if(url.pathname==='/v1/summary'&&request.method==='GET'){
        const subject=url.searchParams.get('subject');
        if(!subjectOK(subject))return reply({error:'invalid_subject'},400,origin);
        const row=await env.DB.prepare('SELECT COUNT(*) AS question_count, COALESCE(SUM(responses),0) AS responses, COALESCE(SUM(correct),0) AS correct FROM question_totals WHERE subject=?').bind(subject).first();
        return reply({subject,questions:Number(row?.question_count)||0,...shaped(row)},200,origin);
      }
      if(url.pathname==='/v1/attempt'&&request.method==='POST'){
        if(origin!==ALLOWED_ORIGIN)return reply({error:'origin_required'},403,origin);
        if(!String(request.headers.get('Content-Type')||'').includes('application/json'))return reply({error:'invalid_type'},415,origin);
        if(Number(request.headers.get('Content-Length')||0)>1024)return reply({error:'payload_too_large'},413,origin);
        const raw=await request.text();
        if(raw.length>1024)return reply({error:'payload_too_large'},413,origin);
        let body;try{body=JSON.parse(raw)}catch{return reply({error:'invalid_json'},400,origin)}
        if(!subjectOK(body?.subject)||!keyOK(body?.key)||!visitorOK(body?.visitor)||typeof body?.correct!=='boolean')return reply({error:'invalid_attempt'},400,origin);
        await env.DB.prepare('INSERT OR IGNORE INTO first_responses(subject,question_key,visitor,correct) VALUES (?,?,?,?)').bind(body.subject,body.key,body.visitor,body.correct?1:0).run();
        const row=await env.DB.prepare('SELECT responses,correct FROM question_totals WHERE subject=? AND question_key=?').bind(body.subject,body.key).first();
        return reply({ok:true,...shaped(row)},200,origin);
      }
      return reply({error:'not_found'},404,origin);
    }catch{
      return reply({error:'database_unavailable'},503,origin);
    }
  }
};
