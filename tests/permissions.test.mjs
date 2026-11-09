import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';

test('Supabase migration enforces ownership, publication, private uploads and membership roles', async () => {
  const db = new PGlite();
  const admin = '11111111-1111-4111-8111-111111111111';
  const one = '22222222-2222-4222-8222-222222222222';
  const two = '33333333-3333-4333-8333-333333333333';
  const outsider = '44444444-4444-4444-8444-444444444444';
  async function as(role, id = '') { await db.exec(`reset role; set role ${role};`); await db.query("select set_config('request.jwt.claim.sub',$1,false)",[id]); }
  try {
    // Minimal equivalents of Supabase-managed auth/storage schemas. Actual policy SQL is unmodified.
    await db.exec(`
      create role anon; create role authenticated;
      create schema auth; create schema storage;
      create table auth.users(id uuid primary key, email text);
      create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid; $$;
      create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
      create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text,name text);
      alter table storage.objects enable row level security;
      create function storage.foldername(name text) returns text[] language sql immutable as $$ select (string_to_array(name,'/'))[1:array_length(string_to_array(name,'/'),1)-1]; $$;
      grant usage on schema public,auth,storage to anon,authenticated;
      grant select,insert on storage.objects to anon,authenticated;
    `);
    await db.exec(await readFile(new URL('../supabase/migrations/202611090001_catalog.sql',import.meta.url),'utf8'));
    for (const [id,email] of [[admin,'admin@test.cl'],[one,'one@test.cl'],[two,'two@test.cl'],[outsider,'outside@test.cl']]) await db.query('insert into auth.users values ($1,$2)',[id,email]);
    await db.query("insert into members(user_id,email,role) values ($1,'admin@test.cl','admin'),($2,'one@test.cl','member'),($3,'two@test.cl','member')",[admin,one,two]);

    await as('authenticated',one);
    const first = (await db.query("insert into entries(owner_id,name,person,category,description) values ($1,'One','One','Category','Text') returning id",[one])).rows[0].id;
    await assert.rejects(db.query("insert into entries(owner_id,name,person,category,description) values ($1,'Other','Other','Category','Text')",[two]),/row-level security/i);
    await assert.rejects(db.query("update entries set owner_id=$1 where id=$2",[two,first]),/row-level security/i);
    await assert.rejects(db.query("update members set role='admin' where user_id=$1",[one]),/permission denied/i);
    await assert.rejects(db.query("select public.grant_member('outside@test.cl')"),/Not authorized/i);

    const imageOne = `${one}/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa.jpg`;
    const imageTwo = `${two}/bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb.png`;
    await db.query("insert into storage.objects(bucket_id,name) values ('catalog-images',$1)",[imageOne]);
    await assert.rejects(db.query("insert into storage.objects(bucket_id,name) values ('catalog-images',$1)",[imageTwo]),/row-level security/i);
    await db.query('update entries set image=$1 where id=$2',[imageOne,first]);

    await as('authenticated',two);
    const second=(await db.query("insert into entries(owner_id,name,person,category,description) values ($1,'Two','Two','Category','Text') returning id",[two])).rows[0].id;
    assert.equal((await db.query('select id from entries where id=$1',[first])).rows.length,0,'Cannot read another member draft');
    assert.equal((await db.query("update entries set name='Hacked' where id=$1 returning id",[first])).rows.length,0,'Cannot update another draft');
    assert.equal((await db.query('delete from entries where id=$1 returning id',[first])).rows.length,0,'Cannot delete another draft');
    assert.equal((await db.query('select name from storage.objects')).rows.length,0,'Another member private upload is hidden');
    await assert.rejects(db.query('update entries set image=$1 where id=$2',[imageOne,second]),/Image not authorized/i);

    await as('anon');
    assert.equal((await db.query('select * from catalog')).rows.length,0);
    await assert.rejects(db.query('select owner_id from entries'),/permission denied/i,'Anonymous users cannot read owner IDs');
    await assert.rejects(db.query('select email from members'),/permission denied/i);
    assert.equal((await db.query('select name from storage.objects')).rows.length,0);

    await as('authenticated',one);
    await db.query("update entries set status='published' where id=$1",[first]);
    await as('anon');
    const publicRows=(await db.query('select * from catalog')).rows;
    assert.equal(publicRows.length,1);assert.equal(publicRows[0].name,'One');assert.ok(!('owner_id' in publicRows[0]));
    assert.deepEqual((await db.query('select name from storage.objects')).rows.map(row=>row.name),[imageOne],'Published image readable');

    await as('authenticated',two);
    assert.equal((await db.query("update entries set name='Hacked' where id=$1 returning id",[first])).rows.length,0,'Cannot update another published entry');
    assert.equal((await db.query('delete from entries where id=$1 returning id',[first])).rows.length,0,'Cannot delete another published entry');

    await as('authenticated',admin);
    assert.equal((await db.query('select * from entries')).rows.length,2);
    await db.query("update entries set status='draft' where id=$1",[first]);
    await db.query("select public.grant_member('outside@test.cl')");
    assert.equal((await db.query('select role from members where user_id=$1',[outsider])).rows[0].role,'member');
    await assert.rejects(db.query("select public.revoke_member('admin@test.cl')"),/Admins are managed/i);
    await db.query("select public.revoke_member('one@test.cl')");

    await as('authenticated',one);
    await assert.rejects(db.query("insert into entries(owner_id,name,person,category,description) values ($1,'Blocked','One','Category','Text')",[one]),/row-level security/i);
    assert.equal((await db.query('select id from entries where id=$1',[first])).rows.length,0,'Revoked user cannot read own draft');
    assert.equal((await db.query('select name from storage.objects')).rows.length,0,'Revoked user cannot read unpublished uploads');
    await as('anon');
    assert.equal((await db.query('select name from storage.objects')).rows.length,0,'Unpublishing hides images');
    await as('authenticated',admin);
    assert.equal((await db.query('delete from entries where id=$1 returning id',[second])).rows.length,1,'Admin can delete any entry');
  } finally { await db.close(); }
});
