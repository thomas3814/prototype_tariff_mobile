begin;

create table if not exists public.admin_users (
  email text primary key,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.tariff_publish_state (
  id text primary key,
  active_storage_path text not null,
  source_file_name text not null,
  source_file_last_modified timestamptz,
  uploaded_at timestamptz not null default timezone('utc', now()),
  uploaded_by_email text,
  checksum_sha256 text,
  updated_at timestamptz not null default timezone('utc', now()),
  constraint tariff_publish_state_singleton check (id = 'default')
);

create or replace function public.set_tariff_publish_state_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function public.is_tariff_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.admin_users
    where email = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

drop trigger if exists trg_set_tariff_publish_state_updated_at on public.tariff_publish_state;
create trigger trg_set_tariff_publish_state_updated_at
before update on public.tariff_publish_state
for each row
execute function public.set_tariff_publish_state_updated_at();

alter table public.admin_users enable row level security;
alter table public.tariff_publish_state enable row level security;

grant usage on schema public to anon, authenticated;
grant select on table public.tariff_publish_state to anon, authenticated;
grant insert, update on table public.tariff_publish_state to authenticated;
grant select on table public.admin_users to authenticated;
grant execute on function public.is_tariff_admin() to anon, authenticated;

drop policy if exists "tariff public read publish state" on public.tariff_publish_state;
create policy "tariff public read publish state"
on public.tariff_publish_state
for select
to anon, authenticated
using (true);

drop policy if exists "tariff admins insert publish state" on public.tariff_publish_state;
create policy "tariff admins insert publish state"
on public.tariff_publish_state
for insert
to authenticated
with check ((select public.is_tariff_admin()));

drop policy if exists "tariff admins update publish state" on public.tariff_publish_state;
create policy "tariff admins update publish state"
on public.tariff_publish_state
for update
to authenticated
using ((select public.is_tariff_admin()))
with check ((select public.is_tariff_admin()));

drop policy if exists "tariff admins read own membership" on public.admin_users;
create policy "tariff admins read own membership"
on public.admin_users
for select
to authenticated
using (email = lower(coalesce(auth.jwt() ->> 'email', '')));

insert into storage.buckets (id, name, public)
values ('tariff-snapshots', 'tariff-snapshots', true)
on conflict (id)
do update set
  name = excluded.name,
  public = excluded.public;

drop policy if exists "tariff admins upload snapshots" on storage.objects;
create policy "tariff admins upload snapshots"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'tariff-snapshots'
  and (select public.is_tariff_admin())
);

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'tariff_publish_state'
  ) then
    alter publication supabase_realtime add table public.tariff_publish_state;
  end if;
end;
$$;

commit;
