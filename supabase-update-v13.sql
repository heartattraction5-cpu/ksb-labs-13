-- =====================================================================
--  KSB LABS Video Studio v13 – UPDATE (sirf ek baar run karna hai)
--  Supabase > SQL Editor > New query > paste > RUN
--
--  Kya badalta hai:
--   * Naya signup ab APPROVAL NAHI mangta: seedha active.
--   * Har naye signup ko sirf 1 (ek) free video milti hai (limit = 1, total).
--   * Uske baad plan lene par admin limit badhata hai (Admin tab > +30 / +90 / +150).
--  Purane users ki limit / usage waise hi rahegi.
-- =====================================================================

alter table public.profiles alter column status      set default 'active';
alter table public.profiles alter column limit_value set default 1;

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
          case when adm then 'daily' else 'total' end,
          case when adm then 9999    else 1       end);
  return new;
end $$;

-- Jo log pehle se "pending" (approval ke intezar mein) hain unhe bhi 1 free video ke sath active kar do
update public.profiles
   set status = 'active', limit_value = 1
 where status = 'pending' and not is_admin;
