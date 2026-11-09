-- FIRST create the account in Supabase > Authentication > Users.
-- Replace this example email with the administrator's real account email.
-- Run manually in the SQL Editor (never from the browser application).
insert into public.members(user_id,email,role,enabled)
select id,lower(email),'admin',true from auth.users where lower(email) = 'REEMPLAZAR@ejemplo.cl'
on conflict(user_id) do update set email = excluded.email, role = 'admin', enabled = true;
-- Verify that ONE row was inserted/updated. If zero, check the email.
