-- Abbate Lernraum: versioned acknowledgement of the website's terms of use.
-- Personal data is stored by authenticated account id and deleted when that id is deleted.
-- The version is an immutable string linked to the public AGB as of 2026-11-02.
-- Do not confuse acknowledgement of privacy information with GDPR consent.
create table if not exists abbate_private.terms_acceptances (
  user_id uuid not null references auth.users(id) on delete cascade,
  terms_version text not null check (length(terms_version) between 1 and 40),
  accepted_at timestamptz not null default now(),
  source text not null check (source in ('signup','account')),
  primary key (user_id,terms_version)
);
alter table abbate_private.terms_acceptances enable row level security;
revoke all on table abbate_private.terms_acceptances from public,anon,authenticated;

create or replace function abbate_private.capture_signup_terms()
returns trigger
language plpgsql
security definer
set search_path=''
as $fn$
begin
  if new.raw_user_meta_data->>'abbate_terms_version'='2026-11-02'
     and new.raw_user_meta_data->>'abbate_terms_accepted'='true' then
    insert into abbate_private.terms_acceptances(user_id,terms_version,source)
    values(new.id,'2026-11-02','signup')
    on conflict (user_id,terms_version) do nothing;
  end if;
  return new;
end
$fn$;
drop trigger if exists abbate_capture_signup_terms on auth.users;
create trigger abbate_capture_signup_terms
after insert on auth.users for each row
execute function abbate_private.capture_signup_terms();

create or replace function public.abbate_terms_accepted()
returns boolean
language sql
stable security definer
set search_path=''
as $fn$
  select auth.uid() is not null
    and abbate_private.live_session()
    and exists (
      select 1 from abbate_private.terms_acceptances t
      where t.user_id=auth.uid() and t.terms_version='2026-11-02'
    );
$fn$;

create or replace function public.abbate_accept_terms(p_version text)
returns void
language plpgsql
security definer
set search_path=''
as $fn$
begin
  if auth.uid() is null or not abbate_private.live_session()
     or p_version is distinct from '2026-11-02' then
    raise exception 'Valid login and current AGB version required' using errcode='42501';
  end if;
  insert into abbate_private.terms_acceptances(user_id,terms_version,source)
  values(auth.uid(),p_version,'account')
  on conflict (user_id,terms_version) do nothing;
end
$fn$;
revoke all on function public.abbate_terms_accepted() from public,anon;
revoke all on function public.abbate_accept_terms(text) from public,anon;
grant execute on function public.abbate_terms_accepted() to authenticated;
grant execute on function public.abbate_accept_terms(text) to authenticated;
comment on table abbate_private.terms_acceptances is
'Versioned acknowledgment of Abbate AGB. Does not represent GDPR marketing consent.';
