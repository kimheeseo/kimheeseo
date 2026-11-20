-- Supabase SQL Editor: run once in a dedicated project.
-- Email/Auth managed by Supabase Auth. There is no service-role secret in GitHub Pages.
create table if not exists public.telecom_attempts (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  subject text not null check (subject in ('comm','wireless')),
  question_key text not null check (question_key ~ '^[a-f0-9]{8}-[a-f0-9]{8}$'),
  question_id text not null check (char_length(question_id) between 1 and 100),
  chapter text not null check (char_length(chapter) between 1 and 120),
  topic text not null check (char_length(topic) between 1 and 120),
  difficulty text not null check (difficulty in ('상','중','하','미분류')),
  correct boolean not null,
  attempted_at timestamptz not null default now()
);
create index if not exists telecom_attempts_member_time on public.telecom_attempts(user_id, attempted_at desc);
create index if not exists telecom_attempts_question on public.telecom_attempts(subject, question_key, user_id, attempted_at, id);
create index if not exists telecom_attempts_chapter on public.telecom_attempts(subject, chapter);
alter table public.telecom_attempts enable row level security;
-- All access uses vetted RPCs rather than direct table APIs.
revoke all on table public.telecom_attempts from public, anon, authenticated;

create or replace function public.telecom_record_attempt(
  p_subject text, p_key text, p_question_id text, p_chapter text,
  p_topic text, p_difficulty text, p_correct boolean
) returns bigint language plpgsql security definer set search_path = ''
as $$
declare v_user uuid; v_id bigint;
begin
  v_user := (select auth.uid());
  if v_user is null then raise exception 'login_required' using errcode='42501'; end if;
  if p_subject is null or p_subject not in ('comm','wireless')
     or p_key is null or p_key !~ '^[a-f0-9]{8}-[a-f0-9]{8}$'
     or p_question_id is null or char_length(p_question_id) not between 1 and 100
     or p_chapter is null or char_length(p_chapter) not between 1 and 120
     or p_topic is null or char_length(p_topic) not between 1 and 120
     or p_difficulty is null or p_difficulty not in ('상','중','하','미분류')
     or p_correct is null
  then raise exception 'invalid_attempt' using errcode='22023'; end if;
  insert into public.telecom_attempts
    (user_id,subject,question_key,question_id,chapter,topic,difficulty,correct)
  values (v_user,p_subject,p_key,p_question_id,p_chapter,p_topic,p_difficulty,p_correct)
  returning id into v_id;
  return v_id;
end $$;

create or replace function public.telecom_question_stats(p_subject text,p_key text)
returns jsonb language sql stable security definer set search_path = ''
as $$
with firsts as (
  select distinct on (user_id) user_id, correct
  from public.telecom_attempts
  where subject=p_subject and question_key=p_key
  order by user_id, attempted_at, id
), totals as (
  select count(*)::int as n, count(*) filter(where correct)::int as yes from firsts
)
select jsonb_build_object(
 'responses',n,
 'correct',case when n>=20 then yes else null end,
 'rate',case when n>=20 then round(100.0*yes/nullif(n,0))::int else null end,
 'difficulty',case when n<20 then null when yes*100.0/n>=80 then '하' when yes*100.0/n>=50 then '중' else '상' end,
 'minimumSample',20
) from totals
$$;

create or replace function public.telecom_cohort_topics(p_subject text default null)
returns table(subject text,chapter text,participants bigint,responses bigint,correct bigint,rate numeric)
language sql stable security definer set search_path = ''
as $$
with firsts as (
  select distinct on (user_id, subject, question_key)
    user_id,subject,chapter,correct
  from public.telecom_attempts
  where (p_subject is null or subject=p_subject)
  order by user_id,subject,question_key,attempted_at,id
)
select f.subject,f.chapter,count(distinct f.user_id)::bigint,
  count(*)::bigint,count(*) filter(where f.correct)::bigint,
  round(100.0 * count(*) filter(where f.correct)/nullif(count(*),0),1)
from firsts f
group by f.subject,f.chapter
having count(distinct f.user_id)>=20
order by f.subject,f.chapter
$$;

create or replace function public.telecom_my_stats()
returns table(subject text,chapter text,difficulty text,attempts bigint,correct bigint,rate numeric)
language sql stable security invoker set search_path = ''
as $$
select subject,chapter,difficulty,count(*)::bigint,
  count(*) filter(where correct)::bigint,
  round(100.0*count(*) filter(where correct)/nullif(count(*),0),1)
from public.telecom_attempts
where user_id=(select auth.uid())
group by subject,chapter,difficulty
order by subject,chapter,difficulty
$$;
-- Note: my_stats uses SECURITY INVOKER, so permit SELECT with an owner-only RLS policy.
create policy telecom_owner_read on public.telecom_attempts for select
  to authenticated using ((select auth.uid())=user_id);
grant select on public.telecom_attempts to authenticated;

create or replace function public.telecom_delete_my_attempts()
returns bigint language plpgsql security definer set search_path = ''
as $$
declare n bigint; v_user uuid;
begin
  v_user := (select auth.uid());
  if v_user is null then raise exception 'login_required' using errcode='42501'; end if;
  delete from public.telecom_attempts where user_id=v_user;
  get diagnostics n = row_count;
  return n;
end $$;

-- SECURITY DEFINER aggregate functions are intentionally exposed to signed-in users ONLY.
revoke execute on function public.telecom_record_attempt(text,text,text,text,text,text,boolean) from public,anon;
revoke execute on function public.telecom_question_stats(text,text) from public,anon;
revoke execute on function public.telecom_cohort_topics(text) from public,anon;
revoke execute on function public.telecom_my_stats() from public,anon;
revoke execute on function public.telecom_delete_my_attempts() from public,anon;
grant execute on function public.telecom_record_attempt(text,text,text,text,text,text,boolean) to authenticated;
grant execute on function public.telecom_question_stats(text,text) to authenticated;
grant execute on function public.telecom_cohort_topics(text) to authenticated;
grant execute on function public.telecom_my_stats() to authenticated;
grant execute on function public.telecom_delete_my_attempts() to authenticated;
