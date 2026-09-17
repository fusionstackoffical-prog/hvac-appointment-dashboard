-- Adds recurring weekly appointment-slot availability without replacing the
-- existing availability contract used by the dashboard and integrations.
-- Existing columns remain the legacy window fallback.

alter table public.availability
  add column if not exists available_slots time[];

-- Backfill current enabled windows with their existing appointment-duration
-- start times. Disabled days receive no selected slots.
update public.availability
set available_slots = case
  when enabled then array(
    select slot::time
    from generate_series(
      date '2000-01-01' + start_time,
      date '2000-01-01' + end_time - make_interval(mins => appointment_duration),
      make_interval(mins => appointment_duration)
    ) as slot
  )
  else array[]::time[]
end
where available_slots is null;

comment on column public.availability.available_slots is
  'Recurring weekly appointment start times. Null is legacy data awaiting migration.';
