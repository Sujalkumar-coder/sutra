-- Sutra CMS v5: service gradient controls
alter table public.services
  add column if not exists gradient_start text,
  add column if not exists gradient_end text,
  add column if not exists gradient_angle integer not null default 135;

update public.services
set
  gradient_start = coalesce(gradient_start, accent, '#c8dcff'),
  gradient_end = coalesce(gradient_end, '#111111'),
  gradient_angle = coalesce(gradient_angle, 135);

-- Refresh PostgREST's schema cache so the new columns are available immediately.
notify pgrst, 'reload schema';
