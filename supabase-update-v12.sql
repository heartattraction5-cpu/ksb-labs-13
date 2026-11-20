-- =====================================================================
--  KSB LABS Video Studio v12 – UPDATE (sirf ek baar run karna hai)
--  Supabase > SQL Editor > New query > paste > RUN
--  Purana data / users / limits sab waise hi rahenge.
-- =====================================================================

-- 3b) Video log: har video ka title, questions, status (SIRF admin dekh sakta hai)
create table if not exists public.video_log (
  id           bigint generated always as identity primary key,
  user_id      uuid not null references public.profiles(id) on delete cascade,
  title        text not null default '',
  q_count      integer not null default 0,
  status       text not null default 'started' check (status in ('started','done','failed')),
  duration_sec integer,
  created_at   timestamptz not null default now(),
  finished_at  timestamptz
);
create index if not exists video_log_user_idx on public.video_log (user_id, created_at desc);
alter table public.video_log enable row level security;
revoke all on public.video_log from anon, authenticated;
-- (koi policy nahi: user is table ko na padh sakta hai na badal sakta hai)

drop function if exists public.consume_video();
create or replace function public.consume_video(p_title text default '', p_qcount integer default 0)
returns json language plpgsql security definer set search_path = public as $$
declare
  p public.profiles;
  lid bigint;
  today date := (now() at time zone 'Asia/Karachi')::date;
begin
  select * into p from public.profiles where id = auth.uid() for update;
  if not found then return json_build_object('ok', false, 'reason', 'no_profile'); end if;
  if p.status = 'pending' then return json_build_object('ok', false, 'reason', 'pending'); end if;
  if p.status = 'blocked' then return json_build_object('ok', false, 'reason', 'blocked'); end if;

  if p.used_date is distinct from today then p.used_today := 0; end if;

  if not p.is_admin then
    if p.limit_mode = 'total' and p.used_total >= p.limit_value then
      return json_build_object('ok', false, 'reason', 'limit_total', 'limit', p.limit_value);
    end if;
    if p.limit_mode = 'daily' and p.used_today >= p.limit_value then
      return json_build_object('ok', false, 'reason', 'limit_daily', 'limit', p.limit_value);
    end if;
  end if;

  update public.profiles
     set used_total = used_total + 1, used_today = p.used_today + 1, used_date = today,
         can_refund = true, last_active = now()
   where id = p.id;
  insert into public.video_log (user_id, title, q_count)
  values (p.id, left(coalesce(trim(p_title), ''), 200), greatest(coalesce(p_qcount, 0), 0))
  returning id into lid;
  return json_build_object('ok', true, 'log_id', lid);
end $$;

drop function if exists public.refund_video();
create or replace function public.refund_video(p_log_id bigint default null)
returns void language plpgsql security definer set search_path = public as $$
declare today date := (now() at time zone 'Asia/Karachi')::date;
begin
  update public.profiles
     set used_total = greatest(used_total - 1, 0),
         used_today = case when used_date = today then greatest(used_today - 1, 0) else used_today end,
         can_refund = false
   where id = auth.uid() and can_refund and status = 'active';
  if p_log_id is not null then
    update public.video_log set status = 'failed', finished_at = now()
     where id = p_log_id and user_id = auth.uid() and status = 'started';
  end if;
end $$;

-- 6b) Video mukammal hone par log (user sirf apni hi video ka)
create or replace function public.log_video_done(p_log_id bigint, p_secs integer)
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.video_log
     set status = 'done', duration_sec = greatest(coalesce(p_secs, 0), 0), finished_at = now()
   where id = p_log_id and user_id = auth.uid() and status = 'started';
  update public.profiles set can_refund = false where id = auth.uid();
end $$;

-- 6c) Admin: kisi user ki saari videos (statement PDF ke liye)
create or replace function public.admin_user_videos(p_id uuid)
returns setof public.video_log language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'not allowed'; end if;
  return query select * from public.video_log where user_id = p_id order by created_at asc;
end $$;

-- Permissions
revoke all on function public.consume_video(text, integer) from public, anon;
revoke all on function public.refund_video(bigint)         from public, anon;
revoke all on function public.log_video_done(bigint, integer)  from public, anon;
revoke all on function public.admin_user_videos(uuid)          from public, anon;
grant execute on function public.consume_video(text, integer) to authenticated;
grant execute on function public.refund_video(bigint)         to authenticated;
grant execute on function public.log_video_done(bigint, integer)  to authenticated;
grant execute on function public.admin_user_videos(uuid)          to authenticated;
