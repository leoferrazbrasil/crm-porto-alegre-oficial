create table if not exists public.crm_monthly_targets (
  month_start date primary key,
  revenue_target numeric(12, 2) not null default 0 check (revenue_target >= 0),
  updated_by uuid references public.profiles(user_id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists crm_monthly_targets_set_updated_at on public.crm_monthly_targets;
create trigger crm_monthly_targets_set_updated_at
before update on public.crm_monthly_targets
for each row execute function public.set_updated_at();

alter table public.crm_monthly_targets enable row level security;

drop policy if exists "authenticated users read monthly targets" on public.crm_monthly_targets;
create policy "authenticated users read monthly targets"
on public.crm_monthly_targets for select
to authenticated
using (true);

drop policy if exists "administrators manage monthly targets" on public.crm_monthly_targets;
create policy "administrators manage monthly targets"
on public.crm_monthly_targets for all
to authenticated
using (public.current_crm_role()::text in ('admin', 'operator'))
with check (public.current_crm_role()::text in ('admin', 'operator'));

create index if not exists crm_monthly_targets_updated_at_idx
  on public.crm_monthly_targets(updated_at desc);
