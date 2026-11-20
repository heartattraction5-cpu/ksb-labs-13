-- =====================================================================
--  KSB LABS Video Studio  –  Supabase setup  (ek hi baar run karna hai)
--  Supabase Dashboard > SQL Editor > New query > paste > RUN
-- =====================================================================

-- 1) Users ki profile table
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text not null,
  full_name    text,
  is_admin     boolean not null default false,
  status       text not null default 'active'  check (status in ('pending','active','blocked')),
  limit_mode   text not null default 'total'   check (limit_mode in ('total','daily')),
  limit_value  integer not null default 1      check (limit_value >= 0),
  used_total   integer not null default 0,
  used_today   integer not null default 0,
  used_date    date,
  can_refund   boolean not null default false,
  created_at   timestamptz not null default now(),
  last_active  timestamptz
);

alter table public.profiles enable row level security;
drop policy if exists "read own profile" on public.profiles;
create policy "read own profile" on public.profiles for select using (auth.uid() = id);
-- (insert/update/delete ki koi policy nahi: user apni limit khud nahi badal sakta)

-- 2) Naya user signup kare to profile khud ban jaye (sirf Gmail, foran ACTIVE, sirf 1 free video, approval nahi)
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare adm boolean := lower(new.email) = 'heartattraction5@gmail.com';
begin
  if lower(new.email) not like '%@gmail.com' then
    raise exception 'Only Gmail addresses are allowed';
  end if;
  insert into public.profiles (id, email, full_name, is_admin, status, limit_mode, limit_value)
  values (new.id, lower(new.email), coalesce(new.raw_user_meta_data->>'full_name',''), adm,
          'active',
          case when adm then 'daily'  else 'total'   end,
          case when adm then 9999     else 1         end);
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- 3) Admin check
create or replace function public.is_admin()
returns boolean language sql security definer stable set search_path = public as $$
  select coalesce((select p.is_admin from public.profiles p where p.id = auth.uid()), false)
$$;

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

-- 4) Video banane se pehle limit check (server faisla karta hai)
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

-- 5) Video fail/cancel ho jaye to ek baar wapas (refund)
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

-- 6) Admin functions
create or replace function public.admin_list_users()
returns setof public.profiles language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'not allowed'; end if;
  return query select * from public.profiles order by (status = 'pending') desc, created_at desc;
end $$;

create or replace function public.admin_update_user(p_id uuid, p_status text, p_mode text, p_limit integer)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'not allowed'; end if;
  if p_id = auth.uid() and p_status <> 'active' then raise exception 'You cannot block yourself'; end if;
  update public.profiles
     set status = p_status, limit_mode = p_mode, limit_value = greatest(p_limit, 0)
   where id = p_id;
end $$;

create or replace function public.admin_reset_used(p_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'not allowed'; end if;
  update public.profiles set used_total = 0, used_today = 0, can_refund = false where id = p_id;
end $$;

create or replace function public.admin_delete_user(p_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'not allowed'; end if;
  if p_id = auth.uid() then raise exception 'You cannot delete yourself'; end if;
  delete from auth.users where id = p_id;   -- profile bhi khud delete ho jati hai
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

-- 7) Permissions: sirf login kiye hue users in functions ko chala saken
revoke all on function public.consume_video(text, integer) from public, anon;
revoke all on function public.refund_video(bigint)         from public, anon;
revoke all on function public.log_video_done(bigint, integer)  from public, anon;
revoke all on function public.admin_user_videos(uuid)          from public, anon;
revoke all on function public.is_admin()       from public, anon;
revoke all on function public.admin_list_users()                          from public, anon;
revoke all on function public.admin_update_user(uuid, text, text, integer) from public, anon;
revoke all on function public.admin_reset_used(uuid)                      from public, anon;
revoke all on function public.admin_delete_user(uuid)                     from public, anon;
grant execute on function public.consume_video(text, integer) to authenticated;
grant execute on function public.refund_video(bigint)         to authenticated;
grant execute on function public.log_video_done(bigint, integer)  to authenticated;
grant execute on function public.admin_user_videos(uuid)          to authenticated;
grant execute on function public.is_admin()       to authenticated;
grant execute on function public.admin_list_users()                          to authenticated;
grant execute on function public.admin_update_user(uuid, text, text, integer) to authenticated;
grant execute on function public.admin_reset_used(uuid)                      to authenticated;
grant execute on function public.admin_delete_user(uuid)                     to authenticated;
