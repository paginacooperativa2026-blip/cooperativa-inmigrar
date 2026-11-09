-- Run once in Supabase SQL Editor, or with `supabase db push`.
begin;

create table public.members (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique check (email = lower(email)),
  role text not null default 'member' check (role in ('admin','member')),
  enabled boolean not null default true
);

create function public.is_admin() returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.members where user_id = (select auth.uid()) and enabled and role = 'admin');
$$;
create function public.is_member() returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.members where user_id = (select auth.uid()) and enabled);
$$;
revoke all on function public.is_admin(), public.is_member() from public;
grant execute on function public.is_admin(), public.is_member() to anon, authenticated;

alter table public.members enable row level security;
create policy members_read on public.members for select to authenticated
  using (user_id = (select auth.uid()) or public.is_admin());
revoke all on public.members from anon, authenticated;
grant select on public.members to authenticated;

create table public.entries (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.members(user_id),
  name text not null check (length(btrim(name)) between 1 and 150),
  person text not null check (length(btrim(person)) between 1 and 150),
  category text not null check (length(btrim(category)) between 1 and 150),
  description text not null check (length(btrim(description)) between 1 and 10000),
  image text check (image is null or image ~ '^[a-f0-9-]{36}/[a-f0-9-]{36}\.(png|jpg|webp)$'),
  price text check (length(price) <= 150),
  whatsapp text check (whatsapp is null or whatsapp ~ '^[0-9]{8,15}$'),
  status text not null default 'draft' check (status in ('draft','published')),
  updated timestamptz not null default now()
);
create index entries_owner on public.entries(owner_id);
create index entries_published on public.entries(status, updated desc);
alter table public.entries enable row level security;

create policy entries_read on public.entries for select to anon, authenticated
  using (status = 'published' or (public.is_member() and (owner_id = (select auth.uid()) or public.is_admin())));
create policy entries_create on public.entries for insert to authenticated
  with check (public.is_member() and (owner_id = (select auth.uid()) or public.is_admin()));
create policy entries_update on public.entries for update to authenticated
  using (public.is_member() and (owner_id = (select auth.uid()) or public.is_admin()))
  with check (public.is_member() and (owner_id = (select auth.uid()) or public.is_admin()));
create policy entries_delete on public.entries for delete to authenticated
  using (public.is_member() and (owner_id = (select auth.uid()) or public.is_admin()));

revoke all on public.entries from anon, authenticated;
grant select(id,name,person,category,description,image,price,whatsapp,status,updated) on public.entries to anon;
grant select, insert, update, delete on public.entries to authenticated;
create view public.catalog with (security_invoker = true) as
  select id,name,person,category,description,image,price,whatsapp,updated from public.entries where status = 'published';
grant select on public.catalog to anon, authenticated;

-- Only admins can enable/revoke existing Authentication accounts.
-- Role changes and initial admin creation are done from the Supabase dashboard.
create function public.grant_member(target_email text) returns void language plpgsql security definer set search_path = '' as $$
declare target_id uuid;
begin
  if not public.is_admin() then raise exception 'Not authorized'; end if;
  select id into target_id from auth.users where lower(email) = lower(btrim(target_email));
  if target_id is null then raise exception 'Create the Authentication account first'; end if;
  if exists(select 1 from public.members where user_id = target_id and role = 'admin') then raise exception 'Admins are managed in Supabase'; end if;
  insert into public.members(user_id,email,role,enabled) values (target_id,lower(btrim(target_email)),'member',true)
    on conflict(user_id) do update set email = excluded.email, enabled = true;
end;
$$;
create function public.revoke_member(target_email text) returns void language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_admin() then raise exception 'Not authorized'; end if;
  if exists(select 1 from public.members where email = lower(btrim(target_email)) and role = 'admin') then raise exception 'Admins are managed in Supabase'; end if;
  update public.members set enabled = false where email = lower(btrim(target_email));
end;
$$;
revoke all on function public.grant_member(text), public.revoke_member(text) from public;
grant execute on function public.grant_member(text), public.revoke_member(text) to authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
  values ('catalog-images','catalog-images',false,4194304,array['image/png','image/jpeg','image/webp']);

-- Private bucket. Only images referenced by a published card may be read anonymously.
create policy catalog_image_public on storage.objects for select to anon, authenticated using (
  bucket_id = 'catalog-images' and exists(select 1 from public.entries where public.entries.image = storage.objects.name and status = 'published')
);
create policy catalog_image_member_read on storage.objects for select to authenticated using (
  bucket_id = 'catalog-images' and public.is_member() and (
    (storage.foldername(name))[1] = (select auth.uid())::text or public.is_admin()
    or exists(select 1 from public.entries where public.entries.image = storage.objects.name and owner_id = (select auth.uid()))
  )
);
create policy catalog_image_upload on storage.objects for insert to authenticated with check (
  bucket_id = 'catalog-images' and public.is_member() and (storage.foldername(name))[1] = (select auth.uid())::text
);

-- Prevent direct REST writes from attaching another member's private images.
create function public.check_entry_image() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.image is not null and (tg_op = 'INSERT' or new.image is distinct from old.image) then
    if not public.is_admin() and split_part(new.image,'/',1) <> (select auth.uid())::text then raise exception 'Image not authorized'; end if;
    if not exists(select 1 from storage.objects where bucket_id = 'catalog-images' and name = new.image) then raise exception 'Upload image first'; end if;
  end if;
  new.updated = now();
  return new;
end;
$$;
revoke all on function public.check_entry_image() from public;
create trigger entries_check_image before insert or update on public.entries for each row execute function public.check_entry_image();

commit;
