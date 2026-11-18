-- Apply only after staging tests with the matching Edge Function.
begin;
create or replace function abbate_private.guard_certificate_insert() returns trigger
language plpgsql set search_path to '' as $$
begin
 perform 1 from public.abbate_completions c join public.abbate_courses co on co.id=c.course_id and co.school_id=c.school_id
 where c.id=new.completion_id and c.revoked_at is null and (
 (c.kind='exam' and c.outcome='passed') or
 (c.kind='refresher' and c.outcome='attended' and co.title in ('Jährliche Unterweisung · Unterweisungsnachweis', 'Jährliche Unterweisung · Fahr- und Steuerpersonal / Gabelstaplerfahrer · Unterweisungsnachweis', 'Jährliche Unterweisung · Hebebühnen · Unterweisungsnachweis', 'Jährliche Unterweisung · Krane · Unterweisungsnachweis', 'Jährliche Unterweisung · Anschlagen von Lasten · Unterweisungsnachweis', 'Jährliche Unterweisung · Erdbaumaschinen & Bagger · Unterweisungsnachweis', 'Jährliche Unterweisung · Ladungssicherung · Unterweisungsnachweis', 'Jährliche Unterweisung · Abseilen aus Höhen · Unterweisungsnachweis')))
 for update of c;
 if not found then raise exception 'Completion not eligible'; end if;
 return new;
end; $$;
create or replace function abbate_private.invalidate_certificate() returns trigger
language plpgsql security definer set search_path to '' as $$
begin
 if new.revoked_at is not null or not (
 (new.kind='exam' and new.outcome='passed') or
 (new.kind='refresher' and new.outcome='attended' and exists (
 select 1 from public.abbate_courses co where co.id=new.course_id and co.school_id=new.school_id and co.title in ('Jährliche Unterweisung · Unterweisungsnachweis', 'Jährliche Unterweisung · Fahr- und Steuerpersonal / Gabelstaplerfahrer · Unterweisungsnachweis', 'Jährliche Unterweisung · Hebebühnen · Unterweisungsnachweis', 'Jährliche Unterweisung · Krane · Unterweisungsnachweis', 'Jährliche Unterweisung · Anschlagen von Lasten · Unterweisungsnachweis', 'Jährliche Unterweisung · Erdbaumaschinen & Bagger · Unterweisungsnachweis', 'Jährliche Unterweisung · Ladungssicherung · Unterweisungsnachweis', 'Jährliche Unterweisung · Abseilen aus Höhen · Unterweisungsnachweis')))
 ) or new.kind<>old.kind or new.course_id<>old.course_id or new.completed_at<>old.completed_at or new.participant_id<>old.participant_id then
 update public.abbate_certificates set invalidated_at=now() where completion_id=new.id and invalidated_at is null;
 end if;
 return new;
end; $$;
commit;
