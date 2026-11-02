-- Proposed Supabase schema. Tested locally; NOT deployed to a remote database.
-- Practice attempts are intentionally separate from confirmed completions.
begin;
create schema if not exists abbate_private;
revoke all on schema abbate_private from public, anon;

create table public.abbate_schools (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 200)
);
create table public.abbate_memberships (
  school_id uuid not null references public.abbate_schools(id),
  user_id uuid not null references auth.users(id),
  role text not null check (role in ('learner','trainer','admin')),
  primary key (school_id,user_id)
);
-- This narrowly scoped helper avoids recursive membership policies.
-- It is private, checks auth.uid(), and never uses editable JWT user_metadata.
create function abbate_private.is_staff(school uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select auth.uid() is not null and exists (
    select 1 from public.abbate_memberships m
    where m.school_id = school and m.user_id = auth.uid() and m.role in ('trainer','admin')
  );
$$;
revoke all on function abbate_private.is_staff(uuid) from public, anon;
grant usage on schema abbate_private to authenticated;
grant execute on function abbate_private.is_staff(uuid) to authenticated;

create table public.abbate_profiles (
  school_id uuid not null,
  user_id uuid not null,
  display_name text not null check (char_length(display_name) between 1 and 120),
  primary key (school_id,user_id),
  foreign key (school_id,user_id) references public.abbate_memberships(school_id,user_id)
);
create table public.abbate_courses (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.abbate_schools(id),
  title text not null check (char_length(title) between 1 and 200),
  version text not null,
  unique (id,school_id)
);
create table public.abbate_completions (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null,
  participant_id uuid not null,
  course_id uuid not null,
  course_version text not null,
  kind text not null check (kind in ('training','exam','refresher')),
  completed_at date not null,
  reminder_due date,
  issued_by uuid not null references auth.users(id),
  issued_at timestamptz not null default now(),
  revoked_at timestamptz,
  reference text not null,
  unique (id,participant_id),
  foreign key (school_id,participant_id) references public.abbate_memberships(school_id,user_id),
  foreign key (course_id,school_id) references public.abbate_courses(id,school_id),
  check (reminder_due is null or reminder_due >= completed_at)
);
create index on public.abbate_memberships(user_id,school_id);
create index on public.abbate_completions(participant_id,completed_at desc);

alter table public.abbate_schools enable row level security;
alter table public.abbate_memberships enable row level security;
alter table public.abbate_profiles enable row level security;
alter table public.abbate_courses enable row level security;
alter table public.abbate_completions enable row level security;

create policy school_member_read on public.abbate_schools for select to authenticated
using (exists(select 1 from public.abbate_memberships m where m.school_id=id and m.user_id=(select auth.uid())));
create policy membership_read on public.abbate_memberships for select to authenticated
using (user_id=(select auth.uid()) or abbate_private.is_staff(school_id));
create policy profile_read on public.abbate_profiles for select to authenticated
using (user_id=(select auth.uid()) or abbate_private.is_staff(school_id));
create policy course_read on public.abbate_courses for select to authenticated
using (exists(select 1 from public.abbate_memberships m where m.school_id=abbate_courses.school_id and m.user_id=(select auth.uid())));
create policy completion_read on public.abbate_completions for select to authenticated
using (participant_id=(select auth.uid()) or abbate_private.is_staff(school_id));
create policy completion_issue on public.abbate_completions for insert to authenticated
with check (abbate_private.is_staff(school_id) and issued_by=(select auth.uid()));
create policy completion_revoke on public.abbate_completions for update to authenticated
using (abbate_private.is_staff(school_id))
with check (abbate_private.is_staff(school_id));

revoke all on public.abbate_schools, public.abbate_memberships, public.abbate_profiles,
  public.abbate_courses, public.abbate_completions from anon, authenticated;
grant select on public.abbate_schools, public.abbate_memberships, public.abbate_profiles,
  public.abbate_courses, public.abbate_completions to authenticated;
grant insert on public.abbate_completions to authenticated;
-- An issued record cannot be silently rewritten by the client.
grant update(revoked_at) on public.abbate_completions to authenticated;

-- Only trusted server code can create/resolve/revoke sharing tokens.
-- Store SHA-256(token), never the plaintext token. Generate 32 random bytes server-side.
create table abbate_private.shares (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id),
  token_hash text not null unique check (token_hash ~ '^[a-f0-9]{64}$'),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  revoked_at timestamptz,
  unique (id,owner_id),
  check (expires_at > created_at and expires_at <= created_at + interval '7 days')
);
create table abbate_private.share_items (
  share_id uuid not null,
  owner_id uuid not null,
  completion_id uuid not null,
  primary key (share_id,completion_id),
  foreign key (share_id,owner_id) references abbate_private.shares(id,owner_id) on delete cascade,
  foreign key (completion_id,owner_id) references public.abbate_completions(id,participant_id)
);
alter table abbate_private.shares enable row level security;
alter table abbate_private.share_items enable row level security;
revoke all on abbate_private.shares,abbate_private.share_items from public,anon,authenticated;
grant usage on schema abbate_private to service_role;
grant all on public.abbate_schools,public.abbate_memberships,public.abbate_profiles,
  public.abbate_courses,public.abbate_completions,abbate_private.shares,abbate_private.share_items to service_role;
commit;
