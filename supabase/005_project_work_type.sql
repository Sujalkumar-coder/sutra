alter table public.projects
  add column if not exists work_type text;

create index if not exists projects_work_type_idx on public.projects(work_type);

comment on column public.projects.work_type is 'Predefined presentation role used to group projects on service pages.';
